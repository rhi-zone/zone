# Flora Servers: Brainstorm

Backend services for the flora ecosystem. UI handled by canopy (~/git/canopy); these are headless servers.

## The Absurd Moonshot

The real, fundamental goal: **subsuming virtually all interaction with a computer.**

- *Of course* it'll never happen
- *Of course* it won't take off
- *Of course* there's tradeoffs
- **But what if? What would it look like?**

This is the "what if?" question carried to its logical extreme. Not "this will win" but "if it did, what would it be?"

Everything else in rhizome is in service of this question:
- Structure for agents → computers understand themselves
- Tags not hierarchies → everything findable
- Interaction graphs → affordances are explicit, not hidden
- Hyper-modularity → compose what you need
- MOO substrate → programmable everything
- Multi-frontend → same model, any interface

It's absurdly ambitious. But the exploration itself is valuable, even if the destination is unreachable.

**Why this conversation exists:**

Infinite things we *can* do. Finite time per week. Also infinite ways to spend too much time doing things wrong.

So it doesn't hurt to sit down and just... plan. Refine. Question assumptions. Backpropagate insights. Figure out what we actually care about before building the wrong thing.

This document is that: thinking before doing. Not because doing is bad, but because doing *the wrong thing* is expensive.

**But also: some things exist just because they're neat.**

Example: resin (procgen primitives).
- Has a bit of everything: textures, audio, meshes, noise, etc.
- Intended to be living/comprehensive
- First-class WGSL/GLSL compilation
- Fully serializable graphs
- Extensibility first-class

Do I plan to use it? Not really - averse to gamedev, ideas require too much investment to validate. But resin is *neat*. It's neat to have all these primitives in one place, properly designed.

Not everything needs immediate personal utility. Sometimes "this should exist, so I'll make it exist" is enough.

**Multiple motivations at once:**

| Motivation | Example |
|-----------|---------|
| Scratch own itch | MOO - want inventory in Tavern cards |
| Should exist | resin - procgen primitives should be comprehensive |
| Spun out of need | burn-models - conceptualized for lotus image-gen plugin |
| What if? | The whole ecosystem - what if we could subsume all interaction? |

Things don't have single reasons. burn-models was practical (need image gen), but learning happened along the way. The motivations stack.

**Projects spin out of projects:**

```
rhizome (ecosystem)
└→ cambium (format→format, neat to have even if not strictly needed)
   └→ rescribe (like pandoc - but pandoc isn't perfect, missing binary = failure mode)
      └→ ooxml (where is Rust's ooxml support?!)
```

Each step is: "wait, we need X for Y, and X doesn't exist / has problems."

Why not pandoc? Opus 4.5 pointed out it's not perfect. Also: missing a binary is a failure mode. Dependencies you don't control can break.

Why ooxml? Because it doesn't exist in Rust. Genuine gap.

And while building ooxml, invented *more* work:
- Language-agnostic fixtures
- Machine-readable specs for OOXML
- Because MS Office has enjoyed its dominance for too long
- Making OOXML easier to implement helps everyone, not just Rust

This is "scope creep that's actually good" - while solving immediate problem, notice meta-problem that would help the whole ecosystem.

**Reality check though:**
- OOXML is a 5,000+ *page* spec
- Look at how stc (TypeScript typechecker by dudykr) went - "only" ~30k lines, still massive
- Even with LLM support, actually finishing? Good luck. Your bank account is already crying.
- Some things are just too big.

But: partial solutions have value. "Can read/write basic docx" beats "nothing exists." The machine-readable specs might help someone else finish what you can't.

**What's actually wanted:**

Velocity is cool, but at the end of the day: **want to finally just *have* something usable.**

Favorite projects are ones where you can go: "take this, and this, and this, voila - it works!"

Example: `~/git/lua/cli/` (public: github.com/pterror/lua)
- Some are placeholders for things I'd really like
- But most: composed in less than a day from other parts of the repo itself
- Small pieces that combine into working tools

Sample of what's there:
```
cloc.lua (7k)      - count lines of code
dns_lookup.lua     - DNS queries
find.lua, grep.lua - file search
fs_watch.lua       - file watching
http_static.lua    - static file server
lua2js.lua         - transpiler
mud_client.lua     - MUD client (!)
repl.lua, replx.lua - REPL tools
serve*.lua         - various servers
```

Actual line counts:
```
6 lines    args.lua
12 lines   grep.lua
18 lines   mud_client.lua
34 lines   find.lua
57 lines   http_static.lua
```

Most are **under 100 lines**. Many under 20. This is the power of good composition - when you have solid libraries, useful tools are tiny.

The underlying libraries are also small:
```
~/git/lua/lib/http/
  client.lua     17 lines
  server.lua     33 lines
  serverx.lua    67 lines
  format.lua    133 lines
  status.lua    146 lines (HTTP status codes)
  ─────────────────────────
  Total:        442 lines for entire HTTP library
```

Which builds on luajitsocket (~1k lines) for platform-agnostic sockets. But that's amortized over every protocol that uses sockets.

**Fractal composition:** each layer is small, they compose together.

Cursed but illustrative example: `~/git/lua/example/http_chatx.lua` (197 lines)
- Full-stack chat app
- Server HTML/CSS via Lua DSL
- Client-side Lua that **compiles to JavaScript**
- WebSocket server, file drag-drop, MIME detection
- One language, both sides, under 200 lines

This is what's possible when composition is good enough.

**The goal isn't impressive LOC counts.** If anything, lower is better - more understandable, better separation.

But: don't split until you need to read N files to understand a single subsystem. There's a balance. The goal is **things to reach for and combine**, not minimum LOC for its own sake.

**More thinking: are existing tradeoffs the right ones?**

Lots of software makes tradeoffs. Some do things well (Procreate). But in general:

