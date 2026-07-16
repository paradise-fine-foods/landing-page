# Paradise Fine Foods Client-Review MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, production-quality Astro vertical slice that lets the client finalize the Cold-Chain Atelier visual direction, responsive styling, motion, representative catalog UX, and demo enquiry flow.

**Architecture:** Astro statically generates every included route from typed vendor-neutral query functions. The default CMS adapter returns localized demo records, while small browser scripts progressively enhance navigation, filtering, enquiry submission, and a poster-backed direct Three.js hero. Page components never import fixtures or vendor-specific response shapes.

**Tech Stack:** Astro 7, strict TypeScript, Bun test runner, CSS custom properties, `three` with `GLTFLoader`, `@fontsource/newsreader`, `@fontsource/be-vietnam-pro`, Astro `<Image />`, static `getStaticPaths()` routes.

## Global Constraints

- `DESIGN.md` and `docs/superpowers/specs/2026-07-16-finefoods-client-review-mvp-design.md` are binding design sources. Do not use the legacy Paradise website as a visual or implementation reference.
- Output remains Astro static output. `/` redirects to `/en/`; both default and secondary locales keep explicit `/en/` and `/vi/` prefixes.
- Consult the Astro docs MCP before any Astro-specific implementation choice. `AGENTS.md` also requires Context7 for current framework/library documentation.
- Page components and route files call `src/lib/cms/` functions and never import demo fixtures directly.
- Demo content and temporary assets must be visibly identified in source documentation and must not be described as verified business claims.
- Client JavaScript is limited to mobile navigation, product filtering/result announcements, enquiry state, and lazy 3D enhancement.
- The 3D model is a real local GLB, but the server-rendered poster, metadata, and CTAs remain useful when JavaScript, WebGL, the model, or the runtime is unavailable.
- Target WCAG 2.2 AA: semantic landmarks, skip link, visible focus, keyboard interaction, associated validation errors, adequate contrast, no color-only meaning, locale-correct `lang`, and reduced-motion behavior.
- Use `Newsreader` only for editorial display text and `Be Vietnam Pro` for body, UI, and technical content.
- Palette tokens: milk-paper `#F7F8F4`, cold-chain-blue `#123C69`, carbon `#172127`, stainless `#A9B4B8`, cultured-butter `#F2C14E`, bordeaux `#7D2C3B`, paper-white `#FFFFFF`, success `#356146`, error `#9A3F38`.
- Validate desktop and `390px` mobile layouts in English and Vietnamese. No horizontal overflow is acceptable.
- Do not add a carousel, looping background video, glassmorphism, fake commerce, decorative gold, pervasive scroll animation, CMS-vendor dependency, or framework island where a small browser script is sufficient.
- Preserve existing user changes in `AGENTS.md`, `CLAUDE.md`, `AGENTS.original.md`, and `DESIGN.md`; do not stage or rewrite them.

## Official Documentation Decisions

- Use Astro `i18n` configuration with `prefixDefaultLocale: true` and `redirectToDefaultLocale: true`: <https://docs.astro.build/en/reference/configuration-reference/#i18nrouting>.
- Static dynamic pages export `getStaticPaths()` and return string params plus normalized props: <https://docs.astro.build/en/reference/routing-reference/#getstaticpaths>.
- Use Astro `<Image />` with a responsive `layout` for local raster assets; assets placed in `public/` are not optimized: <https://docs.astro.build/en/guides/images/#responsive-image-behavior>.
- Use direct Three.js `WebGLRenderer` and `GLTFLoader` behind a poster-first lazy enhancement. Import the runtime only after actual viewport intersection or user interaction, preserve vertical page scrolling, bound pointer rotation to ±18°, clean up listeners/observers/render resources, handle WebGL context loss, and keep the emitted lazy runtime chunk at or below 180 KB gzip. Current APIs were checked through Context7 against `/mrdoob/three.js`.

## File Map

