# F02 repo mount report

Sprint: P0.JURNL.F02-GROK-CANONICAL-MOUNT-SONNET-HANDOFF1

Canonical root: `src/projects/jurnl/families/F02_SETUP/`

Production package left in place: `JURNL/F02_SETUP/`

The mount copies current canonical files byte-for-byte. It does not store the OpenArt generation history. Lineage for the current files is in `AUTHORITIES/AUTHORITY_INDEX.json`, `ENVIRONMENTS/PLATE_INDEX.json`, and `MANIFEST/SUPERSEDED_EXCLUDED.json`.

This folder is not imported by the runtime. No F02 route or component was created.

## Counts

| Class | Mounted |
| --- | --- |
| Authorities | 17 (1 parent, 8 children, 2 grandchildren, 3 states, 3 interactions) |
| Environments | 4 |
| Botanicals | 13 |
| Brand lockups | 2 |
| Objects | 0 (baked into the plates) |
| Materials | 0 (baked into the plates, or live code) |
| Panel image assets | 0 (`CODE_ONLY`) |
| Button image assets | 0 (`CODE_ONLY`) |
| Control image assets | 0 (`CODE_ONLY`) |
| Icons resolved | 12 inherited, 0 new |
| State authorities | 3 |
| Interaction authorities | 3 |

## Plates

| Id | File | Generation | Consumers |
| --- | --- | --- | --- |
| ENV.ARRIVAL | `ENVIRONMENTS/F02_ENVIRONMENT_ARRIVAL.jpg` | `vXt3qXGkNz4UwerQKhGs` | F02.00, F02.01, F02.08, F02.ST.RESUME |
| ENV.DESK | `ENVIRONMENTS/F02_ENVIRONMENT_DESK.jpg` | `hh67GjscTJvs74dBMWsX` | F02.02, F02.02.1, F02.03, F02.04, F02.06, F02.ST.VALIDATION, F02.ST.CONNECTED, F02.IN.ADD, F02.IN.SKIP |
| ENV.EDIT | `ENVIRONMENTS/F02_ENVIRONMENT_EDIT.jpg` | `V0617Ub1w3FNYEXcp91K` | F02.05, F02.05.1 |
| ENV.QUIET | `ENVIRONMENTS/F02_ENVIRONMENT_QUIET.jpg` | `bEj6Bfu7UmEjMFm0l1Lx` | F02.07, F02.IN.PERMISSION |

Plate check at mount: no live UI, no text, no buttons, no form fields. Status remains `IN_REVIEW`. QA on the production ledger is `PASS_PROVISIONAL`.

## Header assets

Thirteen emblems in `BOTANICALS/`. Two lockups in `BRAND_LOCKUPS/`. All are RGBA PNGs with transparency, copied without recompression.

`F02.00` renders the JURNL lockup, not a second copy of emblem 001.

`F02.ST.VALIDATION` renders the JURNL SETUP lockup, not a second copy of emblem 012.

`F02.04` reuses emblem 004.

Interaction sheets have no header asset.

## Icons

Resolved by reference to `src/projects/jurnl/runtime/components/icons.tsx`. The SVG module was not duplicated.

## Missing sources

NONE

## Superseded files excluded

YES.

| Screen | Excluded generation | Resource | Why |
| --- | --- | --- | --- |
| F02.08 | `PZC0QVXJzfqWSTXgSlEh` | `qh8eMTZ26tCLNVIx0mhO` | Progress marks read as circles. |
| F02.07 | `8QeXrJ1VUU3REvZqxff9` | `pVHfOcQzjdL0430NLAJu` | Stray mark beside SETUP. |

Winners mounted:

- F02.07 authority `vrLuWNd4riH8JNGuJLVP` — `AUTHORITIES/F02.07_BOUNDARIES.jpg`
- F02.08 authority `TivHik6Gd0eSXloheqG7` — `AUTHORITIES/F02.08_READY.jpg`

The quiet plate stays the current plate `bEj6Bfu7UmEjMFm0l1Lx`. It is not the rejected screen.

## Not done in this sprint

- F02 live routes: 0
- F02 components: 0
- F01 file changes: 0
- New paid generations: 0
- site00.com deploy: no
