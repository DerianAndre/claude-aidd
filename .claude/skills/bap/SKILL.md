---
name: bap
description: >-
  Brainstorm-Ask-Plan workflow. Use for planning any type of work. Triggers: plan, create, build, design, brainstorm.
triggers:
  - plan
  - create
  - build
  - design
  - brainstorm
  - implement
  - add
  - new feature
argument-hint: "[plan, work, user story, or problem description]"
user-invocable: true 
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, WebFetch, WebSearch
---

# Workflow: BAP (Brainstorm, Ask, Plan)

> Three-phase pre-implementation workflow with deep research (code + web), research-informed questioning, and ETH-consumable plan output. No code until plan is approved.

**Use when:**

- Building a new feature from a vague or partially-formed idea
- The user needs structured questioning before planning
- Exploring trade-offs between multiple approaches
- Starting any non-trivial creative or implementation work
- The user says "plan", "create", "build", "design", "implement", "add", or "brainstorm"

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] User request or idea exists (clear or vague)
- [ ] Relevant codebase context is accessible
- [ ] MCP tools available for web research (`context7`, `WebFetch`, `WebSearch`)
- [ ] Agent teams enabled for complex tasks (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)

---

## Workflow Phases

```
Phase B: BRAINSTORM  →  Gate  →  Phase A: ASK  →  Gate  →  Phase P: PLAN
```

- **BRAINSTORM**: Deep research (code + web) + agent team exploration
- **ASK**: Research-informed implementation questioning with scoring
- **PLAN**: ETH-consumable plan with atomic tasks, file paths, tiers, and deliverables

---

## Phase B: Brainstorm

> Explore the implementation space with evidence before forming opinions. Two-track research: codebase + web/documentation.

`[bap.md] Phase B -- Research & Synthesis`

REMEMBER: You are the guardian of a high-stakes Fintech/Crypto Enterprise System. Your code controls real assets. Errors result in financial loss. Security is PRIORITY.

NEVER sacrifice accuracy, clarity, or completeness for brevity. Quality is the only constraint — effort and time are not concerns.

### Simple task path

For tasks that are clear, single-file, or fewer than 3 steps:

- Lead explores inline: read relevant files, search for existing patterns, find reusable code
- Lead does web research via `WebSearch|WebFetch|context7` for implementation patterns
- Produce 2-3 distinct approaches with trade-offs
- No team spawning needed — proceed directly to Gate B→A

### Complex task path

For new features, cross-cutting concerns, or vague ideas:

#### B.0 — Input Consumption (USER STORY CHECK)

Before any research, the lead checks for and consumes product.md output.

**If a user story exists** at `docs/plans/active/<slug>/<slug>-user-story.md`:

1. Read the user story document
2. Extract pre-resolved decisions — these are INPUTS, not topics for debate:
   - **Critical Findings** (Section 8): Codebase contradictions already identified. Do NOT re-discover.
   - **Architecture Decision** (Section 9): Design choice already made. Do NOT re-debate.
3. Extract implementation targets — these become the basis for task decomposition:
   - **Technical Design delta** (Section 10): Files to create/modify. BAP converts these into atomic tasks.
   - **API Contract** (Section 3): Exact request/response shapes BAP's plan must implement.
   - **Acceptance Criteria step-by-step** (Section 6b): Procedure BAP converts into test cases.
4. Index all file paths referenced in the user story for verification in B.1.

**If no user story exists** (BAP invoked directly):

- Warn the user: "No user story found. Recommended flow is product.md → BAP. Quality will be higher with a user story as input. Proceed anyway?"
- If user confirms: BAP runs with expanded B.1 research to compensate. Lead does inline requirements gathering alongside implementation research.
- If user declines: Direct to [/product](../product/SKILL.md) first.

---

#### B.1 — Pre-Spawn Deep Research (DECOMPOSE state)

*This is the only step where the lead reads files. After spawn, the lead enters coordination-only mode.*

Before creating the team, the lead conducts three-track research:

##### Track 1: Codebase Research

- Read all files referenced in user story delta table (if user story exists)
- Verify every file path in Technical Design still exists and matches expectations
- Identify reusable code, existing patterns, utility functions that can be leveraged
- Search for existing tests that demonstrate the patterns to follow
- Run the fintech safety scan:

| Surface        | Check                                                          | If YES                                                                                                |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Money Movement | Creates, modifies, or reads ledger entries or wallet balances? | Flag for ETH dynamic composition — include security reviewer. Require transaction boundaries in plan. |
| Auth/Session   | Creates, modifies, or checks JWT tokens, roles, or guards?     | Flag for ETH dynamic composition — include security reviewer. Require fail-closed pattern in plan.    |
| PII            | Reads, writes, or transmits personal data?                     | Require encryption/masking notes per task.                                                            |
| Migrations     | Adds or modifies database tables, columns, indexes, or enums?  | List all schema changes. Require reversible migration.                                                |
| Ledger Writes  | Creates ledger transactions or entries?                        | Require debit/credit identification. Require BigInt precision.                                        |

##### Track 2: Web/Documentation Research

Use `context7` (resolve-library-id → query-docs), `WebFetch`, and `WebSearch` tools.

