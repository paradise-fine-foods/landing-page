# Client-review demo content replacement ledger

**Status:** pre-production replacement register

**Scope:** the complete client-review MVP as implemented on 2026-07-16

**Authoritative implementation sources:** `src/lib/cms/demo-data.ts`, `src/lib/i18n/ui.ts`, `src/lib/enquiry/submit.ts`, `src/assets/demo/`, top-level `public/` favicon files, and `astro.config.mjs`

No business claims in this MVP are verified. Every product, brand, category relationship, origin, specification, operational statement, service promise, contact prompt, and visual is fictional or review-only until the acceptance requirement in this ledger is met. Nothing here is launch approval.

## Release rule and ownership

| Inventory | Production owner | Source/input | Acceptance |
|---|---|---|---|
| Company identity, proposition, service and distribution claims | Paradise business owner + legal reviewer | Signed company fact sheet, approved positioning and substantiation for every operational claim | Named owner approves English and Vietnamese copy; legal reviewer confirms claims and usage rights |
| Products, categories and technical facts | Paradise product/data owner | Export from the production catalog or headless CMS, with source documents from each producer | IDs and locale routes resolve; required fields are complete; specifications match signed producer documents |
| Brands, origins, stories and relationships | Paradise brand/partnership owner | Approved partner roster, contracts, brand kits and localized stories | Partner usage rights, naming, accent, imagery, origin and product relationships are approved in writing |
| Photography, illustration, pack art and decorative motion | Paradise creative owner + rights reviewer + digital owner | Original production files, licenses, release records, alt text, crop guidance and the approved lightweight motion specification | Rights register is complete; the server-rendered static Living Hero passes visual, accessibility, LCP and responsive QA; decorative Canvas 2D remains non-content and its reduced-motion and save-data gates pass |
| Enquiry delivery and contact details | Paradise sales/operations owner + privacy owner | Approved offices, email/phone, retention policy, consent copy and CRM/email endpoint | End-to-end delivery succeeds; privacy review passes; monitored recipient and failure procedure are documented |
| Canonical origin and route inventory | Paradise digital owner | Final production hostname, deployment configuration and redirect map | Crawl of the deployed site has one correct canonical per page, reciprocal alternates, no broken internal links and approved redirects |

## Demo catalog inventory

All records below are temporary demo records defined in `src/lib/cms/demo-data.ts` and returned by default through the vendor-neutral functions in `src/lib/cms/queries.ts`. Those query functions intentionally return default data for this client-review build and form the future headless-CMS integration seam. Production pages must continue to consume that interface rather than importing fixtures or binding components to a vendor SDK.

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

### Exact fixture copy and specification manifest

This manifest duplicates every review-only CMS fixture value that is not already exact in the tables above. It is intentionally machine-checked against `src/lib/cms/demo-data.ts`; adding or changing a fixture value requires updating this ledger and its replacement responsibility.

