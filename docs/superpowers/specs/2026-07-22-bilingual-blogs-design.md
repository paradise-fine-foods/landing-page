# Paradise Fine Foods Bilingual Blogs Design

**Status:** Approved for implementation planning
**Date:** 2026-07-22
**Project:** Paradise Fine Foods Astro website
**Languages:** English and Vietnamese

## Purpose

Add a bilingual blog experience that helps Paradise Fine Foods publish useful professional-food stories without complicating the CMS model. The feature adds a primary navigation destination, a blog index, localized article pages, a latest-stories section on the homepage, and latest-story suggestions after every article.

The experience extends the accepted **Living Ingredients** design system. It should feel like a set of curated culinary dispatches, not a generic news template, while remaining simple for content editors and future CMS migration.

## Approved scope

- Add canonical blog indexes at `/en/blogs/` and `/vi/blogs/`.
- Add localized article routes at `/{locale}/blogs/{localized-slug}/`.
- Add a localized **Blogs** item between **Brands** and **Contact** in desktop, mobile, and no-JavaScript navigation.
- Add the three newest blog posts to the homepage after Featured Brands and before Partner Strip.
- Add up to three newest posts after each article, excluding the current post.
- Add four complete bilingual demo posts so each demo article has three alternatives.
- Preserve the existing CMS query boundary so demo data can later be replaced without changing page components.
- Extend the exact static route manifest and bilingual counterpart routing.

## Non-goals

- No external CMS integration in this iteration.
- No author profiles, tags, search, pagination, filters, comments, feeds, social sharing controls, or manual featured-post switches.
- No manually curated related-post relationships or scoring algorithm.
- No new JavaScript interaction or animation system.
- No redesign of unrelated homepage, catalog, brand, enquiry, header, or footer behavior.

## Content model

The public `BlogPost` type contains only content needed to render a post:

- `id`: stable, locale-independent identifier.
- `slug`: localized route slug.
- `title`: localized title.
- `excerpt`: localized summary used on cards and metadata.
- `publishedAt`: one ISO date string shared by both locales.
- `readingMinutes`: one positive integer shared by both locales.
- `category`: localized short editorial label.
- `image`: required image asset with localized alternative text.
- `sections`: localized article sections, each with an optional heading and one or more paragraphs.

The demo source keeps localized values together under the same stable record, following the existing `LocalizedText` and `LocalizedSlug` patterns. Query functions return fully localized `BlogPost` objects; components never read demo fixtures directly.

The body uses structured sections rather than raw HTML. This keeps rendering safe, makes missing content detectable at build time, and maps cleanly to common CMS rich-text or repeatable-section fields later.

## Query contract and ordering

The CMS query layer owns localization, validation, and date ordering.

- `getBlogPosts(locale)` returns every localized post sorted by `publishedAt` descending.
- `getLatestBlogPosts(locale, limit, excludeId?)` returns the newest posts, optionally excluding one stable post ID, then applies the limit.
- `getBlogPostBySlug(locale, slug)` returns the matching localized post or `undefined`.

All “latest” placements use these functions. There are no tags, feature flags, editor-curated relationships, or placement-specific arrays.

- Homepage: `getLatestBlogPosts(locale, 3)`.
- Blog index: `getBlogPosts(locale)`.
- Article suggestions: `getLatestBlogPosts(locale, 3, currentPost.id)`.

This makes publication date the only prominence control. The first index item receives its larger presentation because it is first in the sorted list, not because the CMS stores a visual-layout property.

## Routing and localization

`blogs` becomes a structural `RouteKey` with the shared segment `blogs` in English and Vietnamese, matching the project’s current uniform structural-route policy.

The blog index uses the existing locale static-path helper. Article static paths are derived from the four demo records for both locales. Each article computes its alternate-language URL from the same stable post record so the language switcher preserves article identity while changing to the counterpart localized slug.

Unknown slugs are not generated and use the existing static 404 behavior. Canonical and alternate metadata continue through `SiteLayout`; article title, excerpt, route, and image populate page metadata.

## Components and responsibilities

### `BlogCard`

One reusable, server-rendered card displays image, category, publication date, title, excerpt when the context allows it, reading time, and a localized “Read story” link. The entire semantic structure remains understandable without JavaScript.

Layout variants are presentation-only props such as `lead` or `compact`; they do not alter the CMS model. The index assigns `lead` to the first sorted post. Homepage and article suggestions use the standard form.

### `LatestBlogs`

A shared section composes a localized eyebrow, heading, optional “View all” link, and a list of `BlogCard` components. The homepage and article detail pages use the same component with different localized headings. The component renders one to three available posts and renders nothing when the list is empty.

### Blog index page

