# Remove Legacy Vietnamese Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every legacy Vietnamese compatibility URL so the static site emits only canonical `/vi/products`, `/vi/brands`, and `/vi/contact` routes.

**Architecture:** Delete the Astro redirect configuration and dynamic legacy detail pages, then tighten the executable route manifest so any legacy output is rejected as unexpected. Remove redirect-only verifier utilities and fixtures because the application no longer supports that behavior; keep all canonical localized route verification intact.

**Tech Stack:** Astro 7 static output, TypeScript, Bun test runner, Bun build verifiers.

## Global Constraints

- Remove all `/vi/san-pham`, `/vi/thuong-hieu`, and `/vi/lien-he` index and detail routes.
- Preserve canonical `/vi/products`, `/vi/brands`, and `/vi/contact` routes and all English routes.
- Generate exactly 32 HTML files: 30 canonical localized pages plus `index.html` and `404.html`.
- Preserve unrelated user changes in the primary checkout; work only in the isolated feature worktree.
- Add no replacement redirects, rewrite rules, aliases, dependencies, or runtime routing behavior.

---

### Task 1: Remove the complete legacy Vietnamese route surface

**Files:**
- Modify: `tests/i18n.test.ts`
- Modify: `tests/route-manifest.test.ts`
- Modify: `tests/verify-built-route-manifest.ts`
- Modify: `tests/living-build-verifier.test.ts`
- Modify: `tests/verify-built-living-design.ts`
- Modify: `tests/verify-built-mvp.ts`
- Modify: `astro.config.mjs`
- Delete: `src/pages/[locale]/san-pham/[slug].astro`
- Delete: `src/pages/[locale]/thuong-hieu/[slug].astro`

**Interfaces:**
- Consumes: `expectedGeneratedHtmlRoutes(): string[]` and `assertExactRouteManifest(distDir: string): void` from `tests/verify-built-route-manifest.ts`.
- Produces: a canonical-only 32-file static route contract; no legacy redirect route or redirect-verification interface remains.

- [ ] **Step 1: Write failing source and manifest tests for canonical-only routing**

In `tests/i18n.test.ts`, replace both legacy redirect tests with this test:

```ts
test('removes every legacy Vietnamese route', () => {
  const config = readFileSync(join(import.meta.dir, '..', 'astro.config.mjs'), 'utf8');
  const legacyRoutes = ['/vi/san-pham', '/vi/thuong-hieu', '/vi/lien-he'];

  for (const legacyRoute of legacyRoutes) expect(config).not.toContain(legacyRoute);
  for (const page of ['san-pham/[slug].astro', 'thuong-hieu/[slug].astro']) {
    expect(existsSync(join(import.meta.dir, '..', 'src', 'pages', '[locale]', page))).toBe(false);
  }
});
```

In `tests/route-manifest.test.ts`, replace the first test with:

```ts
test('accepts exactly the closed canonical route set', () => {
  const dist = fixture();
  const routes = expectedGeneratedHtmlRoutes();

  expect(routes).toHaveLength(32);
  expect(routes).toContain('index.html');
  expect(routes).toContain('404.html');
  expect(routes.some((route) => /vi\/(?:san-pham|thuong-hieu|lien-he)(?:\/|$)/.test(route))).toBe(false);
  expect(() => assertExactRouteManifest(dist)).not.toThrow();
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
bun test tests/i18n.test.ts tests/route-manifest.test.ts
```

Expected: FAIL because `astro.config.mjs` still contains the three legacy index redirects, both legacy detail route files still exist, and `expectedGeneratedHtmlRoutes()` still returns 44 entries including legacy paths.

- [ ] **Step 3: Remove legacy route generation**

In `astro.config.mjs`, delete this complete configuration block:

```js
  redirects: {
    '/vi/san-pham': '/vi/products',
    '/vi/thuong-hieu': '/vi/brands',
    '/vi/lien-he': '/vi/contact',
  },
```

Delete these files completely:

```text
src/pages/[locale]/san-pham/[slug].astro
src/pages/[locale]/thuong-hieu/[slug].astro
```

In `tests/verify-built-route-manifest.ts`, delete this complete legacy route block from `expectedGeneratedHtmlRoutes()`:

```ts
  routes.add(htmlRoute('vi', 'san-pham'));
  routes.add(htmlRoute('vi', 'thuong-hieu'));
  routes.add(htmlRoute('vi', 'lien-he'));
  for (const product of demoProducts) routes.add(htmlRoute('vi', 'san-pham', product.slug.vi));
  for (const brand of demoBrands) routes.add(htmlRoute('vi', 'thuong-hieu', brand.slug.vi));
```

- [ ] **Step 4: Remove redirect-only build-verifier code**

In `tests/living-build-verifier.test.ts`:

1. Remove `assertRedirect` from the import list.
2. Delete the `redirectPage` helper.
3. Delete the fixture loop that writes `vi/san-pham`, `vi/thuong-hieu`, and `vi/lien-he` files.
4. Delete the complete test named `rejects external redirect targets while accepting the configured origin canonical`.

In `tests/verify-built-living-design.ts`, delete the complete exported `assertRedirect` function and delete the legacy redirect verification loop inside `verifyBuiltLivingDesign`. Do not remove `normalizedPath` or `requireRootRelativeTarget`, because canonical asset and JavaScript verification still uses them.

In `tests/verify-built-mvp.ts`, replace:

```ts
const compatibilityRedirectPrefixes = ['vi/san-pham/', 'vi/thuong-hieu/', 'vi/lien-he/'];
const canonicalLocalizedPages = generatedHtml
  .map((path) => ({ path, normalizedPath: path.replaceAll('\\', '/') }))
  .filter(({ normalizedPath }) => /^(?:en|vi)\//.test(normalizedPath)
    && !compatibilityRedirectPrefixes.some((prefix) => normalizedPath.startsWith(prefix)));
```

with:

```ts
const canonicalLocalizedPages = generatedHtml
  .map((path) => ({ path, normalizedPath: path.replaceAll('\\', '/') }))
  .filter(({ normalizedPath }) => /^(?:en|vi)\//.test(normalizedPath));
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
bun test tests/i18n.test.ts tests/route-manifest.test.ts tests/living-build-verifier.test.ts
```

Expected: all focused tests pass with no failures.

- [ ] **Step 6: Verify the complete project**

Run:

```powershell
bun test
bun run check
bun run build
```

Expected: the complete test suite passes, Astro check reports zero errors, and the build finishes with `Verified exact 32-page generated HTML route manifest.` The pre-existing Astro duplicate-root priority warning may still appear during the build and is outside this route-removal scope.

- [ ] **Step 7: Commit the implementation**

```powershell
git add astro.config.mjs tests/i18n.test.ts tests/route-manifest.test.ts tests/verify-built-route-manifest.ts tests/living-build-verifier.test.ts tests/verify-built-living-design.ts tests/verify-built-mvp.ts 'src/pages/[locale]/san-pham/[slug].astro' 'src/pages/[locale]/thuong-hieu/[slug].astro'
git commit -m "refactor: remove legacy Vietnamese routes"
```

