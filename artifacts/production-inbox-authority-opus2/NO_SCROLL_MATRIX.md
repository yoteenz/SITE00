# No-scroll matrix

The contract: every primary operating state fits between the shared host top and the bottom Production nav. The page body never scrolls; only intrinsic panes may.

How it is enforced:
- **By construction:**
  - `.pxa[data-screen='inbox'] .pxa-scroll { overflow: hidden }`
  - `.ibx` is a `height: 100%` grid with rows `auto minmax(0,1fr)`
  - every view is `height: 100%; overflow: hidden`
  - lists, threads and tab panes are `[data-scroll="internal"]` with `overflow-y: auto`
- **By measurement:** `NO_SCROLL_REPORT.json`, from a live Playwright run on localhost with live ndxbook data. Per route and viewport it records:
  - **pageScroll:** whether the authority scroll area overflows
  - **docScroll:** whether the document overflows
  - **clipped:** whether any non-internal section's content exceeds its box
  - **below:** whether any section ends below the workspace bottom
  - **page errors**
- **By test:** `tests/productionInboxAuthorityFamilyOpus2.test.ts` (16) asserts the CSS contract and reads this report. All 45 rows must pass.

Each cell shows the result, the workspace height (top host → bottom nav), and any pane that is currently scrolling internally:

| route | mobile (390×844) | mobile-short (360×640) | tablet (1024×768) | desktop (1440×810) | desktop-min (1280×720) |
|---|---|---|---|---|---|
| root-needs-you | PASS · 694px | PASS · 498px | PASS · 601px | PASS · 633px | PASS · 543px |
| watching | PASS · 694px | PASS · 498px · internal: inbox-watching-list | PASS · 601px | PASS · 633px | PASS · 543px |
| resolved | PASS · 694px | PASS · 498px | PASS · 601px | PASS · 633px | PASS · 543px |
| all-inbox | PASS · 694px · internal: inbox-all-list | PASS · 498px · internal: inbox-all-list | PASS · 601px · internal: inbox-all-list | PASS · 633px · internal: inbox-all-list | PASS · 543px · internal: inbox-all-list |
| messages | PASS · 694px | PASS · 498px | PASS · 601px | PASS · 633px | PASS · 543px |
| system | PASS · 694px | PASS · 498px · internal: inbox-system-notices | PASS · 601px | PASS · 633px | PASS · 543px · internal: inbox-system-notices |
| decision-detail | PASS · 739px | PASS · 543px | PASS · 648px | PASS · 680px | PASS · 590px |
| message-thread | PASS · 739px | PASS · 543px | PASS · 648px | PASS · 680px | PASS · 590px |
| system-notice-detail | PASS · 739px | PASS · 543px | PASS · 648px | PASS · 680px | PASS · 590px |

**Result: 45/45 PASS. The page never scrolls.**

Internal scroll surfaces (intrinsic; allowed by the brief):
- ALL INBOX result list
- WATCHING list (at 360×640)
- SYSTEM notices
- decision and notice tab panes
- message thread pane
- related-material rails (horizontal on mobile)
- menus and overlays

Short-phone policy (360×640, ≤760px tall). The root stays on one screen by trimming secondary rails, never by growing the page:
- RECENTLY RESOLVED is hidden on the root (it remains a full child at RESOLVED).
- The focus art shrinks from 128 to 92px.
- Below 760px tall, the message project context and the notice's related assets hide.
- Below 680px tall, the system side modules, the decision's related materials and the notice's dependency chain hide.
- Everything that hides stays available on its own child, tab or wider viewport.
