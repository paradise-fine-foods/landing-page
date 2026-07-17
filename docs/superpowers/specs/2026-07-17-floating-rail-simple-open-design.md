# Floating Enquiry Rail — Simple Open Design

## Intent

Refine the floating enquiry rail into a premium, organically simple edge utility. The design may borrow the clear page-edge placement and immediate pathways seen on Dot Foods, but it must remain recognizably Paradise Fine Foods: lighter, ingredient-led, editorial, and restrained.

The rail exists to expose three direct enquiry paths. It is not a promotional banner, so it has no slogan, invitation heading, or decorative utility label.

## Approved requirements

- Remove the visible `ENQUIRE` / `TRAO ĐỔI` toggle label.
- Remove the visible `LET'S TALK` / panel-title treatment.
- Show the rail expanded by default on initial page load at desktop and mobile sizes.
- Keep an icon-only control for collapsing and reopening the panel. Its accessible name remains localized.
- Animate the rail as one composed object when it enters and when it opens or closes.
- Preserve all three localized enquiry destinations, keyboard behavior, focus return, no-JavaScript access, and the script-free 404 fallback.

## Visual direction

### Reference boundary

Dot Foods contributes one structural cue: a utility surface attached decisively to the viewport edge. Paradise does not copy its blue photographic slabs, paired promotional tabs, heavy corporate density, or typography.

### Token system

- **Deep herb** `#28342B` — action text and compact icon control.
- **Rice paper** `#FBFAF5` — primary panel surface.
- **Paper white** `#FFFFFF` — action-row lift and focus clarity.
- **Paradise orange** `#E46F2C` — the single identity seam.
- **Mist blue** `#E8F6FA` — quiet hover wash.

Newsreader is removed from the rail because there is no longer a display heading. Nunito handles action labels and the icon control, matching the site's navigation and practical UI language.

### Layout

```text
desktop — default open at right edge

                  ┌──────────────────────╮
                  │ Buy ingredients    ↗ │
                  │ Sell products      ↗ │
                  │ General enquiry    ↗ │
                  └───────────────────┬──╯
                                      │ − │
                                      ╰───╯

desktop — collapsed

                                      ╭───╮
                                      │ + │
                                      ╰───╯

mobile — default open above edge control

           ┌──────────────────────────╮
           │ Buy ingredients        ↗ │
           │ Sell products          ↗ │
           │ General enquiry        ↗ │
           └─────────────────────┬────╯
                                 │ − │
                                 ╰───╯
```

- The rail sits flush with the right viewport edge on desktop instead of floating with a detached gap.
- The panel uses one softly clipped lower outer corner. This ingredient-label silhouette is the only decorative signature.
- A narrow orange seam connects the panel and icon control so the component reads as one object.
- Action rows are at least 48px tall with quiet dividers and generous horizontal spacing.
- The collapsed control is icon-only and at least 44×44px.
- Mobile keeps a 16px safe inset from the right and bottom edges so browser chrome and device edges do not crowd the control.

## Markup and behavior

- Remove the visible label, panel heading, and redundant orange marker from `FloatingFormRail.astro`.
- Keep `data-floating-rail`, `data-floating-rail-toggle`, `aria-controls`, `aria-expanded`, localized accessible open/close labels, and the three real anchors.
- Initialize the enhanced rail with `data-visible="true"` and `data-expanded="true"`; do not wait for a one-viewport scroll threshold.
- Clicking the icon control toggles expansion. Escape closes the panel and returns focus to the control.
- The no-JavaScript version continues to render all three anchors and hides the non-functional control.
- `staticOnly` continues to omit the controller script on the 404 page while leaving the actions available.
- Do not change enquiry URLs or query parameters.

## Motion

- On enhancement, the entire open rail enters once from the viewport edge using opacity plus a short horizontal translation.
- Opening and closing animate the panel as one surface; action rows do not stagger independently.
- The component transition lasts 360ms with `cubic-bezier(0.22, 1, 0.36, 1)`. Hover and focus color transitions last 160ms.
- The icon rotates between plus and minus states as part of the same state transition.
- Under `prefers-reduced-motion: reduce`, all spatial motion is removed and state changes are immediate.
- The server-rendered actions remain readable before enhancement, preventing a hidden or unusable loading state.

## Accessibility and responsive behavior

- The icon-only control always has a localized accessible name that describes the next action.
- `aria-expanded` and the panel's visible state remain synchronized.
- Keyboard focus is visible against both deep herb and rice paper surfaces.
- All links and controls meet a 44px minimum target; action rows target 48px.
- English and Vietnamese labels may wrap only if required and must never clip.
- At 390×844, the combined open panel and control must fit without horizontal overflow and occupy no more than 40% of the viewport height.

## Implementation boundaries

- Expected production changes are limited to `FloatingFormRail.astro`, `floating-rail.ts`, localized copy types/values if obsolete visible strings can be removed, and focused tests.
- Existing site-wide tokens and typefaces remain unchanged.
- No new dependency, image asset, shadow, gradient, glass effect, or unrelated refactor is permitted.

## Verification

- Contract tests prove obsolete visible labels and heading markup are absent while localized accessible labels remain.
- Controller tests prove default visible/open state, toggle synchronization, Escape focus return, and safe disposal.
- Design tests prove the approved palette, one clipped corner, no gradients or shadows, 44px/48px targets, and reduced-motion handling.
- Production build verifiers prove all localized destinations and the static 404 fallback remain present.
- Browser QA covers English desktop and Vietnamese 390×844 mobile states, initial animation, collapse/reopen, Escape focus return, console health, and horizontal overflow.

## Acceptance criteria

- The first rendered state shows the three enquiry actions without requiring scroll or a click.
- No visible `ENQUIRE`, `TRAO ĐỔI`, `LET'S TALK`, `START A CONVERSATION`, or equivalent panel heading remains.
- The rail feels attached to the page edge like a useful distribution pathway, while its color, spacing, and ingredient-label silhouette belong to Paradise.
- Animation is noticeable but calm, occurs at the component level, and is absent for reduced-motion users.
- Desktop and mobile layouts remain accessible, bilingual, unobtrusive, and free of overflow.
