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

If a tool appears missing, you are outside `nix develop`. Do not assume the tool is unavailable to the project.

## Behavioral Patterns

From ecosystem-wide session analysis:

- **Question scope early:** Before implementing, ask whether it belongs in this crate/module
- **Check consistency:** Look at how similar things are done elsewhere in the codebase
- **Implement fully:** No silent arbitrary caps, incomplete pagination, or unexposed trait methods
- **Name for purpose:** Avoid names that describe one consumer
- **Verify before stating:** Don't assert API behavior or codebase facts without checking

When editing Lua projects, test them with moonlet. When modifying seeds, test with myenv.

## Workflow

**Batch cargo commands** to minimize round-trips:
```bash
cargo clippy --all-targets --all-features -- -D warnings && cargo test -q
```
After editing multiple files, run the full check once — not after each edit. Formatting is handled automatically by the pre-commit hook (`cargo fmt`).

**Prefer `cargo test -q`** over `cargo test` — quiet mode only prints failures, significantly reducing output noise and context usage.

**When making the same change across multiple crates**, edit all files first, then build once.

**Minimize file churn.** When editing a file, read it once, plan all changes, and apply them in one pass. Avoid read-edit-build-fail-read-fix cycles by thinking through the complete change before starting.

**Use `normalize view` for structural exploration:**
```bash
~/git/rhizone/normalize/target/debug/normalize view <file>    # outline with line numbers
~/git/rhizone/normalize/target/debug/normalize view <dir>     # directory structure
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

## Repo-Local Hard Constraints

- No modifying seeds without testing with myenv.
- No modifying Lua projects without testing with moonlet.

<!-- BEGIN ECOSYSTEM RULES -->

## Ecosystem Design Principles

Cross-cutting principles distilled from the ecosystem's own decisions (synthesized in `docs/decisions/throughlines.md`). Apply them when building new repos and recording decisions. (Already-encoded principles — independent-tools / no-path-deps, the delegation model, CLAUDE.md-as-control-surface — live in their own sections and are not repeated here.)

- **Prefer data over code at every seam.** Serializable AST / struct / JSON over closures, embedded DSLs, or source text — so artifacts cache, replay, transport, and diff.
- **Library-first; projection-from-one-definition.** The typed library is the source of truth; CLI / HTTP / MCP / WebSocket / JSON surfaces are generated projections, never hand-rolled per surface.
- **Capability security.** Hosts grant pre-opened handles; code only attenuates what it is given; nothing forges authority; allow-list over deny-list.
- **The LLM is an oracle at the leaves, never the control loop.** Determinism is a hard invariant: seeded RNG, event-log replay, build-time-only inference. Per-query LLM in the hot loop is a defect.
- **Trust comes from verifiable evidence, not authority.** Verbatim snippets, pinned-commit permalinks, claim→node citation — never a bare reference.
- **Retire, don't deprecate; collapse asymmetries to primitives.** Remove backward-compat aliases rather than carry them; reduce N special cases to their irreducible primitives.
- **Validate against reality; tests are the spec.** Load-bearing substrates are validated against real corpora; fixtures and tests define correctness, not aspirational specs.

## Hard Constraints

- No `--no-verify`. Fix the issue or fix the hook.
- No path dependencies in `Cargo.toml` — they couple repos and break independent publishing.
- No interactive git (no `git rebase -i`, no `git add -i`, no `--no-edit` on rebase).
- No suggesting project names. LLMs are bad at this; refine the conceptual space only.
- No tracking cross-project issues in conversation — they go in TODO.md in the affected repo.
- No ecosystem changes without checking all affected repos.
- No assuming a tool is missing without checking `nix develop`.
- Commit completed work in the same turn it finishes. Uncommitted work is lost work.

## Meta

- Something unexpected is a signal. Stop and find out why. Do not accept the anomaly and proceed.
- Corrections from the user are conversation, not material for new rules. Rules are added when a failure mode is observed repeatedly.

<!-- END ECOSYSTEM RULES -->
