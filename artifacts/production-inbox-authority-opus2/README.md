# P0.STUDIOOS.PRODUCTION.INBOX.AUTHORITY-FAMILY-CONVERGENCE.OPUS2

The Production INBOX is rebuilt as one responsive family from `STUDIOOS_INBOX_AUTHORITY_LITE_v2`. Inbox is the **attention, judgment and follow-up system**. Its lifecycle STATES are NEEDS YOU, WATCHING and RESOLVED, kept separate from object TYPES: DECISION, MESSAGE and SYSTEM.

Supersedes the OPUS1 lens reconstruction (`artifacts/production-inbox-activity-threeviewport-opus1`, Inbox half).

## Authority use
- **Mobile:** all 9 `01_MOBILE` authorities were inspected and compared against live captures (`*/mobile/authority-vs-live.jpg`).
- **Desktop/Tablet:** `02_DESKTOP_TABLET/OPENART_ASSET_MANIFEST.json` was read. All 8 `cdn.openart.ai` boards were **unreachable**: the environment's network policy refused the egress proxy CONNECT (403) on every URL. As the brief directs, desktop and tablet are **MOBILE_AUTHORITY_TRANSLATED** (8 descendants plus the root). They were built from the mobile content authority, HUB's approved desktop/tablet density grammar and the responsive rules. No desktop/tablet surface is claimed as reference-locked.

## Route tree (existing route; nothing renamed or added)
See `ROUTE_TREE.md`. In short, everything lives on `/production/queue`:
- `?view=watching|resolved|all|messages|system` for the children
- `?item=`, `?thread=` and `?notice=` for the grandchildren
- contained overlays for temporary surfaces
- the OPUS1 links `?view=priority|approvals|direct` still resolve

## Files
- `src/site00/components/productionAuthority/inboxModel.ts` *(new)*: the pure object model, built from attention items, device-held requests, recorded activity and the production graph.
- `src/site00/components/productionAuthority/InboxBody.tsx` *(rewritten)*: the shell, 9 surfaces and 4 temporary surfaces.
- `src/site00/styles/site00-production-inbox-family.css` *(new)*: one material and token set, with mobile, tablet and desktop compositions and the no-scroll frame contract.
- `tests/productionInboxAuthorityFamilyOpus2.test.ts` *(new, 27 tests)*.
- `tests/productionInboxActivityThreeViewportOpus1.test.ts`: the Inbox blocks are rewritten to the new contract with their intent kept; the Activity blocks are unchanged.

Not touched:
- host top (`chrome.tsx`), bottom nav, other Production tabs, Activity, backend, auth, data hooks
- `ProductionQueuePage.tsx` (still mounts `InboxBody` in `ProductionAuthorityFrame screen="inbox"`)

## Proof
- `<route>/{mobile,tablet,desktop}/`:
  - `live-*.jpg` at five viewports (390×844, 360×640, 1024×768, 1440×810, 1280×720)
  - `mobile/authority-vs-live.jpg`
  - `*/before-after.jpg` (OPUS1 build at `72b2ad5a`, nearest route)
- `temporary-surfaces/`: request revision, filter/sort, filter menu and attachment preview, in all three families.
- `NO_SCROLL_REPORT.json` (45/45), `INTERACTIONS.json` (3 families, 0 page errors), `TOP_NAV_CLIP_REPORT.json` (63/63 clean), `MATRIX_36.json` (36/36).

## Stale / duplicate implementations
- **Removed:** the OPUS1 Inbox lens implementation (`InboxBody.tsx` OPUS1: hero band, lens bar and PRIORITY / APPROVALS / DIRECT / SYSTEM lens bodies), replaced by the one family.
- **Removed:** 126 dead OPUS1 Inbox-only rules in `site00-production-inbox-activity.css` (2,286 → 1,732 lines): direct, messages, pager, preview, review, status box, system filters, notices, fast actions, blocklist, history, key/value and tab panel. Activity still uses the rest of that sheet. Its 18 captures (6 routes × 3 families) are pixel-identical before and after the cleanup.
- **Duplicate shells:** none remain. The Inbox renders no host header or nav of its own (a test enforces this). The top host and bottom nav come only from `ProductionAuthorityFrame`.
