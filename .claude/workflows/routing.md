---
name: routing
description: Workflow index — quick reference for all orchestration workflows with purpose and trigger conditions
complexity: low
mode: reference
model: any
effort: minimal
fintech-classification: fintech-neutral
---

# Workflows — Routing Index

> Quick reference for multi-step orchestration workflows.

---

## Primary Path

For all feature development, use only:

1. **`bap.md`** — plan the work (Brainstorm → Ask → Plan)
2. **`eth.md`** — execute, test, auto-review, and ship (Execute → Test → Review → Human)

ETH now includes autonomous code review (Phase R) before human sign-off — you do not need to invoke `pr-review.md` separately for features built through ETH.

Everything else in this index is a specialist workflow for specific ad-hoc scenarios.

---

## Decision Table

| File                                               | Purpose                                                                                     | Use When                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [bap.md](bap.md)                                   | Brainstorm-Ask-Plan — pre-implementation with researcher agent team                         | Any non-trivial feature, enhancement, or design work; structured questioning before planning           |
| [eth.md](eth.md)                                   | Execute-Test-Human-review — post-plan implementation with builder + QE agent teams          | Implementing an approved plan with parallel builders, continuous QE validation, and human gates        |
| [security-audit.md](security-audit.md)             | OWASP security audit with dynamic auditor team + fintech compliance gates                   | Pre-production deployment, post-incident review, compliance audits, PR quality gates                   |
| [pr-review.md](pr-review.md)                       | Self-review before opening a pull request with specialized reviewers                        | External PRs, legacy branches, or CI                                                                   |
| [architecture-audit.md](architecture-audit.md)     | Architecture purity audit with dynamic auditor team (imports + dependencies + DDD patterns) | Verifying domain purity, port/adapter boundaries, framework agnosticism                                |
| [design.md](design.md)                             | Frontend design & UX audit (WCAG, heuristics, UI quality, design system, perf)              | Accessibility checks, UX heuristic evaluation, component quality, responsive, performance              |
| [docs.md](docs.md)                                 | Documentation sync — stale refs, ADRs, API docs, plan lifecycle, READMEs, runbooks          | After major features, before releases, post-refactoring, API contract updates, periodic health checks  |
| [feature-branch.md](feature-branch.md)             | Git Flow checklist — branch, commit, PR, merge                                              | Creating feature branches, structuring commits, preparing PRs                                          |
| [product.md](product.md)                           | Gherkin scenario generation and Definition of Ready checklist                               | Writing BDD scenarios (Given-When-Then), refining requirements before development                      |
| [technology-selection.md](technology-selection.md) | Evidence-based technology selection — TKB query, constraint filtering, decision capture     | Choosing frameworks, databases, runtimes, or tools based on project constraints                        |
| [meta-refinement.md](meta-refinement.md)           | META protocol for `.claude/` config file analysis and improvement                           | Improving, auditing, or cross-project aligning any `.claude/` file (CLAUDE.md, rules, workflows, etc.) |
| [evolution.md](evolution.md)                       | Project memory + workflow friction capture (Quick Capture after every workflow, Full CDPG on demand) | Final step of every workflow (Quick Capture) or on-demand review of accumulated friction (Full CDPG)  |
