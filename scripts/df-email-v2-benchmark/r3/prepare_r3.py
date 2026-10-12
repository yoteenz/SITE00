#!/usr/bin/env python3
"""Email V2 R3 — collect the approved crops each R3 composition uses into r3/assets.

No new photography and no OpenArt calls. Every photograph is an R1 or R2 crop of the approved
DF-I01/I02/I03 plates. New graphics are vector sources in r3/graphics, rasterised by
render_graphics.mjs. This script only copies, so the R3 folder can be published on its own.
"""
from __future__ import annotations

import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
R1 = HERE.parent / "source" / "assets"
R2 = HERE.parent / "r2" / "assets"
OUT = HERE / "assets"

# name in r3/assets -> (source folder, file). The R3 email that uses it is noted for provenance.
REUSE = {
    "door_tall.jpg": (R2, "s_door.jpg"),          # B01 threshold column (desktop)
    "door_band.jpg": (R1, "b01_door_band.jpg"),   # B01 threshold (mobile)
    "perforation.png": (R2, "a_perf.png"),        # B01 reply card tear line
    "slab.png": (R1, "b02_slab.png"),             # B02 monument plate (desktop)
    "slab_m.png": (R1, "b02_slab_m.png"),         # B02 monument plate (mobile)
    "drawn.jpg": (R2, "c_drawn.jpg"),             # B02 drawing above the datum
    "built.jpg": (R2, "c_built.jpg"),             # B02 photograph below the datum
    "horizon.jpg": (R1, "b02_horizon.jpg"),       # B02 closing image
    "cover.jpg": (R2, "x_hero.jpg"),              # B03 cover (desktop)
    "cover_m.jpg": (R2, "x_hero_m.jpg"),          # B03 cover (mobile)
    "sketch.jpg": (R2, "u_sketch.jpg"),           # B03 drawing before the building
    "approach.jpg": (R2, "s_far.jpg"),            # B03 station 01
    "inside.jpg": (R2, "s_inside.jpg"),           # B03 station 02 (annotated in render_graphics)
    "work.jpg": (R2, "s_work.jpg"),               # B03 station 03
    "rest.jpg": (R2, "u_rest.jpg"),               # B03 resting image before the close
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (folder, src) in REUSE.items():
        path = folder / src
        if not path.exists():
            raise SystemExit(f"missing approved crop {path} — run ../prepare_assets.py and ../r2/prepare_r2.py")
        shutil.copyfile(path, OUT / name)
        print(f"{name:18s} <- {path.relative_to(HERE.parent)}")


if __name__ == "__main__":
    main()