| Pain point | Why? |
|-----------|------|
| Multi-app workflows | Use X then Y then Z for one task. Why not integrated? |
| Twine, RPG Maker, Renpy | Authoring tools that kinda suck |
| Settings sprawl | MS Word, SillyTavern - dialog after dialog after dialog |
| Notion dying on 100 rows | Ctrl+C 100 rows → freeze. It's just data! |
| Notes ≠ todos ≠ calendar | Why are they different apps? (Notion tried, kinda worked?) |
| Excel formulas vs visual | Text formulas vs pillboxes + dropdowns - which is right? |

These are all "accepted" tradeoffs that maybe shouldn't be accepted.

The question isn't "can we make software" - it's "can we make software that doesn't make these tradeoffs?" Or at least makes *different* ones.

(Note: Notion "kinda worked" at unifying notes/todos/databases because it treats them as the same thing - blocks with properties. Sound familiar? `{ id } & Record<string, unknown>`)

**Excel formulas: a case study in tradeoffs**
- They "work" - for power users
- But: documentation is all over the place
- But: so many functions, how do you find the right one?
- But: is it discoverable? (No)
- But: who has the time/ability to become an Excel power user?
- But: **has anyone tried hunting for bracket mismatches in Excel?**

The formula bar is a single-line text box. No syntax highlighting. No bracket matching. Error messages are cryptic. And this is the world's most-used programming environment.

The tradeoff was "text is universal" but the cost is "text is hostile to non-programmers (and even programmers)."

**Excel goes deeper:**
- Freeform grid. Why? Now tables can be *anywhere*.
- "Why is the table here and not there?"
- Dollar sign syntax for absolute references (`$A$1`). Two different syntaxes.
  - (Not even counting R1C1 notation - who even uses that?)
- Cells can have **rich text** - technically - but good luck editing it in the formula bar
  - Conventional method: type → apply formatting → remember what you did → type next section → apply different formatting → repeat
  - A careful dance for something that should be trivial
  - (Arguably some people *like* the complexity - job security for the office Excel wizard)
- People build Cthulhu-like spreads of references for tracking things Excel was never made for.
- Sticky headers help, but then there's another table floating to the right...
- "It should be in its own sheet" but:
  - Who has mental capacity to keep 5 sheet names + contents in mind?
  - Tab bar is **horizontal** - bye bye that other sheet you needed
  - Navigating sheets is janky

Freeform seemed like flexibility. It created chaos. Sheets seemed like organization. The UI makes them impossible to navigate.

What if: tables were first-class, not cell ranges? What if: sheets had real navigation, not a tiny horizontal tab bar?

This is what the minimal entity substrate enables:
- Small pieces (just `{ id } & Record<string, unknown>`)
- Conventions (property names everyone understands)
- Views (interpret conventions into useful interfaces)
- Compose in a day, not a month

---

## Backpropagating Insights

Now to ML the frick out of this and apply insights to actual architecture.

### Is the ecosystem architecture still valid?

Given everything above (structure, tags, hyper-modularity, fractal decomposition), does the current rhizome split make sense?

Current decomposition:
- **pith** - interfaces/stdlib
- **spore** - Lua runtime
- **reed** - TS → IR → Lua
- **moss** - code intelligence
- **flora** - apps (this repo)
- etc.

**What's good:**
- Clear separation of concerns
- Each piece usable independently
- Fractal structure (same pattern inside each)

**What might need rethinking:**
- Is the boundary between pith and spore right?
- Does reed belong as separate, or should it be part of spore?
- Where does MOO fit? Is it flora (app) or something more fundamental?

### Is MOO what we actually want?

Honest question: is MOO the right model, or just the "easy path" because LambdaMOO exists?

**Arguments for MOO:**
- Proven model (30+ years)
- Simple substrate (entities, props, verbs)
- Already understood how it works
- Programmable by design

**Arguments against / for questioning:**
- Are we just copying homework?
- Is "objects with verbs" the right primitive?
- Does the room/containment model make sense for everything?
- Is there something simpler or more general?

**Alternative primitives to consider:**
| Primitive | What it is | Pros | Cons |
|-----------|-----------|------|------|
| Entities + props + verbs (MOO) | Objects with methods | Proven, intuitive | Room metaphor forced? |
| Entities + relations (graph) | Nodes and edges | More flexible | Less intuitive? |
| Facts + rules (datalog) | Logic programming | Very queryable | Steep learning curve |
| Documents + links (wiki) | Pages with references | Simple | Limited programmability |
| Capabilities + resources | Tokens that grant access | Secure by design | Abstract |

Maybe MOO is right. Maybe we should prototype alternatives. **The time to question is now, before we've built it.**

### Why is there a distinction between notes, fs, objects?

This is the real question. If we have:
- Objects with properties and verbs
- Tags instead of hierarchies
- Everything queryable

Then what IS the difference between:
- A "note" (text content, tags, links)
- A "file" (binary content, path, metadata)
- An "object" (properties, verbs, containment)

**They're all just entities with different properties.**

| "Type" | What it actually is |
|--------|-------------------|
| Note | Entity with `content: text`, `tags: [...]` |
| File | Entity with `content: blob`, `path: string` (legacy compat) |
| Object | Entity with `verbs: [...]`, `location: entity_id` |
| Room | Entity with `contents: [entity_id, ...]` |
| Player | Entity with `inventory: [...]`, `location: entity_id` |

**The distinction is artificial.** A note IS an object. A file IS an object. The "types" are just different property shapes.

**Implication:** Maybe we don't need "Notes app" and "FS app" and "MOO". We need:
1. Entity substrate (things with properties)
2. Standard property shapes (note-like, file-like, room-like)
3. Views that understand those shapes (notes view, file browser view, world view)

The views are projections. The substrate is one thing.

```
┌─────────────────────────────────────────────┐
│           Entity Substrate                   │
│  (id, properties, tags, verbs, relations)   │
└─────────────────────────────────────────────┘
         ↑            ↑            ↑
    ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
    │  Notes  │  │   FS    │  │  World  │
    │  View   │  │  View   │  │  View   │
    └─────────┘  └─────────┘  └─────────┘
```

