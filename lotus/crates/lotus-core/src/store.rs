use crate::{Error, Object, Result};
use libsql::{params, Connection, Database};
use serde_json::Value;

/// Query filters for finding objects
#[derive(Debug, Default, Clone)]
pub struct Query {
    /// Filter by type (data.type = ?)
    pub object_type: Option<String>,
    /// Filter by tag (? IN data.tags)
    pub tag: Option<String>,
    /// Filter by parent (data.parent = ?)
    pub parent: Option<String>,
    /// Limit results
    pub limit: Option<usize>,
}

impl Query {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_type(mut self, t: impl Into<String>) -> Self {
        self.object_type = Some(t.into());
        self
    }

    pub fn with_tag(mut self, t: impl Into<String>) -> Self {
        self.tag = Some(t.into());
        self
    }

    pub fn with_parent(mut self, p: impl Into<String>) -> Self {
        self.parent = Some(p.into());
        self
    }

    pub fn with_limit(mut self, l: usize) -> Self {
        self.limit = Some(l);
        self
    }
}

/// Object store backed by libsql
pub struct Store {
    conn: Connection,
}

impl Store {
    /// Open a store at the given path (creates if doesn't exist)
    pub async fn open(path: &str) -> Result<Self> {
        let db = Database::open(path)?;
        let conn = db.connect()?;

        // Create table if not exists
        conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS objects (
                id TEXT PRIMARY KEY,
                data JSON NOT NULL
            )
            "#,
            (),
        )
        .await?;

        // Index on type for fast type queries
        conn.execute(
            r#"
            CREATE INDEX IF NOT EXISTS idx_type
            ON objects(json_extract(data, '$.type'))
            "#,
            (),
        )
        .await?;

