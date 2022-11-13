#!/bin/bash
set -x
echo DATABASE_URL=postgres://admin:admin@postgresql-dev.default.svc.cluster.local/obs >.env

# diesel setup

# diesel migration generate watcher

# Copy the sql statement to newly generated watcher folder in <>_watcher
diesel migration run
