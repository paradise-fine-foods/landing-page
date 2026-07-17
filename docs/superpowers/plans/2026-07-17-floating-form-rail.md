# Floating Form Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual, scroll-revealed right-edge rail with three intent-specific links into the existing enquiry form.

**Architecture:** `SiteLayout` renders a focused `FloatingFormRail.astro` component on every localized page. The component owns server-rendered anchor markup and styling; `src/lib/motion/floating-rail.ts` owns the small progressive-enhancement controller for scroll visibility, open/close state, Escape handling, and cleanup. The shared form already validates and preselects `interest` from the URL, so no form duplication is needed.

**Tech Stack:** Astro 5, TypeScript, Bun tests, CSS custom properties, native links/buttons, no new dependencies.

## Global Constraints

- Preserve the uniform localized contact route: `/{locale}/contact/`.
- Keep all three destinations as normal anchors so they work without JavaScript.
- Use the existing `retail` and `other` interest values; do not add a new CMS adapter or delivery endpoint.
- Keep every interactive target at least 44px high and keyboard accessible.
- Respect `prefers-reduced-motion: reduce` and dispose page listeners safely.
- Do not remove existing Vietnamese compatibility redirects.

---

### Task 1: Add localized rail copy and server-rendered component

**Files:**
- Modify: `src/lib/i18n/ui.ts` (add `floatingRail` to `UiCopy` and both locale objects)
- Create: `src/components/global/FloatingFormRail.astro`
- Test: `tests/floating-form-rail-render-contract.test.ts`

**Interfaces:**
- Consumes: `Locale`, `UiCopy['floatingRail']`, and `contactPath: string`.
- Produces: `<div data-floating-rail>` with a toggle, panel, and three anchors whose `href` values are `${contactPath}?interest=retail`, `${contactPath}?interest=other`, and `contactPath`.

- [ ] **Step 1: Write the failing rendering contract**

```ts
import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('floating form rail rendering', () => {
  test('renders progressive-enhancement wiring and three localized contact intents', async () => {
    const rail = await read('../src/components/global/FloatingFormRail.astro');
    const ui = await read('../src/lib/i18n/ui.ts');
    expect(rail).toContain('data-floating-rail');
    expect(rail).toContain('aria-controls="floating-rail-panel"');
    expect(rail).toContain('aria-expanded="false"');
    expect(rail).toContain('?interest=retail');
    expect(rail).toContain('?interest=other');
    expect(rail).toContain('data-floating-rail-toggle');
    expect(rail).toContain('initializeFloatingRail');
    expect(ui).toContain('floatingRail:');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`

Expected: FAIL because the component, layout integration, and copy do not exist yet.

- [ ] **Step 3: Add the localized copy shape**

Extend `UiCopy` with:

```ts
floatingRail: {
  navigation: string;
  toggleOpen: string;
  toggleClose: string;
  buy: string;
  sell: string;
  contact: string;
}
```

Use English labels `Connect with our team`, `Open enquiry options`, `Close enquiry options`, `Buy ingredients`, `Sell products`, and `General enquiry`. Use Vietnamese labels `Kết nối với đội ngũ`, `Mở lựa chọn yêu cầu`, `Đóng lựa chọn yêu cầu`, `Mua nguyên liệu`, `Cung cấp sản phẩm`, and `Yêu cầu chung`.

- [ ] **Step 4: Implement the component markup**

Create the component with this server-rendered shape:

```astro
---
import type { Locale } from '../../lib/i18n/types';
import type { UiCopy } from '../../lib/i18n/ui';

interface Props { locale: Locale; contactPath: string; copy: UiCopy['floatingRail']; }
const { contactPath, copy } = Astro.props;
const links = [
  { href: `${contactPath}?interest=retail`, label: copy.buy },
  { href: `${contactPath}?interest=other`, label: copy.sell },
  { href: contactPath, label: copy.contact },
];
---

<aside class="floating-rail" data-floating-rail data-threshold="1">
  <button type="button" class="floating-rail__toggle" data-floating-rail-toggle aria-expanded="false" aria-controls="floating-rail-panel" aria-label={copy.toggleOpen} data-open-label={copy.toggleOpen} data-close-label={copy.toggleClose}>
    <span aria-hidden="true">↗</span>
    <span class="visually-hidden">{copy.toggleOpen}</span>
  </button>
  <nav id="floating-rail-panel" class="floating-rail__panel" aria-label={copy.navigation}>
    {links.map(({ href, label }) => <a class="floating-rail__link" href={href}>{label}</a>)}
  </nav>
</aside>

<script>
  import { initializeFloatingRail } from '../../lib/motion/floating-rail';
  const root = document.querySelector<HTMLElement>('[data-floating-rail]');
  if (root) initializeFloatingRail(root);
</script>
```

Add CSS for a fixed right-edge stack, a 44px toggle, `data-ready`/`data-visible` states, a compact mobile panel, and reduced-motion overrides. Keep the panel visible in the unenhanced server-rendered state so the anchors remain usable without JavaScript.

- [ ] **Step 5: Run the focused test and confirm it passes**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the component slice**

```powershell
git add src/lib/i18n/ui.ts src/components/global/FloatingFormRail.astro tests/floating-form-rail-render-contract.test.ts
git commit -m "feat: add floating enquiry rail"
```

### Task 2: Implement the progressive-enhancement controller

**Files:**
- Create: `src/lib/motion/floating-rail.ts`
- Modify: `tests/motion.test.ts` (add a `floating enquiry rail` describe block)

