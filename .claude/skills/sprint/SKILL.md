---
name: sprint
description: >-
  Sprint planning workflow — organizes multiple user stories into
  prioritized, dependency-aware sprints. Sits between /product and /bap.
triggers:
  - sprint planning
  - sprint
  - prioritize stories
  - backlog grooming
  - sprint backlog
  - iteration planning
  - organize stories
argument-hint: "[sprint number or 'new']"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, WebFetch, WebSearch, AskUserQuestion
complexity: highest
effort: highest
mode: solo
---

# Workflow: Sprint Planning

> Organize multiple user stories into prioritized, dependency-aware sprints. Product ownership perspective — WHAT to build and in what order, not HOW.

**Use when:**

- Multiple user stories exist and need organizing into sprints
- Backlog needs prioritization with dependency awareness
- Starting a new sprint or re-planning an active one
- Carrying over incomplete stories from a previous sprint

**Pipeline position:**

```
/product (author N stories) → /sprint (organize & prioritize) → /bap (plan 1 story) → /eth (execute)
```

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] At least 2 user stories exist in `docs/plans/active/*-user-story.md`
- [ ] Codebase context is accessible

---

## Workflow Phases

```
Phase S: SCAN  →  Gate  →  Phase A: ANALYZE  →  Gate  →  Phase O: ORGANIZE  →  Gate  →  Phase R: REVIEW
```

- **SCAN**: Inventory user stories and existing sprint state
- **ANALYZE**: Dependencies, effort estimation, value scoring
- **ORGANIZE**: Allocate stories to sprints respecting capacity and dependencies
- **REVIEW**: Human approval gate, artifact generation, next action guidance

---

## Phase S: SCAN (Inventory User Stories)

### S.1 — Discover Stories

Glob for `*-user-story.md` in `docs/plans/active/`.

### S.2 — Parse Story Metadata

For each story, extract:

- **Title**: Section 1 heading
- **Risk surfaces**: Section 4 (fintech flags)
- **Dependencies**: Section 5 (hard and soft)
- **Scenario count**: Section 2 (Gherkin scenario count)
- **Delta table size**: Section 10a (scope indicator)
- **Layer span**: Which architectural layers the story touches

### S.3 — Load Sprint State

Check `docs/sprints/active/` and `docs/sprints/done/` for existing sprints:

- Determine next sprint number (sequential: Sprint 1, 2, 3...)
- Load velocity data from completed sprints (rolling average of last 3-5)
- Identify carry-over stories (incomplete from previous sprint)

### S.4 — Classify Story Status

Each story gets one status:

| Status        | Meaning                                          |
| ------------- | ------------------------------------------------ |
| `new`         | Not allocated to any sprint                      |
| `planned`     | Allocated to a future sprint but not started     |
| `in-progress` | Work has begun (BAP or ETH active)               |
| `carry-over`  | Incomplete from previous sprint, needs re-allocation |

### Gate S → A

- [ ] At least 2 stories found
- [ ] All story metadata parsed successfully
- [ ] Sprint state loaded (or confirmed as first sprint)

---

## Phase A: ANALYZE (Dependencies, Effort, Value)

### A.1 — Build Dependency DAG

From Section 5 of each story, construct a directed acyclic graph:

- **Hard dependencies** = blocking. Story B cannot start until Story A completes.
- **Soft dependencies** = preferred ordering hints. Story B benefits from Story A being done first, but is not blocked.
- **Cycle detection**: If a cycle is found, this is a BLOCKER. Surface to user immediately via AskUserQuestion. Do not proceed until resolved.

### A.2 — AI-Suggest Effort (T-Shirt Sizes)

Use story metadata signals to suggest effort:

| Size | Meaning                    | Signals                                    |
| ---- | -------------------------- | ------------------------------------------ |
| XS   | Trivial, < half day        | 1-2 scenarios, single layer, no deps       |
| S    | Small, ~1 day              | 2-3 scenarios, 1-2 layers, 0-1 deps       |
| M    | Medium, ~2-3 days          | 3-5 scenarios, 2-3 layers, 1-2 deps       |
| L    | Large, ~1 week             | 5-8 scenarios, 3+ layers, 2+ deps         |
| XL   | Extra large — flag for splitting | 8+ scenarios, all layers, complex deps |

