#!/usr/bin/env python3
"""Email V2 R2 — one contact sheet per benchmark: R1 beside directions A, B, C (tablet width), plus a mobile sheet."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
RENDERS = Path(os.environ.get("R2_OUT", "/tmp/SITE00_EMAIL_V2_R2/RENDERS"))
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else RENDERS.parent / "CONTACT_SHEETS"
FONT = HERE.parent / "source/fonts/SairaSemiCondensed-600.ttf"


def sheet(cells: list[tuple[str, Path]], col_w: int, dest: Path) -> None:
    ims = []
    for _, p in cells:
        im = Image.open(p).convert("RGB")
        ims.append(im.resize((col_w, round(im.height * col_w / im.width)), Image.LANCZOS))
    gap, top = 24, 56
    W = gap + len(ims) * (col_w + gap)
    H = top + max(i.height for i in ims) + gap
    c = Image.new("RGB", (W, H), "#e7e5e0")
    d = ImageDraw.Draw(c)
    f = ImageFont.truetype(str(FONT), 20)
    for k, ((label, _), im) in enumerate(zip(cells, ims)):
        x = gap + k * (col_w + gap)
        d.text((x, 18), label, font=f, fill="#6b6964" if label.startswith("R1") else "#141414")
        c.paste(im, (x, top))
    dest.parent.mkdir(parents=True, exist_ok=True)
    c.save(dest, quality=86)
    print(dest, c.size)


def main() -> None:
    titles = {
        "B01": ["A PRIVATE CORRESPONDENCE", "ARCHITECTURAL OPENING", "PERSONAL EDITORIAL"],
        "B02": ["MONUMENT ESTABLISHED", "ARCHITECTURAL RECORD", "MILESTONE REVEAL"],
        "B03": ["ARCHITECTURAL MANIFESTO", "ENTER THE LOCATION", "THE UNBUILT POSSIBILITY"],
    }
    for e, names in titles.items():
        cells = [(f"R1 · {e}", RENDERS / "R1_TABLET" / f"{e}_R1_TABLET.png")]
        cells += [(f"{e} {t} · {n}", RENDERS / "TABLET" / f"{e}_{t}_TABLET.png") for t, n in zip("ABC", names)]
        sheet(cells, 560, OUT / f"R2_{e}_R1_vs_ABC_TABLET.jpg")
        sheet([(f"{e} {t} · MOBILE", RENDERS / "MOBILE" / f"{e}_{t}_MOBILE.png") for t in "ABC"], 390, OUT / f"R2_{e}_ABC_MOBILE.jpg")


if __name__ == "__main__":
    main()
