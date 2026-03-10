---
paths:
  - "apps/api/**"
  - "packages/core/**"
  - "packages/adapters-db-*/**"
---

# Backend Development Rules

> **Activation:** Projects containing `nest`, `express`, `fastify`, `.prisma`, `.sql`, or backend-related patterns

---

## Architecture: Hexagonal (Ports & Adapters)

### Mandatory Layer Separation

```
src/
├── domain/           ← Business Logic (PURE, no dependencies)
│   ├── entities/
│   ├── value-objects/
│   └── repositories/  (interfaces only)
├── application/      ← Use Cases / Services
│   └── use-cases/
├── infrastructure/   ← External Adapters (DB, HTTP, Queue)
│   ├── persistence/
│   ├── http/
│   └── messaging/
└── presentation/     ← Controllers / GraphQL Resolvers
```

### Rules:

1. **Domain NEVER imports from infrastructure or presentation**
2. **Dependencies point inward** (Presentation → Application → Domain)
3. **Use Dependency Injection** for all cross-layer communication

---

## Database Best Practices

### ORM Usage (Prisma/TypeORM)

- ✅ **DO:** Use migrations for schema changes
- ✅ **DO:** Define indexes explicitly in schema
- ❌ **DON'T:** Use `synchronize: true` in production
- ❌ **DON'T:** Execute raw SQL without prepared statements

### Query Optimization

```typescript
// ❌ N+1 Query Problem
for (const user of users) {
  const posts = await db.post.findMany({ where: { userId: user.id } });
}

// ✅ Batch with JOIN or IN clause
const posts = await db.post.findMany({
  where: { userId: { in: users.map((u) => u.id) } },
  include: { user: true },
});
```

### Transactions

- **ACID Compliance:** Always use transactions for multi-table writes
- **Isolation Levels:** Explicitly set when dealing with concurrent updates

```typescript
await db.$transaction(async (tx) => {
  await tx.account.update({
    where: { id: fromId },
    data: { balance: { decrement: amount } },
  });
  await tx.account.update({
    where: { id: toId },
    data: { balance: { increment: amount } },
  });
});
```

---

## Security Standards

### Authentication & Authorization

- **JWT:** Store in HttpOnly cookies, not localStorage (XSS protection)
- **Password Hashing:** Use bcrypt (cost factor ≥ 12) or Argon2id
- **API Keys:** Rotate every 90 days, store hashed in DB

### Input Validation

```typescript
// ✅ Use Zod schemas for DTO validation
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(2).max(50),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

### SQL Injection Prevention

- ❌ **NEVER:** String concatenation in queries

```typescript
// ❌ VULNERABLE
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SAFE (Prepared Statement)
db.query("SELECT * FROM users WHERE email = ?", [email]);
```

---

## API Design (REST)

### Naming Conventions

- **Resources:** Plural nouns (`/users`, `/orders`)
- **Actions:** HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- **Nesting:** Max 2 levels (`/users/:id/orders`, not `/users/:id/orders/:id/items`)

### Status Codes (Required)

| Code | Meaning               | When to Use                                     |
| ---- | --------------------- | ----------------------------------------------- |
| 200  | OK                    | Successful GET/PUT/PATCH                        |
| 201  | Created               | Successful POST                                 |
| 204  | No Content            | Successful DELETE                               |
| 400  | Bad Request           | Validation failure                              |
| 401  | Unauthorized          | Missing/invalid token                           |
| 403  | Forbidden             | Valid token, insufficient permissions           |
| 404  | Not Found             | Resource doesn't exist                          |
| 409  | Conflict              | Duplicate resource (e.g., email already exists) |
| 500  | Internal Server Error | Unhandled exception                             |

### Versioning

- **Strategy:** URL path versioning (`/api/v1/users`)
- **Deprecation:** Maintain old versions for ≥6 months with warnings

---

## Performance

### Caching Strategy

```typescript
// Redis Example
const cacheKey = `user:${userId}:profile`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await db.user.findUnique({ where: { id: userId } });
await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1hr TTL
return data;
```

### Pagination

- **ALWAYS paginate** lists (default: 20 items, max: 100)

```typescript
interface PaginationQuery {
  page?: number; // Default: 1
  limit?: number; // Default: 20, max: 100
  sortBy?: string;
  order?: "asc" | "desc";
}
```

---

## Testing Requirements

### Coverage Targets

- **Domain Logic:** 100% (no exceptions)
- **Application Services:** ≥90%
- **Controllers:** ≥70% (focus on validation logic)
- **Infrastructure:** ≥60% (mock external dependencies)

### Test Structure (AAA Pattern)

```typescript
describe("UserService.createUser", () => {
  it("should hash password before saving", async () => {
    // Arrange
    const dto = { email: "test@example.com", password: "plain123" };
    const mockRepo = { save: vi.fn() };

    // Act
    await service.createUser(dto);

    // Assert
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: expect.not.stringContaining("plain123"),
      })
    );
  });
});
```

---

## Dependency Management

### Allowed ORMs

- ✅ Prisma (preferred for TypeScript projects)
- ✅ TypeORM (for complex inheritance patterns)
- ⚠️ Sequelize (legacy only, do not use for new projects)

### Validation Libraries

- ✅ `zod` (schema-first validation, type inference via `z.infer<>`)
- ❌ `class-validator` + `class-transformer` (legacy — migrating to Zod)
- ❌ `joi` (avoid in TypeScript; weak type inference)

---

## Error Handling

### Custom Exception Hierarchy

```typescript
// Base
export class DomainException extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

// Specific
export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User ${userId} not found`, "USER_NOT_FOUND");
  }
}
```

