#!/usr/bin/env node
/**
 * Stack Guard Hook
 * Trigger: PreToolUse on Edit|Write
 * Purpose: Prevent project-specific contamination in portable .claude/ files.
 *          CLAUDE.md, workflows, rules, agents, and specs are portable.
 *          Project-specific config belongs in STACK.md only.
 * Output: Soft warning with STACK.md reference.
 */

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
  const filePath = input.tool_input?.file_path ?? input.tool_input?.filePath ?? ''
  const normalizedPath = filePath.replace(/\\/g, '/')

  // Only check files inside .claude/
  if (!normalizedPath.includes('/.claude/')) {
    process.exit(0)
  }

  const fileName = normalizedPath.split('/').pop() ?? ''
  const warnings = []

  // STACK.md and MEMORY.md are project-specific — always safe to edit
  if (fileName === 'STACK.md' || fileName === 'MEMORY.md') {
    process.exit(0)
  }

  // Settings files are local config — safe to edit
  if (fileName.startsWith('settings')) {
    process.exit(0)
  }

  // Knowledge files are reference data — safe to edit
  if (normalizedPath.includes('/.claude/knowledge/')) {
    process.exit(0)
  }

  // Check if editing a portable framework file
  const portableDirs = ['/workflows/', '/rules/', '/agents/', '/specs/']
  const isPortableFile = portableDirs.some((dir) => normalizedPath.includes('/.claude' + dir))
  const isPortableRoot = ['CLAUDE.md', 'ROUTING.md'].includes(fileName) &&
    normalizedPath.includes('/.claude/')

  if (isPortableFile || isPortableRoot) {
    // Check new content for hardcoded package manager commands
    const newContent = input.tool_input?.new_string ?? input.tool_input?.content ?? ''

    // Detect hardcoded pnpm/npm/yarn commands (not inside backtick references or "see STACK.md" patterns)
    const cmdPattern = /^[^`]*\b(pnpm|npm|yarn|bun)\s+(run\s+)?\w+/m
    if (newContent && cmdPattern.test(newContent) && !newContent.includes('STACK.md')) {
      warnings.push(
        'Hardcoded package manager command detected in a portable file. ' +
        'Use action aliases (typecheck, lint, quality-gate) and reference STACK.md for actual commands.'
      )
    }
  }

  if (warnings.length > 0) {
    const message = `Stack Guard:\n${warnings.map((w) => '- ' + w).join('\n')}\nRef: .claude/STACK.md`
    process.stdout.write(JSON.stringify({
      systemMessage: message,
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }))
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
