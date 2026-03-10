# Rules — Routing Index

> Quick reference for domain-specific rules. Rules are loaded by agents based on task context and project detection.

---

## Decision Table

| File                                 | Purpose                                                                                                 | Applied When                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [backend.md](backend.md)             | Hexagonal architecture (ports and adapters), layer separation, domain purity                            | Projects containing NestJS, Express, Fastify, Prisma, SQL, or backend patterns  |
| [code-style.md](code-style.md)       | Naming conventions and TypeScript standards: kebab-case files, import patterns, type annotations        | All TypeScript/JavaScript projects — non-negotiable for code consistency        |
| [deliverables.md](deliverables.md)   | Deliverables: code, documentation, tests, dependencies, build, lint, typecheck, test, dependencies      | All projects — governs how deliverables are structured, named, and maintained   |
| [documentation.md](documentation.md) | Normalized document pattern, folder structure, header format, status labels                             | All projects — governs how documentation is structured, named, and maintained   |
| [frontend.md](frontend.md)           | WCAG 2.1 AA accessibility, semantic HTML, ARIA, React patterns, Tailwind best practices                 | Projects containing React, Vue, Angular, Tailwind, or frontend patterns         |
| [git-workflow.md](git-workflow.md)   | Conventional Commits format, branch strategy, commit hygiene                                            | All projects using Git version control                                          |
| [global.md](global.md)               | Core philosophy: evidence-first engineering, first principles, second-order effects, anti-bias protocol | Always — applies to ALL agents in ALL contexts without exception                |
| [orchestrator.md](orchestrator.md)   | Master system architect protocol: zero trust diagnostic, contextual audit, strategic mapping            | Task classification, context loading, agent dispatch, and pipeline coordination |
| [performance.md](performance.md)     | Evidence-based profiling and optimization: measure first, optimize second                               | Investigating performance issues, establishing performance budgets              |
| [security.md](security.md)           | OWASP Top 10 (2025) compliance: access control, injection, secrets, crypto                              | All code reviews, deployment workflows, and security audits                     |
| [testing.md](testing.md)             | Test strategy by cyclomatic complexity, AAA pattern, isolation, coverage philosophy                     | Writing tests, reviewing code, or analyzing coverage                            |
| [version-protocol.md](version-protocol.md) | 4-step DETECT-LOAD-VERIFY-ANTI-LEGACY before code generation                                    | All code generation tasks — verify library versions against package.json        |
| [bluf-6.md](bluf-6.md)              | 6-part structured communication protocol (BLUF, analysis, trade-offs, path, risks, unknowns)           | Always — applies to all complex responses (simple responses use parts 1-2)      |
| [heuristics.md](heuristics.md)       | 10 decision heuristics for evidence-based reasoning under uncertainty                                  | Always — applies to all architectural and strategic decisions                   |
| [agents.md](agents.md)               | Agent definition enforcement: required sections, quality gates, communication style standards           | All agent definitions in `.claude/agents/`                                      |
| [handoffs.md](handoffs.md)           | Structured inter-agent handoff templates for BAP/ETH coordination                                      | All BAP/ETH agent transitions (researcher→lead, builder→QE, QA verdict, escalation) |
| [fintech-testing.md](fintech-testing.md) | Domain-specific testing patterns: ledger reconciliation, idempotency, race conditions, BigInt       | All code touching money movement, ledgers, payments, or financial data          |
| [operational-readiness.md](operational-readiness.md) | Pre-deployment gate for features touching money/auth/ledger/migration/PII                  | All production deployments, mandatory for fintech-flagged features               |

---

## Internal Skills (auto-loaded by RDE)

Internal skills are reference documents loaded by the Resource Detection & Enforcement system when keyword triggers match the task context. They are not user-invocable.

| Skill | Purpose | Trigger Keywords |
|-------|---------|-----------------|
| [clean-ddd-hexagonal](../skills/clean-ddd-hexagonal/SKILL.md) | DDD tactical patterns + Clean Architecture + Hexagonal ports/adapters | DDD, domain model, entity, value object, aggregate, hexagonal, ports, adapters |
| [mermaid-diagrams](../skills/mermaid-diagrams/SKILL.md) | Mermaid diagram generation for architecture, sequences, ERDs | diagram, flowchart, sequence diagram, C4, entity relationship, Mermaid |
| [modern-javascript](../skills/modern-javascript/SKILL.md) | Modern JS (ES6-ES2025) patterns, immutability, async | ES2023, ES2024, toSorted, structuredClone, Promise.withResolvers |
| [modern-css](../skills/modern-css/SKILL.md) | Native CSS features: container queries, cascade layers, :has() | container queries, cascade layers, :has(), scroll-driven, oklch, subgrid |
| [feature-slicing](../skills/feature-slicing/SKILL.md) | Feature-Sliced Design (FSD) frontend architecture | FSD, feature sliced design, frontend architecture, layer hierarchy |