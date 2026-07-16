# Living Ingredients Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the industrial 3D-led MVP with the Paradise-branded Living Ingredients design, organic 2D motion and uniform bilingual routes without regressing catalog, enquiry, accessibility or CMS-neutral behavior.

**Architecture:** Keep Astro static generation and the existing vendor-neutral query boundary. Replace Three.js with server-rendered product art plus three small progressive enhancements: motion eligibility/reveals, a decorative 2D canvas and a manual product carousel. Normalize structural routes to the same English segments under `/en/` and `/vi/`, with Astro-generated permanent redirects from the former Vietnamese paths.

**Tech Stack:** Astro 7 static output, TypeScript 6, Bun tests, CSS/SVG, Canvas 2D API, IntersectionObserver, Web Animations API, self-hosted Fontsource packages.

## Global Constraints

- Work directly on `main`; preserve unrelated user changes.
- Use the exact self-hosted Paradise full logo; never hotlink, redraw or typeset a substitute.
- Remove `three`, `@types/three`, all WebGL/GLB/model-stage source, tests, assets and built output.
- Ship the manual featured-product carousel, selected scroll reveals and eligible decorative 2D canvas; every feature has a static fallback.
- `prefers-reduced-motion: reduce` shows the settled composition and disables ambient drift, path drawing and animated sliding.
- `navigator.connection.saveData` prevents canvas and nonessential motion code from loading.
- Critical initial JavaScript remains `<= 120KB` compressed.
- Canvas/animation JavaScript remains `<= 35KB` compressed; transferred authored SVG graphics remain `<= 80KB` compressed on the homepage.
- Keep WCAG 2.2 AA behavior, `44px` targets, keyboard access, no-JavaScript content and bilingual UI/metadata.
- Use uniform structural routes: `/en/products/`, `/vi/products/`, `/en/brands/`, `/vi/brands/`, `/en/contact/`, `/vi/contact/`.
- Detail slugs remain localized where the demo records define localized slugs.
- Retain the CMS-neutral `get*()` query boundary and default demo-return behavior.
- Use no general animation dependency; native browser APIs and CSS are sufficient.
- Use the supplied Savencia brochure only for visual principles, not copied layouts or partner artwork.

## File Structure

### New files

- `src/assets/brand/paradise-fine-foods-logo.png` — exact self-hosted Paradise full logo.
- `src/assets/demo/living-hero-product.svg` — demo product cutout and organic static hero scene.
- `src/assets/demo/living-editorial.svg` — organic editorial fallback art.
- `src/components/global/OrganicMark.astro` — decorative authored droplet/petal SVG primitive.
- `src/components/sections/LivingHero.astro` — semantic static hero and enhancement hooks.
- `src/lib/motion/preferences.ts` — pure motion/data eligibility decision.
- `src/lib/motion/living-canvas.ts` — decorative Canvas 2D lifecycle.
- `src/lib/motion/reveal.ts` — IntersectionObserver reveal lifecycle.
- `src/lib/carousel/controller.ts` — manual carousel state and DOM controller.
- `tests/living-design-contract.test.ts` — source-level brand, shape, motion and 3D-removal contracts.
- `tests/motion.test.ts` — eligibility, canvas lifecycle and reveal contracts.
- `tests/carousel.test.ts` — pure carousel state and DOM controller behavior.
- `tests/verify-built-living-design.ts` — generated-output identity, motion, route and no-3D verifier.

### Removed files

- `src/components/three/ProductStage.astro`
- `src/lib/three/activation.ts`
- `src/lib/three/enhancement.ts`
- `src/lib/three/stage-state.ts`
- `src/lib/three/viewer.ts`
- `public/models/demo-package.glb`
- `public/models/README.md`
- `tests/three-enhancement.test.ts`
- `tests/verify-built-3d-stage.ts`

### Renamed route directories

- `src/pages/vi/san-pham/` -> `src/pages/vi/products/`
- `src/pages/vi/thuong-hieu/` -> `src/pages/vi/brands/`
- `src/pages/vi/lien-he.astro` -> `src/pages/vi/contact.astro`

---

### Task 1: Normalize bilingual routes and protect legacy paths

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/lib/i18n/routes.ts`
- Modify: `src/lib/catalog/routes.ts`
- Modify: `src/lib/brands/routes.ts`
- Rename: `src/pages/vi/san-pham/index.astro` -> `src/pages/vi/products/index.astro`
- Rename: `src/pages/vi/san-pham/[slug].astro` -> `src/pages/vi/products/[slug].astro`
- Rename: `src/pages/vi/thuong-hieu/index.astro` -> `src/pages/vi/brands/index.astro`
- Rename: `src/pages/vi/thuong-hieu/[slug].astro` -> `src/pages/vi/brands/[slug].astro`
- Rename: `src/pages/vi/lien-he.astro` -> `src/pages/vi/contact.astro`
- Modify: `src/pages/404.astro`
- Test: `tests/i18n.test.ts`
- Test: `tests/catalog-routes.test.ts`
- Test: `tests/brand-routes.test.ts`
- Test: `tests/mvp-completion.test.ts`

**Interfaces:**
- Consumes: existing `Locale`, `RouteKey`, `Product.slug`, `Brand.slug` and counterpart maps.
- Produces: `localizedPath(locale, route)` returning uniform structural segments; Astro redirect pages for old Vietnamese paths; unchanged localized detail-slug mapping.

- [ ] **Step 1: Change route tests first**

Update assertions to require the shared segments and legacy redirects:

```ts
expect(localizedPath('en', 'products')).toBe('/en/products/');
expect(localizedPath('vi', 'products')).toBe('/vi/products/');
expect(localizedPath('en', 'brands')).toBe('/en/brands/');
expect(localizedPath('vi', 'brands')).toBe('/vi/brands/');
expect(localizedPath('vi', 'contact')).toBe('/vi/contact/');

