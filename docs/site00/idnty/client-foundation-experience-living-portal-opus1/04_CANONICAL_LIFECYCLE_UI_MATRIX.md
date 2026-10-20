# 04 — Canonical Lifecycle UI Matrix

**One state machine.** The source of truth is `DigitalFoundationArtifactState` (`shared/site00-digital-foundation/types.ts`) plus its transition table (`lifecycle.ts`). The client never holds lifecycle state in memory beyond the fetched payload. Everything below is a pure presentation function `(payload) → posture`. It is the same kind of derivation as the existing `deriveReviewState` / `deriveActivationState` / `foundationProgress`, and it lives in `model.ts` next to them. No new states are created, and no second state machine exists in the client, the boards or the docs.

## 1. Artifact state → client experience (all 17 states)

| Canonical state | Server surface | Client experience (family · hero) | Roadmap stage | Areas | Payment | Status |
|---|---|---|---|---|---|---|
| `INVITED` | PROSPECT | P01 entry | — | — | NONE | EXISTS |
| `OPENED` | PROSPECT | P01 entry | — | — | NONE | EXISTS |
| `INTAKE_IN_PROGRESS` | INTAKE | P02 / P03 intake | — | — | NONE | EXISTS |
| `INTAKE_COMPLETE` | REVIEW (proposed; today RECOMMENDATION/QUOTE, or INTAKE_SUBMITTED under launch gate) | A · YOUR FOUNDATION IS TAKING SHAPE | 02 FOUNDATION REVIEW (01 done) | OVERVIEW · ROADMAP · NEEDS YOU · RECORDS (intake summary) | NONE | PROPOSED · G-02 |
| `RECOMMENDATION_READY` | REVIEW until founder approval | A · review (auto-prepared, awaiting founder) | 02 FOUNDATION REVIEW | four areas | NONE | PROPOSED · G-02 |
| `QUOTE_READY` | QUOTE | B · YOUR PROPOSAL IS READY → I · PROPOSAL · J · OPTIONS | 03 PERSONALIZED PROPOSAL | four areas | NONE | EXISTS (P04) · re-skin |
| `AWAITING_ACCEPTANCE` | QUOTE | K · ACCEPT PROPOSAL V# | 04 APPROVAL & PAYMENT | four areas | NONE | EXISTS (P05) |
| `AWAITING_PAYMENT` | CHECKOUT | B/L · YOUR FOUNDATION IS READY TO BEGIN | 04 APPROVAL & PAYMENT | four areas | NONE / CHECKOUT_PENDING / FAILED | EXISTS (P05) |
| `PAID` | PORTAL | M · CONFIRMED → YOUR FOUNDATION IS UNDERWAY | 05 FOUNDATION SETUP | four areas | PAID | EXISTS (P06) |
| `PROJECT_ACTIVE` | PORTAL | B · UNDERWAY | 05 FOUNDATION SETUP | four areas | PAID | NOT WIRED |
| `IN_PROGRESS` | PORTAL | B · UNDERWAY · N · WORKSTREAMS | 05 FOUNDATION SETUP | four areas | PAID | NOT WIRED |
| `WAITING_ON_CLIENT` | PORTAL | B · YOUR FOUNDATION NEEDS YOU · D | 05 · NEEDS YOU (or BLOCKED) | four areas, NEEDS YOU badge | PAID | NOT WIRED |
| `WAITING_ON_PROVIDER` | PORTAL | B/N · WAITING ON PROVIDER (nothing needed from you) | 05 · WAITING ON PROVIDER | four areas | PAID | NOT WIRED |
| `FINAL_VERIFICATION` | PORTAL | O · FINAL VERIFICATION | 06 FINAL VERIFICATION | four areas | PAID | NOT WIRED |
| `COMPLETE` | COMPLETE | P · YOUR FOUNDATION IS ESTABLISHED | 07 COMPLETE | four areas | PAID | EXISTS (legacy surface) · re-skin |
| `BUILD_OPPORTUNITY` | BUILD_UPSELL | P · ESTABLISHED + INTEREST SENT | 07 COMPLETE | four areas | PAID | EXISTS (legacy surface) |
| `ARCHIVED` | closed | S · THIS LINK HAS BEEN CLOSED | — | none | any | EXISTS |

