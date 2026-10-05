"""Forensic authority inventory builder (P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2).

Inputs (scratch, produced earlier in the sprint):
  events2.json        every media add/modify/delete event across ALL refs (git log --all --raw)
  commit_lineage.json per-commit containing branches/tags + introducing PR
  blobmeta.json       w/h/dHash for every image blob in history
  upmeta.json         w/h/dHash for every image in the founder upload store (hashed with git hash-object)
  routes.json         live route tables (EXPERIENCE_ROUTES, LIBRARY_ROUTES, EXPRESSION_ROUTES)
Outputs: artifacts/production-full-authority-forensics/*.json
"""
import json, os, re, collections, datetime, hashlib, subprocess

OUT = '/home/user/fa-wt/artifacts/production-full-authority-forensics'
os.makedirs(OUT, exist_ok=True)
F = '/tmp/fa/'
events = json.load(open(F + 'events2.json'))
lin = json.load(open(F + 'commit_lineage.json'))
bm = json.load(open(F + 'blobmeta.json'))
um = json.load(open(F + 'upmeta.json'))
routes = json.load(open(F + 'routes.json'))
UPLOAD_ROOT = '/root/.claude/uploads/a4ddeb1f-7a6e-588f-a36f-93f2d984b129/'

# ── upload packs ──────────────────────────────────────────────────────────────────────────────────
up_times = {}
for n in os.listdir(UPLOAD_ROOT):
    up_times[n[:8]] = datetime.datetime.utcfromtimestamp(os.path.getmtime(UPLOAD_ROOT + n)).strftime('%Y-%m-%dT%H:%M:%SZ')

PACKS = {
    '3a593db6': ('NDXNE', 'NDXBOOK_Narrative_Engine_Screen_Pack.zip'),
    'f465f5d2': ('NDXREC', 'ScreenRecording_09-29-2026_09-47-38_1.mov'),
    '3a4922ff': ('MPP', 'SITE00_Mobile_Projects_and_Production_Reference_Pack.zip'),
    '4f21cea8': ('HUBPK', 'SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL.zip'),
    '745ac662': ('CF', 'SITE00_Character_Fabrication_Authority_Expressions.zip'),
    '3402596c': ('CF', 'SITE00_Character_Fabrication_Authority_Expressions.zip'),
    '01f47f7f': ('DWS', 'DWS_SONNET_LITE.zip'),
    '9eed5eb5': ('DWS', 'DWS_SONNET_LITE.zip'),
    'ac456193': ('DWS', 'DWS_SONNET_LITE.zip'),
    '4649e42c': ('VPT', 'SITE00_VIEWPORT_TAB_SONNET_LITE.zip'),
    'acaacd95': ('T12', 'Production_3_Viewports_12_Tabs_SONNET_LITE.zip'),
    'a1eba187': ('T12', 'Production_3_Viewports_12_Tabs_SONNET_LITE.zip'),
    '8b6bebae': ('HANDOFF2', 'sonnet_production_authority_handoff_v2.zip'),
    'aced8adb': ('HANDOFF2', 'sonnet_production_authority_handoff_v2.zip'),
    '0af8bf87': ('HUBREF', 'image.png (chat attachment)'),
    'c77b4b50': ('HUBREF', 'image.png (chat attachment)'),
    'd89b8fd6': ('HUBREF', 'image.png (chat attachment)'),
    '0b60b970': ('HOSTREF', 'image.jpg (chat attachment)'),
    '0ba6463d': ('IA3V', 'STUDIOOS_INBOX_ACTIVITY_3VIEW_AUTHORITY_LITE_v1.zip'),
    'e926e70b': ('IBX2', 'SW_INBOX_AUTHORITY_LITE_v2.zip'),
    '46eb4896': ('IBX2', 'STUDIOOS_INBOX_AUTHORITY_LITE_v2.zip'),
    'b0a6f2f1': ('PAR3V', 'STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1.zip'),
    'f4f31b04': ('EXPR2', 'STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2.zip'),
    '41316f53': ('EL', 'STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip'),
}

P = '/production'
PS = '/production/:slug'
T12_MAP = {  # registry production-authority-registry.ts (mobile, tablet, desktop)
    'hub': ('5922', '6004', '5981'), 'inbox': ('5924', '6005', '5982'), 'experience': ('5925', '6006', '5988'),
    'expression': ('5957', '6007', '5989'), 'library': ('5979', '6008', '5990'), 'activity': ('5936', '6009', '5991'),
    'design-brand': ('5968', '6010', '5983'), 'design-experience': ('5963', '6019', '5992'),
    'design-surfaces': ('5969', '6011', '5984'), 'design-compiler': ('5970', '6012', '5985'),
    'design-assets': ('5974', '6013', '5986'), 'design-viewport': ('5975', '6014', '5987'),
}
T12_IMG = {}
for scr, (m, t, d) in T12_MAP.items():
    T12_IMG[m] = (scr, 'mobile'); T12_IMG[t] = (scr, 'tablet'); T12_IMG[d] = (scr, 'desktop')

SCREEN_ROUTE = {
    'hub': (f'{P}', 'HUB'), 'inbox': (f'{P}/queue', 'INBOX'), 'experience': (f'{PS}/experience', 'EXPERIENCE'),
    'expression': (f'{PS}/expression', 'EXPRESSION'), 'library': (f'{P}/libraries', 'LIBRARY'), 'activity': (f'{P}/activity', 'ACTIVITY'),
}
for mode in ('brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'):
    SCREEN_ROUTE[f'design-{mode}'] = (f'{PS}/design?mode={mode}', 'DESIGN')

PARENT_FILES = {'00_HUB': 'hub', '01_INBOX': 'inbox', '02_DESIGN_BRAND': 'design-brand', '03_DESIGN_EXPERIENCE': 'design-experience',
                '04_DESIGN_SURFACES': 'design-surfaces', '05_DESIGN_COMPILER': 'design-compiler', '06_DESIGN_ASSETS': 'design-assets',
                '07_DESIGN_VIEWPORT': 'design-viewport', '08_EXPERIENCE': 'experience', '09_EXPRESSION': 'expression',
                '10_LIBRARY': 'library', '11_ACTIVITY': 'activity'}

