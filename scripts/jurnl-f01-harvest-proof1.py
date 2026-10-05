#!/usr/bin/env python3
"""P0.JURNL.F01-PARENT-ASSET-HARVEST-PROOF1 — extract from fresh parent only; no fallback regen."""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
from rembg import remove

PROOF = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY" / "ASSET_HARVEST_PROOF1"
PARENT_PATH = PROOF / "PARENT" / "F01.00_PARENT_TEST.png"
ISOLATED = PROOF / "ISOLATED"
REPORT_DIR = PROOF / "REPORT"

# UI exclusion zones (normalized) — material crops must not overlap these.
UI_EXCLUSIONS = [
    (0.0, 0.0, 0.22, 0.14),  # logo
    (0.0, 0.12, 0.52, 0.62),  # headline block
    (0.0, 0.62, 0.55, 0.72),  # tagline
    (0.05, 0.80, 0.95, 0.98),  # buttons
]


class Kind(str, Enum):
    OBJECT = "object"
    BOTANICAL = "botanical"
    ARCH = "arch"
    MATERIAL = "material"
    LIGHT = "light"


@dataclass
class Spec:
    asset_id: str
    box: tuple[float, float, float, float]
    kind: Kind
    isolate: bool = False
    texture_patch: tuple[float, float, float, float] | None = None


SPECS: list[Spec] = [
    Spec("ENTRY.ARCH.ARCHWAY.001", (0.54, 0.03, 0.98, 0.40), Kind.ARCH),
    Spec("ENTRY.ARCH.COAST.001", (0.62, 0.05, 0.96, 0.26), Kind.ARCH),
    Spec(
        "ENTRY.MATERIAL.PLASTER.001",
        (0.04, 0.14, 0.38, 0.48),
        Kind.MATERIAL,
        texture_patch=(0.06, 0.16, 0.22, 0.28),
    ),
    Spec(
        "ENTRY.MATERIAL.TRAVERTINE.001",
        (0.38, 0.58, 0.96, 0.84),
        Kind.MATERIAL,
        texture_patch=(0.42, 0.76, 0.72, 0.83),
    ),
    Spec(
        "ENTRY.MATERIAL.TEXTILE.ROSE.001",
        (0.50, 0.40, 0.76, 0.56),
        Kind.MATERIAL,
        texture_patch=(0.54, 0.44, 0.68, 0.52),
    ),
    Spec(
        "ENTRY.MATERIAL.CURTAIN.001",
        (0.78, 0.14, 0.98, 0.68),
        Kind.MATERIAL,
        texture_patch=(0.82, 0.22, 0.95, 0.45),
    ),
    Spec(
        "ENTRY.PAPER.001",
        (0.06, 0.42, 0.32, 0.58),
        Kind.MATERIAL,
        texture_patch=(0.10, 0.46, 0.24, 0.54),
    ),
    Spec("ENTRY.OBJECT.BUST.001", (0.44, 0.50, 0.60, 0.66), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.BOWL.001", (0.60, 0.64, 0.76, 0.76), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.BOOKS.001", (0.64, 0.70, 0.90, 0.84), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.JURNLBOOK.001", (0.70, 0.74, 0.86, 0.82), Kind.OBJECT, isolate=True),
    Spec("ENTRY.BOTANICAL.FOREGROUND.001", (0.0, 0.58, 0.22, 0.92), Kind.BOTANICAL, isolate=True),
    Spec("ENTRY.BOTANICAL.ACCENT.001", (0.02, 0.04, 0.10, 0.11), Kind.BOTANICAL, isolate=True),
    Spec("ENTRY.LIGHT.SUN.001", (0.0, 0.06, 0.30, 0.42), Kind.LIGHT),
]


def crop_norm(im: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    w, h = im.size
    x0, y0, x1, y1 = box
    return im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))


def overlaps_ui(box: tuple[float, float, float, float]) -> bool:
    for ex in UI_EXCLUSIONS:
        if not (box[2] <= ex[0] or box[0] >= ex[2] or box[3] <= ex[1] or box[1] >= ex[3]):
            return True
    return False


def alpha_stats(rgba: Image.Image) -> tuple[float, float]:
    a = np.array(rgba.split()[-1])
    opaque = (a > 16).sum()
    total = a.size
    return opaque / total, opaque / max(1, (a > 16).sum())


def edge_density(im: Image.Image) -> float:
    g = np.array(im.convert("L").filter(ImageFilter.FIND_EDGES))
    return float((g > 40).mean())


