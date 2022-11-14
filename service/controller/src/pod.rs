use async_trait::async_trait;
use backoff::ExponentialBackoff;
use chrono::Utc;
use common::Watcher;
use core::time::{self, Duration};
use futures::{pin_mut, TryStreamExt};
use k8s_openapi::api::core::v1::{Event, Pod};
use kube::runtime::{watcher, WatchStreamExt};
use kube::{api::ListParams, Api, Client};
use reqwest::StatusCode;
use std::env;

use crate::error::Error;
use crate::util::{time_diff, Timer};
use tracing::{debug, error, info};

const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];
// 60 sec clean up db
const INTERVAL_MILLIS: Duration = time::Duration::from_millis(60 * 1000);
//https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
// status &&String as pod_status.phase.as_ref() returns Option<&String> and .filter returns &&String
fn check_status(status: &&String) -> bool {
    !IGNORE_POD_PHASE.contains(&status.as_str())
}
#[async_trait]
trait DbOperations {
    async fn insert(&self, e: Event, cluster: String) -> Result<(), Error>;

    fn get_api_url() -> String {
        env::var("API_SERVER_URL").expect("API_SERVER_URL must be set")
    }
}

#[async_trait]
impl DbOperations for Pod {
    async fn insert(&self, e: Event, cluster: String) -> Result<(), Error> {
        let url = format!("{}/pods", Self::get_api_url());
        let w = Watcher {
            resource_id: self.metadata.name.clone(),
            cluster,
            resource_type: "Pod".to_string(), // TODO, can be enum?
            namespace_name: self.metadata.namespace.clone(),
            alerted_on: Utc::now().naive_utc(),
            pod_event: Some(serde_json::to_value(&e).unwrap()),
            pod_status: self.status.clone().unwrap().phase,
        };
        let client = reqwest::Client::new();
        let res = client.post(&url).json(&w).send().await?;
        // TODO: validate response
        if res.status() == StatusCode::OK {
            info!("post event success {}", url)
        } else {
            error!("failed to post events to {}", url)
        }

        Ok(())
    }
}

pub(crate) async fn pod_watcher(d: &Timer) {
    let client = Client::try_default()
        .await
        .expect("Expected a valid KUBECONFIG environment variable.");
    let events: Api<Event> = Api::all(client.clone());
    let pods: Api<Pod> = Api::all(client.clone());
    // get all the pods whose phase is not in IGNORE_POD_PHASE
    let lp = ListParams::default();
    let obs = watcher(pods, lp)
        .backoff(ExponentialBackoff::default())
        .applied_objects();
    pin_mut!(obs);
    // TODO: remove unwrap()
    while let Some(n) = obs.try_next().await.unwrap() {
        // TODO: remove unwrap()
        check_for_pod_failures(&events, n, d).await.unwrap();
    }
}

async fn check_for_pod_failures(events: &Api<Event>, p: Pod, d: &Timer) -> Result<(), Error> {
    let name = p.metadata.name.clone().unwrap();
    if let Some(pod_status) = &p.status {
        // check if the pod start time is greater than threshold start time
        let Some(resource_start_time) = &pod_status.start_time else {
            debug!("resources {} start time is None or its a delete event ", name);
            return Ok(())
        };
        if time_diff(resource_start_time.0, d) {
            // check if the PodStatus is not in IGNORE_POD_PHASE
            if let Some(s) = pod_status.phase.as_ref().filter(check_status) {
                let opts = ListParams::default().fields(&format!(
                    "involvedObject.kind=Pod,involvedObject.name={}",
                    name
                ));
                let evlist = events.list(&opts).await?;
                for e in evlist {
                    println!("pod name in action {}", name);
                    if let Err(e) = p.insert(e, "cluster".to_string()).await {
                        //
                        println!("insert error");
                    }
                    println!("sucessfully inserted");
                }
            }
        }
    }
    Ok(())
}

// pub async fn db_clean() -> Result<(), Error> {
//     loop {
//         // get all pod resources id from db and check if the resource id exists in cluster
//         let mut connection = establish_connection();
//         let resources = list_watcher(&mut connection)?;
//         let client = Client::try_default().await?;
//         for r in resources {
//             let pods: Api<Pod> = Api::namespaced(client.clone(), &r.1.unwrap());
//             if pods.get_opt(&r.0).await?.is_none() {
//                 // pod doesn't exist in cluster , hence delete it from table,
//                 delete_pod_resource(&mut connection, r.0);
//             };
//         }
//         tokio::time::sleep(INTERVAL_MILLIS).await;
//     }
// }
