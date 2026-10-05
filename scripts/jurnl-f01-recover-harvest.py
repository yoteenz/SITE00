#!/usr/bin/env python3
"""P0.JURNL.F01-ASSET-HARVEST-RECOVERY1 — re-extract F01 assets from existing parent only."""
from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
PARENT = ROOT / "PARENT" / "F01.00_WELCOME_GENERATED.png"
OFFICIAL_LOGO = ROOT / "ASSETS" / "REFERENCE_JURNL_LOGO_OFFICIAL.jpg"
ASSETS = ROOT / "ASSETS"
ARCHIVE = ASSETS / "_ARCHIVE_SCREENSHOT_CROPS_v1"
OVERLAYS = ROOT / "OVERLAYS"
MANIFEST = ROOT / "MANIFEST"
COMP_REF = MANIFEST / "COMPONENT_REFERENCES"

PARENT_GEN = "WjkVD1jNeggB0iWBABM6"


class Kind(str, Enum):
    OBJECT = "object_isolated"
    BOTANICAL = "botanical_isolated"
    ARCH = "arch_scenic"
    MATERIAL = "material_texture"
    LIGHT = "light_overlay"
    COMPONENT = "component_reference"


@dataclass
class Spec:
    asset_id: str
    box: tuple[float, float, float, float]
    kind: Kind
    isolate: bool = False


# Boxes tuned on 1296×2304 parent — avoid headline/UI zones on material crops.
SPECS: list[Spec] = [
    Spec("ENTRY.ARCH.ARCHWAY.001", (0.54, 0.03, 0.98, 0.40), Kind.ARCH),
    Spec("ENTRY.ARCH.COAST.001", (0.62, 0.05, 0.96, 0.26), Kind.ARCH),
    Spec("ENTRY.MATERIAL.PLASTER.001", (0.04, 0.14, 0.38, 0.48), Kind.MATERIAL),
    Spec("ENTRY.MATERIAL.TRAVERTINE.001", (0.38, 0.58, 0.96, 0.84), Kind.MATERIAL),
    Spec("ENTRY.MATERIAL.TEXTILE.ROSE.001", (0.50, 0.40, 0.76, 0.56), Kind.MATERIAL),
    Spec("ENTRY.MATERIAL.CURTAIN.001", (0.78, 0.14, 0.98, 0.68), Kind.MATERIAL),
    Spec("ENTRY.PAPER.001", (0.06, 0.42, 0.32, 0.58), Kind.MATERIAL),
    Spec("ENTRY.OBJECT.BUST.001", (0.44, 0.50, 0.60, 0.66), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.BOWL.001", (0.60, 0.64, 0.76, 0.76), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.BOOKS.001", (0.64, 0.70, 0.90, 0.84), Kind.OBJECT, isolate=True),
    Spec("ENTRY.OBJECT.JURNLBOOK.001", (0.70, 0.74, 0.86, 0.82), Kind.OBJECT, isolate=True),
    Spec("ENTRY.BOTANICAL.FOREGROUND.001", (0.0, 0.58, 0.22, 0.92), Kind.BOTANICAL, isolate=True),
    Spec("ENTRY.BOTANICAL.ACCENT.001", (0.02, 0.04, 0.10, 0.11), Kind.BOTANICAL, isolate=True),
    Spec("ENTRY.LIGHT.SUN.001", (0.0, 0.06, 0.30, 0.42), Kind.LIGHT),
]

BUTTON_BOXES = {
    "ENTRY.BUTTON.PRIMARY.001": (0.10, 0.835, 0.90, 0.875),
    "ENTRY.BUTTON.SECONDARY.001": (0.10, 0.895, 0.90, 0.935),
}

LOGO_PLACEMENT = {
    "normalizedBox": [0.03, 0.03, 0.16, 0.12],
    "canonicalLogoFile": "ASSETS/REFERENCE_JURNL_LOGO_OFFICIAL.jpg",
    "sourceScreen": "F01.00",
    "notes": "Use official logo asset — not a raster crop from parent.",
}


