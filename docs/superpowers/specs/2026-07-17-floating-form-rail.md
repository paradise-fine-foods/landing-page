# Floating Form Rail Design

**Status:** Approved by continued request; implementation follows the recommended demo architecture.

## Goal

Give every localized page a Dot Foods-inspired right-edge floating menu that appears after the hero area is passed and routes visitors to three intent-specific enquiry entry points.

## Design

The shared `SiteLayout` renders a `FloatingFormRail` after the page shell so the rail is available on home, catalog, product, brand, contact, and 404 pages without duplicating markup. The rail receives locale-aware copy and the existing localized contact path from the layout. It is server-rendered as three real links, so all destinations remain usable without JavaScript.

The three demo actions are:

| Action | Contact destination | Selected interest |
| --- | --- | --- |
| Buy ingredients | `/{locale}/contact/?interest=retail` | `retail` |
| Sell products | `/{locale}/contact/?interest=other` | `other` |
| General enquiry | `/{locale}/contact/` | none |

The first two links use the existing enquiry form's query-string preselection instead of creating duplicate form pages or delivery logic. They are vendor-neutral and can later be remapped to headless CMS forms without changing the rail component interface.

## Interaction and responsive behavior

- Desktop/tablet: a fixed right-edge rail with a small vertical tab and three stacked action links, vertically centered in the viewport.
- The rail is initially hidden and becomes visible once `window.scrollY` passes the first viewport height. A `data-floating-rail-visible` state is toggled by a passive scroll listener and settled immediately when reduced motion is preferred.
- The tab toggles the three links open/closed. The toggle has `aria-expanded`, `aria-controls`, and localized accessible labels. The rail starts closed on narrow screens and open on larger screens.
- `Escape` closes the rail and returns focus to the toggle. Links use normal navigation; no submission or external side effect occurs from the rail itself.
- Mobile: the rail is inset from the edge, with a compact toggle and full-width stacked links when opened. Each target remains at least 44px tall and stays clear of the viewport edge.
- `prefers-reduced-motion: reduce` disables transform transitions while preserving the same visibility and keyboard behavior.

## Content and localization

Add localized rail copy to `src/lib/i18n/ui.ts` for the toggle label, open/close labels, and the three action labels. English and Vietnamese use the same stable route structure (`/{locale}/contact/`) and only translate visible copy.

## Testing and verification

- Add a rendering contract test that checks both locale layouts include the rail, three localized links, intent query values, ARIA wiring, and a no-JavaScript-safe anchor fallback.
- Add a small controller test for scroll visibility, toggle state, Escape handling, and cleanup.
- Build verification must assert all generated localized page families contain the rail and the three expected destinations.
- Run `bun test`, `bun run check`, `bun run build`, and `git diff --check`.

## Non-goals

- No third-party floating-menu dependency.
- No duplicate form implementations.
- No submission behavior in the rail.
- No removal of existing contact routes or legacy redirects.