| Record | Exact English fixture values | Exact Vietnamese fixture values |
|---|---|---|
| Category `butter` | “Demo butter formats for professional kitchens.” | “Các định dạng bơ minh họa cho bếp chuyên nghiệp.” |
| Category `cream` | “Demo cream products for culinary preparation.” | “Sản phẩm kem sữa minh họa cho chế biến ẩm thực.” |
| Category `cheese` | “Demo cheese formats for foodservice teams.” | “Các định dạng phô mai minh họa cho đội ngũ dịch vụ ăn uống.” |
| Category `pastry` | “Demo ingredients selected for pastry workflows.” | “Nguyên liệu minh họa dành cho quy trình bánh ngọt.” |
| Brand `maison-laitiere` | “A fictional review-only dairy house.”; “Fictional European origin” | “Thương hiệu sữa hư cấu chỉ dùng để duyệt nội dung.”; “Nguồn gốc châu Âu hư cấu” |
| Brand `atelier-creme` | “A fictional review-only cream specialist.”; “Fictional alpine origin” | “Chuyên gia kem sữa hư cấu chỉ dùng để duyệt nội dung.”; “Nguồn gốc vùng núi hư cấu” |
| Brand `formagerie-nord` | “A fictional review-only cheese workshop.”; “Fictional northern origin” | “Xưởng phô mai hư cấu chỉ dùng để duyệt nội dung.”; “Nguồn gốc phương bắc hư cấu” |
| Product `cultured-butter-sheet` | “A fictional butter sheet created to demonstrate a pastry catalog.”; “Demo 1 kg sheet”; “Keep chilled”; “2–6 °C (demo)”; “Fictional handling benefit”; “Review-only pastry claim” | “Bơ lát hư cấu dùng để minh họa danh mục nguyên liệu bánh.”; “Tấm mẫu 1 kg”; “Bảo quản lạnh”; “Lợi ích thao tác hư cấu”; “Tuyên bố bánh ngọt chỉ để duyệt” |
| Product `whipping-cream-35` | “Fictional cream for menu concept review.”; “Demo 1 L carton”; “Keep chilled”; “2–6 °C (demo)”; “Fictional stable-whip claim” | “Kem sữa hư cấu để duyệt ý tưởng thực đơn.”; “Hộp mẫu 1 L”; “Bảo quản lạnh”; “Tuyên bố độ bông ổn định hư cấu” |
| Product `mascarpone-tub` | “Fictional mascarpone for dessert concept review.”; “Demo 500 g tub”; “Keep chilled”; “2–6 °C (demo)”; “Fictional creamy-texture claim” | “Mascarpone hư cấu để duyệt ý tưởng món tráng miệng.”; “Hộp mẫu 500 g”; “Bảo quản lạnh”; “Tuyên bố kết cấu mịn hư cấu” |
| Product `cream-cheese-block` | “Fictional cream cheese for kitchen planning.”; “Demo 1 kg block”; “Keep chilled”; “2–6 °C (demo)”; “Fictional blending claim” | “Phô mai kem hư cấu để lập kế hoạch bếp.”; “Khối mẫu 1 kg”; “Bảo quản lạnh”; “Tuyên bố phối trộn hư cấu” |
| Product `mozzarella-shred` | “Fictional shredded cheese for menu prototyping.”; “Demo 2 kg bag”; “Keep chilled”; “2–6 °C (demo)”; “Fictional melt claim” | “Phô mai sợi hư cấu để tạo mẫu thực đơn.”; “Túi mẫu 2 kg”; “Bảo quản lạnh”; “Tuyên bố độ tan chảy hư cấu” |
| Product `unsalted-butter-block` | “Fictional unsalted butter for culinary review.”; “Demo 1 kg block”; “Keep chilled”; “2–6 °C (demo)”; “Fictional versatile-use claim” | “Bơ nhạt hư cấu để duyệt ứng dụng ẩm thực.”; “Khối mẫu 1 kg”; “Bảo quản lạnh”; “Tuyên bố đa dụng hư cấu” |
| Global settings | “A review-only showcase for professional foodservice ingredients.”; “Review-only fictional content: all names, specifications, claims, and imagery are fictional.” | “Trang giới thiệu chỉ để duyệt cho nguyên liệu dịch vụ ăn uống chuyên nghiệp.”; “Nội dung hư cấu chỉ để duyệt: mọi tên gọi, thông số, tuyên bố và hình ảnh đều là hư cấu.” |
| Featured hero | “Pastry demo selection”; “Ingredients shaped for thoughtful menus”; “Explore fictional products prepared for design review.”; “Fictional featured butter presentation” | “Bộ sưu tập bánh mẫu”; “Nguyên liệu cho thực đơn chỉn chu”; “Khám phá sản phẩm hư cấu được chuẩn bị để duyệt thiết kế.”; “Trình bày bơ nổi bật hư cấu” |
| Featured editorial | “Built around the professional table”; “Original demo imagery and copy for stakeholder review.”; “Abstract professional kitchen still life” | “Được xây dựng quanh bàn bếp chuyên nghiệp”; “Hình ảnh và nội dung mẫu nguyên bản để các bên liên quan duyệt.”; “Tĩnh vật bếp chuyên nghiệp trừu tượng” |

All exact fixture values above share the product/data, brand/partnership, marketing, creative and legal owners defined by their corresponding inventory tables. Their source/input is the approved localized CMS export plus substantiating producer/operations material; acceptance requires field-by-field reconciliation and named approval in both locales.

