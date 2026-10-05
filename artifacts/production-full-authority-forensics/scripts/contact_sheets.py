"""Phase 3 forensic contact sheets: candidates side by side per family / route / viewport, labelled with
source, date, viewport and status. Writes JPEGs to artifacts/production-full-authority-forensics/contact-sheets/."""
import json, os, re, collections, subprocess, io
from PIL import Image, ImageDraw, ImageFont

OUT = '/home/user/fa-wt/artifacts/production-full-authority-forensics/contact-sheets'
os.makedirs(OUT, exist_ok=True)
s = json.load(open('/tmp/fa/inv_final.json'))
inv = [e for e in s['inventory'] if e['status'] != 'DUPLICATE']
git = s['git_entries']
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
FONTB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
FONTT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
COL = {'CANONICAL': (0, 130, 60), 'SUPERSEDED': (150, 150, 150), 'CONFLICTING': (210, 30, 30), 'IN_REVIEW': (200, 120, 0), 'UNKNOWN': (90, 90, 90), 'DUPLICATE': (120, 120, 200)}


def fit(t, w):
    while t and FONT.getlength(t) > w - 4:
        t = t[:-2]
    return t


def load(e):
    if e.get('_disk'):
        return Image.open(e['_disk']).convert('RGB')
    data = subprocess.run(['git', '-C', '/home/user/SITE00', 'cat-file', '-p', e['blob']], capture_output=True).stdout
    return Image.open(io.BytesIO(data)).convert('RGB')


def sheet(name, title, items, cell_h=260, max_w=2400, note=None):
    """items: list of entries (inventory dicts). Laid out left→right, wrapping."""
    cells = []
    for e in items:
        try:
            im = load(e)
        except Exception as ex:  # noqa
            continue
        r = cell_h / im.height
        w = max(120, int(im.width * r))
        if w > 900:
            r = 900 / im.width
            w = 900
        im = im.resize((w, int(im.height * r)))
        lab1 = f"{e.get('upload_pack') and e['upload_pack'].replace('.zip','')[:34] or e['repo_path'][:40]}"
        when = (e.get('upload_date') or e.get('commit_date') or '')[:16].replace('T', ' ')
        lab2 = f"{e['viewport'] or ''} · {when}"
        lab3 = e['filename'][:44]
        cells.append((im, lab1, lab2, lab3, e['status'], e))
    if not cells:
        return None
    pad, lab_h = 14, 64
    rows, row, x = [], [], pad
    for c in cells:
        if row and x + c[0].width + pad > max_w:
            rows.append(row)
            row, x = [], pad
        row.append(c)
        x += c[0].width + pad
    if row:
        rows.append(row)
    W = min(max_w, max(sum(c[0].width + pad for c in r) + pad for r in rows))
    head = 70 + (22 if note else 0)
    H = head + sum(max(c[0].height for c in r) + lab_h + pad for r in rows)
    img = Image.new('RGB', (W, H), (246, 246, 246))
    d = ImageDraw.Draw(img)
    d.text((pad, 14), title, font=FONTT, fill=(20, 20, 20))
    d.text((pad, 44), 'FORENSIC CONTACT SHEET · candidates side by side · status per supersession analysis (authority-lineage.json)', font=FONT, fill=(120, 120, 120))
    if note:
        d.text((pad, 64), note[:220], font=FONT, fill=(180, 20, 20))
    y = head
    for r in rows:
        x = pad
        rh = max(c[0].height for c in r)
        for im, l1, l2, l3, st, e in r:
            img.paste(im, (x, y))
            col = COL.get(st, (60, 60, 60))
            d.rectangle([x - 2, y - 2, x + im.width + 1, y + im.height + 1], outline=col, width=3)
            d.rectangle([x, y + rh + 4, x + 112, y + rh + 22], fill=col)
            d.text((x + 4, y + rh + 5), st, font=FONTB, fill='white')
            d.text((x, y + rh + 24), fit(l1, im.width), font=FONT, fill=(30, 30, 30))
            d.text((x, y + rh + 38), fit(l2, im.width), font=FONT, fill=(90, 90, 90))
            d.text((x, y + rh + 52), fit(l3, im.width), font=FONT, fill=(90, 90, 90))
            x += im.width + pad
        y += rh + lab_h + pad
    path = f'{OUT}/{name}.jpg'
    img.save(path, quality=62, optimize=True)
    return path


