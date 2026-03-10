---
name: security-audit
description: >-
  OWASP security audit with dynamic auditor team and fintech compliance gates.
  Use for pre-deployment, post-incident, or compliance checks.
triggers:
  - security audit
  - OWASP audit
  - vulnerability scan
  - threat model
  - fintech compliance
argument-hint: "[scope: module, layer, or file paths]"
user-invocable: true
model: opus
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, WebFetch
---

# Workflow: Security Audit

> Parallel security assessment using dynamically-scoped OWASP auditors. Produces a severity-ranked report with fintech compliance gates and remediation routing.
>
> **Invocation**: Standalone (ad-hoc) or from ETH Phase R.4 (automated). Both paths use the same phases.

**Use when:**

- Pre-production deployment gate
- Post-incident security review
- Compliance audit (PCI-DSS, SOC 2, GDPR)
- PR quality gate for auth or money-movement changes
- ETH Phase R.4 automated security analysis

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] Codebase context is accessible
- [ ] Agent teams enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- [ ] Scope defined: entire codebase, specific module, changed files, or PR diff

---

## Phase A: Scope & Classify

**Indicator**: `[security-audit.md] Phase A -- Classifying audit scope`

### A.1 -- Define Input

Determine the audit scope from the invocation context:

| Invocation Source   | Input                                | Scope                       |
| ------------------- | ------------------------------------ | --------------------------- |
| ETH Phase R.4       | Changed file list from ETH execution | Changed files only          |
| Standalone (PR)     | `git diff <base>...HEAD --name-only` | Changed files only          |
| Standalone (module) | User-specified module path           | All files in module         |
| Standalone (full)   | Entire codebase                      | All `apps/` and `packages/` |

Record the scope, changed file count, and invocation source.

### A.2 -- Fintech Surface Detection

Scan the scope for fintech surfaces:

| Surface        | Signal                                                              | Flag          |
| -------------- | ------------------------------------------------------------------- | ------------- |
| Money Movement | Wallet, balance, transfer, payout, or ledger transaction logic      | `[money]`     |
| Auth/Session   | Guards, JWT, roles, session management, login/logout flows          | `[auth]`      |
| PII            | Personal data fields (email, CLABE, RFC, phone, address, documents) | `[PII]`       |
| Migration      | New or modified database migration files                            | `[migration]` |
| Ledger         | Ledger accounts, transactions, entries, or balance snapshots        | `[ledger]`    |

Record all detected flags -- these determine auditor emphasis in Phase B.

### Gate A: Audit Depth

| Option         | Condition                                                    | Action                                              |
| -------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `[Quick Scan]` | <= 3 files AND no fintech flags AND single-surface check     | Lead runs inline checks (no team). Skip to Phase C. |
| `[Full Audit]` | > 3 files OR fintech flags present OR compliance requirement | Proceed to Phase B (team spawn).                    |

---

## Phase B: Spawn Audit Team

**Indicator**: `[security-audit.md] Phase B -- Spawning audit team`

`TeamCreate "security-audit-<scope>"`

### B.1 -- Auditor Selection

The base team is 3 auditors covering all OWASP Top 10 categories. Additional auditors are added based on fintech flags:

**Base auditors** (always spawned):

| Auditor           | OWASP Focus        | Domain                                 |
| ----------------- | ------------------ | -------------------------------------- |
| auth-auditor      | A01, A02, A07      | Access control, crypto, authentication |
| injection-auditor | A03, A05, A09      | Injection, misconfiguration, logging   |
| data-auditor      | A04, A06, A08, A10 | Design, dependencies, integrity, SSRF  |

**Conditional auditors** (based on fintech flags from A.2):

| Fintech Flag            | Additional Auditor | Justification                                                |
| ----------------------- | ------------------ | ------------------------------------------------------------ |
| `[money]` or `[ledger]` | fintech-auditor    | BigInt precision, transaction atomicity, ledger immutability |
| `[migration]`           | migration-auditor  | Reversibility, data safety, rollback verification            |

**Rules:**
- Minimum 3 auditors (base team), maximum 5
- Each auditor receives only the files relevant to their domain (filtered from scope)
- If scope is "full codebase", auditors receive directory paths to focus on, not individual files

