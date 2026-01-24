# Zone

Rhi ecosystem monorepo: Lua-based tools, scaffolds, and orchestration.

## Structure

```
zone/
├── wisteria/        # Autonomous task execution
│   ├── init.lua     # Entry point
│   └── wisteria/    # Submodules
├── seeds/           # Project templates for myenv
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

### Running projects via moonlet

Each Lua project is self-contained in its own directory. To run a project:

```bash
cd wisteria
moonlet init          # First time only - creates .moonlet/config.toml
moonlet run .
```

### Scaffolding new projects

```bash
# Use myenv with zone seeds
myenv new my-project --seed zone:creation
```

## Development

```bash
nix develop        # Enter dev shell
bun run dev        # Start docs server (from docs/)
```
