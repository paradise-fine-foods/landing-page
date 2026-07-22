# Paradise Fine Foods Industrial Styling Design

**Date:** 2026-07-22

**Status:** Approved for implementation

**Scope:** Styling-only visual redesign of the existing bilingual Astro application

## 1. Objective

Simplify the Paradise Fine Foods interface into a restrained industrial system while preserving the application's current structure, content, component boundaries, responsive composition, routes, and interactions.

The redesign retains the Paradise logo and orange identity. It removes the competing multicolor organic language and replaces it with precise geometry, neutral surfaces, disciplined spacing, and specification-led hierarchy.

## 2. Audit Findings

The current interface is functionally coherent but visually over-articulated.

- The global token system exposes five bright brand accents: orange, tangerine, blue, green, and coral.
- Organic masks, petal marks, asymmetric radii, shadows, tinted surfaces, and decorative Canvas output recur across the hero, catalog, brand, blog, form, and service components.
- The homepage contains ten sections and measures approximately 8,282px at a 1280px desktop viewport and 11,182px at a 390px mobile viewport in the audited production build.
- The floating enquiry rail competes with hero metadata, catalog filters, and form content when expanded.
- Catalog and enquiry surfaces inherit expressive styling that weakens their task-focused clarity.
- The underlying Astro structure, localization, content queries, accessibility relationships, routes, and build contracts are sound and do not require redesign.

## 3. Binding Scope Constraints

This is a styling-only redesign.

The implementation must preserve:

- All ten homepage sections in their current order.
- Every existing public route and localized route pair.
- Existing Astro component boundaries and page composition.
- Existing content, labels, metadata, and CMS query behavior.
- Existing navigation, carousel, filter, form, language-switching, and floating-rail interactions.
- Existing responsive layout behavior unless a CSS correction is required to prevent overflow or obstruction.
- Existing semantic HTML and accessibility relationships.

The implementation must not:

- Merge, remove, add, or reorder homepage sections.
- Replace components with a new information architecture.
- Change business logic, content data, route generation, or interaction controllers.
- Remove the floating enquiry rail or carousel.
- Introduce a new font family, icon system, framework, dependency, or JavaScript enhancement.
- Use the redesign as justification for unrelated refactoring.

Decorative organic marks and Canvas output may be visually suppressed with CSS because they are presentation-only. Their surrounding markup and controller contracts remain unchanged.

## 4. Design Direction: Precision Supply System

The visual language comes from Paradise's operating environment: stainless preparation surfaces, refrigerated handling labels, case specifications, product packaging, and the movement of ingredients from producer to professional kitchen.

The interface remains light and food-compatible. Industrial character comes from alignment, technical information, consistent media stages, thin rules, and restrained color rather than a dark warehouse aesthetic.

### 4.1 Palette

| Role | Name | Value | Use |
| --- | --- | --- | --- |
| Primary surface | Process white | `#FFFFFF` | Product, form, and reading surfaces |
| Page surface | Cold paper | `#F5F6F2` | Body background and alternating sections |
| Rules | Brushed steel | `#D9DCD7` | Borders, dividers, inactive controls |
| Primary ink | Graphite | `#202522` | Text, footer, primary controls |
| Secondary ink | Utility grey | `#68706A` | Supporting copy and metadata labels |
| Brand accent | Paradise orange | `#E46F2C` | Primary actions, active states, focus support, specification datum |

Color rules:

- Paradise orange is the only recurring brand accent.
- Orange should occupy a small visual area and must not become a full-section background.
- Existing blue, green, coral, tangerine, mist-blue, and deep-herb presentation roles are remapped to the neutral system.
- Product photography, packaging, partner logos, and approved brand artwork retain their authentic colors.
- Success uses `#356146` and error uses `#9A3F38`, only when the corresponding state is present.
- No gradients, metallic simulation, translucent color washes, or decorative color-mixing fields.

### 4.2 Typography

The existing two-family stack remains.

- `Newsreader` is reserved for H1 and major H2 editorial headlines.
- `Nunito` is used for navigation, body text, buttons, filters, forms, card titles, H3/H4 headings, captions, and technical metadata.
- Hero and section headings use a smaller, tighter scale than the current implementation.
- Interface labels may use uppercase only when they identify genuine technical fields such as origin, storage, or pack format.
- Metadata uses consistent label/value alignment and tabular numerals where supported.
- Long copy remains left-aligned with readable measures; no long centered paragraphs are introduced.

### 4.3 Geometry and Depth

