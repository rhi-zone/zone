//! Lotus server - HTTP + WebSocket interface to the object store.

use std::sync::Arc;

use axum::Router;
use lotus_core::{Object, Query, Store};
use serde_json::Value;
use trellis::prelude::*;
use tower_http::cors::{Any, CorsLayer};

/// Service wrapping the lotus store
#[derive(Clone)]
pub struct ObjectService {
    store: Arc<Store>,
}

impl ObjectService {
    pub fn new(store: Store) -> Self {
        Self {
            store: Arc::new(store),
        }
    }
}

#[http(prefix = "/api")]
impl ObjectService {
    /// List objects with optional filters
    #[route(path = "/objects")]
    pub async fn list_objects(
        &self,
        object_type: Option<String>,
        tag: Option<String>,
        parent: Option<String>,
        limit: Option<usize>,
    ) -> Vec<Object> {
        let query = Query::new();
        let query = match object_type {
            Some(t) => query.with_type(t),
            None => query,
        };
        let query = match tag {
            Some(t) => query.with_tag(t),
            None => query,
        };
        let query = match parent {
            Some(p) => query.with_parent(p),
            None => query,
        };
        let query = match limit {
            Some(l) => query.with_limit(l),
            None => query,
        };

        self.store.query(query).await.unwrap_or_default()
    }

    /// Get a single object by id
    pub async fn get_object(&self, id: String) -> Option<Object> {
        self.store.get(&id).await.ok().flatten()
    }

    /// Create a new object
    pub async fn create_object(&self, data: Value) -> Result<Object, String> {
        let id = self
            .store
            .create(data.clone())
            .await
            .map_err(|e| e.to_string())?;

        self.store
            .get(&id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Failed to retrieve created object".to_string())
    }

    /// Update an object
    pub async fn update_object(&self, id: String, data: Value) -> Result<(), String> {
        self.store
            .update(&id, data)
            .await
            .map_err(|e| e.to_string())
    }

    /// Delete an object
    pub async fn delete_object(&self, id: String) -> Result<(), String> {
        self.store.delete(&id).await.map_err(|e| e.to_string())
    }

    /// Get objects that link to this id (backlinks)
    pub async fn get_backlinks(&self, id: String) -> Vec<Object> {
        self.store.backlinks(&id).await.unwrap_or_default()
    }

    /// Get children of an object
    pub async fn get_children(&self, id: String) -> Vec<Object> {
        self.store.children(&id).await.unwrap_or_default()
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_path = std::env::var("LOTUS_DB").unwrap_or_else(|_| "lotus.db".to_string());

    println!("Opening database at: {}", db_path);
    let store = Store::open(&db_path).await?;
    let service = ObjectService::new(store);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app: Router = service.http_router().layer(cors);

    let addr = std::env::var("LOTUS_ADDR").unwrap_or_else(|_| "0.0.0.0:3000".to_string());
    println!("Starting server on http://{}", addr);
    println!("\nEndpoints:");
    println!("  GET    /api/objects         - list objects");
    println!("  GET    /api/objects/:id     - get object");
    println!("  POST   /api/objects         - create object");
    println!("  PUT    /api/objects/:id     - update object");
    println!("  DELETE /api/objects/:id     - delete object");
    println!("  GET    /api/backlinks/:id   - get backlinks");
    println!("  GET    /api/children/:id    - get children");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