Present suggestions to user. XL stories get a splitting recommendation.

### A.3 — Pairwise Calibration

For stories near the sprint boundary (where capacity runs out):

- Present pairs to user: "Is Story A bigger than Story B?"
- Adjust effort estimates based on relative comparison
- Maximum 3-5 pairwise comparisons to avoid fatigue

### A.4 — Business Value Classification

Ask user to classify business value per story using AskUserQuestion:

| Value    | Meaning                                     |
| -------- | ------------------------------------------- |
| Critical | Must ship — revenue, compliance, or safety  |
| High     | Significant user/business impact            |
| Medium   | Useful improvement, not urgent              |
| Low      | Nice to have, can defer indefinitely        |

### A.5 — Team Capacity

Ask user for capacity info using AskUserQuestion:

- Team size (number of developers)
- Sprint duration (days)
- Sprint start date
- Team specializations (if any — frontend, backend, fullstack)
- Any known absences or reduced capacity

### A.6 — Priority Scoring

User selects prioritization framework. Default: simplified WSJF.

**Available frameworks:**

| Framework | Formula                                          | Best For                        |
| --------- | ------------------------------------------------ | ------------------------------- |
| WSJF      | (Value + Time Criticality + Risk Reduction) / Effort | Balanced prioritization        |
| RICE      | (Reach × Impact × Confidence) / Effort          | Product-led, user-facing work   |
| ICE       | Impact × Confidence × Ease                      | Quick scoring, fewer variables  |
| MoSCoW    | Must/Should/Could/Won't categories               | Stakeholder-driven, no formula  |

**Priority boost**: Stories that unblock other stories get a priority multiplier (1.2x for each story they unblock).

Formula and scoring are transparent — present the calculation, not just the result.

### Gate A → O

- [ ] Business values assigned to all stories
- [ ] Dependency DAG is acyclic
- [ ] Effort estimated for all stories
- [ ] Prioritization framework selected and scores calculated

---

## Phase O: ORGANIZE (Allocate to Sprints)

### O.1 — Sprint Capacity

Calculate net capacity:

```
Gross capacity = Team size × Sprint duration (dev-days)
Velocity factor = Rolling average from last 3-5 sprints
                  OR 70% for first sprint (conservative)
Buffer = 15% reserved (configurable by user)
Net capacity = Gross capacity × Velocity factor × (1 - Buffer)
```

Map T-shirt sizes to dev-days for capacity math:

| Size | Dev-Days (default) |
| ---- | ------------------ |
| XS   | 0.5                |
| S    | 1                  |
| M    | 3                  |
| L    | 5                  |
| XL   | 8+ (should split)  |

### O.2 — Topological Sort + Priority

1. Topological sort of the dependency DAG
2. Within each dependency tier, sort by priority score (highest first)
3. Soft dependencies influence ordering but do not enforce it

### O.3 — Sprint Filling

Walk the ordered backlog, filling sprints:

- Check: Does adding this story exceed net capacity? → Next sprint
- Check: Are all hard dependencies in this sprint or earlier? → OK
- Check: Specialization balance — avoid all-frontend or all-backend sprints when possible
- Overflow stories go to the next sprint

### O.4 — Sprint Balance Check

Each sprint should:

- Deliver independently valuable output (not just foundations)
- Mix effort sizes (not all L stories in one sprint)
- Have a coherent sprint goal (1-2 sentence summary of value delivered)

### O.5 — Carry-Over Handling

Incomplete stories from previous sprint:

- Go to top of the backlog by default
- User can choose: carry with adjusted priority, or drop
- Carry-overs count against sprint capacity at their remaining effort

### O.6 — Multi-Sprint Horizon

All stories are allocated across sprints:

- **Sprint 1** = "committed" — the team commits to delivering these
- **Sprint 2+** = "projected" — best estimate, subject to re-planning

Sprint dates are calculated sequentially: each sprint's start date = previous sprint's end date + 1 day (or user-provided start date for Sprint 1).

### Gate O → R

