#!/usr/bin/env python3
"""Build SHEET B — child expansion lineage board from downloaded authorities."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
CHILDREN = ROOT / "CHILDREN"
OUT = ROOT / "SHEETS" / "SHEET_B_F01_CHILD_EXPANSION.png"

# screen -> (reuse note, transform note, new note)
LINEAGE: dict[str, tuple[str, str, str]] = {
    "F01.01": ("PLASTER, TRAVERTINE, LOGO", "FORM CARD", "—"),
    "F01.02": ("PAPER, BOTANICAL, PLASTER", "CORRESPONDENCE OBJECT", "VERIFICATION LETTER"),
    "F01.03": ("CURTAIN, PLASTER, BOOK", "SIGN-IN CROP", "—"),
    "F01.04": ("CURTAIN, PLASTER, LIGHT", "INTIMATE CROP", "—"),
    "F01.05": ("PAPER, PLASTER", "RESET FORM", "—"),
    "F01.06": ("PAPER, CHAMPAGNE", "CORRESPONDENCE", "—"),
    "F01.07": ("TRAVERTINE, IVORY FORM", "PASSWORD FORM", "—"),
    "F01.08": ("PAPER, EMERALD ACCENT", "SUCCESS STATE", "—"),
    "F01.09": ("STONE, BRASS", "SECURITY PANEL", "BIOMETRIC PANEL"),
    "F01.10": ("BOOK SPINE, LOCK", "TRUST METAPHOR", "—"),
    "F01.11": ("PAPER, PLASTER", "PRIVACY STACK", "—"),
    "F01.12": ("CHAMPAGNE, STONE", "SECURITY STACK", "BRASS LOCK DETAIL"),
    "F01.13": ("COAST LIGHT, PLASTER", "COMPLETION", "—"),
}


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def main() -> None:
    thumbs: list[tuple[str, Image.Image, tuple[str, str, str]]] = []
    for path in sorted(CHILDREN.glob("F01.*.png")):
        sid = path.name.split("_")[0]
        note = LINEAGE.get(sid, ("PARENT ASSETS", "—", "—"))
        im = Image.open(path).convert("RGB")
        im.thumbnail((280, 500))
        thumbs.append((sid, im, note))

    w, h = 1400, 3200
    sheet = Image.new("RGB", (w, h), (242, 238, 230))
    d = ImageDraw.Draw(sheet)
    d.text((24, 20), "F01 CHILD EXPANSION — SHEET B", fill=(20, 20, 20), font=font(32))
    d.text((24, 62), "REUSE · TRANSFORM · NEW (per child screen)", fill=(80, 80, 80), font=font(18))

    y = 100
    for sid, im, (reuse, transform, new) in thumbs:
        d.text((24, y), sid, fill=(30, 30, 30), font=font(22))
        sheet.paste(im, (24, y + 28))
        tx = 330
        d.text((tx, y + 28), f"REUSE: {reuse}", fill=(40, 90, 60), font=font(16))
        d.text((tx, y + 58), f"TRANSFORM: {transform}", fill=(120, 80, 40), font=font(16))
        d.text((tx, y + 88), f"NEW: {new}", fill=(120, 40, 60), font=font(16))
        y += im.height + 70

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
