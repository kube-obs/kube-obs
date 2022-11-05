use crate::error::Error;
use clap::Parser;

pub(crate) struct ArgsImpl {
    pub(crate) debug: bool,
}

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub(crate) struct Args {
    /// supply --debug to print the debug information
    #[arg(short, long, action = clap::ArgAction::Count)]
    debug: u8,
}

impl Args {
    pub(crate) fn parse_input() -> Result<ArgsImpl, Error> {
        let cli = Self::parse();
        let debug: bool;
        match cli.debug {
            1 => {
                std::env::set_var("RUST_LOG", "debug,kube_client=off,tower=off,hyper=off");
                debug = true;
            }
            _ => {
                std::env::set_var("RUST_LOG", "info,kube_client=off");
                debug = false;
            }
        }
        Ok(ArgsImpl { debug })
    }
}
