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
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, WebFetch, WebSearch, AskUserQuestion
complexity: highest
effort: highest
mode: team
---

# Workflow: BAP (Brainstorm, Ask, Plan)

> Two-phase pre-implementation workflow: interleaved research and questioning (Brainstorm & Ask), then ETH-consumable plan output. No code until plan is approved.

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

NEVER sacrifice accuracy, clarity, or completeness for brevity. Quality is the only constraint — effort and time are not concerns.

**CARDINAL RULE: ALWAYS RECOMMEND THE BEST APPROACH.** Time and effort are NEVER valid reasons to recommend an inferior solution. BAP exists to find the objectively best implementation path — not the fastest, not the easiest, THE BEST. If the best approach takes 10x longer, recommend it. If the best approach requires rewriting a subsystem, recommend it. Convenience is not a criterion. Technical excellence is the only criterion. Every recommendation must be the approach you would choose if time and effort were unlimited. Compromising on quality to save effort produces technical debt that compounds indefinitely.

### ENFORCEMENT: Research Phase is MANDATORY

**This phase CANNOT produce shallow or unverified output. Quality is the only constraint.**

1. You MUST perform BOTH codebase research AND web/documentation research
2. You MUST cite sources for every implementation recommendation
3. You MUST run the domain safety scan for ALL task paths (simple and complex)
4. You MUST run version protocol verification for ALL task paths
5. You MUST produce a minimum of 3 genuinely distinct approaches with evidence-backed trade-offs
6. You MUST recommend the approach with the highest technical quality, regardless of implementation effort

**Research Quality Standard**: Every claim must have an evidence chain: claim → source → verification → confidence level.
Violating this standard produces plans built on assumptions, not evidence.

**Recommendation Quality Standard**: The recommended approach MUST be the one that produces the best long-term outcome. NEVER downgrade a recommendation because it is harder to implement. If two approaches differ only in effort, recommend the superior one without hedging. Trade-off matrices evaluate correctness, maintainability, security, and architectural purity — NOT developer convenience.

### Task Path Classification (Decision Tree)

```
Is the task clear, single-file, and < 3 steps?
├─ NO → COMPLEX PATH
└─ YES → Check safety:
    ├─ Does it touch money, auth, PII, migration, or ledger? → COMPLEX PATH
    ├─ Does it require a new architectural pattern? → COMPLEX PATH
    ├─ Does it span multiple modules/packages? → COMPLEX PATH
    ├─ Is the user's request < 2 sentences with < 3 specific requirements? → COMPLEX PATH (insufficient context)
    └─ ALL checks pass → SIMPLE PATH (with mandatory research steps)
```

**Default**: If uncertain, use COMPLEX PATH. The cost of over-researching is low. The cost of under-researching is rework.

### Simple task path

For tasks that are clear, single-file, or fewer than 3 steps:

**Classification gate**: Before using simple path, verify ALL of these are true:
- Feature spans single module (no cross-cutting concerns)
- Zero high-risk surfaces (money, auth, PII, migration, ledger)
- No new architectural patterns required
- Lead can identify 2-3 approaches from codebase evidence alone

**If ANY condition is false → use complex path. Default to complex when uncertain.**

#### Simple path research steps (ALL mandatory):

1. **Codebase research**: Read relevant files, search for existing patterns, find reusable code. Cite file paths.
2. **Web research**: Use `WebSearch|WebFetch|context7` for implementation patterns. Cite at minimum 2 external sources.
3. **Version protocol**: Check `package.json` for library versions. Verify APIs exist in detected versions.
4. **Domain safety scan**: Run the scan table (even for "simple" tasks — a single function reading wallet balances touches money movement).
5. **RDE scan**: Check task against skill/rule/knowledge triggers. If RDE detects high-risk/security/architecture → **escalate to complex path**.
6. **Produce 3 approaches** with evidence-backed trade-offs. Each approach cites at least 1 codebase pattern + 1 external source.

