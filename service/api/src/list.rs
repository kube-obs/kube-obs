use crate::error::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;

pub fn list_watcher(conn: &mut PgConnection) -> Result<Vec<(String, Option<String>)>, Error> {
    use common::schema::watcher::dsl::*;
    let t: Vec<(String, Option<String>)> = watcher
        .select((resource_id, namespace_name))
        .load::<(String, Option<String>)>(conn)
        .expect("select failed");
    Ok(t)
}
