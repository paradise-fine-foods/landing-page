# Paradise Fine Foods Client-Review MVP Design

**Date:** 2026-07-16  
**Status:** Approved design, pending written-spec review  
**Source of truth:** `DESIGN.md`

## Purpose

Build a production-quality vertical slice of the Paradise Fine Foods website that is complete enough to review visual direction, responsive styling, motion, catalog UX, and bilingual behavior with the client. This is not the complete first-release catalog. It establishes the reusable architecture and presentation system that the full public launch will extend.

The MVP uses clearly identified demo content and temporary media. Demo records must be realistic enough to exercise the interface but must not be presented as verified Paradise business or product claims.

## Success Criteria

The MVP is successful when a client can navigate representative English and Vietnamese experiences, evaluate the Cold-Chain Atelier visual direction, interact with the product catalog and 3D hero, submit a demo enquiry, and review the experience at desktop and mobile widths.

The implementation must also demonstrate that:

- Page components do not depend directly on local fixture data.
- A future headless CMS can replace the default data source behind stable query interfaces.
- Core pages render statically and remain useful without client-side JavaScript.
- Interactive enhancements fail safely and respect accessibility preferences.
- The design follows `DESIGN.md` rather than the legacy Paradise website.

## Scope

### Included routes

- `/` redirects to `/en/`.
- `/en/` and `/vi/` localized homepages.
- Localized product indexes with search and filtering.
- Representative localized product-detail routes generated from demo data.
- Localized brand indexes and representative brand-detail routes.
- Localized contact and product-enquiry pages.
- A useful localized 404 experience.

The language switcher preserves the current content route when a translated counterpart exists and otherwise links to the matching locale homepage. All included page chrome, metadata, validation messages, empty states, and success states must exist in both English and Vietnamese.

### Deferred from this vertical slice

- The complete product, brand, solution, story, and event inventory.
- A production headless CMS connection and editorial preview workflow.
- Verified company claims, office details, product specifications, and partner assets.
- Production enquiry delivery, CRM integration, or email integration.
- The approved production GLB and final package artwork.
- Advanced search, protected documents, accounts, ordering, pricing, and checkout.

These deferrals narrow the review dataset and integrations, not the quality of the implemented architecture or interaction states.

## Architecture

Astro remains in static output mode. Pages use Astro components and server-rendered HTML by default. Dynamic product and brand routes are generated at build time from the vendor-neutral query layer.

The implementation must consult current official Astro documentation through the Astro docs MCP before making framework-specific decisions. The project `AGENTS.md` also requires Context7 for current library and framework documentation. In particular, route generation, responsive images, content loading, client directives, localization behavior, and build configuration must follow the current Astro version rather than remembered APIs.

Suggested structure:

```text
src/
├── components/
│   ├── catalog/
│   ├── forms/
│   ├── global/
│   ├── navigation/
│   └── sections/
├── layouts/
├── lib/
│   ├── cms/
│   ├── i18n/
│   ├── seo/
│   └── validation/
├── pages/
│   ├── en/
│   └── vi/
├── styles/
└── assets/
```

Components should have explicit responsibilities. The MVP must not introduce a universal section component with many unrelated switches.

## Vendor-Neutral Content Boundary

Page components and route files call typed functions in `src/lib/cms/`. They must not import fixture arrays directly.

The public interface includes these functions (additional private helpers are allowed):

```text
getGlobalSettings(locale)
getCategories(locale)
getProducts(locale, query?)
getProductBySlug(locale, slug)
getBrands(locale)
getBrandBySlug(locale, slug)
getFeaturedContent(locale)
submitEnquiry(input)
```

The initial adapter returns local demo records. A future CMS adapter will implement the same behavior and return the same normalized domain types. CMS-specific response shapes, SDK clients, pagination objects, and asset structures must not leak into page components.

Demo data covers enough variation to validate the UI: multiple brands and categories, at least one professional-format product, localized slugs and descriptions, storage metadata, applications, featured states, and both populated and empty filter outcomes.

`submitEnquiry()` validates normalized input and returns structured demo success data. The form UI must still implement idle, submitting, field-error, general-error, and success states.

## Visual System

The MVP implements the Cold-Chain Atelier system from `DESIGN.md`:

- Milk-paper and paper-white surfaces dominate.
- Cold-chain blue and carbon provide structure and text.
- Cultured-butter is the primary controlled accent.
- Bordeaux is reserved and does not appear merely for variety.
- Newsreader is used for editorial display type.
- Be Vietnam Pro is used for body, interface, and technical text.
- Fine rules, precise grids, generous whitespace, clean product stages, and ingredient apertures create the visual character.

Typography, spacing, colors, focus styles, radii, content widths, and transitions are represented as shared tokens. The visual system must remain coherent with animation disabled.

The representative partner-brand detail page introduces one demo accent in declared roles while retaining Paradise typography, layout, navigation, and interaction colors.

## Page Composition

### Homepage

The homepage contains:

