use diesel::pg::PgConnection;
use diesel::prelude::*;
use tracing::debug;

#[delete("/pods")]
pub fn delete_pod(conn: &mut PgConnection, res: String) -> usize {
    use common::schema::watcher::dsl::*;
    debug!(
        "cleaning up pod {} from watcher as the pod no longer exists in cluster",
        res
    );
    let u = diesel::delete(watcher.filter(resource_id.eq(res.clone())))
        .execute(conn)
        .expect("Failed to delete resource");
    debug!(
        "Success: cleaning up pod {} from watcher as the pod no longer exists in cluster",
        res
    );
    u
}
