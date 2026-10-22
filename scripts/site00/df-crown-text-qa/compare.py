"""Compare two measure.cjs runs: role widths, line counts, art-ink clearance, artwork invariance, overflow.
usage: python3 compare.py <before-dir> <after-dir>"""
import json,sys
BD,AD=sys.argv[1],sys.argv[2]
B={r['name']:r for r in json.load(open(f'{BD}/measure.json'))}
A={r['name']:r for r in json.load(open(f'{AD}/measure.json'))}
def role(r,k):
    R=r['roles'].get(k)
    if not R or not R['lines']: return None
    ls=R['lines']; clr=[l['clearVisible'] for l in ls if l['clearVisible'] is not None]
    return dict(box=R['box']['w'], n=len(ls), maxw=max(l['w'] for l in ls), clr=min(clr) if clr else None, ovl=any(l['overlapsInk'] for l in ls), lines=[l['text'] for l in ls])
bad=[]
rows=[]
for name in B:
    b,a=B[name],A.get(name)
    if 'error' in b or a is None or 'error' in a: print('ERR',name); continue
    out=[name.ljust(18)]
    for k in ['rail','headline','lede']:
        rb,ra=role(b,k),role(a,k)
        if not rb: continue
        if not ra: out.append(f'{k[:2]} MISSING-AFTER'); bad.append((name,k,'missing')); continue
        c=lambda x: '∞' if x is None else f"{x:.0f}"
        out.append(f"{k[:2]} {rb['box']:.0f}→{ra['box']:.0f} n{rb['n']}→{ra['n']} clr{c(rb['clr'])}→{c(ra['clr'])}{' OVL' if ra['ovl'] else ''}{' (wasOVL)' if rb['ovl'] else ''}")
        if ra['ovl']: bad.append((name,k,'overlap'))
    # art invariance
    for o in ['crown','corner','hero']:
        ab,aa=b['art'][o],a['art'][o]
        if not ab: continue
        if o=='corner':
            # container-relative (screen bottom-right)
            rel=lambda r: (round(r['art'][o]['box']['r']-r['screen']['r'],2), round(r['art'][o]['box']['b']-r['screen']['b'],2), r['art'][o]['box']['w'], r['art'][o]['box']['h'])
            st=lambda x:{k:v for k,v in x['style'].items() if k not in ('top','left')}
            same = rel(b)==rel(a) and st(ab)==st(aa)
        else:
            st=lambda x:{k:v for k,v in x['style'].items() if k!='bottom'}
            relb=lambda r,o,k: {q:round(r['art'][o][k][q]-(r['screen']['x'] if q in('x','r') else r['screen']['y'] if q in ('y','b') else 0),2) for q in r['art'][o][k]}
            same = relb(b,o,'box')==relb(a,o,'box') and relb(b,o,'svg')==relb(a,o,'svg') and st(ab)==st(aa)
        hs = (b['artHash'][o] or {}).get('hash')==(a['artHash'][o] or {}).get('hash')
        if not hs:
            import numpy as np
            from PIL import Image
            x0,y0,x1,y1=b['artHash'][o]['rect']
            ia=np.asarray(Image.open(f'{BD}/{name}__art.png').convert('RGB')).astype(int)[y0:y1,x0:x1]
            ib=np.asarray(Image.open(f'{AD}/{name}__art.png').convert('RGB')).astype(int)[y0:y1,x0:x1]
            dd=np.abs(ia-ib).max(axis=2) if ia.size else np.zeros((1,1),int); out.append(f'pixΔmax{dd.max()} n{int((dd>0).sum())}')
            if dd.max()<=2: hs=True
        if o=='corner': hs=True  # corner sits at page bottom outside the viewport clip
        out.append(f"{o}:{'=' if same else 'MOVED'}{'' if hs else ' PIXDIFF'}")
        if not same or not hs: bad.append((name,o,'art'))
    ov=a['docOverflowX']
    out.append(f"docOvX {b['docOverflowX']}→{ov}")
    if ov>0: bad.append((name,'doc','overflow'))
    print(' | '.join(out))
print('PROBLEMS',bad)
