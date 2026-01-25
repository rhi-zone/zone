# CLAUDE.md

Behavioral rules for Claude Code in the zone repository.

## Project Overview

Zone is a Rhi ecosystem monorepo containing:
- **Lua projects**: Standalone tools (wisteria, file browser, etc.)
- **Seeds**: Project templates for myenv scaffolding
- **Docs**: VitePress documentation

## Structure

```
zone/
├── wisteria/        # Autonomous task execution
│   ├── init.lua     # Entry point (require("wisteria"))
│   └── wisteria/    # Submodules (wisteria.risk, wisteria.session, etc.)
├── seeds/           # Project templates
│   ├── creation/    # seed.toml + template/
│   ├── archaeology/
│   └── lab/
└── docs/            # VitePress documentation
```

## Key Relationships

- **myenv** reads seeds from zone for project scaffolding
- **moonlet** runs Lua projects with LLM integration
- **moss** provides code intelligence via moonlet-moss integration

## Conventions

### Lua Projects

Each project is a directory with:
- `init.lua` - Entry point (loaded via `require("project")`)
- Submodules in a nested directory matching the project name

Example for wisteria:
```lua
-- wisteria/init.lua
local risk = require("wisteria.risk")  -- loads wisteria/wisteria/risk.lua
```

### Seeds

Each seed has:
- `seed.toml` - Manifest with name, description, variables
- `template/` - Files to copy (with `{{variable}}` substitution)

## Development

```bash
nix develop        # Enter dev shell
```

### Running Lua projects

Each project is self-contained. Run from within the project directory:

```bash
cd wisteria
moonlet init          # First time only - creates .moonlet/config.toml
moonlet run .
```

## Commit Convention

Use conventional commits: `type(scope): message`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `docs` - Documentation only
- `chore` - Maintenance (deps, CI, etc.)
- `test` - Adding or updating tests

Scope is optional but recommended for multi-crate repos.

## Core Rules

**Note things down immediately:**
- Bugs/issues -> fix or add to TODO.md
- Design decisions -> docs/ or code comments
- Future work -> TODO.md

**Do the work properly.** When editing Lua projects, test them with moonlet.

## Behavioral Patterns

From ecosystem-wide session analysis:

- **Question scope early:** Before implementing, ask whether it belongs in this crate/module
- **Check consistency:** Look at how similar things are done elsewhere in the codebase
- **Implement fully:** No silent arbitrary caps, incomplete pagination, or unexposed trait methods
- **Name for purpose:** Avoid names that describe one consumer
- **Verify before stating:** Don't assert API behavior or codebase facts without checking
- **Prefer simplicity:** Regular properties over private fields, unless encapsulation is truly needed. Simpler code is easier to debug

## Design Principles

**Unify, don't multiply.** One interface for multiple cases > separate interfaces. Plugin systems > hardcoded switches.

**Simplicity over cleverness.** Functions > abstractions until you need the abstraction. Use ecosystem tooling over hand-rolling.

**Explicit over implicit.** Log when skipping. Show what's at stake before refusing.

**Separate niche from shared.** Don't bloat shared config with feature-specific data. Use separate files for specialized data.

## Negative Constraints

Do not:
- Announce actions ("I will now...") - just do them
- Leave work uncommitted
- Modify seeds without testing with myenv
- Modify Lua projects without testing with moonlet
- Use path dependencies in Cargo.toml - causes clippy to stash changes across repos
- Use `--no-verify` - fix the issue or fix the hook
- Assume tools are missing - check if `nix develop` is available for the right environment
