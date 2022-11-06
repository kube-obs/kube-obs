// @generated automatically by Diesel CLI.

diesel::table! {
    watcher (resource_id) {
        resource_id -> Varchar,
        cluster -> Varchar,
        resource_type -> Nullable<Varchar>,
        namespace_name -> Nullable<Varchar>,
        pod_status -> Nullable<Varchar>,
        alerted_on -> Timestamp,
        pod_event -> Nullable<Jsonb>,
    }
}

diesel::table! {
    watcher_history (resource_id, alerted_on) {
        resource_id -> Varchar,
        alerted_on -> Timestamp,
    }
}

diesel::allow_tables_to_appear_in_same_query!(watcher, watcher_history,);
