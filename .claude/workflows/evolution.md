---
name: evolution
description: Capture project memory and workflow friction, detect patterns, propose improvements
complexity: low
mode: default
model: sonnet
effort: standard
thinking: low
fintech-classification: fintech-neutral
---

# Workflow: Evolution

> Unified project memory and workflow improvement loop. Captures decisions, mistakes, conventions, and friction after every workflow execution. Proposes improvements when patterns accumulate.

**Use when:**
- A workflow has just completed its primary mission (final step of every workflow)
- A significant decision, mistake, or convention was established during work
- Periodic review of accumulated friction data

**Two modes:**
- **Quick Capture** (default after every workflow): Phase C only. ~30 seconds. Write 0-3 entries to MEMORY.md. This is what Evolution Hooks in other workflows trigger.
- **Full CDPG** (on-demand): All 4 phases. Run explicitly when reviewing accumulated friction or after multiple workflows.

---

## Overview

Every workflow execution generates empirical data: decisions made, mistakes encountered, conventions confirmed, and friction with the workflow itself. Evolution captures all of this in one place (`.claude/MEMORY.md`) and feeds improvements back into the system when patterns emerge.

**Mechanism**: Always capture (lightweight, ~30 seconds). Propose improvements only when 2+ similar frictions accumulate. All changes require human approval.

**Phases**: **C**apture -> **D**etect -> **P**ropose -> **G**ate

**Indicator**: `[evolution.md] Phase X -- Description`

---

## Quick Capture Protocol

> This is the minimum viable evolution step. Every workflow's Evolution Hook triggers this.

After completing any workflow, the executing agent MUST:

1. **Assess**: Did this execution produce a decision, mistake, convention, or friction? (Mental check, ~5 seconds)
2. **Write**: If yes, open `.claude/MEMORY.md` and append entries to the appropriate table(s) using the Edit tool. If no noteworthy items, skip — "no friction" is valid.
3. **Timestamp**: Update `Last Updated` in MEMORY.md to current date.

**This is not optional.** The Evolution Hook in every workflow is a directive to execute these 3 steps, not a suggestion to "invoke evolution.md as a separate workflow." The agent that just completed the workflow does the capture inline before closing.

**When to run Full CDPG instead**: When the user explicitly requests evolution analysis, when 5+ friction entries have accumulated, or when a periodic review is due.

---

## Prerequisites

- A workflow has just completed, OR significant project knowledge was generated
- `.claude/MEMORY.md` exists and is writable

---

## Phase C: Capture

> Record what happened and what was learned. Runs every time, target ~30 seconds.

**Indicator**: `[evolution.md] Phase C -- Capturing from <workflow-name>`

### C.1 -- Context

Record execution metadata:

| Field           | Value                               |
| --------------- | ----------------------------------- |
| Workflow        | `<workflow-name>.md`                |
| Date            | YYYY-MM-DD                          |
| Phases executed | Which phases ran                    |
| Phases skipped  | Which phases were skipped (and why) |

### C.2 -- Memory

Check if any of these occurred during execution:

- **Decision made?** Add to the Decisions table in `.claude/MEMORY.md`. Include context, rationale, and rejected alternatives.
- **Mistake encountered?** Add to the Mistakes table. Include root cause and prevention strategy.
- **Convention confirmed or established?** Add to the Conventions table. Include rationale and examples.

Skip if nothing noteworthy. Most executions will have 0-1 memory entries.

### C.3 -- Friction

For each friction point during execution, add a row to the Workflow Friction table:

| Field       | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| Workflow    | Which workflow                                                                    |
| Phase       | Which phase/substep caused friction                                               |
| Type        | `unclear` / `skipped` / `improvised` / `missing-info` / `disproportionate-effort` |
| Description | What happened vs. what was expected                                               |
| Severity    | `low` (annoyance) / `medium` (workaround needed) / `high` (blocked execution)     |
| Status      | Set to `captured`                                                                 |

**Friction types:**
- **unclear**: Instructions were ambiguous or incomplete
- **skipped**: Step was skipped because it didn't apply or added no value
- **improvised**: An action was taken that isn't prescribed in the workflow
- **missing-info**: Step required information not referenced in the workflow
- **disproportionate-effort**: Step took far more effort than its value justified

Skip if no friction. "No friction" is valuable data -- it confirms the workflow works well.

### C.4 -- Timestamp

