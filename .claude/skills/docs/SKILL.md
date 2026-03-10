---
name: docs
description: >-
  Documentation sync — stale-doc detection, ADR audit, API docs,
  plan lifecycle, README health, runbooks.
triggers:
  - documentation sync
  - stale docs
  - ADR audit
  - README health
  - API docs
argument-hint: "[scope: all, adrs, plans, api, or readme]"
user-invocable: true
disable-model-invocation: true
model: sonnet
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, Edit
---

# Workflow: Documentation Sync

> Systematic audit of documentation health across the entire project. Detects stale docs, missing ADRs, orphaned plans, undocumented APIs, and tribal knowledge gaps.

**Use when:**

- After a major feature lands (post-ETH)
- Before a release
- Post-refactoring (renamed files, moved modules, changed APIs)
- API contract changes
- Periodic documentation health check

**Agent**: `knowledge-architect` (primary). Escalate to `contract-architect` for API doc gaps, `system-architect` for ADR gaps.

---

## Prerequisites

- [ ] Access to `docs/` directory and all source code
- [ ] `rules/documentation.md` loaded (SSOT for doc standards)
- [ ] Recent git history available (`git log --oneline -20`)

---

## Documentation Standards Reference

All documentation MUST conform to `rules/documentation.md`:

- **Normalized pattern**: Title + tagline + Last Updated + Status + ToC + numbered sections
- **Folder structure**: `docs/architecture/`, `docs/features/`, `docs/guides/`, `docs/plans/{active,done}/`, `docs/specs/`
- **ADR format**: Sequential numbering (`NNN-decision-name.md`), never deleted, superseded ADRs marked
- **Plan lifecycle**: `active/` while in progress, moved to `done/YYYY-MM-DD-name.md` when shipped
- **File naming**: kebab-case, date-prefixed for completed plans

---

## Phase A: Scope & Discover

> Determine what to audit and how deep.

`[docs.md] Phase A -- Scope & Discover`

### A.1 Identify Trigger

Classify the trigger for this documentation sync:

| Trigger | Scope Implication |
| --- | --- |
| Post-feature (ETH completed) | Focus on changed modules: new ADRs, updated API docs, plan lifecycle |
| Pre-release | Full audit: all coverage areas |
| Post-refactoring | Focus on stale references: renamed symbols, moved files, changed paths |
| API contract change | Focus on API documentation alignment |
| Periodic health check | Full audit: all coverage areas |

### A.2 Discover Documentation Landscape

Read the project's STACK.md and documentation rule files to identify:

- Documentation folder structure and conventions
- Existing ADR numbering and location
- Plan directory paths (active vs done)
- API documentation location
- README locations (root + per-package)

### A.3 Select Coverage Areas

Based on trigger, select which Phase B sub-phases to execute:

| Coverage Area | Sub-Phase | Quick | Full |
| --- | --- | --- | --- |
| Stale references | B.1 | Yes | Yes |
| ADR health | B.2 | No | Yes |
| API documentation | B.3 | Yes | Yes |
| Plan lifecycle | B.4 | No | Yes |
| README health | B.5 | No | Yes |
| Runbooks & tribal knowledge | B.6 | No | Yes |

### Gate A

| Option | Action |
| --- | --- |
| `[Quick Audit]` | Execute selected B sub-phases only (B.1 + B.3 minimum) |
| `[Full Audit]` | Execute all B sub-phases |
| `[Custom]` | User selects specific sub-phases |

---

## Phase B: Audit

> Execute selected coverage area audits. Each sub-phase produces a findings list.

`[docs.md] Phase B -- Audit`

### B.1 Stale Reference Detection

`[docs.md] Phase B.1 -- Stale Reference Detection`

Systematically detect documentation that references non-existent code:

**Step 1 — Symbol scan**: Extract function names, class names, file paths, and route paths referenced in documentation files.

**Step 2 — Existence verification**: For each extracted symbol, verify it still exists in the source code. Check:

- Function/class names referenced in docs
- File paths referenced in docs (imports, links)
- API routes referenced in docs
- Configuration keys referenced in docs
- Environment variable names referenced in docs