```text
astro.config.mjs                              Astro i18n/image/build configuration
package.json                                  check/test/build scripts and dependencies
src/env.d.ts                                  project environment typings
src/layouts/SiteLayout.astro                  localized document shell and SEO
src/styles/{tokens,typography,global}.css      design system foundation
src/lib/i18n/{types,ui,routes}.ts              locale types, copy, counterpart routes
src/lib/seo/meta.ts                           canonical/alternate metadata builder
src/lib/cms/{types,demo-data,queries}.ts       normalized domain model and default adapter
src/lib/catalog/filter-products.ts             pure filtering logic
src/lib/enquiry/{types,validation,submit}.ts   form contract and demo submission
src/lib/three/enhancement.ts                   pure 3D eligibility logic
src/components/global/*                        header, footer, demo banner, button primitives
src/components/sections/*                      homepage sections
src/components/catalog/*                       cards, filters, detail presentation
src/components/brands/*                        brand cards/detail presentation
src/components/forms/EnquiryForm.astro         progressively enhanced form
src/components/three/ProductStage.astro        poster-first 3D stage
src/pages/{en,vi}/**                            localized routes
src/pages/404.astro                            localized-choice error page
src/assets/demo/*                              authored demo SVG/raster imagery and poster
public/models/demo-package.glb                 temporary local model
public/models/README.md                        model source/license/demo warning
tests/*.test.ts                                Bun unit tests
```

---

### Task 1: Static bilingual foundation and design tokens

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Delete: `src/components/Welcome.astro`
- Delete: `src/assets/astro.svg`
- Delete: `src/assets/background.svg`
- Create: `src/lib/i18n/types.ts`
- Create: `src/lib/i18n/ui.ts`
- Create: `src/lib/i18n/routes.ts`
- Create: `src/lib/seo/meta.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/typography.css`
- Create: `src/styles/global.css`
- Delete: `src/layouts/Layout.astro`
- Create: `src/layouts/SiteLayout.astro`
- Create: `tests/i18n.test.ts`

**Interfaces:**
- Produces: `type Locale = 'en' | 'vi'`, `locales`, `isLocale()`, `ui[locale]`, `localizedPath(locale, route)`, `counterpartPath(pathname, targetLocale, maps)`, `buildMeta(input)`.
- Produces: `SiteLayout` props `{ locale, title, description, pathname, alternatePath?, image? }`.

- [ ] **Step 1: Add the test/check/font/runtime dependencies and scripts**

Run:

```powershell
bun add three @fontsource/newsreader @fontsource/be-vietnam-pro
bun add -d @astrojs/check typescript
```

Set scripts exactly to:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "check": "astro check",
  "test": "bun test",
  "preview": "astro preview",
  "astro": "astro"
}
```

Expected: dependencies install successfully and `bun.lock` changes.

- [ ] **Step 2: Write failing locale and metadata tests**

```ts
import { describe, expect, test } from 'bun:test';
import { counterpartPath, localizedPath } from '../src/lib/i18n/routes';
import { buildMeta } from '../src/lib/seo/meta';

describe('localized routes', () => {
  test('prefixes every route including English', () => {
    expect(localizedPath('en', 'products')).toBe('/en/products/');
    expect(localizedPath('vi', 'products')).toBe('/vi/san-pham/');
  });

  test('preserves translated product counterparts', () => {
    const maps = [{ en: '/en/products/demo-butter/', vi: '/vi/san-pham/bo-mau/' }];
    expect(counterpartPath('/en/products/demo-butter/', 'vi', maps)).toBe('/vi/san-pham/bo-mau/');
  });

  test('falls back to the target locale home', () => {
    expect(counterpartPath('/en/unknown/', 'vi', [])).toBe('/vi/');
  });
});

