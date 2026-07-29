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
  existing runtime cache boundary. The stored edge response uses the one-hour/
  24-hour-stale policy while the outward response requires browser
  revalidation. Known CMS data/transport failures return a non-sensitive `503`
  text response with `no-store`, while programming errors remain visible to
  the runtime.
- Replaced the closed 42-demo-HTML manifest contract with the exact 14-file
  Astro runtime route manifest, including dynamic locale/detail shapes,
  revalidation, and the sitemap endpoint.
- Extended metadata with reciprocal `og:locale:alternate`, strengthened
  canonical/Open Graph/hreflang tests in both locale directions, and gave the
  article hero explicit dimensions, eager loading, high fetch priority, and a
  matching image preload.

## Review follow-up: cache sitemap responses and verify emitted routes

An independent review found that `/sitemap.xml` was semantically bypassed by
the cache middleware because it has a file extension and cacheability accepted
only `text/html`. It also found that the runtime route verifier inspected
source files only, so an adapter/build regression could omit a Worker route
without failing `bun run build`.

### Follow-up RED

- `bun test tests/runtime-cache.test.ts`: `6 pass`, `4 fail`. The failures
  proved the sitemap request was ineligible, XML was uncacheable, the endpoint's
  edge policy leaked outward, and a sitemap 503 did not receive `no-store`.
- `bun test tests/route-manifest.test.ts`: expected missing-export error for
  the new emitted-Worker route contract.

### Follow-up implementation and GREEN

- Cache eligibility now admits only exact `/sitemap.xml` GET/HEAD requests in
  addition to pages and server islands. Successful `application/xml` is
  cacheable only for that path; other file routes and XML responses remain
  bypassed.
- An integration-style memory-cache test calls the real sitemap response
  builder: the first request executes all six bilingual CMS queries and stores
  the edge-policy response; the second request is served from cache with no new
  queries and the browser policy restored. Sitemap failures remain unstored
  with `no-store`.
- The route verifier now reads `dist/server/entry.mjs`, extracts route names
  from the serialized Astro manifest, and requires 15 emitted routes covering
  the sitemap, server-island endpoint, root, localized indexes/details,
  404/503, and revalidation API. Representative and missing-route unit tests
  cover the parser.
- `package.json` runs the verifier after every `astro build`; the focused cache
  and manifest suites pass `16 pass`, `0 fail`, and the build reports
  `Verified 14 source route files and 15 emitted Worker routes.`

## Verification

- Focused Task 8/route tests: `40 pass`, `0 fail`, `338 expect()` calls.
- Full `bun test`: `275 pass`, `0 fail`, `1775 expect()` calls across 36 files.
- `bun run check`: 131 files, `0 errors`, `0 warnings`, `0 hints`.
- `bun run build`: Cloudflare server build and the mandatory emitted-Worker
  route verifier completed successfully.
- Task-scoped `git diff --check -- package.json src tests
  .superpowers/sdd/task-8-report.md`: clean.

## Preserved work and remaining integration gate

- Existing dirty Task 2 and Task 3 reports were not modified or staged. The
  progress ledger was also preserved.
- No live Directus instance or browser session was used. Task 9 remains the
  end-to-end gate for publish-after-build discovery, real HTTP island fallback
  replacement, crawl validation, and browser/Lighthouse review.
- Wrangler attempted to write debug logs outside the sandbox during `check`
  and `build`; both commands still completed successfully with exit code 0.
