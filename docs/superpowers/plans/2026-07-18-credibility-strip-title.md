# Credibility Strip Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the credibility-strip heading unmistakably prominent above its four proof points on desktop and mobile.

**Architecture:** Preserve the existing component API and semantic markup. Change only the component's layout and typography, backed by a source contract and browser verification.

**Tech Stack:** Astro, scoped CSS, Bun tests.

## Global Constraints

- Retain the existing `h2`, `aria-labelledby`, list markup, localized copy, orange markers, divider, and reveal motion.
- Use the existing Newsreader display token; add no dependency and no new component prop.
- Keep English and Vietnamese structurally identical and responsive without horizontal overflow.

---

### Task 1: Promote the credibility heading

**Files:**
- Modify: `tests/homepage-contract.test.ts`
- Modify: `src/components/sections/CredibilityStrip.astro`

**Interfaces:**
- Consumes: existing `Props { title: string; pillars: Pillar[] }`
- Produces: unchanged component interface with title-first visual hierarchy

- [ ] **Step 1: Write the failing source contract**

Add assertions beside the existing credibility-strip contract:

```ts
expect(credibility).toContain('grid-template-columns: 1fr');
expect(credibility).toContain('font-family: var(--font-display)');
expect(credibility).toContain('font-size: var(--text-2xl)');
expect(credibility).not.toContain('grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 2.2fr)');
expect(credibility).not.toContain('font-family: var(--font-body)');
```

- [ ] **Step 2: Verify RED**

Run `bun test tests/homepage-contract.test.ts` and expect the new display-title assertions to fail against the current two-column compact-label styles.

- [ ] **Step 3: Implement the minimal title-first styles**

Keep markup unchanged. Set `.credibility__flow` to a one-column grid, give the heading `var(--font-display)`, `var(--text-2xl)`, editorial line-height and a controlled readable width, then let the list occupy its own wrapping row. Preserve the mobile vertical list rule.

- [ ] **Step 4: Verify GREEN and regressions**

Run:

```powershell
bun test tests/homepage-contract.test.ts
bun test
bun run check
bun run build
```

Expected: all commands pass with zero test failures and zero Astro diagnostics.

- [ ] **Step 5: Browser QA**

Inspect `/en/` and `/vi/` at desktop and 390px mobile widths. Confirm the title is a distinct display heading above the proof points, the four items wrap or stack cleanly, there is no horizontal overflow, and the browser console is clean.
