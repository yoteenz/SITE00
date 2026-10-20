# Phase 3 — Composer integration handoff (Digital Foundation boards 10–15C)

Phase 2 built the founder boards as React screens on the Digital Foundation chamber. It reused the Phase 1 lifecycle and handoff contracts. Phase 3 wires the remaining actions, decides the open product questions and runs staging end to end. Nothing in this sprint touched payment verification, Stripe amounts, quote versions, credit eligibility, authorization, persisted lifecycle states, provider contracts, the verification engine or the runbook dependency engine.

Boards (visual authority): `boards/BOARD_10_11_12_CLIENT.jpg`, `boards/BOARD_13A_DETAIL_12A_CLIENT.jpg`, `boards/BOARD_13_14_15_FOUNDER.jpg`, `boards/BOARD_15A_15B_15C_FOUNDER.jpg`.

## 1. Source paths and route ownership

| Board | Component | Live route | Owner |
| --- | --- | --- | --- |
| 10 We need your approval | `src/site00/foundation-client/parents/ProjectPortal.tsx#P10NeedsYou` | `/foundation/:token` view `NEEDS_YOU` | IDNTY Digital Foundation |
| 11 Your foundation is complete | `src/site00/foundation-client/parents/FoundationMilestone.tsx#P11FoundationComplete` | `/foundation/:token` view `COMPLETE` | IDNTY Digital Foundation |
| 12 Your digital location | `FoundationMilestone.tsx#P12DigitalLocation` | `/foundation/:token` view `LOCATION` | IDNTY Digital Foundation |
| 13A Your records | `ProjectPortal.tsx#RecordsLibrary` | `/foundation/:token` view `RECORDS` | IDNTY Digital Foundation |
| 13A detail | `ProjectPortal.tsx#RecordDetail` | `/foundation/:token` view `RECORD` | IDNTY Digital Foundation |
| 12A Your digital location is live | not implemented (registry only, `df-r-digital-location-live`) | — | SITE 00 Digital Location product |
| 13 Foundation pipeline | `src/site00/admin/pages/foundation/boards/FounderBoards.tsx#FounderPipelineBoard` | `/admin/site00/foundation/pipeline` | IDNTY founder |
| 14 Project command | `FounderBoards.tsx#FounderProjectCommandBoard` | `/admin/site00/foundation/:id/command` | IDNTY founder |
| 15 Execution workbench | `FounderBoards.tsx#FounderWorkbenchBoard` | `/admin/site00/foundation/:id/workbench` | IDNTY founder |
| 15A Runbook at a glance | `FounderBoards.tsx#FounderRunbookOverviewBoard` | `/admin/site00/foundation/:id/runbook` | IDNTY founder |
| 15B Runbook detail | `FounderBoards.tsx#FounderRunbookDetailBoard` | `/admin/site00/foundation/:id/runbook/tasks` | IDNTY founder |
| 15C Task detail | `FounderBoards.tsx#FounderTaskDetailBoard` | `/admin/site00/foundation/:id/runbook/tasks/:taskId` | IDNTY founder |

Supporting sources:
- Board kit: `src/site00/foundation-client/boardKit.tsx`.
- Board CSS: `src/site00/styles/site00-df-boards.css`, imported by `foundationDfStyles.ts`.
- Founder board model (pure): `src/site00/admin/pages/foundation/boards/founderBoardModel.ts`.
- Founder board routes: `founderBoardRoutes.ts`.
- Founder page loader: `src/site00/admin/pages/foundation/FoundationFounderProjectBoardPage.tsx`.
- Pipeline page: `FoundationPipelinePage.tsx`.
- Credit display: `shared/site00-digital-foundation/creditPresentation.ts`.
- Review inert context: `src/site00/foundation-client/reviewInert.tsx`.

The client portal stays one link, `/foundation/:token`. The server surface (`resolveArtifactSurface`) decides which views exist, and `resolveDfRoute` / `portalViewsForPayload` choose among them. Boards 11 and 12 are views inside that portal, not separate pages. The four areas (OVERVIEW, ROADMAP, NEEDS YOU, RECORDS) stay reachable after completion.

## 2. Lifecycle conditions

| View | Appears when |
| --- | --- |
| `NEEDS_YOU`, `ROADMAP`, `STAGE`, `COMM_PREFS` | The portal is open: paid, with activation seen. |
| `RECORDS` / `RECORD` | `buildClientRecords(payload)` returns at least one row. |
| `COMPLETE`, `LOCATION` | `artifact.completion_state === 'COMPLETE'` (surface COMPLETE or BUILD_UPSELL). |
| Overview "FOUNDATION MILESTONE" panel | Same as `COMPLETE`. Its rows open COMPLETE and LOCATION. |