def crop_norm(im: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    w, h = im.size
    x0, y0, x1, y1 = box
    return im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))


def make_light_overlay(im: Image.Image) -> Image.Image:
    """Soft warm light falloff — reusable overlay (RGBA)."""
    base = im.convert("RGBA")
    w, h = base.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # Warm highlight from upper-left using blurred luminance mask
    lum = base.convert("L").filter(ImageFilter.GaussianBlur(radius=max(w, h) // 8))
    lum = ImageEnhance.Brightness(lum).enhance(1.35)
    warm = Image.new("RGBA", (w, h), (255, 248, 235, 0))
    alpha = lum.point(lambda p: min(255, int(p * 0.55)))
    warm.putalpha(alpha)
    return warm


def isolate_rgba(crop: Image.Image) -> Image.Image:
    out = remove(crop.convert("RGBA"))
    if isinstance(out, bytes):
        from io import BytesIO

        return Image.open(BytesIO(out)).convert("RGBA")
    return out.convert("RGBA")


def audit_existing() -> list[str]:
    found = []
    for p in ASSETS.glob("ENTRY.*.png"):
        found.append(p.name)
    return sorted(found)


def main() -> None:
    if not PARENT.is_file():
        raise SystemExit(f"Missing parent: {PARENT}")

    ASSETS.mkdir(parents=True, exist_ok=True)
    OVERLAYS.mkdir(parents=True, exist_ok=True)
    COMP_REF.mkdir(parents=True, exist_ok=True)

    screenshot_crops = audit_existing()
    if screenshot_crops:
        ARCHIVE.mkdir(parents=True, exist_ok=True)
        for name in screenshot_crops:
            src = ASSETS / name
            shutil.move(str(src), str(ARCHIVE / name))

    parent = Image.open(PARENT).convert("RGB")
    recovery_rows: list[dict] = []
    lineage: list[dict] = []

    for spec in SPECS:
        crop = crop_norm(parent, spec.box)
        action = "re-extracted_crop"
        dest = ASSETS / f"{spec.asset_id}.png"

        if spec.kind == Kind.LIGHT:
            img = make_light_overlay(crop)
            dest = OVERLAYS / f"{spec.asset_id}.png"
            action = "re-extracted_overlay"
        elif spec.isolate:
            img = isolate_rgba(crop)
            action = "re-extracted_isolated"
        else:
            img = crop.convert("RGB")
            action = "re-extracted_crop"

        img.save(dest, optimize=True)
        classification = {
            Kind.OBJECT: "TRUE_ISOLATED_ASSET",
            Kind.BOTANICAL: "TRUE_ISOLATED_ASSET",
            Kind.ARCH: "CLEAN_SCENIC_CROP",
            Kind.MATERIAL: "MATERIAL_TEXTURE_CROP",
            Kind.LIGHT: "REUSABLE_OVERLAY",
        }[spec.kind]

        recovery_rows.append(
            {
                "assetId": spec.asset_id,
                "prior": "SCREENSHOT_CROP",
                "action": action,
                "classification": classification,
                "openArtRegen": False,
            }
        )
        lineage.append(
            {
                "ASSET_ID": spec.asset_id,
                "SOURCE_SCREEN": "F01.00",
                "SOURCE_GENERATION": PARENT_GEN,
                "STATUS": "CANONICAL",
                "EXTRACTION": action,
                "FILE": str(dest.relative_to(ROOT)),
                "USED_BY": ["F01_ENTRY_FAMILY"],
                "ALLOWED_TRANSFORMS": ["crop", "scale", "mask", "responsive reposition", "subtle tonal adjustment"],
                "NOT_ALLOWED": ["redesign", "arbitrary recolor", "material replacement", "style drift"],
            }
        )

    # Component references (not ASSETS)
    for btn_id, box in BUTTON_BOXES.items():
        ref = crop_norm(parent, box)
        ref_path = COMP_REF / f"{btn_id}.png"
        ref.save(ref_path, optimize=True)
        recovery_rows.append(
            {
                "assetId": btn_id,
                "prior": "SCREENSHOT_CROP_IN_ASSETS",
                "action": "reclassified_component_reference",
                "classification": "IMPLEMENTATION_COMPONENT_REFERENCE",
                "openArtRegen": False,
                "referenceFile": str(ref_path.relative_to(ROOT)),
            }
        )

    recovery_rows.append(
        {
            "assetId": "ENTRY.LOGO.PLACEMENT.001",
            "prior": "SCREENSHOT_CROP_IN_ASSETS",
            "action": "reclassified_to_official_logo",
            "classification": "IMPLEMENTATION_COMPONENT_REFERENCE",
            "openArtRegen": False,
            "canonicalLogo": LOGO_PLACEMENT["canonicalLogoFile"],
        }
    )

    report = {
        "sprint": "P0.JURNL.F01-ASSET-HARVEST-RECOVERY1",
        "completedAt": datetime.now(timezone.utc).isoformat(),
        "parentFile": str(PARENT.relative_to(ROOT)),
        "parentRegenerated": 0,
        "openArtCreditSpendGenerations": 0,
        "screenshotCropAssetsFound": len(screenshot_crops),
        "assetsAudited": len(screenshot_crops) + len(BUTTON_BOXES) + 1,
        "assetsReExtracted": len(SPECS),
        "assetsReclassifiedAsComponentReferences": len(BUTTON_BOXES) + 1,
        "assetsRequiringIsolatedRegen": 0,
        "recoveryRows": recovery_rows,
        "archivedPriorCrops": str(ARCHIVE.relative_to(ROOT)),
    }

    (MANIFEST / "asset_lineage_harvest.json").write_text(json.dumps(lineage, indent=2), encoding="utf-8")
    (MANIFEST / "F01_ASSET_RECOVERY_REPORT.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    comp = json.loads((MANIFEST / "F01_COMPONENT_MANIFEST.json").read_text(encoding="utf-8"))
    comp["logo"] = {
        **comp.get("logo", {}),
        "canonicalFile": LOGO_PLACEMENT["canonicalLogoFile"],
        "welcomePlacement": LOGO_PLACEMENT,
    }
    comp["buttonReferences"] = {
        "sourceScreen": "F01.00",
        "sourceGeneration": PARENT_GEN,
        "note": "Implementation components — not reusable raster ASSETS.",
        "primary": {
            "id": "ENTRY.BUTTON.PRIMARY.001",
            "implementation": comp["buttons"]["primary"],
            "parentNormalizedBox": list(BUTTON_BOXES["ENTRY.BUTTON.PRIMARY.001"]),
            "visualReference": "MANIFEST/COMPONENT_REFERENCES/ENTRY.BUTTON.PRIMARY.001.png",
        },
        "secondary": {
            "id": "ENTRY.BUTTON.SECONDARY.001",
            "implementation": comp["buttons"]["secondary"],
            "parentNormalizedBox": list(BUTTON_BOXES["ENTRY.BUTTON.SECONDARY.001"]),
            "visualReference": "MANIFEST/COMPONENT_REFERENCES/ENTRY.BUTTON.SECONDARY.001.png",
        },
    }
    comp["lightOverlay"] = {
        "id": "ENTRY.LIGHT.SUN.001",
        "file": "OVERLAYS/ENTRY.LIGHT.SUN.001.png",
        "implementationRecipe": "Multiply warm soft-light overlay over plaster regions; anchor upper-left.",
    }
    (MANIFEST / "F01_COMPONENT_MANIFEST.json").write_text(json.dumps(comp, indent=2), encoding="utf-8")

    print(json.dumps({"report": report["sprint"], "reExtracted": len(SPECS), "archived": len(screenshot_crops)}))


if __name__ == "__main__":
    main()
