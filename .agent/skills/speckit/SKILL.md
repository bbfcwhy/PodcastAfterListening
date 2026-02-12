---
name: speckit
description: A Spec-Driven Development (SDD) workflow assistant that helps manage feature specifications, implementation plans, and context updates.
---

# Speckit Skill

This skill provides a set of tools to streamline the Spec-Driven Development workflow. It helps you create feature branches, set up implementation plans, generate task lists, and keep the agent context in sync.

## Commands

### `new`
Creates a new feature branch and sets up the initial directory structure in `specs/`.

**Usage:**
```bash
./.specify/scripts/bash/create-new-feature.sh "Feature Description"
```
**Options:**
- `--short-name <name>`: Provide a custom short name for the branch.
- `--number <N>`: Manually specify the branch number.

### `plan`
Sets up the `plan.md` file for the current feature based on the template.

**Usage:**
```bash
./.specify/scripts/bash/setup-plan.sh
```

### `tasks`
Sets up the `tasks.md` file for the current feature based on the template.

**Usage:**
```bash
./.specify/scripts/bash/setup-tasks.sh
```

### `check`
Checks if all prerequisites (files, directories) are met for the current feature.

**Usage:**
```bash
./.specify/scripts/bash/check-prerequisites.sh
```
**Options:**
- `--require-tasks`: Require `tasks.md` to exist.
- `--include-tasks`: Include `tasks.md` in the output list.

### `update`
Updates the agent context files (e.g., `CLAUDE.md`, `GEMINI.md`) based on the current feature's plan.

**Usage:**
```bash
./.specify/scripts/bash/update-agent-context.sh [agent_type]
```
**Agent Types:**
`claude`, `gemini`, `copilot`, `cursor-agent`, `qwen`, `opencode`, etc. (Leave empty to update all).

## Workflow

1.  **Start a new feature:**
    ```bash
    ./.specify/scripts/bash/create-new-feature.sh "My New Feature"
    ```
2.  **Create implementation plan:**
    ```bash
    ./.specify/scripts/bash/setup-plan.sh
    ```
    (Edit `specs/NNN-my-new-feature/plan.md`)
3.  **Generate tasks:**
    ```bash
    ./.specify/scripts/bash/setup-tasks.sh
    ```
    (Edit `specs/NNN-my-new-feature/tasks.md`)
4.  **Update context:**
    ```bash
    ./.specify/scripts/bash/update-agent-context.sh
    ```
5.  **Develop & Verify:**
    (Proceed with standard development cycle)
6.  **Check status:**
    ```bash
    ./.specify/scripts/bash/check-prerequisites.sh
    ```
