# Living Ingredients Redesign

**Status:** Approved direction, awaiting written-spec review  
**Date:** 2026-07-16  
**Subject:** Paradise Fine Foods bilingual catalog and lead-generation demo  
**Audience:** Professional food buyers, chefs, retail and HORECA partners in Vietnam  
**Primary job:** Make products desirable and easy to evaluate while presenting Paradise as a capable, approachable distributor.

## 1. Decision Summary

Replace the current industrial Cold-Chain Atelier presentation with **Living Ingredients**, an organic 2D visual system grounded in Paradise Fine Foods' existing identity and the supplied `Savencia Brochure 2026_Vie.pdf`.

Preserve the working bilingual catalog, brand, enquiry, accessibility, static-rendering and CMS-neutral data behavior. Remove the complete Three.js/WebGL feature. Retain the option to use deliberate scroll animation, a user-controlled carousel and lightweight 2D canvas effects where they strengthen the composition and have accessible static fallbacks.

This specification supersedes the 3D requirements, cold-chain industrial art direction and localized Vietnamese route segments in `DESIGN.md`. Requirements in `DESIGN.md` that do not conflict with this document remain binding.

## 2. Reference Boundaries

### Identity sources

- Use the exact Paradise Fine Foods full logo displayed on the current site and in the supplied brochure.
- Self-host the logo asset. Do not hotlink it, redraw it, typeset a replacement or adapt the legacy site's layout.
- The current site's orange/coral identity and the brochure's blue, green, orange and red organic marks establish the brand palette.

### Brochure inspiration

Use these principles from the supplied six-page brochure:

- rounded droplet and petal forms as color marks, image masks and clusters;
- isolated product cutouts with generous negative space;
- thin orange rules joining product imagery to concise specifications;
- brand color used in short, confident moments rather than full-page saturation;
- photography cropped into organic masks to connect product, chef, ingredient and origin;
- clear hierarchy between product name, professional benefit and technical data.

Do not copy a complete brochure spread, print composition, proprietary partner-brand artwork or legacy website section. Avoid brochure-scale centered paragraphs and script type for essential information.

## 3. Art Direction

### 3.1 Creative thesis

Paradise connects living ingredients, skilled makers and professional kitchens. The interface should feel cultivated and in motion, not engineered or decorative for its own sake.

### 3.2 Signature element

The memorable device is a **living ingredient cluster**: product cutouts, small photography fragments and colored droplet shapes composed as one asymmetric 2D scene. The cluster appears in the homepage hero and in quieter variations on product and brand pages.

The shape family is derived from the rounded marks already visible in the Paradise/Savencia identity. It must not become generic botanical clip art.

### 3.3 Palette

| Token | Value | Role |
|---|---:|---|
| `paradise-orange` | `#E46F2C` | Primary identity, important actions and connector rules |
| `fresh-tangerine` | `#FA6C47` | Animated accents and warm emphasis |
| `savencia-blue` | `#0796D2` | Navigation details, informational emphasis and partner continuity |
| `garden-green` | `#94C11F` | Organic accents and positive states |
| `soft-coral` | `#D94D55` | Small expressive accents only |
| `rice-paper` | `#FBFAF5` | Primary surface |
| `paper-white` | `#FFFFFF` | Product and reading surfaces |
| `deep-herb` | `#28342B` | Body text and dark contrast moments |
| `mist-blue` | `#E8F6FA` | Quiet alternate section surface |

Partner product pages may introduce an approved partner color, but Paradise navigation, actions and structural cues remain identifiable.

### 3.4 Typography

- Use the original site's **Nunito** family for body copy, navigation, controls and product specifications.
- Use one expressive serif with Vietnamese coverage for major editorial headings. It should have soft, human curves without resembling a luxury fashion masthead.
- Permit a restrained handwritten treatment only for short nonessential display phrases inspired by the brochure; render the same meaning in normal accessible text or mark the script treatment decorative.
- Reduce uppercase labels and wide tracking. Technical metadata may use compact uppercase only where it improves scanning.
- Use no more than two functional font families in the loaded page.

### 3.5 Shape and layout rules

- Replace hard full-width rails, boxed section grids and repeated rectangular cards with asymmetry, overlapping masks and curved section boundaries.
- Preserve strong alignment for technical product data, filters and forms.
- Use a small library of authored SVG shapes rather than arbitrary generated blobs.
- Vary shape scale and placement, not the underlying product-information order.
- Maintain generous negative space around pack shots.
- Do not apply large rounded rectangles to every component.

