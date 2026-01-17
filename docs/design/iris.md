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

## Next Steps

1. **Scaffold iris project** in flora (init.lua, nursery.toml)
2. **Start simple**: Single session → LLM → markdown output
3. **Add spore-sessions** to spore for Lua access to moss-sessions
4. **Iterate on prompts**: Voice profiles, style guides
5. **Evaluate**: Is embedding-based clustering worth it, or is LLM-only sufficient?
6. **Publishing**: Add blog section to rhizome docs site when ready

## Open Questions

- Where does the agent draft live before publishing? PR-based review? Staging area?
- Should voice profiles be per-project, per-agent, or global?
- How much context is needed for meaningful cross-session insights?
- Is embedding-based clustering worth the complexity vs. just throwing context at the LLM?
