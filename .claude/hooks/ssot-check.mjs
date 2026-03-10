#!/usr/bin/env node
/**
 * SSOT Pattern Check Hook
 * Trigger: PreToolUse on Edit|Write
 * Purpose: When UI component files are modified, warns about SSOT pattern compliance.
 *          Components should use styles.ts for Tailwind classes and types.ts for interfaces.
 * Output: Soft warning with reference to .claude/rules/frontend.md
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

  // Only check files in UI component directories (packages/ui or similar)
  const isUiComponent = normalizedPath.includes('/ui/src/components') ||
    normalizedPath.includes('/ui/src/primitives')

  if (!isUiComponent) {
    process.exit(0)
  }

  const warnings = []
  const fileName = normalizedPath.split('/').pop() ?? ''

  // Check: inline Tailwind in component files (not styles.ts)
  if ((fileName.endsWith('.tsx') || fileName.endsWith('.ts')) && !fileName.includes('styles')) {
    const newContent = input.tool_input?.new_string ?? input.tool_input?.content ?? ''
    if (/className=["'][^"']*(?:flex|grid|p-|m-|text-|bg-|border|rounded|w-|h-)[^"']*["']/.test(newContent)) {
      warnings.push('Inline Tailwind detected in component file. Move classes to styles.ts per SSOT pattern.')
    }
  }

  // Check: creating a component implementation without SSOT imports
  if (fileName === 'index.web.tsx' || fileName === 'index.native.tsx' || fileName === 'index.tsx') {
    const content = input.tool_input?.content ?? ''
    if (content && !content.includes("from './styles'") && !content.includes("from './types'")) {
      warnings.push('Component implementation should import from styles.ts and types.ts (SSOT pattern).')
    }
  }

  if (warnings.length > 0) {
    const message = `SSOT Pattern Warning:\n${warnings.map((w) => '- ' + w).join('\n')}\nRef: .claude/rules/frontend.md`
    process.stdout.write(JSON.stringify({
      systemMessage: message,
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }))
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
