# usage: lift.py screen  -> plates/<screen>_mask.png, plates/<screen>_plate.png (+ variants)
import sys, os, numpy as np, cv2, time
from PIL import Image
from refs import REFS, WORK
from masks import MASKS, SOURCES
name=sys.argv[1]; algo=sys.argv[2] if len(sys.argv)>2 else 'shiftmap'
P=os.path.join(WORK,'plates'); os.makedirs(P,exist_ok=True)
img=np.asarray(Image.open(REFS[name]).convert('RGB'))
H,W,_=img.shape
gray=cv2.cvtColor(img,cv2.COLOR_RGB2GRAY).astype(np.float32)
mask=np.zeros((H,W),np.uint8)
big=np.zeros((H,W),np.uint8)
def rrect(m,x0,y0,x1,y1,r):
    r=int(min(r,(x1-x0)/2,(y1-y0)/2))
    cv2.rectangle(m,(x0+r,y0),(x1-r,y1),255,-1); cv2.rectangle(m,(x0,y0+r),(x1,y1-r),255,-1)
    for cx,cy in ((x0+r,y0+r),(x1-r,y0+r),(x0+r,y1-r),(x1-r,y1-r)): cv2.circle(m,(cx,cy),r,255,-1)
for e in MASKS[name]:
    k=e[0]
    if k=='rect': _,x0,y0,x1,y1=e[:5]; cv2.rectangle(big,(x0,y0),(x1,y1),255,-1)
    elif k=='rrect': _,x0,y0,x1,y1,r=e[:6]; rrect(big,x0,y0,x1,y1,r)
    elif k=='circle': _,cx,cy,r=e[:4]; cv2.circle(mask,(cx,cy),r,255,-1)
    elif k in ('ink','inkl'):
        _,x0,y0,x1,y1=e[:5]; dil=e[5] if len(e)>5 else 3; frac=e[6] if len(e)>6 else 0.25
        reg=gray[y0:y1,x0:x1]; bg=cv2.medianBlur(img[y0:y1,x0:x1],31).mean(2) if False else np.median(reg)
        # local background via large median of the region
        bgl=cv2.blur(reg,(41,41))
        d=(bgl-reg) if k=='ink' else (reg-bgl)
        thr=max(12,frac*np.percentile(d,99.5))
        m=(d>thr).astype(np.uint8)*255
        m=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*dil+1,2*dil+1)))
        mask[y0:y1,x0:x1]=np.maximum(mask[y0:y1,x0:x1],m)
Image.fromarray(np.maximum(mask,big)).save(f'{P}/{name}_mask.png')
t=time.time()
bgr=cv2.cvtColor(img,cv2.COLOR_RGB2BGR)
def pushpull(img,hole,levels=9,src=None):
    # multi-scale fill: normalised pyramid of valid pixels, coarse levels fill the hole, finer levels add detail at its rim
    f=img.astype(np.float32); w=(hole==0).astype(np.float32)
    if src is not None:
        keep=np.zeros_like(w); x0,y0,x1,y1=src; keep[y0:y1,x0:x1]=1; w*=keep
    pyr=[(f*w[...,None],w)]
    for _ in range(levels):
        a,b=pyr[-1]; pyr.append((cv2.pyrDown(a),cv2.pyrDown(b)))
    a,b=pyr[-1]; cur=a/np.maximum(b,1e-6)[...,None]
    for a,b in reversed(pyr[:-1]):
        up=cv2.resize(cur,(a.shape[1],a.shape[0]),interpolation=cv2.INTER_LINEAR)
        est=a/np.maximum(b,1e-6)[...,None]; t=np.clip(b*4,0,1)[...,None]
        cur=est*t+up*(1-t)
    out=img.copy(); out[hole>0]=np.clip(cur[hole>0],0,255).astype(np.uint8); return out
if algo=='telea':
    out=cv2.inpaint(bgr,mask,6,cv2.INPAINT_TELEA) if mask.any() else bgr.copy()
    if big.any():
        out=pushpull(out,big,src=SOURCES.get(name))
        # The card holes are covered by the live panels. Do not blur them.
        # A gaussian on these rects is the fog that shows around the panels.
elif algo=='ns':
    out=cv2.inpaint(bgr,mask,6,cv2.INPAINT_NS)
else:
    valid=(mask==0).astype(np.uint8)*255
    out=np.zeros_like(bgr)
    flag={'shiftmap':cv2.xphoto.INPAINT_SHIFTMAP,'fsr':cv2.xphoto.INPAINT_FSR_FAST,'fsrbest':cv2.xphoto.INPAINT_FSR_BEST}[algo]
    if algo=='shiftmap':
        lab=cv2.cvtColor(bgr,cv2.COLOR_BGR2Lab)
        o=np.zeros_like(lab); cv2.xphoto.inpaint(lab,valid,o,flag); out=cv2.cvtColor(o,cv2.COLOR_Lab2BGR)
    else:
        cv2.xphoto.inpaint(bgr,valid,out,flag)
print(name,algo,'masked %.1f%%'%(100*(mask>0).mean()),'%.1fs'%(time.time()-t))
Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)).save(f'{P}/{name}_plate_{algo}.png')
