---
name: review
description: >-
  Standalone code review with dynamic specialist reviewers.
  Use for external PRs, legacy branches, or ad-hoc quality checks.
triggers:
  - code review
  - PR review
  - review code
  - review pull request
  - legacy review
argument-hint: "[branch, PR number, or file paths]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# Workflow: Review (Standalone Code Review)

> Standalone parallel-layer review using dynamically-selected specialist reviewers. Produces BLOCKER/MAJOR/MINOR findings per layer with severity routing and remediation guidance.
>
> **Scope**: This workflow is for code that did NOT go through ETH. ETH Phase R already includes autonomous code review with the same reviewer roles — do NOT invoke pr-review.md for ETH features.
>
> **Use for**: External PRs, legacy branch audits, CI integration, ad-hoc reviews outside the ETH pipeline.

**Use when:**

- Reviewing an external PR before merge (code not built through ETH)
- Auditing a legacy branch for quality before integration
- CI-triggered review gate on incoming contributions
- Ad-hoc quality check on any branch or diff

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] Codebase context is accessible
- [ ] Agent teams enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- [ ] Target branch or diff is identified

---

## Phase A: Classify & Scope

**Indicator**: `[pr-review.md] Phase A -- Classifying review scope`

### A.1 -- Collect Changed Files

Run `git diff <base>...HEAD --name-only` to get the changed file list. If the target is a PR, use the PR's base branch. If ad-hoc, use `develop` or `main` as base.

Record:
- Total changed file count
- Changed file paths grouped by layer

### A.2 -- Layer Classification

Map each changed file to its architectural layer:

| Path Pattern                                                                          | Layer                                           |
| ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Directories containing domain entities, VOs, events, exceptions, ports                | Domain                                          |
| Directories containing use cases, application services                                | Application                                     |
| Directories containing adapters, repository implementations, ORM entities, migrations | Infrastructure                                  |
| Directories containing controllers, DTOs, guards, interceptors, framework wiring      | Presentation                                    |
| Directories containing UI components, pages, styles                                   | Frontend                                        |
| `*.test.ts`, `__tests__/`                                                             | Test (maps to the layer of the file under test) |
| CI/CD configs, Dockerfiles, build configs                                             | Platform                                        |

Consult STACK.md for project-specific layer paths and layer mapping. Use `git diff` file paths to classify.
Files that don't match any pattern: classify manually or flag for lead review.

### A.3 -- Fintech Surface Scan

Check if any changed file touches a fintech surface:

| Surface        | Signal                                                                      | Flag          |
| -------------- | --------------------------------------------------------------------------- | ------------- |
| Money Movement | Changes to wallet, balance, transfer, or ledger logic                       | `[money]`     |
| Auth/Session   | Changes to guards, JWT, roles, session, or login flows                      | `[auth]`      |
| PII            | Changes to fields containing names, emails, phones, addresses, or documents | `[PII]`       |
| Migration      | New or modified migration files                                             | `[migration]` |
| Ledger         | Changes to ledger accounts, transactions, or entries                        | `[ledger]`    |

If ANY fintech flag is present, record it — this affects reviewer selection in Phase B.

### Gate A: Review Depth

| Option          | Condition                                                | Action                                                    |
| --------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `[Quick Check]` | <= 3 changed files AND single layer AND no fintech flags | Lead does inline review (no team spawn). Skip to Phase D. |
| `[Full Review]` | > 3 files OR multiple layers OR fintech flags present    | Proceed to Phase B (team spawn).                          |

**Quick Check path**: Lead reviews inline using the same checklist as the relevant reviewer role. Produces the same synthesis format but without team overhead.

---

## Phase B: Spawn Review Team

**Indicator**: `[pr-review.md] Phase B -- Spawning review team`

`TeamCreate "review-<branch-name>"`

### B.1 -- Dynamic Reviewer Selection

Spawn ONLY the reviewers relevant to the changed layers:

| Changed Layers                  | Reviewers Spawned                               |
| ------------------------------- | ----------------------------------------------- |
| Domain only                     | domain-reviewer                                 |
| Domain + Infrastructure         | domain-reviewer + infra-reviewer                |
| Domain + Infra + Presentation   | domain-reviewer + infra-reviewer + api-reviewer |
| Presentation only (backend API) | api-reviewer                                    |
| Frontend only (web/mobile/UI)   | design-reviewer                                 |
| Frontend + Presentation         | api-reviewer + design-reviewer                  |
| Infrastructure only (migration) | infra-reviewer                                  |
| Full stack                      | all relevant reviewers (up to 4)                |

**Rules:**
- Minimum 1 reviewer, maximum 5
- If ANY fintech flag present (from A.3) --> always include security-reviewer regardless of layers
- Each reviewer receives: the changed file list filtered to their layer scope
- Do NOT spawn reviewers for unchanged layers

### B.2 -- Reviewer Prompts

Lead dispatches the layer-filtered file list to each selected reviewer:

