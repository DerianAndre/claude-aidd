---
name: design
description: >-
  Frontend design and UX audit — WCAG 2.1 AA, heuristics, components,
  typography, responsive, motion, performance, dark mode, i18n.
triggers:
  - frontend design
  - UX audit
  - WCAG audit
  - accessibility audit
  - responsive audit
  - dark mode
  - design system audit
argument-hint: "[component, page, or Figma URL]"
user-invocable: true
model: sonnet
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent, WebFetch
---

# Workflow: Frontend Design & UX Audit

> Comprehensive frontend quality audit covering accessibility, UX heuristics, UI component quality, design system consistency, typography, form UX, responsive behavior, motion, performance, dark mode, and i18n readiness. Produces a severity-ranked report with actionable findings.
>
> **Invocation**: Standalone (ad-hoc) or from pr-review.md design-reviewer scope.

**Use when:**

- After implementing new UI components or pages
- Pre-release accessibility and UX compliance check
- Mobile-first responsive audit
- Design system consistency review
- Component library quality gate
- UX heuristic evaluation of user flows
- Frontend performance audit (Core Web Vitals)

---

## Prerequisites

- [ ] AI is in planning mode
- [ ] AI is using the best and highest thinking model
- [ ] Codebase context is accessible
- [ ] Scope defined: specific component, page, changed files, or full app

---

## Phase A: Scope & Discover

**Indicator**: `[design.md] Phase A -- Discovering design and UX context`

### A.1 -- Define Scope

| Invocation Source            | Input                                        | Scope                        |
| ---------------------------- | -------------------------------------------- | ---------------------------- |
| pr-review.md design-reviewer | Changed file list filtered to frontend layer | Changed frontend files only  |
| Standalone (component)       | Specific component path                      | Single component + its tests |
| Standalone (page)            | Page route or file path                      | Full page + child components |
| Standalone (flow)            | User flow (e.g., onboarding, checkout)       | All pages in the flow        |
| Standalone (full)            | Entire frontend app                          | All UI components and pages  |

### A.2 -- Design Stack Discovery

Read STACK.md and project config to identify:

1. **CSS framework** -- Tailwind, CSS Modules, styled-components, vanilla CSS, etc.
2. **Component library** -- shadcn/ui, Radix, MUI, Ant Design, custom, etc.
3. **Design tokens** -- Where tokens are defined (CSS variables, theme file, design-tokens.json)
4. **UI package** -- Where shared components live (e.g., a `ui/` or `components/` package)
5. **Styling pattern** -- Utility-first, BEM, CSS-in-JS, etc.
6. **State management** -- Zustand, Context, XState, TanStack Query, etc.
7. **Animation library** -- Framer Motion, CSS transitions, Spring, none
8. **i18n system** -- i18next, next-intl, custom, none

Record the discovered stack. This determines which convention checks apply in Phase B.

### A.3 -- UX Context Discovery

Identify the UX context for the scope:

1. **Target users** -- Who uses this feature? (technical, non-technical, mobile-primary, accessibility needs)
2. **User flow** -- What is the primary task the user is completing?
3. **Critical paths** -- Which interactions are high-stakes? (payments, data entry, destructive actions)
4. **Existing patterns** -- What interaction patterns does the project already use? (toasts, modals, inline validation)

### Gate A: Audit Depth

| Option          | Condition                                      | Action                                                   |
| --------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `[Quick Check]` | Single component, no complex interactions      | Lead runs inline checklist (B.1 + B.3). Skip to Phase C. |
| `[Standard]`    | Page-level, multiple components                | Run B.1 through B.7. Skip B.8-B.11 unless relevant.      |
| `[Full Audit]`  | Full app, design system review, or pre-release | Run all B.1 through B.11.                                |

---

## Phase B: Audit

**Indicator**: `[design.md] Phase B -- Running frontend design audit`

Audit all files in scope against the following checklists. For each item, record PASS, FAIL (with severity), or N/A.

### B.1 -- WCAG 2.1 AA Compliance

