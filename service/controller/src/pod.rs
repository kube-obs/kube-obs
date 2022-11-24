use crate::error::Error;
use async_trait::async_trait;
use backoff::ExponentialBackoff;
use chrono::{DateTime, NaiveDateTime, Utc};
use futures::{pin_mut, TryStreamExt};
use k8s_openapi::api::core::v1::{Event, Pod};
use kube::runtime::{watcher, WatchStreamExt};
use kube::{api::ListParams, Api, Client};
use reqwest::header;
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use tracing::{debug, error, info};
#[allow(dead_code)]
const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];

#[derive(Debug, Deserialize, Serialize)]
struct ElasticEvent {
    document: String,
    #[serde(rename = "@timestamp")]
    timestamp: NaiveDateTime,
    #[serde(rename = "@cluster")]
    cluster: String,
}

// 60 sec clean up db
//const INTERVAL_MILLIS: Duration = time::Duration::from_millis(60 * 1000);
//https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
// status &&String as pod_status.phase.as_ref() returns Option<&String> and .filter returns &&String
// fn check_status(status: &&String) -> bool {
//     !IGNORE_POD_PHASE.contains(&status.as_str())
// }

#[async_trait]
trait ExportData {
    async fn send_data(&self, e: &Event, cluster: &str) -> Result<(), Error>;
    fn get_api_url() -> String {
        //local: http://localhost:3000/api/event
        env::var("API_SERVER_URL").expect("API_SERVER_URL must be set, for example \n export API_SERVER_URL=http://localhost:3000/api/event")
    }
}

#[async_trait]
#[allow(unused_variables)]
impl ExportData for Pod {
    async fn send_data(&self, e: &Event, cluster: &str) -> Result<(), Error> {
        let url = format!("{}/POD", Self::get_api_url());
        let mut headers = header::HeaderMap::new();
        headers.insert("content-type", "application/json".parse().unwrap());
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();
        let event_json = serde_json::to_string(&e).unwrap();
        let z = json!(ElasticEvent {
            document: event_json,
            timestamp: Utc::now().naive_utc(),
            cluster: cluster.to_string(),
        });

        let res = client
            .post(&url)
            .headers(headers)
            .body(z.to_string())
            .send()
            .await?;
        if res.status() != StatusCode::OK {
            error!(
                "Error during pod post event {}",
                self.metadata.name.as_ref().unwrap()
            );
        } else {
            info!(
                "post event successful for pod {}",
                &self.metadata.name.as_ref().unwrap()
            )
        }
        Ok(())
    }
}

pub(crate) async fn pod_watcher(c: String) {
    let client = Client::try_default()
        .await
        .expect("Expected a valid KUBECONFIG environment variable.");
    let events: Api<Event> = Api::all(client.clone());
    let pods: Api<Pod> = Api::all(client.clone());
    let lp = ListParams::default();
    let obs = watcher(pods, lp)
        .backoff(ExponentialBackoff::default())
        .applied_objects();
    pin_mut!(obs);
    // TODO: remove unwrap()
    while let Some(n) = obs.try_next().await.unwrap() {
        // TODO: remove unwrap()
        check_for_pod_failures(&events, n, &c).await.unwrap();
    }
}

async fn check_for_pod_failures(events: &Api<Event>, p: Pod, c: &String) -> Result<(), Error> {
    let pod_name = p.metadata.name.clone().unwrap();
    let opts = ListParams::default().fields(&format!(
        "involvedObject.kind=Pod,involvedObject.name={}",
        pod_name
    ));
    let ev_list = events.list(&opts).await?;
    for e in ev_list {
        debug!("Watching event for pod {}", pod_name);
        //TODO: Cluster need to be passed as an args or get it from Kubernetes metadata
        p.send_data(&e, &c).await?;
        debug!("Success: Pod {} post event {:?} success", pod_name, e);
    }
    // }
    Ok(())
}