test('buildMeta returns canonical and reciprocal alternates', () => {
  const meta = buildMeta({
    site: 'https://demo.paradisefinefoods.com',
    locale: 'en',
    title: 'Products',
    description: 'Demo catalog',
    pathname: '/en/products/',
    alternatePath: '/vi/san-pham/',
  });
  expect(meta.canonical).toBe('https://demo.paradisefinefoods.com/en/products/');
  expect(meta.alternates).toEqual([
    { locale: 'en', href: 'https://demo.paradisefinefoods.com/en/products/' },
    { locale: 'vi', href: 'https://demo.paradisefinefoods.com/vi/san-pham/' },
  ]);
});
```

- [ ] **Step 3: Run tests and confirm the expected failure**

Run: `bun test tests/i18n.test.ts`

Expected: FAIL with module-not-found errors for `routes` and `meta`.

- [ ] **Step 4: Implement locale helpers, complete bilingual UI copy, and metadata builder**

Use these exact route keys and translations:

```ts
export type Locale = 'en' | 'vi';
export type RouteKey = 'home' | 'products' | 'brands' | 'contact';
export const locales = ['en', 'vi'] as const;
export const routeSegments: Record<Locale, Record<RouteKey, string>> = {
  en: { home: '', products: 'products', brands: 'brands', contact: 'contact' },
  vi: { home: '', products: 'san-pham', brands: 'thuong-hieu', contact: 'lien-he' },
};
```

`ui.ts` must include every header, footer, hero, catalog, filter, product, brand, form, status, and 404 label used by later tasks, with English and Vietnamese values side by side. No page component may use a conditional English/Vietnamese string literal.

`buildMeta()` must return title, description, canonical, Open Graph values, and reciprocal `en`/`vi` alternates using the configured `site` origin.

- [ ] **Step 5: Configure Astro and create the localized layout/design foundation**

Set:

```js
export default defineConfig({
  site: 'https://demo.paradisefinefoods.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
  image: { responsiveStyles: true, layout: 'constrained' },
});
```

`SiteLayout.astro` must render `<!doctype html>`, locale `lang`, localized metadata, canonical/alternate tags, a skip link to `#main-content`, font imports, the three shared stylesheets, and a slot. Define the exact palette tokens from Global Constraints plus spacing, container, type scale, focus ring, and transition tokens. Add global reset, readable defaults, button/link focus, reduced-motion rules, and `overflow-x: clip` only as a final guard—not as a substitute for fixing overflowing children.

- [ ] **Step 6: Run the foundation verification**

Run: `bun test tests/i18n.test.ts`

Expected: all locale and metadata tests PASS.

Run: `bun run check`

Expected: Astro reports 0 errors.

- [ ] **Step 7: Commit**

```powershell
git add package.json bun.lock astro.config.mjs src/lib/i18n src/lib/seo src/styles src/layouts tests/i18n.test.ts src/components/Welcome.astro src/assets/astro.svg src/assets/background.svg
git commit -m "feat: establish bilingual Astro foundation"
```

---

### Task 2: Vendor-neutral CMS adapter and demo records

**Files:**
- Create: `src/lib/cms/types.ts`
- Create: `src/lib/cms/demo-data.ts`
- Create: `src/lib/cms/queries.ts`
- Create: `src/lib/catalog/filter-products.ts`
- Create: `tests/cms.test.ts`
- Create: `tests/catalog-filter.test.ts`

**Interfaces:**
- Consumes: `Locale` from `src/lib/i18n/types.ts`.
- Produces: normalized `LocalizedText`, `LocalizedSlug`, `ImageAsset`, `Category`, `Brand`, `Product`, `GlobalSettings`, `FeaturedContent`, `ProductQuery`.
- Produces exactly: `getGlobalSettings(locale)`, `getCategories(locale)`, `getProducts(locale, query?)`, `getProductBySlug(locale, slug)`, `getBrands(locale)`, `getBrandBySlug(locale, slug)`, `getFeaturedContent(locale)`. Task 7 adds `submitEnquiry(input)` to the same public CMS barrel without changing these query signatures.
- Produces: `filterProducts(products, query)` as a pure case-insensitive AND filter across search/category/brand/application.

- [ ] **Step 1: Write failing adapter and filter tests**

Tests must assert:

