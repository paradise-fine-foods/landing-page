# Paradise Fine Foods — Website Rebuild Design Specification

**Status:** Catalog-informed design direction and implementation blueprint<br>
**Project:** Paradise Fine Foods corporate and product-catalog website<br>
**Primary markets:** Vietnam, B2B food distribution, Retail, HORECA, Bakery/Pastry, E-commerce<br>
**Languages:** English and Vietnamese<br>
**Design theme:** **Cold-Chain Atelier — Culinary craft framed by distribution precision**

---

## 1. Executive Direction

Paradise Fine Foods should look like a company that curates exceptional international ingredients and can reliably move them across Vietnam.

The website must balance two qualities:

1. **Desirability** — premium food photography, refined editorial typography, provenance, chef culture, and product craftsmanship.
2. **Operational trust** — clear product discovery, distribution capability, cold-chain confidence, brand legitimacy, and direct sales contact.

The intended impression is:

> **European culinary refinement, backed by serious Vietnamese distribution capability.**

Premium must come from restraint, art direction, typography, spacing, and confidence—not from fake gold gradients, glossy effects, or decorative clutter. Motion is concentrated in one exceptional product-stage moment rather than scattered across the interface.

### Creative thesis

**Cold-Chain Atelier** combines the warmth and tactility of French culinary craft with the precision of professional refrigerated distribution. Cool stainless and cold-chain blue frame real food texture, accurate packaging, and verified technical information. This controlled contrast is the system's deliberate aesthetic risk: Paradise should not resemble the familiar cream-and-terracotta “premium food” template.

### Greenfield rebuild mandate

This is a complete redesign and rebuild, not a reskin, modernization pass, or theme replacement. The legacy Paradise website may be consulted only to inventory facts, URLs, offices, products, brands, and media that require independent verification. It is not a visual, structural, interaction, navigation, component, spacing, typography, or code reference.

The rebuild must not inherit or imitate:

- Legacy page layouts, section order, grids, sliders, cards, headers, footers, or navigation behavior
- WordPress theme markup, CSS, JavaScript, plugins, breakpoints, icon fonts, or component naming
- Legacy visual hierarchy, colors, typography, spacing, imagery treatment, animation, or responsive behavior
- Existing copy merely because it is already published; every retained statement must be verified and rewritten for the new information architecture

Continuity is limited to verified business truth, approved brand assets, valid product data, search-preserving redirects, and legally required content.

### North-star headline

> **Exceptional ingredients. Delivered with confidence.**

### Supporting proposition

> Paradise Fine Foods imports and distributes carefully selected food brands for retail, hospitality, bakery, pastry, and professional kitchens across Vietnam.

---

## 2. Research Summary

### Legacy Paradise website: content audit only

The legacy site contains potential source material, not design direction. The following facts and assets may be independently verified, rewritten, and selectively migrated:

- Company background and history
- Leadership
- Imported brands
- Product catalog
- Product categories such as butter, cream, and cheese
- Retail, HORECA, and e-commerce customer channels
- Customer and partner logos
- Events, workshops, and company news
- Hanoi and Ho Chi Minh City contact information
- English and Vietnamese versions

The live-site audit is limited to content inventory and redirect discovery: <https://paradisefinefoods.com/en/>. As reviewed, it includes mixed-language labels on the English experience, template contact details, empty counters, and unrelated news. None of its presentation or behavior is an input to the new design.

Legacy issues that justify a greenfield replacement:

- Generic template styling and leftover placeholder contact information
- Mixed Vietnamese and English labels on the same language version
- Weak homepage hierarchy
- Product pages that resemble an unfinished online shop
- Minimal product metadata and poor filtering
- Too many unrelated news articles
- Inconsistent image quality and proportions
- Unclear calls to action
- Empty or broken counters
- Repetitive navigation and footer structures
- No strong distinction between a premium importer and a generic food distributor

### What to learn from Dot Foods

Borrow:

- Immediate, plain-language business value proposition
- Clear audience pathways and business-channel segmentation
- Strong product discovery and search behavior
- Operational proof and service benefits
- Repeated, specific conversion opportunities
- Confidence created through scale, systems, and clarity

Do not copy:

- Corporate American visual density
- Excessive information on the first screen
- Commerce-first UI patterns on public marketing pages
- Blue enterprise-software aesthetics

### What to learn from Gourmet Partner Vietnam

Borrow:

- Premium ingredient photography
- Category-led browsing
- Editorial treatment of food, chefs, and events
- Association with professional kitchens and hospitality
- Provenance-focused storytelling

Do not copy:

- Overly dark layouts
- Decorative luxury clichés
- Weak product-level information architecture
- Inconsistent content density
- Reliance on large visuals without enough business clarity

### Final synthesis

The new Paradise experience must not be a midpoint, collage, or visual remix of the researched sites. External references are quality benchmarks only. Paradise's design language comes from its own subject: professional ingredients, cold-chain handling, producer provenance, culinary application, and Vietnamese distribution.

- Match Dot Foods' clarity without adopting its corporate layout language.
- Match Gourmet Partner's appetite appeal without adopting its visual treatment.
- Replace the legacy Paradise experience completely rather than evolving its template.

### What the current Savencia catalog adds

The 2026 Savencia brochure materially improves the design direction because it shows the actual visual language already surrounding Paradise's portfolio. The website should translate its strongest ideas into a more disciplined digital system rather than merely placing the PDF online.

Catalog-derived strengths to preserve:

- **White-space confidence** — pages 1–4 use large clean fields that make packaging and brand marks feel precise and premium.
- **Product-first composition** — pack shots are isolated, legible, and given enough room to breathe instead of being buried in generic lifestyle photography.
- **Culinary authority** — the chef image and “Tradition and Innovation” story on page 2 connect the product to professional craft.
- **Clear technical proof** — pages 3–5 surface fat percentage, pack format, case configuration, shelf life, texture, yield, holding time, and professional benefits. This is exactly the information serious buyers need.
- **Flexible brand expression** — Elle & Vire and Corman retain distinct colors and personalities while remaining inside one coherent brochure.
- **Organic visual energy** — the colored droplets and photo apertures create movement without filling the page with decoration.
- **Provenance signals** — the “Produced in France” seal and origin story make premium claims tangible.
- **Benefit-led product storytelling** — page 5 places the hero pack at the center and organizes performance claims around it, a strong pattern for selected product-detail pages.

Catalog weaknesses the website should correct:

