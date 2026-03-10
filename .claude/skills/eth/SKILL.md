---
name: eth
description: >-
  Execute-Test-Human-review pipeline. Use when an approved plan exists
  and you are ready to implement with parallel builders and QE.
triggers:
  - execute plan
  - implement plan
  - build from plan
  - approved plan
argument-hint: "[plan document path or feature name]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, Write, Edit, WebFetch, WebSearch
---

# Workflow: ETH (Execute, Test, Human-review)

> Post-plan implementation pipeline using Claude Code native agent teams.
> Flow: **Execute → Test → Review (autonomous) → Human-review**
> Precondition: an approved, committed plan from the BAP workflow.

> **Experimental**: Agent teams require `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `settings.json`.

**Use when:**

- An approved plan exists in `docs/plans/active/`
- Ready to implement with parallel builders and continuous test validation
- Agent teams are enabled in settings

---

## Prerequisite Check — STOP if not met

Before doing anything else:

1. Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set to `1` in `settings.json`.
   - If **not set**: stop immediately. Tell the user:
     ```
     ETH requires agent teams. Add this to settings.json and restart:
     { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
     ```
   - Do not fall back to single-agent execution. ETH is team-only by design.

2. Verify an approved plan file exists at `docs/plans/active/<slug>/`.
   - If missing: stop. Direct user to complete BAP first ([/bap](../bap/SKILL.md)).

3. Check current branch — if on `main` or `develop`, suggest `feature/<name>` or `fix/<name>` before proceeding.

---

## Prerequisites

- [ ] `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `settings.json`
- [ ] Approved, committed plan in `docs/plans/active/<slug>/`
- [ ] Feature branch active (`feature/<name>` or `fix/<name>`)
- [ ] Plan has tasks with explicit file paths, tiers, acceptance criteria, and fintech flags
- [ ] MCP tools available for web research (`context7`, `WebFetch`, `WebSearch`)

---

## Phase E: Execute

**Indicator**: `[eth.md] Phase E — Execute`

### E.0 — Plan Consumption & Dynamic Team Composition

**NO AskUserQuestion for team sizing.** The lead reads the BAP plan and composes the optimal team dynamically.

**Step 1 — Read the plan:**

Read the plan at `docs/plans/active/<slug>/<slug>-plan.md` and extract:

```
Plan Analysis:
- Task count: [N]
- Independent task groups: [N groups — which tasks per group]
- Tier distribution: [N T1, N T2, N T3]
- T1 task domains: [list: domain/security/data/frontend/etc.]
- Fintech flag density: [N of M tasks flagged — list flags]
- Layers touched: [domain | application | infrastructure | presentation]
- BAP suggestion: [free-form text from ETH Composition Data section]
- Per-task acceptance criteria: [extracted for QE consumption]
- Per-task fintech flags: [extracted for QE consumption — NO guessing]
```

**Step 1.5 — Resource Detection & Enforcement (RDE):**

After reading the plan, the lead runs RDE independently on the plan content + task description.

1. Re-run RDE: scan plan text against ALL keyword registries (same as BAP B.1 Track 4 — read `triggers:` from every `.claude/skills/*/SKILL.md` frontmatter + rule activation conditions + knowledge categories + agent descriptions)
2. Compare with BAP's manifest (from plan's `## Resource Manifest` section, if present)
3. If delta found (ETH detected resources BAP missed, or plan was written manually without BAP):
   - Flag: `[aidd.md] RDE Delta — ETH detected additional: [list]`
   - Load the additional resources
4. Emit the final Resource Manifest (visible to user):

