/// All errors possible to occur during reconciliation
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Invalid time format `{0}` suffix with `s` for sec, `m` for minutes, `h` for hours")]
    InvalidTime(String),
    /// Any error originating from the `kube-rs` crate
    #[error("Kubernetes reported error: {source}")]
    KubeError {
        #[from]
        source: kube::Error,
    },
    /// Error in user input or typically missing fields.
    #[error("Invalid User Input: {0}")]
    UserInputError(String),

    /// Any error originating from the `kube-rs` crate
    #[error("Reqwest Error: {source}")]
    ReqwestError {
        #[from]
        source: reqwest::Error,
    },
}

impl From<String> for Error {
    fn from(s: String) -> Self {
        Error::UserInputError(s)
    }
}