```ts
const products = await getProducts('en');
expect(products.length).toBeGreaterThanOrEqual(6);
expect(products.every((item) => item.demo === true)).toBe(true);
expect(products.every((item) => item.slug && item.name && item.storage.label)).toBe(true);
expect((await getProducts('vi')).map((item) => item.id)).toEqual(products.map((item) => item.id));
expect((await getProductBySlug('vi', 'bo-lat-mau'))?.id).toBe('cultured-butter-sheet');
expect((await getBrands('en')).length).toBeGreaterThanOrEqual(3);
expect((await getFeaturedContent('en')).hero.product.id).toBe('cultured-butter-sheet');
```

Filter tests must cover a diacritic-insensitive search (`bo` matches Vietnamese `bơ`), combined brand/category filters, applications, and a zero-result query.

- [ ] **Step 2: Run tests and verify failure**

Run: `bun test tests/cms.test.ts tests/catalog-filter.test.ts`

Expected: FAIL because CMS and filter modules do not exist.

- [ ] **Step 3: Define normalized domain types and demo fixtures**

Create at least six products, three brands, and four categories. Use these stable IDs:

```text
Products: cultured-butter-sheet, whipping-cream-35, mascarpone-tub,
cream-cheese-block, mozzarella-shred, unsalted-butter-block
Brands: maison-laitiere, atelier-creme, formagerie-nord
Categories: butter, cream, cheese, pastry
```

Each product must have localized names/slugs/descriptions/alt text, brand/category references, origin, applications, audience channels, pack format, storage label/temperature, benefits, featured state, and demo flag. Data comments and `GlobalSettings.demoNotice` must state that names, specifications, claims, and imagery are review-only fictional content.

`ImageAsset` points to local authored demo SVGs under `src/assets/demo/`; create simple original product-stage and editorial SVG assets with explicit dimensions, restrained palette, and no third-party logo or factual claim.

- [ ] **Step 4: Implement the default query adapter and pure filter**

Query functions normalize localized fixture fields before returning them. Return copies rather than exposing mutable fixture arrays. Unknown slugs return `undefined`. Route files build paired English/Vietnamese paths from stable IDs and localized slugs returned by these queries; CMS code does not own URL construction.

Normalize search with:

```ts
const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
```

Apply every populated query field with AND semantics and values within an array with OR semantics.

- [ ] **Step 5: Run tests and static analysis**

Run: `bun test tests/cms.test.ts tests/catalog-filter.test.ts`

Expected: all adapter and filter tests PASS.

Run: `bun run check`

