# 07 · Desktop ultra-wide authority (≥ 1920)

**Boards:** D-01 §04, D-02, D-03, D-05, D-08, D-10 to D-13, C-03, C-05, C-07. **Verified at:** 1920 × 1080, 2560 × 1440, 3440 × 1440.

**Principle: ultra-wide gains whitespace and a third zone, not wider cells.** Components have maximum widths. The page content is capped at 1760 and centred inside the stage. Anything wider becomes quiet gutter.

## 1. Shell

| Zone | Authority |
| --- | --- |
| Sidebar | 248 |
| Stage | Gutter 40; content max 1760, centred. At 3440 that leaves ~486 px of gutter each side (with an inspector). |
| Inspector | clamp(420, 18vw, 480) → 420 at 1920, 460 at 2560 / 3440 |
| Type | UW tokens: title 60, h2 36, statement 32, numerals 44, names and body 15, labels 12, reading 16 |

## 2. Compositions at stage ≥ 1440 (cx)

| Page | Ultra-wide composition |
| --- | --- |
| Overview | Focus 6fr \| needs 3fr \| signals as a 2 × 2 block 3fr; work 9fr \| movement 3fr; milestone under the work |
| Foundations | Five columns with **capped widths**: client 280–420, lifecycle 220–320, intake 200–300, next 260–440, last activity 140. The remainder trails after the last column; cells are not stretched. |
| Client record | Section \| 400 context column; the journey sits beside the status block (300 + journey) |
| Reviews | Queue 360 \| context \| decision 400 |
| Operations | Runbooks 320 \| main \| context 380 (all three side by side) |
| Correspondence | Index \| thread (68ch, centred in its pane) \| context |
| System | Console + attention order (360) beside it |
| Test lab | Three columns |

## 3. Why content is capped

The audit's stretch check (gap > 360 px between neighbouring text in one row) found registry rows with 470–500 px internal gaps at 2560 and 3440 before the caps were applied. Capped columns and task text ≤ 480 px reduced the worst gaps from 560 px to 360–470 px. The remaining warnings (56 renders, listed in `verification/layout-audit-summary.md`) all share one pattern: a short leading label (e.g. SPF RECORD, a client name) followed by a right-aligned status chip, mode or time. They occur in:
- registry rows at 1920 and above;
- task rows from 1194;
- console rows in the narrow console at 1024 and 1194.

They break no hard rule. A follow-up option for the founder: left-align LAST ACTIVITY and cap task text at 420 at ultra-wide. Not applied in this sprint.

## 4. Acceptance

All audited states at 1920, 2560 and 3440 pass the hard checks. Ultra-wide monitors were not available for physical review; the evidence is Chromium only.