**STOP — Use `AskUserQuestion` to present approaches to the user and WAIT for selection before entering Phase A.**
**Phase A is MANDATORY for simple tasks.** Minimum 3 questions: (1) confirm chosen approach, (2) confirm file paths/scope, (3) confirm test strategy.

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
- Run the domain safety scan:

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
Risk flags: [list or none]

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
- If domain safety scan in Track 1 flagged ANY risk surface → always include security-architect (regardless of domain)
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

- **system-architect**: Mission: Map technical constraints — dependency order, shared-file serialization points, migration sequencing, risk surfaces. Run domain risk checklist (money movement, auth/session, migrations, ledger writes, PII). Rules: `rules/backend.md`, `rules/security.md`, `agents/system-architect/system-architect.md`.

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

**CRITICAL**: The evaluation matrix ranks by technical excellence, NOT by ease of implementation. "Effort to implement" is INFORMATIONAL ONLY — it does NOT reduce an approach's score. The best approach wins even if it is the hardest to build.

| Criteria                                | Weight | Option A | Option B | Option C |
| --------------------------------------- | ------ | -------- | -------- | -------- |
| Correctness (solves the problem fully)  | High   |          |          |          |
| Maintainability (long-term cost)        | High   |          |          |          |
| Security (risk surface)         | High   |          |          |          |
| Pattern Alignment (fits conventions)    | High   |          |          |          |
| Architectural Purity (clean boundaries) | High   |          |          |          |
| ETH-readiness (atomic task breakdown)   | High   |          |          |          |
| Effort to implement (informational)     | Info   |          |          |          |
| Tier distribution (T1/T2/T3 task count) | Info   |          |          |          |

**Scoring rule**: Effort and tier distribution are documented for planning purposes but MUST NOT influence the recommendation. The approach with the highest combined score on correctness, maintainability, security, pattern alignment, architectural purity, and ETH-readiness wins.

**Step 4.5 — Devil's Advocate Analysis**

For the leading approach (highest score in evaluation matrix):

1. Identify the strongest argument AGAINST this approach
2. Document: "Devil's advocate concern: [specific weakness]"
3. Document: "Counter-evidence or mitigation: [response]"
4. If the concern cannot be adequately countered → flag for Phase A user decision
5. If concern reveals a fatal flaw → downgrade the approach and re-evaluate

This step prevents confirmation bias (H9) and premature convergence.
Research basis: Intelligence community structured analytical technique; reduces confirmation bias by 30-50% when followed rigorously (Heuer, CIA methodology).

**Step 5 — Synthesis validation pass**

After writing the synthesis, the lead asks: "Does this synthesis answer: which approach produces the best ETH-consumable plan with the lowest risk?" If gaps remain, return to Step 1.

**Step 5.5 — Pre-Mortem (Prospective Hindsight)**

Before presenting to the user:

1. For the recommended approach, imagine: "It is 6 months from now. This implementation FAILED. Why?"
2. Generate 3-5 failure scenarios (technical, organizational, integration, scale)
3. For each scenario, classify:
   - **MITIGATED**: Plan already addresses it (cite which task/approach element)
   - **NEEDS MITIGATION**: Add to Phase A questions
   - **ACCEPTED RISK**: Acknowledge explicitly to user
4. Include pre-mortem results in the Gate B→A presentation

Research basis: Gary Klein (HBR 2007) + Mitchell/Russo/Pennington (1989) — prospective hindsight increases failure prediction accuracy by 30%.

---

#### B.6 — TeamDelete & Present

1. Lead sends `shutdown_request` to each researcher
2. `TeamDelete` only after all confirmations received
3. **Phase A is a dialogue WITH the user** — the lead presents research-informed questions and waits for answers. No agent teams, no parallel work. Single voice, user-facing interaction. The user's domain knowledge is the input Phase A extracts. Phase P is solo by default but MAY use specialist assist for complex plans (see Phase P).
4. Present 3 approaches to user with:
   - Recommendation and rationale (evidence-based, not opinion)
   - Attribution summary (which researcher surfaced which key constraints)
   - Unresolved conflicts surfaced explicitly as user decision points
   - ETH-readiness assessment for each approach

### Gate B→A

