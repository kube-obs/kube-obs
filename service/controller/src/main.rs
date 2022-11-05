mod args;
mod create;
mod error;
use std::process;
mod pod;

use crate::{args::Args, error::Error, pod::pod_watcher};

use args::ArgsImpl;
use common::init_logging;

#[tokio::main]
async fn main() -> Result<(), Error> {
    match Args::parse_input() {
        Ok(a) => {
            // all good with parser start the pod watcher
            // in future it can watch other kubernetes resources like Job, Deployment
            pod_watcher().await
        }
        Err(e) => {
            eprintln!("{}", e);
            process::exit(2);
        }
    }

    Ok(())
}
