# Directus Bilingual CMS and Astro SSR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development to implement this plan task-by-task.
> Every implementation task follows superpowers:test-driven-development.

**Goal:** Build a bilingual Directus content model and serve every CMS-backed
Astro route through Cloudflare SSR without content rebuilds.

**Architecture:** Directus stores stable parent records and `en`/`vi`
translation rows, while a validation hook makes bilingual completeness a
publication invariant. Astro consumes Directus through a typed repository,
renders primary content as SSR HTML, defers only recommendations, and caches
anonymous responses at Cloudflare with publish-triggered invalidation.

**Tech Stack:** Directus 12.1.1, PostgreSQL, Directus Schema Sync 3.3.2,
TypeScript, Astro 7, `@astrojs/cloudflare`, `@directus/sdk`, Bun, Cloudflare
Workers, Vitest, and Bun Test.

## Global Constraints

- Directus stays pinned to 12.1.1 and its existing multitenancy behavior must
  remain unchanged.
- New CMS collections are non-tenant and must not contain a `team` relation.
- Required content languages are exactly `en` and `vi`.
- Incomplete drafts are allowed; incomplete bilingual publication is not.
- Public access is read-only and limited to published records and public CMS
  assets.
- Business content is entered manually; only language and public-folder
  configuration is seeded.
- Astro uses Directus immediately and strictly; production has no fixture or
  per-field locale fallback.
- Primary page content must be present in the initial SSR HTML.
- Only related products and article suggestions may use deferred server
  islands.
- Anonymous cache TTL is 3600 seconds with a stale window of 86400 seconds.
- No Flexible Editor or TipTap extension is installed.
- Secrets and deployment-specific URLs are environment configuration and must
  never be committed.
- Implementation worktrees:
  `E:\works\Freelancing\finefoods\.worktrees\directus-cms-backend` and
  `E:\works\Freelancing\finefoods\.worktrees\directus-astro-ssr-cms`.

---

### Task 1: Directus structural CMS schema

**Repository:** Directus

**Files:**
- Modify: `schema/snapshot.yaml`
- Create: `scripts/verify-cms-schema.mjs`
- Modify: `scripts/verify-static.ps1`
- Modify: `README.md`

**Produces:** A Directus 12.1.1 snapshot containing the complete non-tenant CMS
schema and a deterministic structural verifier.

- [ ] Write `scripts/verify-cms-schema.mjs` first so it fails against the
  current snapshot. It must assert every required parent, translation, and
  junction collection; required `en`/`vi` language relations; file relations;
  status metadata; native rich-text interface for the blog body; required
  field nullability; and absence of `team` fields on CMS collections.
- [ ] Run `node scripts/verify-cms-schema.mjs` and record the expected missing
  collection failure.
- [ ] Extend a clean Directus 12.1.1 development schema and export the canonical
  `schema/snapshot.yaml`. Use stable UUID parent keys, Directus translation
  relations, required audit/status fields, and explicit relationship delete
  behavior.
- [ ] Model these parents and translations: `site_settings`, `home_page`,
  `categories`, `brands`, `products`, `applications`, `audience_channels`,
  `blog_posts`, and `partners`.
- [ ] Add product M2M junctions for categories, applications, and audience
  channels. Put localized benefits in the product translation row as an
  ordered string array.
- [ ] Configure `blog_posts_translations.body` as a long text field using
  Directus's native HTML rich-text interface.
- [ ] Run the focused schema verifier, then wire it into
  `scripts/verify-static.ps1`.
- [ ] Document the CMS collection ownership, manual-content rule, and
  structural snapshot workflow in `README.md`.
- [ ] Run `powershell -NoProfile -ExecutionPolicy Bypass -File
  scripts/verify-static.ps1`.
- [ ] Commit with subject `feat: add bilingual cms schema`.

### Task 2: Directus CMS publication validation extension

**Repository:** Directus

