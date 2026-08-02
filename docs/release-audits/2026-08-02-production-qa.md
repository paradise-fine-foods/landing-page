# Finefoods production QA — 2026-08-02

## Release status

Directus fix is deployed and verified. Storefront source needed no functional change. Temporary bilingual product and blog publication, discovery, revalidation, and archival removal passed. Storefront audit release and administrator cleanup remain release gates at time of this report revision.

| System | Revision | Deployment | Status |
| --- | --- | --- | --- |
| Directus | `d18e5d9` | Railway `97a18987-308e-407b-b611-64d8526728d3` | Active; post-deploy editor validation passed |
| Storefront | _client release commit pending_ | _Cloudflare deployment pending_ | Browser audit passed; audit-only release pending |

## Scope and method

Audit used production Chrome sessions against the Cloudflare storefront and Railway-hosted Directus. Temporary QA records, user, and file contained no production data. Credentials and temporary identifiers are intentionally excluded from this report.

Storefront matrix covered 22 routes at desktop `1440 × 900` and mobile `390 × 844`, for 44 route/viewport checks:

- English and Vietnamese home pages.
- Product, brand, and blog indexes and detail pages.
- General, customer, and supplier contact modes.
- Not-found behavior.

The bilingual 404 response was verified. A production 503 was not forced because doing so would require an outage or unsafe production fault injection; existing source and build tests cover the service-unavailable path.

Checks covered document language, one main landmark, heading structure, horizontal overflow, images, locale switching, canonical and `hreflang` metadata, visible keyboard focus, console warnings/errors, and enquiry-rail behavior. Pages were also inspected for responsive layout and content availability. No reproducible storefront defect was found. One initially incomplete lazy image on English home did not reproduce.

No-JavaScript and reduced-motion cases were prepared in the existing release-smoke manifest. That Playwright run could not execute because bundled Python lacks the `playwright` module; no dependency was added for a one-off audit. Native Chrome route testing passed, but this report does not claim a separate automated no-JavaScript/reduced-motion run.

## Automated verification

### Storefront baseline

- `bun test`: 301 tests passed.
- `bun run check`: passed.
- `bun run build`: passed. Wrangler emitted a local log-write `EPERM` warning but returned exit code 0.

Final storefront verification also passed: `bun test`, `bun run check`, and `bun run build` all returned exit code 0. Wrangler emitted only the same local log-write `EPERM` warning.

### Directus final

- Schema verifier passed: 25 collections, 206 fields, 57 relations.
- Fixture suite passed: 21 tests.
- Schema apply suite passed: 3 tests.
- Team extension suite passed: 174 tests.
- CMS extension suite passed: 65 tests.
- Static contracts passed: 1,144 contracts, including type checks and extension builds.
- Docker integration checks were unavailable because Docker is not installed in the audit environment.

## Directus editor workflow

A disposable user assigned only the stable `Content Editor` role was used for least-privilege testing.

Verified behavior:

- Sidebar exposed CMS authoring collections plus native Directus Users icon; Users showed only editor's own account.
- Settings, schema, policies, flows, and teams were unavailable through navigation; direct forbidden routes were inaccessible. Native Directus still showed the built-in Users icon, limited to the editor's own account as described below.
- Languages were not in navigation. Direct access was read-only and creation was disabled.
- Content hard-delete was disabled while archive controls remained available.
- File selection exposed only the Public CMS folder and allowed files; other folders were unavailable.
- Product editing exercised English and Vietnamese translations, benefits, brand/category/application/audience relations, images, validation, save/reload, publish, and archive controls.
- Blog editing exercised bilingual title, slug, summary, rich text, image alternative text, reading time, validation, save/reload, and status controls.
- A temporary bilingual product was published and discovered on English and Vietnamese storefront routes without a rebuild.
- A temporary bilingual blog was published and discovered on English and Vietnamese storefront routes without a rebuild, including reciprocal locale links, localized rich text, image alternative text, date, reading time, and category.
- Both temporary records were archived by the editor. Their English routes returned not-found after revalidation; Vietnamese discovery had already proved the same stable bilingual records before archival.

The built-in Users icon remains visible in native Directus. The editor could see only its own account and could not create users; forbidden administrative routes remained inaccessible. Hiding that built-in module would require a custom Studio extension, which is outside approved scope and unnecessary for access control.

Native local-file upload could not be exercised because the Chrome control extension lacked permission to access `file://` URLs. URL import into Public CMS provided the disposable upload needed to verify folder permissions.

## Confirmed defect and fix

### Technical validation errors exposed to nontechnical editors

**Reproduction:** Publishing incomplete CMS content displayed generic technical text such as `errors.CMS_CONTENT_INVALID` and `[CMS_CONTENT_INVALID] CMS_CONTENT_INVALID`.

**Root cause:** Shared CMS validation errors supplied machine codes but no editor-facing messages, so Directus rendered fallback identifiers.

**Fix:** Directus commit `d18e5d9` adds concise guidance to the five shared custom validation errors while preserving error codes, HTTP status, extensions, permission shapes, schema IDs, and API contracts. Tests cover every custom message. No Studio extension or dependency was added.

**Verification:** Full Directus static suite passed. Railway deployment `97a18987-308e-407b-b611-64d8526728d3` became active. Post-deploy product validation displayed: “Complete English and Vietnamese content, required images, and published related content before publishing.” Reload restored the unchanged published record.

## Storefront findings

No reproducible functional, permission, accessibility, metadata, console, or responsive defect was found in client source. Therefore no speculative UI change or redesign was made. Existing Astro components, CMS API shapes, and revalidation contract remain unchanged.

## Remaining release gates

- Re-authenticate as Administrator and permanently delete only temporary QA records, disposable QA file, and temporary QA user.
- Confirm existing production content and users remain unchanged.
- Commit and push this audit-only storefront revision, then record active Cloudflare deployment and final client verification above.