## Global, marketing and interface copy

`src/lib/cms/demo-data.ts` contains the review-only site names/descriptions/notices plus hero and editorial copy. `src/lib/i18n/ui.ts` contains every English/Vietnamese interface string. The following inventory names every copy family and the business content it exposes.

### Parseable UI ownership manifest

The test suite recursively discovers every leaf below `ui.en` and `ui.vi`. In the manifest below, `*` matches exactly one dot-delimited path segment. Direct fields and nested fields therefore use separate rows. Every discovered leaf must match exactly one row; overlapping, stale, or missing families fail the ledger test. Each row governs both the English and Vietnamese value at that path.

<!-- ui-ownership:start -->
| UI path family | Production owner | Required production input | Acceptance |
|---|---|---|---|
| `ui.*.siteName` | Paradise brand owner and legal reviewer | Approved legal display name for each locale | Both locale values match the signed identity approval |
| `ui.*.languageName` | Localization owner and UX content owner | Approved endonym for each supported language | Switcher names are linguistically approved and unambiguous |
| `ui.*.skipToContent` | Accessibility owner and localization owner | Approved skip-link instruction in each locale | Keyboard and screen-reader review confirms purpose and pronunciation |
| `ui.*.demoNotice` | Legal reviewer and release owner | Current review or production content-status statement | Notice truthfully reflects release state in both locales |
| `ui.*.demoNoticeLabel` | Legal reviewer and UX content owner | Approved compact status label | Label remains understandable with the full notice and is locale-correct |
| `ui.*.header.*` | Digital product owner and UX content owner | Approved information architecture and navigation labels | Every header control and destination is localized and link-tested |
| `ui.*.footer.*` | Brand owner and legal reviewer | Approved footer tagline, navigation, legal and copyright copy | Brand and legal owners approve both locales and generated footer links pass |
| `ui.*.floatingRail.*` | Sales operations, localization owner and UX content owner | Approved enquiry actions, intent routing and compact control labels | The rail labels are proofed in both locales and all three contact destinations are link-tested |
| `ui.*.hero.*` | Business owner, legal reviewer and marketing owner | Substantiated proposition, product metadata labels and CTAs for the server-rendered static Living Hero | Every claim has evidence; localized heading, description, actions, metadata, alt and caption pass bilingual and accessibility review |
| `ui.*.home.*` | Marketing owner and business owner | Approved direct homepage headings, descriptions, labels and CTAs | Direct homepage copy is proofed in both locales and matches the approved page narrative |
| `ui.*.home.carousel.*` | UX content owner, localization owner and accessibility owner | Approved manual carousel label and previous/next control names | Both locale control names are concise, correctly announced and keyboard-tested |
| `ui.*.home.operationalPillars.*.*` | Operations owner and legal reviewer | Current portfolio, handling, channel-support and coverage evidence | Each pillar title and description maps to approved operational evidence |
| `ui.*.home.channels.*.*` | Channel sales owners and legal reviewer | Approved retail, HORECA, bakery and e-commerce offer sheets | Every channel label and statement is approved by its owner in both locales |
| `ui.*.catalog.*` | Product data owner and UX content owner | Approved catalog terminology, filter labels and result or empty-state copy | Search and filter language is complete, locale-correct and behavior-tested |
| `ui.*.product.*` | Product data owner, producer and legal reviewer | Approved product metadata labels, audience, benefit and enquiry terminology | Direct product UI fields match the verified catalog schema in both locales |
| `ui.*.product.applicationNames.*` | Product taxonomy owner and localization owner | Approved localized name for every stable application key | No raw or missing application key renders and both locale mappings are approved |
| `ui.*.brand.*` | Partnership owner, brand owner and legal reviewer | Approved producer-story, origin, category and relationship terminology | Partner and legal review approve every direct brand-page field |
| `ui.*.form.*` | Sales operations, privacy owner and UX content owner | Production data-flow map, field labels, consent, delivery and error-state copy | Direct form copy passes privacy, bilingual and accessible-form review |
| `ui.*.form.interestOptions.*` | Channel sales owner and CRM data owner | Approved interest taxonomy and production CRM mapping | Every stable option maps exactly to an approved CRM value and localized label |
| `ui.*.status.*` | UX content owner and sales operations | Approved loading, success, failure and reference-state messages | Messages are accurate, non-alarming, privacy-safe and announced accessibly |
| `ui.*.validation.*` | Privacy owner, localization owner and UX content owner | Approved field validation rules and localized remediation text | Every validation outcome identifies a remedy without exposing submitted data |
| `ui.*.notFound.*` | Digital owner and UX content owner | Approved locale-specific recovery labels and explanations | Both locale copy sets are proofed and every recovery destination resolves |
<!-- ui-ownership:end -->

