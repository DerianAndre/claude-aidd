---
name: product
description: >-
  User story generation with Gherkin scenarios, Definition of Ready,
  and fintech safety gates. Run before BAP for best results.
triggers:
  - user story
  - requirements
  - BDD
  - Gherkin
  - definition of ready
  - acceptance criteria
argument-hint: "[feature name or user story]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, WebFetch, WebSearch
---

# Workflow: Product (User Story & Definition of Ready)

> Deep research (code + web) into unambiguous acceptance criteria. Ensures every story is ready to build before development begins.

**Use when:**

- Writing acceptance criteria for a new feature or story
- Refining vague requirements into testable conditions
- Verifying a story meets Definition of Ready before pulling into a sprint
- A ticket, issue, or feature request needs translation into a buildable specification

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] User story, ticket, or requirements are provided (clear or vague)
- [ ] Codebase context is accessible
- [ ] MCP tools available for web research (`context7`, `WebFetch`, `WebSearch`)

---

## Workflow Phases

```
Phase E: EXPLORE  →  Gate  →  Phase A: ASK  →  Gate  →  Phase S: SPECIFY  →  Gate  →  Phase V: VERIFY
```

- **EXPLORE**: Deep research — codebase + web/documentation
- **ASK**: Research-informed questioning with scoring
- **SPECIFY**: Author the user story document (10 sections, 3 conditional)
- **VERIFY**: Self-review with fintech safety checks

---

## Phase E: EXPLORE (Deep Research — Code + Web)

> Discover what exists before writing requirements. Two-track research: codebase exploration AND web/documentation research. Both inform the user story quality.

`[product.md] Phase E -- Deep Research (Code + Web)`

REMEMBER: You are the guardian of a high-stakes Fintech/Crypto Enterprise System. Your code controls real assets. Errors result in financial loss. Security is PRIORITY.

NEVER sacrifice accuracy, clarity, or completeness for brevity. Quality is the only constraint — effort and time are not concerns.

### Complexity Assessment (BEFORE exploration begins)

The lead reads the user's requirements and classifies the feature to determine the optimal research approach:

```
Complexity Assessment:
- Feature domain(s): [backend | frontend | full-stack | infrastructure | data]
- Risk surfaces: [count from initial read of requirements]
- Estimated scope: [single-module | cross-module | cross-package]
- Research approach: [solo | team]
```

**Solo exploration** (default for focused features):
- Single module, ≤2 risk surfaces, clear scope → lead explores inline (Tracks 1 + 2 below)

**Team exploration** (for complex or multi-domain features):
- Cross-module, 3+ risk surfaces, or vague scope → lead spawns 1-3 specialist Explore agents IN PARALLEL with its own research
- Agent selection is DYNAMIC based on feature domain:
  - Backend/API feature → `system-architect` (architecture mapping) + `security-architect` (fintech safety)
  - Frontend feature → `experience-engineer` (architecture) + `design-architect` (accessibility/UX)
  - Database/migration feature → `data-architect` (schema analysis) + `system-architect` (integration)
  - Full-stack → up to 3 agents from different domains
- Each agent gets a focused research scope (subsets of E.1-E.3, split by domain — no duplication)
- Agents report findings using: `Finding: [what] / Evidence: [file:line] / Risk: [Critical|High|Medium|Low]`
- Lead synthesizes agent findings alongside its own Track 1 results before proceeding to E.4+

**The lead is NOT constrained to the domain table above.** If the feature requires a novel combination (e.g., `contract-architect` for a new API surface + `data-architect` for the backing schema), the lead adapts.

---

### Track 1: Codebase Research

Inline exploration by the lead (solo mode) or lead + specialist agents (team mode). Read files, trace code paths, find existing patterns.

#### E.1 — Domain Scan

- Identify entities, value objects, enums, events, and exceptions in the feature area
- Record file paths and line numbers for each finding
- Note which domain primitives exist and which are missing

