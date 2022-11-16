mod args;
mod error;
use std::process;
mod pod;
mod util;

use crate::{args::Args, error::Error, pod::pod_watcher};
use common::init_logging;
use tracing::info;
#[tokio::main]
async fn main() -> Result<(), Error> {
    init_logging();
    match Args::parse_input() {
        Ok(a) => {
            // all good with parser start the pod watcher
            // in future it can watch other kubernetes resources like Job, Deployment
            tokio::select! {
                _ = pod_watcher(&a.timelapse) => info!("pod event watcher failed"),
               //_  = db_clean() => println!("db clean exited"),
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
