---
name: tech-select
description: >-
  Evidence-based technology selection using the TKB — constraint
  filtering, trade-off analysis, decision capture.
triggers:
  - technology selection
  - tech comparison
  - framework choice
  - library evaluation
  - TKB query
argument-hint: "[technology category or specific need]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, WebFetch, WebSearch
---

# Workflow: Technology Selection (Evidence-Based)

> Structured process for evaluating technologies against project constraints using the Technology Knowledge Base. Evidence over opinions — cite benchmarks, not vibes.

**Use when:**

- Evaluating a new library, framework, runtime, or tool
- Choosing between competing technologies before committing to implementation
- Documenting a technology decision for future reference (ADR)
- Periodic re-evaluation of existing technology choices

**Agent**: `knowledge-architect` (TKB query and validation). Escalate to `system-architect` for architecture-impacting decisions.

---

## Prerequisites

- [ ] User requirements clarified (performance, budget, team skills, timeline)
- [ ] Technology Knowledge Base accessible (`.claude/knowledge/`)
- [ ] Project constraints documented or discoverable from CLAUDE.md
- [ ] `rules/global.md` loaded (anti-bias protocol applies to all technology evaluations)

---

## TKB Reference

The Technology Knowledge Base (`.claude/knowledge/`) contains evaluation files organized by category:

- **Runtimes**: `knowledge/runtimes/` — Node.js, Bun, Deno, etc.
- **Frontend**: `knowledge/frontend/meta-frameworks/`, `knowledge/frontend/patterns/`
- **Backend**: `knowledge/backend/communication/`
- **Data Layer**: `knowledge/data/databases/`, `knowledge/data/orms/`
- **Testing**: `knowledge/testing/unit/`, `knowledge/testing/e2e/`
- **Security**: `knowledge/security/standards/`
- **Tooling**: `knowledge/tooling/linting/`

Each entry follows a standard schema: Overview, Key Metrics, Use Cases (fit scores 1-10), Trade-offs, Alternatives, References.

---

## Phase A: Requirements & Constraints

> Establish what the technology must do, what it must not do, and what trade-offs matter.

`[technology-selection.md] Phase A -- Requirements & Constraints`

### A.1 Extract Technical Constraints

Gather constraints across these dimensions:

| Constraint Type    | Questions to Ask                                              |
| ------------------ | ------------------------------------------------------------- |
| **Performance**    | Expected req/sec? Latency requirements? Cold start tolerance? |
| **Budget**         | Serverless pay-per-execute or dedicated infrastructure?       |
| **Team Skills**    | Existing expertise? Willingness to learn new tools?           |
| **Timeline**       | Prototype (weeks) vs production (months)?                     |
| **Existing Stack** | Must integrate with current services? Which versions?         |
| **Compliance**     | Regulatory requirements? License restrictions?                |

### A.2 Classify Hard vs Soft Constraints

- **Hard constraints**: Non-negotiable. Violating any one eliminates a candidate. (e.g., "must run on AWS Lambda", "must have MIT/Apache license")
- **Soft constraints**: Weighted preferences. Trade-offs acceptable. (e.g., "prefer fast cold start", "prefer large ecosystem")

### A.3 Define Scoring Weights

Assign weights based on project priorities. Default weights (adjust per project):

| Criterion                 | Default Weight | Source                                     |
| ------------------------- | -------------- | ------------------------------------------ |
| Performance               | 30%            | TKB metrics (req/sec, cold start, memory)  |
| DX (Developer Experience) | 25%            | Ecosystem size, learning curve, tooling    |
| Maturity                  | 20%            | Adoption rate, LTS policy, community size  |
| Cost                      | 15%            | Infrastructure costs, license, maintenance |
| Constraint Fit            | 10%            | Hard requirement satisfaction score        |

User may override weights based on project priorities.

### Gate A

| Option                 | Action                                                   |
| ---------------------- | -------------------------------------------------------- |
| `[Constraints Clear]`  | Proceed to Phase B with defined constraints and weights  |
| `[Need Clarification]` | Ask user to resolve ambiguous or conflicting constraints |

---

## Phase B: Research & Score

> Query the TKB, filter candidates, and produce scored evaluations.

`[technology-selection.md] Phase B -- Research & Score`

### B.1 Identify TKB Categories

Based on the technology domain, determine which TKB categories to query. Read the relevant evaluation files from `.claude/knowledge/`.

### B.2 Apply Hard Constraint Filter

Eliminate candidates that violate any hard constraint:

- If "must run on AWS Lambda" → Exclude tools with excessive cold start or binary size
- If "100% npm compatibility required" → Exclude runtimes with partial compatibility
- If "MIT license only" → Exclude GPL or proprietary options

Document each elimination with the constraint it violated.

### B.3 Score Remaining Candidates

For each surviving candidate, extract metrics from TKB entries and score against the weighted criteria from A.3:

- Read the TKB evaluation file for each candidate
- Extract quantified metrics (performance benchmarks, ecosystem stats, maturity indicators)
- Calculate weighted score using the formula: `Total = Sum(criterion_score * weight)`
- If TKB data is missing for a criterion, note it as a data gap (do not guess)

### B.4 Handle Missing TKB Data

If a candidate has no TKB entry or incomplete data:

1. Check if the technology is too new/niche for TKB coverage
2. Propose adding a TKB entry via `knowledge-architect` agent (if time permits)
3. Use publicly available benchmarks with source citations as interim data
4. Flag the data gap in the comparison matrix

---

## Phase C: Compare & Recommend

> Present side-by-side comparison and evidence-based recommendation.

`[technology-selection.md] Phase C -- Compare & Recommend`

