# AIO — Client Project Room Blueprint (non-live test instance)

**Status:** PROPOSED_BY_OPUS · simulation only.

This sprint did none of the following:

- created no AIO client account and sent no invites;
- wrote no real client data;
- requested or stored no provider credentials;
- ran no paid generations.

**Purpose:** prove the general SITE 00 client-room model on AIO's real situation, without hard-coding anything AIO-specific. AIO here is *data*: project type, funding mode, families. It is not a code branch.

---

## 1. Scenario inputs

| Field | Value | Source |
|---|---|---|
| Project | ALL IN ONE ENTERPRISES (AIO): trucking & logistics services. Hero offers are Permitting + Dispatching; social marketing is deferred by the owner. | Repo: `api/_lib/site00Projects/projectRegistry.ts`, `aioProjectAdapter.ts`, seed launch manifest |
| Project type | **CLIENT_PROJECT** (proposed; repo calls it MANAGED_BRAND) | Ground Zero registry map, decision U4 |
| Canonical slug | **OPEN** — the repo uses both `aio` and `all-in-one-enterprises`, and binds skins by substring match | Founder decision |
| Identity starting state | **00 STARTING AT ZERO** | Founder brief |
| Product starting state | **EXISTING PRODUCT · RECONSTRUCTION** | Founder brief |
| Labor | **WAIVED** (family relationship) | Founder brief |
| Generation | **CLIENT FUNDED**: the client funds her own OpenArt credits | Founder brief |
| Funding mode | `WAIVED_LABOR_CLIENT_FUNDS_EXPENSES`, with expense mechanism `CLIENT_FUNDED_PROVIDER` | `SITE00_CLIENT_FUNDING_MODEL.json` |
| Current phase | **IDENTITY** | Founder brief |
| Upcoming | **FAMILYIZATION** | Founder brief |
| Client | **NOT YET ONBOARDED** | Ground Zero onboarding gate (all gates currently FAIL or PARTIAL) |

**Discrepancy to resolve.** The repo's AIO bootstrap describes an *existing operating brand* with a skin of NEW_SKIN_TO_DESIGN and visual authority NOT_STARTED. The founder canon says identity starts at **00 STARTING AT ZERO**. The founder canon wins. The bootstrap record should be updated when the registry is canonicalised (Ground Zero D04).

**OpenArt reality.** There is no OpenArt API integration in the repo; all OpenArt usage so far is manual and recorded by hand in ledgers. AIO's "connect provider" is therefore a **DELEGATED_ACCOUNT** connection with a **manually attested** balance:

- SITE 00 never asks for her OpenArt password.
- If OpenArt offers no safe sharing mechanism, AIO falls back to **CLIENT_REIMBURSED**: SITE 00 spends, and she reimburses per family against a founder-approved estimate.

## 2. HOME (393×852)

```
┌───────────────────────────────────┐
│ ◆ ALL IN ONE ENTERPRISES   🔔  ≡  │
├───────────────────────────────────┤
│ CURRENT MOMENT                    │
│ WAITING ON YOU                    │
│ IDENTITY DIRECTION REVIEW.        │
│ WHEN YOU APPROVE, WE MOVE INTO    │
│ FAMILYIZATION.                    │
│ ─────────────────────────────────│
│ NEEDS YOU · 2                     │
│ ▸ REVIEW  IDENTITY DIRECTION      │
│   WHY: SETS EVERYTHING THAT       │
│   FOLLOWS · ~10 MIN   [ REVIEW → ]│
│ ▸ CONNECT  PRODUCTION CREDITS     │
│   WHY: FAMILY 01 USES YOUR        │
│   OPENART CREDITS · ~5 MIN        │
│                       [ CONNECT ] │
│ ─────────────────────────────────│
│ NEXT                              │
│ FAMILYIZATION → FAMILY 01         │
│ ESTIMATED PRODUCTION $22–$40      │
│ ABOUT 7,500–13,000 CREDITS        │
│ ─────────────────────────────────│
│ SPENT SO FAR  $0 · LABOR WAIVED   │
├───────────────────────────────────┤
│ HOME  PROJECT  REVIEWS INBOX LIBR │
└───────────────────────────────────┘
```

- **Where the estimate comes from:** it is seeded from JURNL F02, a family of about 23 generations plus repairs: 9,471 credits ≈ $28.41 at $0.003 per credit. It stays a range until AIO has its own completed family.
- **Who approves it:** the founder approves estimate visibility before HOME shows it.

