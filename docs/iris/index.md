# Iris

Agent-authored insights from coding sessions.

Iris reads agentic session logs (Claude Code, Gemini CLI, etc.) and generates human-readable insights - what happened, what was learned, what patterns emerged.

## Quick Start

```bash
cd your-project
spore run /path/to/iris -- --recent 5
```

## Usage

```bash
# List available sessions
iris --list [project-path]

# Analyze recent sessions
iris --recent N

# Analyze specific sessions
iris session1.jsonl session2.jsonl

# Analyze multiple sessions for patterns
iris --multi session1.jsonl session2.jsonl
```

## Options

### Voice Profiles

```bash
iris --recent 5 --voice default      # Conversational, first-person
iris --recent 5 --voice technical    # Craft-focused, precise
iris --recent 5 --voice reflective   # Journey-focused, introspective
```

### Temporal Coherence

```bash
# Track what's been written to avoid repetition
iris --recent 10 --track-progress

# Show current history state
iris --show-history

# Clear history
iris --clear-history
```

### Session Processing

```bash
# Split multi-day sessions at time gaps (>4h)
iris --recent 5 --split-sessions

# Show where splits would occur (dry run)
iris --analyze-splits session.jsonl

# Group sessions by domain/theme
iris --recent 20 --cluster-domains

# Show domain distribution (dry run)
iris --show-clusters
```

### Temporal Perspective

```bash
# Write from perspective of a past date
iris --recent 50 --as-of 2026-01-05
```

### Output

```bash
# Write to file instead of stdout
iris --recent 5 --output insights.md

# Filter by session format
iris --recent 10 --format claude-code
```

## Configuration

Iris runs via spore. Configure in `.spore/config.toml`:

```toml
[project]
entry = "init.lua"

[plugins]
llm = true
sessions = true

[sandbox]
require_builtins = true
require_project = true

[caps.sessions]
project = {}

[caps.llm]
default = {}
```

## State Files

When using `--track-progress`, iris maintains state in `.iris/`:

```
.iris/
  history.json    # Topics covered, sessions processed
```

Example history.json:
```json
{
  "topics_covered": ["authentication", "error-handling", "api-design"],
  "sessions_processed": ["abc123", "def456"],
  "last_run": "2026-01-19T10:30:00Z",
  "run_count": 5
}
```

## Modules

Iris is composed of several modules:

- `iris.prompts` - Voice profiles and system prompts
- `iris.format` - Session formatting for LLM context
- `iris.history` - State tracking for temporal coherence
- `iris.split` - Time gap detection and session splitting
- `iris.cluster` - Domain extraction and session clustering
- `iris.temporal` - Date handling and temporal perspective

## See Also

- [Design Document](../design/iris.md) - Architecture and future directions
- [spore](https://github.com/rhizome-lab/spore) - Lua runtime for iris
- [moss-sessions](https://github.com/rhizome-lab/moss) - Session parsing
