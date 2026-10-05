#!/usr/bin/env python3
"""
Extract the DESIGN canonical icon + asset pack (DWS_SONNET_LITE / 05_SYSTEM_PACKS) into implementation files.

P0.STUDIOOS.PRODUCTION.DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3. The pack ships each family only as one composite
sheet (no per-icon files), so every asset here is an exact pixel crop of the supplied sheet at its native resolution —
nothing is redrawn, traced, generated or restyled. The single transform is the HUB home glyph, whose dark ink is keyed
to alpha so it can drive the bottom-nav mask like the other six nav glyphs.

Sources: docs/site00/design-pack/sources/{01_ICON_PACK_AUTHORITY,02_ASSET_PACK_AUTHORITY}.jpg
Output:  public/site00/production-authority-assets/design-pack/** + SOURCE.json, and the HUB nav mask.
Run:     python3 scripts/site00-design-pack-extract.py
"""
import hashlib
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'docs/site00/design-pack/sources')
OUT = os.path.join(ROOT, 'public/site00/production-authority-assets/design-pack')
NAV = os.path.join(ROOT, 'src/site00/components/productionHub/bottom-nav')
ICON = '01_ICON_PACK_AUTHORITY.jpg'
ASSET = '02_ASSET_PACK_AUTHORITY.jpg'


def sq(cx, cy, s):
    h = s // 2
    return (cx - h, cy - h, cx - h + s, cy - h + s)


CROPS = []  # (sheet, section, name, box, out-relative path)
# icon pack · 03 PIPELINE STAGE ICONS (rendered stage objects)
for name, cx, cy in [
    ('01-intelligence', 1107, 360), ('02-concept', 1217, 360), ('03-experience', 1332, 357), ('04-surfaces', 1447, 360),
    ('05-assets', 1128, 470), ('06-authority', 1274, 467), ('07-production', 1427, 467),
]:
    CROPS.append((ICON, '03 PIPELINE STAGE ICONS', name, sq(cx, cy - 4, 76), f'stages/{name}.png'))
# icon pack · 01 NAVIGATION ICONS
for row, y, names in [(0, 357, ['hub', 'work', 'library', 'activity', 'exit']), (1, 457, ['menu', 'dropdown', 'search', 'settings', 'user'])]:
    for x, n in zip([112, 208, 306, 402, 500], names):
        CROPS.append((ICON, '01 NAVIGATION ICONS', n, sq(x, y, 48), f'icons/nav-{n}.png'))
# icon pack · 04 OBJECT / SYSTEM ICONS
for y, names in [(627, ['cube-system', 'orbital-sphere', 'concentric-rings', 'geometric-lattice', 'ui-frame']), (722, ['route-map', 'stack-layers', 'database', 'cloud', 'network'])]:
    for x, n in zip([110, 207, 305, 400, 495], names):
        CROPS.append((ICON, '04 OBJECT / SYSTEM ICONS', n, sq(x, y, 64), f'icons/object-{n}.png'))
# asset pack · 07 DEVICE FRAMES
for n, box in [('desktop', (620, 705, 845, 875)), ('tablet', (852, 715, 975, 865)), ('mobile', (990, 715, 1057, 865))]:
    CROPS.append((ASSET, '07 DEVICE FRAMES', n, box, f'devices/{n}.png'))
# asset pack · 08 ENVIRONMENT PLATES
for n, box in [('main-atrium', (1087, 692, 1365, 860)), ('crop-01', (1372, 692, 1462, 765)), ('crop-02', (1472, 692, 1562, 765)), ('crop-03', (1372, 785, 1462, 860)), ('crop-04', (1472, 785, 1562, 860))]:
    CROPS.append((ASSET, '08 ENVIRONMENT PLATES', n, box, f'plates/{n}.jpg'))
# asset pack · 09 MATERIAL SWATCHES
for n, x0, x1 in [('white-acrylic', 25, 102), ('matte-white', 111, 187), ('chrome', 196, 260), ('smoked-glass', 271, 354), ('clear-glass', 361, 434), ('red-glow-glass', 441, 520), ('graphite', 529, 619), ('neutral-paper', 627, 735)]:
    CROPS.append((ASSET, '09 MATERIAL SWATCHES', n, (x0, 924, x1, 965), f'swatches/{n}.jpg'))


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def key_nav_glyph(img):
    """Dark ink on a light tile -> charcoal glyph on transparent 512 canvas, longest ink side 320 (nav family spec)."""
    g = img.convert('L')
    bg = sorted(list(g.tobytes()))[int(g.width * g.height * 0.9)]  # tile paper level
    ink = min(g.tobytes())
    span = max(1, bg - ink)
    alpha = g.point(lambda v: 0 if v >= bg - 6 else min(255, int(255 * (bg - v) / span * 1.25)))
    bbox = alpha.getbbox()
    alpha = alpha.crop(bbox)
    k = 320 / max(alpha.size)
    alpha = alpha.resize((max(1, round(alpha.width * k)), max(1, round(alpha.height * k))), Image.LANCZOS)
    out = Image.new('RGBA', (512, 512), (20, 20, 20, 0))
    glyph = Image.new('RGBA', alpha.size, (20, 20, 20, 255))
    glyph.putalpha(alpha)
    out.paste(glyph, ((512 - alpha.width) // 2, (512 - alpha.height) // 2), glyph)
    return out


def main():
    sheets = {n: Image.open(os.path.join(SRC, n)).convert('RGB') for n in (ICON, ASSET)}
    manifest = {
        'sprint': 'P0.STUDIOOS.PRODUCTION.DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3',
        'rule': 'exact native-resolution crops of the supplied pack sheets; no redraw / trace / generation',
        'sources': {n: {'path': f'docs/site00/design-pack/sources/{n}', 'sha256': sha(os.path.join(SRC, n)), 'size': list(sheets[n].size)} for n in sheets},
        'assets': [],
    }
    for sheet, section, name, box, rel in CROPS:
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        crop = sheets[sheet].crop(box)
        if rel.endswith('.png'):
            crop.save(dst, optimize=True)
        else:
            crop.save(dst, quality=92)
        manifest['assets'].append({'file': f'design-pack/{rel}', 'sheet': sheet, 'section': section, 'name': name, 'box': list(box), 'size': list(crop.size)})
    # HUB home glyph -> bottom-nav mask (keyed; the only non-identity transform)
    hub_box = sq(112, 357, 48)
    key_nav_glyph(sheets[ICON].crop(hub_box)).save(os.path.join(NAV, '01_HUB.png'), optimize=True)
    manifest['navMask'] = {'file': 'src/site00/components/productionHub/bottom-nav/01_HUB.png', 'sheet': ICON, 'section': '01 NAVIGATION ICONS', 'name': 'hub', 'box': list(hub_box), 'transform': 'ink keyed to alpha, charcoal #141414, longest ink side 320 on 512 canvas'}
    with open(os.path.join(OUT, 'SOURCE.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
    print(f"{len(manifest['assets'])} assets + nav mask")


if __name__ == '__main__':
    main()