#### E.2 — Port & Adapter Scan

- Identify repository ports (`I*Repository` interfaces) and service ports in the feature area
- Check all ORM adapter implementations (see STACK.md for ORM list)
- Record which are complete, which are stubs, which are missing

#### E.3 — API Surface Scan

- Identify existing controllers, modules, DTOs, and guards
- Record endpoints, HTTP methods, auth guards, and rate limits
- Note which framework modules exist and which must be created (see STACK.md for framework)

#### E.4 — Fintech Safety Scan

For every feature, answer YES/NO with file path evidence:

| Surface        | Check                                                                                                 | If YES                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Money Movement | Creates, modifies, or reads ledger entries or wallet balances?                                        | Require atomicity pattern in Technical Design. Require float-rounding risk in Risk Surfaces.                  |
| Auth/Session   | Creates, modifies, or checks JWT tokens, roles, or permissions?                                       | Require guard specification in API Contract. Require 401/403 scenarios in Gherkin.                            |
| PII            | Reads, writes, or transmits personal data (names, emails, CLABEs, tax IDs, phone numbers, documents)? | Require encryption/masking note. Require data-at-rest protection reference.                                   |
| Migrations     | Adds or modifies database tables, columns, indexes, or enums?                                         | List all schema changes in Technical Design delta. List migration dependency in Dependencies.                 |
| Ledger Writes  | Creates ledger transactions or entries?                                                               | Require debit/credit account identification. Require reconciliation reference. Require BigInt precision note. |

#### E.5 — Issue/Spec Reconciliation

- Compare the requirements (issue, ticket, user description) against the codebase
- Every entity, event, endpoint, or enum value referenced in requirements MUST be found in the codebase or flagged
- Identify: naming conflicts, wrong assumptions, outdated references, non-existent components
- Each discrepancy becomes a **Critical Finding**

---

### Track 2: Web/Documentation Research

Use `context7` (resolve-library-id → query-docs), `WebFetch`, and `WebSearch` tools.

#### E.6 — Library/Framework Docs

- Look up current API patterns for libraries in the project stack (consult STACK.md for technologies)
- Verify the planned approach matches the library's recommended usage
- Catch deprecated patterns or breaking changes between versions
- Use `context7` to get up-to-date documentation — do NOT rely on training data alone

#### E.7 — Domain/Protocol Standards

- **Fintech**: Token precision standards (USDC = 6 decimals per ERC-20), protocol specs (SPEI, ISO 20022), regulatory requirements (CNBV, Banxico)
- **Auth**: JWT best practices (RFC 7519), OWASP session management cheat sheet
- **Crypto**: ERC-20 token standards, stablecoin specifications
- **Payments**: CLABE validation (Banxico standard), wire transfer protocols
- Cite sources for every domain-specific claim

#### E.8 — Prior Art & Patterns

- Search for established patterns for the problem being solved
- Examples: double-entry ledger patterns, BigInt-to-decimal formatting, webhook idempotency, HMAC signature verification
- Reference authoritative sources (RFCs, official docs, trusted engineering blogs), not opinions

---

### Research Synthesis

After both tracks, produce an internal findings summary:

1. **What the codebase has** (Track 1 findings with file paths)
2. **What authoritative sources recommend** (Track 2 findings with citations)
3. **Where they diverge** → these become Critical Findings or Architecture Decision inputs
4. **What is missing** → these become Technical Design delta items

---

### Gate E→A

> "Can I list Critical Findings with file:line evidence? Do I have authoritative web sources for domain-specific decisions? Do I know the domain entities, ports, and adapters involved?"

If any of these are NO → continue exploring. Do not proceed to ASK with insufficient evidence.

---

## Phase A: ASK (Requirements Clarity)

> Structured questioning informed by EXPLORE findings. Questions MUST cite codebase evidence or web research. Never ask blind questions.

`[product.md] Phase A -- Requirements Clarity`

### Question Design Protocol

