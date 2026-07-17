# Floating Enquiry Rail Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic dark floating rail with a Living Ingredients ingredient-label treatment while preserving all existing enquiry destinations and accessibility behavior.

**Architecture:** Keep `FloatingFormRail.astro` as the single server-rendered component and `floating-rail.ts` as the behavior controller. Add only localized label/title copy, semantic label/heading/marker markup, and scoped component CSS; no route or controller threshold changes.

**Tech Stack:** Astro 7, TypeScript, CSS custom properties, Bun tests, Playwright browser QA.

## Global Constraints

- Preserve `data-floating-rail`, `data-floating-rail-toggle`, `data-expanded`, `data-visible`, `aria-controls`, `staticOnly`, and all three existing contact URLs.
- Use only approved tokens: `--color-rice-paper`, `--color-paper-white`, `--color-deep-herb`, `--color-paradise-orange`, `--color-mist-blue`.
- Use Newsreader only for the small panel heading; use Nunito for controls and action labels.
- Keep 44px minimum action targets, visible focus, reduced-motion behavior, no-JavaScript anchors, and the script-free 404 fallback.
- No gradients, shadows, glassmorphism, new dependencies, or legacy/3D runtime code.

---

### Task 1: Localized copy and semantic rail markup

**Files:**
- Modify: `src/lib/i18n/ui.ts:26-33,173,211`
- Modify: `src/components/global/FloatingFormRail.astro:5-34`
- Test: `tests/floating-form-rail-render-contract.test.ts`

**Interfaces:**
- `UiCopy['floatingRail']` gains `label` and `panelTitle` strings.
- `FloatingFormRail.astro` continues to consume `locale`, `contactPath`, `copy`, and `staticOnly` with no route changes.

- [ ] **Step 1: Extend the copy contract and add failing assertions**

Add `label` and `panelTitle` to the `floatingRail` interface and EN/VI values. Extend the rendering contract test to require:

```ts
expect(source).toContain('data-floating-rail-label');
expect(source).toContain('data-floating-rail-title');
expect(source).toContain('aria-hidden="true"');
```

Run: `bun test tests/floating-form-rail-render-contract.test.ts`
Expected: FAIL because the new copy and markers are absent.

- [ ] **Step 2: Implement the semantic markup**

Inside the rail, add the compact label, an `aria-hidden` orange marker, and a panel heading without changing the toggle or anchor hrefs:

```astro
<span class="floating-form-rail__label" data-floating-rail-label aria-hidden="true">{copy.label}</span>
<span class="floating-form-rail__marker" aria-hidden="true"></span>
<nav id="floating-rail-panel" class="floating-form-rail__panel" aria-label={copy.navigation}>
  <div class="floating-form-rail__heading" data-floating-rail-title>{copy.panelTitle}</div>
  ...existing three anchors...
</nav>
```

- [ ] **Step 3: Run the focused contract test**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n/ui.ts src/components/global/FloatingFormRail.astro tests/floating-form-rail-render-contract.test.ts
git commit -m "feat: add living ingredients rail labels"
```

### Task 2: Ingredient-label visual treatment

**Files:**
- Modify: `src/components/global/FloatingFormRail.astro:42-141`
- Test: `tests/living-design-contract.test.ts`
- Test: `tests/mvp-completion.test.ts`

**Interfaces:**
- CSS remains component-scoped; controller state selectors continue to be the source of visibility and expansion truth.

- [ ] **Step 1: Add design contract assertions**

Require the component source to use the approved palette and intentional visual signature:

```ts
expect(rail).toContain('var(--color-rice-paper)');
expect(rail).toContain('var(--color-paradise-orange)');
expect(rail).toContain('clip-path');
expect(rail).toContain('font-family: var(--font-display)');
```

Run: `bun test tests/living-design-contract.test.ts tests/mvp-completion.test.ts`
Expected: FAIL until the new selectors are implemented.

- [ ] **Step 2: Replace the generic rail CSS**

Use these rules as the implementation baseline:

```css
.floating-form-rail { align-items: flex-end; gap: .5rem; }
.floating-form-rail__toggle { background: var(--color-deep-herb); border: 0; border-inline-start: .25rem solid var(--color-paradise-orange); color: var(--color-rice-paper); min-block-size: 4.5rem; position: relative; }
.floating-form-rail__label { color: var(--color-rice-paper); font-size: var(--text-xs); letter-spacing: var(--tracking-label); writing-mode: vertical-rl; transform: rotate(180deg); }
.floating-form-rail__panel { background: var(--color-paper-white); border-block-start: .25rem solid var(--color-paradise-orange); clip-path: polygon(0 0, 100% 0, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0 100%); min-inline-size: min(19rem, calc(100vw - 2rem)); padding: 1rem; }
.floating-form-rail__heading { color: var(--color-deep-herb); font-family: var(--font-display); font-size: var(--text-lg); }
.floating-form-rail__panel a { background: transparent; border: 0; border-block-start: 1px solid color-mix(in srgb, var(--color-deep-herb) 18%, transparent); color: var(--color-deep-herb); justify-content: space-between; }
.floating-form-rail__panel a:hover, .floating-form-rail__panel a:focus-visible { background: var(--color-mist-blue); color: var(--color-deep-herb); }
```

Keep the existing ready/visible/expanded selectors, no-JS toggle hiding, mobile one-column panel and reduced-motion block. Add a small orange marker via `.floating-form-rail__marker` rather than decorative icons.

- [ ] **Step 3: Run focused tests and typecheck**

Run: `bun test tests/living-design-contract.test.ts tests/mvp-completion.test.ts && bun run check`
Expected: PASS with 0 Astro diagnostics.

- [ ] **Step 4: Commit**

```bash
git add src/components/global/FloatingFormRail.astro tests/living-design-contract.test.ts tests/mvp-completion.test.ts
git commit -m "feat: restyle floating rail for living ingredients"
```

### Task 3: Generated output and browser QA

**Files:**
- Modify: `.superpowers/sdd/progress.md`
- Test: `tests/motion.test.ts`
- Test: `tests/verify-built-mvp.ts`

- [ ] **Step 1: Run the complete test suite**

Run: `bun test`
Expected: all tests pass.

- [ ] **Step 2: Build and run generated verifiers**

Run: `bun run build`
Expected: Astro build completes, localized rail destinations remain present, script-free 404 remains valid, and all verifiers pass.

- [ ] **Step 3: Verify browser states**

At desktop, scroll beyond one viewport and verify the label tab appears, opens the paper panel, closes on Escape, and returns focus to the toggle. At 390×844, verify stacked actions, all targets ≥44px, localized Vietnamese labels fit, and `document.documentElement.scrollWidth === innerWidth`.

- [ ] **Step 4: Update the SDD ledger and inspect the diff**

Record the redesign and verification results in `.superpowers/sdd/progress.md`. Run `git diff --check` and `git status --short`; expect no whitespace errors and only intended changes.

- [ ] **Step 5: Commit**

```bash
git add .superpowers/sdd/progress.md tests/motion.test.ts tests/verify-built-mvp.ts
git commit -m "test: verify living ingredients rail redesign"
```