def isolate_rgba(crop: Image.Image) -> Image.Image:
    out = remove(crop.convert("RGBA"))
    if isinstance(out, bytes):
        return Image.open(BytesIO(out)).convert("RGBA")
    return out.convert("RGBA")


def make_light_overlay(crop: Image.Image) -> Image.Image:
    base = crop.convert("RGBA")
    w, h = base.size
    lum = base.convert("L").filter(ImageFilter.GaussianBlur(radius=max(w, h) // 8))
    lum = ImageEnhance.Brightness(lum).enhance(1.35)
    warm = Image.new("RGBA", (w, h), (255, 248, 235, 0))
    alpha = lum.point(lambda p: min(255, int(p * 0.55)))
    warm.putalpha(alpha)
    return warm


def assess_material(im: Image.Image, used_box: tuple[float, float, float, float]) -> tuple[bool, bool, str]:
    contamination = overlaps_ui(used_box) or edge_density(im) > 0.22
    usable = not contamination and im.width >= 64 and im.height >= 64
    status = "EXTRACTION_OK" if usable else "EXTRACTION_FAILED"
    return contamination, usable, status


def assess_isolated(rgba: Image.Image) -> tuple[bool, bool, str]:
    ratio, _ = alpha_stats(rgba)
    if ratio < 0.04 or ratio > 0.92:
        return True, False, "EXTRACTION_FAILED"
    contamination = ratio > 0.85  # mostly opaque rect = bad isolation
    usable = not contamination and 0.08 <= ratio <= 0.75
    return contamination, usable, "EXTRACTION_OK" if usable else "EXTRACTION_FAILED"


def assess_arch(im: Image.Image) -> tuple[bool, bool, str]:
    ed = edge_density(im)
    contamination = ed > 0.35
    usable = not contamination
    return contamination, usable, "EXTRACTION_OK" if usable else "EXTRACTION_FAILED"


def checkerboard(size: tuple[int, int], cell: int = 16) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h), (235, 232, 226))
    draw = ImageDraw.Draw(img)
    c1, c2 = (220, 217, 211), (245, 242, 236)
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            draw.rectangle((x, y, x + cell, y + cell), fill=c1 if ((x // cell) + (y // cell)) % 2 else c2)
    return img


def load_font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def build_contact_sheet(rows: list[dict]) -> None:
    cell_w, cell_h = 360, 420
    cols = 2
    n = len(rows)
    grid_rows = math.ceil(n / cols)
    pad = 20
    header = 80
    sheet = Image.new("RGB", (cols * cell_w + pad * (cols + 1), header + grid_rows * cell_h + pad * (grid_rows + 1)), (245, 241, 233))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 20), "HARVEST PROOF1 — CONTACT SHEET", fill=(20, 20, 20), font=load_font(22))
    f = load_font(12)
    for i, row in enumerate(rows):
        col, r = i % cols, i // cols
        x = pad + col * (cell_w + pad)
        y = header + pad + r * (cell_h + pad)
        d.rectangle((x, y, x + cell_w, y + cell_h), outline=(180, 175, 168), width=2)
        meta = (
            f"{row['assetId']}\n"
            f"SOURCE: {row['source']}\n"
            f"TYPE: {row['outputType']}\n"
            f"TRANSPARENT: {row['transparent']}\n"
            f"CONTAMINATION: {row['contamination']}\n"
            f"USABLE: {row['usable']}\n"
            f"STATUS: {row['status']}"
        )
        d.multiline_text((x + 8, y + 8), meta, fill=(30, 30, 30), font=f, spacing=2)
        p = Path(row["file"]) if row.get("file") else None
        if p and p.is_file():
            thumb = Image.open(p)
            if thumb.mode == "RGBA":
                bg = checkerboard((220, 180))
                thumb.thumbnail((220, 180))
                tx = x + (cell_w - thumb.width) // 2
                ty = y + 130
                bg.paste(thumb, ((220 - thumb.width) // 2, (180 - thumb.height) // 2), thumb)
                sheet.paste(bg, (tx, ty))
            else:
                thumb = thumb.convert("RGB")
                thumb.thumbnail((220, 180))
                sheet.paste(thumb, (x + (cell_w - thumb.width) // 2, y + 130))
    out = REPORT_DIR / "HARVEST_CONTACT_SHEET.png"
    sheet.save(out, optimize=True)


def main() -> None:
    if not PARENT_PATH.is_file():
        raise SystemExit(f"Missing parent test image: {PARENT_PATH}")
    ISOLATED.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    parent = Image.open(PARENT_PATH).convert("RGB")
    source = "F01.00_PARENT_TEST.png (immediate OpenArt output)"
    results: list[dict] = []

    for spec in SPECS:
        box = spec.texture_patch if spec.kind == Kind.MATERIAL and spec.texture_patch else spec.box
        crop = crop_norm(parent, box)
        transparent = "NO"
        contamination = False
        usable = False
        status = "EXTRACTION_FAILED"
        out_path = ISOLATED / f"{spec.asset_id}.png"
        output_type = spec.kind.value

        try:
            if spec.kind == Kind.LIGHT:
                img = make_light_overlay(crop_norm(parent, spec.box))
                transparent = "YES"
                contamination, usable, status = assess_material(img.convert("RGB"), spec.box)
                if usable:
                    img.save(out_path)
                output_type = "light_overlay"
            elif spec.isolate:
                img = isolate_rgba(crop_norm(parent, spec.box))
                transparent = "YES"
                contamination, usable, status = assess_isolated(img)
                if usable:
                    img.save(out_path)
            elif spec.kind == Kind.MATERIAL:
                img = crop.convert("RGB")
                contamination, usable, status = assess_material(img, box)
                if usable:
                    img.save(out_path)
                output_type = "material_texture"
            else:
                img = crop_norm(parent, spec.box).convert("RGB")
                contamination, usable, status = assess_arch(img)
                if usable:
                    img.save(out_path)
                output_type = "arch_scenic"
        except Exception as exc:  # noqa: BLE001
            status = "EXTRACTION_FAILED"
            contamination = True
            usable = False
            results.append(
                {
                    "assetId": spec.asset_id,
                    "source": source,
                    "outputType": output_type,
                    "transparent": transparent,
                    "contamination": "YES",
                    "usable": "NO",
                    "status": status,
                    "error": str(exc),
                    "file": None,
                }
            )
            continue

        if not usable:
            out_path.unlink(missing_ok=True)

        results.append(
            {
                "assetId": spec.asset_id,
                "source": source,
                "outputType": output_type,
                "transparent": transparent,
                "contamination": "YES" if contamination else "NO",
                "usable": "YES" if usable else "NO",
                "status": status,
                "file": str(out_path.relative_to(PROOF)) if usable else None,
            }
        )

    attempted = len(SPECS)
    clean = sum(1 for r in results if r["status"] == "EXTRACTION_OK")
    failed = attempted - clean
    rate = round(100.0 * clean / attempted, 1)

    obj_bot = [r for r in results if "OBJECT" in r["assetId"] or "BOTANICAL" in r["assetId"]]
    mat = [r for r in results if "MATERIAL" in r["assetId"] or "PAPER" in r["assetId"]]
    arch = [r for r in results if "ARCH" in r["assetId"]]

    def kind_pass(rows: list[dict]) -> bool:
        return rows and all(r["usable"] == "YES" for r in rows)

    report = {
        "sprint": "P0.JURNL.F01-PARENT-ASSET-HARVEST-PROOF1",
        "completedAt": datetime.now(timezone.utc).isoformat(),
        "parentFile": str(PARENT_PATH.relative_to(PROOF)),
        "newParentGenerations": 1,
        "childGenerations": 0,
        "stateGenerations": 0,
        "assetGenerations": 0,
        "totalPaidGenerations": 1,
        "parentCreditCostEstimate": 170,
        "assetsAttempted": attempted,
        "assetsCleanlyIsolated": clean,
        "assetsFailed": failed,
        "successRatePercent": rate,
        "screenshotCropContaminationFound": any(r["contamination"] == "YES" for r in results),
        "transparentObjectExtractionSuccessful": kind_pass(obj_bot),
        "materialExtractionSuccessful": kind_pass(mat),
        "architecturalExtractionSuccessful": kind_pass(arch),
        "methodPassesForFutureFamilies": rate >= 80.0,
        "recommendedNextMethodIfFail": "ASSET-FIRST GENERATION PIPELINE",
        "family01RepairWithoutRegeneratingChildren": rate >= 80.0,
        "assets": results,
    }

    (REPORT_DIR / "HARVEST_PROOF_REPORT.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    build_contact_sheet(results)
    print(json.dumps({"successRate": rate, "clean": clean, "failed": failed, "methodPass": report["methodPassesForFutureFamilies"]}))


if __name__ == "__main__":
    main()
