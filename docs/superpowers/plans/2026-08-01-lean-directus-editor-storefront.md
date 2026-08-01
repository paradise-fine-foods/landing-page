# Lean Directus Editor and Storefront UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give nontechnical Directus editors a safe, human-readable CMS and fix three confirmed storefront UX defects.

**Architecture:** Directus snapshot owns collection and field metadata; Schema Sync owns role, policy, access, permissions, presets, languages, and public folder. Storefront fixes reuse existing Astro components and localized CMS presentation types. Production data changes remain separate from source changes.

**Tech Stack:** Directus 12.1.1, Directus Schema Sync 3.3.2, Node.js, Astro 7, Bun, TypeScript, Cloudflare Workers.

## Global Constraints

- No custom Directus Studio extension and no new frontend dependency.
- Directus MCP may mutate seed records only; otherwise Directus, Railway, and Cloudflare MCP calls are read-only verification.
- Preserve bilingual `en` and `vi` content and avoid unverified commercial claims.
- Content Editor may publish/archive but may not hard-delete primary content or files.
- Preserve existing staged `.gitignore` change in main Finefoods checkout.
- Use test-first red/green cycles for behavior changes.
- Push reviewed commits directly to production branches only after full verification.

---

### Task 1: Directus Content Editor UX and permissions

**Worktree:** `E:/works/Freelancing/finefoods/.worktrees/lean-editor-backend`

**Files:**
- Modify: `schema/snapshot.yaml`
- Modify: `schema-sync/data/directus_roles.json`
- Modify: `schema-sync/data/directus_policies.json`
- Modify: `schema-sync/data/directus_access.json`
- Modify: `schema-sync/data/directus_permissions.json`
- Modify: `schema-sync/directus_config.js`
- Modify: `scripts/verify-cms-schema.mjs`
- Modify: `extensions/team-multitenancy/test/schema-sync.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces one stable source-owned `Content Editor` role, policy, and access link.
- Produces deterministic native metadata for nine CMS parent collections, translation collections, three product junctions, and hidden read-only `languages`.

- [ ] Add failing verifier assertions for exact CMS navigation order, non-generic icons, human display templates, hidden technical fields, field width rules, notes, and translation item templates.
- [ ] Add failing Schema Sync tests for Content Editor identities and exact permission allow-list.
- [ ] Run targeted tests and confirm failures identify missing role/metadata.
- [ ] Add stable UUID records for role, policy, access, and permissions. Grant singleton read/update; parent and translation read/create/update; junction read/create/update/delete; languages read; approved-folder file read/create/update; folder read. Add no delete permission for primary content, translations, or files and no administrative/team grants.
- [ ] Update filtered Schema Sync ownership so imports converge only committed identities without touching unrelated administrator configuration.
- [ ] Update snapshot metadata: CMS-first order, specific icons, localized human display templates, language/name translation templates, concise notes, full/half/quarter widths, hidden IDs/internal sort fields, and hidden `languages` navigation.
- [ ] Run targeted tests, `node scripts/verify-cms-schema.mjs`, and `scripts/verify-static.ps1` until green.
- [ ] Document Content Editor workflow and permission boundary.
- [ ] Commit only Task 1 files with a normal descriptive commit message.

### Task 2: Storefront regression fixes

**Worktree:** `E:/works/Freelancing/finefoods/.worktrees/lean-editor-storefront`

**Files:**
- Modify: existing catalog presentation/page/component tests and minimum matching source files.
- Modify: `src/components/forms/EnquiryForm.astro`
- Modify: existing floating enquiry rail component/style.

**Interfaces:**
- Application labels come from each localized product's existing `applicationOptions` records keyed by stable ID.
- Collapsed rail keeps toggle visible while panel is visually hidden and inert.

- [x] Add failing regression test using UUID application IDs and localized `applicationOptions`; assert rendered/filter label is localized text, never UUID.
- [x] Add failing rendered/CSS test proving collapsed 390px enquiry panel exposes zero panel width while keeping 44px toggle.
- [x] Add failing form test proving required note renders once without appended `required` label.
- [x] Run targeted tests and confirm all three fail for expected reasons.
- [x] Make minimum root-cause changes: derive application name map from localized product options, hide collapsed panel with existing state attribute, and use `requiredNote` alone.
- [x] Run targeted tests, `bun test`, `bun run check`, and `bun run build`.
- [x] Commit only Task 2 source/test files and this plan with a normal descriptive commit message.

### Task 3: Production content, field validation, and rollout

**Controller-owned external operations; no subagent source edit.**

- [ ] Capture current production seed values and file IDs for rollback.
- [ ] Deploy reviewed Directus commit through production branch and wait for Railway success.
- [ ] Upload repository-owned hero, product, editorial, and Paradise brand assets through Directus browser UI; use Directus MCP only to update resulting file metadata and seed records.
- [ ] Clear placeholder phone, assign relevant assets, preserve generic sample partner, and verify EN/VI records.
- [ ] Create secure temporary non-admin QA user through Directus UI.
- [ ] Build checklist directly from canonical snapshot and exercise every non-system editor field in disposable Directus; in production create temporary draft records for ordinary collections, save/reload every field, test relations/media/translations/status transitions, inspect singleton controls without browser-saving seed changes, and verify forbidden routes/actions.
- [ ] Remove QA records and temporary user after validation.
- [ ] Deploy reviewed storefront commit directly to production and verify Cloudflare deployment.
- [ ] Browser-test EN/VI home, catalog, product detail, and contact at desktop and 390px widths; confirm no UUID labels, collapsed panel leak, duplicate required note, missing media, or editor-visible technical IDs.
- [ ] Verify Directus, Railway, and Cloudflare state with read-only MCP calls and inspect fresh production logs.