EXPR_FAMILY_SEG = {}
for r in routes['expression']:
    EXPR_FAMILY_SEG[r['authority']] = r
EL_ROUTE = {}
for tab in ('experience', 'library'):
    for r in routes[tab]:
        EL_ROUTE[(tab, r['authority'])] = r


def realm_href(r):
    base = f'{PS}/experience' if r['tab'] == 'experience' else f'{P}/libraries'
    return f"{base}/{r['path']}" + ('/:id' if r.get('param') else '')


def expr_href(r):
    return f"{PS}/expression/{r['path']}"


# founder directives (explicit text authorities) used as supersession evidence
DIRECTIVES = {
    'D-SHELL-CANON': {'date': '2026-10-02T18:43:26Z', 'source': 'sonnet_production_authority_handoff_v2/07_DESKTOP_TABLET_SHELL_OVERRIDE.txt',
                      'rule': 'Tablet/desktop host top = one full-width panel, LEFT cluster, hamburger far right; bottom nav icon-left. Images showing a centred project selector are NOT literal.'},
    'D-PARENT-NOSCROLL': {'date': '2026-10-03T23:36:38Z', 'source': 'STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1/00_DOCS/README.md',
                          'rule': 'Parent boards are compilations of the founder-provided images; HUB is the density benchmark; no vertical page scroll.'},
    'D-ACTIVITY-FINAL': {'date': '2026-10-04', 'source': 'P0.STUDIOOS.PRODUCTION.ACTIVITY.ONE-VIEWPORT-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL)',
                         'rule': 'Activity = canonical DOMAIN x TIME project memory with timeline + inspector; lens children (approvals/updates/comments/blockers) retired.'},
    'D-INBOX-FINAL': {'date': '2026-10-04', 'source': 'P0.STUDIOOS.PRODUCTION.INBOX.ONE-VIEWPORT-FAMILY-CONVERGENCE.OPUS1 (FOUNDER AUTHORITY: FINAL)',
                      'rule': 'Inbox children = rail + compact rows + inspector/drawer; stacked SW_INBOX_AUTHORITY_LITE_v2 mobile card presentation is stale. NEEDS YOU root and grandchildren unchanged.'},
    'D-INBOX-ROOT': {'date': '2026-10-04', 'source': 'MEMORY 2026-10-04 Inbox root convergence 2',
                     'rule': 'NEEDS YOU root follows PARENT_3VIEW 01_INBOX.'},
    'D-HUB-LEGACY': {'date': '2026-10-03', 'source': 'MEMORY 2026-10-03 COMPOSER1 / HUB reconstruction OPUS1',
                     'rule': 'Hub machine (/production?view=machine) is LEGACY_LOCKED; /production renders the approved HUB authority grammar.'},
    'D-ROSTER': {'date': '2026-10-04', 'source': 'MEMORY 2026-10-04 RECOVERY4',
                 'rule': 'Resident work look = casting-thumbnails-v1 (white tee, red collar); registry shared/residents portraits (black tee) outdated for fabrication.'},
}


def dws_mode(rel):
    m = {'0F4A7CE6': ('assets', 'tablet-landscape', 'HIGH'), '13B1DC3A': ('brand', 'tablet-portrait', 'HIGH'),
         '874C3EE0': ('brand', 'tablet-landscape', 'HIGH'), 'CC27801B': ('surfaces', 'tablet-landscape', 'MEDIUM (active tab not legible; by elimination)'),
         'DB9D830C': ('experience', 'tablet-landscape', 'HIGH'), 'EC554178': ('compiler', 'tablet-landscape', 'HIGH')}
    for k, v in m.items():
        if k in rel:
            return v
    return None


