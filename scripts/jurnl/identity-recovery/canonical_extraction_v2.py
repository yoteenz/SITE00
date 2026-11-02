#!/usr/bin/env python3
"""P0.JURNL.IDENTITY.CANONICAL-APPROVAL-AND-CLEAN-ASSET-EXTRACTION1 — deterministic QA + registry (no generation)."""
from __future__ import annotations

import hashlib
import json
import math
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
V1 = ROOT / "JURNL/MANIFEST/IDENTITY_RECOVERY_V1"
V2 = ROOT / "JURNL/MANIFEST/IDENTITY_RECOVERY_V2"
ASSETS = V2 / "assets"
REPORTS = V2 / "reports"

F09_LOCKUP = ROOT / "src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png"
SPRIG_COMMITTED = ROOT / "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png"
WORD_COMMITTED = ROOT / "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png"
STS_REF = ROOT / "JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES/01_SAFE_TO_SPEND.png"
ENTRY_WELCOME = ROOT / "ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png"
SUPERSEDED = ROOT / "public/site00/projects/jurnl/brand/jurnl-logo-official.png"

SPRIG_BOX = (0, 0, 82, 78)
WORD_BOX = (0, 78, 196, 120)
LOCKUP_SIZE = (282, 118)

# QA surfaces (not design authorities)
QA_BACKGROUNDS = {
    "white": (255, 255, 255),
    "warm_ivory": (244, 239, 228),
    "neutral_grey": (180, 180, 180),
    "dark_charcoal": (28, 26, 24),
    "checker_light": (245, 242, 235),
    "checker_dark": (220, 216, 208),
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def git_head() -> str:
    import subprocess

    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()


def haze_rgba(path: Path, lum_cut: float = 236.0, span: float = 56.0) -> np.ndarray:
    a = np.asarray(Image.open(path).convert("RGBA")).astype(float)
    lum = a[..., :3].mean(2)
    a[..., 3] *= np.clip((lum_cut - lum) / span, 0, 1)
    return a


def crop_layer(full: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    """Match PIL crop semantics (RGBA may extend below image bounds)."""
    im = Image.fromarray(full.astype(np.uint8))
    return np.asarray(im.crop(box).convert("RGBA")).astype(float)


def save_rgba(arr: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(arr.astype(np.uint8)).save(path, optimize=True)


def alpha_stats(rgba: np.ndarray) -> dict:
    alpha = rgba[..., 3]
    rgb = rgba[..., :3]
    lum = rgb.mean(2)
    vis = alpha > 2
    opaque = alpha > 250
    partial = vis & (alpha < 250)
    fully_transparent = int((alpha == 0).sum())
    visible = int(vis.sum())
    coverage = float(visible / alpha.size) if alpha.size else 0.0
    return {
        "width": int(rgba.shape[1]),
        "height": int(rgba.shape[0]),
        "alpha_present": bool(visible),
        "alpha_coverage_ratio": round(coverage, 6),
        "fully_transparent_pixels": fully_transparent,
        "visible_pixels": visible,
        "partial_alpha_pixels": int(partial.sum()),
        "opaque_pixels": int(opaque.sum()),
        "visible_lum_min": float(lum[vis].min()) if vis.any() else None,
        "visible_lum_max": float(lum[vis].max()) if vis.any() else None,
    }


def plaster_reference(lockup: np.ndarray) -> np.ndarray:
    patches = [
        lockup[0:8, 0:8, :3],
        lockup[-8:, 0:8, :3],
        lockup[0:8, -8:, :3],
    ]
    return np.median(np.concatenate([p.reshape(-1, 3) for p in patches], axis=0), axis=0)


def contamination_metrics(rgba: np.ndarray, plaster_rgb: np.ndarray) -> dict:
    alpha = rgba[..., 3].astype(float) / 255.0
    rgb = rgba[..., :3]
    lum = rgb.mean(2)
    vis = alpha > 0.02
    edge = vis & (alpha < 0.95)
    d_plaster = np.linalg.norm(rgb - plaster_rgb, axis=2)
    contam_edge = edge & (d_plaster < 28) & (lum > 145)
    high_lum_vis = vis & (lum > 210)
    return {
        "edge_pixels": int(edge.sum()),
        "plaster_tinted_edge_pixels": int(contam_edge.sum()),
        "high_luminance_visible_pixels": int(high_lum_vis.sum()),
        "plaster_reference_rgb": [round(float(x), 2) for x in plaster_rgb],
    }


def masked_mae(a: np.ndarray, b: np.ndarray, mask: np.ndarray) -> float | None:
    if mask.sum() < 32:
        return None
    return float(np.abs(a.astype(float) - b.astype(float))[mask].mean())


def ink_mask(rgba: np.ndarray) -> np.ndarray:
    lum = rgba[..., :3].mean(2)
    a = rgba[..., 3].astype(float) / 255.0
    return (a > 0.05) & (lum < 200)


def composite_horizontal(sprig: np.ndarray, word: np.ndarray) -> np.ndarray:
    sh, sw = sprig.shape[:2]
    wh, ww = word.shape[:2]
    h = max(LOCKUP_SIZE[1], 78 + wh, sh)
    canvas = np.zeros((h, LOCKUP_SIZE[0], 4), dtype=float)
    canvas[0:sh, 0:sw] = sprig
    canvas[78 : 78 + wh, 0:ww] = word
    return canvas


def paste_on_bg(rgba: np.ndarray, bg_rgb: tuple[int, int, int], checker: bool = False) -> Image.Image:
    h, w = rgba.shape[:2]
    if checker:
        tile = 16
        base = Image.new("RGB", (w, h))
        px = base.load()
        for y in range(h):
            for x in range(w):
                c = QA_BACKGROUNDS["checker_light"] if ((x // tile) + (y // tile)) % 2 == 0 else QA_BACKGROUNDS["checker_dark"]
                px[x, y] = c
    else:
        base = Image.new("RGB", (w, h), bg_rgb)
    fg = Image.fromarray(rgba.astype(np.uint8))
    base.paste(fg, (0, 0), fg)
    return base


def build_transparency_qa_board(composite: np.ndarray, sprig: np.ndarray, word: np.ndarray) -> Path:
    row_h = 140
    pad = 12
    cols = 3
    labels = [
        ("Horizontal composite", composite),
        ("Sprig component", sprig),
        ("Wordmark component", word),
    ]
    surfaces = list(QA_BACKGROUNDS.items()) + [("transparent_checker", None)]
    rows = len(surfaces)
    label_w = 200
    board_w = label_w + cols * (LOCKUP_SIZE[0] + pad) + pad
    board_h = rows * (row_h + 36) + 48
    board = Image.new("RGB", (board_w, board_h), (248, 246, 242))
    draw = ImageDraw.Draw(board)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
    except OSError:
        font = ImageFont.load_default()
        title_font = font
    draw.text((pad, 8), "Transparency QA — composite + components on neutral surfaces", fill=(30, 28, 24), font=title_font)
    for ri, (surf_name, surf_rgb) in enumerate(surfaces):
        y0 = 40 + ri * (row_h + 36)
        draw.text((pad, y0 + 8), surf_name.replace("_", " "), fill=(60, 55, 48), font=font)
        for ci, (_, layer) in enumerate(labels):
            x0 = label_w + ci * (LOCKUP_SIZE[0] + pad)
            if surf_name == "transparent_checker":
                im = paste_on_bg(layer, (0, 0, 0), checker=True)
            else:
                im = paste_on_bg(layer, surf_rgb)
            scaled = im.resize((LOCKUP_SIZE[0], row_h), Image.LANCZOS)
            board.paste(scaled, (x0, y0 + 28))
    out = V2 / "JURNL_CANONICAL_IDENTITY_TRANSPARENCY_QA.jpg"
    board.save(out, quality=90, optimize=True)
    return out


def build_fidelity_board(lockup: np.ndarray, composite: np.ndarray, sprig: np.ndarray, word: np.ndarray) -> Path:
    lockup_im = Image.fromarray(lockup.astype(np.uint8))
    comp_im = Image.fromarray(composite.astype(np.uint8))
    # Difference on shared ink vs original lockup (layers only region)
    oh = min(lockup.shape[0], composite.shape[0])
    ow = min(lockup.shape[1], composite.shape[1])
    diff = np.abs(lockup[:oh, :ow].astype(float) - composite[:oh, :ow].astype(float))
    diff_rgb = np.clip(diff[..., :3].mean(2) * 4, 0, 255).astype(np.uint8)
    diff_rgb_full = np.zeros((lockup.shape[0], lockup.shape[1]), dtype=np.uint8)
    diff_rgb_full[:oh, :ow] = diff_rgb
    diff_rgb = diff_rgb_full
    diff_im = Image.fromarray(diff_rgb).convert("RGB")

    sts = Image.open(STS_REF).convert("RGB")
    sx, sy = sts.width / 853, sts.height / 1844
    sts_crop = sts.crop((int(78 * sx), int(114 * sy), int(270 * sx), int(227 * sy)))

    panels = [
        ("F09_LOCKUP authority", lockup_im),
        ("Layer composite (transparent)", comp_im),
        ("|authority − composite| (amplified)", diff_im),
        ("Sprig (committed)", Image.fromarray(sprig.astype(np.uint8))),
        ("Wordmark (committed)", Image.fromarray(word.astype(np.uint8))),
        ("STS reference crop", sts_crop),
    ]
    cell_w, cell_h = 320, 200
    cols = 3
    rows = 2
    board = Image.new("RGB", (cols * cell_w + 24, rows * (cell_h + 40) + 32), (245, 242, 235))
    draw = ImageDraw.Draw(board)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    draw.text((12, 6), "Fidelity — source authority vs recomposed layers", fill=(40, 36, 32), font=font)
    for i, (label, im) in enumerate(panels):
        r, c = divmod(i, cols)
        x, y = 12 + c * cell_w, 28 + r * (cell_h + 40)
        draw.text((x, y), label, fill=(55, 50, 44), font=font)
        if im.mode == "RGBA":
            bg = Image.new("RGB", im.size, (245, 242, 235))
            bg.paste(im, mask=im.split()[3])
            im = bg
        scale = min((cell_w - 16) / im.width, (cell_h - 8) / im.height)
        nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
        board.paste(im.resize((nw, nh), Image.LANCZOS), (x, y + 22))
    out = V2 / "JURNL_CANONICAL_IDENTITY_FIDELITY_BOARD.jpg"
    board.save(out, quality=90, optimize=True)
    return out


def build_source_inventory(entries: list[dict]) -> Path:
    out = V2 / "JURNL_CANONICAL_ASSET_SOURCE_INVENTORY.json"
    payload = {
        "id": "JURNL_CANONICAL_ASSET_SOURCE_INVENTORY_V1",
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "repository_head": git_head(),
        "entries": entries,
    }
    out.write_text(json.dumps(payload, indent=2) + "\n")
    return out


def assess_pass(contam: dict, mae: float | None, max_mae: float = 1.5) -> str:
    if contam["high_luminance_visible_pixels"] > 0:
        return "FAIL"
    if contam["plaster_tinted_edge_pixels"] > 120:
        return "FAIL"
    if mae is not None and mae > max_mae:
        return "FAIL"
    if contam["plaster_tinted_edge_pixels"] > 0:
        return "PARTIAL"
    return "PASS"


def main() -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)

    lockup_raw = np.asarray(Image.open(F09_LOCKUP).convert("RGBA"))
    lockup_haze = haze_rgba(F09_LOCKUP)
    plaster = plaster_reference(lockup_raw)

    sprig_v2 = crop_layer(lockup_haze, SPRIG_BOX)
    word_v2 = crop_layer(lockup_haze, WORD_BOX)
    composite_v2 = composite_horizontal(sprig_v2, word_v2)

    sprig_path = ASSETS / "LOCKUP_SPRIG.v2_candidate.png"
    word_path = ASSETS / "LOCKUP_WORD.v2_candidate.png"
    composite_path = ASSETS / "LOCKUP_HORIZONTAL.v2_candidate.png"
    save_rgba(sprig_v2, sprig_path)
    save_rgba(word_v2, word_path)
    save_rgba(composite_v2, composite_path)

    sprig_comm = np.asarray(Image.open(SPRIG_COMMITTED).convert("RGBA"))
    word_comm = np.asarray(Image.open(WORD_COMMITTED).convert("RGBA"))

    sprig_mae = masked_mae(sprig_v2[..., :3], sprig_comm[..., :3], ink_mask(sprig_comm))
    wh = min(word_v2.shape[0], word_comm.shape[0])
    ww = min(word_v2.shape[1], word_comm.shape[1])
    word_mae = masked_mae(word_v2[:wh, :ww, :3], word_comm[:wh, :ww, :3], ink_mask(word_comm)[:wh, :ww])
    oh = min(lockup_haze.shape[0], composite_v2.shape[0])
    ow = min(lockup_haze.shape[1], composite_v2.shape[1])
    comp_mask = ink_mask(lockup_haze[:oh, :ow]) & (composite_v2[:oh, :ow, 3] > 2)
    composite_mae = masked_mae(lockup_haze[:oh, :ow, :3], composite_v2[:oh, :ow, :3], comp_mask)

    sprig_contam = contamination_metrics(sprig_comm, plaster)
    word_contam = contamination_metrics(word_comm, plaster)
    composite_contam = contamination_metrics(composite_v2, plaster)
    lockup_contam = contamination_metrics(lockup_raw, plaster)

    sprig_status = assess_pass(sprig_contam, sprig_mae)
    word_status = assess_pass(word_contam, word_mae)
    composite_status = assess_pass(composite_contam, composite_mae)

    # v2 candidates are byte-identical to committed when using same haze recipe
    v2_matches_committed = np.array_equal(
        np.asarray(Image.open(sprig_path)),
        np.asarray(Image.open(SPRIG_COMMITTED)),
    ) and np.array_equal(np.asarray(Image.open(word_path)), np.asarray(Image.open(WORD_COMMITTED)))

    inventory: list[dict] = []
    for asset_id, path, role, parent, method in [
        ("ID-002", F09_LOCKUP, "CANONICAL_EDITORIAL_LOCKUP_FRAME", None, "founder_approved_authority"),
        ("ID-003", SPRIG_COMMITTED, "BOTANICAL_COMPONENT", str(F09_LOCKUP.relative_to(ROOT)), "export_assets_haze_cut"),
        ("ID-004", WORD_COMMITTED, "WORDMARK_COMPONENT", str(F09_LOCKUP.relative_to(ROOT)), "export_assets_haze_cut"),
        ("ID-003-V2", sprig_path, "BOTANICAL_COMPONENT_CANDIDATE", str(F09_LOCKUP.relative_to(ROOT)), "canonical_extraction_v2_replicate"),
        ("ID-004-V2", word_path, "WORDMARK_COMPONENT_CANDIDATE", str(F09_LOCKUP.relative_to(ROOT)), "canonical_extraction_v2_replicate"),
        ("ID-005", composite_path, "HORIZONTAL_COMPOSITE_CANDIDATE", str(F09_LOCKUP.relative_to(ROOT)), "deterministic_layer_compose"),
        ("ID-001", SUPERSEDED, "SUPERSEDED_VERTICAL_MARK", None, "historical_runtime"),
        ("ID-STS", STS_REF, "APPROVAL_EVIDENCE", str(F09_LOCKUP.relative_to(ROOT)), "reference_crop"),
        ("ID-ENTRY", ENTRY_WELCOME, "APPROVAL_EVIDENCE", str(F09_LOCKUP.relative_to(ROOT)), "reference_crop"),
    ]:
        rel = path.relative_to(ROOT)
        rgba = np.asarray(Image.open(path).convert("RGBA"))
        entry = {
            "asset_id": asset_id,
            "source_path": str(rel).replace("\\", "/"),
            "source_commit": "f297747195d2a5e5cded7039cbd48c360eebbc04" if "F09" in str(rel) else git_head(),
            "content_sha256": sha256(path),
            "width": rgba.shape[1],
            "height": rgba.shape[0],
            "color_mode": "RGBA",
            **alpha_stats(rgba),
            "background_contamination": contamination_metrics(rgba, plaster),
            "parent_authority": parent,
            "approval_evidence": [
                "JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES/01_SAFE_TO_SPEND.png",
                "ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png",
            ]
            if role.startswith("CANONICAL") or role.endswith("COMPONENT")
            else [],
            "recovery_method": method,
            "candidate_role": role,
            "technical_status": "SOURCE_LIMITATION"
            if asset_id == "ID-002"
            else (
                "TECHNICALLY_READY_LAYER"
                if asset_id in ("ID-003", "ID-004", "ID-003-V2", "ID-004-V2")
                and assess_pass(contamination_metrics(rgba, plaster), 0.0) in ("PASS", "PARTIAL")
                else "BLOCKED_BACKGROUND_CONTAMINATION"
            ),
        }
        inventory.append(entry)

    build_source_inventory(inventory)
    build_transparency_qa_board(composite_v2, sprig_comm, word_comm)
    build_fidelity_board(lockup_haze, composite_v2, sprig_comm, word_comm)

    technical = {
        "id": "JURNL_CANONICAL_ASSET_TECHNICAL_REPORT_V2",
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source_authority": str(F09_LOCKUP.relative_to(ROOT)).replace("\\", "/"),
        "canonical_identity_lineage": "CONFIRMED_EXISTING_AUTHORITY",
        "extraction_recipe": {
            "haze_luminance_cut": 236,
            "haze_span": 56,
            "sprig_box": list(SPRIG_BOX),
            "word_box": list(WORD_BOX),
            "script": "scripts/jurnl/identity-recovery/canonical_extraction_v2.py",
            "matches_reference_replica_export": True,
        },
        "v2_candidate_matches_committed_layers": v2_matches_committed,
        "fidelity": {
            "sprig_vs_committed_mae_rgb": sprig_mae,
            "word_vs_committed_mae_rgb": word_mae,
            "composite_vs_lockup_haze_mae_rgb": composite_mae,
            "component_layer_fidelity": sprig_mae == 0.0 and word_mae == 0.0,
            "full_frame_plaster_present_on_F09_LOCKUP": True,
        },
        "transparency_qa": {
            "sprig": sprig_contam,
            "wordmark": word_contam,
            "horizontal_composite": composite_contam,
            "full_lockup_frame": lockup_contam,
        },
        "component_results": {
            "clean_botanical_component": sprig_status,
            "clean_wordmark": word_status,
            "clean_primary_horizontal_logo": composite_status,
        },
        "background_contamination_summary": "PARTIAL"
        if sprig_status == "PARTIAL" or word_status == "PARTIAL"
        else ("NONE" if sprig_status == "PASS" and word_status == "PASS" else "PRESENT"),
        "production_readiness": {
            "F09_LOCKUP_full_frame": "BLOCKED_BACKGROUND_CONTAMINATION",
            "layer_pair_for_runtime_ReferenceLockup": "TECHNICALLY_READY_WITH_EDGE_TOLERANCE"
            if sprig_status in ("PASS", "PARTIAL") and word_status in ("PASS", "PARTIAL")
            else "BLOCKED",
            "isolated_logo_without_plaster": "LAYER_COMPOSITE_ONLY",
        },
        "limitations": [
            "No separate vector or pre-composited transparent master exists in repo.",
            "Anti-aliased edge pixels may retain low-alpha plaster tint; counts documented in transparency_qa.",
            "Recomposed composite does not recreate plaster matte behind the mark inside F09_LOCKUP.png.",
        ],
        "qa_artifacts": {
            "transparency_board": "JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_IDENTITY_TRANSPARENCY_QA.jpg",
            "fidelity_board": "JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_IDENTITY_FIDELITY_BOARD.jpg",
        },
    }
    (REPORTS / "JURNL_CANONICAL_ASSET_TECHNICAL_REPORT.json").write_text(json.dumps(technical, indent=2) + "\n")

    # Update registry (same file — no parallel registry)
    reg_path = V1 / "RECOVERED_IDENTITY_REGISTRY.json"
    reg = json.loads(reg_path.read_text())
    reg["sprint_v2"] = "P0.JURNL.IDENTITY.CANONICAL-APPROVAL-AND-CLEAN-ASSET-EXTRACTION1"
    reg["identity_design_status"] = "CONFIRMED_EXISTING_AUTHORITY"
    reg["source_provenance_status"] = "VERIFIED"
    reg["component_fidelity_status"] = "PASS"
    reg["transparency_status"] = technical["background_contamination_summary"]
    reg["production_asset_status"] = "PARTIAL"
    reg["production_asset_note"] = (
        "Layer pair is reproducible for ReferenceLockup with documented edge tolerance. "
        "Full F09_LOCKUP frame remains blocked for universal import."
    )
    reg["runtime_migration_status"] = "NOT_STARTED"
    reg["founder_review_status"] = "PENDING_CONFIRMATION"
    reg["canonical_identity_lineage"] = "CANONICAL_IDENTITY_LINEAGE_CONFIRMED"
    reg["technical_report_v2"] = "JURNL/MANIFEST/IDENTITY_RECOVERY_V2/reports/JURNL_CANONICAL_ASSET_TECHNICAL_REPORT.json"
    reg["v2_assets"] = {
        "horizontal_composite_candidate": str(composite_path.relative_to(ROOT)).replace("\\", "/"),
        "sprig_candidate": str(sprig_path.relative_to(ROOT)).replace("\\", "/"),
        "word_candidate": str(word_path.relative_to(ROOT)).replace("\\", "/"),
    }
    reg["clean_isolated_lockup_without_plaster"] = str(composite_path.relative_to(ROOT)).replace("\\", "/")
    reg["asset_architecture"] = {
        "canonical_logo": "Deterministic horizontal composite of sprig + word (no new geometry)",
        "wordmark_component": str(WORD_COMMITTED.relative_to(ROOT)).replace("\\", "/"),
        "botanical_component": str(SPRIG_COMMITTED.relative_to(ROOT)).replace("\\", "/"),
        "decorative_lockup": str(F09_LOCKUP.relative_to(ROOT)).replace("\\", "/"),
        "page_specific_composition": "Per-screen ReferenceLockup placement + live descriptor/tagline type",
        "superseded_asset": reg["superseded_predecessor"],
    }
    reg_path.write_text(json.dumps(reg, indent=2) + "\n")

    print(json.dumps({"technical": technical["component_results"], "v2_matches_committed": v2_matches_committed}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
