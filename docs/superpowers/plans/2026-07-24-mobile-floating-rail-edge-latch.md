# Mobile Floating Rail Edge-Latch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile floating enquiry rail load as a compact lower-right edge latch while preserving its desktop, accessibility, static fallback, content, and route contracts.

**Architecture:** Keep the existing Astro component markup and disclosure controller split. Add a testable initial viewport query to the controller and refine only the component's mobile CSS; no new component, copy, or runtime listener is needed.

**Tech Stack:** Astro 7, TypeScript 6, scoped CSS, Bun test.

## Global Constraints

- At viewport widths up to and including `48rem`, the enhanced rail starts visible and collapsed.
- Above `48rem`, or when `matchMedia` is unavailable, the enhanced rail starts visible and expanded.
- Mobile positioning uses the lower-right safe edge with no decorative outer gap.
- The mobile row bottom-aligns its children and uses `inline-size: min(14.75rem, 100vw)`.
- Desktop placement remains `top: calc(5rem + var(--space-6))` and desktop starts expanded.
- Preserve all component props, DOM structure, three link destinations, localized accessibility copy, Escape/focus behavior, inert state, reduced-motion behavior, and static/no-JavaScript fallback.
- Use only the existing graphite, process-white, brushed-steel, and Paradise-orange presentation tokens.
- Do not modify or commit `.superpowers/brainstorm/`.

---

### Task 1: Implement and verify the mobile edge latch

**Files:**
- Modify: `src/lib/motion/floating-rail.ts`
- Modify: `src/components/global/FloatingFormRail.astro`
- Test: `tests/motion.test.ts`
- Test: `tests/floating-form-rail-render-contract.test.ts`

**Interfaces:**
- Consumes: the existing `initializeFloatingRail(root, dependencies?)` controller and unchanged component markup.
- Produces: `FloatingRailDependencies.matchMedia?: (query: string) => Pick<MediaQueryList, 'matches'>` and initial state selected with the exact query `(max-width: 48rem)`.

- [ ] **Step 1: Write failing controller tests**

Refactor the floating-rail harness in `tests/motion.test.ts` only as much as needed to exercise two initial states. Inject a matching media query and assert a ready, visible, collapsed mobile rail with `panel.inert === true`, `aria-expanded="false"`, and the open label. Keep the existing interaction, Escape/focus, disposal assertions in the desktop case, inject a non-matching query there, and continue asserting ready, visible, expanded state. Add a third initialization assertion showing omitted `matchMedia` preserves the expanded fallback.

- [ ] **Step 2: Run the controller test to verify RED**

Run: `bun test tests/motion.test.ts`

Expected: FAIL because `FloatingRailDependencies` has no `matchMedia` seam and mobile initialization still expands the rail.

- [ ] **Step 3: Implement viewport-aware initial state**

In `src/lib/motion/floating-rail.ts`, add this optional dependency:

```ts
matchMedia?: (query: string) => Pick<MediaQueryList, 'matches'>;
```

Resolve it from the dependency first, otherwise from `window.matchMedia.bind(window)` when available. After setting ready and visible state, call `setExpanded(!matchMedia?.('(max-width: 48rem)').matches)`. Do not add a media-query change listener.

- [ ] **Step 4: Run the controller test to verify GREEN**

Run: `bun test tests/motion.test.ts`

Expected: all motion tests pass with pristine output.

- [ ] **Step 5: Write failing responsive render-contract assertions**

In `tests/floating-form-rail-render-contract.test.ts`, parse the mobile `.floating-form-rail` rule inside the `max-width: 48rem` block and assert it contains:

```text
align-items: flex-end
inset-block-end: env(safe-area-inset-bottom, 0px)
inset-inline-end: env(safe-area-inset-right, 0px)
inline-size: min(14.75rem, 100vw)
top: auto
```

Remove the obsolete mobile-width expectation for `min(16.75rem, calc(100vw - 2rem))`. Retain all desktop, static fallback, structure, sizing, transition, and forbidden-decoration assertions.

- [ ] **Step 6: Run the render test to verify RED**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`

Expected: FAIL because the current mobile rule is top-aligned, offset by `1rem`, and wider than the requested latch.

- [ ] **Step 7: Implement the mobile edge styling**

Change only the mobile `.floating-form-rail` declarations in `FloatingFormRail.astro` to:

```css
.floating-form-rail {
  align-items: flex-end;
  flex-direction: row;
  inset-block-end: env(safe-area-inset-bottom, 0px);
  inset-inline-end: env(safe-area-inset-right, 0px);
  inline-size: min(14.75rem, 100vw);
  top: auto;
  transform: none;
}
```

Keep the existing panel, desktop, static fallback, inert, and reduced-motion rules unchanged.

- [ ] **Step 8: Run focused and complete verification**

Run in order:

```text
bun test tests/motion.test.ts tests/floating-form-rail-render-contract.test.ts tests/living-design-contract.test.ts
bun run check
bun test
bun run build
```

Expected: every command exits `0`; the full test suite remains at least 195 passing tests with no failures, and the static production build verifiers pass.

- [ ] **Step 9: Perform responsive browser QA**

Start the project with the repository's documented Astro background-server workflow. At a representative mobile viewport such as `390x844`, verify the initial 44px latch sits at the lower-right safe edge, has no horizontal overflow, opens upward/inward, exposes all three localized actions, closes with Escape, and keeps focus visible. At a representative desktop viewport such as `1440x900`, verify the rail remains expanded below the header and clear of mid-page controls. Confirm reduced-motion mode removes the rail transition. Record the evidence in the task report; do not commit generated screenshots or scratch logs.

- [ ] **Step 10: Commit**

```text
git add src/lib/motion/floating-rail.ts src/components/global/FloatingFormRail.astro tests/motion.test.ts tests/floating-form-rail-render-contract.test.ts
git commit -m "fix: tuck mobile enquiry rail into edge"
```
