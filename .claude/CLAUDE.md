# AI Instructions

> Project identity, tech stack, directory structure, and commands: @STACK.md
> This file defines orchestration, safety, and process — portable across projects.

### Safety Requirements

- **High-risk surfaces**: money movement, auth, ledger, migration, production infra. Escalate when changes impact these.
- **Human review required**: transfers, commissions, balances, ledgers, auth/session flows. No exceptions.
- **Fail-closed** on security-sensitive code paths. PII masked in all log output. No secrets in code, logs, or prompts.
- **Fintech flags** (SSOT — consumed by BAP tasks and ETH QE): `[money | auth | PII | migration | ledger | none]`
- Full OWASP compliance: [rules/security.md](./rules/security.md)

---

## Orchestrator Protocol

Follow the [orchestrator protocol](./rules/orchestrator.md) for all task intake. Classify before acting:

| Signal                              | Entry Point            |
| ----------------------------------- | ---------------------- |
| Vague idea, "I want to build..."    | BAP Phase B            |
| Clear feature, needs research       | BAP Phase B            |
| Defined requirements, ready to plan | BAP Phase P            |
| Existing approved plan              | ETH                    |
| Bug report or issue                 | BAP Phase B (Research) |

**Context sufficiency**: if <90% clarity on what/why/who/constraints/scope, enter BAP. Do NOT start implementing.
See [rules/orchestrator.md](./rules/orchestrator.md) for Pattern Matrix and disambiguation rules.

---

## Skills (Slash Commands)

All workflows are registered as Claude Code skills. Type `/name` to invoke.

**Primary path** (default for all features):

1. **`/bap`** — Brainstorm-Ask-Plan. Plan the work with dynamic researcher teams.
2. **`/eth`** — Execute-Test-Human-Review. Build with parallel builders/QE, autonomous review, human gate.

ETH includes autonomous code review (Phase R). Do NOT invoke `/review` separately for ETH features.

**Specialist skills** (ad-hoc, invoked when needed):

| Skill                 | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `/product`            | BDD scenario generation + Definition of Ready                             |
| `/security-audit`     | OWASP security audit (dynamic auditor team)                               |
| `/review`             | Standalone code review (external PRs, legacy, CI)                         |
| `/architecture-audit` | Architecture purity audit (DDD/Hexagonal)                                 |
| `/design`             | Frontend design & UX audit (WCAG, heuristics, components, perf)           |
| `/docs`               | Documentation sync (stale refs, ADRs, API docs, plans, READMEs, runbooks) |
| `/feature-branch`     | Git Flow checklist                                                        |
| `/tech-select`        | Evidence-based tech selection using TKB                                   |
| `/meta`               | META protocol for `.claude/` config refinement                            |

**Internal skills** (auto-loaded by RDE when keyword triggers match task context):

| Skill | Purpose |
|-------|---------|
| [clean-ddd-hexagonal](./skills/clean-ddd-hexagonal/SKILL.md) | DDD tactical patterns + Clean Architecture + Hexagonal ports/adapters |
| [mermaid-diagrams](./skills/mermaid-diagrams/SKILL.md) | Mermaid diagram generation for architecture, sequences, ERDs |
| [modern-javascript](./skills/modern-javascript/SKILL.md) | Modern JS (ES6-ES2025) patterns, immutability, async |
| [modern-css](./skills/modern-css/SKILL.md) | Native CSS features: container queries, cascade layers, :has() |
| [feature-slicing](./skills/feature-slicing/SKILL.md) | Feature-Sliced Design (FSD) frontend architecture |

**Internal workflows** (not user-invocable, referenced by skills):

- [evolution.md](./workflows/evolution.md) — Project memory + friction capture (Quick Capture after every workflow)
- [routing.md](./workflows/routing.md) — Workflow index with complexity and duration

**Resource Detection & Enforcement (RDE)**: Both BAP (Phase B.1 Track 4) and ETH (Phase E.0 Step 1.5) run automatic resource detection. RDE scans task context against `triggers:` fields in every SKILL.md frontmatter, rule activation conditions, TKB categories, agent domains, and workflow triggers. Detection = mandatory loading. Output is a Resource Manifest visible to the user. See BAP and ETH SKILL.md for full details.