- Small text and thin metadata become difficult to scan, especially on mobile.
- Script typography is expressive but inconsistent and should not become the site-wide interface language.
- Some product pages feel like products floating on a blank sheet rather than a navigable system.
- The colored droplet marks belong to Savencia's visual language; Paradise should not copy them as its own master-brand symbol.
- Multiple partner colors used simultaneously can become noisy. Each screen should use one controlled accent family.

### Design decision from the catalog

Paradise should use a **neutral premium master shell** with **brand-adaptive accents**:

- Paradise owns the grid, typography, navigation, spacing, catalog UX, and core milk-paper/cold-chain-blue palette.
- Each partner brand may introduce one controlled accent color, logo treatment, and editorial motif on its brand and product pages.
- Savencia's exact droplet artwork may appear only when supplied as approved brand material. The global Paradise design should use its own softer aperture, ribbon, or ingredient-cutout system instead of imitating proprietary marks.
- Product information must be designed as a first-class visual layer, not dumped into a PDF download.

---

## 3. Brand Positioning

### Brand role

Paradise Fine Foods is not merely a catalog of imported products. It is the bridge between respected international producers and Vietnam’s professional food market.

### Positioning statement

> For retailers, chefs, bakeries, hotels, restaurants, and food-service operators seeking dependable access to high-quality imported ingredients, Paradise Fine Foods provides a curated portfolio, market expertise, and nationwide distribution support.

### Brand attributes

- Refined
- Knowledgeable
- Dependable
- Selective
- International
- Human
- Commercially capable
- Culinary, not lifestyle-fashion

### Avoid these perceptions

- Luxury for luxury’s sake
- Generic organic grocery store
- Consumer supermarket
- Restaurant reservation site
- Commodity wholesaler
- Old-fashioned family distributor
- Flashy FMCG campaign site

---

## 4. Design Principles

### 4.1 Quiet confidence

Use fewer elements, stronger composition, better copy, and deliberate whitespace. Do not decorate sections merely because they feel empty.

### 4.2 Product before interface

Food, packaging, ingredients, producers, and chefs should remain visually dominant. The UI frames the content rather than competing with it.

### 4.3 Appetite plus evidence

Every emotional image should be supported by useful proof: origin, brand, category, application, storage, distribution coverage, certifications, or service capability.

### 4.4 Editorial, not ornamental

The site should feel similar to a premium culinary journal combined with a modern B2B catalog. Typography and image sequencing create the sophistication.

### 4.5 Fast paths for serious buyers

A buyer should reach a relevant product, brand, specification, or sales contact within two or three actions.

### 4.6 Premium through consistency

A strict system for spacing, photography, content length, card anatomy, and metadata is more valuable than one spectacular hero followed by sloppy pages.

### 4.7 Bilingual by design

English and Vietnamese are equal product experiences. Translation cannot be treated as an afterthought or allowed to break the layout.

---

## 5. Visual Direction

## 5.1 Creative concept: Cold-Chain Atelier

The visual system combines:

- Milk-paper and clean white product stages
- Cold-chain blue and carbon typography
- Stainless rules, rails, and technical metadata
- Cultured-butter warmth used as one controlled culinary accent
- Restrained editorial serif headlines
- A Vietnamese-designed sans-serif for body text and interface controls
- Large ingredient photography
- Crisp pack shots
- Thin rules and precise grids
- Subtle tactile textures used only in feature moments

The experience should feel premium before a user notices any individual decorative feature. Refrigeration cues must remain abstract and architectural—precise rails, cool light, controlled reflections—not literal appliance imagery or laboratory sterility. Warm food imagery and human culinary craft keep the system appetizing.

## 5.2 Color system

The master palette is intentionally compact. It draws from milk, cold-chain infrastructure, cultured butter, and restrained wine/provenance cues rather than a generic collection of fashionable food colors.

| Token | Hex | Use |
|---|---:|---|
| `milk-paper` | `#F7F8F4` | Primary page surface and quiet product stages |
| `cold-chain-blue` | `#123C69` | Navigation, structure, selected states, primary actions |
| `carbon` | `#172127` | Primary text and dark editorial moments |
| `stainless` | `#A9B4B8` | Rules, technical metadata, disabled states, stage details |
| `cultured-butter` | `#F2C14E` | Controlled culinary emphasis and active details |
| `bordeaux` | `#7D2C3B` | Rare campaign, origin, or provenance accent |
| `paper-white` | `#FFFFFF` | Forms, pack-shot backgrounds, and high-clarity cards |
| `success-700` | `#356146` | Success feedback |
| `error-700` | `#9A3F38` | Validation and errors |

### Color rules

- Keep each page approximately **75% milk-paper/white, 15% carbon/cold-chain blue, and no more than 10% accent color**.
- `cultured-butter` is the default Paradise accent. `bordeaux` is rare and must not appear in the same composition merely to add variety.
- Partner-brand detail pages may temporarily adopt the brand's approved accent color while retaining Paradise typography and layout. Each approved color must declare contrast-tested roles: decorative field, rule, selected background, or text. An untested partner color is decoration only and may not carry text or interaction state.
- Product pack colors should remain visually accurate and should not be recolored to match the website.
- Do not use metallic gradients or fake gold.
- Stainless may be represented through flat color, subtle directional light, and fine rules; do not use chrome gradients as decoration.
- Use dark carbon or cold-chain-blue sections for one or two major moments per page, not as the default background.
- Maintain WCAG AA contrast for text and interactive controls.

## 5.3 Typography

### Recommended open-source pairing

- **Display:** `Newsreader`
- **Body/UI:** `Be Vietnam Pro`

Both families support Vietnamese and are available under open font licenses. Newsreader supplies a screen-native editorial voice; Be Vietnam Pro gives navigation, body copy, controls, and technical metadata a deliberate Vietnamese foundation. Self-host only the weights and subsets actually used.

