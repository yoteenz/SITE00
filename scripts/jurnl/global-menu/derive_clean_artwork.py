# Derive the runtime copies of the OPUS3 curated clean artwork from the installed originals (source of record:
# JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3) and write the typed registry (clean/registry.ts).
# Native resolution always; nothing is resized, cropped or stretched.
#   papers and the coin still life -> lossless WebP (identical on every visible pixel)
#   the two 2016x3584 compositions  -> WebP q92 at native resolution (PSNR on visible pixels reported)
# Files that are not mounted get no runtime copy, so they cannot be mounted by accident.
# Second source: the founder's regenerated screen shells (JURNL/GLOBAL_EIGHT_OVERLAYS/REGENERATED_SCREEN_CANDIDATES, the clean
# sidekicks / shells the founder named correct on 2026-11-06); opaque compositions at native resolution -> WebP q95 when it keeps
# >= 42 dB on visible pixels, else lossless (these sources are already low resolution).
# Run: python3 -I scripts/jurnl/global-menu/derive_clean_artwork.py <curated root> <regenerated root> <runtime dir> > report.json
import sys, os, csv, json, hashlib
import numpy as np
from PIL import Image
SRC, REGEN, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

# file -> (runtime id, encoding, mount, disposition). runtime id None = no runtime copy.
SUPERSEDED = 'superseded by the regenerated shell the founder named correct (2026-11-06)'
PLAN = {
  '01_CLEAN_ENVIRONMENTS/CH01-BUFFER-CLEAN-ENVIRONMENT.png': (None, None, 'NOT_MOUNTED',
    'Not mounted (founder correction 2026-11-06): a different sidekick from the BUFFER authority; superseded by the regenerated CH01 shell. Kept installed for the record.'),
  '01_CLEAN_ENVIRONMENTS/CH02-PRIVACY-CLEAN-ENVIRONMENT.png': (None, None, 'NOT_MOUNTED',
    'Not mounted (founder correction 2026-11-06): a different sidekick from the PRIVACY authority; superseded by the regenerated CH02 shell. Kept installed for the record.'),
  '02_GROK_PASS_COMPOSITIONS/OV05-SEARCH-OPEN-COMPOSITION.png': (None, None, 'NOT_MOUNTED',
    f'Not mounted: {SUPERSEDED} (OV05_SEARCH).'),
  '02_GROK_PASS_COMPOSITIONS/OV08-SECTIONED-MENU-ENVIRONMENT.png': ('OV08_MENU_ENVIRONMENT', 'q92', 'MOUNTED',
    'GlobalMenu: its blank tag and title papers carry the live wordmark and headline; sections, rows, icons and dividers live in the olive field (the only scroll)'),
  '03_INDEPENDENT_ACTION_ART/OV04-RENAME-CREAM-TEXTFREE.png': ('OV04_RENAME_PAPER', 'lossless', 'MOUNTED',
    'MANAGE POCKET (on the regenerated OV04 note): backing of the live RENAME POCKET item'),
  '03_INDEPENDENT_ACTION_ART/OV04-DELETE-BLUSH-TEXTFREE.png': ('OV04_DELETE_PAPER', 'lossless', 'MOUNTED',
    'MANAGE POCKET (on the regenerated OV04 note): backing of the live DELETE POCKET item'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-HEADER-TEXTFREE.png': (None, None, 'WITHHELD',
    'Withheld: it is the OV08 title parchment (Grok4 unresolved gap 5) and carries a stray torn fragment along its left (x 0-0.2); the regenerated CH01 shell has no title paper, so the BUFFER headline is live type on its olive field'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-AMOUNT-PAPER-TEXTFREE.png': ('CH01_AMOUNT_PAPER', 'lossless', 'MOUNTED_CONDITIONAL',
    'SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live amount field and currency (alpha valid, 1297 px for a ~250-430 px paper)'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-EFFECT-PAPER-TEXTFREE.png': ('CH01_EFFECT_PAPER', 'lossless', 'MOUNTED_CONDITIONAL',
    'SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live EFFECT ON SAFE TO SPEND figure'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-BACK-PAPER-TEXTFREE.png': ('CH01_BACK_PAPER', 'lossless', 'MOUNTED_CONDITIONAL',
    'SAFE TO SPEND BUFFER (on the regenerated CH01 shell): backing of the live BACK control'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-SAVE-OLIVE-TEXTFREE.png': (None, None, 'WITHHELD',
    'Withheld: the authority gold rim is missing (Grok4 unresolved gap 4); SAVE BUFFER stays the live V3 olive control with its gold hairline'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH01-COIN-RESERVE-TEXTFREE.png': (None, None, 'NOT_MOUNTED',
    'Not mounted: the regenerated CH01 shell carries its own coins and olive sprig (lower left); a second still life would duplicate them. (Previously mounted on OV08 at the authority origin, sliver clipped.)'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH02-HEADER-TEXTFREE.png': (None, None, 'WITHHELD',
    'Withheld: byte-identical to CH01-HEADER, the OV08 title parchment already in the environment'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH02-REMOVE-ACCESS-TEXTFREE.png': ('CH02_REMOVE_ACCESS_PAPER', 'lossless', 'MOUNTED_CONDITIONAL',
    'PRIVACY & CONSENTS (on the regenerated CH02 shell): backing of the live REMOVE ACCESS row'),
  '04_CONDITIONAL_BUFFER_PRIVACY/CH02-BACK-PAPER-TEXTFREE.png': ('CH02_BACK_PAPER', 'lossless', 'MOUNTED_CONDITIONAL',
    'PRIVACY & CONSENTS (on the regenerated CH02 shell): backing of the live BACK control'),
}

