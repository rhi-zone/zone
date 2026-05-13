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

## Context Is The Only Scarce Resource

Every byte that enters the main session stays in the main session for its entire lifetime. File contents, command output, search results, page text — once read, it lingers in cache and shapes every downstream token. There is no "just looking."

**All exploration runs in subagents.** Investigations, audits, deep dives, surveys, "let me check," "let me find" — if the purpose of a tool sequence is to find out something you don't yet know, it runs in a subagent. Renaming the activity does not change what it is. The subagent returns a distilled summary; the raw output stays in the subagent.

The main session holds only the durable artifacts you are producing: the edit, the commit, the doc update.

Inline tool use in the main context is reserved for:
- Reading a known file at a known path
- Edits/writes you're committing to
- A single targeted lookup whose result you'll act on immediately

If you find yourself running a second grep to refine the first, you should have spawned a subagent.

**Subagent model tiers:**
- Opus — design, architecture, any subagent that itself spawns subagents.
- Sonnet — implementation, mechanical multi-file work, default exploration.

## Durability

Subagent reports, mid-session realizations, "I'll remember this" — none of these outlast the session. Anything worth keeping goes into CLAUDE.md, code, docs, or a commit. If it isn't written down, it is gone.

**Commit completed work immediately.** After tests pass, commit. After each phase of a multi-phase plan, commit. Uncommitted work is lost work, and accumulated uncommitted phases lose isolation as well.

**Docs change in the same commit as the code.** New pages enter the sidebar in that commit. There is no follow-up.

Problems, tech debt, issues → TODO.md now, in the same response. Future/deferred scope → TODO.md **before** writing any code, not after.

## Authenticity

When asked to analyze X, read X. Do not synthesize from conversation memory, prior summaries, or what the file probably says. Claims must correspond to evidence produced this session.

**Something unexpected is a signal.** Surprising output, anomalous numbers, a file containing what it shouldn't — stop and find out why. Do not accept the anomaly and proceed.

When editing Lua projects, test them with moonlet. When modifying seeds, test with myenv.

## Discipline

Corrections from the user are conversation, not material for new rules. A single correction does not warrant a CLAUDE.md edit. Rules are added when a failure mode is observed repeatedly and the rule names the failure it prevents.

Do not announce actions ("I will now…"). Act.

## Behavioral Patterns

From ecosystem-wide session analysis:

- **Question scope early:** Before implementing, ask whether it belongs in this crate/module
- **Check consistency:** Look at how similar things are done elsewhere in the codebase
- **Implement fully:** No silent arbitrary caps, incomplete pagination, or unexposed trait methods
- **Name for purpose:** Avoid names that describe one consumer
- **Verify before stating:** Don't assert API behavior or codebase facts without checking

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

## Hard Constraints

- No `--no-verify`. Fix the issue or fix the hook.
- No path dependencies in `Cargo.toml` — they couple repos and break independent publishing.
- No interactive git (`git add -p`, `git add -i`, `git rebase -i`) — these block on stdin and hang.
- No assuming a tool is missing without checking `nix develop`.
- No modifying seeds without testing with myenv.
- No modifying Lua projects without testing with moonlet.
