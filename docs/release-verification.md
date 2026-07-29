# Directus/Astro release verification

This is the durable Task 9 release procedure for the built Cloudflare Worker.
Treat `blocked` and `failed` as distinct outcomes; neither is a pass.

## 1. Verify source and build exactly once

```powershell
bun test
bun run check
bun run build
```

Record the build command, exit code, and `dist/server/entry.mjs` timestamp.
After this point, do not run any build command during the publish-after-build
smoke. Start that artifact using the Cloudflare adapter preview:

```powershell
bun run preview --host 127.0.0.1 --port 4322
```

Provide `DIRECTUS_URL`, `CMS_REVALIDATE_SECRET`, `CLOUDFLARE_ZONE_ID`, and
`CLOUDFLARE_PURGE_TOKEN` through the local Worker environment. Keep the file
that contains them untracked and outside committed evidence.

## 2. Prove runtime content discovery

When licensed Directus public-filter rules are unavailable locally, use the
deterministic fake Directus only for Worker/runtime evidence. Set an untracked
`FAKE_DIRECTUS_ADMIN_SECRET`, then start it before the one Worker build:

```powershell
node scripts/fake-directus-server.mjs
```

It listens on `FAKE_DIRECTUS_PORT` (default `8056`). Point `DIRECTUS_URL` at
that origin. After the build, send authenticated `POST` requests with the
secret in `X-Release-Secret` to `/__test/mutate` to publish the second product
and blog without rebuilding. Use `/__test/outage` with JSON
`{"enabled":true}` to prove the Worker `503` path, and `/__test/reset` to
restore baseline state. The fake does not prove Directus licensing,
permissions, hooks, or Flow execution; those remain separate deployment gates.

Seed complete `en` and `vi` settings, home, brand, product, and blog records
through authenticated Directus APIs. Request the localized product/blog index
and detail pages. Then, without rebuilding:

1. create a second complete published bilingual product and blog;
2. request both localized detail routes and indexes;
3. prove the new localized titles appear in the initial response HTML;
4. prove unknown slugs return `404`;
5. use an uncached route with Directus unavailable and prove `503`, `noindex`,
   and `Cache-Control: no-store`;
6. verify footer store data, stable island fallback markup, image dimensions,
   sitemap entries, canonical URLs, and reciprocal `en`/`vi` hreflang links.

`scripts/release-gates.mjs` supplies reusable response/SEO assertions and
secret redaction for custom orchestration. Its contract is covered by
`tests/release-gates.test.ts`.

## 3. Run deployment-dependent probes

Set only environment-variable names below; never paste their values into a
command or report:

- `DIRECTUS_PUBLIC_PROBE_URL`: anonymous query returning a published row;
- `DIRECTUS_DRAFT_PROBE_URL`: anonymous query returning an empty draft result;
- `DIRECTUS_WRITE_PROBE_URL`: CMS collection URL on which anonymous POST is
  denied;
- `ASTRO_REVALIDATE_URL`, `CMS_REVALIDATE_SECRET`,
  `CLOUDFLARE_ZONE_ID`, and `CLOUDFLARE_PURGE_TOKEN`.

Capability-only (expected to exit `2` while a required dependency is absent):

```powershell
node scripts/verify-deployment-gates.mjs --json
```

Live probes (performs one real Cloudflare purge after first proving a bad
secret returns `401`):

```powershell
node scripts/verify-deployment-gates.mjs --live --json
```

The live public gate passes only when published read, filtered draft denial,
and anonymous write denial all match their expected results. The revalidation
gate passes only when the bad secret returns `401` and the configured secret
returns `204`.

## 4. Browser matrix

Create an untracked JSON manifest such as:

```json
{
  "routes": [
    {
      "path": "/en/products/release-product/",
      "lang": "en",
      "seo": {
        "canonical": "https://paradisefinefoods.com/en/products/release-product/",
        "alternates": {
          "en": "https://paradisefinefoods.com/en/products/release-product/",
          "vi": "https://paradisefinefoods.com/vi/products/san-pham-phat-hanh/"
        }
      },
      "primary": "Release product",
      "footer": "Ho Chi Minh City",
      "islandFallback": true
    },
    {
      "path": "/vi/products/san-pham-phat-hanh/",
      "lang": "vi",
      "seo": {
        "canonical": "https://paradisefinefoods.com/vi/products/san-pham-phat-hanh/",
        "alternates": {
          "en": "https://paradisefinefoods.com/en/products/release-product/",
          "vi": "https://paradisefinefoods.com/vi/products/san-pham-phat-hanh/"
        }
      },
      "primary": "Sản phẩm phát hành",
      "footer": "Thành phố Hồ Chí Minh",
      "islandFallback": true
    }
  ]
}
```

Run native Python Playwright with the server already running. The script uses
headless Chromium, waits for `networkidle` before DOM inspection, and covers
desktop/mobile, keyboard focus, JavaScript disabled, reduced motion,
horizontal overflow, image dimensions, initial HTML, and reciprocal SEO. Each
manifest route must declare an absolute canonical URL plus exact `en` and `vi`
alternate targets. The runner parses raw initial HTML without regex-based tag
matching and asserts one exact target for each relation; it repeats the exact
checks against the browser DOM. Screenshot names include a readable sanitized
route identifier, a path digest, locale, and viewport so same-locale routes
cannot overwrite each other:

```powershell
py -3 scripts/browser-release-smoke.py --base-url http://127.0.0.1:4322 --manifest <untracked-manifest.json> --evidence-dir <untracked-evidence-directory>
```

The fake asset is a real 1200x800 PNG so this matrix proves image decoding and
layout dimensions. Its uniformly colored, highly compressible fixture bytes
and local Worker delivery do not predict production CDN/media transfer weight;
recorded Lighthouse scores are release-gate evidence only.

Run Lighthouse SEO/performance only when the CLI is installed and retain the
JSON/HTML report outside the repository unless it has been checked for URLs or
environment data. Record an absent CLI as a blocked gate.

## Task 9 recorded local result

The final build exited `0`, verified 14 source and 15 emitted Worker routes,
and produced a 298,571-byte `dist/server/entry.mjs` with SHA-256
`ADB50125F28E2861475547CE401671DB566C6AD83598673EA1DE35E01B54E7B1`.
Its fingerprint and timestamp remained unchanged after the guarded mutation.
Baseline and post-build English/Vietnamese product/blog details, fresh-key
indexes, and sitemap passed without a rebuild; unknown content returned 404
and an uncached outage returned a no-store/noindex 503.

The unchanged Playwright rerun passed 4 routes/16 checks after one transient
first-run timeout. Lighthouse product and blog performance/SEO scores were
100/100; the product run recorded a slow-load incomplete warning and the blog
run did not. Bad-secret revalidation returned 401. The configured local purge
ended at 502/503, so successful purge remains a deployment-blocked gate rather
than a pass. Docker and licensed Directus public reads were also unavailable
locally and remain explicitly blocked.
