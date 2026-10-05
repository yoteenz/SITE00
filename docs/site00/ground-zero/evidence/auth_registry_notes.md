# SITE 00: Auth, Permissions, Project Registry and Firewall audit

Read-only static audit of `/home/claude/site00`, 2026-10-05. No code was executed against live systems, and no repo files were changed.

## Verdicts

| Area | Verdict |
|---|---|
| Auth (founder + client, invite, password, session, device) | **FAIL** |
| Project registry | **FAIL** |
| Client-project firewall (data) | **FAIL** |
| Host chrome protection (UI) | PARTIAL (strong for JURNL only) |

## 1. How admin and founder are determined

- **Server:** `getAuthUser` (`api/_lib/auth.ts:15-46`) validates the bearer JWT against Supabase `/auth/v1/user`. `resolveAdminAuth`/`requireAdmin` (`api/_lib/adminAuth.ts:37-62`) then check the email against `ADMIN_EMAILS`. If that env var is unset, they fall back to a hardcoded list: `admin@frontalslayer.com`, `kateena.armstrong@frontalslayer.com` and the founder's Gmail (`:10-14`). The "founder" is one hardcoded email (`:8`, `requireAdminFounder` `:65-73`). Admin checks are server-side wherever the helper is called. All `api/admin/*` handlers call it except the OAuth callback, which uses CSRF state instead. `admin/site00-existing-location.ts` uses `isAdminEmail`.
- **Client:** `src/utils/adminAuth.ts:543-597` reads `isSignedIn`/`currentUser` from localStorage. It also trusts `user.role === 'admin'` (`:579`). The guards that use it are AdminGuard, Site00InternalProductionGuard and Site00AccountRouteGuard. They are UI-only and have bypasses:
  - preview hosts (`AdminGuard.tsx:10` `TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW = true`)
  - `signInPaused.ts` on fsbw-dev/localhost
  - the `?designPreview=1` / `?goldenDiffCapture=1` query params (`Site00AccountRouteGuard.tsx:87-95`)
- **Role model:** none. `Site00PlatformRole = 'ADMIN' | 'STANDARD'` is derived from the email (`accessModel.ts:11-13`). Client ownership is a single `client_email`/`client_user_id` on `site00_projects` (`20260818143000_site00_production_os.sql:9-10`). There are no member, role or project-invite tables. The client sub-roles (OWNER/COLLABORATOR/VIEWER) come from one `metadata.client_role` per project (`reviewService.ts:54-60`). Write calls can override them with `body.role`, and `detail` can override them with `query.roleOverride` (`client-reviews.ts:69-76,122-189` → `reviewService.ts:148,242,287,347,422,492`). This is a privilege-escalation bug.

## 2. Server enforcement gaps (most important)

About 20 handlers mounted in `server/routes.ts` never call any auth helper. Many of them call paid providers (FAL/OpenAI/Grok/Anthropic) or write persistent data:

- **Twin pipelines:** `twin-v2-*` (visual-concept, concept-generations, import-concept, fal-parallel-twin-proof, atomic-concept-generation) and `twin-v3-*` (design-page-authority, forensic-ui-blueprint, mobile-twin-pipeline, mobile-twin-implementation)
- **Design and generation:** `design-asset-reconstruction`, `opus-native`, `sol-design-bench`, `twin-test-a-design-bench`, `experience-compiler-creative-director`
- **Engines and skins:** `expression-engine` (founder judgments), `experience-engine`, `master-skin` (approveSkinMigration), `brand-family-skin`
- **Capture and campaign:** `page-mirror`, `implementation-snapshots`, `campaign-package` (including `delete_asset_permanent`)
- **Astral World:** `astral-world-assets`, `astral-world-avatar-library`

The only "guard" on the twin endpoints is a body flag such as `founderConfirmedSpend: true` (for example `twin-v2-visual-concept.ts:79`). `vision-replication` and `hero-asset-materialize` are also unauthenticated but are not mounted in Express. Some endpoints are correctly founder-gated: `page-concept-generation`, `workspace-self-capture` and `opus-design-shell`. `projects.ts` (5.8k lines) consistently uses `canAccessFounderProjectAsOwner`. Client endpoints check ownership: `client-project-room`, `client-reviews`, `client-production` and `client-app`.