- Standard corner radius: `0` to `4px`.
- Pill geometry is permitted only for true status indicators, not for general controls or cards.
- Organic masks and oversized asymmetric radii are visually removed.
- Product, brand, article, and editorial media use rectangular stages with consistent aspect ratios.
- Decorative box shadows and drop shadows are removed.
- Separation comes from whitespace, surface contrast, and 1px rules.
- Primary buttons may use a 1px orange border; secondary buttons use a graphite or steel border.

### 4.4 Spacing

- Retain the existing spacing-token approach but tighten the upper end of the scale.
- Reduce oversized section padding while preserving clear separation between the ten homepage sections.
- Reduce card-internal gaps and decorative empty space before reducing readable text spacing.
- Maintain minimum 44px touch targets and sufficient space around focus outlines.
- No page-height target overrides the binding requirement to retain all content and sections.

### 4.5 Signature Element

The signature device is a cold-chain specification band: a thin Paradise-orange datum attached to aligned product facts such as brand, origin, pack format, and storage temperature.

The band encodes operational information. It appears only where specification data is present and does not become a decorative rule on unrelated content.

## 5. Component Styling

### 5.1 Header and Footer

- Preserve the current logo, navigation links, language switcher, mobile menu, and layout structure.
- Reduce visual weight through tighter height, neutral borders, and quieter navigation typography.
- Keep the header surface opaque and light.
- Style the footer as a compact graphite field with cold-paper text, steel rules, and restrained orange focus/hover accents.

### 5.2 Floating Enquiry Rail

- Preserve its markup, three destinations, toggle behavior, responsive placement, and accessibility attributes.
- Reduce panel width, shadow, and decorative clipping.
- Use a rectangular graphite toggle, white/cold-paper panel, steel dividers, and one thin orange datum.
- Ensure the collapsed control remains discoverable without dominating the page.
- Ensure the expanded panel does not cover essential controls at 390px and 1280px viewport widths.

### 5.3 Living Hero

- Preserve the two-column desktop composition, mobile stack, copy, actions, product image, metadata, caption, and enhancement markup.
- Replace the mist-blue art field with a neutral rectangular product stage.
- Visually suppress organic marks and decorative Canvas output.
- Use the cold-chain specification band for the existing four metadata items.
- Reduce headline size and decorative empty space while retaining the current content hierarchy.
- Keep both current calls to action.

### 5.4 Credibility Strip

- Preserve its title and pillar list.
- Replace organic bullets with restrained square or rule markers.
- Use a compact single-row desktop treatment and the existing responsive wrap/stack behavior.

### 5.5 Category Discovery

- Preserve its heading, description, category set, counts, links, and grid structure.
- Replace organic media masks with rectangular stages.
- Remove multicolor category marks and use neutral rules with orange interaction states.

### 5.6 Featured Products

- Preserve the carousel, controls, viewport, product order, and accessibility behavior.
- Restyle controls as compact rectangular buttons.
- Use rectangular product media, consistent metadata bands, and a quiet scrollbar treatment.
- Do not convert the carousel into a static grid.

### 5.7 Featured Brands

- Preserve the selected-brand story, selected products, remaining-brand list, and responsive layout.
- Remove organic story masks, colored marks, and decorative accent variation.
- Authentic brand and product artwork remains full color inside neutral frames.

### 5.8 Latest Blogs

- Preserve the lead/compact card composition and number of posts.
- Replace special corner treatments and tinted copy fields with consistent rectangular cards and steel rules.
- Keep image ratios, headings, metadata, and links unchanged.

### 5.9 Partner Strip

- Preserve its heading and partner list.
- Present logos on a neutral field with consistent optical sizing and minimal dividers.
- Do not recolor approved partner logos.

### 5.10 Service Proof

- Preserve the editorial image, temperature label, journey graphic, pillars, and layout.
- Remap the section to cold paper/process white.
- Simplify the journey line and cards to steel/graphite with a restrained orange operational path.
- Remove organic image masks and green status dots used as decoration.

### 5.11 Channel Pathways

- Preserve the four channel links and grid.
- Replace large rounded colored cards with rectangular ruled panels.
- Use typography, spacing, and arrow alignment rather than alternating fills for distinction.

### 5.12 Final CTA

- Preserve its copy, link, and layout.
- Replace the large tinted organic container with a rectangular graphite panel and cold-paper text.
- Use one orange datum and one primary action.

### 5.13 Catalog and Product Detail

- Preserve filtering behavior, controls, result summary, product grid, empty state, product-detail composition, metadata, related products, and enquiry links.
- Restyle filters as a flat specification toolbar without a tinted rounded container.
- Use rectangular product stages and consistent technical metadata alignment.
- Keep the existing responsive column counts and sticky behavior.