- [ ] Every story allocated to a sprint
- [ ] Every sprint respects net capacity
- [ ] All hard dependencies satisfied (no story scheduled before its dependency)
- [ ] Each sprint has a coherent goal
- [ ] All sprints have start and end dates

---

## Phase R: REVIEW (Human Approval Gate)

### R.1 — Present Sprint Summary

Present to user via AskUserQuestion:

For each sprint:
- Start date and end date
- Story list with effort, value, priority score
- Total effort vs. capacity
- Risk profile (fintech flags, dependency density)
- Dependency visualization (Mermaid DAG diagram)

### R.2 — User Decision Gate

| Option         | Action                                         |
| -------------- | ---------------------------------------------- |
| `[Approve]`    | Generate sprint document, proceed               |
| `[Adjust]`     | User specifies changes, re-run O.3-O.6          |
| `[Re-analyze]` | Return to Phase A with new inputs               |
| `[Abort]`      | Exit without generating artifacts               |

### R.3 — Generate Sprint Document

Write to `docs/sprints/active/sprint-NNN.md` using the Sprint Document Structure below.

### R.4 — Next Action Guidance

Output: "Run `/bap <story-path>` for the highest-priority unblocked story in Sprint N."

List the recommended execution order for Sprint 1.

---

## Mid-Sprint Re-Planning

If `/sprint` is invoked while an active sprint exists:

1. **Warning**: Present via AskUserQuestion: "Sprint N is active. Re-planning disrupts flow and is logged as a disruption event."
2. **Options**: `[Continue current sprint]` | `[Re-plan (requires justification)]`
3. **If re-plan proceeds**: User provides justification. Log disruption event in sprint doc with timestamp and reason. Then run phases S-R with carry-over handling.

---

## Sprint Completion

When a sprint is complete:

1. Move `docs/sprints/active/sprint-NNN.md` → `docs/sprints/done/sprint-NNN.md`
2. Update status to `Complete`
3. Append velocity data: planned vs. completed effort
4. Identify carry-over stories for next sprint

---

## Sprint Document Structure

```markdown
# Sprint [N]
> [Sprint goal — 1 sentence]

**Created**: YYYY-MM-DD
**Status**: Planning | Active | Complete | Cancelled
**Start Date**: YYYY-MM-DD
**End Date**: YYYY-MM-DD
**Duration**: [N] days
**Team Size**: [N] developers
**Framework**: [WSJF | RICE | ICE | MoSCoW]

## Sprint Goal
[1-2 sentences — what value does this sprint deliver?]

## Stories
| # | Story | Effort | Value | Priority | Hard Deps | Soft Deps | Status |
|---|-------|--------|-------|----------|-----------|-----------|--------|

## Dependency Graph
[Mermaid diagram]

## Capacity Analysis
- Gross capacity: [N] dev-days
- Velocity factor: [N]% (or "first sprint — 70% conservative")
- Buffer: [N]% reserved
- Net capacity: [N] dev-days

## Team Workload (if specializations provided)
| Member | Stories | Effort | Specialization Match |
|--------|---------|--------|---------------------|

## Risk Profile
| Risk | Stories Affected | Mitigation |
|------|-----------------|------------|

## Carry-Over (if applicable)
| Story | Original Sprint | Reason | Adjusted Priority |
|-------|----------------|--------|-------------------|

## Velocity Log
| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|

## Disruption Log (if mid-sprint re-planning occurred)
| Date | Change | Justification | Impact |
|------|--------|---------------|--------|
```

---

## Evolution Hook

After sprint planning completes, trigger Quick Capture:

- Write 0-3 entries to MEMORY.md covering:
  - Prioritization framework effectiveness
  - Estimation accuracy observations
  - Dependency patterns worth remembering

---

## Cross-References

- [skills/product/SKILL.md](../product/SKILL.md) — User story generation (upstream)
- [skills/bap/SKILL.md](../bap/SKILL.md) — Plan individual stories (downstream)
- [skills/eth/SKILL.md](../eth/SKILL.md) — Execute planned stories (downstream)
- [rules/orchestrator.md](../../rules/orchestrator.md) — Intake classification
- [rules/deliverables.md](../../rules/deliverables.md) — Sprint artifacts
- [workflows/routing.md](../../workflows/routing.md) — Workflow index