#### Perceivable

- [ ] Color contrast ratio >= 4.5:1 for normal text, >= 3:1 for large text (18px+ or 14px+ bold)
- [ ] UI component contrast >= 3:1 for borders, icons, focus indicators
- [ ] Images have meaningful `alt` text (decorative images use `alt=""`)
- [ ] Form inputs have visible `<label>` or `aria-label`
- [ ] Error messages identify the field by name, not just color
- [ ] Content does not rely on color alone to convey meaning (use icons, text, patterns)
- [ ] Video/audio has captions or transcripts (if applicable)

#### Operable

- [ ] All interactive elements are keyboard-focusable (Tab + Shift+Tab cycle)
- [ ] Focus indicator is visible -- not removed with `outline: none` without a custom replacement
- [ ] Focus order follows logical reading order (not jumping around the page)
- [ ] No keyboard traps -- user can always escape modals/dialogs (Escape key)
- [ ] Skip-to-content link present on pages with navigation
- [ ] No time limits that can't be extended (or time limits are justified)
- [ ] Touch targets >= 44x44px for buttons and interactive elements on mobile

#### Understandable

- [ ] `lang` attribute on `<html>` element matches content language
- [ ] Input fields have clear placeholder or description text
- [ ] Error messages describe what went wrong and how to fix it
- [ ] Form validation errors are announced to screen readers (`aria-live="polite"` or `role="alert"`)
- [ ] Consistent navigation patterns across pages

#### Robust

