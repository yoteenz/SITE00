import re, json, collections
EXT = re.compile(r'\.(png|jpe?g|webp|gif|avif|mov|mp4|zip)$', re.I)
events = []
cur = None
for line in open('/tmp/fa/raw.log', encoding='utf-8', errors='replace'):
    line = line.rstrip('\n')
    if line.startswith('C\t'):
        _, sha, ct, src, subj = (line.split('\t', 4) + [''])[:5]
        cur = dict(sha=sha, ct=int(ct), ref=src, subj=subj)
        continue
    m = re.match(r'^:(\d+) (\d+) ([0-9a-f]+) ([0-9a-f]+) ([AMR])\d*\t(.+)$', line)
    if not m or cur is None:
        continue
    path = m.group(6).split('\t')[-1]
    if not EXT.search(path):
        continue
    events.append(dict(blob=m.group(4), status=m.group(5), path=path, **cur))
json.dump(events, open('/tmp/fa/events.json', 'w'))
blobs = collections.defaultdict(list)
for e in events:
    blobs[e['blob']].append(e)
print('events', len(events), 'unique blobs', len(blobs), 'unique paths', len({e['path'] for e in events}))
top = collections.Counter(e['path'].split('/')[0] for e in events)
print(top.most_common(25))
