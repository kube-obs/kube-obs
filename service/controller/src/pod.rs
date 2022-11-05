use chrono::Utc;
use common::{establish_connection, Watcher};
use futures::TryStreamExt;
use k8s_openapi::api::core::v1::Pod;
use kube::runtime::{watcher, WatchStreamExt};
use kube::{api::ListParams, Api, Client};

use crate::create::create_watcher;
use crate::error::Error;

const IGNORE_POD_PHASE: [&str; 2] = ["Running", "Succeeded"];

//https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
// status &&String as pod_status.phase.as_ref() returns Option<&String> and .filter returns &&String
fn check_status(status: &&String) -> bool {
    !IGNORE_POD_PHASE.contains(&status.as_str())
}

trait DbOperations {
    fn insert(&self, cluster: String) -> Result<(), Error>;
}

impl DbOperations for Pod {
    fn insert(&self, cluster: String) -> Result<(), Error> {
        let w = Watcher {
            resource_id: self.metadata.name.clone(),
            cluster,
            resource_type: "Pod".to_string(), // TODO, can be enum?
            namespace_name: self.metadata.namespace.clone(),
            alerted_on: Utc::now().naive_utc(),
            pod_details: serde_json::to_value(&self).unwrap(),
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
    let pods: Api<Pod> = Api::all(client);
    watcher(pods, ListParams::default())
        .applied_objects()
        .try_for_each(|p| async move {
            // get the status of the pod
            if let Some(pod_status) = &p.status {
                // check if the PodStatus is not in IGNORE_POD_PHASE
                if let Some(s) = pod_status.phase.as_ref().filter(check_status) {
                    if let Err(e) = p.insert("cluster".to_string()) {
                        //log error
                    }
                    println!("sucessfully inserted");
                }
            }
            Ok(())
        })
        .await
        .unwrap();
}
