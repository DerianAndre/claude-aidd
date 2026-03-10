# Framework Router

> Single entrypoint for AI-assisted development. Two commands cover all feature work — everything else is ad-hoc.

**Last Updated**: 2026-02-22

---

## Primary Path

For all non-trivial feature development:

```
/bap (plan) → /eth (execute)
```

1. **`/bap`** (`skills/bap/SKILL.md`) — Brainstorm → Ask → Plan. Explores the codebase with a researcher team, asks structured questions (4 mandatory categories), produces an atomic plan. No code until plan is approved.

2. **`/eth`** (`skills/eth/SKILL.md`) — Execute → Test → Review (autonomous) → Human-review. Builds the plan with a builder+QE team, then runs a 3-layer autonomous review (domain, infra, API) before presenting to human. Includes git flow and PR creation.

For trivial tasks (< 3 steps, single-file, obvious): skip BAP, execute directly.

---

## Rules Loading by Task Domain

Always load `rules/global.md`. Then load domain-specific rules based on what you're building:

| Task Domain                         | Rules to Load                                                     | Primary Agents                             |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Backend (API, DDD, database)        | `rules/backend.md`, `rules/security.md`                           | `system-architect`, `contract-architect`   |
| Frontend (React, Next.js, Tailwind) | `rules/frontend.md`, `rules/code-style.md`                        | `interface-artisan`, `experience-engineer` |
| Fullstack                           | `rules/backend.md`, `rules/frontend.md`, `rules/security.md`      | All relevant agents                        |
| Testing                             | `rules/testing.md`                                                | `quality-engineer`                         |
| Security audit                      | `rules/security.md`                                               | `security-architect`                       |
| Documentation                       | `rules/documentation.md`, `rules/deliverables.md`                 | `knowledge-architect`                      |
| CI/CD, infrastructure               | —                                                                 | `platform-engineer`                        |
| i18n                                | —                                                                 | `i18n-specialist`                          |
| Data modeling                       | `rules/backend.md`                                                | `data-architect`                           |
| Design system                       | `rules/frontend.md`                                               | `design-architect`                         |
| Performance optimization            | `rules/performance.md`, `rules/backend.md` or `rules/frontend.md` | `experience-engineer`                      |

See `rules/orchestrator.md` for task classification logic.

---

## Ad-hoc Specialist Skills

Invoked for specific scenarios outside the `/bap` → `/eth` primary path:

| Skill                 | When to Use                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `/security-audit`     | Pre-production OWASP security audit (dynamic auditor team)                                      |
| `/review`             | External PRs, legacy branches, CI reviews (ETH already runs this for features built through it) |
| `/architecture-audit` | Architecture purity audit (DDD/Hexagonal, dynamic auditor team)                                 |
| `/design`             | Frontend design & UX audit (WCAG, heuristics, UI quality, design system, perf)                  |
| `/docs`               | Post-release doc sync — ADRs, stale refs, API docs, runbooks                                    |
| `/product`            | Gherkin acceptance criteria + Definition of Ready before BAP                                    |
| `/tech-select`        | Evidence-based tech evaluation using TKB                                                        |
| `/feature-branch`     | Git flow reference — branch naming, Conventional Commits, PR template                           |

**Internal workflows** (not user-invocable):
- `workflows/evolution.md` — Project memory + friction capture
- `workflows/routing.md` — Workflow index with complexity and duration

---

## Golden Rules

These apply to all agents in all contexts — see `rules/global.md` for full definitions:

1. **Evidence-First**: Never opinions. Always logic, data, or fundamental principles.
2. **First Principles**: Deconstruct to base truths before proposing solutions.
3. **Pareto Efficiency**: The 20% of effort that generates 80% of impact goes first.
4. **Second-Order Effects**: Analyze consequences of consequences before acting.
5. **Zero Bullshit**: No hedging, no corporate speak, no condescension.
6. **Anti-Bias**: Check sunk cost, survivorship, confirmation bias before conclusions.
7. **No Breaking Changes**: Never break backward compatibility without explicit user confirmation.
8. **Test-First**: Write tests for all critical business logic.
9. **Readability > Cleverness**: Optimize for the next developer, not line count.

---

## System Map