- Look up current API patterns for libraries in the implementation stack (consult STACK.md for project technologies)
- Search for implementation patterns relevant to HOW this will be built (guard composition, transaction patterns, migration strategies, test patterns)
- Focus on HOW questions, not WHAT questions — product.md already resolved WHAT
- Verify the planned approach matches the library's recommended usage
- Catch deprecated patterns or breaking changes between versions
- Cite sources for every implementation recommendation

##### Track 3: Version Protocol

- Run the 4-step version verification from `rules/version-protocol.md`
- Check `package.json` files for actual library versions in use
- Verify library versions match what the implementation plan will target
- Flag any version mismatches as constraints for Phase A

##### Track 4: Resource Detection & Enforcement (RDE)

Before team spawn, the lead scans the task description, user story (if exists), and Track 1-3 findings against the full detection registry.

**Process:**
1. Scan task text + codebase findings against ALL keyword registries (read `triggers:` from every `.claude/skills/*/SKILL.md` frontmatter + rule activation conditions + knowledge categories + agent descriptions + workflow triggers)
2. Build the Resource Manifest: detected-skills, detected-rules, detected-knowledge, detected-agents, detected-workflows
3. Emit the manifest as a status indicator (visible to user):

```
[aidd.md] RDE — Resource Detection & Enforcement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

detected-skills:     [list]
detected-rules:      [list]
detected-knowledge:  [list]
detected-agents:     [list]
detected-workflows:  [list]

Enforcement: ALL detected resources LOADED into context.
Fintech flags: [list or none]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. Load detected resources into researcher mission context
5. Record manifest in plan metadata for ETH consumption (see `## Resource Manifest` in Plan Document Structure)

**Enforcement rules:**
- Detection = MANDATORY loading. Not "consider" — LOAD.
- Phase A MUST include questions informed by every detected resource
- Plan includes the full manifest as `## Resource Manifest` section

**Detection registries:**
- **Skills**: Read `triggers:` from every `.claude/skills/*/SKILL.md` YAML frontmatter. No hardcoded keyword list — adding a skill with triggers automatically makes it detectable.
- **Rules** (beyond always-active): Match task keywords against rule activation conditions (e.g., backend.md triggers on NestJS/Express/Fastify/Prisma/SQL; frontend.md triggers on React/Vue/Tailwind; testing.md triggers on test/coverage; security.md triggers on auth/JWT/OWASP; performance.md triggers on latency/throughput/profiling).
- **Knowledge (TKB)**: Match against knowledge categories (runtimes/, backend/, frontend/, data/, patterns/, testing/, security/, infrastructure/, tooling/).
- **Agents**: Match against agent domain descriptions from CLAUDE.md agent table.
- **Workflows**: Match against workflow purpose (evolution.md triggers on lessons learned/friction).

**When clean-ddd-hexagonal detected (deep integration):**
1. Add dedicated domain modeling sub-track to researcher missions:
   - Extract business rules from requirements/user story
   - Identify candidate entities, value objects, aggregates
   - Map domain events and commands
   - Identify port interfaces needed
   - Determine CQRS applicability (read/write workload divergence)
2. Researcher missions include DDD-TACTICAL.md and HEXAGONAL.md as context
3. Phase A adds "Domain Modeling" as MANDATORY category (see Dynamic Category Selection)
4. Plan tasks follow domain-first build order (Domain → App → Infra → Pres)

---

##### Pre-Spawn Decomposition

After four-track research, the lead:

1. Classifies the feature's primary domain(s) to determine the optimal researcher team composition
2. Articulates non-overlapping research questions — one per researcher — with no scope overlap
3. Identifies which files/directories are relevant to each researcher's domain
4. Cannot proceed to spawn until clearly separated research angles exist

**Dynamic Researcher Selection:**

The lead composes the optimal research team (2-4 researchers) based on the feature's characteristics:

| Feature Domain                       | Best-Fit Researchers                                        |
| ------------------------------------ | ----------------------------------------------------------- |
| Domain logic (entities, VOs, events) | system-architect + pattern-analyst                          |
| Database/schema/migration            | data-architect + system-architect                           |
| Security/auth/crypto                 | security-architect + system-architect                       |
| API endpoints/controllers            | contract-architect + pattern-analyst                        |
| Frontend architecture                | experience-engineer + design-architect                      |
| UI components                        | interface-artisan + design-architect                        |
| CI/CD/infrastructure                 | platform-engineer + system-architect                        |
| Cross-cutting/full-stack             | system-architect + implementation-analyst + pattern-analyst |

**Rules:**
- Minimum 2 researchers, maximum 4
- Always include at least 1 researcher who covers codebase patterns (pattern-analyst or implementation-analyst)
- If fintech safety scan in Track 1 flagged ANY risk surface → always include security-architect (regardless of domain)
- The lead is NOT constrained to this table — novel combinations are valid if justified by the feature's characteristics
- Each researcher prompt uses the same structured format: Finding/Evidence/Risk/Recommendation + CONFLICT handling + web research tools

**Rationale**: Dynamic composition ensures the right specialists research the right domains. Pre-decomposition prevents "lead drift" — the lead forming opinions during the research window.

---

#### B.2 — TeamCreate & Spawn (SPAWN state)

