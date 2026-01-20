# Lotus Architecture

> The Lotus is the classic symbol of something beautiful growing out of the mud (MUD = Multi User Dungeon).

## Core Concept

Everything is an object. Objects are JSON blobs with an id.

```
{ id: "uuid", data: { type: "thought", content: "...", tags: [...] } }
```

No special tables for types, tags, relationships. All just properties in the blob.

## Storage

Single table:

```sql
CREATE TABLE objects (
  id TEXT PRIMARY KEY,
  data JSON NOT NULL
);
```

Indexes on json_extract for common query patterns.

## Conventions

All conventions are just data in the blob:

| Convention | Property | Example |
|------------|----------|---------|
| Type | `data.type` | `"thought"`, `"stopwatch"`, `"calendarEvent"` |
| Tags | `data.tags` | `["work", "urgent"]` |
| Parent | `data.parent` | `"parent-uuid"` |
| Links | `data.links` | `["target-uuid", ...]` |
| Backlinks | computed | Objects where `links` contains this id |

## API

```rust
store.create(data) -> id
store.get(id) -> Option<Object>
store.query(filters) -> Vec<Object>
store.update(id, data)
store.delete(id)
store.backlinks(id) -> Vec<Object>
store.children(id) -> Vec<Object>
```

## Design Principles

1. **Blob is source of truth** - flexible, schemaless
2. **Indexes are derived** - add for query patterns you actually use
3. **Conventions in userspace** - storage doesn't know about types, tags, etc.
4. **Concurrency is userspace** - storage provides primitives, app picks strategy
5. **Frontend agnostic** - core is just data, views are projections
