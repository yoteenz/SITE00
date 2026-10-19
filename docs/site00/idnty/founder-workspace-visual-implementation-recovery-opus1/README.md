# Founder workspace — visual implementation recovery (Opus 1)

**Sprint:** `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY1`
**Status:** OVERVIEW + SHARED SHELL RECOVERED IN REACT — **FOUNDER VISUAL SIGN-OFF REQUIRED BEFORE PROPAGATION**
**Branch / PR:** `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · draft PR #1665
**Before:** `b446db3f` · **Source fix:** `ba4012d59`

This is a **source** recovery. Real React and CSS changed on the PR #1665 branch. It is not another design pack.

## What changed

1. **Compile failure fixed.** The workspace showed *“Build failed with 1 error … cards.ts:98:11 Expected ';' but found 'satisfies'”*.
   - **Cause:** the dev local-API loader bundled API handlers with the hoisted esbuild **0.14.47** (a dependency of `@vercel/node`), which predates TypeScript `satisfies`.
   - **Fix:** it now uses Vite's own esbuild (0.21.5). It also rebuilds when any bundled input changes, not just the entry file.
   - See doc 01.
2. **Approved stylesheet mounted.** The OPUS2 authority stylesheet (`ws.css`, 950 lines) was never ported; the implementation had a thin approximation instead. It is now ported verbatim as `styles/ifw-authority.css`, scoped to the workspace root, with link and button colour resets. Those resets remove the iOS blue controls.
3. **Shared shell rebuilt** from the authority markup:
   - **Desktop:** sidebar 224/248, brand with environment tag, red NEW FOUNDATION button, 01–07 index list.
   - **Tablet:** 80 px rail with DF icons.
   - **Phones:** header with search, alerts and menu, and the locked bottom bar HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM.
   - **Page header:** index rail, display headline with red period, crown object.
   - **Menu:** the workspace menu (OL-03) lists all seven destinations, including REFERRALS.
4. **Overview rebuilt** as the approved editorial command centre, bound to the real admin API: focus decision, signals, needs you, active-work registry with lifecycle segments, recent movement, empty state and error state with technical detail.

## Proof

Real-app captures are in `evidence/`, alongside the authority specimens and the founder's screenshots.

| | Result |
| --- | --- |
| Viewports captured | 320, 375, 390, 430, 834, 1194, 1440, 1920, 2560 |
| Horizontal overflow | None at any width |
| Blue controls | 0 |
| Fonts | SITE 00 Display 900 + Saira Semi Condensed 400–700 loaded |
| Title scale | 42.6 / 50 / 48 / 44 / 52 / 60 px, matching the OPUS2 tokens |

## Founder review

Sign in, then open `https://site00.fsbw-dev.com/admin/site00/founder-workspace/overview` **after** the canonical environment re-pins the tunnel to `ba4012d59` (doc 19). The tunnel is not reachable from this agent's container.

## Gate

Other destinations (Foundations, Reviews, Operations, Correspondence, Referrals, System) and the 40 overlay bodies now sit inside the corrected shell. Their **page bodies are unchanged** until the founder approves this proof (doc 17).

## Documents
01 runtime compilation failure · 02 founder screenshot analysis · 03 board → React trace · 04 token and font audit · 05 asset mounting · 06 component gap register · 07 mobile overview contract · 08 shared shell contract · 09 tablet/desktop/ultra-wide · 10 original overlay contract · 11 referral overlay contract · 12 referrals workspace contract · 13 source changelog · 14 single-page proof acceptance · 15 priority defect register · 16 design-to-code failure analysis · 17 founder approval gate · 18 Composer follow-on handoff · 19 live tunnel source verification
