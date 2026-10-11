"""ENTRY v2 live QA: score each live capture (393×699 @ authority proportions) against its authority, in the 1008×1792 frame.
PLATE_CROP     plate registration of capture → authority (SIFT affine on the whole frame), error in CSS px on a 393 phone:
               100 − 10·err_css (1 frame px = 0.39 CSS px).
OBJECT_ALIGN   every measured live line: |Δcentre| between capture ink and authority ink (frame px): 100 − 4·mean.
TYPOGRAPHY     cap height and width ratio, live / authority, per line: 100 − 200·mean(|1−r|).
COMPOSITION    0.5·OBJECT_ALIGN + 0.3·PLATE_CROP + 0.2·(100·structural similarity of gradient maps).
Ink is read from image − plate (type on paper and walls) or from the image itself (type on controls), the same way for
authority and capture.

  <venv with numpy, opencv> python scripts/jurnl/entry-v2/qa_score.py <captures>  → JSON on stdout
"""
import sys, json
import os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np, cv2
import measure as M
import os
PLATES = os.path.join(HERE, '..', '..', '..', 'src/projects/jurnl/families/F01_ENTRY/ENTRY_V2/plates')
def plate(page):
    return cv2.resize(cv2.imread(f'{PLATES}/ENTRY_V2_{M.PAGES[page][0]}_PLATE.jpg', cv2.IMREAD_GRAYSCALE), (FW, FH), interpolation=cv2.INTER_AREA)
def live(img, page):
    # The live layer alone: the image minus its plate (the plate's texture never counts as ink).
    return np.clip(255 - cv2.GaussianBlur(cv2.absdiff(img, plate(page)), (3, 3), 0).astype(np.int32) * 2, 0, 255).astype(np.uint8)
from geometry import SURFACES, FW, FH
CAP = sys.argv[1]  # folder of ref_<SCREEN>.png captures at 393 × 699 (capture.mjs)
def load_cap(page):
    return cv2.resize(cv2.imread(f'{CAP}/ref_{M.PAGES[page][0]}.png', cv2.IMREAD_GRAYSCALE), (FW, FH), interpolation=cv2.INTER_AREA)
def warp(img, page, surf):
    return img.astype(float) if surf is None else cv2.warpPerspective(img, SURFACES[page][surf], (FW, FH), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP).astype(float)
def inkbox(a, box, mode, frac=0.45, minthr=10):
    # The measurement's own ink test (scripts/jurnl/entry-v2/measure.py ink), applied to authority and capture alike.
    x0, y0, x1, y1 = box
    r = a[y0:y1, x0:x1]; bg = np.median(r)
    d = (bg - r) if mode == 'dark' else (r - bg)
    thr = max(minthr, frac * np.percentile(d, 99.7))
    ys, xs = np.nonzero(d > thr)
    if not len(xs):
        raise ValueError('no ink')
    return np.array([x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1], float)
def grad(a):
    a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 1.2)
    return cv2.magnitude(cv2.Sobel(a, cv2.CV_32F, 1, 0), cv2.Sobel(a, cv2.CV_32F, 0, 1))
def ssim(x, y):
    x = cv2.resize(x, (504, 896)).astype(np.float64); y = cv2.resize(y, (504, 896)).astype(np.float64)
    C1, C2 = (0.01 * x.max()) ** 2, (0.03 * x.max()) ** 2
    mu = lambda z: cv2.GaussianBlur(z, (11, 11), 1.5)
    mx, my = mu(x), mu(y); sx = mu(x * x) - mx * mx; sy = mu(y * y) - my * my; sxy = mu(x * y) - mx * my
    return float((((2 * mx * my + C1) * (2 * sxy + C2)) / ((mx * mx + my * my + C1) * (sx + sy + C2))).mean())
# Type printed on a control (its fill differs from the plate, so plate subtraction cannot isolate it).
ON_CONTROL = {'signIn', 'resend'}
out = {}
for page, rows in M.TYPE.items():
    auth = M.authority(page); cap = load_cap(page)
    s = cv2.SIFT_create(5000); ka, da = s.detectAndCompute(auth, None); kc, dc = s.detectAndCompute(cap, None)
    m = cv2.BFMatcher().knnMatch(dc, da, k=2); good = [x for x, y in m if x.distance < 0.7 * y.distance]
    src = np.float32([kc[g.queryIdx].pt for g in good]); dst = np.float32([ka[g.trainIdx].pt for g in good])
    A, inl = cv2.estimateAffinePartial2D(src, dst, ransacReprojThreshold=2.0)
    sc = np.hypot(A[0, 0], A[1, 0]); plate_err = max(abs(sc - 1) * FW, abs(A[0, 2]), abs(A[1, 2]))
    plate_score = max(0.0, 100 - 10 * plate_err * 393 / FW)
    dists, ratios = [], []
    for (iid, text, fam, w, surf, box, align, mode) in rows:
        try:
            if mode == 'light' or iid in ON_CONTROL:
                a = inkbox(warp(auth, page, surf), box, mode, minthr=22); c = inkbox(warp(cap, page, surf), box, mode, minthr=22)
            else:
                a = inkbox(warp(live(auth, page), page, surf), box, 'dark'); c = inkbox(warp(live(cap, page), page, surf), box, 'dark')
        except Exception:
            continue
        dists.append(float(np.hypot(((a[0] + a[2]) - (c[0] + c[2])) / 2, ((a[1] + a[3]) - (c[1] + c[3])) / 2)))
        ratios += [(c[3] - c[1]) / (a[3] - a[1]), (c[2] - c[0]) / (a[2] - a[0])]
    align_err = float(np.mean(dists)); align = max(0.0, 100 - 4 * align_err)
    typo = max(0.0, 100 - 200 * float(np.mean([abs(1 - r) for r in ratios])))
    st = ssim(grad(auth), grad(cap))
    comp = 0.5 * align + 0.3 * plate_score + 0.2 * 100 * st
    out[M.PAGES[page][0]] = {'COMPOSITION_MATCH': round(comp), 'TYPOGRAPHY_MATCH': round(typo), 'OBJECT_ALIGNMENT': round(align), 'PLATE_CROP': round(plate_score),
                             'raw': {'plate_err_px': round(plate_err, 2), 'line_centre_err_px_mean': round(align_err, 2), 'line_centre_err_px_max': round(max(dists), 2), 'lines': len(dists), 'type_ratio_dev_mean': round(float(np.mean([abs(1 - r) for r in ratios])), 4), 'gradient_ssim': round(st, 3)}}
print(json.dumps(out, indent=1))
