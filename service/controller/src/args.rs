use std::str::FromStr;

use crate::{error::Error, util::Timer};
use clap::Parser;

pub(crate) struct ArgsImpl {
    pub(crate) timelapse: Timer,
}

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
        let cli = Self::parse();
        let timelapse: Timer = Timer::from_str(&cli.timelapse)?;
        Ok(ArgsImpl { timelapse })
    }
}