Sources: [Newsreader repository](https://github.com/productiontype/Newsreader) and [Be Vietnam repository](https://github.com/bettergui/BeVietnam).

### Type scale

| Style | Desktop | Mobile | Weight | Line height |
|---|---:|---:|---:|---:|
| Display XL | 80px | 46px | 500 | 0.98 |
| Display L | 64px | 40px | 500 | 1.02 |
| H1 | 52px | 36px | 500 | 1.08 |
| H2 | 40px | 30px | 500 | 1.12 |
| H3 | 28px | 24px | 500 | 1.2 |
| H4 | 22px | 20px | 600 | 1.3 |
| Lead | 21px | 18px | 400 | 1.55 |
| Body L | 18px | 17px | 400 | 1.65 |
| Body | 16px | 16px | 400 | 1.65 |
| Small | 14px | 14px | 500 | 1.5 |
| Eyebrow | 12px | 12px | 700 | 1.2 |

### Typography rules

- Display serif is reserved for headlines, quotes, and important numbers.
- Do not use serif for filters, menus, buttons, or long body copy.
- Eyebrows use uppercase with `0.12em` tracking.
- Avoid full-uppercase headlines.
- Keep homepage hero headlines under 10 words.
- Text blocks should generally remain below 66 characters per line.
- Vietnamese headings may require 5–8% more width; layouts must accommodate this without reducing type excessively.

## 5.4 Logo treatment

- Use a clean horizontal logo in the main header.
- Prepare light, dark, and single-color versions.
- Preserve generous clear space around the mark.
- Do not place the logo over visually noisy photography without a controlled overlay.
- Avoid animated logo reveals.
- A subtle monogram may be developed for favicon and social avatars, but it must not replace the full brand name in navigation.

## 5.5 Photography direction

### Primary photography styles

1. **Ingredient editorial** — butter folds, cream texture, cheese cuts, pastry lamination, plated applications.
2. **Professional craft** — chefs, bakers, kitchens, demonstrations, workshops, and preparation moments.
3. **Provenance** — landscapes, dairy farms, producers, manufacturing craft, and origin stories.
4. **Product clarity** — consistent pack shots with accurate packaging and legible labels.
5. **Distribution trust** — clean warehousing, refrigerated handling, delivery, and team operations used selectively.

### Art direction

- Natural or controlled directional light
- Soft warm highlights and deep neutral shadows
- Real food texture; avoid plastic-looking retouching
- Tight crops mixed with occasional environmental wides
- Restrained props and surfaces
- Warm stone, brushed steel, linen, pale wood, and dark natural backgrounds
- Human presence should feel candid and competent, not staged corporate stock photography

### Image ratios

| Usage | Ratio |
|---|---:|
| Hero poster / 3D stage | 16:10 desktop; authored 4:5 mobile poster |
| Editorial portrait | 4:5 |
| Product card | 1:1 |
| Brand feature | 3:2 |
| News/event card | 4:3 |
| Wide story band | 21:9 |

### Never use

- Random stock food images unrelated to sold products
- Mixed image treatments within the same grid
- Low-resolution event photography stretched full-width
- Heavy color filters
- Floating packaging mockups with fake reflections
- Automatic image carousels in the hero

## 5.6 Texture and graphic details

Optional supporting devices:

- Fine 1px rules
- Subtle grain over dark editorial sections at less than 3% opacity
- Crop marks or ingredient-label motifs used sparingly
- Thin-line botanical or culinary illustrations only where brand-owned artwork exists
- Origin coordinates, country labels, or batch-style metadata as editorial details

Do not introduce ornamental patterns without a clear relationship to food sourcing or the Paradise identity.

## 5.7 Catalog-derived graphic system

### Apertures, not copied droplets

The brochure's organic colored forms are useful because they soften a technical catalog. Paradise should develop its own family of **ingredient apertures**: simple curved cutouts, cropped circles, and elongated organic windows that can contain photography or reveal a background color.

Rules:

- Use 1–3 apertures in a major composition, never a confetti field.
- Keep geometry smooth and simple enough to crop responsively.
- Use the device for chef craft, provenance, or ingredient texture—not as random decoration.
- Do not reproduce Savencia's exact droplet shapes as Paradise-owned artwork.
- On a partner-brand page, approved partner artwork may replace the Paradise aperture system.

### Product-stage composition

Borrow the strongest behavior from catalog pages 3–5:

- Product pack shot on a clean white or softly tinted stage
- Product name and essential commercial metadata close to the image
- One fine accent rule rather than a heavy card border
- Optional application image or ingredient cutaway
- Performance claims shown as concise callouts, not long paragraphs

### Brand modes

The site should support three brand presentation modes:

1. **Neutral catalog mode** — Paradise milk-paper/cold-chain-blue shell for all multi-brand listing pages.
2. **Partner accent mode** — one approved partner color used only in its declared, contrast-tested roles. Paradise tokens continue to carry text and controls when the partner color is not approved for those roles.
3. **Campaign mode** — a more expressive art-directed page for a launch or workshop, still constrained by the master grid and typography.

### Provenance marks

Origin and quality claims should appear as structured badges or seals only when verified:

- Produced in France
- Normandy origin
- Professional format
- Chilled / frozen / ambient
- Technical performance claim

Never fabricate medals, seals, flags, or “premium” badges.

---

## 6. Layout System

## 6.1 Grid

- Maximum page width: `1440px`
- Main content width: `1240px`
- Reading width: `720px`
- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile: 4-column grid
- Desktop gutter: `24px`
- Mobile gutter: `16px`
- Outer desktop padding: `48–64px`
- Outer mobile padding: `20px`

## 6.2 Spacing scale

Use a 4px base:

`4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160`

Typical section spacing:

- Desktop: `112–160px`
- Tablet: `88–112px`
- Mobile: `64–88px`

## 6.3 Shape language

- Default corner radius: `2px`
- Controls and cards: `4–8px` maximum
- Pills only for tags, statuses, or compact filters
- Product imagery may use square corners
- Avoid a site full of large rounded rectangles; it looks like generic SaaS, not premium food distribution

## 6.4 Elevation

- Borders and surface contrast should do most of the work.
- Shadows are allowed only on overlays, dropdowns, mobile drawers, and sticky utility controls.
- Card hover shadows must remain subtle.

Suggested shadow:

```css
box-shadow: 0 18px 50px rgba(23, 32, 25, 0.10);
```

---

## 7. Information Architecture

## 7.1 Primary sitemap

```text
Home
About
├── Our Company
├── History
├── Leadership
└── Distribution & Quality
Brands
├── All Brands
└── Brand Detail
Products
├── All Products
├── Butter
├── Cream
├── Cheese
├── Yogurt
├── Pastry Ingredients
└── Additional CMS-managed categories
Solutions
├── Retail
├── HORECA
├── Bakery & Pastry
└── E-commerce
Stories
├── Events & Workshops
├── Product Inspiration
└── Company News
Contact
├── Sales Enquiry
├── Offices
└── Become a Supplier / Partner
```

### Utility actions

- Search
- EN / VI language switcher
- Download catalog
- Talk to Sales

## 7.2 Navigation model

### Desktop header

- Logo left
- Primary navigation centered or slightly right
- Search icon
- Language switcher
- Primary CTA: **Talk to Sales**

Header behavior:

- Transparent or light over the hero only when contrast is guaranteed
- Becomes solid porcelain on scroll
- Sticky after 80–120px of scroll
- 72–84px height
- Use a structured mega menu only for Products and Brands

### Mobile header

- Logo
- Search
- Menu trigger
- Full-height navigation drawer
- Persistent `Talk to Sales` action near the bottom of the drawer
- Language switch visible without entering a secondary settings screen

## 7.3 Search

Search must support:

- Product name
- Brand
- Category
- Application
- Country of origin
- SKU or product code, when available

Search results should group products, brands, and stories rather than returning one undifferentiated list.

Launch search is deterministic matching across the published CMS fields above, plus the product filters in Section 9.1. Deferred **advanced catalog search** is specifically fuzzy matching, managed synonyms, document-content indexing, saved searches, recommendations, semantic/vector search, or an external search service. None of those advanced capabilities is required for launch.

---

## 8. Homepage Blueprint

## 8.1 Header

A minimal sticky header with a clear sales CTA. No top-bar clutter unless there is a genuine operational announcement.

The homepage has one hero and no competing “mini heroes.” After it, the hierarchy is fixed: category discovery, one featured brand, operational proof, one culinary story, partner proof, and final sales conversion. Secondary modules act as catalog navigation and evidence rather than additional campaign stages.

## 8.2 Hero

### Recommended composition

Use a quiet editorial split: text occupies five columns and one art-directed 3D product stage occupies seven. The featured pack stands on an illuminated porcelain/stainless stage against milk-paper. Product metadata sits close enough to connect the visual desire to commercial proof. Do not combine the model with a second chef image, decorative aperture cluster, or campaign video in the hero.

```text
┌─────────────────────────────────────────────────────┐
│ Logo        Products  Brands  Solutions       Sales │
├──────────────────────┬──────────────────────────────┤
│ Premium distribution │                              │
│                      │     OPTIMIZED 3D PRODUCT     │
│ Exceptional          │        on illuminated       │
│ ingredients.         │      porcelain/steel stage  │
│ Delivered with       │                              │
│ confidence.          │       origin · format       │
│                      │       storage · brand        │
│ [Explore]  [Enquire] │                              │
└──────────────────────┴──────────────────────────────┘
```

### Copy

**Eyebrow:** Premium food distribution in Vietnam<br>
**Headline:** Exceptional ingredients. Delivered with confidence.<br>
**Body:** Curated international brands for retail, hospitality, bakery, pastry, and professional kitchens.<br>
**Primary CTA:** Explore Products<br>
**Secondary CTA:** Talk to Sales

### Supporting detail

A quiet proof line beneath the CTAs:

`Imported brands · Nationwide distribution · Retail & HORECA expertise`

The product stage must also expose verified metadata for the featured SKU:

- Brand
- Origin
- Pack format
- Storage class
- One professional benefit with its qualifier where required

### Behavior

- No rotating hero slides
- No hero video
- Use one production-quality GLB model of a real featured product
- Show a responsive poster immediately and progressively replace it with the 3D stage after capability checks
- Packaging labels must remain readable and color-accurate throughout the allowed motion
- One dominant visual idea only
- Navigation and both CTAs remain usable while the 3D runtime or model loads
- Products outside the hero use transparent pack shots rather than additional 3D canvases

## 8.3 Credibility strip

A slim four-column block with verified proof points, for example:

- Established in Vietnam
- Nationwide channel coverage
- Exclusive brand partnerships
- Professional cold-chain handling

Do not publish counters until the numbers are verified and maintained in the CMS.

## 8.4 Category discovery

### Section heading

> **A portfolio selected for professional standards**

Use a composed editorial grid rather than equal generic cards:

- Butter — large feature tile
- Cream
- Cheese
- Yogurt
- Pastry ingredients
- View all products

Each tile contains:

- Ingredient image or a disciplined cluster of real pack shots
- Category name
- One-line use case
- Product count, when accurate
- Arrow affordance

Desktop should use an asymmetric magazine-like layout. For product-heavy categories, use the brochure's clean white staging and fine accent rules rather than enclosing every item in a heavy card. Mobile becomes a consistent vertical list or two-column grid.

## 8.5 Featured brands

### Section heading

> **Brands with a reputation worth carrying**

Use a selected brand story rather than dumping every logo into a carousel.

Recommended layout:

- Brand logo and origin
- Short positioning statement
- Two or three hero products
- Editorial image or producer image
- CTA to brand detail

Below the feature, provide a controlled logo grid for additional brands. Each brand feature may adopt one approved accent color, but the transition back to the Paradise master palette must be obvious and clean.

## 8.6 Paradise advantage

### Section heading

> **From source to service**

Four concise value pillars:

1. **Carefully selected** — reputable producers and clear product standards.
2. **Handled correctly** — appropriate chilled, frozen, and dry storage.
3. **Built for your channel** — support for retail and professional food service.
4. **Delivered nationwide** — coordinated sales and distribution coverage.

This section should feel operational and precise, not motivational.

## 8.7 Channel pathways

Three or four large cards:

- Retail
- HORECA
- Bakery & Pastry
- E-commerce

Each card should explain the specific value Paradise provides to that audience. Avoid repeating the same generic sentence.

Example:

> **For pastry professionals**<br>
> Consistent performance, technical product information, application support, and reliable access to specialist dairy ingredients.

## 8.8 Culinary story or event feature

Use one current, high-quality story:

- Chef demonstration
- Product workshop
- Brand launch
- Application recipe
- Producer visit

Large image, date, location, short editorial summary, and `Read the Story` CTA.

This section proves that Paradise participates in the culinary industry rather than merely moving cartons.

## 8.9 Trusted by

Separate logos by channel only when useful:

- Retail partners
- Hospitality and food-service partners
- E-commerce partners

Rules:

- Use monochrome logos by default
- Restore brand color on hover only when approved
- Keep all marks inside a consistent optical box
- Do not create an endless moving marquee
- Show a curated set, with an optional `View our network` expansion

## 8.10 Final conversion section

Carbon background with a restrained cold-chain-blue structural detail and warm ingredient photography.

**Headline:** Let’s build your next product or menu with the right ingredients.<br>
**Primary CTA:** Talk to Our Sales Team<br>
**Secondary CTA:** Download Product Catalog

## 8.11 Footer

Four-column structure:

1. Brand statement and social links
2. Products and brands
3. Company and stories
4. Offices and sales contact

Include:

- Hanoi office
- Ho Chi Minh City office
- Email and phone
- Privacy policy
- Terms
- Copyright
- Language switch

Never allow placeholder contact information to ship.

---

## 9. Product Experience

The public catalog is a lead-generation tool, not a fake consumer web shop.

## 9.1 Product listing page

### Header

- Page title
- Short category introduction
- Optional editorial category image
- Search field

### Filters

- Category
- Brand
- Application
- Product form
- Country of origin
- Storage type
- Pack size
- Availability status, only when accurate

### Sorting

- Recommended
- A–Z
- Newest

Do not include price sorting unless prices are genuinely public and consistently maintained.

Launch search covers product name, SKU, brand, and category, with the filters listed above and deterministic zero-result guidance. “Advanced catalog search” means fuzzy matching, synonyms, document-content indexing, saved searches, recommendations, or an external search service; those capabilities are deferred.

### Product card anatomy

1. Product image
2. Brand
3. Product name
4. Fat percentage or key format, when relevant
5. Pack size and case configuration
6. Shelf life or storage type, when useful for the buyer
7. Category or application
8. `View Product`

Optional badges:

- New
- Professional
- Retail
- Frozen
- Chilled

Avoid:

- Fake ratings
- Sale badges
- Empty price fields
- Consumer `Add to Cart` buttons
- Long descriptions inside cards

## 9.2 Product detail page

### Above the fold

- Product gallery
- Brand logo and link
- Product name
- Short positioning sentence
- Fat percentage or key technical format, when relevant
- Pack size and case configuration
- Shelf life
- Storage requirement
- Country of origin
- Primary CTA: `Request Product Information`
- Secondary CTA: `Talk to Sales`

### Detail sections

- Overview
- Key characteristics
- Professional performance claims
- Professional applications
- Ingredients and allergens
- Nutrition information, where applicable
- Packaging and case configuration
- Storage and handling
- Certifications
- Downloads
- Related products
- Related recipes or event content

### Downloadable assets

- Product specification sheet
- Technical data sheet
- Catalog page
- Certificates

High-resolution source imagery and any partner-only documents are excluded from the public MVP. They move into secure partner downloads when authorization is implemented.

### Performance story module

Selected professional products may use a responsive version of the brochure's page-5 composition:

- Central pack shot or application image
- Four to six short, verified benefit callouts
- Technical qualifier or test note placed directly beside the claim
- Optional supporting metrics such as whipping yield, holding time, fat percentage, temperature, or texture

Desktop may position callouts around the product. Mobile must convert the same content into a clean ordered list below the image; do not preserve a radial diagram that becomes microscopic.

### Lead form behavior

Pre-fill the selected product in the enquiry form. Do not force the user to retype it.

## 9.3 Brand detail page

- Brand hero
- Logo
- Country and origin story
- Brand positioning
- A concise “tradition and innovation” or equivalent brand thesis
- Why Paradise carries the brand
- Product categories
- Product grid
- Producer or application imagery
- Relevant stories and events
- Sales enquiry CTA

This page should feel editorial but remain commercially useful. It may borrow the catalog's sequence of brand story → chef/application credibility → product families → technical proof, while using larger type and stronger digital hierarchy.

---

## 10. Solutions Pages

Each audience page should answer four questions quickly:

1. Is Paradise relevant to my business?
2. What product access do I gain?
3. What operational support do I receive?
4. How do I contact the correct team?

### Standard structure

- Audience-specific hero
- Core challenges
- Paradise capabilities
- Relevant categories and brands
- Service/process explanation
- Customer or partner proof
- Case story or testimonial
- Targeted enquiry form

### Retail

Emphasize:

- Imported retail-ready brands
- Product assortment
- Launch support
- Merchandising assets
- Distribution coverage
- Reliable replenishment

### HORECA

Emphasize:

- Premium and professional products
- Consistent specifications
- Chef/application support
- Chilled and frozen handling
- Hospitality experience

### Bakery & Pastry

Emphasize:

- Butter performance
- Cream consistency
- Technical application
- Workshops and demonstrations
- Pack formats for production

### E-commerce

Emphasize:

- Consumer-friendly products
- Content and product assets
- Fulfilment coordination
- Campaign collaboration
- Marketplace experience

---

## 11. About Experience

The About section should not begin with a long corporate paragraph.

### Recommended structure

1. **Headline:** A trusted route from global producers to Vietnam’s food market.
2. Concise company introduction
3. Timeline/history
4. Distribution footprint
5. Quality and handling principles
6. Leadership
7. Partner ecosystem
8. Contact CTA

### Leadership cards

- Professional portrait
- Name
- Role
- Short expertise summary
- Optional LinkedIn

Avoid long bullet-point résumés on the main page. Full biographies may open in a detail drawer or dedicated profile page.

---

## 12. Stories, Events, and Content Strategy

Rename generic `News` to **Stories** or **Insights & Events**.

### Approved content types

- Product launches
- Chef demonstrations
- Workshops
- Brand stories
- Ingredient education
- Recipes and professional applications
- Producer visits
- Company milestones
- Relevant market insights authored or curated by Paradise

### Reject

- Generic economic news copied from unrelated publications
- Articles that do not support products, partners, customers, or brand authority
- Old filler content retained solely to make the archive look busy

### Content card

- Image
- Content type
- Date
- Title
- 1–2 line excerpt
- Location for events

### Article page

- Strong headline
- Lead paragraph
- Hero image
- Narrow readable body
- Pull quote or data point
- Relevant product/brand links
- Enquiry CTA

---

## 13. Components

## 13.1 Buttons

### Primary

- Carbon background
- White text
- 48–52px height
- 18–24px horizontal padding
- 2–4px radius
- Arrow may shift 4px on hover

### Secondary

- Transparent
- 1px carbon border
- Carbon text

### Text link

- Text with directional arrow
- Underline or line reveal on hover

Avoid bright accent-filled buttons by default. Color should guide, not dominate.

## 13.2 Cards

Cards must not all look identical.

Approved card families:

- Product card
- Editorial story card
- Channel card
- Brand card
- Statistic/proof card
- Contact/location card

Each family must have a fixed information hierarchy and image ratio.

## 13.3 Forms

- Labels remain visible above fields
- 48–52px field height
- Clear required/optional states
- Inline validation
- Helpful error messages
- Country code handling for phone fields
- Product and page context passed automatically
- Consent copy near submit action
- Successful submission confirms the expected response time

Primary forms:

- General sales enquiry
- Product enquiry
- Supplier/brand partnership enquiry
- Catalog download
- Newsletter subscription, only when content cadence is real

## 13.4 Filter drawer

Desktop filters may appear in a left rail or horizontal panel depending on catalog size. Mobile filters open in a full-height drawer with:

- Result count
- Clear all
- Applied-filter chips
- Sticky `Show Results` button

## 13.5 Logo grid

- Consistent optical sizing
- Neutral background
- Minimum 24px internal space
- Accessible alt text
- No logo distortion

## 13.6 Breadcrumbs

Use on inner pages except the homepage. Keep them quiet but visible for catalog orientation and SEO.

## 13.7 Empty and error states

Use helpful language:

> No products match these filters. Remove one or more filters, or contact our team for sourcing support.

Do not show blank grids or technical error codes.

---

## 14. Motion and Interaction

Motion is deliberately bold in one place and disciplined everywhere else. The homepage product stage is the signature; supporting movement exists only to preserve rhythm, hierarchy, and feedback.

### Timing

- Hover and control feedback: `120–180ms`
- Drawers and menus: `220–300ms`
- Editorial mask or image reveal: `400–600ms`
- Hero resolve sequence: approximately `900ms`

### 3D hero choreography

- Render the responsive poster as the initial and LCP image, reserving the final canvas dimensions to prevent layout shift.
- Lazy-load the 3D runtime and one optimized GLB only after the poster, navigation, headline, and CTAs are usable.
- Resolve the product from a controlled close crop into its resting position over approximately `900ms`.
- Map normal hero scroll progress to no more than `18°` of camera or product rotation. Do not pin the page or alter scrolling physics.
- Pointer input may add no more than `5°` of temporary tilt and must ease back to the authored resting pose.
- Use one restrained lighting pass to reveal packaging material. Lighting must not recolor the label, create fake metallic packaging, or obscure required product text.
- Reveal brand, origin, format, storage class, and professional benefit in one coordinated stagger after the product settles.
- Keep the canvas non-blocking so navigation, selection, text rendering, and CTA interaction never wait for WebGL.

### 3D asset and loading budget

- One production-quality hero model only; no 3D canvas in cards, listings, or other homepage sections.
- GLB plus compressed textures: `≤ 2 MB` combined transfer size.
- Use mesh and texture compression appropriate to the chosen runtime and preserve packaging-label fidelity during compression review.
- Load the 3D JavaScript as a separate lazy chunk; it must not increase the critical initial JavaScript budget.
- If the model or runtime fails, retain the poster without an error message or broken stage.
- If the interactive stage is not ready within `5s` after loading begins, abort enhancement for that page view and retain the poster. Do not retry automatically.

### Supporting motion

- Use one editorial mask or image-elevation reveal per section, not one animation per element.
- Soft image scale from `1` to `1.025` on editorial cards
- Arrow translation of `3–5px`
- Border or underline reveal
- Header background transition on scroll
- Product pack shots may rise slightly with a controlled shadow on hover; they must not imitate the hero's 3D choreography.

### Avoid

- Scroll-jacking
- Large parallax effects
- Continuous or automatic product rotation
- Auto-playing carousels
- Text flying in from multiple directions
- Cursor gimmicks
- Long splash screens
- Excessive Lenis-style smoothing
- Multiple independent reveals inside one section

### Capability and reduced-motion fallback

Keep the poster and do not initialize the 3D stage when WebGL is unavailable, data saving is enabled, the model fails to load, or `prefers-reduced-motion: reduce` is active. All information and actions remain present in the same reading order. The design must still communicate premium quality with every animation disabled.

---

## 15. Responsive Behavior

## 15.1 Breakpoints

Suggested breakpoints:

- Small mobile: `< 480px`
- Mobile: `480–767px`
- Tablet: `768–1023px`
- Desktop: `1024–1439px`
- Wide: `1440px+`

## 15.2 Mobile priorities

- Search and sales contact remain easy to reach
- Product filters remain usable with one thumb
- Touch targets minimum 44px
- No tiny logo rails
- No hover-dependent information
- Avoid long walls of centered text
- Use the authored mobile poster and focal point for the 3D stage; do not depend on cropping the desktop composition
- Keep critical product metadata above the fold

## 15.3 Tablet

Tablet layouts should be deliberately composed, not merely compressed desktop layouts. Editorial split sections may become 5/3 or stacked depending on image importance.

---

## 16. Accessibility

Target **WCAG 2.2 AA**.

Requirements:

- Keyboard-accessible navigation, menus, filters, forms, and dialogs
- Visible focus states
- Correct heading hierarchy
- Descriptive alt text
- Decorative images use empty alt attributes
- Form labels, instructions, and errors associated programmatically
- Minimum 4.5:1 contrast for normal text
- Minimum 3:1 contrast for large text and interface components
- No information communicated through color alone
- Pause/stop controls for any moving media
- Reduced-motion support
- Language attribute changes between English and Vietnamese pages
- Screen-reader announcement for filtered result count

---

## 17. Content Voice

### Voice attributes

- Assured
- Specific
- Cultivated
- Helpful
- Commercially aware
- Never pompous

### Writing rules

- Lead with value, not company history
- Prefer concrete nouns and verbs
- Use shorter paragraphs
- Avoid inflated phrases such as “best of the best,” “world-class excellence,” or “leading journey” unless backed by proof
- Explain why a product matters to a buyer or chef
- Distinguish consumer formats from professional formats
- State origin, use, handling, and pack information clearly

### Example replacements

Weak:

> We are dedicated to bringing customers the best quality products and service.

Stronger:

> We select reputable international brands, maintain appropriate storage conditions, and support retail and food-service partners across Vietnam.

Weak:

> Elevate cuisine with Paradise Fine Foods.

Stronger:

> Ingredients selected for consistency in professional kitchens.

### Suggested homepage headings

- Exceptional ingredients. Delivered with confidence.
- A portfolio selected for professional standards.
- Brands with a reputation worth carrying.
- From source to service.
- Built for the way you sell and serve.
- Expertise shared in the kitchen.

---

## 18. Bilingual Experience

- English and Vietnamese must have independent, complete content entries.
- The language switcher must preserve the current page and product whenever a translation exists.
- Never mix Vietnamese labels into English pages or English labels into Vietnamese pages.
- Product names may retain official brand naming while descriptions are localized.
- Translate SEO titles, descriptions, social metadata, image alt text, form messages, and downloadable catalog labels.
- Use localized date formats and address conventions.
- Avoid machine translation without editorial review for premium brand copy and technical product information.

Suggested routes:

```text
/en/products/
/en/products/[slug]/
/vi/san-pham/
/vi/san-pham/[slug]/
```

Implement proper `hreflang` relationships.

---

## 19. CMS Content Model

The design must be driven by structured content rather than hard-coded sections.

## 19.1 Product

```text
id
status
sku
published_at
name_en
name_vi
slug_en
slug_vi
short_description_en
short_description_vi
brand
categories[]
applications[]
origin_country
product_family
product_form
audience_channels[]
fat_percentage
storage_type
storage_temperature
pack_size
case_configuration
shelf_life
ingredients_en
ingredients_vi
allergens_en
allergens_vi
nutrition_data
professional_benefits_en[]
professional_benefits_vi[]
performance_claims[] { text_en, text_vi, qualifier_en, qualifier_vi }
certifications[]
images[] { asset, role, alt_en, alt_vi, focal_point, crop_variants }
featured_image { asset, alt_en, alt_vi, focal_point, crop_variants }
technical_documents[] { type, label_en, label_vi, file, public }
availability_status
availability_note_en
availability_note_vi
featured
related_products[]
related_stories[]
seo
```

## 19.2 Brand

```text
name
slug_en
slug_vi
logo { asset, alt_en, alt_vi }
origin_country
summary_en
summary_vi
story_en
story_vi
hero_image { asset, alt_en, alt_vi, focal_point, crop_variants }
gallery[] { asset, role, alt_en, alt_vi, focal_point, crop_variants }
approved_accent_color
approved_accent_roles[]
approved_graphic_assets[]
brand_display_mode
product_categories[]
products[]
certifications[]
website_url
featured
seo
```

## 19.3 Category

```text
name_en
name_vi
slug_en
slug_vi
summary_en
summary_vi
hero_image { asset, alt_en, alt_vi, focal_point, crop_variants }
editorial_image { asset, alt_en, alt_vi, focal_point, crop_variants }
parent_category
featured
sort_order
seo
```

## 19.4 Story/Event

```text
content_type
status
title_en
title_vi
slug_en
slug_vi
excerpt_en
excerpt_vi
body_en
body_vi
featured_image { asset, alt_en, alt_vi, focal_point, crop_variants }
gallery[] { asset, role, alt_en, alt_vi, focal_point, crop_variants }
event_date
location_en
location_vi
brands[]
products[]
authors[]
featured
seo
```

## 19.5 Partner/customer

```text
name
logo { asset, alt_en, alt_vi }
channel
website_url
featured
sort_order
```

## 19.6 Office

```text
city_en
city_vi
address_en
address_vi
phone
email
map_url
business_hours_en
business_hours_vi
sort_order
```

## 19.7 Global settings

```text
navigation_en
navigation_vi
footer_en
footer_vi
contact_defaults
social_links
catalog_download
announcement_en
announcement_vi
homepage_sections
hero_showcase
seo_defaults
legal_links
```

### `hero_showcase`

```text
featured_product
model_glb
poster_image
alt_text_en
alt_text_vi
approved_camera_preset
fallback_focal_point
```

The featured product supplies its brand, origin, pack format, storage class, and verified professional benefit. Editors may replace approved assets and select the featured product, but may not enter arbitrary camera, lighting, or animation values. Camera presets and motion limits remain code-owned design controls. The CMS vendor and 3D runtime are implementation choices outside this visual specification; they must preserve this content contract, static-rendered fallback, budgets, and accessibility behavior.

---

## 20. Front-end Architecture Notes

Implementation starts from the clean Astro project and the design system defined in this specification. Do not copy, port, wrap, scrape, or adapt the legacy WordPress theme, markup, stylesheets, scripts, plugins, component structure, or DOM. Redirects and verified content records are the only technical continuity with the old site.

Recommended structure:

```text
src/
├── components/
│   ├── global/
│   ├── navigation/
│   ├── catalog/
│   ├── brands/
│   ├── stories/
│   ├── forms/
│   └── sections/
├── layouts/
├── pages/
│   ├── en/
│   └── vi/
├── styles/
│   ├── tokens.css
│   ├── typography.css
│   ├── global.css
│   └── utilities.css
├── lib/
│   ├── cms/
│   ├── i18n/
│   ├── seo/
│   └── analytics/
└── content/
```

### Rendering strategy

- Static generation for core marketing, brands, products, and stories
- Incremental or webhook-triggered rebuilds after CMS publishing
- Server-render only forms, live search, or protected document access when necessary
- Client-side JavaScript only for interactions that genuinely require it
- Product filtering should use a compact client-side island for small catalogs or server/search indexing for large catalogs
- The 3D product stage is an isolated, lazy-loaded client island that progressively enhances a server-rendered poster and metadata block

### Component philosophy

- Build sections from explicit components, not one universal “content block” with dozens of configuration switches
- Use design tokens from the start
- Keep CMS flexibility inside guardrails
- For the MVP, editors may update, feature, or hide approved optional content but may not reorder the fixed homepage sequence or manually control font sizes, arbitrary colors, spacing, camera, lighting, or motion

---

## 21. Performance Requirements

Targets on representative mobile hardware:

- Lighthouse Performance: `90+`
- Largest Contentful Paint: `< 2.5s`
- Interaction to Next Paint: `< 200ms`
- Cumulative Layout Shift: `< 0.1`
- Critical initial JavaScript: `≤ 120KB` compressed
- Lazy 3D JavaScript chunk: `≤ 180KB` compressed

Requirements:

- Responsive AVIF/WebP images
- Explicit image dimensions
- Lazy-load below-the-fold media
- Preload only the responsive hero poster and critical font files; the poster remains the LCP element even when 3D enhancement succeeds
- Self-host fonts where licensing permits
- Use two font families maximum
- Avoid oversized video
- Cache CMS media through a CDN
- Generate multiple crops rather than relying on CSS to load one enormous image everywhere
- Defer maps until user interaction
- Use static logo SVGs
- Keep the 3D runtime out of the critical initial JavaScript bundle and lazy-load it only after essential hero content is interactive
- Reserve the exact stage dimensions before the canvas initializes so the 3D enhancement adds no layout shift
- Keep the optimized GLB and compressed textures at `≤ 2 MB` combined transfer size

---

## 22. SEO and Structured Data

- Localized title and meta descriptions
- Canonical URLs
- `hreflang` for English and Vietnamese
- Open Graph and social images
- XML sitemap by locale
- Product schema where public product information qualifies
- Organization schema
- Breadcrumb schema
- Article/Event schema
- Clean slugs
- Redirect map from all existing URLs
- Preserve valuable current search equity during migration
- Index product and brand pages; avoid indexing weak internal filter combinations

---

## 23. Analytics and Conversion Tracking

Track meaningful actions rather than vanity clicks:

- Product search
- Filter usage
- Product detail views
- Brand detail views
- Catalog download
- Product specification download
- Product enquiry start and completion
- Sales contact clicks
- Phone and email clicks
- Language switching
- CTA conversion by page and audience
- Zero-result search terms

Recommended funnel:

```text
Landing → Category/Brand → Product → Enquiry → Qualified sales contact
```

Search terms with no result should feed product and content planning.

---

## 24. Legacy Content Disposition

Content migration is selective data entry into a new schema, not page migration. No legacy page, section, template, layout, HTML fragment, CSS rule, or component is carried forward.

### Verify, rewrite, and selectively migrate

- Company history
- Real leadership information
- Current brands
- Current products
- Verified partner logos
- Genuine events and workshops
- Valid office and sales contacts

### Always rewrite for the new experience

- Homepage proposition
- About introduction
- Channel descriptions
- Product summaries
- Leadership biographies
- Contact instructions
- Footer copy

Even when the underlying fact remains valid, legacy headings, section order, paragraph structure, calls to action, labels, and tone must not be preserved. Rewrite the information for the new architecture and voice.

### Remove or archive

- Placeholder contact details
- Unrelated economic news
- Empty counters
- Duplicate content
- Broken or low-resolution media
- Outdated products no longer distributed
- Generic template sections
- All legacy layout, navigation, styling, animation, and interaction patterns
- Testimonials without clear attribution or permission

### Validate before launch

- Brand distribution rights
- Product availability
- Product naming, fat percentage, pack sizes, case configuration, and shelf life
- Storage temperatures and handling notes
- Performance claims and their test qualifiers
- Ingredient/allergen data
- Certifications
- Partner-logo permission
- Office addresses
- Phone numbers and emails
- Leadership titles
- Distribution claims and numerical proof points

### Redirect-only continuity

- Inventory legacy URLs for SEO and inbound-link preservation.
- Map each valuable URL to the closest new canonical route; do not recreate a legacy layout merely to preserve a path.
- Return an intentional redirect or retirement response for pages whose content is rejected.

---

## 25. Anti-patterns

Do not build any of the following:

- A rotating hero carousel
- A black-and-gold “luxury” theme
- Massive looping background video
- Floating glassmorphism cards
- Fifty-pixel border radii everywhere
- A homepage made entirely of equal-sized cards
- Fake e-commerce behavior without prices or ordering
- Autoscrolling partner-logo marquees
- Long centered paragraphs
- Stock-photo chefs smiling at the camera
- Scroll-triggered animation on every element
- A mega menu so complex that users need to study it
- Generic AI-generated food imagery used as product evidence
- CMS controls that let editors destroy the visual hierarchy

---

## 26. First-release Contract

The MVP is a complete public catalog and lead-generation experience, not an incomplete set of page shells. Every included page type must ship with verified content, bilingual states, responsive layouts, and accessible interaction behavior.

### Required at launch

- Homepage with the single 3D featured-product stage and resilient poster fallback
- Complete About experience
- Brands index and populated brand-detail pages
- Products index, category pages, populated product-detail pages, search, filtering, and useful zero-result states
- Solutions overview and Retail, HORECA, Bakery & Pastry, and E-commerce pages
- Curated Stories index and populated story/event pages
- Contact, office information, and functional sales/product enquiry forms
- Complete English and Vietnamese localization, including metadata, validation, empty states, and preserved routes when switching language
- CMS integration with guarded editorial controls and the `hero_showcase` configuration
- Technical SEO, localized structured data, sitemap, analytics events, and redirect mapping from the current site
- Verified pack shots, product metadata, claims, partner logos, office details, and sales contacts; no placeholder or mixed-language production content

### Explicitly deferred

- Secure partner downloads
- Advanced catalog search
- Saved product shortlist
- Product comparison for professional formats
- Sales territory routing
- CRM integration
- Event registration
- Distributor/partner portal integration
- B2B ordering, prices, checkout, and account management
- Additional 3D product models or interactive 3D comparison

Do not delay the public rebuild to chase transactional or partner-portal capabilities. The first release is a sharp, maintainable catalog and lead engine; “MVP” does not excuse incomplete product information, placeholder copy, inaccessible interactions, or broken bilingual routes.

### First-release assumptions

- One production-quality GLB model and matching packaging texture will be supplied or commissioned for the featured SKU.
- Product pack shots, claims, technical metadata, partner logos, office details, and bilingual content will be verified by their owners before launch.
- Only transactional and partner-portal capabilities are deferred; the full public catalog and its content states remain launch requirements.
- This specification replaces conflicting conservative hero-motion guidance. The 3D stage is the one approved exception, with the limits and fallbacks defined in Section 14.

---

## 27. Design Acceptance Criteria

The design is ready for development when:

- Desktop, tablet, and mobile layouts are defined for every page type
- English and Vietnamese versions have been tested with real copy
- The 3D hero has been verified at wide desktop, laptop, tablet, and `390px` mobile widths in both languages
- Product listing and detail states are complete
- Navigation, search, filtering, and forms have interaction specifications
- Empty, loading, success, and error states are designed
- Color contrast passes WCAG AA
- Keyboard order, visible focus, screen-reader reading order, and motion-independent hero CTAs have been verified
- Every reusable component maps to CMS fields
- Photography ratios and minimum resolutions are documented
- Pack shots are available on consistent transparent or clean neutral backgrounds
- The featured GLB and poster use the same approved packaging artwork; labels remain legible and color-accurate through the full `18°` rotation range
- Successful 3D loading, WebGL unavailability, a missing or failed model, a slow connection, data-saving mode, and reduced-motion mode all preserve the poster, metadata, and actions
- Product technical metadata from the current catalog is represented in the CMS and UI
- Partner-brand accent rules have been approved and tested
- Content owners have approved the new sitemap
- All numeric claims are verified
- There are no placeholder details
- No screen, component, navigation pattern, layout, stylesheet, script, or interaction has been copied or adapted from the legacy Paradise website
- A reviewer can explain each major visual decision from Cold-Chain Atelier, product content, culinary craft, or distribution behavior—not from the previous site's presentation
- LCP is measured from the poster, CLS remains below `0.1`, and loading the lazy 3D bundle does not block interaction or regress the critical initial JavaScript budget
- The design still feels premium with animation disabled

---

## 28. One-sentence Creative Test

Before approving any screen, ask:

> **Does this make the product feel desirable while making Paradise feel dependable?**

If the answer is only one of those two, the design is incomplete.

---

## 29. Research Sources and Boundaries

- Legacy Paradise site—content inventory and redirect audit only; never a design or implementation reference: <https://paradisefinefoods.com/en/>
- Dot Foods—business-clarity benchmark only: <https://www.dotfoods.com/>
- Gourmet Partner Vietnam—culinary content-quality benchmark only: <https://gourmetpartner.vn/>
- Savencia brochure—approved portfolio facts, product presentation evidence, and partner-brand material: `Savencia Brochure 2026_Vie(1).pdf`, especially pages 2–5

No reference supplies a page composition to copy. Cold-Chain Atelier, the Paradise content model, and the requirements in this specification are the sole design source of truth.
