# Wisteria

Autonomous task execution agent for the Rhizome ecosystem.

## Overview

Wisteria is a multi-role agent system with:
- **Planner** - Breaks down tasks into steps
- **Explorer** - Investigates codebases via moss integration
- **Evaluator** - Assesses outputs and decides next actions

## Roles

- **Investigator** - Questions and exploration (default)
- **Auditor** - Security and quality checks
- **Refactorer** - Code modifications

## Features

- Session checkpointing and resume
- Long-term memory (`.moss/memory/facts.md`)
- Working memory with curation (`$(keep)`, `$(drop)`)
- Shadow worktree for safe editing
- Risk assessment for edits
- Auto-validator detection

## Usage

```bash
cd wisteria
spore init          # First time only
spore run .
```

## Source

Located at `/wisteria` in the zone repository.