Board 11 rows are evidence-based, built by `foundationStatusRows`:
- DOMAIN and PROFESSIONAL EMAIL show ACTIVE only when stage `02_DOMAIN` / `03_PROFESSIONAL_EMAIL` is COMPLETE.
- DNS and EMAIL SECURITY take the ownership record's own status.
- DIGITAL OWNERSHIP shows VERIFIED only when stage 06 or 07 is complete.
- A row is omitted when the project holds no value for it.

## 3. Data contracts

- Client screens read `ClientDigitalFoundationPayload` only: `artifact`, `stages`, `client_actions`, `ownership_record`, `credit`, `quote`, `acceptance`, `communication_preferences`.
- Records come from `buildClientRecords`. Its new `subject` field carries the machine value (domain, mailbox), and an aliases row was added.
- Founder 13 reads `getPipelineView()` (rows plus `pipelineAttentionQueries`). The admin client type is `FoundationPipelineView`.
- Founder 14 reads `getProjectCommandSnapshot(id)` (unchanged).
- Founder 14–15C also read the new read-only `getRunbookView(id)`, returning `FounderRunbookView` (`shared/site00-digital-foundation/operations/contracts/p15RunbookView.ts`):
  - It holds the runbook, the non-superseded tasks, verification rules and results, the forecast and the foundation credit.
  - It is served by `GET /api/admin/site00-foundation?action=runbook&id=` under the existing founder authorization.
  - It does not mutate.

## 4. Actions

| Action | Where | Wired to | Status |
| --- | --- | --- | --- |
| APPROVE / REQUEST CHANGE → SEND CHANGE | Board 10 | `completeClientAction(token, request_id, {decision, notes, target_version: 1})` (existing) | Wired |
| SUBMIT (information actions) | Board 10 | Same call, `decision: 'APPROVE'`, with notes | Wired |
| VIEW RECORDS / NEXT THRESHOLD | Board 11 | View navigation | Wired |
| VIEW MY DIGITAL LOCATION | Board 12 | `captureBuildInterest('INTERESTED')`. If the credit is redeemable, `createBuilderHandoff(token, pathPref)` returns a deep link; otherwise `FOUNDATION_BUILDER_DEEP_LINK_PATH` | Wired (Phase 1 handoff) |
| SAVE THIS FOR LATER | Board 12 | `captureBuildInterest('SAVED_FOR_LATER')`. Disabled once saved | Wired |
| DOWNLOAD ALL RECORDS / DOWNLOAD RECORD | 13A, detail | — | **Unwired. Disabled, with an honest note. No document contract exists.** |
| START TASK | 15 / 15C | `POST start-task` (existing engine `startTask`, requires READY) | Wired |
| MARK EXECUTED / MARK READY TO VERIFY | 15C | `POST complete-task` (verification tasks become READY_TO_VERIFY) | Wired |
| RUN VERIFICATION | 15 / 15C | — | **Unwired. Disabled.** `runTaskVerification` takes a caller-supplied pass, and there is no observed-value contract. The UI never fabricates a pass. |
| VIEW VERIFICATION FLOW | 15B | Switches to the VERIFICATION tab | Wired (presentation) |

A task is never marked complete from a visual interaction. The board reloads both read models after the real operation returns.

## 5. Credit presentation rules

`foundationCreditDisplay({completion_state, credit})` maps Phase 1 `assessFoundationCreditEligibility` to one of these states:
- AVAILABLE: eligible.
- PENDING VERIFICATION: a credit exists but completion is still required, or the credit is RESERVED.
- REDEEMED: APPLIED.
- EXPIRED: expired.
- NOT ELIGIBLE: none of the above.

Rules:
- Board 12 shows "SITE 00 VERIFIES THIS CREDIT WHEN YOUR BUILD IS QUOTED. IT IS NOT APPLIED UNTIL THEN." whenever the credit is redeemable.
- No screen states the credit is applied in the builder. REDEEMED reads "ALREADY APPLIED TO A SITE 00 BUILD", which describes an already-consumed credit.
- URLs never carry credit. The handoff stays server-verified (Phase 1).

Build paths come from the builder's `PLACE_OPTIONS`: SIMPLE, ADVANCED and CUSTOM, mapped to `*_BUILD`; WORLD is excluded. The default selection is `artifact.build_recommendation`. No prices are shown for build paths.

