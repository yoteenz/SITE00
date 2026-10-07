# usage: build.py screen [screen...]  -> layout/<screen>.json ; then emit_ts.py
import json, subprocess, sys, os
from collections import defaultdict
from inkbox import ink
from spec import SPEC
from refs import WORK
L=os.path.join(WORK,'layout'); os.makedirs(L, exist_ok=True)
def run_fit(items, tag):
    json.dump(items, open(f'{L}/_{tag}_in.json','w'))
    subprocess.run(['node',os.path.join(os.path.dirname(__file__),'fit.mjs'),f'{L}/_{tag}_in.json',f'{L}/_{tag}_out.json'],check=True,capture_output=True)
    return {r['id']:r for r in json.load(open(f'{L}/_{tag}_out.json'))}
for name in sys.argv[1:]:
    S=SPEC[name]; ref=S.get('ref',name)
    items=[]
    for t in S['text']:
        id_,text,fam,w,box,align=t[:6]; opt=t[6] if len(t)>6 else {}
        mode=opt.get('mode','dark')
        inkb=list(opt['ink']) if 'ink' in opt else ink(ref,box,mode)
        assert inkb, (name,id_)
        rot=opt.get('rot')
        fitink=[0,0,inkb[3]-inkb[1],inkb[2]-inkb[0]] if rot else inkb
        items.append(dict(id=id_,text=text,family=fam,weight=w,ink=fitink,vink=inkb,rot=rot,align='left' if rot else align,group=opt.get('group'),color=opt.get('color')))
    for it,t in zip(items,S['text']):
        opt=t[6] if len(t)>6 else {}
        for k in ('size','ls'):
            if k in opt: it[k]=opt[k]
    first=run_fit(items,name+'1')
    groups=defaultdict(list)
    for it in items:
        if it['group']: groups[it['group']].append(first[it['id']]['size'])
    for it in items:
        if it['group']: it['size']=round(sum(groups[it['group']])/len(groups[it['group']]),2)
    likes={it['id']:t[6]['like'] for it,t in zip(items,S['text']) if len(t)>6 and 'like' in t[6]}
    if likes:
        mid=run_fit(items,name+'m')
        for it in items:
            if it['id'] in likes: it['size']=mid[likes[it['id']]]['size']; it['ls']=mid[likes[it['id']]]['ls']
    final=run_fit(items,name+'2')
    out=dict(box=S.get('box',{}),text={})
    for it in items:
        f=final[it['id']]; d=dict(family=it['family'],weight=it['weight'],size=f['size'],ls=f['ls'],top=f['top'])
        for k in ('left','cx','right'):
            if k in f: d[k]=f[k]
        d['ink']=it['ink']; d['fitW']=f['inkW']
        if it['rot']:
            # horizontal fit of the run, then turned 90° clockwise about the box centre onto the vertical ink
            w,h=it['ink'][2],it['ink'][3]; adv=f['adv']; S=f['size']
            dx=w/2-(f['left']+adv/2); dy=h/2-(f['top']+S/2)
            vx0,vy0,vx1,vy1=it['vink']
            cx=(vx0+vx1)/2+dy; cy=(vy0+vy1)/2-dx
            d.pop('left',None); d['left']=round(cx-adv/2,2); d['top']=round(cy-S/2,2); d['rot']=90; d['ink']=it['vink']
        out['text'][it['id']]=d
    json.dump(out,open(f'{L}/{name}.json','w'),indent=1)
    print(name,'texts',len(items),'boxes',len(out['box']))
