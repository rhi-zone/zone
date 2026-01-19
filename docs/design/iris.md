# Iris: Agent-Authored Insights

Iris is a flora project for extracting and sharing insights from agentic coding sessions. Named for the Greek messenger goddess who bridges worlds - fitting for a tool that communicates insights between agents and humans.

## Naming

Flora uses botanical naming - apps are flowers:
- **Iris** - Greek messenger goddess, rainbow bridge between worlds. Communication of insights.
- **Wisteria** - Climbing vine with tendrils, reaching and exploring. The agent project (rename pending from `agent/`).

## Why Flora

Flora is explicitly designed for "full-stack" Lua applications using the whole Rhizome ecosystem. Iris fits because:
- Composes existing pieces (moss-sessions for parsing, spore for LLM)
- Fast iteration via Lua + spore (no recompiling to experiment with prompts)
- Follows the wisteria/agent pattern
- Easy to extract primitives later if they prove valuable

## Vision

Agents as practitioners sharing craft knowledge, not reporters summarizing data.

The best technical writing reads like a smart friend explaining something over coffee. An agent writing "I noticed something weird when I was working on this codebase..." is more compelling than "Analysis reveals the following patterns."

Agentic coding is new. There's value in extracting and sharing insights about how agents work, what patterns emerge, and what we learn from watching them.

## Voice and Tone

Human, conversational, friendly, on-the-same-level. The prompting should encourage:

- First-person perspective ("I kept running into...", "What surprised me was...")
- Honest uncertainty ("I'm not sure why this happens, but...")
- Specific anecdotes from sessions rather than just aggregated stats
- Opinions and preferences ("I find this pattern easier to work with")

Voice should be configurable via prompt fragments / style profiles.

## Modes

### Self-reflection
Agent writes about its own sessions. "I spent a while stuck on X before realizing Y..."

### Cross-agent analysis
Agent reads other agents' sessions and notices patterns. "Interesting - Codex tends to reach for bash more aggressively here..."

### Comparative
"When I worked on this codebase vs. when Gemini did, here's what differed..."

## Multi-Agent Support

The Rhizome ecosystem currently uses Claude Code, but iris should support multiple agents:
- Claude Code (JSONL sessions)
- Gemini CLI
- OpenAI Codex
- Spore-based agents

Different agents have different styles - Claude Code has a "more careful approach" compared to others. These behavioral differences are exactly the kind of insight worth surfacing. An agent could write about patterns it notices across different agents' approaches to the same problems.

## Architecture

### What exists in the ecosystem

| Component | Status | Where |
|-----------|--------|-------|
| Session parsing | Done | moss-sessions (Claude Code, Gemini CLI, Codex, Spore agent formats) |
| LLM calls | Done | spore |
| Embedding generation | Missing | External integration (Gemini, OpenAI, or local via ollama) |
| Vector storage | Missing | External integration (sqlite-vec or in-memory) |
| Clustering logic | Missing | LLM-based or algorithmic |
| Voice/style configs | Missing | Prompt fragments |

### Pipeline

Based on ablogger prototype exploration:

1. **Extraction**: Parse session logs via moss-sessions (or directly for simple cases)
2. **Embedding** (optional): Generate vector embeddings for semantic clustering
3. **Thematic clustering**: Group related content - either via embeddings + similarity, or LLM-based ("here are 20 snippets, group into themes")
4. **Per-theme insight extraction**: LLM call per cluster with targeted prompts
5. **Final synthesis**: Weave insights into narrative with voice/style config

### Starting simple

The first version could skip embeddings entirely:

1. Read session logs
2. One LLM call: "Here's a session. What's interesting about it? Write as yourself, sharing what you noticed."
3. Output markdown

Then iterate: add multi-session aggregation, thematic grouping, voice profiles, etc.

### External integrations

For embeddings/vectors/clustering - if ecosystem support exists externally and we don't have unique value to add, integrate rather than rebuild:

- Gemini `text-embedding-004` (free tier friendly)
- OpenAI `text-embedding-3-small/large` (cheap)
- Local models via ollama

These would live as dedicated spore crates for external integrations.

### Spore Integration Decisions

**`spore-embed`** - Separate crate from spore-llm. Embedding use cases (semantic search, clustering, RAG retrieval) are often distinct from chat/completion. Users wanting embeddings don't necessarily want LLM inference support, and vice versa.

