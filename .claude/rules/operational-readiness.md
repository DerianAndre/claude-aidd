# Operational Readiness Checklist — Pre-Deployment Gate

> Pre-deployment verification for features touching high-risk surfaces: money movement, auth, ledger, migration, PII.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Table of Contents

1. [Overview](#1-overview)
2. [Universal Checklist](#2-universal-checklist)
3. [Risk-Surface Checklists](#3-risk-surface-checklists)
4. [Rollback Procedures](#4-rollback-procedures)
5. [Quality Gates](#5-quality-gates)

---

## 1. Overview

Operational readiness is the final gate before production deployment. Features that touch money, auth, ledger, migration, or PII surfaces MUST complete the relevant checklists below. This rule is consumed by ETH Phase H.3 and the platform-engineer agent.

**Activation**: Any feature with fintech flags `[money | auth | PII | migration | ledger]` in its plan.

---

## 2. Universal Checklist

Every production deployment MUST verify:

- [ ] **Monitoring**: New endpoints/services have dashboards with RED metrics (Rate, Errors, Duration)
- [ ] **Alerts**: Error rate thresholds configured for new surfaces (page on > 1% 5xx, ticket on > 0.1%)
- [ ] **Logging**: Structured JSON logs with correlation IDs; no PII in log output (grep verified)
- [ ] **Health checks**: Liveness and readiness probes updated if new dependencies added
- [ ] **Rollback procedure**: Documented, tested in staging, single-command executable
- [ ] **Feature flags**: Gradual rollout configured (if applicable — not required for all features)
- [ ] **Documentation**: Runbook updated with new failure modes and recovery steps
- [ ] **Dependencies**: All new external dependencies have health checks and circuit breakers
- [ ] **SLO/SLI**: Defined for new user-facing surfaces (availability, latency percentiles)

---

## 3. Risk-Surface Checklists

### Money Movement (`[money]` flag)

- [ ] Transaction boundaries verified — no partial state possible
- [ ] Idempotency keys on all payment/transfer endpoints
- [ ] BigInt precision verified — no Number() on monetary values
- [ ] Reconciliation job configured (periodic debit == credit check)
- [ ] Alerts on balance discrepancies (immediate page, not ticket)
- [ ] Rate limiting on money movement endpoints
- [ ] Compensating transaction logic tested for gateway failures
- [ ] Double-spend prevention verified under concurrency

### Authentication (`[auth]` flag)

- [ ] Fail-closed pattern verified — unauthorized access returns 401/403, not 200
- [ ] Session invalidation tested (logout, password change, account disable)
- [ ] Rate limiting on authentication endpoints (5 attempts / 15 min)
- [ ] Brute-force detection configured
- [ ] Token rotation working (refresh token flow tested)
- [ ] Auth bypass regression tests in place
- [ ] CORS restricted to specific origins (no wildcard)

### PII (`[PII]` flag)

- [ ] Encryption at rest for PII fields (AES-256-GCM minimum)
- [ ] Encryption in transit (TLS 1.3)
- [ ] PII masked in all log output — grep verified across all log statements
- [ ] PII not present in error messages or stack traces
- [ ] Data retention policy implemented (auto-delete after retention period)
- [ ] Access audit trail for PII reads

### Migration (`[migration]` flag)

- [ ] Migration has both `up()` and `down()` methods
- [ ] Rollback tested in staging — verify `down()` restores previous state
- [ ] Database backup taken before migration (verified, not assumed)
- [ ] Migration is backward-compatible (old code can run against new schema)
- [ ] No destructive column drops without data preservation
- [ ] Migration tested against production-scale data (timing verified)
- [ ] Staged rollout: apply to replica first, verify, then primary

### Ledger (`[ledger]` flag)

- [ ] Debit/credit balance invariant verified (reconciliation test passes)
- [ ] Immutable records — UPDATE/DELETE on ledger entries blocked at DB level
- [ ] Timestamps use UTC with timezone (TIMESTAMP WITH TIME ZONE)
- [ ] Audit trail complete — every entry has actor, timestamp, previous state
- [ ] Sequence gaps detected and alerted (no missing entry IDs)
- [ ] Ledger entries have idempotency keys to prevent duplicates

---

## 4. Rollback Procedures

Every deployment must have a tested rollback plan:

### Application Rollback
1. Revert to previous container image / deployment artifact
2. Verify health checks pass on rolled-back version
3. Verify database schema compatibility (old code + new schema OR old code + old schema)
4. Run smoke tests against rolled-back version

### Database Rollback
1. Execute `down()` migration
2. Verify schema matches expected previous state
3. Verify application health on previous schema
4. If `down()` is destructive → restore from backup instead

### Rollback Triggers
- Health check failure for > 2 consecutive checks
- Error rate > 5% for > 5 minutes
- P99 latency > 3x baseline for > 10 minutes
- Any data integrity alert (balance discrepancy, missing ledger entries)
- Manual trigger by on-call engineer

---

## 5. Quality Gates

- [ ] Universal checklist complete
- [ ] All applicable risk-surface checklists complete (based on fintech flags in plan)
- [ ] Rollback procedure documented AND tested in staging
- [ ] Rollback triggers defined with thresholds
- [ ] No PII in any log statement (grep verified)
- [ ] SLO/SLI defined for new surfaces
- [ ] On-call team briefed on new failure modes

---

## Cross-References

- [rules/security.md](security.md) — OWASP compliance, encryption standards
- [rules/fintech-testing.md](fintech-testing.md) — Test patterns for each fintech flag
- [rules/performance.md](performance.md) — Baseline metrics, profiling
- [workflows/incident-response.md](../workflows/incident-response.md) — Response protocol if deployment goes wrong
- [skills/eth/SKILL.md](../skills/eth/SKILL.md) — Phase H.3 post-approval actions
- [CLAUDE.md](../CLAUDE.md) — Safety requirements, human review gates

**Version:** 1.0.0
**Last Updated:** 2026-03-10
**Applies To:** All production deployments, mandatory for fintech-flagged features
