# SITE 00 Client App and Review Loop: Forensic Notes

Static, read-only audit of `/home/claude/site00`, 2026-10-05. I did not run any tests. All paths below are relative to the repo root.

## 1. Headline

The client app is a well-styled shell sitting on **one real persistence island**: the `site00_client_review_*` tables. Everything around that island is either template copy or fixtures, or it is not connected to anything:

- **Nothing feeds the review tables in production.** The only writer of `site00_client_review_objects` is `upsertPreviewReviewObject` (`api/_lib/site00ClientReviews/reviewRepository.ts:629`), and only `previewFixtureSeed.ts:31` calls it.
- **Nothing reads the review tables back into the workspace.** The `adminFeedback` endpoint has no consumer in `src/`, and the workspace `reviewsState` is hardcoded to `[]` (`shared/site00-projects/generalizedProjectOperatingState.ts:211`).
- **The client cannot reach the review API in production.** `useClientReviews.ts:10`, `AppReviewsQueuePage.tsx:40` and `useClientProjectRoom.ts:31` all call bare `fetch()` with no `Authorization` header. `getAuthUser` accepts only a Bearer token (`api/_lib/auth.ts:18-20`). Only `site00ClientAppApi`, which goes through `apiFetch`, attaches the token. Result: Reviews and the web project room return 401 for real users. Preview mode works only because `preview-client-room` uses the synthetic QA principal.
- **A second, parallel approval model exists and is also never written on the client path.** The Production OS tracks `site00_approval_requests` and deliverable statuses `CLIENT_REVIEW` / `CLIENT_APPROVED`. Admin, control and studio code reads `CLIENT_REVIEW` / `READY_FOR_CLIENT`, but no code ever writes those statuses. `decideApproval` writes only `APPROVED_INTERNALLY` or `REVISION` (`api/_lib/site00Production/service.ts:366-382`).

Net result: the canon review loop is broken at the send step, at the auth step, and at the return step.

## 2. Preview vs production

- **`previewReviewMemoryStore`** is used only when Vitest is running with preview mode on (`previewReviewMemoryStore.ts:61-64`). Production review persistence is Supabase via the service role. The preview bypass fails closed in production (`shared/site00-client-reviews/previewGuard.ts:12-41`), which is good.
- **`fixtures.ts` / `CLIENT_APP_FIXTURES`** serve two purposes:
  - They power `/app/preview/*`, which is client-side only and gated by `isSite00ClientAppPreviewFeatureActive`.
  - They also leak into production in four places:
    - Any authenticated user can load slugs starting `fixture-app-*` (`appService.ts:29-44`).
    - `?fixture=multi` returns the fixture project list (`appService.ts:72-78`), and the production project-select page links to it (`AppProjectSelectPage.tsx:56`).
    - An empty project list shows a fake NDXBOOK card (`AppProjectSelectPage.tsx:17-32`).
    - Inbox threads and library files are fixtures for every project (`shared/site00-client-app/appContent.ts`).
- **The production manifest is template-driven.** `buildManifestFromScope` (`shared/site00-client-project-room/manifestTemplates.ts:227-325`) hardcodes:
  - the current-moment copy ("IDENTITY DIRECTIONS", "3 DIRECTIONS READY")
  - `unreadCount: 3`
  - `reviewableObjects: []`
  - library `itemCount: 0`
  - a fabricated AUG-dated activity feed

  `manifestBuilder.ts:119-140` also hardcodes the decisions and recent approvals.

## 3. Capability classifications

Full evidence is in `client_app.json`.

