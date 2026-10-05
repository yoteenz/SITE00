import subprocess, re, json, collections, datetime
G=['git','-C','/home/user/SITE00']
EXT=re.compile(r'\.(png|jpe?g|webp|gif|avif|mov|mp4|zip)$', re.I)
out=subprocess.run(G+['log','--all','--format=C%x09%H%x09%ct%x09%an%x09%S%x09%s','--raw','--no-abbrev','--no-renames','--diff-filter=AMRD'],capture_output=True,text=True,errors='replace').stdout
events=[]; cur=None; commits={}
for line in out.split('\n'):
    if line.startswith('C\t'):
        p=(line.split('\t',5)+['']*6)[:6]
        cur=dict(sha=p[1],ct=int(p[2]),author=p[3],ref=p[4],subj=p[5]); continue
    m=re.match(r'^:(\d+) (\d+) ([0-9a-f]+) ([0-9a-f]+) ([AMRD])\d*\t(.+)$',line)
    if not m or cur is None: continue
    path=m.group(6).split('\t')[-1]
    if not EXT.search(path): continue
    st=m.group(5)
    blob=m.group(3) if st=='D' else m.group(4)
    events.append(dict(blob=blob,status=st,path=path,**cur))
    commits[cur['sha']]=cur
print('events',len(events),'commits',len(commits), 'deletes', sum(e['status']=='D' for e in events))
# containing refs
cont={}
for sha in commits:
    r=subprocess.run(G+['for-each-ref','--contains',sha,'--format=%(refname)','refs/remotes/origin','refs/tags'],capture_output=True,text=True).stdout.split()
    cont[sha]=[x.replace('refs/remotes/origin/','') for x in r if not x.endswith('/HEAD')]
# PRs
prs=[]
for line in open('/tmp/fa/prs_all.tsv'):
    p=line.rstrip('\n').split('\t')
    prs.append(dict(number=int(p[0]),head=p[1],base=p[2],state=p[3],merged_at=p[4],created=p[5],title=p[6]))
byhead=collections.defaultdict(list)
for pr in prs: byhead[pr['head']].append(pr)
def ts(s): return datetime.datetime.strptime(s,'%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=datetime.timezone.utc).timestamp()
# main merges
mm={}
ml=subprocess.run(G+['log','origin/main','--merges','--format=%H %P%x09%s'],capture_output=True,text=True).stdout
for line in ml.strip().split('\n'):
    if not line: continue
    hp,subj=line.split('\t',1)
    hs=hp.split()
    m=re.search(r'#(\d+)',subj)
    if not m or len(hs)<3: continue
    n=int(m.group(1))
    for c in subprocess.run(G+['rev-list',f'{hs[1]}..{hs[2]}'],capture_output=True,text=True).stdout.split():
        mm.setdefault(c,n)
attr={}
for sha,c in commits.items():
    m=re.search(r'\(#(\d+)\)\s*$',c['subj'])
    if sha in mm: attr[sha]=dict(pr=mm[sha],method='main-merge-commit')
    elif m: attr[sha]=dict(pr=int(m.group(1)),method='squash-subject')
    else:
        cands=[pr for b in cont[sha] for pr in byhead.get(b,[])]
        if cands:
            after=[pr for pr in cands if ts(pr['created'])>=c['ct']-86400]
            pick=min(after or cands,key=lambda pr:ts(pr['created']))
            attr[sha]=dict(pr=pick['number'],method='earliest-pr-containing-head' + ('' if after else '-fallback'))
        else:
            attr[sha]=dict(pr=None,method='no-pr-head-found')
prmap={pr['number']:pr for pr in prs}
lin={}
for sha,c in commits.items():
    a=attr[sha]; pr=prmap.get(a['pr']) if a['pr'] else None
    branches=[b for b in cont[sha] if not b.startswith('refs/tags/')]
    tags=[b.replace('refs/tags/','') for b in cont[sha] if b.startswith('refs/tags/')]
    lin[sha]=dict(sha=sha,date=datetime.datetime.utcfromtimestamp(c['ct']).strftime('%Y-%m-%dT%H:%M:%SZ'),author=c['author'],subject=c['subj'],
        on_main='main' in branches, introducing_pr=a['pr'], pr_head=pr['head'] if pr else None, pr_state=(('merged' if pr['merged_at'] else pr['state']) if pr else None), pr_title=pr['title'] if pr else None,
        attribution_method=a['method'], source_ref=c['ref'].replace('refs/remotes/origin/','').replace('refs/heads/',''),
        containing_branch_count=len(branches), containing_branches_sample=sorted(branches)[:12], containing_tag_count=len(tags))
json.dump(events,open('/tmp/fa/events2.json','w'))
json.dump(lin,open('/tmp/fa/commit_lineage.json','w'),indent=0)
print('attributed', sum(1 for v in lin.values() if v['introducing_pr']), 'of', len(lin))
print(collections.Counter(v['attribution_method'] for v in lin.values()))
