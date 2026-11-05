"""Summarise Playwright JSON reports: per spec × project counts and the failing tests."""
import json, sys
def load(p):
    try:
        return json.load(open(p))
    except Exception:
        return None
def walk(suite, file=None):
    file = suite.get('file', file)
    for s in suite.get('specs', []):
        for t in s.get('tests', []):
            res = t.get('results') or [{}]
            status = t.get('status') or res[-1].get('status')
            yield dict(file=file, title=s['title'], project=t.get('projectName'), status=status, outcome=t.get('status'), last=res[-1].get('status'))
    for c in suite.get('suites', []):
        yield from walk(c, file)
def summarise(p):
    d = load(p)
    if not d:
        return None
    rows = [r for s in d['suites'] for r in walk(s)]
    agg = {}
    fails = []
    for r in rows:
        k = (r['file'].split('/')[-1], r['project'])
        a = agg.setdefault(k, {'expected': 0, 'unexpected': 0, 'skipped': 0, 'flaky': 0})
        a[r['outcome']] = a.get(r['outcome'], 0) + 1
        if r['outcome'] == 'unexpected':
            fails.append((k[0], k[1], r['title']))
    return agg, fails, d.get('stats', {})
if __name__ == '__main__':
    agg, fails, st = summarise(sys.argv[1])
    print(st)
    for k, v in sorted(agg.items()): print(k, v)
    for f in fails: print('FAIL', f)
