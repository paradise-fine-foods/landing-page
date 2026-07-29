# Task 8 Report: Deferred Recommendations and Runtime SEO Sitemap

## Status

Implementation complete and verified.

## Documentation and inherited scope

- Read the complete Task 8 brief, approved Directus/Astro design and plan,
  Task 5 through Task 7 reports, progress ledger, current runtime routes,
  repository/query boundaries, cache middleware, metadata layout, and related
  tests.
- Used current Astro documentation from Context7 (`/withastro/docs`). The
  selected Astro 7 contract uses `server:defer` on the server component and a
  child with `slot="fallback"`; Astro builds a separate runtime endpoint for
  the island. Runtime `.xml.ts` endpoints return a standard `Response`, so the
  sitemap owns its status, content type, and cache headers explicitly.
- Preserved primary SSR content. Product details, blog article headings/body,
  homepage stories, and product/brand/blog indexes remain direct initial
  server HTML. Only related products and article suggestions are deferred.

## TDD evidence

### RED

Command:

```powershell
bun test tests/server-islands.test.ts tests/sitemap.test.ts tests/i18n.test.ts tests/blog-render.test.ts
```

Result: `12 pass`, `4 fail`, and `2` expected missing-module errors. The
failures proved that the recommendation loaders and sitemap endpoint did not
exist, the article hero lacked explicit eager/high-priority treatment, and
Open Graph metadata lacked the reciprocal locale.

### GREEN

The same focused scope passed `23 pass`, `0 fail`, with `185 expect()` calls
after the minimal implementation. The expanded route/island/sitemap scope
then passed `40 pass`, `0 fail`, with `338 expect()` calls.

The new tests execute behavior rather than relying only on source contracts:

- injected related-product and blog queries prove stable-ID inputs, current
  record exclusion, relationship matching, ordering, and the three-card limit;
- the compiled Astro skeleton proves the rendered status/live/busy semantics
  and card count;
- the real sitemap response builder runs injected English and Vietnamese CMS
  queries and proves product, brand, blog, and fixed route XML, deduplication,
  escaping, reciprocal alternates, headers, known-CMS 503 handling, and
  programming-error propagation.

## Implementation

- Added query-owning `RelatedProductsIsland.astro` and
  `BlogSuggestionsIsland.astro` components. Detail routes pass only locale and
  stable product/post/relation IDs; no prefetched recommendation arrays cross
  a `server:defer` boundary.
- Removed the full catalog request from initial product-detail loading and the
  latest-post request from initial article loading. Query failures are now
  isolated to Astro's server-island endpoint while the primary page can render.
- Added a shared fixed-layout `CardSkeleton.astro` fallback with visible section
  context, `role="status"`, polite live semantics, `aria-busy`, three reserved
  card areas, and a reduced-motion rule that removes animation.
- Added request-time `/sitemap.xml` generation from the published-only CMS
  query boundary for both locales. It includes all fixed localized public
  routes plus localized product, brand, and blog details, matches translations
  by stable parent ID, emits reciprocal XHTML alternates, XML-escapes all
  absolute URLs, and deduplicates locations.
- Successful sitemap responses use `application/xml; charset=utf-8` and the
  existing one-hour/24-hour-stale public cache policy. Known CMS data/transport
  failures return a non-sensitive `503` text response with `no-store`, while
  programming errors remain visible to the runtime.
- Replaced the closed 42-demo-HTML manifest contract with the exact 14-file
  Astro runtime route manifest, including dynamic locale/detail shapes,
  revalidation, and the sitemap endpoint.
- Extended metadata with reciprocal `og:locale:alternate`, strengthened
  canonical/Open Graph/hreflang tests in both locale directions, and gave the
  article hero explicit dimensions, eager loading, high fetch priority, and a
  matching image preload.

## Verification

- Focused Task 8/route tests: `40 pass`, `0 fail`, `338 expect()` calls.
- Full `bun test`: `269 pass`, `0 fail`, `1749 expect()` calls across 36 files.
- `bun run check`: 131 files, `0 errors`, `0 warnings`, `0 hints`.
- `bun run build`: Cloudflare server build completed successfully; the emitted
  manifest contains both `/_server-islands/[name]` and `/sitemap.xml`.
- Task-scoped `git diff --check -- src tests .superpowers/sdd/task-8-report.md`:
  clean.

## Preserved work and remaining integration gate

- Existing dirty Task 2 and Task 3 reports were not modified or staged. The
  progress ledger was also preserved.
- No live Directus instance or browser session was used. Task 9 remains the
  end-to-end gate for publish-after-build discovery, real HTTP island fallback
  replacement, crawl validation, and browser/Lighthouse review.
- Wrangler attempted to write debug logs outside the sandbox during `check`
  and `build`; both commands still completed successfully with exit code 0.
