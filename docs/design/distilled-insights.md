# Distilled Insights: What We Can Actually Build

Extracted from servers-brainstorm.md. These are the actionable leads.

---

## 1. Lotus: Objects, Not Documents

**The thesis:**
- Notes apps are paper skeuomorphism on interactive machines
- Documents are passive. Objects are active.
- Things that live > things that sit
- Comes to you > you go to it

**What to build:**
- Object store with state, behavior, connections
- Objects: stopwatches, timers, calendar events, saved webpages, tagged images
- NOT a notes app. A living system.
- JSON blob storage, discriminated unions, pluggable frontends

**Key insight:** If your work IS the dopamine reward, you don't need elaborate capture systems.

---

## 2. Canopy: User-Defined Projections

**The thesis:**
- The problem with node editors (and text editors, and everything) is they're the ONLY view
- One structure, many projections
- The user defines projections, not the system

**What to build:**
- Projection layer onto anything (Lotus, filesystem, APIs, databases)
- Projection primitives users can compose
- Graph-first as foundation
- CyberChef-style for pipelines, nodes for complex, text for dense

**Key insight:** Escape from WIMP by making the paradigm user-defined.

**The specific vision:**
- Pattern-matching: recognize structure, show as sugar
- Reverse macros: edit the sugar, transforms back to structure
- Per-user: you define your own patterns
- Composable: your sugar plays nice with my sugar

---

## 3. Resin: Interaction Graph for Node Editing

**The problem:** Node editors suck. Spaghetti, tedium, navigation.

**The insight:** Apply the interaction graph. Don't show everything always.

**What to build:**
- Context-filtered node creation (radial menu, 8 items max)
- What nodes are relevant NOW?
- What connections make sense from THIS port?
- Auto-suggest based on what usually follows
- Frecency-ordered

**Key insight:** The 8-item limit is a forcing function, not a bug.

---

## 4. Trellis: Abstraction as Guardrails

**The thesis:**
- Good abstractions hide landmines
- Bad abstractions create them
- Linting IS pattern matching on graphs
- Architecture and syntax are same thing at different levels

**What to build:**
- Derive macros that remove choices (like Pico-8 removes framework choice)
- Opinionated defaults with escape hatches
- Progressive disclosure (simple case is simple)
- The "blessed preset" vs "à la carte" pattern

---

## 5. State Linting

**The thesis:**
- It's not about architecture. It's about state.
- You CAN lint runtime state graphs statically
- Rust/Elm/Signals prove it's possible

**What to explore:**
- Explicit state graphs in the type system
- Effect tracking for web frameworks
- Make the reactive graph visible and lintable
- "Will this scale?" as a static analysis question

**Key insight:** The question isn't "can we?" It's "why isn't this the default?"

---

## 6. Radial Menus / Interaction Design

**The thesis:**
- Radial menus are optimal (Fitts's Law + muscle memory)
- Didn't win because toolkits didn't have `CreateRadialMenu()`
- The toolkit IS the paradigm

**What to build:**
- Radial context menus (8 items, context-filtered)
- Behavioral skeuomorphism (momentum, elasticity) not decorative
- Spatial interfaces for navigation, abstract for power

---

## 7. The Omnicompetent-ish Approach

**The thesis:**
- LLMs are a generalist made of specialists
- Multiplier, not replacement
- You provide: vision, taste, evaluation
- LLM provides: breadth, execution, translation between domains

**Required floor:**
- Programming literacy
- Architectural sense (can come from "dinky" personal projects)
- Taste
- Vision

**Key insight:** The dream was blocked by "requires a type of mind that doesn't exist." Now a weird approximation exists.

---

## Meta-Insights

### Why Things Don't Exist
- Bridge problems (requires crossing specializations)
- Incomplete implementations (started, hit hard part, gave up)
- Incumbents aren't competent (they just showed up first)
- "Professional" gatekeeping killed playful interfaces

### The Real Bottleneck
- Not skill (LLMs help)
- Not time (100k Discord messages prove time exists)
- Not tools (DevTools is a full IDE in every browser)
- It's **motivation and direction** - knowing what to build, caring enough to build it

### The Two Tracks
| Professional | Creative |
|--------------|----------|
| NextJS, k8s | Pico-8, Scratch |
| 47 dependencies | Constraints as guardrails |
| "Work" | "Play" |
| Bootcamps | Game jams |

Both exist. Professional gets attention. Creative track is alive but niche.

---

## What To Build First

Ordered by dependency and leverage:

1. **Lotus core** - Objects, storage, CRUD (foundation for everything)
2. **Canopy primitives** - Projection building blocks
3. **One good projection** - Prove the concept (CyberChef-style? Spatial?)
4. **Trellis basics** - Server derive macros (unblocks Lotus networking)
5. **Resin interaction graph** - Context-filtered node creation

The dream is available. Nobody's claimed it yet.
