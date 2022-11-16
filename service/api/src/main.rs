use common::{establish_connection, init_logging};
mod create;
mod error;
// mod delete;
// mod list;

use actix_web::{web, App, HttpServer};
use create::add_pod;
use diesel::r2d2::{self};

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
            .service(add_pod)
        // .service(delete_pod)
    })
    .bind(("0.0.0.0", 9090))?
    .run()
    .await
}