**Files:**
- Create: `extensions/cms-content-validation/package.json`
- Create: `extensions/cms-content-validation/package-lock.json`
- Create: `extensions/cms-content-validation/tsconfig.json`
- Create: `extensions/cms-content-validation/src/constants.ts`
- Create: `extensions/cms-content-validation/src/validation.ts`
- Create: `extensions/cms-content-validation/src/index.ts`
- Create: `extensions/cms-content-validation/test/validation.test.ts`
- Create: `scripts/verify-cms-content-validation-extension.mjs`
- Modify: `Dockerfile`
- Modify: `scripts/verify-static.ps1`

**Consumes:** The collections and field names from Task 1.

**Produces:** A separately packaged Directus hook that owns CMS publication
invariants without importing or changing the tenancy hook.

- [ ] Write validation tests before implementation for incomplete drafts,
  missing `en`, missing `vi`, blank required fields, publish success,
  published translation update/delete protection, slug normalization, and
  duplicate localized slugs.
- [ ] Run the new Vitest suite and record the expected missing-module failure.
- [ ] Implement pure validation functions with collection-specific required
  fields and routable-collection slug rules.
- [ ] Implement Directus item filters that merge persisted state with create or
  update payloads before validating publication. Translation mutation filters
  must re-check the published parent.
- [ ] Return stable Directus errors that identify the collection and item but
  never log rich-text bodies or secrets.
- [ ] Package the extension in its own Docker build stage and copy only its
  manifest and built `dist` directory into the runtime image.
- [ ] Add a static package preflight analogous to the existing tenancy
  extension verifier and keep `EXTENSIONS_MUST_LOAD=true`.
- [ ] Run the extension tests, typecheck, build, the static verifier, and
  `git diff --check`.
- [ ] Commit with subject `feat: enforce bilingual cms publication`.

### Task 3: Directus public access, configuration seed, and revalidation Flow

**Repository:** Directus

**Files:**
- Modify: `schema-sync/config.js`
- Modify: `schema-sync/directus_config.js`
- Add/modify: filtered JSON records under `schema-sync/data/`
- Modify: `scripts/verify-static.ps1`
- Modify: `scripts/verify-integration.ps1`
- Modify: `README.md`

**Consumes:** Task 1 schema and Task 2 publication errors.

**Produces:** Idempotent `en`/`vi` and public-folder configuration, published
anonymous reads, and a secured publish revalidation Flow.

- [ ] Add failing static tests for exactly two owned language rows (`en`, `vi`),
  one dedicated public CMS folder, one anonymous CMS policy/access link,
  published-only permissions, and one revalidation Flow.
- [ ] Add failing clean-database cases proving anonymous published reads pass
  while draft reads, private-file reads, and every anonymous write fail.
- [ ] Configure filtered Schema Sync ownership for only the new public CMS
  policy/access/permissions, revalidation Flow/operations, language rows, and
  public folder. Do not sync business collection items.
- [ ] Scope translation and junction reads through published parent relations.
  Scope `directus_files` reads to the dedicated public folder.
- [ ] Configure the Flow to call `ASTRO_REVALIDATE_URL` with POST and
  `CMS_REVALIDATE_SECRET` only after publish, unpublish, archive, delete, or a
  published translation/relationship change.
- [ ] Ensure missing revalidation environment variables fail configuration
  safely without exposing their values.
- [ ] Update the existing exact Schema Sync allowlists instead of weakening or
  deleting tenancy assertions.
- [ ] Run static and clean PostgreSQL integration verification, including a
  repeated Directus restart/schema-apply convergence check.
- [ ] Commit with subject `feat: publish cms content securely`.

### Task 4: Astro Cloudflare SSR and cache foundation

