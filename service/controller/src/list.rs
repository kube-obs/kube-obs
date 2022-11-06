use crate::error::*;
use chrono::{NaiveDateTime, Utc};
use common::init_logging;
use common::{model::Watcher, model::WatcherHistory, watcher, watcher_history};
use diesel::dsl::exists;
use diesel::pg::PgConnection;
use diesel::{prelude::*, select};
use serde_json::Value;

pub fn list_watcher(conn: &mut PgConnection) -> Result<Vec<(String, Option<String>)>, Error> {
    use common::schema::watcher::dsl::*;
    let t: Vec<(String, Option<String>)> = watcher
        .select((resource_id, namespace_name))
        .load::<(String, Option<String>)>(conn)
        .expect("select failed");
    Ok(t)
}
