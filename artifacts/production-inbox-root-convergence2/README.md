# INBOX root convergence 2 (tunnel branch)

The INBOX part of `P0.PRODUCTION.INBOX-ACTIVITY.AUTHORITY-CONVERGENCE2`, ported from `ffc7f7c0` on `cursor/production-expression-authority-opus1`.

The ACTIVITY LOG half of that commit is deliberately **not** ported. By founder decision, `/production/activity` stays the OPUS1 three-viewport ActivityBody (`7dcf37de`).

## What changed
**Authority:** PARENT_3VIEW `01_INBOX` (desktop · tablet · mobile).

**NEEDS YOU root, from top to bottom:**
1. **Selected decision surface:** art, then SOURCE / AREA / REQUEST / BLOCKS / BY with an urgency chip, then REVIEW, APPROVE and REQUEST REVISION. These are stacked on tablet/desktop and in one row on mobile.
2. **INCOMING DECISION OBJECTS** beside **BLOCKERS & APPROVALS** (two large counts).
3. **RECENTLY RESOLVED** strip. With nothing resolved it shows honest empty slots.

**Kept as is:** the tabs are now centered. The OPUS2 model, routing, NEEDS YOU / WATCHING / RESOLVED semantics, founder gate and handlers are unchanged.

**Tunnel-only adjustment:** the BLOCKERS count links to `/production/activity?view=blockers`, the OPUS1 blockers lens.

## Files
- `src/site00/components/productionAuthority/InboxBody.tsx`: root markup only.
- `src/site00/styles/site00-production-inbox-family.css`: old root/focus rules removed; one per-viewport ROOT section.
- `tests/productionInboxRootConvergence2.test.ts`: 8 tests.

## Proof
- `NO_SCROLL_REPORT.json`: live Chromium, 9 Inbox routes × 5 viewports = 45/45. No page or frame scroll, nothing clipped, INBOX nav active.
- `<viewport>-authority-vs-live.jpg`: authority left, live right.
- `<viewport>-before-vs-after.jpg`: tunnel before, then after.
