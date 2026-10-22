# 04 · Tablet portrait authority (768–1023)

**Boards:** TP-01 to TP-10, C-02, C-06. **Verified at:** 768 × 1024, 820 × 1180, 834 × 1112.

Tablet portrait is a grammar of its own. It is not a squeezed desktop and not a stretched phone:
- **one working column**;
- a **labelled rail**;
- **pushed detail** for records, reviews and threads;
- **right sheets** for context.

## 1. Shell

| Zone | Authority |
| --- | --- |
| Navigation | Rail 80 px. Each item: icon 21 + word 10 px / 700, 72 × 58 target, red edge on the current item, count badge. Order: plate 00 · NEW · HOME · FOUNDATIONS · REVIEWS · OPS · MAIL · SYSTEM · account plate. |
| Top bar | 56 px: index + breadcrumb, search **icon** (the field collapses below 1024), notifications |
| Stage | Gutter 24; stage width 688–943 (container tier cm) |
| Inspector | Never docks (needs ≥ 1100). Opens as a right sheet min(420, 88vw) over a 42% scrim; ESC or scrim closes; focus returns to the row. |
| Workspace menu | OL-03 left drawer 320: tools, client experience, account, sign out |
| Feedback | Toast bottom-left of the stage, ≤ 440 |

## 2. Page grammar

| Page | Portrait composition |
| --- | --- |
| Overview | Focus full width, then the 4-up signal strip, then NEEDS YOU and RECENT MOVEMENT side by side, then ACTIVE WORK (3-column registry), then the milestone |
| Foundations | Search row (44 h) + FILTER / SORT, tabs on their own scrolling row, registry **CLIENT / STATUS / NEXT ACTION**. Status holds state, segments and "time · step". |
| Create | OL-01 dialog min(600, 100vw − 48), centred; lifts above the keyboard |
| Client record | Plate + title row, actions wrap under it, abbreviated journey (INV … DONE) with dates, scrolling tabs, section content, context panels below |
| Reviews | Queue as **two columns** of items (no stretched rows); opening an item pushes the detail with a sticky bar REQUEST REVISION · APPROVE (wraps to two rows on phones only) |
| Operations | Runbooks as a horizontal card strip, stage rail numbers only, task table, gate / client actions / verification panels |
| Correspondence | Thread index, then the pushed thread with the composer pinned above the keyboard |
| System | Verdict band, then console rows (icon · module + detail · status); module detail as a right sheet |
| Test lab | One column of panels |

## 3. Input modes

| Mode | Authority |
| --- | --- |
| Touch | All targets ≥ 44 × 44: rail 72 × 58, icon buttons 44, rows 56. No hover-only affordance; row actions live in the ⋯ menu (OL-06). |
| Keyboard (hardware) | The same shortcuts as desktop: ⌘K palette, `/` search, J / K rows, ↵ open, ESC close. Focus ring 2 px red. |
| Pointer (trackpad) | Hover states as on desktop (`:hover` lifts rows to white). Pointer never reveals an action that touch cannot reach. |

## 4. Orientation, keyboard, zoom, split screen

| Situation | Authority |
| --- | --- |
| Rotation to landscape | The tier changes at 1024. Scroll position and selection persist; an open right sheet becomes a docked inspector only when the dock rule passes (≥ 1100). |
| Software keyboard open | Dialogs: `max-height: 100dvh − 64 − keyboard`, translated up by half the keyboard; the body scrolls with a sticky header and footer. Composer and note sheets sit on the keyboard. Simulated at 398 px on TP-04, TP-06, TP-08 (striped band labelled SIMULATED). |
| Browser zoom 200% | 768 CSS px at 200% = 384: the phone grammar applies (approved mobile). |
| Split View / Slide Over | Layout follows width, not device. 2/3 of 1194 (782) uses this portrait grammar; 1/2 (593) and Slide Over (390) use the phone grammar (TL-01 §03). |

## 5. Acceptance

- `audit-layout.mjs`: every state at 768, 820 and 834 passes all hard checks. No horizontal overflow, clipping, collisions, truncated mandatory labels, multiline buttons or text < 10 px.
- Founder review on real iPad Safari remains required (Chromium only in this environment).