The ownership manifest above is the authoritative responsibility mapping. The summary table below describes the content purpose and replacement gate at a higher level; it is not used to infer coverage.

| Copy family | Review-only content inventory | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `ui.*.siteName`, `ui.*.languageName`, `ui.*.skipToContent`, `ui.*.demoNotice`, `ui.*.demoNoticeLabel` | Localized site identity, language names, skip-link copy and persistent client-review notice/label | Brand/legal + UX/content | Approved company identity, language terminology, accessibility copy and release-status notice | Exact bilingual proof approval; skip links remain descriptive; production release state is accurate |
| `demoGlobalSettings` | “Paradise Fine Foods Demo” / “Thực Phẩm Paradise Bản Mẫu”, review-only foodservice description and fiction notice | Brand owner + legal reviewer | Approved company naming, site description and mandatory demo/production notices | Exact bilingual proof approval and metadata review |
| `demoFeaturedContent.hero` | Pastry-demo eyebrow, “Ingredients shaped for thoughtful menus”, Vietnamese equivalent, design-review body, featured product relationship and image alt | Marketing owner + product owner | Approved campaign/editorial copy, featured record and licensed visual | Both locales approved; relationship exists in CMS; metadata and alt QA pass |
| `demoFeaturedContent.editorial` | “Built around the professional table”, Vietnamese equivalent, stakeholder-review body and still-life alt | Marketing owner + creative owner | Approved editorial story and licensed visual | Bilingual editorial and rights approval |
| `ui.*.hero` | Cold-chain eyebrow; “Exceptional ingredients. Delivered with confidence.” and Vietnamese counterpart; careful-handling/service proposition; product metadata labels and catalog/enquiry CTAs | Business owner + legal + UX/content | Substantiated value proposition, approved product-label vocabulary, CTA and accessibility copy | Claim evidence attached; server-rendered bilingual content, links, image alt and product caption pass review without requiring JavaScript |
| `ui.*.home.operationalPillars` | Selected portfolio, cold-chain care, channel support and nationwide Vietnam delivery; all descriptions and Vietnamese counterparts | Operations owner + legal | Service-level evidence, actual coverage, handling process and approved translations | Each statement maps to current operational evidence; legal and operations sign off |
| `ui.*.home` discovery/featured/service | Category, product, producer, cold-chain and service headings/descriptions; “2—6 °C / MONITORED” and Vietnamese counterpart | Marketing + operations + product owners | Approved campaign copy, monitoring evidence and catalog taxonomy | Bilingual proof approval; service temperature applies to displayed context |
| `ui.*.home.channels` | Retail, HORECA, Bakery & Pastry and E-commerce names plus shelf-ready, replenishment, format, guidance, performance and online-handling statements | Channel sales owners + legal | Channel offer sheets and supporting service evidence | Each channel owner and legal reviewer approve both locale variants |
| `ui.*.home.finalCta` | Ingredient-finding/team follow-up invitation and PFF sales-line labels | Sales owner + content owner | Approved lead proposition and response workflow | Wording matches staffed production process and approved locale proof |
| `ui.*.catalog`, `ui.*.product`, `ui.*.brand` | All catalog labels, search/filter/empty states, application names, metadata labels, benefit/audience/enquiry labels, producer-story labels and fiction notes | Product/data owner + UX/content | Final taxonomy, localized vocabulary, product/brand editorial policy | Every key has approved EN/VI text; no raw key or missing value renders |
| `ui.*.form`, `ui.*.status`, `ui.*.validation` | All field labels/options, required/consent/privacy statements, no-delivery notices, submission/error/success messages and reference label | Sales operations + privacy/legal + UX/content | Production data-flow map, consent basis, retention text, error states and localized copy | Privacy approval and end-to-end accessibility/delivery QA pass |
| `ui.*.header`, `ui.*.footer`, `ui.*.notFound` | Navigation, language, footer tagline/legal/copyright and locale-specific missing-page labels | Brand/legal + UX/content | Approved information architecture, legal footer and bilingual copy | Link crawl, language proof and legal approval pass |
| `src/pages/404.astro` | English-only title and metadata with bilingual visible recovery headings, explanations, review labels and direct destinations | UX/content + digital owner | Approved English metadata, bilingual visible 404 copy and route inventory | English metadata and English/Vietnamese visible copy are proofed; all four direct links return 200; no locale guessing |

