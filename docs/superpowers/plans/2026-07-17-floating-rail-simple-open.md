# Simple Open Floating Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the labeled, scroll-revealed enquiry rail with a premium edge-attached action panel that is open on initial load, contains no decorative heading text, and animates as one restrained object.

**Architecture:** Keep `FloatingFormRail.astro` as the server-rendered accessible surface and reduce `floating-rail.ts` to disclosure state only. The no-JavaScript and `staticOnly` paths continue to expose the three real anchors; enhancement adds an icon-only collapse control, synchronized ARIA state, and one component-level entrance/open-close motion treatment.

**Tech Stack:** Astro 7, TypeScript, scoped CSS, Bun tests, Astro build verifiers, Codex in-app Browser QA.

## Global Constraints

- Remove visible `ENQUIRE`, `TRAO ĐỔI`, `LET'S TALK`, `START A CONVERSATION`, and equivalent panel-heading text.
- Show the three enquiry actions expanded on initial page load without waiting for scroll or click.
- Preserve `data-floating-rail`, `data-floating-rail-toggle`, `aria-controls`, `aria-expanded`, localized accessible open/close labels, and all three existing enquiry URLs.
- Keep the icon-only control at least 44×44px and action rows at least 48px tall.
- Use only `#28342B`, `#FBFAF5`, `#FFFFFF`, `#E46F2C`, and `#E8F6FA` through existing tokens.
- Use Nunito only; the rail has no Newsreader display heading.
- Use a 360ms component transition with `cubic-bezier(0.22, 1, 0.36, 1)` and 160ms hover/focus transitions.
- Remove spatial motion under `prefers-reduced-motion: reduce`.
- At 390×844, the open rail must have no horizontal overflow and occupy no more than 40% of viewport height.
- Add no dependency, image asset, shadow, gradient, glass effect, or unrelated refactor.

---

### Task 1: Default-open disclosure controller

**Files:**
- Modify: `tests/motion.test.ts:9,95-151`
- Modify: `src/lib/motion/floating-rail.ts:1-65`

**Interfaces:**
- Produces: `initializeFloatingRail(root: HTMLElement, dependencies?: FloatingRailDependencies): FloatingRailController`
- `FloatingRailDependencies` retains only an optional document event target.
- Removes: `shouldShowFloatingRail`; scroll position and viewport breakpoints no longer control visibility or expansion.

- [ ] **Step 1: Write the failing default-open controller test**

Replace the floating-rail import and describe block in `tests/motion.test.ts` with:

```ts
import { initializeFloatingRail, type FloatingRailDependencies } from '../src/lib/motion/floating-rail';

describe('floating enquiry rail', () => {
  test('starts visible and expanded, toggles accessibly, and disposes each listener once', () => {
    const listeners = new Map<string, EventListener>();
    const removals: string[] = [];
    const createTarget = () => ({
      addEventListener(type: string, listener: EventListener) { listeners.set(type, listener); },
      removeEventListener(type: string) { removals.push(type); listeners.delete(type); },
    });
    const toggle = {
      ...createTarget(),
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(this: { attributes: Record<string, string> }, name: string, value: string) { this.attributes[name] = value; },
      attributes: { 'aria-expanded': 'false', 'aria-label': 'Open enquiries' } as Record<string, string>,
      focusCalls: 0,
      focus(this: { focusCalls: number }) { this.focusCalls += 1; },
    } as unknown as HTMLButtonElement & { attributes: Record<string, string>; focusCalls: number };
    const panel = {} as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const documentTarget = createTarget();
    const dependencies: FloatingRailDependencies = {
      document: documentTarget as FloatingRailDependencies['document'],
    };

    const controller = initializeFloatingRail(root, dependencies);
    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'true' });
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
    expect([...listeners.keys()].sort()).toEqual(['click', 'keydown']);

    listeners.get('click')?.(new Event('click'));
    expect(root.dataset.expanded).toBe('false');
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'false', 'aria-label': 'Open enquiries' });

    listeners.get('click')?.(new Event('click'));
    listeners.get('keydown')?.({ key: 'Escape' } as KeyboardEvent);
    expect(root.dataset.expanded).toBe('false');
    expect(toggle.focusCalls).toBe(1);

    controller.dispose();
    controller.dispose();
    expect(removals.sort()).toEqual(['click', 'keydown']);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `bun test tests/motion.test.ts`

Expected: FAIL because the current controller still exports scroll-threshold behavior, registers scroll/resize listeners, and does not initialize every viewport open.

- [ ] **Step 3: Replace the controller with the minimal disclosure implementation**

Replace `src/lib/motion/floating-rail.ts` with:

```ts
export interface FloatingRailController { dispose(): void }