## 6. Authorization boundaries

- Client screens use the public personalized token exactly as before. No new token use was added, and no PII or credit enters a URL.
- Founder boards sit under `AdminGuard` at `/admin/site00/*`. Admin API calls go through `foundationFetch` with the founder session. The temporary localhost/preview bypass in `AdminGuard` is pre-existing and unchanged.
- Founder board paths carry opaque engine ids only (`founderBoardPath` encodes them).

## 7. Review gallery fixture adapters

- `/foundation/review` renders every board through `DigitalFoundationReviewPreviewHost`, wrapped in `DfReviewInertProvider`. Every mutation shows "REVIEW MODE — NOTHING WAS SENT." and makes no request.
- Client boards use `generated/reviewFixtureSnapshots.json`, with live mint when the preview API is reachable.
- Founder boards use `generated/reviewFounderSnapshots.json`, built by `scripts/generate-df-founder-review-snapshots.ts` with the real engine:
  - It runs payment, runbook activation, start-task and complete-task.
  - It records no verification result. Public tokens are redacted.
- Anchors use an explicit map (`PORTAL_ANCHOR_VIEW`), so lowercase anchors no longer fall back to OVERVIEW. That fallback caused the duplicate overview previews.
- New entries:
  - `df-r-location` (board 12).
  - `df-r-client-portal-complete` (the navigable completed portal).
  - Founder board entries with `fixtureContract: FOUNDER_OPERATIONS_SNAPSHOT`.
- 12A is owned by `SITE00_DIGITAL_LOCATION`.

## 8. Responsive contract and visual locks

- Boards render inside the existing `DfFrame`: header, rail, display headline, crown object and footer code.
- Founder boards use `df-screen--board` and the footer `0{board}`.
- Kit grids collapse under 359px. The `df-brow__pills` column runs 56/72px, or 64px below 359px.
- The 320–1920 captures show no horizontal overflow (`capture-report.json`, `overflow: []`).
- Locks:
  - Static text is uppercase via both JS and CSS.
  - `DfMachine` keeps the case of machine values: domains, mailboxes, ids.
  - The signature mark keeps the client's name case in the italic text face.
  - No new fonts, artwork or design system. The record hero and concept preview reuse `DfThresholdHero`.

## 9. Known board departures

The founder should confirm or override each departure:

**Client boards**
1. Board 10:
   - The red bottom CTA is BACK TO OVERVIEW. The decisions live in the APPROVE / REQUEST CHANGE pair, because a separate REVIEW APPROVAL CTA would duplicate them.
   - The signature mark uses the italic text face, not a script font, and is never a fabricated signature image.
2. Board 11:
   - Row subs show the real domain and mailbox instead of generic descriptors.
   - An outline NEXT THRESHOLD CTA was added so board 12 is reachable without the menu.
3. Board 12:
   - A RETURN TO MY PORTAL text action was added.
   - The concept preview uses the approved chamber art with the client name, not a generated site mock.
4. Board 13A:
   - Downloads are disabled, because no documents exist and none are generated for display.
   - The footer reads `013A`; the board shows `011`.
   - The record detail omits auto-renew and privacy protection, because those fields do not exist.

**Founder boards**
5. Boards 15 and 15C: RUN VERIFICATION is disabled (see section 4).
6. Board 15C:
   - Expected and current values show NOT SET, because engine rules carry no expected values yet.
   - There is no EST. TIME field.
   - The headline is `{TASK TITLE} TASK DETAIL`.
7. Board 14: credit shows "—" / NOT ELIGIBLE until the project is complete.

## 10. Screenshot evidence

`/opt/cursor/artifacts/df-phase2/`:
- `routes/` holds the real routes: client token routes on the local in-memory preview API and founder admin routes, at 320, 390, 834, 1440 and 1920.
- `gallery/` holds the review gallery entries at 390 and 1440, plus the founder-zone page.
- `capture-report.json` records the view and state per capture, plus overflow.

The capture script is `scripts/df-phase2-capture.mjs`. It uses a private snapshot path, `SITE00_DF_PREVIEW_SNAPSHOT_PATH`, so it never shares state with the tunnel server.

## 11. Remaining blockers for Phase 3

- Document contract for record downloads.
- Observed-value verification contract, so RUN VERIFICATION can call the engine with real results.
- Expected values on verification rules.
- 12A ownership and implementation in the SITE 00 Digital Location product.
- Staging end-to-end run with Supabase persistence. Not claimed here.
- Founder visual sign-off (gate R).