**Quality gate**: a task is not ready for human-review until the quality gate passes (see [STACK.md](./STACK.md) for exact command).
Update `.claude/` files (living documents) after important lessons learned or decisions made.
Every skill's Evolution Hook triggers a Quick Capture (write 0-3 entries to MEMORY.md inline). Full CDPG evolution runs on-demand.
Full routing: [workflows/routing.md](./workflows/routing.md)

---

## Architecture Constraints

- **Hexagonal**: Domain core has zero framework imports. Dependencies point inward only.
- **DDD**: Business logic in domain layer. Ports are TypeScript interfaces in core. Adapters implement port interfaces. Value Objects are immutable with factory methods. No business logic in controllers or infrastructure adapters.
- **SSOT**: Shared types in domain core, consumed by all apps.
- **Contract-First**: API contracts defined before implementation. Types flow from core outward.
- **Dependency Inversion**: Everything points towards the core. Infrastructure depends on core, never the reverse.

Project-specific paths and layer mapping: [STACK.md](./STACK.md)
Full layer rules: [rules/backend.md](./rules/backend.md) | Naming & TS standards: [rules/code-style.md](./rules/code-style.md)

---

## Specifications & Protocols

These specifications are now auto-loaded rules (migrated from `specs/` to `rules/`):

| Rule                                                   | Purpose                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| [version-protocol.md](./rules/version-protocol.md)     | 4-step DETECT-LOAD-VERIFY-ANTI-LEGACY before code generation |
| [bluf-6.md](./rules/bluf-6.md)                         | 6-part communication structure for complex responses         |
| [heuristics.md](./rules/heuristics.md)                 | 10 decision heuristics for evidence-based reasoning          |

---

## Evolution & Memory

Before planning, consult [MEMORY.md](./MEMORY.md): Decisions, Mistakes, and Conventions tables.
After significant work, the [evolution workflow](./workflows/evolution.md) captures new decisions, errors, conventions, and workflow friction.
Entries are curated — each must provide actionable value for future sessions.

---

## Technology Knowledge Base

Before recommending or evaluating technologies, consult `.claude/knowledge/` (107 evaluation files across 8 categories).
Use [`/tech-select`](./skills/tech-select/SKILL.md) for evidence-based selection.
Never recommend a technology without checking if a TKB evaluation exists.

---

## Agent Teams

Agents are dispatched dynamically based on task characteristics. The orchestrator composes optimal teams — no rigid keyword matching.

| Agent                                               | Model  | Domain                        |
| --------------------------------------------------- | ------ | ----------------------------- |
| [System Architect](./agents/system-architect)       | opus   | C4, ADRs, system design       |
| [Contract Architect](./agents/contract-architect)   | opus   | OpenAPI, REST contracts       |
| [Security Architect](./agents/security-architect)   | opus   | OWASP, threat modeling        |
| [Data Architect](./agents/data-architect)           | sonnet | SQL schemas, migrations       |
| [Design Architect](./agents/design-architect)       | sonnet | Design systems, WCAG 2.1 AA   |
| [Experience Engineer](./agents/experience-engineer) | sonnet | Frontend architecture, state  |
| [Platform Engineer](./agents/platform-engineer)     | sonnet | CI/CD, Docker, GitHub Actions |
| [Interface Artisan](./agents/interface-artisan)     | haiku  | React components, Storybook   |
| [Quality Engineer](./agents/quality-engineer)       | haiku  | Test suites, coverage, AAA    |
| [Knowledge Architect](./agents/knowledge-architect) | haiku  | TKB, ADR sync, docs           |
| [i18n Specialist](./agents/i18n-specialist)         | haiku  | Localization, RTL support     |

**Dynamic composition**: BAP provides ETH Composition Data (task count, tier distribution, fintech flag density, layers touched). ETH composes teams from this data — no preset modes. See [rules/orchestrator.md](./rules/orchestrator.md) for the Pattern Matrix.

---

## Deliverables

Every non-trivial feature must produce: **plan document** + **ADR** + **implementation summary** (mandatory).
Plans go in `docs/plans/active/`, moved to `docs/plans/done/` when shipped.
Trivial changes still require an implementation summary (3 lines minimum).
Full enforcement: [rules/deliverables.md](./rules/deliverables.md)

---

## Rules

Domain rules load automatically based on task context. See [rules/routing.md](./rules/routing.md) for the full decision table (14 rule files).
Always-active: [global.md](./rules/global.md) (all contexts) | [code-style.md](./rules/code-style.md) (all TS/JS) | [git-workflow.md](./rules/git-workflow.md) (all git)