The index opens with a restrained editorial introduction. The newest post spans a larger asymmetric composition, followed by the remaining posts in a quieter responsive list/grid. This is one date-sorted list, not separate featured and regular collections.

### Blog article page

The article uses breadcrumbs, a category/date/read-time header, a strong image, a narrow reading measure, semantic section headings and paragraphs, then the shared latest-stories section. A compact “story label” groups date, reading time, and category visually without introducing new data.

### Homepage integration

The shared latest-stories section appears after Featured Brands and before Partner Strip. It shows exactly the three newest posts and links to the blog index. It should add an editorial pause between producer stories and operational proof rather than compete with the hero or product discovery.

### Navigation

The localized Blogs link appears between Brands and Contact in the shared header links array. Because the same array feeds enhanced desktop/mobile navigation and the no-JavaScript fallback, all modes stay consistent.

## Visual direction

The design extends existing tokens instead of introducing an independent blog theme:

- **Rice paper:** `#fbfaf5` for the page ground.
- **Deep herb:** `#28342b` for primary text.
- **Paradise orange:** `#e46f2c` for editorial rules and calls to read.
- **Paradise blue:** `#0796d2` for metadata and utility emphasis.
- **Paradise green:** `#94c11f`, plus existing coral and mist blue, for restrained image accents.
- **Display typography:** Newsreader for article titles and editorial headings.
- **Body and utility typography:** Nunito for prose, metadata, navigation, and controls.

The signature element is an **ingredient label** treatment: a small, dark, irregularly cornered label visually bridges image and copy on prominent story treatments. It evokes a professional ingredient pack label without adding fields or interaction. This is the single expressive flourish; surrounding cards, rules, spacing, and prose remain restrained.

The larger newest-post composition is created with CSS grid and the existing organic corner language. Mobile collapses to one column with the content order preserved. Keyboard focus uses the existing focus token. Any reveal enhancement follows the existing one-shot reduced-motion contract, but animation is not required for this feature.

## Copy and demo content

Four bilingual demo stories cover subjects already grounded in the Paradise product and service world:

1. Cold-chain discipline and pastry performance.
2. Choosing professional cream for busy service.
3. A focused dairy producer story.
4. Consistent lamination workflows.

Copy is practical and specific to professional kitchens, bakery/pastry teams, retail partners, and foodservice operations. It avoids unverified health, performance, scale, or business claims. Vietnamese content is authored as localized copy, not displayed as English fallbacks.

## Empty and invalid states

- A homepage with zero posts omits the latest-stories section.
- An article with zero alternative posts omits its latest-stories section.
- One or two available posts render without empty placeholders.
- An empty blog index displays localized directional copy instead of an empty grid.
- Duplicate IDs, duplicate slugs within a locale, invalid ISO dates, non-positive reading time, missing images, missing localized titles/excerpts/categories, or empty article sections fail at build/query time with a message identifying the bad record.
- A requested slug that is not part of the static path set resolves through the existing 404 page.

## Accessibility and semantics

- Each story item is an `<article>` with one clear linked heading.
- Publication dates use `<time datetime="YYYY-MM-DD">` and a localized visible date.
- Article body headings preserve a valid hierarchy beneath the page `<h1>`.
- Images have required localized alternative text and explicit dimensions.
- Card links have descriptive localized labels or accessible names.
- The layout remains complete without JavaScript.
- Focus visibility, color contrast, mobile reflow, and reduced-motion behavior follow existing global contracts.

## Verification

Automated tests will prove:

- Blog data localizes correctly and contains four complete records.
- Query ordering is newest-first, limits are respected, and current-post exclusion uses stable IDs.
- Both blog indexes and every localized article slug are statically generated.
- Counterpart article URLs preserve stable article identity across localized slugs.
- Header navigation includes localized Blogs links in the intended order.
- The homepage requests and renders exactly the three latest posts in the approved section position.
- The article page requests up to three latest posts while excluding the current one.
- Story markup includes semantic article, heading, link, image, and time elements.
- Empty/short recommendation lists degrade without placeholder cards.
- The exact built-route manifest includes the two indexes and eight demo article pages and rejects unknown routes.

Final verification runs:

1. `bun test`
2. `bun run check`
3. `bun run build`
4. Browser review of the English and Vietnamese index, one article in each locale, and both homepages at desktop and mobile widths.
5. Keyboard-focus, no-JavaScript content order, and reduced-motion checks.

## Implementation boundaries

Implementation will be split into independently reviewable tasks: data/query contracts; reusable blog components; index and article routes; homepage/navigation integration; route-manifest/build verification; and final responsive browser review. Every task receives a fresh implementer subagent, a specification-and-quality review, and any required fix/re-review loop before the next task begins. A whole-branch review follows all tasks.
