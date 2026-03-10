#!/usr/bin/env node

/**
 * build-plugin.mjs — Packages portable .claude/ content into a distributable
 * Claude Code plugin at dist/aidd-framework/.
 *
 * Usage: node tools/build-plugin.mjs
 *
 * The .claude/ directory remains the SSOT. This plugin is a build artifact.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CLAUDE_DIR = join(ROOT, '.claude');
const OUT = join(ROOT, 'dist', 'aidd-framework');

// --- Helpers ---

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  console.log(`  copied ${src.replace(ROOT, '.')} → ${dest.replace(ROOT, '.')}`);
}

// --- Step 0: Clean previous build ---

if (existsSync(OUT)) {
  rmSync(OUT, { recursive: true, force: true });
}
console.log('Building aidd-framework plugin...\n');

// --- Step 1: Plugin manifest ---

const manifest = JSON.parse(readFileSync(join(CLAUDE_DIR, 'plugin-manifest.template.json'), 'utf-8'));
const pluginDir = join(OUT, '.claude-plugin');
ensureDir(pluginDir);
writeFileSync(join(pluginDir, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('[1/6] Plugin manifest created');

// --- Step 2: Skills ---

const skillsDir = join(CLAUDE_DIR, 'skills');
const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const skill of skillDirs) {
  const src = join(skillsDir, skill, 'SKILL.md');
  if (existsSync(src)) {
    copyFile(src, join(OUT, 'skills', skill, 'SKILL.md'));
  }
}
console.log(`[2/6] Skills copied (${skillDirs.length})`);

// --- Step 3: Agents ---

const agentsDir = join(CLAUDE_DIR, 'agents');
const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));

for (const agent of agentFiles) {
  copyFile(join(agentsDir, agent), join(OUT, 'agents', agent));
}
console.log(`[3/6] Agents copied (${agentFiles.length})`);

// --- Step 4: Hooks (portable only) ---

// Portable hooks: stack-guard.mjs, ssot-check.mjs, workflow-check.mjs
// Excluded: SessionStart (project-specific), Notification (Windows-specific)
const PORTABLE_HOOKS = ['stack-guard.mjs', 'ssot-check.mjs', 'workflow-check.mjs'];

for (const hook of PORTABLE_HOOKS) {
  const src = join(CLAUDE_DIR, 'hooks', hook);
  if (existsSync(src)) {
    copyFile(src, join(OUT, 'hooks', hook));
  }
}
console.log(`[4/6] Hooks copied (${PORTABLE_HOOKS.length})`);

// --- Step 5: Generate hooks.json (plugin format) ---

const settings = JSON.parse(readFileSync(join(CLAUDE_DIR, 'settings.json'), 'utf-8'));
const sourceHooks = settings.hooks || {};

// Only include portable hook categories (PreToolUse, PostToolUse)
// Exclude SessionStart (project name reference) and Notification (Windows PowerShell)
const PORTABLE_CATEGORIES = ['PreToolUse', 'PostToolUse'];

const pluginHooks = {};
for (const category of PORTABLE_CATEGORIES) {
  const entries = sourceHooks[category];
  if (!entries) continue;

  pluginHooks[category] = entries.map((entry) => ({
    ...entry,
    hooks: entry.hooks.map((h) => {
      if (h.type !== 'command') return h;
      // Replace .claude/hooks/ paths with ${CLAUDE_PLUGIN_ROOT}/hooks/
      const command = h.command.replace(
        /(?:node\s+)?\.claude\/hooks\//g,
        'node ${CLAUDE_PLUGIN_ROOT}/hooks/'
      );
      return { ...h, command };
    }),
  }));
}

writeFileSync(
  join(OUT, 'hooks', 'hooks.json'),
  JSON.stringify({ hooks: pluginHooks }, null, 2) + '\n'
);
console.log('[5/6] hooks.json generated');

// --- Step 6: README ---

const readme = `# aidd-framework — Claude Code Plugin

> AI-Driven Development framework extracted from the EnXingaPay .claude/ ecosystem.

## Included

- **11 Skills**: ${skillDirs.map((s) => '`/' + s + '`').join(', ')}
- **11 Agents**: ${agentFiles.map((a) => '`' + basename(a, '.md') + '`').join(', ')}
- **${PORTABLE_HOOKS.length} Hooks**: ${PORTABLE_HOOKS.map((h) => '`' + h + '`').join(', ')}

## Host Project Requirements

This plugin provides the framework (skills + agents + hooks). The host project must supply:

| File/Directory | Purpose |
|---|---|
| \`.claude/rules/\` | 12 rule files (global, backend, frontend, security, etc.) |
| \`.claude/specs/\` | 4 spec files (version-protocol, bluf-6, heuristics, model-matrix) |
| \`.claude/STACK.md\` | Project identity, tech stack, commands |
| \`.claude/MEMORY.md\` | Evolution data store (decisions, mistakes, conventions) |
| \`.claude/workflows/evolution.md\` | Quick Capture + CDPG evolution workflow |
| \`.claude/knowledge/\` | Technology Knowledge Base evaluations (optional) |

## Installation

1. Copy this directory to \`~/.claude/plugins/aidd-framework/\`
2. Or add to your project's \`.claude/settings.json\`:
   \`\`\`json
   { "enabledPlugins": ["path/to/aidd-framework"] }
   \`\`\`

## Skills become namespaced

When installed as a plugin, skills are invoked as \`/aidd-framework:bap\`, \`/aidd-framework:eth\`, etc.

## Version

Built from plugin-manifest.template.json v${manifest.version}
`;

writeFileSync(join(OUT, 'README.md'), readme);
console.log('[6/6] README generated');

// --- Summary ---

console.log(`\n✓ Plugin built at dist/aidd-framework/`);
console.log(`  Skills: ${skillDirs.length}`);
console.log(`  Agents: ${agentFiles.length}`);
console.log(`  Hooks:  ${PORTABLE_HOOKS.length} + hooks.json`);
