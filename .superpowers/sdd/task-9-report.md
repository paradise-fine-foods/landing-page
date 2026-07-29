# Task 9 Report: Cross-repository Integration and Release Evidence

## Status

Implementation and local source verification are complete. Deployment/runtime
gates are recorded separately as passed, failed, or blocked; a blocked gate is
never counted as a pass.

## Narrow fixes discovered by integration

- Changed Astro i18n to `routing: 'manual'`. With custom locale middleware,
  Astro's automatic prefix-always finalizer converted an internal rewrite to
  `/503` into a localized 404. The installed Astro 7 source and types confirm
  that manual routing disables the built-in i18n middleware.
- Exempted the internal `/503` and `/503/` rewrite targets from locale
  redirection. The live outage probe exposed a `302 /en/503` followed by 404;
  the error rewrite now delegates directly to Astro and retains the intended
  503 response.
- Added a deterministic fake Directus for Worker/runtime proof where the local
  Directus Core license cannot execute filtered anonymous permissions. It uses
  the production SDK/repository/mappers, supports a post-build mutation and CMS
  outage, and does not stand in for Directus permission, hook, or Flow proof.
- Added release gates and a native Python Playwright matrix for response state,
  initial HTML, reciprocal SEO, desktop/mobile layout, keyboard focus,
  JavaScript-disabled behavior, reduced motion, image dimensions, and overflow.
- Strengthened the browser manifest contract so raw initial HTML and the
  browser DOM each require the route's exact absolute canonical URL and exact
  English/Vietnamese alternate targets. Screenshot evidence now uses a
  sanitized path plus a path digest, locale, and viewport to prevent
  same-locale route collisions.
- Replaced the fake Directus one-pixel PNG with a real 1200x800 PNG and added
  an IHDR assertion against the served asset, preserving the declared CMS
  dimensions end-to-end.

The generated fixture proves image decoding and the declared layout dimensions,
but its uniformly colored, highly compressible pixels and local Wrangler
delivery are not a production CDN/media-weight prediction. The recorded
Lighthouse scores remain gate evidence for this fixture, not representative
image-transfer performance claims.

## TDD evidence

### RED

- The release-gate suite first failed because `scripts/release-gates.mjs` did
  not exist.
- The fake-Directus suite first failed because
  `scripts/fake-directus-server.mjs` did not exist. Its first implementation
  then exposed a nested SDK slug-filter parsing defect before the recursive
  filter walker was corrected.
- The locale contract passed 16 tests and failed 1 before manual routing was
  enabled, proving the custom locale middleware did not yet own routing.
- The live outage follow-up produced 16 passes and 3 focused failures before
  both `/503` forms bypassed redirection; the corrected five-suite error/routing
  scope passes 41 tests with 211 assertions.

### GREEN

- Fake Directus: 4 passed, 0 failed, 21 expect/assertion calls. The final regression proves
  exact filter-field matching: `published_at` and composite fields cannot be
  mistaken for the stable `id` field, and English/Vietnamese blog details load
  through the production query/repository/mapper path.
- Python Playwright harness: Python 3.13 syntax compilation passed.
- Full Astro suite: 292 passed, 0 failed, 1,833 assertions across 38 files.

## Exactly-once Worker boundary

The final Cloudflare build exited 0 and verified 14 source routes and 15
emitted Worker routes. `dist/server/entry.mjs` was 295,151 bytes with SHA-256
`5D9D83319927FB07F696DEF1C97D3458AA3088F5ACA42DCE02207C83CBBE9E6B` and
mtime `2026-07-29T07:57:13.787Z`; all three remained unchanged after the
post-build mutation.

Before mutation, the English/Vietnamese product and blog details all returned
200. The guarded mutation returned 204. Without rebuilding, all four new
localized details, four fresh-cache-key localized indexes, and the sitemap
returned 200. Initial HTML checks confirmed localized footer content,
canonical/reciprocal hreflang metadata, stable island fallback markup, and
explicit image dimensions. An unknown slug returned 404. With fake Directus
outage enabled, the direct request returned 503 with `noindex` and
`Cache-Control: no-store`.

The Playwright matrix passed exactly 4 routes and 16 desktop/mobile, keyboard,
no-JavaScript, reduced-motion, layout, image, initial-HTML, and SEO checks. It
produced exactly 8 uniquely named screenshots: one desktop and one mobile
capture for each route.

## Deployment gates

- Canonical clean-image Directus integration: **BLOCKED** locally because the
  Docker CLI/daemon is unavailable.
- Licensed anonymous published/draft permission proof: **BLOCKED** locally
  because Directus 12.1.1 Core reports
  `custom_permission_rules_enabled: false`; it must run on the licensed
  deployment.
- Live custom Directus hook and revalidation Flow: **BLOCKED** on the local
  fallback runtime because its extension loader did not load the hooks.
- Lighthouse 13.4.1 passed performance/SEO at 100/100 for both product and
  blog with no `runWarnings`. Both commands used quoted
  `--only-categories="performance,seo"`, desktop 1200x800 emulation, and the
  fake Directus asset whose PNG IHDR is 1200x800.
- Revalidation authentication passed: the same-origin JSON bad secret returned
  401 without disclosure. A correct-secret request was not sent with
  placeholder local zone/token values, so successful purge remains **BLOCKED**
  until the configured deployment.

## Verification

- Full `bun test`: 292 passed, 0 failed, 1,833 assertions across 38 files.
- `bun run check`: 136 files, 0 errors, 0 warnings, 0 hints. Wrangler
  emitted its known sandbox-only log-write `EPERM` diagnostic; the check still
  exited successfully.
- Node UTF-8 verification found no mojibake markers in Task 9 fixtures, tests,
  docs, or this report and confirmed representative Vietnamese strings.
- Final `bun run build`: exit 0; 14 source routes and 15 emitted Worker routes.
  The artifact fingerprint above remained unchanged through post-build proof.
- Task-scoped `git diff --check`: clean.

## Preserved work

Existing dirty Task 2 and Task 3 reports were not modified or staged. Process
logs and other temporary runtime evidence were removed after verification.
This report and the Task 9 source changes are intended for the final Task 9
commit.
