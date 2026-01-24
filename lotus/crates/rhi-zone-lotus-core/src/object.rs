use serde::{Deserialize, Serialize};
use serde_json::Value;

/// An object in the graph. Just an id and a JSON blob.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Object {
    pub id: String,
    pub data: Value,
}

impl Object {
    /// Create a new object with a generated id
    pub fn new(data: Value) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            data,
        }
    }

    /// Create an object with a specific id
    pub fn with_id(id: impl Into<String>, data: Value) -> Self {
        Self {
            id: id.into(),
            data,
        }
    }

    /// Get the type of this object (convention: data.type)
    pub fn object_type(&self) -> Option<&str> {
        self.data.get("type").and_then(|v| v.as_str())
    }

    /// Get tags (convention: data.tags)
    pub fn tags(&self) -> Vec<&str> {
        self.data
            .get("tags")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str()).collect())
            .unwrap_or_default()
    }

    /// Get parent id (convention: data.parent)
    pub fn parent(&self) -> Option<&str> {
        self.data.get("parent").and_then(|v| v.as_str())
    }

    /// Get links (convention: data.links)
    pub fn links(&self) -> Vec<&str> {
        self.data
            .get("links")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str()).collect())
            .unwrap_or_default()
    }
}