**Interfaces:**
- Consumes: a root element containing `[data-floating-rail-toggle]` and `[data-floating-rail-panel]`.
- Produces: `initializeFloatingRail(root, dependencies?): FloatingRailController` and `shouldShowFloatingRail(scrollY, viewportHeight): boolean`.

- [ ] **Step 1: Write failing pure/controller tests**

```ts
test('reveals after one viewport and cleans up listeners', () => {
  expect(shouldShowFloatingRail(0, 800)).toBe(false);
  expect(shouldShowFloatingRail(801, 800)).toBe(true);
  const harness = makeFloatingRailHarness();
  const controller = initializeFloatingRail(harness.root, harness.dependencies);
  expect(harness.root.dataset.ready).toBe('true');
  harness.emitScroll(900);
  expect(harness.root.dataset.visible).toBe('true');
  harness.clickToggle();
  expect(harness.toggle.getAttribute('aria-expanded')).toBe('true');
  harness.keydown('Escape');
  expect(harness.toggle.getAttribute('aria-expanded')).toBe('false');
  controller.dispose();
  controller.dispose();
  expect(harness.listenerCounts()).toEqual({ scroll: 0, keydown: 0, click: 0 });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `bun test tests/motion.test.ts -t "floating enquiry rail"`

Expected: FAIL because the controller module and test harness do not exist.

- [ ] **Step 3: Implement the controller**

Implement `shouldShowFloatingRail(scrollY, viewportHeight)` as `scrollY > viewportHeight`. `initializeFloatingRail` must set `data-ready="true"`, initialize `data-visible` from the current scroll position, wire a passive `scroll` listener, toggle `data-expanded` and `aria-expanded`, update the localized `aria-label`, close on Escape and focus the toggle, and return an idempotent `dispose()` that removes all three listeners. Use `window.matchMedia('(prefers-reduced-motion: reduce)')` only to set a `data-reduced-motion` marker; never disable keyboard or visibility behavior.

- [ ] **Step 4: Run the focused motion tests**

Run: `bun test tests/motion.test.ts -t "floating enquiry rail"`

Expected: PASS.

- [ ] **Step 5: Commit the controller slice**

```powershell
git add src/lib/motion/floating-rail.ts tests/motion.test.ts
git commit -m "feat: add floating rail controller"
```

### Task 3: Integrate the rail into the shared layout and built-output gates

**Files:**
- Modify: `src/layouts/SiteLayout.astro`
- Modify: `tests/living-design-contract.test.ts`
- Modify: `tests/verify-built-mvp.ts`

**Interfaces:**
- Consumes: `localizedPath(locale, 'contact')`, `ui[locale].floatingRail`, and the component/controller contract from Tasks 1–2.
- Produces: the rail on all generated localized page families and the 404 shell without changing route structure.

- [ ] **Step 1: Add failing integration assertions**

```ts
const layout = source('src/layouts/SiteLayout.astro');
expect(layout).toContain("import FloatingFormRail from '../components/global/FloatingFormRail.astro'");
expect(layout).toContain("<FloatingFormRail locale={locale} contactPath={localizedPath(locale, 'contact')} copy={ui[locale].floatingRail} />");
```

In `verify-built-mvp.ts`, assert each file in the existing localized page matrix contains `data-floating-rail`, `?interest=retail`, `?interest=other`, and `aria-controls="floating-rail-panel"`.

- [ ] **Step 2: Run the focused integration tests and confirm they fail**

Run: `bun test tests/living-design-contract.test.ts tests/mvp-completion.test.ts`

Expected: FAIL until the shared layout and generated-output verifier are updated.

- [ ] **Step 3: Integrate the component in `SiteLayout.astro`**

Import `localizedPath` and render:

```astro
<Footer {locale} {siteName} />
<FloatingFormRail locale={locale} contactPath={localizedPath(locale, 'contact')} copy={ui[locale].floatingRail} />
```

The rail must remain outside `<main>` so it is a global utility and does not change the page landmark count.

- [ ] **Step 4: Extend generated-output verification**

Add the rail checks to the existing page matrix in `tests/verify-built-mvp.ts`, preserving the current 404 and locale checks. Do not add a new build dependency or alter redirect fixtures.

- [ ] **Step 5: Run integration tests**

Run: `bun test tests/living-design-contract.test.ts tests/mvp-completion.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the integration slice**

```powershell
git add src/layouts/SiteLayout.astro tests/living-design-contract.test.ts tests/verify-built-mvp.ts
git commit -m "feat: expose floating rail across locales"
```

### Task 4: Full verification and browser QA

**Files:**
- Modify: `.superpowers/sdd/floating-form-rail-browser-qa.md` if a QA log is kept by the existing project convention.

- [ ] **Step 1: Run the full automated suite**

```powershell
bun test
bun run check
bun run build
git diff --check
```

Expected: all tests pass, Astro reports zero diagnostics, the production build emits every localized page and the built verifiers report the rail destinations, and diff check is clean.

- [ ] **Step 2: Verify runtime behavior in the local browser**

At `/en/`, `/vi/`, `/en/products/`, and `/vi/contact/`, confirm the rail is absent before one viewport of scrolling, visible after scrolling, opens/closes with the toggle, closes on Escape, and navigates to the expected localized contact URL with `interest=retail` or `interest=other`. At a 390px viewport, confirm the compact tab and 44px targets remain inside the viewport.

- [ ] **Step 3: Commit verification notes if changed**

```powershell
git add .superpowers/sdd/floating-form-rail-browser-qa.md
git commit -m "test: verify floating form rail"
```

Only create this commit when the QA log is part of the working tree; otherwise leave no generated artifacts staged.
