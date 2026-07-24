# Mobile Floating Rail Edge-Latch Design

## Goal

Make the floating enquiry rail unobtrusive on mobile by loading it as a 44px edge latch at the lower-right safe edge. Opening the latch reveals the existing actions upward and inward. Desktop behavior and the component's content structure stay unchanged.

## Interaction

- At viewport widths up to and including `48rem`, the enhanced rail starts visible and collapsed.
- Above `48rem`, or when `matchMedia` is unavailable, it starts visible and expanded as it does today.
- The existing toggle opens and closes the panel. Escape closes an open panel and returns focus to the toggle.
- Collapsed panels remain inert and are removed from keyboard navigation.
- The server-rendered and `staticOnly` variants remain in normal document flow with all three real links available when JavaScript does not run.

## Presentation

- Mobile positioning uses the lower-right safe edge with no decorative outer gap: logical block-end and inline-end insets use the corresponding safe-area environment values with `0px` fallbacks.
- The mobile flex row bottom-aligns its children so the 44px toggle remains at the lower edge while the taller action panel grows upward.
- The complete mobile rail is limited to `min(14.75rem, 100vw)`. The existing panel width and 44px toggle fill that footprint without unused trailing space.
- The existing graphite, process-white, brushed-steel, and Paradise-orange palette remains unchanged. No new decoration, copy, or motion is introduced.
- The existing horizontal translate transition remains the only open/close motion and is disabled for reduced-motion users.

## Architecture

`FloatingFormRail.astro` continues to own the unchanged server-rendered markup and scoped responsive styling. `initializeFloatingRail()` continues to own disclosure state and gains one optional `matchMedia` dependency for deterministic mobile/desktop initialization in tests. The media query is evaluated once at initialization; live breakpoint synchronization is intentionally out of scope.

## Compatibility and Scope

- No public component props, routes, localized copy, link targets, or DOM structure change.
- Desktop placement remains `top: calc(5rem + var(--space-6))` and desktop starts expanded.
- The mobile breakpoint remains `max-width: 48rem`.
- The unrelated `.superpowers/brainstorm/` directory is not modified or committed.

## Acceptance Criteria

- A mobile initialization reports `data-ready="true"`, `data-visible="true"`, and `data-expanded="false"`; the panel is inert and the toggle announces the open action.
- A desktop or media-query-unavailable initialization reports the same ready/visible state with `data-expanded="true"`; the panel is interactive and the toggle announces the close action.
- Toggling, Escape handling, focus restoration, cleanup, reduced motion, static fallback, and all three links continue to work.
- Focused tests, type checking, the complete test suite, the production build, and representative mobile/desktop browser QA pass.