Other server-side issues:
- `getSupabaseAdmin()` silently falls back to the anon key (`api/_lib/supabase.ts:31`).
- CORS is `*` on every route (`server/index.ts:50`).

## 3. RLS coverage

- **Tables:** 216 parsed. RLS is enabled on 213. It is missing on `site00_astral_avatars` (a policy exists but RLS is never enabled), `site00_production_invalidation_events` and `site00_production_dependency_edges` (`20260823210000`).
- **Policies:** nearly all are `service_role_all ... to service_role using (true)`. That means anon and authenticated users are denied, and the service-role API is the only access path. There is zero per-project or per-member RLS.
- **Open to everyone:** `site00_brand_creative_context` (`20260910180000:31-32`) and `site00_page_concept_generation_runs` (`20260921120000:26-27`) use `for all using (true) with check (true)` with no `TO` role. They are readable and writable with the public anon key.
- **User-owned:** `site00_astral_reader_profiles` and `site00_astral_custom_avatar_generations` use `auth.uid() = user_id`.
- **Public read:** `site00_astral_avatars` and the four `fs_*` tables (approved or active rows only).
- **Project and client tables** (`site00_projects`, `site00_client_review_*`, `site00_project_events`, `site00_ec_creative_messages`, `site00_intake_invites`) are all service_role-only. Client isolation therefore depends entirely on API code.
- **Storage:** no `storage.objects` policies in the migrations. There is one shared bucket (`live-preview` default) with public URLs (`api/_lib/site00Assts/storage.ts:3,25`).

## 4. Flows against the canon

| Canon step | State |
|---|---|
| Founder creates project | Projects come from intake conversion (`adminOperations.ts:1010-1035`, which falls back to a DEMO client email) or post-payment activation (`clientStudio.ts:553-605`). There is no explicit "create project for client" step. |
| Client invite | **Missing.** `activateClientProjectApp` only sets `metadata.client_app_onboarding` (`appService.ts:113-135`). No token, no email, no expiry. The `MAGIC_LINK_REQUESTED` email is `wired:false`. Intake invites (`worldIntakeService.ts`) are the only proper invite implementation (hashed token, TTL, revoke). |
| Client creates or activates account | Open `signUp`, plus OTP with `shouldCreateUser: true`. Email confirmation is enforced. Nothing binds the account to an invite. |
| Accepts project access | Implicit: an email match equals ownership. |
| Enters project room | `/api/site00/client-project-room` with ownership check. `stripInternalFields` is applied. Admins are blocked from non-owned rooms (`roomService.ts:201-203`). |
| Project-scoped data only | True for the client endpoints. False globally because of the unauthenticated endpoints and the open RLS tables. |
| Password reset | Request works. The completion page is a stub (`Site00ResetPasswordPage.tsx:11`, `preventDefault`, never calls `updateUser`). |
| Magic link | Works, but self-registers anyone. |
| Provider auth / MFA / devices | Missing (`IdntySignInSecurityPage` shows "NOT AVAILABLE"). |
| Session handling | Supabase session plus an HttpOnly SameSite=Lax refresh cookie and HMAC restore. UI state lives in localStorage. |

Client MAY/MAY NOT permissions:
- view, comment, review, approve and request_revision exist, but the role is spoofable.
- download: `CAN_DOWNLOAD_APPROVED` is defined but never checked.
- upload_reference and send_message: missing for clients.
- access_admin: denied server-side.
- generate, mutate_canon, capture_internal, access_provider, access_model_configuration and access_internal_costs: **not denied**. They are reachable unauthenticated through the endpoints listed in section 2. For example, a GET on twin-v2-visual-concept shows the provider and model, and opus-native `estimate` shows token rates.

## 5. Project registry

There are 7+ static registries plus the DB, with no single source of truth:
- `FOUNDER_PROJECTS` (`api/_lib/site00Projects/projectRegistry.ts:17-56`)
- `CLIENT_PROJECT_SLUGS` (`clientProjectResolver.ts:22`)
- the managed registry (`p0vr3m/managedProjectRegistry.ts`)
- the ingested registry (`shared/site00-project-ingestion/registry.ts`)
- the runtime registry
- `CAPABILITY_BY_SLUG`
- the brand-context constants
- the `site00_projects` table

