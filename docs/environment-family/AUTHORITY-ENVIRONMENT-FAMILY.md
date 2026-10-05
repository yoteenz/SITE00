# Authority environment family

Sprint: `P0.SITE00.GROK-AUTHORITY-ENVIRONMENT-FAMILY-RECONSTRUCTION1`

The 31 authority screens were inspected as images. They do not define 31 backgrounds. They define three physical worlds. Every other difference is live UI, a foreground photograph, or a player frame.

No React, CSS, SVG, routing, or slot geometry was changed. These plates are not mounted.

## Family

| Environment ID | Kind | File | Asset ID |
| --- | --- | --- | --- |
| `ph.environment.chamber.base` | Production base | `public/site00/production-hub/production/hub/chamber/atmosphere.webp` | `grok.site00.production-hub.production.hub.chamber.atmosphere.v1` |
| `cf.environment.fabrication.base` | Character base | `public/site00/character-fabrication/fabrication/machine/chamber.webp` | `grok.site00.character-fabrication.fabrication.machine.chamber.v1` |
| `cf.environment.simulation.volume` | Character distinct | `public/site00/character-fabrication/fabrication/environments/simulation-volume.webp` | `grok.site00.character-fabrication.fabrication.environments.simulation-volume.v1` |

No `ENVIRONMENT_VARIANT` plate was required. Flow, dependencies, hair close-up, and expanded artifacts are the same worlds with live layers or foreground images.

Machine-readable map: `docs/environment-family/STATE-TO-ENVIRONMENT.json`.

## What was rejected

A first generation of each plate was discarded. The production pass was a skylit courtyard. The fabrication pass was a sparse showroom. The simulation pass was a warehouse photo studio with a lighting truss. Those are generic substitutes. The delivered files are the second production plate, the second fabrication plate, and the third simulation plate (separate tripods, not cameras stacked on two poles).

## Production world

One enclosed white shaft. A chrome canopy ring, a clear glass cylinder, a narrow red core, three metal steps, a red underglow, and balcony rails on both sides. No people. No cards. No type.

The red core is in every production authority (live, flow, dependencies, and the dimmed lightbox). It is chamber light, not a mode graphic.

Side halls in flow and dependencies are the same shaft with the node cards moved. That is not a second room.

## Character base world

A working white bay. Glass cylinder, bright vertical light tubes inside it, concentric metal floor, red ring, large white arms with red joint lamps, mechanical ceiling. The center is empty so the existing figure plates can be composited there.

## Character distinct world

The running-simulation authority leaves the glass bay. It is a compact white capture room: glossy floor, near back wall, vertical light bars, black camera tripods at head height on both sides, empty center. Telemetry cards in that screen are live UI and are not in the plate.

## Plates that were not generated

| Screen behavior | Why it is not a new plate |
| --- | --- |
| Lightbox, scene selector, inbox, founder decision, project selector, node inspector, compare, expanded table | Scrim, drawer, or modal over the production shaft |
| Continuity inspector | White cyclorama exists only inside the turnaround photographs |
| Body lock, actor profile, behavioral sheet, motion request | Panels over the fabrication bay |
| Testing ground | Page hero is still the fabrication cylinder. The reaching-hand picture is a card |
| Wardrobe compare, appearance compare, catalogue faces | Foreground photographs |
| Hair + makeup hero | Portrait foreground. The glass and arms behind it are the fabrication bay |
| Performance motion player | The sit platform is footage inside a player |
| Simulation result viewport | A review frame (person + arms) inside a player, not the page's room |

## Opus / Composer integration

Swap the environment only when entering or leaving the running simulation.

- Fabrication bay ↔ simulation volume: crossfade. The authorities show two rooms and no in-between frame.
- Every other production or fabrication state: keep the current plate. Open panels on top. Do not crossfade.

When `atmosphere.webp` is showing, suppress the SVG drum, glass column, and plinth. Keep nodes, artifact, filmstrip, mode tabs, operation bar, storyboard, table, activity, header, and nav.

When `chamber.webp` is showing, suppress SVG walls, light strips, arms, cylinder, and pedestal. Keep the station rail, side cards, controls, header, and nav. Composite the figure in the empty cylinder. Do not also draw a second pair of arms.

