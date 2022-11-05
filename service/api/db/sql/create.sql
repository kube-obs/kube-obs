-- Your SQL goes here

CREATE TABLE watcher (
  resource_id VARCHAR PRIMARY KEY,
  cluster VARCHAR NOT NULL,
  resource_type VARCHAR,
  namespace_name  VARCHAR,
  alerted_on TIMESTAMP NOT NULL,
  pod_details Jsonb
);

CREATE TABLE watcher_history (
  resource_id VARCHAR,
  alerted_on TIMESTAMP,
  PRIMARY KEY(resource_id, alerted_on)
)
