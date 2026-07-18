# Dynamic Locale Static Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate duplicated English and Vietnamese Astro page trees into typed `[locale]` routes while preserving fully static output and every current public URL.

**Architecture:** A canonical readonly locale tuple drives Astro i18n configuration, the `Locale` union, and reusable locale static paths. Locale-only pages enumerate the tuple; detail pages enumerate valid locale/slug pairs with build-time props and stable-ID counterpart maps.

**Tech Stack:** Astro 7.0.9, TypeScript 6, Bun test runner, Astro static output

## Global Constraints

- Keep `output: 'static'` and Astro 7.0.9 behavior.
- Keep `/en/...` and `/vi/...` public URLs and shared section segments.
- Keep `locales = ['en', 'vi'] as const` as the canonical locale declaration.
- Add no runtime router, catch-all page, dependency, or server-rendered route.
- Preserve all current uncommitted page content while consolidating the files.
- Unsupported locales and unknown detail slugs must not be emitted.
- Every dynamic path parameter returned by `getStaticPaths()` must be a string.

---

### Task 1: Canonical locale and static-path boundary

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/lib/i18n/types.ts`
- Create: `src/lib/i18n/static-paths.ts`
- Modify: `tests/i18n.test.ts`

**Interfaces:**
- Produces: `locales: readonly ['en', 'vi']`, `defaultLocale: 'en'`, `type Locale = (typeof locales)[number]`
- Produces: `getLocaleStaticPaths(): Array<{ params: { locale: Locale }; props: { locale: Locale } }>`
- Produces: `counterpartLocale(locale: Locale): Locale`

- [ ] **Step 1: Write failing tests for the locale boundary**

Add assertions that `getLocaleStaticPaths()` returns exactly the two string-valued locale params and matching props, `counterpartLocale()` is reciprocal, and Astro configuration imports the canonical locale values instead of declaring a second locale array.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `bun test tests/i18n.test.ts`

Expected: failure because `src/lib/i18n/static-paths.ts` and its exports do not exist.

- [ ] **Step 3: Implement the minimal typed boundary**

Derive `Locale` from the existing tuple, export `defaultLocale`, add the two static-path helpers, and import the canonical values into `astro.config.mjs`. Keep the tuple in a TypeScript module that Astro's config loader can import.

- [ ] **Step 4: Verify GREEN and static configuration loading**

Run: `bun test tests/i18n.test.ts && bun run check`

Expected: all focused tests pass and Astro reports zero diagnostics.

- [ ] **Step 5: Commit only Task 1 files**

Run: `git add astro.config.mjs src/lib/i18n/types.ts src/lib/i18n/static-paths.ts tests/i18n.test.ts && git commit -m "refactor: centralize locale static paths"`

### Task 2: Consolidated `[locale]` static route tree

**Files:**
- Create: `src/pages/[locale]/index.astro`
- Create: `src/pages/[locale]/products/index.astro`
- Create: `src/pages/[locale]/products/[slug].astro`
- Create: `src/pages/[locale]/brands/index.astro`
- Create: `src/pages/[locale]/brands/[slug].astro`
- Create: `src/pages/[locale]/contact.astro`
- Create: `src/pages/[locale]/contact/[mode].astro`
- Delete: corresponding files under `src/pages/en` and `src/pages/vi`
- Modify: route source-contract tests under `tests/`
- Modify: generated-output verifiers only where their source-path assumptions require it

**Interfaces:**
- Consumes: `getLocaleStaticPaths()` and `counterpartLocale()` from Task 1
- Produces: the same `/en/` and `/vi/` static route matrix as before, without duplicated locale page files

- [ ] **Step 1: Write failing route-structure and static-output contracts**

Add a test that requires the seven `[locale]` page shapes, rejects the former `en` and `vi` route trees, and verifies each dynamic route declares `getStaticPaths()`. Update existing source-path fixtures to target the consolidated files without weakening their behavioral assertions.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `bun test tests/i18n.test.ts tests/catalog-routes.test.ts tests/brand-routes.test.ts tests/enquiry-render-contract.test.ts tests/homepage-composition.test.ts tests/homepage-contract.test.ts tests/living-design-contract.test.ts`

Expected: failure because the `[locale]` files do not yet exist and the old trees still exist.

- [ ] **Step 3: Consolidate locale-only pages**

Move the current page bodies into the `[locale]` files. Export `getStaticPaths = getLocaleStaticPaths`, consume the trusted locale from `Astro.props`, and derive the counterpart locale centrally. Preserve the current markup, CMS calls, styles, paths, preloads, and localized copy exactly.

- [ ] **Step 4: Consolidate detail and contact-mode pages**

For product and brand details, return every valid `{ locale, slug }` entry and its localized props from one build-time query per locale. Build reciprocal paths by stable record ID and retain index-route fallbacks. For contact modes, enumerate the Cartesian product of locales and the existing `customer`/`supplier` string modes.

- [ ] **Step 5: Verify focused GREEN**

Run the focused command from Step 2.

Expected: all focused route and source-contract tests pass.

- [ ] **Step 6: Verify all static behavior**

Run: `bun test && bun run check && bun run build && git diff --check`

Expected: zero test failures, zero Astro diagnostics, successful generated-output verifiers, and no whitespace errors.

- [ ] **Step 7: Commit only Task 2 files**

Stage the consolidated route tree, deleted locale trees, and directly updated route/build contract tests. Commit with `git commit -m "refactor: generate locale routes statically"` without staging unrelated working-tree changes.
