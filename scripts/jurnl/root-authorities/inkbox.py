import numpy as np
from PIL import Image
from refs import REFS
from straight import STRAIGHT, path as straight_path
_cache={}
def img(name):
    if name not in _cache:
        p=straight_path(name) if name in STRAIGHT else REFS[name]
        _cache[name]=np.asarray(Image.open(p).convert('L')).astype(float)
    return _cache[name]
def ink(name, box, mode='dark', frac=0.45, minthr=25):
    x0,y0,x1,y1=box; a=img(name)[y0:y1,x0:x1]
    if mode.startswith('abs<'):   # solid controls: absolute luminance, not relative to the box
        m=a<float(mode[4:]); ys,xs=np.nonzero(m)
        return [int(x0+xs.min()), int(y0+ys.min()), int(x0+xs.max()+1), int(y0+ys.max()+1)] if len(xs) else None
    bg=np.median(a)
    d=(bg-a) if mode=='dark' else (a-bg)
    thr=max(minthr, frac*np.percentile(d,99.7)); m=d>thr
    ys,xs=np.nonzero(m)
    if not len(xs): return None
    return [int(x0+xs.min()), int(y0+ys.min()), int(x0+xs.max()+1), int(y0+ys.max()+1)]
