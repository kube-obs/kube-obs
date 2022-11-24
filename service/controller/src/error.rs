/// All errors possible to occur during reconciliation
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// Any error originating from the `kube-rs` crate
    #[error("Kubernetes reported error: {source}")]
    Kube {
        #[from]
        source: kube::Error,
    },
    /// Error in user input or typically missing fields.
    #[error("Invalid User Input: {0}")]
    UserInput(String),

    /// Any error originating from the `kube-rs` crate
    #[error("Reqwest Error: {source}")]
    Reqwest {
        #[from]
        source: reqwest::Error,
    },
}

impl From<String> for Error {
    fn from(s: String) -> Self {
        Error::UserInput(s)
    }
}