def classify_upload(code, rel, w, h):
    """Return dict of family/route/viewport/state/screen_type/status/... for an upload file."""
    fn = rel.split('/')[-1]
    stem = re.sub(r'\.(jpe?g|png)$', '', fn, flags=re.I)
    d = dict(family=None, route=None, live_route=None, state='default', viewport=None, screen_type='SCREEN_AUTHORITY',
             status='UNKNOWN', approval=None, superseded_by=None, supersession_rule=None, scope_note=None, confidence='HIGH')
    if code == 'NDXNE':
        d.update(family='EXPRESSION', route='narrative-momentum (NME widget, expression engine)', viewport='mobile',
                 live_route=f'{PS}/expression/narrative (family) · NME widget on legacy expression-engine route',
                 state=stem, status='SUPERSEDED', superseded_by='EXPR2 01_Narrative/*',
                 supersession_rule='3 later supersession record (Expression v2 narrative family, 2026-10-04) + 5 route manifest (expressionRoutes.ts)',
                 scope_note='Remains the only authority for the legacy NME widget inside the expression-engine route (LEGACY_LOCKED, not Production authority per COMPOSER1).')
    elif code == 'NDXREC':
        d.update(family='EXPRESSION', route='narrative-momentum (NME widget recording)', viewport='mobile', screen_type='INTERACTION_AUTHORITY',
                 state='screen recording', status='SUPERSEDED', superseded_by='EXPR2 01_Narrative/*',
                 supersession_rule='3 later supersession record', scope_note='Interaction reference for the legacy NME widget only.')
    elif code == 'MPP':
        n = int(stem[:2])
        if n <= 5:
            d.update(family='PROJECTS', screen_type='OUT_OF_SCOPE', viewport='mobile', status='UNKNOWN',
                     scope_note='Projects (personal portfolio) — not a Production route; out of this audit\'s refinement scope.')
        else:
            mp = {6: ('HUB', 'hub', f'{P}', 'HUBREF d89b8fd6 / T12 IMG_5922 / PAR3V 00_HUB'),
                  7: ('DESIGN', 'design root', f'{PS}/design', 'T12 design modes / PAR3V 02–07'),
                  8: ('EXPERIENCE', 'experience root', f'{PS}/experience', 'EL 01_World__01_WORLD_ROOT / PAR3V 08'),
                  9: ('EXPRESSION', 'expression root', f'{PS}/expression', 'T12 IMG_5957 / PAR3V 09_EXPRESSION'),
                  10: ('EXPRESSION', 'casting root', f'{PS}/expression/casting', 'EXPR2 02_Casting/00_casting-root'),
                  11: ('EXPRESSION', 'look + wardrobe root', f'{PS}/expression/wardrobe', 'EXPR2 03_Look_Wardrobe/00_look-wardrobe-root'),
                  12: ('EXPRESSION', 'narrative root', f'{PS}/expression/narrative', 'EXPR2 01_Narrative/00_narrative-root'),
                  13: ('EXPRESSION', 'performance root', f'{PS}/expression/performance', 'EXPR2 04_Cast_Performance/00_performance-root'),
                  14: ('EXPRESSION', 'sets + scenes root', f'{PS}/expression/sets', 'EXPR2 05_Sets_Scenes/00_sets-scenes-root'),
                  15: ('EXPRESSION', 'review + handoff root', f'{PS}/expression/review', 'EXPR2 07_Review_Handoff/00_review-handoff-root'),
                  16: ('LIBRARY', 'library root', f'{P}/libraries', 'EL 01_Authorities__01_AUTHORITIES_ROOT / PAR3V 10_LIBRARY')}[n]
            d.update(family=mp[0], route=mp[1], live_route=mp[2], viewport='mobile', status='SUPERSEDED', superseded_by=mp[3],
                     supersession_rule='3 later supersession record + 6 most recent approved (later family packs)')
    elif code == 'HUBPK':
        n = int(stem[:2])
        d.update(family='HUB', route='hub machine', live_route=f'{P}?view=machine', viewport='mobile', state=stem[3:].lower(),
                 status='CANONICAL', approval='explicit: pack named FINAL; AUTHORITY_RULES.txt "00 is the immutable master visual authority"; MEMORY 2026-09-30 founder required pixel-perfect mount',
                 scope_note='Governs the LEGACY_LOCKED hub machine only; /production root is governed by HUBREF/T12/PAR3V 00_HUB.',
                 screen_type='SCREEN_AUTHORITY' if n == 0 else 'INTERACTION_AUTHORITY')
    elif code == 'CF':
        d.update(family='EXPRESSION', route='character fabrication', live_route=f'{PS}/expression/character-fabrication', viewport='mobile',
                 state=stem, status='CANONICAL',
                 approval='explicit: MEMORY 2026-09-30 "Founder sent all 31 authority screens … implement them pixel perfect"',
                 scope_note='Mobile only. Tablet/desktop have NO recovered CF authority (RESPONSIVE_VARIANT_MISSING). CF typography is an intentional specialization (COMPOSER1 AUTHORITY_CONFLICT cf-surface).')
    elif code == 'DWS':
        sec = rel.split('/')[-2]
        if sec.startswith('01_DESKTOP'):
            mode = {'01': 'brand', '02': 'experience', '03': 'surfaces', '04': 'compiler', '05': 'assets'}[stem[:2]]
            d.update(family='DESIGN', route=f'design {mode}', live_route=f'{PS}/design?mode={mode}', viewport='desktop',
                     status='SUPERSEDED', superseded_by=f'T12 design-{mode} (IMG_{T12_MAP["design-"+mode][2]}) / PAR3V',
                     supersession_rule='6 most recent approved (T12 36-screen set uploaded 2026-10-02 18:43 after DWS 05:27/07:04; PAR3V README: approved parent authorities)')
        elif sec.startswith('02_TABLET'):
            mm = dws_mode(rel) or ('unknown', 'tablet', 'LOW')
            d.update(family='DESIGN', route=f'design {mm[0]}', live_route=f'{PS}/design?mode={mm[0]}', viewport=mm[1], confidence=mm[2],
                     status='SUPERSEDED', superseded_by=f'T12 design-{mm[0]} tablet / PAR3V', supersession_rule='6 most recent approved')
        elif sec.startswith('03_MOBILE'):
            mode = {'01': 'brand', '02': 'surfaces', '03': 'compiler', '04': 'experience', '05': 'assets'}[stem[:2]]
            d.update(family='DESIGN', route=f'design {mode}', live_route=f'{PS}/design?mode={mode}', viewport='mobile',
                     status='SUPERSEDED', superseded_by=f'T12 design-{mode} mobile / PAR3V', supersession_rule='6 most recent approved',
                     approval='01 is "THE FOUNDER-SUPPLIED BRAND REFERENCE" (PACK_MANIFEST)' if stem.startswith('01') else None)
        elif sec.startswith('04_DESKTOP_INTERACTION'):
            mode = {'01': 'brand', '02': 'experience', '03': 'surfaces', '04': 'compiler', '05': 'assets'}[stem[:2]]
            d.update(family='DESIGN', route=f'design {mode}', live_route=f'{PS}/design?mode={mode}', viewport='desktop', screen_type='INTERACTION_AUTHORITY',
                     state=stem[3:].lower(), status='CANONICAL', approval='explicit pack authority order: "04 — INTERACTION / EXPRESSION AUTHORITY"',
                     scope_note='No later interaction authority exists for Design drawers / inspectors / review modals / export.')
        else:
            d.update(family='DESIGN', route='design system packs', live_route=f'{PS}/design (icons + asset language)', viewport='n/a',
                     screen_type='SYSTEM_PACK_AUTHORITY', state=stem.lower(), status='CANONICAL',
                     approval='explicit: "05_SYSTEM_PACKS — ICON + COMPONENT / ASSET LANGUAGE"; committed as docs/site00/design-pack/sources/*')
    elif code == 'VPT':
        vp = {'01': 'desktop', '02': 'tablet', '03': 'mobile'}[stem[:2]]
        d.update(family='DESIGN', route='design viewport', live_route=f'{PS}/design?mode=viewport', viewport=vp,
                 status='SUPERSEDED', superseded_by=f'T12 design-viewport {vp} / PAR3V 07_DESIGN_VIEWPORT',
                 supersession_rule='6 most recent approved (T12 2026-10-02 18:43 after VPT 12:13); VPT README limits it to "VIEWPORT TAB CONTENT and responsive spatial expression only"',
                 scope_note='Content concordant with the T12/PAR3V viewport chamber (phone preview, preset / route / safe-area / orientation / zoom controls, validation sheet).')
    elif code == 'T12':
        num = re.search(r'IMG_(\d+)', fn).group(1)
        scr, vp = T12_IMG[num]
        route, fam = SCREEN_ROUTE[scr]
        d.update(family=fam, route=scr, live_route=route, viewport=vp, status='CANONICAL',
                 approval='explicit: handoff v2 01_AUTHORITY_MANIFEST (36 founder authority screens) + PAR3V README "approved Production parent/root authorities"; registry production-authority-registry.ts')
        if scr in ('experience', 'library'):
            d.update(scope_note='Parent-level authority. Route bodies now governed by the later EL pack (2026-10-04 15:37); parent identity (hero, host, nav) still governed here.')
        if scr == 'inbox':
            d.update(scope_note='Root (NEEDS YOU) parent authority; children governed by IBX2 model + founder directive D-INBOX-FINAL.')
        if scr == 'activity':
            d.update(scope_note='Concordant with D-ACTIVITY-FINAL (DOMAIN x TIME); inspector added by directive.')
        if vp in ('tablet', 'desktop'):
            d['scope_note'] = ((d['scope_note'] or '') + ' Host chrome in this image is NOT literal (D-SHELL-CANON).').strip()
    elif code == 'HUBREF':
        vp = {'0af8bf87': 'desktop', 'c77b4b50': 'tablet', 'd89b8fd6': 'mobile'}[rel[:8]]
        d.update(family='HUB', route='hub', live_route=f'{P}', viewport=vp, status='CANONICAL',
                 approval='explicit: founder chat attachment for HUB.RECONSTRUCTION.OPUS1 ("approved HUB references", MEMORY 2026-10-03)',
                 scope_note='High-resolution render of the same design as T12 HUB (dHash distance <= 5).')
    elif code == 'HOSTREF':
        d.update(family='SHELL', route='host top strip (all Production tabs)', live_route=f'{P}/* (ProductionAuthorityFrame host strip)', viewport='mobile',
                 screen_type='SCREEN_AUTHORITY', state='host header', status='CANONICAL',
                 approval='explicit: founder chat attachment 2026-10-03 19:45 for the host header correction (top-nav OPUS1)')
    elif code == 'IA3V':
        fam = 'INBOX' if '/INBOX/' in rel else 'ACTIVITY'
        lens = stem.replace('-three-viewports', '').replace('inbox-', '').replace('activity-', '')
        if fam == 'INBOX':
            live = {'root': f'{P}/queue', 'approvals': f'{P}/queue (lens retired)', 'direct-messages': f'{P}/queue?view=messages',
                    'priority': f'{P}/queue (lens retired)', 'system': f'{P}/queue?view=system', 'approval-detail': f'{P}/queue?item=:id'}[lens]
            d.update(family='INBOX', route=f'inbox {lens}', live_route=live, viewport='desktop+tablet+mobile', screen_type='HYBRID_BOARD', state=lens,
                     status='SUPERSEDED', superseded_by='IBX2 (2026-10-03 23:21) STATE/TYPE model + PAR3V 01_INBOX + D-INBOX-FINAL',
                     supersession_rule='3 later supersession record (lifecycle model replaced priority/approvals/direct lenses) + 1 founder directive')
        else:
            live = {'root': f'{P}/activity', 'approvals': f'{P}/activity?view=approvals (legacy → CHANGE APPROVED)', 'blockers': f'{P}/activity?view=blockers (legacy → CHANGE BLOCKED)',
                    'comments': f'{P}/activity (lens retired)', 'updates': f'{P}/activity (lens retired)', 'milestone-detail': f'{P}/activity?sel=:id (inspector)'}[lens]
            d.update(family='ACTIVITY', route=f'activity {lens}', live_route=live, viewport='desktop+tablet+mobile', screen_type='HYBRID_BOARD', state=lens,
                     status='SUPERSEDED', superseded_by='PAR3V 11_ACTIVITY (DOMAIN x TIME) + D-ACTIVITY-FINAL',
                     supersession_rule='1 explicit founder approval (FOUNDER AUTHORITY: FINAL) + 3 later supersession record')
    elif code == 'IBX2':
        key = stem[3:]
        mp = {'inbox-root-needs-you': ('root', f'{P}/queue', 'CANONICAL', None),
              'watching': ('child', f'{P}/queue?view=watching', 'CONFLICTING', 'D-INBOX-FINAL'),
              'resolved': ('child', f'{P}/queue?view=resolved', 'CONFLICTING', 'D-INBOX-FINAL'),
              'all-inbox': ('child', f'{P}/queue?view=all', 'CONFLICTING', 'D-INBOX-FINAL'),
              'messages': ('child', f'{P}/queue?view=messages', 'CONFLICTING', 'D-INBOX-FINAL'),
              'system': ('child', f'{P}/queue?view=system', 'CONFLICTING', 'D-INBOX-FINAL'),
              'decision-detail': ('grandchild', f'{P}/queue?item=:id', 'CANONICAL', None),
              'message-thread': ('grandchild', f'{P}/queue?thread=:id', 'CANONICAL', None),
              'system-notice-detail': ('grandchild', f'{P}/queue?notice=:id', 'CANONICAL', None)}[key]
        d.update(family='INBOX', route=f'inbox {key}', live_route=mp[1], viewport='mobile', state=mp[0], status=mp[2],
                 approval='explicit pack README: "00 Inbox Root is the immutable parent authority"' if key.startswith('inbox-root') else 'pack README governing architecture')
        if mp[3]:
            d.update(superseded_by='D-INBOX-FINAL (presentation only)', supersession_rule='1 explicit founder approval (FOUNDER AUTHORITY: FINAL) overrides presentation; IBX2 still governs the STATE/TYPE model, copy and hierarchy',
                     scope_note='CONFLICTING, resolved by directive: stacked card presentation retired; model retained. Desktop/tablet pairs exist only as OpenArt CDN URLs (unresolved).')
        if key.startswith('inbox-root'):
            d['scope_note'] = 'Concordant with PAR3V 01_INBOX mobile (D-INBOX-ROOT).'
    elif code == 'PAR3V':
        scr = PARENT_FILES[stem]
        route, fam = SCREEN_ROUTE[scr]
        d.update(family=fam, route=scr, live_route=route, viewport='desktop+tablet+mobile', screen_type='HYBRID_BOARD', status='CANONICAL',
                 approval='explicit: README "consolidates the approved Production parent/root authorities"; compilation of T12 founder images (concordant)',
                 scope_note='Compilation board — does not replace the underlying T12 references. Adds the global no-scroll correction (D-PARENT-NOSCROLL).')
        if scr in ('experience', 'library'):
            d['scope_note'] += ' Route bodies superseded by the later EL pack; parent identity retained.'
    elif code == 'EXPR2':
        vpdir = rel.split('/')[-3]
        key = '/'.join(rel.split('/')[-2:]).rsplit('.', 1)[0]
        r = EXPR_FAMILY_SEG.get(key)
        d.update(family='EXPRESSION', route=f"expression {r['family']}/{r['id']}" if r else key, live_route=expr_href(r) if r else None,
                 viewport='mobile' if vpdir.startswith('01_MOBILE') else 'desktop+tablet', screen_type='SCREEN_AUTHORITY' if vpdir.startswith('01_MOBILE') else 'HYBRID_BOARD',
                 state=r['kind'] if r else None, status='CANONICAL',
                 approval='explicit: pack README viewport contract + ROUTE_PAIRING_AUDIT PASS (40/40); supersedes LITE_v1 (identical sampled content)')
    elif code == 'EL':
        top = rel.split('/')[-2] if '\\' not in rel else rel.split('/')[-2]
        parts = rel.replace('\\', '/').split('/')
        vpdir = [p for p in parts if re.match(r'0[1-4]_(EXPERIENCE|LIBRARY)_', p)][0]
        tab = 'experience' if 'EXPERIENCE' in vpdir else 'library'
        stem2 = parts[-2] + '__' + re.sub(r'\.(jpe?g|png)$', '', parts[-1], flags=re.I)
        r = EL_ROUTE.get((tab, stem2))
        d.update(family=tab.upper(), route=f"{tab} {r['family']}/{r['id']}" if r else stem2, live_route=realm_href(r) if r else None,
                 viewport='mobile' if 'MOBILE' in vpdir else 'desktop+tablet', screen_type='SCREEN_AUTHORITY' if 'MOBILE' in vpdir else 'HYBRID_BOARD',
                 state=r['kind'] if r else None, status='CANONICAL' if r else 'UNKNOWN',
                 approval='pack 00_README: compressed LITE references of the master authority ZIPs (masters = OpenArt CDN, not retrievable here)',
                 confidence='HIGH' if r else 'LOW')
    return d


