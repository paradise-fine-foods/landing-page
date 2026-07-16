# Client-review demo content replacement ledger

**Status:** pre-production replacement register

**Scope:** the complete client-review MVP as implemented on 2026-07-16

**Authoritative implementation sources:** `src/lib/cms/demo-data.ts`, `src/lib/i18n/ui.ts`, `src/lib/enquiry/submit.ts`, `src/assets/demo/`, `public/models/`, and `astro.config.mjs`

No business claims in this MVP are verified. Every product, brand, category relationship, origin, specification, operational statement, service promise, contact prompt, and visual is fictional or review-only until the acceptance requirement in this ledger is met. Nothing here is launch approval.

## Release rule and ownership

| Inventory | Production owner | Source/input | Acceptance |
|---|---|---|---|
| Company identity, proposition, service and distribution claims | Paradise business owner + legal reviewer | Signed company fact sheet, approved positioning and substantiation for every operational claim | Named owner approves English and Vietnamese copy; legal reviewer confirms claims and usage rights |
| Products, categories and technical facts | Paradise product/data owner | Export from the production catalog or headless CMS, with source documents from each producer | IDs and locale routes resolve; required fields are complete; specifications match signed producer documents |
| Brands, origins, stories and relationships | Paradise brand/partnership owner | Approved partner roster, contracts, brand kits and localized stories | Partner usage rights, naming, accent, imagery, origin and product relationships are approved in writing |
| Photography, illustration, pack art, poster and 3D | Paradise creative owner + rights reviewer | Original production files, licenses, release records, alt text and crop guidance | Rights register is complete; assets pass visual, accessibility, performance and responsive QA |
| Enquiry delivery and contact details | Paradise sales/operations owner + privacy owner | Approved offices, email/phone, retention policy, consent copy and CRM/email endpoint | End-to-end delivery succeeds; privacy review passes; monitored recipient and failure procedure are documented |
| Canonical origin and route inventory | Paradise digital owner | Final production hostname, deployment configuration and redirect map | Crawl of the deployed site has one correct canonical per page, reciprocal alternates, no broken internal links and approved redirects |

## Demo catalog inventory

All records below are defined in `src/lib/cms/demo-data.ts` and returned through the vendor-neutral functions in `src/lib/cms/queries.ts`. Production pages must continue to consume that query interface rather than importing fixtures.

### Categories

| Stable ID | Review-only localized names/slugs and copy | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `butter` | EN “Butter” / `butter`; VI “Bơ” / `bo`; professional-kitchen demo description | Product/data owner | Approved taxonomy, translations, category description and representative image | Taxonomy ID is stable; both locale names/slugs are approved; image and alt text have rights approval |
| `cream` | EN “Cream” / `cream`; VI “Kem sữa” / `kem-sua`; culinary-preparation demo description | Product/data owner | Same category package as above | Same category acceptance gate as above |
| `cheese` | EN “Cheese” / `cheese`; VI “Phô mai” / `pho-mai`; foodservice demo description | Product/data owner | Same category package as above | Same category acceptance gate as above |
| `pastry` | EN “Pastry” / `pastry`; VI “Bánh ngọt” / `banh-ngot`; pastry-workflow demo description | Product/data owner | Same category package as above | Same category acceptance gate as above |

### Brands

| Stable ID | Review-only localized identity, origin and relationships | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `maison-laitiere` | “Maison Laitière” / “Nhà Sữa Maison”; slugs `maison-laitiere` / `nha-sua-maison`; fictional European origin; butter/pastry products; demo `butter` accent | Brand/partnership owner | Approved legal name, translations, story, origin, logo/pack image, partner rights, product mapping and contrast-safe accent | Partner approves both locales and relationships; rights and contrast checks pass |
| `atelier-creme` | “Atelier Crème” / “Xưởng Kem”; slugs `atelier-creme` / `xuong-kem`; fictional alpine origin; cream/cheese/pastry products; demo `bordeaux` accent | Brand/partnership owner | Same complete brand package as above | Same brand acceptance gate as above |
| `formagerie-nord` | “Formagerie Nord” / “Xưởng Phô Mai Bắc”; slugs `formagerie-nord` / `xuong-pho-mai-bac`; fictional northern origin; cheese products; demo `cold-chain` accent | Brand/partnership owner | Same complete brand package as above | Same brand acceptance gate as above |

