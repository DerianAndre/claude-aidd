---
name: architecture-audit
description: >-
  Clean Architecture + DDD + Hexagonal purity audit with dynamic auditor team.
  Use after adding domain or infrastructure code.
triggers:
  - architecture audit
  - DDD audit
  - hexagonal audit
  - domain purity
  - port adapter check
  - layer violation
argument-hint: "[scope: package, layer, or module]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# Workflow: Architecture Audit

> Verify Clean Architecture, DDD, and Hexagonal patterns using parallel auditors. Produces a severity-ranked purity report with remediation guidance.
>
> **Invocation**: Standalone (ad-hoc) or from ETH Phase R.4 (automated). Both paths use the same phases.

**Use when:**

- After adding or modifying domain or infrastructure code
- Before merging architecture-sensitive changes
- Periodic architecture health check
- ETH Phase R.4 automated compliance verification

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] Codebase context is accessible
- [ ] Agent teams enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- [ ] Scope defined: entire codebase, specific module, changed files, or PR diff

---

## Architecture Rules Reference

```
presentation --> application --> domain <-- infrastructure
```

- **Domain** has zero outward dependencies. No framework, ORM, or validation library imports.
- **Infrastructure** implements domain port interfaces. Dependencies point inward.
- **Application** orchestrates domain logic via ports. No framework decorators.
- **Presentation** is the only layer allowed to import framework-specific code.

Full rules: `rules/backend.md` (hexagonal architecture section).

---

## Phase A: Scope & Discover

**Indicator**: `[architecture-audit.md] Phase A -- Discovering project structure`

### A.1 -- Define Scope

Determine the audit scope from the invocation context:

| Invocation Source   | Input                                | Scope                  |
| ------------------- | ------------------------------------ | ---------------------- |
| ETH Phase R.4       | Changed file list from ETH execution | Changed files only     |
| Standalone (PR)     | `git diff <base>...HEAD --name-only` | Changed files only     |
| Standalone (module) | User-specified module path           | All files in module    |
| Standalone (full)   | Entire codebase                      | All source directories |

### A.2 -- Layer Discovery

Read STACK.md for the project's monorepo structure and layer mapping. Identify:

1. **Domain directories** — Where entities, value objects, events, exceptions, and ports live
2. **Application directories** — Where use cases and application services live
3. **Infrastructure directories** — Where adapters, repository implementations, and ORM entities live
4. **Presentation directories** — Where controllers, DTOs, guards, and framework wiring live
5. **Framework in use** — NestJS, Express, Fastify, Spring, etc. (determines what imports are violations)
6. **ORM in use** — Prisma, Drizzle, TypeORM, Sequelize, etc. (determines what imports are violations in domain)
7. **Validation library** — Zod, class-validator, Joi, etc. (domain must not import these)

Record the discovered paths and technology stack. These are passed to auditors in Phase B.

### A.3 -- Quick Check Gate

| Option          | Condition                                                      | Action                                             |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| `[Quick Check]` | <= 3 changed files AND single layer                            | Lead does inline audit (no team). Skip to Phase C. |
| `[Full Audit]`  | > 3 files OR multiple layers OR architecture-sensitive changes | Proceed to Phase B (team spawn).                   |

---

## Phase B: Spawn Audit Team

**Indicator**: `[architecture-audit.md] Phase B -- Spawning audit team`

`TeamCreate "arch-audit-<scope>"`

### B.1 -- Auditor Prompts

Spawn 3 parallel auditors. Each receives the discovered layer paths and technology stack from Phase A.

**import-auditor**: "Audit import boundary violations. The domain layer must have ZERO dependencies on framework, ORM, or validation library packages.

Check all files in the domain directories (discovered in Phase A):
- No framework imports (e.g., `@nestjs/*`, `@angular/*`, Spring annotations, Express types)
- No ORM imports (e.g., `prisma`, `drizzle`, `typeorm`, `sequelize`, Hibernate)
- No validation library imports in domain logic (e.g., `class-validator`, `class-transformer`, `joi`)
- No framework decorators on domain classes (`@Injectable`, `@Entity`, `@Column`, etc.)
- Domain files can import: TypeScript built-ins, domain-internal modules, and pure utility libraries only

For each match, classify severity:
- CRITICAL: Framework or ORM import in domain layer
- HIGH: Validation library import in domain layer
- MEDIUM: Framework decorator on a domain class