export interface FloatingRailDependencies {
  document?: Pick<Document, 'addEventListener' | 'removeEventListener'>;
}

const noopController: FloatingRailController = { dispose() {} };

export function initializeFloatingRail(
  root: HTMLElement,
  dependencies: FloatingRailDependencies = {},
): FloatingRailController {
  const toggle = root.querySelector<HTMLButtonElement>('[data-floating-rail-toggle]');
  const panel = root.querySelector<HTMLElement>('#floating-rail-panel');
  const documentTarget = dependencies.document ?? (typeof document !== 'undefined' ? document : undefined);
  if (!toggle || !panel || !documentTarget) return noopController;

  const setExpanded = (expanded: boolean) => {
    root.dataset.expanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? toggle.dataset.closeLabel ?? '' : toggle.dataset.openLabel ?? '');
  };
  const onClick = () => setExpanded(root.dataset.expanded !== 'true');
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || root.dataset.expanded !== 'true') return;
    setExpanded(false);
    toggle.focus();
  };

  root.dataset.ready = 'true';
  root.dataset.visible = 'true';
  setExpanded(true);
  toggle.addEventListener('click', onClick);
  documentTarget.addEventListener('keydown', onKeydown);

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      toggle.removeEventListener('click', onClick);
      documentTarget.removeEventListener('keydown', onKeydown);
    },
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `bun test tests/motion.test.ts`

Expected: PASS with no scroll-threshold or breakpoint-expansion assertions remaining.

- [ ] **Step 5: Commit the controller change**

```bash
git add tests/motion.test.ts src/lib/motion/floating-rail.ts
git commit -m "feat: open floating rail by default"
```

### Task 2: Remove visible utility labels and simplify localized copy

**Files:**
- Modify: `tests/floating-form-rail-render-contract.test.ts:6-38`
- Modify: `src/lib/i18n/ui.ts:26-35,175,213`
- Modify: `src/components/global/FloatingFormRail.astro:15-36`

**Interfaces:**
- Consumes: the default-open `initializeFloatingRail` contract from Task 1.
- Produces: `UiCopy['floatingRail']` with `navigation`, `toggleOpen`, `toggleClose`, `buy`, `sell`, and `contact` only.
- The server-rendered component keeps three anchors and an icon-only disclosure button.

- [ ] **Step 1: Write failing rendering and copy assertions**

Replace the two tests in `tests/floating-form-rail-render-contract.test.ts` with:

```ts
test('renders a label-free accessible server-side rail', async () => {
  const source = await read('../src/components/global/FloatingFormRail.astro');
  for (const value of [
    'data-floating-rail',
    'data-floating-rail-toggle',
    'data-floating-rail-icon',
    'aria-controls="floating-rail-panel"',
    'aria-expanded="false"',
    '?interest=retail',
    '?interest=other',
    'initializeFloatingRail',
    'staticOnly?: boolean',
    "!staticOnly && <script>",
    "[data-ready='true'] .floating-form-rail__toggle",
    "[data-ready='true'][data-expanded='false'] .floating-form-rail__panel",
  ]) expect(source).toContain(value);

  for (const obsolete of [
    'data-floating-rail-label',
    'data-floating-rail-title',
    'floating-form-rail__marker',
    'copy.label',
    'copy.panelTitle',
  ]) expect(source).not.toContain(obsolete);
});

test('keeps localized accessibility and action copy without visible utility labels', async () => {
  const source = await read('../src/lib/i18n/ui.ts');
  expect(source).toContain("toggleOpen: 'Open enquiry options'");
  expect(source).toContain("toggleClose: 'Close enquiry options'");
  expect(source).toContain("toggleOpen: 'Mở lựa chọn yêu cầu'");
  expect(source).toContain("toggleClose: 'Đóng lựa chọn yêu cầu'");
  expect(source).not.toContain("label: 'Enquire'");
  expect(source).not.toContain("panelTitle: 'Start a conversation'");
  expect(source).not.toContain("label: 'Trao đổi'");
  expect(source).not.toContain("panelTitle: 'Bắt đầu trao đổi'");
});
```

