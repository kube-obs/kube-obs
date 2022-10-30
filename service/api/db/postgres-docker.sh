# local db set up first time
docker run \
    --name postgres-db \
    -p 5432:5432 \
    -e POSTGRES_USER=rust \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -e POSTGRES_DB=kube \
    -d postgres

echo DATABASE_URL=postgres://rust@localhost/kube >.env

diesel setup

diesel migration generate watcher

# Copy the sql statement to newly generated watcher folder in <>_watcher

diesel migration run --config-file diesel.toml

# clone and run

docker run \
    --name postgres-db \
    -p 5432:5432 \
    -e POSTGRES_USER=rust \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -e POSTGRES_DB=kube \
    -d postgres

diesel migration run --config-file diesel.toml
