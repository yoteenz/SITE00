"""Stage 2: supersession adjustments, lineage, unresolved, route-authority map, corpus summary."""
import json, os, re, collections, datetime

F = '/tmp/fa/'
OUT = '/home/user/fa-wt/artifacts/production-full-authority-forensics'
s = json.load(open(F + 'inv_stage1.json'))
inv, git, dgs = s['inventory'], s['git_entries'], s['dup_groups']
routes = json.load(open(F + 'routes.json'))
lin = json.load(open(F + 'commit_lineage.json'))
NOW = '2026-10-05'
AUTH = {'SCREEN_AUTHORITY', 'HYBRID_BOARD', 'INTERACTION_AUTHORITY', 'SYSTEM_PACK_AUTHORITY'}
CONTENT = {'CONTENT_AUTHORITY', 'GENERATED_IN_REVIEW'}

# ── Phase 2 adjustments that needed visual review (contact sheets 09 / 14) ───────────────────────
for e in inv:
    if e['status'] == 'DUPLICATE':
        continue
    if e['upload_pack'] in ('Production_3_Viewports_12_Tabs_SONNET_LITE.zip', 'STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1.zip') and e['family'] in ('EXPERIENCE', 'LIBRARY'):
        e['status'] = 'CONFLICTING'
        other = 'EL 01_World__01_WORLD_ROOT' if e['family'] == 'EXPERIENCE' else 'EL 01_Authorities__01_AUTHORITIES_ROOT'
        e['superseded_by'] = None
        e['conflicts_with'] = other
        e['supersession_rule'] = ('Tab-root conflict: this parent landing (immersive hero / canon vault + family nav) and the later EL family root are different compositions for the '
                                  'same live route. Resolved for implementation by rules 3 (later, route-specific record) + 5 (route manifest realmRoutes.ts maps the tab root to the default family root); '
                                  'parent identity (hero plate, host, nav) retained. FOUNDER DECISION REQUIRED — not discarded.')

# DUPLICATE copies inherit the lineage of their primary
by_id = {e['authority_id']: e for e in inv + git}
for e in inv + git:
    if e['status'] == 'DUPLICATE' and e.get('duplicate_of'):
        p = by_id[e['duplicate_of']]
        e['duplicate_primary_status'] = p['status']

json.dump(dict(inventory=inv, git_entries=git, dup_groups=dgs), open(F + 'inv_final.json', 'w'))

# ── authority-inventory.json ──────────────────────────────────────────────────────────────────────
KEEP = ['authority_id', 'filename', 'source_kind', 'upload_pack', 'upload_path', 'upload_date', 'repo_path', 'blob', 'width', 'height', 'dhash',
        'branch', 'commit_sha', 'commit_date', 'pr_number', 'pr_state', 'on_main', 'containing_branch_count', 'deleted_in',
        'family', 'route', 'live_route', 'state', 'viewport', 'screen_type', 'source_lineage', 'approval', 'status', 'status_before_dedupe',
        'superseded_by', 'conflicts_with', 'supersession_rule', 'scope_note', 'confidence', 'duplicate_group', 'duplicate_of', 'duplicate_primary_status']
entries = []
for e in inv + git:
    if e['screen_type'] in AUTH | CONTENT:
        entries.append({k: e.get(k) for k in KEEP if e.get(k) is not None})
FAMS = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY', 'SHELL']


def tally(es):
    c = collections.Counter(e['status'] for e in es)
    return {k: c.get(k, 0) for k in ['CANONICAL', 'SUPERSEDED', 'IN_REVIEW', 'UNKNOWN', 'DUPLICATE', 'CONFLICTING']}


vis = [e for e in inv + git if e['screen_type'] in AUTH]
cont = [e for e in inv + git if e['screen_type'] in CONTENT]
fam_t = {}
for f in FAMS:
    fe = [e for e in vis if e['family'] == f]
    fam_t[f] = dict(found=len(fe), **tally(fe))