def pick(**kw):
    out = []
    for e in inv + [g for g in git if g['screen_type'] in ('SCREEN_AUTHORITY', 'SYSTEM_PACK_AUTHORITY')]:
        ok = True
        for k, v in kw.items():
            val = e.get(k)
            if callable(v):
                if not v(e):
                    ok = False
            elif isinstance(v, (list, tuple, set)):
                if val not in v:
                    ok = False
            elif val != v:
                ok = False
        if ok:
            out.append(e)
    return out


VP_ORDER = {'desktop': 0, 'desktop+tablet+mobile': 0, 'desktop+tablet': 1, 'tablet': 2, 'tablet-landscape': 2, 'tablet-portrait': 3, 'mobile': 4, 'n/a': 5}


def order(es):
    return sorted(es, key=lambda e: (e.get('upload_date') or e.get('commit_date') or '', VP_ORDER.get(e['viewport'] or '', 9), e['filename']), reverse=False)


made = []
# shell
made.append(sheet('00-shell-host-and-nav', 'SHELL · host top strip + bottom-nav icon family',
                  pick(family='SHELL'), note='Tablet/desktop host chrome: D-SHELL-CANON text override governs over image chrome.'))
# hub
made.append(sheet('01-hub-root', 'HUB · /production root',
                  order(pick(family='HUB', live_route='/production') + pick(upload_pack='SITE00_Mobile_Projects_and_Production_Reference_Pack.zip', route='hub')),
                  note='HUBREF (2026-10-03) == T12 HUB at higher resolution (dHash <= 5) == PAR3V 00_HUB compilation.'))
made.append(sheet('02-hub-machine-legacy', 'HUB · /production?view=machine (LEGACY_LOCKED) · HUB AUTHORITY PACK FINAL 00–14',
                  order(pick(upload_pack='SITE00_PRODUCTION_HUB_AUTHORITY_PACK_FINAL.zip')), cell_h=360))
# inbox
made.append(sheet('03-inbox-root', 'INBOX · /production/queue · NEEDS YOU root',
                  order(pick(family='INBOX', live_route='/production/queue'))))
made.append(sheet('04-inbox-children', 'INBOX · children (watching / resolved / all / messages / system) + retired lenses',
                  order(pick(family='INBOX', state=['child', 'priority', 'approvals', 'direct-messages', 'system']))),
                  )
made.append(sheet('05-inbox-grandchildren', 'INBOX · grandchildren (decision / thread / notice detail)',
                  order(pick(family='INBOX', state=['grandchild', 'approval-detail']))))
# design modes
for mode in ('brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'):
    es = [e for e in pick(family='DESIGN') if e['live_route'] and e['live_route'].endswith(f'mode={mode}') and e['screen_type'] != 'INTERACTION_AUTHORITY']
    made.append(sheet(f'06-design-{mode}', f'DESIGN · {mode.upper()} mode · /production/:slug/design?mode={mode}', order(es)))
made.append(sheet('07-design-interactions-and-system-packs', 'DESIGN · interaction expressions + system packs (DWS 04/05)',
                  order(pick(family='DESIGN', screen_type=['INTERACTION_AUTHORITY', 'SYSTEM_PACK_AUTHORITY'])), cell_h=320))
made.append(sheet('08-design-workspace-sections', 'DESIGN · workspace child sections (design/references|assets|pages|skins|history|more|workspace)',
                  order(pick(family='DESIGN', screen_type='SCREEN_AUTHORITY', source_kind='GIT')), cell_h=360))
made.append(sheet('08b-design-root-legacy', 'DESIGN · legacy mobile reference (superseded)',
                  pick(upload_pack='SITE00_Mobile_Projects_and_Production_Reference_Pack.zip', family='DESIGN')))