### Products and specifications

Every product also contains fictional localized descriptions and alt text, category/brand relationships, application and audience tags, storage label, benefits and featured state.

| Stable ID | Review-only names/slugs/specifications and claims | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `cultured-butter-sheet` | “Cultured Butter Sheet” / “Bơ lát mẫu”; slugs `cultured-butter-sheet` / `bo-lat-mau`; Maison Laitière; butter + pastry; fictional European origin; demo 1 kg sheet; 2–6 °C; lamination/viennoiserie; bakery/hotel/restaurant; fictional handling and pastry benefits; featured | Product/data owner + producer | Signed specification sheet, pack art, origin evidence, storage/shelf-life rules, applications, audience, benefits and translations | Every displayed value matches producer-approved evidence; both routes and enquiry selection pass QA |
| `whipping-cream-35` | “Whipping Cream 35 Demo” / “Kem đánh bông mẫu”; slugs `whipping-cream-35` / `kem-danh-bong-mau`; Atelier Crème; cream + pastry; fictional alpine origin; demo 1 L carton; 2–6 °C; whipping/sauces; bakery/hotel/restaurant; fictional stable-whip claim; featured | Product/data owner + producer | Same complete product package as above | Same product acceptance gate as above |
| `mascarpone-tub` | “Mascarpone Demo Tub” / “Mascarpone hộp mẫu”; slugs `mascarpone-tub` / `mascarpone-hop-mau`; Atelier Crème; cheese + pastry; fictional alpine origin; demo 500 g tub; 2–6 °C; tiramisu/desserts; bakery/hotel/restaurant; fictional creamy-texture claim | Product/data owner + producer | Same complete product package as above | Same product acceptance gate as above |
| `cream-cheese-block` | “Cream Cheese Demo Block” / “Phô mai kem khối mẫu”; slugs `cream-cheese-block` / `pho-mai-kem-khoi-mau`; Formagerie Nord; cheese; fictional northern origin; demo 1 kg block; 2–6 °C; cheesecake/spreads; bakery/hotel/restaurant; fictional blending claim | Product/data owner + producer | Same complete product package as above | Same product acceptance gate as above |
| `mozzarella-shred` | “Mozzarella Demo Shred” / “Mozzarella sợi mẫu”; slugs `mozzarella-shred` / `mozzarella-soi-mau`; Formagerie Nord; cheese; fictional northern origin; demo 2 kg bag; 2–6 °C; pizza/baking; hotel/restaurant/catering; fictional melt claim | Product/data owner + producer | Same complete product package as above | Same product acceptance gate as above |
| `unsalted-butter-block` | “Unsalted Butter Demo Block” / “Bơ nhạt khối mẫu”; slugs `unsalted-butter-block` / `bo-nhat-khoi-mau`; Maison Laitière; butter; fictional European origin; demo 1 kg block; 2–6 °C; baking/cooking; bakery/hotel/restaurant/catering; fictional versatile-use claim | Product/data owner + producer | Same complete product package as above | Same product acceptance gate as above |

## Global, marketing and interface copy

`src/lib/cms/demo-data.ts` contains the review-only site names/descriptions/notices plus hero and editorial copy. `src/lib/i18n/ui.ts` contains every English/Vietnamese interface string. The following inventory names every copy family and the business content it exposes.