```
[aidd.md] RDE — Resource Detection & Enforcement (ETH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

detected-skills:     [list]
detected-rules:      [list]
detected-knowledge:  [list]
detected-agents:     [list]
detected-workflows:  [list]

Delta from BAP: [list of additions or "none"]
Enforcement: ALL detected resources LOADED into context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

5. Distribute detected resources to appropriate contexts:
   - detected-skills → builder prompts (reference docs loaded as context)
   - detected-rules → builder + reviewer prompts (enforcement constraints)
   - detected-knowledge → builder prompts (TKB entries for technology decisions)
   - detected-agents → team composition input (inform Step 2)
   - detected-workflows → execution hooks

**When clean-ddd-hexagonal detected — builder injection:**
- system-architect builders receive:
  1. `skills/clean-ddd-hexagonal/references/DDD-TACTICAL.md` (entities, VOs, aggregates, events, services)
  2. `skills/clean-ddd-hexagonal/references/HEXAGONAL.md` (ports, adapters, driver/driven sides)
  3. `skills/clean-ddd-hexagonal/references/LAYERS.md` (layer responsibilities, dependency direction)
  4. Domain-first decomposition steps: Identify rules → Model entities → Define ports → Implement adapters

**Step 2 — Compose team dynamically:**

The lead analyzes the plan data AND the RDE manifest and determines:

1. **Builder count** (1-3): Based on independent task groups
   - 1 builder: all tasks sequential, or ≤ 4 tasks total
   - 2 builders: 2+ independent groups with ≥ 3 tasks each
   - 3 builders: 3+ independent groups with significant parallelism opportunity

2. **Builder specialization**: Based on T1 task domains
   - If T1 tasks span a single domain → general-purpose builders suffice
   - If T1 tasks span multiple specialized domains → assign specialist builders per domain:

   | T1 Task Domain                       | Specialist Builder  |
   | ------------------------------------ | ------------------- |
   | Domain logic (entities, VOs, events) | system-architect    |
   | Database/schema/migration            | data-architect      |
   | Security/auth/crypto                 | security-architect  |
   | API endpoints/controllers            | contract-architect  |
   | Frontend architecture                | experience-engineer |
   | UI components                        | interface-artisan   |
   | CI/CD/infrastructure                 | platform-engineer   |

   - T2/T3 tasks always use general-purpose builders
   - Specialist builders receive their agent definition file as additional context

3. **Review depth**: Based on fintech flag density
   - 0 fintech flags → standard review (Phase R only)
   - 1-2 fintech flags → enhanced review (Phase R with security focus)
   - 3+ fintech flags or money/ledger flags → deep review (Phase R with security-architect reviewer)

4. **Human review gate**: Based on fintech flag presence
   - No fintech flags → single review at end (after all tasks pass Phase T)
   - Any fintech flags → per-risk-surface review: auto-approve standard tasks, pause for human on flagged tasks

**Step 3 — Output the composition decision:**

```
ETH Team Composition:
- Builders: [N] — [general/specialist assignments]
- QE: 1
- Review depth: [standard | enhanced | deep]
- Human review gate: [end-only | per-risk-surface]
- Rationale: [why this composition, referencing plan data]
```

The lead does NOT ask the user to confirm — the composition is derived from plan data. The user can override during Phase H if needed.

### E.1 — Pre-Build Verification

Before spawning builders, the lead runs three verification steps:

**Version Protocol:**
- Run the 4-step version verification from `rules/version-protocol.md`
- Check `package.json` files for actual library versions
- If version mismatch found → BLOCKER. Resolve before spawning.

**Memory Layer Consultation:**
- Check `.claude/MEMORY.md` Decisions table for relevant prior decisions
- Check `.claude/MEMORY.md` Mistakes table for known pitfalls in this domain
- Check `.claude/MEMORY.md` Conventions table for project patterns
- Feed relevant findings to builders as context in their spawn prompts

**Web Research (for T1 tasks only):**
- Use `context7` (resolve-library-id → query-docs) to verify library APIs for T1 tasks
- Use `WebSearch`/`WebFetch` for implementation patterns the builders will need
- Include verified API patterns in builder prompts to prevent stale-pattern usage

### E.2 — TeamCreate & Spawn

`TeamCreate "eth-<feature-slug>"`

**Builder prompt template** (customized per builder):

```
"Implement the assigned tasks from docs/plans/active/<slug>/<slug>-plan.md.

YOUR TASKS: [list of task IDs and names assigned to this builder]

For each task:
1. Read the plan's acceptance criteria for this task
2. Implement the changes at the exact file paths specified
3. DM the QE teammate when ready for validation
4. Wait for QE approval before claiming the next task
5. If QE reports failures, fix them and notify QE to retest
6. Mark task complete only after QE approves

[IF SPECIALIST]: You are acting as [specialist-role]. Reference: agents/[specialist-role]/[specialist-role].md for your full role definition.
[IF VERSION CONTEXT]: Verified library patterns: [from E.1 web research]
[IF MEMORY CONTEXT]: Known pitfalls: [from E.1 memory consultation]

