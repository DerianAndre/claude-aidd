---
name: incident-response
description: Full incident response workflow for production incidents with fintech-specific protocols
complexity: high
mode: default
model: opus
effort: exhaustive
thinking: high
fintech-classification: fintech-governing
---

# Incident Response — Production Incident Management for Fintech Systems

> Structured incident lifecycle from detection through post-mortem, with fintech-specific protocols for money movement, ledger integrity, and auth compromise.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Table of Contents

1. [Overview](#1-overview)
2. [Severity Classification](#2-severity-classification)
3. [Response Team Composition](#3-response-team-composition)
4. [Investigation Protocol](#4-investigation-protocol)
5. [Communication Cadence](#5-communication-cadence)
6. [Rollback Procedures](#6-rollback-procedures)
7. [Post-Mortem Template](#7-post-mortem-template)
8. [Fintech-Specific Protocols](#8-fintech-specific-protocols)
9. [Quality Gates](#9-quality-gates)
10. [Cross-References](#10-cross-references)

---

## 1. Overview

This workflow governs all production incident response. It defines severity classification, team composition, investigation phases, rollback procedures, and post-mortem requirements.

**Fintech classification**: `fintech-governing` — this workflow directly controls behavior during incidents that may impact money movement, ledger integrity, authentication, and regulatory compliance. All fintech safety flags (`[money | auth | PII | ledger | migration]`) elevate severity by one level automatically.

**Core principles**:

- **Fail-closed**: When uncertain, restrict access and halt processing. Never fail-open during an active incident.
- **Preserve evidence**: Collect logs, traces, and state snapshots before remediation destroys forensic data.
- **Minimize blast radius**: Contain first, investigate second. Stop the bleeding before diagnosing the wound.
- **Blameless accountability**: Post-mortems target systems and processes, not individuals. Action items have owners and deadlines.

---

## 2. Severity Classification

| Severity | Definition | Examples | Response Time Target | Escalation Threshold |
|----------|-----------|----------|---------------------|---------------------|
| **P0 — Critical** | Production down. Complete service outage or data loss in progress. | Full outage, active data corruption, ledger divergence, unauthorized fund transfers | **15 minutes** to first responder on scene | Immediate: all hands |
| **P1 — High** | Money, auth, or ledger impacted. Service degraded with direct financial or security exposure. | Payment processing failures, auth bypass, ledger inconsistency, PII exposure | **30 minutes** to incident commander assigned | 1 hour: escalate to P0 if not contained |
| **P2 — Medium** | Degraded performance. Service functional but below SLA thresholds. | Elevated latency (>2x baseline), partial feature failure, non-critical data sync delays | **2 hours** to acknowledged and owned | 4 hours: escalate to P1 if worsening |
| **P3 — Low** | Cosmetic or non-critical. No user-facing impact on core functionality. | UI rendering glitches, non-critical log errors, minor UX inconsistencies | **Next business day** | 1 week: auto-close if no user reports |

### Automatic Severity Elevation

Any incident touching a fintech safety surface is elevated by one severity level:

| Fintech Flag | Minimum Severity |
|-------------|-----------------|
| `[money]` | P1 (elevated to P0 if active loss) |
| `[auth]` | P1 (elevated to P0 if active bypass) |
| `[PII]` | P1 (elevated to P0 if active exposure) |
| `[ledger]` | P1 (elevated to P0 if divergence detected) |
| `[migration]` | P2 (elevated to P1 if data integrity at risk) |

---

## 3. Response Team Composition

### P0 — Critical

| Role | Agent/Person | Responsibility |
|------|-------------|---------------|
| Incident Commander (IC) | `incident-commander` | Owns the incident. Coordinates all response. Single point of authority. |
| Security Architect | `security-architect` | Assess security exposure, audit access logs, determine if breach occurred |
| Data Architect | `data-architect` | Verify data integrity, execute recovery procedures, reconcile ledger |
| Platform Engineer | `platform-engineer` | Infrastructure triage, rollback deployments, manage feature flags, scale resources |

All team members remain engaged until the incident is resolved or downgraded.

### P1 — High

| Role | Agent/Person | Responsibility |
|------|-------------|---------------|
| Incident Commander (IC) | `incident-commander` | Owns the incident. Coordinates response. |
| Relevant Specialist | Domain-specific agent | One or more specialists based on the affected surface (e.g., `security-architect` for auth, `data-architect` for ledger) |

### P2 — Medium

| Role | Agent/Person | Responsibility |
|------|-------------|---------------|
| On-Call Engineer | Rotating assignment | Investigate, contain, and remediate. Escalate if severity increases. |

### P3 — Low

| Role | Agent/Person | Responsibility |
|------|-------------|---------------|
| Next Available Engineer | Assigned next business day | Triage, fix, and close. No dedicated on-call required. |

---

## 4. Investigation Protocol

### Phase 1 — Triage (Minutes 0-15)

**Objective**: Assess severity accurately and assign ownership.

1. **Detect and classify**: Determine which systems are affected and which fintech flags apply.
2. **Assign severity**: Use the classification table in Section 2. Apply automatic elevation rules.
3. **Assign Incident Commander**: IC owns the incident from this point forward. All communication flows through IC.
4. **Open incident channel**: Create a dedicated communication channel (Slack channel, war room, or equivalent).
5. **Capture initial state**: Screenshot dashboards, copy error logs, note the exact time of first detection.

**Output**: Severity assigned, IC assigned, incident channel open, initial state captured.

### Phase 2 — Contain (Minutes 15-60)

**Objective**: Stop the bleeding. Prevent the incident from spreading.

1. **Feature flag off**: If the affected functionality has a feature flag, disable it immediately.
2. **Rollback assessment**: Determine if a deployment rollback is safe and sufficient (see Section 6).
3. **Execute rollback** if applicable: Revert to the last known-good deployment.
4. **Isolate affected systems**: If rollback is insufficient, isolate the affected service (circuit breaker, traffic diversion, DNS failover).
5. **Verify containment**: Confirm the incident is no longer spreading. Monitor error rates and affected metrics.

**Output**: Incident contained. Blast radius stabilized or shrinking.

### Phase 3 — Investigate (Minutes 60-240)

**Objective**: Identify the root cause with evidence.

1. **Log analysis**: Query centralized logs for the affected time window. Filter by affected services, error codes, and user IDs.
2. **Trace review**: Follow distributed traces for failed requests. Identify where in the call chain the failure occurs.
3. **State inspection**: Examine database state, cache state, queue depth, and external dependency health.
4. **Correlation analysis**: Correlate the incident start time with recent deployments, configuration changes, infrastructure events, and external dependency changes.
5. **Root cause hypothesis**: Form and test hypotheses. Prefer the simplest explanation that fits all evidence (Occam's Razor). Verify against data, not assumptions (Zero Trust).

**Output**: Root cause identified with supporting evidence. If root cause is uncertain, document the leading hypothesis and what additional data would confirm it.

### Phase 4 — Remediate (Variable duration)

**Objective**: Fix the root cause and deploy the fix safely.

1. **Develop fix**: Write the minimal change that addresses the root cause. No scope creep during incident remediation.
2. **Test fix**: Run the full test suite. Add a regression test that reproduces the incident scenario.
3. **Staged deploy**: Deploy to staging/canary first. Monitor for 15 minutes before proceeding to production.
4. **Production deploy**: Deploy to production with enhanced monitoring. Keep the rollback path ready.
5. **Remove containment**: Re-enable feature flags, restore traffic routing, remove circuit breakers.

**Output**: Fix deployed to production. Containment measures removed.

### Phase 5 — Verify (Hours 1-24 post-fix)

**Objective**: Confirm the fix holds and no recurrence occurs.

1. **Monitor key metrics**: Watch error rates, latency, and affected business metrics for 24 hours post-fix.
2. **Verify data integrity**: For fintech incidents, run full reconciliation checks (see Section 8).
3. **User validation**: If users were affected, confirm their experience has returned to normal.
4. **Close incident**: When monitoring confirms stability, formally close the incident and schedule the post-mortem.

**Output**: Incident closed. Post-mortem scheduled within 48 hours (P0/P1) or 1 week (P2/P3).

---

## 5. Communication Cadence

| Severity | Internal Updates | Stakeholder Updates | Customer Communication |
|----------|-----------------|--------------------|-----------------------|
| **P0** | Every **15 minutes** until contained, then every 30 minutes | Every **30 minutes** to leadership | Status page updated within 15 minutes of detection |
| **P1** | Every **30 minutes** until contained, then every hour | Every **hour** to affected team leads | Status page updated if customer-facing impact |
| **P2** | Every **2 hours** until resolved | Daily summary if multi-day | No external communication unless SLA breached |
| **P3** | **Daily** in standup or async channel | None unless escalated | None |

### Communication Template (Internal Update)

~~~~
INCIDENT UPDATE — [SEVERITY] — [INCIDENT-ID]
Time: [ISO 8601 timestamp]
Status: [Triaging | Contained | Investigating | Remediating | Monitoring | Resolved]
IC: [Name/Role]

Current State:
- [1-2 sentences on what is happening right now]

Actions Taken Since Last Update:
- [Bulleted list of actions]

Next Steps:
- [Bulleted list of planned actions]

ETA to Resolution: [Estimate or "Unknown — investigating"]
~~~~

---

## 6. Rollback Procedures

### 6.1 Money Movement

**Fintech flag**: `[money]`

| Step | Action | Verification |
|------|--------|-------------|
| 1 | **Freeze transactions**: Halt all in-flight and queued money movement operations | Confirm no new transactions are being initiated or processed |
| 2 | **Reconcile ledger**: Run full ledger reconciliation against external payment provider records | Reconciliation report shows zero unexplained discrepancies |
| 3 | **Compensating transactions**: For any incorrect transactions that completed, issue compensating entries (reversals, corrections) | Each compensating transaction has an audit trail entry linking to the original |
| 4 | **Notify regulators**: If financial loss exceeds reporting threshold, initiate regulatory notification within required timeframe | Notification logged with timestamp, recipient, and content |
| 5 | **Unfreeze**: Resume money movement only after reconciliation confirms integrity | Post-unfreeze monitoring for 1 hour with zero anomalies |

### 6.2 Auth

**Fintech flag**: `[auth]`

| Step | Action | Verification |
|------|--------|-------------|
| 1 | **Force session invalidation**: Invalidate all active sessions system-wide | Session store is empty. All users must re-authenticate |
| 2 | **Rotate secrets**: Rotate all affected secrets — JWT signing keys, API keys, OAuth client secrets | New secrets deployed and old secrets revoked in all environments |
| 3 | **Verify access control**: Audit the access control layer to confirm no unauthorized permissions persist | Permission audit shows expected state for all roles |
| 4 | **Access log review**: Review access logs for the incident window to identify any unauthorized access | Report of all access events during the window, flagged anomalies investigated |
| 5 | **User notification**: If user accounts were potentially compromised, notify affected users with next steps | Notification sent with forced password reset if warranted |

### 6.3 Ledger

**Fintech flag**: `[ledger]`

| Step | Action | Verification |
|------|--------|-------------|
| 1 | **Point-in-time recovery**: Restore ledger to the last known-good state using database point-in-time recovery | Restored state matches the pre-incident snapshot |
| 2 | **Reconciliation check**: Run full double-entry reconciliation (debits = credits for every account) | Zero balance discrepancies across all accounts |
| 3 | **Gap analysis**: Identify any transactions that occurred between the last-known-good state and the incident detection | Gap report with each transaction classified as valid, invalid, or uncertain |
| 4 | **Replay valid transactions**: Re-apply valid transactions from the gap window in order | Ledger state matches expected state after replay |
| 5 | **Audit trail verification**: Confirm the audit trail is complete and unbroken for the entire incident window | Audit trail has no gaps, and every entry has a valid timestamp and actor |

### 6.4 Migration

**Fintech flag**: `[migration]`

| Step | Action | Verification |
|------|--------|-------------|
| 1 | **Execute down() migration**: Run the reverse migration to undo schema changes | Schema matches the pre-migration state |
| 2 | **Restore from backup**: If down() migration is insufficient or risky, restore the database from the pre-migration backup | Restored database passes integrity checks |
| 3 | **Data verification**: Confirm no data was lost or corrupted during the rollback | Row counts, checksums, and sample data match pre-migration state |
| 4 | **Application compatibility**: Verify the application version running is compatible with the rolled-back schema | Application starts cleanly and passes health checks |
| 5 | **Root cause before retry**: Do not re-attempt the migration until the root cause of the failure is identified, fixed, and tested | Migration tested in staging with production-equivalent data volume |

---

## 7. Post-Mortem Template

Post-mortems are **mandatory** for P0 and P1 incidents. **Recommended** for P2. Not required for P3.

**Scheduling**: Within 48 hours of incident closure (P0/P1) or 1 week (P2).

**Format**: Blameless. Focus on systems, processes, and tooling — not individuals.

~~~~markdown
# Post-Mortem: [Incident Title]

**Incident ID**: [ID]
**Severity**: [P0/P1/P2]
**Date**: [YYYY-MM-DD]
**Duration**: [Detection to resolution]
**Incident Commander**: [Name/Role]
**Author**: [Name/Role]

---

## Timeline

| Time (UTC) | Event |
|-----------|-------|
| HH:MM | [First detection signal] |
| HH:MM | [IC assigned] |
| HH:MM | [Containment action taken] |
| HH:MM | [Root cause identified] |
| HH:MM | [Fix deployed] |
| HH:MM | [Incident resolved] |

---

## Impact Assessment

- **Users affected**: [Count or percentage]
- **Duration of impact**: [Time]
- **Financial impact**: [Amount or "None"]
- **Data integrity impact**: [Description or "None"]
- **Regulatory impact**: [Description or "None"]
- **Reputational impact**: [Assessment]

---

## Root Cause Analysis

### 5 Whys

1. **Why** did [symptom] occur? Because [cause 1].
2. **Why** did [cause 1] occur? Because [cause 2].
3. **Why** did [cause 2] occur? Because [cause 3].
4. **Why** did [cause 3] occur? Because [cause 4].
5. **Why** did [cause 4] occur? Because [root cause].

### Fault Tree

[Mermaid diagram or structured breakdown of contributing factors]

### Root Cause Statement

[One paragraph: the root cause, why it was not caught earlier,
and what systemic gap it reveals.]

---

## Action Items

| ID | Action | Owner | Deadline | Priority | Status |
|----|--------|-------|----------|----------|--------|
| 1 | [Action description] | [Owner] | [YYYY-MM-DD] | [P0/P1/P2] | [Open/In Progress/Done] |

---

## Recurrence Prevention

- **Detection**: [What monitoring or alerting will catch this earlier?]
- **Prevention**: [What code, process, or infrastructure change prevents this from happening?]
- **Testing**: [What test covers this scenario going forward?]

---

## Lessons Learned

- [What went well during the response]
- [What could be improved in the response process]
- [What surprised the team]
~~~~

---

## 8. Fintech-Specific Protocols

### 8.1 Money Movement Incident Protocol

**Trigger**: Any incident where `[money]` flag applies — transaction failures, incorrect amounts, unauthorized transfers, payment provider outages.

**Protocol**:

1. **Immediate freeze**: Halt all money movement operations within 5 minutes of detection. This is non-negotiable. A frozen system loses revenue; a broken system loses trust and triggers regulatory action.
2. **Scope assessment**: Determine the window of affected transactions (first affected transaction to freeze time).
3. **Full reconciliation**: Reconcile internal ledger against every external payment provider for the affected window. Every cent must be accounted for.
4. **Compensating transactions**: For each incorrect transaction, issue a compensating entry. Compensating entries must reference the original transaction ID and carry a `reason: incident-[ID]` annotation.
5. **Regulatory notification**: If cumulative financial impact exceeds the reporting threshold (jurisdiction-dependent), notify the relevant regulatory body within the required timeframe. Log the notification.
6. **User communication**: Notify affected users with: what happened (without exposing internal details), what was done to fix it, and what they need to do (if anything).
7. **Unfreeze with monitoring**: Resume operations only after reconciliation confirms zero discrepancies. Monitor for 1 hour post-unfreeze with alerting thresholds set to 50% of normal.

### 8.2 Ledger Integrity Verification

**Trigger**: Any incident where `[ledger]` flag applies — balance inconsistencies, missing entries, duplicate entries, audit trail gaps.

**Protocol**:

1. **Full reconciliation**: Verify double-entry integrity: total debits equal total credits for every account. No exceptions.
2. **Gap detection**: Scan the transaction log for gaps in sequence numbers, timestamps, or reference IDs. Gaps indicate lost or skipped entries.
3. **Cross-reference audit trail**: Every ledger entry must have a corresponding audit trail entry. Every audit trail entry must reference a valid ledger entry. Orphans in either direction are anomalies.
4. **Balance recalculation**: Recalculate every account balance from the full transaction history. Compare recalculated balances against stored balances. Any discrepancy is a finding.
5. **External reconciliation**: If the ledger tracks external balances (bank accounts, payment providers), reconcile against external statements for the affected period.
6. **Integrity report**: Produce a signed integrity report documenting: scope, method, findings, discrepancies, and remediation actions. This report is a regulatory artifact.

### 8.3 Auth Compromise Procedures

**Trigger**: Any incident where `[auth]` flag applies — unauthorized access, session hijacking, credential stuffing, privilege escalation, token theft.

**Protocol**:

1. **Session wipe**: Invalidate all active sessions immediately. Every user must re-authenticate. The cost of inconvenience is lower than the cost of continued unauthorized access.
2. **Credential rotation**: Rotate all system credentials — JWT signing keys, API keys, service account passwords, OAuth secrets. Deploy new credentials to all services before revoking old ones (zero-downtime rotation).
3. **Access log review**: Pull complete access logs for the incident window. Flag: unusual IP addresses, unusual access patterns, privilege escalations, access to sensitive resources, and any access from the compromised vector.
4. **Scope determination**: Determine exactly which accounts, resources, and data the attacker accessed. This determines the notification obligation.
5. **User notification**: Notify affected users within the required timeframe. Include: what happened, what data was potentially exposed, what actions the user should take (password reset, MFA review), and a contact point for questions.
6. **Forced password reset**: If credential compromise is confirmed or suspected, force password resets for all affected accounts. Do not make this optional.
7. **MFA audit**: Verify MFA configuration for all affected accounts. If MFA was bypassed, investigate the bypass mechanism and close it.
