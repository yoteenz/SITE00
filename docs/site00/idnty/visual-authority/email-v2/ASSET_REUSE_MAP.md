# Email V2 benchmark — asset reuse map

OpenArt generations: 0. Credits: 0. No new artwork.

Sources are the founder-approved plates from release `df-v2-mass-cj-2026-10-11` (`SITE00_DF_V2_BATCH_I.zip`). Crop boxes are full-resolution pixels on the 3584 × 2016 plates and live in `scripts/df-email-v2-benchmark/prepare_assets.py`. Every box excludes the typography baked into the plates.

## Seven available assets and their V2 use

| Asset | V2 use | Notes |
|---|---|---|
| DF-H01 transactional header | Not used as an image | Its wordmark and red rule logic are rebuilt in live type (letterhead in B01, masthead in B02). |
| DF-H02 transactional mobile | Not used | Layout reference only. Its sample copy is not customer copy. |
| DF-H03 transactional desktop | Not used | Its "ACTION NEEDED" composition belongs to the action-required notice, not to these three. |
| DF-I01 education | B01 | Red glass doorway and marble wall. |
| DF-I02 BLDR journey | B03 | Pavilion hero, three interiors, rock-and-sea strip. |
| DF-I03 post-completion | B02 | Terrace horizon, and travertine texture for the slab. |
| Marketing authority | Reference only | Defines the language. Never pasted into an email. |

## Crops and editorial roles

| File | Plate | Box (x0, y0, x1, y1) | Email | Role | Why it earns its place |
|---|---|---|---|---|---|
| `b01_door_tall.jpg` | DF-I01 | 1400, 200, 1730, 1060 | B01 desktop | CROPPED OBSERVATION | Marble wall meeting the edge of red glass: an open door, said quietly beside a letter. |
| `b01_door_band.jpg` | DF-I01 | 1420, 330, 2780, 860 | B01 mobile | CROPPED OBSERVATION | The same doorway recomposed as a short band so the letter starts on the first screen. |
| `b02_slab.png` | DF-I03 travertine 150, 700, 600, 925 | — | B02 desktop | HERO (code-native monument) | Blueprint slab drawn in code, top face laid in travertine from the DF-I03 wall. The drawing becoming stone is the milestone. |
| `b02_slab_m.png` | derived | crop of `b02_slab.png` | B02 mobile | HERO | Tighter around the slab. |
| `b02_horizon.jpg` | DF-I03 | 1300, 1175, 2290, 1580 | B02 | CLOSING IMAGE | Terrace edge meeting the sea. Rest after the record, with no message attached. |
| `b03_hero.jpg` | DF-I02 | 735, 160, 2460, 755 | B03 desktop | HERO | The pavilion opening to the sea: what can stand on an address. |
| `b03_hero_m.jpg` | DF-I02 | 820, 160, 1600, 755 | B03 mobile | HERO | Re-cropped tall around the red glass. |
| `b03_place.jpg` | DF-I02 | 380, 1235, 890, 1575 | B03 desktop | SECTION ANCHOR — 01 THE APPROACH | Glass at the terrace edge: arriving. |
| `b03_place_m.jpg` | DF-I02 | 300, 1235, 980, 1575 | B03 mobile | SECTION ANCHOR | Wider for full-bleed mobile. |
| `b03_feel.jpg` | DF-I02 | 1330, 1235, 1840, 1575 | B03 desktop | SECTION ANCHOR — 02 INSIDE | A quiet room: how it feels once inside. |
| `b03_feel_m.jpg` | DF-I02 | 1300, 1235, 1980, 1575 | B03 mobile | SECTION ANCHOR | Wider for full-bleed mobile. |
| `b03_work.jpg` | DF-I02 | 2400, 1235, 3420, 1575 | B03 | SECTION ANCHOR — 03 IN USE | The worktable: the building has to work. Full width because this is where the walk ends. |
| `b03_rest.jpg` | DF-I02 | 0, 1768, 1800, 2016 | B03 | TRANSITION | Rock and water after the red band, before the footer. |
| `b03_plan_a/b/c.svg` | code-native | — | B03 | REVELATION | Three illustrative plans. BLDR produces three blueprint directions; the drawings make that concrete. |

## Reuse discipline

- No crop appears in more than one benchmark.
- DF-I02 is also assigned to `bldr-discovery` in the V1 registry. When that template is rebuilt, it must not reuse the B03 hero crop or the walk-through structure.
- DF-I03 is assigned to M13 in V1. B02 uses its terrace edge and wall texture only; M13 keeps the main hero and the three cards.
- The lean-pack crops (`door`, `feel`, `glass`, `handles`, `lounge`, `olive`, `place`, `pool`, `sea`, `steps`, `work`) are not reused. V2 boxes were chosen fresh for their roles.