# ── upload inventory ──────────────────────────────────────────────────────────────────────────────
inventory = []
seen_upload_blob = {}
upload_files = []
for blob, m in um.items():
    for f in m['files']:
        upload_files.append((f, blob, m))
# include non-image upload files (mov) explicitly
mov = UPLOAD_ROOT + 'f465f5d2-ScreenRecording_09-29-2026_09-47-38_1.mov'
mov_blob = subprocess.run(['git', 'hash-object', mov], capture_output=True, text=True).stdout.strip()
upload_files.append(('./f465f5d2-ScreenRecording_09-29-2026_09-47-38_1.mov', mov_blob, {'w': None, 'h': None, 'dh': None}))
upload_files.sort()
for f, blob, m in upload_files:
    rel = f[2:] if f.startswith('./') else f
    key = rel[:8]
    code, packname = PACKS[key]
    c = classify_upload(code, rel.replace('\\', '/'), m.get('w'), m.get('h'))
    inner = rel.split('/', 1)[1] if '/' in rel else rel
    aid = f"UP:{code}:{re.sub(r'[^A-Za-z0-9_.-]+', '/', inner.replace(chr(92), '/'))}"
    e = dict(authority_id=aid, filename=rel.replace('\\', '/').split('/')[-1], source_kind='UPLOAD', upload_pack=packname, upload_id=key,
             upload_path=rel.replace('\\', '/'), upload_date=up_times.get(key), repo_path=None, blob=blob,
             width=m.get('w'), height=m.get('h'), dhash=m.get('dh'), branch=None, commit_sha=None, commit_date=None, pr_number=None,
             **c)
    e['source_lineage'] = [f'founder upload {packname} ({up_times.get(key)})']
    e['_disk'] = '/tmp/fa/up/' + rel if not rel.endswith('.mov') else UPLOAD_ROOT + rel
    inventory.append(e)

