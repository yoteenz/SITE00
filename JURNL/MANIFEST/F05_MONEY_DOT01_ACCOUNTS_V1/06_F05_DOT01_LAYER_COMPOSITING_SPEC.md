# 06 · Layer compositing

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

Everything is laid out in **board px**, the SIDEKICK's own 941 × 1672 source pixels, and drawn inside one board scaled by `u` (`Dot01Frame.tsx`).

| Layer | What | Notes |
|---|---|---|
| L0 environment | SK02_FIELD / SK03_FIELD / full SK03, as top slice + seamless field tile + bottom slice | never stretched; the tile is cut from the rebuilt field |
| L1 papers | the SIDEKICK's own papers as alpha layers at their extracted boxes (`F05_DOT01_GEOMETRY.json`), the 9-slice paper kit, SK01's nav paper on 06 / 31 | papers settle in on entry (doc 07) |
| L2 live type | the JURNL tag lettering, the title on the heading paper, one lowercase cursive subtitle at most, figures and labels on papers | uppercase except the cursive line |
| L3 chips | square-rounded back / search / add chips at board x 845 (rightmost), 84 px apart | no circular tappable controls |
| Content | a screen-px region mapped from the board (forms, lists) | inputs keep ≥ 16 px type; nothing is transformed, so iOS does not zoom |

## Extraction (`scripts/jurnl/f05-motion-pilot/extract_dot01.py`, seed 20261103)

1. **Silhouettes:** a GrabCut silhouette per paper gives real alpha, with a two-band edge reconstruction and the covered field filled.
2. **Envelope check:** the seal envelope is checked at scale 1.04 with no rotation, leaving 0 px of fill exposed.
3. **FIELD variants:**
   - **Base:** the low-frequency field comes from block medians of the olive ground pixels, smoothed.
   - **Grain:** the high-frequency grain comes from SK01's olive band, de-spiked and clipped to ±10.
   - **SK02:** filled only under its papers.
   - **SK03:** its whole rect (22, 568, 919, 1530) is replaced.
4. **Zero-motion composites:** the extracted layers placed back on the FIELD variants differ from their SIDEKICK by **2.73 %** (SK01), **3.13 %** (SK02) and **5.97 %** (SK03) mean absolute difference. Edge halos are tracked in `qa/halo_*.png`.

## Board model

The board is drawn full-bleed, with no strip reserved for the dock:

```
u      = min(W / (941 − 2·30), H / 1672)       up to 30 board px may crop on each side (stone and fabric only)
ox     = (W − 941·u) / 2
extra  = max(0, H / u − 1672)                  a phone taller than 9:16
```

- **Where the extra height goes (`SEAM`):**
  - the elastic seam lies below the last paper and above the bottom landscape, inside the field-rebuilt region: SK02 at 1540 and SK03_FIELD at 1520;
  - on the full SK03 (26) it lies between the frame (ends y 1040) and the strip (starts y 1042);
  - with the dock (06, 31) it lies above the nav paper, at 1452.
- **How the papers share it (`ZONE_TOP`, `by()`):**
  - inside the FIELD zone (SK02 from y 588, SK03 from y 568), a paper's top moves in proportion to how far down the zone it is, so gaps grow evenly and sizes are kept;
  - anything on a paper is placed relative to that paper's top, so nothing drifts;
  - the full SK03 keeps every baked paper fixed.
- **Content regions** that reach the seam grow with it. Their children share free height through auto margins, which collapse to 0 when the content scrolls, and the history table paper grows.
- **Wider than 9:16** (tablet, desktop): the board fits the height and is centred on a blurred, darkened copy of the same environment.