        Ok(Self { conn })
    }

    /// Open an in-memory store (for testing)
    pub async fn open_memory() -> Result<Self> {
        Self::open(":memory:").await
    }

    /// Create a new object, returns the id
    pub async fn create(&self, data: Value) -> Result<String> {
        let obj = Object::new(data);
        let json = serde_json::to_string(&obj.data)?;

        self.conn
            .execute(
                "INSERT INTO objects (id, data) VALUES (?, jsonb(?))",
                params![obj.id.as_str(), json.as_str()],
            )
            .await?;

        Ok(obj.id)
    }

    /// Get an object by id
    pub async fn get(&self, id: &str) -> Result<Option<Object>> {
        let mut rows = self
            .conn
            .query("SELECT id, json(data) FROM objects WHERE id = ?", params![id])
            .await?;

        if let Some(row) = rows.next().await? {
            let id: String = row.get(0)?;
            let data_str: String = row.get(1)?;
            let data: Value = serde_json::from_str(&data_str)?;
            Ok(Some(Object::with_id(id, data)))
        } else {
            Ok(None)
        }
    }

    /// Query objects with filters
    pub async fn query(&self, q: Query) -> Result<Vec<Object>> {
        let mut sql = String::from("SELECT id, json(data) FROM objects WHERE 1=1");
        let mut params: Vec<String> = Vec::new();

        if let Some(ref t) = q.object_type {
            sql.push_str(" AND json_extract(data, '$.type') = ?");
            params.push(t.clone());
        }

        if let Some(ref t) = q.tag {
            sql.push_str(" AND EXISTS (SELECT 1 FROM json_each(data, '$.tags') WHERE value = ?)");
            params.push(t.clone());
        }

        if let Some(ref p) = q.parent {
            sql.push_str(" AND json_extract(data, '$.parent') = ?");
            params.push(p.clone());
        }

        if let Some(l) = q.limit {
            sql.push_str(&format!(" LIMIT {}", l));
        }

        // Build params tuple - libsql wants references
        let param_refs: Vec<&str> = params.iter().map(|s| s.as_str()).collect();

        let mut rows = self
            .conn
            .query(&sql, libsql::params_from_iter(param_refs))
            .await?;

        let mut objects = Vec::new();
        while let Some(row) = rows.next().await? {
            let id: String = row.get(0)?;
            let data_str: String = row.get(1)?;
            let data: Value = serde_json::from_str(&data_str)?;
            objects.push(Object::with_id(id, data));
        }

        Ok(objects)
    }

    /// Update an object (replaces entire data blob)
    pub async fn update(&self, id: &str, data: Value) -> Result<()> {
        let json = serde_json::to_string(&data)?;

        let rows_affected = self
            .conn
            .execute(
                "UPDATE objects SET data = jsonb(?) WHERE id = ?",
                params![json.as_str(), id],
            )
            .await?;

        if rows_affected == 0 {
            return Err(Error::NotFound(id.to_string()));
        }

        Ok(())
    }

    /// Delete an object
    pub async fn delete(&self, id: &str) -> Result<()> {
        let rows_affected = self
            .conn
            .execute("DELETE FROM objects WHERE id = ?", params![id])
            .await?;

        if rows_affected == 0 {
            return Err(Error::NotFound(id.to_string()));
        }

        Ok(())
    }

    /// Find objects that link to this id (backlinks)
    pub async fn backlinks(&self, id: &str) -> Result<Vec<Object>> {
        let mut rows = self
            .conn
            .query(
                r#"
                SELECT id, json(data) FROM objects
                WHERE EXISTS (
                    SELECT 1 FROM json_each(data, '$.links') WHERE value = ?
                )
                "#,
                params![id],
            )
            .await?;

        let mut objects = Vec::new();
        while let Some(row) = rows.next().await? {
            let id: String = row.get(0)?;
            let data_str: String = row.get(1)?;
            let data: Value = serde_json::from_str(&data_str)?;
            objects.push(Object::with_id(id, data));
        }

        Ok(objects)
    }

    /// Get children of an object (objects where parent = id)
    pub async fn children(&self, id: &str) -> Result<Vec<Object>> {
        self.query(Query::new().with_parent(id)).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[tokio::test]
    async fn test_crud() {
        let store = Store::open_memory().await.unwrap();

        // Create
        let id = store
            .create(json!({
                "type": "thought",
                "content": "hello world",
                "tags": ["test", "greeting"]
            }))
            .await
            .unwrap();

        // Get
        let obj = store.get(&id).await.unwrap().unwrap();
        assert_eq!(obj.object_type(), Some("thought"));
        assert_eq!(obj.tags(), vec!["test", "greeting"]);

        // Update
        store
            .update(
                &id,
                json!({
                    "type": "thought",
                    "content": "updated content",
                    "tags": ["test"]
                }),
            )
            .await
            .unwrap();

        let obj = store.get(&id).await.unwrap().unwrap();
        assert_eq!(obj.data["content"], "updated content");

        // Delete
        store.delete(&id).await.unwrap();
        assert!(store.get(&id).await.unwrap().is_none());
    }

    #[tokio::test]
    async fn test_query_by_type() {
        let store = Store::open_memory().await.unwrap();

        store
            .create(json!({"type": "thought", "content": "a"}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "content": "b"}))
            .await
            .unwrap();
        store
            .create(json!({"type": "stopwatch", "state": "stopped"}))
            .await
            .unwrap();

        let thoughts = store
            .query(Query::new().with_type("thought"))
            .await
            .unwrap();
        assert_eq!(thoughts.len(), 2);

        let stopwatches = store
            .query(Query::new().with_type("stopwatch"))
            .await
            .unwrap();
        assert_eq!(stopwatches.len(), 1);
    }

    #[tokio::test]
    async fn test_query_by_tag() {
        let store = Store::open_memory().await.unwrap();

        store
            .create(json!({"type": "thought", "tags": ["work", "urgent"]}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "tags": ["personal"]}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "tags": ["work"]}))
            .await
            .unwrap();

        let work = store.query(Query::new().with_tag("work")).await.unwrap();
        assert_eq!(work.len(), 2);

        let urgent = store.query(Query::new().with_tag("urgent")).await.unwrap();
        assert_eq!(urgent.len(), 1);
    }

    #[tokio::test]
    async fn test_parent_children() {
        let store = Store::open_memory().await.unwrap();

        let parent_id = store
            .create(json!({"type": "folder", "name": "root"}))
            .await
            .unwrap();

        store
            .create(json!({"type": "thought", "content": "child 1", "parent": parent_id}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "content": "child 2", "parent": parent_id}))
            .await
            .unwrap();

        let children = store.children(&parent_id).await.unwrap();
        assert_eq!(children.len(), 2);
    }

    #[tokio::test]
    async fn test_backlinks() {
        let store = Store::open_memory().await.unwrap();

        let target_id = store
            .create(json!({"type": "thought", "content": "target"}))
            .await
            .unwrap();

        store
            .create(json!({"type": "thought", "content": "links to target", "links": [target_id]}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "content": "also links", "links": [target_id]}))
            .await
            .unwrap();
        store
            .create(json!({"type": "thought", "content": "no links"}))
            .await
            .unwrap();

        let backlinks = store.backlinks(&target_id).await.unwrap();
        assert_eq!(backlinks.len(), 2);
    }
}
