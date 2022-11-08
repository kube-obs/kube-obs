use crate::error::*;
use chrono::Utc;
use common::{model::Watcher, model::WatcherHistory, watcher_history};
use diesel::dsl::exists;
use diesel::pg::PgConnection;
use diesel::{prelude::*, select};
use tracing::{debug, error, info};

pub fn create_watcher(conn: &mut PgConnection, w: &Watcher) -> Result<(), Error> {
    use common::schema::watcher::dsl::*;
    debug!("storing the pod details {} into watcher table", w.pod_event);
    debug!(
        "check if the pod details for {:?} already exists in watcher table",
        w.resource_id
    );
    let resource_exists: bool = select(exists(
        watcher.filter(resource_id.eq(w.resource_id.as_ref().unwrap())),
    ))
    .get_result(conn)?;
    if !resource_exists {
        info!("Insert pod {:?}, in watcher table", w.resource_id);
        let _ = diesel::insert_into(watcher)
            .values(w)
            .execute(conn)
            .expect("Error saving data into watcher");
        info!("Success: pod {:?} inserted in watcher table", w.resource_id);
    } else {
        info!("Updating pod {:?}, in watcher table", w.resource_id);
        diesel::update(watcher)
            .filter(resource_id.eq(w.resource_id.clone().unwrap()))
            .set((alerted_on.eq(w.alerted_on), pod_event.eq(&w.pod_event)))
            .execute(conn)
            .expect("Error updating data into watcher");
        info!("Success: pod {:?} updated in watcher table", w.resource_id);
    }
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
