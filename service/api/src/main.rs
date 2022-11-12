use common::{establish_connection, init_logging};
mod create;
mod error;
// mod delete;
// mod list;

use actix_web::{web, App, HttpRequest, HttpServer, Responder};
use create::add_pods;
use diesel::{
    prelude::*,
    r2d2::{self, ConnectionManager},
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    init_logging();
    let manager = establish_connection();
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(add_pods)
    })
    .bind(("127.0.0.1", 9090))?
    .run()
    .await
}