## 2. Client roadmap stage derivation (presentation only)

```ts
// model.ts (proposed) — derived, never stored
export type ClientStage = 0 | 1 | 2 | 3 | 4 | 5 | 6; // INTAKE RECEIVED … COMPLETE
export function clientStage(p: ClientDigitalFoundationPayload): ClientStage {
  const s = p.artifact.state;
  if (s === 'COMPLETE' || s === 'BUILD_OPPORTUNITY') return 6;
  if (s === 'FINAL_VERIFICATION') return 5;
  if (p.artifact.payment_state === 'PAID') return 4;          // PAID, PROJECT_ACTIVE, IN_PROGRESS, WAITING_ON_*
  if (s === 'AWAITING_ACCEPTANCE' || s === 'AWAITING_PAYMENT') return 3;
  if (s === 'QUOTE_READY' && p.quote?.founder_commercial_ready) return 2; // G-02: proposal only after founder approval
  return 1;                                                    // INTAKE_COMPLETE, RECOMMENDATION_READY, unapproved QUOTE_READY
}
```

Stage 0 (INTAKE RECEIVED) is always DONE once the client reaches the portal. The current-stage marker (in progress, needs you, waiting, blocked) comes from the stage row for stage 4 (FOUNDATION SETUP), or from client actions before payment:

| Marker | Rule |
|---|---|
| NEEDS YOU | any OPEN client action (or project_state WAITING_ON_CLIENT) |
| BLOCKED · NEEDS YOU | a stage with status BLOCKED whose unblock is a client action |
| WAITING ON PROVIDER | project_state WAITING_ON_PROVIDER or stage NEEDS_PROVIDER, and no OPEN client action |
| IN PROGRESS | otherwise |

## 3. Sub-state → UI

| Sub-state | Values | UI consequence |
|---|---|---|
| payment_state | NONE · CHECKOUT_PENDING · PAID · FAILED · REFUNDED · DISPUTED | L ready · L “checkout open” · M/B underway · L failed · S payment recovery · S payment recovery |
| quote.status | DRAFT · READY · CLIENT_REVIEW · ACCEPTED · SUPERSEDED · EXPIRED · PAID | hidden · hidden until founder approval (G-02) · I proposal · K accepted → L · struck version, unpayable · K expired (read-time `expires_at`) · records |
| ReviewState (existing) | 11 values | K/L state selection: READY_TO_REVIEW, AWAITING_ACCEPTANCE, SCOPE_CHANGED, AWAITING_FOUNDER_PRICING, READY_FOR_CHECKOUT, CREATING_CHECKOUT, CHECKOUT_ERROR, PAYMENT_CANCELLED, PAYMENT_PENDING, QUOTE_EXPIRED, NOT_READY |
| ActivationState (existing) | 10 values | M state selection: VERIFYING_PAYMENT → “CONFIRMING”, PAYMENT_CONFIRMATION_PENDING → “STILL CONFIRMING”, ACTIVATION_ERROR → “WE COULDN’T CONFIRM YET”, PAID states → “YOUR FOUNDATION IS UNDERWAY”, PROJECT_PAUSED → S payment recovery |
| stage.status | WAITING · IN_PROGRESS · NEEDS_CLIENT · NEEDS_PROVIDER · COMPLETE · BLOCKED | workstream chip: NOT STARTED · IN PROGRESS · NEEDS YOU · WAITING ON PROVIDER · DONE · BLOCKED |
| client action | OPEN (+draft) · OPEN (+response) · COMPLETED · CANCELLED · dependency | OPEN · IN PROGRESS · SUBMITTED · RESOLVED · hidden · BLOCKED (G-04–G-06) |

## 4. Board coverage

Every row in §1 appears on at least one mobile and one desktop board (see `30_VISUAL_BOARD_MANIFEST.md`). Cross-tier X05 shows the mapping, and X06 shows founder/client parity.
