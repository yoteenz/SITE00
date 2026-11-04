#!/usr/bin/env python3
"""
F05 DOT 01 — Batch 05 / 06 qualification and runtime derivatives.

Source: GitHub release `jurnl-icons-b05-b06-2026-11-04` of yoteenz/SITE00, asset JURNL-ICONS-B05-B06.zip
(56 930 025 bytes, SHA-256 d17d3a1d46eb278e4553036ba290f0a8e614c1f98a818f6390ac0b550cf6d7e4), produced by the Grok
sprint P0.JURNL.F05-MONEY.DOT01.BATCH05-BATCH06.OPENART-INDIVIDUAL-ASSET-GENERATION.GROK1. The ZIP holds the 20
full-resolution RGBA PNGs and Grok's checksums.json.

What this script does, and nothing else:
  1. verifies the ZIP digest and every PNG against checksums.json;
  2. measures each file: size, alpha extrema, alpha bounding box, aspect, and the share of OPAQUE low-chroma light
     pixels in the 24 px band inside the alpha edge (left-over checkerboard from the provider's flattened matte);
  3. records the qualification decided against the V9 authorities (doc 04–10 of the sprint evidence);
  4. writes a runtime derivative ONLY for assets whose decision is MOUNT_FOR_FOUNDER_REVIEW: trim to the alpha box,
     fit inside MAX_PX without changing the aspect, WebP with exact alpha. No colour change, no retouching, no new art;
  5. writes families/F05_MONEY/MICRO_ASSETS/BATCH_05_06_REVIEW.json (the evidence behind microAssets.ts).

The masters are not modified and are not copied into the repository.

Run with the scratch venv:
  python -I derive_batch05_06.py --zip <JURNL-ICONS-B05-B06.zip> --out <repo>/src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS
"""
import argparse
import hashlib
import io
import json
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ZIP_SHA256 = 'd17d3a1d46eb278e4553036ba290f0a8e614c1f98a818f6390ac0b550cf6d7e4'
RELEASE = 'https://github.com/yoteenz/SITE00/releases/tag/jurnl-icons-b05-b06-2026-11-04'
MAX_PX = 264  # 3 × the 88 board-px paper chip