Update the `Last Updated` date in `.claude/MEMORY.md`.

---

## Phase D: Detect

> Analyze accumulated friction data for recurring patterns. Runs only if friction was captured in C.3.

**Indicator**: `[evolution.md] Phase D -- Detecting patterns`

### D.1 -- Pattern Matching

Read the Workflow Friction table. Group entries by **Workflow + Phase + Type**:

- **2+ entries** with same workflow+phase+type = **workflow-specific pattern**
- **2+ entries** with same type across different workflows = **cross-workflow pattern**

### D.2 -- Classify

| Classification    | Criteria                          | Action                          |
| ----------------- | --------------------------------- | ------------------------------- |
| **Clarification** | Same step `unclear` 2+ times      | Reword the step                 |
| **Missing step**  | Same action `improvised` 2+ times | Add the missing substep         |
| **Dead weight**   | Same step `skipped` 2+ times      | Mark step as optional or remove |
| **Structural**    | Phase-level divergence 2+ times   | Record as META signal           |

**If no patterns detected**: STOP. Friction data is logged for future detection. No proposals needed.

---

## Phase P: Propose

> Draft specific improvement proposals. Runs only when patterns detected in D.2.

**Indicator**: `[evolution.md] Phase P -- Proposing improvements`

### P.1 -- Draft Proposal

For each detected pattern:

- **Evidence**: The friction entries that triggered it (dates, descriptions)
- **Proposed change**: Exact lines to add, change, or remove in the target workflow
- **Risk**: What could go wrong if this change is applied
- **Downstream impact**: Which other files reference the target

### P.2 -- Cross-Workflow Patterns

If D.1 detected cross-workflow patterns:
- Propose a convention change (add to Conventions table)
- Flag for META refinement of the shared source (rule, spec, or CLAUDE.md)
- Do NOT fix the same issue in multiple workflows individually -- fix the shared source

---

## Gate: Evolution Proposals

Present proposals to user with evidence.

| Option    | Action                                                                                |
| --------- | ------------------------------------------------------------------------------------- |
| `[Apply]` | Edit the target workflow with approved changes. Mark friction entries as `resolved`.  |
| `[Defer]` | Mark as `deferred-YYYY-MM-DD`. Pattern remains active -- next occurrence re-triggers. |
| `[META]`  | Record in META Refinement Queue. User invokes `meta-refinement.md` separately.        |

**Indicator**: `[evolution.md] Gate -- User decision on proposals`

---

## Failure Handling

| Scenario | Resolution |
| --- | --- |
| MEMORY.md does not exist | Create it with empty table headers (Decisions, Mistakes, Conventions, Workflow Friction, Cross-Workflow Patterns, META Refinement Queue) |
| MEMORY.md exceeds 200 lines | Archive old resolved friction entries. Move to a `memory/archive-YYYY-MM.md` file. Keep active and recent entries in MEMORY.md. |
| No friction after 10+ workflow runs | This is a signal the system works well. Log "No friction confirmed over N runs" as a Convention. |
| Cross-workflow pattern spans 3+ workflows | Escalate to META Refinement Queue with HIGH priority. Do not attempt inline fixes. |
| User defers all proposals repeatedly | After 3 deferrals of the same pattern, flag in MEMORY.md as "persistent-deferred" for visibility. Do not re-propose until user requests. |

---

## Anti-Patterns

| Anti-Pattern              | Mitigation                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| **Skipping capture**      | Phase C is mandatory even on clean runs. "No friction" confirms quality.                        |
| **Premature proposals**   | Never propose on first occurrence. Threshold is 2+. Single frictions might be context-specific. |
| **Auto-applying changes** | All proposals require human approval. These are governance files that control AI behavior.      |
| **Scope creep**           | One workflow per evolution run. Cross-workflow patterns are logged, not fixed inline.           |

---

## Evolution Hook

This workflow captures its own friction. After a Full CDPG run, apply Quick Capture for evolution.md itself — meta-evolution.

---

## Cross-References

- [MEMORY.md](../MEMORY.md) -- unified data store (decisions, mistakes, conventions, friction)
- [/meta](../skills/meta/SKILL.md) -- escalation path for structural changes
- [CLAUDE.md](../CLAUDE.md) -- workflow registry
- [workflows/routing.md](routing.md) -- routing table
- [rules/global.md](../rules/global.md) -- evidence-first principle (friction must be evidence-based)