## Contact details and enquiry delivery

No office address, business email address or telephone number is published in this MVP. The contact pages contain visitor-input fields named company, email and phone; those are not Paradise contact facts. The generic “contact our team” and response/follow-up statements are review-only promises owned by Sales Operations.

`src/lib/enquiry/submit.ts` is a temporary demo adapter. It validates in-browser input, waits 350 ms, creates a local `PFF-…` success reference and returns success-shaped `{ ok, reference, message, receivedAt, demo }` data. It does not send or deliver an email, call a CRM, persist a record or expose a submission endpoint.

| Boundary | Production owner | Source/input | Acceptance |
|---|---|---|---|
| `src/lib/enquiry/submit.ts` | Sales operations + engineering + privacy owner | Authenticated production endpoint, request/response contract, spam protection, retry/failure policy, audit/retention policy and monitored destination | Staging delivery reaches the approved owner; failure is observable; security/privacy/accessibility reviews pass; `demo` behavior is removed |
| Contact details (currently absent) | Paradise business owner + legal | Verified office names/addresses, service regions, monitored email and phone details | Owner confirms current details; legal/privacy approve publication; link and call tests pass |

## Paradise identity asset

The review build self-hosts the authentic Paradise Fine Foods full logo rather than a redrawn or typeset substitute. The asset was retrieved from the Paradise Fine Foods website at `https://paradisefinefoods.com/wp-content/uploads/2021/03/paradisefinefoods-full-logo.png` and stored at `src/assets/brand/paradise-fine-foods-logo.png`. Its inclusion does not change this site's demo-only status; production use still requires named approval.

| Asset | Demo-only status | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `src/assets/brand/paradise-fine-foods-logo.png` | Authentic self-hosted full logo used only in the client-review demo | Paradise brand owner and legal reviewer | Current Paradise source PNG, master identity artwork, usage guidance and confirmation that this export is approved for the production web property | Brand and legal owners approve the exact file, placement, sizing, accessible naming and production usage in both localized experiences |

## Authored demo media and motion enhancement

| Asset | Review-only role | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `src/assets/demo/editorial-table.svg` | Original unbranded abstract kitchen still life used by editorial/service proof | Creative owner + rights reviewer | Approved commissioned image, crops, alt text, author and license/release record | Rights register complete; art direction, responsive crops, alt and performance pass |
| `src/assets/demo/product-art.svg` | Original unbranded geometric pack art reused for categories, brands and all product cards/details | Creative owner + product/brand owners | Approved category art plus distinct accurate brand/product pack imagery | No demo reuse remains; each mapped record has approved image, crop, dimensions and alt |
| `src/assets/demo/living-hero-product.svg` | Original fictional unbranded package silhouette with Paradise-inspired droplet and petal forms for the server-rendered homepage hero | Creative owner + product owner | Approved commissioned hero art, localized alt text, responsive crop guidance and rights record | Product owner approves the fictional-to-production replacement; dimensions, crop, LCP delivery, contrast and rights QA pass |
| `public/favicon.svg` | Unmodified Astro starter mark shipped as an unreferenced public fallback asset | Paradise brand/creative owner | Approved Paradise monogram/favicon SVG, source artwork, author and usage rights | Default Astro artwork is absent; brand owner approves the mark; light/dark and small-size legibility QA pass |
| `public/favicon.ico` | Unmodified Astro starter icon shipped as an unreferenced public fallback asset | Paradise brand/creative owner | Multi-size ICO export of the approved Paradise favicon and its source artwork | Default Astro artwork is absent; icon matches approved SVG and renders clearly at browser favicon sizes |