Tools available: Read, Edit, Write, Glob, Grep, Bash, context7, WebFetch, WebSearch.
Use context7/WebFetch/WebSearch to verify library APIs BEFORE writing code that uses them.
Reference: rules/backend.md, rules/code-style.md, rules/security.md.
When completing a task, DM QE using the Builder → QE handoff format from rules/handoffs.md Section 3:
- List all files changed with action (created/modified/deleted) and line counts
- Check off each acceptance criterion from the plan (verbatim)
- Copy fintech flags from plan — do NOT guess
- List new/modified tests
- Note any known limitations or deferred work

DM lead if blocked. Do not wait silently."
```

**QE prompt template:**

```
"Validate each task the builders complete. You receive per-task acceptance criteria and fintech flags from the plan — use them, do NOT guess.

PER-TASK VALIDATION (in this order):
1. typecheck (see STACK.md) — STOP if fails, DM builder immediately
2. lint (see STACK.md) — only if typecheck passed
3. test:targeted (see STACK.md) — targeted tests only
4. Verify the plan's acceptance criteria for THIS task are met
5. Check fintech flags for THIS task:
   [PASTE per-task fintech flags extracted in E.0]

ACCEPTANCE-DRIVEN VALIDATION:
- Each task has a specific acceptance criterion in the plan
- Verify THAT criterion is met — not generic 'tests pass'
- If the acceptance criterion says 'unit test passes for X' → verify that specific test exists and passes
- If the acceptance criterion says 'typecheck clean' → verify clean output

FINTECH FLAG CONSUMPTION (from plan — no guessing):
- If task has [money] flag → verify BigInt arithmetic, transaction boundaries, no Number() on monetary values
- If task has [auth] flag → verify fail-closed pattern, guard present, no auth bypass
- If task has [PII] flag → verify encryption/masking, no PII in logs
- If task has [migration] flag → verify reversible migration (up + down), no data loss
- If task has [ledger] flag → verify debit/credit balance, immutable records, timestamps

Coverage targets by layer:
- Domain Logic: 100%
- Application Services: >= 90%
- Controllers: >= 70%
- Infrastructure: >= 60%

DM builder using the QA Verdict format from rules/handoffs.md Section 4:
- PASS: 'Task <N> passed all gates. Marking complete.' with gate results table and evidence.
- FAIL: 'Task <N> failed: [specific errors]. Fix and notify me.' with exact error output, retry count (Attempt N of 3).
Track retry count per task. Escalate at attempt 3 using Escalation format (rules/handoffs.md Section 5).

DM lead when: all tasks validated, fintech flag triggered, builder exceeds 2 fix cycles.
Reference: rules/testing.md for coverage targets and AAA pattern; rules/fintech-testing.md for fintech validation patterns; agents/quality-engineer/quality-engineer.md for full QA role definition."
```

### E.3 — Task Dispatch & Divergence Management

**Lead responsibilities during execution:**

- Monitor the shared task list. Check in after each task completes.
- If a builder is blocked: send clarification or reassign the task.
- If plan diverges from reality: follow the **Divergence Protocol**.
- Do not implement tasks yourself — coordinate only.

**Divergence Protocol:**

When implementation reality differs from the plan:

1. **Log the divergence** in the plan's Divergence Log table:
   ```
   | Date | Task | Divergence | Reason | Plan Updated |
   | YYYY-MM-DD | Task N | [what changed] | [why] | Yes |
   ```
2. **Update the plan** — change affected task descriptions, file paths, or acceptance criteria
3. **Notify builders** — tell affected builders about the change
4. **Continue** — builders work from the updated plan

**Builder responsibilities:**

- Claim tasks in plan order (lowest ID first) unless instructed otherwise
- DM lead if blocked. Do not wait silently.
- DM QE teammate when a task is ready for validation
- Mark task `completed` only after QE approval
- Use `context7`/`WebFetch`/`WebSearch` to verify library APIs before writing code

### E.4 — Failure Handling

| Scenario                              | Action                                                  |
| ------------------------------------- | ------------------------------------------------------- |
| Builder blocked on dependency         | Builder DMs lead → lead unblocks or reassigns           |
| QE reports test failures              | QE DMs builder → builder fixes → QE retests             |
| Plan diverges from reality            | Lead follows Divergence Protocol (E.3)                  |
| Builder cannot fix after 3 QE attempts | Lead receives Escalation handoff (rules/handoffs.md Section 5) → spawns replacement builder or asks user |
| Version mismatch discovered mid-build | Lead stops builder, resolves version, resumes           |
| Critical failure                      | Lead shuts down team, presents state to user            |

---

## Phase T: Test

**Indicator**: `[eth.md] Phase T — Test`

The QE teammate runs validation after each task using the acceptance-driven protocol from E.2.

### T.1 — QE Validation Protocol (per task)

For each completed task, QE runs in this order:

```bash
# Commands below use action names from STACK.md. Replace with your project's actual commands.

