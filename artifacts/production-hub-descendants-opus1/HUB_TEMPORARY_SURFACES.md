# HUB temporary surfaces

| SURFACE | CLASS | TRIGGER | OWNER | EXIT | FOCUS | INHERITS FROM | MOBILE | TABLET | DESKTOP | FINAL |
|---|---|---|---|---|---|---|---|---|---|---|
| Host menu | MENU | ☰ in the top bar | shell (`ProductionMenuPanel`) | item click, × button, Escape, outside press | rows and × are focusable, with a red focus ring; current route marked `aria-current` | HUB grammar (red pipe head, red index numerals, thin rules, chevrons) | 864-space panel under the strip, right-anchored | anchored 300px panel under ☰ | anchored 300px panel under ☰ | PARENT_INHERITED |
| Live state syncing | LOADING | hub data `loading` | HubBody | data resolves | n/a | HUB status strip | strip reads SYNCING LIVE STATE (red); ring and meters breathe (off under reduced motion) | same | same | PARENT_INHERITED |
| Nothing needs you | EMPTY | no attention items | HubBody (`hub-operations-empty`) | an item arrives | n/a | HUB card: dashed inset, red ring marker | in the ops / activity pair | same | same | PARENT_INHERITED |
| No activity | EMPTY | no recorded or derived activity (unreachable with a live graph; rendered in the harness) | HubBody (`hub-activity-empty`) | activity arrives | n/a | same | same | same | same | PARENT_INHERITED |
| No production | EMPTY | project without a production | HubBody (hero copy, status NO ENTRY, `hub-entry-card-empty` slot, entries show NEW ENTRY only) | a production is added | n/a | HUB overview slot: dashed hatched frame + NO ENTRY | same composition | same | same | PARENT_INHERITED |
| Hub machine | FULLSCREEN_TEMPORARY_VIEW | OPEN HUB MACHINE (`?view=machine`, `panel`, `node`, `scene`) | legacy `ProductionHub` | bottom nav, or HUB link inside | legacy | own 864 spec | phone composition | phone composition, centred | phone composition, centred | LEGACY_LOCKED |
| Error | ERROR | — | — | — | — | — | — | — | — | UNMOUNTED (no error channel in HUB data) |
| Toast / confirmation | TOAST / CONFIRMATION | — | — | — | — | — | — | — | — | none on HUB (decisions live in INBOX) |

The four EMPTY / LOADING states cannot all be reached with live ndxbook data. They were rendered by a local QA harness (`qa/hub-states.*`, not committed, not routed): the real frame and HubBody fed by the live hook, with only the fields each state needs overridden. Captures: `temporary/<family>-<state>.jpg` and `temporary/<family>-menu-open.jpg`.
