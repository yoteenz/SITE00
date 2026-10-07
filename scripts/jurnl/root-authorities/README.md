# Root parents — reference + clean shell toolchain

Sprint `P0.JURNL.ROOT-PARENTS.REFERENCE-PLUS-SHELL-OPUS-RECONSTRUCTION1`. TODAY, MONEY, PLAN and CREDIT each have a founder
reference (`JURNL/ROOT_PARENTS_REFERENCE_PLUS_SHELL1/REFERENCES`, 941 × 1672) and a clean OpenArt shell (the hub plates
already on main, `families/F0x_*/ENVIRONMENTS/*_SIDEKICK_PLATE.jpg`, 2016 × 3584). These scripts measure the reference's
type and marks and lift the two physical objects the shells do not have.

Requirements: Python 3 with `numpy`, `pillow`, `opencv-contrib-python-headless`; the repo's Playwright; the dev server
(`npx vite --port 5174`) for type fitting (it reuses `../reference-replica/fit.mjs`). Intermediates go to `$ROOTS_WORK`
(default `/tmp/jurnl-root-authorities`).

| Step | Command | Output |
|---|---|---|
| Straighten tilted objects | `python straight.py` | `$ROOTS_WORK/{today_sheet,today_slip,plan_right,plan_left}.png` |
| Fit type | `python build.py today money plan credit` | `$ROOTS_WORK/layout/<screen>.json` |
| Marks (rules, buttons, lockup layers) | `python boxes.py today money plan credit` | `$ROOTS_WORK/layout/<screen>_boxes.json` |
| Emit layout | `python emit_ts.py` | `src/projects/jurnl/runtime/layout/rootAuthorityLayout.ts` |
| Lift objects (print cleared) | `python objects.py` | `F03_TODAY/ROOT_AUTHORITY/TODAY_ATTENTION_SLIP.png`, `F12_CREDIT/ROOT_AUTHORITY/CREDIT_DOSSIER.png` |

- `spec.py` lists every line of type per frame. A frame is either the reference (wall type) or a straightened copy of a
  tilted object (`straight.py`: the clipboard sheet at −5°, the slip at +5°, the planner pages at +7.5° and +11°).
- `boxes.py` finds rules, dividers, buttons and the lockup layers; `FIXED` holds the few boxes read off a gridded zoom
  (hairline outline buttons). `zoom.py` draws those grids, `angle.py` measures a line's tilt.
- Where each object sits on its shell (origin, rotation, glyph scale, row spread, plate crop) is
  `src/projects/jurnl/runtime/layout/rootAuthorityScene.ts`, read off gridded zooms of the shell and the reference.
