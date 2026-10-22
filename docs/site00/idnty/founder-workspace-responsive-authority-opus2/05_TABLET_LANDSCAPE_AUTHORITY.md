# 05 · Tablet landscape authority (1024–1279)

**Boards:** TL-01 to TL-10, C-02, C-05, C-06. **Verified at:** 1024 × 768, 1194 × 834. Split View widths 782 and 593 and Slide Over 390 are illustrated on TL-01.

Landscape tablets have width but little height. The landscape grammar is **two panes side by side** with a **short header**, instead of the portrait push navigation.

## 1. Shell

| Zone | Authority |
| --- | --- |
| Navigation | The same labelled rail as portrait (80 px) |
| Top bar | 56 px; the search field returns at ≥ 1024: clamp(200, 26vw, 420) with ⌘K |
| Header | Short-height rule (height ≤ 860): title 44, padding 18 / 16, so focus and queues sit above the fold |
| Stage | Gutter 28; stage 944 at 1024 (container tier cl) |
| Inspector | **Docks from 1100** when selected: 1194 − 80 − 340 = 774 ≥ 680. At 1024 it is a right sheet. |

## 2. Page grammar

| Page | 1024 × 768 (no inspector) | 1194 × 834 |
| --- | --- | --- |
| Overview | Focus \| needs (7 / 5), signal strip, ACTIVE WORK full width (five columns), milestone \| movement | Same, wider |
| Foundations | Toolbar in one row (search · tabs · tools), **five columns** | With a selection: inspector docked, registry **CLIENT / STATUS / NEXT ACTION** |
| Create | Dialog 600; on a 768 high screen with the keyboard (~398) the body scrolls between sticky head and foot | Same |
| Client record | Section \| context 300–360; full journey labels return at stage ≥ 920 | Same |
| Reviews | **Queue \| context**; the decision is docked as a footer (choices side by side, one-line note, CTA) | Same (stage 1114 < 1160) |
| Operations | Runbooks \| main; gate / client actions / verification as a 3-up row beneath | Task detail docks as the inspector |
| Correspondence | **Index \| thread**; context reachable from the thread header | Email preview docks |
| System | Full console row template (≥ 960 px of console width) | Module detail docked; the console compacts to icon · module · status |

## 3. Input modes

The same rules as portrait. Pointer and hardware-keyboard use are more common in landscape (keyboard cases), so hover states and shortcuts are first-class: ⌘K, `/`, J / K, ↵, ESC. Nothing depends on hover.

## 4. Orientation, keyboard, zoom, split screen

| Situation | Authority |
| --- | --- |
| Rotation to portrait | The docked inspector becomes a right sheet; the workbench becomes push navigation; the selection is kept. |
| Keyboard open (768 high) | Overlays cap at `100dvh − 64 − keyboard` (TL-04). The composer stays visible. |
| Zoom 200% | 1024 / 2 = 512 → phone grammar. 1194 / 2 = 597 → phone grammar. |
| Split View 2/3 (782) | Portrait grammar |
| Split View 1/2 (593), Slide Over (390) | Phone grammar |

## 5. Acceptance

Every audited state at 1024 × 768 and 1194 × 834 passes all hard checks. The OPUS1 1194 × 834 defects (crushed search, clipped SORT and LAST ACTIVITY, 3-line next actions) are gone; C-02 §02 shows before and after. Founder review on real iPad Safari remains required.
