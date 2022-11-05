use crate::schema::{watcher, watcher_history};
use chrono::NaiveDateTime;

#[derive(Default, Debug, Insertable, Queryable)]
#[diesel(primary_key(resource_id))]
#[table_name = "watcher"]
pub struct Watcher {
    pub resource_id: Option<String>,
    pub cluster: String,
    pub resource_type: String,
    pub namespace_name: Option<String>,
    pub alerted_on: NaiveDateTime,
    pub pod_details: serde_json::Value,
}

#[derive(Default, Debug, Insertable, Queryable)]
#[diesel(primary_key(resource_id, alerted_on))]
#[table_name = "watcher_history"]
pub struct WatcherHistory {
    pub resource_id: Option<String>,
    pub alerted_on: NaiveDateTime,
}

#[derive(Default, Debug, Queryable)]
#[diesel(primary_key(resource_id))]
pub struct WatcherList<'a> {
    pub resource_id: &'a str,
    pub alerted_on: String,
    pub namespace_name: String,
}
