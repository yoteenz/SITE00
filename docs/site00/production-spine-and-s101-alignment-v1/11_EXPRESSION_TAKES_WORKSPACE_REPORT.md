# 11 — EXPRESSION Takes workspace report

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, §24, §25 and §27, decisions D-07 and D-08. Branch `claude/studioworld-production-record-spine`.

## 1. Where it lives

**Route:** `/production/the-exchange/expression/performance/takes`, under **EXPRESSION → 04 CAST + PERFORMANCE → TAKES**.

**No new navigation.**

- The seven global tabs are unchanged: HUB, INBOX, EXPERIENCE, DESIGN, EXPRESSION, LIBRARY, ACTIVITY.
- The Performance family keeps its four routes: root, scenes, beats, takes.

**How a project gets this screen.**

- `ExpressionFamilyScreen` renders `ProductionTakes` only when the project is on the production record spine (`productionSpine: true` in the managed registry) and the route is `takes`.
- Every other project, and every other family route, is unchanged.
- THE EXCHANGE's other EXPRESSION routes show the existing project-scoped "no campaign entry" state. They never show NDXBOOK data.

**THE EXCHANGE as a managed project (§27).**

- **Registry entry:** `SERIALIZED_FICTION`, founder-owned, `designEnabled: false` (it has no site or page families), `productionSpine: true`.
- **Project switcher:** listed, through `listProductionManagedProjects`.
- **Production graph:** one EXPRESSION node, so its EXPRESSION domain is established and its DESIGN and EXPERIENCE domains stay NOT_ESTABLISHED. The capability map now has its row.
- **Canon:** JURNL, Frontal Slayer, AIO and Astral World are untouched. THE EXCHANGE's canon stays in `THE_EXCHANGE/`; the spine reads it.
- **Cast:**
  - Sloane, Gideon, Kai and the rest of the cast stay project-local.
  - `exchangeActorAdapter` lists them as NOT_IMPORTED candidates for the global Actor Catalogue.
  - Its import call is refused until the founder decides.

## 2. What it shows (§24)

| §24 item | Where |
| --- | --- |
| Project, release, scene, shot | SHOTS panel: THE EXCHANGE · 86 releases · 127:40; S1-01 Dusk · 45 s; screenplay status; shot rows |
| Generation status | REQUIREMENTS: setup and generation status chips, each job's status and quote |
| Take thumbnail or preview | TAKE panel: the stored copy through a five-minute signed read (`<video>`) |
| Provider and model | TAKE facts |
| Duration | TAKE facts (probed from the stored copy) |
| Continuity status | TAKE facts |
| Estimated cost / actual cost | TAKE facts and REQUIREMENTS (credits; UNKNOWN or NOT AVAILABLE where so) |
| Review decision | state chip: READY FOR REVIEW, APPROVED, HELD, REJECTED or SELECTED FOR EDIT |
| Approval history | HISTORY panel: each decision, its role, time and note |
| Source-asset references | HISTORY panel: start frame and take master, with hashes |

## 3. Actions

APPROVE, HOLD, REJECT and SELECT FOR EDIT (DESELECT FOR EDIT once selected).

- **Each action is a real write.** It POSTs to `/api/site00/production-spine`, which writes an immutable APPROVAL record and updates the TAKE.
- **Unavailable actions stay visible.** An action the viewer may not take is disabled and carries the server's reason. For example, a reviewer sees APPROVE disabled, with "needs FOUNDER".
- **GENERATE is real but disabled.** It is wired to the gated dispatch endpoint and carries every gate reason. In the live catalogue the first reason is PROVIDER_EXECUTION_DISABLED, followed by seven more.

## 4. Live catalogue and test data

**The live catalogue** is the repository records.

- SH01 has **no takes**.
- The TAKE panel reads "NO TAKES YET · GENERATION AUTHORIZATION PENDING · NOTHING HAS BEEN GENERATED".
- No demo footage was put into it. The live store refuses fixtures.

**Test data** is served from a temp directory outside the repository.

- In development it appears only when `SITE00_PRODUCTION_SPINE_FIXTURE_ROOT` is set, never when `NODE_ENV=production`. In the checks below it is routed in-process.
- It carries a red dashed outline and the banner **TEST FIXTURE DATA — NOT THE PRODUCTION CATALOGUE**.
- Every take note says TEST FIXTURE.

## 5. Responsive check (§25)

**How it was run.**

- `scripts/production/takes-viewport-check.ts`, against the Vite dev server.
- Pre-installed Chromium.
- The spine API is served in-process over a test store holding one captured test take.

**Results.**

| Viewport | Page | Authority frame | Bottom nav | Controls | Video box | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 390 × 844 (touch) | no scroll | no scroll | visible | 28 px tall, all on screen | 119 × 212, inside its panel | HOLD tapped → record HELD |
| 834 × 1194 (touch) | no scroll | no scroll | visible | 30 px, all on screen | 188 × 335 | |
| 1440 × 900 | no scroll | no scroll | visible | 30 px, all on screen | 244 × 473 | APPROVE by keyboard (focus + Enter) → record APPROVED |
| 2560 × 1440 | no scroll | no scroll | visible | 30 px, all on screen | 459 × 1013 | SELECT FOR EDIT clicked → `selectedForEdit: true`, 3 approvals |
| 390 × 844, live catalogue | no scroll | no scroll | visible | GENERATE disabled with reasons | — | NO TAKES YET |
| 1440 × 900, live catalogue | no scroll | no scroll | visible | GENERATE disabled with reasons | — | NO TAKES YET |

What every viewport shares:

- **No circular buttons.** All controls have a 4 px corner radius.
- **Panels scroll internally.** Lists and the facts column scroll inside their own panes; the page never does.
- **Genuine writes.** Each decision was read back from disk afterwards: decision APPROVED, `selectedForEdit: true`, and three APPROVAL records (HOLD, APPROVE, SELECT FOR EDIT).

Screenshots are in the FULL evidence package (`takes-fixture-*.png`, `takes-live-*.png`).

## 6. Findings for the founder

- **Phone text is 7 px.**
  - At 390 px, body text follows the shared HUB density authority (`--pw-t2`), which every production screen uses.
  - Shot rows and facts are legible but small. Raising them for TAKES alone would break that system, so it was left as is.
  - Changing the phone scale is a design decision for the whole workspace.
- **Playback not seen in-browser.**
  - The test Chromium build reports no H.264 support (`canPlayType` returns nothing).
  - The video element is sized, placed and served correctly: the signed read returns 200 and the bytes match the take hash.
  - Actual playback was not observed. Check it once on the founder's phone in Chrome or Safari.
- **REVISE missing.** The audit's dailies list includes REVISE; this sprint's §24 action set does not, and none was added.
- **No INBOX or ACTIVITY link.** Decisions do not yet reach INBOX or ACTIVITY.