**MANDATORY QUALITY CHECK** (lead validates before presenting to user):

- [ ] All researchers reported findings (or failures handled per B.4)
- [ ] Coverage matrix populated: no GAP cells (or gaps filled via follow-up)
- [ ] Domain safety scan completed: flags identified and documented
- [ ] Version protocol verified: no API mismatches flagged
- [ ] RDE manifest built: detected resources listed
- [ ] Minimum 3 distinct approaches documented
- [ ] Each approach cites evidence (codebase file paths + external sources)
- [ ] Each approach lists risks, trade-offs, and ETH-readiness assessment
- [ ] Unresolved conflicts surfaced explicitly as user decision points
- [ ] Devil's advocate analysis completed for recommended approach
- [ ] Pre-mortem failure scenarios documented with classifications

**If ANY checkbox fails → return to research. Do NOT present incomplete options.**

**STOP. Use `AskUserQuestion` to present the following to the user and WAIT for their response:**

1. The 3 approaches with trade-offs and evidence
2. Recommendation with rationale — **MUST be the technically superior approach regardless of effort** (evidence-based, not opinion, not convenience-driven)
3. Pre-mortem results (failure scenarios and their classifications)
4. Unresolved conflicts requiring user decision
5. Ask: "Which approach should we explore in Phase A, or do you need more research?"

**Recommendation integrity**: If the recommended approach is NOT the technically best option, the lead MUST justify why with evidence of a disqualifying flaw (not "it's harder" or "it takes longer"). Effort is never a disqualifying flaw.

| Option                 | Condition                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `[Proceed to Ask]`     | User selects approach. All quality check items pass. Selected approach can produce atomic ETH tasks.  |
| `[Targeted Follow-up]` | A domain is missing coverage or ETH-readiness is unclear. Return to B for focused research on the gap. |
| `[Re-brainstorm]`      | Fundamental assumptions invalidated by research. Restart B with revised scope.                         |

**DO NOT PROCEED TO PHASE A WITHOUT USER RESPONSE.** Do not self-select. Do not infer. Wait.

---

## Phase A: Ask

> Structured implementation questioning. All questions MUST cite Phase B findings. Product.md pre-resolved decisions are confirmed facts, not re-asked.

`[bap.md] Phase A -- Structured Questioning`

### ENFORCEMENT: Ask Phase is MANDATORY

**This phase CANNOT be skipped, shortened, or self-answered. It applies to ALL tasks regardless of complexity.**

1. You MUST use `AskUserQuestion` to present questions to the user and WAIT for responses
2. You MUST NOT self-answer questions on the user's behalf
3. You MUST NOT proceed to Phase P until the user has responded
4. You MUST ask a MINIMUM of 3 questions (simple tasks) or 5 questions (complex tasks)
5. If the user explicitly says "skip questions" or "just plan it", acknowledge the skip but WARN that plan quality may be lower

**HARD GATE**: Phase A ends ONLY when:
- User has responded to at least one round of questions, AND
- Confidence assessment is presented TO THE USER (not self-assessed silently), AND
- User explicitly confirms readiness to proceed to planning

Violating this gate is a PROTOCOL FAILURE.

**Differentiation from Product ASK:**
- Product ASK = WHAT to build (requirements, domain rules, scope, business invariants)
- BAP ASK = HOW to build it (architecture approach, task order, test strategy, risk handling)

### Question Design Protocol

Every question to the user MUST follow one of these patterns:

1. **Research-informed**: "Based on [finding from B.1 Track 2], the recommended implementation pattern is X. Should we follow this, or do you have a reason to diverge?"
2. **Evidence-citing**: "The codebase currently implements Y at [file:line]. We need Z. Should we extend Y or create a new approach?"
3. **Trade-off**: "Web research shows two valid implementation patterns: A (per [source]) and B (per [source]). Which fits our constraints?"
4. **Confirmation**: "Based on [domain safety scan], this implementation touches money movement. Confirming: we need transaction boundaries and BigInt precision in every task that modifies balances. Correct?"
5. **Resource-informed**: "RDE detected [skill/rule/knowledge]. This means [implication]. Confirming: [question about how the detected resource applies]." (e.g., "RDE detected clean-ddd-hexagonal. Should we model X as an aggregate with Y as a value object?")
6. **Socratic (assumption-surfacing)**: "You've stated X as a requirement. What happens if X is not true? What would change?" (Forces examination of hidden assumptions)

