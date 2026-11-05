"""Board | before | after evidence for the eight global overlays.
Run: python -I tools/build_board_evidence.py <board_panels_dir> <before_dir> <after_dir>   (from the manifest folder's repo root)
board_panels_dir holds 01..08.png cropped from the founder board (cols (18,364)(378,715)(728,1070)(1083,1432), rows (140,600)(644,1058));
before_dir holds 0N-393x852.png at DSF 1; after_dir holds 0N-<vp>.png at DSF 2 for the four viewports."""
import glob, os, sys
from PIL import Image, ImageDraw
BOARD, BEFORE, AFTER = sys.argv[1:4]
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
NAMES = {'01': 'MONEY ACTION SHEET', '02': 'ADD A POCKET', '03': 'MOVE MONEY', '04': 'MANAGE POCKET', '05': 'SEARCH DRAWER', '06': 'ACCOUNT / SETTINGS DRAWER', '07': 'ARCHIVE BLOCKED CAUTION', '08': 'GLOBAL MENU DRAWER'}
VPS = ('360x780', '393x660', '393x852', '430x932')
INK = (240, 230, 200); BG = (24, 22, 16)
for d in ('compare', 'responsive', 'parts'):
    os.makedirs(f'{M}/evidence/{d}', exist_ok=True)
H = 852
for n, name in NAMES.items():
    b = Image.open(f'{BOARD}/{n}.png').convert('RGB'); b = b.resize((int(b.width * H * 0.62 / b.height), int(H * 0.62)), Image.LANCZOS)
    bf = Image.open(f'{BEFORE}/{n}-393x852.png').convert('RGB')
    af = Image.open(f'{AFTER}/{n}-393x852.png').convert('RGB').resize((393, 852), Image.LANCZOS)
    W = Image.new('RGB', (b.width + 393 * 2 + 40, H + 34), BG); d = ImageDraw.Draw(W)
    W.paste(b, (10, 34)); W.paste(bf, (b.width + 20, 34)); W.paste(af, (b.width + 393 + 30, 34))
    d.text((10, 8), f'{n} {name} — BOARD (authority)', fill=INK); d.text((b.width + 20, 8), 'BEFORE (393 x 852)', fill=INK); d.text((b.width + 393 + 30, 8), 'AFTER (393 x 852)', fill=INK)
    W.save(f'{M}/evidence/compare/{n}_board_before_after.webp', quality=84)
    ims = [Image.open(f'{AFTER}/{n}-{vp}.png').convert('RGB') for vp in VPS]
    ims = [i.resize((int(i.width * 700 / i.height), 700), Image.LANCZOS) for i in ims]
    W = Image.new('RGB', (sum(i.width + 8 for i in ims), 724), BG); d = ImageDraw.Draw(W); x = 0
    for i, vp in zip(ims, VPS):
        W.paste(i, (x, 24)); d.text((x + 4, 6), f'{n} · {vp}', fill=INK); x += i.width + 8
    W.save(f'{M}/evidence/responsive/{n}_four_viewports.webp', quality=80)
tiles = []
for n in NAMES:
    b = Image.open(f'{BOARD}/{n}.png').convert('RGB'); b = b.resize((int(b.width * 420 / b.height), 420), Image.LANCZOS)
    a = Image.open(f'{AFTER}/{n}-393x852.png').convert('RGB'); a = a.resize((int(a.width * 560 / a.height), 560), Image.LANCZOS)
    t = Image.new('RGB', (b.width + a.width + 18, 590), BG); d = ImageDraw.Draw(t); t.paste(b, (6, 26)); t.paste(a, (b.width + 12, 26)); d.text((6, 6), f'{n} {NAMES[n]}  board | after', fill=INK); tiles.append(t)
rows = [tiles[:4], tiles[4:]]
W = Image.new('RGB', (max(sum(t.width for t in r) for r in rows), 590 * 2), BG); y = 0
for r in rows:
    x = 0
    for t in r:
        W.paste(t, (x, y)); x += t.width
    y += 590
W.save(f'{M}/evidence/ALL_EIGHT_board_vs_after.webp', quality=82)
fs = sorted(glob.glob(os.path.join(M, '../../../src/projects/jurnl/families/F05_MONEY/EDITORIAL/F05_ED_*.webp')))
cells = []
for f in fs:
    im = Image.open(f).convert('RGBA'); s = min(1, 220 / im.height, 300 / im.width); im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))))
    c = Image.new('RGBA', (310, 250), (46, 70, 46, 255)); c.alpha_composite(im, ((310 - im.width) // 2, 24 + (226 - im.height) // 2)); ImageDraw.Draw(c).text((4, 4), os.path.basename(f)[7:-5], fill=(255, 255, 255)); cells.append(c)
cols = 6; rr = (len(cells) + cols - 1) // cols
S = Image.new('RGB', (cols * 312, rr * 252), (20, 20, 20))
for i, c in enumerate(cells):
    S.paste(c.convert('RGB'), ((i % cols) * 312, (i // cols) * 252))
S.save(f'{M}/evidence/parts/F05_ED_PARTS_contact_sheet.webp', quality=86)
print('evidence written')
