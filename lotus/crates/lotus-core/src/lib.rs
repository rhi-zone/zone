//! Lotus Core - unified object graph storage
//!
//! Everything is an object. Objects are JSON blobs with an id.
//! Type, tags, relationships - all just properties in the blob.

mod error;
mod object;
mod store;

pub use error::Error;
pub use object::Object;
pub use store::{Query, Store};

pub type Result<T> = std::result::Result<T, Error>;
