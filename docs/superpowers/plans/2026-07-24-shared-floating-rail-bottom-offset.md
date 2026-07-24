# Shared Floating Rail Bottom Offset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anchor the enhanced floating enquiry rail 16px above the lower-right safe edge on both desktop and mobile.

**Architecture:** Keep one shared positioning contract in the base `.floating-form-rail` rule and retain the mobile media query only for mobile-specific sizing. No markup, controller, copy, route, or component-interface changes are needed.

**Tech Stack:** Astro 7 scoped CSS, TypeScript 6, Bun test.

## Global Constraints

- Every enhanced floating rail is anchored to the lower-right corner.
- Use `inset-block-end: calc(1rem + env(safe-area-inset-bottom, 0px))`.
- Use `inset-inline-end: calc(1rem + env(safe-area-inset-right, 0px))`.
- Bottom-align the rail children so the 44px toggle stays at the lower edge of the expanded panel.
- Keep the mobile width limit `inline-size: min(14.75rem, 100vw)`.
- Desktop continues to initialize expanded; mobile continues to initialize collapsed at `max-width: 48rem`.
- Preserve component markup, props, links, localized copy, disclosure behavior, Escape/focus restoration, inert state, reduced motion, static/no-JavaScript fallback, and the approved industrial palette.
- Do not modify or commit `.superpowers/brainstorm/`.

---

### Task 1: Share the lower-right offset across desktop and mobile

**Files:**
- Modify: `src/components/global/FloatingFormRail.astro`
- Test: `tests/floating-form-rail-render-contract.test.ts`

**Interfaces:**
- Consumes: the existing enhanced/static rail selectors and `max-width: 48rem` media query.
- Produces: one shared base positioning rule; no TypeScript or public interface changes.

- [ ] **Step 1: Write the failing render-contract test**

Replace the desktop placement test with assertions against the base `.floating-form-rail` rule:

```ts
test('anchors the enhanced rail above the lower-right safe edge at every viewport', async () => {
  const source = await read('../src/components/global/FloatingFormRail.astro');
  const sharedRail = source.match(/\.floating-form-rail\s*\{([^}]*)\}/)?.[1] ?? '';

  for (const declaration of [
    'align-items: flex-end',
    'inset-block-end: calc(1rem + env(safe-area-inset-bottom, 0px))',
    'inset-inline-end: calc(1rem + env(safe-area-inset-right, 0px))',
    'top: auto',
    'transform: none',
  ]) expect(sharedRail).toContain(declaration);

  expect(sharedRail).not.toContain('top: calc(5rem + var(--space-6))');
});
```

Update the mobile placement test so it asserts the compact width remains and placement is inherited rather than duplicated:

```ts
test('keeps only compact sizing in the mobile rail override', async () => {
  const source = await read('../src/components/global/FloatingFormRail.astro');
  const mobileRail = source.match(/@media \(max-width: 48rem\)\s*\{\s*\.floating-form-rail\s*\{([^}]*)\}/)?.[1] ?? '';

  expect(mobileRail).toContain('inline-size: min(14.75rem, 100vw)');
  for (const duplicate of ['align-items:', 'inset-block-end:', 'inset-inline-end:', 'top:', 'transform:']) {
    expect(mobileRail).not.toContain(duplicate);
  }
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`

Expected: FAIL because desktop still uses the header-relative top anchor and the mobile rule still owns the safe-edge placement.

- [ ] **Step 3: Implement the shared positioning rule**

Set the base rail declarations in `FloatingFormRail.astro` to include:

```css
align-items: flex-end;
inset-block-end: calc(1rem + env(safe-area-inset-bottom, 0px));
inset-inline-end: calc(1rem + env(safe-area-inset-right, 0px));
top: auto;
```

Keep its existing display, row direction, positioning, pointer-event, transform, translate, filter, transition, and z-index declarations. Reduce the mobile rail override to:

```css
.floating-form-rail {
  inline-size: min(14.75rem, 100vw);
}
```

Keep the adjacent mobile panel height rule unchanged. Do not change the static fallback; its existing `inset: auto` and `position: static` continue to override the enhanced positioning.

- [ ] **Step 4: Run focused verification to verify GREEN**

Run:

```text
bun test tests/floating-form-rail-render-contract.test.ts tests/motion.test.ts tests/living-design-contract.test.ts
bun run check
```

Expected: all focused tests pass and Astro reports 0 errors, warnings, and hints.

- [ ] **Step 5: Run complete verification and responsive QA**

Run:

```text
bun test
bun run build
git diff --check
```

Expected: all tests pass, the 42-page production build and generated-output verifiers pass, and the diff contains no whitespace errors. In browser QA at approximately `390x844` and `1440x900`, verify the rail is 16px plus safe-area inset from the bottom and right edges, mobile starts collapsed, desktop starts expanded, no horizontal overflow occurs, and the panel opens upward/inward.

- [ ] **Step 6: Commit**

```text
git add src/components/global/FloatingFormRail.astro tests/floating-form-rail-render-contract.test.ts
git commit -m "fix: align floating rail near bottom edge"
```