# id, file, provenance, authority screens, target, classification, decision, note
QA = [
    ('F05.D01.CTRL.BACK.PARCHMENT.LIGHT', 'BATCH_05/B05_01_LIGHT_PARCHMENT_BACK_TILE.png', 'GENERATED', '02–05, 11–29 (light back chip)', 'Dot01Frame chip, tone paper, icon back',
     'VISUALLY_QUALIFIED_CANDIDATE', 'MOUNT_FOR_FOUNDER_REVIEW',
     'one torn tile with the ink arrow, as 02 / 14 / 26 / 27 draw it; replaces the 9-sliced blank paper + Batch 01 arrow (visible slice seams). Clean alpha.'),
    ('F05.D01.CTRL.BACK.PARCHMENT.DARK', 'BATCH_05/B05_02_DARK_BORDERED_BACK_TILE.png', 'GENERATED', '06–10 (amber back chip)', 'Dot01Frame chip, tone amber',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'worse than the runtime: dark olive fill, thick brass rim and a specular highlight; 06 / 07 draw a flat translucent amber-brown tile with a thin warm rim and a white arrow. Opaque checker residue on the outer edge.'),
    ('F05.D01.SURFACE.BACK.FRAME', 'BATCH_05/B05_03_ENGRAVED_BACK_FRAME.png', 'GENERATED', 'none (no authority frames the back control)', 'optional back frame',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'corner leaves are not in any authority, and no authority draws a frame around the back chip. Opaque checker residue around the rim.'),
    ('F05.D01.SURFACE.ACTION.TORN', 'BATCH_05/B05_04_TORN_PARCHMENT_ACTION_STRIP.png', 'REUSED (DOT01 layer 19)', '02–05 strips, 11, 24', 'existing action strips (F05_DOT01_19)',
     'EXACT_APPROVED_SOURCE_REUSE', 'ALREADY_MOUNTED_AS_SOURCE',
     'pixel-identical to F05_DOT01_19_PARCHMENT_ACTION_STRIP (alpha and colour MAD 0.0 on every opaque pixel); the runtime already renders that layer, so nothing is added (no double render).'),
    ('F05.D01.SURFACE.ACTION.MOSS', 'BATCH_05/B05_05_MOSS_PRIMARY_BUTTON_SURFACE.png', 'GENERATED', '14, 16, 21, 26, 27, 34, 37 (primary)', 'kit Button (primary)',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'brass rim not in the authority (14 / 26 draw a dark olive pill with a lighter olive edge); 4.1 : 1 material vs 7–9 : 1 controls (would need cap / infill slicing); opaque checker residue.'),
    ('F05.D01.SURFACE.ACTION.CREAM', 'BATCH_05/B05_06_CREAM_SECONDARY_BUTTON_SURFACE.png', 'GENERATED', '26, 34, 36, 37 (secondary)', 'kit Button (quiet)',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'smooth rim with a double olive line; 26 / 34 draw a deckled cream pill; 4.5 : 1 vs 7–9 : 1; opaque checker residue.'),
    ('F05.D01.SURFACE.CHIP.PARCHMENT', 'BATCH_05/B05_07_PARCHMENT_FILTER_CHIP.png', 'GENERATED', '21, 31 (chips)', 'ChipChoice / filter chips',
     'REJECTED', 'NOT_MOUNTED',
     'wrong form: 21 / 31 draw smooth rounded pills (cream with a thin ink border, or olive when selected); the candidate is a torn paper scrap. Opaque checker residue.'),
    ('F05.D01.SURFACE.FIELD.PAPER', 'BATCH_05/B05_08_ENGRAVED_PAPER_INPUT_FIELD.png', 'GENERATED', '14–20, 23, 28, 30 (fields)', 'kit TextInput / JURNL_SELECT',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'dark olive rim not in the authority (14 / 16 fields are light deckled cream with a soft inner shadow); 4.1 : 1 vs ≈ 11 : 1 fields; opaque checker residue.'),
    ('F05.D01.SURFACE.ACCOUNT.TILE', 'BATCH_05/B05_09_ILLUSTRATED_ACCOUNT_CARD_TILE.png', 'GENERATED', '06 (cards)', 'DirectoryPage AccountCard',
     'REJECTED', 'NOT_MOUNTED',
     'the founder card compositions (F05_DOT01_05–07) already mounted on 06 match the authority (06 converged in S7); a generated stand-in would lower fidelity. Opaque checker residue.'),
    ('F05.D01.SURFACE.RECEIPT.TAB', 'BATCH_05/B05_10_TORN_RECEIPT_PREVIEW_TAB.png', 'GENERATED', '28, 29, 33 (receipt preview)', 'receipt review surfaces',
     'REJECTED', 'NOT_MOUNTED',
     'a blank torn panel; the founder layers 16 / 17 (receipt frame and torn receipt strip) already cover this role with exact source art. Opaque checker residue.'),
    ('F05.D01.OVERLAY.RECEIPT.SCAN.CORNERS', 'BATCH_06/B06_01_RECEIPT_SCANNER_FOUR_CORNERS.png', 'GENERATED', '26, 27 (scan frame)', 'ReceiptFlow capture / scanning frame',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     '26 / 27 draw thin white L brackets (≈ 6 px at 941); the candidate is a thick cream / gold bracket with opaque checker squares beside each corner.'),
    ('F05.D01.OVERLAY.RECEIPT.SCAN.BEAM', 'BATCH_06/B06_02_RECEIPT_SCANNING_BEAM.png', 'GENERATED', '27 (scan line)', 'ReceiptFlow scanning beam',
     'CORRECTION_REQUIRED', 'NOT_MOUNTED',
     'the amber line is right, but the "halo" is the provider checkerboard tinted by the glow (opaque warm squares in a lens shape), not a soft alpha falloff; it would show as a hatched band over the receipt.'),
    ('F05.D01.OVERLAY.RECEIPT.DUPLICATE', 'BATCH_06/B06_03_DUPLICATE_RECEIPT_COMPARISON_MARK.png', 'GENERATED', '29 (duplicate)', 'duplicate comparison mark',
     'REJECTED', 'NOT_MOUNTED',
     '29 draws a small dark red circle with a white ⇄ between CURRENT RECEIPT and POSSIBLE MATCH; the candidate is a large embossed bronze pair of receipts (the glossy 3-D style the 40-icon audit already held back). Opaque checker residue.'),
    ('F05.D01.OVERLAY.EDIT.COMPARISON', 'BATCH_06/B06_04_ORIGINAL_TO_REVISED_BADGE.png', 'GENERATED', '37 (original → revised)', 'correction confirm badge',
     'REJECTED', 'NOT_MOUNTED',
     '37 draws a small dark olive circle with a white →; the candidate is a bronze coin with two documents. Opaque checker residue.'),
    ('F05.D01.ICON.NAV.HOME', 'BATCH_06/B06_05_DOCK_HOME.png', 'REUSED (hqNavIcons.tsx)', '01, 06, 31 (dock)', 'ProductNav HOME', 'EXACT_APPROVED_SOURCE_REUSE', 'VECTOR_KEPT', 'raster of the shipping vector path; the runtime keeps the vector (sharper, state colours, accessibility).'),
    ('F05.D01.ICON.NAV.MONEY', 'BATCH_06/B06_06_DOCK_MONEY.png', 'REUSED (hqNavIcons.tsx)', '01, 06, 31 (dock)', 'ProductNav MONEY', 'EXACT_APPROVED_SOURCE_REUSE', 'VECTOR_KEPT', 'raster of the shipping vector path; vector kept.'),
    ('F05.D01.ICON.NAV.ADD', 'BATCH_06/B06_07_DOCK_ADD.png', 'REUSED (hqNavIcons.tsx)', '01, 06, 31 (dock)', 'ProductNav ADD', 'EXACT_APPROVED_SOURCE_REUSE', 'VECTOR_KEPT', 'raster of the shipping vector path; vector kept.'),
    ('F05.D01.ICON.NAV.PLAN', 'BATCH_06/B06_08_DOCK_PLAN.png', 'REUSED (hqNavIcons.tsx)', '01, 06, 31 (dock)', 'ProductNav PLAN', 'EXACT_APPROVED_SOURCE_REUSE', 'VECTOR_KEPT', 'raster of the shipping vector path; vector kept.'),
    ('F05.D01.ICON.NAV.CREDIT', 'BATCH_06/B06_09_DOCK_CREDIT.png', 'REUSED (hqNavIcons.tsx)', '01, 06, 31 (dock)', 'ProductNav CREDIT', 'EXACT_APPROVED_SOURCE_REUSE', 'VECTOR_KEPT', 'raster of the shipping vector path; vector kept.'),
    ('F05.D01.SURFACE.STATUS.RED', 'BATCH_06/B06_10_TERRACOTTA_CAUTION_STATUS_SURFACE.png', 'GENERATED', '29, 34, 36 (caution)', 'kit Alert (caution)',
     'REJECTED', 'NOT_MOUNTED',
     'wrong form: 29 / 34 / 36 draw a flat torn red paper panel; the candidate is a curled ribbon banner with folded tails. Opaque checker residue.'),
]