| Copy family | Review-only content inventory | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `demoGlobalSettings` | “Paradise Fine Foods Demo” / “Thực Phẩm Paradise Bản Mẫu”, review-only foodservice description and fiction notice | Brand owner + legal reviewer | Approved company naming, site description and mandatory demo/production notices | Exact bilingual proof approval and metadata review |
| `demoFeaturedContent.hero` | Pastry-demo eyebrow, “Ingredients shaped for thoughtful menus”, Vietnamese equivalent, design-review body, featured product relationship and image alt | Marketing owner + product owner | Approved campaign/editorial copy, featured record and licensed visual | Both locales approved; relationship exists in CMS; metadata and alt QA pass |
| `demoFeaturedContent.editorial` | “Built around the professional table”, Vietnamese equivalent, stakeholder-review body and still-life alt | Marketing owner + creative owner | Approved editorial story and licensed visual | Bilingual editorial and rights approval |
| `ui.*.hero` | Cold-chain eyebrow; “Exceptional ingredients. Delivered with confidence.” and Vietnamese counterpart; careful-handling/service proposition; 2–6 stage code; stage labels/statuses and CTAs | Business owner + legal + UX/content | Substantiated value proposition, confirmed temperature scope, approved CTA and accessibility copy | Claim evidence attached; bilingual content and accessible-state review pass |
| `ui.*.home.operationalPillars` | Selected portfolio, cold-chain care, channel support and nationwide Vietnam delivery; all descriptions and Vietnamese counterparts | Operations owner + legal | Service-level evidence, actual coverage, handling process and approved translations | Each statement maps to current operational evidence; legal and operations sign off |
| `ui.*.home` discovery/featured/service | Category, product, producer, cold-chain and service headings/descriptions; “2—6 °C / MONITORED” and Vietnamese counterpart | Marketing + operations + product owners | Approved campaign copy, monitoring evidence and catalog taxonomy | Bilingual proof approval; service temperature applies to displayed context |
| `ui.*.home.channels` | Retail, HORECA, Bakery & Pastry and E-commerce names plus shelf-ready, replenishment, format, guidance, performance and online-handling statements | Channel sales owners + legal | Channel offer sheets and supporting service evidence | Each channel owner and legal reviewer approve both locale variants |
| `ui.*.home.finalCta` | Ingredient-finding/team follow-up invitation and PFF sales-line labels | Sales owner + content owner | Approved lead proposition and response workflow | Wording matches staffed production process and approved locale proof |
| `ui.*.catalog`, `ui.*.product`, `ui.*.brand` | All catalog labels, search/filter/empty states, application names, metadata labels, benefit/audience/enquiry labels, producer-story labels and fiction notes | Product/data owner + UX/content | Final taxonomy, localized vocabulary, product/brand editorial policy | Every key has approved EN/VI text; no raw key or missing value renders |
| `ui.*.form`, `ui.*.status`, `ui.*.validation` | All field labels/options, required/consent/privacy statements, no-delivery notices, submission/error/success messages and reference label | Sales operations + privacy/legal + UX/content | Production data-flow map, consent basis, retention text, error states and localized copy | Privacy approval and end-to-end accessibility/delivery QA pass |
| `ui.*.header`, `ui.*.footer`, `ui.*.notFound` | Navigation, language, footer tagline/legal/copyright and locale-specific missing-page labels | Brand/legal + UX/content | Approved information architecture, legal footer and bilingual copy | Link crawl, language proof and legal approval pass |
| `src/pages/404.astro` | Self-contained bilingual missing-page title, explanations, review label and direct destinations | UX/content + digital owner | Approved bilingual 404 copy and route inventory | English/Vietnamese proof; all four direct links return 200; no locale guessing |

## Contact details and enquiry delivery

No office address, business email address or telephone number is published in this MVP. The contact pages contain visitor-input fields named company, email and phone; those are not Paradise contact facts. The generic “contact our team” and response/follow-up statements are review-only promises owned by Sales Operations.

`src/lib/enquiry/submit.ts` is a demo adapter. It validates in-browser input, waits 350 ms, creates a local `PFF-…` success reference and returns `{ ok, reference, message, receivedAt, demo }`. It does not send or deliver an email, call a CRM, persist a record or expose a submission endpoint.

| Boundary | Production owner | Source/input | Acceptance |
|---|---|---|---|
| `src/lib/enquiry/submit.ts` | Sales operations + engineering + privacy owner | Authenticated production endpoint, request/response contract, spam protection, retry/failure policy, audit/retention policy and monitored destination | Staging delivery reaches the approved owner; failure is observable; security/privacy/accessibility reviews pass; `demo` behavior is removed |
| Contact details (currently absent) | Paradise business owner + legal | Verified office names/addresses, service regions, monitored email and phone details | Owner confirms current details; legal/privacy approve publication; link and call tests pass |

## Authored demo media and temporary 3D

