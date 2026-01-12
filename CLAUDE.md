# CLAUDE.md

Behavioral rules for Claude Code in the flora repository.

## Project Overview

Flora is a Rhizome ecosystem monorepo containing:
- **Lua projects**: Standalone tools (agent, file browser, etc.)
- **Seeds**: Project templates for nursery scaffolding
- **Docs**: VitePress documentation

## Structure

```
flora/
├── agent/           # Autonomous task execution
│   ├── init.lua     # Entry point (require("agent"))
│   └── agent/       # Submodules (agent.risk, agent.session, etc.)
├── seeds/           # Project templates
│   ├── creation/    # seed.toml + template/
│   ├── archaeology/
│   └── lab/
└── docs/            # VitePress documentation
```

## Key Relationships

- **nursery** reads seeds from flora for project scaffolding
- **spore** runs Lua projects with LLM integration
- **moss** provides code intelligence via spore-moss integration

## Conventions

### Lua Projects

Each project is a directory with:
- `init.lua` - Entry point (loaded via `require("project")`)
- Submodules in a nested directory matching the project name

Example for agent:
```lua
-- agent/init.lua
local risk = require("agent.risk")  -- loads agent/agent/risk.lua
```

### Seeds

Each seed has:
- `seed.toml` - Manifest with name, description, variables
- `template/` - Files to copy (with `{{variable}}` substitution)

## Development

```bash
nix develop        # Enter dev shell
```

## Core Rules

**Note things down immediately:**
- Bugs/issues -> fix or add to TODO.md
- Design decisions -> docs/ or code comments
- Future work -> TODO.md

**Do the work properly.** When editing Lua projects, test them with spore.

## Negative Constraints

Do not:
- Announce actions ("I will now...") - just do them
- Leave work uncommitted
- Modify seeds without testing with nursery
- Modify Lua projects without testing with spore
