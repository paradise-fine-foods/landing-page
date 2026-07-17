# Floating Enquiry Rail — Living Ingredients Redesign

## Intent

Redesign the existing Dot Foods-inspired enquiry rail so it belongs to Paradise Fine Foods' Living Ingredients system. The rail should feel like a small piece of ingredient packaging or a catalogue annotation: useful, tactile and editorial, never like a generic dark utility widget.

The redesign changes visual language and markup only. Existing localized routes, scroll threshold, progressive enhancement, keyboard behavior, 404 fallback and no-JavaScript anchors remain intact.

## Visual direction

### Token system

- **Rice paper** `var(--color-rice-paper)` — quiet shell and open label surface.
- **Paper white** `var(--color-paper-white)` — expanded action panel.
- **Deep herb** `var(--color-deep-herb)` — readable copy and compact edge tab.
- **Paradise orange** `var(--color-paradise-orange)` — identity rule, active marker and focus ring.
- **Mist blue** `var(--color-mist-blue)` — restrained hover wash for action rows.

Typography stays within the approved pair: Newsreader for the tiny editorial heading and Nunito for controls, action labels and metadata.

### Layout

```text
desktop, closed                         desktop, open
right edge                              right edge
┌─────┐                                 ┌──────────────────────┐
│  +  │  ← orange rule + label          │ ENQUIRE              │┌─────┐
└─────┘                                 │ ──────────────────── ││  ×  │
                                       │ Buy ingredients      │└─────┘
                                       │ Sell products        │
                                       │ General enquiry     │
                                       └──────────────────────┘
```

- Closed state is a compact deep-herb tab with a vertical orange identity rule and a rotated `ENQUIRE`/localized equivalent label.
- Open state is a paper-white panel with a thin orange top rule, a small Newsreader heading, and three full-width action rows.
- One clipped organic corner on the panel is the sole decorative signature; no shadows, gradients or excessive rounding.
- Desktop panel remains vertically centered at the viewport edge. Mobile docks to the lower-right, stacks the actions, and keeps the tab aligned to the panel edge.
- Action rows retain at least 44px block size and visible orange focus rings.

## Markup and behavior

- Add localized `label` copy for the compact tab and `panelTitle` copy for the expanded heading.
- Keep the existing `data-floating-rail`, `data-floating-rail-toggle`, `data-expanded`, `data-visible`, `aria-controls`, and localized open/close labels.
- Add a non-interactive panel heading and an orange marker element with `aria-hidden="true"`.
- The panel stays server-rendered as three real anchors. `staticOnly` continues to omit the controller script for 404/no-JS fallback.
- Do not change destination paths or controller thresholds.

## Accessibility and motion

- Keep the toggle as the only disclosure control; action anchors remain direct links.
- Preserve Escape-to-close and focus return.
- Preserve hidden-until-enhanced behavior so a no-JS page exposes links without a dead button.
- Reduce transitions to opacity/transform/color and disable them under `prefers-reduced-motion`.

## Acceptance

- Rail reads as Living Ingredients rather than a generic dark floating widget at desktop and 390px mobile.
- EN and VI labels fit without clipping or horizontal overflow.
- Closed/open states visibly differ and match `aria-expanded`.
- Existing route, controller, 404 and generated-output contracts remain green.
- Browser QA confirms desktop scroll reveal, toggle, Escape focus return, mobile stacked actions, and no horizontal overflow.
