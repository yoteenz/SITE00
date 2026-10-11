"""ENTRY v2 surfaces: the physical objects live UI is printed on, as 3×3 maps from surface space to the authority frame.

Frame: the authority at 1008 × 1792 (half of the 2016 × 3584 source). A surface's own space keeps its left edge where the
authority has it; everything drawn on the surface is laid out there and mapped into the frame by H (CSS matrix3d).
  - ROT: a sheet or slip lying at an angle (rotation about a pivot).
  - H: a standing card seen slightly from the side (homography fitted to edges measured on the authority).
"""
import numpy as np

FW, FH = 1008, 1792


def rot(deg, px, py):
    t = np.radians(deg)
    c, s = np.cos(t), np.sin(t)
    T1 = np.array([[1, 0, -px], [0, 1, -py], [0, 0, 1.0]])
    R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
    T2 = np.array([[1, 0, px], [0, 1, py], [0, 0, 1.0]])
    return T2 @ R @ T1


def homography(pairs):
    """Least-squares DLT: pairs of ((sx, sy) surface, (ax, ay) authority)."""
    A = []
    for (x, y), (u, v) in pairs:
        A.append([-x, -y, -1, 0, 0, 0, u * x, u * y, u])
        A.append([0, 0, 0, -x, -y, -1, v * x, v * y, v])
    _, _, Vt = np.linalg.svd(np.array(A, float))
    H = Vt[-1].reshape(3, 3)
    return H / H[2, 2]


def flat(xs_left, xs_right, rows):
    """Correspondences for a surface whose horizontal edges were measured as (y at left x, y at right x) pairs."""
    pairs = []
    for yl, yr in rows:
        pairs.append(((xs_left, yl), (xs_left, yl)))
        pairs.append(((xs_right, yl), (xs_right, yr)))
    return pairs


# Measured on the authorities (scripts/jurnl/entry-v2/README.md): line fits, button edges, text skew.
SURFACES = {
    'benefits': {
        # Angles from fitted text baselines on each slip.
        'olive': rot(8.8, 530, 450),
        'slip1': rot(3.3, 510, 690),
        'slip2': rot(-2.2, 520, 890),
        'slip3': rot(0.0, 500, 1095),
        'slip4': rot(-4.3, 470, 1295),
    },
    'begin': {
        # GET STARTED top / bottom and SIGN IN top / bottom edges at x 490 and 735.
        'card': homography(flat(490, 735, [(1213, 1220), (1281, 1292), (1302, 1315), (1370, 1385.5)])),
    },
    'create': {
        # The four field rules rise 1.80–1.82° to the right; the sheet is turned that much.
        'sheet': rot(-1.82, 530, 900),
    },
    'signin': {
        # EMAIL and PASSWORD rules and the SIGN IN button's top and bottom edges at x 320 and 810.
        'card': homography(flat(320, 810, [(914.7, 917.2), (1030.0, 1033.4), (1088, 1094), (1206, 1215)])),
    },
}


def css_matrix3d(H):
    h = H / H[2, 2]
    vals = [h[0, 0], h[1, 0], 0, h[2, 0], h[0, 1], h[1, 1], 0, h[2, 1], 0, 0, 1, 0, h[0, 2], h[1, 2], 0, h[2, 2]]
    return 'matrix3d(' + ', '.join(f'{v:.8g}' for v in vals) + ')'
