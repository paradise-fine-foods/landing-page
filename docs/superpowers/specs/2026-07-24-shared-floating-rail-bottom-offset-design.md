# Shared Floating Rail Bottom Offset Design

## Goal

Place the floating enquiry rail in the same lower-right location on desktop and mobile while keeping it slightly above the viewport edge.

## Placement

- Every enhanced floating rail is anchored to the lower-right corner.
- The block-end offset is `calc(1rem + env(safe-area-inset-bottom, 0px))`.
- The inline-end offset is `calc(1rem + env(safe-area-inset-right, 0px))`.
- Children are bottom-aligned so the 44px toggle stays at the lower edge of the expanded panel and the action list grows upward.
- The existing mobile width limit remains `min(14.75rem, 100vw)`.

## Behavior and Scope

- Desktop continues to initialize expanded.
- Mobile continues to initialize collapsed at `max-width: 48rem`.
- Component markup, props, three links, localized copy, disclosure behavior, Escape/focus restoration, inert state, reduced motion, and the static/no-JavaScript fallback remain unchanged.
- The approved graphite, process-white, brushed-steel, and Paradise-orange presentation remains unchanged.
- No controller, route, content, or typography changes are required.

## Implementation Shape

Move the shared bottom alignment and lower-right inset declarations into the base `.floating-form-rail` rule in `FloatingFormRail.astro`. Remove the obsolete desktop `top` anchor and remove duplicate mobile placement declarations so both viewport classes inherit one positioning contract. Keep the mobile media query only for its compact width and panel height constraint.

## Acceptance Criteria

- At representative desktop and mobile viewports, the rail sits 16px above and inward from the safe viewport edge with no horizontal overflow.
- Desktop is expanded and mobile is collapsed on initialization.
- Opening the mobile rail reveals the unchanged panel upward and inward.
- The normal-flow static fallback is unaffected.
- Focused render-contract tests, controller tests, Astro check, the full test suite, production build, and responsive browser QA pass.
