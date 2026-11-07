# The regenerated screen candidates are crops of generated boards (REVIEW_STATUS.json): some carry a thin light crop border.
# This measures, per side, how many outer pixel lines are near-white (not art) and prints the clip-path inset that hides
# them (percent of the art), so a shell can be shown without its crop line. Nothing is repainted.
# Run: python3 -I scripts/jurnl/global-menu/measure_shell_borders.py <png> [<png> ...]
import sys, json
import numpy as np
from PIL import Image
out = {}
for p in sys.argv[1:]:
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.int32)
    H, W, _ = a.shape
    light = (a.min(axis=2) >= 225)  # near-white, neutral: a crop border, not painted paper
    def run(lines):
        n = 0
        for line in lines:
            if line.mean() < 0.6: break
            n += 1
        return n
    t = run(light[i] for i in range(min(40, H)))
    b = run(light[H - 1 - i] for i in range(min(40, H)))
    l = run(light[:, i] for i in range(min(40, W)))
    r = run(light[:, W - 1 - i] for i in range(min(40, W)))
    pct = lambda n, d: round(100 * (n + (1 if n else 0)) / d, 3)  # one extra line for the anti-aliased edge
    out[p.split('/')[-1]] = {'size': [W, H], 'px': {'top': t, 'right': r, 'bottom': b, 'left': l},
                             'inset': f'inset({pct(t, H)}% {pct(r, W)}% {pct(b, H)}% {pct(l, W)}%)'}
print(json.dumps(out, indent=1))
