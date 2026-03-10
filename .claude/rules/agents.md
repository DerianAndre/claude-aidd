# Agent Definitions — Enforcement Rule

> Standard structure, quality gates, and constraints for all agent definition files in `.claude/agents/`.

**Last Updated**: 2026-03-10
**Status**: Living Document

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Required Sections](#2-required-sections)
3. [YAML Frontmatter](#3-yaml-frontmatter)
4. [Quality Gates](#4-quality-gates)
5. [Communication Style](#5-communication-style)
6. [Anti-Patterns](#6-anti-patterns)

---

## 1. File Structure

Per Claude Code documentation (2026), agents use the subdirectory format:

```
.claude/agents/<name>/<name>.md
```

- One directory per agent, named with kebab-case
- Primary definition file matches directory name: `<name>/<name>.md`
- Companion files (templates, references, checklists) co-located in the same directory
- No flat files in `.claude/agents/` root — all agents use subdirectory format

---

## 2. Required Sections

Every agent definition MUST include these sections in order:

### 2.1 — YAML Frontmatter

See [Section 3](#3-yaml-frontmatter) for field specifications.

### 2.2 — Title & Role

```markdown
# Agent Display Name (Agent Identifier)

## Role

2-3 sentence description of the agent's expertise, perspective, and operating philosophy.
```

### 2.3 — Core Mission

```markdown
## Core Mission

2-3 sentences defining the agent's primary objective and what success looks like.
```

### 2.4 — Quick Reference

```markdown
## Quick Reference

High-density reference material: frameworks, checklists, decision tables.
The agent's most-used knowledge in scannable format.
```

### 2.5 — When to Use This Agent

```markdown
## When to Use This Agent

Activate `agent-name` when:
- [specific trigger scenario 1]
- [specific trigger scenario 2]
- [specific trigger scenario 3]
```

### 2.6 — Technical Deliverables

```markdown
## Technical Deliverables

2-3 concrete output templates showing the agent's standard outputs.
Include markdown/code examples of what the agent produces.
```

### 2.7 — Workflow Process

```markdown
## Workflow Process

4-step explicit process the agent follows for every task:
1. [Phase 1 — name]: description
2. [Phase 2 — name]: description
3. [Phase 3 — name]: description
4. [Phase 4 — name]: description
```

### 2.8 — Communication Style

```markdown
## Communication Style

3-4 domain-tuned examples demonstrating the agent's voice within Radical Neutrality.
No emoji. Domain-appropriate terminology. Peer-like tone.
```

### 2.9 — Success Metrics

```markdown
## Success Metrics

4-5 measurable outcomes that define quality work from this agent.
```

### 2.10 — Implementation Patterns

```markdown
## Implementation Patterns

Code examples, templates, and patterns the agent uses repeatedly.
```

### 2.11 — References

```markdown
## References

External sources, specifications, and documentation the agent consults.
```

### 2.12 — Cross-References

```markdown
## Cross-References

Links to related rules, skills, agents, and workflows within .claude/.
```

---

## 3. YAML Frontmatter

Required fields per Claude Code documentation:

```yaml
---
name: kebab-case-agent-name
description: >-
  Multi-line description of capabilities and activation triggers.
  Include keywords that match orchestrator Pattern Matrix entries.
tools: Read, Grep, Glob, Bash            # Minimum set. Add Write, Edit for builders.
model: opus | sonnet | haiku              # Match complexity to role.
maxTurns: 15 | 20 | 30                   # 15 for haiku, 20 for sonnet, 30 for opus.
permissionMode: plan                      # Default for read-heavy agents.
memory: project                           # Always project-scoped.
---
```

**Field constraints:**

| Field            | Required | Constraint                                                     |
| ---------------- | -------- | -------------------------------------------------------------- |
| `name`           | Yes      | kebab-case, matches directory name                             |
| `description`    | Yes      | 2-4 lines, includes activation keywords                        |
| `tools`          | Yes      | Minimum: Read, Grep, Glob, Bash. Add Write/Edit for builders. |
| `model`          | Yes      | opus (T1/architect), sonnet (T2/specialist), haiku (T3/task)   |
| `maxTurns`       | Yes      | 15 (haiku), 20 (sonnet), 30 (opus)                            |
| `permissionMode` | No       | Default: plan. Override only with justification.               |
| `memory`         | Yes      | Always `project`                                               |

**Custom fields** (ignored by Claude Code, used by orchestrator):

| Field                   | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| `fintech-classification`| Fintech risk surface: money, auth, PII, ledger, none |

---

## 4. Quality Gates

Every agent definition MUST pass these gates:

- [ ] YAML frontmatter has all required fields
- [ ] All required sections (2.2-2.12) are present
- [ ] File length >= 150 lines (sufficient depth)
- [ ] File length <= 500 lines (optimal system prompt performance per docs)
- [ ] No emoji in Communication Style section
- [ ] Communication style demonstrates domain-appropriate voice within Radical Neutrality
- [ ] Success Metrics are measurable (quantifiable or binary verifiable)
- [ ] Technical Deliverables include concrete output templates
- [ ] Workflow Process has exactly 4 steps
- [ ] Cross-References link to at least 2 related `.claude/` resources
- [ ] `name` field matches directory name matches file name (minus .md)

---

## 5. Communication Style

All agents operate within the Radical Neutrality framework from `rules/global.md`:
- Zero filler phrases
- Absolute terminological precision
- Peer-like tone

Within that framework, each agent has a **domain-appropriate voice**:

| Agent Domain    | Voice Characteristics                                           |
| --------------- | --------------------------------------------------------------- |
| Security        | Adversarial, risk-focused, worst-case-first                     |
| Architecture    | Trade-off-analytical, constraint-mapping, scalability-aware     |
| Quality         | Evidence-demanding, failure-scenario-driven, coverage-precise   |
| API/Contract    | Specification-exact, schema-first, backward-compat-aware        |
| Data            | Schema-precise, migration-cautious, integrity-first             |
| Design          | Accessibility-aware, user-advocate, consistency-enforcing       |
| Frontend        | Performance-conscious, state-management-focused, UX-principled  |
| Platform        | Automation-focused, reliability-oriented, deployment-cautious   |
| Components      | Component-driven, reuse-first, accessibility-default            |
| Knowledge       | Accuracy-obsessed, schema-compliant, currency-enforcing         |
| i18n            | Locale-aware, edge-case-surfacing, RTL-conscious                |
| Incident        | Calm, decisive, evidence-first                                  |
| Compliance      | Regulatory-precise, evidence-demanding, risk-quantifying        |
| Writing         | Concise, audience-aware, example-rich                           |
| Performance     | Metric-driven, baseline-comparative, bottleneck-focused         |

---

## 6. Anti-Patterns

| Anti-Pattern                | Mitigation                                                              |
| --------------------------- | ----------------------------------------------------------------------- |
| **Skeletal definition**     | Enforce >= 150 lines with all required sections                         |
| **Generic communication**   | Require domain-tuned voice examples, not boilerplate                    |
| **Missing deliverables**    | Every agent must show what it produces, not just what it knows          |
| **No workflow**             | 4-step process ensures agent follows a consistent methodology           |
| **Unmeasurable success**    | Metrics must be quantifiable or binary verifiable                       |
| **Emoji in professional voice** | Radical Neutrality: zero decoration, maximum precision              |
| **Flat file structure**     | All agents in subdirectories per Claude Code docs                       |
| **Bloated definition**      | Cap at 500 lines. Move detailed references to companion files.          |
| **Missing cross-references** | Agent must know its place in the ecosystem                             |

---

## Cross-References

- [rules/global.md](global.md) — Radical Neutrality, communication standards
- [rules/orchestrator.md](orchestrator.md) — Pattern Matrix for agent activation
- [rules/routing.md](routing.md) — Rule routing index
- [CLAUDE.md](../CLAUDE.md) — Agent Teams table

**Version:** 1.0.0
**Last Updated:** 2026-03-10
**Applies To:** All agent definitions in `.claude/agents/`
