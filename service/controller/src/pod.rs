use crate::error::Error;
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
use std::{env, fmt};
use tracing::{debug, error, info};
#[allow(dead_code)]
const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];

enum PostType {
    Event,
    PodResource,
}

impl fmt::Display for PostType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PostType::Event => write!(f, "POD_EVENT"),
            PostType::PodResource => write!(f, "POD_RESOURCE"),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
struct ElasticInsert<T> {
    document: T,
    metadata: Metadata,
}
#[derive(Debug, Deserialize, Serialize)]
struct Metadata {
    timestamp: String,
    cluster: String,
    #[serde(rename = "type")]
    typ: String,
}

// 60 sec clean up db
//const INTERVAL_MILLIS: Duration = time::Duration::from_millis(60 * 1000);
//https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
// status &&String as pod_status.phase.as_ref() returns Option<&String> and .filter returns &&String
// fn check_status(status: &&String) -> bool {
//     !IGNORE_POD_PHASE.contains(&status.as_str())
// }

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

struct SendData<'a, T> {
    post_type: PostType,
    cluster: &'a str,
    resource_name: &'a str,
    document: T,
}
impl<'a, T> SendData<'a, T>
where
    T: Serialize + Clone,
{
    pub async fn send_data(&self) -> Result<(), Error> {
        //self.post_type : POD_EVENT or POD_RESOURCE
        let url = format!("{}/{}", get_api_url(), self.post_type);
        let mut headers = header::HeaderMap::new();
        headers.insert("content-type", "application/json".parse().unwrap());
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();

        let z = json!(ElasticInsert {
            document: self.document.clone(),
            metadata: Metadata {
                timestamp: get_time_stamp(),
                cluster: self.cluster.to_owned(),
                typ: self.post_type.to_string(),
            }
        });

        let res = client
            .post(&url)
            .headers(headers)
            .body(z.to_string())
            .send()
            .await?;

        if res.status() != StatusCode::OK {
            error!(
                "Error during {} post pod name{}",
                self.post_type.to_string(),
                self.resource_name
            );
            debug!("Error details {}", res.text().await?)
        } else {
            info!(
                "post successful for {} pod name{}",
                self.post_type.to_string(),
                self.resource_name
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

async fn check_for_pod_failures(events: &Api<Event>, p: Pod, cluster: &str) -> Result<(), Error> {
    let pod_name = p.metadata.name.clone().unwrap();
    let opts = ListParams::default().fields(&format!(
        "involvedObject.kind=Pod,involvedObject.name={}",
        pod_name
    ));
    debug!("Successful event pod {}", pod_name);
    let z = SendData {
        post_type: PostType::PodResource,
        cluster,
        resource_name: &pod_name,
        document: p,
    };
    // debug!("Sending pod resource {:?} for pod {}", p, pod_name);
    z.send_data().await?;
    // debug!("Successful sending pod resource {}", pod_name);
    let ev_list = events.list(&opts).await?;
    for e in ev_list {
        debug!("Sending event {:?} for pod {}", e, pod_name);
        let z = SendData {
            post_type: PostType::Event,
            cluster,
            resource_name: &pod_name,
            document: e,
        };
        z.send_data().await?;
    }
    // }
    Ok(())
}
