import json, collections
b=json.load(open('blobmeta.json')); u=json.load(open('upmeta.json'))
items={}
for k,m in b.items():
    if m.get('dh'): items[k]=(int(m['dh'],16),m['w'],m['h'])
for k,m in u.items():
    if m.get('dh'): items[k]=(int(m['dh'],16),m['w'],m['h'])
keys=list(items)
print('items',len(keys))
pairs=[]
vals=[items[k] for k in keys]
for i in range(len(keys)):
    di,wi,hi=vals[i]; ai=wi/hi if hi else 0
    for j in range(i+1,len(keys)):
        dj,wj,hj=vals[j]
        aj=wj/hj if hj else 0
        if abs(ai-aj)>0.04*max(ai,aj): continue
        d=bin(di^dj).count('1')
        if d<=24: pairs.append((keys[i],keys[j],d))
print('pairs',len(pairs))
print(collections.Counter(min(d//4*4,24) for _,_,d in pairs))
json.dump(pairs,open('nearpairs.json','w'))