# ── git inventory ─────────────────────────────────────────────────────────────────────────────────
OOS = [
    (r'^JURNL/', 'JURNL project (not Production)'), (r'^artifacts/jurnl-', 'JURNL QA (not Production)'),
    (r'^docs/site00/public-redesign/', 'public site redesign'), (r'^public/site00/public-redesign/', 'public site redesign'),
    (r'^docs/projects/astral-world/', 'Astral World project'), (r'^public/astral-world/', 'Astral World project'),
    (r'^public/site00/skins/', 'site skins'), (r'^public/site00/twin-', 'twin design benches (NDXBOOK twin pages)'),
    (r'^public/site00/projects/', 'Projects index'), (r'^public/site00/project-tabs/', 'Projects tabs'), (r'^public/site00/loader/', 'site loader'),
    (r'^public/site00/page-concept-generator/', 'page concept generator'), (r'^public/site00/ai-consoles/', 'AI consoles'),
    (r'^tests/fixtures/p0vr4r2/', 'Projects header fixture'), (r'^tests/fixtures/twin-', 'twin fixture'),
    (r'^public/visual-references/founder/site00/projects-index', 'Projects index reference'),
    (r'^tests/fixtures/visual-reconstruction/', 'legacy NDXBOOK workspace / experiments hub references (pre-Production apps)'),
    (r'^public/studio-world/design/capture-worker-test', 'capture worker test'), (r'^public/fixtures/', 'test fixtures'),
    (r'^site00-production-dist-.*\.zip$', 'deploy bundle'), (r'^public/site00/creative-direction/', 'NDXBOOK creative direction (twin benches)'),
    (r'^(public/)?visual-references/founder/ndxbook/', 'NDXBOOK founder workspace references (not Production)'),
    (r'^public/visual-references/founder/ndxbook', 'NDXBOOK founder workspace references (not Production)'),
    (r'^public/assets/ndxbook', 'NDXBOOK Entry 001 campaign assets (founder workspace)'),
]