- [ ] No invalid HTML (validate if uncertain)
- [ ] Interactive elements use semantic HTML (`<button>` not `<div onClick>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- [ ] ARIA roles used correctly -- do not override native semantics unnecessarily
- [ ] ARIA attributes match element state (`aria-expanded`, `aria-selected`, `aria-checked`)
- [ ] Content accessible in latest 2 versions of major browsers (Chrome, Firefox, Safari, Edge)

### B.2 -- UX Heuristics & Cognitive Load

Evaluate against Nielsen's 10 Usability Heuristics and cognitive load principles:

#### Visibility of System Status

- [ ] User always knows what is happening (loading indicators, progress bars, status messages)
- [ ] Actions provide immediate feedback (button press, form submission, state change)
- [ ] Async operations show pending state (skeleton screens, spinners, progress)

#### Match Between System and Real World

- [ ] Language uses user's vocabulary, not developer jargon
- [ ] Icons are universally recognizable or paired with text labels
- [ ] Information appears in natural, logical order

#### User Control and Freedom

- [ ] Undo/redo available for destructive or significant actions
- [ ] Easy way to go back or cancel (clearly visible, not hidden)
- [ ] Confirmation dialogs for irreversible actions with clear consequence description

#### Consistency and Standards

- [ ] Same action produces same result across the application
- [ ] UI patterns follow platform conventions (web, mobile)
- [ ] Terminology is consistent throughout (no synonyms for same concept)

#### Error Prevention

- [ ] Constraints prevent invalid input where possible (date pickers, dropdowns, input masks)
- [ ] Destructive actions require confirmation with explicit naming ("Delete account" not "OK")
- [ ] Form fields validate inline before submission where practical

#### Recognition Over Recall

- [ ] Options are visible, not hidden behind memorization (menus, toolbars, breadcrumbs)
- [ ] Recent items, defaults, and suggestions reduce memory load
- [ ] Navigation is persistent and predictable

#### Flexibility and Efficiency

- [ ] Keyboard shortcuts available for frequent actions (power users)
- [ ] Shortcuts do not conflict with browser or screen reader shortcuts
- [ ] Progressive disclosure: simple by default, advanced options available

#### Aesthetic and Minimalist Design

- [ ] Every element earns its place -- no decoration without function
- [ ] Visual hierarchy guides the eye to primary actions first
- [ ] Information density appropriate for context (not too sparse, not overwhelming)

#### Help Users Recognize, Diagnose, and Recover from Errors

- [ ] Error messages are written in plain language (no codes, no stack traces)
- [ ] Error messages suggest a specific corrective action
- [ ] Error states are visually distinct and recoverable (not dead ends)

#### Cognitive Load

- [ ] Chunking: related items grouped (7 +/- 2 rule for option lists)
- [ ] Hick's Law: critical choice points have 3-5 options, not 15+
- [ ] Fitts's Law: primary actions have large click/tap targets and are positioned conveniently

### B.3 -- UI Component Quality

Evaluate component implementation quality:

#### State Completeness

Every interactive component MUST implement all applicable states:

- [ ] **Default** -- Normal resting state
- [ ] **Hover** -- Visual feedback on pointer hover
- [ ] **Focus** -- Visible indicator (never removed, high-contrast ring)
- [ ] **Active/Pressed** -- Feedback during interaction
- [ ] **Disabled** -- Visually distinct + `aria-disabled="true"` (not just grayed out)
- [ ] **Loading** -- Skeleton or spinner + `aria-busy="true"`
- [ ] **Empty** -- Helpful message + action CTA (not blank space)
- [ ] **Error** -- Descriptive message + recovery action
- [ ] **Success** -- Confirmation + next step guidance

#### Interaction Feedback

- [ ] Hover effects use subtle transitions (150-200ms, not instant)
- [ ] Click/tap provides immediate visual response (not delayed)
- [ ] Focus ring is 2px+ with sufficient contrast and offset
- [ ] Transitions use CSS `transition` or animation library (not layout thrashing)
- [ ] Disabled elements have `pointer-events: none` or equivalent

#### Visual Hierarchy

- [ ] Primary action is visually dominant (size, color, position)
- [ ] Secondary actions are visually subordinate
- [ ] Destructive actions use warning styling (red/danger variant) and are not the default
- [ ] Spacing creates clear groups (Gestalt proximity principle)
- [ ] Z-index follows a managed stacking context (no arbitrary values)

### B.4 -- Design System Consistency

Checks apply based on the design stack discovered in Phase A:

- [ ] Design tokens used for colors, spacing, typography -- no hardcoded values (hex, px literals)
- [ ] Component variants follow the project's composition pattern (slots/compound vs props)
- [ ] No overriding component library internals with raw CSS -- use provided APIs (`className`, `variant`, `size`)
- [ ] Icon usage: consistent library, accessible labels (`aria-label` or `aria-hidden="true"` for decorative)
- [ ] Spacing follows the token scale (no arbitrary values like `margin: 13px`)

**If CSS utility framework detected** (Tailwind, UnoCSS, etc.):

- [ ] Theme customization via the framework's config pattern (not inline overrides)
- [ ] Color format follows project convention (OKLCH, HSL, hex -- whatever CLAUDE.md specifies)
- [ ] Conditional class merging uses a merge utility (e.g., `tailwind-merge`, `clsx`) -- no manual string concatenation
- [ ] No magic numbers -- extract repeated values to design tokens

**If component library detected** (shadcn/ui, Radix, MUI, etc.):

- [ ] Complex interactive components (Modal, Drawer, Select, Tooltip) use the library, not custom implementations
- [ ] Simple layout uses the CSS framework directly (flex, grid, spacing)
- [ ] Component variant definitions use the project's variant pattern (CVA, styled-system, etc.)

### B.5 -- Typography & Color

#### Typography

- [ ] Font scale follows a modular ratio (1.125-1.333) or design token scale
- [ ] Body text is 16px+ for readability (never below 14px)
- [ ] Line height is 1.4-1.6 for body text (not too tight, not too loose)
- [ ] Line length is 45-75 characters for optimal readability (use `max-w-prose` or equivalent)
- [ ] Heading hierarchy is logical (`h1` > `h2` > `h3`, no skipping levels)
- [ ] Font weights are limited to 2-3 per typeface (not every weight from 100-900)
- [ ] `font-display: swap` or `optional` used for web fonts (no FOIT)

#### Color

- [ ] Color palette uses design tokens (no hex/rgb literals in component code)
- [ ] Semantic colors map to intent (success, warning, error, info) not raw values
- [ ] Color alone never conveys meaning (always paired with icon, text, or pattern)
- [ ] Color palette works across light and dark modes (if applicable)
- [ ] Brand colors used consistently for identity elements (logo, primary actions)

### B.6 -- Form UX & Validation

- [ ] Labels are always visible (not just placeholders that disappear on focus)
- [ ] Required fields are marked (asterisk, "required" text, or `aria-required="true"`)
- [ ] Optional fields are marked (if most fields are required, mark the optional ones instead)
- [ ] Input types match data: `type="email"`, `type="tel"`, `type="number"`, `inputmode` attribute
- [ ] Autocomplete attributes present where applicable (`autocomplete="email"`, `autocomplete="name"`)
- [ ] Inline validation fires on blur (not on every keystroke -- avoids frustration)
- [ ] Error messages appear adjacent to the field (not just at top/bottom of form)
- [ ] Error messages explain what's wrong AND how to fix it ("Email must include @" not "Invalid input")
- [ ] Submit button shows loading state during async submission
- [ ] Form preserves user input on validation failure (no clearing fields)
- [ ] Multi-step forms show progress indicator and allow back navigation
- [ ] Password fields have show/hide toggle and strength indicator

### B.7 -- Responsive Design

- [ ] Base styles target mobile (mobile-first -- no desktop-first overrides)
- [ ] No horizontal overflow on viewports < 375px
- [ ] Layout tested at breakpoints: 320px, 375px, 768px, 1024px, 1440px
- [ ] Images use responsive sizing (`w-full`, `srcset`, or explicit responsive classes)
- [ ] Forms are usable with virtual keyboard (no elements hidden behind it)
- [ ] Typography scales appropriately (no text overflow or truncation without ellipsis)
- [ ] Navigation collapses to mobile-friendly pattern (hamburger, bottom nav, drawer)
- [ ] Tables use horizontal scroll or card layout on mobile (not breaking layout)
- [ ] Touch targets >= 44x44px with >= 8px spacing between adjacent targets

### B.8 -- Motion & Animation

- [ ] Animations respect `prefers-reduced-motion` -- reduced or disabled when set
- [ ] No auto-playing animations that can't be paused
- [ ] Micro-interactions use 150-200ms duration (not sluggish, not jarring)
- [ ] Layout transitions use 300-500ms (content shifting needs time to track)
- [ ] Animations use GPU-accelerated properties (`transform`, `opacity`) not layout properties (`width`, `height`, `top`)
- [ ] Loading states use skeleton screens or spinners (not blank space)
- [ ] Exit animations are faster than entrance animations (users are moving on)
- [ ] Animation serves a purpose (guides attention, shows state change, provides feedback) -- no decoration-only motion

### B.9 -- Dark Mode (if supported)

- [ ] Contrast ratios maintained in dark mode (re-check B.1 Perceivable)
- [ ] No invisible elements (text on same-color background, icons on matching fill)
- [ ] Shadows replaced with borders or subtle glows (dark-on-dark shadows are invisible)
- [ ] Images and illustrations adapt (no harsh bright images on dark backgrounds)
- [ ] Dark mode toggle doesn't cause layout shift
- [ ] System preference respected via `prefers-color-scheme` media query
- [ ] User override persisted (localStorage or cookie, not session-only)

### B.10 -- Performance UX

Reference: Core Web Vitals targets from experience-engineer agent.

- [ ] Largest Contentful Paint (LCP) <= 2.5s -- hero images, fonts, above-fold content loads fast
- [ ] First Input Delay (FID) / Interaction to Next Paint (INP) <= 200ms -- interactions respond instantly
- [ ] Cumulative Layout Shift (CLS) <= 0.1 -- no unexpected content jumping
- [ ] Images lazy-loaded below the fold (`loading="lazy"`)
- [ ] Above-fold images preloaded or priority-loaded
- [ ] Heavy components code-split with `lazy()` + `<Suspense>` with meaningful fallback
- [ ] Lists with 50+ items use virtualization (TanStack Virtual, react-window)
- [ ] No layout thrashing in scroll handlers (use `requestAnimationFrame` or `IntersectionObserver`)
- [ ] Bundle size within budget (check with `npx vite-bundle-visualizer` or equivalent)

### B.11 -- i18n Readiness (if applicable)

- [ ] No hardcoded user-facing strings -- all text in locale files or i18n system
- [ ] Layout handles text expansion (German ~30% longer than English)
- [ ] RTL consideration: no layout assumptions that break with `dir="rtl"` (flexbox order, text alignment)
- [ ] Date, time, and number formatting uses locale-aware APIs (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- [ ] Pluralization handled by i18n library (not manual `count === 1 ? "item" : "items"`)
- [ ] Images with text have localized alternatives

---

## Phase C: Synthesize Report

**Indicator**: `[design.md] Phase C -- Synthesizing design report`

### C.1 -- Severity Classification

| Level       | Criteria                                                                                                                                                                                      | Action                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **BLOCKER** | WCAG A or AA violation that prevents access (keyboard trap, no alt text on functional image, contrast < 3:1, missing form label, `div onClick` without keyboard handler)                      | Must fix before shipping. Blocks merge.   |
| **MAJOR**   | WCAG AA violation that degrades experience (contrast 3:1-4.5:1, missing skip link, no `aria-live` on errors), UX heuristic violation on critical path, missing component states on primary UI | Fix before release. Human decides timing. |
| **MINOR**   | Design inconsistency, missing token usage, non-critical responsive issue, optimization opportunity, animation without `prefers-reduced-motion`, typography scale deviation                    | Fix when convenient. Log for design debt. |

### C.2 -- Report Format

```markdown
## Frontend Design Audit -- <scope>

**Date**: YYYY-MM-DD
**Scope**: [component | page | flow | full app]
**Audit depth**: [Quick Check | Standard | Full Audit]
**Design stack**: [discovered framework + component library]
**Status**: BLOCKED | PASS WITH NOTES | CLEAN

### BLOCKERs (must fix before ship)
[findings with file:line, or "none"]

### MAJORs (fix before release)
[findings with file:line, or "none"]

### MINORs (design debt)
[findings or "none"]

### Checklist Summary
- WCAG Perceivable: X/7 pass
- WCAG Operable: X/7 pass
- WCAG Understandable: X/5 pass
- WCAG Robust: X/5 pass
- UX Heuristics: X/15 pass
- Component Quality: X/14 pass
- Design System: X/N pass
- Typography & Color: X/12 pass
- Form UX: X/12 pass (or N/A)
- Responsive: X/9 pass
- Motion: X/8 pass
- Dark Mode: X/7 pass (or N/A)
- Performance UX: X/9 pass
- i18n: X/6 pass (or N/A)
```

### Gate C: Audit Outcome

| Option              | Condition                                                     | Action                                         |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `[Approve]`         | Zero BLOCKERs, MAJORs accepted or resolved                    | Audit passes.                                  |
| `[Request Changes]` | BLOCKERs remain or MAJORs need fixing                         | Route back for fixes. Re-audit affected items. |
| `[Escalate]`        | Fundamental design system or accessibility architecture issue | Flag for design lead review.                   |

---

## Automated Testing Integration

Supplement manual audit with automated checks. Automated tools catch ~30-40% of WCAG issues. Manual review catches the rest.

### Accessibility Testing

```typescript
// vitest-axe: automated a11y in unit tests
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Linting

```bash
# eslint-plugin-jsx-a11y: catch a11y issues at lint time
npx eslint --plugin jsx-a11y src/
```

### Performance

```bash
# Lighthouse CI: Core Web Vitals in CI pipeline
npx lighthouse --output=json --chrome-flags="--headless" <url>

# Bundle analysis
npx vite-bundle-visualizer
```

### Storybook

```typescript
// Storybook a11y addon: interactive accessibility panel
// Install: @storybook/addon-a11y
// Runs axe-core on every story automatically
```

---

## Failure Handling

| Scenario                                           | Action                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Design stack not identifiable from CLAUDE.md       | Ask user. Skip framework-specific checks if unknown.                                         |
| Component uses custom CSS instead of design system | Log as MINOR. Note which token/component could replace it.                                   |
| Contrast tool unavailable                          | Use browser DevTools accessibility panel. Note measurement method in report.                 |
| i18n not applicable (single-language project)      | Mark B.11 as N/A in report.                                                                  |
| Dark mode not supported                            | Mark B.9 as N/A in report.                                                                   |
| Quick check reveals complex accessibility issues   | Upgrade to Standard or Full Audit. Return to Phase B.                                        |
| Performance metrics unavailable (no running app)   | Audit code patterns only (lazy loading, image optimization, virtualization). Note in report. |
| Component library not detected                     | Skip library-specific checks in B.4. Audit raw implementation quality instead.               |
| User flow not defined (component-level audit)      | Skip B.2 UX Heuristics flow-level checks. Audit component-level heuristics only.             |

---

## Anti-Patterns

| Anti-Pattern                               | Mitigation                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| Auditing visuals without testing keyboard  | WCAG Operable checks (B.1) are mandatory, not optional.                       |
| Skipping mobile testing                    | Responsive checklist (B.7) is required for all page-level audits.             |
| Hardcoded colors instead of tokens         | Flag in design system consistency (B.4) and typography/color (B.5).           |
| `outline: none` without replacement        | Always a BLOCKER. Focus indicators are non-negotiable.                        |
| `div` with `onClick` instead of `button`   | Always a MAJOR. Semantic HTML is required.                                    |
| Color-only error states                    | Always a BLOCKER. Must have text/icon indicator.                              |
| Testing only in Chrome                     | Robust checklist requires latest 2 versions of major browsers.                |
| Ignoring `prefers-reduced-motion`          | Motion checklist (B.8) catches this.                                          |
| Placeholder-only labels                    | Always a MAJOR. Placeholders disappear on focus -- labels must persist.       |
| Validating on every keystroke              | Frustrates users. Validate on blur or submit per B.6.                         |
| Decoration-only animation                  | Every animation must serve a purpose (B.8). Remove or justify.                |
| Skipping UX heuristics for "small changes" | Small changes on critical paths (checkout, auth) still need heuristic review. |

---

## Evolution Hook

After completing this workflow, execute [Quick Capture](evolution.md#quick-capture-protocol) inline:

1. **Assess**: Any decisions, mistakes, conventions, or friction from this run?
2. **Write**: Append entries to `.claude/MEMORY.md` tables if yes.
3. **Timestamp**: Update `Last Updated` in MEMORY.md.

---

## Cross-References

- **Frontend rules (SSOT)**: [rules/frontend.md](../rules/frontend.md) -- WCAG, React patterns, Tailwind, state management, mandatory states checklist
- **Code style**: [rules/code-style.md](../rules/code-style.md) -- naming conventions, component patterns
- **Performance rules**: [rules/performance.md](../rules/performance.md) -- profiling methodology, Core Web Vitals
- **Design architect agent**: [agents/design-architect/design-architect.md](../agents/design-architect/design-architect.md) -- design systems, tokens, WCAG, UX philosophy
- **Interface artisan agent**: [agents/interface-artisan/interface-artisan.md](../agents/interface-artisan/interface-artisan.md) -- React components, Storybook, CDD
- **Experience engineer agent**: [agents/experience-engineer/experience-engineer.md](../agents/experience-engineer/experience-engineer.md) -- frontend architecture, performance, Core Web Vitals
- **i18n specialist agent**: [agents/i18n-specialist/i18n-specialist.md](../agents/i18n-specialist/i18n-specialist.md) -- localization, RTL support
- **Code review**: [/review](../review/SKILL.md) -- design-reviewer role references this workflow
- **Evolution**: [workflows/evolution.md](../../workflows/evolution.md) -- post-workflow memory capture
