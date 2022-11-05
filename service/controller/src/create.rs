use crate::error::*;
use chrono::{NaiveDateTime, Utc};
use common::init_logging;
use common::{model::Watcher, model::WatcherHistory, watcher, watcher_history};
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn create_watcher(conn: &mut PgConnection, w: &Watcher) -> Result<(), Error> {
    let _ = diesel::insert_into(watcher::table)
        .values(w)
        .execute(conn)
        .expect("Error saving data into watcher");

    let new_post_his = WatcherHistory {
        resource_id: w.resource_id.to_owned(),
        alerted_on: Utc::now().naive_utc(),
    };

    diesel::insert_into(watcher_history::table)
        .values(&new_post_his)
        .execute(conn)
        .expect("Error saving data into watcher_history");
    Ok(())
}
