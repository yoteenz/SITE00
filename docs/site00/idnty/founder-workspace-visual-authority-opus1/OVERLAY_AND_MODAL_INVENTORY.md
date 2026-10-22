# Overlay and modal inventory

**Status:** PROPOSED. Board 24 is the overlay authority; each overlay also appears on its destination board. Registry OL-01…OL-20 plus shared containers SC-08 (menu), SC-09 (sheet), SC-11 (dialog), SC-14 (toast), SC-15 (error detail).

**Today:** `window.prompt` (copy link), the production `AdminSearchModal` and native `<details>` are the only overlays. Destructive actions (reset test data, mark complete) run without confirmation.

## 1. Containers

| Container | Phone | Tablet | Desktop | Anatomy |
| --- | --- | --- | --- | --- |
| Bottom sheet | ✓ | — | — | 2 px red top rule · title + red period + × · scrolling body · footer (secondary outline left, primary right) · max height viewport − 120 · swipe-down dismiss |
| Right sheet | — | 360 | — | Same as inspector, over the stage with scrim |
| Dialog | — | ✓ | ✓ | Centred; 440 (confirm), 560 (create); 2 px red top rule; footer like a sheet |
| Inspector | — | dock ≥ 1100 | 392 dock | Header bar (label · external · ×), title, body, foot |
| Menu | action sheet | ✓ | ✓ | 1 px ink border; items 38 px; separator; danger red; unavailable grey + reason at right |
| Palette | full screen | 620 | 620 | Input row + grouped results |
| Drawer | 86 % right | — | — | Workspace menu |
| Popover | — | ✓ | ✓ | Notifications, filters |
| Toast | above nav | stage bottom-left | stage bottom-left | Ink (success), white + red (error) |

Stacking: menu > dialog / sheet > drawer > inspector > page. **Only one modal at a time**; a confirmation opened from a sheet replaces the sheet's footer, never stacks a second sheet.

## 2. Inventory

| ID | Overlay | Trigger | Phone | Desktop | Primary / secondary | API on confirm | Board |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OL-01 | Create foundation | CREATE / NEW FOUNDATION | Sheet → full-screen form | Dialog 560 | CREATE FOUNDATION / CANCEL | `create-artifact` · `create-test-client` | 07, 08 |
| OL-02 | Link ready | Create success | Full screen | Dialog | OPEN RECORD / COPY LINK · CLIENT VIEW | — | 07, 08 |
| OL-03 | Workspace menu | MENU | Drawer | — | — | — | 01 |
| OL-04 | Search / command | Search icon / ⌘K | Full screen | Palette | ↵ open | — | 01, 24 |
| OL-05 | Notification center | Bell | Sheet | Popover | OPEN REVIEWS | — | 01, 24 |
| OL-06 | Row action menu | ⋯ / long-press | Action sheet | Menu | — | per item | 06, 24 |
| OL-07 | Filter / sort | Filter / SORT | Sheet | Popover | APPLY / RESET | — | 05, 06 |
| OL-08 | Approve quote | APPROVE QUOTE / DECIDE | Sheet | Dialog / decision panel | APPROVE / CANCEL | `quote-commercial-ready` | 12, 15, 16 |
| OL-09 | Revise quote | REVISE | Sheet | Dialog | CREATE V(n+1) / CANCEL | `manual-adjustment` / `update-quote` | 12 |
| OL-10 | Mark complete | RECORDS → MARK COMPLETE | Sheet | Dialog 440 | MARK COMPLETE (disabled while gate open) / CANCEL | `mark-complete` | 24 |
| OL-11 | Request changes / note | REQUEST REVISION / ADD NOTE | Sheet | Decision panel | CONFIRM DECISION / CANCEL | `approval-resolve` · `client-action` | 15, 16 |
| OL-12 | Task detail | Task row | Sheet | Inspector | MARK COMPLETE / BLOCK | `complete-task` · `start-task` | 17, 18 |
| OL-13 | Set blocker | BLOCK | Sheet | Dialog | SET BLOCKER / CANCEL | `set-blocker` | 17 |
| OL-14 | Compose message | Thread composer | Inline composer | Inline | SEND | `send-message` | 19 |
| OL-15 | Gated send | SEND / SEND TEST | Sheet | Inspector foot / dialog | SEND TEST (needs approval tick) / CANCEL | `dispatch-test-email` | 19, 23 |
| OL-16 | System module detail | Module card | Sheet | Inspector | RE-RUN REPORT / TECHNICAL DETAIL | `readiness-report` | 21, 22 |
| OL-17 | Reset test data | RESET TEST DATA… | Sheet | Dialog | RESET TEST DATA (red; type RESET) / CANCEL | `reset-test-data` | 23 |
| OL-18 | Account menu | Founder identity | In drawer | Menu | SIGN OUT (red) | Supabase signOut | 02 |
| OL-19 | Client preview as sheet | Row (tablet portrait) | Push | Inspector | OPEN FOUNDATION | `detail` | 25 |
| OL-20 | Technical error detail | Error banner | Inline details | Inline details | RETRY | repeat action | 24 |

## 3. Rules

1. **Confirmation is required** for anything that is externally visible (quote approval, messages, sends), destructive (reset), or irreversible (mark complete). It names the consequence and the object.
2. **No confirmation** for reversible local actions (filter, copy link, open).
3. **Errors keep the overlay open** with values intact. Success closes it, then shows a toast and the refreshed data.
4. **Busy** disables the primary, keeps its width, ignores repeat presses, and keeps ESC available unless the request is already in flight.
5. **Focus**: trapped inside; the first field or the primary gets focus on open; focus returns to the trigger on close.
6. **Dismissal**: × , ESC, scrim click and swipe-down are all "cancel". They never submit.
7. **Unavailable items** in menus show their reason (`N/A · G-05`). They are not removed silently (FD-W5).
8. **No browser-native dialogs**: no `window.prompt`, `alert` or `confirm`.
