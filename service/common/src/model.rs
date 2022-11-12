use crate::schema::{watcher, watcher_history};
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use std::fmt::Display;
use std::str::FromStr;

use serde::{de, Deserializer};

#[derive(
    Default, Debug, Insertable, Queryable, Identifiable, AsChangeset, Serialize, Deserialize,
)]
#[diesel(primary_key(resource_id))]
#[table_name = "watcher"]
pub struct Watcher {
    pub resource_id: Option<String>,
    pub cluster: String,
    pub resource_type: String,
    pub namespace_name: Option<String>,
    pub pod_status: Option<String>,
    // example: 2007-04-05T14:30:30
    pub alerted_on: NaiveDateTime,
    pub pod_event: Option<serde_json::Value>,
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
