mod args;
mod create;
mod delete;
mod error;
mod list;
use std::process;
mod pod;

use crate::{
    args::Args,
    error::Error,
    pod::{db_clean, pod_watcher},
};

use args::ArgsImpl;
use common::init_logging;
use tokio::select;

#[tokio::main]
async fn main() -> Result<(), Error> {
    match Args::parse_input() {
        Ok(a) => {
            // all good with parser start the pod watcher
            // in future it can watch other kubernetes resources like Job, Deployment

            tokio::select! {
                _ = pod_watcher() => println!("pod event watcher failed"),
               _  = db_clean() => println!("db clean exited"),
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
