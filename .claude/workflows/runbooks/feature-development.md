# Runbook: Feature Development — Standard BAP-to-ETH Pipeline

> Pre-configured workflow for standard feature development with team compositions and timeline expectations.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Prerequisites

- [ ] User story exists (recommended: run `/product` first)
- [ ] Feature branch created (`feature/<name>`)
- [ ] Agent teams enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)

---

## Phase 1: Plan (BAP)

**Invoke**: `/bap [feature description or user story path]`
**Duration**: 15-45 minutes depending on complexity

### Expected Team
- Lead (orchestrator)
- 2-4 researchers (dynamically selected based on feature domain)

### Expected Output
- Plan document in `docs/plans/active/<slug>/<slug>-plan.md`
- ADR in `docs/plans/active/<slug>/<slug>-adr.md`
- Architecture diagram if applicable

### Gate
User approves plan before proceeding to Phase 2.

---

## Phase 2: Execute (ETH)

**Invoke**: `/eth [plan path or feature name]`
**Duration**: 30 minutes - 2 hours depending on task count

### Expected Team (dynamically composed from plan data)

| Plan Characteristics | Typical Composition |
|---------------------|-------------------|
| <= 4 tasks, single domain | 1 builder + 1 QE |
| 5-10 tasks, 2 domains | 2 builders + 1 QE |
| 10+ tasks, 3+ domains | 3 builders (specialist) + 1 QE |
| Any fintech flags | + security-focused review in Phase R |

### Expected Flow
1. E.0: Lead reads plan, composes team
2. E.1: Pre-build verification (version protocol, memory, web research)
3. E.2: Spawn builders and QE
4. E.3: Task dispatch, divergence management
5. T.1-T.3: QE validates each task (handoff format from rules/handoffs.md)
6. R.1-R.5: Autonomous review pipeline
7. H.1-H.3: Human review, approval, commit

### Gate
User approves ETH summary before commit/PR.

---

## Phase 3: Ship

### Options (user chooses)
1. **Create PR** (recommended): GitHub PR with ETH summary as body
2. **Merge to develop**: direct merge if team has approval
3. **Leave on branch**: user handles manually

### Post-Ship
- Plan moved to `docs/plans/done/`
- MEMORY.md updated with lessons learned
- Team cleaned up (TeamDelete)

---

## Fintech Features — Additional Gates

If the plan has fintech flags (`money | auth | PII | migration | ledger`):

- Per-risk-surface human review during ETH (not just at the end)
- Operational readiness checklist (`rules/operational-readiness.md`) before deployment
- Fintech testing patterns (`rules/fintech-testing.md`) applied by QE

---

## Cross-References

- [skills/bap/SKILL.md](../../skills/bap/SKILL.md) — BAP workflow
- [skills/eth/SKILL.md](../../skills/eth/SKILL.md) — ETH workflow
- [rules/handoffs.md](../../rules/handoffs.md) — Handoff templates
- [rules/deliverables.md](../../rules/deliverables.md) — Required outputs
