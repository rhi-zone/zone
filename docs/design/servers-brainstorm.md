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
