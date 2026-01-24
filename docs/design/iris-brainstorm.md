# Iris: Agent-Authored Insights

Iris is a zone project for extracting and sharing insights from agentic coding sessions. Named for the Greek messenger goddess who bridges worlds - fitting for a tool that communicates insights between agents and humans.

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

## What Do We Actually Want?

Concrete use cases iris could serve:

### Public content (blog posts)
Like rue-lang.dev/blog - agents writing about their work for external audiences.
- "Hey, here's what I noticed while working on Rhizome this week"
- Shareable, interesting, builds community

### Internal knowledge capture
"What have we learned about authentication in this codebase?"
- Not for publishing, just for team memory
- Queryable: "find me insights about testing strategies"

### Pattern libraries
Reusable approaches that worked well.
- "When I hit this kind of error, here's what worked"
- Could feed into agent prompts later

### FAQ/documentation generation
Extract Q&A pairs from sessions into docs.
- User asked "how does X work?" → agent explained → capture that
- Turn sessions into searchable knowledge

### Improvement tracking
Are we getting better over time?
- "Agent used to struggle with Y, now handles it smoothly"
- Longitudinal view of capability

### Debug/postmortem
What went wrong in this session?
- Extract corrections, user frustrations, tool failures
- "Here's where I got stuck and why"

### The core question
Which of these matters most? They have different requirements:
- Public blog → polish, voice, narrative
- Internal knowledge → searchability, accuracy
- Pattern libraries → actionability, structure
- FAQ generation → Q&A format, coverage
- Improvement tracking → metrics, timelines
- Debug/postmortem → honest failure analysis

Maybe iris is multiple tools in one? Or maybe the extractors-to-synthesis pipeline serves all of them with different output modes?

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

### The "why build this" question

**What makes iris different from just asking Claude Code to read its own sessions?**

You could literally just prompt: "Read ~/.claude/sessions/*.jsonl and tell me what's interesting." Why build a dedicated tool?

Possible answers:
- **Reproducibility**: Same prompt + data = same output. Tool codifies the approach.
- **Iteration**: Easier to tune prompts/extractors in code than in chat.
- **Automation**: Can run on CI, cron, git hooks.
- **Persistence**: Results stored, queryable later.
- **Multi-source**: Handles different session formats uniformly.

But honestly? For rue-lang.dev/blog, Steve Klabnik probably just tells Claude Code "go wild" with repo access. That works! Iris is for when you want more structure, reproducibility, or automation.

**When is iris overkill?**
- One-off blog post → just prompt Claude Code directly
- Casual "what happened today?" → just read recent sessions manually
- Small team, few sessions → no need for tooling

**When does iris make sense?**
- Regular publishing cadence (weekly blog)
- Large session volume (many agents, many repos)
- Specific extraction needs (corrections, Q&A pairs)
- Automation requirements (CI integration)

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

**Detailed architecture review:**

1. **Plugin-based StateExtractor pattern**
   - Interface: `validate(path?)` → bool, `extract(path?)` → data
   - Two scopes: 'global' (system-wide) vs 'project' (per-repo)
   - Graceful degradation: if validate fails, extractor skipped silently
   - Extensible: add new extractors by implementing interface

2. **Clustering approach**
   - Random seed selection (2-3 embeddings as theme centroids)
   - Find similar docs via `vec.MATCH` distance ordering
   - Non-overlapping assignment: each doc belongs to exactly one theme
   - Tradeoff: simple but may miss salient themes

3. **Multi-stage synthesis**
   - Stage 1: Per-theme insight generation (parallelizable)
   - Stage 2: Cross-theme narrative weaving
   - Stage 3: Style guide enforcement baked into prompt
   - Key: separating concerns reduces context length per call

4. **Persistence model**
   - Dual database: metadata.sqlite (structured) + vectors.sqlite (embeddings)
   - Project identity by git remote URL hash (stable across clones)
   - Post versioning: v1.md, v2.md, latest.md symlink
   - Analysis caching: JSON snapshots for offline review before synthesis

5. **Style guide directives** (baked into prompts)
   - "Tell a story, don't list facts"
   - "Be opinionated (compliment cool things, joke about weird things)"
   - "Show don't tell"
   - "No buzzwords ('groundbreaking', 'paradigm shift')"
   - "Ignore the boring stuff"

