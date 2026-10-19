# Verification and implementation recommendations

**OPUS2 update:** founder decisions FD-1 to FD-6 are incorporated. Section 1 records what OPUS1 verified; the OPUS2 checks are added at the end of it. Recommendations below are aligned to the founder decisions; the full plan is the seven-phase handoff.

## What was verified in this sprint

| Check | Method | Result |
| --- | --- | --- |
| Audit package present | `docs/site00/idnty/form-control-authority-audit1/` on `cursor/idnty-founder-readiness-e2e-be3b` at `5f4d26c3` | 6 documents and 2 evidence images read in full |
| Real option set | DOM of `/foundation/review` (`#df-industry` options) and the `BUSINESS_TYPES` import | 10 values plus the placeholder; used verbatim |
| Current rendering | Chromium 390 × 844 captures of P02 and P03 from `/foundation/review` | `evidence/current-p02-chromium-390.png`, `evidence/current-p03-chromium-390.png` |
| Live computed styles | Playwright `getComputedStyle` on P02 and P03 | Live controls are styled by `site00-df-components.css` (40 px, 3 px radius, white), not by the older client sheet values |
| NF-01, NF-02, C-1 | `boards/verify-findings.mjs` | Confirmed; see `evidence/finding-measurements.json` |
| Boards render | `boards/render-boards.mjs` | 8 images, both fonts loaded on every board, 0 page errors, 0 failed requests |
| Contrast claims | Computed relative luminance | `#ce1017` on `#fff` = 5.66:1 (focus frame passes 1.4.11); the current focus ring `rgba(229,1,7,.35)` on `#f9f8f6` = 1.90:1 (fails) |
| Production code untouched | `git status` / `git diff --stat` outside the sprint folder | No changes |
| Build | `npm run build` | Pass; `verify-production-dist: OK`; no board or `ix-` content in `dist/` |
| Tests | `vitest` on the DF suites (`digitalFoundationComponents`, `digitalFoundationClientBoard0102`, `foundationClientPhoneFormat`, `digitalFoundationMenuDrawer`) | 44 / 44 pass |
| **OPUS2:** NF-06 unchecked edge | `boards/verify-findings.mjs` | `.df-check` computes `1px solid rgb(184, 182, 177)`: 2.03:1 on white (fails 1.4.11) |
| **OPUS2:** boards re-rendered | `boards/render-boards.mjs` | 8 images, both fonts loaded, 0 page errors (see `VISUAL_BOARD_MANIFEST.md`) |
| **OPUS2:** phone requirement source trace | Read `EntryIntake.tsx`, `model.ts`, `phoneFormat.ts`, `service.ts` `updateIntake` / `completeIntake`, `founderReadiness.ts` `advanceSyntheticIntakeSubmitted`, `supabaseStore.ts` intake jsonb | Server has no field validation today; the synthetic journey completes without a phone (handled in Phase 4) |

## Not verified (stated plainly)

| Item | Why | Who / when |
| --- | --- | --- |
| iPhone Safari behaviour of any approved treatment | Nothing is implemented; this is an authority sprint (U-6) | Founder, on Railway staging after Phase 2, with the flag on; Phase 6 gate |
| NF-01 focus zoom on a real iPhone | Chromium cannot reproduce WebKit focus zoom | Founder: tap BUSINESS NAME on staging today; expect the page to zoom |
| WebKit rendering | Playwright WebKit browsers are not installed here (`/opt/pw-browsers` has Chromium only) | Composer Phase 4 |
| VoiceOver / screen-reader runs | No device | Composer Phase 4 (contracts C-01, C-02, C-05) |
| ~~Whether the #1573 rounded sheet and round progress nodes were founder choices~~ | Resolved by the founder: FD-5 preserves the round nodes, FD-6 replaces the rounded skin. The pill switch stays U-3. | — |
| Visual fidelity of the iOS keyboard and toolbar | Deliberately not drawn (grey placeholders) | — |

## Recommendations to Composer (summary of the finalized handoff)

1. **Phase 1 first. It is safe and fixes real issues today:**
   - scope or delete the legacy chevron rule (C-1)
   - 16 px values on coarse pointers (NF-01)
   - write `.df-chip` (NF-02)
   - make the focus ring solid red
   - make the unchecked checkbox edge `#8f8d88` (NF-06)
2. **FC-004 ships behind `VITE_DF_CUSTOM_INDUSTRY_SELECT`, default off.** Territory B (`IdntySelectionSheet`) on coarse pointers up to 600 px, Territory A (`DfSelect`) otherwise, one `IdntySelect` (FD-1).
3. **System B everywhere a checkbox appears** (FD-3): services, add-ons, P05, portal preferences, completion done marks. Radios keep their dot.
4. **CONTACT NUMBER** (FD-2) in its own phase. The client gate and the server completion check land in separate PRs. Autosave is never blocked, and the synthetic journey supplies a fictional number.
5. **Do not touch the progression** (FD-5): drawer, rail, DfProgress, CTAs and P05 gate as implemented.
6. **Snapshot `intakeFromDraft`** before and after every phase. Do not touch autosave or the #1657 persistence repair.
7. **Founder verification on staging** after Phase 2 and Phase 4:
   - Business Type opens the sheet on iPhone
   - OTHER persists across a reload
   - no page zoom on focus
   - CONTACT NUMBER required and restored
