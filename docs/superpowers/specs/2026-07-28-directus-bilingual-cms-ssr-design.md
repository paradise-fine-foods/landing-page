# Directus Bilingual CMS and Astro SSR Design

**Status:** Approved for implementation
**Date:** 2026-07-28
**Repositories:** `finefoods` and `directus`

## Purpose

Replace the Astro site's in-memory demo CMS with a non-tenant Directus 12.1.1
content model. English and Vietnamese content must be first-class translation
records, and every published content item must be complete in both languages.
All CMS-backed pages render through Astro SSR on Cloudflare so newly published
products and blogs appear without rebuilding the site.

## Content architecture

Directus uses a stable parent record plus a generated `*_translations`
collection for every translatable entity. The `languages` collection is
configuration-seeded with `en` and `vi`; business content is entered manually.
Shared status, timestamps, relations, and file assets remain on parent records.
Localized slugs, copy, alt text, and optional SEO overrides live on translation
rows.

Collections comprise:

- `site_settings` and `site_settings_translations`;
- `home_page` and `home_page_translations`;
- `categories`, `brands`, `products`, and their translations;
- `applications` and `audience_channels`, each with translations;
- `blog_posts` and `blog_posts_translations`;
- `partners` and `partners_translations`;
- product junctions for categories, applications, and audience channels.

New CMS collections have no `team` relation. The existing multitenancy
extension remains installed but is not extended or refactored for this work.

## Publishing and access

All editorial parents use `draft`, `published`, and `archived`. Drafts may be
incomplete. A separate CMS validation hook blocks publication until complete
`en` and `vi` translations exist, protects published records from losing a
required translation, and enforces normalized unique slugs per language and
routable collection.

Anonymous access exposes only published parents, their translation and
relation rows, the two language records, and files in a dedicated public
content folder. All writes stay authenticated. Schema Sync may own the public
policy, permissions, revalidation Flow, language rows, and public folder, but
must never replace editor-authored business content.

Blogs use Directus's native HTML rich-text interface. The main hero image is a
normal `directus_files` relation. Astro sanitizes the HTML against a narrow
semantic allowlist before rendering it.

## Astro runtime

Astro uses the Cloudflare adapter with server output. Locale redirects move
from the custom static Worker into Astro middleware. Dynamic routes resolve
`Astro.params` at request time and return real 404 responses for unknown or
unpublished localized slugs. Missing required singletons or an uncached
Directus outage return a noindex 503; valid empty indexes render localized
empty states.

The Directus SDK is isolated behind a typed repository and pure mappers.
Queries select explicit fields, filter published parents, select the requested
translation, and retrieve counterpart translations where alternate routes are
needed. Missing Vietnamese content never falls back to English.

Primary page content is present in the initial SSR HTML. Related products and
article suggestions use `server:defer` islands with stable skeleton fallbacks.
Catalog filtering remains lightweight progressive enhancement with the full
catalog present without JavaScript.

Successful anonymous HTML and server-island responses are cached for one hour
with a 24-hour stale window. A protected revalidation endpoint calls the
Cloudflare zone purge API; a Directus Flow invokes it after published content
changes. A runtime sitemap enumerates localized CMS routes that static sitemap
discovery cannot know.

## Verification and rollout

Directus receives clean-database schema, hook, permission, and Flow tests.
Astro receives repository/mapping tests, sanitization tests, SSR status tests,
cache and purge tests, sitemap tests, and a built-Worker test proving content
added after build appears without rebuilding.

Rollout order is Directus schema deployment, manual bilingual content entry,
public API verification, Astro SSR deployment, cache purge, and bilingual
browser/performance review. Production has no demo-data fallback.
