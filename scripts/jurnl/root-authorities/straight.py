"""Straightened copies of tilted reference regions, so type can be measured square-on.
Each entry: (reference, centre, degrees). The copy is the reference turned by -degrees about centre
(degrees follow the type: negative = anticlockwise on screen). Local coordinates = the copy's pixels."""
import os, numpy as np, cv2
from PIL import Image
from refs import REFS, WORK
STRAIGHT={
 'today_sheet':('today',(520,1100),-5.0),
 'today_slip':('today',(650,700),5.0),
 'plan_right':('plan',(650,900),7.5),
 'plan_left':('plan',(220,1020),11.0),
}
def path(key): return os.path.join(WORK,f'{key}.png')
def build(key):
    ref,c,deg=STRAIGHT[key]
    im=np.asarray(Image.open(REFS[ref]).convert('RGB'))
    M=cv2.getRotationMatrix2D(c,deg,1.0)   # OpenCV: positive = anticlockwise; this undoes a clockwise tilt of -deg
    out=cv2.warpAffine(im,M,(im.shape[1],im.shape[0]),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
    Image.fromarray(out).save(path(key)); return path(key)
def local_to_ref(key, x, y):
    ref,(cx,cy),deg=STRAIGHT[key]
    t=np.deg2rad(deg); c,s=np.cos(t),np.sin(t)
    dx,dy=x-cx,y-cy
    # inverse of cv2 rotation by +deg (anticlockwise on screen): rotate clockwise by deg
    return cx+c*dx-s*dy, cy+s*dx+c*dy
if __name__=='__main__':
    for k in STRAIGHT: print(build(k))