Expected: 0 errors.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/cms src/lib/catalog src/assets/demo tests/cms.test.ts tests/catalog-filter.test.ts
git commit -m "feat: add CMS-neutral demo catalog"
```

---

### Task 3: Global shell and homepage composition

**Files:**
- Create: `src/components/global/DemoNotice.astro`
- Create: `src/components/global/Header.astro`
- Create: `src/components/global/Footer.astro`
- Create: `src/components/global/LanguageSwitcher.astro`
- Create: `src/components/global/ButtonLink.astro`
- Create: `src/components/sections/Hero.astro`
- Create: `src/components/sections/CredibilityStrip.astro`
- Create: `src/components/sections/CategoryDiscovery.astro`
- Create: `src/components/sections/FeaturedProducts.astro`
- Create: `src/components/sections/FeaturedBrands.astro`
- Create: `src/components/sections/ServiceProof.astro`
- Create: `src/components/sections/ChannelPathways.astro`
- Create: `src/components/sections/FinalCta.astro`
- Create: `src/components/catalog/ProductCard.astro`
- Create: `src/components/brands/BrandCard.astro`
- Modify: `src/layouts/SiteLayout.astro`
- Replace: `src/pages/index.astro` with an empty root route consumed by Astro i18n
- Create: `src/pages/en/index.astro`
- Create: `src/pages/vi/index.astro`

**Interfaces:**
- Consumes: `getGlobalSettings()`, `getFeaturedContent()`, `getCategories()`, locale UI copy, and `counterpartPath()` with page-provided route pairs.
- Produces: shared site shell and complete server-rendered homepages; `Hero.astro` exposes a named `stage` slot used by Task 4.

- [ ] **Step 1: Replace the explicit redirect and build shared shell components**

`SiteLayout` composes `DemoNotice`, `Header`, `<main id="main-content">`, and `Footer`. The demo notice is concise and visually quiet. Header uses a native button with `aria-expanded`/`aria-controls`; a small inline module toggles only the mobile disclosure and closes it on Escape. Without JavaScript, primary links remain visible through a `<noscript>` fallback.

Keep `src/pages/index.astro` as an empty root route with no `Astro.redirect()` call and no rendered content. Astro 7 requires the root route when `prefixDefaultLocale: true`; the existing `redirectToDefaultLocale: true` configuration transforms that route into the required `/` to `/en/` redirect. Do not add an explicit or middleware redirect.

The language switcher receives `currentPath`, `alternatePath`, and `locale`, exposes the target language name (`Tiếng Việt` or `English`), and uses `hreflang`. Each route supplies its known alternate; static index routes use fixed pairs, while detail routes derive the counterpart by matching stable record IDs across locale queries.

- [ ] **Step 2: Build the homepage as explicit sections**

Use the approved order: header, hero, credibility strip, category discovery, featured products, featured brands, service proof, four channel pathways, final CTA, footer. Hero text is exactly:

```text
EN: Exceptional ingredients. Delivered with confidence.
VI: Nguyên liệu tuyển chọn. Giao hàng trọn niềm tin.
```

The hero metadata rail displays brand, origin, pack format, and storage. Both CTAs exist outside the 3D slot. Section copy comes from `ui.ts` or CMS query results, never inline locale conditionals.

- [ ] **Step 3: Apply the Cold-Chain Atelier composition**

Implement asymmetric desktop grid, milk-paper canvas, carbon/cold-chain structure, one cultured-butter accent per composition, fine stainless rules, editorial apertures, consistent card anatomy, and mobile stacks. Avoid gradients except subtle directional stage lighting; do not use rounded cards as the dominant motif. Add only short hover/focus/disclosure transitions.

- [ ] **Step 4: Build and inspect generated routes**

Run: `bun run check`

Expected: 0 errors.

Run: `bun run build`

Expected: build succeeds and logs generated `/en/` and `/vi/` pages plus root redirect.

- [ ] **Step 5: Commit**

```powershell
git add src/components src/layouts/SiteLayout.astro src/pages/index.astro src/pages/en/index.astro src/pages/vi/index.astro
git commit -m "feat: compose bilingual marketing homepage"
```

---

### Task 4: Poster-first temporary 3D product stage

**Files:**
- Create: `src/lib/three/enhancement.ts`
- Create: `src/components/three/ProductStage.astro`
- Create: `src/env.d.ts`
- Create: `src/assets/demo/hero-poster.svg`
- Create: `public/models/demo-package.glb`
- Create: `public/models/README.md`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Create: `tests/three-enhancement.test.ts`

**Interfaces:**
- Produces: `shouldEnhance3D({ saveData, reducedMotion, webglAvailable }): boolean`.
- `ProductStage` props: `{ locale, modelSrc, posterSrc, alt, interactionPrompt }`.

- [ ] **Step 1: Write failing enhancement eligibility tests**

```ts
import { expect, test } from 'bun:test';
import { shouldEnhance3D } from '../src/lib/three/enhancement';