const config = source('astro.config.mjs');
for (const pair of [
  ["'/vi/san-pham'", "'/vi/products'"],
  ["'/vi/san-pham/[slug]'", "'/vi/products/[slug]'"],
  ["'/vi/thuong-hieu'", "'/vi/brands'"],
  ["'/vi/thuong-hieu/[slug]'", "'/vi/brands/[slug]'"],
  ["'/vi/lien-he'", "'/vi/contact'"],
]) {
  expect(config).toContain(`${pair[0]}: ${pair[1]}`);
}
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `bun test tests/i18n.test.ts tests/catalog-routes.test.ts tests/brand-routes.test.ts tests/mvp-completion.test.ts`  
Expected: FAIL because Vietnamese paths still use `san-pham`, `thuong-hieu` and `lien-he`.

- [ ] **Step 3: Implement uniform segment mapping and redirects**

Use one structural map for both locales:

```ts
export const routeSegments: Record<Locale, Record<RouteKey, string>> = {
  en: { home: '', products: 'products', brands: 'brands', contact: 'contact' },
  vi: { home: '', products: 'products', brands: 'brands', contact: 'contact' },
};
```

Add current Astro static redirects:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://demo.paradisefinefoods.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
  image: { responsiveStyles: true, layout: 'constrained' },
  redirects: {
    '/vi/san-pham': '/vi/products',
    '/vi/san-pham/[slug]': '/vi/products/[slug]',
    '/vi/thuong-hieu': '/vi/brands',
    '/vi/thuong-hieu/[slug]': '/vi/brands/[slug]',
    '/vi/lien-he': '/vi/contact',
  },
});
```

Rename the route files, update canonical `pathname` constants and update all hard-coded 404, test and documentation links. Do not change localized detail slugs.

- [ ] **Step 4: Verify routes and generated redirects**

Run: `bun test tests/i18n.test.ts tests/catalog-routes.test.ts tests/brand-routes.test.ts tests/mvp-completion.test.ts && bun run build`  
Expected: focused tests PASS; `dist/vi/products/index.html`, `dist/vi/brands/index.html` and `dist/vi/contact/index.html` exist; old route output is a redirect page.

- [ ] **Step 5: Commit**

```powershell
git add astro.config.mjs src/lib src/pages/vi src/pages/404.astro tests
git commit -m "feat: normalize bilingual routes"
```

---

### Task 2: Install the authentic Paradise identity and organic token foundation

**Files:**
- Create: `src/assets/brand/paradise-fine-foods-logo.png`
- Create: `src/components/global/OrganicMark.astro`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/typography.css`
- Modify: `src/styles/global.css`
- Modify: `src/components/global/Header.astro`
- Modify: `src/components/global/Footer.astro`
- Modify: `src/components/global/ButtonLink.astro`
- Modify: `src/components/global/DemoNotice.astro`
- Modify: `package.json`
- Modify: `bun.lock`
- Test: `tests/living-design-contract.test.ts`
- Test: `tests/homepage-contract.test.ts`

**Interfaces:**
- Consumes: current `Header` and `Footer` props, localized paths and `siteName` accessible label.
- Produces: exact self-hosted image asset; `OrganicMark` props `{ variant: 'drop' | 'seed' | 'petal'; color: 'orange' | 'blue' | 'green' | 'coral'; class?: string }`; new brand tokens used by all later tasks.

- [ ] **Step 1: Add a failing identity contract**

Create `tests/living-design-contract.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
const filesBelow = (directory: string): string[] => readdirSync(join(root, directory), { withFileTypes: true })
  .flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesBelow(path) : [path];
  });

describe('Living Ingredients identity', () => {
  test('self-hosts and renders the authentic Paradise logo', () => {
    expect(existsSync(join(root, 'src/assets/brand/paradise-fine-foods-logo.png'))).toBe(true);
    for (const file of ['src/components/global/Header.astro', 'src/components/global/Footer.astro']) {
      const component = source(file);
      expect(component).toContain('paradise-fine-foods-logo.png');
      expect(component).toContain('<Image');
    }
    expect(source('src/components/global/Header.astro')).not.toContain('<span>Paradise</span>');
  });

  test('defines the approved brand palette and organic mark primitive', () => {
    const tokens = source('src/styles/tokens.css');
    for (const value of ['#e46f2c', '#fa6c47', '#0796d2', '#94c11f', '#d94d55', '#fbfaf5', '#28342b']) {
      expect(tokens.toLowerCase()).toContain(value);
    }
    expect(source('src/components/global/OrganicMark.astro')).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-contract.test.ts`  
