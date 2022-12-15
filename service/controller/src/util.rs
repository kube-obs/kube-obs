use crate::error::Error;
use chrono::{DateTime, Utc};
use std::str::FromStr;
use tracing::debug;

pub enum Timer {
    Minutes(i32),
    Seconds(i32),
    Hour(i32),
    Days(i32),
}
impl FromStr for Timer {
    fn from_str(s: &str) -> Result<Timer, Self::Err> {
        // get the suffix of the time h,m,s
        let suffix = &s[s.len() - 1..s.len()];
        let time: i32 = s[0..s.len() - 1].parse().unwrap();
        match suffix {
            "h" => Ok(Timer::Hour(time)),
            "s" => Ok(Timer::Seconds(time)),
            "m" => Ok(Timer::Minutes(time)),
            "d" => Ok(Timer::Days(time)),
            _ => Err(Error::InvalidTime(s.to_string())),
        }
    }
    type Err = Error;
}
// check if the pod start time has exceeded the threshold freq time
pub fn time_diff(check_time: DateTime<Utc>, t: &Timer) -> bool {
    let current_time = Utc::now();
    let diff = current_time - check_time;
    let (threshold, error_since) = match &t {
        Timer::Minutes(val) => {
            debug!(
                "time lapsed since the resource start: {} minutes",
                diff.num_minutes()
            );
            (*val, diff.num_minutes())
        }
        Timer::Seconds(val) => {
            debug!(
                "time lapsed since the resource start: {} secs",
                diff.num_seconds()
            );
            (*val, diff.num_minutes())
        }
        Timer::Hour(val) => {
            debug!(
                "time lapsed since the resource start: {} hours",
                diff.num_hours()
            );
            (*val, diff.num_minutes())
        }
        Timer::Days(val) => {
            debug!(
                "time lapsed since the resource start: {} days",
                diff.num_hours()
            );
            (*val, diff.num_minutes())
        }
    };
    if error_since > threshold.into() {
        return true;
    }
    false
}