inspected_git_paths = len({e['repo_path'] for e in git})
inventory_doc = dict(
    sprint='P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2', generated=NOW,
    method=['git fetch --all --prune; git log --all --raw --no-abbrev --no-renames (A/M/R/D) over every ref: 881 remote branches + 767 tags + local heads',
            'every image/media blob hashed (w,h, 256-bit dHash); founder upload store hashed with git hash-object so uploads and history share one id space',
            'commit → containing refs (git for-each-ref --contains) → introducing PR (main merge commits, squash subjects, earliest PR whose head contains the commit)',
            'classification by pack manifests, registry (production-authority-registry.ts), route tables (realmRoutes.ts / expressionRoutes.ts) and MEMORY decisions',
            'supersession by the brief order: founder approval > canonical markers > later supersession records > branch/PR lineage > route manifests > most recent approved > implementation canonical'],
    totals=dict(files_inspected=len(inv) + len(git), upload_files=len(inv), git_path_blob_entries=len(git), git_unique_paths=inspected_git_paths,
                visual_authorities=len(vis), content_authorities=len(cont), **{f'visual_{k.lower()}': v for k, v in tally(vis).items()},
                duplicate_groups=len(dgs)),
    by_family=fam_t,
    screen_type_counts=dict(collections.Counter(e['screen_type'] for e in inv + git)),
    entries=entries)
json.dump(inventory_doc, open(f'{OUT}/authority-inventory.json', 'w'), indent=1)

# compact list of every inspected file (incl. live captures, comparison sheets, out-of-scope)
fi = [[e['source_kind'], e.get('repo_path') or e.get('upload_path'), e['blob'][:12], e['screen_type'], e['status'], (e.get('commit_sha') or '')[:8], e.get('pr_number'), (e.get('commit_date') or e.get('upload_date') or '')[:10]]
      for e in inv + git]
json.dump(dict(columns=['source', 'path', 'blob12', 'type', 'status', 'commit', 'pr', 'date'], rows=fi), open(f'{OUT}/files-inspected.json', 'w'))

# ── duplicate-groups.json ─────────────────────────────────────────────────────────────────────────
json.dump(dict(generated=NOW, rule='EXACT = identical git blob id (uploads hashed with git hash-object). NEAR = 256-bit dHash Hamming <= 12 with aspect within 4%, '
               'never within one folder / one upload pack (sibling screens), never across different SW resident ids.',
               groups=dgs), open(f'{OUT}/duplicate-groups.json', 'w'), indent=1)

# ── authority-lineage.json ────────────────────────────────────────────────────────────────────────
packs = collections.OrderedDict()
for e in sorted([e for e in inv], key=lambda e: e['upload_date']):
    p = packs.setdefault(e['upload_pack'] + ' @ ' + e['upload_date'], dict(pack=e['upload_pack'], upload_id=e['upload_id'], uploaded=e['upload_date'], files=0, unique=0,
                                                                          families=set(), statuses=collections.Counter()))
    p['files'] += 1
    if e['status'] != 'DUPLICATE':
        p['unique'] += 1
    p['families'].add(e['family'] or '-')
    p['statuses'][e['status']] += 1
pack_list = []
for k, p in packs.items():
    p['families'] = sorted(p['families'])
    p['statuses'] = dict(p['statuses'])
    pack_list.append(p)
