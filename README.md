# Flora

Rhizome ecosystem monorepo: Lua-based tools, scaffolds, and orchestration.

## Structure

```
flora/
├── agent/           # Autonomous task execution
│   ├── init.lua     # Entry point
│   └── agent/       # Submodules
├── seeds/           # Project templates for nursery
│   ├── creation/    # New project from scratch
│   ├── archaeology/ # Lift a legacy game
│   └── lab/         # Full ecosystem sandbox
└── docs/            # VitePress documentation
```

## Projects

| Project | Description |
|---------|-------------|
| agent | Autonomous task execution with LLM + moss |

## Usage

### Running projects via spore

Each Lua project is self-contained in its own directory. To run a project:

```bash
cd agent
spore init          # First time only - creates .spore/config.toml
spore run .
```

### Scaffolding new projects

```bash
# Use nursery with flora seeds
nursery new my-project --seed flora:creation
```

## Development

```bash
nix develop        # Enter dev shell
bun run dev        # Start docs server (from docs/)
```
