# Vietnamese Default Locale Design

## Goal

Unprefixed storefront routes must always navigate to Vietnamese. English is used only when the URL already includes the `/en` locale prefix.

## Behavior

- `/` redirects to `/vi/`.
- `/contact` redirects to `/vi/contact`.
- `/contact/` redirects to `/vi/contact/`.
- `/products/cream-cheese/` redirects to `/vi/products/cream-cheese/`.
- `/vi/contact/` renders Vietnamese and does not redirect.
- `/en/contact/` renders English and does not redirect.
- Browser `Accept-Language` headers do not influence redirect locale.
- Internal, API, error, file, localized, and mutating requests keep their existing bypass behavior.

## Architecture

The locale middleware remains the only place that redirects unprefixed routes. It should use the canonical `defaultLocale` from `src/lib/i18n/types.ts`, which is `vi`, instead of parsing `Accept-Language`.

Header copy already follows the active route locale through `ui[locale].header`, so no header component rewrite is needed. Once `/en/...` renders with locale `en`, header remains English; once `/vi/...` renders with locale `vi`, header remains Vietnamese.

## Components

- `src/lib/i18n/request-locale.ts`: own redirect eligibility and redirect target helpers. Remove language auto-detection from redirect selection.
- `src/middleware.ts`: redirect unprefixed routes to `defaultLocale` via the helper.
- `tests/locale-redirect.test.ts`: verify that `Accept-Language` is ignored and unprefixed routes redirect to Vietnamese.

## Data Flow

1. Request enters `src/middleware.ts`.
2. `shouldRedirectToLocale(request)` returns true only for eligible unprefixed page requests.
3. Middleware selects `defaultLocale` (`vi`) and builds the localized redirect location.
4. Localized `/vi/...` and `/en/...` requests pass through to Astro rendering.
5. Rendered page passes locale to `Header.astro`; header copy comes from `ui[locale].header`.

## Error Handling

No new error states are introduced. Existing bypasses for API routes, Astro internals, files, `/404`, `/503`, unsupported two-letter locale-like prefixes such as `/fr/`, and non-GET/HEAD requests remain unchanged.

## Testing

Update locale redirect tests to assert:

- `preferredLocale` is no longer an auto-detect parser, or remove its tests if the helper is deleted.
- Middleware redirects `/contact/?source=hero` to `/vi/contact/?source=hero` even when `Accept-Language` prefers English.
- Localized `/en/...` and `/vi/...` routes still bypass redirect.

Run the targeted locale redirect test and the project test suite after implementation.