chains = [
    dict(scope='HUB /production', chain=['MPP 06 (2026-09-29, SUPERSEDED)', 'T12 hub ×3 (2026-10-02 18:43, CANONICAL)', 'HUBREF ×3 (2026-10-03 17:12, CANONICAL, same design hi-res)', 'PAR3V 00_HUB (2026-10-03 23:36, compilation)'],
         governs='HUBREF (highest resolution), concordant with T12 + PAR3V'),
    dict(scope='HUB /production?view=machine', chain=['HUBPK 00–14 (2026-09-29 22:32, FINAL)'], governs='HUBPK (LEGACY_LOCKED route)'),
    dict(scope='INBOX root', chain=['T12 inbox ×3 (2026-10-02)', 'IA3V inbox-root (2026-10-03 19:43, SUPERSEDED)', 'IBX2 00 root (2026-10-03 23:21)', 'PAR3V 01_INBOX (2026-10-03 23:36)', 'D-INBOX-ROOT (2026-10-04)'],
         governs='PAR3V 01_INBOX + IBX2 00 (concordant)'),
    dict(scope='INBOX children', chain=['IA3V priority/approvals/direct/system (SUPERSEDED: lens model retired)', 'IBX2 01–05 mobile (model CANONICAL, presentation CONFLICTING)', 'D-INBOX-FINAL (2026-10-04, FOUNDER AUTHORITY: FINAL)'],
         governs='D-INBOX-FINAL for presentation; IBX2 for model/copy'),
    dict(scope='INBOX grandchildren', chain=['IA3V approval-detail (SUPERSEDED)', 'IBX2 06–08 (CANONICAL)'], governs='IBX2 06–08 (desktop/tablet pairs URL-only, unresolved)'),
    dict(scope='DESIGN modes', chain=['MPP 07 (SUPERSEDED)', 'DWS 01–03 (2026-10-02 05:27, SUPERSEDED for mode roots)', 'VPT (2026-10-02 12:13, SUPERSEDED)', 'T12 design ×18 (2026-10-02 18:43, CANONICAL)', 'PAR3V 02–07 (compilation)'],
         governs='T12 + PAR3V; DWS 04 interaction expressions + 05 system packs remain CANONICAL'),
    dict(scope='DESIGN workspace sections design/*', chain=['founder calibration p0vr6r1 + skins + design-workspace references (git c1297b21)'], governs='only recovered authority (mobile-first)'),
    dict(scope='EXPERIENCE tab root', chain=['MPP 08 (SUPERSEDED)', 'T12 experience ×3 + PAR3V 08 (CONFLICTING)', 'EL 01_World root (2026-10-04 15:37)'], governs='EL (rules 3+5) — founder decision flagged'),
    dict(scope='EXPERIENCE 46 routes', chain=['EL LITE (masters URL-only)'], governs='EL'),
    dict(scope='EXPRESSION root', chain=['MPP 09 (SUPERSEDED)', 'T12 expression ×3 (CANONICAL)', 'PAR3V 09 (compilation)'], governs='T12 + PAR3V'),
    dict(scope='EXPRESSION 40 family routes', chain=['NDXNE + recording (2026-09-29, SUPERSEDED; legacy NME only)', 'MPP 10–15 (SUPERSEDED)', 'EXPRESSION LITE v1 (pre-2026-10-04; recovered only as compare-sheet halves)', 'EXPR2 (2026-10-04 01:31, CANONICAL)'],
         governs='EXPR2'),
    dict(scope='CHARACTER FABRICATION', chain=['CF IMG_5414–5429 (2026-09-29/30, CANONICAL mobile)'], governs='CF (mobile); tablet/desktop NO_RECOVERED_AUTHORITY'),
    dict(scope='LIBRARY tab root', chain=['MPP 16 (SUPERSEDED)', 'T12 library ×3 + PAR3V 10 (CONFLICTING)', 'EL 01_Authorities root (2026-10-04 15:37)'], governs='EL (rules 3+5) — founder decision flagged'),
    dict(scope='LIBRARY 75 routes', chain=['EL LITE'], governs='EL'),
    dict(scope='ACTIVITY', chain=['T12 activity ×3 (DOMAIN x TIME log)', 'IA3V activity ×6 (2026-10-03 19:43, lens model, SUPERSEDED)', 'PAR3V 11 (DOMAIN x TIME)', 'D-ACTIVITY-FINAL (2026-10-04, FOUNDER AUTHORITY: FINAL)'],
         governs='D-ACTIVITY-FINAL + T12/PAR3V 11 (concordant)'),
    dict(scope='SHELL host + nav', chain=['HOSTREF (2026-10-03 19:45)', 'BOTTOM_NAV_ICON_FAMILY_V1 (founder approved 2026-10-02)', 'D-SHELL-CANON (handoff v2 07)'], governs='D-SHELL-CANON for tablet/desktop chrome; HOSTREF mobile strip; icon family V1'),
]
directives = {
    'D-SHELL-CANON': 'sonnet_production_authority_handoff_v2/07_DESKTOP_TABLET_SHELL_OVERRIDE.txt — tablet/desktop host = full-width panel, left cluster, hamburger far right; nav icon-left. Image chrome NOT literal.',
    'D-PARENT-NOSCROLL': 'PAR3V README — HUB is the density benchmark; no Production parent/root page may scroll vertically.',
    'D-ACTIVITY-FINAL': 'ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL) — DOMAIN x TIME memory, timeline + inspector.',
    'D-INBOX-FINAL': 'INBOX.ONE-VIEWPORT-FAMILY-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL) — children = rail + rows + inspector; stacked v2 cards stale.',
    'D-INBOX-ROOT': 'MEMORY 2026-10-04 — NEEDS YOU root follows PARENT_3VIEW 01_INBOX.',
    'D-HUB-LEGACY': 'MEMORY 2026-10-03 — hub machine LEGACY_LOCKED.',
    'D-ROSTER': 'MEMORY 2026-10-04 RECOVERY4 — casting-thumbnails-v1 is the resident work look.',
    'D-EXPR-MEDIA': 'This brief — media priority (character / actor / look / frame / environment / performance / asset media first); no strip collapse.',
}
git_auth = [e for e in git if e['screen_type'] in AUTH | CONTENT]
commit_ix = collections.OrderedDict()
for e in sorted(git_auth, key=lambda e: e['commit_date'] or ''):
    c = commit_ix.setdefault(e['commit_sha'], dict(commit=e['commit_sha'], date=e['commit_date'], pr=e['pr_number'], pr_state=e.get('pr_state'), branch=e['branch'],
                                                   on_main=e.get('on_main'), subject=lin.get(e['commit_sha'], {}).get('subject'), files=0, types=collections.Counter()))
    c['files'] += 1
    c['types'][e['screen_type']] += 1
