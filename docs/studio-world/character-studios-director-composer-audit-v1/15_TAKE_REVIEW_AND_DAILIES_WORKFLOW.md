# 15 — Take review and dailies workflow

## 1. Review systems today

| System | Evidence | What is reviewed | Persistence | Linked to generation |
| --- | --- | --- | --- | --- |
| THE EXCHANGE review state | `directorial/review.ts`; `PRODUCTION_SCENES/S1-01/REVIEW_STATE_V1.json` (65 elements, 5 steps) | Screenplay, direction, shots, keyframes, budget; change requests invalidate dependents | Repository JSON | No: one state per element, no takes |
| FILM founder dailies | `src/site00/pages/ProjectFilmProductionPage.tsx:249`; `review/founderDailies.ts` | APPROVE, ALT, REGENERATE, TOO_AI, WRONG_ENERGY on simulated candidates | Process memory | No (`assetUrl: null`) |
| EXPRESSION performance/takes | `expressionRoutes.ts`; `PerformanceFamily.tsx:180` | Nothing: "NO TAKES RENDERED", UNMOUNTED | — | — |
| ASSTS review | `api/admin/site00-assts.ts`; `site00_review_events` | Environment images: approve, reject, regenerate, lock | Supabase | Yes (images only, admin only) |
| Production graph ledger | `shared/site00-production-graph/ledger.ts`; `workspaceLedgerStore.ts` | APPROVE, REQUEST_REVISION, REJECT, RESOLVE on graph nodes | Browser storage | No |

Only ASSTS persists a decision tied to a generated file, and it is for environment images on an admin route.

## 2. Take record (sprint §19 fields)

| Field | Source |
| --- | --- |
| Shot ID, scene ID | Shot plan |
| Character, Look | Scene context (Character ID, Look ID and version) |
| Reference assets | Job inputs with purpose and hash |
| Provider, model | Job record |
| Prompt | Job record (stored in full, hashed) |
| Output duration | Measured from the stored file |
| Intended edited duration | Shot plan screen time (frames) |
| Generation cost | Quoted and actual credits from the job |
| Visual quality, identity consistency, wardrobe, spatial and prop continuity | Founder rating plus checks (method stated; advisory until G-CONT-01) |
| Audio accuracy, lip-sync status | Dialogue take reference and lip-sync job, for VISIBLE_SPEAKER shots only |
| Founder feedback | Free text with each decision |
| Approval status | State machine below |

## 3. Actions and states

```
RECEIVED → STORED → IN_REVIEW → APPROVED → SELECTED_FOR_EDIT
                         ├→ REVISION_REQUESTED (keeps the take; opens a new job with the note)
                         ├→ REJECTED (kept for provenance)
                         └→ HOLD (back to IN_REVIEW later)
any → INVALIDATED (an upstream change; reason recorded)
```

| Action | Backend behaviour it needs before it is shown |
| --- | --- |
| APPROVE | Take stored with hash (G-ASSET-01); decision persisted with actor and time |
| REVISE | Creates a linked job draft carrying the note; needs authorization to run |
| REJECT | Persists; the file is kept under the retention policy |
| HOLD | Persists; no downstream effect |
| SELECT FOR EDIT | Only from APPROVED; one selected take per shot; feeds the export (G-EDIT-01) |

**Rules:**
- **A take is not approved because a provider returned a file.** RECEIVED and STORED come before any decision.
- **"Production-ready" means:** stored, hashed, approved, and with no failed blocking check. Until checks exist (G-CONT-01), it means stored, hashed and approved.
- **Rejected takes are kept** with their records. Deleting files is a founder retention decision (D-15).

## 4. The dailies surface

**Where.** The existing `performance/takes` route (approved authority `04_Cast_Performance/03_takes`). Its empty state is replaced with persisted takes. No new navigation.

| Viewport | Layout |
| --- | --- |
| Phone | One take at a time: player on top; shot, cost and checks below. Fixed action bar with rectangular controls. Swipe or a list sheet to change take. The frame does not scroll; the details list scrolls |
| Tablet | Player and details side by side; take list as a strip |
| Desktop | Shot list, player, inspector |

**Where decisions flow.** INBOX shows takes awaiting a decision; ACTIVITY logs the decisions.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| D-R1 | Take record and state machine | Director Composer | G-TAKE-01, G-DATA-01 | Transition tests cover every action; SELECT FOR EDIT only from APPROVED |
| D-R2 | Mount takes in `performance/takes` | Studio World | D-R1, G-WS-01 | 390-px viewport plays a stored take, records a decision, no page scroll |
| D-R3 | Decisions to INBOX and ACTIVITY | Studio World | D-R2 | A decision appears in both within one reload |
| D-R4 | Retention policy | Founder | D-15 | Policy recorded; rejected takes kept accordingly |
