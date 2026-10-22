# Founder workspace — Opus visual implementation recovery 2

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


Recovery 1 proved the method on the shell and 01 OVERVIEW. Recovery 2 propagates the same approved grammar —
OPUS2 `ws.css` (ported verbatim as `ifw-authority.css`) and OPUS3 `rf.css` (ported as `ifw-referrals.css`, scoped
under `.ws`) — to every remaining destination, the shared overlay host, all 40 overlay families and the toast system,
in the real React app and against the real admin API contracts.

**Status: IMPLEMENTED — AWAITING FOUNDER REVIEW.** Gate H (founder acceptance) is open; nothing here is founder-accepted,
merged or deployed.

## Page completion

| Page | Scope | Status | Evidence |
| --- | --- | --- | --- |
| 01 Overview | Recovery1 baseline — unchanged source | COMPLETE (preserved) | `evidence/matrix/overview-14-viewports.jpg` |
| 02 Foundations | registry · status views · search · filter/sort · inspector · OL-19 preview | COMPLETE | `evidence/matrix/foundations-14-viewports.jpg` |
| 02 Client record | head · journey · 8 sections · quote · gate · ownership · events | COMPLETE | `evidence/matrix/record-14-viewports.jpg` |
| 03 Reviews | queue · context · decision · server-confirmed approvals | COMPLETE | `evidence/matrix/reviews-14-viewports.jpg` |
| 04 Operations | runbooks · stage rail · tasks by execution mode · gate · verification | COMPLETE | `evidence/matrix/operations-14-viewports.jpg` |
| 05 Correspondence | threads · portal thread · context · lifecycle email | COMPLETE | `evidence/matrix/correspondence-14-viewports.jpg` |
| 07 System | verdict · status-first console · inspector · readiness report | COMPLETE | `evidence/matrix/system-14-viewports.jpg` |
| 07 Test Lab | synthetic client · journey · email events · continuity | COMPLETE | `evidence/matrix/testlab-14-viewports.jpg` |
| 06 Referrals | overview · partners · attribution · commissions · payouts · activity | COMPLETE (visual) · ledgers BACKEND BLOCKED · money POLICY BLOCKED | `evidence/matrix/referrals-14-viewports.jpg` |
| 06 Card Studio | founder-selected card · finish · print gate | COMPLETE (visual) · print POLICY BLOCKED | `evidence/matrix/cardstudio-14-viewports.jpg` |

## Overlays

20 / 20 workspace families (OL-01…OL-20) and 20 / 20 referral families (RO-01…RO-20) render in the OPUS container
modes and were opened from their real triggers at phone, tablet and desktop — see `09`, `10`, `11` and
`evidence/overlays/`.

## Numbers

- 168 page captures (10 page families × 14 viewports + 28 empty / error / quote / toast states) — 0 page overflow,
  0 stage overflow, 0 blue default controls, 0 native select / checkbox / radio, 0 runtime errors; only
  `SITE 00 Display` and `Saira Semi Condensed` in use (`14`).
- 116 overlay captures — every family in view, same audits (`09`, `10`).
- Typecheck PASS · production `vite build` PASS · founder workspace tests 41 / 41 PASS · full suite: 0 new failures
  (67 failing files, all pre-existing or environment / load dependent — `16`).

## Index

See files `01`–`22` in this folder.

Evidence: `evidence/compare/` (authority | React pairs), `evidence/matrix/` (14-viewport sheets), `evidence/overlays/`,
`evidence/states/`, `evidence/recovery1-regression/`, `evidence/data/` (capture manifests and the harness).
