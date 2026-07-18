# Dynamic Locale Static Routes Design

## Summary

Replace the duplicated `src/pages/en` and `src/pages/vi` trees with one `src/pages/[locale]` tree. Astro remains in `output: 'static'`: every dynamic page exports `getStaticPaths()` and emits only the locale and slug combinations supplied at build time.

The public URLs stay unchanged. English and Vietnamese continue to share the `products`, `brands`, and `contact` path segments, including the prefixed default locale.

## Architecture

The existing readonly `locales` tuple becomes the single source of truth for Astro configuration, the `Locale` union, and locale-only static paths. A small i18n static-path module returns typed `{ params: { locale }, props: { locale } }` entries and owns the bilingual counterpart-locale map.

Each former English/Vietnamese pair becomes one route. Locale-only pages receive a trusted `Locale` through static props. Product and brand detail routes load both localized collections at build time, construct reciprocal routes by stable record ID, and return the complete valid `{ locale, slug }` set with normalized props. They never query CMS data using an unchecked URL parameter at request time.

The existing Cloudflare static-assets worker continues to redirect unprefixed requests according to `Accept-Language`. Legacy Vietnamese redirect rules and all canonical/alternate URL behavior remain unchanged.

## Error and Edge-Case Behavior

- Unsupported locales are absent from `getStaticPaths()` and therefore resolve to the generated 404 response.
- Unknown product and brand slugs are absent from the static build.
- Every Astro static-path parameter is a string.
- Missing reciprocal localized records keep the existing fallback to the target locale's index route.
- Contact modes remain restricted to `customer` and `supplier` for both locales.

## Verification

- Unit tests prove the tuple-derived locale type boundary and exact locale static paths.
- Source-contract tests prove there is one `[locale]` route tree and no duplicated `en`/`vi` page trees.
- Existing route, CMS, SEO, enquiry, and UI contracts are updated to read the consolidated files.
- Astro type checking and the complete static build prove that all expected English and Vietnamese pages are emitted with no literal `[locale]` output directory.

## Constraints

- Keep `output: 'static'` and Astro 7.0.9 behavior.
- Keep `/en/...` and `/vi/...` public URLs and shared section segments.
- Keep `locales = ['en', 'vi'] as const` as the canonical locale declaration.
- Add no runtime router, catch-all page, dependency, or server-rendered route.
- Preserve all current uncommitted page content while consolidating the files.
