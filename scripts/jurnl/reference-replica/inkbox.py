import numpy as np
from PIL import Image
from refs import REFS
_cache={}
def img(name):
    if name not in _cache: _cache[name]=np.asarray(Image.open(REFS[name]).convert('L')).astype(float)
    return _cache[name]
def ink(name, box, mode='dark', frac=0.45, minthr=25):
    x0,y0,x1,y1=box; a=img(name)[y0:y1,x0:x1]
    bg=np.median(a)
    if mode=='dark':
        d=bg-a; peak=np.percentile(d,99.7)
    else:
        d=a-bg; peak=np.percentile(d,99.7)
    thr=max(minthr, frac*peak); m=d>thr
    ys,xs=np.nonzero(m)
    if not len(xs): return None
    return [int(x0+xs.min()), int(y0+ys.min()), int(x0+xs.max()+1), int(y0+ys.max()+1)]
