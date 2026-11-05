"""SIDEKICK audit: hashes, dimensions, alpha, and per-authority environment distance to SK01/SK02/SK03 (bands)."""
import hashlib, json, sys, os
import numpy as np
from PIL import Image
AUTH = sys.argv[1]; SK = sys.argv[2]; OUT = sys.argv[3]
sks = {k: f'{SK}/{k}.png' for k in ['SK01_PARENT_MONEY', 'SK02_ACCOUNT_DETAILS', 'SK03_RECEIPT_OVERLAYS']}
res = {'sidekicks': {}, 'authorities': {}}
arr = {}
for k, p in sks.items():
    b = open(p, 'rb').read(); im = Image.open(p)
    a = np.array(im.convert('RGBA'))
    arr[k] = np.array(im.convert('RGB')).astype(np.float32)
    res['sidekicks'][k] = dict(path=p.split('JURNL/')[-1] if 'JURNL/' in p else p, sha256=hashlib.sha256(b).hexdigest(), bytes=len(b), size=im.size, mode=im.mode,
                               opaque_px=int((a[..., 3] == 255).sum()), transparent_px=int((a[..., 3] == 0).sum()))
# bands (authority px): hero (top, left of the chips), the middle content zone, the foot
BANDS = {'hero': (0, 120, 820, 330), 'middle': (0, 600, 941, 1150), 'foot': (0, 1500, 941, 1672), 'left_margin': (0, 330, 40, 1500)}
for f in sorted(os.listdir(AUTH)):
    if not f.endswith('.png'): continue
    sid = f[:2]
    A = np.array(Image.open(f'{AUTH}/{f}').convert('RGB')).astype(np.float32)
    row = {'file': f, 'sha256': hashlib.sha256(open(f'{AUTH}/{f}', 'rb').read()).hexdigest(), 'mad': {}}
    for k, S in arr.items():
        row['mad'][k] = {b: round(float(np.abs(A[y0:y1, x0:x1] - S[y0:y1, x0:x1]).mean()), 1) for b, (x0, y0, x1, y1) in BANDS.items()}
    hero = {k: v['hero'] for k, v in row['mad'].items()}
    foot = {k: v['foot'] for k, v in row['mad'].items()}
    row['nearest_hero'] = min(hero, key=hero.get); row['nearest_foot'] = min(foot, key=foot.get)
    res['authorities'][sid] = row
json.dump(res, open(OUT, 'w'), indent=1)
for sid, r in res['authorities'].items():
    print(sid, r['file'][:34].ljust(34), 'hero', {k[:4]: v['hero'] for k, v in r['mad'].items()}, 'foot', {k[:4]: v['foot'] for k, v in r['mad'].items()}, r['nearest_hero'][:4], r['nearest_foot'][:4])
print(json.dumps(res['sidekicks'], indent=0))
