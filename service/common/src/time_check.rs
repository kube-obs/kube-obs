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
            _ => Err(ObsError::InvalidTime(s.to_string())),
        }
    }
    type Err = ObsError;
}
fn time_diff(check_time: DateTime<Utc>, t: &Timer) -> bool {
    let current_time = Utc::now();

    let diff = current_time - check_time;
    let (threshold, error_since) = match &t {
        Timer::Minutes(val) => {
            println!("Total time taken to run is {} minutes", diff.num_minutes());
            (*val, diff.num_minutes())
        }
        Timer::Seconds(val) => {
            println!("Total time taken to run is {} minutes", diff.num_seconds());
            (*val, diff.num_minutes())
        }
        Timer::Hour(val) => {
            println!("Total time taken to run is {} minutes", diff.num_hours());
            (*val, diff.num_minutes())
        }
        Timer::Days(val) => {
            println!("Total time taken to run is {} minutes", diff.num_hours());
            (*val, diff.num_minutes())
        }
    };
    if error_since > threshold.into() {
        return true;
    }
    false
}
