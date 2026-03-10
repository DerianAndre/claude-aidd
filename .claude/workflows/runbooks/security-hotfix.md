# Runbook: Security Hotfix — Expedited Path for Security Vulnerabilities

> Fast-track workflow for security vulnerabilities that bypasses standard BAP planning phase. Security fixes ship fast with focused review.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## When to Use

- Critical or High severity security vulnerability identified
- OWASP Top 10 violation found in production code
- Secret exposure detected (hardcoded credentials, leaked tokens)
- Auth bypass or privilege escalation discovered
- Dependency with known CVE (HIGH/CRITICAL)

---

## Phase 1: Triage (< 15 minutes)

1. **Classify severity**: Critical (actively exploitable) or High (exploitable with effort)
2. **Assess blast radius**: what data/systems are at risk?
3. **Determine containment**: can we feature-flag, rate-limit, or block the attack vector without a code fix?
4. **Create hotfix branch**: `fix/security-<description>`

### Containment Actions (immediate, before fix)
- If secret exposed: rotate the secret immediately, revoke old credentials
- If auth bypass: add emergency guard middleware or feature flag
- If injection: add input validation at the edge (WAF rule or middleware)
- If dependency CVE: evaluate if the vulnerable code path is reachable

---

## Phase 2: Fix (< 2 hours for Critical)

### Team
- security-architect (review the fix)
- 1 builder (implement the fix)
- QE (validate the fix)

### Process
1. Builder implements the minimal fix (no refactoring, no feature work)
2. QE validates: typecheck + lint + targeted tests + security-specific verification
3. security-architect reviews: confirms vulnerability is eliminated, no new vectors introduced
4. If fintech-flagged: human review required before merge

### Security-Specific Verification
- [ ] The vulnerability is no longer exploitable (demonstrate with test case)
- [ ] No new attack vectors introduced by the fix
- [ ] Regression test added to prevent recurrence
- [ ] If secret rotation: old credentials are revoked, new ones are working

---

## Phase 3: Ship (< 30 minutes after fix approved)

1. **Merge to main/develop** via PR (expedited review, single approver sufficient)
2. **Deploy to production** (skip staging for Critical if containment is insufficient)
3. **Verify in production**: confirm fix is effective, no regressions
4. **Monitor**: watch error rates and security logs for 1 hour post-deploy
5. **Communicate**: notify affected parties if data exposure occurred

---

## Phase 4: Follow-up (< 48 hours)

1. **Post-mortem**: how did the vulnerability enter the codebase?
2. **Systemic fix**: add CI check, linter rule, or architectural change to prevent the class of vulnerability
3. **Audit**: check for similar vulnerabilities elsewhere in the codebase
4. **Update**: MEMORY.md with the vulnerability class and prevention pattern

---

## Escalation

| Scenario | Action |
|----------|--------|
| Fix is complex (> 2 hours) | Maintain containment, enter full BAP-ETH pipeline |
| Data breach confirmed | Activate incident response workflow, notify compliance |
| Fix requires breaking change | Deploy with backward-compatible shim, schedule migration |

---

## Cross-References

- [workflows/incident-response.md](../incident-response.md) — Full incident response (if breach)
- [rules/security.md](../../rules/security.md) — OWASP standards
- [agents/security-architect/security-architect.md](../../agents/security-architect/security-architect.md) — Security review
- [rules/git-workflow.md](../../rules/git-workflow.md) — Hotfix branch strategy