Expected: FAIL because the logo asset, organic mark and Living Ingredients tokens do not exist.

- [ ] **Step 3: Acquire and verify the exact logo**

Download the authoritative asset already identified on the original site:

```powershell
New-Item -ItemType Directory -Force src/assets/brand | Out-Null
Invoke-WebRequest 'https://paradisefinefoods.com/wp-content/uploads/2021/03/paradisefinefoods-full-logo.png' -OutFile 'src/assets/brand/paradise-fine-foods-logo.png'
```

Verify the file is a valid PNG with nonzero dimensions before use. Keep its original aspect ratio and add the source/approval replacement note to `docs/demo-content.md`.

- [ ] **Step 4: Implement tokens, type and shared identity**

Replace industrial tokens with the spec palette while retaining compatibility aliases only until all components migrate:

```css
:root {
  --color-paradise-orange: #e46f2c;
  --color-fresh-tangerine: #fa6c47;
  --color-savencia-blue: #0796d2;
  --color-garden-green: #94c11f;
  --color-soft-coral: #d94d55;
  --color-rice-paper: #fbfaf5;
  --color-paper-white: #fff;
  --color-deep-herb: #28342b;
  --color-mist-blue: #e8f6fa;
  --font-display: 'Newsreader', Georgia, serif;
  --font-body: 'Nunito', system-ui, sans-serif;
  --shape-drop: 62% 38% 55% 45% / 48% 58% 42% 52%;
}
```

Add `@fontsource/nunito`, remove `@fontsource/be-vietnam-pro`, import only used Nunito weights, render the logo through Astro `Image`, and make `OrganicMark` output one of three authored viewBox paths with `aria-hidden="true"` and `focusable="false"`.

- [ ] **Step 5: Verify shared components**

Run: `bun test tests/living-design-contract.test.ts tests/homepage-contract.test.ts && bun run check`  
Expected: PASS with zero Astro errors, warnings or hints.

- [ ] **Step 6: Commit**

```powershell
git add package.json bun.lock src/assets/brand src/components/global src/styles tests docs/demo-content.md
git commit -m "feat: apply Paradise brand foundation"
```

---

### Task 3: Remove 3D completely and build the static Living Hero with 2D canvas

**Files:**
- Remove: all files listed under **Removed files**
- Create: `src/assets/demo/living-hero-product.svg`
- Create: `src/components/sections/LivingHero.astro`
- Create: `src/lib/motion/preferences.ts`
- Create: `src/lib/motion/living-canvas.ts`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Modify: `src/lib/i18n/ui.ts`
- Modify: `src/lib/cms/demo-data.ts`
- Modify: `src/lib/cms/types.ts`
- Modify: `src/lib/cms/queries.ts`
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `docs/demo-content.md`
- Test: `tests/living-design-contract.test.ts`
- Test: `tests/motion.test.ts`
- Test: `tests/cms.test.ts`
- Test: `tests/homepage-composition.test.ts`

**Interfaces:**
- Consumes: `UiCopy['hero']`, `Product`, `productsPath`, `contactPath` and CMS `MediaAsset`.
- Produces: `LivingHero.astro`; `shouldEnhanceMotion({ reduceMotion, saveData }): boolean`; `mountLivingCanvas(canvas): { dispose(): void }`.

- [ ] **Step 1: Expand failing contracts for zero 3D and motion eligibility**

Add to `tests/living-design-contract.test.ts`:

```ts
test('contains no 3D runtime, model or stage contract', () => {
  const packageJson = source('package.json');
  expect(packageJson).not.toMatch(/"(?:three|@types\/three)"/);
  for (const path of ['src/components/three', 'src/lib/three', 'public/models']) {
    expect(existsSync(join(root, path))).toBe(false);
  }
  const textFiles = filesBelow('src').filter((path) => /\.(?:astro|css|js|ts)$/.test(path));
  expect(textFiles.filter((path) => /three|webgl|\.glb|model-src/i.test(source(path)))).toEqual([]);
});
```

