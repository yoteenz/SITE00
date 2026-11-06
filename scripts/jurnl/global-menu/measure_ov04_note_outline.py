# The regenerated OV04 MANAGE POCKET note is opaque (REVIEW_STATUS.json: "not yet isolated with genuine alpha"): its note,
# paperclip and oxblood sit on a dark olive ground. This measures — it does not repaint — the outline of everything that is
# not that ground, row by row, and prints it as a CSS clip-path polygon (percentages of the art), so the popover shows the
# note's own torn silhouette over the blurred page instead of a dark rectangle. Pixels inside the outline are untouched.
# Run: python3 -I scripts/jurnl/global-menu/measure_ov04_note_outline.py <OV04_MANAGE_POCKET.png> [rows]
import sys, json
import numpy as np
from PIL import Image
src = sys.argv[1]; ROWS = int(sys.argv[2]) if len(sys.argv) > 2 else 90
a = np.asarray(Image.open(src).convert('RGB')).astype(np.int32)
H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# the file has a thin white border (about 6 px): it is not art and is outside the outline. The ground is sampled just
# inside the four corners.
B = 9
corners = np.concatenate([a[B:B + 24, B:B + 24].reshape(-1, 3), a[B:B + 24, -B - 24:-B].reshape(-1, 3), a[-B - 24:-B, B:B + 24].reshape(-1, 3), a[-B - 24:-B, -B - 24:-B].reshape(-1, 3)])
gl = corners.mean(0)
lum = 0.299 * r + 0.587 * g + 0.114 * b
glum = 0.299 * gl[0] + 0.587 * gl[1] + 0.114 * gl[2]
fg = (lum > glum + 38) | ((r - g) > 28)  # paper / clip are much lighter; the oxblood is red-dominant; shadow is darker ground
fg[:B, :] = False; fg[-B:, :] = False; fg[:, :B] = False; fg[:, -B:] = False
# fill small holes / specks per row: a row's extent is its first and last run of >= 6 foreground pixels
def extent(row):
    xs = np.flatnonzero(row)
    if xs.size < 6: return None
    # first / last index that starts a run of 6
    run = np.convolve(row.astype(int), np.ones(6, int), 'valid') >= 6
    idx = np.flatnonzero(run)
    if idx.size == 0: return None
    return int(idx[0]), int(idx[-1] + 5)
ys = np.linspace(0, H - 1, ROWS).round().astype(int)
rows = {}
for y in ys:
    e = extent(fg[y])
    if e: rows[int(y)] = e
# the top and bottom edges are traced by column (the paperclip makes the top concave: rows alone would bridge it)
x0 = min(e[0] for e in rows.values()); x1 = max(e[1] for e in rows.values())
cols = {}
for x in np.linspace(x0, x1, ROWS).round().astype(int):
    e = extent(fg[:, x])
    if e: cols[int(x)] = e
ry = sorted(rows); cx = sorted(cols)
top = [(x, cols[x][0]) for x in cx]
right = [(rows[y][1], y) for y in ry if cols[cx[-1]][0] < y < cols[cx[-1]][1]]
bottom = [(x, cols[x][1]) for x in reversed(cx)]
left = [(rows[y][0], y) for y in reversed(ry) if cols[cx[0]][0] < y < cols[cx[0]][1]]
pts = top + right + bottom + left
pct = [f'{100 * x / W:.2f}% {100 * y / H:.2f}%' for x, y in pts]
top = min(p[1] for p in pts); bottom = max(p[1] for p in pts)
print(json.dumps({'size': [W, H], 'ground_rgb': [round(v) for v in gl], 'rows': len(left), 'top': top / H, 'bottom': bottom / H, 'polygon': 'polygon(' + ', '.join(pct) + ')'}))
