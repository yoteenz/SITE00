# Derive the uniform 1296x2304 WebP runtime shells from the installed OV01-OV08 PNGs (exact 9:16, one scale factor).
# Run: python3 -I scripts/jurnl/global-menu/derive_overlay_shells.py JURNL/GLOBAL_EIGHT_OVERLAYS/ASSETS src/projects/jurnl/runtime/global/overlays/eight > report.json
import sys, hashlib, json, os
from PIL import Image
src_dir, out_dir = sys.argv[1], sys.argv[2]
W, H = 1296, 2304   # exact 9:16, uniform 0.642857 of 2016x3584
res = {}
for n in sorted(os.listdir(src_dir)):
    if not n.startswith('OV') or not n.endswith('.png'): continue
    p = os.path.join(src_dir, n)
    im = Image.open(p)
    assert im.size == (2016, 3584), (n, im.size)
    rgba = im.convert('RGBA').resize((W, H), Image.LANCZOS)
    oid = n[:4]
    out = os.path.join(out_dir, f'{oid}_SHELL.webp')
    rgba.save(out, 'WEBP', quality=86, method=6, exact=False)
    a = rgba.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()
    res[oid] = {'src': n, 'srcBytes': os.path.getsize(p), 'srcSha256': hashlib.sha256(open(p,'rb').read()).hexdigest(), 'srcMode': im.mode,
                'out': os.path.basename(out), 'outBytes': os.path.getsize(out), 'outSha256': hashlib.sha256(open(out,'rb').read()).hexdigest(), 'outSize': [W, H], 'outAlphaBox': a}
print(json.dumps(res, indent=1))