- [ ] **Step 2: Run the focused contract test and verify RED**

Run: `bun test tests/floating-form-rail-render-contract.test.ts`

Expected: FAIL because the component still renders label, title, and marker elements and the copy interface still defines their strings.

- [ ] **Step 3: Remove obsolete copy fields**

Change the `floatingRail` interface in `src/lib/i18n/ui.ts` to:

```ts
floatingRail: {
  navigation: string;
  toggleOpen: string;
  toggleClose: string;
  buy: string;
  sell: string;
  contact: string;
};
```

Use these exact locale values:

```ts
floatingRail: { navigation: 'Enquiry options', toggleOpen: 'Open enquiry options', toggleClose: 'Close enquiry options', buy: 'Buy ingredients', sell: 'Sell products', contact: 'General enquiry' },
floatingRail: { navigation: 'Lựa chọn yêu cầu', toggleOpen: 'Mở lựa chọn yêu cầu', toggleClose: 'Đóng lựa chọn yêu cầu', buy: 'Mua nguyên liệu', sell: 'Cung cấp sản phẩm', contact: 'Yêu cầu chung' },
```

- [ ] **Step 4: Replace the rail markup with the icon-only control and three actions**

Replace the component markup inside the frontmatter boundary with:

```astro
<div class="floating-form-rail" data-floating-rail data-locale={locale}>
  <button
    class="floating-form-rail__toggle"
    type="button"
    aria-controls="floating-rail-panel"
    aria-expanded="false"
    aria-label={copy.toggleOpen}
    data-floating-rail-toggle
    data-open-label={copy.toggleOpen}
    data-close-label={copy.toggleClose}
  >
    <span class="floating-form-rail__toggle-icon" data-floating-rail-icon aria-hidden="true"></span>
  </button>
  <nav id="floating-rail-panel" class="floating-form-rail__panel" aria-label={copy.navigation}>
    <a href={`${contactPath}?interest=retail`}>{copy.buy}</a>
    <a href={`${contactPath}?interest=other`}>{copy.sell}</a>
    <a href={contactPath}>{copy.contact}</a>
  </nav>
</div>
```

- [ ] **Step 5: Run focused contracts and typecheck**

Run: `bun test tests/floating-form-rail-render-contract.test.ts && bun run check`

Expected: PASS and Astro reports `0 errors`, `0 warnings`, `0 hints`.

- [ ] **Step 6: Commit the semantic simplification**

```bash
git add tests/floating-form-rail-render-contract.test.ts src/lib/i18n/ui.ts src/components/global/FloatingFormRail.astro
git commit -m "refactor: simplify floating rail content"
```

### Task 3: Edge-attached organic styling and component motion

**Files:**
- Modify: `tests/living-design-contract.test.ts:252-272`
- Modify: `src/components/global/FloatingFormRail.astro:43-213`

**Interfaces:**
- Consumes: `data-ready`, `data-visible`, and `data-expanded` controller state from Task 1 and simplified markup from Task 2.
- Produces: an open edge-attached rail, a 44×44px icon control, 48px action rows, one clipped outer corner, and reduced-motion-safe state transitions.

- [ ] **Step 1: Write failing design-contract assertions**

Replace the existing floating-rail design test in `tests/living-design-contract.test.ts` with:

```ts
test('styles the floating rail as one simple animated ingredient label', () => {
  const rail = source('src/components/global/FloatingFormRail.astro');
  for (const token of [
    'var(--color-rice-paper)',
    'var(--color-paper-white)',
    'var(--color-deep-herb)',
    'var(--color-paradise-orange)',
    'var(--color-mist-blue)',
    'clip-path',
    '360ms cubic-bezier(0.22, 1, 0.36, 1)',
    '@keyframes floating-rail-enter',
    '@media (prefers-reduced-motion: reduce)',
    'min-block-size: 3rem',
    'min-block-size: 3.25rem',
    'inset-inline-end: 0',
  ]) expect(rail).toContain(token);

  expect(rail).not.toContain('box-shadow');
  expect(rail).not.toContain('linear-gradient');
  expect(rail).not.toContain('font-family: var(--font-display)');
  expect(rail).not.toContain('floating-form-rail__heading');
  expect(rail).not.toContain('floating-form-rail__marker');
});
```

- [ ] **Step 2: Run the focused design test and verify RED**

Run: `bun test tests/living-design-contract.test.ts`

Expected: FAIL because the old rail is detached from the edge, still uses heading/marker styles, lacks the new entry keyframe, and uses the old transition timing.

- [ ] **Step 3: Replace the scoped rail styles**

Replace the component `<style>` block with:

```css
<style>
  .floating-form-rail {
    align-items: flex-end;
    display: flex;
    flex-direction: row-reverse;
    inset-inline-end: 0;
    pointer-events: none;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 15;
  }

  .floating-form-rail[data-ready='true'] {
    animation: floating-rail-enter 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .floating-form-rail__toggle,
  .floating-form-rail__panel a {
    align-items: center;
    display: flex;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
    text-decoration: none;
  }

  .floating-form-rail__toggle {
    align-items: center;
    background: var(--color-deep-herb);
    border: 0;
    border-inline-start: 0.1875rem solid var(--color-paradise-orange);
    color: var(--color-paper-white);
    cursor: pointer;
    display: none;
    inline-size: 3.25rem;
    justify-content: center;
    min-block-size: 3.25rem;
    padding: 0;
    pointer-events: auto;
    transition: background-color 160ms ease;
  }

  .floating-form-rail[data-ready='true'] .floating-form-rail__toggle { display: flex; }

  .floating-form-rail__toggle:hover,
  .floating-form-rail__toggle:focus-visible { background: var(--color-deep-herb); }

  .floating-form-rail__toggle-icon {
    block-size: 1rem;
    inline-size: 1rem;
    position: relative;
  }

  .floating-form-rail__toggle-icon::before,
  .floating-form-rail__toggle-icon::after {
    background: currentColor;
    content: '';
    inset: 50% auto auto 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .floating-form-rail__toggle-icon::before { block-size: 0.125rem; inline-size: 1rem; }
  .floating-form-rail__toggle-icon::after { block-size: 1rem; inline-size: 0.125rem; }
  .floating-form-rail[data-expanded='true'] .floating-form-rail__toggle-icon::after { transform: translate(-50%, -50%) scaleY(0); }

  .floating-form-rail__panel {
    background: var(--color-rice-paper);
    border-block-start: 0.1875rem solid var(--color-paradise-orange);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 1rem 100%, 0 calc(100% - 1rem));
    display: grid;
    inline-size: min(18.5rem, calc(100vw - 3.25rem));
    opacity: 1;
    padding: 0.5rem 1rem 0.75rem;
    pointer-events: auto;
    translate: 0 0;
    transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
      translate 360ms cubic-bezier(0.22, 1, 0.36, 1),
      visibility 360ms step-end;
    visibility: visible;
  }

  .floating-form-rail[data-ready='true'][data-expanded='false'] .floating-form-rail__panel {
    opacity: 0;
    pointer-events: none;
    translate: 0.75rem 0;
    transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1),
      translate 360ms cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0ms linear 360ms;
    visibility: hidden;
  }

  .floating-form-rail__panel a {
    background: transparent;
    border-block-end: 1px solid color-mix(in srgb, var(--color-deep-herb) 16%, transparent);
    color: var(--color-deep-herb);
    justify-content: space-between;
    min-block-size: 3rem;
    padding-inline: 0.25rem;
    transition: background-color 160ms ease, color 160ms ease;
  }

  .floating-form-rail__panel a:last-child { border-block-end: 0; }

  .floating-form-rail__panel a::after {
    color: var(--color-paradise-orange);
    content: '↗';
    font-size: var(--text-lg);
    font-weight: 400;
    margin-inline-start: 1rem;
  }

  .floating-form-rail__panel a:hover,
  .floating-form-rail__panel a:focus-visible {
    background: var(--color-mist-blue);
    color: var(--color-deep-herb);
  }

  @keyframes floating-rail-enter {
    from { opacity: 0; translate: 1rem 0; }
    to { opacity: 1; translate: 0 0; }
  }

  @media (max-width: 48rem) {
    .floating-form-rail {
      align-items: flex-end;
      flex-direction: column-reverse;
      inset-block-end: 1rem;
      inset-inline-end: 1rem;
      inline-size: min(20rem, calc(100vw - 2rem));
      top: auto;
      transform: none;
    }

    .floating-form-rail__panel {
      inline-size: 100%;
      max-block-size: 16rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floating-form-rail[data-ready='true'] { animation: none; }
    .floating-form-rail__panel,
    .floating-form-rail__toggle,
    .floating-form-rail__toggle-icon::before,
    .floating-form-rail__toggle-icon::after,
    .floating-form-rail__panel a { transition: none; }
  }
</style>
```