### B.2 -- Auditor Prompts

**auth-auditor**: "Audit authentication and access control. OWASP focus: A01 (Broken Access Control), A02 (Cryptographic Failures), A07 (Authentication Failures).

Check:
- Auth guards present on all protected routes -- no route accidentally exposed
- JWT: RS256 or EdDSA (not HS256 with shared secret), short expiry, rotation policy
- Password hashing: bcrypt (cost >= 12) or Argon2id -- no MD5/SHA1/SHA256 for passwords
- Permission checks: fail-closed pattern (deny by default, explicit grant required)
- Session tokens: HttpOnly + Secure + SameSite=Strict cookies
- No hardcoded credentials, API keys, or secrets in source code
- IDOR prevention: ownership checks on all resource access endpoints

Reference: `rules/security.md` A01/A02/A07 sections; `agents/security-architect/security-architect.md` for threat model.
Read-only -- no file edits.
Report: [P0/P1/P2/P3]: [finding] -- [file:line or 'clean']"

**injection-auditor**: "Audit injection and configuration security. OWASP focus: A03 (Injection), A05 (Security Misconfiguration), A09 (Security Logging & Monitoring Failures).

Check:
- SQL queries: no raw string interpolation -- use parameterized queries or ORM query builder
- Input validation: Zod schemas on all DTOs at API boundary
- Environment variables: not logged, not exposed in error responses
- Error messages: generic to client -- no stack traces, no internal paths in production responses
- Logging: PII fields (email, CLABE, RFC, phone) masked or absent -- no plaintext PII in logs
- Security headers: CSP, HSTS, X-Frame-Options configured (Helmet.js or equivalent)
- Rate limiting: present on authentication and sensitive endpoints

Reference: `rules/security.md` A03/A05/A09 sections; `rules/backend.md` for input validation patterns.
Read-only -- no file edits.
Report: [P0/P1/P2/P3]: [finding] -- [file:line or 'clean']"

**data-auditor**: "Audit data integrity and supply chain risks. OWASP focus: A04 (Insecure Design), A06 (Vulnerable/Outdated Components), A08 (Software & Data Integrity), A10 (SSRF).

Check:
- PII fields (email, CLABE, RFC, phone) not returned in list endpoints without explicit authorization
- Money movement: each transfer/payout is atomic -- no partial writes without rollback path
- Monetary values: must use BigInt arithmetic -- no `Number()`, `parseFloat()`, or floating-point on money
- Ledger writes: immutable records only -- no UPDATE on committed transactions
- Dependencies: run dep:audit (see STACK.md) and flag packages with HIGH or CRITICAL CVEs
- External HTTP calls: URL validated against allowlist, no user-controlled SSRF vectors
- Lock files: package manager lock file present and committed (see STACK.md for package manager)

Reference: `rules/security.md` A04/A06/A08/A10 sections; `rules/backend.md` for database patterns.
Read-only -- no file edits.
Report: [P0/P1/P2/P3]: [finding] -- [file:line or 'clean']"

**fintech-auditor** (when `[money]` or `[ledger]` flag present): "Audit fintech-specific money movement and ledger integrity.

Check:
- All monetary values use BigInt -- no `Number()`, `parseFloat()`, or `parseInt()` on amounts
- Transaction boundaries: every money movement wrapped in database transaction with rollback
- Ledger entries: immutable after creation -- no UPDATE or DELETE on committed entries
- Double-entry: every debit has a matching credit (sum of entries per transaction = 0)
- Balance computation: derived from ledger entries, not stored as mutable field
- Wallet operations: SELECT FOR UPDATE on balance reads during writes (prevent race conditions)
- Precision: no rounding or truncation of monetary values at any layer

Reference: `rules/security.md` fintech sections; `rules/backend.md` transaction patterns.
Read-only -- no file edits.
Report: [P0/P1/P2/P3]: [finding] -- [file:line or 'clean']"

**migration-auditor** (when `[migration]` flag present): "Audit database migration safety.

Check:
- Every migration has both `up()` and `down()` -- reversible migrations only
- No destructive operations without explicit human approval (DROP TABLE, DROP COLUMN, TRUNCATE)
- New columns on existing tables have DEFAULT values or are nullable
- Index additions are non-blocking where possible (CONCURRENTLY)
- Enum additions are additive only -- no removal of existing values
- Foreign key constraints specify ON DELETE strategy
- Migration ordering: no conflicts with existing migration sequence

