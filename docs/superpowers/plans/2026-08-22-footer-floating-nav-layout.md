# Footer and Floating Navigation Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Stack footer and floating enquiry anchors vertically and add transition motion to floating-rail disclosure.

**Architecture:** Preserve existing Astro markup and controller state. Apply scoped CSS changes in `Footer.astro` and `FloatingFormRail.astro`, with source-contract tests proving vertical flow and transition declarations.

**Tech Stack:** Astro 7, scoped component CSS, TypeScript, Bun tests.

## Global Constraints

- Preserve all existing routes, localized copy, ARIA attributes, inert behavior, Escape handling, focus restoration, and no-JavaScript fallback.
- Floating links remain vertical at every viewport; do not restore the mobile three-column grid.
- Respect `prefers-reduced-motion: reduce`.
- No new dependencies.

### Task 1: Footer and floating rail layout repair

**Files:**
- Modify: `src/components/global/Footer.astro`
- Modify: `src/components/global/FloatingFormRail.astro`
- Test: `tests/floating-form-rail-render-contract.test.ts`

- [ ] Write failing source-contract assertions for vertical footer/floating link flow and transition-safe collapsed state.
- [ ] Run focused tests and confirm expected failures.
- [ ] Add scoped footer column-flow rules; remove mobile floating panel grid columns; replace enhanced collapsed `display: none` with visibility/opacity/translation state and add matching transitions.
- [ ] Run focused tests, `bun run check`, `bun test`, and `bun run build`.
- [ ] Commit as `fix: repair footer and floating nav layout`.

### Task 2: Review and browser verification

**Files:**
- No planned production changes unless review finds a defect.

- [ ] Review Task 1 diff against this plan and accessibility constraints.
- [ ] Use Browser to verify desktop and mobile footer stacking, floating links stacking, open/close transition, Escape close, and no overflow.
- [ ] Fix any Critical/Important review findings, rerun covering tests, then commit fixes.
- [ ] Deploy from `main` to Cloudflare and verify deployed behavior in Browser and Cloudflare dashboard.