**Step 3 — Internal link check**: Verify all markdown links within `docs/` resolve to existing files. Check:

- `[text](path)` links point to existing files
- Anchor links (`#section-name`) match actual section headers
- Cross-references between docs are bidirectional where expected

**Step 4 — Classify findings**:

| Severity | Condition |
| --- | --- |
| Critical | Link to deleted file (404) |
| High | Reference to renamed/removed symbol |
| Medium | Outdated code example (compiles but wrong pattern) |
| Low | Minor terminology drift (old name still understandable) |

### B.2 ADR Health

`[docs.md] Phase B.2 -- ADR Health`

Audit Architecture Decision Records:

- [ ] **Completeness**: Every significant architectural decision has an ADR
- [ ] **Numbering**: Sequential, no gaps (check `docs/architecture/` or project-specific ADR path)
- [ ] **Status accuracy**: No ADRs marked "Accepted" that were actually superseded
- [ ] **Format compliance**: Each ADR follows the template from `rules/documentation.md` (Status, Date, Context, Decision, Consequences)
- [ ] **Recency**: Check git log for architectural changes without corresponding ADRs

Cross-check recent commits for architectural signals:

- New module/package creation
- New dependency introduction
- Pattern changes (e.g., switching from callbacks to events)
- Infrastructure changes (new services, DB changes)

### B.3 API Documentation

`[docs.md] Phase B.3 -- API Documentation`

For each API endpoint in the project:

- [ ] **Existence**: Every public endpoint has documentation
- [ ] **Accuracy**: Request/response schemas match actual DTOs and Zod schemas
- [ ] **Auth requirements**: Documented auth guards match implementation
- [ ] **Status codes**: All possible response codes documented
- [ ] **Examples**: Request/response examples present and valid JSON
- [ ] **Versioning**: API version noted if applicable

