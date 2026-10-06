# JURNL creative composition refinement 2: mobile composition, language and pagination

Sprint: P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2

Agent: OPUS

Base: `main` at `dd8bdeca`, reconciled onto `9c817646` (Composer's E2E gate and persist-revision fix) and then `c33405b9` (Wave 5 production hardening).

Scope:
- Presentation, composition and copy only.
- No product logic, data ownership, route or mutation changes.
- No paid generation.

## 1. What was wrong

These were measured on the live runtime at 393×852, before any change.

1. **Ten of fourteen family roots did not render on `main`.**
   - Affected roots: F03, F04, F06, F07, F08, F10, F11, F12, F14 and F16.
   - Error: React "Maximum update depth exceeded".
   - Cause: store hooks returned a fresh filtered array from `useSyncExternalStore` on every read.
   - I fixed this locally to get a baseline. Composer landed the same fix on `main` during the sprint (`cachedRepoView`, PR #1391), so this branch takes Composer's version and ships no data-layer change.
2. **Every root used the same composition.** That composition was: a display 40px left H1, the family question beneath it, a left rail of cards, and a left-aligned button stack.
   - Measured left-column dependence was 0.92–0.99 on every target.
   - F10 and F11 were identical: occupancy, type stack and control stack all 1.0.
   - With the background plate blurred, the families could not be told apart.
3. **Primary meaning lived in metaphor and status codes.** Examples:
   - `NEEDS_SETUP · ONE FORMULA` and `COMPLETENESS NEEDS_SETUP` on F09.
   - `READ FROM F09` on F15.
   - `NOT SET` on F05.
   - "SEE THE HOLD" on F09 and "CHANGE THE PATH" on F13.
   - F05 showed one total that added card and loan balances as money held.
4. **The mobile frame had no limit.**
   - F15 scrolled the body by 809px, with 4 elements under the nav.
   - F09 had 1 element under the nav on mobile and 3 on desktop.
   - On tablet and desktop the F05–F16 hubs docked the nav to the content column. It sat 105px off centre on tablet and 435.2px off centre on desktop.

## 2. What changed

### Track A: composition and family differentiation

Each target root was recomposed around its job, using one archetype from the archetype library (`JURNL_COMPOSITION_ARCHETYPE_LIBRARY.json`):

| Family | Archetype | What you see |
|---|---|---|
| F05 MONEY | CONTAINER_CABINET | A plaque reading YOUR MONEY IS IN N PLACES, with HELD and OWED shown separately and never netted. Shelves for EVERYDAY, SAVED, OWED and OTHER carry vertical edge labels; each place is a drawer with a pull. The base holds ADD A PLACE and SEE ALL PLACES, plus a source line. |
| F09 SAFE TO SPEND | TENSION_THRESHOLD | An arched panel with one figure above a threshold line (CLEAR TO SPEND or OVER BY) and HELD BACK $X OF $CASH. Below the line, hatched bands show only the real held amounts. Two equal actions sit under it. |
| F10 PURCHASES | OBJECT_FOCUS | One object on a plinth with DECIDE ON THIS attached. Below it, an orbit shows FITS?, SAFE TO SPEND AFTER and STATUS, followed by a verdict line and ALSO CONSIDERING. |
| F11 TRIPS | MAP_ROUTE | A route running FROM HERE (today's safe to spend) through FUNDING ($ of $ reserved, with FUND THIS TRIP) to DESTINATION. Other trips appear with their own funding lines. |
| F13 PAYDOWN | SEQUENTIAL_STEPS | A landing reading YOUR PLAN: AVALANCHE — HIGHEST INTEREST RATE FIRST, followed by indented steps 01, 02, 03 in plan order, then TRY AN EXTRA PAYMENT. |
| F15 AHEAD | HORIZON_PATH (+ SCENARIO_FORK) | A TODAY / NEXT 30 DAYS / LATER band on a horizon line, then dated windows (THIS WEEK, NEXT WEEK, LATER THIS MONTH, AFTER 30 DAYS, NO DATE YET), then TRY ANOTHER PATH. |
| F16 RECORDS | ARCHIVE_INDEX | A label holder with FILED and OPEN counts, a find field with an ADD A RECORD tab, and folders by type with staggered tabs and index cards. |

The audited families also moved onto the frame, each with its own archetype:

| Family | Archetype |
|---|---|
| F06 INCOME | LEDGER_GRID |
| F07 UPCOMING | TIMELINE |
| F08 PLAN | ROOM_ZONE (its PLAN AROUND links reconnect F09, F10, F11, F14 and F15) |
| F12 CREDIT | LEDGER_GRID (utilization meter variant; not adjacent to F06) |
| F14 GOALS | EDITORIAL_SPREAD |
| F03 TODAY | FOCUS_REVEAL (its authority composition is kept, now split into atomic panels) |

F04 ACTIVITY is unchanged.

Rules hold across F03 → F16: there are 0 adjacent archetype repeats, and the 7 targets use 7 different archetypes.

**Blur test** (`JURNL_BACKGROUND_BLUR_TEST.json`): **PASS**.

| Measure | Before | After |
|---|---|---|
| H1 on the targets | DISPLAY / 40 / LEFT on all of them | MONEY display 30, SAFE TO SPEND sans 12 centred, PURCHASES sans 11, TRIPS display 34, PAYDOWN display 34, AHEAD display 30 tracked 12.6px, RECORDS sans 20 |
| Left dependence | 0.92–0.99 | 0.60–0.67 |
| Identical target pairs | 1 (F10/F11) | 0 |
| Shared type and control stack | every target | none |

The JURNL world is shared across all of these: the same bone paper, emerald, wine and champagne, display serif with tracked sans, square-rounded controls, and the family plate. Variety comes from composition, not the photograph.

### Track B: language clarity

There are three layers on every target root:
1. **Function label:** the H1.
2. **State and task:** `.jrn-lang__state` and `.jrn-lang__task`.
3. **Editorial:** the family question, set in italic display. It is always secondary.

Layers 1 and 2 stand alone. Status codes, family ids and registry words are gone. Only real values are shown:
- Zero bands are hidden.
- HELD and OWED are never netted.
- The upcoming band is zeroed when it is UNSTATED.

Ambiguous root copy went from 7 instances to 0. The full list, with before and after copy, is in `JURNL_FAMILY_LANGUAGE_CLARITY_AUDIT.json` (26 rows).

Examples:
- **F13:** YOUR DEBT PLAN ISN'T SET YET. / CHOOSE HOW YOU WANT TO PAY DOWN YOUR BALANCES.
- **F16:** 7 RECORDS FILED. NO RECORD IS OPEN.
- **F15:** HERE'S WHAT THE NEXT 30 DAYS LOOK LIKE IF NOTHING CHANGES.
- **F10:** YOU'RE CONSIDERING 2 PURCHASES. / BUYING IT NOW KEEPS SAFE TO SPEND ABOVE ZERO.
- **F11:** NO TRIP IS SET UP YET. / ADD A DESTINATION AND A BUDGET TO START.

### Track C: mobile pagination and nav geometry

**Shared composition primitive.** `JurnlFamilyFrame` and `JurnlFamilyShell` live in `runtime/components/FamilyFrame.tsx`, styled by `runtime/jurnl-frame.css`. From top to bottom the frame is:
1. Top safe area.
2. Chrome.
3. A finite **content rect**.
4. A 40px **composition edge**: a double hairline with square end caps, carrying the screen marks and NEXT.
5. A **nav reserve** of `--jrn-nav-reserve` (44 + 12 + 8 + `env(safe-area-inset-bottom)`).

All 12 family shells and their child screens use the frame. There are no family-specific magic numbers.

**Shared pagination primitive.** `runtime/layout/paginate.ts` together with `JurnlPanelStack`:
- Panels are atomic: one that does not fit moves whole to the next screen.
- An oversize panel gets its own screen and scrolls inside itself.
- Off-screen panels stay measurable but are hidden, `aria-hidden` and `inert`.
- Re-pagination runs on ResizeObserver, `fonts.ready` and panel list changes, and keeps the screen holding the panel being read.
- Pagination freezes while the keyboard is open.
- Screens are presentation state only: no route, no query parameter, no history entry.
- Context-aware back steps through the screens (N → N−1 → route back), labelled "BACK TO SCREEN N".
- NEXT carries the aria-label "NEXT — FAMILY, SCREEN x OF n". Focus moves to the region, and an `aria-live` region announces "SCREEN n OF m".

**Shared bottom-nav primitive.** `JurnlProductNav` portals into a viewport-level `.jrn-nav-host`. The nav is centred with `left: 50%` and `translateX(-50%)` and laid out as five equal cells, so + is the geometric centre. Its bottom offset is `calc(12px + env(safe-area-inset-bottom))`. Nothing can move it: not the family, the content or the screen.

The sprint banned three cheats, and none is used:
- No shrink-to-fit.
- No z-index cheat: the reserve is real layout space.
- No bottom-padding cheat: the body never scrolls.

## 3. QA (live runtime, not static screenshots)

### Pagination and nav

| Check | Result |
|---|---|
| Live pagination QA (`JURNL_MOBILE_PAGINATION_QA.json`) | **11 / 11 PASS** |
| Nav centring (`JURNL_MOBILE_NAV_CENTERING_QA.json`) | 0px offset for nav and + on every root, state, screen and viewport |
| Distinct nav rects on mobile | 1 (32 root/screen combinations) |
| Distinct cell widths on mobile | 1 (64.8px) |
| Composition QA | 84 / 84 rows: nav 0, + 0, under-nav 0, clipped 0, body scroll 0 |
| SITE00 viewport preview vs live | 14 / 14 identical, including NEXT/BACK inside the iframe |

The pagination QA covered these cases:
- All fit.
- Overflow of 1 panel.
- Overflow of multiple panels, up to 3 continuation screens.
- An oversize panel scrolling internally.
- Error expansion (search no-results).
- A dynamic data change while reading screen 2.
- Keyboard freeze.
- BACK and NEXT.
- No history entries.
- Safe area: an emulated 34px inset lifts the nav and grows the reserve by exactly 34px.
- Tablet and desktop continuation.

The composition QA reads the same nav rect for the same viewport everywhere. Preview parity was checked through DESIGN → JURNL → VIEWPORT at MOBILE.

### Tests and gates

| Check | Result |
|---|---|
| Interactive-text containment | 1098 / 1098 labels (F01–F16, 3 viewports); parents re-run after the merge 432 / 432 |
| Unit tests (`tests/jurnlMobileComposition.test.tsx`) | 24 / 24 |
| JURNL suites | 385 / 389; the 4 failures are pre-existing and fail identically on clean `main` c33405b9: `jurnlF02Runtime` ×2, the F01 paywall check, and the production-shell debug-surface check |
| Typecheck | clean |
| Composer full-product E2E gate (`e2e/jurnl`) | **82 / 82** on the final merged base (41 tests × mobile and desktop, including the Wave 5 hardening spec), after restoring three hooks: `.jrn-home__num` on F09, `.jrn-tx` on F07, and the text "SAFE TO SPEND NOW" on F15 |

### Defects found and fixed during QA

1. **Oversize panels lost their flag after the first layout.** They were re-measured at their clamped height and ended up clipped. They are now measured by `scrollHeight`.
2. **F09's inline PLAN link floated on the bright window** on tablet and desktop. It now has paper backing.

## 4. Flags for Composer: data and logic issues found, not fixed

All of these are outside this sprint's firewall.

1. **Money total.**
   - `main`'s F05 total summed card and loan balances as money held.
   - The new UI shows HELD and OWED separately.
   - The underlying `include_in_net_worth` and sign convention for CREDIT_CARD and LOAN should be confirmed.
2. **Loans count as cash in safe to spend.** LOAN accounts default to `include_in_safe_to_spend = true`, so a loan balance counts toward safe-to-spend cash.
3. **Account ids can collide.** `createManualAccount` ids come from `Date.now()`, so two accounts created in the same millisecond collide and one overwrites the other. QA seeding spaces writes by 3ms to avoid it.
4. **The default CARD shows two different balances.** The setup-default CARD shows $0 in MONEY but $5,000 used (100% of the limit) in CREDIT and PAYDOWN, because `creditSummary` reads the terms and not the account balance.
5. **F10, F11 and F15 had no in-product entry on `main`.** They are reachable again through F08's PLAN AROUND links (registry discovery contract). The FF.DISCOVERY_HUBS decision still stands.
6. **Records have no date.** `document_date` is always null, so every card reads NO DATE.
7. **No `viewport-fit=cover` on the SITE00 page.** SITE00 `index.html` does not declare it, so iOS reports a 0 safe area and Safari keeps the page above the home indicator itself. The rule applies when the page is standalone or uses cover.

## 5. Motherboard rules recorded

These rules are recorded in `motherboard/MEMORY.md`:
1. Family differentiation happens at the composition level, not the image level.
2. Each family has a distinct information hierarchy.
3. Each family has a distinct spatial grammar.
4. Each family has a distinct rhythm.
5. Each family has a distinct interaction emphasis.
6. All families live in the same JURNL world.
7. Clarity overrides poetic ambiguity.
8. Editorial copy is the secondary layer.
9. Mobile panel stacks use a finite frame, with paginated overflow.
10. The nav is always centred to the viewport.

## 6. Files

### Created

- `src/projects/jurnl/runtime/components/FamilyFrame.tsx`
- `src/projects/jurnl/runtime/layout/paginate.ts`
- `src/projects/jurnl/runtime/jurnl-frame.css`
- `src/projects/jurnl/runtime/jurnl-archetypes.css`
- `tests/jurnlMobileComposition.test.tsx`
- `scripts/jurnl/mobile-composition-qa.mjs`
- `scripts/jurnl/mobile-pagination-qa.mjs`
- `scripts/jurnl/mobile-viewport-parity-qa.mjs`
- `scripts/jurnl/background-blur-test.mjs`
- `scripts/jurnl/qa-board.mjs`

### Changed

- `JurnlRuntimeRoot.tsx`: adds the nav host and the stylesheets.
- `ProductNav.tsx`: portals the nav to the host.
- `FamilyChrome.tsx`: context-aware back.
- `JurnlScreen.tsx`: the frame flag.
- The 13 root screen files: Home, Money, Income, Upcoming, Plan, SafeToSpend, Purchases, Trips, Credit, Paydown, Goals, Ahead and Records.
- `tests/jurnlF03F04Runtime.test.tsx`: OPEN A PLACE → SEE ALL PLACES.

### Proof

Screenshots are under `screenshots/`. They include:
- Before and after for the 7 targets, in both data states.
- Multi-screen continuation (F05 at 2 screens, F16 at 3).
- An oversize panel.
- No-results.
- Safe area.
- Nav-centring overlays.
- Preview captures.
- Comparison, blur and regression boards.

See `JURNL_SCREENSHOT_MANIFEST.json`.