# 1. TypeScript — must be clean before anything else
typecheck
# STOP RULE: If typecheck fails, do not run lint or tests.
# DM builder immediately with typecheck errors. Wait for fix before continuing.

# 2. Lint — catch style and rule violations (only if typecheck passed)
lint

# 3. Targeted tests — only files touched by this task
test:targeted <path-to-modified-files>

# 4. Acceptance criterion check — verify the plan's specific criterion for this task
# [Read from plan, not guessed]

# 5. Format check (optional — warn, not block)
format:check
```

**QE reports to builder via DM:**
- `PASS`: "Task <N> passed all gates. Marking complete."
- `FAIL`: "Task <N> failed: [specific errors]. Fix and notify me."

**QE reports to lead via DM** when:
- All assigned tasks are validated (final pass signal)
- A task with fintech flags is validated (lead decides: auto-approve or pause for human)
- A builder exceeds 2 fix cycles without resolving failures

### T.2 — Fintech Flag Consumption

QE reads fintech flags **from the plan** — no guessing. Each task in the plan has explicit `fintech flags: [money | auth | PII | migration | ledger | none]`.

| Flag      | QE Verification                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------ |
| money     | BigInt arithmetic only. No `Number()` on monetary values. Transaction boundaries present.        |
| auth      | Fail-closed pattern. Guards on all protected routes. No auth bypass.                             |
| PII       | Encrypted/masked fields. No PII in log statements or error messages.                             |
| migration | Reversible migration (up + down methods). No destructive column drops without data preservation. |
| ledger    | Debit/credit balance verified. Immutable records. Timestamps present.                            |

When a flagged task passes QE: lead applies the human review gate decision from E.0.

### T.3 — Failure Recovery Loop

```
QE → FAIL (attempt 1 of 3) → builder fixes → QE retests
         |__________________________________|
         (max 3 attempts — retry count tracked in QA Verdict handoff)