| Capability | Class | Notes |
|---|---|---|
| HOME | PARTIAL | Real project, phase and attention data, but a self-directed "creator" layout with fixture copy |
| PROJECT | PARTIAL | Phases come from a static scope template; no deliverables or gates; the hub at `/project/:section` is orphaned |
| REVIEWS | PARTIAL | Durable backend exists, but no production data, 401 from the client, and a role-tamper hole |
| INBOX | VISUAL_ONLY | Fixture threads, fake messages, SEND does nothing |
| LIBRARY | PLACEHOLDER | Fake files with null URLs; not in the nav |
| AUTH | PARTIAL | JWT plus single-owner model; no members; auth header missing on 3 hooks |
| INVITE | DATA_ONLY | Self-activation sets a metadata flag; no founder invite, no email, no token acceptance |
| NOTIFICATIONS | VISUAL_ONLY | Bell has no handler; contract defined but nothing dispatches it |
| PROFILE | VISUAL_ONLY | Edit not persisted; SIGN OUT is just a link; billing/package links go to non-client surfaces |
| PROJECT SWITCHING | PARTIAL | `/app/projects` list is real, but no in-header switcher and fixture fallbacks |
| MESSAGING | VISUAL_ONLY | No table, endpoint or handler |
| UPLOADS | MISSING | — |
| APPROVALS | PARTIAL | Persisted on the client table only; nothing consumes them |
| DOWNLOADS | MISSING | `CAN_DOWNLOAD_APPROVED` is declared but never implemented |
| CLIENT ACTIVITY | PARTIAL | Deny-list translator over `site00_project_events`, a table with no migration; production writes go to `site00_project_activity` instead |

## 4. Permissions: server vs UI

- **Server-side checks exist.** Ownership is checked via `client_email` / `client_user_id` (`clientStudio.ts:152-165`, `accessModel.ts:31-44`), and capability checks run on mutations (`reviewService.ts:208-213`).
- **HIGH: the role is client-controlled.** `client-reviews.ts` passes `body.role` (lines 122, 139, 155, 174, 189) and `roleOverride` (lines 69-76) straight into the service, and the service uses `input.role ?? access.role`. A viewer can send `role:"CLIENT_OWNER"` and approve. The role should always be resolved server-side.
- **Approve skips state checks.** It does not check `review.approvalAllowed` or the current status (`reviewService.ts:345-358`). Decline does check (`reviewService.ts:497-498`).
- **Version ownership is not validated.** Comment, annotation and approve accept any `versionId` without checking it belongs to the review.
- **No per-user RLS.** The review tables allow `service_role` only. That is acceptable while all access goes through the API, but there is no defense in depth.
- **The role model is per-project, not per-member.** `metadata.client_role` is read for every user. There is no members table, so collaborators and viewers cannot be modeled, and multi-user projects are impossible: only one `client_email` / `client_user_id`.
- **Admin-only capabilities never reach the client.** `CAN_GENERATE`, `MUTATE_CANON` and similar are stripped (`stripAdminCapabilities`), and the client APIs expose no generate or propagate endpoints. That part complies with canon.
- **The client app links into internal surfaces.** "USE EVOLVE" goes to `/projects/:slug/evolve`; profile links go to `/control/billing` and `/control/settings`; "CHANGE PACKAGE" goes to `/evolve/plans`. These routes are guarded only by `Site00AccountRouteGuard` (authenticated, not role-scoped). Server APIs behind them need their own checks. I did not audit those.
- **Internal-data stripping is a deny-list.** `stripReviewInternalFields` and `stripInternalFields` remove keys by name, and the activity translator hides only listed internal event types. Any new internal event type will pass through to the client with its raw summary. This should be an allow-list.

## 5. Navigation issues

- **Nav does not match canon.**
  - Canon: HOME / PROJECT / REVIEWS / INBOX / LIBRARY.
  - Actual: HOME / PROJECTS / REVIEWS / INBOX / PROFILE (`shared/site00-client-app/routes.ts:40-46`).
  - `tests/clientAppP0App1.test.ts:32` locks in the wrong canon.
- **LIBRARY is unreachable from the nav.** The only way in is the fixture inbox thread "Identity Assets Delivered".
- **The Project Hub is orphaned.** `/project/:section` (map, build, milestones, decisions, activity) is not linked from anywhere except its own sub-nav.
- **Active-tab highlighting is wrong.** `AppProjectLayout.resolveActiveSection` has no `library` or `/project/` case, so HOME lights up on those pages (`AppProjectLayout.tsx:6-12`).
- **Deep links leave the app.** `nextAction.route` and `currentMoment.enterReviewRoute` point to `/client/projects/:slug/reviews` (the web room), not `/app/...`. Home links to them directly (`SelfDirectedViews.tsx:56, 112`). `manifestBuilder.ts:186` rewrites only `projectPulse.nextForYou`, which the current Home does not render.
- **The inbox route has an id mismatch.** The route suffix is `site00-1` but the thread id is `inbox-site00-1` (`appContent.ts:14, 20`). Thread links use `paths.inbox(thread.id)`, so the list itself works, but the `route` field in the thread data is a broken link.
- **Back paths:**
  - Review detail goes back to the queue. OK.
  - Library category goes back to the library. OK.
  - The file viewer's back link goes to the library root, not the category.
  - The project select page has no back path to the last project.
  - The splash screen hard-redirects after 1.8s.
