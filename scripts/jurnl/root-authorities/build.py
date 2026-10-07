"""usage: build.py screen [screen...] -> $ROOTS_WORK/layout/<screen>.json (measured type: face, size, tracking, top, anchor x)."""
import json, subprocess, sys, os
from collections import defaultdict
from inkbox import ink
from spec import SPEC
from refs import WORK
FIT=os.path.join(os.path.dirname(__file__),'..','reference-replica','fit.mjs')
L=os.path.join(WORK,'layout'); os.makedirs(L, exist_ok=True)
def run_fit(items, tag):
    json.dump(items, open(f'{L}/_{tag}_in.json','w'))
    subprocess.run(['node',FIT,f'{L}/_{tag}_in.json',f'{L}/_{tag}_out.json'],check=True,capture_output=True)
    return {r['id']:r for r in json.load(open(f'{L}/_{tag}_out.json'))}
for name in sys.argv[1:]:
    out={}
    for frame,runs in SPEC[name].items():
        items=[]
        for t in runs:
            id_,text,fam,w,box,align=t[:6]; opt=t[6] if len(t)>6 else {}
            inkb=list(opt['ink']) if 'ink' in opt else ink(frame,box,opt.get('mode','dark'))
            assert inkb, (name,frame,id_)
            rot=opt.get('rot')
            fitink=[0,0,inkb[3]-inkb[1],inkb[2]-inkb[0]] if rot else inkb
            it=dict(id=id_,text=text,family=fam,weight=w,ink=fitink,vink=inkb,rot=rot,align='left' if rot else align,group=opt.get('group'))
            for k in ('size','ls'):
                if k in opt: it[k]=opt[k]
            items.append(it)
        first=run_fit(items,f'{name}_{frame}_1')
        groups=defaultdict(list)
        for it in items:
            if it['group']: groups[it['group']].append(first[it['id']]['size'])
        for it in items:
            if it['group'] and 'size' not in it: it['size']=round(sum(groups[it['group']])/len(groups[it['group']]),2)
        final=run_fit(items,f'{name}_{frame}_2')
        res={}
        for it in items:
            f=final[it['id']]; d=dict(family=it['family'],weight=it['weight'],size=f['size'],ls=f['ls'],top=f['top'])
            for k in ('left','cx','right'):
                if k in f: d[k]=f[k]
            d['ink']=it['vink']
            if it['rot']:
                w,h=it['ink'][2],it['ink'][3]; adv=f['adv']; S=f['size']
                dx=w/2-(f['left']+adv/2); dy=h/2-(f['top']+S/2)
                vx0,vy0,vx1,vy1=it['vink']
                cx=(vx0+vx1)/2+dy; cy=(vy0+vy1)/2-dx
                d.pop('left',None); d['left']=round(cx-adv/2,2); d['top']=round(cy-S/2,2); d['rot']=90
            res[it['id']]=d
        out[frame]=res
    json.dump(out,open(f'{L}/{name}.json','w'),indent=1)
    print(name,{k:len(v) for k,v in out.items()})