Attempt 1: QE DMs builder with FAIL verdict (rules/handoffs.md Section 4)
Attempt 2: QE DMs builder with FAIL verdict, includes "Previous failure: [what failed last time]"
Attempt 3: QE DMs lead with Escalation (rules/handoffs.md Section 5), includes all 3 attempts
```

**Quality metrics tracked per ETH run:**
- First-pass rate: percentage of tasks passing QE on first attempt
- Average retries per task: total retries / total tasks
- Escalation count: tasks that reached attempt 3

If still failing after 3 attempts:
  QE DMs lead using Escalation format (rules/handoffs.md Section 5) → lead intervenes (sends clarification, spawns replacement builder, or asks user)

---

## Phase R: Autonomous Review

**Indicator**: `[eth.md] Phase R — Review`

After QE signals final pass on all tasks, the lead runs the autonomous review pipeline. Phase R has three distinct, non-overlapping review layers:

1. **R.1 — Dynamic Review Sub-Team**: Code quality review (domain purity, adapter correctness, API conventions)
2. **R.4 — Architecture & Security Workflows**: Sequential analysis (security-audit.md → architecture-audit.md compliance)
3. **R.5 — Code Simplification**: /simplify on changed files

Each layer has a distinct responsibility. No duplication between them.

### R.1 — Dynamic Review Sub-Team

**Default skepticism directive**: Reviewers MUST cite evidence for PASS verdicts, not just absence of findings. A review that says "no issues found" without demonstrating what was checked is insufficient. Reviewers must list what they verified and provide evidence for their assessment.

The lead analyzes which layers were actually changed in the implementation, then spawns ONLY the relevant reviewers.

```
TeamCreate "review-<feature-slug>"
```

**Reviewer selection based on changed layers:**

| Changed Layers                  | Reviewers Spawned                               |
| ------------------------------- | ----------------------------------------------- |
| Domain only                     | domain-reviewer                                 |
| Domain + Infrastructure         | domain-reviewer + infra-reviewer                |
| Domain + Infra + Presentation   | domain-reviewer + infra-reviewer + api-reviewer |
| Presentation only (frontend)    | api-reviewer + design-reviewer                  |
| Infrastructure only (migration) | infra-reviewer                                  |
| Full stack                      | all relevant reviewers (up to 4)                |

**Rules:**
- Minimum 1 reviewer, maximum 4
- If ANY fintech flag was present in the plan → always include a security-focused review (either spawn security-reviewer or add security checklist to infra-reviewer)
- Each reviewer receives: user story reference, plan reference, the specific files they should review, AND detected-rules/knowledge relevant to their domain (from RDE manifest)
- Reviewers NOT spawned for unchanged layers — no noise

**RDE-informed reviewer context:**
- domain-reviewer receives: detected-rules (backend.md) + detected-skills (clean-ddd-hexagonal if detected) + detected-knowledge (patterns/ entries)
- infra-reviewer receives: detected-rules (backend.md, security.md) + detected-knowledge (data/ entries)
- api-reviewer receives: detected-rules (testing.md, security.md) + detected-knowledge (backend/communication/ entries)
- design-reviewer receives: detected-rules (frontend.md) + detected-skills (modern-css, feature-slicing if detected) + detected-knowledge (frontend/ entries)
- security-reviewer receives: detected-rules (security.md) + detected-knowledge (security/ entries) + all detected-skills with security implications
- All reviewers receive: version-protocol.md for version verification of any library usage in changed files

**Reviewer prompts:**

- **domain-reviewer**: "Review all domain layer changes (consult STACK.md for layer mapping).
  Check: zero framework/ORM imports inside domain layers (consult STACK.md for framework and ORM names); port interfaces are TypeScript interfaces (not classes); VO invariants (readonly, factory `create()`, no public `new`); no ORM entity in application services.
  Reference: `rules/backend.md` for full DDD purity rules.
  Read-only — no edits. Report: [BLOCKER/MAJOR/MINOR]: [finding] — [file:line]"

- **infra-reviewer**: "Review all infrastructure layer changes: adapters, repository implementations, migration files.
  Check: N+1 query patterns; transaction boundaries on money movement and multi-table writes; migration files have both `up()` and `down()` rollback; repository classes implement their port interface; no business logic in adapters.
  Reference: `rules/backend.md` for adapter/port rules.
  Read-only — no edits. Report: [BLOCKER/MAJOR/MINOR]: [finding] — [file:line]"

- **api-reviewer**: "Review all presentation layer changes: controllers, DTOs, guards, interceptors.
  Check: all DTOs validated with Zod schemas; protected routes have guards; HTTP status codes correct (200/201/204/400/401/403/404); error responses leak no stack traces or internal paths; tests exist for happy path + auth failure + one validation failure.
  Reference: `rules/testing.md` for coverage targets; `rules/security.md` for error exposure rules.
  Read-only — no edits. Report: [BLOCKER/MAJOR/MINOR]: [finding] — [file:line]"

- **design-reviewer** (if plan touches UI components or pages): "Review accessibility and visual design.
  WCAG 2.1 AA: contrast ratio >= 4.5:1, focus indicators visible, no keyboard traps, form labels associated, no color-only errors, semantic HTML.
  Reference: `rules/frontend.md` for full WCAG checklist; `agents/design-architect/design-architect.md` for design system and token audit.
  Read-only — no edits. Report: [BLOCKER/MAJOR/MINOR]: [finding] — [file:line]"

- **security-reviewer** (if deep review depth from E.0): "Security-focused review of all changed files.
  Check: OWASP Top 10 compliance for changed code, auth bypass risks, injection vectors, secrets exposure, PII leaks, cryptographic correctness.
  Reference: `rules/security.md` for full OWASP checklist; `agents/security-architect/security-architect.md` for threat modeling.
  Read-only — no edits. Report: [BLOCKER/MAJOR/MINOR]: [finding] — [file:line]"

### R.2 — Collect and Route Findings

**Fintech Auto-BLOCKERs** (always BLOCKER — no exceptions):
- Hardcoded credentials or secrets in any changed file
- Auth guard removed from a previously protected route
- Money movement without transaction boundary
- Migration file with no `down()` rollback
- `Number()` or `parseFloat()` on monetary values
- PII in log statements or error messages

**Severity routing:**

| Severity    | Action                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| **BLOCKER** | Lead routes to builder for fix → QE retests → lead re-runs affected reviewer → if clean, proceed to R.4 |
| **MAJOR**   | Included in H.1 synthesis — human decides: fix now or track as tech debt                                |
| **MINOR**   | Included in H.1 synthesis — informational                                                               |

### R.3 — Review Sub-Team Cleanup

Lead sends `shutdown_request` to all review teammates → `TeamDelete` for the review sub-team → proceed to R.4.

### R.4 — Architecture & Security Analysis

Run these workflows **sequentially** (not in parallel) on the changed files:

1. **security-audit.md**: Run the security audit workflow on all changed files. Verify compliance with **architecture-audit.md** (domain purity, port/adapter boundaries, dependency direction).
2. If audit finds issues → lead routes to builder for fix → QE retests → re-audit affected files.

**Note**: `pr-review.md` is NOT invoked inside ETH. R.1's review sub-team already covers code quality review with specialist reviewers. Running pr-review.md would duplicate R.1's work. The pr-review.md workflow is for standalone code reviews outside of ETH.

### R.5 — Code Simplification

Run `/simplify` on all files changed during this ETH execution. This catches:
- Unnecessary abstractions introduced during implementation
- Dead code or unused imports
- Opportunities to reuse existing utilities
- Over-engineering relative to the task scope

If `/simplify` produces changes → QE retests affected files before proceeding to Phase H.

---

## Phase H: Human-review

**Indicator**: `[eth.md] Phase H — Human-review`

### H.1 — Lead Synthesis

After all tasks complete, QE signals final pass, and Phase R is clean, the lead compiles:

```markdown
## ETH Summary — <feature-slug>