`TeamCreate "bap-<feature-slug>"`

Spawn the dynamically-selected researchers (from Pre-Spawn Decomposition) with **scope-bounded prompts**.

**Universal prompt template** (all researchers receive this structure):

```
"[RESEARCHER-SPECIFIC MISSION]. Read-only — no file edits under any circumstances.
Use `context7` (resolve-library-id → query-docs), `WebFetch`, and `WebSearch` for current documentation.
For each finding, cite specific file paths (consult STACK.md for directory structure).
DM the lead using the Researcher → Lead handoff format from rules/handoffs.md:
  Finding: [what] / Evidence: [file:line] / Risk: [Critical|High|Medium|Low] / Recommendation: [action] / Confidence: [high|medium|low — with rationale]
Include Coverage Assessment: what was investigated AND what was not investigated.
If you disagree with another researcher's finding, flag it:
  [CONFLICT]: [what conflicts] — [your evidence vs their claim]
Reference: [RESEARCHER-SPECIFIC RULES]. Scope: [RESEARCHER-SPECIFIC SCOPE]. Depth: 3-5 findings maximum. Prioritize by Risk level.
Handoff format: rules/handoffs.md Section 2 (Researcher → Lead)."
```

**Researcher mission templates** (lead selects and customizes based on team composition):

- **implementation-analyst**: Mission: Analyze user story delta table and acceptance criteria. Identify existing code to extend vs new code to create, utility functions to reuse, test patterns to follow. Report incremental build order and hidden dependencies. Rules: `rules/backend.md`, `rules/code-style.md`, `rules/deliverables.md`.

- **system-architect**: Mission: Map technical constraints — dependency order, shared-file serialization points, migration sequencing, risk surfaces. Run fintech risk checklist (money movement, auth/session, migrations, ledger writes, PII). Rules: `rules/backend.md`, `rules/security.md`, `agents/system-architect/system-architect.md`.

- **pattern-analyst**: Mission: Audit codebase patterns for consistency — naming conventions, test patterns to mirror, import structures, layer boundaries. Report simplest implementation path and biggest convention-deviation risk. Rules: `rules/code-style.md`, `rules/frontend.md` (if FE), `rules/testing.md`.

- **security-architect**: Mission: Deep security audit of the feature's attack surface. OWASP Top 10 analysis, threat modeling for the specific feature, auth/session flow review, PII handling audit, encryption requirements. Rules: `rules/security.md`, `agents/security-architect/security-architect.md`.

- **data-architect**: Mission: Schema design review — migration strategy, index coverage, query performance, data integrity constraints, FK strategy, reversibility. Rules: `rules/backend.md` (database section), `agents/data-architect/data-architect.md`.

- **contract-architect**: Mission: API contract analysis — endpoint design, request/response shapes, status codes, versioning, rate limiting, idempotency. Rules: `rules/backend.md` (API section), `agents/contract-architect/contract-architect.md`.

- **experience-engineer**: Mission: Frontend architecture — component hierarchy, state management strategy, data flow, performance budgets, Core Web Vitals impact. Rules: `rules/frontend.md`, `agents/experience-engineer/experience-engineer.md`.

- **design-architect**: Mission: Design system compliance — token usage, WCAG 2.1 AA, responsive breakpoints, component composition patterns, accessibility. Rules: `rules/frontend.md`, `agents/design-architect/design-architect.md`.

- **platform-engineer**: Mission: Infrastructure impact — CI/CD changes, Docker configuration, environment variables, deployment sequence, rollback strategy. Rules: `agents/platform-engineer/platform-engineer.md`.

The lead customizes each prompt with the feature-specific scope (which files/directories to focus on) and the user story reference (if exists).

---

#### B.3 — Lead During Research (MONITOR state)

**Lead enters coordination-only mode. No file reading. No codebase exploration. No opinion-forming on approaches.**

Lead responsibilities while researchers work:

- Track task status — has each researcher DM'd their completion?
- React to idle notifications — an idle notification without a findings DM means the researcher finished without reporting; lead sends a check-in DM
- If researcher DMs a blocker → provide clarification or narrow the scope
- If researcher DMs a `[CONFLICT]` → acknowledge, log for synthesis; do NOT resolve during research window
- If researcher reports findings that seem thin → request deeper investigation on specific gap
- Do NOT message all researchers simultaneously — targeted DMs only (broadcast = token waste + noise)
- Do NOT form approach opinions before all researchers report — premature synthesis poisons the anchor

**Lead constraint**: Lead coordinates only. No file edits, no implementation, no codebase exploration during MONITOR.

---

#### B.4 — Failure Handling

