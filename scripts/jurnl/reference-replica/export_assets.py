import os, sys, numpy as np
from PIL import Image
from refs import REFS, WORK, ASSET_DIR as D, ROOT
for sub in ('plates','tiles','assets'): os.makedirs(f'{D}/{sub}',exist_ok=True)
what=sys.argv[1:] or ['plates','tiles','lockup','drawer']
PLATES=[('parent','F09_PARENT_PLATE'),('why','F09_WHY_PLATE'),('check','F09_CHECK_PLATE'),('acct1','F09_ACCOUNT_PLATE'),('drawer','F09_ACCOUNT_DRAWER_PLATE')]
def save_jpg(im,path,q=90): im.convert('RGB').save(path,'JPEG',quality=q,optimize=True,progressive=True)
if 'plates' in what:
    for n,f in PLATES:
        im=Image.open(os.path.join(WORK,'plates',f'{n}_plate_telea.png'))
        im=im.convert('RGB').resize((853,1844),Image.LANCZOS) if im.size!=(853,1844) else im
        save_jpg(im,f'{D}/plates/{f}.jpg'); print('plate',f)
if 'tiles' in what:
    cat=Image.open(REFS['category']).convert('RGB')
    names=['FASHION','BEAUTY','HOME','TRAVEL','WELLNESS','DINING','GROCERIES','GIFTS','TECH','TRANSPORT','EVENTS','OTHER']
    xs=(35,235,436,637); ys=((1027,1205),(1266,1444),(1505,1676))
    for i,nm in enumerate(names):
        r,c=divmod(i,4); x=xs[c]; y0,y1=ys[r]
        t=cat.crop((x,y0,x+183,y1))
        pass  # row 3 keeps its own 171 px height
        save_jpg(t,f'{D}/tiles/CATEGORY_{nm}.jpg',92)
    acc=Image.open(REFS['account']).convert('RGB')
    # source tile photos in the current SELECT AN ACCOUNT drawer; crop to the category tile ratio (183:178) around the subject
    src={'CHECKING':((39,902,412,1128),60),'SAVINGS':((441,902,815,1128),120),'CREDIT_CARD':((39,1205,412,1425),95),
         'DEBIT_CARD':((441,1205,815,1425),70),'CASH':((39,1503,412,1729),80),'JOINT_ACCOUNT':((441,1503,815,1729),125)}
    for nm,(b,ox) in src.items():
        t=acc.crop(b); h=t.height; w=round(h*183/178)
        t=t.crop((ox,0,ox+w,h)).resize((183,178),Image.LANCZOS)
        save_jpg(t,f'{D}/tiles/ACCOUNT_{nm}.jpg',92)
    print('tiles ok')
if 'lockup' in what:
    # the approved sprig-and-word cut, haze removed, as two layers (sprig, word)
    a=np.asarray(Image.open(os.path.join(ROOT,'src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png')).convert('RGBA')).astype(float)
    lum=a[...,:3].mean(2); a[...,3]*=np.clip((236-lum)/56,0,1)
    im=Image.fromarray(a.astype(np.uint8))
    im.crop((0,0,82,78)).save(f'{D}/assets/LOCKUP_SPRIG.png',optimize=True)
    im.crop((0,78,196,120)).save(f'{D}/assets/LOCKUP_WORD.png',optimize=True)
    print('lockup ok')
if 'drawer' in what:
    import cv2
    ref=Image.open(REFS['drawer']).convert('RGB')
    ref.crop((330,447,472,589)).save(f'{D}/assets/PROFILE_ARCH.jpg',quality=92)
    card=np.asarray(ref.crop((313,1411,831,1594))).copy()
    bgr=cv2.cvtColor(card,cv2.COLOR_RGB2BGR); g=cv2.cvtColor(card,cv2.COLOR_RGB2GRAY).astype(np.float32)
    m=np.zeros(g.shape,np.uint8)
    for (x0,y0,x1,y1,mode) in [(20,55,330,140,'dark'),(455,110,500,150,'light')]:
        reg=g[y0:y1,x0:x1]; bl=cv2.blur(reg,(41,41)); d=(bl-reg) if mode=='dark' else (reg-bl)
        mm=(d>max(12,0.25*np.percentile(d,99.5))).astype(np.uint8)*255; mm=cv2.dilate(mm,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
        m[y0:y1,x0:x1]=np.maximum(m[y0:y1,x0:x1],mm)
    out=cv2.inpaint(bgr,m,6,cv2.INPAINT_TELEA)
    Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)).save(f'{D}/assets/PRIVACY_CARD.jpg',quality=92)
    print('drawer images ok')
