# Writes JURNL/GLOBAL_EIGHT_OVERLAYS/DOCS/OPUS3/01_PROVENANCE_SHA256.md from the derive report
# (scripts/jurnl/global-menu/derive_clean_artwork.py > derive_report.json).
# Run: python3 -I scripts/jurnl/global-menu/write_provenance_doc.py <derive_report.json> <out.md>
import json, sys
d = json.load(open(sys.argv[1]))
L = ['# 01 · Provenance and SHA-256 map (OPUS3)', '',
     'Sources of record, byte-for-byte as supplied:',
     '- `JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3/` — the 15 curated PNGs (P1.zip / P2.zip); every SHA-256 equals `05_MOUNT_CONTRACT/CURATED_ASSET_MANIFEST.csv`.',
     '- `JURNL/GLOBAL_EIGHT_OVERLAYS/REGENERATED_SCREEN_CANDIDATES/` — the six regenerated shells the founder named correct on 2026-11-06 (JURNL_REGENERATED_SCREEN_CANDIDATES.zip, sha256 `c9d2db2e7460514fde3d502bd0012e4cfb1e73303896d69c2aa7aa815204a992`), with their `REVIEW_STATUS.json` and `SHA256SUMS.txt`.',
     '',
     'Runtime copies: `src/projects/jurnl/runtime/global/overlays/clean/`, written with their registry by `scripts/jurnl/global-menu/derive_clean_artwork.py` (python3 -I). Native resolution always; no resize, crop or stretch. Lossless WebP keeps every visible pixel (compared premultiplied); q92 is used only for the OV08 composition; the regenerated shells take q95 only when it holds >= 42 dB, otherwise lossless (they are already low resolution, so all six are lossless). A file that is not mounted has no runtime copy.',
     '',
     '| # | Source file | Source SHA-256 | Size | Mount | Runtime file | Runtime SHA-256 | Bytes | Encoding | Visible pixels |',
     '|---|---|---|---|---|---|---|---|---|---|']
for i, (k, v) in enumerate(d.items(), 1):
    r = v['runtime']
    if r:
        rt = (f"`{r['id']}.webp`", f"`{r['sha256']}`", f"{r['bytes']:,}", r['encoding'], 'identical' if r['visiblePixelsIdentical'] else f"PSNR {r['psnrVisible']} dB")
    else:
        rt = ('—',) * 5
    L.append(f"| {i} | `{k}` | `{v['sourceSha256']}` | {v['size'][0]}×{v['size'][1]} | {v['mount']} | {' | '.join(rt)} |")
L += ['', 'Dispositions (the registry `disposition` field, verbatim):', '']
for k, v in d.items():
    L.append(f"- `{k.split('/')[-1]}` — {v['disposition']}")
L += ['', 'Notes', '',
      '- CH01-HEADER and CH02-HEADER are byte-identical (same SHA-256).',
      '- The CH01 / CH02 clean environments, the OV05 open composition and the coin still life were runtime-mounted in earlier drafts of this sprint; they have no runtime copy now (`tests/jurnlCleanArtworkOpus3.test.tsx` K3).',
      '- The regenerated MANAGE POCKET note has no alpha: `scripts/jurnl/global-menu/measure_ov04_note_outline.py` measures its outline into `ov04NoteOutline.ts` (a clip-path); the SEARCH shell\'s crop line is measured by `measure_shell_borders.py` and clipped. Neither repaints a pixel.', '']
open(sys.argv[2], 'w').write('\n'.join(L))
print('wrote', sys.argv[2])
