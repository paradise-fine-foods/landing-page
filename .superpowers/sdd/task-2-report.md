# Task 2 report: shared shell and enquiry rail

## RED evidence

Command:

```text
bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts
```

Result: 22 passing, 3 failing assertions. The failures were the expected old rail motion/mask/shadow contract plus old button-shell palette consumers.

## GREEN evidence

Command:

```text
bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts tests/motion.test.ts tests/icon-system.test.ts
```

Result: 40 passing, 0 failing, 303 assertions.

## Full suite

Command:

```text
bun test
```

Result: 188 passing, 0 failing, 1,017 assertions.

## Changed files

- `tests/living-design-contract.test.ts`
- `tests/floating-form-rail-render-contract.test.ts`
- `src/components/global/Header.astro`
- `src/components/global/Footer.astro`
- `src/components/global/ButtonLink.astro`
- `src/components/global/Breadcrumbs.astro`
- `src/components/global/LanguageSwitcher.astro`
- `src/components/global/OrganicMark.astro`
- `src/components/global/FloatingFormRail.astro`

## Commit

`986d014` — `style: simplify shared shell and enquiry rail`

## Self-review

- CSS-only modifications preserved all component markup, attributes, imports, scripts, routes, and rail controller selectors.
- The rail has no `clip-path`, `drop-shadow`, entrance keyframes, or 360ms cubic-bezier declarations.
- Motion respects the reduced-motion override; touch targets remain at least 2.75rem.
- `git diff --check` passed.

## Concerns

- No task-scoped concerns. An unrelated pre-existing modification to `docs/superpowers/plans/2026-07-22-industrial-styling.md` was left unmodified and unstaged.

## Follow-up transition-token fix

The review-required follow-up replaced the toggle's raw `160ms ease` declaration with `var(--transition-fast)`, while retaining `transition: translate var(--transition-base)` on the rail container. The contracts now assert both exact declarations rather than a loose raw-duration substring.

- RED: the focused living-design contract failed on the raw toggle transition.
- GREEN: `bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts tests/motion.test.ts tests/icon-system.test.ts` — 40 passing, 0 failing, 305 assertions.
- Full: `bun test` — 188 passing, 0 failing, 1,019 assertions.
- Follow-up commit: `e752bf9` — `fix: use canonical rail transition tokens`.