**Tasks completed:** N / N
**Team composition:** [N builders (specialist assignments), 1 QE, review depth]
**Test status:** All gates passing (typecheck, lint, tests)
**Plan divergences:** [list from Divergence Log or "none"]
**Risk surfaces touched:** [list flagged items with resolution or "none"]

### What was built:
[2-3 sentence summary of what changed and why]

### Builders & Specialists:
[Which builders handled which tasks. Any specialist dispatches and their impact.]

### Autonomous Review Findings (Phase R):
**R.1 Review sub-team:**
  BLOCKERs resolved: [list fixed items or "none"]
  MAJORs (human decision): [list or "none"]
  MINORs (informational): [list or "none"]
**R.4 Architecture analysis:** [compliant / findings]
**R.5 Simplification:** [changes made or "no changes needed"]

### Open items / caveats:
[anything the user should know before merging]
```

### H.2 — Review Gate

Apply the human review gate decision from E.0:

**End-only gate** (no fintech flags):
- Present the synthesis above to the user.
- Wait for human decision before proceeding to H.3.

**Per-risk-surface gate** (fintech flags present):
- Low-risk tasks: auto-approved by lead after QE pass. No human pause.
- High-risk tasks (flagged with money/auth/PII/migration/ledger): pause immediately after QE validates that task.
  - Present: task name, what changed, why it's flagged, fintech verification results.
  - Wait for human: `Approve` / `Request changes` / `Abort`.
  - If Approved: mark task complete, builder continues to next.
  - If Request changes: builder revisits, QE retests, lead re-presents.
  - If Abort: lead shuts down team gracefully and halts ETH.
- Final synthesis: still presented once at end for overall approval.

**Human decisions:**

| Decision        | Action                                                          |
| --------------- | --------------------------------------------------------------- |
| Approve         | Proceed to H.3                                                  |
| Request changes | Builder fixes specific items → QE retests → lead re-presents    |
| Abort           | Lead shuts down team, plan stays in `active/`, branch preserved |

### H.3 — Post-approval Actions

Reference: `rules/git-workflow.md` for Conventional Commits format, branch naming, and PR template.

1. **Plan archival:**
   - Move plan folder: `docs/plans/active/<slug>/` → `docs/plans/done/<slug>/`
   - Update plan status frontmatter to `Complete`

2. **Memory layer update:**
   - If new conventions discovered during implementation → update `.claude/MEMORY.md` Conventions table
   - If mistakes were made and recovered → update `.claude/MEMORY.md` Mistakes table
   - If architectural decisions were made during ETH (not in plan) → update `.claude/MEMORY.md` Decisions table

3. **Implementation commit:**
   ```
   feat(scope): implement <feature>
   ```

4. **Branch options — ask user:**
   ```
   AskUserQuestion:
     question: "How would you like to close out this branch?"
     header: "Branch close"
     options:
       - Create PR (Recommended): opens GitHub PR with ETH summary as body
       - Merge to develop: merge directly if team has approval
       - Leave on branch: user will handle merge manually
   ```

5. **Team cleanup:**
   - Lead sends shutdown_request to each teammate
   - After all teammates confirm shutdown: TeamDelete
   - Confirm cleanup complete to user

---

## Artifacts Produced

| Artifact              | Phase | Location                   |
| --------------------- | ----- | -------------------------- |
| Implementation        | E     | Source files per plan      |
| Divergence Log        | E.3   | Updated in plan document   |
| Implementation commit | H.3   | Git history                |
| Archived plan         | H.3   | `docs/plans/done/<slug>/`  |
| ETH summary           | H.1   | Inline (presented to user) |
| Memory updates        | H.3   | `.claude/MEMORY.md`        |

---

## Success Criteria

- [ ] All plan tasks are completed and marked done in the shared task list
- [ ] Typecheck clean (see STACK.md for command)
- [ ] Lint clean (see STACK.md for command)
- [ ] Targeted tests pass at required coverage per layer
- [ ] Per-task acceptance criteria verified (not just generic "tests pass")
- [ ] Per-task fintech flags consumed from plan (not guessed)
- [ ] Plan divergences logged in Divergence Log
- [ ] Plan status updated to `Complete`
- [ ] Plan moved: `docs/plans/active/` → `docs/plans/done/`
- [ ] Phase R autonomous review completed (R.1 + R.4 + R.5)
- [ ] Human approved the ETH summary (or each risk-surface task for per-risk-surface gate)
- [ ] Memory layer updated with lessons learned
- [ ] Team cleaned up (all teammates shutdown, TeamDelete run)
- [ ] Branch closed per user's choice (PR / merge / leave)

---

## Anti-Patterns

| Anti-Pattern                      | Description                                             | Mitigation                                                                    |
| --------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Skipping prerequisite check**   | Running ETH without agent teams enabled                 | Prerequisite check is mandatory. Fail immediately with clear message.         |
| **Rigid team modes**              | Using preset A/B/C instead of dynamic composition       | E.0 reads plan data and composes team dynamically. No preset modes.           |
| **Lead doing builder work**       | Lead implements tasks instead of delegating             | Lead coordinates only. Builders claim tasks from the list.                    |
| **QE guessing fintech flags**     | QE deciding which tasks are risky without plan data     | QE reads flags from plan. Every task has explicit `fintech flags` field.      |
| **Generic QE validation**         | QE only checks "tests pass" without acceptance criteria | QE verifies the plan's specific acceptance criterion for each task.           |
| **Builders without web research** | Builders guessing at library APIs                       | All builders have context7/WebFetch/WebSearch. E.1 pre-verifies T1 task APIs. |
| **QE skipping targeted tests**    | Running no tests, or full suite instead of targeted     | QE runs targeted tests for modified files only. Full suite is for CI.         |
| **Plan divergence silence**       | Implementation differs from plan without updating it    | Lead follows Divergence Protocol: log → update plan → notify builders.        |
| **Premature task completion**     | Builder marks task done before QE approves              | Task marked complete only after QE DMs approval.                              |
| **Skipping team cleanup**         | Leaving orphaned teammates or team resources            | H.3 cleanup is mandatory before ETH closes.                                   |
| **Review gate bypass**            | Auto-approving flagged risk surfaces                    | QE explicitly flags, lead pauses for human on fintech-flagged tasks.          |
| **Brute-force fix loops**         | Retrying same failing approach >2 times                 | After 2 QE cycles: escalate to lead. Lead intervenes or asks user.            |
| **Duplicate review work**         | Running pr-review.md inside ETH alongside R.1           | R.1 covers code quality. pr-review.md is NOT invoked inside ETH.              |
| **Fixed reviewer team**           | Spawning all reviewers regardless of changed layers     | R.1 spawns only reviewers matching actually changed layers.                   |
| **Skipping memory update**        | Not recording lessons learned                           | H.3 includes MEMORY.md update step.                                           |

---

## Hooks Guidance

Use [Claude Code hooks](https://code.claude.com/docs/en/hooks) to enforce ETH quality gates.

**`PreToolUse`** — Runs before any tool call.
- Use to block Write/Edit calls touching money-movement files unless QE has approved the task.
- Exit with code 2 to cancel the tool call with feedback to the teammate.

**`PostToolUse`** — Runs after any tool call.
- Use to auto-run format:check (see STACK.md) after file edits (warn only — exit code 0, do not block).

**`TeammateIdle`** — Runs when a teammate is about to go idle.
- Use to enforce that QE must validate before builder can go idle on a completed task.
- Exit with code 2 to send feedback and keep the teammate working.

**`TaskCompleted`** — Runs when a task is being marked complete.
- Use to enforce that QE approval exists before a task can be marked completed.
- Exit with code 2 to prevent premature completion and send feedback.

**`Stop`** — Runs when the lead is about to stop the session.
- Use to enforce that all plan tasks are marked complete and TeamDelete was called.
- Exit with code 2 to block the stop if open tasks remain.

Example `settings.json`:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "hooks": {
    "TaskCompleted": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo '[ETH] Verify QE approved this task (check DM history) before marking complete.'"
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo '[ETH] Verify all plan tasks are complete and TeamDelete was called before stopping.'"
      }]
    }]
  }
}
```

