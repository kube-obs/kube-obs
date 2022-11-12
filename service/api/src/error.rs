use actix_web::{error::BlockingError, ResponseError};

/// All errors possible to occur during reconciliation
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// Error in user input or typically missing fields.
    #[error("Invalid User Input: {0}")]
    UserInputError(String),

    /// Any error originating from the `kube-rs` crate
    #[error("SQL Error: {source}")]
    SQLError {
        #[from]
        source: diesel::result::Error,
    },
    /// Any error originating from the `kube-rs` crate
    #[error("Actix Web Error: {source}")]
    ActixWebError {
        #[from]
        source: actix_web::Error,
    },
    /// Any error originating from the `kube-rs` crate
    #[error("BlockingError: {source}")]
    BlockingError {
        #[from]
        source: BlockingError,
    },

}

impl From<String> for Error {
    fn from(s: String) -> Self {
        Error::UserInputError(s)
    }
}
