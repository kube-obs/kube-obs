FROM rust:latest  AS builder

COPY Cargo.lock /app/

RUN cargo new --lib /app/service/common
COPY service/common/Cargo.toml /app/service/common/

RUN cargo new /app/service/controller
COPY service/controller/Cargo.toml /app/service/controller/

RUN apt update && apt install -y protobuf-compiler

WORKDIR /app/service/controller
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release

COPY service/controller/src /app/service/controller/src
COPY service/common/src /app/service/common/src
RUN --mount=type=cache,target=/usr/local/cargo/registry  touch /app/service/common/src/lib.rs /app/service/controller/src/main.rs && cargo build --release

FROM debian:bullseye-slim AS app
# TODO: investigate if libpq5 is really required as we dont use sql in controller
#       Currently added as the container is error out due to libpq5 not present
RUN apt-get update && apt-get install libpq5 -y
COPY --from=builder /app/service/controller/target/release/controller /controller

CMD ["/controller"]
