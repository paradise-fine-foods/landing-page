# Footer and Floating Navigation Layout Design

## Goal

Repair footer link flow and floating enquiry navigation so all navigation anchors stack vertically, while adding a smooth open/close transition to the progressive-enhancement floating rail.

## Design

Keep existing markup, routes, copy, placement, disclosure controller, inert state, focus restoration, and no-JavaScript fallback. Scope footer fixes to the footer component: navigation and contact anchors use a vertical block flow so sibling links cannot render side by side. Scope floating-rail fixes to its component CSS: remove the mobile three-column grid, keep the panel vertical at every viewport, and animate opacity/visibility/translation instead of collapsing the enhanced panel with `display: none`.

The current `data-expanded` state remains the single visual-state source. Collapsed enhanced panels become non-interactive through `visibility`, `opacity`, and `pointer-events`; the controller continues to enforce `inert`. Reduced-motion removes visual transitions. Static/no-JavaScript markup remains visible and normal-flow.

## Acceptance

- Footer navigation and contact links render one per line on desktop and mobile.
- Floating enquiry links render one per line on desktop and mobile.
- Opening and closing the enhanced floating rail visibly transitions.
- Existing routes, ARIA state, Escape/focus behavior, reduced-motion behavior, and static fallback remain intact.
- Focused tests, full tests, Astro diagnostics, production build, and Browser desktop/mobile QA pass.