def classify_git(path, blob):
    d = dict(family=None, route=None, live_route=None, state=None, viewport=None, screen_type=None, status=None, approval=None,
             superseded_by=None, supersession_rule=None, scope_note=None, confidence='HIGH')
    fn = path.split('/')[-1].lower()
    vp = 'mobile' if re.search(r'mobile|(^|[-_/])m\d{3}|390|393|360|430', path.lower()) else ('tablet' if 'tablet' in path.lower() else ('desktop' if 'desktop' in path.lower() else None))
    d['viewport'] = vp
    for rx, why in OOS:
        if re.search(rx, path):
            d.update(screen_type='OUT_OF_SCOPE', status='UNKNOWN', scope_note=why)
            return d
    if path.startswith('docs/site00/design-pack/sources/'):
        d.update(family='DESIGN', route='design system packs', live_route=f'{PS}/design', screen_type='SYSTEM_PACK_AUTHORITY', status='CANONICAL',
                 approval='byte-identical to DWS 05_SYSTEM_PACKS upload', viewport='n/a')
    elif path.startswith('docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1/authority/'):
        d.update(family='SHELL', route='bottom nav icon family', live_route=f'{P}/* bottom nav', screen_type='SYSTEM_PACK_AUTHORITY', status='CANONICAL',
                 approval='explicit: MEMORY 2026-10-02 "Founder approved the seven high-quality bottom-nav renders"', viewport='n/a')
    elif path.startswith('docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1/'):
        kind = path.split('/')[3]
        d.update(family='SHELL', route='bottom nav icon family', live_route=f'{P}/* bottom nav', viewport='n/a',
                 screen_type='CONTENT_AUTHORITY' if kind in ('masters', 'outputs') else 'LIVE_CAPTURE',
                 status='CANONICAL' if kind in ('masters', 'outputs') else 'UNKNOWN', approval='derived from approved family' if kind in ('masters', 'outputs') else None)
    elif path.startswith('docs/site00/bottom-nav/GROK_ICON_PACK/'):
        d.update(family='SHELL', route='bottom nav icon family', screen_type='GENERATED_IN_REVIEW', status='SUPERSEDED', viewport='n/a',
                 superseded_by='BOTTOM_NAV_ICON_FAMILY_V1 (founder approved 2026-10-02)', supersession_rule='1 explicit founder approval of the alternative')
    elif path.startswith('src/site00/components/productionHub/bottom-nav/'):
        d.update(family='SHELL', route='bottom nav icon family', live_route=f'{P}/* bottom nav', screen_type='CONTENT_AUTHORITY', status='CANONICAL',
                 approval='runtime copy of approved BOTTOM_NAV_ICON_FAMILY_V1 masters', viewport='n/a')
    elif path.startswith('public/site00/production-authority-assets/design-pack/'):
        d.update(family='DESIGN', route='design system assets', live_route=f'{PS}/design', screen_type='CONTENT_AUTHORITY', status='CANONICAL', viewport='n/a',
                 approval='extracted from the DWS 05_SYSTEM_PACKS (design OPUS3)')
    elif path.startswith('public/site00/production-authority-assets/shared/residents/'):
        d.update(family='EXPRESSION', route='resident media (registry)', live_route=f'{PS}/expression/casting · {P}/libraries/characters', screen_type='CONTENT_AUTHORITY',
                 status='SUPERSEDED', superseded_by='public/site00/studio-world-residents/casting-thumbnails-v1 (work look)', supersession_rule='1 founder-confirmed resident authority (D-ROSTER)',
                 scope_note='Still referenced by productionAssetRegistry for some surfaces; outdated for fabrication.', viewport='n/a')
    elif path.startswith('public/site00/production-authority-assets/'):
        d.update(family='SHELL', route='production plates (hero / atrium / vault / corridor)', live_route=f'{P}/*', screen_type='CONTENT_AUTHORITY', status='IN_REVIEW', viewport='n/a',
                 scope_note='GROK1 OpenArt plates in runtime use; no explicit founder approval recorded (COMPOSER1 lists them as "approved generated authority").')
    elif path.startswith('public/site00/production-hub/'):
        d.update(family='HUB', route='hub machine media', live_route=f'{P}?view=machine', screen_type='CONTENT_AUTHORITY', status='CANONICAL', viewport='n/a',
                 approval='crops from HUBPK authority screens (MEMORY 2026-09-30)', scope_note='LEGACY_LOCKED machine route only.')
    elif path.startswith('public/site00/character-fabrication/'):
        d.update(family='EXPRESSION', route='character fabrication media', live_route=f'{PS}/expression/character-fabrication', screen_type='CONTENT_AUTHORITY', viewport='n/a',
                 status='SUPERSEDED', superseded_by='resident-backed actors (casting-thumbnails-v1 + uniform regen) via fabricationSubjectResolver',
                 supersession_rule='3 later supersession record (MEMORY 2026-10-05 CF end-to-end resident wiring)', scope_note='Kept as Entry 002 fixture fallback (SW-017 stock roster).')
    elif path.startswith('public/site00/production-mobile/'):
        d.update(family='SHELL', route='stand-in plates', screen_type='CONTENT_AUTHORITY', status='SUPERSEDED', viewport='n/a',
                 superseded_by='approved authority imagery', supersession_rule='3 later supersession record (MEMORY 2026-09-29: stand-ins to be removed; 0 code references)')
    elif path.startswith('public/site00/studio-world-residents/casting-thumbnails-v1/'):
        d.update(family='EXPRESSION', route='resident portraits (work look)', live_route=f'{PS}/expression/casting/actors · {P}/libraries/characters', screen_type='CONTENT_AUTHORITY',
                 status='CANONICAL', approval='founder SW team pack / RECOVERY4 (D-ROSTER)', viewport='n/a')
    elif path.startswith('public/site00/studio-world-residents/season1-v1/'):
        d.update(family='EXPRESSION', route='resident season-1 natural identity', live_route=f'{P}/libraries/characters', screen_type='CONTENT_AUTHORITY',
                 status='CANONICAL', approval='season-1 visual authority (visualAuthority.ts)', scope_note='Natural full-body look; not the fabrication anchor.', viewport='n/a')
    elif path.startswith('public/site00/studio-world-residents/uniform-authority-v1/'):
        d.update(family='EXPRESSION', route='resident uniform authority', screen_type='CONTENT_AUTHORITY', status='CANONICAL', viewport='n/a',
                 approval='"founder uniform authorities" (MEMORY 2026-10-05 full-body uniform regen)')
    elif path.startswith('public/site00/studio-world-residents/geometry-complete-v1/'):
        d.update(family='EXPRESSION', route='resident geometry frames', live_route=f'{P}/libraries/characters/detail/:id', screen_type='GENERATED_IN_REVIEW', status='IN_REVIEW', viewport='n/a',
                 scope_note='GEOMETRY_COMPLETE_IN_REVIEW; anchors are copies of approved portrait + uniform regen.')
    elif path.startswith('artifacts/STUDIO_WORLD_RESIDENT_'):
        d.update(family='EXPRESSION', route='resident fabrication outputs', screen_type='GENERATED_IN_REVIEW', status='IN_REVIEW', viewport='n/a',
                 scope_note='OpenArt outputs awaiting founder review' + ('; filename carries an APPROVED marker (anchor copy)' if 'APPROVED' in path else ''))
    elif path.startswith('artifacts/studio-world-resident-authority-recovery4/'):
        d.update(family='EXPRESSION', route='resident authority lineage', screen_type='COMPARISON_SHEET', status='UNKNOWN', viewport='n/a')
    elif path.startswith('public/assets/expression-engine/entry-002/founder-storyboard/') or path.startswith('assets/founder-storyboard/'):
        d.update(family='EXPRESSION', route='Entry 002 storyboard (content)', live_route=f'{PS}/expression/storyboard', screen_type='CONTENT_AUTHORITY', status='CANONICAL', viewport='n/a',
                 approval='founder storyboard variants (founder-supplied)')
    elif path.startswith('public/assets/expression-engine/entry-002/final-cinematic-storyboard/'):
        d.update(family='EXPRESSION', route='Entry 002 final cinematic storyboard frames (content)', live_route=f'{PS}/expression/storyboard · {P} hub frames', screen_type='CONTENT_AUTHORITY',
                 status='CANONICAL', approval='named FINAL; referenced by finalCinematicStoryboardIds.ts + hub assets', viewport='n/a')
    elif path.startswith('public/assets/expression-engine/entry-002/pre-storyboard-authority/'):
        d.update(family='EXPRESSION', route='Entry 002 pre-storyboard (content)', screen_type='CONTENT_AUTHORITY', status='SUPERSEDED', viewport='n/a',
                 superseded_by='final-cinematic-storyboard', supersession_rule='3 later supersession record')
    elif path.startswith('public/assets/expression-engine/'):
        d.update(family='EXPRESSION', route='expression engine content', screen_type='CONTENT_AUTHORITY', status='UNKNOWN', viewport='n/a')
    elif path.startswith('public/visual-references/founder/site00/calibration-p0vr6r1/') or path.startswith('public/visual-references/founder/site00/skins-authority') or path.startswith('public/visual-references/founder/site00/design-workspace-reference'):
        sec = {'01': 'assets', '02': 'assets', '03': 'assets', '04': 'assets', '05': 'assets', '06': 'assets', '07': 'assets', '08': 'references', '09': 'pages', '10': 'history', '11': 'more'}
        stem = fn.split('.')[0]
        s = sec.get(stem[:2]) if 'calibration' in path else ('skins' if 'skins' in path else 'workspace')
        d.update(family='DESIGN', route=f'design workspace / {s}', live_route=f'{PS}/design/{s}', screen_type='SCREEN_AUTHORITY', state=stem,
                 viewport=vp or 'mobile', status='CANONICAL', approval='founder visual reference (public/visual-references/founder/site00, design reconstruction calibration)',
                 scope_note='Pre-relocation Projects→Design workspace sections, now mounted under Production design/* (COMPOSER1: design workspace child STALE vs chamber). Only recovered authority for these child routes.')
    elif re.match(r'^artifacts/production-authority-opus/(desktop|mobile|tablet)/\d\d-', path):
        d.update(screen_type='LIVE_CAPTURE', status='UNKNOWN', scope_note='OPUS1 live capture (not an authority copy: dHash distance 68–111 vs T12)')
    elif '/compare' in path or 'authority-vs' in path or 'compare-' in fn or 'before-after' in path or 'contact-sheet' in fn:
        d.update(screen_type='COMPARISON_SHEET', status='UNKNOWN')
        if path.startswith('artifacts/production-expression-authority-opus1/'):
            d['scope_note'] = 'Embeds STUDIOOS_EXPRESSION_AUTHORITY_LITE_v1 halves (v1 originals not in upload store; sampled identical to v2).'
    elif path.startswith('artifacts/') or path.startswith('docs/site00/studio-os/') or '/proof/' in path or '/PROOF/' in path:
        d.update(screen_type='LIVE_CAPTURE', status='UNKNOWN')
    elif path.startswith('docs/site00/'):
        d.update(screen_type='UNCLASSIFIED', status='UNKNOWN')
    else:
        d.update(screen_type='UNCLASSIFIED', status='UNKNOWN')
    for fam, rx in (('HUB', r'hub'), ('INBOX', r'inbox|queue'), ('DESIGN', r'design'), ('EXPERIENCE', r'experience'), ('EXPRESSION', r'expression|casting|storyboard|narrative|wardrobe'),
                    ('LIBRARY', r'librar'), ('ACTIVITY', r'activity')):
        if d['family'] is None and re.search(rx, path.lower()):
            d['family'] = fam
            break
    return d