def residue(a: np.ndarray) -> float:
    """Share (%) of opaque, low-chroma, light pixels within 24 px inside the alpha edge (left-over checkerboard)."""
    al = a[:, :, 3]
    rgb = a[:, :, :3].astype(int)
    solid = al > 0
    dist = ndimage.distance_transform_edt(solid)
    band = solid & (dist <= 24)
    chroma = rgb.max(2) - rgb.min(2)
    neutral = band & (chroma < 12) & (rgb.mean(2) > 120)
    return round(100 * neutral.sum() / max(band.sum(), 1), 1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--zip', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()
    raw = Path(args.zip).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == ZIP_SHA256, 'release ZIP digest mismatch'
    z = zipfile.ZipFile(io.BytesIO(raw))
    checks = {r['file']: r for r in json.loads(z.read('checksums.json'))}
    out = Path(args.out)
    rows = []
    for rid, f, prov, auth, target, cls, decision, note in QA:
        b = z.read(f)
        sha = hashlib.sha256(b).hexdigest()
        assert sha == checks[f]['sha256'], f'{f} does not match checksums.json'
        im = Image.open(io.BytesIO(b)).convert('RGBA')
        a = np.array(im)
        bbox = im.getbbox()
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        row = dict(registry_id=rid, source=f, source_sha256=sha, source_px=list(im.size), source_bytes=len(b), provenance=prov,
                   alpha_extrema=[int(a[:, :, 3].min()), int(a[:, :, 3].max())], alpha_bbox=list(bbox), material_aspect=round(w / h, 2),
                   checker_residue_pct=residue(a), authority=auth, target=target, classification=cls, decision=decision,
                   founder_approval='PENDING', note=note)
        if decision == 'MOUNT_FOR_FOUNDER_REVIEW':
            t = im.crop(bbox)
            t.thumbnail((MAX_PX, MAX_PX), Image.LANCZOS)
            dst = out / 'BATCH_05' / (Path(f).stem.lower() + '.webp')
            dst.parent.mkdir(parents=True, exist_ok=True)
            t.save(dst, 'WEBP', lossless=False, quality=92, method=6, exact=True)
            row.update(runtime=str(dst.relative_to(out)), runtime_px=list(t.size), runtime_bytes=dst.stat().st_size)
        rows.append(row)
    manifest = dict(package='JURNL-ICONS-B05-B06.zip', package_sha256=ZIP_SHA256, release=RELEASE, files_verified=len(rows),
                    note='Masters are not in the repository. Only MOUNT_FOR_FOUNDER_REVIEW assets get a runtime derivative (trim + resize, exact alpha). Every file awaits founder approval.',
                    counts={c: sum(r['classification'] == c for r in rows) for c in sorted({r['classification'] for r in rows})},
                    files=rows)
    (out / 'BATCH_05_06_REVIEW.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + '\n')
    print(json.dumps(manifest['counts']), [r['registry_id'] for r in rows if 'runtime' in r])


if __name__ == '__main__':
    main()