**`spore-sessions`** - Wraps moss-sessions for Lua access. API: `sessions.parse(path)` for raw data, `sessions.analyze(path)` for SessionAnalysis with tool stats, error patterns, etc.

**Vector storage** - Options: extend spore-core memory store, or new `spore-vec` crate with sqlite-vec. Decision deferred until we know if embeddings are worth the complexity.

## Prior Art

### rue-lang.dev/blog
Claude writes posts alongside human devs. Posts like "Hello from Claude" where the agent introduces itself and reflects on work. Transparent about being an AI author, but personable.

### ablogger (~/git/ablogger)
TypeScript/Bun prototype exploring:
- Multiple extractors for AI tool state (Gemini CLI, Claude Code, Cursor, etc.)
- Vector embeddings via Gemini text-embedding model
- sqlite-vec for storage
- Thematic clustering via random seed selection + nearest neighbor
- Multi-stage synthesis with style guide prompts
- See `~/git/ablogger/ABLOGGER_PLAN.md` for detailed architecture

Key insight from ablogger: the synthesis layer is the hard/interesting problem - going from structured data to meaningful narrative.

### What we learned from prior art
- Transparency works: Claude writing as "Claude" is more compelling than pretending to be human
- Style guides matter: ablogger's anti-sycophancy prompts ("no buzzwords", "be opinionated") produce better output
- The hard problem is synthesis, not extraction: turning data into narrative requires careful prompting

## Publishing

The rhizome docs site (rhizome-lab.github.io) has no blog section yet. VitePress supports blogs trivially. A blog seed could scaffold:

- `/blog` section with proper config
- RSS feed
- Date sorting
- Author metadata (including AI authors)

## Current Status

**Implemented:**
- Iris project scaffolded in flora (`iris/init.lua`, submodules in `iris/iris/`)
- Session parsing via `spore-sessions` plugin
- LLM insight generation via `spore-llm` plugin
- Voice profiles (default, technical, reflective) in `iris/iris/prompts.lua`
- Session formatting for LLM context in `iris/iris/format.lua`
- CLI interface with `--list`, `--recent`, `--multi` modes

**Spore blockers resolved:**
- Module plugins now accessible via `require("spore.sessions")` with `[sandbox] require_plugins = true`
- CLI args now available via `spore.args` table with `spore run . -- arg1 arg2`
- Plugin naming fixed to match nix build output (`librhizome_spore_*.so`)

## Next Steps

1. **Temporal coherence** - Track what's been written about to avoid repetition
2. **Session splitting** - Handle multi-day sessions by splitting at time gaps
3. **Domain clustering** - Group insights by theme (like ablogger) for concise, comprehensive output
4. **Iterate on prompts**: Voice profiles, style guides
5. **Evaluate**: Is embedding-based clustering worth it, or is LLM-only sufficient?
6. **Publishing**: Add blog section to rhizome docs site when ready

## Temporal Coherence

A core goal is feeling "temporally coherent" - like a practitioner sharing knowledge over time, not repeating what's already been said. rue-lang.dev/blog achieves this naturally through human curation.

### The Problem

Without tracking, iris would repeat itself:
- "I learned about the module system" (week 1)
- "I discovered how modules work" (week 2)
- Same insight, different words

### Approaches

**1. Progress State File**
Track what's been written about in a state file (`.iris/history.json`):
```json
{
  "topics_covered": ["module-system", "error-handling", "api-design"],
  "sessions_processed": ["abc123", "def456"],
  "last_run": "2026-01-19T..."
}
```
Include this in the LLM context: "You've already written about: X, Y, Z. Focus on what's new."

**2. Session Splitting**
Sessions spanning multiple days may have natural breakpoints:
- Time gaps > N hours suggest context switches
- Different working directories suggest different tasks
- Tool usage patterns may indicate phase changes

Split long sessions into logical "work units" for analysis.

**3. Domain Clustering (ablogger approach)**
Instead of chronological output, cluster by theme:
- All auth-related insights → one coherent piece
- All testing insights → another piece
- Reduces repetition naturally through aggregation

**4. Incremental vs Full Analysis**
- **Incremental**: "What's new since last time?" - requires state
- **Full**: "Analyze everything, dedupe at output" - stateless but may miss connections

