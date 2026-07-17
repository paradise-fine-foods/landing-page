# Task 3 report: expose floating rail across locales

Commit: `feat: expose floating rail across locales`

## Delivered

- Rendered `FloatingFormRail` once in `SiteLayout.astro`, after the footer and outside the main landmark, with the locale-specific contact path and UI copy.
- Added source assertions for the shared-layout imports, exact invocation, placement, and the English/Vietnamese buy, sell, and contact labels.
- Extended the built-MVP verifier to inspect 26 canonical localized pages for the rail marker, retail and other enquiry destinations, and the panel control relationship. Windows glob paths are normalized only for route filtering.
- Added the rail copy family to the parseable production ownership manifest so every new localized UI leaf has exactly one owner.

## Verification

- `bun test tests/living-design-contract.test.ts tests/mvp-completion.test.ts` — 25 passed, 0 failed.
- `bun run check` — 0 errors, 0 warnings, 0 hints.
- `bun run build` — passed; built-output verification reported the existing MVP line and `Verified floating rail on 26 canonical localized pages.`

## Concern

- Astro continues to emit its existing root-route-priority warning during the build; it does not affect this task or the passing verifiers.
