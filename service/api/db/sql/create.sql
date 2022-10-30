-- Your SQL goes here

CREATE TABLE watcher (
  resource_id VARCHAR PRIMARY KEY,
  cluster VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  namespace_name  VARCHAR NOT NULL,
  is_alerted CHAR(1) NOT NULL,
  alerted_on TIMESTAMP NOT NULL
);


CREATE TABLE watcher_history (
  resource_id VARCHAR,
  alerted_on TIMESTAMP,
  PRIMARY KEY(resource_id, alerted_on)
)
