# SAFE TO SPEND reference replicas — toolchain

Sprint `P0.JURNL.F09.REFERENCE-REPLICA1`. These scripts turn the founder's nine reference images
(`JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES`) into the runtime's plates, isolated assets and layout numbers.
Re-running them reproduces the committed files byte for byte.

Requirements: Python 3 with `numpy`, `pillow`, `opencv-contrib-python-headless`; Node with the repo's `playwright`;
the dev server (`npx vite --port 5174`) for type fitting. Intermediates go to `$REPLICA_WORK` (default
`/tmp/jurnl-reference-replica`).

| Step | Command | Output |
|---|---|---|
| Lift each photograph | `python lift.py <parent\|why\|check\|acct1\|drawer> telea` | `$REPLICA_WORK/plates/<screen>_plate_telea.png` |
| Plates, tiles, lockup layers, drawer images | `python export_assets.py` | `src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/{plates,tiles,assets}` |
| Pill botanicals | `python botanicals.py` | `assets/PILL_BOTANICAL_{LEFT,RIGHT}.png` |
| WHY sprig with olive | `python isolate.py` | `assets/WHY_SPRIG_OLIVE.png` |
| Fit type and emit layout | `python build.py parent why check category acct1 acct2 acct3 drawer dock dock_acct dock_why && python emit_ts.py` | `src/projects/jurnl/runtime/layout/referenceLayout.ts` |

- `masks.py` lists what is cleared from each photograph: type and thin marks (`ink` / `inkl`) are Telea-inpainted;
  panels, buttons and the dock (`rect` / `rrect`) are push-pull filled and softened, because coded panels cover them.
- `spec.py` holds the measured boxes and a search box for every line of type. `build.py` finds the ink inside each
  search box, and `fit.mjs` fits the face, size, tracking and baseline in the browser with the real fonts.
- `inkbox.py` and `zoom.py` are the measuring helpers (`python zoom.py check 80 690 300 990 3 out.png` draws a grid).