Reference: `rules/backend.md` hexagonal architecture section.
Read-only -- no file edits.
Report: [CRITICAL/HIGH/MEDIUM]: [finding] -- [file:line]
If clean: [CLEAN] domain layer -- zero framework imports"

**dependency-auditor**: "Audit dependency direction violations. Dependencies must flow: presentation --> application --> domain <-- infrastructure. No reverse arrows.

Check:
- Does domain/ import from application/, infrastructure/, or presentation/? --> CRITICAL
- Does application/ import from presentation/? --> CRITICAL
- Does infrastructure/ import from presentation/? --> HIGH
- Are port interfaces defined as TypeScript `interface` (not `class`)? --> HIGH if class
- Do adapter/repository classes declare `implements <PortInterface>`? --> HIGH if missing
- Can domain modules be imported in isolation without pulling framework packages into the import chain? --> CRITICAL if not
- Are there circular dependencies between layers? --> CRITICAL

Reference: `rules/backend.md` dependency direction rules.
Read-only -- no file edits.
Report: [CRITICAL/HIGH/MEDIUM]: [finding] -- [file:line]
If clean: [CLEAN] [checked item]"

**pattern-auditor**: "Audit DDD pattern compliance across all layers.

Check domain layer:
- Value Objects: properties are `readonly`, constructed via factory methods (`create()`, `from()`), not `new` -- MEDIUM if mutable or uses public constructor
- Entities: use `as const` objects + type inference for enums, not TypeScript `enum` keyword -- MEDIUM if uses `enum`
- Domain exceptions: explicit typed classes extending a base exception, not generic `new Error('message')` -- MEDIUM if generic
- Aggregate roots: manage their own consistency boundaries, no external mutation of internal state -- HIGH if violated
- Domain events: extend a base event class with structured payload -- LOW if missing

Check application layer:
- Use cases depend on port interfaces, not concrete adapters -- HIGH if concrete
- No direct database queries or ORM calls in application services -- CRITICAL if present

