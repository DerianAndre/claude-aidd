# Evolution Log

> Unified project memory and workflow improvement tracker. Captures decisions, mistakes, conventions, and workflow friction in one file.

**Last Updated**: 2026-03-10

---

## Decisions

Architectural and technical decisions with context. Consult before planning.

| Date       | Decision                                                 | Context                                                                             | Rationale                                                                                               | Alternatives Rejected                                                                         |
| ---------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2026-03-07 | Quick Capture replaces aspirational evolution invocation | Every workflow had "invoke evolution.md" but it never happened; MEMORY.md was empty | Lightweight 3-step inline protocol (Assess→Write→Timestamp) makes capture mandatory and fast (~30s)     | Full CDPG after every workflow (too heavy), no evolution (loses learning)                     |
| 2026-03-07 | STACK.md separates project specifics from framework      | CLAUDE.md mixed orchestration rules with project-specific paths, commands, versions | All project identity/stack/commands in STACK.md; CLAUDE.md + workflows are copy-pastable to any project | Single CLAUDE.md for everything (not portable), inline specifics in each workflow (scattered) |
| 2026-03-10 | fintech-classification removed from AIDD framework | AIDD is sector/company-type agnostic — framework must not assume any industry vertical | Portability across any domain without fintech coupling | Keep fintech-classification (too sector-specific) |

---

## Mistakes

Errors encountered with root cause analysis. Consult before implementing.

| Date | What Went Wrong | Root Cause | Fix Applied | Prevention |
| ---- | --------------- | ---------- | ----------- | ---------- |

---

## Conventions

Project-specific patterns and coding standards. Consult before implementing.

| Category    | Convention                                                                                               | Rationale                                                                        | Examples                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Workflows   | Evolution Hooks use 3-step Quick Capture inline, not separate workflow invocation                        | Quick Capture is fast enough to always execute; full CDPG is on-demand only      | `1. Assess 2. Write 3. Timestamp` in every workflow's Evolution Hook section |
| Portability | Workflows use action aliases (typecheck, lint, test:targeted, quality-gate) not package-manager commands | STACK.md maps aliases to actual commands; workflows stay copy-pastable           | `typecheck` in workflow → `pnpm check-types` in STACK.md                     |
| Workflows | Custom AIDD frontmatter fields use descriptive strings: `complexity`, `effort`, `mode` | Claude Code ignores unknown fields; AIDD orchestrator/META consumes them | `complexity: highest`, `effort: highest`, `mode: team` |

---

## Workflow Friction

Captured after each workflow execution. 2+ similar entries = pattern.

| Date | Workflow | Phase | Type | Description | Severity | Status |
| ---- | -------- | ----- | ---- | ----------- | -------- | ------ |

**Type**: `unclear` / `skipped` / `improvised` / `missing-info` / `disproportionate-effort`
**Severity**: `low` / `medium` / `high`
**Status**: `captured` / `pattern-detected` / `resolved` / `deferred-YYYY-MM-DD`

---

## Cross-Workflow Patterns

Detected when 2+ similar friction entries span different workflows.

| Pattern | Workflows | Occurrences | Proposal | Status |
| ------- | --------- | ----------- | -------- | ------ |

---

## META Refinement Queue

Structural signals requiring `.claude/` config changes.

| Date | Workflow | Signal | Evidence | Status |
| ---- | -------- | ------ | -------- | ------ |
