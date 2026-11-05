# 06 · Canonical menu information architecture (proposal)

Status: PROPOSED. Founder decision FD-01 / FD-02. The five-icon dock (HOME · MONEY · ADD · PLAN · CREDIT, `ProductNav.tsx:18-24`) is unchanged and is not
duplicated.

## Authorities to reconcile

| Authority | Approval | Content |
|---|---|---|
| F09 ACCOUNT DRAWER (`F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg`, REFERENCE_REPLICA1 06) | **APPROVED** (`REPLICA_MANIFEST.json`) | PROFILE · DISPLAY CURRENCY · CONNECTION · ASK JURNL CONTEXT · SAFE TO SPEND BUFFER · PRIVACY & CONSENTS · SIGN OUT |
| F09 ACCOUNT PAGES 1–3 (REFERENCE_REPLICA1 03–05) | **APPROVED** | P1 = drawer set · P2: NOTIFICATIONS, PRIVACY & CONSENTS, SECURITY, WEEK START & DATE FORMAT · P3: DATA EXPORT, HELP & SUPPORT, LEGAL, SIGN OUT |
| V3 GLOBAL MENU (`JURNL_GLOBAL_INTERACTIVE_V3_V1`) | **not approved** ("Nothing in this package is founder-approved") | ACCOUNT & PROFILE · PREFERENCES · PRIVACY & DATA · MY MEMBERSHIP · EXPLORE ADD-ONS · HELP & SUPPORT · SIGN OUT |
| Board panel 08 GLOBAL MENU DRAWER | founder review, **pending** | the same 7 rows as V3, editorial composition |
| Board panel 06 ACCOUNT / SETTINGS DRAWER | pending; conflicts with the approved F09 drawer | YOUR ACCOUNT · ACCOUNT & PROFILE · DISPLAY CURRENCY · PRIVACY & DATA · SIGN OUT |

## Proposed hierarchy, with differences recorded

| Section | Row | Opens (existing owner first) | New? | Difference vs approved F09 / V3 |
|---|---|---|---|---|
| **YOUR FINANCES** | CONNECTED ACCOUNTS & SYNC | CX-12 when built. Until then, an honest status folio: "NO BANK CONNECTED · POCKETS ARE ENTERED BY YOU" → `money/places`. | row new; destination new (08) | F09 "CONNECTION · SET UP" renamed and promoted |
| | CURRENCY & EXCHANGE | existing `CurrencySheet` + restored disclosure (RC-2) | row new | F09 "DISPLAY CURRENCY" renamed |
| | SAFE TO SPEND BUFFER | existing buffer card / F09 hold sheet | row new | F09 buffer promoted to the menu |
| **YOUR INTELLIGENCE** | ASK JURNL | existing explanation sheet (honest) → conversation later (17) | row new | F09 "ASK JURNL CONTEXT" toggle moves into PRIVACY & CONSENTS (AI consent), and the row opens Ask |
| | CLASSIFICATION & LEARNING RULES | RULES-A (18) when E ships; hidden until then (no placeholder row) | new | — |
| **YOUR ACCOUNT** | ACCOUNT & PROFILE | route `account` (3 pages, approved) | — | same as V3 |
| | PREFERENCES | NOTIFICATIONS, WEEK START & DATE FORMAT (ACCOUNT page 2), SECURITY → F01.12 | — | V3 opened the whole F09 drawer here. Proposal: PREFERENCES = non-financial preferences only. FD-01 decides between this and "keep the F09 drawer as one destination". |
| | PRIVACY & CONSENTS | `ConsentsSheet` extended: AI access + Ask context, DATA EXPORT request, DELETE ACCOUNT (F01.11), bank access (16) | — | V3 label PRIVACY & DATA → approved F09 label PRIVACY & CONSENTS |
| | MY MEMBERSHIP | `MembershipFolio` | — | same as V3 |
| | EXPLORE ADD-ONS | `AddOnCollection` | — | same as V3 |
| | HELP & SUPPORT | HELP folio (B07) | — | the V3 toast is replaced by an honest surface |
| | SIGN OUT | `signOut()` plus confirm and redirect | — | same label |

Row count: 12 (14 once rules ship). Each row stays at full legible size (no tiny type).

## Mobile fit (viewport contract)

At 393 × 852 the board-08 composition (`--jb` units, drawer 338 px) holds about 8 rows below the head before the fold. The rest go in a
**contained list scroll** inside `.jv3-drawer__body` (it is already `overflow-y: auto; overscroll-behavior: contain`), with the section titles
sticky. That is allowed by the canon for an intrinsically long list. There is no page-level scroll. On 393 × 660, the head composition shrinks with `--jb`
and the list scrolls.

Alternative (FD-02): a two-level folio, with the menu showing sections only and each section opening a nested folio. It is rejected as the default because it
adds a tap to every destination. That re-creates RC-1.

## Return navigation (normalize)

Every menu destination returns to the menu on close. Today PREFERENCES and ACCOUNT do not (05 RC-1(c)). Escape closes the whole stack.
