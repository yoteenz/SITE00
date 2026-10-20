# 16 · Functional non-regression

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


| Check | Result |
| --- | --- |
| `tsc --noEmit` | PASS |
| `vite build` (production, out of tree) | PASS (`verify-production-dist: OK`) |
| Founder workspace tests (`tests/idntyFounderWorkspace*.test.ts`, 5 files) | PASS 41 / 41 |
| New Recovery 2 suite (`idntyFounderWorkspaceVisualRecovery2.test.ts`) | PASS 12 / 12 |
| Full `vitest run` | 892 files: 825 passed · 67 failed; 11 352 tests: 11 244 passed · 106 failed · 2 skipped |
| Of the 67 failing files | 63 also fail at base `8761463ec` (same files re-run in a base worktree) · 3 pass in isolation at HEAD (load flakes under the full parallel run: `p0vrExperienceModuleWiring1`, `pageCreativeUpgradeDrawer`, `site00ExpressionEngineSprintB50`) · 1 is environment-dependent and also fails on a separate full checkout without these changes (`visualReconstructionP0VR1D2` fixture fallback) |
| **New failures** | **0** |
| Browser (Playwright capture harness with DOM audits) | PASS — 168 page + 116 overlay captures, 0 runtime errors |
| Repo e2e Playwright suite | NOT RUN |
| Accessibility | PARTIAL — structural: dialog/menu roles, aria-modal, labelledby, focus trap/return, focus-visible, tab/radio/checkbox roles, aria-live toasts (asserted in tests); automated axe audit NOT RUN |

Two legacy assertions were updated because they asserted the replaced generic markup (`ifw-registry__col--*`,
`ifw-overlay-host__panel--`); they now assert the authority grammar (`tests/idntyFounderWorkspaceAcceptance.test.ts`,
`tests/idntyFounderWorkspaceCompletion.test.ts`). Pre-existing DF intake fixture failures (`CONTACT_PHONE_INVALID`, #1661)
remain at base and are not touched.

Preserved actions: list, detail, pipeline, workbench, completionGate, messages, emailTimeline, createLeadLink,
quoteCommercialReady, manualQuoteAdjustment, approvalResolve, startTask, setBlocker, sendMessage, markComplete,
readinessReport, createTestClient, advanceTestIntake, advanceTestQuote, prepareTestInvitation, dispatchTestEmail,
resetTestData — same endpoints and payload keys.