---

## Failure Handling

| Scenario                              | Action                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| Plan missing or not approved          | Stop. Direct user to BAP first.                                   |
| Agent teams not enabled               | Stop. Show settings.json configuration.                           |
| Version mismatch discovered in E.1    | BLOCKER. Resolve version before spawning builders.                |
| Builder blocked on dependency         | Builder DMs lead → lead unblocks or reassigns.                    |
| QE reports test failures              | QE DMs builder → builder fixes → QE retests (max 2 cycles).       |
| Builder cannot fix after 2 QE cycles  | Lead escalates: spawns replacement builder or asks user.          |
| Plan diverges from reality            | Lead follows Divergence Protocol: log → update plan → notify.     |
| Reviewer finds BLOCKER                | Lead routes to builder for fix → QE retests → reviewer re-checks. |
| Architecture analysis finds violation | Lead routes to builder for fix → QE retests → re-analyze.         |
| /simplify produces changes            | QE retests affected files before proceeding to Phase H.           |
| Human requests changes                | Builder fixes → QE retests → lead re-presents.                    |
| Human aborts                          | Lead shuts down team. Plan stays in active/. Branch preserved.    |
| Critical failure (unrecoverable)      | Lead shuts down team, presents state to user with full context.   |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Input workflow (Product)**: [/product](../product/SKILL.md) (produces user story)
- **Previous phase (BAP)**: [/bap](../bap/SKILL.md) (produces the plan ETH executes)
- **Architecture analysis**: [/security-audit](../security-audit/SKILL.md) + [/architecture-audit](../architecture-audit/SKILL.md)
- **Code simplification**: `/simplify` command
- **Version protocol**: `rules/version-protocol.md` (4-step library version verification)
- **Memory**: `.claude/MEMORY.md` (decisions, mistakes, conventions, friction)
- **Backend rules**: `rules/backend.md` (hexagonal architecture, database patterns)
- **Security rules**: `rules/security.md` (OWASP, secrets, fintech safety)
- **Testing rules**: `rules/testing.md` (coverage targets, AAA pattern)
- **Git workflow**: `rules/git-workflow.md` (Conventional Commits, branch strategy)
- **Deliverables rule**: `rules/deliverables.md` (required outputs per feature)
- **Fintech safety**: `CLAUDE.md` → Safety and Approval section
- **Agent teams docs**: https://code.claude.com/docs/en/agent-teams
