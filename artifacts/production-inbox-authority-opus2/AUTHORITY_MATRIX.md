# Authority matrix

Classes:
- **REFERENCE_LOCKED:** compared live against the inspected authority image.
- **MOBILE_AUTHORITY_TRANSLATED:** the paired desktop/tablet board could not be fetched (CONNECT 403 to `cdn.openart.ai`), so the layout was translated from the mobile authority, HUB's desktop/tablet grammar and the brief's composition rules.
- **UNMOUNTED:** the composition is built, but the data family does not exist, so the surface shows an honest empty state.

| Surface | Mobile authority | Mobile | Tablet | Desktop | Data |
|---|---|---|---|---|---|
| ROOT · NEEDS YOU | 00_inbox-root-needs-you | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED (no tablet board exists for the root) | MOBILE_AUTHORITY_TRANSLATED | live |
| WATCHING | 01_watching | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live (graph + requests); STOP WATCHING disabled (no watch store) |
| RESOLVED | 02_resolved | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live; empty for ndxbook (0 recorded) |
| ALL INBOX | 03_all-inbox | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live |
| MESSAGES | 04_messages | REFERENCE_LOCKED (layout) / UNMOUNTED (data) | MOBILE_AUTHORITY_TRANSLATED / UNMOUNTED | MOBILE_AUTHORITY_TRANSLATED / UNMOUNTED | project context live; conversations unmounted |
| SYSTEM | 05_system | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live graph; metrics = PIPELINE / FRAMES / BLOCKERS / NOTICES (health, sync and deployments have no source) |
| DECISION DETAIL | 06_decision-detail | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live; DISCUSSION / VERSIONS / reviewers / due unmounted |
| MESSAGE THREAD | 07_message-thread | REFERENCE_LOCKED (layout) / UNMOUNTED (data) | MOBILE_AUTHORITY_TRANSLATED / UNMOUNTED | MOBILE_AUTHORITY_TRANSLATED / UNMOUNTED | none |
| SYSTEM NOTICE DETAIL | 08_system-notice-detail | REFERENCE_LOCKED | MOBILE_AUTHORITY_TRANSLATED | MOBILE_AUTHORITY_TRANSLATED | live graph; RETRY / ASSIGN / ESCALATE / ACKNOWLEDGE disabled (no system-action API) |

Counts:
- REFERENCE_LOCKED: 9 mobile (2 of them with UNMOUNTED data)
- MOBILE_AUTHORITY_TRANSLATED: 18 (9 tablet + 9 desktop), of which 16 are the 8 descendants in both families
- REMOTE_AUTHORITY_FETCHED: 0 of 8

## Root visual-inheritance test
Remove the route content and every route still shows:
- the same host top (shared, untouched; 63/63 clean in the clip detector on Inbox routes)
- the same lifecycle tabs (on non-detail routes; detail routes carry the breadcrumb instead, as in the authorities)
- the same bottom nav with INBOX active
- the same tokens: one `--ibx-*` set covering red, ink, line, card, radius, shadow, type and spacing
- the same card material and red-border focus treatment

**Pass for all 9.**
