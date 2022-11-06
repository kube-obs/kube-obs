use crate::error::*;
use chrono::{NaiveDateTime, Utc};
use common::init_logging;
use common::{model::Watcher, model::WatcherHistory, watcher, watcher_history};
use diesel::dsl::exists;
use diesel::pg::PgConnection;
use diesel::{prelude::*, select};
use serde_json::Value;

pub fn delete_pod_resource(conn: &mut PgConnection, res: String) -> usize {
    use common::schema::watcher::dsl::*;
    diesel::delete(watcher.filter(resource_id.eq(res)))
        .execute(conn)
        .expect("Failed to delete resource {res}")
}