| Scenario                                            | Action                                                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Researcher blocked (can't access context)           | Researcher DMs lead → lead provides clarification or narrows scope; researcher resumes                                                        |
| Researcher idle without reporting                   | Lead sends check-in DM; if still silent after follow-up, log findings as "inconclusive — [researcher]" and proceed with remaining researchers |
| Researcher edits files (scope violation)            | Lead immediately enforces read-only; scope violation does not invalidate submitted findings; lead logs violation                              |
| Two researchers report [CONFLICT]                   | Lead logs both positions with evidence; does NOT resolve — preserves both for synthesis; surfaces to user as decision point                   |
| Implementation-analyst finds feature already exists | Lead adds "build vs. reuse" as mandatory dimension in synthesis table                                                                         |
| System-architect flags Critical-risk surface        | Lead adds the risk surface as mandatory topic in Phase A, category 2 (Risk Mitigation)                                                        |
| Researcher CONFLICTs with user story decision       | Lead logs but preserves user story decision as default. User decides if override is warranted.                                                |
| All researchers complete, gap remains               | Lead spawns a single targeted follow-up researcher on the specific gap only; does not re-run full team                                        |

---

#### B.5 — Synthesis (SYNTHESIZE state)

**Trigger**: All spawned researchers have reported completion (or lead has handled failures per B.4).

**Step 1 — Coverage validation matrix** *(internal, before writing synthesis)*

Validate researcher handoffs against the Researcher → Lead template (`rules/handoffs.md` Section 2). Each handoff MUST have: Findings with Evidence/Risk/Recommendation, Coverage Assessment (investigated + not investigated), Confidence levels, and Synthesis recommendation.

Before writing anything, the lead validates:

| Approach | [Researcher 1 dimension] | [Researcher 2 dimension] | [Researcher N dimension] | ETH-readiness |
| -------- | ------------------------ | ------------------------ | ------------------------ | ------------- |
| Option A | [filled or GAP]          | [filled or GAP]          | [filled or GAP]          | [yes or GAP]  |
| Option B | [filled or GAP]          | [filled or GAP]          | [filled or GAP]          | [yes or GAP]  |
| Option C | [filled or GAP]          | [filled or GAP]          | [filled or GAP]          | [yes or GAP]  |

Column headers adapt to the actual researchers spawned (e.g., "Security risk (security-architect)", "Schema design (data-architect)").

If any cell is GAP → lead either fills it from existing findings or spawns a targeted follow-up before proceeding. Single-pass synthesis is not acceptable.

**ETH-readiness column**: Can this approach produce atomic tasks with exact file paths, tier assignments, and per-task acceptance criteria? If not → the approach needs further decomposition before it's viable.

**Step 2 — Attribution-preserving synthesis**

Each finding in the synthesis must cite which researcher found it:
- `[researcher-role] found: [finding] — [file:line]`
- Examples: `security-architect found: [vulnerability] — [file:line]`, `data-architect found: [index gap] — [file:line]`

This enables the user to interrogate specific findings and prevents the lead from averaging away important tensions.

**Step 3 — Conflict preservation**

If researchers disagreed (`[CONFLICT]`), the synthesis presents both positions with evidence. The lead does NOT resolve the conflict — it is surfaced to the user as an explicit decision point:

> `[CONFLICT — user decision required]: system-architect rates X as high-risk [evidence]; implementation-analyst rates X as high-value [evidence]. Recommendation: decide before Phase A category 2.`

**Step 4 — Produce approaches table**

| Criteria                                | Weight | Option A | Option B | Option C |
| --------------------------------------- | ------ | -------- | -------- | -------- |
| Feasibility (can we build it?)          | High   |          |          |          |
| Complexity (effort to implement)        | High   |          |          |          |
| Maintainability (long-term cost)        | Medium |          |          |          |
| Pattern Alignment (fits conventions)    | High   |          |          |          |
| Security (fintech risk surface)         | High   |          |          |          |
| ETH-readiness (atomic task breakdown)   | High   |          |          |          |
| Tier distribution (T1/T2/T3 task count) | Medium |          |          |          |

**Step 5 — Synthesis validation pass**

After writing the synthesis, the lead asks: "Does this synthesis answer: which approach produces the best ETH-consumable plan with the lowest risk?" If gaps remain, return to Step 1.

---

#### B.6 — TeamDelete & Present

1. Lead sends `shutdown_request` to each researcher
2. `TeamDelete` only after all confirmations received
3. **Lead runs Phase A solo** — Phase A is structured dialogue with the user requiring a single voice. Phase P is solo by default but MAY use specialist assist for complex plans (see Phase P).
4. Present 3 approaches to user with:
   - Recommendation and rationale (evidence-based, not opinion)
   - Attribution summary (which researcher surfaced which key constraints)
   - Unresolved conflicts surfaced explicitly as user decision points
   - ETH-readiness assessment for each approach

### Gate B→A

| Option                 | Condition                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `[Proceed to Ask]`     | Implementation space articulated with codebase + web evidence. All researcher domains covered. Selected approach can produce atomic ETH tasks. |
| `[Targeted Follow-up]` | A domain is missing coverage or ETH-readiness is unclear. Return to B for focused research on the gap.                                         |
| `[Re-brainstorm]`      | Fundamental assumptions invalidated by research. Restart B with revised scope.                                                                 |

---

## Phase A: Ask

> Structured implementation questioning. All questions MUST cite Phase B findings. Product.md pre-resolved decisions are confirmed facts, not re-asked.

`[bap.md] Phase A -- Structured Questioning`

**Differentiation from Product ASK:**
- Product ASK = WHAT to build (requirements, domain rules, scope, business invariants)
- BAP ASK = HOW to build it (architecture approach, task order, test strategy, risk handling)

### Question Design Protocol

Every question to the user MUST follow one of these patterns:

1. **Research-informed**: "Based on [finding from B.1 Track 2], the recommended implementation pattern is X. Should we follow this, or do you have a reason to diverge?"
2. **Evidence-citing**: "The codebase currently implements Y at [file:line]. We need Z. Should we extend Y or create a new approach?"
3. **Trade-off**: "Web research shows two valid implementation patterns: A (per [source]) and B (per [source]). Which fits our constraints?"
4. **Confirmation**: "Based on [fintech safety scan], this implementation touches money movement. Confirming: we need transaction boundaries and BigInt precision in every task that modifies balances. Correct?"
5. **Resource-informed**: "RDE detected [skill/rule/knowledge]. This means [implication]. Confirming: [question about how the detected resource applies]." (e.g., "RDE detected clean-ddd-hexagonal. Should we model X as an aggregate with Y as a value object?")

**Rule**: If you have no findings to reference for a question, you haven't explored enough — return to Phase B for more research.
**Rule**: Phase A MUST include at least one question informed by each detected resource category from the Resource Manifest. If RDE detected a TKB entry, ask about the technology choice. If RDE detected a rule, confirm the constraint applies.

- If codebase evidence answers a question conclusively → present as confirmed fact, don't ask the user
- If web research provides a clear standard → present as recommended default, user can override
- Pre-resolved decisions from product.md → present as confirmed inputs, user can override with explicit justification

---

### Dynamic Category Selection

The lead selects ASK categories based on Phase B findings. Categories are NOT fixed — they adapt to the feature's implementation characteristics.

**Core categories** (ALWAYS included — every implementation plan needs these):

#### Architecture Approach (core)

- Which approach from Phase B synthesis? What's the rationale?
- What's the dependency graph between implementation tasks?
- What's the build order? (domain → application → infrastructure → presentation)
- Which patterns from the codebase to follow? (cite file paths from Phase B)
- Which library APIs to use? (cite web research from Phase B Track 2)

#### Task Decomposition (core)

- How do we break this into atomic, independently-testable tasks?
- What's the minimum viable first task? (ideally: a failing test)
- What tasks can be parallelized? (no shared files, no sequential deps)
- What tasks must be sequential? (shared files, migration ordering)
- Does each task have a clear "done" criterion that QE can verify?

**Feature-specific categories** (lead selects 2-4 based on Phase B findings):

#### Risk Mitigation

- How do we mitigate each risk surface identified in Phase B's fintech safety scan?
- What's the rollback strategy for migrations?
- What fintech safety measures apply to each task? (transaction boundaries, BigInt, fail-closed)
- What's the plan if implementation diverges from the user story's architecture decision?
- Product identified WHAT risks exist — BAP determines HOW to handle them in code.
- **Include when**: fintech flags present, security risk surfaces identified, or auth changes needed

#### Test & Verification Strategy

- What test approach per task? (unit, integration, contract)
- Which layers need what coverage? (Domain: 100%, Application: ≥90%, Controllers: ≥70%, Infrastructure: ≥60%)
- Where are the contract test boundaries? (port ↔ adapter interfaces)
- What's the QE validation protocol for ETH? (typecheck → lint → targeted tests)
- Product defined acceptance criteria — BAP determines HOW to verify them.
- **Include when**: feature has complex testing needs, new test patterns required, or contract test boundaries

#### Migration Strategy

- What schema changes are required? Are migrations reversible?
- What data backfill or transformation is needed?
- What's the deployment sequence? (migration before code? code before migration?)
- What's the rollback procedure if migration fails?
- **Include when**: feature requires database schema changes, enum additions, or data transformations

#### Integration Approach

- What external systems/services does this connect to?
- What are the adapter boundaries? (port interface → adapter implementation)
- What failure modes exist at integration points?
- What retry/circuit-breaker strategies are needed?
- **Include when**: feature crosses package boundaries or integrates with external providers

#### Performance Constraints

- What throughput/latency targets apply?
- What query optimization is needed? (indexes, eager loading, batch queries)
- What caching strategy applies?
- What load testing is needed before deploy?
- **Include when**: feature handles high-throughput operations or has performance-sensitive paths

#### Domain Modeling (auto-included when clean-ddd-hexagonal detected by RDE)

- What are the aggregate boundaries? Which entities belong together?
- Which concepts are entities vs value objects? (identity vs structural equality)
- What port interfaces are needed? (driven ports for infra, driver ports for app layer)
- What domain events should be emitted? (state transitions that other contexts care about)
- Is CQRS applicable? (do read and write workloads diverge significantly?)
- What anti-corruption layer patterns are needed for external integrations?
- Reference: `skills/clean-ddd-hexagonal/references/DDD-TACTICAL.md`, `skills/clean-ddd-hexagonal/references/HEXAGONAL.md`
- **Include when**: RDE detects clean-ddd-hexagonal skill (MANDATORY when detected, not optional)

**Category selection rules:**
- Minimum: 2 core + 2 feature-specific = 4 categories
- Maximum: 2 core + 5 feature-specific = 7 categories
- Lead distributes 100 points across selected categories, weighted by importance to THIS implementation
- If fintech flags present → Risk Mitigation MUST be included
- If clean-ddd-hexagonal detected → Domain Modeling MUST be included
- The lead justifies the selection and weighting based on Phase B findings

---

### Confidence Assessment

After covering all selected categories, produce:

```
Implementation Clarity: [score]/100

Categories selected: [list selected categories with point allocation]
Justification: [why these categories, based on Phase B findings]

Scoring (per-category — fully resolved: allocated pts, partially: 60% of pts, unresolved: 0):
  [Category 1]:  [score]/[allocated] — [resolved items or open questions]
  [Category 2]:  [score]/[allocated] — [resolved items or open questions]
  [Category 3]:  [score]/[allocated] — [resolved items or open questions]
  [Category 4]:  [score]/[allocated] — [resolved items or open questions]
  [Category 5]:  [score]/[allocated] — [if selected]
  [Category 6]:  [score]/[allocated] — [if selected]

Unresolved: [list open items]
Blocked by: [list or "nothing"]
```

---

### Gate A→P

> Score ≥ 90/100 AND every selected category ≥ 60% of its allocated points AND user confirms readiness.

If not met → ask more questions or do more web research. Do not proceed with unresolved implementation ambiguity.

---

## Phase P: Plan

> Author the ETH-consumable plan document. Every task must be atomic, have file paths, a tier assignment, and a testable acceptance criterion.

`[bap.md] Phase P -- Plan Document`

**Output:** Plan documents at `docs/plans/active/<YYYY.MM.DD>-<ticket-number>-<feature-name>/`

### Optional Specialist Assist

For complex plans (15+ tasks or high fintech flag density), the lead MAY spawn a single specialist Explore agent to assist with plan verification:

- **data-architect**: Verify migration ordering, schema change safety, index strategy
- **security-architect**: Verify fintech flag assignment accuracy, auth flow correctness
- **system-architect**: Verify dependency graph, layer boundary compliance

This is optional — the lead judges whether specialist input adds value to the plan's accuracy. The specialist verifies, not authors. Phase A remains solo (structured dialogue needs single voice).

### Plan Document Structure

```markdown
# Plan — [Feature Name]
> [One-line description]

**Date**: YYYY-MM-DD
**Status**: Draft | Approved | In Progress | Complete
**Branch**: feature/[name] or fix/[name]
**User Story**: docs/plans/active/<slug>/<slug>-user-story.md (or "N/A — BAP invoked directly")
**ETH Composition Data**: [see ETH Composition Data section below]

## Context
[Problem statement from user story + brainstorm synthesis summary]

## Pre-Resolved Decisions
[From user story: list consumed Critical Findings and Architecture Decision]
[BAP does NOT re-debate these — they are implementation inputs]
[If no user story: "BAP invoked directly — no pre-resolved decisions"]

## Architecture Decisions (BAP-specific)
[Decisions made during BAP Phase A that are NOT in the user story]
[Build order, test strategy, pattern choices, library API selections]

## Implementation Steps

| #   | Task          | Files     | Layer          | Tier | Complexity | Acceptance       | Status  |
| --- | ------------- | --------- | -------------- | ---- | ---------- | ---------------- | ------- |
| 1   | [Atomic task] | `src/...` | Domain         | T3   | Low        | [specific check] | pending |
| 2   | [Atomic task] | `src/...` | Application    | T2   | Medium     | [specific check] | pending |
| 3   | [Atomic task] | `src/...` | Infrastructure | T2   | Medium     | [specific check] | pending |
| 4   | [Atomic task] | `src/...` | Presentation   | T3   | Low        | [specific check] | pending |

### Task Details

#### Task 1: [Name]
- **Files**: `exact/path/to/file.ts` (create | modify)
- **Layer**: Domain | Application | Infrastructure | Presentation
- **Tier**: T1 (Opus — complex logic, architecture) | T2 (Sonnet — standard implementation) | T3 (Haiku — boilerplate, wiring)
- **Depends on**: [task IDs or "none"]
- **Acceptance**: [specific, testable criterion — e.g., "unit test passes for X", "typecheck clean"]
- **Fintech flags**: [money | auth | PII | migration | ledger | none]

[Repeat for each task]

## Testing Strategy
[Per-layer coverage targets from Phase A.4]
[Test file locations — where new tests will live]
[Contract test boundaries — which port/adapter interfaces need contract tests]
[QE validation command sequence: typecheck → lint → test:targeted <paths> (see STACK.md for commands)]

## Risks & Mitigations
[From Phase A.2 — implementation-specific risks with concrete mitigation plans]
[Each risk must have: description, severity, mitigation strategy, rollback plan]

## Divergence Log
[Empty on creation — filled by ETH lead when implementation diverges from plan]
| Date | Task | Divergence | Reason | Plan Updated |
| ---- | ---- | ---------- | ------ | ------------ |

## ETH Composition Data
**Task count**: [N]
**Independent task groups**: [N groups — list which tasks per group]
**Tier distribution**: [N T1, N T2, N T3]
**T1 task domains**: [list: domain/security/data/frontend/etc.]
**Fintech flag density**: [N of M tasks flagged — list flags per task]
**Layers touched**: [domain | application | infrastructure | presentation]
**BAP suggestion**: [free-form text — what BAP thinks the optimal ETH team looks like, NOT a mode letter. e.g., "3 builders (1 specialist data-architect for migration tasks, 2 general), security-focused review sub-team due to 4/7 tasks having fintech flags"]

## Resource Manifest

> Auto-generated by RDE (Resource Detection & Enforcement) in BAP Phase B.1 Track 4.
> ETH Phase E.0 re-verifies and may extend.

**detected-skills**: [list or none]
**detected-rules**: [list beyond always-active]
**detected-knowledge**: [TKB category/entries or none]
**detected-agents**: [list]
**detected-workflows**: [list or none]
**fintech-flags**: [list or none]
```

### Task Granularity

Each implementation step must be independently verifiable in 2-5 minutes:
- "Write the failing test" — one step
- "Run it to confirm it fails" — one step
- "Implement minimal code to pass" — one step
- "Run tests to confirm pass" — one step
- "Commit" — one step

### Tier Assignment Guide

| Tier | Model  | When to Assign                                                               |
| ---- | ------ | ---------------------------------------------------------------------------- |
| T1   | Opus   | Complex domain logic, architecture decisions, security-critical code         |
| T2   | Sonnet | Standard implementation, service wiring, adapter creation, integration tests |
| T3   | Haiku  | Boilerplate, DTOs, re-exports, module registration, simple tests             |

### Layer Build Order

Tasks MUST be ordered by architectural layer (inside-out):

1. **Domain** — Entities, VOs, enums, events, exceptions, domain services (pure, no framework deps)
2. **Application** — Use cases, application services (depend on domain ports)
3. **Infrastructure** — Repository adapters, encryption adapters, external service adapters
4. **Presentation** — Controllers, DTOs, guards, modules, framework wiring (see STACK.md for framework)

Create `TodoWrite` items for all tasks after plan approval.

---

## Deliverables

Once the user has approved the plan BEFORE implementation begins, CREATE the following deliverables:

### Required Files

The plan folder should already exist if product.md ran first. If not, create it:

```
docs/plans/active/<YYYY.MM.DD>-<ticket-number>-<feature-name>/
├── *-user-story.md   (already here from product, if applicable)
├── *-plan.md          ← BAP creates
├── *-adr.md           ← BAP creates
└── *-diagram.md       ← BAP creates
```

1. **`*-plan.md`** — Implementation plan (above structure). Full task breakdown with file paths, tiers, acceptance criteria.
2. **`*-adr.md`** — BAP-specific architecture decisions. NOT duplicating user story Section 9. Only decisions made during BAP (build order, pattern choices, library API selections, test strategy).
3. **`*-diagram.md`** — Mermaid diagrams: task dependency graph, sequence diagrams for key implementation flows, layer interaction diagram.

### Example

If ticket number is provided by the user story or the branch name, use it:
```
docs/plans/active/2026.02.20-ticket-123-add-new-feature/
├── 2026.02.20-ticket-123-add-new-feature-user-story.md  (from product)
├── 2026.02.20-ticket-123-add-new-feature-plan.md
├── 2026.02.20-ticket-123-add-new-feature-adr.md
└── 2026.02.20-ticket-123-add-new-feature-diagram.md
```

If no ticket number is provided:
```
docs/plans/active/2026.02.20-add-new-feature/
├── 2026.02.20-add-new-feature-plan.md
├── 2026.02.20-add-new-feature-adr.md
└── 2026.02.20-add-new-feature-diagram.md
```

### After Deliverables

1. Create `TodoWrite` items for all implementation tasks
2. Check current branch — suggest `feature/<name>` or `fix/<name>` if on `main` or `develop`
3. Commit plan: `docs(scope): add plan for <feature>`
4. Proceed to execution ([/eth](../eth/SKILL.md))

**Gate P→Execute:** Plan is actionable, atomic, and verifiable? Every task has file paths, tier, and acceptance criterion? User approves.

---

## Artifacts Produced

| Artifact              | Phase | Location                                     |
| --------------------- | ----- | -------------------------------------------- |
| Research Synthesis    | B     | Inline (internal — not saved as file)        |
| Confidence Assessment | A     | Inline (presented to user)                   |
| Plan Document         | P     | `docs/plans/active/<slug>/<slug>-plan.md`    |
| ADR Document          | P     | `docs/plans/active/<slug>/<slug>-adr.md`     |
| Diagram Document      | P     | `docs/plans/active/<slug>/<slug>-diagram.md` |
| TodoWrite Items       | P     | Claude Code todo list                        |
| Spec Commit           | Post  | Git history                                  |

---

## Success Criteria

- [ ] Phase B consulted both codebase AND web/documentation sources
- [ ] User story consumed as input (if exists) — pre-resolved decisions not re-debated
- [ ] At least 3 distinct implementation approaches explored in Phase B
- [ ] All selected implementation categories covered in Phase A (2 core + 2-4 feature-specific)
- [ ] Implementation clarity score ≥ 90% before planning
- [ ] Plan has atomic tasks with exact file paths and tier assignments
- [ ] Every task has an independently testable acceptance criterion
- [ ] Fintech safety scan completed and flags propagated to tasks
- [ ] ADR and diagram deliverables produced (not skipped)
- [ ] TodoWrite items created for all tasks
- [ ] User approved the plan
- [ ] Plan committed to version control before implementation

---

## Failure Handling

| Scenario                                                 | Action                                                                                             |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| No user story exists (BAP invoked directly)              | Warn user. Run expanded B.1 research. Quality will be lower without product.md output.             |
| User story file paths are stale                          | Lead re-verifies during B.1 Track 1. Flag stale paths. Update references before planning.          |
| Web research contradicts user story architecture         | Surface to user. User story decision is default — user must explicitly override.                   |
| Library docs show deprecated API in user story approach  | Mandatory finding. Cite deprecation. Recommend alternative in Phase A.                             |
| Researcher CONFLICTs with user story pre-resolved item   | Lead logs but preserves user story decision as default. User decides if override is warranted.     |
| Cannot decompose into atomic tasks                       | Return to Phase A. Ask user to split into multiple stories. Each story gets its own BAP run.       |
| Task dependency creates serialization bottleneck         | Flag in plan ETH Composition Data. Note serialization constraint. Do not force parallel execution. |
| Plan exceeds 20 tasks                                    | Split into multiple implementation phases. Each phase is independently shippable.                  |
| Version protocol reveals incompatible library version    | BLOCKER. Cannot plan against wrong library version. Resolve version first.                         |
| Researcher finds security vulnerability in existing code | Escalate immediately. Do not plan around known vulnerabilities.                                    |
| Researcher blocked (can't access context)                | Researcher DMs lead → lead provides clarification or narrows scope.                                |
| Technology selection needed (new library/tool)           | Invoke [/tech-select](../tech-select/SKILL.md). Cannot proceed with unvalidated tech choice.       |

---

## Anti-Patterns

| Anti-Pattern                         | Description                                                            | Mitigation                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Re-debating product decisions**    | Arguing about user story's Critical Findings or Architecture Decisions | B.0 consumes user story. Pre-resolved decisions are inputs, not topics.   |
| **Blind questions**                  | Phase A questions with no research backing                             | Every question MUST cite Phase B findings. No research = no question.     |
| **Requirements re-asking**           | Asking WHAT to build instead of HOW to build it                        | BAP ASK = HOW. Product ASK = WHAT. Categories are implementation-focused. |
| **Monolithic tasks**                 | One giant task instead of atomic steps                                 | Every task must be independently verifiable in 2-5 minutes.               |
| **Missing file paths**               | Tasks say "modify X" without exact paths                               | Every task must list exact files to create or modify.                     |
| **Missing tiers**                    | No tier assignment on tasks                                            | Every task must have T1/T2/T3 based on cognitive demand.                  |
| **Missing acceptance**               | No per-task acceptance criterion                                       | Every task must have a specific, testable check.                          |
| **Skipping web research**            | No library/framework docs consulted                                    | B.1 Track 2 is mandatory. Use `context7` for library docs.                |
| **Anchoring**                        | Fixating on the first approach generated                               | Phase B synthesis requires 3+ genuinely distinct approaches.              |
| **Premature convergence**            | Selecting approach before exploring alternatives                       | Phase B requires diverge before converge.                                 |
| **Vague plan context**               | Plan doesn't reference user story                                      | Plan must link to user story document or state "BAP invoked directly".    |
| **Skipping ADR/diagram**             | Only producing plan.md                                                 | Both are mandatory deliverables per `rules/deliverables.md`.              |
| **Skipping TeamDelete**              | Research teammates still running when Phase A begins                   | TeamDelete is mandatory before Phase A.                                   |
| **Researchers editing files**        | Research teammates modifying code during Phase B                       | Spawn prompts explicitly restrict to read-only.                           |
| **Lead implementing during MONITOR** | Lead reads files or forms opinions during research                     | Lead coordinates only. No file reading, no opinion-forming.               |
| **Open-ended questions**             | Asking without concrete options                                        | `AskUserQuestion` with 2-4 choices and a recommended option always.       |
| **Confidence without evidence**      | Claiming ≥90% without explicit assessment                              | Written assessment block required with per-category scores.               |
| **Plan-reality divergence**          | Implementation differs from plan without updating                      | Update plan FIRST, then continue. Divergence log in plan template.        |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Input workflow (Product)**: [/product](../product/SKILL.md) (produces user story BAP consumes)
- **Next phase (Execute)**: [/eth](../eth/SKILL.md) (implements the plan BAP produces)
- **Architecture patterns**: [/architecture-audit](../architecture-audit/SKILL.md) (domain purity, port/adapter checks)
- **Technology selection**: [/tech-select](../tech-select/SKILL.md) (evidence-based tech choices)
- **Version protocol**: `rules/version-protocol.md` (4-step library version verification)
- **Backend rules**: `rules/backend.md` (hexagonal architecture, database patterns)
- **Security rules**: `rules/security.md` (OWASP, secrets, fintech safety)
- **Testing rules**: `rules/testing.md` (coverage targets, AAA pattern)
- **Deliverables rule**: `rules/deliverables.md` (required outputs per feature)
- **Agent teams docs**: https://code.claude.com/docs/en/agent-teams