# experience + library parents + families
for tab in ('experience', 'library'):
    T = tab.upper()
    par = order(pick(family=T, upload_pack=['Production_3_Viewports_12_Tabs_SONNET_LITE.zip', 'STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1.zip', 'SITE00_Mobile_Projects_and_Production_Reference_Pack.zip']))
    root_auth = '01_World__01_WORLD_ROOT' if tab == 'experience' else '01_Authorities__01_AUTHORITIES_ROOT'
    roots = [e for e in pick(family=T, upload_pack='STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip') if e['route'].endswith('/root') and (('world/' in e['route']) if tab == 'experience' else ('authorities/' in e['route']))]
    made.append(sheet(f'{"09" if tab=="experience" else "14"}-{tab}-parent', f'{T} · tab root (parent authorities vs EL family root)', par + roots,
                      note='Parent identity: T12 / PAR3V. Route body: EL (2026-10-04 15:37, latest).'))
    fams = collections.OrderedDict()
    for e in pick(family=T, upload_pack='STUDIOOS_EXPERIENCE_LIBRARY_AUTHORITY_LITE.zip'):
        fam = e['route'].split(' ', 1)[1].split('/')[0]
        fams.setdefault(fam, []).append(e)
    for i, (fam, es) in enumerate(fams.items(), 1):
        es = sorted(es, key=lambda e: (e['filename'], 0 if e['viewport'] == 'desktop+tablet' else 1))
        made.append(sheet(f'{"10" if tab=="experience" else "15"}-{tab}-{i:02d}-{fam}', f'{T} · {fam.upper()} family ({len(es)//2} routes · desktop/tablet hybrid + mobile)', es, cell_h=260, max_w=2600))
# expression
made.append(sheet('11-expression-parent', 'EXPRESSION · /production/:slug/expression root (Production Floor)',
                  order(pick(family='EXPRESSION', live_route='/production/:slug/expression'))))
fams = collections.OrderedDict()
for e in pick(family='EXPRESSION', upload_pack='STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2.zip'):
    fam = e['route'].split(' ', 1)[1].split('/')[0]
    fams.setdefault(fam, []).append(e)
legacy = pick(family='EXPRESSION', upload_pack=['SITE00_Mobile_Projects_and_Production_Reference_Pack.zip', 'NDXBOOK_Narrative_Engine_Screen_Pack.zip'])
FAM_LEG = {'narrative': ['narrative root', 'narrative-momentum (NME widget, expression engine)'], 'casting': ['casting root'], 'look': ['look + wardrobe root'],
           'performance': ['performance root'], 'sets': ['sets + scenes root'], 'review': ['review + handoff root']}
for i, (fam, es) in enumerate(fams.items(), 1):
    es = sorted(es, key=lambda e: (e['upload_path'].split('/')[-1], 0 if e['viewport'] == 'desktop+tablet' else 1))
    leg = [e for e in legacy if e['route'] in FAM_LEG.get(fam, [])]
    made.append(sheet(f'12-expression-{i:02d}-{fam}', f'EXPRESSION · {fam.upper()} family (EXPR2 hybrid + mobile; legacy superseded at end)', es + leg, cell_h=280, max_w=2600))
made.append(sheet('13-expression-character-fabrication', 'EXPRESSION · CHARACTER FABRICATION (CF authority, mobile only)',
                  sorted(pick(upload_pack='SITE00_Character_Fabrication_Authority_Expressions.zip'), key=lambda e: e['filename']), cell_h=360,
                  note='No tablet / desktop CF authority recovered (RESPONSIVE_VARIANT_MISSING).'))
# activity
made.append(sheet('16-activity', 'ACTIVITY · /production/activity', order(pick(family='ACTIVITY')),
                  note='D-ACTIVITY-FINAL (DOMAIN x TIME, FOUNDER AUTHORITY: FINAL) governs; IA3V lens boards superseded.'))
made = [m for m in made if m]
tot = sum(os.path.getsize(m) for m in made)
print(len(made), 'sheets', round(tot / 1e6, 2), 'MB')
json.dump([os.path.basename(m) for m in made], open('/tmp/fa/sheets.json', 'w'))