Reference: `rules/backend.md` database/migration sections.
Read-only -- no file edits.
Report: [P0/P1/P2/P3]: [finding] -- [file:line or 'clean']"

---

## Phase C: Synthesize Report

**Indicator**: `[security-audit.md] Phase C -- Synthesizing audit report`

After all auditors report their findings, lead classifies and synthesizes.

### C.1 -- Severity Classification

| Level  | Criteria                                                                                                                                                              | Action                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **P0** | Auth bypass, hardcoded secrets, PII in logs, unencrypted money fields, `Number()`/`parseFloat()` on monetary values, missing transaction boundaries on money movement | Block deploy immediately     |
| **P1** | Missing input validation, SQL injection vector, weak crypto, migration without `down()` rollback, missing rate limiting on auth endpoints                             | Block PR merge               |
| **P2** | Non-PII sensitive data in logs, stale dependency with known CVE, missing security headers                                                                             | Fix in next sprint           |
| **P3** | Best-practice deviations, minor config gaps, informational findings                                                                                                   | Log, address when convenient |

### C.2 -- Fintech Compliance Gates

| Gate                                   | Standard                          | Level if Failed |
| -------------------------------------- | --------------------------------- | --------------- |
| No hardcoded credentials               | PCI-DSS Req 8.2                   | P0              |
| Auth fail-closed on all routes         | PCI-DSS Req 7.1                   | P0              |
| PII masked in all logs                 | GDPR Art 25, SOC 2 CC6.1          | P0              |
| Money movement atomicity               | PCI-DSS Req 10.2                  | P0              |
| BigInt for all monetary values         | Fintech precision requirement     | P0              |
| Ledger immutability                    | Double-entry accounting integrity | P0              |
| Input validation at all API boundaries | OWASP A03                         | P1              |
| No HIGH/CRITICAL CVEs in dependencies  | SOC 2 CC7.1                       | P1              |
| Migrations reversible                  | Operational safety                | P1              |

### C.3 -- Report Format

```markdown
## Security Audit -- <scope>

**Date**: YYYY-MM-DD
**Scope**: [module, PR, or full codebase]
**Invocation**: [standalone | ETH R.4]
**Fintech flags**: [money | auth | PII | migration | ledger | none]
**Auditors spawned**: [list]
**Status**: BLOCK DEPLOY | BLOCK PR | PASS WITH NOTES | CLEAN

### P0 -- Block Deploy
[findings with file:line references, or "none"]

### P1 -- Block PR
[findings with file:line references, or "none"]

### P2 -- Fix Next Sprint
[findings with file:line references, or "none"]

### P3 -- Informational
[findings or "none"]

### Compliance Gates
[PASS/FAIL per gate with evidence]

### Remediation History
[cycle count and what was fixed, or "no remediation needed"]
```

### Gate C: Report Acceptance

| Option        | Condition                                              | Action                                                     |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| `[Accept]`    | Zero P0, P1s accepted or resolved                      | Audit passes. Proceed to Team Cleanup.                     |
| `[Remediate]` | P0 or P1 findings remain                               | Enter Phase D remediation loop.                            |
| `[Escalate]`  | Unresolvable finding or architectural security concern | Flag for senior security review with full finding history. |

---

## Phase D: Remediation Loop

**Indicator**: `[security-audit.md] Phase D -- Remediation cycle`

For each P0 or P1 finding:

1. Lead compiles the finding list and routes to the builder (or PR author) for fix.
2. Builder fixes the specific item(s).
3. Lead re-runs ONLY the responsible auditor on the affected files.
4. Auditor retests and reports PASS or FAIL.
5. Lead updates the report and re-presents.

**Constraints:**
- Max 2 remediation cycles per finding
- If still failing after 2 cycles: escalate to human with full finding history
- Each cycle re-runs only affected auditors, not the full team
- P2/P3 findings do NOT enter remediation -- they are logged for future work

After all P0 and P1 findings are resolved (or escalated), return to Gate C.

---

