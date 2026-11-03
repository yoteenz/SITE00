# 12 — Functional test results

Run on 2026-11-03 against the Vite dev server with synthetic data only (`e2e/jurnl/helpers/jurnl-f05-world.ts`, `tests/helpers/jurnlFinancialWorld.ts`).

## Summary

| Suite | Result |
|---|---|
| Pilot E2E `e2e/jurnl/jurnl-f05-motion-pilot.e2e.ts` at 360 × 780, 393 × 852, 834 × 1194, 1440 × 900 | **54 passed · 0 failed · 2 skipped** (frame capture is not run at tablet, by design) |
| Pilot unit tests `tests/jurnlF05MotionPilot.test.ts` | **14 / 14** |
| All JURNL unit tests (42 files) | **721 / 721** (baseline #1706: 707 / 707; the +14 are the new file) |
| All JURNL E2E on mobile (13 files, existing plus pilot) | **83 / 83**, including the golden F01–F16 journey; no regression in the 69 pre-existing tests |
| Root-hub authority and F01 firewall unit tests | pass (the cabinet MONEY hub is unchanged and still the default) |
| `tsc --noEmit` / `npm run build` | PASS / PASS (verify-production-dist OK, 471 JS assets) |
| Extraction pipeline | deterministic: rerunning reproduces byte-identical assets |

## The 20 required checks

| # | Check | Where | Result |
|---|---|---|---|
| 1 | Renders with no account records | E2E 1 | PASS ×4: NO PLACES YET paper; HELD / OWED $0; COMMITTED / AVAILABLE "—" with a caption |
| 2 | One account | E2E 2 | PASS ×4: paper + ADD A PLACE |
| 3 | Four accounts | E2E 3 | PASS ×4: ids, order, approved line breaks, approved hierarchy |
| 4 | Many accounts | E2E 4 | PASS ×4: pages of 4 or 6, dots button, ← / →, no overlap between pages, all 7 reachable |
| 5 | Real account values | E2E 3, unit | PASS: each amount equals the stored balance (cents) |
| 6 | Assets and liabilities not conflated | E2E 3, unit | PASS: HELD = assets only, OWED = card / loan, the card paper is a liability marked OWED, AVAILABLE = F09 value |
| 7 | Global nav keeps its five destinations | E2E 7 | PASS ×4: HOME · MONEY · ADD · PLAN · CREDIT in order, MONEY `aria-current`, one dock, ADD opens Quick Add |
| 8 | Selection uses the correct account id | E2E 8 | PASS ×4: `/money/places/ride` → RIDESHARE CARD |
| 9 | Interaction alters no record | E2E 8, unit | PASS: snapshot identical after hover, press, routing, back |
| 10 | Transfer uses the existing transaction system | E2E 10 | PASS ×4: two linked legs (OUT SETTLED, IN PENDING) via `TransferSheet` |
| 11 | Pending transfer not shown as received | E2E 10, unit | PASS: the bank stays $1,260 with "$80 ON ITS WAY IN"; the source shows "$80 SENT, NOT ARRIVED"; HELD −$80 |
| 12 | Overlay opens and closes | E2E 12 | PASS ×4: focus in sheet, Escape closes, focus returns; ADD A PLACE saves (new paper `data-fresh`); planning period opens and closes |
| 13 | Browser back and return | E2E 8 | PASS ×4: back → pilot, the returned paper settles |
| 14 | Reduced motion fully functional | E2E 14 | PASS ×4: 0 pilot animations; sheet, route and back all work |
| 15 | Text readable during and after entrance | E2E 15 | PASS ×4: values in the DOM at first render; opacity 1 after the entrance |
| 16 | No duplicated background elements | E2E 15 + pipeline | PASS: one seal, one title paper, one heading, four card arts; covered fill exposure 0 px |
| 17 | No off-screen essential actions | E2E 15 | PASS ×4: papers, figures, chips, menu and dock all inside the viewport |
| 18 | No unexpected page scroll | E2E 15 | PASS ×4: scroll size ≤ viewport; wheel leaves `scrollY = 0` |
| 19 | No transform residue after navigation | E2E 8 | PASS ×4: no held transforms, no leftover `jrn-place` name, no running animation |
| 20 | No data mutation from decorative animation | E2E 8, unit | PASS |
| + | Accessibility (axe) | E2E | PASS ×4: 0 serious / critical on the page and the sheet |
| + | Entrance budget | E2E frames | PASS: the last pilot animation ends ≤ 650 ms (caught and fixed an 825 ms overrun) |
| + | Default unchanged | E2E | PASS ×4: `?parent=cabinet` is the cabinet hub |

Raw reports are in the full ZIP: `raw/e2e-pilot.json`, `raw/e2e-full-mobile.json`, `raw/unit-jurnl.json`, `raw/build.log`.

## Not covered

- Mobile Safari and physical devices (not available here).
- Screen-reader walkthroughs.
- A cross-user live security proof: this pilot adds no server or data path, and the existing #1705 / #1706 PREREQUISITE_BLOCKED status is unchanged.
