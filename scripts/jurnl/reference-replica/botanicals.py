import numpy as np, cv2
from PIL import Image
from refs import REFS, ASSET_DIR
D=ASSET_DIR+'/assets'
def matte(name, pill, region, out):
    img=np.asarray(Image.open(REFS[name]).convert('RGB')).astype(np.float32)
    x0,y0,x1,y1=pill
    inner=np.zeros(img.shape[:2],np.uint8)
    r=(y1-y0)//2-7
    cv2.rectangle(inner,(x0+7+r,y0+7),(x1-7-r,y1-7),255,-1)
    cv2.circle(inner,(x0+7+r,(y0+y1)//2),r,255,-1); cv2.circle(inner,(x1-7-r,(y0+y1)//2),r,255,-1)
    inner=cv2.erode(inner,np.ones((3,3),np.uint8))
    rx0,ry0,rx1,ry1=region
    sub=img[ry0:ry1,rx0:rx1]; m=inner[ry0:ry1,rx0:rx1]>0
    lum=sub.mean(2)
    bg=np.percentile(lum[m],85); ink=np.percentile(lum[m],2)
    a=np.clip((bg-lum)/(bg-ink),0,1)*m
    a[a<0.06]=0
    col=np.median(sub[(a>0.7)],0) if (a>0.7).any() else np.array([200,170,135])
    rgba=np.zeros((ry1-ry0,rx1-rx0,4),np.uint8); rgba[...,:3]=col; rgba[...,3]=(a*255).astype(np.uint8)
    Image.fromarray(rgba).save(f'{D}/{out}',optimize=True)
    print(out, 'bg',round(bg),'ink',round(ink),'col',col.round(), 'size',rgba.shape[1],rgba.shape[0])
matte('acct1',(528,1531,763,1608),(699,1533,760,1606),'PILL_BOTANICAL_RIGHT.png')
matte('acct2',(104,1484,347,1567),(106,1486,172,1565),'PILL_BOTANICAL_LEFT.png')
