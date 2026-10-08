"""Physical objects the reference draws that its shell does not have, lifted from the reference with their print
cleared (Telea inpaint) and matted (GrabCut seeded by paper / shadow). Output: RGBA at reference resolution."""
import os, sys, numpy as np, cv2
from PIL import Image
from refs import REFS, FAM
def grab(crop, fg_core, prob_box, paper_v=185, paper_s=70, dark_v=110):
    hsv=cv2.cvtColor(crop,cv2.COLOR_RGB2HSV)
    mask=np.full(crop.shape[:2],cv2.GC_BGD,np.uint8)
    x0,y0,x1,y1=prob_box; mask[y0:y1,x0:x1]=cv2.GC_PR_BGD
    mask[(hsv[...,2]>paper_v)&(hsv[...,1]<paper_s)]=cv2.GC_PR_FGD
    for (a,b,c,d) in fg_core: mask[b:d,a:c]=cv2.GC_FGD
    mask[hsv[...,2]<dark_v]=cv2.GC_BGD
    bgd=np.zeros((1,65)); fgd=np.zeros((1,65))
    cv2.grabCut(crop,mask,None,bgd,fgd,10,cv2.GC_INIT_WITH_MASK)
    m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m); k=1+np.argmax(st[1:,4]); m=np.where(lab==k,255,0).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    ff=m.copy(); h,w=m.shape; fm=np.zeros((h+2,w+2),np.uint8); cv2.floodFill(ff,fm,(0,0),255)
    return m|cv2.bitwise_not(ff)
def clear(crop, boxes, inside, thr=45, grow=1):
    """Telea-inpaint dark print inside the given boxes (crop coords)."""
    g=cv2.cvtColor(crop,cv2.COLOR_RGB2GRAY).astype(float)
    ink=np.zeros(g.shape,np.uint8)
    for (a,b,c,d) in boxes:
        sub=g[b:d,a:c]; loc=cv2.GaussianBlur(sub,(0,0),6)
        ink[b:d,a:c]=((loc-sub)>thr).astype(np.uint8)*255
    ink=cv2.dilate(ink,np.ones((3,3),np.uint8),iterations=grow)&inside
    return cv2.inpaint(crop,ink,3,cv2.INPAINT_TELEA)
def save(rgb, m, out, feather=1.0):
    a=cv2.GaussianBlur(m.astype(np.float32),(0,0),feather)
    Image.fromarray(np.dstack([rgb,a.clip(0,255).astype(np.uint8)])).save(out,optimize=True)
    return out
JOBS={}
def today_slip():
    im=np.asarray(Image.open(REFS['today']).convert('RGB'))
    x0,y0,x1,y1=520,600,870,790
    crop=im[y0:y1,x0:x1].copy()
    m=grab(crop,[(70,55,300,135)],(10,8,345,180))
    m[:40,250:]=np.where(cv2.cvtColor(crop[:40,250:],cv2.COLOR_RGB2HSV)[...,2]<150,0,m[:40,250:])
    # the type and its rule, in crop px (reference 600–800 × 678–735 lies inside, tilted 5°)
    rgb=clear(crop,[(70,70,290,120),(130,110,215,135)],m)
    out=os.path.join(FAM,'F03_TODAY','ROOT_AUTHORITY','TODAY_ATTENTION_SLIP.png')
    print(save(rgb,m,out),'ref box',[x0,y0,x1,y1])
JOBS['today_slip']=today_slip
def credit_dossier():
    im=np.asarray(Image.open(REFS['credit']).convert('RGB'))
    x0,y0,x1,y1=120,620,880,1165
    crop=im[y0:y1,x0:x1].copy()
    # Outline traced on a gridded zoom (reference px): linen front, back panel, engraving card, ribbon, green card, CARD tab.
    poly=np.array([(134,720),(506,718),(530,640),(660,632),(728,640),(738,700),(808,698),(818,710),(818,797),(860,800),(862,1035),(850,1062),(848,1148),(176,1148),(138,1098)],np.int32)-[x0,y0]
    m=np.zeros(crop.shape[:2],np.uint8); cv2.fillPoly(m,[poly],255)
    mask=np.full(crop.shape[:2],cv2.GC_BGD,np.uint8)
    mask[cv2.dilate(m,np.ones((9,9),np.uint8))>0]=cv2.GC_PR_BGD
    mask[m>0]=cv2.GC_PR_FGD
    mask[cv2.erode(m,np.ones((15,15),np.uint8))>0]=cv2.GC_FGD
    bgd=np.zeros((1,65)); fgd=np.zeros((1,65))
    cv2.grabCut(crop,mask,None,bgd,fgd,6,cv2.GC_INIT_WITH_MASK)
    g=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
    g=cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(g); k=1+np.argmax(st[1:,4]); g=np.where(lab==k,255,0).astype(np.uint8)
    ff=g.copy(); h,w=g.shape; fm=np.zeros((h+2,w+2),np.uint8); cv2.floodFill(ff,fm,(0,0),255); g=g|cv2.bitwise_not(ff)
    # Live print to clear (reference px → crop px): CARD, the meter, the 100% line, $5,000, the tab's CARD.
    B=lambda a,b,c,d:(a-x0,b-y0,c-x0,d-y0)
    rgb=clear(crop,[B(180,924,275,954),B(182,964,742,982),B(508,987,740,1007),B(820,832,848,902)],g,thr=30,grow=2)
    # The figure's thick serif strokes defeat a local-mean test: clear them against the box median instead.
    a,b,c,d=B(178,1006,402,1082); sub=cv2.cvtColor(rgb[b:d,a:c],cv2.COLOR_RGB2GRAY).astype(float)
    ink=np.zeros(g.shape,np.uint8); ink[b:d,a:c]=((np.median(sub)-sub)>22).astype(np.uint8)*255
    ink=cv2.dilate(ink,np.ones((3,3),np.uint8),iterations=3)&g
    rgb=cv2.inpaint(rgb,ink,5,cv2.INPAINT_TELEA)
    out=os.path.join(FAM,'F12_CREDIT','ROOT_AUTHORITY','CREDIT_DOSSIER.png')
    print(save(rgb,g,out),'ref box',[x0,y0,x1,y1])
JOBS['credit_dossier']=credit_dossier
if __name__=='__main__':
    for k in sys.argv[1:] or JOBS: JOBS[k]()
