# Directus Editor UX Implementation Plan

> Execute with subagent-driven development: fresh implementer per task, task review/fix loop, commit, then whole-branch review.

**Goal:** Reduce editor input to content decisions while Directus handles technical configuration, defaults, and publish safety.

**Repositories:**

- Directus: `E:/works/Freelancing/finefoods/.worktrees/directus-editor-ux-backend`
- Finefoods: `E:/works/Freelancing/finefoods/.worktrees/directus-editor-ux-astro`

## Global constraints

- Directus stays pinned to `12.1.1`; Schema Sync stays pinned to `3.3.2`.
- Preserve existing schema/API names and Astro presentation shapes except unused `site_settings.logo`.
- Keep anonymous Public CMS policy behavior unchanged.
- Prefer native Directus metadata and existing code; add no second hook and no external AI/translation/image service.
- Use TDD for every behavior or verifier change. Keep deterministic IDs/config and idempotent Schema Sync.
- Never expose content bodies, credentials, or internal exception details in editor errors.
- Preserve user-owned `.gitignore` and `bun.lock` changes in main Finefoods checkout.

## Task 1: Schema UX and extension packaging

**Repository:** Directus

**Files:** `schema/snapshot.yaml`, `Dockerfile`, `scripts/verify-cms-schema.mjs`, `scripts/verify-static.ps1`, `README.md`, extension packaging manifests/locks as required.

1. Add failing structural assertions for UX metadata.
2. Convert eight generic file relations to native `file-image` fields with `special: ["file"]`, image MIME restriction, preview display, and Public CMS folder preset. Remove `site_settings.logo`, leaving seven image fields.
3. Configure translation aliases with native translations special/interface and default split bilingual view.
4. Add English/Vietnamese collection/field labels and notes, meaningful icons/templates, deterministic sort order, half-width pairs, collapsible Advanced groups, and route previews where routable.
5. Hide IDs, audit fields, numeric sorts, reverse product relations, translation collections, and junction collections.
6. Convert brand accent and partner group to fixed choices.
7. Test pinned `@directus-labs/simple-list-interface` against disposable Directus 12.1.1. Package only when compatible; record exact version and verification.
8. Update Docker packaging, verifiers, and README. Run canonical static verifier and `git diff --check`. Commit.

## Task 2: Editor RBAC and presets

**Repository:** Directus

**Files:** `schema-sync/config.js`, `schema-sync/directus_config.js`, Schema Sync data JSON, release/static/integration verifiers, README.

1. Add failing exact-allowlist and idempotency assertions.
2. Add Schema Sync-owned `Website Content Editor` role, policy, access row, permissions, and presets with stable UUIDs.
3. Permit only requested CMS parents, nested translation/junction CRUD, Public CMS folder-scoped file create/read/update, and read-only languages. No parent/file hard delete.
4. Deny all tenancy/admin/system/unrelated file access by omission and exact verification.
5. Add useful editor layouts/columns/previews/status filters/manual sorting via role presets.
6. Prove anonymous policy unchanged and two-pass convergence. Run focused tests, canonical static verifier, and `git diff --check`. Commit.

## Task 3: Automation and publish readiness

**Repository:** Directus

**Files:** `extensions/cms-content-validation/src/**`, `extensions/cms-content-validation/test/**`, extension verifier and integration verifier as needed.

1. Write focused failing tests first.
2. Generate/normalize missing localized slugs; allow draft overrides; reject changes while parent remains published.
3. Fill missing localized alt defaults for category/product/blog and localized logo text for brand/partner. Keep homepage alt manual and explicit overrides intact.
4. Fill first-publication blog date and derive hidden reading minutes from max English/Vietnamese word count.
5. Merge persisted parent/translation records with deltas for parent and direct nested mutations.
6. Add database-backed publication checks for both locales, slug uniqueness/stability, file MIME/folder/dimensions/alt, product benefits/brand, partner group/logo, homepage content/references, blog completeness, and published references.
7. Return stable safe error payloads with collection/language/missing-field metadata. Drafts remain permissive.
8. Run extension tests/typecheck/build, canonical static verifier, integration verification where available, and `git diff --check`. Commit.

## Task 4: Finefoods dead-field cleanup

**Repository:** Finefoods

**Files:** raw Directus schema types, repository selection, fixtures, and affected tests only.

1. Add/update a focused failing test proving `site_settings.logo` is absent from raw CMS query/type.
2. Remove field from raw schema type, query selection, fixtures, and tests.
3. Do not alter public presentation types, routes, or rendering.
4. Run focused tests, `bun test`, `bun run check`, `bun run build`, and `git diff --check`. Commit.

## Task 5: Plugin pilot and integration acceptance

**Repositories:** Directus and Finefoods

1. Pilot Super Table in disposable Directus 12.1.1. Ship pinned plugin only if UUID, bilingual editing, permissions, persistence, and native fallback tests all pass; otherwise document rejection and retain native presets.
2. Run clean PostgreSQL schema apply twice, restart convergence, and CMS editor allowed/denied API matrix.
3. Run browser smoke as CMS editor: restricted sidebar, drag/drop image, native filename/dimensions, split bilingual edit, benefit reorder, publish failure, publish success.
4. Run full Directus and Finefoods verification plus `git diff --check`.
5. Run task review/fix loop, then whole-branch review/fix loop for each repository.
6. Push reviewed feature branches.
7. Railway gate after merge/deploy: deployed commit equals pushed Directus HEAD, deployment `SUCCESS`, `/server/ping` passes, logs show no extension/schema-sync errors. Do not change Railway source branch or merge to `main` without explicit authority.
8. Re-read live schema through Directus MCP and verify image specials/interfaces/folder presets, translations, labels/order, and hidden technical fields. Stop rollout on failure; keep current successful deployment as rollback target.
