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

**The early internet was neat. How do we bring it back?**

Not literally the early web. Not using LLMs as a bridge (that's a crutch, not a solution). The question is: **what was the essence that made it good, and how do we capture that?**

What the early web had (the *spirit*):
- **Ownership** - your space, your rules
- **Tinkering** - view source → learn → make your own
- **Low floor** - HTML in notepad was enough to start
- **Weird creativity** - personal, messy, no brand consistency required
- **Connection** - links to other weird pages, webrings, discovery
- **No gatekeepers** - no algorithm, no platform approval

What killed it wasn't technology - it was **incentives**:
- Platforms centralized attention (easier to post *on* something than *make* something)
- Professionalism expectations ("your site looks amateur")
- Mobile shifted to apps (walled gardens) - though PWAs exist, not a full paradigm shift
- Attention economy rewards feeds, not exploration

The tools exist. Static hosting is free. The *culture* shifted.

**The question isn't "how do we make websites easy again"** - that's solved. The question is: **what would make people *want* to create their own spaces instead of posting on platforms?**

**Fascinating prior art: [nightfall.city](https://nightfall.city/)**

A text-based community structured as a fictional metropolis. Accessible via telnet (`nc nightfall.city 1900`). Districts like "Writers-Lane" (cafes and bookstores), "Dusk's End" (contemplative hilltop), "Shore" (waterfront). Community features wrapped in narrative fiction - citizenship, classifieds, postal services, subway.

What it gets right:
- **Atmosphere over technology** - telnet is ancient, but the *vibe* is intentional
- **Narrative structure** - it's not "a forum," it's "a city you explore"
- **Intentional retreat** - explicitly stepping away from mainstream web
- **Low-tech accessibility** - if you have a terminal, you're in
- **Community functions disguised as world elements** - classifieds are classifieds, but they're *in* the city

This is the MOO/MUD spirit alive in 2026. Small, weird, intentional, atmospheric.

**Also: [Counterfeit Monkey](https://ifdb.org/viewgame?id=aearuuxv83plclpl) by Emily Short**

Interactive fiction, **2012** - not ancient history, not brand new. Consistently ranked #1 on IFDB. Set in Anglophone Atlantis where linguistic manipulation reshapes reality. Core mechanic: a letter-remover that transforms objects by removing letters from their names. Apple → ale. It's wordplay as world-mechanic.

Importantly: made *during* the "platforms ate everything" era. The IF community kept producing excellent work while the mainstream web was being consumed by Facebook and Twitter. Proof that the spirit never fully died - it just went underground.

**Honest admission**: Part of all this is missing the spirit of an era I never really got to experience. Nostalgia for something I only know secondhand. I'm sure plenty of things sucked (slow connections, bad UX, scams, no search, broken links everywhere). But before megacorps *became* the internet... things were different. More chaotic, more personal, more *yours*.

Maybe it's romanticized. Probably. But the romanticism points at something real that got lost.

**The core questions:**

1. **Why did it disappear?**
   - Convenience won. Platforms are *easier*. One login, one interface, audience built-in.
   - Network effects. Your friends are on Facebook, not on your RSS reader.
   - Mobile. Apps, not URLs. Walled gardens by default.
   - Money. Ad-driven attention economy rewards engagement, not exploration.
   - Discovery died. Without curation (webrings, directories), how do you find the weird stuff?
   - Professionalization. "Your site looks amateur" became an insult, not a badge of authenticity.

2. **Can we bring it back?**
   - The spirit never fully died (nightfall.city, IF community, neocities, small web movement)
   - But "back" to what? The conditions that created it (scarcity, novelty, no incumbents) can't be recreated
   - Maybe the question is: can we create *new* spaces with that spirit, not resurrect the old ones?

3. **How?**
   - **Don't compete with platforms on their terms** - they win on convenience, audience, network effects
   - **Offer something platforms can't** - ownership, weirdness, depth, persistence, *yours*
   - **Lower the floor** - Discord bots, not new apps to download
   - **Raise the ceiling** - programmable, not just templates
   - **Connect the islands** - federation, discovery, webrings-but-modern
   - **Make creation the point** - not consumption with a "post" button

   Open question: is this even possible at scale? Or is "small and intentional" the only way it works?

**But also**: Little corners exist - SCP, AO3, Tumblr, Neocities. They're *thriving* in their way. But can we make them *big* corners?

Not trying to be a platform. But it's genuinely sad that the spirit became so niche. "Tumblr user" is talked about like some exotic species, despite that exotic species being the source of like half of all internet culture (4chan is the other half, somehow).

The creative weirdos aren't gone. They're just... marginalized? Siloed? Talked about like they're a curiosity rather than the actual engine of anything interesting online.

Maybe the question isn't "how do we scale the spirit" but "why did the spirit get pushed to the margins, and can it reclaim some territory without becoming what it replaced?"

**The real problem isn't being marginalized. It's discoverability.**

Fine with staying niche. But: people can spend their *entire lives* without knowing these communities exist. Without knowing this was something they could *participate* in. Not just consume - create, contribute, belong.

The early web had webrings, directories, "links" pages. You'd stumble onto things. Discovery was built into browsing.

Now? Algorithms surface what optimizes engagement. The weird creative corners don't optimize for engagement. So they stay invisible. Someone who would *love* SCP or IF or MOOs or Neocities might never encounter them.

It's not that the spirit needs to go mainstream. It's that the *path* to finding it got paved over.

**So: how do we lower the barrier to entry as far down as possible?**

Yes, this creates restrictions. But the payoff: "you can find a place where you build things piece by piece and have something you value in a day, an hour, or less."

What's the minimum viable "start creating" experience?

| Barrier | Early web | Platforms | Ideal |
|---------|-----------|-----------|-------|
| Account | None / free host | Required, tracked | Optional? Pseudonymous? |
| Tools | Notepad | Built-in editor | Already have (Discord, browser) |
| Knowledge | HTML basics | None (templates) | Minimal but *real* (not just templates) |
| Time to first creation | Hours | Minutes | Minutes, but *yours* not cookie-cutter |
| Discoverability | Webrings, links pages | Algorithm (maybe) | ? |

The trap: lowering barriers often means templates, which means cookie-cutter, which loses the "yours" feeling.

The goal: low floor (start fast) + high ceiling (grow into complexity) + *ownership* (it's yours, not a template you filled in).

**What would this look like concretely?**

- Discord bot where you just... start describing a room? An object? And it exists?
- "Here's a thing. It has a name and a description. Done. You made something."
- Then later: "Want it to *do* something? Here's how to add a verb."
- Then later: "Want to connect it to other things? Here's how."
- Incremental complexity, but the first step is *trivially* easy.

The 12-line grep.lua energy, but for world-building. Compose small pieces into something meaningful. First piece takes a minute.

**Broader than web/MOO - creative output in general.**

The question applies everywhere:

| Domain | Current barrier | What "trivially easy start" could look like |
|--------|----------------|---------------------------------------------|
| Music | DAW learning curve, theory | Hum/tap something → it's a loop you can build on |
| Visual art | Tools, technique | Describe/sketch → something exists, refine from there |
| Writing | Blank page paralysis | Fragments that accumulate into something |
| Games | Engines, code, assets | Describe a rule → it works, add more rules |
| Worlds | Everything above | Describe a place/thing → it exists, build from there |

The pattern: **start with something tiny that exists, not a blank canvas**.

A blank canvas is terrifying. "Here's a fragment, make it yours" is approachable.

This is why templates feel hollow - they're someone else's fragment, not yours. But a blank page is worse. The sweet spot: *your* tiny fragment, immediately real, with a path to grow it.

**Rhizome angle**: Resin (procgen) could be "describe a texture/sound → it exists." Frond could be "describe a behavior → it works." The pattern generalizes.

Maybe the through-line isn't "MOO" or "web" or any specific domain. It's: **make the first creative step trivially easy across all domains, then let people compose upward.**

**Prior art that gets this right: Mario Maker, Dreams**

Both let you start with something immediately playable/real, then build from there. Low floor, high ceiling. Your creation, not a template.

**Constraints don't just "force cleverness" - they lower the quality bar.**

The way constraints work isn't only "limitation breeds creativity." It's also: **if you're restricted, you're not expected to do as well.** That's accessibility.

- Dwitter: 140 characters? No one expects a masterpiece. Permission to be small.
- PICO-8: 128x128, 16 colors? Of course it's chunky. That's fine.
- Pixel art: The *actual* skill ceiling is absurdly high, but the *perceived* bar is "it's just pixels"
- Bytebeat: One line of math? Cool if it makes any interesting sound at all.

This removes the "blank canvas terror" in a different way. Not "here's a fragment to start from" but "here's a constraint that makes imperfection acceptable."

Both approaches work. Fragments lower the starting barrier. Constraints lower the quality expectation. Either way: you get to make something without the pressure of it being Good.

**The bar is SO high now. Maybe that's the real problem.**

The early web: personal pages were janky. That was fine. Expected, even.

Now: you see polished content everywhere. Professional YouTubers. Viral TikToks. AAA games. Your brain calibrates "normal" to the top 0.1%.

Then you try to make something and it's... not that. Of course it's not. But the comparison is internalized. "This isn't good enough to share."

The bar is *partly* a collective hallucination created by:
- Algorithmic feeds showing only hits
- Survivorship bias (you don't see the 99% that flopped)
- Professionalization of everything
- "Content creator" as job title

But also: **some people are just unnecessarily harsh.** The bar is sometimes enforced by real humans being mean. Gatekeeping. "Your art is bad." "This is amateur." "Why did you even post this."

That's harder to fight. It's not just internalized comparison - it's actual cruelty. And one harsh comment can undo a hundred kind ones.

Communities matter here. Some spaces are supportive. Some are brutal. Choosing where to share is part of the battle.

**The early web had more natural isolation.** Your corner was *your* corner. Harder for random people to butt in. You had to actively find a site to see it. No algorithm pushing content to people who'd hate it.

That isolation was a feature:
- Safe spaces existed because they were hard to find
- Trolls had to work to discover you
- "Going viral" wasn't really a thing (blessing and curse)
- Communities could be weird without constant outside scrutiny

Platforms destroyed that. Everything's in the feed. Anyone can find anything. "Discoverability" also means "discoverable by the worst people."

The small web / federation / Discord servers - maybe they're recreating that isolation? Private by default. You have to be invited or seek it out. The trolls don't find you because the algorithm isn't pointing them at you.

**But is "don't feed the trolls" / isolation a real solution? Or a bandaid?**

Hiding doesn't fix the underlying problem:
- The trolls still exist
- The platform dynamics that enable them still exist
- You're just... not in their path

It means creative communities are forever confined to small hidden corners. Can never grow without attracting the bad actors. "Success" becomes dangerous.

Maybe that's fine? Small is good anyway (three people and their dog). But it's a constraint imposed by hostile actors, not chosen freely.

No good answer here. Moderation is exhausting and doesn't scale. Isolation works but limits reach. Platform-level fixes don't happen because engagement (including toxic engagement) is profitable.

The honest take: there might not be a solution. Just trade-offs. Hide and be safe but small. Grow and face the horde. Pick your poison.

**Deeper question: are humans naturally like that? Or is there an underlying problem?**

Is cruelty online just... human nature? Or is it created/amplified by something?

Arguments for "it's environmental":
- Anonymity + audience + no consequences = permission to be cruel
- Screens dehumanize - you're not hurting a person, you're typing at text
- Platforms reward engagement, including negative engagement
- Hurt people hurt people - lots of people are miserable and it leaks out
- Boredom, lack of meaning, misdirected frustration
- Tribal dynamics amplified by algorithms (us vs them)
- Context collapse - you say something to friends, strangers attack

Arguments for "some of it is just people":
- Some percentage of people are genuinely cruel
- Trolling existed before the internet (just more local)
- Even in small communities, there's sometimes That Person

Probably both. Some people are just mean. But the environment takes normal human variance and amplifies the worst parts. A person who'd be mildly unpleasant IRL becomes relentless when there's no face, no consequences, and an audience.

**Maybe the answer isn't "fix humans" but "don't build environments that reward cruelty."** Platforms *could* deprioritize toxic engagement. They choose not to because it's profitable.

The problem might not be human nature. It might be capitalism optimizing for engagement at any cost.

**Drama sells. Outrage is engagement.**

Platforms don't distinguish *good* engagement from *bad* engagement:
- Argument in comments? Engagement. Algorithm boosts it.
- Hate-watching? Engagement. Recommended to more people.
- Rage-clicking? Engagement. Ad impressions go up.
- Dunking on someone? Engagement. Both sides keep coming back.

The metric is "time on platform" and "interactions," not "did this make anyone's life better?"

**This is a choice platforms make.** They *could* optimize for satisfaction. They *could* downrank conflict. They *could* measure "did users leave feeling good?" Some have tried (YouTube's "break reminders," Instagram hiding likes briefly). But they don't stick with it, because engagement metrics win internal arguments.

The cruelty isn't human nature leaking through. It's **cruelty as a business model, because conflict is profitable.**

Consider:
- A supportive comment gets a like. One interaction.
- A hostile comment gets a reply, then a counter-reply, then a pile-on, then screenshots, then a whole discourse. Dozens of interactions.

From the platform's perspective, the hostile comment was *more valuable*. That's the incentive structure.

**Implication for alternatives:**

If engagement-maximization creates toxicity, then alternatives need *different metrics*:
- Not "time on platform" but maybe "things created"
- Not "interactions" but "collaborations"
- Not "daily active users" but "people who made something they're proud of"

Or: no metrics at all. Small communities don't need growth. Three people and their dog don't need engagement analytics.

The old web worked partly because there were no metrics. Nobody was optimizing for anything. You made a page because you wanted to. The absence of measurement was freedom from optimization pressure.

Maybe the answer is: **stop measuring.** Or at least: measure different things. Or: be small enough that measurement doesn't matter.

**But wait: do people actually *want* to be doomscrolling?**

Probably not. The behavior looks more like addiction than choice:
- People report feeling *worse* after social media use
- They keep doing it anyway
- "I spent 3 hours scrolling and now I feel bad" is universal
- Nobody plans to doomscroll - it just happens

This suggests platforms aren't serving preferences - they're **exploiting psychological vulnerabilities**. Variable reward schedules (maybe this scroll will have something good). Social validation (likes as dopamine). Fear of missing out. Outrage as engagement.

People don't *want* to be angry and anxious. They're being manipulated into states that generate engagement. The "want" is manufactured.

**So "unsolvable" doesn't mean "give up."**

You can't fix Twitter. You probably can't fix the attention economy. But:
- You can build things that *don't* exploit those vulnerabilities
- You can create spaces with different incentive structures
- You can opt out, personally and by building alternatives
- Small doesn't need to become big - three people and their dog is enough

The early web wasn't "solved" - it just had different incentives (none). The answer might not be "fix platforms" but "don't be a platform."

**The uncomfortable question: is "don't be a platform" enough?**

If the doomscroll machines keep running, most people stay trapped. Building a nice garden doesn't help the people who don't know gardens exist.

But also: you can't save everyone. The best you can do is:
1. Build the alternative
2. Make it discoverable (but not algorithmic)
3. Let people find it when they're ready

Maybe that's defeatist. Or maybe it's realistic.

**But actually: "competing" is the wrong frame entirely.**

"Competing head-on is futile" assumes you're playing the same game - trying to get users, market share, engagement. That's only true from a capitalist perspective. If you're not trying to "win" in that sense, there's no competition.

The platforms aren't competitors. They're a different thing. You're not building "Twitter but better" - you're building something with different values for different reasons. Success isn't measured in user counts.

This reframes everything:
- Not "how do we beat the platforms" but "what do we want to exist?"
- Not "how do we get users" but "who is this for, and will they find it?"
- Not "market share" but "does this serve the people who use it?"

The platforms can keep running. That's fine. They're not the enemy to defeat - they're just... not what we're building. Coexistence, not competition.

Not everyone. Just: some people. The ones who want something different.

**But honestly? Wouldn't it be nice if the platforms lost?**

Not competing doesn't mean not *wanting* them to shrink. There's a difference between:
- **Strategy**: "We're not trying to beat them" (true - different game)
- **Wish**: "I'd prefer a world where they're less dominant" (also true)

Is that delusional? Maybe examine what "platforms losing" would even look like:

| Scenario | Likelihood | Would it help? |
|----------|-----------|----------------|
| Platforms die, nothing replaces them | Very low | Chaos, probably bad |
| Platforms die, new platforms replace them | Medium (has happened: MySpace → Facebook) | Same problem, different logo |
| Platforms shrink, small web grows | Low but possible | This is the dream |
| Platforms stay, alternatives coexist | Most likely | Good enough? |

The honest assessment: platforms probably aren't going anywhere. The structural forces that created them (network effects, convenience, capital) still exist. When one dies, another takes its place.

But: **you don't need platforms to die for alternatives to thrive.** The goal isn't "platforms lose" - the goal is "alternatives exist and are findable." Those can coexist.

Wanting a better world ≠ making "destroy the current world" your strategy. You can wish for platforms to shrink while building for the world as it is.

Is it delusional? More like... a hope that doesn't need to be the plan. Build the thing. Let people find it. If platforms shrink someday, great. If not, the thing still exists.

**But wait. We already know it's possible.**

This isn't theoretical. Massive successes exist that aren't traditional platforms:

| Thing | Scale | What it is | Why it's not a platform |
|-------|-------|-----------|------------------------|
| **Minecraft** | 300M+ copies sold | Creative sandbox, servers | You buy it once. Servers are independent. No feed, no algorithm. |
| **SCP Foundation** | Millions of readers, thousands of authors | Collaborative horror wiki | Wiki, not platform. No engagement metrics. People create because they want to. |
| **Terraria** | 50M+ copies | Co-op building/survival | Same energy as Minecraft. Shared progress, persistent worlds. |
| **Co-op games generally** | Huge | Playing together | Not competing for attention. Shared goals. |
| **AO3** | 12M+ works | Fanfiction archive | Non-profit, community-run. No ads, no algorithm. Thriving. |

These aren't niche. Minecraft is one of the best-selling games *ever*. SCP is a cultural phenomenon. AO3 won a Hugo Award.

**What do they have in common?**

- **Not ad-driven** - no incentive to maximize engagement
- **Creation is the point** - not consumption with a "post" button
- **Ownership** - you own what you make (or it's creative commons)
- **No algorithmic feed** - you find things by exploring, not by being fed
- **Community, not audience** - you're *with* people, not performing *for* them
- **Persistence** - things you build stay. Servers have history. Wikis accumulate.

The model works. At scale. Without toxic engagement dynamics. It's not wishful thinking - **it already happened.**

The question shifts from "is this possible?" to "what made these work, and can we learn from them?"

**But what's actually missing?**

Games, fiction, fanworks - those are niches. Platforms succeed because **for their core use cases, there's no alternative.**

| Platform niche | What it serves | Non-platform alternative? |
|---------------|----------------|--------------------------|
| General social ("what I'm up to") | Sharing life updates with friends | ...email? group chats? Christmas letters? |
| News/current events | Real-time information, discussion | RSS? But discovery is gone |
| Short-form content | Entertainment, quick hits | TikTok-without-TikTok doesn't exist |
| Professional networking | Jobs, industry connections | LinkedIn has no competitor |
| Dating | Finding partners | Apps dominate, no alternative |
| Local community | Events, neighbors, local info | Nextdoor, Facebook groups... still platforms |
| Marketplace | Buying/selling | Craigslist? Facebook Marketplace? Still platforms |
| Group coordination | Organizing people | Discord, Slack... arguably platforms |

For most of these, the "alternative" is either:
- Another platform (just different branding)
- Something way worse (email chains, phone trees)
- Nothing

**Why did Minecraft/SCP/AO3 work but "general social" doesn't have an alternative?**

Hypothesis: they have **specific creative outputs**.

| Success | The output |
|---------|-----------|
| Minecraft | Builds, worlds, servers |
| SCP | Articles, canons, tales |
| AO3 | Fics |
| Terraria | Worlds, progression |

"General social" has no artifact. You're not *making* something - you're just... posting. Sharing. Reacting. The "output" is ephemeral engagement, not a persistent creation.

Maybe that's the gap? Platforms won "general social" because there's nothing to *build*. The alternatives that work are ones where you're building something together.

**Tumblr as partial exception:**

Tumblr is technically a platform, but it has more creation energy:
- Blogs are *yours* (customizable, persistent)
- Reblog culture means content spreads with attribution
- Fandoms *build* things (headcanons, AUs, art, fic)
- Less algorithmic (chronological feed, mostly)
- Community over audience (more conversation, less broadcasting)

It's still a platform, but it's closer to the "creation" end than Twitter/Facebook. Maybe that's why it survived while being "bad at business."

**The uncomfortable question: is "general social" just... platformable by nature?**

If there's no artifact to build, no persistent creation, maybe platforms are the natural solution? And the best we can hope for is:
- Better platforms (less toxic, less engagement-maximizing)
- Small communities for those who want out (Discord, group chats)
- Accept that "general social" will always be platform territory

Or: **invent a new thing.** What if "general social" *did* have artifacts? What if sharing your life wasn't ephemeral posts but... something else?

No idea what that would look like. But maybe that's the actual missing piece.

**MOO is arguably that.**

Social interaction that produces artifacts:
- You're not posting - you're building objects, rooms, worlds
- Conversations happen *in* a persistent space you created together
- The social activity *is* the creation
- Your "profile" isn't a bio - it's your room, your objects, your verbs

Instead of "here's what I'm thinking" (ephemeral post), it's "here's a thing I made" (persistent artifact). The social graph becomes a world graph.

Maybe that's why MOO feels relevant to this whole conversation - it's "general social" with artifacts baked in.

---

**Tangent: what even is creativity?**

A tutor once said (paraphrased): "Creativity is the ability to make connections between seemingly unrelated things."

But... isn't that just thinking? Forming thoughts? Making associations?

And isn't that also what LLM attention does - finding relevant connections between tokens, weighing which parts of the context matter for the next prediction?

Obviously oversimplified. But the question stands:

| Process | What it does |
|---------|-------------|
| Creativity | Connect unrelated things → novel output |
| Thinking | Connect concepts → coherent thought |
| Memory | Connect cue → stored information |
| LLM attention | Connect tokens → predicted continuation |

If creativity is "just" connection-making... then:
- It's not magic, it's a process
- Tools that help make connections could assist creativity
- The "creative spark" might be: *which* connections you make, not *that* you make them
- Novelty comes from *unexpected* connections (obvious ones aren't creative)

This connects (heh) to the "fragments that accumulate" idea. Creativity isn't ex nihilo - it's connecting existing pieces in new ways. The more pieces you have access to, the more potential connections. The better your tools for surfacing unexpected connections, the more "creative" the output.

**Implication for tools:**

If creativity is connection-making, then tools should:
- Surface unexpected relationships (not just obvious ones)
- Let you accumulate fragments (more raw material = more possible connections)
- Make it easy to juxtapose things (put A next to B, see what happens)
- Not force linearity (thoughts aren't linear, connections are graphs)

This is why wikis/zettelkasten/graph notes appeal - they're connection-surfacing tools. Links are explicit connections. Backlinks reveal implicit ones.

**Feeds are linear. You know what that means?**

**The platform controls what you think.**

If creativity/thinking is connection-making, and connections depend on what's adjacent in your mind, then:
- Feed shows you A, then B, then C (in that order)
- Your brain connects A→B→C
- The *platform chose that sequence*
- Therefore: the platform is shaping which connections you make

This isn't just "engagement optimization." It's **cognitive control**. The algorithm decides what thoughts enter your mind, in what order, creating what associations.

| Interface | Who controls sequence? | Who makes connections? |
|-----------|----------------------|----------------------|
| Algorithmic feed | Platform | You, but with platform-chosen inputs |
| Chronological feed | Time (random-ish) | You, with semi-random inputs |
| Graph/wiki | You | You, with self-chosen paths |
| MOO/exploration | You | You, by moving through space |

Linear feeds are the most controlled. You scroll down. One thing after another. No choice in sequence. The platform picks what goes next based on what will keep you scrolling.

Non-linear tools (wikis, MOO, spatial interfaces) give you agency. You choose what to look at next. You make your own paths. The connections are *yours*.

This reframes "platforms are bad for attention" into something deeper: **platforms are bad for cognition**. They're not just wasting your time - they're shaping your thought patterns by controlling your input stream.

The "doomscroll trance" isn't just addiction - it's surrendering your cognitive agency to an algorithm.

**But it's not all black and white.**

Two framings:
- "It's just the algorithm bucketing you" - categorizing based on your behavior, showing you more of what you clicked
- "The algorithm reinforces your biases to unhealthy levels" - amplification loop that takes mild tendencies → extremes

Both are true. It's a **feedback loop**, not pure top-down control:

```
You have existing interests/biases
         ↓
Algorithm detects them from behavior
         ↓
Shows you more of what you engaged with
         ↓
Your tendencies get reinforced
         ↓
Algorithm detects stronger signal
         ↓
Shows you even more extreme versions
         ↓
Repeat until radicalized / addicted / trapped
```

The algorithm isn't choosing your thoughts arbitrarily - it's amplifying whatever you already are. That's arguably *worse*. It takes your mild curiosity about X and turns it into obsession. It takes your slight irritation at Y and turns it into rage.

Radicalization pipelines work exactly this way. You click one "interesting" video, algorithm notices, feeds you more, you go deeper, it goes deeper with you. The extremism was "in you" the whole time - the algorithm just found it and amplified it.

**This is more insidious than pure control.** You can't blame "the algorithm made me think this" - it just showed you things you engaged with. But you also can't claim full agency - the amplification was engineered.

It's a collaboration between your existing tendencies and a system designed to maximize engagement by exploiting them.

**But linearity is also a weakness.**

Linear feeds are effective *for algorithms*. But what if you break the linearity?

**Case study: Pixiv recommendations**

When you click an artist, Pixiv suggests multiple other artists in a modal. Follow one, and just that slot gets replaced - the other options remain.

```
Linear feed:     A → B → C → D → E (no choice, just scroll)

Pixiv style:     [B, C, D, E, F] (multiple directions at once)
                  ↓ (follow C, just C replaced)
                 [B, G, D, E, F] (other options still there)
```

The key value: **multiple directions exist simultaneously**. You're choosing from a set, not accepting a sequence. Even without dramatic branching, seeing options = agency.

**To be fair: X/Twitter does this too** - three "who to follow" suggestions, different per profile. You can rabbit-hole through them and end up navigating a closed-ish social circle of artists. Hopping from profile to profile, following the graph of who-knows-who.

That's not the algorithmic feed - that's **graph exploration**. The feed is linear, but profile-hopping is navigating a social graph. Same platform, different modes, different agency levels.

Maybe the insight isn't "Pixiv good, Twitter bad" but: **graph navigation exists alongside feeds, and it's more agentic**. The recommendations are still algorithmic, but you're traversing a network, not being conveyed down a stream.

The algorithm still recommends. But you're navigating, not being conveyed. The control dynamic shifts.

| Model | Who steers? | User agency |
|-------|------------|-------------|
| Linear feed | Algorithm | None (just scroll) |
| Pixiv branching | Both | Choice points at each step |
| Pure exploration (MOO/wiki) | User | Full (you choose what to look at) |

**Design principle: break linearity, introduce branching.**

If linear feeds enable algorithmic control, then non-linear interfaces might resist it. Give users choice points. Show options, not a stream. Let them navigate rather than scroll.

This doesn't eliminate recommendation algorithms - it changes the power dynamic. Algorithm suggests, user chooses. Collaboration rather than control.

**How do you fight it?**

- **Intentional constraints** - gives permission to be limited
- **Communities that celebrate "good enough"** - Neocities, small web, zines
- **Rejecting polish as a goal** - "done is better than perfect"
- **Small audiences being okay** - three people and their dog, remember?
- **Process over product** - sharing WIPs, learning in public
- **Nostalgia/retro aesthetics** - pixel art, chiptunes, lo-fi as deliberate choice

But honestly? No idea if there's a systemic fix. Might just be: find your corner, ignore the algorithm, make things for yourself and the few who care.

The platform era raised the bar by showing everyone the highlights. Maybe the post-platform era (if it comes) lowers it again by hiding them.

**Personal example: SillyTavern character cards**

Writing character cards is a form of creative output that works this way:
- Don't follow rigid formats (no W++, ew)
- Intentionally "break the mold" - write as journal entries, voice notes, Obsidian fragments, pieces of a character's life
- Not trying to be a Great Writer - just conveying a vibe
- The cards end up relatively "complete" - and when run through an LLM, they convey the intended vibe
- LLMs can help flesh things out: "write me an intro message," "suggest a direction," or just interact with the card to figure out why it feels off

This is the pattern:
- **Start with fragments** (not a complete story, just pieces)
- **They're immediately "real"** (you can chat with the character)
- **Iterate by interaction** (talk to it, see what's off, adjust)
- **Tools assist, not replace** (LLM helps, but the vibe is yours)

No blank page. No rigid template. Fragments that accumulate into something with a *feel*.

**Tangent: the NN elephant in the room**

Common angle: "neural networks bad, steals jobs." And honestly? Valid concern. Malicious actors do what they do. Artists getting ripped off. Content farms. Deepfakes. Real harms.

But: are NNs (image diffusion, LLMs, etc.) a *net* negative? Who knows. Genuinely unclear.

What's clear:
- They *can* be tools that lower creative barriers (character cards, iteration, "what's off?")
- They *can* be tools that replace creative labor (content farms, "good enough" slop)
- The same technology enables both
- The outcome depends on who's using it and how

Not taking a strong stance. Just noting: the tooling conversation happens in this context. "LLMs help you iterate on character cards" coexists with "LLMs let corps fire writers." Both true. Uncomfortable.

A little sad that the vocal sides are so polarized. "AI will save everything" vs "AI is theft and destruction." But there are plenty of people with nuanced takes - pointing out specific harms without condemning the whole technology, or acknowledging benefits without ignoring costs. They just don't get the engagement that hot takes do.

The nuanced position is boring: "some uses good, some uses bad, depends on context, we should think carefully." Doesn't fit in a tweet. Doesn't generate outrage. Probably closer to true.

---

**General stance: build up abstractions.**

But the question remains: *which* abstractions? That's the hard part. Wrong abstractions are worse than no abstractions.

**Hacker culture is cool.** One advantage of the Lua repo: everything's small. Anyone could, if they wanted, *just look at it*. grep.lua is 12 lines. The HTTP library is 442 lines total. No magic. No "trust the framework." You can read it.

This is a form of accessibility that gets overlooked:
- Not just "easy to use" but "easy to understand"
- Not just "low barrier to start" but "low barrier to inspect"
- View source → learn → make your own (the early web energy)

Big frameworks are powerful but opaque. Small pieces are limited but transparent. The Lua repo optimizes for transparency. Anyone can become a contributor because anyone can read it.

**Open question**: can you have both? Powerful abstractions that are also transparent? Or is there a fundamental tradeoff?

Maybe the answer is: **layers of small transparent pieces**, where each layer is understandable on its own. You don't need to understand all 442 lines to use the HTTP client - just the 17 lines of client.lua. But if you want to go deeper, you can.

**100 Rabbits follows this philosophy too.** Uxn/Varvara is intentionally constrained and transparent - you can understand the whole thing. It's a choice to optimize for comprehensibility over power.

**Related: [todepond's "Just"](https://www.todepond.com/wikiblogarden/better-computing/just/)**

A piece critiquing "just" as a word that hides complexity:
- "Just use the command line"
- "Just rent a server"
- "Just use a framework"

Each "just" masks layers of prerequisite knowledge. What seems simple to experts is a learning cliff for others. The word is accidental gatekeeping.

The piece argues: instead of false reassurance ("just do X"), actually make things genuinely accessible. Acknowledge the barriers. Work to remove them, don't pretend they don't exist.

This connects to everything:
- "Just make a website" hides DNS, hosting, HTML, CSS, deployment...
- "Just write a character card" hides format knowledge, LLM quirks, prompt engineering...
- Low barriers should be *real* low barriers, not "just" hiding the cliff

---

**Prior art collection moved to [prior-art.md](./prior-art.md)** - a living document of things worth knowing about.

---

**Why don't people just... spontaneously do these things?**

The tools exist. The communities exist. Why isn't everyone making things?

Possible answers (probably all true to some degree):

1. **Don't know it exists** - Discoverability. You can't join what you've never heard of.

2. **"I'm not a [creator/programmer/artist]"** - Identity barrier. People sorted themselves into "creators" and "consumers" and don't cross.

3. **Barriers are higher than they look** - The "just" problem. Looks easy until you try.

4. **No time/energy** - Attention economy ate everything. People are exhausted. Creating takes surplus.

5. **Social risk** - "That's weird." Embarrassment. What if it's bad? What if people judge?

6. **No path from consumer to creator** - Platforms have "post" buttons, not "build" buttons. The affordances aren't there.

7. **Reward loop mismatch** - Platforms give instant dopamine (likes, notifications). Creation takes time before payoff. Hard to compete.

8. **Learned helplessness** - "I tried once and it was hard/bad, so I'm not a creator." One bad experience closes the door.

9. **No community** - Creating alone is hard. The communities exist but are invisible (see #1).

10. **It's not the default** - You have to actively seek it out. The default is consumption.

The tragic loop: people don't create → communities stay small → communities stay invisible → people don't know they could create → ...

Breaking the loop probably requires: lowering real barriers (not "just"), making communities visible, providing paths from consuming to creating, and somehow competing with platform dopamine.

**The (unfortunate) exception: Roblox**

Roblox actually got millions of kids creating. It proves the model *can* work at scale:
- Low floor (visual scripting, templates)
- High ceiling (Lua scripting, full games)
- Built-in audience (your friends are already there)
- Path from player to creator is visible
- Social reward loop (people play your thing!)

But the "unfortunate" part:
- Exploitative revenue share (creators get pennies)
- Robux economy designed to extract money from kids
- Child labor concerns (kids making content, platform profits)
- Walled garden (you don't own what you make)
- Enshittification trajectory (ads, monetization pressure)

Roblox proves it's *possible* to get mass creation. It also proves you can do it in deeply exploitative ways. The question: can you get the good parts (low floor, visible path, social rewards) without the extractive business model?

Maybe the answer is: not at Roblox scale, because that scale requires VC money, which requires extraction. The good version might only work smaller.

**But we're not trying to be a platform.**

Has anyone tried to make a non-platform creative substrate? Actually... yes, lots of niche things:

| Tool | Domain | What it is |
|------|--------|-----------|
| [Strudel](https://strudel.cc/) | Music | Live coding music in browser |
| [TidalCycles](https://tidalcycles.org/) | Music | Algorithmic pattern-based music |
| [Processing](https://processing.org/) | Visual art | Creative coding, visual sketches |
| [p5.js](https://p5js.org/) | Visual art | Processing for the web |
| [PuzzleScript](https://www.puzzlescript.net/) | Games | Puzzle games in ~100 lines |
| [Twine](https://twinery.org/) | IF/narrative | Interactive fiction, no code needed |
| [Ren'Py](https://www.renpy.org/) | Visual novels | Python-based VN engine |
| [RPG Maker](https://www.rpgmakerweb.com/) | Games | Make JRPGs |
| [PICO-8](https://www.lexaloffle.com/pico-8.php) | Games | Fantasy console, intentional constraints |
| [thi.ng/umbrella](https://github.com/thi-ng/umbrella) | Computational design | Massive toolkit for generative art, data structures |
| [Sonic Pi](https://sonic-pi.net/) | Music | Live coding, education-focused |

These exist! They're not platforms - they're substrates. You make things with them, you own what you make.

Common threads:
- **Domain-specific** - each is good at one thing
- **Owned output** - what you make is yours
- **Community, not platform** - forums, Discord, sharing, no algorithmic feed
- **Often free/open source** - not extractive
- **Low floor, high ceiling** - varying degrees, but the pattern is there

What they're NOT:
- Interconnected (PuzzleScript can't talk to Twine)
- General-purpose (each is its own silo)
- Discoverable to normies (niche communities)

**The Rhizome question**: what if the substrate was general? What if the domains could connect? What if the silo walls came down?

Not "one tool to rule them all" - that's hubris. But maybe: shared primitives, interoperable formats, composition across domains?

**Honest assessment: many of these tools are... questionable.**

| Tool | The good | The wtf |
|------|----------|---------|
| Twine | Low floor, IF accessible | Not extensible, save dialog is blech |
| RPG Maker | Huge community | It's just JSON + interpreter + awful settings UI. Why is it this big? |
| Ren'Py | Visual novels accessible | What even is that DSL |
| Game Maker | Actually quite decent | Proprietary, pricing changes |
| PuzzleScript | Elegant constraints | Very limited (by design, but still) |

These succeeded despite their flaws. The bar isn't as high as it seems? Or: filling a niche matters more than polish?

**Better substrates for games exist:**

- **Godot** - open source, general purpose, actually well-designed
- **Bevy** - ECS architecture, Rust, hyper-modular
- Both could be "substrate for multiple genres" rather than genre-specific tools

The pattern: well-designed general substrates (Godot, Bevy) vs poorly-designed niche tools (RPG Maker, Ren'Py). The niche tools won on accessibility/community, not on technical merit.

**Implication for Rhizome**: Maybe the goal isn't "better than Twine at IF" but "general substrate that makes Twine-like-things easy to build on top." Don't compete with the niches - be the layer they could build on.

**What is a niche tool but an additional layer of abstraction?**

| Niche tool | What it abstracts over |
|------------|----------------------|
| RPG Maker | JavaScript/JSON |
| Twine | HTML/JS |
| Ren'Py | Python |
| PuzzleScript | Custom engine |
| Strudel | Web Audio API |

They're all just... layers. Someone built an abstraction, it stuck, now it's "a tool."

The question: **what's the right substrate to build those abstractions on?**

Current reality: everyone picks their own base (JS, Python, custom). No shared primitives. Each niche tool reinvents persistence, state, UI, etc.

Alternative: shared substrate with good primitives. Niche tools become thin layers on top. The "RPG Maker layer" is just: preconfigured entity types + tile renderer + battle system. The substrate handles persistence, state, networking, etc.

This is the Bevy/Godot insight applied more broadly. They're substrates for games. What's the substrate for... everything?

(Actually not impossible - see [thi.ng/umbrella](https://github.com/thi-ng/umbrella). It's a substrate for... basically everything computational/generative. 190+ packages, all composable.)

The real constraint isn't "can you build a general substrate" - it's "can you expect to become *the* thing people use for everything." No. You can't. The ecosystem will stay fragmented.

But you can build a good substrate, use it yourself, let others use it if they want. It doesn't have to win. It just has to exist and be useful.

---

**Why is software so big?**

10k LOC. 100k. 1 million. 10 million. *What do you mean?*

grep.lua is 12 lines. The entire HTTP library is 442 lines. Uxn is intentionally tiny. LuaJIT is ~100k lines for an *entire VM with JIT*. So software *can* be small. Why isn't it?

Possible reasons:

| Reason | What it means |
|--------|--------------|
| **Accidental complexity** | Cruft, legacy code, workarounds nobody removed |
| **Essential complexity** | The problem is genuinely hard (rare, but real) |
| **Boilerplate** | Languages/frameworks that require verbosity |
| **Edge cases** | Handling every possible situation, even rare ones |
| **Dependencies** | Pull in 10k LOC library for one function |
| **Abstraction layers** | Each layer adds code, often more than it saves |
| **"Enterprise" patterns** | Over-engineering for hypothetical future needs |
| **Nobody deletes code** | Only add, never remove. Fear of breaking things |
| **Multiple platforms** | Code for every OS/browser/config permutation |
| **Defensive programming** | Check everything everywhere, trust nothing |
| **Tests** | Good, but adds LOC (not a bad reason though) |
| **NIH** | Reinventing what already exists in dependencies |
| **Job security** | More code = more indispensable (cynical but real) |

The Lua monorepo is small because:
- LuaJIT is a good substrate (small, fast, embeddable)
- Intentional constraint (keep things small)
- One person's taste (no design-by-committee bloat)
- No backwards compatibility burden (can just change things)
- Composition over extension (small pieces that snap together)

**The uncomfortable question**: is most software big because it *needs* to be, or because the incentives reward bigness?

- More code = more "work done" = more justification for headcount
- Frameworks sell complexity as features
- Nobody gets fired for adding code, sometimes fired for deleting it
- Big codebases create moats (job security, vendor lock-in)

Maybe most software is big because *small doesn't pay*.

**Case study: React vs Preact**

| Library | Size | What it does |
|---------|------|-------------|
| React | ~40KB+ (core) | Virtual DOM, components, hooks |
| Preact | ~3KB | ...basically the same thing |

Preact is 10-15x smaller and covers 95% of use cases. So why is React 40KB?

- More edge cases handled
- More features (concurrent mode, suspense, etc.)
- More abstraction layers
- Facebook scale requirements
- Legacy compatibility
- "Enterprise" needs

For most apps, Preact is fine. But React is the default because:
- It's what people know
- More tutorials/Stack Overflow answers
- "Nobody got fired for choosing React"
- Network effects

The 3KB version exists. People choose the 40KB version anyway. Size isn't the deciding factor. Ecosystem, familiarity, and safety are.

Oh, and React is now slow enough that it needs **its own compiler** (React Compiler, formerly "React Forget") just to make it perform well. The abstraction got so heavy they needed another layer of abstraction to optimize it.

Meanwhile Preact just... runs fast because it's small. No compiler needed.

Actually, it's not just size - it's **architecture**. React's model is "re-run the entire function every render." That's fundamentally wasteful. The compiler exists to work around a bad architectural decision.

Compare:
| Approach | How it works | Efficiency |
|----------|-------------|------------|
| React | Re-run everything, diff virtual DOM | O(tree size) every render |
| Vue | Fine-grained reactivity, track dependencies | Only update what changed |
| Solid | Signals, no virtual DOM | Only run code that depends on changed signals |
| Svelte | Compile away the framework | Minimal runtime, surgical updates |

Vue is bigger than Preact but still fast because the *model* is smarter. React is big AND uses a slow model. Worst of both worlds, "fixed" with a compiler.

The lesson: architectural decisions matter more than micro-optimizations. A smart small thing beats a dumb big thing with a compiler bolted on.

(Vue considered "Vapor mode" - compile-away like Svelte - but it became low priority. Why? Because Vue's reactivity is already good enough that the gains would be marginal. Good architecture upfront = less heroics needed later.)

Notably: Vue's reactivity (`@vue/reactivity`) is **completely separate** from the web framework. You can use it standalone. The primitives are decoupled from the application.

This is good decomposition - the substrate (reactivity) is independent of the layer on top (web components). React doesn't have this. React's model is inseparable from React.

The pattern again: **good primitives, loosely coupled, compose upward.**

**Aside: Lua vs JavaScript accumulation**

Feature-wise, they're pretty close. But:
- Lua's stdlib is intentionally barren
- JS's stdlib exists but... isn't even that good? Weird historical baggage, inconsistencies, `typeof null === "object"`

The difference is accumulation:
- Lua: stays small, 5.1 → 5.4 is incremental, LuaJIT still on 5.1 and that's fine
- JS: keeps adding - classes, async/await, optional chaining, nullish coalescing, private fields, decorators, temporal, records & tuples...

Each JS addition makes:
- The spec bigger
- Implementations harder
- The "minimum viable JS engine" more work

Lua's barren stdlib is a *feature* - you add what you need via FFI/C, not via spec committee. JS's stdlib is a historical accident that keeps growing.

QuickJS is impressive (~80k lines for near-full ES2023) but it's an **interpreter** - no JIT. And it's still fighting uphill against a spec designed for browsers.

Corrections though:
- Lua is *also* designed by committee (PUC-Rio team) - but a small one with clear vision, not TC39 with a hundred stakeholders
- LuaJIT being small isn't *just* because Lua is small - it's a **feat of engineering** by Mike Pall. Lua helps, but the JIT itself is remarkable work

The difference might be: small focused committee (Lua) vs large stakeholder-driven committee (JS). And: one genius (Mike Pall) vs teams of hundreds (V8, SpiderMonkey).

**Other examples**:
- Moment.js (~300KB) vs day.js (~2KB)
- Lodash (~70KB) vs native JS + tiny helpers
- Express (~200 deps) vs bare http module

The small alternatives exist. They're often good enough. But "good enough and small" loses to "big and familiar."

What it demonstrates:
- **Text can be incredibly deep** - 4 years to build, near-inexhaustible combinations
- **Constraints inspire innovation** - text-only forced creative mechanics
- **The IF community is alive** - still producing, still ranking, still caring
- **Systemic mechanics create emergence** - the letter-remover isn't scripted puzzles, it's a *system*

Emily Short's work in general (Galatea, Savoir-Faire, the Versu engine) shows what's possible when you take text-based interaction seriously as a medium, not a limitation.

**What would Rhizome's angle be?**
- Not "make a website" but "make a *world*"
- Collaborative, not just personal (the SCP/wiki energy but interactive)
- Structured, not just text/HTML (queryable, composable)
- Programmable, not just static (things that *do* stuff)
- Discord as entry point (you're already there)
- Federatable (Hypha - your world, connected to others)

Maybe the early web's spirit isn't about *websites* specifically. It's about: **personal creative spaces that you own and control, connected to others.** That could be pages, or worlds, or objects, or whatever.

**What makes people want to create?**
- Seeing others create (inspiration, community)
- Having an audience (even small - three people and their dog)
- The creation being *useful* to them (scratching own itch)
- Low friction to start, high ceiling to grow
- Ownership (it's *yours*, not rented from a platform)

Platforms win on "audience" but lose on "ownership." Can you have both?

**The adoption cliff**:
Maybe the reason things don't take off is brutal economics:
- You need to be **nigh-impossibly better** to overcome switching costs
- OR you need **corporation-level funding** for distribution/marketing
- "Slightly better" or even "significantly better" isn't enough
- Network effects protect incumbents
- "Good enough" wins over "great but different"

This is depressing but probably true. Rhizome doesn't have corporation funding. So: either be impossibly better, or don't compete head-on?

**First-mover advantage: what succeeded primarily because it got there first?**

| Software | First-mover element | Would it win today? |
|----------|--------------------|--------------------|
| QWERTY | First popular typewriter layout | Demonstrably not optimal (Dvorak exists) |
| Excel | First killer spreadsheet on PC | Maybe? But VisiCalc/Lotus 1-2-3 came first |
| Windows | First "good enough" PC GUI for masses | Debatable - was it the best, or just pre-installed? |
| Word | First "good enough" word processor with network effects | Probably not on merit alone |
| Photoshop | First professional image editor | Has genuine technical depth, but also 30yr lock-in |
| JavaScript | First browser scripting language | Definitely not - it's famously flawed, but it's *everywhere* |
| x86 | First popular PC architecture | ARM is eating it now that the moat weakened |
| PDF | First universal document format | Genuine value, but also "just send me a PDF" inertia |

The pattern: **technical merit gets you in the door, but staying power is often lock-in**.

- File format lock-in (Word docs, Photoshop files)
- Ecosystem lock-in (Windows apps, JS libraries)
- Muscle memory lock-in (QWERTY, vim bindings)
- "It's what everyone uses" lock-in (Excel, PDF)

**Implication for Rhizome**: Doesn't matter. We're not here to compete or make money. We're here to explore. If something useful falls out of it, great. If not, we learned something.

**Honest self-assessment: if we were optimizing for adoption, we picked literally the worst niches**

| Project | Market reality |
|---------|---------------|
| MOO | "What is that?" |
| Resin (procgen) | "Just use Godot's tooling/plugins" |
| Rescribe | "Pandoc is pretty solid" |
| OOXML | "Who parses docx? Just read them. Also other languages have decent support" |
| Canopy | "It's like Postman but different and too general - would it even be usable?" |
| Frond (game primitives) | "Too general. Everyone writes their own because they *want* to optimize for their usecase" |
| Reed (transpiler) | "Why? Just learn the other language" |
| Cambium (format conversion) | "ffmpeg/pandoc/imagemagick exist" |

Customer base: three people and their dog.

**But that's fine.** These are explored because they're *interesting*, not because they're marketable. The goal is understanding, not adoption.

**Nuance**: They all *have* value propositions - otherwise why start? But enough to be a moat / stand out from competition? Probably not. Though honestly, small niches are often enough. Don't gotta disrupt.

**Contradiction**: We've identified *tons* of software with room to improve (Excel, multi-app workflows, settings sprawl, interaction paradigms...). But is that why we're here? To fix those things? Or to explore interesting ideas that happen to touch on them?

The honest answer: mostly exploration. If improvement falls out of it, bonus. But "Excel is bad" isn't the *motivation* - it's an *observation* that informs the exploration.

**So what IS the actual motivation?**

Trying to articulate it honestly:

1. **"What if?"** - Contrarian questioning. What if interaction was structured? What if notes/files/objects were the same thing? What if we didn't accept these tradeoffs?

2. **Understanding by building** - NIH not for pride, but for learning. Can't truly understand something until you've built it (or tried).

3. **Composition** - The joy of small pieces that snap together. `grep.lua` is 12 lines because the libraries exist. That feeling of "take this + this + this = working thing."

4. **Scratching itches** - MOO exists because of wanting inventory in Tavern cards. Rescribe exists because pandoc isn't perfect. Real needs, even if niche.
   - Parallel MOO motivation: **collaborative worldbuilding**. ChatMUD gave a taste of this. Exploring things other people built. Creating in the same universe. Being able to interact with *and* create things in a shared persistent world. SillyTavern doesn't have this. Most AI RP sites have multiplayer maybe, but that's not the same thing. Multiplayer is playing together. Collaborative worldbuilding is *building* together, and then the builds persist for others to discover.
   - Maybe this is part of why Minecraft and Terraria are so wildly successful? Not just "play together" but "build together, and it stays." The creations persist. Servers become places with history. You can stumble on something someone else made months ago. That's different from match-based multiplayer where nothing carries over.
   - **Barrier to entry matters hugely.** Discord as a first-class frontend for MOO wasn't just "a nice option" - it was THE motivating factor. People are *already there*. No client download. No new interface to learn. Just... type in a channel you're already in. That's why text-based interfaces still have value despite being "primitive" - they meet people where they are.
   - **But collaborative worldbuilding DOES exist elsewhere:** Orion's Arm, SCP Foundation, fanon wikis, AUs, CYOA wikis. These are thriving collaborative worlds. The difference? They're *documentation*-based, not *interaction*-based. You write an article about an SCP anomaly. You don't *encounter* it in a shared space. Both are valid, different experiences. Wiki worldbuilding is "here's lore." MOO worldbuilding is "here's a thing you can poke."

5. **"Should exist"** - Some things just *should* exist and don't. So make them exist.

6. **The moonshot** - Subsume all computer interaction. Absurd, probably impossible, but it's the north star that gives direction.

None of these are "make money" or "get users" or "beat the competition." They're all intrinsic.

**The meta-motivation**: Enjoying the process of exploring ideas and building things. The destination matters less than the journey being interesting.

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

   **Another superpower: parallel development**

   Traditional solo dev: one thread of execution. You work on one thing, then the next.

   LLM-assisted: spin up multiple contexts. One session works on the parser, another on the renderer, another on tests. You switch between them, review, steer. Effectively multiplying your throughput.

   It's not "10x developer" - it's "1 developer running 5 parallel workstreams." Different skill. More like project management than pure coding. But it works.

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
