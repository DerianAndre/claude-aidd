---
name: feature-branch
description: >-
  Git Flow checklist — branch naming, Conventional Commits,
  PR template, merge strategy.
triggers:
  - git flow
  - feature branch
  - branch checklist
  - merge strategy
  - PR template
argument-hint: "[feature name for branch]"
user-invocable: true
disable-model-invocation: true
model: sonnet
context: fork
allowed-tools: Read, Grep, Glob, Bash
---

# Workflow: Feature Branch

> Git Flow checklist for feature development. Branch, commit, PR, merge.

**Use when:**

- Creating a new feature or fix branch
- Structuring commits before a PR
- Preparing a pull request for review

For full commit and branch rules, see [rules/git-workflow.md](../rules/git-workflow.md) (always-active, loaded automatically).

---

## Branch Naming

```bash
git checkout -b feature/<kebab-case-name>   # new features
git checkout -b fix/<kebab-case-name>        # bug fixes
git checkout -b docs/<kebab-case-name>       # documentation
git checkout -b chore/<kebab-case-name>      # maintenance, deps
git checkout -b hotfix/<kebab-case-name>     # production hotfixes
git checkout -b release/<kebab-case-name>    # release preparation
```

Branch names MUST be descriptive: `feature/spei-transfer-webhook`, not `feature/new-thing`.

---

## Conventional Commits

Format: `type(scope): description`

Full type table and rules in [rules/git-workflow.md](../rules/git-workflow.md). Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`.

**Scopes** derive from the monorepo structure — use the app or package name as scope:

- **Apps**: `api`, `web`, `mobile`
- **Packages**: `core`, `ui`, `config`, `i18n`, `logger`, `utils`, `brand`, `client`, `tools`, `mcp`, `db`
- **Infrastructure**: `ci`, `infra`, `deps`

**Examples:**

```
feat(api): add SPEI transfer confirmation endpoint
fix(web): resolve balance refresh on tab switch
docs(core): update Money VO README
chore(deps): upgrade framework to latest
```

One logical change per commit. Never combine unrelated changes.

---

## Pre-PR Checklist

Before opening a PR, run the quality gate:

```bash
# See STACK.md for exact commands mapped to these actions
quality-gate          # Full: lint + typecheck + build + test + deps + audit
```

Or run checks individually:

```bash
typecheck             # TypeScript — must be clean
lint                  # ESLint — must be clean
test                  # Unit + E2E tests
format:check          # Prettier — fix if needed
```

For faster iteration, use `quality-gate:quick` (lint + typecheck only) or `quality-gate:branch` (affected files against develop). See STACK.md for exact commands.

---

## PR Title & Description

**Title**: `type(scope): short description` (max 70 chars, same format as commit)

**Description template:**

```markdown
## Summary
- [What changed]
- [Why it changed]

## Test Plan
- [ ] Happy path tested
- [ ] Edge case: [describe]
- [ ] Auth failure tested (if applicable)

## Fintech Risk Assessment
- [ ] Money movement: [money | none]
- [ ] Auth changes: [auth | none]
- [ ] PII handling: [PII | none]
- [ ] Migration: [migration | none]
- [ ] Ledger changes: [ledger | none]

If ANY fintech flag is not `none`, human review is required before merge.
See CLAUDE.md Fintech Safety section.

## Links
- Plan: docs/plans/active/[slug]
- ADR: docs/plans/active/[slug]
```

---

## Merge Strategy

| Branch type | Strategy                           | Notes                                  |
| ----------- | ---------------------------------- | -------------------------------------- |
| `feature/*` | Squash and merge                   | Clean history, single commit on target |
| `fix/*`     | Squash and merge                   | Clean history                          |
| `docs/*`    | Squash and merge                   | Clean history                          |
| `hotfix/*`  | Merge commit + cherry-pick to main | Preserve history for audit trail       |
| `release/*` | Merge commit                       | Preserve full history                  |

**Never force-push to `main` or `develop`.** Revert, don't reset, on shared branches.

---

## Quick Reference

```bash
# Create branch
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Stage and commit
git add path/to/file.ts               # stage specific files (not -A)
git commit -m "feat(scope): message"   # conventional commit

# Push and open PR
git push -u origin feature/my-feature
gh pr create --title "feat(scope): description" --body "..."

# Before merge — run quality gate (see STACK.md for command)
quality-gate
```

---

## Failure Handling

| Scenario                            | Action                                                                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge conflict with target branch   | Rebase onto target (`git rebase develop`). Resolve conflicts file by file. Never discard incoming changes blindly.                                 |
| CI fails on PR                      | Fix locally, push fix commit. Do not disable checks or skip hooks (`--no-verify`).                                                                 |
| Force-push needed on feature branch | Only if no one else is working on the branch. Coordinate with team first. Never on shared branches.                                                |
| PR too large (>500 lines changed)   | Split into smaller PRs. Each should be independently reviewable and mergeable.                                                                     |
| Secrets accidentally committed      | Rotate the secret immediately. Use `git filter-branch` or BFG Repo-Cleaner to remove from history. Secrets in git history are compromised forever. |

---

## Anti-Patterns

| Anti-Pattern                                         | Mitigation                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Giant commits mixing features, fixes, and refactors  | One logical change per commit. Split unrelated changes.      |
| Vague commit messages (`fix stuff`, `update`, `wip`) | Follow Conventional Commits format. Be specific.             |
| Committing directly to `main` or `develop`           | Always use feature branches. These branches are protected.   |
| `--no-verify` to skip pre-commit hooks               | Fix the issue the hook caught. Hooks exist for a reason.     |
| PR without description or test plan                  | Use the PR template above. Every PR needs context.           |
| Stale feature branches (weeks without merge)         | Rebase regularly. Long-lived branches accumulate merge risk. |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Git rules (SSOT)**: [rules/git-workflow.md](../rules/git-workflow.md) — full commit format, branch strategy, immutable constraints, GPG signing
- **Security rules**: [rules/security.md](../rules/security.md) — no secrets in version control, secret rotation
- **ETH post-review**: [/eth](../eth/SKILL.md) — Phase H.3 handles post-approval git operations
- **BAP deliverables**: [/bap](../bap/SKILL.md) — plan commit before implementation
- **Deliverables rule**: [rules/deliverables.md](../rules/deliverables.md) — plan + ADR + summary required per feature
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) — post-workflow memory capture