## 4. Homepage Composition

### 4.1 Header

- Replace the text-based wordmark with the exact self-hosted Paradise full logo.
- Keep Products, Brands, Contact and language switching visible on desktop.
- Use a compact accessible menu on mobile.
- Remove the industrial border rail; use a warm translucent surface and a shallow curved shadow or organic underline.

### 4.2 Hero

- Left: proposition, short supporting copy and two actions.
- Right: living ingredient cluster built from the featured product's static pack/poster artwork, authored SVG droplets and optional small photographic masks.
- Keep the primary product and calls to action in the document without JavaScript.
- Remove model status, interaction instructions, camera controls, GLB references, canvas WebGL output and technical stage rails.
- A lightweight 2D canvas adds ambient particles or connecting strokes after load. It must be decorative, `aria-hidden`, pointer-agnostic and absent for reduced motion, save-data or unsupported environments.
- The static composition remains complete when all animation is disabled.

### 4.3 Product-family discovery

- Arrange the four category entries as a loose table rather than an equal card grid.
- Use different authored shape masks while keeping headings, counts and links predictable.
- Use subtle vertical offsets only on larger screens; restore a simple reading order on mobile.

### 4.4 Featured products

- Present pack shots on clean surfaces with thin orange specification rules.
- Ship a manually controlled carousel for the featured products while keeping every product in the server-rendered document.
- Carousel controls must be explicit buttons with accessible names; keyboard operation, current-position status and non-JavaScript access to every product are required.
- No automatic advancement. No infinite clone loop. Reduced motion disables animated sliding.

### 4.5 Featured brand story

- Pair one large organic photo mask with a brand introduction and selected product cutouts.
- Use partner-brand color as a controlled accent without replacing Paradise identity.

### 4.6 Service and channel proof

- Replace the dark technical band and numbered ledger with a curved journey line connecting sourcing, handling and customer channels.
- Each proof point remains readable and ordered without the line or animation.
- Use factual operational copy; do not imply unverified sustainability, origin or cold-chain claims.

### 4.7 Closing enquiry

- Use one large warm shape crossing the section boundary, a concise statement and one primary enquiry action.
- Keep contact context and demo status explicit.

## 5. Catalog, Product and Brand Pages

### 5.1 Catalog

- Keep search, category and brand filters immediately usable and screen-reader announced.
- Use an airy product field rather than a boxed industrial grid.
- Product cards use a static product cutout, one organic color field, name, brand and essential specifications.
- Hover may shift the image and shape by no more than `8px`; keyboard focus receives an equally clear non-motion treatment.
- Zero-results and reset behavior remain bilingual and visible.

### 5.2 Product detail

- Use a large pack shot with two to four surrounding ingredient/photo droplets.
- Keep benefits, format, storage and origin beside the product in a disciplined specification column.
- Thin orange connectors may link the pack shot to key facts on large screens. On mobile, facts become a normal definition list without connector lines.
- Enquiry remains the primary conversion action.

### 5.3 Brand index and detail

- Use varied editorial compositions without changing route or content semantics.
- Brand cards may use one approved accent and an organic logo field.
- Brand detail retains reciprocal product links and localized metadata.

### 5.4 Enquiry and 404

- Soften form grouping through spacing, pale shape fields and curved separators while preserving explicit labels, validation and focus order.
- Recompose the 404 page with the Paradise logo and floating brand shapes; direct locale and primary navigation links remain available without JavaScript.

## 6. Motion and Progressive Enhancement

### 6.1 Allowed motion

- one orchestrated hero entrance;
- very slow ambient drift after the hero settles;
- selected scroll-linked section reveals;
- SVG path drawing for the service journey;
- product-image and organic-mask hover responses;
- a manually controlled featured-product carousel;
- a decorative 2D canvas layer for eligible environments.

### 6.2 Motion limits

- Motion must communicate grouping, progression or tactility; decorative animation on every element is prohibited.
- The hero entrance completes within `1200ms`.
- Ambient loops use durations of at least `10s`, small travel distances and no flashing.
- Scroll effects may not hijack scrolling, pin long sections or block reading.
- Carousel position changes occur only after user input.
- Content order, actions and information remain identical when JavaScript is unavailable.

### 6.3 Accessibility and resource conditions

