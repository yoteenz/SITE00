# 19 · Source changelog

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


Commit `0095c8b3d` (on top of `8761463ec`), all under `src/site00/admin/founder-workspace/` unless noted.

New: `data/foundationViews.ts`, `data/systemModules.ts`, `data/opsTasks.ts`, `data/emailIntents.ts`,
`inspectors/Inspectors.tsx`, `referrals/rfKit.tsx`, `shell/useWorkspaceTier.ts`, `styles/ifw-recovery2.css`,
`styles/ifw-referrals.css`, `tests/idntyFounderWorkspaceVisualRecovery2.test.ts`.

Rewritten: `pages/FoundationsPage.tsx`, `foundations/FoundationsRegistry.tsx`, `pages/ClientRecordPage.tsx`,
`pages/ReviewsPage.tsx`, `pages/OperationsPage.tsx`, `pages/CorrespondencePage.tsx`, `pages/SystemPage.tsx`,
`pages/ReferralsPage.tsx`, `overlay/OverlayHost.tsx`, `overlay/OverlayContext.tsx`, `overlay/ToastStack.tsx`,
`overlays/CreateClientOverlay.tsx`, `overlays/bodies/OverlayFormShell.tsx`, `overlays/bodies/WorkspaceOverlayBody.tsx`,
`overlays/bodies/ReferralOverlayBody.tsx`.

Extended: `shell/wsKit.tsx` (tabs, segmented control, kv, journey, field, input, textarea, choice, check, search, copy
link, empty, skeleton, inspector head, technical detail, chip, gap, mode), `shell/FounderWorkspaceShell.tsx` (inspector
slot, flat breadcrumb), `shell/FounderWorkspacePageFrame.tsx` (inspector, flush, custom header, arch style),
`overlay/overlayRegistry.ts` (`OVERLAY_MODES`), `overlays/bodies/WorkspaceMenuRows.tsx` (account + sign out).

Tests updated: `tests/idntyFounderWorkspaceAcceptance.test.ts`, `tests/idntyFounderWorkspaceCompletion.test.ts`.

Unchanged: Overview, lifecycle, `ifw-authority.css`, legacy `idnty-founder-workspace.css`, esbuild loader, every API /
server / shared / intake file. `GenericWorkspaceOverlay.tsx` and `ReferralPolicyGateOverlay.tsx` remain unused as before.

PRODUCTION_SOURCE_FILES_CHANGED: YES (founder workspace UI only) · BACKEND_FILES_CHANGED: NO · DATABASE_SCHEMA_CHANGED: NO