## Team Cleanup

**Indicator**: `[security-audit.md] Cleanup -- Shutting down audit team`

After report is accepted:
1. Lead sends `shutdown_request` to each auditor
2. After all confirm shutdown: `TeamDelete`
3. Confirm cleanup to user

---

## Quick Scan (no team needed)

For a single file or focused check without spawning a team. Use when Gate A selects `[Quick Scan]`.

### Secret Detection

```bash
# Hardcoded secrets pattern — replace <src_dirs> with project source directories
grep -rn "password\s*=\s*['\"]" <src_dirs>
grep -rn "secret\s*=\s*['\"]" <src_dirs>
grep -rn "AKIA[0-9A-Z]\{16\}" <src_dirs>
grep -rn "api_key\|apikey\|api-key" <src_dirs> | grep -v "node_modules"
```

### PII in Logs

```bash
# PII leaked in logger calls — replace <src_dirs> with project source directories
grep -rn "this\.logger\.\|console\.log\|console\.error" <src_dirs> | grep -i "email\|phone\|password\|token\|ssn"
```

### Monetary Precision

```bash
# Number()/parseFloat() on monetary values — replace <src_dirs> with project source directories
grep -rn "Number(\|parseFloat(\|parseInt(" <src_dirs> | grep -i "amount\|balance\|price\|total\|fee\|commission"
```

### Migration Safety

```bash
# Migrations without down() — replace <migration_dir> with project migration directory
for f in $(find <migration_dir> -name "*.ts" 2>/dev/null); do grep -L "down" "$f"; done
```

Quick scan produces the same report format (Phase C.3) but with "[Quick Scan]" as invocation source.

---

## Failure Handling

| Scenario                                 | Action                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Auditor blocked (can't access files)     | Lead provides clarification or narrows scope. Auditor resumes.                                                                           |
| Auditor idle without reporting           | Lead sends check-in DM. If still silent, log as "inconclusive -- [auditor]" and proceed with remaining auditors.                         |
| Auditor edits files (scope violation)    | Lead enforces read-only. Violation logged. Submitted findings still valid.                                                               |
| Two auditors report conflicting severity | Lead preserves the higher severity. Surfaces to human for final classification.                                                          |
| dep:audit fails or hangs                 | Lead runs dep:audit with JSON flag and timeout (see STACK.md). If unavailable, log as "dependency scan inconclusive" and note in report. |
| Remediation cycle exceeds max (2)        | Escalate to human with full history. Do not loop indefinitely.                                                                           |
| Quick scan reveals high complexity       | Upgrade to full audit (spawn team). Return to Phase B.                                                                                   |

---

## Anti-Patterns

| Anti-Pattern                           | Mitigation                                                         |
| -------------------------------------- | ------------------------------------------------------------------ |
| Auditing without defined scope         | Phase A formalizes scope before any auditor spawns.                |
| Skipping P2/P3 findings                | Log them -- they compound into P0s over time.                      |
| Auto-approving P1 findings             | P1 = block PR. No exceptions without explicit human override.      |
| Skipping team cleanup                  | TeamDelete is mandatory after every team-based audit.              |
| Running full audit for trivial changes | Gate A quick-scan path avoids unnecessary team overhead.           |
| Auditors reviewing out-of-scope files  | Each auditor receives filtered file list, not the entire codebase. |
| Infinite remediation loops             | Max 2 cycles. Escalate after that.                                 |
| Weakening severity to pass gate        | Fintech compliance gates are non-negotiable. P0 = P0.              |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **ETH integration**: [/eth](../eth/SKILL.md) Phase R.4 -- invokes this workflow on changed files
- **Code review**: [/review](../review/SKILL.md) -- complementary quality review (code, not security)
- **Architecture audit**: [/architecture-audit](../architecture-audit/SKILL.md) -- architecture purity check
- **Security rules (SSOT)**: [rules/security.md](../rules/security.md) -- OWASP Top 10, secrets, crypto standards
- **Backend patterns**: [rules/backend.md](../rules/backend.md) -- database, transaction, adapter patterns
- **Security agent**: [agents/security-architect/security-architect.md](../agents/security-architect/security-architect.md) -- threat modeling specialist
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) -- post-workflow memory capture
