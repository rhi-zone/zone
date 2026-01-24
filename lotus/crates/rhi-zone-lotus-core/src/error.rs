use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("object not found: {0}")]
    NotFound(String),

    #[error("database error: {0}")]
    Database(#[from] libsql::Error),

    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
}