```
.claude/
├── routing.md                    ← YOU ARE HERE
├── CLAUDE.md                     ← Project instructions for Claude
├── settings.json                 ← Claude Code settings
├── agents/                       ← Native subagents (auto-delegated by description)
│   ├── system-architect.md       ← System design, C4, ADRs (opus)
│   ├── contract-architect.md     ← OpenAPI 3.1, contract-first API design (opus)
│   ├── security-architect.md     ← Vulnerability scanning, OWASP audits (opus)
│   ├── data-architect.md         ← SQL schemas, 3NF, migrations (sonnet)
│   ├── design-architect.md       ← Design systems, tokens, Figma→Code (sonnet)
│   ├── experience-engineer.md    ← Frontend architecture, state, performance (sonnet)
│   ├── platform-engineer.md      ← CI/CD, Docker, infrastructure (sonnet)
│   ├── interface-artisan.md      ← UI/UX, WCAG, React components (haiku)
│   ├── quality-engineer.md       ← Test generation, coverage, quality gates (haiku)
│   ├── knowledge-architect.md    ← Documentation sync, TKB curation (haiku)
│   └── i18n-specialist.md        ← next-intl, react-i18next, RTL (haiku)
├── rules/                        ← Domain constraints (always load global.md)
│   ├── global.md                 ← Core philosophy, immutable to all agents
│   ├── orchestrator.md           ← Task classification + intake logic
│   ├── backend.md                ← DDD, hexagonal, ports & adapters
│   ├── frontend.md               ← WCAG 2.1 AA, React, Tailwind, accessibility
│   ├── testing.md                ← Coverage targets, AAA pattern, test pyramid
│   ├── security.md               ← OWASP Top 10 (2025), secrets, injection
│   ├── code-style.md             ← Naming, imports, TypeScript conventions
│   ├── documentation.md          ← Normalized doc pattern, section order
│   ├── git-workflow.md           ← Conventional Commits, branch strategy
│   ├── performance.md            ← Evidence-based profiling
│   ├── deliverables.md           ← Required outputs per feature
│   ├── version-protocol.md       ← 4-step version verification protocol
│   ├── bluf-6.md                 ← BLUF-6 communication format
│   └── heuristics.md             ← 10 decision heuristics (full definitions)
├── skills/                       ← Skills (user-invocable + internal)
│   ├── bap/SKILL.md              ← /bap — Brainstorm-Ask-Plan (+ RDE Track 4)
│   ├── eth/SKILL.md              ← /eth — Execute-Test-Review-Human (+ RDE Step 1.5)
│   ├── review/SKILL.md           ← /review — Standalone code review
│   ├── security-audit/SKILL.md   ← /security-audit — OWASP audit
│   ├── architecture-audit/SKILL.md ← /architecture-audit — DDD/Hexagonal purity
│   ├── design/SKILL.md           ← /design — Frontend design & UX audit
│   ├── docs/SKILL.md             ← /docs — Documentation sync
│   ├── product/SKILL.md          ← /product — Gherkin + Definition of Ready
│   ├── feature-branch/SKILL.md   ← /feature-branch — Git flow reference
│   ├── tech-select/SKILL.md      ← /tech-select — Evidence-based tech evaluation
│   ├── meta/SKILL.md             ← /meta — .claude/ config refinement
│   ├── clean-ddd-hexagonal/      ← Internal: DDD + Clean Architecture + Hexagonal
│   ├── mermaid-diagrams/         ← Internal: Mermaid diagram generation
│   ├── modern-javascript/        ← Internal: ES6-ES2025 patterns
│   ├── modern-css/               ← Internal: Modern native CSS features
│   └── feature-slicing/          ← Internal: Feature-Sliced Design architecture
├── workflows/                    ← Internal workflows (not user-invoked)
│   ├── routing.md                ← Workflow index with complexity and duration
│   └── evolution.md              ← Project memory + friction capture
└── knowledge/                    ← Technology Knowledge Base (TKB)
    ├── backend/                  ← Frameworks, runtimes, communication
    ├── frontend/                 ← Meta-frameworks, UI libs, patterns
    └── data/                     ← Databases, ORMs, caching
```

---

## Cross-References

- **Orchestrator protocol**: `rules/orchestrator.md`
- **Primary planning skill**: `/bap` (`skills/bap/SKILL.md`)
- **Primary execution skill**: `/eth` (`skills/eth/SKILL.md`)
- **BLUF-6 format**: `rules/bluf-6.md`
- **Decision heuristics**: `rules/heuristics.md`