## 3. PROJECT

- **SUMMARY:**
  - Scope: identity from zero, plus reconstruction of the existing product.
  - Phase: IDENTITY.
  - Price: labor WAIVED.
  - Production expenses: client-funded, $0 spent.
- **JOURNEY:**
  - CURRENT: IDENTITY.
  - NEXT: FAMILYIZATION.
  - LATER: FAMILY production (count TBD by familyization), then launch.
- **FAMILY ROADMAP:** empty until familyization. It shows one sentence: "FAMILIES ARE DEFINED AFTER YOUR IDENTITY IS APPROVED."
- **COST CENTER:**
  - Service price: WAIVED.
  - Paid / remaining: n/a.
  - Third-party production spend: $0.
  - Next estimate: range shown, marked ESTIMATED.
  - Payer: CLIENT (OpenArt).
- **UPDATES:** "IDENTITY DIRECTION IS READY FOR YOU" · "WE STARTED YOUR IDENTITY" · "WELCOME TO YOUR PROJECT ROOM".

## 4. REVIEWS → FAMILY REVIEW (Identity Direction)

The authority fills the screen. Under it, briefly:

- IDENTITY DIRECTION
- PURPOSE: HOW AIO LOOKS AND SOUNDS
- WHAT CHANGED: FIRST VERSION
- V1
- COST ON THIS STEP: INCLUDED (no client-funded generation yet)

Two labelled controls follow: **♥ APPROVE** and **× NEEDS REVISION**.

- **NEEDS REVISION** expands "WHAT ISN'T WORKING FOR YOU?". SEND REVISION REQUEST is disabled until the validation contract is met.
- **APPROVE** shows the APPROVED state with an undo window. The system then emits `IDENTITY_APPROVED`, and FAMILYIZATION becomes READY_TO_BEGIN.

## 5. Funding moment (between families)

After familyization, the founder approves Family 01's estimate for visibility. The client then sees the NEXT FAMILY ADVANCE sheet:

```
FAMILY 01 — <name from familyization>
WHAT WE'LL BUILD   <one line>
ESTIMATED PRODUCTION  ~25–35 GENERATIONS
ESTIMATED CREDITS     7,500–13,000
ESTIMATED COST        $22–$40   (ESTIMATED)
PROVIDER              OPENART · CONNECTED · BALANCE ATTESTED 14,200 (OCT 5)
                      [ READY TO ADVANCE ]
```

- **If the balance is insufficient:** the sheet shows **NEEDS FUNDING** and the family stays `AWAITING_PRODUCTION_FUNDING`.
- **The client never presses GENERATE.** Production advances through the founder.

## 6. INBOX and LIBRARY

- **INBOX:** a thread with the founder. It may hold an upload request, for example "UPLOAD YOUR CURRENT LOGO FILES".
- **LIBRARY:**
  - REFERENCES: her uploads.
  - IDENTITY: populated after approval.
  - FINAL FILES: at the end.

## 7. Founder side (same truth)

| Client sees | Founder controls (production workspace / CONTROL) |
|---|---|
| READY FOR YOU | SEND TO CLIENT from PW.INBOX or DESIGN |
| Estimate range | APPROVE ESTIMATE FOR CLIENT VISIBILITY |
| OpenArt CONNECTED · attested balance | CLIENT RELATIONSHIP: provider authorization, attestation, spend vs limit |
| Revision notes | PW.INBOX client lens: classify IN_SCOPE vs SCOPE_CHANGE |
| Updates | Curation rules |

## 8. JURNL check (generalisation proof)

The same model applied to JURNL, a **PERSONAL_PROJECT**:

- There is no client user, and REVIEWS shows founder self-approval.
- INBOX is hidden, because there is no counterpart.
- The funding mode is SITE00_INCLUDED, and the cost center shows the founder's own ledger.
- The F01 and F02 actuals come from `GENERATION_LEDGER.json`.

No component changes are needed; only capabilities differ by project type.

## 9. Onboarding gate (unchanged from Ground Zero)

AIO's real account is created only when every gate below passes:

- CLIENT AUTH
- PROJECT ROOM
- FIREWALL
- REVIEWS
- APPROVAL RETURN LOOP
- INBOX
- LIBRARY
- PERMISSIONS
- INVITE
- AIO SCOPE / BUDGET / TIMELINE are READY

Status today: all FAIL or PARTIAL.
