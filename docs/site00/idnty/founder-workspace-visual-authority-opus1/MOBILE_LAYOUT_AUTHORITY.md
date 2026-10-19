# Mobile layout authority

**Status:** PROPOSED. Applies below 768 px CSS width. Reference frame: iPhone Safari 390 × 844 (boards 01, 03, 05, 07, 09, 11–13, 15, 17, 19, 21, 23, 24). Founder references B–G are the source; geometry is refined to SITE 00 rectilinear controls.

## 1. Frame

| Region | Height | Content |
| --- | --- | --- |
| Header | 64 px + safe-area top | SITE 00 / FOUNDER wordmark, STAGING tag · search · notifications (red dot = a founder decision exists) · MENU |
| Title block | ~150 px on destination roots | Index rail (`01 ——`), display headline (50 px, ≤ 2 lines), red period, optional one-line sub; optional threshold object at right |
| Stage | Remaining | One column, 16 px side gutter (22 px for record headers) |
| Bottom nav | 84 px incl. home indicator | HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM |

- Pushed views (client record, review detail, project, thread) replace the header with ← BACK-LABEL ⋯ and keep the bottom nav.
- Search replaces everything except the keyboard.

## 2. Rules

1. **One column.** No side-by-side panels below 768 px. Desktop two-column bodies stack in priority order: decision, then context, then history.
2. **No tables.** Tables become card rows with the same four facts (who, status, progress, next).
3. **First screen = action.** Every destination root shows its primary action above the fold at 844 px height:

   | Destination | Above the fold |
   | --- | --- |
   | Overview | Focus block |
   | Reviews | First item's action |
   | Operations | Next task |
   | System | Verdict |

4. **Sheets, not dialogs.** Every overlay is a bottom sheet:
   - 2 px red top rule.
   - Title with red period, then close.
   - Body scrolls; footer holds the decision.
   - Maximum height: viewport − 120 px.
   - Create opens as a full-screen form.
5. **Fixed decision bars** (quote, review detail) sit directly above the bottom nav with a hairline gap and white background, so they cannot be mistaken for navigation.
6. **Tabs scroll.** A tab strip that overflows scrolls horizontally and keeps the selected tab in view. Record sections show OVERVIEW · INTAKE · QUOTE · OPS · MORE; the remaining four sit under MORE (board 09).
7. **Targets.** Every tap target is at least 44 × 44 px, including icon buttons, which have a 44 px hit area around a 20 px glyph.
8. **No horizontal page scroll** at 320 px and up. Long values (email, link) ellipsize with the full value available on press.
9. **Keyboard.** Search and create forms keep results and the primary action above the keyboard. Inputs use the correct `inputmode`, `autocomplete` and `autocapitalize="off"` for email and domain.
10. **Safe areas.** The header and bottom nav pad with `env(safe-area-inset-*)`.

## 3. Destination layouts (phone)

| Destination | Order from top | Board |
| --- | --- | --- |
| 01 Overview | Title → focus block → signals (4-up, selectable) → active work (3) → recent movement → next milestone | 03 |
| 02 Foundations | Title → search + filter → status tabs → card rows | 05 |
| Client record | Back header → threshold band → plate + name + category → status + STEP n OF 8 + segments → quick actions (5-up) → section tabs → section | 09, 11, 12 |
| 03 Reviews | Title → tabs → review items (each with its one ink action) | 13 |
| Review detail | Back header → item → evidence rows (open as sheets) → fixed decision bar | 15 |
| 04 Operations | Title → ACTIVE / BLOCKED / VERIFY → project rows → NEXT FOR YOU task + START | 17 |
| Project | Back header → plate + name → stage rail (scrolls) → current stage tasks | 17 |
| 05 Correspondence | Title → policy banner → tabs → threads | 19 |
| 06 System | Title → tabs → verdict → module grid (2-up) | 21 |
| Test lab | System tabs (TEST LAB) → policy banner → form / journey / events | 23 |

## 4. Mobile-specific variants

| Component | Phone variant |
| --- | --- |
| Signals | One 4-up rail, selected segment inverts to ink |
| Client row | Card row: plate 42, name, category, status + time, 8-segment bar |
| Journey | 8 segments + "STEP n OF 8 · PHASE"; full node journey only in the record |
| Inspector | Never docked: becomes a pushed page (client) or bottom sheet (task, module, preview) |
| Search | Full screen with grouped results |
| Notifications | Bottom sheet |
| Filters | Bottom sheet; active filters stay as removable chips |
| Row menu | Action sheet anchored to the row |
| Toast | Above the bottom nav, full width minus gutters |

## 5. Not on phones

- Desktop tables
- Dependency diagram: a list replaces it ("depends on / unblocks" in the task sheet)
- The four-column readiness report: stacked by column
- Correspondence Studio's own editor (link out only)
