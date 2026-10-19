# 34 · Verification report

## 1. Board render
- `render-boards.mjs` rendered **44 / 44 boards** at DSF 2, with **184 live frames**, all ready.
- Fonts: SITE 00 Display + Saira Semi Condensed loaded on every board.
- Lowercase application text (outside data such as emails and URLs): **0**.
- Page errors: **0**.
- Per-frame layout failures: **0**.
- Boards with any flag: **none**.

## 2. Responsive layout audit (`audit-layout.mjs`, Chromium)
59 states × 16 viewports = **944 renders, 942 passed** every hard check.

| CHECK | RENDERS WITH A FINDING |
| --- | --- |
| overflow | 2 |
| collision | 0 |
| dimensions | 0 |
| inspector | 0 |
| truncation | 0 |
| multiline | 0 |
| minText | 0 |
| fonts | 0 |
| stretch (warning) | 17 |

Failing renders:

| STATE | VIEWPORT | FINDINGS |
| --- | --- | --- |
| page=partner&p=mer&sec=2 | 1280x800 | overflow: ['stage 1117 > 1056'] |
| page=commissions | 1280x800 | overflow: ['stage 1100 > 1056'] |

Viewports: 320x700, 375x812, 390x844, 430x932, 768x1024, 820x1180, 834x1112, 1024x768, 1194x834, 1280x800, 1366x768, 1440x900, 1600x900, 1920x1080, 2560x1440, 3440x1440. Machine-readable results: `verification/layout-audit.json`, summary `verification/layout-audit-summary.md`, contact sheets `verification/contact-sheets/`.

Checks measured in the live DOM:
- overflow (page, stage, text outside viewport);
- same-layer text collisions;
- zero-size text;
- inspector docking below a 680 stage;
- truncation of mandatory labels (including commission state chips and signal labels);
- multi-line buttons;
- text < 10 px (card artwork and SVG excluded — printed-size type);
- non-SITE 00 font faces.

Card-artwork frames intentionally overlap (mockups, proof guides), so collisions are not counted there.

## 3. Visual quality gate (§49) — inspected on the rendered PNGs
| Gate | Result |
| --- | --- |
| Only SITE 00 Display + Saira Semi Condensed | PASS (font check per frame + audit `fonts` = 0) |
| All application copy uppercase | PASS (lowercase scan; data values such as emails/URLs exempt) |
| SYSTEM preserved in mobile bottom bar; five items; CREATE kept; FOUNDATIONS not renamed | PASS (R01, R42; visual) |
| REFERRALS reached via MENU on mobile, active there; header shows 06 REFERRALS | PASS (R01 menu frame) |
| No invented live financial data; no 15% / 30-day | PASS (spec tag on every page; terms show NOT SET) |
| AIO not shown as active | PASS (R06–R10) |
| Tablet-specific layouts (not scaled desktop/mobile) | PASS (R02, R03, R07, R17, R22, R27) |
| No truncated statuses / chips | PASS (audit `truncation`; two signal-label truncations found and fixed during the sprint) |
| Rectilinear geometry; no generic SaaS styling; no decorative charts | PASS (visual) |
| Placeholder QRs labelled NOT VALID FOR PRINT; no printable file | PASS (R29–R34) |
| Approved imagery only; reference not cropped into UI | PASS (doc 02 §5) |

Defects found by visual inspection and fixed in this sprint:
- mobile Card Studio card overflowing the stage;
- QR placeholder rendered as blobs (inherited SVG stroke);
- partner registry columns not applying at 600–899 (container-self query);
- link/QR panel squeezing text at desktop;
- spec tag widening the 320 px stage;
- signal label ellipsis;
- mockup cards collapsing to zero width;
- territory C front not distinct;
- proof canvas scaling artwork to bleed;
- TEST band hidden under the photograph.

## 4. Functional gate (§50) — specification level (no production code)
| Gate | Result |
| --- | --- |
| REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID | Specified (doc 16 §1–2), visible in ledgers and R44 |
| RECORD PAYMENT ≠ SEND PAYMENT | Specified (doc 17); SEND disabled in every specimen |
| Print export blocked until six conditions | Specified (doc 18 #13); PRINT PACKAGE disabled in specimens |
| No client-provided partner id as evidence | Specified (docs 14, 15 E13, 23) |
| Durable, non-guessable codes; existing `/invite/:code` | Specified (doc 21) |
| No parallel tables; reconciled to the actual schema; no SQL | Doc 25 |
| Two-way navigation REFERRALS ↔ FOUNDATIONS | Specified (doc 04 §5, RF-008/009, R43) |
| Live attribution / payments / messages | **Not executed** (none triggered) |

## 5. Build, tests, scope
Recorded in the PR body and the sprint report after `npm run build` and the targeted DF suites run. This sprint changes documentation only: no `src/`, `api/`, `shared/`, `server/`, `supabase/` or config files.

## 6. Not verified
- iPhone Safari and real devices (unavailable).
- Printing.
- Real QR scanning.
- Any backend behaviour (not implemented).