Create `tests/motion.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { shouldEnhanceMotion } from '../src/lib/motion/preferences';

describe('motion eligibility', () => {
  test('allows enhancement only without reduced motion or save-data', () => {
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: false })).toBe(true);
    expect(shouldEnhanceMotion({ reduceMotion: true, saveData: false })).toBe(false);
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `bun test tests/living-design-contract.test.ts tests/motion.test.ts tests/cms.test.ts tests/homepage-composition.test.ts`  
Expected: FAIL due to existing Three.js files/dependencies and missing Living Hero/motion modules.

- [ ] **Step 3: Remove the 3D graph and obsolete copy/data**

Run:

```powershell
bun remove three @types/three
```

Delete the listed Three.js source, model and tests. Remove `interactionPrompt`, `stageAccessibleLabel`, `stageReadyStatus`, `stageFallbackStatus`, `stageFallback`, `stageCode`, `modelLoading` and `modelUnavailable` from `UiCopy` and both locales. Remove model-only CMS fields; retain the featured product, poster/media and metadata required by the new hero.

- [ ] **Step 4: Build the semantic static hero**

`LivingHero.astro` must render this server-first structure:

```astro
<section class="living-hero" aria-labelledby="hero-title" data-living-hero>
  <div class="living-hero__content container">
    <div class="living-hero__copy" data-reveal>
      <p class="eyebrow">{copy.eyebrow}</p>
      <h1 id="hero-title">{copy.title}</h1>
      <p>{copy.description}</p>
      <div class="living-hero__actions">
        <ButtonLink href={productsPath}>{copy.primaryCta}</ButtonLink>
        <ButtonLink href={contactPath} variant="secondary">{copy.secondaryCta}</ButtonLink>
      </div>
    </div>
    <figure class="living-hero__art" data-reveal>
      <img src={product.image.src} alt={product.image.alt} width={product.image.width} height={product.image.height} />
      <OrganicMark variant="drop" color="orange" class="living-hero__mark living-hero__mark--one" />
      <OrganicMark variant="seed" color="blue" class="living-hero__mark living-hero__mark--two" />
      <canvas data-living-canvas aria-hidden="true"></canvas>
      <figcaption>{product.name}</figcaption>
    </figure>
  </div>
</section>
```

The static image, marks, caption and actions must be complete before the module script runs.

- [ ] **Step 5: Implement the eligible Canvas 2D lifecycle**

Use this exact public contract:

```ts
export interface MotionPreferences { reduceMotion: boolean; saveData: boolean }
export const shouldEnhanceMotion = ({ reduceMotion, saveData }: MotionPreferences) => !reduceMotion && !saveData;

export interface LivingCanvasController { dispose(): void }
export function mountLivingCanvas(canvas: HTMLCanvasElement): LivingCanvasController {
  const context = canvas.getContext('2d');
  if (!context) return { dispose() {} };
  const particles = Array.from({ length: 10 }, (_, index) => ({
    x: (index * 0.097) % 1,
    y: (index * 0.173) % 1,
    radius: 3 + (index % 4),
    speed: 0.000015 + (index % 3) * 0.000004,
  }));
  let frame = 0;
  let previous = 0;
  let disposed = false;
  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = (time: number) => {
    if (disposed) return;
    const delta = Math.min(32, time - previous || 16);
    previous = time;
    const { width, height } = canvas.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgba(250, 108, 71, 0.32)';
    for (const particle of particles) {
      particle.y = (particle.y + particle.speed * delta) % 1;
      context.beginPath();
      context.ellipse(particle.x * width, particle.y * height, particle.radius, particle.radius * 1.45, 0.55, 0, Math.PI * 2);
      context.fill();
    }
    frame = requestAnimationFrame(draw);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  frame = requestAnimationFrame(draw);
  return { dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); context.clearRect(0, 0, canvas.width, canvas.height); } };
}
```

The Astro script checks `matchMedia('(prefers-reduced-motion: reduce)')` and `navigator.connection?.saveData` before dynamically importing the canvas module. Canvas receives `pointer-events: none`, no role and no focus attribute.

- [ ] **Step 6: Verify removal, hero and cleanup**

Run: `bun test tests/living-design-contract.test.ts tests/motion.test.ts tests/cms.test.ts tests/homepage-composition.test.ts && bun run check`  
Expected: PASS; `rg -n "three|WebGL|\.glb|modelSrc|product-stage" src tests package.json bun.lock public` returns no 3D implementation matches.

- [ ] **Step 7: Commit**

```powershell
git add -A package.json bun.lock src public tests docs/demo-content.md
git commit -m "feat: replace 3d stage with living hero"
```

---

### Task 4: Add purposeful scroll reveals and the accessible product carousel

**Files:**
- Create: `src/lib/motion/reveal.ts`
- Create: `src/lib/carousel/controller.ts`
- Modify: `src/components/sections/FeaturedProducts.astro`
- Modify: `src/components/sections/CategoryDiscovery.astro`
- Modify: `src/components/sections/FeaturedBrands.astro`
- Modify: `src/components/sections/ServiceProof.astro`
- Modify: `src/components/sections/ChannelPathways.astro`
- Modify: `src/components/sections/CredibilityStrip.astro`
- Modify: `src/components/sections/FinalCta.astro`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/vi/index.astro`
- Modify: `src/lib/i18n/ui.ts`
- Test: `tests/carousel.test.ts`
- Test: `tests/motion.test.ts`
- Test: `tests/homepage-contract.test.ts`
- Test: `tests/homepage-composition.test.ts`

