# Production authority convergence: OPUS2 proof

Sprint `P0.STUDIOOS.PRODUCTION.AUTHORITY-CONVERGENCE.OPUS2`. Branch `cursor/production-authority-convergence-opus2`, base `cursor/production-authority-asset-render-grok1` @ `85fe6848`. Not merged, not deployed.

Every capture comes from the running app in Chromium (live browser QA), not from DOM snapshots.

| Proof | Where |
|---|---|
| Forensic stale-surface audit (44 surfaces, before / after class) | `STALE_SURFACE_AUDIT.md` |
| Root authority matrix: 36/36 (12 screens × mobile / tablet / desktop) | `root/{mobile,tablet,desktop}/`, `root/compare/` (authority on the left, live on the right), `root/matrix.json` |
| Descendant matrix: 25 children + grandchildren × 3 families = 75/75 | `DESCENDANT_MATRIX.md`, `descendants/{mobile,tablet,desktop}/`, `descendants/descendants.json` |
| VIEWPORT host × target: 16/16, plus 4/4 at 100% inspection | `VIEWPORT_MATRIX.md`, `viewport/` |
| Before / after sequence (base `85fe6848` vs this branch, same browser) | `before-after/01…11-*.jpg`; founder recording frames in `before-after/00-founder-recording-frames.jpg` |

The before / after sequence covers: 01 viewport DESKTOP preset · 02 experience root · 03–04 experience child · 05 expression floors · 06 narrative MOMENTUM grandchild (the founder-recording surface) · 07 casting · 08 library collections · 09 activity · 10 character fabrication on desktop · 11 design workspace.