for c in commit_ix.values():
    c['types'] = dict(c['types'])
per_entry = {e['authority_id']: dict(status=e['status'], superseded_by=e.get('superseded_by'), conflicts_with=e.get('conflicts_with'), rule=e.get('supersession_rule'),
                                     approval=e.get('approval'), lineage=e.get('source_lineage'))
             for e in inv + git if e['screen_type'] in AUTH | CONTENT and e['status'] in ('SUPERSEDED', 'CONFLICTING', 'CANONICAL')}
json.dump(dict(generated=NOW, authority_order=['1 explicit founder approval', '2 explicit canonical markers', '3 later supersession records', '4 branch/PR lineage', '5 route manifests',
                                               '6 most recent approved', '7 implementation references already marked canonical'],
               directives=directives, upload_packs_chronological=pack_list, supersession_chains=chains, git_authority_commits=list(commit_ix.values()), per_entry=per_entry),
          open(f'{OUT}/authority-lineage.json', 'w'), indent=1)

# ── route-authority-map.json ──────────────────────────────────────────────────────────────────────
def ids(**kw):
    out = []
    for e in inv + git:
        if e['status'] == 'DUPLICATE' or e['screen_type'] not in AUTH:
            continue
        if all((v(e) if callable(v) else e.get(k) == v) for k, v in kw.items()):
            out.append(e['authority_id'])
    return out


def T12(scr, vp):
    return [i for i in ids(upload_pack='Production_3_Viewports_12_Tabs_SONNET_LITE.zip', route=scr, viewport=vp)]


def PAR(scr):
    return ids(upload_pack='STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1.zip', route=scr)


R = []


def add(route, family, state, kind, mobile, tablet, desktop, modal=None, interaction=None, classification=None, confidence='HIGH', status=None, notes=None, governing=None):
    R.append(dict(route=route, family=family, state=state, kind=kind, mobile_authority=mobile or [], tablet_authority=tablet or [], desktop_authority=desktop or [],
                  modal_drawer_authority=modal or [], interaction_authority=interaction or [], governing=governing, classification=classification,
                  confidence=confidence, status=status or ('MAPPED' if classification != 'NO_AUTHORITY_FOUND' else 'NO_RECOVERED_AUTHORITY'), notes=notes))


