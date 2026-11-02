#!/usr/bin/env python3
"""P0.JURNL reference hygiene — deterministic identity recovery (no generation)."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "JURNL/MANIFEST/IDENTITY_RECOVERY_V1"
ASSETS = OUT / "assets"
REPORTS = OUT / "reports"

F09_LOCKUP = ROOT / "src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png"
SPRIG = ROOT / "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png"
WORD = ROOT / "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png"
STS_REF = ROOT / "JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES/01_SAFE_TO_SPEND.png"
ENTRY_WELCOME = ROOT / "ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png"
SUPERSEDED = ROOT / "public/site00/projects/jurnl/brand/jurnl-logo-official.png"

# referenceLayout REF_PARENT (853 × 1844 stage)
REF_SPRIG = (78, 114, 156, 186)
REF_WORD = (78, 184, 270, 227)
# entryV2Layout frame 1008 × 1792 → authority 2016 × 3584
ENTRY_SPRIG = (144, 224, 264, 356)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def crop_box(im: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return im.crop(box)


def alpha_ink_mask(rgba: np.ndarray, lum_cut: float = 200) -> np.ndarray:
    lum = rgba[..., :3].mean(axis=2)
    a = rgba[..., 3].astype(float) / 255.0
    return (a > 0.05) & (lum < lum_cut)


def masked_mae(a: np.ndarray, b: np.ndarray, mask: np.ndarray) -> float | None:
    if mask.sum() < 32:
        return None
    diff = np.abs(a.astype(float) - b.astype(float))
    return float(diff[mask].mean())


def reextract_lockup_layers() -> tuple[Path, Path]:
    """Same algorithm as scripts/jurnl/reference-replica/export_assets.py lockup step."""
    a = np.asarray(Image.open(F09_LOCKUP).convert("RGBA")).astype(float)
    lum = a[..., :3].mean(2)
    a[..., 3] *= np.clip((236 - lum) / 56, 0, 1)
    im = Image.fromarray(a.astype(np.uint8))
    sprig_out = ASSETS / "LOCKUP_SPRIG.reextract.png"
    word_out = ASSETS / "LOCKUP_WORD.reextract.png"
    im.crop((0, 0, 82, 78)).save(sprig_out, optimize=True)
    im.crop((0, 78, 196, 120)).save(word_out, optimize=True)
    return sprig_out, word_out


def composite_from_layers() -> Image.Image:
    base = Image.new("RGBA", (282, 118), (0, 0, 0, 0))
    sprig = Image.open(SPRIG).convert("RGBA")
    word = Image.open(WORD).convert("RGBA")
    base.paste(sprig, (0, 0), sprig)
    base.paste(word, (0, 78), word)
    return base


def scale_box(box: tuple[int, int, int, int], sx: float, sy: float) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    return (int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy))


def build_comparison_board() -> Path:
    sts = Image.open(STS_REF).convert("RGB")
    welcome = Image.open(ENTRY_WELCOME).convert("RGB")
    sx = sts.width / 853
    sy = sts.height / 1844
    sts_sprig = sts.crop(scale_box(REF_SPRIG, sx, sy))
    sts_word = sts.crop(scale_box(REF_WORD, sx, sy))

    wx, wy = 2.0, 2.0
    w_sprig = welcome.crop(scale_box(ENTRY_SPRIG, wx, wy))

    sprig = Image.open(SPRIG).convert("RGBA")
    word = Image.open(WORD).convert("RGBA")
    lockup = Image.open(F09_LOCKUP).convert("RGBA")
    composite = composite_from_layers()

    def pad(im: Image.Image, target_h: int) -> Image.Image:
        scale = target_h / im.height
        nw = max(1, int(im.width * scale))
        return im.resize((nw, target_h), Image.LANCZOS)

    row_h = 220
    panels = [
        ("F09_LOCKUP source", lockup),
        ("Sprig layer", sprig),
        ("Word layer", word),
        ("Layers recomposited", composite),
        ("STS ref sprig crop", sts_sprig),
        ("STS ref word crop", sts_word),
        ("ENTRY welcome sprig crop", w_sprig),
    ]
    cols = 4
    label_h = 28
    cell_w = 420
    rows = (len(panels) + cols - 1) // cols
    board = Image.new("RGB", (cols * cell_w, rows * (row_h + label_h) + 40), (245, 242, 235))
    from PIL import ImageDraw, ImageFont

    draw = ImageDraw.Draw(board)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except OSError:
        font = ImageFont.load_default()
    draw.text((12, 8), "JURNL identity forensic recovery — source vs layers vs page crops", fill=(40, 36, 32), font=font)
    for i, (label, im) in enumerate(panels):
        r, c = divmod(i, cols)
        x = c * cell_w + 12
        y = 40 + r * (row_h + label_h) + label_h
        draw.text((x, y - label_h + 4), label, fill=(60, 55, 48), font=font)
        if im.mode == "RGBA":
            bg = Image.new("RGB", im.size, (245, 242, 235))
            bg.paste(im, mask=im.split()[3])
            im = bg
        fitted = pad(im, row_h)
        board.paste(fitted, (x, y))
    out = OUT / "JURNL_CANONICAL_IDENTITY_COMPARISON_BOARD.jpg"
    board.save(out, quality=90, optimize=True)
    return out


def main() -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    # Preserve original bytes
    for src, name in [
        (F09_LOCKUP, "F09_LOCKUP.source.png"),
        (SPRIG, "LOCKUP_SPRIG.source.png"),
        (WORD, "LOCKUP_WORD.source.png"),
        (SUPERSEDED, "jurnl-logo-official.SUPERSEDED.png"),
    ]:
        shutil.copy2(src, ASSETS / name)

    sprig_re, word_re = reextract_lockup_layers()
    composite = composite_from_layers()
    comp_path = ASSETS / "LOCKUP_COMPOSITE.from_layers.png"
    composite.save(comp_path)

    lockup_arr = np.asarray(Image.open(F09_LOCKUP).convert("RGBA"))
    sprig_arr = np.asarray(Image.open(SPRIG).convert("RGBA"))
    word_arr = np.asarray(Image.open(WORD).convert("RGBA"))
    sprig_src = lockup_arr[:78, :82]
    word_src = lockup_arr[78 : lockup_arr.shape[0], :196]
    word_cmp = word_arr[: word_src.shape[0], : word_src.shape[1]]
    sprig_mae = masked_mae(sprig_src[..., :3], sprig_arr[..., :3], alpha_ink_mask(sprig_arr))
    word_mae = masked_mae(word_src[..., :3], word_cmp[..., :3], alpha_ink_mask(word_cmp))

    sprig_match = sha256(SPRIG) == sha256(sprig_re)
    word_match = sha256(WORD) == sha256(word_re)

    fidelity = {
        "sprig_layer_vs_lockup_crop_mae_rgb": sprig_mae,
        "word_layer_vs_lockup_crop_mae_rgb": word_mae,
        "component_fidelity_pass": sprig_mae == 0.0 and word_mae is not None and word_mae < 1.0,
        "reextract_sprig_matches_committed": sprig_match,
        "reextract_word_matches_committed": word_match,
        "full_frame_note": "F09_LOCKUP.png includes plaster behind the mark. Recompositing layers alone cannot reproduce the full frame without that background.",
        "tolerance_note": "Layers are deterministic cuts from F09_LOCKUP with haze removal (export_assets.py). No generative fill.",
    }
    (REPORTS / "JURNL_IDENTITY_FIDELITY_REPORT.json").write_text(json.dumps(fidelity, indent=2) + "\n")

    build_comparison_board()
    print(json.dumps({"fidelity": fidelity, "sprig_sha": sha256(SPRIG), "lockup_sha": sha256(F09_LOCKUP)}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
