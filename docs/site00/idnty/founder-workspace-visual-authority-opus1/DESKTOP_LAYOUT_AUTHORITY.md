# Desktop layout authority

**Status:** PROPOSED. Applies at 1280 px CSS width and above. Reference frame 1440 × 900 (boards 02, 04, 06, 08, 10–12, 14, 16, 18, 20, 22, 23, 24). **Reference A (desktop) was not attached**; the desktop is derived from the mobile references, the brief and existing SITE 00 grammar. Open decision: **FD-W2**.

## 1. Frame: an operational command centre

| Region | Size | Content |
| --- | --- | --- |
| Navigation | 232 px, fixed | SITE 00 / FOUNDER + STAGING; red NEW FOUNDATION; six destinations in the DF index grammar (`01 —— OVERVIEW`) with the live review count; a rule; READINESS DESK and CORRESPONDENCE STUDIO; founder identity at the foot (opens the account menu) |
| Top bar | 56 px | Index + title (breadcrumb on pushed views, e.g. `02 FOUNDATIONS / HORIZON FREIGHT`) · search field (⌘K) · notifications |
| Stage | Fluid; content max 1180 px | Page title block (68 px display headline, optional threshold object) and page body |
| Inspector | 392 px | **Only while something is selected**; closes with × or ESC; selection is in the URL (`?sel=`) |

## 2. Rules

1. **The inspector is contextual.** No destination opens with a permanent right panel. Selecting a row, review, task, email or module opens it, and deselecting closes it. The stage reflows instead of the inspector overlaying it.
2. **Rows never stretch.** Tables keep a readable measure: the next-action column wraps at 190 px; the stage content is capped at 1180 px.
3. **Two-column bodies** (record overview, quote, review detail, operations, test lab) split ~1.3 : 1, with the decision or work on the left and context on the right. The operations right column is fixed at 300 px.
4. **Decision surfaces are distinct.** Quote approval and review decisions sit in an ink-bordered panel or the inspector foot, never inline with navigation.
5. **Keyboard first:**
   - ⌘K / Ctrl K opens search.
   - ↑↓ move the row selection.
   - ↵ opens.
   - ESC closes the top overlay, then the inspector.
   - Tabs follow the tablist pattern.
   - The focus ring is always visible on keyboard focus.
6. **Hover adds, never hides.** Row actions are always reachable through the row menu; hover only reveals shortcuts.
7. **Density.** Table rows are 58 px; dense controls are 36–40 px high; touch is not assumed.

## 3. Desktop compositions

| Destination | Stage composition | Inspector content | Board |
| --- | --- | --- | --- |
| 01 Overview | Title + hero object; left: focus + NEEDS YOU; right: signals + recent movement; below: active work table | Client preview (when a row is selected) | 04 |
| 02 Foundations | Title with counts + NEW FOUNDATION; toolbar: search · status tabs · FILTERS · SORT; table | Client preview: journey (short labels), next action, link, quote, movement, OPEN FOUNDATION | 06 |
| Client record | Header: plate, name, category, email (data), COPY LINK / CLIENT VIEW / MESSAGE / ⋯; journey panel; 8 section tabs; section body | Context inspector (e.g. intake answer, quote line) | 10–12 |
| 03 Reviews | Title with count and oldest age; tabs; review table with the primary action per row | Review summary + OPEN FULL REVIEW | 14, 16 |
| 04 Operations | Project header with providers; stage rail; tasks (TASKS / DEPENDENCIES / VERIFICATION); right column: completion gate, client actions, verification | Task: mode, status, key, dependencies, instructions, metadata, MARK COMPLETE / BLOCK | 18 |
| 05 Correspondence | Policy banner; tabs; send-intent table | Email preview, recipient (masked), gate result, SEND DISABLED · reason | 20 |
| 06 System | Verdict band; 4-column module grid; build marker | Module: summary, checks, next action, env names | 22 |
| Test lab | Journey + continuity (left), events + preview + danger zone (right) | — | 23 |

## 4. Wide screens

Above 1680 px the stage content stays capped at 1180 px and centres between the navigation and the inspector. Large monitors do not stretch tables.
