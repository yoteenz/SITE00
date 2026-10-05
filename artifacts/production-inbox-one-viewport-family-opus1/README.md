# INBOX — one-viewport family convergence (OPUS1)

Sprint `P0.STUDIOOS.PRODUCTION.INBOX.ONE-VIEWPORT-FAMILY-CONVERGENCE.OPUS1` · branch `cursor/production-inbox-activity-threeviewport-opus1`

## Forensic map
- **Route:** `/production/queue` → `ProductionQueuePage` → `ProductionAuthorityFrame screen="inbox"` → `InboxBody` (single tree, no duplicate or legacy route).
- **Root / children:** `?view=` with `needs` (default) · `watching` · `resolved` · `all` · `messages` · `system`.
- **Grandchildren:** `?item=` (decision) · `?thread=` · `?notice=`.
- **Temporary surfaces:** the `Sheet` overlay (revision · approval confirm · filter / sort · attachment preview) and the `Menu` popovers.
- **Model:** `inboxModel.ts`, unchanged.
- **Styles:** `site00-production-inbox-family.css` (shell, root, grandchildren) plus the new `site00-production-inbox-workspace.css` (children).

## Root cause
1. **Stale child presentation.** The OPUS2 children rendered the `SW_INBOX_AUTHORITY_LITE_v2` stacked mobile boards literally: `Stats` block → search + menus row → large `.ibx-row--watch` cards. Each card had a 150px art column, a facts list and a permanent `.ibx-row__side` action column (status pill + OPEN + STOP WATCHING). SYSTEM stacked metrics, notices and root modules; MESSAGES stacked conversations, context and thread.
2. **Mobile width overflow.** The side column's pill and buttons are `white-space: nowrap`. At 390px its min-content width exceeded the grid track left after the art and facts columns. The list pane (`overflow-y: auto`, which also forces `overflow-x: auto`) clipped the overflow silently, so AWAITING RESPONSE, OPEN and STOP WATCHING were cut at the right edge (`before/390x844-watching-before.jpg`).
3. **Page-scroll appearance.** Each card was about 260px tall. With the live data (4+ watched objects), the cards ran past the visible pane edge, so on the iPhone the content appeared to continue behind the fixed bottom nav.
4. **No dynamic-viewport contract.** The frame was sized only by `position: fixed; inset: 0`, with no `dvh`, so iOS Safari's dynamic toolbar was not accounted for.

The frame lock itself (`.pxa[data-screen='inbox'] .pxa-scroll { overflow: hidden }`) was present. Chromium measured frame and document overflow at 0 even before the change; the iPhone failure was the card geometry plus the missing dvh contract.

## Rebuild
WATCHING, RESOLVED, ALL INBOX, SYSTEM and MESSAGES now share one `ListWorkspace`:
- **Rail:** title + project · entry line · compact summary · search · FILTER / SORT sheet (mobile / tablet) or menus (desktop) · type views.
- **Rows:** compact `ObjectRow`s (thumb · title · TYPE · AREA · one line · status chip · chevron). There is no action column, and every track is `minmax(0, …)` so chips shrink.
- **Inspector:** the selected object (`?sel=`) with its actions: OPEN · STOP WATCHING (honestly disabled) · APPROVE / REQUEST REVISION (founder gate unchanged) · REVIEW / INSPECT · ACKNOWLEDGE.
- **Desktop:** rail | list | inspector.
- **Tablet:** rail band over list 60% | inspector 40%.
- **Mobile:** band + list; the inspector is a drawer with a scrim.
- **iOS:** `100dvh` on the Inbox frame under `@supports`.

NEEDS YOU keeps the parent-authority composition (PARENT_3VIEW 01_INBOX). Grandchildren and temporary sheets are unchanged, except for these fixes:
- the attachment rail is a declared horizontal scroller;
- the detail tabs share the width at ≤380px;
- on short phones, related materials become a text-only rail, so ATTACHMENT PREVIEW stays reachable.

## Live QA (`NO_SCROLL_REPORT.json`, Chromium, local Vite on the tunnel branch)
**Viewports (14):** 390×844, 393×852, 430×932, 390×664 (iOS short), 360×640, 768×1024, 820×1180, 1024×1366, 1024×768, 1440×900, 1680×1050, 1920×1080, 1440×810, 1280×720.

**States (17):**
- NEEDS YOU · WATCHING · RESOLVED · ALL INBOX · MESSAGES · SYSTEM;
- DECISION DETAIL · MESSAGE THREAD · SYSTEM NOTICE DETAIL;
- WATCHING / SYSTEM / ALL with an object selected (drawer on mobile);
- REQUEST REVISION · ATTACHMENT PREVIEW · APPROVAL CONFIRMATION (gate bypassed in QA only, to open the sheet) · FILTER / SORT (sheet on mobile + tablet, menu popover on desktop).

**Result: 238/238 pass.** For every row:
- `documentElement` vertical and horizontal overflow are 0; `body` overflow is 0; `window.scrollBy` moved 0; `.pxa-scroll` overflow is 0;
- nothing is clipped vertically or horizontally;
- nothing is off-screen sideways or behind the nav;
- the nav is in view with `nav-inbox` active.

The ALL INBOX list scrolls internally on phones.

**Screens:** `screens/<w>x<h>-<state>.jpg`, plus `before/`.
