# usage: zoom.py name x0 y0 x1 y1 scale out [step]
import sys
from PIL import Image, ImageDraw, ImageFont
from refs import REFS
name,x0,y0,x1,y1,s,out=sys.argv[1],*map(int,sys.argv[2:7]),sys.argv[7]
step=int(sys.argv[8]) if len(sys.argv)>8 else 10
im=Image.open(REFS.get(name,name)).convert('RGB').crop((x0,y0,x1,y1))
im=im.resize((im.width*s,im.height*s),Image.NEAREST)
d=ImageDraw.Draw(im)
for x in range((x0//step+1)*step,x1,step):
    X=(x-x0)*s; major=x%(step*5)==0
    d.line([(X,0),(X,im.height)],fill=(255,0,0) if major else (255,150,150),width=1)
    if major: d.text((X+2,2),str(x),fill=(255,0,0))
for y in range((y0//step+1)*step,y1,step):
    Y=(y-y0)*s; major=y%(step*5)==0
    d.line([(0,Y),(im.width,Y)],fill=(0,0,255) if major else (150,150,255),width=1)
    if major: d.text((2,Y+2),str(y),fill=(0,0,255))
im.save(out)
