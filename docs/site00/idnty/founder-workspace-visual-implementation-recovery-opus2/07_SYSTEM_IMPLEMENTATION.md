# 07 · System + Test Lab (D-12 · D-13 · TP-09 · TL-09 · C-07)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


- Header: STAGING · frontend host · API host · report age; corner architecture object.
- Tabs OVERVIEW / STACK / INTEGRATIONS / SECURITY / TEST LAB / READINESS REPORT.
- Verdict from `overall_status` with real counts; RE-RUN REPORT.
- Console rows mapped by `data/systemModules.ts` from the readiness report: staging stack, persistence, database security,
  email sending, Resend, Stripe, API health, E2E test mode, ordered status-first. **No fake health:** with no report every
  module is UNVERIFIED; API health is UNVERIFIED (no probe); a live Stripe key on staging reads FAIL; env values are
  never shown (names only).
- Module inspector docked ≥ 1100 / OL-16 below; ATTENTION ORDER and NEEDS YOU from the report.
- READINESS REPORT: four columns + grouped configuration (names only).
- TEST LAB (replaces the embedded legacy readiness desk): synthetic client form (allowlisted recipient), journey steps
  (advance-test-intake / advance-test-quote), email events with PREPARE PREVIEW and SEND TEST… → OL-15 (one approval tick
  per send; the server still enforces the send flag and allowlist), continuity checks UNVERIFIED, RESET TEST DATA… → OL-17
  (type RESET). The legacy desk sent non-invitation lifecycle emails without a tick; every send is now ticked.
- Errors: red banner, RETRY, technical detail, OL-20.

Evidence: `evidence/matrix/system-14-viewports.jpg`, `evidence/matrix/testlab-14-viewports.jpg`, `evidence/compare/system-*.jpg`, `evidence/states/`.

SYSTEM: COMPLETE · TEST LAB: COMPLETE
