# Interaction matrix

Run live in Playwright for mobile (390×844), tablet (1024×768) and desktop (1440×810). Raw results are in `INTERACTIONS.json`. Every row passes in all three families, with **0 page errors**.

| Interaction | Result |
|---|---|
| Root mounts on NEEDS YOU | `data-route=needs` |
| APPROVE on the root focus card | **disabled**: live ndxbook gate is open but `decidableInHub=false` → "DECIDE IN WORKSPACE" |
| REQUEST REVISION opens the contained sheet | opens; note entry works; SEND is disabled while the gate is not decidable; page does not scroll while open; Esc closes |
| INCOMING type filter | SYSTEM → 2 cards (look, performance); ALL restores |
| Lifecycle tab → WATCHING | `data-lens=watching` |
| STOP WATCHING | disabled with a reason (no watch-preference store exists) |
| WATCHING STATUS menu (custom Production dropdown) | opens; AWAITING RESPONSE filters to 3 rows; Esc / outside press closes |
| ALL INBOX filter button → FILTER / SORT sheet | opens; TYPE = DECISION → 2 rows; close button closes |
| ALL INBOX search "cast" | 2 rows |
| Legacy `?view=approvals&item=attn.narrative` (Activity link) | opens DECISION DETAIL |
| Detail tabs DEPENDENCIES / DISCUSSION | DEPENDENCIES lists depends / unlocks with live statuses; DISCUSSION is UNMOUNTED |
| Attachment (related material) → preview | contained preview with stage / status / detail / asset; Esc closes |
| Detail APPROVE | disabled (gate) |
| Breadcrumb back | returns to NEEDS YOU |
| Legacy `?view=direct` | resolves to MESSAGES |
| SYSTEM → INSPECT | opens SYSTEM NOTICE DETAIL |
| Notice RETRY / ASSIGN / ESCALATE / ACKNOWLEDGE | disabled (no system-action API) |
| Activity → Inbox links still present | 3 links on `/production/activity?view=approvals` |

The approval path (unit-tested, since live data is not decidable): APPROVE → compact CONFIRM APPROVAL dialog → `decideStoryboard('APPROVE','')`. REQUEST REVISION → note → `decideStoryboard('REVISE', note)`; that existing action already queues the revision request and records activity with the note. Gate logic is unchanged: open + `decidableInHub` + same node.
