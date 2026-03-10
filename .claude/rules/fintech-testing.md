# Fintech Testing Patterns — Domain-Specific Validation

> Testing patterns for financial operations: ledger integrity, payment idempotency, race conditions, audit trails, and precision boundaries.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Table of Contents

1. [Overview](#1-overview)
2. [Ledger Reconciliation](#2-ledger-reconciliation)
3. [Idempotency Testing](#3-idempotency-testing)
4. [Race Condition Testing](#4-race-condition-testing)
5. [Audit Trail Verification](#5-audit-trail-verification)
6. [BigInt Precision Boundaries](#6-bigint-precision-boundaries)
7. [Transaction Isolation](#7-transaction-isolation)
8. [Double-Spend Prevention](#8-double-spend-prevention)
9. [Compensating Transactions](#9-compensating-transactions)
10. [Quality Gates](#10-quality-gates)

---

## 1. Overview

Financial code has zero tolerance for data corruption, lost transactions, or incorrect balances. Standard unit testing is insufficient — fintech testing requires invariant-based testing, concurrency testing, and boundary analysis specific to monetary operations.

**Fintech flag mapping to test patterns:**

| Flag       | Required Test Patterns                                                    |
| ---------- | ------------------------------------------------------------------------- |
| `money`    | BigInt precision, idempotency, double-spend prevention, reconciliation    |
| `auth`     | Fail-closed verification, guard bypass testing, session integrity         |
| `PII`      | Encryption verification, log scanning, masking validation                 |
| `migration`| Reversibility testing, data preservation, rollback verification           |
| `ledger`   | Debit/credit invariant, immutability, timestamp ordering, reconciliation  |

---

## 2. Ledger Reconciliation

**Invariant**: Total debits MUST equal total credits across all accounts at all times.

```typescript
describe('ledger reconciliation', () => {
  it('should maintain debit/credit balance after transfer', async () => {
    // Arrange
    const sourceAccount = await createAccount({ balance: 1000n });
    const targetAccount = await createAccount({ balance: 0n });

    // Act
    await transferService.execute({
      from: sourceAccount.id,
      to: targetAccount.id,
      amount: 250n,
    });

    // Assert — reconciliation invariant
    const allEntries = await ledgerRepository.findAll();
    const totalDebits = allEntries
      .filter(e => e.type === 'DEBIT')
      .reduce((sum, e) => sum + e.amount, 0n);
    const totalCredits = allEntries
      .filter(e => e.type === 'CREDIT')
      .reduce((sum, e) => sum + e.amount, 0n);

    expect(totalDebits).toBe(totalCredits);
  });

  it('should maintain balance after failed transfer', async () => {
    // Arrange
    const sourceAccount = await createAccount({ balance: 100n });
    const targetAccount = await createAccount({ balance: 0n });

    // Act — transfer exceeding balance
    await expect(
      transferService.execute({
        from: sourceAccount.id,
        to: targetAccount.id,
        amount: 200n,
      })
    ).rejects.toThrow(InsufficientFundsError);

    // Assert — no partial entries
    const entries = await ledgerRepository.findByAccountId(sourceAccount.id);
    expect(entries).toHaveLength(0);
  });
});
```

**Test requirements:**
- Verify balance after successful operations
- Verify NO partial entries after failed operations (atomicity)
- Verify reconciliation across all accounts, not just involved parties
- Run reconciliation check after EVERY test that touches monetary values

---

## 3. Idempotency Testing

**Invariant**: Repeating the same operation with the same idempotency key MUST produce the same result without side effects.

```typescript
describe('payment idempotency', () => {
  it('should process payment exactly once with same idempotency key', async () => {
    const idempotencyKey = 'pay_abc123';
    const request = {
      from: accountId,
      to: merchantId,
      amount: 500n,
      idempotencyKey,
    };

    // Act — submit twice
    const result1 = await paymentService.process(request);
    const result2 = await paymentService.process(request);

    // Assert — same result, single debit
    expect(result1.transactionId).toBe(result2.transactionId);
    const entries = await ledgerRepository.findByIdempotencyKey(idempotencyKey);
    expect(entries).toHaveLength(2); // one debit, one credit — not four
  });

  it('should reject different amounts with same idempotency key', async () => {
    const idempotencyKey = 'pay_abc123';
    await paymentService.process({
      from: accountId,
      to: merchantId,
      amount: 500n,
      idempotencyKey,
    });

    await expect(
      paymentService.process({
        from: accountId,
        to: merchantId,
        amount: 600n, // different amount
        idempotencyKey,
      })
    ).rejects.toThrow(IdempotencyConflictError);
  });
});
```

---

## 4. Race Condition Testing

**Invariant**: Concurrent operations on the same account MUST NOT produce incorrect balances.

```typescript
describe('concurrent balance updates', () => {
  it('should handle concurrent withdrawals without overdraft', async () => {
    // Arrange
    const account = await createAccount({ balance: 100n });

    // Act — two concurrent withdrawals of 80 each
    const results = await Promise.allSettled([
      withdrawService.execute({ accountId: account.id, amount: 80n }),
      withdrawService.execute({ accountId: account.id, amount: 80n }),
    ]);

    // Assert — exactly one succeeds, one fails
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    // Assert — final balance is correct
    const finalBalance = await accountRepository.getBalance(account.id);
    expect(finalBalance).toBe(20n);
  });
});
```

**Test patterns:**
- Concurrent withdrawals exceeding balance
- Concurrent deposits (should all succeed)
- Mixed concurrent reads and writes
- Verify pessimistic locking or optimistic concurrency control

---

## 5. Audit Trail Verification

**Invariant**: Every state change MUST have a corresponding audit entry with actor, timestamp, and previous state.

```typescript
describe('audit trail', () => {
  it('should record audit entry for every balance change', async () => {
    const account = await createAccount({ balance: 1000n });

    await transferService.execute({
      from: account.id,
      to: targetId,
      amount: 250n,
      actorId: 'user_123',
    });

    const auditEntries = await auditRepository.findByEntity(account.id);
    expect(auditEntries).toContainEqual(
      expect.objectContaining({
        entityId: account.id,
        action: 'DEBIT',
        previousBalance: 1000n,
        newBalance: 750n,
        actorId: 'user_123',
        timestamp: expect.any(Date),
      })
    );
  });

  it('should have immutable audit entries', async () => {
    const entry = await auditRepository.findById(entryId);

    await expect(
      auditRepository.update(entryId, { amount: 0n })
    ).rejects.toThrow(ImmutableRecordError);
  });
});
```

---

## 6. BigInt Precision Boundaries

**Invariant**: Monetary values MUST use BigInt. No `Number()`, `parseFloat()`, or `parseInt()` on monetary values.

```typescript
describe('BigInt precision', () => {
  it('should handle amounts exceeding Number.MAX_SAFE_INTEGER', () => {
    const largeAmount = 9_007_199_254_740_993n; // > Number.MAX_SAFE_INTEGER

    const result = MonetaryAmount.create(largeAmount, 'USD');

    expect(result.value).toBe(largeAmount);
    expect(result.value).not.toBe(Number(largeAmount)); // Number loses precision
  });

  it('should perform arithmetic without precision loss', () => {
    const a = MonetaryAmount.create(1n, 'USD'); // 0.01 cents in smallest unit
    const b = MonetaryAmount.create(2n, 'USD');

    const sum = a.add(b);
    expect(sum.value).toBe(3n); // exact, no floating point drift
  });

  it('should reject Number type in monetary context', () => {
    expect(() => MonetaryAmount.create(100 as unknown as bigint, 'USD'))
      .toThrow(TypeError);
  });
});
```

**Static analysis check:**
```bash
# Grep for Number() usage on monetary fields — should return zero matches
grep -rn "Number(.*balance\|Number(.*amount\|Number(.*price\|parseFloat(.*balance\|parseFloat(.*amount" src/
```

---

## 7. Transaction Isolation

**Invariant**: Operations within a transaction boundary MUST be atomic — all succeed or all roll back.

```typescript
describe('transaction isolation', () => {
  it('should roll back all changes on partial failure', async () => {
    const sourceBalance = await getBalance(sourceId);
    const targetBalance = await getBalance(targetId);

    // Act — force failure mid-transaction (e.g., target account frozen)
    await freezeAccount(targetId);

    await expect(
      transferService.execute({
        from: sourceId,
        to: targetId,
        amount: 100n,
      })
    ).rejects.toThrow(AccountFrozenError);

    // Assert — no partial state
    expect(await getBalance(sourceId)).toBe(sourceBalance);
    expect(await getBalance(targetId)).toBe(targetBalance);
  });
});
```

---

## 8. Double-Spend Prevention

**Invariant**: The same funds MUST NOT be spent twice, even under concurrent requests.

```typescript
describe('double-spend prevention', () => {
  it('should prevent spending the same balance twice', async () => {
    const account = await createAccount({ balance: 100n });

    // Act — two payments totaling more than balance, submitted near-simultaneously
    const [pay1, pay2] = await Promise.allSettled([
      paymentService.process({
        from: account.id,
        to: merchant1,
        amount: 80n,
        idempotencyKey: 'key1',
      }),
      paymentService.process({
        from: account.id,
        to: merchant2,
        amount: 80n,
        idempotencyKey: 'key2',
      }),
    ]);

    // Assert — at most one succeeds
    const successCount = [pay1, pay2].filter(r => r.status === 'fulfilled').length;
    expect(successCount).toBeLessThanOrEqual(1);

    // Assert — balance never negative
    const finalBalance = await getBalance(account.id);
    expect(finalBalance).toBeGreaterThanOrEqual(0n);
  });
});
```

---

## 9. Compensating Transactions

**Invariant**: Failed multi-step operations MUST execute compensating actions to restore consistent state.

```typescript
describe('compensating transactions', () => {
  it('should reverse debit when external payment gateway fails', async () => {
    const initialBalance = await getBalance(accountId);

    // Act — payment gateway returns failure after debit
    mockPaymentGateway.mockRejectedValue(new GatewayTimeoutError());

    await expect(
      paymentService.processExternal({
        from: accountId,
        amount: 200n,
        gateway: 'stripe',
      })
    ).rejects.toThrow(GatewayTimeoutError);

    // Assert — compensating credit applied
    const finalBalance = await getBalance(accountId);
    expect(finalBalance).toBe(initialBalance);

    // Assert — compensation recorded in ledger
    const entries = await ledgerRepository.findByAccountId(accountId);
    const compensations = entries.filter(e => e.type === 'COMPENSATION');
    expect(compensations).toHaveLength(1);
  });
});
```

---

## 10. Quality Gates

- [ ] Every function touching monetary values uses BigInt exclusively
- [ ] Ledger reconciliation test exists (debit == credit invariant)
- [ ] Idempotency test exists for every payment/transfer operation
- [ ] Race condition test exists for concurrent balance updates
- [ ] Audit trail test verifies immutability and completeness
- [ ] Transaction atomicity test verifies rollback on partial failure
- [ ] Double-spend prevention test with concurrent requests
- [ ] Compensating transaction test for external failures
- [ ] Static analysis grep for `Number()` / `parseFloat()` on monetary fields returns zero
- [ ] All monetary test assertions use BigInt literals (e.g., `100n` not `100`)

---

## Cross-References

- [rules/security.md](security.md) — OWASP compliance, cryptographic standards
- [rules/testing.md](testing.md) — AAA pattern, coverage targets, complexity-driven testing
- [rules/backend.md](backend.md) — Transaction boundaries, domain purity
- [skills/eth/SKILL.md](../skills/eth/SKILL.md) — Fintech flag consumption in QE validation
- [CLAUDE.md](../CLAUDE.md) — Safety requirements, fintech flags SSOT

**Version:** 1.0.0
**Last Updated:** 2026-03-10
**Applies To:** All code touching money movement, ledgers, payments, or financial data
