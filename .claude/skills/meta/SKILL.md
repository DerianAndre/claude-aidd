---
name: meta
description: >-
  META protocol for .claude/ config refinement. Map, Evaluate,
  Transform, Audit any workflow, rule, agent, or spec.
triggers:
  - META protocol
  - config refinement
  - claude config audit
  - aidd config
argument-hint: "[target: workflow, rule, agent, or spec name]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, Edit
---

# Workflow: META Refinement

> Systematic process for analyzing, improving, and rewriting `.claude/` configuration files using the META protocol (Map → Evaluate → Transform → Audit).

**Use when:**
- Improving an existing `.claude/` file (CLAUDE.md, workflow, rule, agent, spec)
- Onboarding a new project to the `.claude/` ecosystem
- Cross-project alignment (ensuring sister projects share structure)
- Periodic maintenance of living documents after major changes

---

## Overview

`.claude/` files govern all AI behavior in the project. Gaps in these files mean invisible capabilities, missed safety checks, or suboptimal agent composition. META provides a repeatable, evidence-based process for closing those gaps.

**Acronym**: **M**ap → **E**valuate → **T**ransform → **A**udit

**Indicator**: `[meta-refinement.md] Phase X — Description`

---

## Prerequisites

- [ ] Target file exists within `.claude/` and is a recognized type (CLAUDE.md, workflow, rule, agent, spec)
- [ ] Full `.claude/` ecosystem is readable (all directories accessible)
- [ ] No concurrent META refinement in progress on the same target (check for uncommitted changes)
- [ ] Memory consulted (`.claude/MEMORY.md` Decisions and Conventions tables) for previous refinement decisions

---

## Phase M: MAP

> Catalog the `.claude/` ecosystem and establish the refinement target.

**Indicator**: `[meta-refinement.md] Phase M — Mapping ecosystem`

### M.0 — Identify Target

Determine which file is being refined and classify its type:

| Type        | Examples                            | Typical Size  |
| ----------- | ----------------------------------- | ------------- |
| `CLAUDE.md` | Project instructions, routing table | 150-200 lines |
| `workflow`  | bap.md, eth.md, pr-review.md        | 200-700 lines |
| `rule`      | backend.md, security.md, testing.md | 100-400 lines |
| `agent`     | system-architect, quality-engineer  | 50-150 lines  |
| `spec/rule` | version-protocol.md, bluf-6.md (now in rules/) | 50-150 lines  |

Record the file path, current line count, and file type.

### M.0.1 — Fintech Surface Classification

Determine whether the target file governs fintech-sensitive behavior. Check if the file:

- **References** fintech surfaces directly (money movement, auth, PII, ledger, migration)
- **Is consumed by** workflows that propagate fintech flags (BAP task flags, ETH QE validation, security-audit.md audit)
- **Contains constraints** that enforce fintech safety (fail-closed, human review gates, OWASP compliance)

Record the fintech classification:

| Classification      | Definition                                                                                 | Implication                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `fintech-governing` | File defines or enforces fintech constraints (e.g., security.md, CLAUDE.md fintech banner) | Refinement MUST NOT weaken existing constraints. Diff review mandatory in A.5. |
| `fintech-consuming` | File reads fintech flags from upstream (e.g., eth.md reads flags from BAP plan)            | Refinement MUST preserve flag consumption contracts.                           |
| `fintech-neutral`   | File has no fintech interaction (e.g., design.md, i18n-specialist agent)                   | Standard refinement. No fintech-specific checks required.                      |

### M.1 — Catalog Ecosystem

List all `.claude/` directories and count files in each:

```
.claude/
├── agents/       → N agent definitions
├── hooks/        → N hook scripts
├── knowledge/    → N TKB evaluation files
├── rules/        → N domain rules (includes migrated specs)
├── skills/       → N skill definitions (user-invocable + internal)
└── workflows/    → N workflow definitions
```

This establishes the "surface area" the target file should reference or integrate with. A CLAUDE.md that references 3 workflows when 11 exist has an 8-workflow gap.

### M.2 — Read Target

Read the target file completely. Record:
- Current line count
- Section structure (headers, hierarchy)
- What the file currently covers (checklist of topics)
- What it links to vs. what it duplicates

### M.3 — Read References (optional)

If a sister project has the same file type, read it for cross-project alignment. This is useful for:
- Adopting proven structures from a more mature project
- Ensuring shared conventions stay synchronized
- Identifying project-specific adaptations needed

**Output**: Ecosystem inventory + target file snapshot.

---

## Phase E: EVALUATE

