# Paradise Fine Foods Product-Led Minimal Redesign

**Date:** 2026-07-25

**Status:** Approved for implementation

## Objective

Simplify the complete bilingual Paradise Fine Foods application into a product-led minimal system. The app must become quieter, more compact, and more image-forward without removing content, changing the ten-section homepage composition, or altering any route, CMS, localization, form, filter, carousel, language, SEO, or enquiry behavior.

The primary audience is chefs, procurement teams, retailers, food-service operators, and prospective suppliers. The interface's job is to make the product portfolio easy to assess and make the correct enquiry path obvious.

## Binding Design System

- Palette: Process white `#FFFFFF`, Cool field `#F5F6F2`, Steel rule `#D9DCD7`, Graphite `#202522`, Utility grey `#68706A`, and Paradise orange `#E46F2C`.
- Typography: Newsreader 500 only for H1, H2, and explicit display type. Nunito 400/500/600 for every other heading, label, control, navigation item, metadata value, and body paragraph.
- Scale: H1 uses `clamp(2.25rem, 5vw, 4.25rem)`; H2 uses `clamp(1.75rem, 3vw, 2.75rem)`; H3 uses `clamp(1.125rem, 1.5vw, 1.35rem)`.
- Section spacing: `.section-space` uses `clamp(2.5rem, 5vw, 4rem)`.
- Geometry: media, cards, and panels are square. Form controls may use at most `2px` radius. No decorative shadows, gradients, translucent washes, clipping masks, or ornamental fields.
- Signature: a thin Paradise-orange inventory locator may appear only beside genuine product facts such as pack format, origin, storage, or temperature. It must not become a generic divider on unrelated content.
- Imagery: authentic product, packaging, partner, and brand artwork remains full color and visually leads its component. Missing imagery uses a neutral Cool field stage without invented effects.
- Motion: remove ambient Canvas and authored section reveals. Keep only functional menu, carousel, form, language, floating-rail, hover, and focus behavior. Functional transitions remain short and reduced-motion-safe.

## Composition

- Preserve all ten homepage sections in their current order.
- Preserve every public and localized route and every existing CMS query/type.
- Preserve current component boundaries and source/reading order.
- Hero and product presentations prioritize media on desktop while retaining the heading before media in source order and a readable mobile stack.
- Cards rely on image, whitespace, type, and a single steel separator instead of a surrounding decorative box.
- Header, footer, filters, forms, rail, CTA, and metadata rows become more compact while maintaining 44px interactive targets.
- The graphite final CTA/footer remain the only large dark anchors.

## Accessibility and Responsive Requirements

- Maintain WCAG AA text/control contrast and visible keyboard focus.
- Maintain at least 44px touch targets and logical tab/source order.
- Preserve semantic names, headings, field relationships, carousel announcements, and rail state.
- English and Vietnamese must fit without clipping at 1280x800 and 390x844.
- No representative route may create horizontal overflow or allow the floating rail to hide an essential control.

## Verification

- `bun test`, `bun run check`, and `bun run build` must pass.
- Preserve the exact 42-page route manifest and all generated-output verifiers.
- The existing Astro duplicate-root warning is accepted; no new warning is accepted.
- Browser QA covers English and Vietnamese home, product index/detail, brand index/detail, blog index/article, general and mode-specific contact pages, and 404 at both required viewport sizes.

## Self-Critique

Product-led minimal styling can become generic or expose weak imagery. This design avoids that by using Paradise's real product facts as its structural signature, preserving authentic packaging color, and relying on neutral fallback stages instead of decorative image effects. Newsreader remains restrained so the interface retains editorial warmth without returning to the previous oversized treatment.
