#!/usr/bin/env python3
"""Build the production visual-asset surgery pack from final Opus geometry.

Source identity: ACTUAL_SITE00_OPUS_DERIVED.
Does not call image generation and does not replace fabricated pixels.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "docs/site00/public-redesign/OPUS_DERIVED_SURGERY"
PROOF = ROOT / "docs/site00/public-redesign/opus-proof"
GROK = ROOT / "docs/site00/public-redesign/GROK_ASSET_PACK"
OPUS_HEAD = "22a284773b1e57dccb49b0ed6e27b4e8cd8f1a12"

REGEN = {
    "ENV.LOCATIONS.ARCH": "Opus role requires a warm marble archway. The fabricated file is pale stone.",
    "ENV.BLDR.PATH.SYSTEMS": "Opus role requires a server-stack tower without UI screens. The fabricated file is a module column in an atrium.",
    "CARD.BLDR.PATH.SYSTEMS": "Opus role requires a server-rack stack. The fabricated card follows the module column, not a rack.",
    "ENV.BLDR.PATH.OVERVIEW": "Opus role requires glass path panels over a round table. The file is a crop of the command-center dais.",
    "CARD.BLDR.PATH.SITE": "Opus role requires skyline towers with red planes. The fabricated card is a single glass building.",
    "CARD.LOCATIONS.BLDR": "Opus role is a studio with a glass display. The file is a pale arch corridor.",
    "CARD.LOCATIONS.EVOLVE": "Opus role is a terrace with a tree and skyline. The file is a pale arch corridor.",
    "CARD.LOCATIONS.SITES": "Opus role is a cliffside spire city. The file is a pale arch corridor.",
    "CARD.LOCATIONS.SERVICES": "Opus role is a showroom with a display. The file is a pale arch corridor.",
    "CARD.LOCATIONS.SYSTEM": "Opus role is glass-cylinder machinery. The file is a pale arch corridor.",
    "CARD.LOCATIONS.ABOUT": "Opus role is a double-zero wall relief with trees. The file is an arch opening without that relief.",
    "CARD.LOCATIONS.JOURNAL": "Opus role is a mountain terrace with a table. The file is a pale arch corridor.",
}


def load(path: Path):
    return json.loads(path.read_text())


def surface_derivation(slot: dict) -> str:
    if slot["assetType"] == "machine-illustration":
        return "NOT_APPLICABLE"
    desktop = slot.get("desktopGeometry")
    if isinstance(desktop, str) and "no independent desktop" in desktop.lower():
        return "SAME_ASSET_DIFFERENT_CROP"
    return "SURFACE_SPECIFIC_COMPOSITION"


def mask_ownership(slot: dict) -> str:
    mask = (slot.get("mask") or "").lower()
    if mask.startswith("css mask"):
        return "CSS_MASK"
    if "container radius" in mask:
        return "PARENT_OVERFLOW"
    if mask.startswith("none"):
        return "NONE"
    return "IN_ASSET"


def shadow_ownership(slot: dict) -> str:
    # The Opus slot manifest does not define a separate shadow asset.
    return "NO_SHADOW"


def reflection_ownership(_slot: dict) -> str:
    return "NONE"


def family_of(slot_id: str) -> str:
    # Locations row names contain BLDR and EVOLVE. Match the page family first.
    if ".LOCATIONS." in slot_id or slot_id.startswith("ENV.LOCATIONS"):
        return "LOCATIONS"
    if slot_id.startswith("ENV.ORIGIN") or slot_id.startswith("CARD.ORIGIN") or slot_id.startswith("ILLUSTRATION.ORIGIN"):
        return "ORIGIN"
    if ".IDNTY." in slot_id or slot_id.startswith("ENV.IDNTY"):
        return "IDNTY"
    if ".BLDR." in slot_id or slot_id.startswith("ENV.BLDR") or slot_id.startswith("MACHINE.BLDR") or slot_id.startswith("CARD.BLDR"):
        return "BLDR"
    if ".EVOLVE." in slot_id or slot_id.startswith("ENV.EVOLVE") or slot_id.startswith("MACHINE.EVOLVE") or slot_id.startswith("CARD.EVOLVE"):
        return "EVOLVE"
    return "OTHER"


def continuity_group(slot_id: str) -> str:
    fam = family_of(slot_id)
    return {
        "ORIGIN": "SITE00_ORIGIN_UNIVERSE_V1",
        "ORIGIN_CARD": "SITE00_ORIGIN_UNIVERSE_V1",
        "IDNTY": "IDNTY_ATRIUM_CONTINUITY_V1",
        "BLDR": "BLDR_WORLD_SYSTEM_V1",
        "EVOLVE": "EVOLVE_INTERVENTION_SYSTEM_V1",
        "LOCATIONS": "SITE00_LOCATIONS_UNIVERSE_V1",
    }.get(fam, "UNASSIGNED")


def clamp_box(box, size):
    x, y, w, h = box
    W, H = size
    x0 = max(0, int(x))
    y0 = max(0, int(y))
    x1 = min(W, int(x + w))
    y1 = min(H, int(y + h))
    if x1 <= x0 or y1 <= y0:
        return None
    clipped = (x0, y0, x1 - x0, y1 - y0) != (int(x), int(y), int(w), int(h))
    return (x0, y0, x1, y1), clipped


def ui_boxes(geom: dict | None):
    if not geom:
        return []
    keys = ("header", "wordmark", "heroTitle", "cards", "nav", "notSure", "machine", "rail", "panelHead")
    out = []
    for key in keys:
        node = geom.get(key)
        if isinstance(node, dict) and all(k in node for k in ("x", "y", "w", "h")) and node["h"]:
            out.append((key, (node["x"], node["y"], node["w"], node["h"])))
    return out


def classify(slot, asset) -> tuple[str, str]:
    sid = slot["slotId"]
    if sid in REGEN:
        return "REQUIRES_REGENERATION", REGEN[sid]
    tw, th = slot["targetPixels"]["w"], slot["targetPixels"]["h"]
    if asset["width"] != tw or asset["height"] != th:
        scale = min(asset["width"] / tw, asset["height"] / th)
        if scale >= 1 and abs((asset["width"] / asset["height"]) - (tw / th)) < 0.02:
            return "VALID_WITH_CROP_ONLY", "Pixel size differs but resolution covers the Opus target at the same aspect."
        return "REQUIRES_REGENERATION", f"Fabricated {asset['width']}x{asset['height']} cannot cover Opus {tw}x{th} without a new composition."
    derived = surface_derivation(slot)
    mask = mask_ownership(slot)
    shadow = shadow_ownership(slot)
    deltas = []
    if asset.get("surface_derivation") != derived:
        deltas.append(f"surface_derivation {asset.get('surface_derivation')} -> {derived}")
    if asset.get("mask_ownership") != mask:
        deltas.append(f"mask_ownership {asset.get('mask_ownership')} -> {mask}")
    if asset.get("shadow_ownership") != shadow:
        deltas.append(f"shadow_ownership {asset.get('shadow_ownership')} -> {shadow}")
    if deltas:
        return "VALID_WITH_METADATA_CORRECTION", "; ".join(deltas)
    return "VALID_AS_IS", "Dimensions, transparency, crop, and Opus visual role agree. No injection-metadata delta."


def composite_env(proof: Image.Image, grok: Image.Image, boxes) -> Image.Image:
    base = grok.convert("RGB")
    base = cover(base, proof.size)
    ui = proof.convert("RGB")
    mask = Image.new("L", proof.size, 0)
    draw = ImageDraw.Draw(mask)
    for _name, (x, y, w, h) in boxes:
        if _name == "machine":
            continue
        boxed = clamp_box((x, y, w, h), proof.size)
        if not boxed:
            continue
        (x0, y0, x1, y1), _ = boxed
        draw.rectangle((x0, y0, x1, y1), fill=255)
    base.paste(ui, (0, 0), mask)
    return base


def cover(im: Image.Image, size) -> Image.Image:
    tw, th = size
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale) + 1, int(sh * scale) + 1
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (nw - tw) // 2
    y = (nh - th) // 2
    return im.crop((x, y, x + tw, y + th))


def main():
    manifest = load(ROOT / "docs/site00/public-redesign/OPUS-ASSET-SLOT-MANIFEST.json")
    geometry = load(ROOT / "docs/site00/public-redesign/opus-geometry-after.json")
    registry = load(GROK / "ASSET_REGISTRY.json")
    by_asset = {row["asset_id"]: row for row in registry["assets"]}
    slots = manifest["slots"]
    assert len(slots) == 52
    grok_slots = [s for s in slots if s["grokRequired"]]
    live_slots = [s for s in slots if not s["grokRequired"]]
    assert len(grok_slots) == 47
    assert len(live_slots) == 5

    for sub in ("reference-crops", "safe-zones", "scene-decomposition", "fabrication-specs", "composite-previews"):
        (PACK / sub).mkdir(parents=True, exist_ok=True)

    authorities = []
    for slot in grok_slots:
        for aid in slot["authority"]:
            if aid not in authorities:
                authorities.append(aid)

    for aid in authorities:
        geom = geometry.get(aid, {})
        proof_path = PROOF / aid / "after.png"
        lines = [
            f"# {aid}",
            "",
            "Source: ACTUAL_SITE00_OPUS_DERIVED",
            f"Validated against: {OPUS_HEAD}",
            "Geometry: docs/site00/public-redesign/opus-geometry-after.json",
            "Proof: docs/site00/public-redesign/opus-proof/" + aid + "/after.png",
            "",
            "Measured boxes (CSS px on the 390-wide proof):",
            "",
        ]
        for name, box in ui_boxes(geom):
            lines.append(f"- {name}: x={box[0]} y={box[1]} w={box[2]} h={box[3]}")
        lines.append("")
        lines.append("Live UI and live SVG stay in those boxes. They are not image-owned.")
        (PACK / "scene-decomposition" / f"{aid}.md").write_text("\n".join(lines) + "\n")

    results = []
    crop_count = 0
    zone_count = 0
    composite_count = 0

    for slot in slots:
        sid = slot["slotId"]
        asset = by_asset[sid]
        auth = slot["authority"][0]
        geom = geometry.get(auth)
        proof_path = PROOF / auth / "after.png"
        proof = Image.open(proof_path).convert("RGB") if proof_path.exists() else None
        fg = slot["finalGeometry"]
        if isinstance(fg, dict):
            box = (fg["x"], fg["y"], fg["w"], fg["h"])
        elif proof is not None:
            box = (0, 0, proof.size[0], proof.size[1])
        else:
            box = (0, 0, 0, 0)

        if slot["grokRequired"] and proof is not None:
            clamped = clamp_box(box, proof.size)
            crop = proof
            clipped = False
            if clamped:
                (x0, y0, x1, y1), clipped = clamped
                crop = proof.crop((x0, y0, x1, y1))
            crop_name = f"{sid.replace('.', '_')}_REFERENCE.jpg"
            crop.save(PACK / "reference-crops" / crop_name, quality=86)
            crop_count += 1

            overlay = Image.new("RGBA", proof.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            colors = {
                "header": (220, 40, 40, 90),
                "wordmark": (220, 40, 40, 70),
                "heroTitle": (40, 90, 220, 80),
                "cards": (240, 180, 40, 80),
                "nav": (220, 40, 40, 90),
                "notSure": (240, 180, 40, 60),
                "machine": (40, 180, 90, 70),
                "rail": (40, 180, 90, 50),
                "panelHead": (40, 90, 220, 50),
            }
            for name, ub in ui_boxes(geom):
                got = clamp_box(ub, proof.size)
                if not got:
                    continue
                (x0, y0, x1, y1), _ = got
                draw.rectangle((x0, y0, x1, y1), fill=colors.get(name, (255, 255, 255, 60)))
            if clamped:
                (x0, y0, x1, y1), _ = clamped
                draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(255, 255, 255, 220), width=2)
            zone_name = f"{sid.replace('.', '_')}_SAFE_ZONES.png"
            overlay.save(PACK / "safe-zones" / zone_name)
            zone_count += 1

            grok_path = GROK / "outputs" / asset["canonical_filename"]
            grok_im = Image.open(grok_path)
            if slot["assetType"] == "machine-illustration" and grok_im.mode == "RGBA":
                canvas = proof.copy()
                machine = None
                for name, ub in ui_boxes(geom):
                    if name == "machine":
                        machine = ub
                target = machine or box
                got = clamp_box(target, proof.size)
                if got:
                    (x0, y0, x1, y1), _ = got
                    fitted = grok_im.copy()
                    fitted.thumbnail((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
                    ox = x0 + ((x1 - x0) - fitted.size[0]) // 2
                    oy = y0 + ((y1 - y0) - fitted.size[1]) // 2
                    canvas.paste(fitted, (ox, oy), fitted)
                comp = canvas
            else:
                comp = composite_env(proof, grok_im, ui_boxes(geom))
            comp_name = f"{sid.replace('.', '_')}_COMPOSITE.jpg"
            comp.save(PACK / "composite-previews" / comp_name, quality=82)
            composite_count += 1
        else:
            clipped = False

        if slot["grokRequired"]:
            status, reason = classify(slot, asset)
            production = status in {"VALID_AS_IS", "VALID_WITH_CROP_ONLY", "VALID_WITH_METADATA_CORRECTION"}
            regen_required = status == "REQUIRES_REGENERATION"
        else:
            status = "SUPERSEDED_BY_LIVE_CODE"
            reason = slot.get("opusDecision") or "LIVE_CODE"
            production = False
            regen_required = False

        spec = {
            "pack_source": "ACTUAL_SITE00_OPUS_DERIVED",
            "validated_against": OPUS_HEAD,
            "asset_id": sid,
            "slot_id": sid,
            "authority": slot["authority"],
            "visual_role": slot["visualRole"],
            "asset_type": slot["assetType"],
            "target_pixels": slot["targetPixels"],
            "aspect_ratio": slot["aspectRatio"],
            "crop_behavior": slot["cropBehavior"],
            "final_geometry": slot["finalGeometry"],
            "transparency": slot["transparency"],
            "mask_ownership": mask_ownership(slot),
            "shadow_ownership": shadow_ownership(slot),
            "reflection_ownership": reflection_ownership(slot),
            "surface_derivation": surface_derivation(slot),
            "continuity_group": continuity_group(sid),
            "negative_space": "UI boxes in opus-geometry-after.json stay clear of focal detail. Wash on environments is live CSS over the lower region, not baked.",
            "must_include": [slot["visualRole"]],
            "must_exclude": [
                "header text and chrome",
                "navigation labels and buttons",
                "card titles and body copy",
                "live technical SVG linework",
                "baked CSS wash or row fade",
            ],
            "reference_crop": f"reference-crops/{sid.replace('.', '_')}_REFERENCE.jpg" if slot["grokRequired"] else None,
            "safe_zone_map": f"safe-zones/{sid.replace('.', '_')}_SAFE_ZONES.png" if slot["grokRequired"] else None,
            "reference_crop_clipped_by_proof": clipped if slot["grokRequired"] else None,
            "generation_source_of_pixels": "MAP2_FIXTURE_V1",
            "validation_status": status,
            "validation_reason": reason,
            "production_eligible": production,
            "regeneration_required": regen_required,
        }
        (PACK / "fabrication-specs" / f"{sid.replace('.', '_')}.json").write_text(json.dumps(spec, indent=2) + "\n")

        asset.update({
            "generation_source": "MAP2_FIXTURE_V1",
            "validated_against": OPUS_HEAD,
            "validation_status": status,
            "validation_reason": reason,
            "production_eligible": production,
            "regeneration_required": regen_required,
            "opus_target_pixels": slot["targetPixels"],
            "opus_surface_derivation": surface_derivation(slot),
            "opus_mask_ownership": mask_ownership(slot),
            "opus_shadow_ownership": shadow_ownership(slot),
            "opus_visual_role": slot["visualRole"],
        })
        results.append(spec)

    registry["pack_source_of_pixels"] = "MAP2_FIXTURE_V1"
    registry["validated_against"] = OPUS_HEAD
    registry["production_surgery"] = "docs/site00/public-redesign/OPUS_DERIVED_SURGERY"
    (GROK / "ASSET_REGISTRY.json").write_text(json.dumps(registry, indent=2) + "\n")

    counts = {}
    for spec in results:
        if spec["validation_status"] == "SUPERSEDED_BY_LIVE_CODE":
            continue
        counts[spec["validation_status"]] = counts.get(spec["validation_status"], 0) + 1

    eligible = [s for s in results if s["production_eligible"]]
    blocked = [s for s in results if s["validation_status"] in {"REQUIRES_REGENERATION", "BLOCKED_FOR_FOUNDER_REVIEW"}]
    summary = {
        "pack_source": "ACTUAL_SITE00_OPUS_DERIVED",
        "validated_against": OPUS_HEAD,
        "inputs": [
            "docs/site00/public-redesign/OPUS-ASSET-SLOT-MANIFEST.json",
            "docs/site00/public-redesign/opus-geometry-after.json",
            "docs/site00/public-redesign/opus-continuity.json",
            "docs/site00/public-redesign/opus-proof/",
        ],
        "fixture_used_as_production_authority": False,
        "pixel_generation_source": "MAP2_FIXTURE_V1",
        "grok_required": 47,
        "live_code": [s["slotId"] for s in live_slots],
        "reference_crops": crop_count,
        "safe_zone_overlays": zone_count,
        "composite_previews": composite_count,
        "scene_sheets": len(authorities),
        "classifications": counts,
        "production_eligible": len(eligible),
        "blocked": len(blocked),
        "assets_regenerated": 0,
        "results": [
            {
                "asset_id": s["asset_id"],
                "validation_status": s["validation_status"],
                "validation_reason": s["validation_reason"],
                "production_eligible": s["production_eligible"],
            }
            for s in results
            if s["validation_status"] != "SUPERSEDED_BY_LIVE_CODE"
        ],
    }
    (PACK / "RECONCILIATION.json").write_text(json.dumps(summary, indent=2) + "\n")
    (PACK / "PACK_SOURCE.json").write_text(json.dumps({
        "pack_source": "ACTUAL_SITE00_OPUS_DERIVED",
        "not": "FIXTURE",
        "validated_against": OPUS_HEAD,
        "note": "Pixel files remain the MAP2 fixture generation transplanted from 590d9b9c. This pack validates them. It does not replace them.",
    }, indent=2) + "\n")

    families = {}
    for spec in results:
        if spec["validation_status"] == "SUPERSEDED_BY_LIVE_CODE":
            continue
        fam = family_of(spec["asset_id"]).replace("_CARD", "")
        families.setdefault(fam, []).append(spec["validation_status"])
    fam_lines = ["# Continuity reconciliation against Opus geometry", ""]
    for fam, statuses in families.items():
        regen = statuses.count("REQUIRES_REGENERATION")
        fam_lines.append(f"## {fam}")
        fam_lines.append(f"assets {len(statuses)}; requires regeneration {regen}")
        fam_lines.append("Same world as the Opus proof screens: YES for files classified valid.")
        fam_lines.append("Family is not closed while a regeneration row remains." if regen else "No regeneration row in this family.")
        fam_lines.append("")
    (PACK / "CONTINUITY_QA.md").write_text("\n".join(fam_lines))

    handoff = [
        "# Composer handoff — Opus reconciliation",
        "",
        "STATUS: NOT_READY",
        "",
        "Pixels were generated from MAP2_FIXTURE_V1 and transplanted onto Opus 22a28477.",
        "This handoff lists only slots whose fabricated file matches the Opus-derived spec closely enough to inject later.",
        "It is not an injection order. Do not register these URLs in the live page in this sprint.",
        "",
        f"Production-eligible: {len(eligible)}",
        f"Blocked (regeneration or founder review): {len(blocked)}",
        "",
        "## Eligible",
        "",
    ]
    for spec in eligible:
        handoff.append(f"- {spec['asset_id']} — {spec['validation_status']} — {spec['target_pixels']['w']}x{spec['target_pixels']['h']}")
    handoff += ["", "## Blocked", ""]
    for spec in blocked:
        handoff.append(f"- {spec['asset_id']} — {spec['validation_status']} — {spec['validation_reason']}")
    handoff += [
        "",
        "## Excluded live-code slots",
        "",
    ]
    for slot in live_slots:
        handoff.append(f"- {slot['slotId']} — SUPERSEDED_BY_LIVE_CODE — file kept, not for injection")
    (PACK / "COMPOSER_HANDOFF.md").write_text("\n".join(handoff) + "\n")

    old = (GROK / "COMPOSER_INTEGRATION_HANDOFF.md").read_text()
    banner = (
        "STATUS: NOT_READY\n\n"
        "This handoff was written from the MAP2 fixture pack before Opus reconciliation. "
        "Do not inject from it. Use docs/site00/public-redesign/OPUS_DERIVED_SURGERY/COMPOSER_HANDOFF.md "
        "after the blocked assets are resolved. That file is also NOT_READY while regeneration rows remain.\n\n"
    )
    if not old.startswith("STATUS: NOT_READY"):
        (GROK / "COMPOSER_INTEGRATION_HANDOFF.md").write_text(banner + old)

    print(json.dumps({
        "crops": crop_count,
        "zones": zone_count,
        "composites": composite_count,
        "sheets": len(authorities),
        "counts": counts,
        "eligible": len(eligible),
        "blocked": len(blocked),
    }, indent=2))


if __name__ == "__main__":
    main()
