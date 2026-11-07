#!/usr/bin/env python3
"""Install the GROK2 overlay micro-assets that OPUS5 mounts, as runtime copies of the byte-preserved masters.

Sprint: P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5.
Nothing is redrawn, regenerated, recoloured or simplified. For each mounted master:

  1. its SHA-256 must equal the handoff's CONVERGED_FILE_MANIFEST.csv row (else the run stops);
  2. icons, chevrons and papers keep their native pixels (every master is <= 1024 px, at least 3x its largest display size);
     the switch track and thumb are resampled down to 3x their 46 px / 17 px display (premultiplied alpha, no halo);
  3. written as lossless WebP (exact alpha);
  4. a typed registry (`global/overlayArt/registry.ts`) records the source and runtime hashes, sizes, role, authority and
     handoff classification of each file.

Usage: python3 -I derive_overlay_micro_art.py <handoff root> <runtime dir> <report json>
"""
import csv, hashlib, io, json, os, sys
from PIL import Image

# (master stem, role in JURNL, governing authority, handoff classification, max runtime side or None = native)
MOUNT = [
    ('B01-GEAR-REMEMBER-SETUP', 'CH02 REMEMBER SETUP icon', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-BANK-LINKED-ACCOUNTS', 'CH02 LINKED ACCOUNTS OPTIONAL icon · OV08 CONNECTED ACCOUNTS icon', 'CH02 · OV08', 'EXACT_EXTRACT · VISUAL_MATCH_REUSE', None),
    ('B01-SHIELD-NOTHING-SOLD', 'CH02 NOTHING SOLD statement emblem', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-SPARKLE-ASK-CONTEXT', 'CH02 ASK JURNL CONTEXT icon · OV08 ASK JURNL icon', 'CH02 · OV08', 'EXACT_EXTRACT · VISUAL_MATCH_REUSE', None),
    ('B01-AI-STAR', 'CH02 AI ACCESS icon', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-DATABASE-YOUR-DATA', 'CH02 YOUR DATA icon', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-EXPORT-DOWN', 'CH02 DATA EXPORT icon', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-TRASH-REMOVE', 'CH02 REMOVE ACCESS icon', 'CH02', 'EXACT_EXTRACT', None),
    ('B01-CHEVRON', 'cream navigation chevron (CH02 rows, OV08 rows)', 'CH02 · OV08', 'RECONSTRUCTED', None),
    ('B01-TOGGLE-TRACK-OLIVE', 'consent switch track, ON', 'CH02', 'RECONSTRUCTED', 280),
    ('B01-TOGGLE-TRACK-CHARCOAL', 'consent switch track, OFF', 'CH02', 'RECONSTRUCTED', 280),
    ('B01-TOGGLE-THUMB', 'consent switch thumb', 'CH02', 'RECONSTRUCTED', 120),
    ('B02-COINS-CREAM', 'OV08 CURRENCY & EXCHANGE icon', 'OV08', 'RECONSTRUCTED', None),
    ('B02-TAG-CREAM', 'OV08 CLASSIFICATION & LEARNING RULES icon', 'OV08', 'RECONSTRUCTED', None),
    ('B02-PROFILE', 'OV08 ACCOUNT & PROFILE icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-GEAR-PREFERENCES', 'OV08 PREFERENCES icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-SHIELD-PRIVACY', 'OV08 PRIVACY & CONSENTS icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-CROWN-MEMBERSHIP', 'OV08 MY MEMBERSHIP icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-FOUR-SQUARE', 'OV08 EXPLORE ADD-ONS icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-LIFEBUOY', 'OV08 HELP & SUPPORT icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B02-SIGN-OUT', 'OV08 SIGN OUT icon', 'OV08', 'EXACT_EXTRACT', None),
    ('B03-BANK-SOURCE', 'OV02 BANK ACCOUNT type · OV03 FROM pocket · OV05 POCKETS filter and pocket results', 'OV02 · OV03 · OV05', 'EXACT_EXTRACT · VISUAL_MATCH_REUSE', None),
    ('B03-BANK-SELECTED', 'OV02 BANK ACCOUNT type, selected', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-COIN-STACK', 'OV02 SAVINGS type', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-CARD-DEBIT', 'OV02 DEBIT / PAYOUT CARD type', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-CARD-CREDIT', 'OV02 CREDIT CARD type', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-CASH', 'OV02 CASH type', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-CHECK-SELECTED', 'OV02 selected-type indicator', 'OV02', 'EXACT_EXTRACT', None),
    ('B03-POCKET-MARK', 'OV03 TO pocket mark', 'OV03', 'EXACT_EXTRACT', None),
    ('B03-PENCIL', 'OV04 RENAME POCKET icon', 'OV04', 'EXACT_EXTRACT', None),
    ('B03-TRASH', 'OV04 DELETE POCKET icon', 'OV04', 'EXACT_EXTRACT', None),
    ('B03-CHEVRON', 'dark navigation chevron (OV04 actions, OV01 choices)', 'OV03 · OV04 · OV01', 'EXACT_EXTRACT · VISUAL_MATCH_REUSE', None),
    ('B04-SEARCH', 'OV05 field magnifier and activity results', 'OV05', 'EXACT_EXTRACT', None),
    ('B05-ADD-CANCEL', 'OV02 CANCEL paper', 'OV02', 'EXACT_EXTRACT', None),
    ('B05-CREATE-POCKET', 'OV02 SAVE POCKET paper', 'OV02', 'EXACT_EXTRACT', None),
    ('B05-MOVE-CANCEL', 'OV03 CANCEL paper', 'OV03', 'EXACT_EXTRACT', None),
    ('B05-RECORD-TRANSFER', 'OV03 RECORD TRANSFER / RECORD CARD PAYMENT paper', 'OV03', 'EXACT_EXTRACT', None),
    ('B06-INFO', 'CH01 EFFECT ON SAFE TO SPEND information mark', 'CH01', 'EXACT_EXTRACT', None),
]


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def main(root: str, runtime: str, report: str):
    os.makedirs(runtime, exist_ok=True)
    os.makedirs(os.path.dirname(report) or '.', exist_ok=True)
    manifest = {r['file']: r for r in csv.DictReader(open(os.path.join(root, '05_AUDIT_AND_MANIFEST/CONVERGED_FILE_MANIFEST.csv')))}
    out = []
    for stem, role, authority, cls, max_side in MOUNT:
        rel = f'01_INSTALLABLE_SOURCE_MASTERS/{stem}.png'
        raw = open(os.path.join(root, rel), 'rb').read()
        if sha(raw) != manifest[rel]['sha256']:
            raise SystemExit(f'HASH MISMATCH {rel}')
        im = Image.open(io.BytesIO(raw)).convert('RGBA')
        if max_side and max(im.size) > max_side:
            s = max_side / max(im.size)
            im = im.convert('RGBa').resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).convert('RGBA')
        buf = io.BytesIO()
        im.save(buf, 'WEBP', lossless=True, exact=True, method=6)
        data = buf.getvalue()
        fn = f'{stem}.webp'
        open(os.path.join(runtime, fn), 'wb').write(data)
        out.append(dict(id=f'GROK2.{stem}', stem=stem, master=rel, role=role, authority=authority, classification=cls, source_sha256=sha(raw),
                        source_px=list(Image.open(io.BytesIO(raw)).size), runtime_file=fn, runtime_px=list(im.size), runtime_sha256=sha(data), runtime_bytes=len(data)))
        print(stem, out[-1]['source_px'], '->', im.size, len(data), 'B')
    json.dump(dict(sprint='P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5', mounted=out), open(report, 'w'), indent=1)
    ident = lambda s: 'a_' + s.lower().replace('-', '_')
    lines = [
        '/* GENERATED by scripts/jurnl/overlays-opus5/derive_overlay_micro_art.py — do not edit by hand.',
        ' * The GROK2 overlay micro-assets mounted by OPUS5 (founder approval pending). Runtime copies of the byte-preserved',
        ' * masters in JURNL/GLOBAL_EIGHT_OVERLAYS/MICRO_ASSETS_GROK2/01_INSTALLABLE_SOURCE_MASTERS (lossless WebP; native pixels',
        ' * except the switch track and thumb, resampled to 3x their display size). */',
    ]
    for r in out:
        lines.append(f"import {ident(r['stem'])} from './{r['runtime_file']}';")
    lines += ['', 'export type OverlayArtStem = ' + ' | '.join(f"'{r['stem']}'" for r in out) + ';',
              'export type OverlayArt = { id: string; stem: OverlayArtStem; src: string; width: number; height: number; role: string; authority: string; classification: string; sourceSha256: string; sha256: string };',
              'export const OVERLAY_ART: Record<OverlayArtStem, OverlayArt> = {']
    for r in out:
        lines.append(f"  '{r['stem']}': {{ id: '{r['id']}', stem: '{r['stem']}', src: {ident(r['stem'])}, width: {r['runtime_px'][0]}, height: {r['runtime_px'][1]}, role: {json.dumps(r['role'])}, authority: '{r['authority']}', classification: '{r['classification']}', sourceSha256: '{r['source_sha256']}', sha256: '{r['runtime_sha256']}' }},")
    lines += ['};', '']
    open(os.path.join(runtime, 'registry.ts'), 'w').write('\n'.join(lines))


if __name__ == '__main__':
    main(*sys.argv[1:4])