- [ ] **Step 4: Run focused tests and typecheck**

Run: `bun test tests/living-design-contract.test.ts tests/floating-form-rail-render-contract.test.ts tests/motion.test.ts && bun run check`

Expected: all focused tests pass and Astro reports `0 errors`, `0 warnings`, `0 hints`.

- [ ] **Step 5: Commit the visual and motion treatment**

```bash
git add tests/living-design-contract.test.ts src/components/global/FloatingFormRail.astro
git commit -m "feat: polish floating rail as organic edge label"
```

### Task 4: Full verification and rendered acceptance

**Files:**
- Verify: `tests/verify-built-mvp.ts`
- Verify: `tests/verify-built-living-design.ts`
- Verify: generated `dist/` output

**Interfaces:**
- Consumes: completed controller, markup, copy, and scoped styling from Tasks 1–3.
- Produces: fresh automated and rendered evidence for every acceptance criterion; no production interface changes.

- [ ] **Step 1: Run the complete test suite**

Run: `bun test`

Expected: all tests pass with `0 fail`.

- [ ] **Step 2: Run Astro diagnostics**

Run: `bun run check`

Expected: `0 errors`, `0 warnings`, `0 hints`.

- [ ] **Step 3: Build and run every generated-output verifier**

Run: `bun run build`

Expected: Astro static build exits 0; CMS assets, living design, catalog, brands, enquiry, MVP, bilingual routes, 404 fallback, and all 26 canonical floating-rail placements verify successfully.

- [ ] **Step 4: Run browser QA on English desktop**

At `http://127.0.0.1:4321/en/` with a 1440×900 viewport, verify:

```text
page load -> rail is visible and expanded without scrolling
collapse control -> panel becomes hidden and aria-expanded becomes false
reopen control -> panel becomes visible and aria-expanded becomes true
Escape -> panel closes and focus returns to the icon control
```

Collect page identity, DOM snapshot, console error/warning log, screenshot, rail/control/action rectangles, and initial computed animation name/duration/timing function.

- [ ] **Step 5: Run browser QA on Vietnamese mobile**

At `http://127.0.0.1:4321/vi/` with a 390×844 viewport, verify:

```text
page load -> all three Vietnamese actions are visible
each action height >= 48px
icon control width and height >= 44px
documentElement.scrollWidth <= innerWidth
combined rail height <= 337.6px (40% of 844px)
collapse/reopen and Escape focus return work
```

Collect a screenshot and confirm no framework overlay or relevant console error/warning.

- [ ] **Step 6: Inspect the final repository state**

Run: `git diff --check && git status --short && git log -5 --oneline`

Expected: no whitespace errors, a clean worktree, and the three implementation commits after the design and plan commits.
