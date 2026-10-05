# HUB reconstruction: parity report

Sprint `P0.STUDIOOS.PRODUCTION.HUB.RECONSTRUCTION.OPUS1`. Repo `yoteenz/SITE00`, which holds all HUB code and the COMPOSER1 / OPUS2 artifacts. The brief named `fsbw`; this repo's AGENTS.md says not to push there. Branch `cursor/production-hub-reconstruction-opus1`, based on `cursor/production-authority-tree-composer1-0daf` @ `0b65e430`, which builds on OPUS2. Not merged, not deployed.

Authority: the three approved HUB references (mobile 1296×2304 9:16, tablet 1792×1344 4:3, desktop 2304×1296 16:9). Every capture below comes from the running app in Chromium.

## Proof

| What | Where |
|---|---|
| Authority (left) vs live (right) at the artboard sizes 360×640, 1024×768 and 1280×720 | `compare/authority-vs-live-{mobile,tablet,desktop}.jpg` |
| The same comparison before this sprint | `compare/authority-vs-before-*.jpg` |
| Raw before / after captures | `before/`, `after/` |
| Real devices: 390×844, 430×932, 834×1194, 1024×768, 1280×720, 1440×900, 1920×1080 | `devices/` |

## Measured geometry (live vs authority)

Mobile at 360×640, in px:

| Band | Live | Authority |
|---|---|---|
| Top bar | 0–50 | 0–53 |
| Hero | 50–151 | 53–154 |
| Status | 151–196 | 154–198 |
| Overview | 200–294 | 203–301 |
| Entries | 300–387 | 306–394 |
| Components | 391–459 | 399–466 |
| Operations / activity | 465–580 | 472–586 |
| Nav | 593–640 | 592–640 |

Desktop at 1280×720, in px:

| Band | Live | Authority |
|---|---|---|
| Hero | 197 tall | 197 tall |
| Status | 64 tall | 64 tall |
| Overview | 168 | 166 |
| Entries | 148 | 152 |
| Components | 126 | 153 |
| Operations / activity | 165 | 169 |

Everything fits above the nav with no scroll, as in the authority.

## What matches

- **Hero / world panel:** the authority's own crystal-pyramid chamber, one plate per family. The baked-in copy was inpainted out and the live PROJECT / NDXBOOK / ENTRY / tagline and IDEAS…IN MOTION render on top. There is a red pipe, a side tick, and a floor fade into the status strip.
- **Status strip:** five cells with authority proportions (410/408/367/422/263 on desktop, re-tuned per family), inset dividers, big red counts, red VIEW links, and a soft card shadow overlapping the hero foot.
- **Production overview:** red progress ring with a centred %, PROJECT PROGRESS + entry, dot legend with a value column, and a featured entry tile with title, meta and updated line.
- **Active entries:** the authority's 4 + 1 slot rhythm, title-above-image cards, a red-framed active card, bar + %, and a dashed NEW ENTRY card.
- **Project components:** icon-first line-icon tiles, label, count or status, and a thin red meter.
- **Current operations:** red index, thumbnail, title / meta, tinted HIGH / MED chip, chevron.
- **Recent activity:** vertical timeline with ring / filled nodes, thumbnail, title / meta, timestamp.
- **Layout:** desktop and tablet use two columns (overview + components | entries + operations / activity); mobile is one column in authority order with operations | activity side by side.
- **Families:** each is authored on its own artboard (`--u` = one authority px; 2000 / 1792 / 1125).
- **Mobile host strip height:** top ≈50px (authority 53), nav ≈47px (authority 48).

## Data integrity

All values are live: counts, statuses, blockers, attention items, activity, thumbnails and progress. Live data has one entry (ENTRY 002), 7 production nodes and 0% progress, so the authority's sample values are not shown. Those samples are 62%, ENTRY 001/003/004, VFX/SOCIALS and the "2H AGO" timestamps. Routes, links and test hooks are unchanged.

## Residual differences (honest)

1. **Desktop / tablet host chrome anatomy is preserved, not changed.** The authority renders show a centred project switcher and a stacked icon-over-label nav. The founder's canonical shell override (`07_DESKTOP_TABLET_SHELL_OVERRIDE.txt`) says those shell regions in generated renders are not literal authority, and locks a left-aligned cluster, hamburger far right, and an icon-left horizontal nav on desktop / tablet. This needs a founder decision; switching is a contained chrome change.
2. The desktop top bar is 62px vs the authority's ≈49px at 1280. It is shared shell height and was left unchanged.
3. Live content is sparser than the authority samples: 1 entry instead of 4, 2 operations instead of 4, and 7 component nodes instead of the authority's 6 icons. Cards keep the authority slots; empty space stays empty.
4. Mobile micro-type has a legibility floor (≥6.5–8.5px). The 9:16 authority's own micro-type would render at about 4.5–6px on a 360 phone, so a few mobile rows are slightly taller.
5. Portrait tablet (834×1194) and tall phones show the authority composition with free space below; the authorities are landscape 4:3 and 9:16.
6. Activity still uses the earlier Grok1 crystal plate. Activity is out of scope; its authority shows the same chamber as HUB, so it can adopt `hubHero` in its own sprint.

## Legacy route

`/production?view=machine` (hub machine) is untouched. It is linked from the HUB as before; neither its component nor its styles were modified. The mobile strip change is scoped to `.pxa` (authority frame) so the machine's 864-space chrome offsets are unaffected.