# the founder's regenerated shells: file -> (runtime id, mount, disposition). All opaque RGB compositions (REVIEW_STATUS.json).
REGEN_PLAN = {
  'CH01_SAFE_TO_SPEND.png': ('CH01_BUFFER_SHELL', 'SAFE TO SPEND BUFFER: the shell (L0+L1: bust, lemons, coast, olive field, drape, coins); headline, help, papers, warnings and actions live on the olive field'),
  'CH02_PRIVACY_CONSENTS.png': ('CH02_PRIVACY_SHELL', 'PRIVACY & CONSENTS (menu, ACCOUNT page, drawer): the shell; wordmark and headline on its tag and title papers, the consent list live in the olive field (the only scroll), REMOVE ACCESS and BACK papers under it'),
  'OV02_ADD_A_POCKET.png': ('OV02_ADD_POCKET_SHELL', 'ADD A POCKET: the shell (statue, medallion, paper, coins); name, type, balance, notes and actions live on the paper (body scrolls)'),
  'OV03_MOVE_MONEY.png': ('OV03_MOVE_MONEY_SHELL', 'MOVE MONEY / PAY A CARD: the shell (paper with the twine and direction seal); headline and honesty note above the seal, FROM / TO / ledger / status live below it (body scrolls)'),
  'OV04_MANAGE_POCKET.png': ('OV04_MANAGE_NOTE', 'MANAGE POCKET: the popover surface (note, paperclip, coastline tear, oxblood) inside a measured outline clip (the file has no alpha); heading and the two paper-backed actions live'),
  'OV05_SEARCH.png': ('OV05_SEARCH_SHELL', 'GlobalSearchDrawer: the shell (bust, lemon, arch, paper, ledgers); field, filters, rows, separators and actions live on the paper (only the results scroll)'),
}

def premul(a):
    a = a.astype(np.float64); return np.concatenate([a[..., :3] * a[..., 3:4] / 255.0, a[..., 3:4]], axis=-1)

manifest = {r['file']: r for r in csv.DictReader(open(os.path.join(SRC, '05_MOUNT_CONTRACT/CURATED_ASSET_MANIFEST.csv')))}
assert set(manifest) == set(PLAN), sorted(set(manifest) ^ set(PLAN))
os.makedirs(OUT, exist_ok=True)
report, rows = {}, []
for rel in manifest:  # manifest order
    rid, mode, mount, disposition = PLAN[rel]
    p = os.path.join(SRC, rel)
    sha = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    assert sha == manifest[rel]['sha256'], (rel, sha)
    rgba = Image.open(p).convert('RGBA'); w, h = rgba.size
    assert f'{w}x{h}' == manifest[rel]['width_height'], rel
    runtime = None
    if rid:
        out = os.path.join(OUT, f'{rid}.webp')
        if mode == 'lossless': rgba.save(out, 'WEBP', lossless=True, quality=100, method=6)
        else: rgba.save(out, 'WEBP', quality=92, method=6)
        back = Image.open(out).convert('RGBA')
        assert back.size == rgba.size, (rid, back.size, rgba.size)
        a, b = premul(np.asarray(rgba)), premul(np.asarray(back))
        mse = float(((a - b) ** 2).mean()); psnr = None if mse == 0 else round(10 * np.log10(255 * 255 / mse), 2)
        runtime = {'id': rid, 'sha256': hashlib.sha256(open(out, 'rb').read()).hexdigest(), 'bytes': os.path.getsize(out), 'encoding': mode, 'psnrVisible': psnr, 'visiblePixelsIdentical': mse == 0}
    report[rel] = {'sourceSha256': sha, 'sourceBytes': os.path.getsize(p), 'size': [w, h], 'mount': mount, 'disposition': disposition, 'runtime': runtime}
    rows.append((rel, sha, w, h, manifest[rel]['layer'], manifest[rel]['status'], mount, disposition, runtime))

