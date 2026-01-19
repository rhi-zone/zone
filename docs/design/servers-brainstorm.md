# Flora Servers: Brainstorm

Backend services for the flora ecosystem. UI handled by canopy (~/git/canopy); these are headless servers.

## Overview

Three distinct projects that could relate:

1. **MOO-style object system** - Persistent programmable object database. Standalone value.
2. **Notes / Knowledge base** - Standalone OR as a MOO app
3. **Filesystem service** - Standalone OR as a MOO app

Each has value independently. But if MOO exists, notes/fs become natural apps within it - built using objects/verbs, getting persistence and programmability for free, with interop (a note could reference a file, etc.).

```
Option A: Standalone servers          Option B: MOO as platform
┌─────────┐ ┌─────────┐ ┌────┐       ┌─────────────────────────┐
│  Notes  │ │   FS    │ │MOO │       │          MOO            │
│ Server  │ │ Server  │ │    │       │  ┌─────┐ ┌────┐ ┌───┐  │
└─────────┘ └─────────┘ └────┘       │  │Notes│ │ FS │ │...│  │
                                      │  └─────┘ └────┘ └───┘  │
                                      └─────────────────────────┘
```

Not mutually exclusive - could have standalone notes server AND notes-as-MOO-app.

**Key distinction**:
- **Standalone Notes/FS** - "Real" implementations for people who just want notes/files
- **MOO** - Programmable object platform, interesting in its own right
- **Notes/FS in MOO** - Fun MOO-native apps, showcasing the paradigm ("look what you can build with programmable objects + verbs + inheritance")

The MOO versions aren't wrappers around standalone versions. They're different paradigms that happen to solve similar problems. MOO-native apps are toys/demos/explorations.

## Where Things Live

**pith** = Stdlib. Stable interfaces, WASI foundation, seldom changes. "What are the primitives?"

**flora** = Full-stack apps composing rhizome libraries. "What can we build with them?"

Flora already contains:
- **iris** - Session analysis (uses spore + sessions + llm)
- **wisteria** - Autonomous tasks (uses spore + moss)

Flora could contain:
- **MOO** - Programmable objects (uses pith-sql, pith-fs, spore, reed) - *future rebuild of lotus*
- **Notes** - Knowledge base (uses pith-sql, maybe spore)
- **FS service** - File operations (uses pith-fs, pith-sql)

## Architecture (Common)

```
Any Client (canopy, CLI, other) ←→ Flora Server ←→ Storage
                                       ↑
                                  Lua or Rust
```

### Protocol

**Principle**: Simplest possible for arbitrary consumers. Not canopy-specific.

Options to consider:
- HTTP/JSON (universal, simple, stateless)
- WebSocket (real-time, bidirectional)
- Unix socket (local, fast)

### Language Choice

**Prior art**: lotus (MOO-style system), reed (language→IR→language), spore (Lua runtime)

The stack:
```
TypeScript (author verbs here - great DX, types, LLM-familiar)
    ↓ reed (compile)
Restricted IR (safe, serializable, no dangerous primitives)
    ↓ reed (emit)
Lua (executes on spore with native plugin capabilities)
```

| Layer | Language | Rationale |
|-------|----------|-----------|
| Verb authoring | TypeScript | Type safety, IDE support, LLMs know it |
| IR | S-expressions | Universal, serializable, inspectable |
| Execution | Lua on spore | Fast (LuaJIT), sandboxed, plugin ecosystem |
| Plugins | Rust | Performance, safety, native capabilities |
| Core DB | Rust | Persistence needs perf |

**Extensibility**: MOO core is minimal (entities + verbs + capabilities). Domain features (notes, fs, AI) are spore plugins that expose capabilities. TypeScript SDKs wrap those capabilities with types.

---

## Project: MOO-Style Object System

A standalone persistent programmable object database. Other projects could build on it, or not.

### Original Motivation

The itch: Tavern/SillyTavern ccv2 character cards are limited by **linear conversational history**.

Problems with chat-log-only context:
- **Amnesia**: Context falls off, character "forgets" things
- **No persistent state**: Clothing, inventory, location not tracked
- **No descriptions**: Things in the world aren't properly described

What MOO solves - inject **world state** as context, not just chat:
```
You are in [Room: Kitchen].
You see: [Table], [Chair], [Alice (wearing: sundress, holding: coffee cup)].
Your inventory: [keys, phone].
Recent events: [Alice entered 5 minutes ago].
---
[conversation continues here]
```

### Intentional Generalization

While the origin was AI roleplay, the primitives (entities, props, verbs, persistence) were intentionally made generic. Same bones, different flesh:

| Use Case | Entities | Props | Verbs |
|----------|----------|-------|-------|
| AI roleplay | Characters, rooms, items | Clothing, inventory, mood | say, move, take |
| Kanban | Boards, columns, cards | Status, assignee, due date | move, archive |
| MUD | Rooms, NPCs, items | Health, stats, descriptions | look, fight, talk |
| Wiki | Pages, links | Content, tags, backlinks | edit, link, search |