**Interfaces:**
- Consumes: featured `Product[]`, `Locale`, `shouldEnhanceMotion` and existing product-card links.
- Produces: `nextIndex(current, count)`, `previousIndex(current, count)`, `createCarousel(root, { reduceMotion }): { dispose(): void }`, `installReveals(root): { dispose(): void }`.

- [ ] **Step 1: Write failing carousel and reveal tests**

Create `tests/carousel.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { nextIndex, previousIndex } from '../src/lib/carousel/controller';

describe('manual carousel state', () => {
  test('clamps instead of creating an infinite clone loop', () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(2);
    expect(previousIndex(0)).toBe(0);
    expect(previousIndex(2)).toBe(1);
  });
});
```

Add source contracts requiring `aria-roledescription="carousel"`, localized previous/next names, a polite position status, all products in the server HTML, `[data-reveal]`, and a reduced-motion settled selector.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `bun test tests/carousel.test.ts tests/motion.test.ts tests/homepage-contract.test.ts tests/homepage-composition.test.ts`  
Expected: FAIL because carousel/reveal modules and contracts are absent.

- [ ] **Step 3: Implement manual carousel behavior**

Use a horizontal scroll-snap list as the no-JavaScript baseline. Enhancement buttons call `scrollTo`, update disabled states and write `"{current} / {total}"` to a polite status. Arrow keys work when focus is within the carousel; focus is never moved automatically. Do not clone items, autoplay or wrap.

```ts
export const nextIndex = (current: number, count: number) => Math.min(current + 1, Math.max(0, count - 1));
export const previousIndex = (current: number) => Math.max(0, current - 1);
export function createCarousel(root: HTMLElement, options: { reduceMotion: boolean }): { dispose(): void } {
  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-carousel-item]')];
  const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!viewport || !previous || !next || !status || items.length === 0) return { dispose() {} };
  let index = 0;
  const update = () => {
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
    status.textContent = `${index + 1} / ${items.length}`;
  };
  const show = (target: number) => {
    index = Math.max(0, Math.min(target, items.length - 1));
    items[index].scrollIntoView({ behavior: options.reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    update();
  };
  const onPrevious = () => show(previousIndex(index));
  const onNext = () => show(nextIndex(index, items.length));
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); onPrevious(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); onNext(); }
  };
  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  viewport.addEventListener('keydown', onKeydown);
  update();
  return { dispose() {
    previous.removeEventListener('click', onPrevious);
    next.removeEventListener('click', onNext);
    viewport.removeEventListener('keydown', onKeydown);
  } };
}
```

- [ ] **Step 4: Implement limited reveal choreography**

`installReveals(root)` observes only authored `[data-reveal]` elements, adds `data-revealed="true"` once at threshold `0.18`, then unobserves. It returns a disposer. Under reduced motion, CSS renders all elements settled and the observer module is not imported.

```ts
export function installReveals(root: ParentNode): { dispose(): void } {
  const elements = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      (entry.target as HTMLElement).dataset.revealed = 'true';
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.18 });
  elements.forEach((element) => observer.observe(element));
  return { dispose() { observer.disconnect(); } };
}
```

- [ ] **Step 5: Recompose homepage sections organically**

- Category discovery becomes a loose four-item table with authored `drop`, `seed` and `petal` masks and stable DOM order.
- Featured products uses the manual carousel and brochure-inspired orange specification rules.
- Featured brand story uses one large organic media mask and smaller product droplets.
- Service proof uses a decorative SVG journey path, with the text list independent of the path.
- Channel pathways and closing CTA use curved boundaries rather than dark rectangular rails.
- Credibility points become a light, flowing proof row; no industrial code labels or dark blue ledger remains.

Use this shared reveal/organic layout contract in the affected components:

```css
[data-reveal] { opacity: 0; transform: translateY(1.5rem); }
[data-reveal='true'],
[data-revealed='true'] { opacity: 1; transform: none; transition: opacity 600ms ease, transform 700ms cubic-bezier(.2,.75,.25,1); }
.organic-media { border-radius: 62% 38% 55% 45% / 48% 58% 42% 52%; overflow: clip; }
.specification-rule { border-block-start: 2px solid var(--color-paradise-orange); padding-block-start: var(--space-3); }
@media (prefers-reduced-motion: reduce) {
  [data-reveal], [data-revealed] { opacity: 1; transform: none; transition: none; }
  [data-carousel-viewport] { scroll-behavior: auto; }
}
```

- [ ] **Step 6: Verify motion and homepage contracts**

Run: `bun test tests/carousel.test.ts tests/motion.test.ts tests/homepage-contract.test.ts tests/homepage-composition.test.ts && bun run check`  
Expected: PASS with zero Astro diagnostics.

- [ ] **Step 7: Commit**

```powershell
git add src/components/sections src/lib/motion src/lib/carousel src/pages src/lib/i18n/ui.ts tests
git commit -m "feat: animate organic homepage story"
```

---

### Task 5: Carry Living Ingredients through catalog, detail, brands, enquiry and 404