### Global Exception Filter (NestJS)

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof DomainException) {
      return response.status(400).json({
        error: exception.code,
        message: exception.message,
      });
    }

    // Log but don't expose internal errors
    logger.error(exception);
    return response.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
```

---

**Enforcement:** These rules are checked by `/review` and `/audit` workflows.

---

## Template: Backend Development

> Absorbed from `templates/backend.md`

### Domain-Driven Service Engineering Process

Follow this sequence when building backend services: **Domain -> Schemas -> Adapters -> Wiring**.

**Step 1 -- Domain Model**

- Identify entities, value objects, aggregates
- Define aggregate boundaries (consistency boundaries)
- Map domain events (what happened, not what to do)
- Define domain exceptions (business rule violations)

**Step 2 -- Ports (Interfaces)**

Define what the domain NEEDS (not how):

- Repository ports: `save`, `findById`, `findAll`, `delete`
- Service ports: external integrations (LLM, email, payment)
- Event ports: `publish`, `subscribe`

**Step 3 -- Schemas (Anti-Corruption Layer)**

Zod schemas at EVERY serialization boundary:

- API request/response validation
- Storage serialization/deserialization
- Import/export format validation

**Step 4 -- Domain Services**

- Pure business logic, ZERO framework dependencies
- Only depends on: TypeScript, Zod, domain utilities
- Operations return new instances (immutable)
- Factory methods: `Entity.create()` not `new Entity()`

**Step 5 -- Adapters**

- Implement port interfaces
- Framework-specific code lives HERE (and only here)
- Repository adapters: database queries, ORM calls
- Client adapters: HTTP calls, SDK usage

**Step 6 -- Wiring (Composition Root)**

- Connect adapters to ports
- Dependency injection at application entry point
- Configuration loading and validation

**Step 7 -- Controllers/Handlers**

- Thin layer: validate input -> call domain -> format output
- Error mapping: domain exceptions -> HTTP status codes
- Request validation via Zod schemas

### Architecture Dependency Flow

```
Domain (pure)      -> ZERO framework dependencies
Ports (interfaces) -> Defined in domain/ports/
Adapters (impl)    -> Framework-specific, in infrastructure/
Dependencies       -> Flow INWARD only
```

### Exception Layer Hierarchy

| Layer | Class | Purpose |
|-------|-------|---------|
| Domain | `DomainException` | Business rule violations |
| Application | `ApplicationException` | Use case failures |
| Infrastructure | `InfrastructureException` | Technical failures (DB down, API timeout) |

### Backend Quality Gates

- [ ] Domain has zero framework imports
- [ ] All ports have adapter implementations
- [ ] Zod schemas at every boundary
- [ ] No `SELECT *` in production queries
- [ ] No raw SQL without parameterization
- [ ] Error responses follow RFC 7807
- [ ] Dependencies flow inward only

---

## Template: Database Engineering

> Absorbed from `templates/database.md`

### Schema-Driven Data Design Process

Follow this sequence: **ERD -> Schema -> Queries -> Verify**.

**Step 1 -- ERD Design**

- Entities with attributes and types
- Relationships: 1:1, 1:N, N:M (with junction tables)
- Cardinality and optionality
- Identify natural vs surrogate keys

**Step 2 -- Schema/Migration**

- Reversible migrations ALWAYS
- Column types: use most restrictive appropriate type
- NOT NULL by default, nullable only when justified
- Default values for new columns on existing tables
- Constraints: CHECK, UNIQUE, FK with ON DELETE strategy

**Step 3 -- Index Strategy**

- Query-driven indexing (not speculative)
- Foreign keys: always indexed
- Frequent WHERE clauses: indexed
- Composite indexes: most selective column first
- Partial indexes for filtered queries
- EXPLAIN ANALYZE to verify index usage

**Step 4 -- Query Patterns**

- Parameterized ALWAYS (never string concatenation)
- No `SELECT *` (specify columns explicitly)
- N+1 prevention: eager loading, joins, or batch queries
- Pagination: cursor-based (preferred) or offset-based
- Transactions for multi-table operations

**Step 5 -- Verification**

- EXPLAIN ANALYZE on critical queries
- Check index coverage
- Verify N+1 elimination
- Load test with representative data volume

### ORM-Specific Standards

| ORM | Key Practices |
|-----|---------------|
| **Prisma** | Schema as SSOT, `prisma migrate dev`, type-safe queries, `include`/`select` for eager loading, `createMany`/`updateMany` for batch |
| **Drizzle** | Schema in TypeScript, query builder pattern, type inference from schema, prepared statements for frequent queries |
| **TypeORM** | Decorators for entity definition, Repository pattern, QueryBuilder for complex queries, migration generation |
| **Raw SQL** | Always parameterized (`$1`/`$2` or `?`), stored procedures for complex logic, views for commonly-joined queries |

### Database Anti-Patterns

- `SELECT *` in production
- N+1 queries (1 query per related record)
- Non-reversible migrations
- Business logic in SQL queries
- Missing indexes on foreign keys
- Storing computed values that can be derived
- VARCHAR without length limit
- No default values on new columns for existing tables

### Database Quality Gates

- [ ] All migrations reversible
- [ ] No `SELECT *`
- [ ] Indexes on all FKs and frequent WHERE columns
- [ ] N+1 queries eliminated
- [ ] Data integrity in schema (not just app code)
- [ ] EXPLAIN ANALYZE on critical queries
- [ ] Parameterized queries (no string concatenation)

**See also:** [skills/clean-ddd-hexagonal](../skills/clean-ddd-hexagonal/SKILL.md) (generation-time DDD + Hexagonal guidance with tactical patterns, decision trees, and reference docs)

**Last Updated:** 2026-03-10
