# 09 · Desktop REFERRALS specification (1280–1919, ultra-wide ≥ 1920)

Boards: R04, R05, R08, R10, R13, R18, R19, R23, R24, R28, R38, R39, R40.

## 1. Shell
- Sidebar 224 / 248 with `06 REFERRALS` active (red index, red rule, badge = items needing the founder).
- Top bar: breadcrumb `06 — REFERRALS / <SECTION> / <RECORD>`, search *SEARCH CLIENTS, PARTNERS, REFERRALS* with ⌘K, notifications.
- Page header:
  - left: index + display headline (e.g. `REFERRALS.` 52 px), subline and the spec tag in specimens only;
  - right: an approved environment plate (pavilion / doorway / red-glass tall);
  - actions on the header baseline: CARD STUDIO, NEW PARTNER.
- Section tab row under the header: OVERVIEW · PARTNERS · ATTRIBUTION · COMMISSIONS (badge) · PAYOUTS · CARD STUDIO · ACTIVITY.

## 2. Pages

### Overview (stage 1216 at 1440)
- **Signals:** 5-up — ACTIVE PARTNERS · REFERRED LEADS · CONVERTED CLIENTS · PENDING APPROVAL (red when > 0) · TOTAL PAID OUT. Each shows its definition under the number.
- **Composition:**
  - stage 1100–1439: partners | money + activity (focus card hidden; the queue is in the signals);
  - stage ≥ 1440 (≥ 1920 viewports): three columns, partners | money | activity, with the Card Studio panel under partners.
- **Ultra-wide:** content max 1760, centred; never stretched rows.

### Partners
- Seven-column registry: PARTNER · TYPE / STATUS · REFERRALS · CONVERTED · OWED · CARD · ›. Row height ≥ 68.
- Selecting a row docks the inspector (346 at 1440). The registry then re-flows to its own width (four columns below 900).

### Partner detail
- Header: 112 px plate, name in display type, status mark, type, owner, contact, spec tag. Actions on the baseline: SHARE CARD · COPY LINK · MESSAGE · MORE.
- Section tabs. Content grid: main column + 360 context column.
- The link + QR panel puts the QR beside the facts once the panel is ≥ 460 px.
- AIO (planned): the checklist *BEFORE AIO CAN REFER CLIENTS*, the fixture conflict banner, WHY AIO, and a DESIGN ONLY card preview.

### Attribution
- Signals: REFERRED LEADS · CONVERTED CLIENTS · CONVERSION RATE · REFERRED REVENUE · OPEN EXCEPTIONS.
- Views: ALL · TRACKED · CONVERTED · EXCEPTIONS.
- Ledger (seven columns): REFERRAL · CLIENT · PARTNER · VIA · INTAKE · CONVERSION · COMMISSION.

### Source trace
- Timeline (left, wide), with evidence classes and linked records (right): CLIENT → FOUNDATIONS, ARTIFACT, LINK, COMMISSION, PAYOUT.

### Commissions
- Signals: PENDING APPROVAL · APPROVED UNPAID · TOTAL PAID OUT · REVERSED / ADJUSTED.
- State filters, then the ledger: CLIENT · PARTNER · TERMS · BASIS · AMOUNT · STATE · DATE.
- Inspector: calculation, history, APPROVE / ADJUST.

### Payouts
- Policy banner (no payout provider).
- Ledger: PAYOUT · PARTNER · AMOUNT · METHOD (type + last four) · STATE · DATE.
- Inspector: lines, totals, RECORD PAYMENT, with SEND disabled.

### Card Studio (stage ≥ 1440)
- Partner picker (280) | stage with card (≤ 520) + template picker A/B/C | controls (380).
- Controls: link, print gate (BLOCKED · n OPEN), share, digital PNG, and PRINT PACKAGE (disabled).

### Activity
- Filter tabs and a timeline with actor tags.

## 3. Overlays (desktop presentation)

| Presentation | Overlays |
| --- | --- |
| Dialog (600, or 720 for terms) | RO-01, 02, 03, 04, 05, 07, 09, 10, 12, 13, 15, 16, 17, 18, 19, 20 |
| Popover anchored to its trigger | RO-06 link preview, RO-08 share |
| Inspector | RO-11 commission detail, RO-14 payout detail |

Full list in doc 07 §3 and board R40.

## 4. Keyboard
- `J` / `K` move the row cursor; `↵` opens; `/` focuses search; ⌘K opens the palette.
- `Esc` closes overlays, except while a write is in flight.
- No multi-select or bulk approval (not proposed until a second-reviewer rule exists, FD-R18).

## 5. Short desktops (1366 × 768, 1280 × 800)
- The header plate shrinks and the title drops to 44.
- The signals strip remains above the fold.
- Ledgers keep at least five rows visible.
