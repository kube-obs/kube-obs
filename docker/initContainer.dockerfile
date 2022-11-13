FROM rust:latest  AS builder

ARG DIESEL_VER=2.0.1
ENV DIESEL_VER=${DIESEL_VER}

RUN cargo install diesel_cli \
    --version "${DIESEL_VER}" \
    --no-default-features \
    --features "postgres"

FROM debian:bullseye-slim AS app

COPY --from=builder  /usr/local/cargo/bin/diesel /usr/local/bin/

WORKDIR db

RUN apt-get update && apt-get install libpq5 -y
COPY service/api/db/migrations migrations
COPY service/api/db/diesel.toml diesel.toml
COPY local/db.sh  db.sh

ENTRYPOINT [ "./db.sh" ]
