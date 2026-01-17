# Seeds

Project templates for nursery scaffolding.

## Available Seeds

### creation

New project from scratch.

```toml
[seed]
name = "creation"
description = "New project from scratch"

[variables]
name = { default = "" }
version = { default = "0.1.0" }
```

### archaeology

Lift a legacy game. Same structure as creation, designed for importing existing projects.

### lab

Full ecosystem sandbox with directory structure for pipelines and assets:

```
template/
├── nursery.toml
├── .gitignore
├── dump/
├── assets/
│   ├── raw/
│   └── generated/
└── src/
    └── pipelines/
        └── assets.dew
```

## Usage

Seeds are used by nursery for project scaffolding:

```bash
nursery new --seed creation my-project
```

## Template Variables

Templates use `{{variable}}` syntax for substitution during scaffolding.