### What Made MOO Interesting

1. **Everything is an object**: Rooms, players, items, even verbs
2. **Inheritance**: Objects can inherit from parents
3. **Properties**: Key-value data on objects
4. **Verbs**: Programmable methods on objects
5. **Persistence**: Database survives restarts
6. **Multi-user**: Multiple connections, shared world
7. **Text-based**: Core interaction is text (UI optional)

### Modernizing MOO

What to keep:
- Object model with properties/verbs
- Persistence
- Programmability
- Text as first-class

What to reconsider:
- Single-server architecture → distributed?
- Custom scripting language → Lua?
- Telnet protocol → modern protocols?
- Global namespace → scoped/namespaced?

### Object References

**Question**: How do objects reference each other?

| Option | Pros | Cons |
|--------|------|------|
| Numeric IDs (`#123`) | Simple, fast | Opaque, fragile |
| Paths (`/room/kitchen/table`) | Human-readable | Implies hierarchy, renames break |
| UUIDs | Globally unique, stable | Opaque |
| Content-addressed (hash) | Immutable, dedupes | Awkward for mutable |
| Named + scoped (`@user/project/obj`) | Readable, namespaced | More complex |
| Hybrid (UUID internal, path display) | Best of both | More complexity |

**To decide**: What operations matter most? Rename? Move? Link? Copy?

### Answers from Lotus

| Question | Lotus Answer |
|----------|--------------|
| Storage backend | SQLite (libSQL) - simple, embedded, sufficient |
| Object references | Numeric IDs internally, prototype chain for inheritance |
| Permissions | Capability-based - unforgeable tokens checked by verbs |
| Schema | Free-form JSON props - no migrations needed |
| Verbs | S-expressions stored in DB, executed by kernel |

### Open Questions (MOO)

- **Versioning**: Do objects have history? (Lotus: no, but could add)
- **Distribution**: Single-server or multi-node? (Lotus: single)
- **Authentication**: Identity tied to what? (Lotus: entity ownership)
- **What's different from Lotus?**: Is this just "lotus v2" or something new?

---

## Project: Notes / Knowledge Base

Persistent notes with rich linking. Could be:
- **Standalone**: Simple document store with linking
- **On MOO**: Notes as objects, links as references, queries as verbs

### Requirements
- Create, read, update, delete notes
- Link notes to each other
- Search / query
- Maybe: tags, hierarchy, backlinks

### Open Questions (Notes)
- Flat or hierarchical?
- Block-based (Notion) or document-based (Obsidian)?
- Plain text? Markdown? Rich text?
- Is MOO overhead worth it, or overkill?

---

## Project: Filesystem Service

High-performance file operations. Could be:
- **Standalone**: Direct FS access with watching/indexing
- **On MOO**: Files as objects, directories as containers

### Requirements
- Watch for changes
- Index contents
- Search by name/content
- Virtual FS abstractions?

### Open Questions (FS)
- Scope: Just watching? Or full VFS abstraction?
- Performance: Definitely Rust for the core
- Is MOO overhead worth it here? Probably not?

---

## Naming

Flora uses botanical names. Server candidates:
- **Taproot** - Deep, central storage
- **Tuber** - Underground storage organ
- **Bulb** - Storage + regeneration
- **Corm** - Similar to bulb, underground storage

Or project-specific names (more flowers).

---

## Prior Art

### Lotus (~/git/lotus) - Decomposed
Was a MOO-style monolith. Removed from ecosystem and decomposed into parts.

**Has comprehensive docs** at `~/git/lotus/docs/` - carefully evaluated, insights below.

Decomposed into:
- **pith** - Capability-based interface libraries (fs, sql, http, etc.)
- **spore** - Lua runtime with plugin system
- **reed** - TS → IR → Lua compiler

#### Lotus Vision (4 Pillars)
1. **Deep Simulation** - Entity system, scripting, persistence (MUD/game roots)
2. **AI-Native** - Context injection for LLMs, NPC agency, memory systems
3. **Ubiquitous Access** - Headless, API-first, multi-platform (web, tui, discord)
4. **Knowledge/Productivity** - Graph structure, vector search, programmable workflows

#### Technical Decisions (from rust-port.md)
| Decision | Choice | Why |
|----------|--------|-----|
| Execution | LuaJIT | Tracing JIT, table shape optimization, FFI, 500KB, iOS-compatible |
| Plugins | Dynamic libs | Need full system access; WASM too restrictive |
| Plugin interface | Native Lua C API | No serialization overhead, can return userdata |
| Binary format | Cap'n Proto | Cross-language, zerocopy, schema evolution |
| TS parsing | tree-sitter | Fast, Rust-native, no Node dependency |

**Trust model**: Scripts sandboxed (IR restricted), plugins trusted (installed by admin).

#### Challenges & Mitigations
- **Performance** → JIT compilation
- **Schemaless querying** → Hybrid ECS (structured for hot paths, JSON for flex)
- **AI context costs** → Caching static context, RAG for retrieval
- **Frontend fragmentation** → Headless core, leverage existing ecosystems