**Repository:** Finefoods

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `astro.config.mjs`
- Modify: `wrangler.jsonc`
- Modify: `src/env.d.ts`
- Create: `src/middleware.ts`
- Create: `src/lib/runtime/cache.ts`
- Create: `src/lib/runtime/env.ts`
- Create: `src/pages/api/revalidate.ts`
- Delete: `src/worker.ts`
- Modify: `tests/locale-redirect.test.ts`
- Create: `tests/runtime-cache.test.ts`
- Create: `tests/revalidate.test.ts`

**Produces:** One adapter-generated Cloudflare Worker that owns SSR, locale
redirects, anonymous HTML caching, and authenticated zone purge.

- [ ] Fetch current Astro 7 and Cloudflare adapter documentation with Context7
  before choosing adapter APIs or generated output paths.
- [ ] Write failing tests for middleware locale redirects, cache eligibility,
  TTL/stale headers, bypass conditions, cached response lookup/storage, 503
  bypass, revalidation method/secret validation, and Cloudflare purge request.
- [ ] Run focused tests and record their expected missing-module failures.
- [ ] Add compatible versions of `@astrojs/cloudflare`,
  `@directus/sdk`, and the chosen HTML sanitizer.
- [ ] Configure `output: "server"` with the Cloudflare adapter and update
  Wrangler to deploy its generated entrypoint/assets.
- [ ] Port locale negotiation into middleware while preserving existing
  redirect status, location, `Vary`, and no-store behavior.
- [ ] Cache only successful anonymous GET/HEAD HTML and server-island
  responses for 3600 seconds with `stale-while-revalidate=86400`. Bypass API
  routes, errors, cookies, authorization, previews, and non-idempotent methods.
- [ ] Implement POST-only `/api/revalidate`, compare
  `CMS_REVALIDATE_SECRET` without leaking it, and call Cloudflare's zone purge
  endpoint using `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_PURGE_TOKEN`.
- [ ] Type all runtime variables in `src/env.d.ts`; never add defaults for
  secrets.
- [ ] Remove the custom static asset Worker and replace obsolete static-output
  contract tests.
- [ ] Run focused tests, `bun test`, `bun run check`, and `bun run build`.
- [ ] Commit with subject `feat: run astro on cloudflare ssr`.

### Task 5: Typed Directus repository and presentation mappers

**Repository:** Finefoods

**Files:**
- Modify: `src/lib/cms/types.ts`
- Replace: `src/lib/cms/queries.ts`
- Create: `src/lib/cms/directus/schema.ts`
- Create: `src/lib/cms/directus/client.ts`
- Create: `src/lib/cms/directus/repository.ts`
- Create: `src/lib/cms/directus/mappers.ts`
- Create: `src/lib/cms/directus/assets.ts`
- Create: `src/lib/cms/directus/rich-text.ts`
- Create: `src/lib/cms/directus/errors.ts`
- Create: `tests/fixtures/directus.ts`
- Replace/extend: `tests/cms.test.ts`
- Extend: blog, catalog, brand, and query tests as needed

**Consumes:** `DIRECTUS_URL` from Task 4 and the exact schema from Directus
Task 1.

**Produces:** Existing CMS query function names backed by a testable Directus
SDK repository and strict localized mappers.

- [ ] Write failing mapper tests for every collection, strict requested-locale
  selection, missing-translation errors, stable counterpart identity,
  taxonomy mapping, store settings, ordered benefits, asset dimensions, and
  sanitized blog HTML.
- [ ] Write failing repository tests that inspect requested fields, published
  filters, requested translations, counterpart translations for detail
  routes, ordering, limits, exclusion IDs, and unknown-slug behavior.
- [ ] Run the focused tests and record expected fixture-backed failures.
- [ ] Define raw Directus schema types separately from public presentation
  types. Change `BlogPost.sections` to `bodyHtml`; add localized taxonomy
  option and store-information types.
- [ ] Create one SDK client from runtime `DIRECTUS_URL`; convert transport
  failures to `CmsUnavailableError` and invalid records to `CmsDataError`.
- [ ] Implement an injectable `createCmsRepository(request)` for tests and a
  production repository using `directus.request`; do not add mutable test-only
  globals.