P, PS = '/production', '/production/:slug'
hubref = {vp: ids(upload_pack='image.png (chat attachment)', viewport=vp) for vp in ('mobile', 'tablet', 'desktop')}
add(P, 'HUB', 'root', 'root', hubref['mobile'] + T12('hub', 'mobile'), hubref['tablet'] + T12('hub', 'tablet'), hubref['desktop'] + T12('hub', 'desktop'),
    interaction=ids(upload_pack='SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL.zip', screen_type='INTERACTION_AUTHORITY')[:0], classification='EXACT_AUTHORITY_FOUND',
    governing='HUBREF + T12 + PAR3V 00_HUB', notes='Host chrome on tablet/desktop per D-SHELL-CANON. ' + ', '.join(PAR('hub')))
add(f'{P}?view=machine', 'HUB', 'legacy machine', 'root', ids(upload_pack='SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL.zip', screen_type='SCREEN_AUTHORITY'), [], [],
    interaction=ids(upload_pack='SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL.zip', screen_type='INTERACTION_AUTHORITY'), classification='PARTIAL_AUTHORITY',
    governing='HUBPK 00 (+01–14 states)', notes='LEGACY_LOCKED; mobile-only authority; not refined in this sprint.')
inbox_root = ids(upload_pack='STUDIOOS_INBOX_AUTHORITY_LITE_v2.zip', route='inbox inbox-root-needs-you') + ids(upload_pack='SW_INBOX_AUTHORITY_LITE_v2.zip', route='inbox inbox-root-needs-you')
add(f'{P}/queue', 'INBOX', 'NEEDS YOU', 'root', T12('inbox', 'mobile') + inbox_root, T12('inbox', 'tablet'), T12('inbox', 'desktop'), classification='EXACT_AUTHORITY_FOUND',
    governing='PAR3V 01_INBOX + IBX2 00 (D-INBOX-ROOT)', notes=', '.join(PAR('inbox')))
for v in ('watching', 'resolved', 'all-inbox', 'messages', 'system'):
    q = {'all-inbox': 'all'}.get(v, v)
    m = ids(route=f'inbox {v}')
    add(f'{P}/queue?view={q}', 'INBOX', v, 'child', m, [], [], modal=['UNRESOLVED:IBX2 02_DESKTOP_TABLET ' + v], classification='MULTIPLE_CONFLICTING_AUTHORITIES', confidence='HIGH',
        governing='D-INBOX-FINAL (presentation) + IBX2 (model/copy)', notes='Desktop/tablet IBX2 boards exist only as OpenArt CDN URLs (cdn.openart.ai blocked by this container network policy). IA3V lens boards superseded.')
for v, q in (('decision-detail', 'item'), ('message-thread', 'thread'), ('system-notice-detail', 'notice')):
    add(f'{P}/queue?{q}=:id', 'INBOX', v, 'grandchild', ids(route=f'inbox {v}'), [], [], classification='PARTIAL_AUTHORITY',
        governing='IBX2 ' + v, notes='Mobile exact; desktop/tablet pair URL-only (unresolved).')
for t in ('REQUEST REVISION sheet', 'APPROVAL CONFIRMATION sheet', 'FILTER / SORT sheet', 'ATTACHMENT PREVIEW sheet', 'INSPECTOR drawer (?sel=)'):
    add(f'{P}/queue (temporary: {t})', 'INBOX', t, 'temporary', [], [], [], classification='NO_AUTHORITY_FOUND', confidence='HIGH',
        governing='parent Inbox shell (D-INBOX-FINAL defines the inspector/drawer)', notes='NO_RECOVERED_AUTHORITY image; preserved live presentation; inherits parent shell.')
