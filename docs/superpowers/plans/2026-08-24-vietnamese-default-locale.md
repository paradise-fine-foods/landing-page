# Vietnamese Default Locale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every unprefixed storefront route redirect to Vietnamese while keeping explicit `/en/...` routes English.

**Architecture:** Keep redirects centralized in `src/middleware.ts` and `src/lib/i18n/request-locale.ts`. Replace browser language selection with canonical `defaultLocale` (`vi`) and preserve existing bypass rules.

**Tech Stack:** Astro middleware, TypeScript, Bun test runner.

## Global Constraints

- `defaultLocale` remains `vi` in `src/lib/i18n/types.ts`.
- Browser `Accept-Language` headers must not influence redirect locale.
- Explicit `/en/...` routes must not redirect and must keep English rendering.
- Explicit `/vi/...` routes must not redirect and must keep Vietnamese rendering.
- Existing bypass behavior for internal, API, error, file, unsupported locale-like, and mutating requests must remain unchanged.
- Do not add dependencies.

---

## File Structure

- Modify `src/lib/i18n/request-locale.ts`: remove redirect auto-detect behavior and expose only helpers needed by middleware/tests.
- Modify `src/middleware.ts`: use `defaultLocale` for redirect target and remove `Accept-Language` redirect variation.
- Modify `tests/locale-redirect.test.ts`: replace auto-detect expectations with Vietnamese-default expectations.

### Task 1: Vietnamese Default Locale Redirect

**Files:**
- Modify: `src/lib/i18n/request-locale.ts`
- Modify: `src/middleware.ts`
- Modify: `tests/locale-redirect.test.ts`

**Interfaces:**
- Consumes: `defaultLocale`, `isLocale`, and `Locale` from `src/lib/i18n/types.ts`.
- Produces: `shouldRedirectToLocale(request: Request): boolean` and `localizedRedirectLocation(url: URL, locale: Locale): string`.

- [ ] **Step 1: Write failing locale redirect tests**

Replace the `preferredLocale` import and `preferredLocale` describe block in `tests/locale-redirect.test.ts`. Keep imports for `localizedRedirectLocation`, `shouldRedirectToLocale`, and `onRequest`.

Add this middleware assertion in the existing `returns the complete locale redirect response without rendering` test by keeping the English-preferred header:

```ts
const request = new Request('https://paradisefinefoods.com/contact/?source=hero', {
  headers: { 'Accept-Language': 'en-US, vi;q=0.8' },
});
```

Expect:

```ts
expect(response.headers.get('Location')).toBe('/vi/contact/?source=hero');
expect(response.headers.get('Vary')).toBeNull();
```

Remove the old `preferredLocale` tests because redirect selection no longer parses `Accept-Language`.

- [ ] **Step 2: Run test to verify current behavior fails**

Run:

```bash
bun test tests/locale-redirect.test.ts
```

Expected before implementation: failure showing redirect location is `/en/contact/?source=hero` or `Vary` is `Accept-Language`.

- [ ] **Step 3: Implement Vietnamese default redirect**

In `src/lib/i18n/request-locale.ts`, remove `preferredLocale` and keep this shape:

```ts
import { isLocale, type Locale } from '@/lib/i18n/types';

export function shouldRedirectToLocale(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;

  const { pathname } = new URL(request.url);
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (isLocale(firstSegment)) return false;
  if (/^[a-z]{2}(?:-[a-z]{2})?$/i.test(firstSegment)) return false;

  if (
    pathname === '/_astro'
    || pathname.startsWith('/_astro/')
    || pathname === '/_server-islands'
    || pathname.startsWith('/_server-islands/')
    || pathname === '/_image'
    || pathname.startsWith('/_image/')
    || pathname === '/api'
    || pathname.startsWith('/api/')
    || pathname === '/404'
    || pathname === '/404/'
    || pathname === '/503'
    || pathname === '/503/'
  ) return false;

  const lastSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return !lastSegment.includes('.');
}

export function localizedRedirectLocation(url: URL, locale: Locale): string {
  return `/${locale}${url.pathname}${url.search}`;
}
```

In `src/middleware.ts`, import `defaultLocale` and stop reading `Accept-Language`:

```ts
import type { MiddlewareHandler } from 'astro';
import { withRuntimeCache } from '@/lib/runtime/cache';
import { defaultLocale } from '@/lib/i18n/types';
import {
  localizedRedirectLocation,
  shouldRedirectToLocale,
} from '@/lib/i18n/request-locale';

export const onRequest: MiddlewareHandler = async ({ request }, next) => {
  if (shouldRedirectToLocale(request)) {
    const location = localizedRedirectLocation(new URL(request.url), defaultLocale);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': location,
        'Cache-Control': 'no-store',
      },
    });
  }

  return withRuntimeCache(request, next);
};
```

- [ ] **Step 4: Run targeted tests**

Run:

```bash
bun test tests/locale-redirect.test.ts
```

Expected: all tests in `tests/locale-redirect.test.ts` pass.

- [ ] **Step 5: Run full test suite**

Run:

```bash
bun test
```

Expected: full suite passes.

- [ ] **Step 6: Commit implementation**

Run:

```bash
git add src/lib/i18n/request-locale.ts src/middleware.ts tests/locale-redirect.test.ts
git commit -m "fix: default unprefixed routes to vietnamese"
```