by_blob_path = collections.OrderedDict()
for ev in sorted(events, key=lambda x: x['ct']):
    k = (ev['path'], ev['blob'])
    if ev['status'] == 'D':
        continue
    if k not in by_blob_path:
        by_blob_path[k] = ev
deleted = collections.defaultdict(list)
for ev in events:
    if ev['status'] == 'D':
        deleted[ev['path']].append(ev['sha'])

git_entries = []
for (path, blob), ev in by_blob_path.items():
    L = lin.get(ev['sha'], {})
    m = bm.get(blob, {})
    c = classify_git(path, blob)
    e = dict(authority_id=f'GIT:{path}@{blob[:10]}', filename=path.split('/')[-1], source_kind='GIT', upload_pack=None, upload_id=None, upload_path=None, upload_date=None,
             repo_path=path, blob=blob, width=m.get('w'), height=m.get('h'), dhash=m.get('dh'),
             branch=L.get('pr_head') or L.get('source_ref'), commit_sha=ev['sha'], commit_date=L.get('date'), pr_number=L.get('introducing_pr'),
             pr_state=L.get('pr_state'), on_main=L.get('on_main'), containing_branch_count=L.get('containing_branch_count'), deleted_in=deleted.get(path) or None,
             **c)
    e['source_lineage'] = [f"commit {ev['sha'][:8]} {L.get('date')} \"{L.get('subject','')[:90]}\"", f"PR #{L.get('introducing_pr')} ({L.get('attribution_method')})"]
    git_entries.append(e)

