# Directus Editor UX Design

**Date:** 2026-07-31
**Status:** Approved

## Goal

Make Finefoods CMS usable by non-technical bilingual editors. Editors should enter content, upload images, order lists, and publish. Directus should derive technical metadata and block unsafe publication.

## Design

- Keep existing parent/translation schema, locale keys, slugs, statuses, relations, and Astro-facing shapes.
- Prefer Directus 12.1.1 native interfaces. Image relations become `file-image` fields with `special: ["file"]`, image MIME limits, previews, and forced Public CMS folder.
- Translation aliases use native translation metadata with English/Vietnamese split view. Translation and junction collections remain hidden from navigation.
- Collections and fields gain bilingual labels, notes, icons, templates, ordering, compact widths, advanced groups, and route preview URLs.
- Hide IDs, audit fields, generated fields, numeric sorts, reverse relations, and implementation collections.
- Use fixed choices for brand accent and partner group.
- Remove unused `site_settings.logo` from Directus and Finefoods raw CMS mapping only.

## Editor access

Schema Sync owns a `Website Content Editor` role and policy. Editors see only site settings, home page, products, brands, categories, applications, audience channels, blog posts, partners, languages, and files in Public CMS folder.

- Parent content: create/read/update; no hard delete.
- Translation/junction records: nested CRUD needed by parent forms.
- Files: create/read/update inside Public CMS folder; folder preset forced; no delete.
- Languages: read-only.
- System administration, tenancy, users, roles, policies, schema, flows, settings, and unrelated files: denied.
- Anonymous Public CMS policy remains byte-for-byte behaviorally unchanged.

Schema Sync also owns editor presets for useful layouts, columns, image previews, status filters, and manual sorting.

## Automation

Extend existing `cms-content-validation` hook only.

- Generate missing localized slugs from localized name/title; preserve overrides while draft.
- Reject slug changes while parent stays published. Editor must unpublish first.
- Fill missing localized alt text from localized name/title. Brand/partner logo text adds localized logo suffix. Homepage image alt remains manual.
- On first blog publication, set blank `published_at` to current UTC date.
- Derive hidden `reading_minutes` as `max(1, ceil(max(enWords, viWords) / 200))` after stripping HTML.
- Preserve explicit editor alt/date overrides.
- Merge persisted records with mutation deltas before deriving or validating.
- On publication, require both locales, routable names/titles and unique slugs, valid Public CMS image metadata, required relations, localized benefits/alt, core homepage copy, and published referenced records.
- Return stable, editor-readable errors with collection, language, and missing-field extensions. Never expose body text or secrets.

Draft editing remains permissive.

## Extensions

- Package pinned `@directus-labs/simple-list-interface` only after disposable Directus 12.1.1 compatibility verification.
- Pilot Super Table. Ship only when UUID handling, bilingual editing, permissions, persistence, and native fallback all pass. Otherwise document rejection and use native presets.
- Avoid extra slug, computed-field, AI, translation, and image-recognition extensions; server hook remains authority.

## Acceptance

Clean database apply is idempotent. Editor navigation and API permissions are least-privilege. Drag/drop images populate native file metadata. Bilingual editing, benefits ordering, safe publish failures, and successful publication work in browser. Finefoods tests/check/build and Directus static/integration/release gates pass.

Production rollout requires pushed Directus commit to match Railway deployment, `SUCCESS`, `/server/ping`, clean extension/schema-sync logs, and live Directus schema verification. Current successful Railway deployment remains rollback target.