**domain-reviewer**: "Review all changes in domain layer directories (as classified in Phase A).

Check:
- Business logic correctness -- does the change maintain domain invariants?
- Value Object invariants: readonly properties, factory methods (`create()`) not `new`, input validation in factory
- No framework or ORM imports inside domain files
- Domain errors are explicit typed classes, not generic `new Error('message')`
- Aggregate roots manage their own consistency boundaries -- no external mutation
- Entities use `as const` enums with type guards, not TypeScript `enum`

Reference: `rules/backend.md` for hexagonal layer rules; `rules/code-style.md` for naming conventions.
Skip files outside domain layers. Read-only -- no edits.
Report: [BLOCKER/MAJOR/MINOR]: [finding] -- [file:line]"

**infra-reviewer**: "Review all changes in infrastructure layer directories (as classified in Phase A): adapters, repository implementations, migration files.

Check:
- N+1 query patterns: relations not loaded in loops -- use `relations: []` or join in query
- Transaction boundaries: money movement and multi-table writes use QueryRunner, `$transaction`, or equivalent
- Migration files: has both `up()` and `down()` rollback -- no irreversible schema changes without human approval
- Repository classes implement their port interface (`implements IXxxRepository`) from domain/ports/
- No business logic in adapters -- adapters translate between domain and persistence, services decide
- Parameterized queries only -- no string concatenation in SQL

Reference: `rules/backend.md` for adapter/port rules and database patterns.
Skip files outside infrastructure layers. Read-only -- no edits.
Report: [BLOCKER/MAJOR/MINOR]: [finding] -- [file:line]"

**api-reviewer**: "Review all changes in presentation layers: controllers, DTOs, guards, interceptors.

Check:
- All DTOs validated with Zod schemas (`z.string()`, `z.number()`, `z.optional()`)
- Protected routes have `@UseGuards(JwtAuthGuard)` or equivalent -- no accidental exposure
- HTTP status codes: 200 GET, 201 POST create, 204 DELETE, 400 validation, 401 auth, 403 permission, 404 not found
- Error responses: generic message to client -- no stack traces, no internal file paths
- Tests exist for: happy path, authentication failure, and at least one validation failure case

Reference: `rules/testing.md` for coverage targets; `rules/security.md` for error exposure rules.
Skip files outside presentation layers. Read-only -- no edits.
Report: [BLOCKER/MAJOR/MINOR]: [finding] -- [file:line]"

**design-reviewer** (frontend changes): "Review accessibility and visual design for all frontend changes.

Check:
- WCAG 2.1 AA: contrast ratio >= 4.5:1, focus indicators visible, no keyboard traps
- Form labels associated with inputs, no color-only error indicators
- Semantic HTML (`<button>` not `<div onClick>`, `<nav>`, `<main>`, `<section>`)
- Responsive design: mobile-first, no horizontal scroll at any breakpoint
- All interactive elements keyboard-accessible with visible focus ring

Reference: `rules/frontend.md` for full WCAG checklist; `agents/design-architect.md` for design system tokens.
Skip files outside frontend layers. Read-only -- no edits.
Report: [BLOCKER/MAJOR/MINOR]: [finding] -- [file:line]"

**security-reviewer** (when fintech flags present): "Security-focused review of all changed files.

Check:
- OWASP Top 10 compliance for changed code
- Auth bypass risks: missing guards, privilege escalation paths
- Injection vectors: SQL, command, SSRF
- Secrets exposure: hardcoded keys, tokens, passwords in code or config
- PII leaks: personal data in logs, error messages, or unencrypted storage
- Cryptographic correctness: proper algorithms (bcrypt >= 12, AES-256-GCM), no weak hashing (MD5, SHA1)

Reference: `rules/security.md` for full OWASP checklist; `agents/security-architect.md` for threat modeling.
Read-only -- no edits.
Report: [BLOCKER/MAJOR/MINOR]: [finding] -- [file:line]"

---

## Phase C: Collect & Route Findings

**Indicator**: `[pr-review.md] Phase C -- Collecting and routing findings`

### C.1 -- Fintech Auto-BLOCKERs

These are ALWAYS BLOCKER severity -- no exceptions, no human override:

- Hardcoded credentials or secrets in any changed file
- Auth guard missing on a previously protected route
- Money movement without transaction boundary
- Migration with no `down()` rollback
- `Number()` or `parseFloat()` on monetary values (must use BigInt)
- PII in log statements or error messages
- Test coverage dropped below layer targets (domain 100%, services >= 90%, controllers >= 70%)

### C.2 -- Severity Routing

| Severity    | Definition                                    | Action                                                                  |
| ----------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| **BLOCKER** | Blocks merge. Must fix before approval.       | Route to author for fix. After fix, re-run affected reviewer to verify. |
| **MAJOR**   | Significant issue. Human decides disposition. | Include in synthesis. Human chooses: fix now or track as tech debt.     |
| **MINOR**   | Good practice violation. Low risk.            | Include in synthesis. Fix if quick; log if not.                         |