#### Capability System Insights
- Unforgeable tokens, not role-based
- Minting (create new), delegation (restricted copy), transfer (change owner)
- Wildcards for admin, scoped params for users
- "Possession proves authorization"

#### Automation Patterns
- Bots = entities + scheduled verbs
- Triggers: `on_enter`, `on_leave`, etc.
- Examples: janitor bot, greeter, kanban column auto-archive

#### Lotus Layering (good)
```
App logic (notes: backlinks, search, linking)
    ↓ built on
Primitives (fs, sql, etc.)
    ↓ provided by
Plugins
```

**The monolith trap** (bad): App logic *had* to be MOO objects → MOO became the only host → monolith.

**Decomposed philosophy**: Keep the layering, remove the host requirement:
```
App logic (host-agnostic library)
    ↓ built on
pith-* (primitives)
    ↓ hosted by
MOO / standalone server / CLI / WASM / whatever
```

The "built up functionality" layer exists independently. Hosts are thin wrappers.

### Reed (~/git/reed)
Language→IR→language compiler. Key insights:
- **Intentionally restricted IR**: No classes, async, metaprogramming
- **Domain ops are function calls**: Runtime (spore) resolves them
- **TypeScript reader, Lua writer**: Best of both worlds
- **S-expr serialization**: Same format as lotus verbs

### LambdaMOO
The original MOO. Single-server, custom language. Still running after 30+ years.

### CouchDB
Document database. HTTP API, JSON documents. Multi-master replication.

### Notion / Roam / Obsidian
Modern notes with linking. Block-based or page-based. Graph structure.

### Plan 9 / 9P
Everything is a file. Network-transparent filesystem. Simple protocol.

---

## Reality Check: Why Doesn't This Exist?

Skeptical question: If "structure for agents" is such a good idea, surely someone's done it?

### Prior Art (it partially exists)

| Problem | Existing solution |
|---------|------------------|
| API specs | [APIs-guru/openapi-directory](https://github.com/APIs-guru/openapi-directory) - 2000+ OpenAPI specs |
| Universal primitives | WASI - already standardized |
| Structured parsing | Tree-sitter - 100+ grammars |
| Code intelligence | LSP - protocol exists |
| Structured notes | Obsidian, Notion, Roam |
| Programmable objects | LambdaMOO - 30+ years old |

### So What's Actually Novel?

Possible answers (guesses, being realistic):

1. **Pieces exist, not unified** - Tree-sitter exists, LSP exists, but "moss" combines them differently. OpenAPI directory exists, but "liana" does codegen. The *composition* might be novel.

2. **"Agent" framing is new** - Pre-LLM, "make things structured for agents" wasn't compelling. Now that AI agents are real, the framing matters more.

3. **Not commercial** - Infrastructure plays, hard to monetize. Big companies don't build this; hobbyists do.

4. **Integration is the hard part** - Making an OpenAPI directory is easy. Making it *actually composable* with code intelligence, format conversion, programmable objects, etc. is the real work.

5. **NIH syndrome** - Everyone builds their own slightly different version. No unified ecosystem.

### Why This Is Hard

1. **Scope creep** - Look at the project list. Each one is ambitious on its own.

2. **Massive LOC** - Moss alone is substantial. Multiply by 14 projects.

3. **Years of work (pre-vibe-coding)** - Before LLM-assisted development, this would be years of solo work with no clear payoff.

4. **No clear commercial usecase** - Hard to pitch "structured interfaces for agents" to investors.

5. **Chicken-and-egg** - Need critical mass of integrations to be useful, but can't get adoption without being useful first.

6. **Moving targets** - APIs change, specs evolve, languages update. Maintenance burden compounds.

### What Makes It Viable Now?

1. **LLM-assisted development** - Can write more code faster. Moss itself helps write moss.

   Concrete examples:

   **Moss** (code intelligence)
   - 90k lines of Rust, 119k total
   - Started: December 17, 2025 → functional in ~1 month
   - Traditional estimate: "23.49 months with 15.47 people"

   **burn-models** (ML inference)
   - 44k lines of Rust (rest is tokenizer vocab)
   - January 5–10, 2026 → functional in **5 days**
   - Traditional estimate: "21.63 months with 13.52 people"

   Pre-LLM, this would be years of solo work. Now it's weeks.

2. **AI agents are real** - The "agent" usecase now has concrete demand (Claude Code, etc.)

3. **Decomposition** - Not one monolith (lotus learned this). Independent pieces that compose.

4. **Personal itch** - Not trying to be a company. Solving own problems.

---

## Next Steps

1. Decide: Start with MOO core, or a concrete use case (notes/fs)?
2. If MOO: Sketch object model, prototype storage
3. If notes/fs: Decide standalone vs on-MOO
4. Pick protocol (probably HTTP/JSON to start)
5. Connect to canopy for UI testing
