# Verification and implementation recommendations

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

## Not verified (stated plainly)

| Item | Why | Who / when |
| --- | --- | --- |
| iPhone Safari behaviour of any proposal | Nothing proposed is implemented; this is an authority sprint | Founder, on Railway staging after Phase 2, with the flag on |
| NF-01 focus zoom on a real iPhone | Chromium cannot reproduce WebKit focus zoom | Founder: tap BUSINESS NAME on staging today; expect the page to zoom |
| WebKit rendering | Playwright WebKit browsers are not installed here (`/opt/pw-browsers` has Chromium only) | Composer Phase 4 |
| VoiceOver / screen-reader runs | No device | Composer Phase 4 (contracts C-01, C-02, C-05) |
| Whether the #1573 rounded sheet, round progress nodes and pill switch were founder choices | The reference boards are not in the repository | Founder: FD-5 and FD-6 |
| Visual fidelity of the iOS keyboard and toolbar | Deliberately not drawn (grey placeholders) | — |

## Recommendations to Composer (summary of the handoff)

1. **Phase 1 first. It is safe and fixes real issues today:**
   - scope or delete the legacy chevron rule (C-1)
   - 16 px values on coarse pointers (NF-01)
   - write `.df-chip` (NF-02)
   - make the focus ring solid red
2. **FC-004 ships behind `VITE_DF_CUSTOM_INDUSTRY_SELECT`, default off.** Build Territory A from DfSelect and Territory B as `IdntySelectionSheet` on the existing dialog, focus and scroll-lock helpers. One `IdntySelect` chooses between them by pointer and width.
3. **Snapshot `intakeFromDraft`** before and after every phase. Add the exact-string and legacy-value tests in `ACCESSIBILITY_CONTRACTS.md` C-01 and C-02.
4. **Do not touch autosave.** `UNSAVED CHANGES` vs `SAVING…` is a rendering branch on the existing `status` value.
5. **Portal preferences (FC-036) may go first** in Phase 3. It is the audit's lowest-risk swap and removes the last native checkbox.
6. **Founder verification on staging** after Phase 2:
   - Business Type opens the approved territory
   - selecting OTHER persists across a tab close and reopen
   - no page zoom on focus
