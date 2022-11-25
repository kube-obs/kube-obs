use crate::error::Error;
use async_trait::async_trait;
use backoff::ExponentialBackoff;
use chrono::Utc;
use futures::{pin_mut, TryStreamExt};
use k8s_openapi::api::core::v1::{Event, Pod};
use kube::runtime::{watcher, WatchStreamExt};
use kube::{api::ListParams, Api, Client};
use reqwest::header;
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;
use tracing::{debug, error, info};
#[allow(dead_code)]
const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];

#[derive(Debug, Deserialize, Serialize)]
struct ElasticInsert<T> {
    document: T,
    #[serde(rename = "@timestamp")]
    timestamp: String,
    #[serde(rename = "@cluster")]
    cluster: String,
    #[serde(rename = "@documentType")]
    typ: String,
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
    // TODO:
    // 1. Since the ElasticInsert accepts generic type T, implement this trait to both Event and Pod,
    // 2. or make this trait with default implementaion which accepts struct T
    // 3. lot of duplicate in post request
    async fn post_data(&self, cluster: &str) -> Result<(), Error>;

    fn get_api_url() -> String {
        //local: http://localhost:3000/api/event
        env::var("API_SERVER_URL").expect("API_SERVER_URL must be set, for example \n export API_SERVER_URL=http://localhost:3000/api/event")
    }

    fn get_time_stamp() -> String {
        Utc::now()
            .naive_utc()
            .format("%Y-%m-%dT%H:%M:%S.%fZ")
            .to_string()
    }
}

#[async_trait]
#[allow(unused_variables)]
impl ExportData for Pod {
    async fn post_data(&self, cluster: &str) -> Result<(), Error> {
        let url = format!("{}/POD_RESOURCE", Self::get_api_url());
        let mut headers = header::HeaderMap::new();
        headers.insert("content-type", "application/json".parse().unwrap());
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        let z = json!(ElasticInsert {
            document: self.to_owned(),
            timestamp: Self::get_time_stamp(),
            cluster: cluster.to_string(),
            typ: "POD_RESOURCE".to_string() // TODO: Enum type
        });
        let res = client
            .post(&url)
            .headers(headers)
            .body(z.to_string())
            .send()
            .await?;
        if res.status() != StatusCode::OK {
            error!(
                "Error during post pod resource object {}",
                self.metadata.name.as_ref().unwrap()
            );
            debug!("Error details {}", res.text().await?)
        } else {
            info!(
                "Success: post pod {} resource ",
                &self.metadata.name.as_ref().unwrap()
            );
        }
        Ok(())
    }
}
#[async_trait]
#[allow(unused_variables)]
impl ExportData for Event {
    async fn post_data(&self, cluster: &str) -> Result<(), Error> {
        let url = format!("{}/POD_EVENT", Self::get_api_url());
        let mut headers = header::HeaderMap::new();
        headers.insert("content-type", "application/json".parse().unwrap());
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        let z = json!(ElasticInsert {
            document: self.to_owned(),
            timestamp: Self::get_time_stamp(),
            cluster: cluster.to_string(),
            typ: "POD_EVENT".to_string() // TODO: Enum type
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
            debug!("Error details {}", res.text().await?)
        } else {
            info!(
                "post event successful for pod {}",
                &self.metadata.name.as_ref().unwrap()
            );
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
        debug!("Sending event {:?} for pod {}", e, pod_name);
        e.post_data(&c).await?;
        debug!("Successful event pod {}", pod_name);
        debug!("Sending pod resource {:?} for pod {}", p, pod_name);
        p.post_data(&c).await?;
        debug!("Successful sending pod resource {}", pod_name);
    }
    // }
    Ok(())
}
