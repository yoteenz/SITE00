"""Angle of a line of type (or a ruled line) in a reference: principal axis of its ink, degrees (positive = clockwise on screen)."""
import sys, numpy as np, cv2
from PIL import Image
from refs import REFS
def angle(name, box, mode='dark'):
    x0,y0,x1,y1=box
    a=np.asarray(Image.open(REFS[name]).convert('L')).astype(float)[y0:y1,x0:x1]
    d=(np.median(a)-a) if mode=='dark' else (a-np.median(a))
    m=d>max(25,0.45*np.percentile(d,99.7))
    ys,xs=np.nonzero(m)
    pts=np.stack([xs,ys],1).astype(np.float32)
    (cx,cy),(w,h),ang=cv2.minAreaRect(pts)
    if w<h: ang+=90
    if ang>45: ang-=90
    return round(ang,2)
if __name__=='__main__':
    name=sys.argv[1]
    for b in sys.argv[2:]:
        box=tuple(map(int,b.split(',')))
        print(b, angle(name,box))
