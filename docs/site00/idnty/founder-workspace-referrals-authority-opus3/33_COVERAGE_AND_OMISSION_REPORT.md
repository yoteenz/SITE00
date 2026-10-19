# 33 · Coverage and omission report

## 1. Coverage

| REQUIREMENT | WHERE | STATUS |
| --- | --- | --- |
| Seventh destination REFERRALS integrated (nav, page registry, component registry, routes, search, notifications, activity, permissions, responsive, overlays, diagnostics, Composer plan) | docs 04, 05, 06, 30, 32 · RF-001…RF-009 · R42 | COVERED |
| Mobile bottom nav HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM preserved; REFERRALS via MENU | docs 04 §2, 11 §1 · R01, R42 · RF-002 | COVERED |
| Reference image preserved characteristics + corrections | doc 02 | COVERED |
| No live values, no 15%, no 30-day window | docs 02 §3, 16 · spec tag on every page | COVERED |
| Two card systems not combined | docs 03 §6, 18, 19 · R30 callout | COVERED |
| AIO as planned partner; no record, agreement or payment invented | docs 12 §2, 13 · R09, R10 | COVERED |
| Existing infrastructure audit incl. #1657 FK repair | doc 03 | COVERED |
| 10 metrics with source, calculation, period, filter, empty, error | doc 07 §1 | COVERED |
| Partner management + detail (7 sections) | docs 12, 13 · R06–R11 | COVERED |
| Attribution architecture (durable, non-guessable, server-validated) | doc 14 · R12–R15, R43 | COVERED |
| ≥ 20 attribution edge cases | doc 15 (21) | COVERED |
| Policy register FD-R01…FD-R20, all open | doc 29 · data/policy-register.json | COVERED |
| Commission engine + 10-state machine | doc 16 · R18, R19, R44 | COVERED |
| Commissions ledger | doc 16 §4 · R16–R18 | COVERED |
| Payouts: RECORD ≠ SEND; never paid because approved | doc 17 · R21–R25 | COVERED |
| Financial controls | doc 27 | COVERED |
| Card Studio 15 functions | doc 18 §2 | COVERED |
| Physical card territories A/B/C, front + back, flat + mockup, finish + complexity | doc 19 · R29, R30 | COVERED |
| Print-production spec (bleed, safe, CMYK, QR size + quiet zone, paper) | doc 20 · R34 | COVERED |
| Print export blocked until six conditions; print path order | docs 18 §5, 20 · R33 | COVERED |
| QR security + link contract | doc 21 · R31 | COVERED |
| Digital card actions | doc 18 #9–#11 · R32 | COVERED |
| Partner portal (separate, masked) + six auth states | doc 22 · R35–R38 | COVERED |
| Analytics evidence classes | docs 14 §3, 24 §5 · R14 | COVERED |
| Activity timeline | doc 24 · R39 | COVERED |
| Independent responsive authority (desktop, TP, TL, mobile) | docs 08–11 · R01–R05 etc. | COVERED |
| Component tree + registry RF-001+ | doc 06 (66 RF + 22 RO) | COVERED |
| 20 overlays with trigger, presentation, validation, confirmation, error, success, M/T/D, focus | doc 07 §3 · R40 | COVERED |
| ≥ 44 boards in groups A–H | doc 28 (44) | COVERED |
| Security / privacy requirements | doc 23 | COVERED |
| Form-control coordination FD-1…FD-6 | doc 30 §2 | COVERED |
| Asset handling (reuse approved imagery, document needs) | docs 02 §5, 19 §6 | COVERED |
| Data model reconciled to actual schema, no SQL | doc 25 | COVERED |
| API / backend gap matrix with classifications | doc 26 | COVERED |
| Composer roadmap phases 0–14, pre-policy vs approval | doc 32 | COVERED |
| Visual quality gate (§49) | doc 34 §3 | COVERED |
| Functional gate (§50) | doc 34 §4 | COVERED |

## 2. Deliberate omissions

| ITEM | REASON | WHEN |
| --- | --- | --- |
| Live browser verification on iPhone Safari | No iOS device or Safari available in this environment; Chromium only | Founder device check before P9/P11 acceptance |
| Real QR codes / scannable artwork | Forbidden before link, partner and validation exist | P11 |
| Print-resolution photography, Pantone match | Asset needs A-01…A-04 (doc 19 §6) | Before P11 |
| Partner-facing copy for terms | Depends on FD-R01…R06 | P10 |
| Charts / trend lines | No stored series exists; decorative charts excluded | P12 |
| Implementation, migrations, API code | Sprint forbids production features and SQL | Phases 1–14 |

## 3. Gap classifications used
- **EXISTS** — usable as is.
- **EXTEND** — exists; needs additions.
- **FIX** — exists with a defect.
- **NEW** — must be built.
- **POLICY** — blocked on a founder decision.

See doc 26. Counts: FIX 9; EXTEND 5; NEW 15; POLICY-BLOCKED 9 (some gaps carry two classes).