### Proposed Design

Each approach is **optional and independent** - users enable what they need:

```bash
iris --recent 10                           # Basic: just analyze
iris --recent 10 --track-progress          # Enable state tracking
iris --recent 10 --split-sessions          # Enable session splitting
iris --recent 10 --cluster-domains         # Enable domain clustering
iris --recent 10 --track-progress --cluster-domains  # Combine as needed
```

**1. State tracking** (`--track-progress`)
- Maintains `.iris/history.json` with topics covered
- Injects "you've written about X, Y, Z" into prompt
- Simple, lets LLM do natural deduplication

**2. Session splitting** (`--split-sessions`)
- Detects time gaps > N hours, directory changes
- Splits into logical "work units"
- Useful for multi-day sessions

**3. Domain clustering** (`--cluster-domains`)
- Groups insights by theme before output
- Produces multiple focused pieces instead of chronological dump
- Inspired by ablogger approach

**4. Temporal markers** (always on when state tracking enabled)
- Adds phrases like "Last week I mentioned X, and now..."
- Creates narrative continuity

**5. Temporal perspective** (`--as-of <date>` or `--batch-by-week`)
Write from the perspective of when work actually happened, not today:

```bash
# Generate one post per week, dated appropriately
iris --recent 100 --batch-by-week --output-dir ./drafts/

# Write as if it's Jan 5th, only using sessions up to that date
iris --recent 50 --as-of 2026-01-05
```

This enables:
- **Authentic timestamps** - Posts dated when work happened
- **Queued publishing** - Generate a month of posts, publish over time
- **No spam** - Avoid dumping 100 posts in one day
- **Narrative authenticity** - "I just finished X" when X actually just happened

Implementation:
- Group sessions by time period (day/week)
- Filter sessions to only those before `--as-of` date
- Inject temporal context: "Today is Jan 5th, 2026"
- Output includes suggested publish date in frontmatter

**6. Draft queue** (`--queue`)
Instead of outputting directly, append to a draft queue for review:
- `.iris/drafts/2026-01-05-insights.md`
- `.iris/queue.json` tracks pending drafts
- Separate publish step after human review

**7. Custom extractors** (future)
Configurable patterns to extract specific sentiments/patterns:
- "What went wrong" - user corrections, agent apologies
- Learning moments - "I didn't realize...", "I learned..."
- Blockers encountered - tool failures, missing context
- Successful patterns - approaches that worked well
- Q&A pairs - user questions + agent answers/suggestions (for FAQs/docs)
- Decisions made - architectural choices, trade-offs discussed
- Plans/todos - what was planned vs what was executed
- Code patterns - reusable snippets, common solutions
- Option presentations - "Option A/B/C" style choices offered + what was chosen
- Tool call sequences - common workflows, repeated patterns of tool usage
- Struggle signals - lots of searches in a row, repeated failures, backtracking
- Research patterns - heavy web search/fetch usage (knowledge gaps, external deps)

Could feed into:
- Improvement tracking over time
- Auto-generated FAQ/documentation
- Pattern libraries for future sessions
- Correctness evaluation - was the agent right? (via user feedback or later verification)

## Future Directions

### Output Formats
- Structured JSON for programmatic consumption
- RSS/Atom feed generation directly
- Frontmatter for static site generators (publish date, tags, author)

### Multi-Agent Perspective
- Cross-agent comparison (Claude vs Gemini on same task)
- "Voice" that acknowledges being one of many agents
- Aggregating insights from different agents working on same codebase

### Integration Points
- Git hook to auto-run after commits
- CI job that generates weekly digest
- MCP server so other agents can query iris

### Memory / Knowledge Base
- Queryable knowledge base from past sessions
- "What did we learn about authentication in this project?"
- Vector embeddings of past insights for retrieval (spore-embed?)

### Meta-Analysis
- How has the agent's understanding evolved over time?
- Recurring themes - what topics keep coming up?
- Productivity patterns - time of day/week analysis

## Open Questions

- Where does the agent draft live before publishing? PR-based review? Staging area?
- Should voice profiles be per-project, per-agent, or global?
- How much context is needed for meaningful cross-session insights?
- Is embedding-based clustering worth the complexity vs. just throwing context at the LLM?