review = json.load(open(os.path.join(REGEN, 'REVIEW_STATUS.json')))
assert set(review['files']) == set(REGEN_PLAN), sorted(set(review['files']) ^ set(REGEN_PLAN))
for name in review['files']:
    rid, disposition = REGEN_PLAN[name]
    p = os.path.join(REGEN, name)
    sha = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    rgba = Image.open(p).convert('RGBA'); w, h = rgba.size
    out = os.path.join(OUT, f'{rid}.webp')
    # these sources are already low resolution: q95 only when it keeps >= 42 dB on visible pixels, otherwise lossless
    for mode in ('q95', 'lossless'):
        if mode == 'q95': rgba.save(out, 'WEBP', quality=95, method=6)
        else: rgba.save(out, 'WEBP', lossless=True, quality=100, method=6)
        back = Image.open(out).convert('RGBA'); assert back.size == rgba.size, rid
        a, b = premul(np.asarray(rgba)), premul(np.asarray(back))
        mse = float(((a - b) ** 2).mean()); psnr = None if mse == 0 else round(10 * np.log10(255 * 255 / mse), 2)
        if psnr is None or psnr >= 42: break
    runtime = {'id': rid, 'sha256': hashlib.sha256(open(out, 'rb').read()).hexdigest(), 'bytes': os.path.getsize(out), 'encoding': mode, 'psnrVisible': psnr, 'visiblePixelsIdentical': mse == 0}
    rel = f'REGENERATED_SCREEN_CANDIDATES/{name}'
    report[rel] = {'sourceSha256': sha, 'sourceBytes': os.path.getsize(p), 'size': [w, h], 'mount': 'MOUNTED', 'disposition': disposition, 'runtime': runtime}
    rows.append((rel, sha, w, h, 'L0+L1', 'VISUAL_CANDIDATE', 'MOUNTED', disposition, runtime))

# stale runtime copies of files that are no longer mounted
keep = {f"{r[8]['id']}.webp" for r in rows if r[8]}
for f in os.listdir(OUT):
    if f.endswith('.webp') and f not in keep: os.remove(os.path.join(OUT, f))

ids = [r[8]['id'] for r in rows if r[8]]
js = lambda s: json.dumps(s, ensure_ascii=False)
L = ['/**',
     ' * OPUS3 curated clean artwork (P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-ENVIRONMENT-CONVERGENCE).',
     ' * GENERATED by scripts/jurnl/global-menu/derive_clean_artwork.py from the installed originals under',
     ' * JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3 (byte-for-byte, SHA-256 equal to the curated manifest) and the founder\'s',
     ' * regenerated shells under JURNL/GLOBAL_EIGHT_OVERLAYS/REGENERATED_SCREEN_CANDIDATES. Runtime copies keep the native',
     ' * resolution: lossless WebP (identical visible pixels) for papers, WebP q92 for compositions and shells (PSNR on visible',
     ' * pixels recorded). Files that are not mounted have no runtime copy and cannot be mounted by accident.',
     ' *',
     ' * The founder named the regenerated shells correct (2026-11-06): SAFE TO SPEND BUFFER, PRIVACY & CONSENTS, ADD A POCKET,',
     ' * MOVE MONEY, MANAGE POCKET and SEARCH are drawn on them; the menu stays on the OV08 sectioned environment.',
     ' */']
for i in ids: L.append(f"import {i.lower()} from './{i}.webp';")
L += ['',
      "export type CleanArtMount = 'MOUNTED' | 'MOUNTED_CONDITIONAL' | 'NOT_MOUNTED' | 'WITHHELD';",
      'export type CleanArt = {',
      '  /** the curated package path */',
      '  file: string;',
      '  sourceSha256: string;',
      '  width: number;',
      '  height: number;',
      '  layer: string;',
      '  manifestStatus: string;',
      '  mount: CleanArtMount;',
      '  /** where it is mounted, or why it is not */',
      '  disposition: string;',
      '  runtime: { id: CleanArtId; src: string; sha256: string; bytes: number; encoding: string; psnrVisible: number | null } | null;',
      '};',
      'export type CleanArtId = ' + ' | '.join(f"'{i}'" for i in ids) + ';',
      '',
      'export const CLEAN_ART: readonly CleanArt[] = [']
for rel, sha, w, h, layer, status, mount, disposition, rt in rows:
    lay = 'L0+L1' if 'L0+L1' in layer else 'L0' if layer.startswith('L0') else 'L1'
    if rel.endswith('COIN-RESERVE-TEXTFREE.png'): lay = 'L1'
    r = 'null' if not rt else f"{{ id: '{rt['id']}', src: {rt['id'].lower()}, sha256: '{rt['sha256']}', bytes: {rt['bytes']}, encoding: '{rt['encoding']}', psnrVisible: {'null' if rt['psnrVisible'] is None else rt['psnrVisible']} }}"
    L.append(f"  {{ file: {js(rel)}, sourceSha256: '{sha}', width: {w}, height: {h}, layer: '{lay}', manifestStatus: '{status}', mount: '{mount}', disposition: {js(disposition)}, runtime: {r} }},")
L += ['];', '',
      '/** A mounted clean art piece (throws for an unknown id, so a mount can never silently miss its art). */',
      'export function cleanArt(id: CleanArtId): { src: string; width: number; height: number; id: CleanArtId } {',
      '  const a = CLEAN_ART.find((x) => x.runtime?.id === id);',
      "  if (!a || !a.runtime) throw new Error(`clean art ${id} has no runtime copy`);",
      '  return { src: a.runtime.src, width: a.width, height: a.height, id };',
      '}', '']
open(os.path.join(OUT, 'registry.ts'), 'w').write('\n'.join(L))
print(json.dumps(report, indent=1))