The decorative Canvas 2D layer carries no product content. The digital owner must preserve the reduced-motion and save-data loading gates, the ten-shape maximum, the capped device-pixel ratio and complete server-rendered static Living Hero when maintaining this enhancement.

The homepage also owns `src/lib/motion/reveal.ts` and `src/lib/carousel/controller.ts`. The digital and accessibility owners must preserve one-shot authored reveals, settled reduced-motion content, SSR-visible product order, manual-only movement, localized controls and status copy from `ui.en.home.carousel` and `ui.vi.home.carousel`, clamped navigation and safe no-JavaScript reading order. These modules and `src/lib/motion/living-canvas.ts` are progressive enhancements only; the original demo illustrations and all product content remain present without them.

## Demo origins, URLs and route inputs

### Authoritative URL discovery scope

The ledger test scans only the following runtime, configuration and fixture sources: `astro.config.mjs`, `src/lib/cms/demo-data.ts`, `src/layouts/SiteLayout.astro`, `src/components/global/FloatingFormRail.astro`, `src/pages/404.astro`, `src/pages/en/index.astro`, `src/pages/vi/index.astro`, `src/components/sections/CategoryDiscovery.astro`, and `src/components/catalog/ProductDetail.astro`. It discovers external `https`, `mailto`, and `tel` values, exact contextual query values, and dynamic category/product query templates normalized to `{value}`. Source comment-only URLs are removed before scanning, so Astro documentation links and other documentation-only destinations are outside this runtime/provenance inventory. Media paths are independently discovered from the asset directory documented above.

| URL/input | Review-only use | Production owner | Source/input | Acceptance |
|---|---|---|---|---|
| `https://demo.paradisefinefoods.com` | `astro.config.mjs` site origin and canonical/Open Graph base; duplicated only as a defensive fallback in `src/layouts/SiteLayout.astro` and `src/pages/404.astro` | Digital owner | Final HTTPS production hostname and environment/deployment configuration | Deployment crawl confirms the expected host in every canonical/Open Graph URL; demo hostname is absent from production output |
| `/en/`, `/vi/`, `/en/products/`, `/vi/products/` | Direct bilingual recovery URLs on the 404 | Digital owner + content owner | Approved uniform localized route map | All links return 200 and remain correct in deployed base-path configuration |
| `?category={value}` | Dynamic category discovery URL pattern whose value is the exact localized category slug | Product/data owner | Stable localized category slug inventory | Each generated link filters to a non-empty intended set; invalid input degrades to full catalog |
| `?interest=retail`, `?interest=horeca`, `?interest=bakery`, `?interest=ecommerce`, `?interest=other` | Homepage channel and floating-rail enquiry paths in both locales; `other` covers supplier/product conversations in the demo | Channel sales owners | Approved interest taxonomy and CRM mapping | Each value preselects the intended localized option and reaches the production field mapping; all three rail destinations remain link-tested |
| `?product={value}` | Dynamic product-detail-to-enquiry pattern whose value is one of the six stable product IDs listed above | Product/data owner + sales operations | Stable CMS product identifier and production endpoint mapping | Known IDs preselect correctly; unknown values are ignored; submitted context reaches the approved system |

SVG namespace URLs and Astro/documentation links are technical identifiers, not business destinations.

## Production cutover checklist

- Replace the local default CMS data behind the stable query functions; do not bind page components to a CMS SDK.
- Obtain named brand and legal approval for the self-hosted Paradise logo before production release.
- Reconcile this ledger against the final CMS export so every stable record, string family, visual and URL has an owner and approval record.
- Replace each authored demo SVG with approved, rights-cleared media; replace or remove the Astro starter `public/favicon.svg` and `public/favicon.ico` so no default artwork ships.
- Connect `submitEnquiry()` to reviewed delivery and remove success-only demo behavior after privacy/security acceptance.
- Set the final site origin, crawl every generated route, and verify canonicals, locale alternates, internal links and redirects.
- Obtain explicit English/Vietnamese business, legal, product, partnership, creative, privacy and accessibility approvals before launch.