**Discovery method**: Scan controller files for route decorators (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` or framework equivalent), then verify each has corresponding documentation.

### B.4 Plan Lifecycle

`[docs.md] Phase B.4 -- Plan Lifecycle`

Audit the plan directory for lifecycle compliance:

- [ ] **Orphaned active plans**: Plans in `active/` whose features are already merged/shipped — should be moved to `done/`
- [ ] **Missing date prefix**: Completed plans in `done/` without `YYYY-MM-DD-` prefix
- [ ] **Stale active plans**: Plans in `active/` with no recent commits touching related files (> 30 days idle)
- [ ] **Plan-to-code alignment**: Active plans accurately reflect current implementation state
- [ ] **File naming**: All plans use kebab-case

### B.5 README Health

`[docs.md] Phase B.5 -- README Health`

Audit README files across the project:

- [ ] **Root README**: Exists, has quick start, links to detailed docs
- [ ] **Package READMEs**: Each package/app has a README with purpose, setup, and usage
- [ ] **Accuracy**: Setup instructions actually work (commands exist, paths correct)
- [ ] **Conciseness**: READMEs are entry points, not dumps — detailed content in `docs/`
- [ ] **Badges/status**: Build status, version, license badges are current (if present)
- [ ] **No secrets**: No API keys, passwords, or internal URLs in READMEs

### B.6 Runbooks & Tribal Knowledge

`[docs.md] Phase B.6 -- Runbooks & Tribal Knowledge`

Identify undocumented operational knowledge:

- [ ] **Deployment procedures**: How to deploy each app/service
- [ ] **Database operations**: Migration procedures, backup/restore, seed data
- [ ] **Incident response**: What to do when common failures occur
- [ ] **Environment setup**: Developer onboarding steps, env var documentation
- [ ] **Integration procedures**: How to connect to external services (BaaS, payment providers, etc.)

For each identified gap, produce a runbook skeleton following the template:

```markdown
# Runbook: [Operation Name]

**Trigger**: [When to run this]
**Owner**: [Which team or role]

## Prerequisites
- [ ] [What must be true before starting]

## Steps
1. [Exact command or action]
2. [Next step]

## Verification
[How to confirm success]

## Rollback
[How to undo if something goes wrong]
```

---

## Phase C: Synthesize

> Compile findings into a structured report and determine remediation.

`[docs.md] Phase C -- Synthesize`

### C.1 Documentation Health Report

Produce the report in this format:

```markdown
## Documentation Health Report

**Date**: YYYY-MM-DD
**Trigger**: [post-feature | pre-release | post-refactoring | periodic]
**Scope**: [quick | full | custom: B.1, B.3, ...]

### Summary

| Coverage Area | Status | Issues Found |
| --- | --- | --- |
| Stale References | PASS/WARN/FAIL | N |
| ADR Health | PASS/WARN/FAIL | N |
| API Documentation | PASS/WARN/FAIL | N |
| Plan Lifecycle | PASS/WARN/FAIL | N |
| README Health | PASS/WARN/FAIL | N |
| Runbooks | PASS/WARN/FAIL | N |

### Findings (Severity-Ranked)

| # | Severity | Area | Finding | Location | Remediation |
| --- | --- | --- | --- | --- | --- |
| 1 | Critical | ... | ... | ... | ... |

### Remediation Priority

[Ordered by severity then effort — critical items first]
```

### C.2 Status Assessment

| Threshold | Status |
| --- | --- |
| 0 Critical, 0 High | PASS — documentation is healthy |
| 0 Critical, 1+ High | WARN — address high-severity items before release |
| 1+ Critical | FAIL — documentation has critical gaps requiring immediate attention |

### Gate C

| Option | Action |
| --- | --- |
| `[Accept]` | Report accepted, proceed to remediation or close |
| `[Remediate Now]` | Fix identified issues in this session |
| `[Defer]` | Log issues for future attention, close workflow |

---

## Automated Checks

Supplement manual audit with automated verification:

```bash
# Find broken internal links in markdown files
# (Search for markdown links and verify targets exist)

# Find TODO/FIXME placeholders left in docs
grep -rn "TODO\|FIXME\|TBD\|PLACEHOLDER" docs/ --include="*.md"

# Find docs not updated in 90+ days
find docs/ -name "*.md" -mtime +90

# Find orphaned plans (completed features still in active/)
ls docs/plans/active/

# Verify ADR sequential numbering
ls docs/architecture/ | sort
```

---

## Failure Handling

| Scenario | Resolution |
| --- | --- |
| No `docs/` directory exists | Create minimal structure per `rules/documentation.md` folder layout |
| ADR numbering has gaps | Document gaps in report, do not renumber (history preservation) |
| API endpoints discovered with zero documentation | Classify as Critical finding, produce skeleton docs |
| Plan directory missing | Create `docs/plans/active/` and `docs/plans/done/` |
| Documentation references internal/proprietary URLs | Flag as security concern, do not include in report output |

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
| --- | --- |
| **Drive-by fixes without audit** | Always complete the full audit scope before fixing — understand the full picture first |
| **Documenting implementation instead of behavior** | Focus on what the system does, not how the code works internally |
| **Fixing stale docs without verifying current behavior** | Read the actual code before updating docs — don't propagate assumptions |
| **Bulk-generating placeholder docs** | Only create documentation that contains real, verified content |
| **Ignoring plan lifecycle** | Completed plans must move to `done/` — orphaned active plans mislead future developers |
| **README as documentation dump** | READMEs are concise entry points — detailed content belongs in `docs/` |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.
- **Noted friction**: [any steps that were unclear, improvised, or disproportionately effortful]

---

## Cross-References

- **Documentation standards (SSOT)**: [rules/documentation.md](../rules/documentation.md)
- **Deliverables rule**: [rules/deliverables.md](../rules/deliverables.md) — plan + ADR + summary requirements
- **Agent**: [knowledge-architect](../agents/knowledge-architect.md) — TKB and documentation curation
- **Agent**: [contract-architect](../agents/contract-architect.md) — API documentation gaps
- **Agent**: [system-architect](../agents/system-architect.md) — ADR gaps
- **Plan workflow**: [/bap](../bap/SKILL.md) — plan creation in Phase P
- **Execution workflow**: [/eth](../eth/SKILL.md) — triggers docs sync post-feature
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) — post-workflow memory capture
