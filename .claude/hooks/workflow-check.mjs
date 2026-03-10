#!/usr/bin/env node
/**
 * Workflow Check Hook
 * Trigger: PreToolUse on Bash (git commit commands)
 * Purpose: On feature branches, check for spec-first flow compliance and plan existence.
 * Output: Soft warning with reference to .claude/rules/git-workflow.md
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', (chunk) => { data += chunk })
    process.stdin.on('end', () => resolve(data))
  })
}

async function main() {
  const raw = await readStdin()
  const input = JSON.parse(raw)
  const command = input.tool_input?.command ?? ''

  // Only check git commit commands
  if (!command.includes('git commit')) {
    process.exit(0)
  }

  const warnings = []

  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf-8',
    }).trim()

    // Only check feature and fix branches
    if (branch.startsWith('feature/') || branch.startsWith('fix/')) {
      // Check for spec-first flow: docs commit should precede implementation
      const log = execFileSync('git', ['log', '--oneline', '-30'], {
        encoding: 'utf-8',
      }).trim()

      const hasDocsCommit = /\bdocs(\([^)]+\))?:/.test(log)
      if (!hasDocsCommit && branch.startsWith('feature/')) {
        warnings.push(
          'No docs/spec commit found on this feature branch. ' +
          'Consider spec-first flow: docs commit before implementation.'
        )
      }

      // Check for plans directory
      const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
      const plansDir = resolve(projectDir, 'docs', 'plans')
      if (!existsSync(plansDir)) {
        warnings.push(
          'No docs/plans/ directory found. ' +
          'Non-trivial features require a plan document.'
        )
      }

      // Check commit message format (Conventional Commits)
      const msgMatch = command.match(/(?:-m\s+["'])([^"']+)/)
      if (msgMatch) {
        const msg = msgMatch[1]
        const conventionalPattern = /^(feat|fix|docs|refactor|test|chore|perf|style)(\([a-z0-9-]+\))?:\s.+/
        if (!conventionalPattern.test(msg)) {
          warnings.push(
            'Commit message may not follow Conventional Commits format: type(scope): description'
          )
        }
      }
    }
  } catch {
    process.exit(0)
  }

  if (warnings.length > 0) {
    const message = `Workflow Check:\n${warnings.map((w) => '- ' + w).join('\n')}\nRef: .claude/rules/git-workflow.md, .claude/skills/feature-branch/SKILL.md`
    process.stdout.write(JSON.stringify({
      systemMessage: message,
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }))
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