**Ablogger tradeoffs worth considering:**

| Decision | Why | Downside |
|----------|-----|----------|
| Random theme seeds | Simple, avoids clustering complexity | May miss salient themes |
| Non-overlapping themes | Prevents duplication in synthesis | Content only in one theme |
| Per-theme LLM calls | Smaller context, parallelizable | More API calls |
| Separate metadata/vector DBs | Different access patterns | Schema complexity |
| Git remote hash for identity | Stable across clones | Breaks on fork/remote change |

### What we learned from prior art
- Transparency works: Claude writing as "Claude" is more compelling than pretending to be human
- Style guides matter: ablogger's anti-sycophancy prompts ("no buzzwords", "be opinionated") produce better output
- The hard problem is synthesis, not extraction: turning data into narrative requires careful prompting
- Multi-stage synthesis scales better than one big prompt
- Graceful degradation matters: partial data is still useful

## Publishing

The rhizome docs site (rhi-zone.github.io) has no blog section yet. VitePress supports blogs trivially. A blog seed could scaffold:

- `/blog` section with proper config
- RSS feed
- Date sorting
- Author metadata (including AI authors)

## Current Status

**Implemented:**
- Iris project scaffolded in zone (`iris/init.lua`, submodules in `iris/iris/`)
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
- Full RAG: embeddings for retrieval, full text for answers
- Flat storage (insights are cross-cutting, don't fit neat hierarchies):
  ```
  .iris/
    history.json
    insights/*.md     # flat, named by slug/hash
    index.db          # embeddings for discovery
  ```
- spore-embed + spore-libsql for vector search

### Meta-Analysis
- How has the agent's understanding evolved over time?
- Recurring themes - what topics keep coming up?
- Productivity patterns - time of day/week analysis

### Publishing Workflow
- Draft → Review → Publish pipeline
- Human-in-the-loop approval
- Auto-PR to docs repo
- Scheduled publishing (drip content over time)

### Personalization
- Per-project voice/style
- Learning reader preferences over time
- Adapting technical depth to audience

### Extractors as First-Class
- Each extractor as a separate "lens" on sessions
- `iris --extract corrections` vs `iris --extract qa-pairs`
- Pluggable extractor system

### Connection to Rhizome Tools
- wisteria sessions → iris insights
- moss code intelligence → richer context
- nursery templates → iris config templates

### Insight Lifecycle
- Generate → Store → Index → Query → Update
- Should insights be immutable or evolve?
- Versioning? "I said X before, but now I think Y"

### Naming/Slugs for Flat Storage
- Content hash (dedupes but opaque)
- LLM-generated slug ("auth-session-management")
- Timestamp + random (simple but meaningless)
- Hybrid: timestamp + LLM slug?

### Insight Generation Triggers
- Manual (`iris --recent 5`)
- Post-session hook (auto-run after session ends)
- Scheduled (daily/weekly digest via cron/CI)
- On-demand query that notices gaps

### Session Quality Signals
- Length (turns, tokens)
- Tool success rate
- User interruptions/corrections frequency
- Task completion (did it actually finish?)
- Time between turns (user thinking vs instant responses)

### Comparative Analysis
- Same agent on different projects
- Same project over time (evolution)
- Different agents on same task (benchmark-ish)
- Before/after comparisons (did the fix work?)

### Meta-Iris
- Can iris analyze its own sessions?
- Self-improvement loop
- "What do I struggle with?" introspection
- Feeding insights back into agent prompts

**Reality check:** Iris itself is relatively simple - "just" a Lua script using well-known methods. For iris/wisteria, conventional LLM analysis of outputs is more practical. Early-stage agents like wisteria benefit more from small targeted evaluation sessions than broad insight extraction.

**Where meta-analysis actually helps:** moss - it's been dogfooding itself via Claude Code and IS worth analyzing. Complex tools with rich session histories are better candidates than simple orchestration scripts.

### Insight-Driven Prompting
Feed insights back into agent behavior:
- "You've struggled with X in this codebase before, consider Y"
- wisteria could query iris mid-session for relevant history
- Requires iris to be queryable (API/MCP), not just batch output

### Real-Time vs Batch
- Current design is batch: analyze sessions after they're done
- Could iris run *during* a session? Live insights sidebar?
- Trade-offs: latency, distraction, usefulness

### Cross-Project Patterns
Same agent across different repos:
- "I always reach for X when doing Y"
- "This codebase uses pattern P, like that other project"
- Requires aggregating across project boundaries

### Session Health Dashboard
Not just text output - visualization:
- Tool success rates over time
- Time-to-completion trends
- Common error patterns
- Struggle heatmaps (which parts of codebase cause issues)

### Moss Integration
Use moss code intelligence to enrich context:
- "This function is called from 5 places" - impacts of changes
- "This uses pattern X" - relate to known patterns
- Semantic understanding, not just string matching

### Agent Collaboration Insights
When multiple agents work together (future):
- Handoff patterns
- Conflict resolution
- Division of labor
- "Agent A started this, Agent B finished it"

## Open Questions

- Where does the agent draft live before publishing? PR-based review? Staging area?
- Should voice profiles be per-project, per-agent, or global?
- How much context is needed for meaningful cross-session insights?
- Is embedding-based clustering worth the complexity vs. just throwing context at the LLM?
- What's the minimum viable iris? Just "session → LLM → markdown"?
- Should iris outputs be versioned? What about insight evolution?
- How do you evaluate if iris is producing good insights? User feedback loop?
- Should extractors be LLM-based or pattern-based? Hybrid?
- Who is the audience? Developers? Non-technical stakeholders? Both?
- How often should iris run? On-demand? Daily digest? Weekly roundup?
- What's the human review process? Edit before publish? Approve/reject?
- What makes an insight "good"? Novelty? Actionability? Entertainment value?

## Audience & Frequency

Different audiences need different outputs:

### Developer audience
- Technical details matter
- Code snippets useful
- Jargon acceptable
- "Here's the tricky bit about the module system..."

### Non-technical stakeholders
- High-level progress
- What got done, what's next
- Skip implementation details
- "We made progress on the authentication system"

### Mixed/public
- Accessible but accurate
- Explain technical concepts when introduced
- Like good tech journalism
- The rue-lang.dev/blog style

### Frequency considerations
- **On-demand**: Maximum control, minimum automation
- **Daily**: Too noisy? Good for active development?
- **Weekly**: Natural rhythm, enough to synthesize, not too much
- **Per-milestone**: Tied to releases/features, natural narrative breaks
- **Adaptive**: Run when sessions accumulate above threshold?

## Success Metrics

How do we know if iris is working?

### Output quality
- Reader engagement (if public)
- Human edits required (less = better?)
- Insights acted upon (did someone use the info?)

### Process quality
- Time saved vs manual session review
- Coverage (how much is captured vs lost?)
- Consistency (similar sessions → similar insights?)

### Negative signals
- Repetition (saying the same thing)
- Inaccuracy (stating things that didn't happen)
- Blandness (stating the obvious)
- Verbosity (taking forever to say nothing)

## Privacy & Sensitivity

Sessions might contain:
- API keys, passwords, secrets
- Personal information
- Proprietary code
- Internal discussions not meant for public

### Approaches
- **Scrubbing**: Detect and redact sensitive patterns before LLM
- **Filtering**: Skip sessions/turns that match sensitivity heuristics
- **Human review**: Flag potentially sensitive content for review
- **Scope limits**: Only analyze sessions from specific projects/contexts

### What's "safe" to share?
- Tool usage patterns (probably fine)
- Error types encountered (probably fine)
- Specific code snippets (depends on context)
- User messages verbatim (probably not)
- Internal discussions about business decisions (definitely not)

### The rue-lang.dev model
They seem to share freely - but it's an open source project. Different risk profile than proprietary work.

## Context Window Management

Sessions can be huge. How do we handle?

### Chunking strategies
- Split by turn count (first N, last N, sample)
- Split by time (recent vs historical)
- Split by relevance (grep for keywords, embed + retrieve)
- Hierarchical summarization (summarize chunks, then summarize summaries)

### What to prioritize when truncating?
- User messages (intent)
- Tool calls (actions)
- Tool results (outcomes)
- Agent reasoning (process)
- Errors (learnings)

### The "good enough" question
Maybe we don't need full context? A well-chosen sample might be sufficient for most insights.

## The Curation Problem

Not all sessions are interesting. A session of "fix typo, commit, done" isn't worth writing about.

### Quality signals for filtering
- Length (too short = trivial)
- Complexity (tool variety, back-and-forth)
- Novelty (different from recent sessions)
- Outcome (success vs failure vs abandoned)
- User engagement (corrections, clarifications)

### Should filtering be automatic or manual?
- **Automatic**: Risk missing interesting short sessions
- **Manual**: Doesn't scale, defeats the purpose
- **Hybrid**: Auto-filter with override list?

### The "mundane insights" paradox
Sometimes the most valuable insights come from mundane work. "I fix this same bug pattern every week" is useful to know.

## Persona & Voice Consistency

Should iris have a consistent personality?

### Options
- **Consistent persona**: Same "voice" every time. Builds familiarity.
- **Per-agent voice**: Claude writes like Claude, Gemini like Gemini
- **Per-project voice**: Match project's existing documentation tone
- **Mood-aware**: Reflective after hard sessions, celebratory after wins

### The authenticity question
If an agent writes "I was frustrated by this bug" - was it actually frustrated? Is that authentic or performative?

Probably fine either way - the value is in the communication, not the literal truth of internal states.

## Human-AI Co-authoring

Iris generates draft, human edits and publishes.

### Workflow options
- **Full auto**: Iris → publish (no human)
- **Review gate**: Iris → human approve/reject → publish
- **Edit pass**: Iris → human edit → publish
- **Outline mode**: Iris → outline → human expand → publish
- **Reverse**: Human outline → iris expand → human review

### Who gets credit?
- "Written by Claude" (agent only)
- "Written by Claude, edited by Human" (explicit roles)
- "By the Rhizome team" (collective attribution)
- Both listed as co-authors

## Feedback Loops

How does iris improve over time?

### Explicit feedback
- User rates outputs (good/bad/meh)
- User edits tracked (what did they change?)
- User comments ("this was wrong because...")

### Implicit feedback
- Which outputs get published vs discarded?
- Which outputs get shared/referenced later?
- Time spent reviewing (longer = more engagement or more problems?)

### Closing the loop
- Good outputs → similar prompts in future
- Bad outputs → adjust style/extraction
- Requires storing feedback + prompt versions

## What Iris Should NOT Do

Explicit anti-goals:

### Not a replacement for documentation
Iris extracts insights, it doesn't write docs. Docs require intentional structure, completeness, maintenance.

### Not a project management tool
"What did the agent do this week" is different from "what tasks are done." Iris is narrative, not tracking.

### Not a code review tool
Insights about code are different from reviewing code for merge. Different purpose, different rigor.

### Not surveillance
"What is the developer doing" is not the goal. The goal is surfacing useful patterns, not monitoring humans.

### Not therapy
"The agent seemed stressed" is anthropomorphizing. Focus on what happened, not speculated internal states.

## The "So What" Test

Every insight should answer: "Why does this matter?"

### Bad insights
- "The agent used the Read tool 47 times" (so what?)
- "Authentication was discussed" (and?)
- "There were some errors" (okay...)

### Good insights
- "The agent kept re-reading the same file - suggests the code structure is confusing"
- "Authentication took 3x longer than expected because of undocumented edge cases"
- "The same null pointer error appeared in 4 sessions - might need a defensive check"

### The insight ladder
1. **Observation**: What happened
2. **Pattern**: What keeps happening
3. **Implication**: Why it matters
4. **Action**: What to do about it

Iris should aim for levels 2-4, not just level 1.

## Error Taxonomy

Not all errors are equal. Categorizing helps:

### Error types
- **Tool failures**: External system issues (network, API limits)
- **Misunderstanding**: Agent didn't understand what user wanted
- **Wrong approach**: Right understanding, wrong solution
- **Knowledge gap**: Agent didn't know something it needed to
- **Context loss**: Agent forgot earlier context
- **Hallucination**: Agent stated incorrect facts
- **Scope creep**: Agent did more than asked
- **Incomplete**: Agent stopped before finishing

### What's learnable from each?
- Tool failures → infrastructure issues, need for fallbacks
- Misunderstanding → prompt/communication patterns
- Wrong approach → training/prompting gaps
- Knowledge gaps → what to add to context/docs
- Context loss → session structure issues
- Hallucination → verification needs
- Scope creep → boundary setting
- Incomplete → task complexity indicators

## Highlight Reel vs Full Story

Trade-off between comprehensive and engaging.

### Highlight reel
- Cherry-pick interesting moments
- More engaging to read
- Risk: miss important context
- Good for: public blog, busy readers

### Full story
- Chronological, complete
- More accurate, more boring
- Risk: nobody reads it
- Good for: internal records, debugging

### Hybrid approaches
- Summary + expandable details
- "Here's the highlight, click for full context"
- Layered output (TL;DR → medium → full)

## Teaching & Learning Use Case

Sessions as educational material:

### What can be learned from sessions?
- How to approach unfamiliar codebases
- Debugging strategies
- Tool usage patterns
- Communication with AI assistants
- Recovery from mistakes

### Potential outputs
- "How I debugged X" tutorials
- Pattern libraries ("when you see Y, try Z")
- Anti-pattern warnings
- Onboarding material for new devs

### The expertise extraction problem
Experts do things they can't articulate. Sessions capture the doing, iris could help articulate the why.

## Integration with Existing Knowledge

Iris doesn't exist in isolation:

### Connecting to docs
- "This insight relates to section X of the docs"
- "The docs say Y, but in practice Z"
- Auto-detect documentation gaps

### Connecting to issues/PRs
- "This session addressed issue #123"
- "PR #456 came from this work"
- Bi-directional linking

### Connecting to past insights
- "Similar to what we learned in [previous post]"
- Building on previous knowledge
- Avoiding contradiction

### The knowledge graph dream
Sessions → Insights → Knowledge base → Agent context → Better sessions
A virtuous cycle... in theory.

## Naming & Identity

What do we call the thing iris produces?

### Options
- **Insight**: Implies value/novelty
- **Post**: Blog-centric, assumes publishing
- **Note**: Casual, internal-feeling
- **Report**: Formal, suggests completeness
- **Reflection**: Personal, introspective
- **Log**: Technical, factual
- **Digest**: Summarized, periodic

Different names suggest different purposes. Maybe configurable?

## Timing & Recency Bias

### The recency problem
Recent sessions are easiest to generate insights for. But:
- Recency ≠ importance
- Older sessions might have insights we missed
- Historical perspective is valuable

### Approaches
- Periodic "retrospective" runs on older sessions
- Weight by recency but include sampling of older work
- "What did we learn 3 months ago?" scheduled prompts

### The "I already know that" problem
After working on something, insights feel obvious. But they're not obvious to:
- Future you
- Teammates
- External readers
- The next agent working on this

## Multi-Modal Future

Sessions are mostly text now. What about:
- Screenshots/images in sessions
- Voice transcripts
- Video recordings of pairing sessions
- Whiteboard photos

### How would iris handle these?
- Image description + context
- Voice → transcript → text analysis
- Video → key frame extraction → analysis
- Whiteboard → OCR → concept extraction

Probably distant future, but worth noting the possibility.

## Cost Considerations

LLM calls cost money. How do we manage?

### Cost drivers
- Input tokens (session content)
- Output tokens (generated insights)
- Embedding calls (if using vector approach)
- Frequency of runs

### Optimization strategies
- Aggressive truncation/summarization before LLM
- Cache embeddings, only regenerate when needed
- Batch sessions to amortize overhead
- Use cheaper models for extraction, expensive for synthesis
- Local models for filtering, API models for generation

### The "is it worth it" calculation
If iris saves 30 min of manual review, and costs $0.50 in API calls... probably worth it.
But at scale (1000 sessions/day), costs add up. Need to be intentional.

### Free tier considerations
- Gemini embedding is free tier friendly
- Local models (ollama) for cost-sensitive use cases
- Hybrid: cheap local for screening, API for final synthesis

## Minimum Lovable Product

What's the smallest iris that's actually useful?

### Candidate MLPs
1. **Single session → single insight**: `iris session.jsonl` → markdown
2. **Recent sessions → digest**: `iris --recent 5` → combined insights
3. **Ongoing tracker**: `iris --track-progress` → incremental, no repeats

### What makes it "lovable"?
- Actually produces something worth reading
- Faster than manual review
- Surprises you with something you didn't notice
- Voice feels natural, not robotic

### What's definitely NOT MVP?
- Full RAG pipeline
- Multi-agent comparison
- Real-time analysis
- Dashboard visualization

Start simple, see what sticks.

## User Stories

Who uses iris and why?

### Solo developer
"I want to remember what I worked on and what I learned, without keeping a manual journal."

### Team lead
"I want to understand what the agents are doing across the team without reading every session."

### Open source maintainer
"I want to share interesting work with the community, build engagement."

### Researcher
"I want to study agent behavior patterns across many sessions."

### New team member
"I want to learn how this codebase works by seeing how agents navigated it."

### Future self
"I want to remember why we made this decision 6 months from now."

## Technical Debt Signals

Can iris detect code quality issues from sessions?

### Potential signals
- Repeated confusion about same area → needs refactoring
- Lots of search before finding things → poor organization
- Same bug fixed multiple times → underlying issue
- Long chains of "wait, that's not right" → unclear interfaces
- Heavy documentation lookups → missing docs

### What iris could produce
- "Hot spots" - code areas that cause trouble
- "Documentation gaps" - things that required external lookup
- "Refactoring candidates" - areas with repeated friction
- "Testing gaps" - areas where errors slip through

### The "iris as tech debt radar" use case
Not replacing static analysis, but complementing it with usage-based signals.

## Collaboration Patterns

Human-agent interaction styles worth noting:

### Patterns to extract
- **Delegation**: "Do X" → agent does X
- **Guidance**: "Try Y" → agent adjusts
- **Correction**: "No, Z" → agent fixes
- **Exploration**: "What about..." → back-and-forth
- **Teaching**: User explains, agent learns
- **Debugging**: Iterative narrowing of problem

### What patterns reveal
- Delegation success rate → agent capability
- Correction frequency → alignment issues
- Exploration depth → problem complexity
- Teaching moments → knowledge gaps

## The Serendipity Factor

Sometimes the most valuable insights are unexpected.

### Examples of serendipity
- "I noticed the agent always avoids this file... turns out it's actually broken"
- "Cross-referencing sessions, this pattern appears everywhere"
- "The agent's 'wrong' approach was actually better for reasons I didn't expect"

### How to enable serendipity
- Don't over-filter
- Allow tangential observations
- Cross-reference broadly
- Ask "what's weird here?"

### The prompt design implication
Include prompts like:
- "What's surprising about this session?"
- "What patterns seem unusual?"
- "What might I be missing?"

## Session Archaeology

Digging into old sessions for insights.

### When to do archaeology
- "How did we solve X last time?"
- "When did this pattern start appearing?"
- "What changed around [date]?"

### Tools needed
- Search/filter across historical sessions
- Timeline visualization
- Diffing between time periods
- "First occurrence" detection

### The long-term memory angle
Iris as institutional memory - what the project knows about itself.

## Prompt Engineering for Iris

The prompts we use matter a lot.

### Current voice profiles
- Default: Conversational, first-person
- Technical: Craft-focused, precise
- Reflective: Journey-focused, introspective

### Prompt components
- System prompt (who you are, what you do)
- Style guide (how to write)
- Context injection (temporal, historical)
- Session content (the actual data)
- Specific questions (what to focus on)

### Prompt iteration strategy
- A/B test different prompts on same sessions
- Track which phrasings produce better outputs
- Build library of effective prompt fragments
- Version control prompts like code

### The meta-prompt question
Could we have an LLM generate better iris prompts? Prompt optimization via LLM?

## Competitive Landscape

What else exists in this space?

### Related tools (not direct competitors)
- **AI session recorders**: Capture but don't analyze
- **Code summarizers**: Analyze code, not sessions
- **Meeting summarizers**: Similar concept, different domain
- **Knowledge bases**: Store but don't generate

### What would a competitor look like?
- SaaS product for "AI coding insights"
- Integration with existing IDEs
- Enterprise features (team dashboards, compliance)

### Iris's positioning
- Open source, self-hosted
- Part of broader Rhizome ecosystem
- Focuses on the Lua/spore workflow
- Prioritizes voice/narrative over metrics