When `simulation-volume.webp` is showing, suppress the fabrication cylinder entirely. Composite the simulation figure in the empty center. Keep telemetry as HTML.

Performance and simulation-result pictures stay foreground slots. Do not stretch them into page backgrounds.

## Visual QA

All three files are 1296×2304 (9:16, above 1080×1920), WebP, humans 0, UI 0, text 0, reference pixels 0.

| ID | Camera | Perspective | Architecture | Material | Lighting | Depth | Ready |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ph.environment.chamber.base` | HIGH | HIGH | HIGH | HIGH | HIGH | MEDIUM | YES |
| `cf.environment.fabrication.base` | HIGH | HIGH | HIGH | HIGH | HIGH | HIGH | YES |
| `cf.environment.simulation.volume` | MEDIUM | HIGH | HIGH | HIGH | HIGH | HIGH | YES |

Production depth is MEDIUM because the authority's side corridors are partly hidden by cards; the plate reconstructs a tighter shaft so the cylinder matches the phone framing. Simulation camera is MEDIUM because the authority stands closer to the subject; the plate steps back so a figure can be composited without covering the tripods.

## Authority index

Production files are `01a0f255-638*.jpg`. Character files are `01a0f255-fdc*.jpg`. Labels below come from what is on the screen.

| ID | File suffix | Visible state | Class | Environment |
| --- | --- | --- | --- | --- |
| PH-00 | `6380-7644` | Live hub, activity as a list | SAME_ENVIRONMENT | chamber.base |
| PH-01 | `6382-7c69` | Frame lightbox scrim | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-02 | `6383-71e9` | Flow | SAME_ENVIRONMENT | chamber.base |
| PH-03 | `6384-777c` | Central artifact expanded | SAME_ENVIRONMENT | chamber.base |
| PH-04 | `6385-70cd` | Founder decision | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-05 | `6385-731c` | Inbox quick view | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-06 | `6386-7558` | Scene selector | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-07 | `6386-7b20` | Dependencies | SAME_ENVIRONMENT | chamber.base |
| PH-08 | `6388-77f3` | Storyboard authority expanded | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-09 | `6388-7910` | Compare | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-10 | `6389-7247` | Node selected | SAME_ENVIRONMENT | chamber.base |
| PH-11 | `6389-7a35` | On your table expanded | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-12 | `638a-7e24` | Node inspector | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-13 | `638b-71aa` | Project / production selector | NO_ENVIRONMENT_CHANGE | chamber.base |
| PH-14 | `638b-7bb9` | Live hub base | SAME_ENVIRONMENT | chamber.base |
| CF-15 | `fdc1-7fef` | Look / wardrobe library | SAME_ENVIRONMENT | fabrication.base |
| CF-16 | `fdc5-7144` | Body continuity inspector | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-17 | `fdc7-70c8` | Behavioral skin editor | SAME_ENVIRONMENT | fabrication.base |
| CF-18 | `fdc7-7db8` | Running simulation | DISTINCT_ENVIRONMENT | simulation.volume |
| CF-19 | `fdc8-7dc8` | Authority review | SAME_ENVIRONMENT | fabrication.base |
| CF-20 | `fdc9-7202` | Lock body continuity | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-21 | `fdc9-7be3` | Actor profile | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-22 | `fdca-72e1` | Hair + makeup | SAME_ENVIRONMENT | fabrication.base |
| CF-23 | `fdcb-7174` | Wardrobe compare | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-24 | `fdcb-71e2` | Add behavioral skin | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-25 | `fdcb-7ad3` | Performance / sit player | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-26 | `fdcc-7ab4` | Appearance compare | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-27 | `fdcd-794a` | Testing ground | SAME_ENVIRONMENT | fabrication.base |
| CF-28 | `fdce-7320` | Motion request | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-29 | `fdce-792e` | Simulation result player | NO_ENVIRONMENT_CHANGE | fabrication.base |
| CF-30 | `fdcf-7757` | Actor catalogue | SAME_ENVIRONMENT | fabrication.base |