### Questioning Depth Protocol (Bloom's Taxonomy)

Every significant requirement MUST be validated across cognitive levels:

| Level | Question Pattern | Purpose |
|-------|-----------------|---------|
| Remembering | "What exactly does the system need to do?" | Explicit requirements |
| Understanding | "Why does it need to do this?" | Business context |
| Applying | "How does this interact with [constraint from Phase B]?" | Edge cases |
| Analyzing | "What assumptions underlie this requirement?" | Hidden dependencies |
| Evaluating | "Is this consistent with [other stated goal]?" | Conflict detection |
| Creating | "Is there a better formulation of this need?" | Reframing |

Not all levels needed for every question. But for architecture-level decisions, ALL 6 levels MUST be covered.

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

- How do we mitigate each risk surface identified in Phase B's domain safety scan?
- What's the rollback strategy for migrations?
- What domain safety measures apply to each task? (transaction boundaries, BigInt, fail-closed)
- What's the plan if implementation diverges from the user story's architecture decision?
- Product identified WHAT risks exist — BAP determines HOW to handle them in code.
- **Include when**: risk flags present, security risk surfaces identified, or auth changes needed

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
- If risk flags present → Risk Mitigation MUST be included
- If clean-ddd-hexagonal detected → Domain Modeling MUST be included
- The lead justifies the selection and weighting based on Phase B findings

**Minimum question counts:**
- Simple tasks: minimum 3 questions (approach confirmation, file paths, test strategy)
- Complex tasks: minimum 5 questions across selected categories (at least 1 per core category + 1 per feature-specific)
- Questions MUST be presented to the user, not self-answered

---

### Assumption Mapping (MANDATORY before Confidence Assessment)

Before scoring confidence, explicitly map assumptions:

1. **Extract**: List all implicit assumptions from Phase B findings and Phase A answers
2. **Classify**: Desirability (users want this), Viability (we can sustain this), Feasibility (we can build this)
3. **Assess**: For each assumption, rate Evidence (none → strong) and Risk (low → high)
4. **Flag**: HIGH RISK + LOW EVIDENCE assumptions become:
   - Spike tasks in Phase P (if feasibility)
   - User validation tasks (if desirability)
   - Business case questions (if viability)
5. **Document**: Include assumption map in confidence assessment output

Assumptions with no evidence MUST NOT become acceptance criteria. They become validation tasks.

Research basis: Design thinking assumption mapping (Maze, UXTweak) — systematically prevents building solutions to unvalidated assumptions.

---

### Pre-Mortem Risk Surfacing (present to user)

After covering all question categories and mapping assumptions:

1. Present to user: "Before we plan, imagine this feature fails in production. What would cause that?"
2. Collect user's failure scenarios (they know their domain better than research)
3. Cross-reference with Phase B pre-mortem results (Step 5.5)
4. For new failure modes identified by user: add to assumption map as HIGH RISK
5. For each failure mode, plan mitigation in Phase P

This step surfaces domain-specific risks that research cannot discover.

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

**MANDATORY**: Use `AskUserQuestion` to present this confidence assessment TO THE USER verbatim. Do not silently self-assess. The user must SEE the score and unresolved items. Ask: "Are you satisfied with this clarity level, or should we dig deeper into any category?"

**Epistemic Status** (present to user alongside score):

For each major decision in the plan:
- **Confidence**: HIGH | MEDIUM | LOW
- **Evidence**: What makes us confident? (cite sources)
- **Known unknowns**: What we don't know and acknowledge
- **Assumptions**: What we're assuming without proof
- **Reversibility**: HIGH (easy to change) | MEDIUM | LOW (hard to undo)

