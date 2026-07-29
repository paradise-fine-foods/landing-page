# Task 7 Report: SSR Blog Routes and Sanitized Rich Text

## Status

Implementation complete and verified.

## Documentation and inherited plumbing

- Read the full Task 7 brief, approved Directus/Astro design and plan, Task 5
  and Task 6 reports, the progress ledger, current blog routes/components, CMS
  repository/mappers/types, layout metadata, and all blog/SSR test contracts.
- Used current Astro 7 documentation from Context7 (`/withastro/docs`) for
  on-demand dynamic routes without `getStaticPaths`, runtime params, and the
  Astro Container component-rendering API.
- Audited and retained Task 5's sanitizer boundary and Task 6's runtime blog
  route conversion. `BlogArticle.astro` already consumed only the mapped
  `BlogPost.bodyHtml` through `set:html`, while the index, homepage latest
  stories, and article suggestions already rendered in primary server output.

## TDD evidence

### Stable-counterpart RED

Command:

```powershell
bun test tests/blog-routes.test.ts
```

Result: `3 pass`, `2 fail`. The failures proved the missing
`blogAlternatePath` helper and the detail route's unnecessary full query of the
opposite-locale blog index.

After the helper and route change, the focused file passed `5 pass`, `0 fail`.

### Runtime-detail RED

The next focused run passed five tests and failed the new runtime-detail test
because `loadBlogDetailPageData` did not exist. The test adds a published post
after the loader setup and proves it resolves without static path generation;
draft and missing slugs both resolve to the 404 state.

### Render-harness RED

The initial Astro Container test correctly failed because Bun's direct
`.astro` import produced an inert component tag. The harness was routed through
Astro's Vite transform, after which it rendered the real component HTML.
Assertions were then scoped to Astro's generated style attributes rather than
assuming unscoped tags.

## Implementation

- Added a typed runtime blog-detail loader using Task 6's variadic
  `loadCmsPageData` boundary for settings/detail and the dependent suggestions
  query.
- Added explicit 200, 404, and 503 result variants. The route marks unknown or
  unpublished content as a real 404 before rewriting to the localized recovery
  page and maps known CMS failures to 503.
- Added stable-ID `blogAlternatePath` behavior from the mapper-provided
  counterpart, falling back only to the opposite-locale blog index when a
  counterpart is absent.
- Removed the opposite-locale full blog-index request from article rendering.
- Kept article suggestions in the primary response and preserved the stable-ID
  current-post exclusion query. No `server:defer` was introduced; Task 8 owns
  deferred suggestion islands.
- Added real Vite-compiled Astro component tests. The rendered HTML proves the
  sanitized heading/paragraph markup is present immediately, unsafe tags and
  attributes are absent, the H1 precedes rich-text H2 content, publication time
  is semantic, and article/card images retain explicit dimensions and alt text.
- Added contracts proving the sole blog `set:html` receives `post.bodyHtml`
  from the mapper's `sanitizeBlogHtml` result; canonical/hreflang metadata,
  reciprocal switch URLs, and current-story exclusion remain covered by the
  behavioral verifier tests.
- Confirmed the homepage latest section, blog index cards, and article body are
  direct SSR children and contain no `server:defer` directive.

## Verification

- Focused blog/render/SSR tests: `39 pass`, `0 fail`, `262 expect()` calls.
- Full `bun test`: `263 pass`, `0 fail`, `1670 expect()` calls across 34 files.
- `bun run check`: 123 files, `0 errors`, `0 warnings`, `0 hints`.
- `bun run build`: Cloudflare server build completed successfully.
- Task-scoped `git diff --check`: clean.

## Preserved work and concerns

- Existing dirty Task 2 and Task 3 reports were not modified or staged by this
  task. The progress ledger was also preserved.
- No live Directus HTTP instance was used; the cross-repository publish-after-
  build smoke test remains the Task 9 integration gate. This task covers the
  dynamic loader and published/unknown states behaviorally, real compiled Astro
  component output, repository publication filters, adapter build, and types.