- [ ] Build Directus asset transform URLs and require stored width/height and
  localized alt text.
- [ ] Sanitize blog HTML server-side against explicit headings, paragraphs,
  lists, links, emphasis, blockquote, code, and safe attributes/protocols.
- [ ] Preserve exported query names used by pages and components. Return
  `undefined` only for a valid unknown/unpublished detail slug.
- [ ] Remove production imports of `demo-data.ts`; move reusable sample
  responses to test fixtures.
- [ ] Run focused mapper/repository tests, then the full tests and typecheck.
- [ ] Commit with subject `feat: read localized content from directus`.

### Task 6: SSR site settings, home, catalog, brand, and contact routes

**Repository:** Finefoods

**Files:**
- Modify: `src/layouts/SiteLayout.astro`
- Modify: `src/components/global/Footer.astro`
- Modify: relevant homepage/catalog/brand components
- Modify: `src/pages/[locale]/index.astro`
- Modify: `src/pages/[locale]/products/index.astro`
- Modify: `src/pages/[locale]/products/[slug].astro`
- Modify: `src/pages/[locale]/brands/index.astro`
- Modify: `src/pages/[locale]/brands/[slug].astro`
- Modify: `src/pages/[locale]/contact.astro`
- Modify: `src/pages/[locale]/contact/[mode].astro`
- Modify: related route, component, and render-contract tests

**Consumes:** Query functions and public types from Task 5.

**Produces:** Runtime CMS-backed pages for every non-blog public route and a
localized CMS footer on every layout.

- [ ] Write failing source/render tests proving dynamic detail routes no longer
  use `getStaticPaths`, read `Astro.params`, return real 404 responses, and
  render localized store information.
- [ ] Write failing tests proving required singleton failures map to noindex
  503 responses and valid empty indexes keep localized empty states.
- [ ] Remove build-time detail route generation and query products/brands by
  localized slug at request time.
- [ ] Fetch settings for every layout-bearing route and pass typed store data
  to the footer.
- [ ] Move homepage editorial/business copy into `home_page` query results;
  retain navigation, form, breadcrumb, validation, and generic control text in
  `ui.ts`.
- [ ] Preserve stable ID counterpart URLs and existing accessibility,
  progressive catalog filtering, and no-JavaScript content.
- [ ] Use transformed Directus assets with explicit dimensions; only the page
  LCP image is eager/high priority.
- [ ] Run focused route/render tests, then `bun test` and `bun run check`.
- [ ] Commit with subject `feat: render catalog pages from directus`.

### Task 7: SSR blog routes and sanitized rich text

**Repository:** Finefoods

**Files:**
- Modify: `src/components/blogs/BlogArticle.astro`
- Modify: `src/components/blogs/BlogCard.astro`
- Modify: `src/components/blogs/LatestBlogs.astro`
- Modify: `src/pages/[locale]/blogs/index.astro`
- Modify: `src/pages/[locale]/blogs/[slug].astro`
- Modify: `src/lib/blogs/routes.ts`
- Modify: blog data, route, component, and integration tests

**Consumes:** Sanitized `BlogPost.bodyHtml` and blog repository queries from
Task 5.

**Produces:** Runtime-published blog indexes/details with complete server HTML,
localized counterparts, and safe native rich-text rendering.

- [ ] Write failing tests proving blog detail routes accept newly queried
  slugs without `getStaticPaths`, unknown/unpublished slugs return 404, and
  article HTML contains sanitized body markup in the first response.
- [ ] Replace section-array rendering with `set:html={post.bodyHtml}` only at
  the already-sanitized mapper boundary.
- [ ] Preserve semantic heading hierarchy, explicit image dimensions,
  publication metadata, localized canonical/counterpart URLs, and current-post
  exclusion.
- [ ] Keep the blog index and homepage latest stories in primary SSR output.
- [ ] Run focused blog tests, full tests, and typecheck.
- [ ] Commit with subject `feat: render rich text blogs with ssr`.