Check infrastructure layer:
- Adapters implement their corresponding port interface -- HIGH if missing
- No business logic in adapters (translate only, don't decide) -- HIGH if present
- Repository methods use parameterized queries (no string concatenation) -- CRITICAL if violated

Check presentation layer:
- Controllers are thin (validate input --> call use case --> format output) -- MEDIUM if fat
- No business logic in controllers -- HIGH if present

Reference: `rules/backend.md` DDD section; `rules/code-style.md` naming and immutability rules.
Read-only -- no file edits.
Report: [CRITICAL/HIGH/MEDIUM/LOW]: [finding] -- [file:line]
If clean: [CLEAN] [checked pattern]"

---

## Phase C: Synthesize

**Indicator**: `[architecture-audit.md] Phase C -- Synthesizing purity report`

After all auditors report, lead classifies and synthesizes.

### C.1 -- Severity Classification

| Level        | Criteria                                                                                                              | Impact                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **CRITICAL** | Framework/ORM import in domain, reverse dependency direction, business logic in adapter, circular dependencies        | Architecture is broken. Must fix before merge.                    |
| **HIGH**     | Missing port implementation, business logic in controller, concrete adapter in use case, aggregate boundary violation | Architecture is degraded. Fix before merge or justify explicitly. |
| **MEDIUM**   | Mutable VO, missing factory method, TypeScript `enum` in domain, fat controller, framework decorator on domain class  | Pattern deviation. Fix in current sprint.                         |
| **LOW**      | Missing readonly, naming convention deviation, missing domain event structure                                         | Minor. Log for future cleanup.                                    |

### C.2 -- Purity Score

Start at 10. Deduct based on findings:
- Each CRITICAL: -2
- Each HIGH: -1
- Each MEDIUM: -0.5
- LOW findings: no deduction (logged only)

Minimum score: 0. Target: >= 8 for merge approval.

### C.3 -- Report Format

```markdown
## Architecture Audit -- <scope>

**Date**: YYYY-MM-DD
**Scope**: [module, PR, or full codebase]
**Invocation**: [standalone | ETH R.4]
**Framework**: [discovered framework]
**ORM**: [discovered ORM]
**Status**: PURE | VIOLATIONS FOUND

### Purity Score: X/10

### CRITICAL Violations
[findings with file:line, or "none"]

### HIGH Violations
[findings with file:line, or "none"]

### MEDIUM Violations
[findings with file:line, or "none"]

### LOW Observations
[findings or "none"]

### Remediation Plan
[ordered list of fixes, highest severity first, simplest fix within each severity]
```

### Gate C: Report Acceptance

| Option        | Condition                                  | Action                                                             |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `[Accept]`    | Score >= 8 and zero CRITICAL violations    | Audit passes. Proceed to Team Cleanup.                             |
| `[Remediate]` | CRITICAL or HIGH violations remain         | Author fixes violations. Re-run affected auditor(s). Max 2 cycles. |
| `[Escalate]`  | Score < 5 or architectural redesign needed | Flag for architect review with full report.                        |

---

## Team Cleanup

**Indicator**: `[architecture-audit.md] Cleanup -- Shutting down audit team`

After report is accepted:
1. Lead sends `shutdown_request` to each auditor
2. After all confirm shutdown: `TeamDelete`
3. Confirm cleanup to user

---

## Quick Check (no team needed)

For a fast inline check when Gate A selects `[Quick Check]`.

### Import Boundary Check

```bash
# Search for framework imports in domain directories
# Replace <domain_dirs> with discovered paths from Phase A
grep -rn "<framework_package>" <domain_dirs>
grep -rn "<orm_package>" <domain_dirs>
grep -rn "<validation_lib>" <domain_dirs>
# Expected: no output
```

### Dependency Direction Check

```bash
# Search for reverse imports in domain directories
# Domain must NOT import from application, infrastructure, or presentation
grep -rn "from.*application\|from.*infrastructure\|from.*presentation" <domain_dirs>
# Expected: no output
```

### Pattern Spot-Check

```bash
# Check for TypeScript enum (should use as const)
grep -rn "^export enum\|^enum " <domain_dirs>
# Expected: no output

# Check for mutable properties in VOs (should be readonly)
grep -rn "public [a-z]" <domain_dirs> | grep -v "readonly\|static\|constructor\|get \|set "
```

Quick check produces the same report format (Phase C.3) but with "[Quick Check]" as invocation source.

---

## Failure Handling

| Scenario                                     | Action                                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Auditor blocked (can't access files)         | Lead provides clarification or narrows scope. Auditor resumes.                           |
| Auditor idle without reporting               | Lead sends check-in DM. If still silent, log as "inconclusive -- [auditor]" and proceed. |
| Auditor edits files (scope violation)        | Lead enforces read-only. Violation logged. Findings still valid.                         |
| Two auditors report overlapping findings     | Lead deduplicates. Keep higher severity classification.                                  |
| Layer discovery finds non-standard structure | Lead classifies manually. Note deviation in report.                                      |
| Remediation cycle exceeds max (2)            | Escalate to human with full history.                                                     |
| Quick check reveals high complexity          | Upgrade to full audit. Return to Phase B.                                                |

---

## Anti-Patterns

| Anti-Pattern           | Description                                                      | Mitigation                             |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Fat Domain             | Business logic in application services instead of domain         | Move logic into VO or domain service   |
| God Service            | Single service handles 5+ unrelated operations                   | Split by aggregate boundary            |
| Leaky Abstraction      | Infrastructure detail (table name, column type) in domain model  | Abstract behind port interface         |
| Framework in Domain    | Framework decorators or imports inside domain layer              | Remove decorator, use adapter pattern  |
| Concrete Repository    | Application service imports adapter directly, not port interface | Inject port interface via DI           |
| Mutable VO             | Value Object properties are public and settable                  | Make readonly, use factory method      |
| Reverse Arrow          | Domain imports from infrastructure or presentation               | Invert dependency, use port interface  |
| Fat Controller         | Business logic in presentation layer                             | Move to use case, keep controller thin |
| Auditing without scope | Running full audit when only 2 files changed                     | Gate A prevents unnecessary team spawn |
| Skipping team cleanup  | Auditors still running after report                              | TeamDelete is mandatory                |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **ETH integration**: [/eth](../eth/SKILL.md) Phase R.4 -- invokes this workflow on changed files
- **Security audit**: [/security-audit](../security-audit/SKILL.md) -- complementary OWASP compliance check
- **Code review**: [/review](../review/SKILL.md) -- standalone quality review
- **Hexagonal rules (SSOT)**: [rules/backend.md](../rules/backend.md) -- layer separation, ports & adapters, DDD patterns
- **Code style**: [rules/code-style.md](../rules/code-style.md) -- naming conventions, immutability, TypeScript standards
- **System architect agent**: [agents/system-architect.md](../agents/system-architect.md) -- C4 diagrams, ADRs
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) -- post-workflow memory capture
