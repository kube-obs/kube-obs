mod args;
mod error;
use std::process;
mod pod;
mod utils;
use crate::{args::Args, error::Error, pod::pod_watcher};
use tracing::info;
use utils::init_logging;
#[tokio::main]
async fn main() -> Result<(), Error> {
    init_logging();
    match Args::parse_input() {
        //TODO: ArgsImpl will be used in future development
        Ok(a) => {
            // all good with parser start the pod watcher
            // in future it can watch other kubernetes resources like Job, Deployment
            tokio::select! {
                _ = pod_watcher(a.cluster) => info!("pod event watcher failed"),

            }

            // delete the pods events from DB which are not in cluster
        }
        Err(e) => {
            eprintln!("{}", e);
            process::exit(2);
        }
    }

    Ok(())
}
