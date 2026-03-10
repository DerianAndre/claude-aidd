# Handoff Templates — Structured Inter-Agent Communication

> Standardized handoff formats for BAP/ETH agent coordination. Eliminates ambiguity in agent-to-agent transitions.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Table of Contents

1. [Overview](#1-overview)
2. [Researcher to Lead](#2-researcher-to-lead)
3. [Builder to QE](#3-builder-to-qe)
4. [QA Verdict](#4-qa-verdict)
5. [Escalation](#5-escalation)
6. [Quality Gates](#6-quality-gates)

---

## 1. Overview

Handoff templates ensure structured, complete information transfer between agents. Every agent transition in BAP/ETH uses one of these four templates. The receiving agent can parse the handoff without asking clarifying questions.

**Principles:**
- Every handoff is self-contained — the receiver needs no additional context to act
- Evidence-backed — claims reference specific files, lines, or test output
- Action-oriented — every handoff ends with a clear next action
- Fintech-aware — risk surfaces are always surfaced in handoffs

---

## 2. Researcher to Lead

**Used in**: BAP Phase B.5 (research synthesis)

**Template:**

```markdown
## Research Handoff: [Topic]

### Findings

#### Finding 1: [Title]
- **Evidence**: [specific file, benchmark, documentation reference]
- **Risk**: [none | low | medium | high | critical]
- **Recommendation**: [concrete action]
- **Confidence**: [high | medium | low — with rationale]

#### Finding 2: [Title]
[same structure]

### Coverage Assessment
- **Investigated**: [list of areas explored]
- **Not investigated**: [list of areas outside scope or time-limited]
- **Contradictions**: [any conflicting evidence found]

### Synthesis
[2-3 sentences: what the findings mean for the plan]

### Recommended Next Action
[specific action for the lead: proceed to planning, investigate further, or escalate to user]
```

**Constraints:**
- Minimum 2 findings per handoff (if only 1 finding, investigation was insufficient)
- Every finding MUST have Evidence and Recommendation
- Confidence level MUST be justified (not just "high" — explain why)
- Coverage Assessment MUST list what was NOT investigated

---

## 3. Builder to QE

**Used in**: ETH Phase E.2 (task completion notification)

**Template:**

```markdown
## Task Completion: Task [N] — [Title]

### Changes
| File | Action | Lines Changed |
|------|--------|---------------|
| `path/to/file.ts` | created / modified / deleted | +N / -N |

### Acceptance Criteria Addressed
- [x] [criterion from plan, verbatim]
- [x] [criterion from plan, verbatim]

### Fintech Flags
[Copied from plan — NOT guessed]
- Flags: [money | auth | PII | migration | ledger | none]
- Mitigations applied: [specific actions taken for each flag]

### Test Coverage
- New tests added: [list test files]
- Existing tests modified: [list or "none"]
- Manual verification: [any manual checks performed]

### Known Limitations
[Any scope limitations, deferred work, or edge cases not covered]

### Ready for Validation
[Specific commands QE should run, or "standard validation protocol"]
```

**Constraints:**
- Every acceptance criterion from the plan MUST be listed and checked
- Fintech flags MUST match the plan exactly — adding or removing flags is a protocol violation
- If no tests were added for a code change, explain why explicitly
- Changes table must list EVERY file touched — no omissions

---

## 4. QA Verdict

**Used in**: ETH Phase T.1 (QE validation result)

**Template:**

```markdown
## QA Verdict: Task [N] — [PASS | FAIL]

### Gate Results
| Gate | Status | Details |
|------|--------|---------|
| Typecheck | PASS/FAIL | [error count or "clean"] |
| Lint | PASS/FAIL/SKIPPED | [error count or "clean" or "skipped: typecheck failed"] |
| Targeted Tests | PASS/FAIL/SKIPPED | [pass/fail/skip counts] |
| Acceptance Criteria | PASS/FAIL | [which criteria met/unmet] |
| Fintech Verification | PASS/FAIL/N/A | [flag-specific results] |

### Evidence
[For PASS: specific output confirming each gate passed]
[For FAIL: exact error messages, file paths, line numbers]

### Fintech Flag Verification (if applicable)
- [money]: [verification result — e.g., "BigInt used in all monetary calculations, verified in transfer-service.ts:45-67"]
- [auth]: [verification result]
[etc.]

### Verdict
**[PASS]**: Task [N] passed all gates. Marking complete.
**[FAIL]**: Task [N] failed: [specific errors]. Fix and notify me.

### Retry Context (FAIL only)
- Attempt: [N of 3]
- Previous failure: [what failed last time, if retry]
- Specific fix needed: [actionable description]
```

**Constraints:**
- Every gate MUST have a status — no omissions
- FAIL verdicts MUST include exact error output (not paraphrased)
- PASS verdicts MUST cite evidence (not just "it worked")
- Retry count MUST be tracked — escalate at attempt 3
- Fintech verification MUST reference specific file:line evidence

---

## 5. Escalation

**Used in**: ETH Phase E.4 (retry limit exceeded or critical blocker)

**Template:**

```markdown
## Escalation: Task [N] — [Title]

### Severity
[RETRY_LIMIT | BLOCKER | CRITICAL_FAILURE]

### What Was Tried
| Attempt | Action Taken | Result |
|---------|-------------|--------|
| 1 | [specific fix attempted] | [specific failure] |
| 2 | [specific fix attempted] | [specific failure] |
| 3 | [specific fix attempted] | [specific failure] |

### Failure Mode
[Precise description of why fixes are not resolving the issue]

### Root Cause Hypothesis
[Best assessment of the underlying problem]

### Recommended Intervention
[One of:]
- **Spawn replacement builder** with different approach: [describe approach]
- **User input needed**: [specific question or decision required]
- **Plan revision needed**: [what in the plan is incorrect or insufficient]
- **External dependency**: [blocker outside the team's control]

### Impact on Other Tasks
- Blocked tasks: [list task IDs that depend on this one]
- Unblocked tasks: [list task IDs that can proceed independently]

### Fintech Risk (if applicable)
[If the failing task has fintech flags, describe the risk of the current state]
```

**Constraints:**
- MUST include all attempted fixes — not just "tried 3 times"
- Root cause hypothesis MUST be present (even if uncertain)
- Recommended intervention MUST be actionable (not just "help needed")
- Impact assessment MUST identify downstream effects

---

## 6. Quality Gates

- [ ] Every handoff uses the correct template for its context
- [ ] Evidence fields reference specific files, lines, or output — not vague descriptions
- [ ] Fintech flags are copied from plan, never inferred or guessed
- [ ] FAIL verdicts include exact error output
- [ ] PASS verdicts cite evidence
- [ ] Retry count is tracked across QA verdict handoffs
- [ ] Escalations include all attempted fixes and root cause hypothesis
- [ ] Coverage assessment in research handoffs lists what was NOT investigated

---

## Cross-References

- [skills/bap/SKILL.md](../skills/bap/SKILL.md) — Phase B.2 (researcher spawn), B.5 (synthesis)
- [skills/eth/SKILL.md](../skills/eth/SKILL.md) — Phase E.2 (builder/QE prompts), E.4 (failure handling), T.1-T.3 (validation)
- [rules/global.md](global.md) — Radical Neutrality communication standards
- [rules/agents.md](agents.md) — Agent communication style requirements

**Version:** 1.0.0
**Last Updated:** 2026-03-10
**Applies To:** All BAP/ETH agent handoffs