Every question to the user MUST follow one of these patterns:

1. **Research-informed**: "Based on [finding from E.6/E.7/E.8], the standard approach is X. Should we follow this, or do you have a reason to diverge?"
2. **Evidence-citing**: "The codebase currently does Y at [file:line]. The new feature needs Z. Should we extend Y or create a new approach?"
3. **Trade-off**: "Web research shows two valid patterns: A (per [source]) and B (per [source]). Which fits our constraints?"
4. **Confirmation**: "Based on [E.4 finding], this feature touches money movement. Confirming: we need atomicity guarantees and BigInt precision. Correct?"

**Rule**: If you have no findings to reference for a question, you haven't explored enough — return to Phase E.

- If codebase evidence answers a question conclusively → present as confirmed fact, don't ask the user
- If web research provides a clear standard → present as recommended default, user can override

---

### Dynamic Category Selection

The lead selects ASK categories based on Phase E findings. Categories are NOT fixed — they adapt to the feature's actual characteristics.

**Core categories** (ALWAYS included — every feature needs these):

#### Business Rules (core)

- What are the invariants? What must always/never be true?
- What does the domain authority mandate? (Banxico, ERC-20 spec, CNBV, ISO standard)
- What business logic already exists in the codebase that constrains this feature?

#### Scope Boundaries (core)

- What is explicitly IN scope for this story?
- What is explicitly OUT of scope? (deferred to future stories)
- Is this MVP or full implementation?
- Can this story be delivered independently?

**Feature-specific categories** (lead selects 2-4 based on Phase E findings):

#### Edge Cases

- What happens at boundaries? Zero state? Max values? Missing data?
- What do authoritative sources say about edge handling for this domain?
- What happens when the user has no data yet? (new user, empty wallet, no transactions)
- **Include when**: feature has complex state transitions, boundary conditions, or multiple input paths

#### Data Integrity

- What precision is required? (decimals, BigInt, string formatting)
- What atomicity guarantees are needed? (single transaction, saga, eventual consistency)
- What consistency rules apply? (unique constraints, foreign keys, enum validation)
- What do the library docs recommend for this pattern?
- **Include when**: feature touches database, monetary values, precision-sensitive data, or multi-table writes

#### Security & Auth

- What authentication/authorization changes are needed?
- What PII is being handled? How is it masked/encrypted?
- What OWASP risks apply to this feature?
- What audit trail is required?
- **Include when**: Phase E flagged auth changes, PII handling, or security risk surfaces

#### Performance & Scale

- What throughput is expected? (requests/sec, concurrent users)
- What latency targets apply? (p50, p95, p99)
- What caching strategy is needed?
- What are the data volume projections?
- **Include when**: feature handles high-throughput operations, large datasets, or real-time requirements

#### Integration Boundaries

- What external systems/APIs does this feature interact with?
- What are the contract specifications? (OpenAPI, event schemas)
- What failure modes exist at integration points?
- What retry/fallback strategies are needed?
- **Include when**: feature crosses package/service boundaries or integrates with external providers

#### Migration Safety

- What schema changes are required? Are they reversible?
- What data migration is needed for existing records?
- What is the rollback strategy?
- What is the deployment sequence? (migration before code, or code before migration?)
- **Include when**: feature requires database schema changes or data transformations

**Category selection rules:**
- Minimum: 2 core + 2 feature-specific = 4 categories
- Maximum: 2 core + 4 feature-specific = 6 categories
- Lead distributes 100 points across selected categories, weighted by importance to THIS feature
- A fintech feature touching money movement might weight: Business Rules (30) + Scope (15) + Data Integrity (30) + Security (25)
- A frontend-only feature might weight: Business Rules (20) + Scope (20) + Edge Cases (30) + Performance (30)
- The lead justifies the selection and weighting based on Phase E findings

---

### Confidence Assessment

After covering all selected categories, produce:

```
Requirements Clarity: [score]/100

Categories selected: [list selected categories with point allocation]
Justification: [why these categories, based on Phase E findings]

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

### Gate A→S

> Score ≥ 80/100 AND every selected category ≥ 60% of its allocated points AND user confirms readiness.

If not met → ask more questions or do more web research. Do not proceed with unresolved ambiguity.

**Difference from BAP Phase A:** Product ASK = requirements clarity (WHAT to build, informed by domain research). BAP ASK = implementation clarity (HOW to build it, informed by codebase architecture). No overlap.

---

## Phase S: SPECIFY (Author Document)

> Author the user story document with the canonical section structure. 7 mandatory + 3 conditional sections.

`[product.md] Phase S -- Author Document`

ALWAYS do the BEST approach, not the fastest, not the cheapest, not the easiest, but the BEST.
ALWAYS use the best and most secure practices and patterns.
DO NOT write code — only write the specification.

### Output Document Structure

#### Mandatory Sections (all stories)

**Section 1 — User Story**

```
**As a/an:** [specific role — not "user"]
**I want to:** [goal]
**So that:** [measurable or observable benefit]
```

- Role MUST be specific: "registered user with personal account", "ADMINISTRATOR", "System (automated)"
- Benefit MUST be measurable: "accurate and legally valid information" — not "a better experience"

---

**Section 2 — Gherkin Scenarios**

Scenario minimum scales with risk surface count from Phase E:

```
scenario_minimum = max(8, risk_surfaces × 3 + 2)
```

- 0-2 risk surfaces → 8 scenarios (baseline)
- 3 risk surfaces → 11 scenarios
- 5 risk surfaces → 17 scenarios

Distribute across 6 mandatory categories (additional scenarios go where risk surfaces demand):

| Category                  | Min | Description                                         |
| ------------------------- | --- | --------------------------------------------------- |
| Happy Path                | 2   | Core success paths for the feature                  |
| Zero/Empty State          | 1   | What happens when data doesn't exist yet            |
| Auth Failure              | 1   | Unauthenticated or unauthorized request             |
| Validation/Edge Case      | 2   | Boundary conditions, format requirements, precision |
| Business Rule Enforcement | 1   | System enforces a domain invariant                  |
| Performance/Integrity     | 1   | Query efficiency or data correctness under load     |

**Conditional categories** (add when applicable):

| Category          | When Required                        | Min                      |
| ----------------- | ------------------------------------ | ------------------------ |
| Role-based access | Feature has role restrictions        | 1 per restricted role    |
| Idempotency       | Webhooks or retry-able operations    | 1                        |
| Concurrent access | Multiple actors modify same resource | 1                        |
| State machine     | Resource has status lifecycle        | 1 per invalid transition |

Format:

```gherkin
Feature: [Feature Name]
  [One-line description of the feature's value]

  Background:
    Given [shared setup for all scenarios]

  Scenario: 1 — [Happy path description]
    Given [initial context]
    And [additional context]
    When [action taken]
    Then [expected outcome]
    And [additional expected outcome]

  Scenario: 2 — [Failure case description]
    Given [context]
    When [action that should fail]
    Then [error outcome]
    And [system state is unchanged]
```

Each scenario MUST test a **distinct behavioral path** — not just different input values with the same logic.

---

**Section 3 — API Contract** (or Component Contract for frontend)

For each endpoint:

- Method, path, auth requirements (guard + role), rate limit if applicable
- Request body with full example JSON (if applicable)
- Response body for every relevant status code (200, 201, 400, 401, 403, 404, 409, 500)
- **Invariants**: explicit list of guarantees (field ordering, type constraints, precision, presence rules)

For fintech: balance values MUST be strings (not JSON numbers), with decimal precision specified.

---

**Section 4 — Risk Surfaces**

| ID  | Surface         | Severity                 | Mitigation                       |
| --- | --------------- | ------------------------ | -------------------------------- |
| R1  | [specific risk] | CRITICAL/HIGH/MEDIUM/LOW | [concrete mitigation, not "TBD"] |

- Every risk MUST have a concrete mitigation
- Risks must be feature-specific — no generic OWASP items without feature context
- Fintech mandatory checks: float rounding, race conditions, PII exposure, missing indexes

---

**Section 5 — Dependencies**

| ID  | Dependency   | Status                                                 | Blocking |
| --- | ------------ | ------------------------------------------------------ | -------- |
| D1  | [dependency] | Defined in this story's delta / COMPLETE / Not started | YES/NO   |

MUST end with: `**Independently Deliverable**: [Yes/No] — [reason]`

---

**Section 6 — Acceptance Criteria**

Two sub-sections required:

**6a — Declarative list** (the "what" — MUST/MUST NOT statements):

- `GET /wallet/balance` MUST require a valid JWT — return 401 if absent or invalid.
- The response MUST NOT include any fiat currency in the assets array.
- Balance precision MUST use pure BigInt arithmetic — no `Number(bigint)`.

**6b — Step-by-step numbered procedure** (the "how"):

1. User sends `GET /wallet/balance` with valid JWT
2. System extracts `userId` from JWT payload
3. System calls `IWalletRepository.findByUserId(userId)`
4. ...

The step-by-step procedure is the highest-value section for BAP implementation planning.

---

**Section 7 — Definition of Ready Checklist**

All items must be `[ ]` with reference to the section that satisfies them:

- [ ] User story written (Section 1)
- [ ] Acceptance criteria with Given/When/Then scenarios (Section 2)
- [ ] Acceptance criteria written as step-by-step list (Section 6b)
- [ ] Happy path scenario exists (Section 2: Scenarios N, M)
- [ ] At least 2 failure/edge case scenarios exist (Section 2: Scenarios X, Y, Z)
- [ ] Success metrics defined (Section 6a)
- [ ] API contracts identified (Section 3)
- [ ] Risk surfaces identified (Section 4)
- [ ] Dependencies resolved (Section 5)
- [ ] Story is independently deliverable (Section 5)

---

#### Conditional Sections

**Section 8 — Critical Findings** (include unless EXPLORE found zero codebase contradictions)

Each finding gets an ID and MUST reference specific file paths:

```markdown
### CF-1: [Title]
[Description of what the issue IS, what exists NOW, what MUST change]
File: `<domain-layer>/value-objects/<relevant-vo>.ts:<line>`
```

Categories:

- Naming conflicts between issue/spec and actual codebase
- Missing domain primitives (entities, VOs, enums, events not yet created)
- Missing infrastructure (no module, no controller, no adapter)
- Wrong assumptions in requirements (event names, fields, enum values that don't exist)
- Design implications (precision handling, atomicity, idempotency)

Skip with: "No critical findings — codebase aligns with requirements as stated."

---

**Section 9 — Architecture Decision** (include when multiple viable approaches exist)

| Option       | Approach    | Verdict                    |
| ------------ | ----------- | -------------------------- |
| A (chosen)   | Description | Rationale                  |
| B (rejected) | Description | Why rejected with evidence |
| C (rejected) | Description | Why rejected with evidence |

MUST include:

- The chosen option's **architectural contract** (invariants that must hold)
- Why rejected options were rejected with evidence, not opinion
- Web research citations if the decision involves domain-specific standards

Skip with: "No architecture decision — single viable approach: [name]."

---

**Section 10 — Technical Design** (include for backend stories; delta table always required)

**10a — Delta Table** (always required for backend):

| Change | File                       | Description                 |
| ------ | -------------------------- | --------------------------- |
| Add X  | `<domain-layer>/...`       | Extend Y to include Z       |
| Create | `<presentation-layer>/...` | New controller for endpoint |

Must include: "No DB schema changes." or list exact schema changes.

**10b — Key File References**:

- Bullet list of existing files relevant to implementation, with what to reference in each

**10c — Algorithm/Pseudocode** (conditional — include for non-trivial logic):

- TypeScript pseudocode with verified examples
- For monetary calculations: show pure BigInt arithmetic, no floats

**10d — Use Case Logic** (conditional — include for primary use case):

- Show the `execute()` method structure

---

### Gate S→V

> "Does every DoR checkbox have supporting evidence in the document? Does the Technical Design reference real file paths from EXPLORE?"

---

## Phase V: VERIFY (Self-Review)

> Final pass before handoff. Catches gaps, ambiguities, and safety concerns.

`[product.md] Phase V -- Self-Review`

### V.1 — Completeness Verification

- Every mandatory section is present and non-empty
- Every conditional section is either present or has a documented skip reason
- No "TBD", "TODO", or placeholder content

### V.2 — Cross-Reference Verification

- Every file path in Technical Design was found during EXPLORE
- Every entity/event referenced in Gherkin scenarios exists in the codebase or is in the delta table
- Every API endpoint in the contract has at least one happy path and one error Gherkin scenario

### V.3 — Scenario Coverage Verification

- Calculate the adaptive minimum: `max(8, risk_surfaces × 3 + 2)` using the count from Phase E
- Count scenarios against this adaptive minimum
- Verify each mandatory category has at least the minimum count
- Verify conditional categories are covered when applicable

### V.4 — Fintech Safety Verification

**Dynamic verification dispatch:**
- If Phase E used **team exploration** AND security-architect was spawned → spawn a security-architect Explore agent to perform V.4 verification. The specialist verifies the user story's safety claims against the security findings from Phase E.
- If Phase E was **solo** → lead performs V.4 verification inline (current behavior).

If any fintech risk surface was identified in E.4:

| Check                            | Verification                                                          |
| -------------------------------- | --------------------------------------------------------------------- |
| No `Number()` on monetary values | Technical Design pseudocode uses only BigInt arithmetic               |
| Atomicity specified              | Multi-table writes specify `ITransactionManager.run()`                |
| Guard requirements explicit      | Every endpoint specifies auth guard and role                          |
| Error responses safe             | API Contract error responses use domain error codes, not stack traces |
| Idempotency addressed            | Webhook/callback endpoints document idempotency strategy              |
| PII protected                    | Encrypted fields noted, no PII in example responses without masking   |

### V.5 — Ambiguity Scan

- Re-read every Gherkin scenario
- Replace "should", "might", "could" with "MUST" or "MUST NOT"
- Undefined terms trigger `AskUserQuestion` — do not proceed with ambiguity
- "TBD" is not an acceptance criterion

### V.6 — DoR Final Check

- All 10 checkboxes MUST be `[x]`
- Each checkbox references the section that satisfies it
- If Phase E used **team exploration** → cross-reference specialist findings against DoR checkboxes. Any specialist finding that contradicts a DoR claim is a **BLOCKER**.
- If any cannot be checked → document as `**BLOCKER**: [checkbox] cannot be satisfied because [reason]`
- Do NOT check a box falsely to pass the gate

---

### Gate V→Handoff

> All DoR checkboxes are `[x]`. Document is saved. Ready for BAP.

---

## Output

Product creates the plan folder and the user story document:

```
docs/plans/active/<YYYY.MM.DD>-<ticket>-<feature>/
  └── <YYYY.MM.DD>-<ticket>-<feature>-user-story.md
```

If no ticket number is provided, use the feature name only:

```
docs/plans/active/<YYYY.MM.DD>-<feature>/
  └── <YYYY.MM.DD>-<feature>-user-story.md
```

BAP later adds plan, ADR, and diagram files to the SAME folder.

Commit: `docs(scope): add user story for <feature>`

---

## Handoff Protocol to BAP

### What Product Delivers

1. The user story document at `docs/plans/active/<slug>/<slug>-user-story.md`
2. A committed spec: `docs(scope): add user story for <feature>`

### What BAP Receives

BAP Phase B uses the product output as input context:

- **User Story** (Section 1) defines the goal
- **Critical Findings** (Section 8) prevents BAP from repeating codebase exploration — these are pre-resolved
- **Architecture Decision** (Section 9) is a pre-resolved design choice — BAP does NOT re-debate it
- **Technical Design** (Section 10) provides the delta table — BAP converts these into atomic implementation tasks
- **API Contract** (Section 3) provides exact shapes BAP's plan must implement
- **Acceptance Criteria** (Section 6b) provides the step-by-step procedure BAP converts into test cases

### What Product Does NOT Do

- Product does NOT produce implementation tasks (that is BAP Phase P)
- Product does NOT produce ADRs as separate files (BAP creates `*-adr.md`)
- Product does NOT produce diagrams (BAP creates `*-diagram.md`)
- Product does NOT produce TodoWrite items (that is BAP/ETH)
- Product does NOT write code or pseudocode meant to be copy-pasted — only illustrative algorithms

---

## Failure Handling

| Scenario                                          | Action                                                                                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements too vague for domain identification  | `AskUserQuestion`. Cannot proceed past EXPLORE without identifying primary entity and port.                                                    |
| Web research returns no authoritative source      | Document gap explicitly. Use codebase patterns as fallback. Flag in Risk Surfaces: "no authoritative standard — based on internal convention". |
| Web research contradicts codebase pattern         | Mandatory Critical Finding. State what the source recommends vs what the codebase does. Surface to user as decision point in ASK phase.        |
| Library docs show deprecated pattern in codebase  | Mandatory Critical Finding. Cite deprecation notice. Recommend migration in Technical Design delta.                                            |
| Codebase has zero relevant code (greenfield)      | Critical Findings documents "no existing infrastructure". Delta table lists every new file.                                                    |
| Issue references entities/events that don't exist | Mandatory Critical Finding. State what issue says vs codebase reality.                                                                         |
| Architecture Decision has no clear winner         | Present options to user via `AskUserQuestion`. No defaulting for fintech features.                                                             |
| Cannot determine if feature touches money         | Assume YES. Apply fintech safety checks. False positive is safer than false negative.                                                          |
| Gherkin can't reach adaptive minimum              | Feature may be trivially small. Document why. User confirms exemption.                                                                         |
| DoR checkbox cannot be checked                    | BLOCKER flag. Do not check falsely. Document the reason.                                                                                       |
| Multiple stories needed (scope too large)         | Each story gets its own document. No combining stories into a single file.                                                                     |

---

## Anti-Patterns

| Anti-Pattern               | Description                                                      | Mitigation                                                                      |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Phantom References**     | Issue says "TransactionCommitted event" but it doesn't exist     | E.5 reconciliation catches these. Every reference verified against codebase.    |
| **Vague Role**             | "As a user..." when the feature is admin-only                    | Section 1 requires specific role. No generic "user" without qualification.      |
| **Scenario Poverty**       | Only 3 scenarios for a fintech feature                           | Mandatory minimums: 8 scenarios across 6 categories.                            |
| **Phantom Acceptance**     | DoR says `[x]` but supporting section is empty                   | V.1 cross-references every checkbox to its supporting section.                  |
| **Float Contamination**    | Technical Design uses `Number()` or `parseFloat()` on money      | V.4 explicitly bans float operations on monetary values.                        |
| **Copy-Paste Gherkin**     | Scenarios use identical structure with only values changed       | Each scenario must test a distinct behavioral path, not just a different input. |
| **Missing Delta**          | Technical Design says "modify X" without specifics               | Delta table requires `Change / File / Description` with actionable detail.      |
| **Orphaned API Contract**  | Endpoint defined but no Gherkin scenario exercises it            | V.2 verifies every endpoint has at least one happy + one error scenario.        |
| **Unbounded Dependencies** | "Depends on future story" with no mitigation                     | Every blocker must have a workaround (stub, fallback) or explicit gate.         |
| **Security Theater**       | Risk list includes "SQL injection" when ORM parameterizes        | Risks must be feature-specific. Generic OWASP without feature context rejected. |
| **Blind Questions**        | ASK phase questions with no research backing                     | Every question must cite a codebase finding or web research finding.            |
| **Skipping Web Research**  | Domain decisions without checking authoritative sources          | E.6/E.7/E.8 are mandatory. Use `context7` for library docs.                     |
| **Stale Library Patterns** | Using patterns from training data without verifying current docs | Always verify against current documentation via `context7` or `WebFetch`.       |

---

## Fintech Scenario Template

For money-movement features, always include these three scenario types as a baseline:

```gherkin
  Scenario: Successful transfer
    Given the sender has a balance of $1,000 MXN
    And the recipient CLABE is valid
    When the sender initiates a transfer of $500 MXN
    Then the transfer status is "completed"
    And the sender balance is $500 MXN
    And the recipient balance increased by $500 MXN
    And a ledger entry is created for both accounts

  Scenario: Insufficient funds
    Given the sender has a balance of $100 MXN
    When the sender initiates a transfer of $500 MXN
    Then the transfer is rejected with "INSUFFICIENT_FUNDS"
    And the sender balance remains $100 MXN
    And no ledger entry is created

  Scenario: Invalid CLABE
    Given the sender has a balance of $1,000 MXN
    And the CLABE "000000000000000000" is invalid
    When the sender initiates a transfer
    Then the transfer is rejected with "INVALID_CLABE"
    And the sender balance is unchanged
```

---

## Ambiguity Resolution

When requirements are unclear during any phase, use `AskUserQuestion` with concrete options:

```
AskUserQuestion:
  question: "What should happen when [ambiguous case]?"
  options:
    A: [Concrete outcome A — explain what it means, cite research if applicable]
    B: [Concrete outcome B — explain trade-offs]
    C: [Explicit out of scope — we don't handle this case in this story]
  recommended: [A/B/C with rationale from research]
```

Never leave ambiguity unresolved. "TBD" is not an acceptance criterion.

---

## Artifacts Produced

| Artifact              | Phase  | Location                                                 |
| --------------------- | ------ | -------------------------------------------------------- |
| Research Synthesis    | E      | Inline (internal — not saved as file)                    |
| Confidence Assessment | A      | Inline (presented to user)                               |
| User Story Document   | S      | `docs/plans/active/<slug>/<slug>-user-story.md`          |
| Plan Folder           | S      | `docs/plans/active/<slug>/` (BAP adds to this later)     |
| Spec Commit           | Post-V | Git history: `docs(scope): add user story for <feature>` |

---

## Success Criteria

- [ ] EXPLORE phase consulted both codebase AND web/documentation sources
- [ ] All 4 ASK categories covered with research-informed questions
- [ ] Requirements clarity score ≥ 80/100 before SPECIFY
- [ ] All 7 mandatory sections present in output document
- [ ] Conditional sections included or skipped with documented reason
- [ ] Minimum 8 Gherkin scenarios across 6 mandatory categories
- [ ] Fintech safety scan completed (E.4) and verified (V.4)
- [ ] All DoR checkboxes `[x]` with section references
- [ ] No "TBD", "should", "might", or ambiguous language in acceptance criteria
- [ ] User story document committed to version control before handoff to BAP

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Pre-implementation planning**: [/bap](../bap/SKILL.md) (receives user story as input)
- **Execution**: [/eth](../eth/SKILL.md) (implements the plan BAP produces)
- **DDD pattern reference**: `agents/system-architect.md`
- **Backend rules**: `rules/backend.md` (hexagonal architecture, database patterns)
- **Security rules**: `rules/security.md` (OWASP, secrets, fintech safety)
- **Deliverables rule**: `rules/deliverables.md` (output requirements)
- **Architecture audit**: [/architecture-audit](../architecture-audit/SKILL.md) (domain purity checks)
