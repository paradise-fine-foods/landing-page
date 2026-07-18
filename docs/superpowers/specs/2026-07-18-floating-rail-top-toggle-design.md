# Floating Rail Top Toggle Design

## Goal

Move the floating enquiry rail toggle from the lower-left edge of the menu to its upper-left edge without changing the rail's content, accessibility, or open and close behavior.

## Design

The toggle remains the first element in the horizontal rail and sits flush beside the panel. The rail's cross-axis alignment changes from bottom-aligned to top-aligned at desktop and mobile sizes, placing the toggle level with the panel's orange top seam. The toggle becomes a compact 44 × 44 px control while retaining its deep-herb surface, orange seam, and shadows.

The collapsed toggle uses `lucide:chevron-left` to indicate that the panel opens toward the left. The expanded toggle uses `lucide:chevron-right` to indicate that the panel closes toward the viewport's right edge. Localized accessible labels continue to announce “Open enquiry options” and “Close enquiry options” independently of the decorative icons.

The rail continues to translate as one container. When collapsed, the panel moves off-screen while the full toggle remains visible at the viewport edge. The 360 ms easing, default-open state, Escape behavior, focus return, inert collapsed panel, and reduced-motion treatment remain unchanged.

## Responsive Behavior

Desktop and mobile use the same top attachment. Existing viewport width limits and overflow protections remain intact.

## Verification

- Add render-contract assertions for top alignment, 44 × 44 px toggle geometry, and the collapsed/expanded chevrons.
- Run the focused floating-rail and motion tests.
- Run the full test, Astro check, and production build suites.
- Confirm in a browser that the toggle begins at the panel's top edge and moves with the menu when toggled.

## Scope

No copy, route, form, color, or animation-duration changes are included.