for mode in ('brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'):
    scr = f'design-{mode}'
    inter = [i for i in ids(upload_pack='DWS_SONNET_LITE.zip', screen_type='INTERACTION_AUTHORITY') if f'0{["brand","experience","surfaces","compiler","assets"].index(mode)+1}_' in i] if mode != 'viewport' else []
    add(f'{PS}/design?mode={mode}', 'DESIGN', mode.upper(), 'root', T12(scr, 'mobile'), T12(scr, 'tablet'), T12(scr, 'desktop'), modal=inter, interaction=inter,
        classification='EXACT_AUTHORITY_FOUND', governing='T12 + PAR3V ' + ', '.join(PAR(scr)), notes='DWS / VPT versions superseded (contact sheet 06-design-*).')
for sec in ('workspace', 'references', 'assets', 'pages', 'skins', 'history', 'more'):
    m = ids(source_kind='GIT', family='DESIGN', live_route=f'{PS}/design/{sec}')
    mob = [i for i in m if 'desktop' not in i]
    desk = [i for i in m if 'desktop' in i]
    add(f'{PS}/design/{sec}', 'DESIGN', sec, 'child', mob, [], desk, classification='PARTIAL_AUTHORITY' if m else 'NO_AUTHORITY_FOUND', confidence='MEDIUM',
        governing='founder calibration references (p0vr6r1) — pre-Production design reconstruction', notes='Legacy design bench (COMPOSER1: STALE vs chamber). Not refined in this sprint; DWS unified workspace line is unmounted on the tunnel.')
# Experience / Library
def el_ids(tab, auth):
    stem_fam, stem_file = auth.split('__', 1)
    return ([e['authority_id'] for e in inv if e['status'] != 'DUPLICATE' and e['upload_pack'] == 'STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip' and e['family'] == tab.upper()
             and e['upload_path'].endswith(f'{stem_fam}/{stem_file}.jpg') and e['viewport'] == 'mobile'],
            [e['authority_id'] for e in inv if e['status'] != 'DUPLICATE' and e['upload_pack'] == 'STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip' and e['family'] == tab.upper()
             and e['upload_path'].endswith(f'{stem_fam}/{stem_file}.jpg') and e['viewport'] == 'desktop+tablet'])


for tab in ('experience', 'library'):
    base = f'{PS}/experience' if tab == 'experience' else f'{P}/libraries'
    root_auth = '01_World__01_WORLD_ROOT' if tab == 'experience' else '01_Authorities__01_AUTHORITIES_ROOT'
    m, h = el_ids(tab, root_auth)
    add(base, tab.upper(), 'tab root', 'root', T12(tab, 'mobile') + m, T12(tab, 'tablet') + h, T12(tab, 'desktop') + h, classification='MULTIPLE_CONFLICTING_AUTHORITIES', confidence='MEDIUM',
        governing=f'EL {root_auth} (rules 3+5); parent identity T12/PAR3V', notes='T12/PAR3V parent landing vs EL default-family root — FOUNDER DECISION REQUIRED (contact sheet ' + ('09' if tab == 'experience' else '14') + ').')
    for r in routes[tab]:
        m, h = el_ids(tab, r['authority'])
        href = f"{base}/{r['path']}" + ('/:id' if r.get('param') else '')
        add(href, tab.upper(), f"{r['family']}/{r['id']}", r['kind'], m, h, h, classification='EXACT_AUTHORITY_FOUND' if (m and h) else ('PARTIAL_AUTHORITY' if (m or h) else 'NO_AUTHORITY_FOUND'),
            governing=f"EL {r['authority']}", notes='desktop+tablet hybrid board: left = desktop 16:9, right = tablet 4:3')
add(f'{PS}/expression', 'EXPRESSION', 'Production Floor', 'root', T12('expression', 'mobile'), T12('expression', 'tablet'), T12('expression', 'desktop'), classification='EXACT_AUTHORITY_FOUND',
    governing='T12 + PAR3V ' + ', '.join(PAR('expression')))