**This is simpler.** One substrate, multiple views. Not three apps pretending to be different things.

### The Maximally Minimal Entity

```typescript
Entity = { id: unique } & Record<string, unknown>
```

That's it. An entity is just an ID plus arbitrary key-value pairs.

- Tags? `{ id, tags: ["foo", "bar"] }`
- Verbs? `{ id, verbs: { look: "..." } }`
- Relations? `{ id, parent: other_id, children: [...] }`
- Note content? `{ id, content: "..." }`
- File data? `{ id, blob: binary, path: "/..." }`

Everything is just properties. The "schema" is conventions about property names. Views interpret conventions.

**Is this too minimal?** Maybe. You might want:
- Indexed properties (for fast queries)
- Reserved properties (id, created_at, updated_at)
- Type hints (for validation)

But: **start minimal, add structure only when needed.**

This is simpler than MOO. MOO has opinions about rooms, containment, verbs. This has no opinions. It's just... things with properties.

**Note:** Lotus originally had a MOO-like entity interface. Then it got gradually picked apart. This isn't theoretical - it's learned from iteration. The "why are these separate concepts" question came from actually building MOO-like structures and realizing the distinctions were artificial.

(Clarification: MOO as prior art/inspiration was the original idea. But the specific MOO-like *property structure* was what Gemini suggested. Had to iterate back to simplicity. Even AI can over-engineer when interpreting inspiration.)

**Key insight: extra required properties are limitations, not features.**

Every required field constrains what entities can be. `{ id, parent, children, verbs }` means everything MUST have parent/children/verbs. But what if something doesn't have a parent? What if it's not programmable?

`{ id } & Record<string, unknown>` has no constraints. Anything can be anything. Add structure through conventions, not requirements.

### Why doesn't this exist already?

One reason: **we don't have common conventions**.

"But we have JSON!" Yes, JSON is the *format*. But:
- Is it `name` or `title`?
- Is it `description` or `desc` or `summary`?
- Is it `tags` or `labels` or `categories`?
- Is it `parent` or `parent_id` or `parentId`?
- Is it `created_at` or `createdAt` or `created` or `timestamp`?

Everyone invents their own property names. Every app, every API, every database. JSON solved the syntax, not the semantics.

HTTP existed before REST conventions. JSON exists without property conventions.

**Maybe what's needed isn't a new format, but conventions:**
- schema.org tried this (for SEO mostly)
- JSON-LD tried this (linked data)
- ActivityPub has conventions (for federation)

None became universal for "entities in general." The convention problem is unsolved.

**But: these are valuable prior art!** They represent years of iteration from many people (and yes, some bureaucracy). Don't reinvent from scratch - learn from what they figured out:
- schema.org: rich vocabulary for describing things
- JSON-LD: linking/context mechanisms
- ActivityPub: conventions for actors, activities, objects

Maybe rhizome conventions should borrow heavily rather than invent.

---

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

This is a **known problem**. Smaller models especially struggle tracking outfit, pose, location.

Existing partial solutions:
| Solution | What it does | What it lacks |
|----------|-------------|---------------|
| Lorebooks (ccv2) | Static knowledge injection | No state, no logic |
| SillyTavern extended lorebooks | Injection at arbitrary points | Still no logic, no persistence |
| Exotic plugin combos | Hacky state tracking | Fragile, not composable |

The gap: **programmable logic + persistence + structured state**. Can't do inventories. Can't "select 2 things from bag" without exotic plugin combinations.

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

**Key insight**: LambdaMOO is simple, arguably trivial, *because* it's fully programmable.
- The implementation is just the substrate (entities, props, verbs, persistence)
- The entire "game" is the LambdaMOO "core" - user-space code
- Same philosophy as Lisp/Smalltalk: minimal substrate, everything built on top
- The "complexity" lives in user-space, not the implementation

**Implication for our MOO**:
- Don't bake features into the core
- Build the substrate: entities, props, verbs, persistence, capabilities
- Let user-written code (or a "core" db) define the actual application
- Notes, FS, inventory, roleplay - all user-space, not implementation features

### CouchDB
Document database. HTTP API, JSON documents. Multi-master replication.

### Notion / Roam / Obsidian
Modern notes with linking. Block-based or page-based. Graph structure.

### Plan 9 / 9P
Everything is a file. Network-transparent filesystem. Simple protocol.

### Things That Dared To Be Different

Prior art not because they're all good or relevant, but because they tried something other than the mainstream.

| System | What's Different | Status |
|--------|-----------------|--------|
| **Plan 9** | Everything is a file, network-transparent FS, simple protocol | Influential but niche |
| **Oberon** | Tiled text UI, no hidden state, everything visible | Academic, preserved |
| **Smalltalk/Pharo** | Live object system, image-based, everything is an object | Active (Pharo), influential |
| **Arcan** (letoram) | Rethinking display server from scratch, scriptable compositor | Active, ambitious |
| **Uxn/Varvara** (100 Rabbits) | Minimal VM, personal computing, off-grid capable | Active, intentionally constrained |
| **Lisp Machines** | Hardware + OS built around one paradigm | Dead, influential |
| **HyperCard** | Anyone can build interactive things, low floor | Dead, mourned |

Common threads:
- **Coherence**: One paradigm carried through (files, objects, text, images)
- **Simplicity**: Fewer concepts, more orthogonal
- **Introspection**: System can examine/modify itself
- **Different tradeoffs**: Sacrificed mainstream compatibility for internal consistency

Why they didn't win:
- Network effects (everyone else uses X)
- Ecosystem (where are the apps?)
- "Good enough" incumbents
- Sometimes: genuinely worse at common tasks

But: they proved *alternatives exist*. The current way isn't the only way.

### Where Did HyperCard Go?

HyperCard (1987) - **39 years ago**. "Anyone can make interactive things."

It worked. Regular people made things. Then Apple killed it.

And in 39 years, where did its paradigm go? **Nowhere.**

