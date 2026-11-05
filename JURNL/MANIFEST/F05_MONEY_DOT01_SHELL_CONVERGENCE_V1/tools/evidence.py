"""Build OPUS3 visual evidence: 37 triptychs, 06 count sheets, 03-05 / 06 / 22 expanded comparisons, lifted layers."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
SP = '/tmp/claude-0/-home-user/334ce893-7840-52d9-a9d4-209cc4b29b39/scratchpad'; O3 = f'{SP}/o3'
REPO = '/home/user/SITE00'; MAN = f'{REPO}/JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1/evidence'
FULL = f'{O3}/full_evidence'
AUTH = f'{SP}/o2/auth_png'
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18); FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    F = FS = ImageFont.load_default()
names = {r['id']: r['name'] for r in map(json.loads, open(f'{O3}/after/metrics-after.jsonl'))}
cmp = json.load(open(f'{O3}/cmp/compare.json'))
def auth(sid):
    return Image.open([f'{AUTH}/{f}' for f in os.listdir(AUTH) if f.startswith(sid + '_')][0]).convert('RGB')
def panel(ims, labels, w, title=None, notes=None):
    ims = [im.convert('RGB').resize((w, round(w * im.height / im.width)), Image.LANCZOS) for im in ims]
    H = max(i.height for i in ims); top = 34 if title else 0
    out = Image.new('RGB', (len(ims) * (w + 12) + 12, H + top + 34 + (22 if notes else 0)), (245, 240, 230)); d = ImageDraw.Draw(out)
    if title: d.text((12, 8), title, font=F, fill=(20, 20, 20))
    for i, (im, l) in enumerate(zip(ims, labels)):
        x = 12 + i * (w + 12); out.paste(im, (x, top + 26)); d.text((x, top + 4), l, font=FS, fill=(40, 30, 20))
    if notes: d.text((12, H + top + 32), notes, font=FS, fill=(60, 40, 30))
    return out
def save(im, path, q=82):
    os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, 'WEBP', quality=q, method=6); return os.path.getsize(path)
tot = 0
# 1. 37 triptychs (FULL) + a contact sheet (repo)
thumbs = []
for sid in sorted(names):
    b, a = f'{O3}/before/{sid}-471x836.png', f'{O3}/after/{sid}-471x836.png'
    ims = [auth(sid)] + [Image.open(p) for p in (b, a) if os.path.exists(p)]
    c = cmp.get(sid, {})
    note = ''
    if c.get('before') and c.get('after'):
        note = f"edge recall {c['before']['edge_recall']} → {c['after']['edge_recall']} · mean |Δ| {c['before']['mean_abs_diff']} → {c['after']['mean_abs_diff']} (471 × 836, unmasked)"
    p = panel(ims, ['AUTHORITY (V9 PNG)', 'BEFORE d6992b3fc', 'AFTER'][:len(ims)], 420, f'{sid} {names[sid]}', note)
    save(p, f'{FULL}/37_triptychs/{sid}_AUTHORITY_BEFORE_AFTER.webp')
    thumbs.append(panel(ims, ['A', 'B', 'AFTER'][:len(ims)], 150, f'{sid}'))
cols = 6; tw, th = thumbs[0].width, max(t.height for t in thumbs)
sheet = Image.new('RGB', (cols * tw, ((len(thumbs) + cols - 1) // cols) * th), (245, 240, 230))
for i, t in enumerate(thumbs): sheet.paste(t, ((i % cols) * tw, (i // cols) * th))
tot += save(sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS), f'{MAN}/37_CONTACT_SHEET_AUTHORITY_BEFORE_AFTER.webp', 70)
save(sheet, f'{FULL}/37_CONTACT_SHEET_FULLSIZE.webp', 80)
# 2. 06 counts: before / after per count at 393x852, 471x836, 393x660 (DSF 2)
for vp in ['393x852', '471x836', '393x660']:
    ims, labels = [auth('06')], ['AUTHORITY 06']
    for n in [0, 1, 2, 3, 4, 5, 7]:
        ims.append(Image.open(f'{O3}/after_counts/06-n{n}-{vp}.png')); labels.append(f'AFTER · {n} pocket' + ('s' if n != 1 else ''))
    tot += save(panel(ims, labels, 300, f'06 ALL ACCOUNTS · real pocket counts · {vp} · AFTER', 'synthetic worlds: first N records of the `many` world; 0 = authority 22 EMPTY ACCOUNTS'), f'{MAN}/06_counts/06_COUNTS_AFTER_{vp}.webp', 78)
    ims, labels = [auth('06')], ['AUTHORITY 06']
    for n in [0, 1, 2, 3, 4, 5, 7]:
        ims.append(Image.open(f'{O3}/before_counts/06-n{n}-{vp}.png')); labels.append(f'BEFORE · {n}')
    if vp != '471x836' or True:
        tot += save(panel(ims, labels, 300, f'06 ALL ACCOUNTS · BEFORE (d6992b3fc) · {vp}', 'founder-reported defect reproduced: olive void, missing landscape, generic strip'), f'{MAN}/06_counts/06_COUNTS_BEFORE_{vp}.webp', 78)
    for n in [0, 1, 2, 3, 4, 5, 7]:
        for lab, d in (('BEFORE', 'before_counts'), ('AFTER', 'after_counts')):
            save(Image.open(f'{O3}/{d}/06-n{n}-{vp}.png'), f'{FULL}/06_counts/{lab}_06_n{n}_{vp}.webp', 86)
# 3. 06 / 22 expanded: authority vs before vs after, large (DSF 2)
for sid, n in (('06', 4), ('22', 0)):
    for vp in ['471x836', '393x852', '393x660']:
        tot += save(panel([auth(sid), Image.open(f'{O3}/before_counts/06-n{n}-{vp}.png'), Image.open(f'{O3}/after_counts/06-n{n}-{vp}.png')], ['AUTHORITY (V9 PNG 941 × 1672)', 'BEFORE d6992b3fc', 'AFTER'], 520, f'{sid} {names[sid]} · {vp} · DSF 2 · {n} pockets'), f'{MAN}/{sid}/{sid}_AUTHORITY_BEFORE_AFTER_{vp}.webp', 84)
# 4. 03 / 04 / 05 expanded (unchanged this sprint: before = after on the tunnel base)
for sid in ['03', '04', '05']:
    for vp in ['471x836', '393x852']:
        tot += save(panel([auth(sid), Image.open(f'{O3}/hi_after/{sid}-{vp}.png')], ['AUTHORITY (V9 PNG)', 'RUNTIME (tunnel base = after; unchanged this sprint)'], 560, f'{sid} {names[sid]} · {vp} · DSF 2'), f'{MAN}/03_04_05/{sid}_AUTHORITY_VS_RUNTIME_{vp}.webp', 84)
# 5. lifted layers review
L = f'{REPO}/src/projects/jurnl/families/F05_MONEY/DOT01/SCENES'
lay = Image.new('RGB', (1900, 1180), (64, 80, 52)); d = ImageDraw.Draw(lay)
pos = {'CARD06_BANK': (10, 30), 'CARD06_PAYOUT': (470, 30), 'CARD06_CASH': (10, 300), 'CARD06_CREDIT': (470, 300), 'ACTION06_ADD': (10, 580), 'ACTION06_REORDER': (470, 580), 'ICON06_ADD': (10, 760), 'ICON06_REORDER': (130, 760), 'SEAL_22': (260, 740)}
for k, xy in pos.items():
    im = Image.open(f'{L}/F05_DOT01_{k}.webp').convert('RGBA'); lay.paste(im, xy, im); d.text((xy[0], xy[1] - 18), k, font=FS, fill=(250, 240, 220))
b22 = Image.open(f'{L}/F05_DOT01_SCENE_22.webp').convert('RGBA'); b22 = b22.resize((b22.width * 1100 // b22.height, 1100)); lay.paste(b22, (960, 40), b22); d.text((960, 14), 'SCENE_22 (band 552–1540, text-free)', font=FS, fill=(250, 240, 220))
tot += save(lay, f'{MAN}/layers/LIFTED_LAYERS_06_22.webp', 86)
print('repo evidence bytes', tot)