for r in routes['expression']:
    key = r['authority']
    mob = [e['authority_id'] for e in inv if e['status'] != 'DUPLICATE' and e['upload_pack'] == 'STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2.zip' and e['upload_path'].endswith(key + '.jpg') and e['viewport'] == 'mobile']
    hyb = [e['authority_id'] for e in inv if e['status'] != 'DUPLICATE' and e['upload_pack'] == 'STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2.zip' and e['upload_path'].endswith(key + '.jpg') and e['viewport'] == 'desktop+tablet']
    add(f"{PS}/expression/{r['path']}", 'EXPRESSION', f"{r['family']}/{r['id']}", r['kind'], mob, hyb, hyb, classification='EXACT_AUTHORITY_FOUND' if (mob and hyb) else 'PARTIAL_AUTHORITY',
        interaction=['D-EXPR-MEDIA'], governing=f'EXPR2 {key}', notes='Media-priority rule applies (brief).')
add(f'{PS}/expression/character-fabrication', 'EXPRESSION', 'character fabrication', 'child', ids(upload_pack='SITE00_Character_Fabrication_Authority_Expressions.zip'), [], [],
    classification='PARTIAL_AUTHORITY', governing='CF IMG_5414–5429 (mobile)', notes='Tablet/desktop: NO_RECOVERED_AUTHORITY → preserve live presentation (Phase 5).')
add(f'{P}/activity', 'ACTIVITY', 'root (DOMAIN x TIME)', 'root', T12('activity', 'mobile'), T12('activity', 'tablet'), T12('activity', 'desktop'), classification='EXACT_AUTHORITY_FOUND',
    governing='D-ACTIVITY-FINAL + T12 + PAR3V ' + ', '.join(PAR('activity')))
for st in ('?domain=<DOMAIN>', '?range=<TODAY|WEEK|MONTH|ALL>', '?verb=<CHANGE>', '?view=blockers|approvals (legacy → verb)'):
    add(f'{P}/activity{st}', 'ACTIVITY', st, 'state', T12('activity', 'mobile'), T12('activity', 'tablet'), T12('activity', 'desktop'), classification='EXACT_AUTHORITY_FOUND',
        governing='same authority as root (filter state)')
add(f'{P}/activity?event=:id | ?milestone=:node', 'ACTIVITY', 'inspector / drawer', 'detail', [], [], [], modal=['D-ACTIVITY-FINAL'], classification='PARTIAL_AUTHORITY', confidence='MEDIUM',
    governing='D-ACTIVITY-FINAL (text authority: inspector fields)', notes='No image authority for the inspector; directive text defines content.')
cls = collections.Counter(r['classification'] for r in R)
fam_routes = collections.defaultdict(collections.Counter)
for r in R:
    fam_routes[r['family']][r['classification']] += 1
json.dump(dict(generated=NOW, totals=dict(routes=len(R), **cls), by_family={k: dict(v) for k, v in fam_routes.items()}, routes=R), open(f'{OUT}/route-authority-map.json', 'w'), indent=1)

