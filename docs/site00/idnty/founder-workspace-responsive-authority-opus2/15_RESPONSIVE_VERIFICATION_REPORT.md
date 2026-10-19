# 15 · Responsive verification report

## 1. What was executed

| Verification | Executed | Tool |
| --- | --- | --- |
| Automated layout audit | **720 renders** = 45 specimen states × 16 viewports | `boards/audit-layout.mjs`, Playwright Chromium |
| Per-board frame audit | 294 live frames inside 42 boards, same `measure()` | `boards/render-boards.mjs` |
| Uppercase audit | Every text node in every frame | `render-boards.mjs` |
| Font audit | `document.fonts.check` + computed family per text box | both scripts |
| Contrast | Token pairs computed (WCAG formula) | 13 §1.4.3 |
| Visual inspection | Rendered boards and specimens viewed by the author (see §4) | — |
| Real Safari (iPhone / iPad) | **Not executed**: Chromium only in this environment | — |
| Real browser zoom, screen readers, motion | **Not executed** (see 18 §2) | — |

## 2. Layout audit result

**720 / 720 renders pass every hard check.** Hard checks: overflow, collision, dimensions, inspector, truncation, multiline, minText, fonts. Stretch is a warning only.

| Check | Renders with a finding |
| --- | --- |
| overflow | 0 |
| collision | 0 |
| dimensions | 0 |
| inspector | 0 |
| truncation | 0 |
| multiline | 0 |
| minText | 0 |
| fonts | 0 |
| stretch (warning) | 56 |

### Per viewport

| Viewport | Tier | Renders | Pass | Stretch warnings |
| --- | --- | --- | --- | --- |
| 320x700 | M | 45 | 45 | 0 |
| 375x812 | M | 45 | 45 | 0 |
| 390x844 | M | 45 | 45 | 0 |
| 430x932 | M | 45 | 45 | 0 |
| 768x1024 | TP | 45 | 45 | 0 |
| 820x1180 | TP | 45 | 45 | 0 |
| 834x1112 | TP | 45 | 45 | 0 |
| 1024x768 | TL | 45 | 45 | 2 |
| 1194x834 | TL | 45 | 45 | 3 |
| 1280x800 | D | 45 | 45 | 0 |
| 1366x768 | D | 45 | 45 | 3 |
| 1440x900 | D | 45 | 45 | 4 |
| 1600x900 | D | 45 | 45 | 2 |
| 1920x1080 | UW | 45 | 45 | 12 |
| 2560x1440 | UW | 45 | 45 | 15 |
| 3440x1440 | UW | 45 | 45 | 15 |

Details: `verification/layout-audit.json`, `verification/layout-audit-summary.md`. Contact sheets (13 key states × 16 viewports): `verification/contact-sheets/`.

### Defects the audit found during the sprint and how they were fixed

| Found | Fix |
| --- | --- |
| Registry wider than its column at 1280 (overview) and 1600 + inspector | Registry reads its own container; 3-column variant from 600, 5-column from 920 with lower minimums |
| Quote table 349 px at 320 | TYPE and UNIT hidden below 560 px of panel width |
| Phone review bar overflow at 320; REQUEST REVISION truncated | Bar buttons wrap as rows (`flex: 1 1 140px; min-width: fit-content`) |
| Signals labels truncated at 320 | 2 × 2 below 360 |
| Inspector OPEN FOUNDATION truncated at 320 | Footer block flexes; arrow dropped below 340 |
| Revision note textarea overflowing on phones | Area values wrap |
| Ultra-wide registry and task rows with 450–560 px internal gaps | Capped column widths; task text ≤ 480 |
| Gallery type rows and density columns overlapping | Rows stack below 560; columns are containers |
| Sub-10 px counts (9.5) | Raised to 10 |
| Faint (#8f8d88) text below 4.5:1; input edge #b8b6b1 below 3:1 | Index numerals, stage numbers, placeholders → muted #6f6d68; input edge #8f8d88 |

## 3. Per-board visual verification (15 checks)

| Check | Meaning |
| --- | --- |
| C01 | Renders without page errors or failed requests |
| C02 | Every live frame reached its ready state |
| C03 | SITE 00 Display and Saira Semi Condensed loaded in every frame |
| C04 | No lowercase application copy (data and client text exempt) |
| C05 | Frames laid out at true viewport width (iframe width = viewport; scaling after layout) |
| C06 | No horizontal overflow / text outside the viewport in any frame |
| C07 | No overlapping text in any frame |
| C08 | No truncated mandatory label in any frame |
| C09 | No multiline button label in any frame |
| C10 | No text below 10 px in any frame |
| C11 | No font fallback in any frame |
| C12 | Inspector never wider than the viewport nor docked with stage < 680 |
| C13 | Authority legend and per-frame status chips present (§33 distinctions) |
| C14 | Illustrative data labelled; no real client; backend gaps marked G-xx |
| C15 | Visual inspection of the rendered PNG by the author |

| Board | C01 | C02 | C03 | C04 | C05 | C06 | C07 | C08 | C09 | C10 | C11 | C12 | C13 | C14 | C15 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-01 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| D-02 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| D-03 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-05 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-06 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-07 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-08 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-09 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-11 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-12 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-13 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| D-14 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| D-15 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-01 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-02 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-03 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-05 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-06 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-07 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-08 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-09 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TP-10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-01 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-02 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-03 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| TL-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-05 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-06 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-07 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-08 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-09 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| TL-10 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| C-01 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| C-02 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| C-03 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| C-04 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| C-05 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | FULL |
| C-06 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |
| C-07 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | THUMB |

C15: **FULL** = the board PNG was inspected at reading scale; **THUMB** = inspected on the all-boards contact sheet. The frames on every board are also covered by C06–C12.

Boards with a failing frame: none.

## 4. Status

| Field | Value |
| --- | --- |
| VISUAL_VERIFICATION | 42 boards rendered and inspected (full or thumbnail); 15 checks per board in `verification/board-visual-verification.json` |
| RESPONSIVE_VERIFICATION | 720/720 audited renders pass all hard checks at the 16 viewports |
| BROWSER_VERIFICATION | Playwright Chromium (bundled) only; specimens are proposal pages, not the live application |
| IPHONE_SAFARI_VERIFICATION | NOT PERFORMED (no device / WebKit in this environment) |