> Cross-reference the target against its ecosystem and produce a ranked gap report.

**Indicator**: `[meta-refinement.md] Phase E — Evaluating gaps`

### E.1 — Apply Gap Framework

Use the file-type-specific gap framework (see [Gap Frameworks](#gap-frameworks) below) to systematically check what the target file covers vs. what the ecosystem provides.

For each framework item, record: **covered** | **partial** | **missing**.

### E.2 — Rank Gaps

Classify each gap by impact:

| Severity     | Definition                                                            | Example                                                   |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------------- |
| **Critical** | Invisible ecosystem components — files exist but are never referenced | 5 spec files exist, CLAUDE.md mentions 0                  |
| **High**     | Missing directives that change AI behavior                            | No "consult memory before planning" directive             |
| **Medium**   | Partially referenced but missing key details                          | Agent table exists but lacks dynamic composition guidance |
| **Low**      | Style/structure improvements                                          | Section reordering, formatting, conciseness               |

### E.3 — Fact-Check

Verify project-specific facts against raw sources. **Never trust the file's claims — verify against reality.**

| Fact                   | Source of Truth                                |
| ---------------------- | ---------------------------------------------- |
| Commands / scripts     | Root `package.json` (`scripts` field)          |
| Technology versions    | Per-package `package.json` (`dependencies`)    |
| File/directory counts  | Actual filesystem (`ls`, `Glob`)               |
| App ports              | App config files or `package.json` dev scripts |
| Package names / scopes | `package.json` `name` fields                   |

### E.4 — Contract Verification

Verify the target file conforms to its type's implicit format contracts. Downstream consumers depend on these structures.

**CLAUDE.md contracts** (consumed by `orchestrator.md`):
- Agent table: columns Agent | Model | Domain
- Workflow routing table: columns Workflow | Purpose
- Fintech flags definition: `[money | auth | PII | migration | ledger | none]`
- Intake classification table: columns Signal | Entry Point

**Workflow contracts** (consumed by `orchestrator.md`, `CLAUDE.md`, other workflows):
- YAML frontmatter: `name`, `description`, `complexity`, `mode`, `model`, `effort` (6 fields minimum)
- Phase headers: `## Phase X: NAME` with substeps
- Gate definitions: table with Option | Action columns
- Status indicators: `[filename.md] Phase X — Description` format
- Evolution Hook section (invokes `evolution.md`)

**Rule contracts** (consumed by `rules/routing.md`, agent prompts):
- Activation blockquote: `> **Activation:** ...` in first 5 lines after title
- MUST/MUST NOT constraints as enforceable directives
- Anti-pattern table: columns Anti-Pattern | Mitigation
- Quality gates as checkbox lists

**Agent contracts** (consumed by `CLAUDE.md` agent table, workflow spawn prompts):
- Model tier assignment and domain boundary
- Tool access list and output format specification

**Spec contracts** (consumed by `CLAUDE.md` specs table, workflow references):
- Numbered step-by-step process
- Enforcement mechanism section

For each contract item, record: **conforming** | **non-conforming** | **N/A**.

If the target is classified `fintech-governing` or `fintech-consuming` (from M.0.1), additionally verify:
- Fintech constraints in the refined version are equal-or-stronger vs. the current version
- Flag propagation paths remain intact (upstream producer format matches downstream consumer expectations)

**Output**: Ranked gap report with evidence.

### Gate: Gap Report

Present the gap report to the user.

| Option            | Action                                                    |
| ----------------- | --------------------------------------------------------- |
| `[Accept Gaps]`   | Proceed to Phase T with the identified gaps               |
| `[More Analysis]` | Return to E.1 with expanded scope or deeper investigation |
| `[Abort]`         | Stop refinement — the file is adequate as-is              |

---

## Phase T: TRANSFORM

> Design the rewrite and execute it.

**Indicator**: `[meta-refinement.md] Phase T — Transforming target`

### T.1 — Design Section Structure

Based on the gap report, design the new file's section structure. Follow these principles:

- **Navigation-oriented**: CLAUDE.md and routing files are routing tables — contain directives and links, never duplicate content from linked files. Every paragraph that exists in a rule/spec/workflow should be a link in the parent file, not a copy.
- **Context-cost-aware**: Every line loaded into conversation context has a cost. Target minimum effective size — enough to route correctly, not enough to bloat context.
- **Project-specific facts**: Commands, versions, package names, app ports must be verified against source of truth (Phase E.3), never copied from templates or sister projects without verification.

### T.2 — Write Plan

Produce a section-by-section plan:
- Section name and purpose
- Approximate line count per section
- What gaps each section closes
- Verification checklist (derived from the gap report)

### T.2.1 — Optional Specialist Validation (complex refinements only)

For complex refinements (CLAUDE.md overhauls, multi-workflow contract changes, or fintech-governing files), the lead MAY spawn a single specialist Explore agent to validate the rewrite plan:

- **system-architect**: Validate structural changes to CLAUDE.md or orchestrator.md (routing table coherence, agent table accuracy)
- **security-architect**: Validate fintech constraint preservation when refining security.md, CLAUDE.md fintech banner, or any fintech-governing file
- **knowledge-architect**: Validate cross-reference accuracy when refining workflows or rules with many outbound links

Optional — the lead judges whether specialist input adds value. The specialist validates the plan, not the content. Default: solo lead.

### Gate: Rewrite Plan

Present the rewrite plan to the user.

| Option                | Action                        |
| --------------------- | ----------------------------- |
| `[Approve & Execute]` | Proceed to T.3                |
| `[Revise Plan]`       | Return to T.1 with feedback   |
| `[Abort]`             | Stop — keep the existing file |

### T.3 — Execute Rewrite

- **Full rewrite**: Use `Write` tool when the file needs a complete structural overhaul (>50% of content changing).
- **Targeted edits**: Use `Edit` tool when closing specific gaps without restructuring (adding a missing section, fixing a table).
- **Cross-project adaptation**: When adapting from a sister project, replace every project-specific fact (scope, commands, apps, versions, ORM) — never leave stale references.

---

## Phase A: AUDIT

> Verify the rewrite closes all identified gaps.

**Indicator**: `[meta-refinement.md] Phase A — Auditing result`

### A.1 — Gap Checklist

Walk through every gap from Phase E. For each:
- **Pass**: The gap is addressed in the new file.
- **Fail**: The gap remains. Return to Phase T to fix.

All Critical and High gaps must pass. Medium/Low gaps may be deferred with documented justification.

### A.2 — Fact Verification

Re-read the rewritten file and verify every project-specific fact:
- [ ] Commands match `package.json` scripts
- [ ] Version anchors match actual dependencies
- [ ] File/directory counts match filesystem
- [ ] App names, ports, and stacks match reality
- [ ] Package scope matches actual `package.json` names

### A.3 — Anti-Duplication Check

Confirm the target file follows the navigation principle:
- [ ] No paragraphs duplicated from linked rules/specs/workflows
- [ ] Content that exists in detail files is referenced by link, not copied
- [ ] The file fits its role (routing table vs. detail document)

### A.4 — Cross-Project Sync (optional)

If a sister project has the same file type:
- [ ] Both files share the same section structure (adapted for each project's stack)
- [ ] Project-specific facts are correct in each (not copy-pasted)
- [ ] No stale references to the wrong project's technologies

### A.5 — Fintech Regression Check (fintech-governing/consuming files only)

If the target was classified `fintech-governing` or `fintech-consuming` in M.0.1:

1. **Diff the refined file against the original**. For each fintech-related section:
   - Verify no constraint was weakened (e.g., MUST downgraded to SHOULD, mandatory gate removed)
   - Verify no fintech flag definition was altered in a way that breaks downstream consumers
   - Verify no security-related cross-reference was removed
2. **Verify downstream propagation**: confirm that workflows consuming fintech flags (BAP task template, ETH QE prompt, security-audit.md audit) can still parse the refined file's output

If any regression is found: return to Phase T and fix before proceeding.

### Gate: Audit Acceptance

| Option     | Action                                                       |
| ---------- | ------------------------------------------------------------ |
| `[Accept]` | Refinement complete. Proceed to memory update and evolution. |
| `[Revise]` | Return to Phase T with specific audit failures to fix.       |
| `[Abort]`  | Discard refinement. Keep the original file unchanged.        |

**Output**: Audit report (pass/fail per gap + fact-check results).

---

## Gap Frameworks

File-type-specific checklists for Phase E.1.

### CLAUDE.md (12 items)

1. Fintech safety banner (visible in first 15 lines)
2. Orchestrator protocol (intake classification + link)
3. Workflow ecosystem (primary path + specialist table + routing link)
4. Monorepo structure (apps table, packages list, versions — verified)
5. Key commands (verified against `package.json`)
6. Architecture constraints (hexagonal, DDD, SSOT — with rule links)
7. Specifications table (all spec files visible)
8. Memory layer directive (consult before planning, update after work)
9. TKB directive (consult before recommending technologies)
10. Agent teams (dynamic composition, not static keyword matching)
11. Deliverables (plan + ADR + summary, with enforcement link)
12. Rules index (routing table with always-active list)

### Workflow (9 items)

1. YAML frontmatter (name, description, complexity, mode, model, effort, fintech-classification)
2. Phase completeness (all phases documented with substeps)
3. Gate definitions (decision options at each phase boundary)
4. Dynamic team composition (not hardcoded agent assignments)
5. Cross-workflow data contracts (what data flows to next workflow)
6. Fintech flag propagation (how flags affect per-task behavior)
7. Status indicators (emission format consistent with project convention)
8. Cross-references (to rules, specs, other workflows)
9. Fintech-classification consistency (YAML value matches workflow's actual fintech interaction)

### Rule (7 items)

1. Activation conditions (when does this rule apply)
2. MUST/MUST NOT constraints (clear, enforceable directives)
3. Anti-pattern table (with mitigations)
4. Quality gates (checklist format)
5. Cross-references (to related rules, workflows)
6. Code examples (correct + incorrect patterns)
7. Template absorption (if a template was merged in)

### Agent (6 items)

1. Model tier assignment (opus / sonnet / haiku)
2. Domain boundary (what this agent handles vs. doesn't)
3. Tool access list (which tools the agent can use)
4. Output format specification (what the agent produces)
5. Interaction protocol (how it communicates with orchestrator)
6. Quality gates (agent-specific checks)

### Spec (5 items)

1. Step-by-step process (numbered, actionable)
2. Enforcement mechanism (how/where this spec is enforced)
3. Cross-references (which workflows/rules consume this spec)
4. Examples (concrete, not abstract)
5. Version/update tracking

---

## Memory Integration

- **Before starting**: Consult `.claude/MEMORY.md` — check Decisions table for previous refinement decisions and Conventions table for established patterns.
- **After completing**: Update memory with gaps found, patterns confirmed, and any new conventions established during refinement.

---

## Failure Handling

| Scenario                                            | Action                                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Target file does not exist                          | Abort. META refines existing files only — use the appropriate template to create new ones.                                         |
| Mapping reveals circular references                 | Log the cycle. Identify which file should be the canonical source. Flag for user decision.                                         |
| Gap framework does not match file type              | Use the closest matching framework. Document deviations. Propose a new framework item in memory update.                            |
| Audit reveals fintech regression                    | BLOCKER. Return to Phase T. Regression must be fixed before proceeding.                                                            |
| Rewrite introduces cascading cross-reference breaks | Map all broken references. Fix outbound links in the refined file. Flag inbound references from other files as separate META runs. |
| Concurrent refinement conflict                      | Abort. Complete the existing refinement first. One target file, one META run at a time.                                            |
| Specialist validation disagrees with lead plan      | Lead documents disagreement. User decides at Gate: Rewrite Plan. Specialist input is advisory, not blocking.                       |

## Anti-Patterns

| Anti-Pattern                       | Mitigation                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Refinement without mapping**     | M.1 ecosystem catalog is mandatory. No shortcuts.                                                       |
| **Copy-paste from templates**      | E.3 fact-check is mandatory. Every fact verified against local source of truth.                         |
| **Weakening fintech constraints**  | A.5 fintech regression check catches this. Diff every fintech section.                                  |
| **Scope creep**                    | One file per META run. Flag dependent changes as follow-up runs.                                        |
| **Duplication instead of linking** | A.3 anti-duplication check. CLAUDE.md is a routing table, not a detail document.                        |
| **Ignoring contracts**             | E.4 contract verification is mandatory. Every structural change validated against downstream consumers. |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this META run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- [CLAUDE.md](../CLAUDE.md) — frequently refined target; agent table, workflow table, fintech banner are contract-critical
- [workflows/routing.md](../../workflows/routing.md) — register this workflow; also a refinement target
- [/bap](../bap/SKILL.md) — downstream consumer of refined workflow contracts (plan template, fintech flags)
- [/eth](../eth/SKILL.md) — downstream consumer of refined workflow contracts (QE prompts, fintech flag validation)
- [/docs](../docs/SKILL.md) — complementary (docs syncs documentation; META refines AI config)
- [MEMORY.md](../MEMORY.md) — consult before and update after
- [rules/orchestrator.md](../rules/orchestrator.md) — META is invoked ad-hoc, not part of BAP→ETH pipeline
- [rules/security.md](../rules/security.md) — fintech constraint SSOT; verify preservation when refining fintech-governing files
- [Gap Frameworks](#gap-frameworks) — file-type-specific checklists consumed by Phase E.1
