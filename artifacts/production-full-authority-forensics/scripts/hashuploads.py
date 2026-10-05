import json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
files = [l.strip() for l in open('/tmp/fa/up_files.txt')]
hs = [l.strip() for l in open('/tmp/fa/up_hashes.txt')]
def dhash(im, n=16):
    g = im.convert('L').resize((n + 1, n), Image.LANCZOS)
    px = list(g.getdata()); bits = 0
    for r in range(n):
        for c in range(n):
            bits = (bits << 1) | (px[r * (n + 1) + c] > px[r * (n + 1) + c + 1])
    return f'{bits:064x}'
out = {}
for f, h in zip(files, hs):
    if h in out: out[h]['files'].append(f); continue
    im = Image.open('/tmp/fa/up/' + f[2:]).convert('RGB')
    w, hh = im.size
    out[h] = dict(w=w, h=hh, dh=dhash(im), files=[f])
    t = im.copy(); t.thumbnail((360, 640)); t.save(f'/tmp/fa/upthumbs/{h}.jpg', quality=70)
json.dump(out, open('/tmp/fa/upmeta.json', 'w'))
print(len(out))
