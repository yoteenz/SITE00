"""F09 overlay replicas: runtime images.

- The handoff shells (JURNL/F09_SAFE/OVERLAYS) are registered to their sources by SIFT on the paper and collage
  (register: drawer x' = 0.90·x + 166, y' = y − 1; Quick Add x' = x − 4, y' = y + 195, in 941 × 1672 source px), drawn
  into the source frame at 2× and cropped to the sheet. The source is the layout; the shell is the paper.
- The drawer's profile thumbnail and privacy card image are lifted from the founder source (the shell has neither);
  the privacy card's type and arrow are inpainted, since they are live.

  python scripts/jurnl/overlay-replica/assets.py
"""
import json, os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
F = os.path.join(ROOT, 'JURNL/F09_SAFE')
OUT = os.path.join(ROOT, 'src/projects/jurnl/runtime/global/overlays')
os.makedirs(OUT, exist_ok=True)
K = 2  # output px per source px
REG = {'QUICK_ADD': (1.0, -4, 1.0, 195), 'ACCOUNT_DRAWER': (0.90, 166, 1.0, -1)}


def shell_in_frame(name):
    sx, tx, sy, ty = REG[name]
    sh = Image.open(os.path.join(F, f'OVERLAYS/F09_{name}_OVERLAY_SHELL.png')).convert('RGBA')
    # shell px → source px: (x·941/2016)·sx + tx ; render at K×
    w, h = round(941 * sx * K), round(1672 * sy * K)
    sh = sh.resize((w, h), Image.LANCZOS)
    frame = Image.new('RGBA', (941 * K, 1672 * K), (0, 0, 0, 0))
    pad = Image.new('RGBA', (941 * K + 800, 1672 * K + 800), (0, 0, 0, 0))
    pad.alpha_composite(sh, (400 + tx * K, 400 + ty * K))
    frame = pad.crop((400, 400, 400 + 941 * K, 400 + 1672 * K))
    a = np.asarray(frame)[..., 3]
    ys, xs = np.where(a > 4)
    box = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]
    return frame.crop(box), [round(v / K, 2) for v in box]


meta = {}
for name, file in (('QUICK_ADD', 'F09_QUICK_ADD_SHELL.webp'), ('ACCOUNT_DRAWER', 'F09_ACCOUNT_DRAWER_SHELL.webp')):
    im, box = shell_in_frame(name)
    im.save(os.path.join(OUT, file), 'WEBP', quality=86, method=6)
    meta[name] = {'file': file, 'box': box, 'px': list(im.size)}

src = Image.open(os.path.join(F, 'AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg')).convert('RGB')
thumb = src.crop((357, 410, 493, 537)).resize((136 * K, 127 * K), Image.LANCZOS)
thumb.save(os.path.join(OUT, 'F09_DRAWER_PROFILE_THUMB.jpg'), quality=90)
meta['thumb'] = {'file': 'F09_DRAWER_PROFILE_THUMB.jpg', 'box': [357, 410, 493, 537]}

card_box = (340, 1280, 917, 1470)
card = np.asarray(src.crop(card_box)).copy()
g = cv2.cvtColor(card, cv2.COLOR_RGB2GRAY).astype(float)
mask = np.zeros(g.shape, np.uint8)
def ox(b):
    return (b[0] - card_box[0], b[1] - card_box[1], b[2] - card_box[0], b[3] - card_box[1])
for b, mode in (((473, 1329, 715, 1353), 'dark'), ((473, 1359, 715, 1384), 'dark'), ((473, 1385, 800, 1409), 'dark'), ((855, 1352, 895, 1388), 'light')):
    x0, y0, x1, y1 = ox(b)
    a = g[y0:y1, x0:x1]
    bg = cv2.medianBlur(a.astype(np.uint8), 15).astype(float)
    d = (bg - a) if mode == 'dark' else (a - bg)
    mask[y0:y1, x0:x1] |= (d > 18).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
clean = cv2.inpaint(card, mask * 255, 5, cv2.INPAINT_TELEA)
Image.fromarray(clean).resize((577 * K, 190 * K), Image.LANCZOS).save(os.path.join(OUT, 'F09_DRAWER_PRIVACY_PHOTO.jpg'), quality=90)
meta['privacyCard'] = {'file': 'F09_DRAWER_PRIVACY_PHOTO.jpg', 'box': list(card_box)}
print(json.dumps(meta, indent=1))