The type vocabularies differ: `IDENTITY/SITE/PRODUCT/WORLD`, `INTERNAL_BRAND/MANAGED_BRAND/PRODUCTION_INFRASTRUCTURE`, `HOST_PLATFORM/PERSONAL_PRODUCT`, and `PERSONAL|CLIENT|INTERNAL × SITE00|FOUNDER|CLIENT`. The canonical enum `FOUNDER_PROJECT / PERSONAL_PROJECT / CLIENT_PROJECT / INTERNAL_SITE00_PROJECT` does not exist (grep found 0 hits). The ingestion record (`projectType` × `ownership`) is the closest shape and maps cleanly.

- **JURNL:** exists only client-side. It has a PERSONAL/FOUNDER ingestion record, a runtime under `src/projects/jurnl`, raw authorities in `JURNL/`, and public assets under `public/site00/projects/jurnl` and `public/jurnl`. It has no DB row, no server capability and no API path. Its runtime auth is a design-preview localStorage adapter, with an `UNCONFIGURED` adapter for production.
- **AIO:** the slug `all-in-one-enterprises` is a founder `MANAGED_BRAND` (trucking/logistics) in FOUNDER_PROJECTS. It appears in about 30 `shared/**` files (Evolve adapter, project adapter, brand skin, bootstrap catalog under alias `aio`). It has no runtime and no owner binding, so its real owner cannot currently be invited.
- **Frontal Slayer:** a founder `INTERNAL_BRAND`. It has 172 referencing files, a cross-repo product-asset contract (`shared/frontal-slayer-product-assets`), and its own `fs_*` canon tables with public-read RLS. Its staff emails are global SITE 00 admins by default.

## 6. Firewall

- **UI and host chrome:** good for JURNL.
  - The runtime is mounted outside `Site00Layout` and has no host loader (`Site00Routes.tsx:1511-1520`).
  - CSS is scoped under `.jrn` and the fonts use project-named families.
  - Tests enforce that the runtime does not import host code, the host does not import the runtime, and there are no `:root`/`body` rules (`tests/jurnlF01Runtime.test.tsx:358,378,385`).
  - Remaining risk: the iframe is same-origin, so project JS can reach host localStorage and auth state. No generic CSS-scoping test exists for future projects.
- **Data:** not enforced.
  - Columns are scoped by project (159/232 tables have `project_id`/`organization_id`/`brand_id`), but RLS has no per-project policies.
  - Storage prefixes (`projects/{id}/…`, `design-assets/{id}/…`) are naming conventions only, inside one public bucket.
  - The "projectFirewall" (`brandCreativeContext/projectFirewall.ts`) is a phrase blacklist on generated context, not an access boundary.
  - Several client storage keys are global, with `projectId` stored in the value.
  - AIO skin binding matches by substring (`projectBinding.ts:82`).

## 7. Work list to reach client-ready auth, invite, registry and firewall