- `prefers-reduced-motion: reduce` shows settled compositions, disables drift, path drawing, animated scrolling and sliding.
- `navigator.connection.saveData` prevents the canvas enhancement and nonessential animation modules from loading.
- Decorative canvas and SVG layers are `aria-hidden` and never receive focus.
- Pause controls are required if any nonessential motion cannot comply with WCAG timing exceptions.
- All interactive targets remain at least `44px` in both dimensions.

## 7. Bilingual URL Architecture

Use uniform structural route segments under explicit locale prefixes:

```text
/en/
/vi/
/en/products/
/vi/products/
/en/products/[slug]/
/vi/products/[slug]/
/en/brands/
/vi/brands/
/en/brands/[slug]/
/vi/brands/[slug]/
/en/contact/
/vi/contact/
```

The locale prefix communicates language; shared structural segments keep CMS mapping, analytics, implementation and maintenance predictable. Detail slugs remain localized when the product or brand has an approved localized public name.

Legacy demo routes redirect permanently to the new canonical routes:

```text
/vi/san-pham/                -> /vi/products/
/vi/san-pham/[slug]/         -> /vi/products/[localized-slug]/
/vi/thuong-hieu/             -> /vi/brands/
/vi/thuong-hieu/[slug]/      -> /vi/brands/[localized-slug]/
/vi/lien-he/                 -> /vi/contact/
```

Every page emits a self canonical and reciprocal English/Vietnamese `hreflang` alternate. The language switcher preserves the current content record when a counterpart exists and otherwise falls back to the target-locale homepage.

## 8. Technical Removal and Architecture

Remove:

- the `three` and `@types/three` packages;
- `src/components/three/`;
- `src/lib/three/`;
- `public/models/` and the demo GLB;
- Three.js activation, lifecycle and build-verifier tests;
- model and 3D fields that exist only for the demo hero;
- 3D status, prompt and failure copy that has no 2D equivalent.

Create focused replacements:

- a static `LivingHero` composition responsible for semantic hero content and the server-rendered art scene;
- authored reusable organic SVG primitives with explicit decorative semantics;
- a small enhancement module responsible for intersection-based reveals, eligible canvas decoration and carousel behavior;
- no general animation framework unless native CSS, Web Animations API and IntersectionObserver prove insufficient during implementation.

CMS query functions continue returning demo data. The hero consumes the featured product image, alt text and content metadata without any CMS-vendor coupling.

## 9. Performance Budgets

- Critical initial JavaScript remains at or below `120KB` compressed.
- Removing Three.js must eliminate its runtime and model transfer entirely.
- Animation code is split from critical rendering and loads only when its enhancement is eligible.
- Decorative 2D canvas code and authored SVG assets together should remain below `35KB` compressed JavaScript and `80KB` compressed transferred graphics on the homepage.
- The static hero image remains the LCP candidate, has explicit dimensions and receives responsive preload treatment.
- Cumulative Layout Shift remains below `0.1`.

## 10. Verification and Acceptance

The redesign is complete only when all of the following are proven:

1. The exact Paradise full logo is self-hosted and visible in header/footer in both locales.
2. No `three`, WebGL, GLB, model viewer, model-stage code or 3D dependency remains in source, lockfile, tests or built output.
3. Homepage, catalog, product detail, brands, enquiry and 404 use the Living Ingredients palette and organic shape system without losing semantic structure.
4. English and Vietnamese canonical routes use the same structural segments and legacy Vietnamese paths redirect correctly.
5. Language switching preserves home, catalog, product, brand and contact counterparts.
6. All content and actions remain usable with JavaScript disabled.
7. Reduced motion produces stable settled compositions with no ambient loops or animated carousel transitions.
8. The featured-product carousel is manual, keyboard accessible, labeled and exposes all items without JavaScript.
9. The canvas enhancement is decorative, inaccessible to pointer/focus, omitted under reduced motion and save-data, and adds no content dependency.
10. Automated tests, `astro check`, production build and generated-output link/asset verification pass.
11. Browser QA covers English and Vietnamese representative pages at desktop and exact `390px` mobile widths with no horizontal overflow or console errors.
12. Browser screenshots confirm that hard industrial rails, the dark technical hero stage and repetitive equal-card treatment are absent.
13. A visual self-critique identifies and removes at least one unnecessary decorative element before completion.

## 11. Creative Test

Before accepting any screen, ask:

> Does this feel like ingredients, makers and kitchens in a living relationship—while keeping the product easy to understand and Paradise easy to trust?

If the organic treatment obscures product information, it fails. If the page remains visually rigid without the shapes, it also fails.
