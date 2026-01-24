# Zone

Rhi ecosystem monorepo: Lua-based tools, scaffolds, and orchestration.

## Structure

```
zone/
├── wisteria/        # Autonomous task execution
│   ├── init.lua     # Entry point
│   └── wisteria/    # Submodules
├── seeds/           # Project templates for nursery
│   ├── creation/    # New project from scratch
│   ├── archaeology/ # Lift a legacy game
│   └── lab/         # Full ecosystem sandbox
└── docs/            # VitePress documentation
```

## Projects

| Project | Description |
|---------|-------------|
| wisteria | Autonomous task execution with LLM + moss |

## Usage

### Running projects via spore

Each Lua project is self-contained in its own directory. To run a project:

```bash
cd wisteria
spore init          # First time only - creates .spore/config.toml
spore run .
```

### Scaffolding new projects

```bash
# Use nursery with zone seeds
nursery new my-project --seed zone:creation
```

## Development

```bash
nix develop        # Enter dev shell
bun run dev        # Start docs server (from docs/)
```