| Asset | Review-only role | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `src/assets/demo/editorial-table.svg` | Original unbranded abstract kitchen still life used by editorial/service proof | Creative owner + rights reviewer | Approved commissioned image, crops, alt text, author and license/release record | Rights register complete; art direction, responsive crops, alt and performance pass |
| `src/assets/demo/product-stage.svg` | Original unbranded geometric pack stage reused for categories, brands and all product cards/details | Creative owner + product/brand owners | Approved category art plus distinct accurate brand/product pack imagery | No demo reuse remains; each mapped record has approved image, crop, dimensions and alt |
| `src/assets/demo/hero-poster-desktop.svg` | Original 1600×1000 poster-first hero fallback | Creative owner | Approved hero/package poster matching the production GLB | Desktop crop, color accuracy, fallback, rights and performance QA pass |
| `src/assets/demo/hero-poster-mobile.svg` | Original 800×1000 narrow hero fallback | Creative owner | Approved mobile art direction matching desktop poster and GLB | 390 px visual/overflow review, alt relationship, rights and performance QA pass |
| `public/models/demo-package.glb` | Temporary Khronos BoxTextured sample loaded from `/models/demo-package.glb` | Creative/3D owner + rights reviewer | Approved optimized Paradise package GLB, texture sources, license/ownership and poster pairing | Visual accuracy, ≤180 KB compressed lazy runtime budget, fallback, reduced-motion, data-saving, WebGL failure and rights QA pass |
| `public/models/README.md` | Provenance record for the temporary GLB | Rights reviewer | Upstream source and license are already recorded; replace with the production asset provenance record | Production source, author, ownership/license, export settings and approval date are documented |

The temporary GLB provenance is recorded in `public/models/README.md`: KhronosGroup glTF-Sample-Assets, BoxTextured GLB, retrieved 2026-07-16, with its upstream license URL. The model and both posters must be replaced as one approved visual set.

## Demo origins, URLs and route inputs

| URL/input | Review-only use | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `https://demo.paradisefinefoods.com` | `astro.config.mjs` site origin and canonical/Open Graph base; duplicated only as a defensive fallback in `src/layouts/SiteLayout.astro` and `src/pages/404.astro` | Digital owner | Final HTTPS production hostname and environment/deployment configuration | Deployment crawl confirms the expected host in every canonical/Open Graph URL; demo hostname is absent from production output |
| `/models/demo-package.glb` | Public model URL consumed by both localized homepages | Creative/3D owner | CMS/CDN URL or versioned production public asset | URL returns the approved GLB with correct caching/content type; failure fallback still passes |
| `/en/`, `/vi/`, `/en/products/`, `/vi/san-pham/` | Direct bilingual recovery URLs on the 404 | Digital owner + content owner | Approved localized route map | All links return 200 and remain correct in deployed base-path configuration |
| `?category={localized-category-slug}` | Category discovery URL state | Product/data owner | Stable localized category slug inventory | Each generated link filters to a non-empty intended set; invalid input degrades to full catalog |
| `?interest=retail`, `?interest=horeca`, `?interest=bakery`, `?interest=ecommerce` | Homepage channel-to-enquiry paths in both locales | Channel sales owners | Approved interest taxonomy and CRM mapping | Each value preselects the intended localized option and reaches the production field mapping |
| `?product={product-id}` | Product-detail-to-enquiry context; IDs are the six product IDs listed above | Product/data owner + sales operations | Stable CMS product identifier and production endpoint mapping | Known IDs preselect correctly; unknown values are ignored; submitted context reaches the approved system |

SVG namespace URLs and Astro/documentation links are technical identifiers, not business destinations. The external Khronos source/license URLs are provenance records and must remain with the temporary model until that model is removed.

## Production cutover checklist

- Replace the local default CMS data behind the stable query functions; do not bind page components to a CMS SDK.
- Reconcile this ledger against the final CMS export so every stable record, string family, visual and URL has an owner and approval record.
- Replace all four authored demo SVGs and the GLB/poster set with approved, rights-cleared media.
- Connect `submitEnquiry()` to reviewed delivery and remove success-only demo behavior after privacy/security acceptance.
- Set the final site origin, crawl every generated route, and verify canonicals, locale alternates, internal links and redirects.
- Obtain explicit English/Vietnamese business, legal, product, partnership, creative, privacy and accessibility approvals before launch.