1. Bilingual header with a compact desktop navigation and accessible mobile disclosure.
2. Featured-product hero with headline, proposition, metadata rail, two CTAs, poster, and lazy 3D enhancement.
3. Compact credibility strip.
4. Category discovery.
5. Featured products and brands.
6. Distribution and service proof.
7. Retail, HORECA, Bakery & Pastry, and E-commerce pathway summaries.
8. Final enquiry CTA.
9. Structured bilingual footer.

### Product index

The index begins with a concise catalog introduction followed by search and filters for representative category, brand, and application values. Product cards emphasize pack image, brand, category, origin, storage, and format. The result count is visible and announced to assistive technology. A zero-result state explains what happened and offers a reset action.

### Product detail

The detail view pairs a clean product stage with localized name, brand, origin, pack and storage metadata, professional benefits, application information, and a direct enquiry action. Breadcrumbs and a small related-product area demonstrate catalog depth without expanding the dataset unnecessarily.

### Brand pages

The brand index provides concise, visually consistent entry points. A representative detail page includes origin, story, approved demo accent treatment, relevant product categories, and linked products.

### Contact and enquiry

The contact page prioritizes sales intent. The enquiry form includes localized labels, explicit required fields, consent, associated validation errors, and an accessible success confirmation returned by the demo adapter.

## Interaction and Motion

Client-side JavaScript is limited to interactions that require it:

- Mobile navigation disclosure.
- Product filtering and result announcements.
- Enquiry form state.
- Lazy 3D stage enhancement.

The temporary 3D product model is a real GLB asset rendered by a documented browser runtime. It is loaded only after the essential hero content is available. The server-rendered poster, product metadata, and CTAs remain present before, during, and after enhancement.

3D motion is constrained to a gentle idle loop and a small pointer-driven rotation range. There is no autoplay camera flight, continuous fast spin, or interaction required to understand the product. Reduced-motion mode disables nonessential movement. Data-saving preference, failed model loading, unavailable WebGL, or runtime failure leaves the poster experience intact.

Other transitions are short and functional: navigation disclosure, filter state, focus, hover, and form feedback. The site must not add scroll animation to every section.

## Responsive Behavior

Desktop layouts use deliberate editorial splits and generous whitespace. Tablet composition is adjusted rather than merely scaled down. Mobile layouts prioritize product, proposition, technical metadata, and actions in that order.

At `390px` width:

- Navigation remains keyboard and touch accessible.
- Hero copy and product stage do not overflow.
- Product filters use an understandable compact pattern.
- Technical metadata remains scannable.
- Buttons retain useful target sizes.
- English and Vietnamese copy do not collide or truncate essential meaning.

## Accessibility and Failure States

The target is WCAG 2.2 AA for the implemented slice. Requirements include semantic landmarks, correct heading order, a skip link, visible focus, keyboard-operable navigation and filters, programmatically associated form errors, descriptive alt text, decorative empty alt attributes, adequate contrast, no color-only meaning, and locale-correct `lang` attributes.

JavaScript enhancement must not remove usable server-rendered navigation or content. Filter and form scripts must handle missing elements safely. The 3D stage exposes an accessible textual alternative and never becomes the only route to a CTA.

## SEO and Localization

Each included page has a localized title and description, canonical URL, English/Vietnamese alternate links, Open Graph metadata, and an intentional heading structure. Product and organization structured data are omitted from the demo MVP so unverified records cannot be mistaken for production claims; their normalized generators are deferred until verified data is available.

Localized route mapping is explicit so the language switcher can preserve product and brand pages. Official product and brand names may remain unchanged, while descriptions, UI, metadata, errors, and calls to action are localized.

## Testing and Review

Automated verification includes:

- Type checking and an Astro production build.
- Unit tests for locale helpers, route counterpart mapping, normalized CMS query contracts, product filtering, and enquiry validation/submission results.
- Assertions that both locale route families are generated.

Browser verification includes:

- Desktop and `390px` mobile review.
- English and Vietnamese page checks with real-length demo copy.
- Keyboard navigation, focus visibility, mobile menu behavior, filtering, zero results, form errors, and success state.
- Reduced-motion behavior and 3D poster fallback.
- Core-content review with JavaScript unavailable.
- Console error review and basic overflow checks.

The MVP is ready for client review only when the build passes and representative pages have been visually checked in a browser. Temporary demo content and assets must be labeled in code and documentation so they cannot be mistaken for launch-approved material.

## Non-Goals and Guardrails

- Do not copy markup, styling, layout, scripts, or interaction patterns from the legacy Paradise website.
- Do not add a hero carousel, looping background video, glassmorphism, fake commerce, decorative gold, or pervasive scroll animation.
- Do not introduce a framework island when a small isolated browser script is sufficient.
- Do not add CMS-vendor dependencies to the MVP.
- Do not hard-code content records inside page templates.
- Do not claim that demo product facts, partner rights, offices, or distribution proof are verified.

## Expansion Path

After client approval, the vertical slice expands toward the complete first-release contract by replacing the default adapter, importing verified localized records and media, adding the remaining route families and page inventories, connecting production enquiry delivery and analytics, substituting the approved GLB/poster, and completing redirect and SEO migration work. These changes extend the established interfaces rather than replace the MVP architecture.