### C.3 -- Remediation Loop (BLOCKERs only)

If BLOCKERs are found:

1. Lead compiles BLOCKER list and routes to PR author (or fixing agent)
2. Author fixes the BLOCKERs
3. Lead re-runs ONLY the affected reviewer(s) on the changed files
4. If clean --> proceed to Phase D
5. If still blocked --> repeat (max 2 remediation cycles)
6. If still blocked after 2 cycles --> escalate to human with full finding history

---

## Phase D: Synthesize

**Indicator**: `[pr-review.md] Phase D -- Synthesizing review report`

### D.1 -- Produce Review Report

```markdown
## Review -- <branch-name>

**Changed files:** N
**Layers touched:** [domain | application | infrastructure | presentation | frontend | platform]
**Fintech flags:** [money | auth | PII | migration | ledger | none]
**Reviewers spawned:** [list]
**Status**: BLOCKED | APPROVED WITH NOTES | CLEAN

### BLOCKERs (must fix before merge)
[findings with file:line references, or "none"]

### MAJORs (human decision required)
[findings with file:line references, or "none"]

### MINORs (optional fixes)
[findings with file:line references, or "none"]

### Remediation History
[cycle count and what was fixed, or "no remediation needed"]
```

### Gate D: Review Outcome

| Option              | Condition                                      | Action                                                |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| `[Approve]`         | Zero BLOCKERs, MAJORs accepted or resolved     | Review passes. Proceed to Team Cleanup.               |
| `[Request Changes]` | BLOCKERs remain or MAJORs need fixing          | Route back for fixes. Re-enter Phase C after changes. |
| `[Escalate]`        | Unresolvable conflict or architectural concern | Flag for senior review. Include full finding history. |

---

## Team Cleanup

**Indicator**: `[pr-review.md] Cleanup -- Shutting down review team`

After human approves or requests changes:
1. Lead sends `shutdown_request` to each reviewer
2. After all confirm shutdown: `TeamDelete`
3. Confirm cleanup to user

---

## Failure Handling

| Scenario                                  | Action                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Reviewer blocked (can't access files)     | Lead provides clarification or narrows scope. Reviewer resumes.                                                    |
| Reviewer idle without reporting           | Lead sends check-in DM. If still silent, log as "inconclusive -- [reviewer]" and proceed with remaining reviewers. |
| Reviewer edits files (scope violation)    | Lead enforces read-only. Violation logged. Submitted findings still valid.                                         |
| Two reviewers report conflicting findings | Lead preserves both positions with evidence. Surfaces to human as decision point in synthesis.                     |
| Changed files span unknown layer          | Lead classifies manually or spawns a general-purpose reviewer for unclassified files.                              |
| Remediation cycle exceeds max (2)         | Escalate to human with full history. Do not loop indefinitely.                                                     |
| Quick check reveals complexity            | Upgrade to full review (spawn team). Return to Phase B.                                                            |

---

## Anti-Patterns

| Anti-Pattern                               | Mitigation                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Rubber-stamping                            | Every finding requires evidence (file:line). No "looks good" approvals.       |
| Style-only feedback                        | Focus on correctness, security, and maintainability -- not formatting.        |
| Reviewing without changed file list        | Always start with `git diff` -- avoid reviewing unchanged files.              |
| Spawning all reviewers regardless of scope | Dynamic selection based on changed layers. No reviewers for unchanged layers. |
| Skipping team cleanup                      | TeamDelete is mandatory after every team-based review.                        |
| Ignoring fintech Auto-BLOCKERs             | Auto-BLOCKERs cannot be overridden. No exceptions.                            |
| Conflating with ETH Phase R                | pr-review.md is standalone only. ETH has its own review pipeline.             |
| Infinite remediation loops                 | Max 2 cycles. Escalate after that.                                            |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Primary pipeline (NOT invoked by pr-review)**: [/eth](../eth/SKILL.md) Phase R -- autonomous review within ETH
- **Security audit**: [/security-audit](../security-audit/SKILL.md) -- OWASP scan with dynamic auditor team
- **Architecture audit**: [/architecture-audit](../architecture-audit/SKILL.md) -- architecture purity check
- **Fintech safety rules**: [rules/security.md](../rules/security.md) -- OWASP Top 10, secrets, crypto standards
- **Backend layer rules**: [rules/backend.md](../rules/backend.md) -- hexagonal architecture, database patterns
- **Frontend rules**: [rules/frontend.md](../rules/frontend.md) -- WCAG 2.1 AA, React patterns, Tailwind
- **Testing standards**: [rules/testing.md](../rules/testing.md) -- coverage targets by layer, AAA pattern
- **Code style**: [rules/code-style.md](../rules/code-style.md) -- naming conventions, TypeScript standards
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) -- post-workflow memory capture
