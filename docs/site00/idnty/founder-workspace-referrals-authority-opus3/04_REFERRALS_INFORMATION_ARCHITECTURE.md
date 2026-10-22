# 04 · REFERRALS information architecture

## 1. Position in the workspace

REFERRALS is the **seventh founder-workspace destination**, inserted between CORRESPONDENCE and SYSTEM:

| Index | Destination | Change |
| --- | --- | --- |
| 01 | OVERVIEW | — |
| 02 | FOUNDATIONS | — |
| 03 | REVIEWS | — |
| 04 | OPERATIONS | — |
| 05 | CORRESPONDENCE | — |
| **06** | **REFERRALS** | **new** |
| 07 | SYSTEM | renumbered from 06 |

The reference image draws REFERRALS as **05**; that would renumber CORRESPONDENCE. The specimens use 06 and the question is open as **FD-R20**.

It is one destination with seven sections. **There is no second dashboard**: REFERRALS reuses the OPUS1 shell (SH-01), OPUS2 responsive tiers, the inspector host (SH-12), overlay host (SH-13), shared components (SC-xx) and the FD-1…FD-6 form-control grammar.

## 2. Navigation per tier

| Tier | Where REFERRALS lives | Active indication |
| --- | --- | --- |
| Desktop ≥ 1280 | Sidebar row `06 REFERRALS` with badge | Red index + red rule + text weight; `aria-current="page"` |
| Tablet landscape 1024–1279 | Rail item `REFERRALS` (share glyph) with badge | Red glyph + label; left red bar |
| Tablet portrait 768–1023 | Rail item (same) | Same |
| Mobile < 768 | **Workspace MENU drawer** row `06 · REFERRALS` | Row highlighted, red badge; page header shows `06 / REFERRALS.` |

**Mobile bottom bar is fixed:** HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM, in that order.
- REFERRALS is never added as a sixth item and never replaces SYSTEM.
- FOUNDATIONS is not renamed CLIENTS, and CREATE remains.
- While REFERRALS is open, no bottom item is selected.

Boards: R01, R02, R04, R42.

## 3. Sections

| # | Section | Question it answers | Primary object | Board |
| --- | --- | --- | --- | --- |
| 1 | OVERVIEW | What needs me, and how is the programme doing? | Summary read model | R01–R05 |
| 2 | PARTNERS | Who refers for us, and in what state is each relationship? | Partner | R06–R11 |
| 3 | ATTRIBUTION | Which client came from which partner, card or link, and with what evidence? | Attribution | R12–R15 |
| 4 | COMMISSIONS | What is owed, why, and in which state? | Commission entry | R16–R20 |
| 5 | PAYOUTS | What has been paid outside SITE 00 and recorded? | Payout | R21–R25 |
| 6 | CARD STUDIO | What does each partner hand out, and is it safe to print? | Card template / link / proof | R26–R34 |
| 7 | ACTIVITY | What happened, in order, recorded by the system? | Business event | R39 |

**Navigation between sections:**
- Desktop and tablet: a section tab row.
- Phones: a section-select button that opens an editorial selection sheet (RO-S, FD-1…FD-6 grammar).
- Mobile pickers use a square sheet with a 2 px red edge.

## 4. Object model and relationships

```
PARTNER ──< TERMS VERSION
   │
   ├──< CAMPAIGN ──< BATCH (print status)
   │        └──< CODE (public, opaque) ──< VISIT ──< ACTIVATION ──> DF ARTIFACT (= the client)
   │                                                              │
   └──< ATTRIBUTION (one per DF artifact) <────────────────────────┘
            └──< COMMISSION ENTRY ──< ADJUSTMENT
                        └──> PAYOUT ──< PAYMENT RECORD
EVERY STATE CHANGE ──> REFERRAL BUSINESS EVENT (append-only)
```

The chain the founder reasons about is **PARTNER → LINK → QR → PROSPECT → DF ARTIFACT → PAYMENT → COMMISSION ELIGIBILITY → PAYOUT → AUDIT** (boards R43, R44).

## 5. Bidirectional navigation with FOUNDATIONS

- **REFERRALS → PARTNER → CLIENT:** a referred-client row opens the canonical client record in FOUNDATIONS (`/foundations/:clientRef`). No referral-specific client page exists.
- **FOUNDATIONS → CLIENT → REFERRAL SOURCE:** the client record gains a REFERRAL SOURCE block (RF-008) showing the partner, via, and attribution state. It links to the source trace.
- Referred clients **remain ordinary DF clients**:
  - same intake, recommendations, quote, payment and lifecycle;
  - no duplicate intake, quote or payment flow;
  - client-facing projections never show referral data (`clientProjection.ts`).

## 6. Cross-workspace integration

| Surface | Integration | Component |
| --- | --- | --- |
| Global search | Partners, referral / commission / payout ids | RF-004 |
| Notifications | Commission awaiting approval, attribution exception, partner activation, QR validation failure | RF-005 |
| Activity (workspace + client) | Referral events appear in the client activity when they concern that client | RF-090, CR-12 |
| Permissions | View / approve / record / correct / revoke | RF-006 |
| Responsive behaviour | OPUS2 tiers and container queries | doc 08 |
| Overlays | RO-01…RO-20 in SH-13; RO-11 / RO-14 in SH-12 | doc 07, R40 |
| System diagnostics | Persistence mode, webhook coverage, QR origin checks | RF-007 |
| Composer plan | Phases 0–14 | doc 32 |

## 7. Separate surfaces (not inside the founder workspace)

- **Public entry** — `/invite/:code`, existing `InvitationEntryPage`; states valid / invalid / revoked / paused / test (R32).
- **Partner portal** — a separate, authenticated, privacy-masked app for partners: HOME · MY CARD · EARNINGS · TERMS (R35–R38, doc 22). Possession of a referral URL never grants access.