Example:
> "Architecture: Event-driven (HIGH confidence) — benchmarks show 40% throughput improvement (evidence), tested pattern in codebase at `src/events/` (evidence). Unknown: behavior under 10M+ events/day (untested). Assumption: event ordering is not critical. Reversibility: LOW (changing event model requires data migration)."

---

### Gate A→P

> Score ≥ 90/100 AND every selected category ≥ 60% of its allocated points.

**MANDATORY HALT — Use `AskUserQuestion` to present to the user:**
1. The confidence score and per-category breakdown
2. Any unresolved items
3. Explicit question: "Ready to proceed to planning, or do you want to explore any area further?"

**DO NOT PROCEED TO PHASE P WITHOUT USER RESPONSE.** This is not a self-service gate.

If score < 90/100 → ask more questions or do more web research. Present updated score after each round.

---

## Phase P: Plan

> Author the ETH-consumable plan document. Every task must be atomic, have file paths, a tier assignment, and a testable acceptance criterion.

`[bap.md] Phase P -- Plan Document`

### ENFORCEMENT: Planning Phase is MANDATORY and VALIDATED

**Plans are not "done" when written. They are "done" when validated against quality gates.**

1. Every task MUST be vertically sliced (independently deliverable, cross-layer)
2. Every task MUST have exact file paths (not "folder/" or "TBD")
3. Every task MUST have testable acceptance criteria (Given/When/Then or imperative assertion)
4. Every task MUST have a tier assignment (T1/T2/T3) with justification
5. Every task MUST list dependencies explicitly (blockedBy/blocks)
6. Risk flags MUST be copied from product spec (not inferred by BAP)
7. The plan MUST include a dependency graph showing the critical path
8. ETH Composition Data MUST be complete before user presentation

**The plan is presented to the user ONLY after passing the Plan Quality Checklist below.**

**Output:** Plan documents at `docs/plans/active/<YYYY.MM.DD>-<ticket-number>-<feature-name>/`

### Optional Specialist Assist

For complex plans (15+ tasks or high risk flag density), the lead MAY spawn a single specialist Explore agent to assist with plan verification:

- **data-architect**: Verify migration ordering, schema change safety, index strategy
- **security-architect**: Verify risk flag assignment accuracy, auth flow correctness
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
- **Risk flags**: [money | auth | PII | migration | ledger | none]

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
**Risk flag density**: [N of M tasks flagged — list flags per task]
**Layers touched**: [domain | application | infrastructure | presentation]
**BAP suggestion**: [free-form text — what BAP thinks the optimal ETH team looks like, NOT a mode letter. e.g., "3 builders (1 specialist data-architect for migration tasks, 2 general), security-focused review sub-team due to 4/7 tasks having risk flags"]

## Resource Manifest

> Auto-generated by RDE (Resource Detection & Enforcement) in BAP Phase B.1 Track 4.
> ETH Phase E.0 re-verifies and may extend.

**detected-skills**: [list or none]
**detected-rules**: [list beyond always-active]
**detected-knowledge**: [TKB category/entries or none]
**detected-agents**: [list]
**detected-workflows**: [list or none]
**detected-risks**: [list or none]
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

### Plan Quality Checklist (MANDATORY before user presentation)

**Per-task validation:**
- [ ] Task name is imperative and specific (e.g., "Create UserAggregate entity" not "Do the thing")
- [ ] Files field lists exact paths: `src/path/to/file.ts` (not "folder/" or "TBD")
- [ ] Layer is one of: Domain, Application, Infrastructure, Presentation
- [ ] Tier is T1, T2, or T3 with 1-sentence justification
- [ ] Depends On field lists task IDs or "none"
- [ ] Acceptance criterion is testable (pass/fail in 2-5 minutes)
- [ ] Acceptance criterion includes at minimum: happy path + 1 failure case
- [ ] Risk flags are copied from product spec / Phase B safety scan (not guessed)
- [ ] Estimated effort: ≤ 3 days per task (decompose further if exceeded)