| # | Item | Effort |
|---|---|---|
| 1 | Add a shared `withAuth`/`requireAdmin`/`requireFounder` wrapper and apply it to every unauthenticated handler in section 2. Add a route-table test asserting each `API_ROUTES` entry declares an auth policy (public/token/admin/founder/client). | M |
| 2 | Fix the two `USING(true)` policies (add `to service_role`), enable RLS on the 3 missing tables, and make `getSupabaseAdmin` throw when the service role is missing. | S |
| 3 | Stop accepting `role`/`roleOverride` from requests in `client-reviews`. Derive the role server-side only, and restrict overrides to admin preview. | S |
| 4 | Canonical project registry: a `site00_projects.project_kind` enum (`FOUNDER_PROJECT, PERSONAL_PROJECT, CLIENT_PROJECT, INTERNAL_SITE00_PROJECT`) plus `owner_user_id`, and seed rows for site00, jurnl, all-in-one-enterprises, frontal-slayer, ndxbook, studio-world and astral-world. Generate or derive the static TS registries from one module (or the DB) and unify slug aliases. | L |
| 5 | Membership model: a `site00_project_members(project_id, user_id, role FOUNDER/INTERNAL/CLIENT_OWNER/CLIENT_COLLABORATOR/CLIENT_VIEWER, status)` table, a single server `authorizeProjectAction(user, projectId, action)` implementing the canon matrix, and replacing `clientOwnsProject`/`canAccessFounderProjectAsOwner` call sites. | L |
| 6 | Project invites: a `site00_project_invites` table (hashed token, email, role, TTL, revoke; reuse the intake-invite pattern) plus admin create/revoke APIs, an invite email, an accept endpoint that binds `auth.uid()` to a member row, an invite-aware sign-up/magic-link landing, and `shouldCreateUser: false` outside invite flows. | L |
| 7 | Complete password reset: handle the `PASSWORD_RECOVERY` session, call `updateUser({password})`, and redirect to `/origin/reset-password` instead of `/account/settings`. | S |
| 8 | Client capabilities missing from the API: download (signed URLs gated by `CAN_DOWNLOAD_APPROVED`), upload_reference (project-scoped storage path), and a messages table and endpoint scoped by project_id/member. | M–L |
| 9 | Per-project RLS (defense in depth) on client-facing tables (`site00_client_review_*`, messages, project events) using the members table. Private storage bucket(s) with `projects/{project_id}/` policies and signed URLs. | M |
| 10 | Remove the UI bypasses for production builds (`TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW`, query-param capture bypass gated to non-prod build flags) and stop trusting `user.role` from localStorage. | S |
| 11 | Restrict CORS to known origins and drop admin-default hardcoded emails in favor of a DB role or a required `ADMIN_EMAILS`. | S |
| 12 | Runtime isolation hardening: serve project runtimes from a separate origin or a sandboxed iframe (no `allow-same-origin`), and add a generic CSS-scoping and import-boundary test applied to every `src/projects/<slug>`. | M |
| 13 | Session and device: Supabase MFA (TOTP), a session list/revoke UI, and a sign-in audit log. | M |

The minimum to be client-ready is items 1–3, 5–7 and 10. That is roughly 2.5–3.5 engineer-weeks (1 M + 3 S, then 2 L + 2 S).

## 8. How Frontal Slayer could enter the same project pipeline (document only)

1. **Registry:** keep the `frontal-slayer` slug as a `FOUNDER_PROJECT` row in the unified `site00_projects` (kind=FOUNDER_PROJECT, owner = founder user id), replacing its entries in FOUNDER_PROJECTS, the managed registry and CAPABILITY_BY_SLUG with derived views.
2. **Ingestion record:** add `src/projects/frontal-slayer/data/frontalSlayerProject.ts` (an `IngestedProjectRecord` with `projectType:'INTERNAL'` or `'PERSONAL'`, `ownership:'FOUNDER'`, `relationship:'MANAGED_BRAND'`), and register it in `src/projects/registry.ts`.
3. **Runtime (optional):** if FS product UI is to be previewed in SITE 00, add `src/projects/frontal-slayer/runtime/**` with a root class (e.g. `.fsl`), project-named fonts under `public/site00/projects/frontal-slayer/fonts`, and one entry in `projectRuntimeRegistry.ts`. Extend the JURNL firewall tests (import boundary, CSS scope) to the new slug.
4. **Canon/data:** keep `fs_product_*` as FS-owned canon. Add `project_id` (FK to the FS row) so it is joinable under the same project scoping. Keep the public-read policies only for rows explicitly published to the external FS website, and route SITE 00 internal reads through the project-authorized API.
5. **Assets:** move FS generated assets to `projects/{fs_project_id}/…` in a private bucket and publish to the external site via the existing ACTIVE-binding contract (`shared/frontal-slayer-product-assets`).
6. **Access:** FS staff become `site00_project_members` rows scoped to the FS project (INTERNAL role) instead of global admin emails.
7. **Firewall:** keep `projectFirewall.ts` phrase checks as a content QA layer only. The real boundary is the project_id-authorized API plus RLS.
