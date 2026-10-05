"""Derive per-entity display crops from the canonical Entry 002 pre-storyboard authority boards.

Source boards (committed, pipeline-generated, used by the production hub as the cast / look node art):
  public/assets/expression-engine/entry-002/pre-storyboard-authority/*.jpg
Output: public/site00/production-authority-assets/entry-002/<id>.jpg + manifest.json (crop boxes as fractions).
No new imagery is generated; crops keep native resolution (never upscaled).
Run: python3 scripts/production-authority/derive-entry002-media.py
"""
import json, os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'public/assets/expression-engine/entry-002/pre-storyboard-authority')
OUT = os.path.join(ROOT, 'public/site00/production-authority-assets/entry-002')
BOARDS = {
    'subject': 'ndx-entry-002-pre-sba-subject-dual-era-001.jpg',
    'fashion': 'ndx-entry-002-pre-sba-fashion-continuity-001.jpg',
    'ndx': 'ndx-entry-002-pre-sba-ndx-presence-001.jpg',
}
# id: (board, (x0, y0, x1, y1) as fractions of the board, label)
CROPS = {
    'subject-2016-full': ('subject', (0.022, 0.146, 0.292, 0.668), '2016 · SAME WOMAN · EARLIER ERA'),
    'subject-2016-portrait': ('subject', (0.302, 0.146, 0.488, 0.425), '2016 · RECOGNIZABLE · SAME FACE'),
    'subject-details': ('subject', (0.302, 0.434, 0.488, 0.662), 'SAME DETAILS · CHOKER · OVERLINED LIPS'),
    'subject-2016-selfie': ('subject', (0.240, 0.672, 0.488, 0.925), '2016 · JUST A GIRL FIGURING IT OUT'),
    'subject-2026-full': ('subject', (0.506, 0.146, 0.780, 0.925), '2026 · SAME WOMAN · LATER ERA'),
    'subject-2026-portrait': ('subject', (0.788, 0.146, 0.978, 0.425), '2026 · OLDER · WISER · STILL HER'),
    'subject-codes': ('subject', (0.788, 0.434, 0.978, 0.650), 'SAME CODES · NEW CONTEXT'),
    'subject-2026-audience': ('subject', (0.770, 0.660, 0.978, 0.925), '2026 · DIFFERENT AUDIENCE · SAME WOMAN'),
    'look-2016-full': ('fashion', (0.022, 0.128, 0.285, 0.620), '2016 LOOK · SAME FASHION LANGUAGE'),
    'look-2016-portrait': ('fashion', (0.294, 0.128, 0.492, 0.343), '2016 LOOK · PORTRAIT'),
    'look-2016-mirror': ('fashion', (0.294, 0.350, 0.492, 0.620), '2016 LOOK · MIRROR'),
    'look-2026-full': ('fashion', (0.508, 0.128, 0.761, 0.620), '2026 LOOK · SAME FASHION LANGUAGE'),
    'look-2026-portrait': ('fashion', (0.771, 0.128, 0.978, 0.343), '2026 LOOK · PORTRAIT'),
    'look-2026-street': ('fashion', (0.771, 0.350, 0.978, 0.620), '2026 LOOK · HIGHER STANDARDS'),
    'wardrobe-bodycon-dress': ('fashion', (0.022, 0.662, 0.211, 0.755), 'BLACK BODYCON DRESS · ALWAYS'),
    'wardrobe-choker': ('fashion', (0.218, 0.662, 0.400, 0.755), 'CHOKER · ALWAYS'),
    'wardrobe-bomber-jacket': ('fashion', (0.407, 0.662, 0.592, 0.755), 'BOMBER JACKET · ALWAYS'),
    'wardrobe-thigh-high-boots': ('fashion', (0.600, 0.662, 0.787, 0.755), 'THIGH HIGH BOOTS · ALWAYS'),
    'wardrobe-clear-heels': ('fashion', (0.795, 0.662, 0.978, 0.755), 'NUDE / CLEAR HEELS · ALWAYS'),
    'beauty-overlined-lips': ('fashion', (0.022, 0.781, 0.211, 0.869), 'OVERLINED LIPS · ALWAYS'),
    'beauty-french-nails': ('fashion', (0.218, 0.781, 0.400, 0.869), 'FRENCH TIP NAILS · ALWAYS'),
    'beauty-french-toes': ('fashion', (0.407, 0.781, 0.592, 0.869), 'FRENCH TIP TOES · ALWAYS'),
    'wardrobe-statement-bag': ('fashion', (0.600, 0.781, 0.787, 0.869), 'STATEMENT BAG · ALWAYS'),
    'hair-sleek-straight': ('fashion', (0.795, 0.781, 0.978, 0.869), 'SLEEK STRAIGHT HAIR · ALWAYS'),
    'ndx-over-shoulder': ('ndx', (0.022, 0.142, 0.566, 0.405), 'OVER-SHOULDER · ALWAYS LOOKING'),
    'ndx-shadow': ('ndx', (0.580, 0.142, 0.978, 0.405), 'SHADOW · PRESENT BUT UNSEEN'),
    'ndx-phone-interaction': ('ndx', (0.022, 0.416, 0.462, 0.622), 'PHONE INTERACTION · SMALL DETAILS'),
    'ndx-partial-profile': ('ndx', (0.472, 0.416, 0.978, 0.622), 'PARTIAL PROFILE · A PRESENCE'),
    'ndx-reflection': ('ndx', (0.022, 0.636, 0.510, 0.905), 'REFLECTION · THE OBSERVER'),
    'ndx-observer': ('ndx', (0.522, 0.636, 0.978, 0.905), 'OBSERVER · DETACHED BY DESIGN'),
}

def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {'source': 'public/assets/expression-engine/entry-002/pre-storyboard-authority', 'boards': BOARDS, 'crops': []}
    for cid, (board, (x0, y0, x1, y1), label) in CROPS.items():
        im = Image.open(os.path.join(SRC, BOARDS[board])).convert('RGB')
        w, h = im.size
        c = im.crop((round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)))
        c.save(os.path.join(OUT, f'{cid}.jpg'), quality=88, optimize=True, progressive=True)
        manifest['crops'].append({'id': cid, 'board': BOARDS[board], 'box': [x0, y0, x1, y1], 'size': list(c.size), 'label': label})
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
    print(len(CROPS), 'crops ->', OUT)

if __name__ == '__main__':
    main()
