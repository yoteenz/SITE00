#!/usr/bin/env python3
"""Technical derivation of deployable home-screen icons from the founder-approved icon master.

Crop + resample only. No repainting, no regeneration. The master (SITE00_FOUNDATION_ICON_MASTER.png, 1254×1254)
is a presentation mockup: light background, drop shadow, rounded white tile. Platforms apply their own corner
mask, so the deployable "any" icon is the largest square that lies entirely on the tile's flat face (no background,
shadow, rim or corner arc), centred on the "00" + red underline. The maskable variant additionally needs a
safe-zone margin the face cannot provide, so it mirror-pads the face's blank border texture (reflect padding
of ≤ 48 px; the nearest content is 125 px from the crop edge, so only empty face texture is mirrored). This is a
MATERIAL ALTERATION of framing — founder review required.

Usage: python3 -I derive-icons.py <lock1/assets dir>
"""
import hashlib, json, sys
from pathlib import Path
from PIL import Image
import numpy as np

root = Path(sys.argv[1])
master = Image.open(root / 'master/SITE00_FOUNDATION_ICON_MASTER.png').convert('RGB')
out = root / 'derived'
out.mkdir(exist_ok=True)

# Measured on the master (see 02_APPROVED_ICON_ASSET.md): tile ≈ x193–1050, y193–1045, corner radius ≈ 145 px;
# content ("00" + underline) bbox x388–862, y403–852, centre (625, 627.5).
CX, CY, HALF = 625, 627.5, 362          # 724 px square; every corner ≥ 20 px inside the tile's corner arc
box = (round(CX - HALF), round(CY - HALF), round(CX + HALF), round(CY + HALF))
face = master.crop(box)                  # D1 — face crop (presentation background/shadow/tile edge removed)

arr = np.asarray(face).astype(float)
border = np.concatenate([arr[:6].reshape(-1, 3), arr[-6:].reshape(-1, 3), arr[:, :6].reshape(-1, 3), arr[:, -6:].reshape(-1, 3)])
pad_rgb = tuple(int(round(v)) for v in border.mean(0))

# D2 — maskable: content half-diagonal must sit inside the 40 % radius safe circle.
content_half_diag = ((862 - CX) ** 2 + (852 - CY) ** 2) ** 0.5     # ≈ 326 px
side = int(np.ceil(content_half_diag / 0.40)) + 2                   # ≈ 818 px canvas
pad = (side - face.width) // 2
assert pad < 125, 'mirror pad would reach content'
mask_canvas = Image.fromarray(np.pad(np.asarray(face), ((pad, side - face.height - pad), (pad, side - face.width - pad), (0, 0)), mode='reflect'))

def save(img, size, name):
    im = img.resize((size, size), Image.LANCZOS)
    p = out / name
    im.save(p, 'PNG', optimize=True)   # PIL writes no EXIF/text chunks unless given
    return {'file': f'derived/{name}', 'px': size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}

manifest = {
    'master': 'master/SITE00_FOUNDATION_ICON_MASTER.png',
    'master_sha256': hashlib.sha256((root / 'master/SITE00_FOUNDATION_ICON_MASTER.png').read_bytes()).hexdigest(),
    'D1_face_crop_box': box,
    'D1_content_fraction_of_width': round((862 - 388) / (box[2] - box[0]), 3),
    'master_content_fraction_of_tile': round((862 - 388) / (1050 - 193), 3),
    'D2_method': 'reflect padding of blank face texture',
    'D2_pad_px': (side - face.width) // 2,
    'face_border_mean_rgb': pad_rgb,
    'D2_canvas_px': side,
    'outputs': [
        save(face, 512, 'foundation-icon-512.png'),
        save(face, 192, 'foundation-icon-192.png'),
        save(face, 180, 'apple-touch-icon-foundation-180.png'),
        save(mask_canvas, 512, 'foundation-icon-maskable-512.png'),
        save(face, 724, 'foundation-icon-face-crop-724.png'),
    ],
}
(out / 'derivation.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
