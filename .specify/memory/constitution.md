# PodcastAfterListening Constitution

## Core Principles

### I. Language Requirement (語言規範)
**All specifications, implementation plans, and task lists MUST be written in Traditional Chinese (zh-TW).**
所有規格書 (spec.md)、實作計畫 (plan.md) 與任務清單 (tasks.md) 必須使用繁體中文撰寫。這確保了團隊溝通的清晰度與一致性。

### II. Spec-Driven Development (SDD)
We follow a Spec-Driven Development workflow. No code is written without a corresponding specification (`spec.md`) and implementation plan (`plan.md`). Features are developed in dedicated branches (e.g., `specs/NNN-feature-name`).

### III. User-Centric Design
Features must be defined by User Stories and measurable Success Criteria. We focus on the "What" and "Why" in specs, leaving the "How" for the planning phase.

### IV. Verification First
Every feature must have defining Acceptance Scenarios and Independent Tests. Verification steps are integral to the `tasks.md` and must be executed before marking a task as complete.

## Development Standards

- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Supabase.
- **Code Quality**: Follow specific linting and formatting rules. Modularize code into reusable components and hooks.
- **Agent Context**: Keep `CLAUDE.md`, `GEMINI.md` and other agent contexts updated with the latest architectural decisions.

## Governance

This constitution defines the non-negotiable rules for the project. Changes to these principles require team consensus and must be reflected here.

**Version**: 1.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
