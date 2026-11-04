#!/usr/bin/env python3
"""
F05 DOT 01 — micro-asset runtime derivatives (Batches 01–04, founder package
JURNL_F05_DOT01_BATCHES_01_TO_04_MASTER_LITE_40_ICONS.zip, 768 × 768 LITE PNGs).

For each of the 40 PNGs: trim to the alpha bounding box (+ 2 % padding), fit inside MAX_PX × MAX_PX without changing
the aspect ratio, and save as WebP with exact alpha (no colour change, no recomposition, no new art). Writes
families/F05_MONEY/MICRO_ASSETS/BATCH_0n/<name>.webp and MICRO_ASSETS_MANIFEST.json (source SHA-256 of the LITE PNG,
registry ID, source and derived size, alpha bbox).

The registry IDs are the founder's (UNIQUE_MICRO_ASSET_REGISTRY in the micro-asset audit package); the 40 files cover
its 40 ICON.* entries one to one (see the DOT 01 audit, doc 07).

Run with the scratch venv:  python -I extract_micro_assets.py --src <extracted master dir> --out <repo>/src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

MAX_PX = 192

REGISTRY_ID = {
    'BATCH_01/01_back_arrow.png': 'F05.D01.ICON.ARROW.HANDINK', 'BATCH_01/02_row_chevron.png': 'F05.D01.ICON.CHEVRON.INK',
    'BATCH_01/03_search.png': 'F05.D01.ICON.SEARCH.INK', 'BATCH_01/04_add_symbol.png': 'F05.D01.ICON.PLUS.FRAMED',
    'BATCH_01/05_close.png': 'F05.D01.ICON.CLOSE.INK', 'BATCH_01/06_bank_column.png': 'F05.D01.ICON.BANK.COLUMN',
    'BATCH_01/07_coins_stack.png': 'F05.D01.ICON.COINS.STACK', 'BATCH_01/08_payment_card.png': 'F05.D01.ICON.CREDIT.CARD',
    'BATCH_01/09_receipt.png': 'F05.D01.ICON.RECEIPT.INK', 'BATCH_01/10_ledger.png': 'F05.D01.ICON.HISTORY.LEDGER',
    'BATCH_02/01_information_medallion.png': 'F05.D01.ICON.INFO.MEDALLION', 'BATCH_02/02_bank_payment_badge.png': 'F05.D01.ICON.PAYMENT.BANK',
    'BATCH_02/03_brass_coin_stacks.png': 'F05.D01.ICON.CASH.COIN', 'BATCH_02/04_bar_chart.png': 'F05.D01.ICON.CHART.BARS',
    'BATCH_02/05_purchase_basket.png': 'F05.D01.ICON.PURCHASE.BASKET', 'BATCH_02/06_coastal_payout.png': 'F05.D01.ICON.DAILY.PAYOUT',
    'BATCH_02/07_citrus_market_crate.png': 'F05.D01.ICON.FOOD.BASKET', 'BATCH_02/08_roman_fee_medallion.png': 'F05.D01.ICON.PAYOUT.FEE',
    'BATCH_02/09_fuel_pump.png': 'F05.D01.ICON.FUEL.PUMP', 'BATCH_02/10_citrus_branch.png': 'F05.D01.ICON.TIPS.FRUIT',
    'BATCH_03/01_dining.png': 'F05.D01.ICON.CATEGORY.DINING', 'BATCH_03/02_grocery_basket.png': 'F05.D01.ICON.CATEGORY.GROCERY',
    'BATCH_03/03_travel_stamp.png': 'F05.D01.ICON.CATEGORY.TRAVEL', 'BATCH_03/04_coin_payment.png': 'F05.D01.ICON.CATEGORY.PAYMENT',
    'BATCH_03/05_fee_temple.png': 'F05.D01.ICON.CATEGORY.FEE', 'BATCH_03/06_edit_document.png': 'F05.D01.ICON.EDIT.PEN',
    'BATCH_03/07_tag.png': 'F05.D01.ICON.TAG', 'BATCH_03/08_reversal_loop.png': 'F05.D01.ICON.REVERSE.LOOP',
    'BATCH_03/09_archive.png': 'F05.D01.ICON.ARCHIVE.CHEST', 'BATCH_03/10_balance_scales.png': 'F05.D01.ICON.BALANCE.SCALE',
    'BATCH_04/01_calendar.png': 'F05.D01.ICON.CALENDAR', 'BATCH_04/02_wallet.png': 'F05.D01.ICON.WALLET',
    'BATCH_04/03_receipt_scan_camera.png': 'F05.D01.ICON.SCAN.CAMERA', 'BATCH_04/04_upload.png': 'F05.D01.ICON.UPLOAD',
    'BATCH_04/05_approval_check.png': 'F05.D01.ICON.CHECK.SEALED', 'BATCH_04/06_warning.png': 'F05.D01.ICON.ALERT.TRIANGLE',
    'BATCH_04/07_filter_sliders.png': 'F05.D01.ICON.FILTER.SLIDERS', 'BATCH_04/08_reorder_grip.png': 'F05.D01.ICON.REORDER.GRIP',
    'BATCH_04/09_save.png': 'F05.D01.ICON.SAVE.FLOPPY', 'BATCH_04/10_lock_status.png': 'F05.D01.ICON.LOCK.STATUS',
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    src, out = Path(a.src), Path(a.out)
    rows = []
    for rel, rid in REGISTRY_ID.items():
        p = src / rel
        raw = p.read_bytes()
        im = Image.open(p).convert('RGBA')
        alpha = im.getchannel('A')
        bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
        x0, y0, x1, y1 = bbox
        pad = round(max(x1 - x0, y1 - y0) * 0.02)
        x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)
        crop = im.crop((x0, y0, x1, y1))
        scale = min(1.0, MAX_PX / max(crop.width, crop.height))
        if scale < 1:
            crop = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.LANCZOS)
        dst = out / rel.replace('.png', '.webp')
        dst.parent.mkdir(parents=True, exist_ok=True)
        crop.save(dst, 'WEBP', quality=92, alpha_quality=100, method=6, exact=True)
        rows.append({'registry_id': rid, 'source': rel, 'source_sha256': hashlib.sha256(raw).hexdigest(), 'source_px': list(im.size),
                     'alpha_bbox': [x0, y0, x1 - x0, y1 - y0], 'runtime': str(dst.relative_to(out)), 'runtime_px': list(crop.size),
                     'runtime_bytes': dst.stat().st_size})
    manifest = {
        'package': 'JURNL_F05_DOT01_BATCHES_01_TO_04_MASTER_LITE_40_ICONS.zip',
        'package_sha256': '59c2b6a4a8d1c94a11051ce26087768b3a514d553b14e4641b1cdb127ff939f8',
        'note': 'LITE 768 px sources; the 1254 px originals were not supplied. Derivatives are trims + resizes only.',
        'pending': {'BATCH_05': 'PENDING_GENERATION_AND_MOUNT', 'BATCH_06': 'PENDING_GENERATION_AND_MOUNT'},
        'files': rows,
    }
    (out / 'MICRO_ASSETS_MANIFEST.json').write_text(json.dumps(manifest, indent=1) + '\n')
    print(len(rows), 'derivatives,', sum(r['runtime_bytes'] for r in rows), 'bytes')


if __name__ == '__main__':
    main()