**Plan-level validation:**
- [ ] Minimum 3 tasks (plans < 3 suggest trivial work — confirm with user)
- [ ] Maximum 20 tasks (split into phases if exceeded)
- [ ] Dependencies form a valid DAG (no circular dependencies)
- [ ] Critical path identified (longest sequential chain documented)
- [ ] Tier distribution is reasonable (not all T1, not all T3)
- [ ] Every risk-flagged surface has mitigations in at least one task
- [ ] ETH Composition Data is complete (task count, tier dist, risk flags, team suggestion)
- [ ] ADR produced (if feature has architecture decisions)
- [ ] Architecture diagram produced (if feature changes system structure)
- [ ] Traceability: every acceptance criterion maps to a verifiable test or assertion
- [ ] Pre-mortem risks from Phase B and Phase A have corresponding mitigations in tasks
- [ ] Assumption map: high-risk/low-evidence assumptions have spike/validation tasks

**If ANY per-task checkbox fails → fix the task. If ANY plan-level checkbox fails → fix the plan.**
**Do NOT present to user until all checkboxes pass.**

---

### Gate P→Execute

**MANDATORY HALT.** Use `AskUserQuestion` to present to the user:

1. The complete plan with all tasks, tiers, dependencies, and file manifest
2. The dependency graph showing critical path
3. ETH Composition Data (team recommendation)
4. Pre-mortem risks and their mitigations
5. Assumption map (any remaining high-risk/low-evidence items)
6. ADR and diagram (if applicable)

Ask: "Does this plan accurately capture what we discussed? Ready for execution, or do you want to revise?"

| Option | Condition |
|--------|-----------|
| `[Approve → ETH]` | User confirms plan is accurate and complete. All quality checklist items pass. |
| `[Revise]` | User wants changes. Apply changes, re-validate checklist, re-present. |
| `[Return to Ask]` | Unresolved questions discovered during plan review. Return to Phase A. |
| `[Reject → Re-brainstorm]` | Plan reveals fundamental approach is wrong. Return to Phase B. |

**DO NOT PROCEED TO ETH WITHOUT USER APPROVAL.** Plan approval is the final human gate before code is written.

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
- [ ] Domain safety scan completed and flags propagated to tasks
- [ ] ADR and diagram deliverables produced (not skipped)
- [ ] TodoWrite items created for all tasks
- [ ] User approved the plan
- [ ] Plan committed to version control before implementation
- [ ] Phase B research cited minimum 2 external sources per approach
- [ ] Devil's advocate analysis completed for recommended approach
- [ ] Pre-mortem identified 3+ failure scenarios with mitigations
- [ ] Assumption map produced with risk/evidence classification
- [ ] Plan Quality Checklist passed (all per-task and plan-level items)
- [ ] Critical path identified and documented
- [ ] Dependency graph validated as acyclic DAG
- [ ] Traceability: every acceptance criterion has corresponding test/assertion
- [ ] Epistemic status documented for major decisions (confidence + unknowns)

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
| Technology selection needed (new library/tool)           | Invoke [/tech-select](../tech-select/SKILL.md). Cannot proceed with unvalidated tech choice.                                                                                                                                                                                                                                               |
| All researchers report zero findings                     | Lead spawns follow-up with different search terms and broader scope. If still zero after follow-up: STOP. Present to user: "Research found no relevant patterns or prior art. Options: (1) proceed with first-principles design, (2) provide additional context, (3) abort." Cannot proceed without evidence or explicit user acknowledgment. |
| Web research returns no current documentation            | Flag version/library as potentially unsupported. Verify library is still maintained. If abandoned: escalate to user as blocker.                                                                                                                                                                                                              |

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
| **Skipping Phase A**                | Jumping from brainstorm directly to planning                           | Phase A is MANDATORY. No exceptions. Even simple tasks need 3 questions.  |
| **Self-answering questions**        | AI answers its own Phase A questions without user input                 | Questions MUST be presented to user. Wait for response.                   |
| **Silent confidence assessment**    | AI self-scores 90+ without showing user                                | Assessment MUST be presented to user with explicit confirmation request.   |
| **Shallow research**                | Lead claims "articulated" without citing sources                       | Every claim must have evidence chain: claim → source → verification.      |
| **Simple path escape hatch**        | Classifying high-risk task as "simple" to skip research                  | Classification gate: ANY risk flag → complex path. No exceptions.      |
| **Skipping domain safety scan**           | Simple path omits domain safety check                                 | Domain safety scan is mandatory for ALL paths. Even single-file balance reads.  |
| **Skipping version protocol**       | Planning against wrong library version                                 | Version protocol runs for ALL paths. BLOCKER if mismatch found.           |
| **Skipping RDE**                    | Resource detection omitted for simple tasks                            | RDE runs for ALL paths. Detection → mandatory loading.                    |
| **Single-pass synthesis**           | Writing synthesis without coverage validation                          | Coverage matrix MUST be validated. No GAP cells without follow-up.        |
| **No devil's advocate**             | Leading approach accepted without adversarial challenge                 | Devil's advocate step mandatory in B.5. Document concern + response.      |
| **Assumptions as acceptance criteria** | Unvalidated assumptions become task acceptance criteria              | Assumption map: high-risk/low-evidence → spike task, not acceptance.      |
| **Shallow plan tasks**              | Tasks missing file paths, tiers, or testable acceptance                | Plan Quality Checklist: all per-task checkboxes must pass.                |
| **Circular dependencies**           | Task dependency graph has cycles                                       | DAG validation mandatory. Cycles are blockers.                            |
| **Missing critical path**           | No identification of longest sequential chain                          | Critical path documented in every plan.                                   |
| **Plan without pre-mortem**         | No failure scenario analysis before execution                          | Pre-mortem mandatory in B.5 and Phase A. Risks → mitigation tasks.        |
| **Effort-downgraded recommendation** | Recommending an inferior approach because the best one is harder      | CARDINAL RULE: always recommend the best approach. Effort is informational, never a scoring criterion. Technical excellence is the only criterion. |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Methodology Evidence Base

