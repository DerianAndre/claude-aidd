# Runbook: Incident Response — P0-P3 Playbook

> Pre-configured response playbook with team compositions, timelines, and fast-path actions per severity level.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## P0 — Production Down / Data Loss / Money Frozen

**Response time**: < 15 minutes
**Communication**: Every 15 minutes

### Team
- Incident Commander (lead)
- security-architect (if auth/data breach suspected)
- data-architect (if database/ledger involved)
- platform-engineer (if infrastructure/deployment)

### Fast-Path Actions
1. Page incident commander and all team members
2. Open dedicated communication channel
3. If money movement: FREEZE all affected transactions immediately
4. If auth: force-invalidate all active sessions
5. If data loss: stop writes to affected tables, verify backup integrity
6. Assess: is this containable with feature flag / rollback / traffic redirect?
7. If rollback viable: execute single-command rollback, verify health
8. If not: isolate affected component, begin root cause investigation
9. Post-resolution: post-mortem within 24 hours (mandatory)

---

## P1 — Degraded Service / Money-Auth-Ledger Impacted

**Response time**: < 30 minutes
**Communication**: Every 30 minutes

### Team
- Incident Commander (lead)
- Relevant specialist (based on affected surface)

### Fast-Path Actions
1. Alert incident commander
2. Assess scope: how many users affected? Which surfaces?
3. If feature-flaggable: disable affected feature
4. If rollback viable: execute, verify
5. Root cause investigation (parallel with containment)
6. Post-resolution: post-mortem within 48 hours

---

## P2 — Performance Degradation / Non-Critical Feature Down

**Response time**: < 2 hours
**Communication**: Every 2 hours

### Team
- On-call engineer (1-2 people)

### Fast-Path Actions
1. Alert on-call
2. Assess: is this auto-recoverable (auto-scaling, circuit breaker)?
3. If not: investigate, fix, deploy
4. Post-resolution: incident summary (no full post-mortem required)

---

## P3 — Cosmetic / Non-User-Facing / Low Impact

**Response time**: Next business day
**Communication**: Daily update

### Team
- Assigned engineer

### Fast-Path Actions
1. Create issue/ticket
2. Prioritize in next sprint
3. Fix and deploy normally

---

## Cross-References

- [workflows/incident-response.md](../incident-response.md) — Full incident response workflow
- [agents/incident-commander/incident-commander.md](../../agents/incident-commander/incident-commander.md) — Incident commander agent
- [rules/operational-readiness.md](../../rules/operational-readiness.md) — Pre-deployment gate