- **The header menu does nothing.** The bell and more buttons have no handlers (`Site00ClientAppShell.tsx:79-85`), so there is no project switcher, sign-out or settings from inside a project.
- **Two client surfaces overlap.** `/client/projects/*` (web room, partly placeholder) and `/app/projects/*` (app) are both live. The web room promotes the app with a hardcoded `NOT_INVITED` state (`ClientProjectRoomOverview.tsx:172`).
- **The studio review detail page is non-functional.** On `/studio/:slug/reviews/:id`, APPROVE and REQUEST REVISION are hard-disabled.

## 6. Dead ends and things checked

- I searched for `send to client`, `SENT_TO_CLIENT`, `READY_TO_SEND`, `sendToClient`, `publishToClient` and `SEND FOR REVIEW` across `src`, `api` and `shared`. None exist.
- The `site00_client_feedback` table exists in migrations but is only used by `seedDemo.ts`.
- `site00_review_events` belongs to the ASSTS asset factory and is unrelated.
- The project notifications service (`api/_lib/site00Projects/projectNotificationsService.ts`) is an internal founder-workspace memory store. It also declares `MESSAGES_TRANSPORT_BLOCKED = true` (line 19).
- The email template "CLIENT REVIEW SUBMITTED" exists (`shared/site00-email/registry/templates.ts:1162`) but nothing on the review service path dispatches it.
- `site00_project_events` has no `CREATE TABLE` in `supabase/migrations`. It may exist in the remote database through some other path; I could not verify that.

## 7. Minimal work list to make it client-ready

Effort key: **S** ≤0.5d · **M** 1–2d · **L** 3–5d · **XL** >5d.

### P0: loop and safety

1. **Send auth on all client fetches.** Replace bare `fetch` with `apiFetch` in `useClientReviews.ts`, `AppReviewsQueuePage.postReviewAction` and `useClientProjectRoom.ts`. **S**
2. **Stop trusting client-supplied roles.** Remove `body.role` and `roleOverride` from `client-reviews.ts`. Add `approvalAllowed` / status checks and verify `versionId` belongs to the review in `reviewService`. **S**
3. **Build a founder "Send to client review" action.** **L**
   - Add an admin endpoint plus a button in the production workspace (deliverable, page or family authority) that creates `site00_client_review_objects` and `versions` with `project_id`, `authority_id`, `family_id`, `deliverable_id`, `sent_by` and `sent_at`.
   - Upload or point at the preview asset.
   - Set the deliverable / approval_request status to `CLIENT_REVIEW`.
   - Add migration columns `authority_id`, `family_id`, `deliverable_id`, `sent_by`, `sent_at`, `approved_at`, `superseded_by`.
4. **Close the return loop.** **L**
   - On approve, revision or comment, update the linked deliverable (`CLIENT_APPROVED` / `REVISION`) and the approval_request, call `refreshProjectDerivedState`, and emit a project event.
   - Mark the version `is_approved`. Implement supersede on resend.
5. **Show client reviews in the founder workspace.** Wire `reviewsState` / `ProjectReviewsModule` to read `site00_client_review_objects`, receipts and comments with the workspace status mapping (NOT_SENT … SUPERSEDED). Fix the `adminFeedback` access gate for admins. **M**
6. **Unify the status vocabulary.** Either rename the client enum to canon (AWAITING_REVIEW, IN_REVIEW, REVISION_REQUESTED, APPROVED, SUPERSEDED) or add a label layer, and add an IN_REVIEW transition when the client opens a review. **S–M**

### P1: client surfaces

