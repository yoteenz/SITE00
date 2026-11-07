# Transparency QA

Model output was opaque RGB with a flat magenta field. Alpha was extracted in post. SK04 was left opaque.

Key rule: a pixel is clear when R and B are both above 150, G is below 140, and `min(R,B) - G` is above 55. A soft band feathers the edge. Magenta spill on the fringe is pulled down. Pixels with alpha under 4 have RGB set to 0.

Checks on every keyed file:

- PNG mode RGBA
- Corner samples on the shells and foregrounds are alpha 0
- Opaque pixels with leftover magenta (same test, alpha > 200): 0 on all 17 keyed files
- OV04 salmon action strip: 1,171,994 opaque pink-paper pixels kept (not keyed)
- SK04 magenta coverage before any key: 0.0%. Saved opaque.

Visible bounds are in `ASSET_MANIFEST.json`.

| File | Fully clear | Fully opaque | Residual magenta pixels |
| --- | --- | --- | --- |
| OV01 | 7.3% | 92.7% | 0 |
| OV02 | 6.2% | 93.8% | 0 |
| OV03 | 7.0% | 93.0% | 0 |
| OV04 | 61.2% | 38.8% | 0 |
| OV05 | 6.4% | 93.6% | 0 |
| OV06 | 9.7% | 90.3% | 0 |
| OV07 | 9.1% | 90.9% | 0 |
| OV08 | 4.5% | 95.5% | 0 |
| FG01 | 67.1% | 32.9% | 0 |
| FG02 | 52.5% | 47.5% | 0 |
| FG03 | 36.2% | 63.8% | 0 |
| FG04 | 72.7% | 27.3% | 0 |
| FG05 | 65.6% | 34.4% | 0 |
| FG06 | 89.5% | 10.5% | 0 |
| FG07 | 54.5% | 45.5% | 0 |
| FG08 | 42.3% | 57.7% | 0 |
| FG09 | 43.7% | 56.3% | 0 |
| SK04 | 0% | 100% | n/a opaque plate |
