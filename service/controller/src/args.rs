use crate::error::Error;
use clap::Parser;

pub(crate) struct ArgsImpl {}

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub(crate) struct Args {
    // Resource lapse duration, usually how long the resouce can be in non running state before it can be notified
    // 2s implies 2 seconds
    // 2m implies 2 minutes
    // 2h implies 2 hours
    // 2d implese 2 days
    #[clap(short, long, default_value_t = String::from("2m"))]
    pub timelapse: String,
}

impl Args {
    pub(crate) fn parse_input() -> Result<ArgsImpl, Error> {
        // TODO : Parsing of cli args to be used in future development
        let _cli = Self::parse();
        Ok(ArgsImpl {})
    }
}
