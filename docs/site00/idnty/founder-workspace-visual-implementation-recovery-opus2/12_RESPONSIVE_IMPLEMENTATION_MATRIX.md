# 12 · Responsive implementation matrix

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


Tiers (OPUS2): phone < 768 (header + locked bottom bar HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM; REFERRALS via MENU,
no sixth tab) · tablet portrait 768–1023 (80 px rail) · tablet landscape 1024–1279 (rail; inspector docks ≥ 1100 = conditional
dock; workbenches two-pane at stage ≥ 920) · desktop ≥ 1280 (sidebar 224, 248 from 1600) · ultra-wide ≥ 1920 (page max
1560 → 1760). Pages recompose on the `stage` container (cs < 640 · cm 640–919 · cl 920–1439 · cx ≥ 1440).

✓ = no page overflow, no stage overflow, no blue default control, no native select/checkbox/radio, no runtime error.

| Page | 320x700 | 375x812 | 390x844 | 430x932 | 768x1024 | 820x1180 | 834x1112 | 1024x768 | 1194x834 | 1280x800 | 1440x900 | 1920x1080 | 2560x1440 | 3440x1440 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| overview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| foundations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| record | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| reviews | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| operations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| correspondence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| system | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| testlab | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| referrals | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| cardstudio | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Fix during the sweep: the OPERATIONS header filter overflowed at 320 px — it now wraps to a 2 × 2 grid below a 480 px stage.

MOBILE / TABLET_PORTRAIT / TABLET_LANDSCAPE / DESKTOP / ULTRAWIDE: PASS