### Task 8: Deferred recommendations and runtime SEO sitemap

**Repository:** Finefoods

**Files:**
- Create: `src/components/catalog/RelatedProductsIsland.astro`
- Create: `src/components/blogs/BlogSuggestionsIsland.astro`
- Create: `src/components/global/CardSkeleton.astro`
- Create: `src/pages/sitemap.xml.ts`
- Modify: product/blog detail pages
- Modify: `src/lib/seo/meta.ts`
- Replace/extend: route-manifest and built-output tests
- Create: `tests/server-islands.test.ts`
- Create: `tests/sitemap.test.ts`

**Consumes:** Task 5 repository queries and Task 4 cache middleware.

**Produces:** Deferred non-critical recommendations, stable skeleton fallbacks,
and runtime SEO discovery for every localized CMS detail route.

- [ ] Write failing tests for `server:defer` boundaries, fixed skeleton layout,
  reduced-motion behavior, initial primary content, runtime sitemap XML,
  canonical URLs, Open Graph fields, and reciprocal `hreflang`.
- [ ] Move only related products and article suggestions into query-owning
  server-island components. Pass stable IDs, not pre-fetched recommendation
  arrays.
- [ ] Render accessible fixed-dimension skeleton cards in each island fallback;
  do not animate when reduced motion is requested.
- [ ] Generate sitemap XML at request time from published localized product,
  brand, and blog routes plus fixed localized pages.
- [ ] Replace the closed static HTML manifest assertions with runtime route and
  sitemap assertions appropriate to server output.
- [ ] Run focused tests, `bun test`, `bun run check`, and `bun run build`.
- [ ] Commit with subject `feat: add cms server islands and sitemap`.

### Task 9: Cross-repository integration and release evidence

**Repositories:** Directus and Finefoods

**Files:**
- Modify/create only integration tests, release documentation, and narrowly
  required fixes discovered by those tests.

**Consumes:** All prior tasks.

**Produces:** Evidence that a clean Directus instance and the built Cloudflare
Worker satisfy the end-to-end plan without an Astro rebuild.

- [ ] Start clean PostgreSQL and the built Directus image, apply the schema
  twice across a restart, and verify startup convergence.
- [ ] Insert test-only complete bilingual settings, home, product, brand, and
  blog records through authenticated Directus APIs; verify anonymous published
  reads and draft/write denial.
- [ ] Build Astro once against the test Directus instance and start the
  adapter-generated Worker.
- [ ] After the Astro build, create another published bilingual product and
  blog, request their detail routes and indexes, and prove they appear without
  rebuilding.
- [ ] Verify unknown slugs return 404, uncached CMS failure returns noindex 503,
  primary SEO content is in initial HTML, island fallbacks are stable, footer
  store data localizes, and sitemap/canonical/hreflang output is reciprocal.
- [ ] Trigger the Directus revalidation Flow and prove the Astro endpoint
  rejects a bad secret and accepts the configured one without exposing tokens.
- [ ] Run Directus static and integration verification; run Astro `bun test`,
  `bun run check`, and `bun run build`.
- [ ] Perform English/Vietnamese desktop/mobile, keyboard, no-JavaScript,
  reduced-motion, image-layout, Lighthouse SEO, and performance review.
- [ ] Commit release evidence in each repository with subject
  `test: verify directus astro cms integration`.

## Rollout

1. Deploy the Directus image and apply the committed schema/configuration.
2. Manually enter all required business content and both translations.
3. Verify public read permissions, assets, and the publication invariant.
4. Configure `DIRECTUS_URL`, `CMS_REVALIDATE_SECRET`,
   `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_PURGE_TOKEN`, and
   `ASTRO_REVALIDATE_URL` in their owning platforms.
5. Deploy Astro SSR, trigger cache revalidation, and run bilingual smoke tests.