7. **Fix the nav to canon.** HOME / PROJECT / REVIEWS / INBOX / LIBRARY. Move PROFILE into the header menu, update the active-section resolver, update the test, and make the bell and menu work (project switcher, sign-out). **M**
8. **Rebuild Home as a project room** from real data:
   - current moment from the latest review or deliverable
   - "what needs you" from the actionable review queue
   - current phase and next step from the project
   - recent approvals from receipts
   - recent activity from curated events
   - progress from deliverables

   Drop the creator and Evolve quick actions, and rewrite routes to `/app/...`. **L**
9. **Rebuild Project as a journey.** Phases (current, completed, upcoming), approval gates bound to review objects, and deliverable status from `site00_project_deliverables`. Mount the existing hub views. **M–L**
10. **Library.** **L**
    - Add an endpoint listing approved review versions, deliverables and final exports, plus client uploads, grouped into canon categories.
    - Add signed-URL downloads from Supabase storage, gated by `CAN_DOWNLOAD_APPROVED`.
    - Build a real file viewer.
11. **Inbox / messaging.** **L**
    - Migration for `site00_client_threads` and `site00_client_messages` (project-scoped, typed: message, decision_request, clarification, upload_request, revision_note).
    - Client send/list API and a founder-side composer.
    - Fold revision receipts into threads.
    - No internal agent chat (keep `site00_ec_creative_*` separate).
12. **Uploads (`upload_reference`).** Storage bucket, `site00_client_uploads` table, upload endpoint with size/type limits, and a UI from inbox upload requests and the library. **M**
13. **Invite and onboarding.** **L**
    - A founder invite endpoint that creates a project member and token, plus the email.
    - Token acceptance that binds `auth.users` to the project.
    - A `site00_project_members` table with roles (owner, collaborator, viewer) that replaces the single `client_email` / `client_user_id` and `metadata.client_role`.
14. **Notifications.** Add a `site00_client_notifications` table and write it on send-to-review, a new message or a file delivery. Add a bell panel and mark-read, and email through the existing registry respecting `notificationPreferences`. **M**
15. **Client activity.** Create the `site00_project_events` migration (or switch to `site00_project_activity`). Change the translator to an allow-list of client-safe event types, merge client-visible review events, and remove the fabricated default feed. **M**

### P2: hygiene

16. **Remove fixture fallbacks from production paths.** `fixture-app-*` slugs, `fixtureMode=multi`, the empty-list NDXBOOK card, and the template `unreadCount: 3` / AUG activity / hardcoded decisions. **S**
17. **Profile.** Persist the edit (`patchProfile`), make sign-out call `supabase.auth.signOut`, and remove the creator/billing links that don't apply to clients. **S**
18. **Retire or redirect the duplicate surfaces.** Either make `/client/projects/*` placeholders redirect to `/app/...` or finish them, and remove or redirect the disabled `StudioReviewDetailPage` actions. **S**
19. **Add tests.** Send-to-client creates an object; approve updates the deliverable and the workspace reads it; role tamper is rejected; auth header is present; inbox and library return real rows. **M**

**Rough total to client-ready MVP (P0 + P1):** about 5–7 engineer-weeks.

## 8. Relevant test files

These are listed only; I did not run them.

- `tests/clientAppP0App1.test.ts`: nav lock (wrong canon), opportunity engine
- `tests/clientAppP0App2.test.ts`: design status, QA matrix, preview detail
- `tests/clientAppPreviewQa.test.ts`
- `tests/clientProjectRoomP0Client1.test.ts`: capabilities, translators, stripping
- `tests/clientProjectRoomP0Client2.test.ts`: review queue/detail/permissions/persistence (preview)
- `tests/clientProjectRoomP0Client2A.test.ts`: fail-closed preview, Supabase durability (integration flag)
- `tests/fixCiPreviewFixturesMemory1.test.ts`: memory store gating
- `tests/evolveSelfDirectedProduct.test.ts`, `tests/evolveSelfDirectedScreenQA.test.ts`: the self-directed views now mounted in the client app

All review tests exercise the `preview-client-room` fixtures. None cover a production send, the workspace reading results back, or the auth header.
