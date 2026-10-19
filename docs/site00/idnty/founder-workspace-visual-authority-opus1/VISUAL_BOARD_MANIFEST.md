# Visual board manifest

**Status:** PROPOSED. Generated from `boards/board-manifest.json` by `boards/write-manifest-doc.py` after `boards/render-boards.mjs`. Boards are static Chromium renders at device scale 2; they are not screenshots of an implemented workspace.

**Renderer:** `boards/render-boards.mjs (Vite SSR data + Playwright Chromium, deviceScaleFactor 2)`. Data is loaded from source through the repository's Vite server (icons, business types, commercial config, add-on catalog, DF threshold objects).

**Totals:** 28 boards · boards with phone frames 16 · tablet 2 · desktop 15 · audits passed 28/28.

**Audit** = both fonts loaded (SITE 00 Display, Saira Semi Condensed) · no lowercase application text outside `.fw-data` · no page errors.

**Viewports:** M = iPhone Safari frame 390 × 844 · T = iPad 834 × 1112 / 1194 × 834 · D = desktop 1440 × 900 (plus 560 / 760 crops for menus and dialogs).

| # | Board | Round | Viewports | Image | Pixels | Audit | SHA-256 (first 16) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Global shell · mobile | A | M | `boards/board-01-global-shell-mobile.png` | 3456×5058 | PASS | `7d2d5d1574220c8b` |
| 02 | Global shell · desktop | A | D T | `boards/board-02-global-shell-desktop.png` | 4800×7466 | PASS | `5018deb7f0e8280c` |
| 03 | Overview · mobile | B | M | `boards/board-03-overview-mobile.png` | 2960×4943 | PASS | `15ad2a13643b2e8d` |
| 04 | Overview · desktop | B | D | `boards/board-04-overview-desktop.png` | 3140×5069 | PASS | `5e8e007028a4a8cf` |
| 05 | Foundations · mobile | B | M | `boards/board-05-foundations-mobile.png` | 2960×4943 | PASS | `9fd923d6669c708c` |
| 06 | Foundations · desktop | B | D | `boards/board-06-foundations-desktop.png` | 3140×5069 | PASS | `64462d2e45f63b5d` |
| 07 | Create client · mobile | B | M | `boards/board-07-create-client-mobile.png` | 2960×4960 | PASS | `a34e8925af17f886` |
| 08 | Create client · desktop | B | D | `boards/board-08-create-client-desktop.png` | 3140×5069 | PASS | `5aa460620dad944f` |
| 09 | Client foundation record · mobile | C | M | `boards/board-09-client-record-mobile.png` | 2960×4943 | PASS | `92e8cb5170ea4317` |
| 10 | Client foundation record · desktop | C | D | `boards/board-10-client-record-desktop.png` | 3140×5101 | PASS | `b84f9ca638589b3a` |
| 11 | Client intake + recommendations | C | M D | `boards/board-11-client-intake-recommendations.png` | 3140×5022 | PASS | `480df34cbbd5379f` |
| 12 | Client quote + commercial review | C | M D | `boards/board-12-client-quote-commercial.png` | 3140×5022 | PASS | `57d651b6fd088af0` |
| 13 | Reviews queue · mobile | C | M | `boards/board-13-reviews-queue-mobile.png` | 3560×2871 | PASS | `d9b0e176907b2828` |
| 14 | Reviews queue · desktop | C | D | `boards/board-14-reviews-queue-desktop.png` | 3140×2918 | PASS | `2b357e8b10397895` |
| 15 | Review detail · mobile | C | M | `boards/board-15-review-detail-mobile.png` | 3560×2871 | PASS | `c951bd2d47c05eae` |
| 16 | Review detail · desktop | C | D | `boards/board-16-review-detail-desktop.png` | 3140×5016 | PASS | `d2f0826ded1030de` |
| 17 | Operations · mobile | D | M | `boards/board-17-operations-mobile.png` | 3560×2839 | PASS | `980bff9d3f2366d7` |
| 18 | Operations · desktop | D | D | `boards/board-18-operations-desktop.png` | 3140×3585 | PASS | `43bb76e3341c9019` |
| 19 | Correspondence · mobile | D | M | `boards/board-19-correspondence-mobile.png` | 2960×2921 | PASS | `fdad6bdbb7eb68c0` |
| 20 | Correspondence · desktop | D | D | `boards/board-20-correspondence-desktop.png` | 3140×2918 | PASS | `48f44d45a24a0bba` |
| 21 | System · mobile | E | M | `boards/board-21-system-mobile.png` | 3560×5013 | PASS | `0cfef8029b3e936d` |
| 22 | System · desktop | E | D | `boards/board-22-system-desktop.png` | 3140×5069 | PASS | `d1efc2b1d079346b` |
| 23 | System · test lab | E | M D | `boards/board-23-system-test-lab.png` | 4056×5255 | PASS | `35f3528b2133651c` |
| 24 | Global overlays + interaction states | F | M D | `boards/board-24-global-overlays-states.png` | 4316×6431 | PASS | `1473c16af9f818dd` |
| 25 | Responsive component authority | F | M T D | `boards/board-25-responsive-components.png` | 4800×6668 | PASS | `fe5af90d7c840449` |
| 26 | Full navigation + page tree | F | — | `boards/board-26-navigation-page-tree.png` | 3758×4962 | PASS | `bec7aed159db92ef` |
| 27 | Component system overview | F | — | `boards/board-27-component-system.png` | 4152×5250 | PASS | `1c812119f251447e` |
| 28 | End-to-end founder workflow | F | M | `boards/board-28-end-to-end-workflow.png` | 4816×2914 | PASS | `24898dbc7c6b6d3f` |

