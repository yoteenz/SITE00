import json, subprocess, io, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
ev = json.load(open('/tmp/fa/events.json'))
blobs = sorted({e['blob'] for e in ev if not e['path'].lower().endswith(('.zip', '.mov', '.mp4'))})
p = subprocess.Popen(['git', 'cat-file', '--batch'], cwd='/home/user/SITE00', stdin=subprocess.PIPE, stdout=subprocess.PIPE)
def dhash(im, n=16):
    g = im.convert('L').resize((n + 1, n), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for r in range(n):
        for c in range(n):
            bits = (bits << 1) | (px[r * (n + 1) + c] > px[r * (n + 1) + c + 1])
    return f'{bits:064x}'
out = {}
for i, b in enumerate(blobs):
    p.stdin.write((b + '\n').encode()); p.stdin.flush()
    hdr = p.stdout.readline().split()
    size = int(hdr[2])
    data = p.stdout.read(size); p.stdout.read(1)
    try:
        im = Image.open(io.BytesIO(data)); im.load()
        w, h = im.size
        rgb = im.convert('RGB')
        out[b] = dict(w=w, h=h, dh=dhash(rgb), size=size)
        t = rgb.copy(); t.thumbnail((360, 640)); t.save(f'/tmp/fa/thumbs/{b}.jpg', quality=70)
    except Exception as e:
        out[b] = dict(err=str(e)[:80], size=size)
    if i % 300 == 0: print(i, file=sys.stderr)
json.dump(out, open('/tmp/fa/blobmeta.json', 'w'))
print('done', len(out), sum(1 for v in out.values() if 'err' in v), 'errors')