test.each([
  [{ saveData: false, reducedMotion: false, webglAvailable: true }, true],
  [{ saveData: true, reducedMotion: false, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: true, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: false, webglAvailable: false }, false],
])('3D eligibility %o => %s', (input, expected) => {
  expect(shouldEnhance3D(input)).toBe(expected);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `bun test tests/three-enhancement.test.ts`

Expected: FAIL because `enhancement.ts` does not exist.

- [ ] **Step 3: Implement pure eligibility and poster-first component**

`ProductStage.astro` initially renders the authored poster, localized alt text, interaction prompt, and a status element. Store the model URL in `data-model-src`; do not import Three.js or request the GLB until eligibility succeeds and the stage actually intersects the viewport (`rootMargin: '0px'`) or receives user focus/pointer interaction.

Load a dedicated adapter with a dynamic import. The adapter imports only the required named Three.js core exports and `three/addons/loaders/GLTFLoader.js`; do not use `OrbitControls`. It creates an accessible presentation canvas, sizes it with `ResizeObserver`, caps device pixel ratio, frames the loaded object, and renders bounded pointer rotation of at most ±18° while preserving vertical page scrolling with `touch-action: pan-y`. Do not enable AR or uncontrolled auto-rotation. On load, reveal the canvas without removing the poster DOM; on error or WebGL context loss, retain the poster and set a localized non-alarming status. On disconnect or failure, cancel animation work, disconnect observers, remove listeners, dispose geometries, materials, textures and the renderer, and release the WebGL context.

The production build must measure the emitted lazy 3D JavaScript chunk and fail if it exceeds 180 KB gzip. Generated initial HTML must contain the poster, metadata, and CTAs but no eager GLB request or eager Three.js runtime reference.

- [ ] **Step 4: Add the temporary GLB and provenance note**

Download the Khronos `BoxTextured` binary sample from:

```text
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoxTextured/glTF-Binary/BoxTextured.glb
```

Save it as `public/models/demo-package.glb`. `public/models/README.md` must record the upstream URL, retrieval date, upstream license location, and that the asset is a temporary review-only stand-in that must be replaced with the approved Paradise product GLB and matching poster.

- [ ] **Step 5: Wire the stage into both heroes and verify**

Run: `bun test tests/three-enhancement.test.ts`

Expected: all four cases PASS.

Run: `bun run check && bun run build`

Expected: 0 check errors and successful static build; the initial HTML contains poster, metadata, and CTAs but no eager model `src`.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/three src/components/three src/env.d.ts src/assets/demo/hero-poster.svg public/models src/pages/en/index.astro src/pages/vi/index.astro tests/three-enhancement.test.ts
git commit -m "feat: add resilient demo 3D product stage"
```

---

### Task 5: Localized catalog listing, filtering, and product details

**Files:**
- Create: `src/components/catalog/CatalogFilters.astro`
- Create: `src/components/catalog/ProductGrid.astro`
- Create: `src/components/catalog/ProductMetadata.astro`
- Create: `src/components/catalog/ProductDetail.astro`
- Create: `src/components/global/Breadcrumbs.astro`
- Create: `src/pages/en/products/index.astro`
- Create: `src/pages/en/products/[slug].astro`
- Create: `src/pages/vi/san-pham/index.astro`
- Create: `src/pages/vi/san-pham/[slug].astro`
- Create: `tests/catalog-routes.test.ts`

**Interfaces:**
- Consumes: CMS product/category/brand queries, `filterProducts()`, locale UI copy, `ProductCard`.
- Produces: static product route families and DOM filter contract: `[data-catalog]`, `[data-product-card]`, `[data-filter-search]`, `[data-filter-category]`, `[data-filter-brand]`, `[data-filter-application]`, `[data-result-count]`, `[data-empty-state]`, `[data-reset-filters]`.

- [ ] **Step 1: Write failing route-contract tests**

Test that every product returned by `getProducts('en')` and `getProducts('vi')` has a locale-correct detail URL, that counterpart mappings are reciprocal, and that an unknown slug returns `undefined`. Run `bun test tests/catalog-routes.test.ts` and expect failure until route helpers are exported.

- [ ] **Step 2: Build product indexes with progressive filtering**

Render every card on the server. The inline module reads normalized data attributes and applies the same AND semantics as `filterProducts()`. Update `hidden`, localized count text, empty-state visibility, and an `aria-live="polite"` status. Reset clears all controls and restores all products. A `<noscript>` message explains that the full catalog remains visible when interactive filtering is unavailable.

- [ ] **Step 3: Build localized static product details**

Each `[slug].astro` exports typed `getStaticPaths()` using the locale query function and passes the normalized product as props. Render breadcrumbs, product stage image, brand/category/origin, pack format, storage, applications, professional benefits, enquiry CTA with product ID in the URL, and up to three related products. Do not render ingredients, allergens, certifications, or claims that the demo dataset does not define.

- [ ] **Step 4: Verify catalog behavior**

Run: `bun test tests/catalog-filter.test.ts tests/catalog-routes.test.ts`

Expected: all tests PASS.

Run: `bun run check && bun run build`

Expected: all localized product index and detail routes generate successfully.

- [ ] **Step 5: Commit**

```powershell
git add src/components/catalog src/components/global/Breadcrumbs.astro src/pages/en/products src/pages/vi/san-pham tests/catalog-routes.test.ts
git commit -m "feat: add bilingual product catalog"
```

---

### Task 6: Localized brand index and detail experience

**Files:**
- Create: `src/components/brands/BrandDetail.astro`
- Create: `src/pages/en/brands/index.astro`
- Create: `src/pages/en/brands/[slug].astro`
- Create: `src/pages/vi/thuong-hieu/index.astro`
- Create: `src/pages/vi/thuong-hieu/[slug].astro`
- Create: `tests/brand-routes.test.ts`

**Interfaces:**
- Consumes: `getBrands()`, `getBrandBySlug()`, `getProducts()`, route counterparts, `BrandCard`, `ProductCard`.
- Produces: localized brand index/detail route families.

- [ ] **Step 1: Write failing route tests**

Assert that all three brand IDs have English and Vietnamese slugs, every slug resolves to the same stable ID in both locales, and counterpart mappings are reciprocal. Run `bun test tests/brand-routes.test.ts`; expect failure until all route helpers are present.

- [ ] **Step 2: Implement brand indexes and typed static paths**

Render a restrained editorial intro and consistent brand grid. Each `[slug].astro` exports typed `getStaticPaths()` from `getBrands(locale)` and passes a normalized brand.

- [ ] **Step 3: Implement representative brand detail composition**

Render origin, localized story, category list, and linked products. Apply the record's one demo accent only to a decorative field, fine rule, and selected metadata badge; keep all text and controls on Paradise tokens. Include a visible demo-content note near the story.

- [ ] **Step 4: Verify and commit**

Run: `bun test tests/brand-routes.test.ts`

Expected: PASS.

Run: `bun run check && bun run build`

Expected: all brand routes generate with 0 errors.

```powershell
git add src/components/brands src/pages/en/brands src/pages/vi/thuong-hieu tests/brand-routes.test.ts
git commit -m "feat: add bilingual brand experience"
```

---

### Task 7: Accessible demo enquiry flow

**Files:**
- Create: `src/lib/enquiry/types.ts`
- Create: `src/lib/enquiry/validation.ts`
- Create: `src/lib/enquiry/submit.ts`
- Modify: `src/lib/cms/queries.ts`
- Create: `src/components/forms/EnquiryForm.astro`
- Create: `src/pages/en/contact.astro`
- Create: `src/pages/vi/lien-he.astro`
- Create: `tests/enquiry.test.ts`

**Interfaces:**
- Produces: `EnquiryInput`, `EnquiryErrors`, `EnquirySuccess`, `validateEnquiry(input)`, `submitEnquiry(input)`; re-export `submitEnquiry` from `src/lib/cms/queries.ts` so pages retain one vendor-neutral integration boundary.
- `EnquiryInput`: `{ locale: Locale, name, company, email, phone, interest, message, consent, productId? }`.
- `EnquirySuccess`: `{ ok: true, reference: string, message: string, receivedAt: string, demo: true }`.

- [ ] **Step 1: Write failing validation/submission tests**

Cover empty required fields, malformed email, missing consent, valid English and Vietnamese inputs, and successful demo submission. Require deterministic `reference` by injecting a clock and ID factory into the private adapter; public `submitEnquiry()` uses current time and `crypto.randomUUID()`.

Run: `bun test tests/enquiry.test.ts`

Expected: FAIL because enquiry modules do not exist.

- [ ] **Step 2: Implement pure validation and structured success adapter**

Required fields are name, email, interest, message, and consent. Trim all string inputs. Email must match a conservative `^[^\s@]+@[^\s@]+\.[^\s@]+$` pattern. Return field messages keyed by input name using `input.locale`. `submitEnquiry(input)` waits 350ms to make the submitting state reviewable, revalidates, and returns demo success; invalid input throws a typed `EnquiryValidationError` containing field errors.

- [ ] **Step 3: Implement progressively enhanced localized form**

Render explicit labels, required markers explained in text, `aria-describedby`, inline error containers, general status with `role="status"`, and a demo-delivery notice. The small module collects `FormData`, disables only the submit button while submitting, calls `submitEnquiry()`, focuses the first invalid control, and focuses the success heading after success. Preserve entered values on error. Read optional `product` query parameter and preselect it only when it matches a known demo product ID.

- [ ] **Step 4: Verify and commit**

Run: `bun test tests/enquiry.test.ts`

Expected: all validation and submission tests PASS.

Run: `bun run check && bun run build`

Expected: 0 errors and both localized contact pages generated.

```powershell
git add src/lib/enquiry src/components/forms src/pages/en/contact.astro src/pages/vi/lien-he.astro tests/enquiry.test.ts
git commit -m "feat: add accessible demo enquiry flow"
```

---

### Task 8: Localized 404, final integration, and browser verification

**Files:**
- Create: `src/pages/404.astro`
- Create: `docs/demo-content.md`
- Modify: any implemented file only when verification identifies a concrete defect

**Interfaces:**
- Consumes all prior task outputs.
- Produces a build-verified, browser-reviewed client MVP and a replacement ledger for every demo asset/data source.

- [ ] **Step 1: Add the useful 404 and demo replacement ledger**

The 404 page detects no trusted locale, so it offers both English and Vietnamese headings, explanations, and home/catalog links. `docs/demo-content.md` inventories demo products, brands, copy, contact details, authored SVGs, poster, GLB, submission adapter, site origin, and the exact production owner/input required to replace each.

- [ ] **Step 2: Run the complete automated suite**

Run: `bun test`

Expected: all tests PASS with 0 failures.

Run: `bun run check`

Expected: 0 errors.

Run: `bun run build`

Expected: successful static build with English/Vietnamese homepage, product, brand, contact, and product/brand detail routes.

- [ ] **Step 3: Start the documented Astro background dev server**

Run: `astro dev --background`

Expected: Astro reports a running local URL. Use `astro dev status` and `astro dev logs` if startup fails.

- [ ] **Step 4: Browser-review desktop and mobile**

Using the in-app browser, inspect at desktop and `390px` mobile widths:

```text
/en/
/vi/
/en/products/
/vi/san-pham/
/en/products/cultured-butter-sheet/
/vi/san-pham/bo-lat-mau/
/en/brands/maison-laitiere/
/vi/thuong-hieu/nha-sua-maison/
/en/contact/
/vi/lien-he/
/404.html
```

For each representative family verify: no horizontal overflow, intentional composition, correct locale, visible focus, header/menu behavior, filter updates and live count, zero-result reset, form errors and success, language counterpart, console free of errors, and legible Vietnamese copy.

- [ ] **Step 5: Verify resilience modes**

In browser emulation or by temporarily forcing the corresponding conditions, verify reduced motion, failed model URL, JavaScript disabled, and narrow viewport. In every case the hero poster, metadata, CTAs, primary navigation, and catalog content remain available. Restore the real local demo model URL after the failure test.

- [ ] **Step 6: Fix only observed defects and rerun covering checks**

For every fix, record the failing route/viewport/state, make the smallest correction, then rerun the covering unit test or build plus the exact browser scenario. Add each verified fix file individually with its literal path immediately after that check; never use `git add -A`. Do not add unreviewed features during polish.

- [ ] **Step 7: Commit**

```powershell
git add src/pages/404.astro docs/demo-content.md
git commit -m "chore: verify client-review MVP"
```

## Completion Evidence

The implementation is complete only when the progress ledger marks Tasks 1–8 review-clean, the final whole-branch reviewer reports both spec compliance and code quality approved, `bun test`, `bun run check`, and `bun run build` all pass from the final commit, and the browser review confirms the representative English/Vietnamese routes at desktop and `390px` mobile widths.
