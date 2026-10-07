# difference matting: element = reference - lifted plate (dark-on-light elements)
import sys, numpy as np, cv2
from PIL import Image
from refs import REFS, WORK, ASSET_DIR
def isolate(name, box, out, gain=1.0):
    ref=np.asarray(Image.open(REFS[name]).convert('RGB')).astype(np.float32)
    plate=np.asarray(Image.open(f'{WORK}/plates/{name}_plate_telea.png').convert('RGB')).astype(np.float32)
    x0,y0,x1,y1=box; r=ref[y0:y1,x0:x1]; p=plate[y0:y1,x0:x1]
    d=(p.mean(2)-r.mean(2)); dmax=np.percentile(d,99.5)
    a=np.clip(d/dmax*gain,0,1); a[a<0.05]=0
    col=np.where(a[...,None]>0.02,(r-p*(1-a[...,None]))/np.maximum(a[...,None],0.02),0)
    col=np.clip(col,0,255)
    rgba=np.dstack([col,a*255]).astype(np.uint8)
    Image.fromarray(rgba).save(out,optimize=True); print(out,'box',box)
if __name__=='__main__':
    isolate('why',(366,70,493,138),ASSET_DIR+'/assets/WHY_SPRIG_OLIVE.png')
