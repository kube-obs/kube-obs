use backoff::ExponentialBackoff;
use chrono::Utc;
use common::{establish_connection, Watcher};
use core::time::{self, Duration};
use futures::{pin_mut, TryStreamExt};
use k8s_openapi::api::core::v1::{Event, Pod};
use kube::runtime::{watcher, WatchStreamExt};
use kube::{api::ListParams, Api, Client};

use crate::create::create_watcher;
use crate::delete::delete_pod_resource;
use crate::error::Error;
use crate::list::list_watcher;
use tracing::{debug, error, info};

const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];
// 60 sec clean up db
const INTERVAL_MILLIS: Duration = time::Duration::from_millis(60 * 1000);

//https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
// status &&String as pod_status.phase.as_ref() returns Option<&String> and .filter returns &&String
fn check_status(status: &&String) -> bool {
    !IGNORE_POD_PHASE.contains(&status.as_str())
}

trait DbOperations {
    fn insert(&self, e: Event, cluster: String) -> Result<(), Error>;
}

impl DbOperations for Pod {
    fn insert(&self, e: Event, cluster: String) -> Result<(), Error> {
        let w = Watcher {
            resource_id: self.metadata.name.clone(),
            cluster,
            resource_type: "Pod".to_string(), // TODO, can be enum?
            namespace_name: self.metadata.namespace.clone(),
            alerted_on: Utc::now().naive_utc(),
            pod_event: serde_json::to_value(&e).unwrap(),
            pod_status: self.status.clone().unwrap().phase,
        };
        let mut connection = establish_connection();
        // Insert into DB
        create_watcher(&mut connection, &w)
    }
}

pub(crate) async fn pod_watcher() {
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
        check_for_pod_failures(&events, n).await.unwrap();
    }
}

async fn check_for_pod_failures(events: &Api<Event>, p: Pod) -> Result<(), Error> {
    let name = p.metadata.name.clone().unwrap();
    if let Some(pod_status) = &p.status {
        // check if the PodStatus is not in IGNORE_POD_PHASE
        if let Some(s) = pod_status.phase.as_ref().filter(check_status) {
            let opts = ListParams::default().fields(&format!(
                "involvedObject.kind=Pod,involvedObject.name={}",
                name
            ));
            let evlist = events.list(&opts).await?;
            for e in evlist {
                println!("pod name in action {}", name);
                if let Err(e) = p.insert(e, "cluster".to_string()) {
                    //
                    println!("insert error");
                }
                println!("sucessfully inserted");
            }
        }
    }
    Ok(())
}

pub async fn db_clean() -> Result<(), Error> {
    loop {
        // get all pod resources id from db and check if the resource id exists in cluster
        let mut connection = establish_connection();
        let resources = list_watcher(&mut connection)?;
        let client = Client::try_default().await?;
        for r in resources {
            let pods: Api<Pod> = Api::namespaced(client.clone(), &r.1.unwrap());
            if pods.get_opt(&r.0).await?.is_none() {
                // pod doesn't exist in cluster , hence delete it from table,
                delete_pod_resource(&mut connection, r.0);
            };
        }
        tokio::time::sleep(INTERVAL_MILLIS).await;
    }
}