### 5.14 Brands and Blogs

- Preserve all index/detail structures, page hierarchy, localization, content, and links.
- Remove per-brand colored page fields and organic card geometry.
- Retain authentic logos, packaging, and article images in full color.
- Use the shared neutral cards, type hierarchy, and rule system.

### 5.15 Enquiry Forms

- Preserve every field, mode, validation message, submission behavior, noscript state, and accessibility relationship.
- Remove the floating white-card effect, oversized asymmetric corners, and decorative shadow.
- Use a flat two-column field grid, 4px controls, steel borders, and direct field feedback.
- Preserve the current responsive single-column behavior.

### 5.16 404 Page

- Preserve its localized links, landmarks, and content.
- Remove visible organic marks and adopt the same neutral surfaces, squared action treatment, and specification rules.

## 6. Interaction and Motion

- Existing interaction controllers and functional behavior remain unchanged.
- CSS transitions are limited to interaction feedback and should not exceed 160ms.
- Hover and focus states use border, underline, or small color changes without lift, scale, glow, or shadow effects.
- Existing reveal targets remain structurally present, but CSS must not make content dependent on reveal animation.
- Decorative Canvas output is hidden visually.
- Reduced-motion behavior remains supported.

## 7. Accessibility and Responsive Requirements

- Meet WCAG AA contrast for text and controls.
- Retain visible keyboard focus on every interactive element.
- Maintain logical source and tab order.
- Maintain 44px minimum touch targets.
- Verify no horizontal overflow at 390px.
- Verify the floating rail does not obscure essential content or controls at 390px and 1280px viewport widths.
- Verify English and Vietnamese headings and labels fit without clipping or forced scale reduction.
- Preserve screen-reader names, landmarks, field relationships, and carousel announcements.

## 8. Implementation Boundaries

Expected work is concentrated in:

- Global design tokens, typography, and reset styles.
- Component-scoped Astro style blocks.
- Styling contract tests and built-output verifiers that currently require superseded colors, radii, organic presentation, or decorative motion.

Markup, TypeScript, data queries, route helpers, CMS data, and controller logic should remain unchanged unless a test proves that a CSS-only correction cannot satisfy an approved accessibility requirement. Any such exception requires explicit user approval before implementation.

## 9. Verification Plan

### Automated

- Run the full Bun test suite.
- Run `astro check` through the existing package script.
- Run the production build and every existing built-output verifier.
- Update design contract tests to assert the approved neutral palette, radius limits, retained homepage section order, retained carousel and floating rail, and suppressed decorative presentation.
- Confirm route count, localization, form behavior, filter behavior, and interaction contracts remain unchanged.

### Rendered audit

Inspect at minimum:

- English and Vietnamese homepages.
- Product index and one product detail page.
- Brand index and one brand detail page.
- Blog index and one article page.
- General enquiry form and one mode-specific enquiry form.
- Localized 404 page.

Viewports:

- Desktop: 1280px wide.
- Mobile: 390px wide.

For each representative surface, verify palette restraint, typography, rectangular geometry, focus visibility, no horizontal overflow, no essential content hidden by the rail, and unchanged content/interaction structure.

## 10. Acceptance Criteria

The redesign is complete when all of the following are true:

- The Paradise logo and orange remain recognizable.
- Orange is the only recurring non-semantic interface accent.
- Organic masks, multicolor decorative marks, decorative Canvas output, oversized radii, gradients, and decorative shadows are no longer visible.
- Cards, controls, media stages, and panels use a consistent `0–4px` radius system, except true status indicators.
- Existing homepage section count, order, and content are unchanged.
- Existing routes, localized content, carousel, filters, forms, language switching, and floating rail still work.
- The floating rail does not obscure essential content at audited viewports.
- Product and operational metadata use the approved specification-led hierarchy.
- Both locales remain legible and responsive at 1280px and 390px viewport widths.
- Automated checks and production build verifiers pass.
- Rendered review confirms a quieter, minimal, food-compatible industrial character across all representative templates.

## 11. Self-Critique

A neutral light palette with one orange accent can drift into a generic industrial template. The design avoids that by grounding its signature in Paradise's real product metadata and cold-chain role, retaining food and packaging color inside precise neutral stages, and preserving Newsreader only where editorial warmth benefits the subject.

The redesign also resists structural simplification because the approved constraint is styling-only. Visual density is reduced through spacing, geometry, color, and hierarchy rather than by deleting or merging content.
