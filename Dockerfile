#TODO: DATABASE_URL as an arg
FROM rust:latest  AS build


COPY Cargo.lock /app/

RUN cargo new --lib /app/service/common
COPY service/common/Cargo.toml /app/service/common/

RUN cargo new /app/service/api
COPY service/api/Cargo.toml /app/service/api/

RUN apt update && apt-get install protobuf-compiler -y

WORKDIR /app/service/api
RUN --mount=type=cache,target=/usr/local/cargo/registry cargo build --release

COPY service/api/src /app/service/api/src
COPY service/common/src /app/service/common/src
RUN --mount=type=cache,target=/usr/local/cargo/registry  touch /app/service/common/src/lib.rs /app/service/api/src/main.rs && cargo build --release

FROM debian:buster-slim AS app
COPY --from=build /app/service/api/target/release/api /api
EXPOSE 9090
CMD ["/api"]
