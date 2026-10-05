# INTERACTION INVENTORY

Non-route interactions reachable in Production (audit SHA `269f2af5`). For each: source, trigger, result, inheritance parent, visual status, responsive notes.

| Interaction | Source surface | Trigger | Resulting state | Must inherit | Visual status | Responsive |
|-------------|----------------|---------|-----------------|--------------|---------------|------------|
| Global tab switch | shell-bottom-nav | tap tab | Navigate to tab route | PRODUCTION shell | REFERENCE_LOCKED | ph vs pxh nav |
| Inbox badge | shell-nav-inbox-badge | — | Shows queue count | shell | REFERENCE_LOCKED | same |
| Hub → queue | hub-status-bar | VIEW NOW | /production/queue | HUB | REFERENCE_LOCKED | same |
| Hub → activity | hub-activity-preview | VIEW | /production/activity | HUB | REFERENCE_LOCKED | same |
| Hub → machine | hub-open-machine | link | ?view=machine legacy hub | HUB | LEGACY_LOCKED | 864 canvas |
| Inbox tab switch | inbox-root | tabs | Filter list | INBOX | REFERENCE_LOCKED | same |
| Approve / revision | inbox-attention-detail | buttons | Local note + activity | INBOX | REFERENCE_LOCKED | same |
| Library canon tab | library-root | tabs | Canon filter state | LIBRARY | REFERENCE_LOCKED | same |
| Collection expand | library-collections | row | Inline panel | LIBRARY | REFERENCE_LOCKED | same |
| Activity filter | activity-root | chips | Filtered log | ACTIVITY | REFERENCE_LOCKED | wrap on mobile |
| Design mode switch | design-mode-bar | link ?mode= | Chamber re-render | DESIGN | REFERENCE_LOCKED | sub-bar scroll |
| Viewport zoom | design-viewport | FIT/50/75/100 | Scale stage | DESIGN/viewport | REFERENCE_LOCKED | desktop frame |
| Safe area toggle | design-viewport | button | Overlay on device | DESIGN/viewport | REFERENCE_LOCKED | same |
| Device target select | design-viewport | select | Target geometry | DESIGN/viewport | REFERENCE_LOCKED | same |
| Validation sheet | design-viewport | link | /design/workspace overlay | DESIGN | PARTIAL | mobile scale fail |
| Experience capsule | experience-root/child | link | Child route | EXPERIENCE | REFERENCE_LOCKED | same |
| ENTER WORLD / PREVIEW | experience-root | buttons | world / review routes | EXPERIENCE | REFERENCE_LOCKED | same |
| Expression floor card | expression-root | link | Child + ?entry= | EXPRESSION | REFERENCE_LOCKED | grid columns |
| Narrative tab | expression-child-narrative | tabs | story/structure/momentum | EXPRESSION | REFERENCE_LOCKED | same |
| Open momentum | narrative | button | momentum tab + NME embed | EXPRESSION | REFERENCE_LOCKED | embed scroll |
| Casting actors tab | expression-child-casting | tab | Actors panel | EXPRESSION | REFERENCE_LOCKED | same |
| Engine launch | expression screens | engine button | **Leave Production** → content-ops | LEGACY | LEGACY_LOCKED | full page |
| CF step navigation | cf-surface | internal UI | Step / popover | CF authority | PARTIAL | phone-first |
| HubReturnBar | experience/expression shell | back | Parent list or production | child shell | REFERENCE_LOCKED | same |
| Request queue row | inbox-queue-list | row tap | (display) | INBOX | REFERENCE_LOCKED | same |
| Expression format chip | expression-travel-table | chip | (context highlight) | EXPRESSION | REFERENCE_LOCKED | horizontal scroll |

## Not observed in Production authority surfaces (this audit)

- Dedicated toast system
- Global modal registry for Production tabs
- Context menu / right-click menus on vault items
- Drag-reorder in inbox/library
- Multi-select in library

If added later, they must inherit `.pxa` overlay treatment.
