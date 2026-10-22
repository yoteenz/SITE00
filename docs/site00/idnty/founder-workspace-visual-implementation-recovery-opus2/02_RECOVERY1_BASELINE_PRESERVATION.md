# 02 · Recovery 1 baseline preservation

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


Byte-identical to base `8761463ec` (verified with `git diff --quiet`):

- `pages/OverviewPage.tsx`
- `data/lifecycle.ts`
- `styles/ifw-authority.css` (verbatim OPUS2 port)
- `scripts/vite-site00-local-api.mjs` (esbuild fix for `cards.ts satisfies`)
- Composer font gate (`founderWorkspaceFonts.ts`, `useFounderWorkspaceFontsReady.ts`)

Shell changes that touch Overview: an optional inspector slot (unused by Overview), a flatter breadcrumb (single crumb on
Overview — identical output), and the new `ifw-recovery2.css` layer (only targets real inputs, tabs, choices, overlays,
toasts; no Overview selector).

Regression captures (`evidence/recovery1-regression/`): Recovery1 evidence vs Recovery2 at 320, 390, 1440, 1920. Composition,
type scale, signals, focus card and bottom bar match. Mean absolute pixel difference 4.6–17.4 / 255 comes from (a) the
focus statement copy for `QUOTE_READY`, which already reads “QUOTE READY FOR YOUR APPROVAL” in base `8761463ec` (lifecycle
is untouched here), (b) fixture age stamps and (c) JPEG compression. Overview 14-viewport sheet:
`evidence/matrix/overview-14-viewports.jpg` — 0 overflow at all 14 widths.

RECOVERY1_PRESERVED: YES