## Frames per board

- **01 · Global shell · mobile:** SHELL ANATOMY · HOME · WORKSPACE MENU · ALL SIX DESTINATIONS · NOTIFICATION CENTER · SEARCH / COMMAND · CREATE · ENTRY
- **02 · Global shell · desktop:** DESKTOP · NAVIGATION + STAGE + CONTEXTUAL INSPECTOR · ACCOUNT MENU + ENVIRONMENT · TABLET PORTRAIT · 834 × 1112 · TABLET LANDSCAPE · 1194 × 834
- **03 · Overview · mobile:** OVERVIEW · FIRST SCREEN · OVERVIEW · SCROLLED · SIGNAL SELECTED → FILTERED WORK · EMPTY · NO FOUNDATIONS YET · ERROR · BACKEND UNAVAILABLE
- **04 · Overview · desktop:** OVERVIEW · DESKTOP · OVERVIEW · ITEM SELECTED
- **05 · Foundations · mobile:** REGISTRY · ALL · FILTER SHEET · SEARCH · NO RESULTS · ACTIVE FILTER · WITH TEST CLIENTS · LOADING
- **06 · Foundations · desktop:** REGISTRY + INSPECTOR · SORT MENU + ROW ACTIONS
- **07 · Create client · mobile:** 01 · CHOOSE KIND · 02 · VALIDATION · 03 · SYNTHETIC · NOT ALLOWLISTED · 04 · CREATING (DURABLE WRITE) · 05 · LINK READY · 06 · FAILURE / DUPLICATE
- **08 · Create client · desktop:** CREATE DIALOG · LINK READY · NEW ROW IN PLACE
- **09 · Client foundation record · mobile:** RECORD · FOUNDER MOVE · RECORD · CLIENT MOVE · MORE SECTIONS + ACTIONS · COPY LINK · CONFIRMED
- **10 · Client foundation record · desktop:** CLIENT WORKSPACE · OVERVIEW · WITH CONTEXT INSPECTOR
- **11 · Client intake + recommendations:** INTAKE · REVIEW-READY · INTAKE · IN PROGRESS / MISSING · RECOMMENDATIONS · THREE LAYERS · DESKTOP · INTAKE BESIDE RECOMMENDATION
- **12 · Client quote + commercial review:** QUOTE · AWAITING APPROVAL · APPROVE · CONFIRMATION · REVISE · ADJUSTMENT · DESKTOP · QUOTE WORKSPACE
- **13 · Reviews queue · mobile:** QUEUE · ALL · QUOTES · EXCEPTIONS · EMPTY · ALL CLEAR
- **14 · Reviews queue · desktop:** REVIEW WORKBENCH
- **15 · Review detail · mobile:** REVIEW DETAIL · IN REVIEW · DECISION SHEET · CONFIRMED · NEXT STATE · ALREADY PROCESSED / FAILED
- **16 · Review detail · desktop:** QUOTE APPROVAL · CLIENT REQUEST
- **17 · Operations · mobile:** OPERATIONS · ACTIVE WORK · PROJECT · STAGE + TASKS · TASK DETAIL SHEET · BLOCKED · CLIENT AUTH
- **18 · Operations · desktop:** RUNBOOK · STAGES · TASK INSPECTOR · DEPENDENCY VIEW
- **19 · Correspondence · mobile:** CORRESPONDENCE · MESSAGES · CLIENT THREAD · INVITATION · PREPARE + SEND GATE
- **20 · Correspondence · desktop:** LIFECYCLE EMAIL · DELIVERY + PREVIEW
- **21 · System · mobile:** SYSTEM · OVERVIEW · INFRASTRUCTURE · INTEGRATIONS · SECURITY · MODULE DETAIL · EMAIL SENDING
- **22 · System · desktop:** SYSTEM · OVERVIEW · MODULE INSPECTOR · READINESS REPORT
- **23 · System · test lab:** TEST LAB · CREATE SYNTHETIC CLIENT · TEST JOURNEY · EMAIL TIMELINE + GATED SEND · RESET · DESTRUCTIVE CONFIRMATION · DESKTOP · TEST LAB · RESULTS
- **24 · Global overlays + interaction states:** ROW MENU · CLIENT · DESTRUCTIVE CONFIRM · DIALOG · TOASTS · ERROR · INLINE + DETAIL · EMPTY · LOADING · STALE · CONTROL STATES · DESKTOP SEARCH · ⌘K · DESKTOP NOTIFICATIONS · SHEET ANATOMY
- **25 · Responsive component authority:** diagram / specimen sheet
- **26 · Full navigation + page tree:** diagram / specimen sheet
- **27 · Component system overview:** diagram / specimen sheet
- **28 · End-to-end founder workflow:** diagram / specimen sheet

## Required board coverage (§37)

| Requirement | Boards |
| --- | --- |
| Global shell, mobile + desktop + tablet | 01, 02, 25 |
| Overview, Foundations, create flow | 03–08 |
| Client record incl. intake, recommendations, quote | 09–12 |
| Reviews queue + detail | 13–16 |
| Operations | 17, 18 |
| Correspondence | 19, 20 |
| System + test lab | 21–23 |
| Overlays + interaction states | 24 |
| Responsive component authority | 25 |
| Navigation + page tree | 26 |
| Component system | 27 |
| End-to-end founder workflow | 28 |

Founder reference images (inputs, not outputs): `references/founder-reference-mobile-set-1.png`, `references/founder-reference-mobile-set-2.jpg`.
