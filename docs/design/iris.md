# Iris: Design Document

Refined design decisions, distilled from [brainstorm](./iris-brainstorm.md).

## Vision

Agents as practitioners sharing craft knowledge, not reporters summarizing data.

Like a developer writing "I ran into something interesting today..." - but the developer is an AI agent reflecting on its coding sessions.

## Primary Use Case

**Public content generation** (rue-lang.dev/blog style)

An agent analyzes its own sessions and writes about what it learned, what was tricky, what patterns emerged. Output is blog posts or similar shareable content.

Why this use case first:
- Clear success criteria (is it interesting to read?)
- Matches the inspiration (rue-lang.dev)
- Forces good voice/narrative quality
- Other use cases (internal knowledge, FAQ generation) can build on this foundation

## MVP Scope

### What's In

```bash
iris --recent 5              # Analyze 5 most recent sessions
iris --recent 5 --voice technical   # With voice profile
iris session.jsonl           # Analyze specific session
```

Core flow:
1. Parse session(s) via spore-sessions
2. Format for LLM context
3. One LLM call with voice profile prompt
4. Output markdown

### What's Out (for now)

- Embeddings / vector storage
- Clustering / thematic grouping
- RAG retrieval
- Real-time analysis
- Dashboards / visualization
- Multi-agent comparison
- Feedback loops
- Publishing automation

These are documented in the brainstorm for future consideration.

## Architecture

### Simple Pipeline

```
Session logs → Parse → Format → LLM → Markdown
     ↑           ↑        ↑       ↑
  .jsonl    spore-    truncate/  voice
  files     sessions  structure  profile
```

No intermediate storage, no embeddings, no clustering. Just read → think → write.

### Why Simple First

From brainstorm "The 'why build this' question":
- For one-off insights, you could just prompt Claude Code directly
- Iris adds value through: reproducibility, automation, iteration on prompts
- But that value doesn't require infrastructure complexity
- Start simple, add complexity only when we hit real limitations

### Extension Points

When/if we need more:
- **Temporal coherence**: Add `--track-progress` with `.iris/history.json`
- **Session splitting**: Add `--split-sessions` for multi-day sessions
- **Domain clustering**: Add `--cluster-domains` for thematic grouping
- **Embeddings**: Add spore-embed when retrieval becomes necessary

Each extension is opt-in, independent.

## Voice & Style

### Default Voice

Conversational, first-person, practitioner tone:
- "I noticed something interesting..."
- "What surprised me was..."
- "I kept running into..."

### Style Principles (from ablogger)

- Tell a story, don't list facts
- Be opinionated
- Show don't tell
- No buzzwords
- Ignore the boring stuff

### Voice Profiles

| Profile | Tone | Use When |
|---------|------|----------|
| default | Conversational, friendly | General blog posts |
| technical | Precise, craft-focused | Technical deep-dives |
| reflective | Introspective, journey-focused | Learning/growth posts |

## Key Design Decisions

### Decision: No Required External Infrastructure

**Choice**: Core iris works without embeddings, vector DBs, or external services beyond the LLM.

**Rationale**:
- Lower barrier to entry
- For small session counts, context window is sufficient
- Complexity should be opt-in, not required

**Note**: This doesn't mean "no embeddings ever" - if spore-embed exists and user wants it, clustering/retrieval can be an optional enhancement. The point is: basic iris should work out of the box.

### Decision: State Tracking Available

**Choice**: State tracking (`--track-progress`) exists for reproducibility.

**Rationale**:
- "Run iris at this specific point" requires knowing what state we saw
- Helps avoid repetition across runs
- Enables incremental analysis ("what's new since last time")

**Open question**: Should this be on by default? Probably yes for "live" analysis use cases.

### Decision: Markdown Output, Publishing Agnostic

**Choice**: Output markdown to stdout (or file with --output). No built-in publishing.

**Rationale**:
- Universal format
- Easy to pipe, redirect, integrate
- Iris is workflow/blog-software agnostic
- User decides where output goes (VitePress, Hugo, Ghost, whatever)

**Future consideration**: Could add frontmatter generation for common static site generators.

### Decision: Single vs Multi-Stage (TBD)

**Current**: One prompt → one response.

**But**: LLMs have fixed "thinking budget" per output token. Multi-stage synthesis (like ablogger) gives more total reasoning:
- Stage 1: Extract observations per session/theme
- Stage 2: Synthesize into narrative

**Trade-offs**:
- Single: Simpler, faster, cheaper
- Multi: More reasoning, potentially better insights, more API calls

**Decision**: Test both, measure quality difference. Start with single for simplicity, add multi-stage if output quality warrants it.

## The "So What" Test

Every insight should pass this test. From brainstorm:

**Bad**: "The agent used the Read tool 47 times"
**Good**: "The agent kept re-reading the same file - suggests the code structure is confusing"

The insight ladder:
1. Observation (what happened) ← avoid stopping here
2. Pattern (what keeps happening)
3. Implication (why it matters)
4. Action (what to do about it)

Prompts should encourage levels 2-4.

## Anti-Goals

What iris explicitly should NOT be:
- **Not documentation**: Insights ≠ docs. Different purpose.
- **Not project management**: Narrative ≠ task tracking.
- **Not surveillance**: Patterns ≠ monitoring.
- **Not code review**: Insights about code ≠ merge review.

## Open Questions

Decisions deferred until we have real usage data:

1. **Multi-stage seems right**: Two arguments converge here:
   - *Segmentation over truncation*: Don't cut content, segment it. Human/algo deciding what to drop is MORE lossy than letting LLM see everything. Input tokens cheap, output expensive.
   - *More thinking*: LLMs have fixed reasoning budget per output token. More stages = more total reasoning.

   Both argue for: segment → per-segment observations → synthesize. Test to confirm.

2. **Default feature flags**: Modules exist for history/split/cluster/temporal. Should some be on by default? Low cost if toggleable.

## Implementation Status

- [x] Project structure (`iris/init.lua`)
- [x] Session parsing via spore-sessions capability
- [x] LLM generation via spore-llm capability
- [x] Voice profiles in `iris/iris/prompts.lua`
- [x] Session formatting in `iris/iris/format.lua`
- [x] CLI with `--list`, `--recent`, `--multi`
- [x] Temporal modules (history, split, cluster, temporal) - ready but not tested
- [ ] **Testing with actual sessions** ← blocked on spore build
- [ ] Iterate on prompts based on output quality
- [ ] Decide on publishing workflow

## Next Steps

1. **Test basic flow**: `iris --recent 3` on real Claude Code sessions
2. **Evaluate output**: Is it interesting? Does voice feel right?
3. **Iterate prompts**: Tune based on what works/doesn't
4. **Decide on state**: Is `--track-progress` needed, or is stateless fine?
5. **Publishing**: Figure out how output becomes blog posts
