# 13 · Partner detail specification

Boards: R09 (mobile, all seven sections + AIO), R10 (desktop). Components RF-030…RF-037.

## 1. Header (RF-031)
- Architectural plate · display name with red period · status mark · type · owner · contact email (founder only) · spec tag (specimens).
- **Actions:**
  - **SHARE CARD** — RO-08; available only with a validated link.
  - **COPY LINK** — copies the full public URL. The display stays masked.
  - **MESSAGE** — opens the correspondence composer and never sends automatically.
  - **MORE** — EDIT (RO-02) · INVITE (RO-03) · CHANGE STATUS (RO-04) · REVOKE ACCESS (RO-20).
- **PLANNED partners:** actions are PREPARE RECORD · INVITE (disabled until terms) · MORE. SHARE CARD and COPY LINK are absent.

## 2. Sections

| Section | Content | Empty / planned state |
| --- | --- | --- |
| **OVERVIEW** | Metrics (ATTRIBUTED REFERRALS · QUALIFYING CONVERSIONS · PENDING / APPROVED · PAID); REFERRED CLIENTS (client → FOUNDATIONS, conversion, commission state); REFERRAL LINK + QR (RF-036); CARD (current version) | Planned: banner *design specimen — no referral, agreement, link or payment exists*; **red conflict banner** when a repository fixture claims ACTIVE without an agreement; checklist **BEFORE <PARTNER> CAN REFER CLIENTS** (referral policy approved · agreement in place · partner record created · terms v1 set · durable link issued · QR verified on a real phone · card template approved); WHY <PARTNER>; CARD PREVIEW · DESIGN ONLY |
| **REFERRALS** | Attributed clients: client, referral id, date, via, conversion (PAID · date / QUOTE READY / —), commission state. Rows open the canonical client record | *NO ATTRIBUTED REFERRALS YET* |
| **COMMISSIONS** | Ledger scoped to the partner → RO-11 | — |
| **PAYOUTS** | Ledger scoped to the partner → RO-14 | — |
| **CARDS** | Current card (front + back), versions (V2 APPROVED, V1 ARCHIVED), **EXISTING ASSETS** (INVITATION 001 · AIO FRONT OFFICE fixture; AIO-OFFICE-BATCH-001 · print_status; renderInvitationQrSvg · EC level H), print status checklist | *NO CARD YET · OPEN STUDIO* |
| **TERMS** | Policy banner (*terms shown are an example structure (E-1); no rate, fee, basis or window is proposed — they are founder decisions FD-R01…FD-R10*); TERMS · VERSION n · EFFECTIVE date: compensation type, rate or amount, basis, trigger, attribution window, touch model, refund rule, payout timing — each `FD-Rxx · NOT SET` until decided; EDIT TERMS → RO-05; version history | *NO TERMS · A PARTNER CANNOT BE ACTIVE WITHOUT TERMS* |
| **ACTIVITY** | Partner events with actor tags | — |

## 3. Terms versioning
- A terms version is immutable once saved. Editing creates version n + 1 with an effective date.
- **Each attribution records the terms version that applied when it was captured.** Each commission records the version applied at eligibility. Past referrals keep their version.
- Terms are **never** printed on cards, shown on public pages, or exposed to other partners.

## 4. Mobile behaviour
- Sections are a horizontally scrolling row under the actions, with the current section in red and underlined.
- Content stacks in this order: metrics → main list → link + QR (QR above the facts) → card.

## 5. Data and security
- **Reads:** the partner, its terms versions, aggregates (referrals, conversions, owed, paid), its codes and its batches.
- **Partner contact data** is visible only to the founder role.
- **Display references:** the partner number and display id appear in URLs, never the database UUID.
