# NO-SCROLL MATRIX

Live Chromium measurement after web fonts load.

- `frame` = `.pxa-scroll` scrollHeight − clientHeight.
- `doc` = document scrollHeight − innerHeight.
- PASS = both ≤ 1px, correct bottom-nav item active, no page errors, and no hidden-overflow element concealing content.

Viewports: mobile 390×844 · mobile-short 360×640 · tablet 1024×768 · desktop 1440×810 · desktop-min 1280×720.

**Result: 80 / 80 PASS.**

**Designed truncation (not clipping).** The OPUS2 Watching and System list rows clamp their detail line to 2 lines on mobile (`-webkit-line-clamp: 2`). The full text is on the row's detail route. These rows are listed as `clamp` below.

**Before (same viewports).** `/production/activity` scrolled its frame by 903px on mobile and 445px on tablet and desktop. The Inbox root fitted but carried the old composition. See `NO_SCROLL_REPORT_BEFORE.json`.

| Route | mobile | mobile-short | tablet | desktop | desktop-min |
|---|---|---|---|---|---|
| inbox-needs (`/production/queue`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-watching (`/production/queue?view=watching`) | PASS · frame 0 · doc 0 · nav-inbox · clamp: inbox-watch-row | PASS · frame 0 · doc 0 · nav-inbox · clamp: inbox-watch-row | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-resolved (`/production/queue?view=resolved`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-all (`/production/queue?view=all`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-messages (`/production/queue?view=messages`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-system (`/production/queue?view=system`) | PASS · frame 0 · doc 0 · nav-inbox · clamp: inbox-system-row | PASS · frame 0 · doc 0 · nav-inbox · clamp: inbox-system-row | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-decision (`/production/queue?item=attn.narrative`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-thread (`/production/queue?thread=t1`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| inbox-notice (`/production/queue?notice=sys.cast`) | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox | PASS · frame 0 · doc 0 · nav-inbox |
| activity (`/production/activity`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-week (`/production/activity?range=week`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-all (`/production/activity?range=all`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-people (`/production/activity?domain=people&range=all`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-blocked (`/production/activity?verb=blocked`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-open (`/production/activity?range=all&event=evt.narrative.generated`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
| activity-legacy-milestone (`/production/activity?milestone=cast`) | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity | PASS · frame 0 · doc 0 · nav-activity |