### C.1 Generate Comparison Matrix

Present top 2-3 candidates side-by-side:

```markdown
## Technology Comparison: [Domain]

| Candidate    | [Metric 1] | [Metric 2] | [Metric 3] | Maturity | Fit Score |
| ------------ | ---------- | ---------- | ---------- | -------- | --------- |
| **Option A** | value      | value      | value      | status   | N/10      |
| Option B     | value      | value      | value      | status   | N/10      |
| Option C     | value      | value      | value      | status   | N/10      |

### Trade-offs

**Option A:**
- Strengths: [quantified]
- Weaknesses: [quantified]
- Risk: [specific risk with mitigation]

**Option B:**
- Strengths: [quantified]
- Weaknesses: [quantified]
- Risk: [specific risk with mitigation]
```

### C.2 Apply Anti-Bias Checklist

Before finalizing the recommendation, verify:

- [ ] **Recency bias**: Is this trending on HackerNews, or genuinely superior for this use case?
- [ ] **Survivorship bias**: Are we copying patterns from companies with different constraints?
- [ ] **Sunk cost**: Are we favoring the incumbent because of existing investment?
- [ ] **Confirmation bias**: Did we actively search for counter-evidence against the top candidate?

### C.3 Present Recommendation

Structure the recommendation as:

1. **Top Choice**: Highest fit score with evidence-based rationale
2. **Alternative**: Second-best with the scenario where it would be superior
3. **Eliminated**: What was filtered out and why (hard constraint violations)
4. **Data Gaps**: What we couldn't verify (missing TKB data, untested claims)
5. **Action Items**: Concrete next steps (e.g., "Validate these 3 dependencies", "Run benchmark on staging")

### Gate C

| Option                    | Action                                                        |
| ------------------------- | ------------------------------------------------------------- |
| `[Accept Recommendation]` | Proceed to Phase D — document the decision                    |
| `[Different Choice]`      | User selects a different candidate — document their rationale |
| `[More Research]`         | Return to Phase B with expanded scope or new candidates       |
| `[Abort]`                 | No decision needed at this time                               |

---

## Phase D: Document Decision

> Capture the technology decision as an ADR for future reference.

`[technology-selection.md] Phase D -- Document Decision`

### D.1 Record Decision

Produce an ADR following the format from `rules/documentation.md`:

```markdown
# ADR-NNN: [Technology] Selection for [Domain]

**Status**: Accepted
**Date**: YYYY-MM-DD

## Context

[What problem prompted this evaluation. What constraints existed.]

## Decision

[Which technology was selected, in one sentence.]

## Alternatives Considered

| Alternative | Fit Score | Why Not           |
| ----------- | --------- | ----------------- |
| [Option B]  | N/10      | [Specific reason] |
| [Option C]  | N/10      | [Specific reason] |

## Consequences

**Positive**: [What gets better — quantified where possible]
**Negative**: [What gets harder or more constrained]
**Action Items**: [Concrete follow-up tasks]
```

### D.2 Update Context

Record the decision in the project's running context so downstream workflows (BAP, ETH) can reference it:

- Technology stack decisions inform architecture planning
- Constraint trade-offs inform future evaluations
- Eliminated alternatives prevent re-evaluation of the same options

---

## Failure Handling

| Scenario                             | Resolution                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| TKB has no entry for any candidate   | Use public benchmarks with citations. Flag for TKB expansion via `knowledge-architect`.                                         |
| All candidates fail hard constraints | Re-examine constraints with user — some may be soft. If truly all fail, escalate to `system-architect` for architecture change. |
| Candidates score identically         | Add tie-breaking criteria: team familiarity, community momentum, migration cost from current stack.                             |
| User overrides recommendation        | Document their rationale in the ADR. The decision is theirs — the workflow provides evidence, not mandates.                     |
| Conflicting constraints              | Clarify priority with user ("Which matters more: speed or compatibility?"). Present hybrid approaches if viable.                |
| Stale TKB data (>12 months old)      | Flag as data gap. Propose TKB update before or after decision. Do not rely on stale benchmarks without caveat.                  |

---

## Anti-Patterns

| Anti-Pattern                             | Correct Approach                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| **"Just use X because it's popular"**    | Popularity is not evidence. Cite specific metrics for this project's constraints.  |
| **Subjective language ("fast", "easy")** | Quantify: "70k req/s" not "fast". "2-day learning curve" not "easy".               |
| **Ignoring incumbent**                   | Always include the current technology as a baseline candidate. Switching has cost. |
| **Single-source benchmarks**             | Cross-reference multiple sources. Vendor benchmarks are biased by definition.      |
| **Recommending without TKB check**       | Always check `.claude/knowledge/` first. Never recommend blind.                    |
| **Scoring without weights**              | Unweighted comparisons hide what matters. Always define weights in Phase A.        |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.
- **Noted friction**: [any steps that were unclear, improvised, or disproportionately effortful]

---

## Cross-References

- **TKB location**: [`.claude/knowledge/`](../knowledge/) — technology evaluation files
- **TKB schema**: [`knowledge-architect`](../agents/knowledge-architect.md) — entry format and quality standards
- **ADR format**: [`rules/documentation.md`](../rules/documentation.md) — normalized ADR template
- **Anti-bias protocol**: [`rules/global.md`](../rules/global.md) — anti-bias checklist (sunk cost, survivorship, confirmation, recency)
- **Architecture decisions**: [`system-architect`](../agents/system-architect.md) — for architecture-impacting selections
- **Documentation sync**: [`/docs`](../docs/SKILL.md) — ADR health audit
- **Evolution**: [`workflows/evolution.md`](../../workflows/evolution.md) — post-workflow memory capture