BAP's methodology is grounded in proven frameworks:

| Method | Source | Phase | Evidence Quality |
|--------|--------|-------|-----------------|
| Double Diamond | British Design Council | B (diverge→converge) | Industry standard |
| ACH (Competing Hypotheses) | CIA/Richard Heuer | B.5 (synthesis) | 50yr intelligence community use |
| Devil's Advocacy | Intelligence community | B.5 (step 4.5) | Proven bias reduction |
| Pre-Mortem | Gary Klein (HBR 2007) | B.5 + A | 30% accuracy improvement (Mitchell 1989) |
| Socratic Method | Philosophical tradition | A (questioning) | Academic + practitioner |
| Bloom's Taxonomy | Anderson/Krathwohl 2001 | A (depth validation) | Academic standard |
| Assumption Mapping | Design thinking | A (risk identification) | Industry adoption |
| Definition of Ready | Scrum.org/Atlassian | A→P gate | Enterprise standard |
| Vertical Slicing | Agile Alliance | P (task design) | Practitioner consensus |
| Critical Path Method | DuPont/Remington Rand | P (dependency analysis) | Industry standard (60yr) |
| Bayesian Confidence | Google/DeepMind research | All (epistemic status) | Emerging academic (2024) |

---

## Cross-References

- **Input workflow (Product)**: [/product](../product/SKILL.md) (produces user story BAP consumes)
- **Next phase (Execute)**: [/eth](../eth/SKILL.md) (implements the plan BAP produces)
- **Architecture patterns**: [/architecture-audit](../architecture-audit/SKILL.md) (domain purity, port/adapter checks)
- **Technology selection**: [/tech-select](../tech-select/SKILL.md) (evidence-based tech choices)
- **Version protocol**: `rules/version-protocol.md` (4-step library version verification)
- **Backend rules**: `rules/backend.md` (hexagonal architecture, database patterns)
- **Security rules**: `rules/security.md` (OWASP, secrets, domain safety)
- **Testing rules**: `rules/testing.md` (coverage targets, AAA pattern)
- **Deliverables rule**: `rules/deliverables.md` (required outputs per feature)
- **Agent teams docs**: https://code.claude.com/docs/en/agent-teams
