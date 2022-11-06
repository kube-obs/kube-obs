use crate::error::*;
use chrono::{NaiveDateTime, Utc};
use common::init_logging;
use common::{model::Watcher, model::WatcherHistory, watcher, watcher_history};
use diesel::dsl::exists;
use diesel::pg::PgConnection;
use diesel::{prelude::*, select};
use serde_json::Value;

pub fn create_watcher(conn: &mut PgConnection, w: &Watcher) -> Result<(), Error> {
    use common::schema::watcher::dsl::*;
    let resource_exists: bool = select(exists(
        watcher.filter(resource_id.eq(w.resource_id.as_ref().unwrap())),
    ))
    .get_result(conn)?;
    if !resource_exists {
        let _ = diesel::insert_into(watcher)
            .values(w)
            .execute(conn)
            .expect("Error saving data into watcher");
    } else {
        let updated_row = diesel::update(watcher)
            .filter(resource_id.eq(w.resource_id.clone().unwrap()))
            .set((alerted_on.eq(w.alerted_on), pod_event.eq(&w.pod_event)))
            .execute(conn)
            .expect("Error updating data into watcher");

        let new_post_his = WatcherHistory {
            resource_id: w.resource_id.to_owned(),
            alerted_on: Utc::now().naive_utc(),
        };
        diesel::insert_into(watcher_history::table)
            .values(&new_post_his)
            .execute(conn)
            .expect("Error saving data into watcher_history");
    }
    Ok(())
}