# ── unresolved-authorities.json ───────────────────────────────────────────────────────────────────
import glob
oa = json.load(open(glob.glob('/tmp/fa/up/46eb4896-*/*/02_DESKTOP_TABLET/OPENART_ASSET_MANIFEST.json')[0]))
unres = [
    dict(id='U-01', kind='AUTHORITY_URL_ONLY', family='INBOX', items=[dict(route=k, **v) for k, v in oa.items()],
         detail='IBX2 desktop/tablet boards referenced only by OpenArt CDN URL. Retrieval from this container fails: cdn.openart.ai CONNECT denied (403) by the environment network policy.',
         effect='Inbox desktop/tablet children + grandchildren are governed by D-INBOX-FINAL + parent authorities; no image comparison possible here.'),
    dict(id='U-02', kind='MASTERS_NOT_PRESENT', family='EXPERIENCE+LIBRARY', detail='EL 00_README: the original EXPERIENCE/LIBRARY *_AUTHORITY.zip masters remain the masters; only the compressed LITE copies (242) are present. '
         'Masters are listed as 242 OpenArt CDN URLs in artifacts/production-openart-recovery2 (download_production_authorities.ps1) — CDN blocked here.', effect='LITE copies used for all comparisons.'),
    dict(id='U-03', kind='SUPERSEDED_PACK_NOT_PRESENT', family='EXPRESSION', detail='STUDIOOS_EXPRESSION_AUTHORITY_LITE_v1 (used by Expression OPUS1) is not in the upload store; recovered only as the authority halves of 120 committed '
         'compare sheets (artifacts/production-expression-authority-opus1/**/authority-vs-live.jpg). Sampled route (casting/roles) identical to v2.', effect='v2 governs.'),
    dict(id='U-04', kind='LOW_CONFIDENCE_MAPPING', family='DESIGN', detail='DWS 02_TABLET CC27801B…: active mode tab not legible; mapped to SURFACES by elimination.', effect='Superseded anyway by T12.'),
    dict(id='U-05', kind='RESPONSIVE_VARIANT_MISSING', family='EXPRESSION', detail='Character Fabrication has 16 mobile authorities and no tablet/desktop authority.', effect='Phase 5: preserve live tablet/desktop presentation.'),
    dict(id='U-06', kind='RESPONSIVE_VARIANT_MISSING', family='HUB', detail='Hub machine (LEGACY_LOCKED) has mobile authority only.', effect='Not refined.'),
    dict(id='U-07', kind='AUTHORITY_CONFLICT', family='EXPERIENCE', detail='/production/:slug/experience — T12/PAR3V 08 parent landing vs EL 01_World root.', effect='EL governs (rules 3+5); founder decision required.'),
    dict(id='U-08', kind='AUTHORITY_CONFLICT', family='LIBRARY', detail='/production/libraries — T12/PAR3V 10 canon-vault landing vs EL 01_Authorities root.', effect='EL governs (rules 3+5); founder decision required.'),
    dict(id='U-09', kind='AUTHORITY_CONFLICT', family='SHELL', detail='Tablet/desktop host chrome: images show centred selector/stacked nav; D-SHELL-CANON (text) says left cluster + icon-left nav. HUB reconstruction OPUS1 flagged "needs a founder decision".',
         effect='D-SHELL-CANON governs (explicit canonical marker).'),
    dict(id='U-10', kind='UNMOUNTED_AUTHORITY_LINE', family='DESIGN', detail='DWS unified Design workspace implementation lives on cursor/design-unified-workspace-opus-convergence1 and is not on the tunnel lineage; '
         '/production/:slug/design/* children still mount the legacy bench.', effect='Out of this sprint\'s refinement scope; recorded.'),
    dict(id='U-11', kind='NO_RECOVERED_AUTHORITY', family='INBOX', detail='Temporary surfaces (revision / approval confirmation / filter-sort / attachment preview) have no image authority.', effect='Preserve live; inherit parent shell.'),
    dict(id='U-12', kind='CONTENT_IN_REVIEW', family='SHELL', detail='GROK1 production plates (public/site00/production-authority-assets/*.jpg|png root) in runtime use without a recorded founder approval.', effect='Kept (no new authority generated).'),
    dict(id='U-13', kind='NOT_AUTHORITY_DESPITE_NAME', family='ALL', detail='artifacts/production-authority-opus/{desktop,mobile,tablet}/NN-*.jpg are OPUS1 live captures, not authority copies (dHash 68–111 vs T12).', effect='Classified LIVE_CAPTURE.'),
]
json.dump(dict(generated=NOW, unresolved=unres), open(f'{OUT}/unresolved-authorities.json', 'w'), indent=1)

# ── Phase 6 corpus summary data ───────────────────────────────────────────────────────────────────
missing = [r['route'] for r in R if r['classification'] == 'NO_AUTHORITY_FOUND']
summary = dict(files_inspected=len(inv) + len(git), git_unique_paths=inspected_git_paths, upload_files=len(inv), visual_authorities=len(vis),
               **{k.lower(): v for k, v in tally(vis).items()}, duplicate_groups=len(dgs),
               by_family=fam_t, routes=len(R), route_classes=dict(cls), routes_missing_authority=missing,
               content_authorities=len(cont), content_status=tally(cont))
json.dump(summary, open(F + 'summary.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in summary.items() if k not in ('by_family',)}, indent=1))
print(json.dumps(fam_t))
print(json.dumps({k: dict(v) for k, v in fam_routes.items()}))