| Attempt | What it is | Why it's not HyperCard |
|---------|-----------|----------------------|
| Flash | Multimedia authoring | Dead, was proprietary, web-only |
| Scratch | Visual programming for kids | "For kids" - ceiling too low |
| **Snap!** | Scratch + macros, first-class functions | Actually good! High ceiling. But niche, academic |
| PowerPoint | Slides with interactions | Seriously? |
| No-code tools | Bubble, Webflow, etc. | Vendor-locked, web-only, limited |
| Notion | Blocks + databases | Closer, but not programmable |
| Excel | Everyone's accidental programming | Not interactive artifacts |

We've had **39 years** to reinvent it. To stand on shoulders of giants. To make something *better*.

Instead: professional developers vs everyone else. The gap widened, not narrowed.

**Why?**
- Apple killed it (business reasons)
- Web won, but web is for *consuming* not *creating*
  - The early web was for creating! GeoCities, personal pages, view source → learn
  - Where did it go? Platforms ate it. Now you post *on* Facebook, not *on your site*
- "Real programming" gatekeeping?
- No financial incentive (users as creators don't pay subscription fees?)
- Complexity creep (modern apps are too complex to build simply?)

**The adoption cliff**:
Maybe the reason things don't take off is brutal economics:
- You need to be **nigh-impossibly better** to overcome switching costs
- OR you need **corporation-level funding** for distribution/marketing
- "Slightly better" or even "significantly better" isn't enough
- Network effects protect incumbents
- "Good enough" wins over "great but different"

This is depressing but probably true. Rhizome doesn't have corporation funding. So: either be impossibly better, or don't compete head-on?

**But wait - things that DID take off without corp funding:**

| Project | Creator(s) | Why it worked |
|---------|-----------|---------------|
| Linux | Torvalds | Free Unix for PC, ideological momentum, filled real gap |
| Git | Torvalds | Scratched own itch (kernel dev), became essential |
| QEMU/TCC | Bellard | Single genius, infrastructure niches |
| FFmpeg | Bellard + community | Everyone needs media handling, became indispensable |
| LuaJIT | Mike Pall | Single genius, insane performance, filled real need |

Common threads:
- **Infrastructure, not end-user apps** - They enable other things
- **Filled genuine gaps** - Not "slightly better", but "this didn't exist / was unaffordable"
- **Became dependencies** - Hard to NOT use them once established
- **Scratched own itch** - Built for themselves first
- **Single genius or tiny team** - Not committees
- **Technically extraordinary** - Not just good, but "how did one person do this?"

Maybe the pattern: **build infrastructure that becomes indispensable**, not apps that compete for users.

**Question: "It's 2026, why don't tons of things exist yet?"**

Hypothesis: How many people could actually pull a Bellard, Pall, Torvalds, Gerganov?

- Before LLMs: vanishingly small pool of "single genius" builders
- These people are rare, busy, or working on other things
- Even *with* LLMs: how many can really build ambitious infrastructure?
- Gerganov (ggml, llama.cpp) is recent - proves it's still possible
- But the list of people who *can* is still very short
- Maybe things don't exist because the people who could build them are occupied elsewhere

This isn't defeatist - it's realistic. The question isn't "why hasn't someone built X" but "who specifically would have built X, and why didn't they?"

**Maybe: human insight + LLM volume = ambitious things without singular genius?**

Or maybe that's cope. Time will tell.

**Honest self-assessment:**
- Not a novice programmer, but not deeply experienced in any one domain
- Contrarian exploration = broad exposure, shallow depth in many areas
- No time/motivation to go deep everywhere - so what to focus on?
- Don't believe in "talent" - but experience? Absolutely limited.
- burn-models: vibe coded, don't actually know NN architectures
- resin: vibe coded, don't know blender/houdini/demoscene/procgen
- lotus: built on the backs of SO many failed prototypes
  - Some weren't even failures - just didn't match the vision

The pattern: **LLM-assisted lets you explore domains you don't have deep expertise in**. You bring the vision + general programming sense, LLM brings domain knowledge at a basic level. Iterate until it works.

Whether this produces *good* code or just *working* code is an open question.

**On "LLMs are just text predictors":**

Common dismissal: "I'm so smart, I learned LLMs are 'just' text predictors, they can't make anything new."

Okay but... moss exists. 90k lines. It works.

"They're just reproducing if-statements they've seen before." Sure. But:
- Humans also don't create from nothing - we remix prior knowledge
- "New" is novel *combinations*, not ex nihilo creation
- Evolution is "just" random mutation + selection - yet here we are
- The "just" is doing a lot of heavy lifting in that dismissal

What matters: **does the thing work?** Not "is it philosophically novel?"

The dismissive framing mistakes *mechanism* for *capability*. Yes, it's "just" predicting tokens. And brains are "just" neurons firing. So what?

**Holding both things at once:**
- Yes, LLMs have real limitations (no persistent learning, debatable agency, hallucinations)
- AND: this entire ecosystem exists. moss, burn-models, lotus, all of it.
- That's not a trivial result.
- Limitations don't erase outputs. Outputs don't erase limitations.
- The honest position: "limited but useful" not "magic" or "useless"
- (Also: "limited but useful" describes lots of people too)

**Underrated LLM strengths:**
- Will Just Write Tests (people say "good tests are hard" then don't write them)
- Will do tedious refactoring without complaining
- Ecosystem knowledge - knows about libraries, APIs, conventions you'd have to learn
- Available at 3am when you have an idea

**LLMs DO cut corners though:**
- "I'll batch the rest..." (no you won't, do all 98 grammars)
- Placeholder code, TODO comments, "similar for the rest"
- Requires pushing to actually complete tedious work
- Different laziness, but still laziness

**But:** the same is true for "naturally programmed" codebases. Arguably even *more* true:
- Tech debt accumulates over time
- "The way we've always done it" calcifies
- Humans make the same mistakes repeatedly
- Organic growth → inconsistent architecture
- LLM-assisted might actually avoid some tech debt by not knowing the baggage
- Rapid iteration + no consumers = "just refactor without deprecation"
- No API stability guarantees yet = freedom to get it right

The bar isn't "is this perfect?" - it's "is this better than the alternative?"

**Where is MOO's equivalent today?**

LambdaMOO, ChatMUD - they exist, they're neat. But:
- Text-based is a high barrier
- Even for "okayish programmers" it's manageable, but for everyone else?
- Where's the modern equivalent?

| Platform | Programmable? | Shared worlds? | Barrier |
|----------|--------------|----------------|---------|
| LambdaMOO | Yes (verbs) | Yes | High (text, programming) |
| Roblox | Yes (Lua) | Yes | Medium (visual, but still code) |
| Minecraft | Kinda (redstone, mods) | Yes | Low base, high for creation |
| VRChat | Yes (Unity/Udon) | Yes | High (Unity knowledge) |
| Second Life | Yes (LSL) | Yes | Medium-high |
| **Resonite** | Yes (ProtoFlux) | Yes | Medium (visual programming, in-world) |
| Rec Room | Limited | Yes | Low |

Roblox is maybe the closest to "programmable shared worlds for everyone" - and it's massive. But:
- Game-focused (not general purpose)
- Corporate, proprietary
- Kid-oriented aesthetic
- You're building *on* their platform, not *with* general tools

**Is there interest?** Roblox proves yes. TikTok proves people want to *create* (short-form, but still). The interest exists.

**What's missing**: Open, general-purpose, low-barrier programmable object system. MOO philosophy + modern accessibility + not corporate-owned.

Is that what lotus/MOO-in-flora should be?

**Can LLMs be the accessibility bridge?**

The dream:
```
User → "I want a chest that only I can open"
       ↓
LLM → generates verb, explains what it did
       ↓
User → tweaks if needed
       ↓
Working thing
```

**But: is this a bandaid?**

Honest concern. Reed exists partly for this - write TS (familiar), compile to Lua (runtime). But:
- Hiding complexity ≠ removing complexity
- LLM generates wrong code sometimes → debugging something you didn't write
- Dependent on external services (API costs, availability)
- "Describe what you want" works until it doesn't, then you're stuck
- Doesn't solve fundamental complexity, just masks it

Counter-arguments:
- Even bandaids are useful (people ship with bandaids all the time)
- LLM + human review > human alone for many tasks
- Maybe masking complexity IS solving it for 80% of cases

**Hot take: maybe the alternative IS "hope people learn to code"?**
- Programming literacy could be like reading/writing literacy
- Instead of dumbing down tools, improve education
- Raise the floor of human capability, not lower the ceiling of tools
- "People can't learn" is a cop-out - people learn hard things all the time
- The problem might be teaching, not learning capacity

**Hotter take: every programming language sucks. All of them.**
- Not "teaching is bad" - the *languages themselves* are bad
- Every language is a pile of tradeoffs and historical accidents
- Syntax errors, type errors, null pointers, async hell, dependency hell
- Even "good" languages have foot-guns and gotchas
- We've been doing this for 70 years and it still sucks
- Maybe programming is just *hard* and we haven't found the right abstractions yet
- Or maybe text-as-code is fundamentally limited (see: reed's "no syntax errors" philosophy)
  - But: visual/structure editors have existed forever. They haven't "won" either.

**Essential vs accidental complexity:**
- Some complexity is inherent to the problem domain (essential)
- Some is caused by bad tools/languages (accidental)
- Fred Brooks' "No Silver Bullet" (1986) - still relevant 40 years later

**Counterpoint: abstraction (potentially recursive)**
- You can't eliminate essential complexity, but you can *layer* it
- Build abstractions, hide details behind interfaces
- Work at the right level for the task
- Yes, abstraction is limited. But everything is a tradeoff.
- The question: what are the *right* abstractions? We clearly haven't found them yet.

**Maybe there is no single "right" abstraction:**
- Different problems want different abstractions
- The meta-skill is knowing which abstraction fits which problem
- So: tools that let you work with *multiple* abstractions, not tools that force one paradigm

**This is why hyper-modularity matters. See: Bevy's mindset.**
- Everything is a plugin
- ECS as composable substrate
- "Bring your own" for most features
- Pick the pieces you need, leave the rest
- Rhizome's decomposition (pith, spore, reed, etc.) aims for this too
- MOO's "substrate only, user-space everything else" is the same idea

**Fractal modularity: the pattern repeats at every level**
- Rhizome ecosystem: pith, spore, reed, moss, etc. - pick what you need
- Each monorepo: same structure internally (core + modules)
- Each module: small, focused, composable
- It's turtles all the way down

**Unresolved**: Is there a way to make programmable systems *actually* simple, not just LLM-assisted? Or is complexity irreducible and the best we can do is better interfaces to it?

**Other experiments in "making programming easier":**

| Project | Approach | Status |
|---------|----------|--------|
| **Hazel** | Typed holes, structure editing, live programming | Research, active |
| **Synquid** | Synthesis from refinement types (write types → code generated) | Research |
| **Sketch** | Program synthesis from specs | Research |
| **Codeium/Copilot** | LLM autocomplete | Commercial, widespread |
| **Snap!/Scratch** | Visual blocks | Educational |

So many experiments. Some research, some commercial. None has "won" for general-purpose accessible programming. The search continues.

**This is a failure.** Not a technical impossibility. A collective failure of imagination or will.

Is this something rhizome should care about? "Anyone can make interactive things" as a goal?

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

   **Caveats** (being honest):
   - burn-models is mostly untested - "functional" is generous
   - moss works, but value proposition for humans is unclear ("who needs a dedicated outline tool?")
   - LOC ≠ quality, velocity ≠ correctness
   - LLM-assisted code still needs human review, testing, iteration

   The point isn't "this code is perfect" - it's "this code *exists* and can be iterated on."

   **Counter-caveats**:
   - Human-written code has the same issues (untested, needs iteration)
   - "You're one of *those*" / AI hype skepticism is valid, but so is pragmatism
   - Environmental impact is real, but compare with the environmental impact of a human doing the same work over months/years

2. **AI agents are real** - The "agent" usecase now has concrete demand (Claude Code, etc.)

3. **Decomposition** - Not one monolith (lotus learned this). Independent pieces that compose.

4. **Personal itch** - Not trying to be a company. Solving own problems.

5. **Why do this at all?**
   - Because I can. The barrier is low enough now.
   - The alternative is N failed prototypes over years of free time.
   - Frontier LLMs have absurd generalist + limited specialist knowledge.
   - They're complementary to humans, not replacements - good at different things.

### More Pragmatism

**What do I really want out of this?**

Value proposition by bucket:

| Bucket | Projects | Value for Humans | Value for AI Agents |
|--------|----------|-----------------|---------------------|
| Code understanding | moss, reed, liana | Don't read everything, query structure | Same, but with token limits |
| Format/data wrangling | cambium, reed | Don't hunt for converters | Reliable transformations |
| Creative/procedural | resin, dew, frond | Composable media generation | Could generate assets |
| Runtime/execution | spore, pith | Unified runtime, universal interfaces | Stable execution environment |
| Worlds/persistence | lotus, hypha | Persistent state, programmable | Context injection, not chat logs |
| UI/control | canopy | Universal client for anything | Could be controlled structurally |
| Preservation | siphon | Save dying software | Extract structure from legacy |
| Scaffolding | nursery, flora | Bootstrap projects fast | Consistent project structure |

**What haven't we thought of?**

1. **Composition effects** - What happens when moss + spore + canopy combine? Or liana + cambium + reed?

2. **Template for LLM-era development** - The ecosystem itself demonstrates "how to build ambitious things with AI assistance"

3. **Education/teaching** - Structured code intelligence could help people learn codebases

4. **The meta-play** - Building tools that help build tools. moss helps build moss.

**Core value - what do I actually care about?**

Honest answers (partial, can't think of everything at once):

1. **I like making general frameworks** - I'm terrible at making anything specific. The general-purpose thing is genuinely appealing, not just cope.

2. **Lotus/MOO**: SillyTavern sucks. I've wanted inventory management since the AI Dungeon days—literally years ago. On paper it's a trivial, basic feature. In practice, no one's built it properly because chat apps treat world state as an afterthought.

3. **Notes**: I don't use note-taking apps. Why? Laziness + unclear value.
   - It's *effort* to reach over to a note-taking app
   - What do they offer? Structure? What's the right structure?
   - I have a 'notes' DM in Discord (others have notes servers). Mostly ephemeral stuff.
   - **The real problem**: If I have a video/website/TV series on the tip of my tongue, how do I find it? I can't. The memory exists but there's no retrieval path.

4. **FS**: I don't use a file browser. What's the value over terminal? Is there even one?
   - Folders suck for organization
   - How do you find things in `homework/math1001/month/day/whatever`?
   - Hierarchies are arbitrary and break down

5. **NNs are flawed approximators**: They're excellent at approximation but WHY are we encoding world knowledge as opaque weights that cost time to train?
   - In what world will "skibidi rizz" be useful for reasoning?
   - World knowledge should be *structured and queryable*, not baked into weights
   - This is the "Structure for Agents" thesis: don't make agents interpret, give them structure

**Synthesis**:
- The common thread is **retrieval and structure**
- Notes problem = can't retrieve fuzzy memories
- FS problem = can't navigate arbitrary hierarchies
- MOO problem = can't inject world state into chat
- NN skepticism = world knowledge shouldn't be opaque

Maybe the core value is: **make things findable and structured so you don't have to hold everything in your head**

**Tags, not hierarchies**:
- Manual tagging is fine. LLM/embedding-assisted doesn't hurt either.
- The key insight: **tags should be first-class**, not an afterthought
- Even Obsidian/Dendron have hierarchies baked in. Filesystems are innately hierarchical.
- That's fundamentally the wrong mental model for how things relate
- Hierarchies force single-parent relationships. Tags allow many-to-many.

**Thinking style**:
- Contrarian not to be different, but because "what if?" is interesting
- NIH not because "I can do better", but to avoid "let's just use this because everyone does"
- Also: NIH to understand things deeply (you learn by building)
- This explains the ecosystem scope: not hubris, but exploration

**Interaction paradigms have stagnated**:
- WIMP (Windows, Icons, Menus, Pointer) - Xerox PARC 1970s, Mac 1984
- 50+ years of the same paradigm. Is it flawless?
- Problems: discoverability (menu hunting), mouse dependency (RSI, accessibility), window management (still unsolved), file dialogs (universally hated), deep hierarchies, modality confusion
- Touch/voice/VR emerged but WIMP still dominates desktop
- We're still doing "rectangles on screen, click on things"

**It's not the UI, it's the interaction graph**:
- Lotus was frontend-agnostic: web, Discord, TUI, CLI
- Same model, different projections
- The question isn't "what pixels" but "what's the shape of the affordances"
  - When can you act?
  - Where are actions available?
  - What actions exist?
  - How do you discover them?
  - How do they compose?

Different frontends, same interaction graph:
| Frontend | Projection of affordances |
|----------|--------------------------|
| Web | Buttons, forms, clicks |
| Discord | Threads, reactions, slash commands |
| TUI | Keys, modes, status lines |
| CLI | Commands, flags, pipes |
| MOO/text | Verbs, objects, natural language |

The "paradigm" is the graph, not the rendering. WIMP is one graph shape (hierarchical menus, modal dialogs). MOO is another (objects with verbs, contextual commands).

**Implication**: Canopy isn't "the UI" - it's *a* projection. The interaction graph lives in the backend (MOO verbs, entity affordances). Frontends just render it.

**Reality check: what do common tasks look like today?**

Trying to avoid bias - some things are easy:
| Task | Experience |
|------|------------|
| Open browser | Fine |
| Watch video | Fine |
| Send message | Fine (if app already set up) |

But then...
| Task | Experience |
|------|------------|
| Install software (Windows) | Store? .exe? .msi? Admin prompt? Where'd it go? |
| Find file you saved "somewhere" | Good luck |
| Change default app | Settings → Apps → Default apps → scroll → hope |
| Connect printer | Prayer-based computing |
| Uninstall cleanly | Registry ghosts forever |
| Transfer files between devices | AirDrop (Apple) / ??? (everyone else) |
| Set up new device | Hours of "just one more thing" |
| Manage notifications | Per-app, per-site, per-OS, good luck |
| Back up data | Do you? Really? |

50 years of WIMP and "install software" is still a mess. The interaction graph is implicit, inconsistent, varies by app, varies by OS. No wonder people just use web apps for everything.

**Counterpoints**:
- Web apps' advantage: barrier to entry. No install, just visit URL. That's real value.
- Nix + comma (nix-shell wrapper) *can* partly ease installation on Linux
  - `comma ripgrep` just works, no "install" step
  - Declarative, reproducible, no system pollution
  - But: learning curve, not mainstream

The web won partly because "installing things" is broken. Fix installation and the equation changes.

**The "app for everything" problem**:
- So many windows, so many apps
- Want to upscale an image? Install Upscayl.
- Want to convert a video? Install Handbrake.
- Want to edit a PDF? Install... something?
- Each task = find app, install app, learn app, context switch

Compare with Unix pipes: `cat file | transform | output`
- Operations compose
- No separate "app" per operation
- But: CLI learning curve, not discoverable

The dream: operations as composable verbs, not siloed apps. (This is partly what cambium is about - pipelines, not apps.)

**But**: web apps still use WIMP-esque paradigms. The web solved *deployment*, not *interaction design*.
- Same buttons, forms, menus - just in a browser
- Still implicit interaction graph
- Still varies by app
- Still not queryable or composable

Nothing stops us from making web apps with better interaction models. The transport is orthogonal to the paradigm.

**Case studies in "learning curve"**:

| App | Power | Problem |
|-----|-------|---------|
| vim | Extremely powerful | "Learning curve" (but: once learned, very fast) |
| blender | Industry-grade 3D | "Learning curve" (modal, dense UI) |
| krita/gimp/photoshop | Professional tools | "Learning curve" (toolbox overload) |
| SillyTavern | Feature-rich | Architectural mess: no SQL (everything is files), each card is a PNG, each chat is JSONL, search takes 15s to load taglist on 5GB/s NVMe |

The pattern: power requires learning, but also: maybe the interaction model itself creates unnecessary friction?

**Maybe it's unsolvable. But:**
- That won't stop us from trying
- At minimum we can *diagnose* - if it's unsolvable, understand *why*
- Negative results are still results
- "This is hard because X" is valuable knowledge

**Command palettes: a partial solution that exists**:
- Wonderful invention, frustratingly slow adoption
- Makes the interaction graph *queryable* (fuzzy search what you want)
- VSCode: can bind to commands *arbitrarily* - commands are first-class!
- Not perfect, but way better than menu hunting

Why this matters:
- Commands exist as data, not just UI elements
- You can search them (discoverability)
- You can bind them (programmability)
- You can script them (composability)

This is the interaction graph becoming explicit. WIMP hides commands in menus. Command palettes surface them.

**What's missing from command palettes?**
- Still app-specific (each app has its own palette)
- No cross-app composition
- No persistent state (can't "save this sequence of commands")
- No context-awareness (same commands everywhere, not object-dependent)

**MOO verbs as "command palettes taken further"?**

| Feature | Command Palette | MOO Verbs |
|---------|----------------|-----------|
| Queryable | Yes (fuzzy search) | Yes (`examine object`) |
| Bindable | Yes (keybindings) | Possible |
| Scriptable | Limited | Yes (verbs are code) |
| Context-aware | No (global list) | Yes (verbs on objects) |
| Cross-app | No | Yes (same MOO everywhere) |
| Persistent | Yes (verbs saved in DB) |

**But: MOO isn't the only way. Tradeoffs:**
- MOO requires buying into the object model (everything is an entity)
- Learning curve to write verbs
- Single-server traditionally (distribution is hard)
- *Traditional* MOO is text-centric (GUIs bolted on)
- "Everything is an object" can be forced/awkward for some domains

**Note**: Lotus wasn't text-centric! It was **structure/object-centric** precisely because:
- Multi-frontend from the start (web, discord, tui, cli)
- Different frontends want to expose detail *gradually*
- Web especially needs structured data to render progressively
- Text is one projection; structure is the source of truth

**Tangent (but related)**: Reed has no text representation. Why?
- Invalid syntax is a *failure mode that doesn't need to exist*
- If you work with structure directly, there's no "parse error"
- Text-based languages: string → parse → AST → compile
- Structure-first: AST is the artifact, text is optional projection
- (Everything is a tradeoff - text is human-writable, debuggable, diffable)

Other approaches to explicit interaction graphs:
- **Datalog/query-based** - affordances as facts, query what's possible
- **Capability-based** - tokens define what you can do
- **Intent-based** - declare what you want, system figures out how
- **Reactive/stream-based** - subscribe to affordance changes

Don't marry MOO. It's *one* approach to making interaction explicit.

**Vibe-coding style**:
- "Holding reins loosely" - but *not* zero technical knowledge (contrast with "pure vibe coders")
- Background: years of golfing, language design/impl (not compilers), frontend, Rust for AoC
- Knows what I'm looking at, understands perf characteristics at a basic level
- Don't read every line of 90k LOC - a lot is busywork
- Have *some* domain knowledge; LLMs have *all* the domain knowledge at a basic level
- The combination: I can evaluate/steer, LLM handles volume
- Prefer discussing SRP, generality, decomposition into fundamental concepts
- Hyper-modularity as a design goal

**Revisiting Notes/FS in MOO**:
- This insight (notes/fs as views into tag-based entity store) was already explored in lotus design phases
- That's why "notes-in-MOO" and "fs-in-MOO" felt appealing
- Standalone notes/fs = just another app, low ecosystem value
- Notes/FS-in-MOO = demonstrates the paradigm, higher value
- The standalone versions were always lower priority - they don't prove anything new

**If the AI bubble bursts and LLMs disappear, what are we left with?**

| Project | LLM-dependent? | Residual value |
|---------|---------------|----------------|
| moss | No | Tree-sitter based code intelligence still works |
| pith | No | Universal interfaces, useful regardless |
| reed | No | Transpiler, works without LLMs |
| spore | Partially | Lua runtime works; LLM plugin less useful |
| lotus/MOO | No | Programmable objects, still works |
| liana | No | API codegen, useful regardless |
| cambium | No | Format conversion, still works |
| iris | Yes | Session analysis needs LLMs |

Most of the ecosystem is **LLM-assisted in construction, not LLM-dependent in operation**. The code exists and works. LLMs were the means, not the purpose.

Exception: iris (and similar "AI-native" tools) would lose core functionality.

---

## Prioritization Analysis

Which project first? Think in terms of ROI and dependencies.

### Dependency Graph

```
          ┌────────────────────────────────────────┐
          │              canopy (UI)               │
          └───────────┬─────────────┬──────────────┘
                      │             │
       ┌──────────────┴──────┐      │
       ▼                     ▼      ▼
   ┌───────┐            ┌───────┐ ┌───────┐
   │ spore │◄───────────│  MOO  │ │ other │
   └───┬───┘            └───┬───┘ └───────┘
       │                    │
       ▼                    ▼
   ┌───────┐            ┌───────┐
   │ pith  │            │ libsql│
   └───────┘            └───────┘
```

- **canopy** needs something to connect to
- **MOO** needs spore (Lua runtime) + libsql (storage)
- **spore** needs pith primitives
- **pith** is foundational

### Project ROI Estimates

| Project | Effort | Immediate Value | Enables Other Work |
|---------|--------|-----------------|-------------------|
| pith-fs | Low | File watching, indexing | FS service, canopy |
| pith-sql | Low | SQLite bindings | Notes, MOO |
| MOO core | High | Programmable objects | Notes-on-MOO, FS-on-MOO |
| Notes standalone | Medium | Usable notes app | Nothing else |
| FS standalone | Medium | Usable file browser | Nothing else |

**Observation**: pith-* primitives have high ROI - low effort, enable everything else.

### Minimal Viable Compositions

What's the smallest useful combination?

**Option A: pith + canopy**
```
canopy ←→ pith-fs
```
- A file browser. Useful but not novel.

**Option B: spore + pith + canopy**
```
canopy ←→ spore ←→ pith-{fs,sql}
         ↑
      Lua apps
```
- Scriptable file browser / notes. Getting interesting.

**Option C: MOO + canopy**
```
canopy ←→ MOO ←→ libsql
         ↑
    TS verbs (via reed)
```
- Programmable objects with UI. The full vision (but more work).

### What Would You Use Daily?

Honest question: which of these would actually get used?

| Tool | Would use daily? | Why / why not? |
|------|------------------|----------------|
| File browser (canopy + pith-fs) | Maybe | Already have good file browsers |
| Notes (standalone) | Maybe | Already have Obsidian |
| MOO (programmable objects) | ? | Depends on what apps exist |
| MOO + AI context injection | Yes | Original itch - Tavern cards |

The MOO + AI context is the unique value. Everything else has strong competitors.

**Implication**: Maybe start with MOO core, not the "safe" primitives?

---

## Minimal MOO

If MOO is the unique value, what's the smallest MOO that demonstrates it?

### Core Entities

```lua
-- Everything is an entity
entity = {
  id = 123,
  parent = 1,        -- inheritance
  props = { ... },   -- key-value
  verbs = { ... },   -- callable code
}
```

### Minimal Verbs

```lua
-- Movement
entity:move(target)

-- Speech
entity:say(message)

-- Inspection
entity:look()
entity:examine(target)

-- Modification
entity:set(key, value)
entity:get(key)
```

### Minimal World

```
                ┌─────────────────┐
                │   Root (#0)     │
                └────────┬────────┘
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌─────────┐
    │ Player  │    │   Room   │    │  Thing  │
    │  (#1)   │    │   (#2)   │    │  (#3)   │
    └─────────┘    └──────────┘    └─────────┘
```

### Minimal AI Context

What does "AI context injection" actually look like?

```lua
-- Given a player entity, produce LLM context
function make_context(player)
  local room = player:location()
  local contents = room:contents()

  return {
    location = room:describe(),
    present = map(contents, function(e) return e:describe() end),
    inventory = map(player:contents(), function(e) return e:describe() end),
    recent_events = get_recent_events(player),
  }
end
```

Output (structured, for injection):
```
WORLD STATE:
You are in: Kitchen - A warm room with copper pots hanging from hooks.
Present: Alice (sitting, holding coffee), Table (oak, four chairs), Window (open, morning light)
Your inventory: phone, keys
Recent: [5m ago] Alice entered from the garden.
---
CONVERSATION:
...
```

This is the core insight: **structured world state becomes LLM context**.

---

## Next Steps

### Immediate (pick one)

1. **MOO prototype**: Minimal entity system in Lua/spore
   - Storage: libsql
   - No verbs yet, just entities + props
   - Test: Can canopy display entity tree?

2. **pith-fs**: File watching primitive
   - Rust, exposes via spore plugin
   - Test: Can Lua script react to file changes?

3. **Context injection POC**: Skip MOO, test the core hypothesis
   - Hardcode some "world state" JSON
   - Inject into LLM context manually
   - Test: Does this actually improve Tavern-style interactions?

### Questions to Answer

- Is context injection the actual value? (Test with POC before building MOO)
- Do I want to build MOO again, or was lotus enough exploration?
- What's the minimal thing that would actually get used?