**Files:**
- Modify: `src/components/catalog/CatalogFilters.astro`
- Modify: `src/components/catalog/ProductCard.astro`
- Modify: `src/components/catalog/ProductGrid.astro`
- Modify: `src/components/catalog/ProductDetail.astro`
- Modify: `src/components/catalog/ProductMetadata.astro`
- Modify: `src/components/brands/BrandCard.astro`
- Modify: `src/components/brands/BrandDetail.astro`
- Modify: `src/components/forms/EnquiryForm.astro`
- Modify: `src/components/global/Breadcrumbs.astro`
- Modify: `src/pages/en/products/index.astro`
- Modify: `src/pages/vi/products/index.astro`
- Modify: `src/pages/en/brands/index.astro`
- Modify: `src/pages/vi/brands/index.astro`
- Modify: `src/pages/404.astro`
- Test: `tests/living-design-contract.test.ts`
- Test: `tests/enquiry-render-contract.test.ts`
- Test: `tests/product-card.test.ts`

**Interfaces:**
- Consumes: existing product/brand props, catalog controller attributes and enquiry controller attributes.
- Produces: visual-only class/hook changes; no changes to filtering, validation, submission or counterpart semantics.

- [ ] **Step 1: Add failing inner-page visual contracts**

Add assertions that:

```ts
for (const file of [
  'src/components/catalog/ProductCard.astro',
  'src/components/catalog/ProductDetail.astro',
  'src/components/brands/BrandCard.astro',
  'src/components/brands/BrandDetail.astro',
  'src/components/forms/EnquiryForm.astro',
  'src/pages/404.astro',
]) {
  expect(source(file)).toMatch(/organic|living|shape|petal|drop/);
  expect(source(file)).not.toMatch(/color-cold-chain-blue|color-stainless/);
}
expect(source('src/components/forms/EnquiryForm.astro')).toContain('aria-invalid');
expect(source('src/components/catalog/CatalogFilters.astro')).toContain('aria-live');
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `bun test tests/living-design-contract.test.ts tests/enquiry-render-contract.test.ts tests/product-card.test.ts`  
Expected: FAIL because inner pages still contain the industrial tokens and rectangular compositions.

- [ ] **Step 3: Restyle catalog and product presentation**

Keep filter and product DOM contracts unchanged. Use organic backplates behind product media, clean white product fields, orange metadata rules and no hard card border. Product detail uses a disciplined specification column plus surrounding decorative marks; mobile removes connector lines and preserves the definition-list reading order.

```css
.product-card { background: transparent; border: 0; }
.product-card__media { background: var(--color-paper-white); border-radius: var(--shape-drop); overflow: clip; position: relative; }
.product-card__media::before { background: var(--product-accent, var(--color-mist-blue)); border-radius: 48% 52% 64% 36% / 57% 39% 61% 43%; content: ''; inset: 12%; position: absolute; }
.product-card__meta { border-block-start: 2px solid var(--color-paradise-orange); color: var(--color-deep-herb); }
.product-detail__facts { border-inline-start: 2px solid var(--color-paradise-orange); padding-inline-start: var(--space-6); }
@media (max-width: 48rem) { .product-detail__facts { border-inline-start: 0; padding-inline-start: 0; } }
```

- [ ] **Step 4: Restyle brands, enquiry and 404**

Use brand-accent organic fields without overriding Paradise navigation. Replace form panel rails with spacing, pale shape fields and curved separators while keeping labels/errors/focus behavior exact. Render the self-hosted logo and decorative marks on 404; keep direct English/Vietnamese navigation without scripts.

```css
.brand-card__media { background: color-mix(in srgb, var(--brand-accent) 12%, white); border-radius: 42% 58% 38% 62% / 55% 44% 56% 45%; }
.enquiry__panel { background: var(--color-paper-white); border: 0; border-radius: 2.5rem 0 2.5rem 0; box-shadow: 0 1.5rem 4rem color-mix(in srgb, var(--color-deep-herb) 8%, transparent); }
.not-found__art { align-items: center; display: flex; isolation: isolate; justify-content: center; position: relative; }
.not-found__art img { block-size: auto; inline-size: min(16rem, 62vw); position: relative; z-index: 2; }
```

- [ ] **Step 5: Verify behavior is unchanged**

Run: `bun test tests/catalog-filter.test.ts tests/catalog-state.test.ts tests/product-card.test.ts tests/brand-routes.test.ts tests/enquiry.test.ts tests/enquiry-render-contract.test.ts tests/living-design-contract.test.ts && bun run check`  
Expected: all focused tests PASS and Astro reports zero diagnostics.

- [ ] **Step 6: Commit**

```powershell
git add src/components/catalog src/components/brands src/components/forms src/components/global/Breadcrumbs.astro src/pages tests
git commit -m "feat: extend organic design across pages"
```

---

### Task 6: Update production contracts, documentation and generated-output verification

**Files:**
- Create: `tests/verify-built-living-design.ts`
- Modify: `tests/verify-built-cms-assets.ts`
- Modify: `tests/verify-built-catalog.ts`
- Modify: `tests/verify-built-brands.ts`
- Modify: `tests/verify-built-enquiry.ts`
- Modify: `tests/verify-built-mvp.ts`
- Modify: `tests/mvp-completion.test.ts`
- Modify: `package.json`
- Modify: `DESIGN.md`
- Modify: `docs/demo-content.md`
- Modify: `docs/superpowers/specs/2026-07-16-living-ingredients-redesign.md`

**Interfaces:**
- Consumes: production `dist/`, build manifest/assets and the accepted redesign specification.
- Produces: one build command that fails on missing logo/organic contracts, stale routes, broken links, oversized enhancement chunks or any 3D residue.

- [ ] **Step 1: Write the generated-output verifier before wiring it**

`tests/verify-built-living-design.ts` must:

```ts
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = join(import.meta.dir, '..');
const dist = join(root, 'dist');
const forbidden = /(?:three(?:\.module)?|webgl|\.glb|model-src|product-stage)/i;
const canonicalRoutes = [
  '/en/products/', '/vi/products/', '/en/brands/', '/vi/brands/', '/en/contact/', '/vi/contact/',
];
const filesBelow = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
if (!existsSync(dist)) throw new Error('dist is missing; run the production build first');
const files = filesBelow(dist);
for (const file of files.filter((path) => /\.(?:html|css|js|json)$/.test(path))) {
  const content = readFileSync(file, 'utf8');
  if (forbidden.test(content)) throw new Error(`3D residue in ${relative(dist, file)}`);
}
for (const route of canonicalRoutes) {
  const file = join(dist, route.slice(1), 'index.html');
  if (!existsSync(file)) throw new Error(`Missing canonical route ${route}`);
}
for (const locale of ['en', 'vi']) {
  const html = readFileSync(join(dist, locale, 'index.html'), 'utf8');
  if (!/paradise-fine-foods-logo[^"']*\.png/.test(html)) throw new Error(`${locale}: logo missing`);
  if (!/aria-roledescription="carousel"/.test(html) || !/data-carousel-status/.test(html)) throw new Error(`${locale}: carousel contract missing`);
}
for (const [legacy, target] of [
  ['vi/san-pham/index.html', '/vi/products/'],
  ['vi/san-pham/bo-lat-mau/index.html', '/vi/products/bo-lat-mau/'],
  ['vi/thuong-hieu/index.html', '/vi/brands/'],
  ['vi/thuong-hieu/nha-sua-maison/index.html', '/vi/brands/nha-sua-maison/'],
  ['vi/lien-he/index.html', '/vi/contact/'],
] as const) {
  const html = readFileSync(join(dist, legacy), 'utf8');
  if (!html.includes(target)) throw new Error(`${legacy}: redirect target missing`);
}
const enhancementFiles = files.filter((path) => /(?:living-canvas|carousel|reveal)\.[^/\\]+\.js$/.test(path));
const enhancementGzip = enhancementFiles.reduce((total, file) => total + gzipSync(readFileSync(file)).byteLength, 0);
if (enhancementGzip > 35_000) throw new Error(`Enhancements are ${enhancementGzip} gzip bytes`);
console.log(`Living design verified: ${enhancementGzip} gzip enhancement bytes`);
```

- [ ] **Step 2: Run the verifier and confirm it fails before build wiring**

Run: `bun tests/verify-built-living-design.ts`  
Expected: FAIL until a current production build exists and all new output contracts are present.

- [ ] **Step 3: Replace the retired verifier and update ledgers/specification**

Replace `tests/verify-built-3d-stage.ts` in the build script with `tests/verify-built-living-design.ts`. Remove model inventory from `docs/demo-content.md`; add the exact logo, new demo illustrations, motion modules and carousel copy ownership. Update `DESIGN.md` so no active requirement mandates 3D or localized Vietnamese structural paths. Mark the redesign spec status as implemented only after Task 7 passes.

The package script must be:

```json
{
  "scripts": {
    "build": "astro build && bun tests/verify-built-cms-assets.ts && bun tests/verify-built-living-design.ts && bun tests/verify-built-catalog.ts && bun tests/verify-built-brands.ts && bun tests/verify-built-enquiry.ts && bun tests/verify-built-mvp.ts"
  }
}
```

- [ ] **Step 4: Run full automated verification**

Run: `bun test && bun run check && bun run build && git diff --check`  
Expected: all tests PASS; zero Astro diagnostics; 28-or-more pages including redirects build; every output verifier passes; no diff whitespace errors.

- [ ] **Step 5: Commit**

```powershell
git add package.json DESIGN.md docs tests
git commit -m "test: verify living ingredients build"
```

---

### Task 7: Browser QA, visual critique and completion audit

**Files:**
- Modify only if QA finds a defect: affected source/test files
- Update: `.superpowers/sdd/progress.md` (ignored working record)
- Create: `.superpowers/sdd/living-design-browser-qa.md` (ignored working record)

**Interfaces:**
- Consumes: final production-equivalent local Astro server and the 13 acceptance checks in the spec.
- Produces: visual/interaction evidence for desktop, exact `390px` mobile, motion, reduced-motion/static fallbacks and route redirects.

- [ ] **Step 1: Start the project-managed dev server**

Run: `astro dev --background`  
Expected: server reports an HTTP URL and stable background PID.

- [ ] **Step 2: Verify representative desktop routes in the in-app browser**

Check both locales for home, catalog, a product detail, brands, a brand detail, contact and 404. Record:

- exact Paradise logo visible and undistorted;
- organic hero and inner-page composition;
- no dark technical stage, model UI or industrial rails;
- correct canonical/alternate links and uniform route segments;
- no horizontal overflow or console errors;
- filter, language switcher and enquiry behavior remain correct.

- [ ] **Step 3: Verify exact `390px` mobile routes**

Use the browser viewport capability at `390 x 844`. Verify the same representative route matrix, menu keyboard/Escape behavior, `44px` targets, readable Vietnamese line breaks, carousel controls, specification stacking and zero overflow.

- [ ] **Step 4: Verify motion and fallback modes**

- Normal mode: hero entrance settles, canvas remains decorative, authored reveals occur once and manual carousel responds only to controls/keys.
- Reduced motion: settled art is visible immediately; no canvas loop, drift, path drawing or animated carousel slide.
- Save-data: canvas module is not loaded.
- No JavaScript: logo, hero, every featured product, catalog, form instructions and all navigation remain visible; carousel becomes a horizontal/static product list.

- [ ] **Step 5: Perform the required visual self-critique**

Capture desktop and mobile screenshots. Judge hierarchy, brand specificity, negative space, shape repetition, product legibility and motion restraint. Remove at least one decoration that does not improve grouping, progression or tactility; record what was removed and why.

- [ ] **Step 6: Fix any defects with a failing test first**

For each defect, add the narrowest failing contract or interaction test, reproduce failure, patch, then rerun the focused test and affected browser route.

- [ ] **Step 7: Run the final completion audit**

Run:

```powershell
bun test
bun run check
bun run build
git diff --check
git status --short
rg -n "three|WebGL|\.glb|modelSrc|product-stage|san-pham|thuong-hieu|lien-he" src tests package.json bun.lock public
```

Expected: all automated checks pass; tracked worktree is clean after the final commit; the final `rg` has no implementation matches except explicit legacy redirect/test fixtures for the former Vietnamese paths.

- [ ] **Step 8: Mark the spec implemented and commit verified fixes**

Update the spec status to `Implemented and verified`, rerun `bun test && bun run check && bun run build`, then:

```powershell
git add -A
git commit -m "feat: complete living ingredients redesign"
```

---

## Audited Coverage Matrix

| Specification requirement | Implementation task | Authoritative evidence |
|---|---:|---|
| Exact self-hosted Paradise logo in both locales | 2, 6, 7 | source contract, generated homepages, browser screenshots |
| Zero Three.js/WebGL/GLB/model-stage residue | 3, 6, 7 | dependency removal, recursive source/build scan, network/runtime QA |
| Living Ingredients palette and organic shape system on all page families | 2, 4, 5, 7 | token/component contracts and desktop/mobile screenshots |
| Uniform bilingual route segments | 1, 6, 7 | route unit tests, generated canonical files and browser URLs |
| Permanent legacy Vietnamese redirects, including details | 1, 6, 7 | Astro config assertions and generated index/detail redirect pages |
| Counterpart-preserving language switcher | 1, 5, 7 | catalog/brand/i18n tests and click-through browser QA |
| Static/no-JavaScript completeness | 3, 4, 5, 7 | server-rendered source contracts and script-disabled browser pass |
| Reduced-motion settled output | 3, 4, 6, 7 | eligibility unit tests, CSS contract and emulated browser QA |
| Manual accessible product carousel | 4, 6, 7 | state/controller tests, generated ARIA contract and keyboard QA |
| Decorative save-data-aware 2D canvas | 3, 6, 7 | eligibility/lifecycle tests, generated bundle scan and runtime QA |
| Existing filter, brand and enquiry behavior | 1, 5, 6, 7 | full regression suite and interaction QA |
| Performance and asset budgets | 3, 6, 7 | gzip verifier, production build assets and browser network evidence |
| Required visual self-critique and decoration removal | 7 | before/after screenshots and QA record |

## Plan Self-Audit Result

- **Spec coverage:** All 13 acceptance checks map to an implementation task and a direct evidence source in the matrix above.
- **Completeness scan:** No unresolved marker, abbreviated implementation body or cross-task shorthand remains.
- **Interface consistency:** `shouldEnhanceMotion`, `mountLivingCanvas`, `createCarousel` and `installReveals` have one signature each across producer/consumer tasks.
- **Route consistency:** Both index and localized detail redirects preserve the existing slug parameter and are checked in generated output.
- **Accessibility correction made during audit:** Carousel behavior remains available under reduced motion but uses instant scrolling; only decorative canvas and reveal animation are skipped.
- **Scope correction made during audit:** Scroll reveals, carousel and Canvas 2D are required deliverables, not optional enhancements; Three.js alone is removed.