AUTH_TYPES = {'SCREEN_AUTHORITY', 'HYBRID_BOARD', 'INTERACTION_AUTHORITY', 'SYSTEM_PACK_AUTHORITY'}
CONTENT_TYPES = {'CONTENT_AUTHORITY', 'GENERATED_IN_REVIEW'}

# ── duplicate groups (exact blob + dHash near-duplicates across sources) ──────────────────────────
all_entries = inventory + git_entries
parent = {}


def find(x):
    while parent.setdefault(x, x) != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra


blob_members = collections.defaultdict(list)
for e in all_entries:
    if e['screen_type'] in AUTH_TYPES | CONTENT_TYPES:
        blob_members[e['blob']].append(e)
for b, mem in blob_members.items():
    for x in mem[1:]:
        union(mem[0]['authority_id'], x['authority_id'])
near = json.load(open(F + 'nearpairs.json'))
near_ok = []
for a, b, dist in near:
    if dist > 12:
        continue
    A, B = blob_members.get(a), blob_members.get(b)
    if not A or not B:
        continue
    # never group distinct files of the same upload pack (look-alike route screens) — only cross-source copies
    if A[0]['source_kind'] == 'UPLOAD' and B[0]['source_kind'] == 'UPLOAD' and A[0]['upload_pack'] == B[0]['upload_pack']:
        continue
    pa = (A[0]['repo_path'] or A[0]['upload_path'] or '')
    pb = (B[0]['repo_path'] or B[0]['upload_path'] or '')
    # same folder = sibling frames / icons / sheets of one set, never re-encoded copies
    if pa.rsplit('/', 1)[0] == pb.rsplit('/', 1)[0]:
        continue
    ida = set(re.findall(r'SW-0\d\d', pa)); idb = set(re.findall(r'SW-0\d\d', pb))
    if ida and idb and not (ida & idb):
        continue
    union(A[0]['authority_id'], B[0]['authority_id'])
    near_ok.append((a, b, dist))
groups = collections.defaultdict(list)
for e in all_entries:
    if e['screen_type'] in AUTH_TYPES | CONTENT_TYPES:
        groups[find(e['authority_id'])].append(e)
dup_groups = []
gi = 0
RANK = {'CANONICAL': 0, 'CONFLICTING': 1, 'IN_REVIEW': 2, 'UNKNOWN': 3, 'SUPERSEDED': 4}
for root, mem in groups.items():
    if len(mem) < 2:
        continue
    gi += 1
    gid = f'DG-{gi:04d}'
    blobs = {m['blob'] for m in mem}
    kind = 'EXACT' if len(blobs) == 1 else 'EXACT+NEAR' if any(len([x for x in mem if x['blob'] == b]) > 1 for b in blobs) else 'NEAR'

    def rk(m):
        return (RANK.get(m['status'], 5), 0 if m['source_kind'] == 'UPLOAD' else 1, -(m['width'] or 0) * (m['height'] or 0), m['upload_date'] or m['commit_date'] or '')
    rep = sorted(mem, key=rk)[0]
    for m in mem:
        m['duplicate_group'] = gid
    by_b = collections.defaultdict(list)
    for m in mem:
        by_b[m['blob']].append(m)
    for b, ms in by_b.items():
        ms = sorted(ms, key=rk)
        for m in ms[1:]:
            m['duplicate_of'] = ms[0]['authority_id']
    dup_groups.append(dict(group_id=gid, kind=kind, members=len(mem), unique_blobs=len(blobs), representative=rep['authority_id'],
                           representative_status=rep['status'], family=rep['family'], route=rep['route'],
                           member_ids=[m['authority_id'] for m in mem]))

# apply DUPLICATE status to exact secondary copies (same blob as representative, not the representative itself)
for e in all_entries:
    if e.get('duplicate_of'):
        e['status_before_dedupe'] = e['status']
        e['status'] = 'DUPLICATE'
for e in all_entries:
    e.setdefault('duplicate_group', None)
    e.setdefault('duplicate_of', None)

json.dump(dict(near_pairs_used=near_ok), open(F + 'near_used.json', 'w'))
pickle_out = dict(inventory=inventory, git_entries=git_entries, dup_groups=dup_groups)
json.dump(pickle_out, open(F + 'inv_stage1.json', 'w'))
print('uploads', len(inventory), 'git', len(git_entries), 'dup groups', len(dup_groups), 'near used', len(near_ok))
print(collections.Counter((e['source_kind'], e['screen_type']) for e in all_entries).most_common())
print(collections.Counter(e['status'] for e in all_entries if e['screen_type'] in AUTH_TYPES))
