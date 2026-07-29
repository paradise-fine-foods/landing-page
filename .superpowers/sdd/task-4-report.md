# Task 4 report: Astro Cloudflare SSR and cache foundation

Status: **DONE_WITH_CONCERNS**

## Outcome

- Astro now builds in `server` mode with `@astrojs/cloudflare` and Wrangler's
  adapter entrypoint, replacing the custom static-assets Worker.
- Locale negotiation runs in Astro middleware and preserves the existing 302,
  relative `Location`, `Vary: Accept-Language`, and `Cache-Control: no-store`
  behavior.
- Anonymous successful GET/HEAD HTML and GET server-island responses use the
  Cloudflare default cache with `s-maxage=3600` and
  `stale-while-revalidate=86400`.
- API, internal asset, preview, cookie, authorization, mutating, non-HTML,
  cookie-setting, and error responses bypass storage. Error responses are
  forced to `Cache-Control: no-store`.
- `/api/revalidate` accepts POST only, compares its Bearer secret without
  direct string equality, and purges the configured Cloudflare zone with
  `purge_everything: true`. Missing configuration, bad authentication,
  Cloudflare rejection, malformed responses, and network failures return
  generic non-secret-bearing responses.
- Runtime contracts cover `DIRECTUS_URL`, `CMS_REVALIDATE_SECRET`,
  `CLOUDFLARE_ZONE_ID`, and `CLOUDFLARE_PURGE_TOKEN`; no secret has a default.
- Added Astro-compatible dependency versions:
  `@astrojs/cloudflare@14.1.6`, `@directus/sdk@23.0.0`,
  `sanitize-html@2.17.6`, and `@types/sanitize-html@2.16.1`.
- Obsolete static-HTML build verifiers were removed from the build command.
  Their reusable unit-level verifier tests remain in the repository.

## Documentation decision

Context7 was queried before adapter configuration. Current official Astro
documentation and the installed Astro 7 adapter expose
`@astrojs/cloudflare/entrypoints/server` for Wrangler, with the adapter
generating `dist/server/entry.mjs` and its corresponding `dist/client` asset
mapping at build time. The adapter is configured with passthrough images so no
Cloudflare Images binding is introduced.

## TDD evidence

Initial RED:

```text
bun test tests/locale-redirect.test.ts tests/runtime-cache.test.ts tests/revalidate.test.ts
0 pass, 3 fail, 3 errors
Cannot find ../src/middleware
Cannot find ../src/lib/runtime/cache
Cannot find ../src/pages/api/revalidate
```

The first GREEN reached 28 passing focused tests. A second focused RED added
failure-boundary coverage and produced the intended three failures: `/_image`
was still eligible, 503 lacked `no-store`, and a purge network exception
escaped. The implementation then returned to GREEN.

Final focused verification:

```text
28 pass, 0 fail, 119 assertions
```

## Final verification

- `bun test`: 231 pass, 0 fail, 1477 assertions.
- `bun run check`: 0 errors, 0 warnings, 0 hints.
- `bun run build`: completed successfully with the Cloudflare server adapter.
- Feature-scoped `git diff --check`: clean.

## Review fix

The first independent review found a critical SSR regression: server-mode Astro
does not execute `getStaticPaths()` for on-demand routes, while the localized
pages still read their locale and content from `Astro.props`.

The fix removes `getStaticPaths()` and `Astro.props` from all nine localized
routes. They now validate `Astro.params`, perform their existing query-boundary
lookups at request time, resolve localized counterparts by stable record ID,
and rewrite invalid locales, slugs, and enquiry modes to the custom 404 route.
The new SSR route regression suite went from 0/2 to 2/2 with 53 assertions.
Focused affected-route verification passes 6/6.

## Concerns

- A local HTTP smoke attempt was blocked by Wrangler's sandboxed registry
  write (`EPERM`). Source regression tests, the full suite, Astro diagnostics,
  and the Cloudflare adapter build all pass.
- The exact repository-wide `git diff --check` is not clean because the
  preserved, unrelated `.superpowers/sdd/task-2-report.md` worktree change has
  trailing whitespace on line 212. Task 4 does not modify or stage the existing
  Task 2 or Task 3 report changes.

## Commit

Subject: `feat: run astro on cloudflare ssr`

Review fix subject: `fix: preserve localized pages in ssr`
