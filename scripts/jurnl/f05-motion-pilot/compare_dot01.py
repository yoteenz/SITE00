#!/usr/bin/env python3
"""

F05 DOT 01 — runtime vs authority comparisons (37 states).

Captures are taken at 471 x 836, the authorities' own 9:16 aspect. There every DOT 01 page is full-bleed and the board
maps onto the authority one to one (u = 0.5, no side crop, no elastic insert), so the authority is simply scaled to
the capture. (On taller phones the runtime shares the extra height between the papers; that is a layout adaptation
and is not what these numbers measure.)

Metrics:
    MAD        mean absolute RGB difference, % of 255
    SSIM       grayscale structural similarity (Gaussian 11 px, sigma 1.5)
    ENV_MAD    MAD inside the environment band (board y < 560: statue, arch, seal, JURNL tag) — tells whether the
               environment behind the page is the authority's own render (SIDEKICK pairs 01, 02, 26) or a separate one

Outputs: <out>/<id>_compare.png (authority | runtime | difference) and <out>/dot01_fidelity.json.
Run with the scratch venv: python -I compare_dot01.py --authorities DIR --runtime DIR --out DIR
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

SRC_W, SRC_H, CROP_W, ENV_Y = 941, 1672, 881, 560

# state id → (authority file prefix, runtime capture stem, kind)  kind: parent | page | overlay
STATES = [
    ('01', '01_parent', 'parent'), ('02', '02_bank', 'page'), ('03', '03_ride', 'page'), ('04', '04_cash', 'page'),
    ('05', '05_visa', 'page'), ('06', '06_dir', 'page'), ('07', '07_hist', 'page'), ('08', '08_ride_hist', 'page'),
    ('09', '09_cash_hist', 'page'), ('10', '10_visa_hist', 'page'), ('11', '11_detail', 'page'), ('12', '12_settings', 'page'),
    ('13', '13_review', 'page'), ('14', '14_add', 'overlay'), ('15', '15_edit', 'overlay'), ('16', '16_record', 'overlay'),
    ('17', '17_addcash', 'overlay'), ('18', '18_cashspend', 'overlay'), ('19', '19_cardpurchase', 'overlay'),
    ('20', '20_cardpay', 'overlay'), ('21', '21_purposes', 'overlay'), ('22', '22_empty', 'page'), ('23', '23_adjust', 'overlay'),
    ('24', '24_correct', 'overlay'), ('25', '25_archive_confirm', 'overlay'), ('26', '26_capture', 'overlay'),
    ('27', '27_scanning', 'overlay'), ('28', '28_reviewread', 'overlay'), ('29', '29_duplicate', 'overlay'),
    ('30', '30_setup', 'overlay'), ('31', '31_all', 'page'), ('32', '32_reorder', 'page'), ('33', '33_review', 'overlay'),
    ('34', '34_failure', 'overlay'), ('35', '35_attention', 'page'), ('36', '36_blocked', 'overlay'), ('37', '37_confirm', 'overlay'),
]
ALIGNED = {'01': 'SK01', '02': 'SK02', '26': 'SK03'}


def ssim_map(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a = a.astype(np.float64)
    b = b.astype(np.float64)
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    g = lambda x: cv2.GaussianBlur(x, (11, 11), 1.5)
    ma, mb = g(a), g(b)
    va, vb, cov = g(a * a) - ma * ma, g(b * b) - mb * mb, g(a * b) - ma * mb
    return ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2))


def mapped_authority(auth: np.ndarray, W: int, H: int, mode: str):
    """The authority as the runtime places its board at this size; returns (image, mask, env_mask)."""
    u = min(W / CROP_W, H / SRC_H)
    extra = max(0.0, H / u - SRC_H)
    if extra > 2:
        raise SystemExit(f'capture {W}x{H} is taller than 9:16; capture the comparisons at 471x836')
    bw, bh = int(round(SRC_W * u)), int(round(SRC_H * u))
    scaled = cv2.resize(auth, (bw, bh), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((H, W, 3), np.uint8)
    mask = np.zeros((H, W), bool)
    x0 = int(round((W - bw) / 2))
    sx0, dx0 = max(0, -x0), max(0, x0)
    w, h = min(bw - sx0, W - dx0), min(bh, H)
    canvas[:h, dx0 : dx0 + w] = scaled[:h, sx0 : sx0 + w]
    mask[:h, dx0 : dx0 + w] = True
    env = np.zeros((H, W), bool)
    env[: int(round(ENV_Y * u)), :] = True
    return canvas, mask, env & mask


def label(img: np.ndarray, text: str) -> np.ndarray:
    out = img.copy()
    cv2.rectangle(out, (0, 0), (out.shape[1], 22), (24, 18, 12), -1)
    cv2.putText(out, text, (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 228, 205), 1, cv2.LINE_AA)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--authorities', required=True)
    ap.add_argument('--runtime', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    auth_dir = Path(a.authorities)
    rows = []
    for sid, stem, mode in STATES:
        auth_file = next(auth_dir.glob(f'{sid}_*.webp'))
        run_file = next(Path(a.runtime).glob(f'{stem}-*.png'))
        rt = cv2.imread(str(run_file), cv2.IMREAD_COLOR)
        au = cv2.imread(str(auth_file), cv2.IMREAD_COLOR)
        H, W = rt.shape[:2]
        mapped, mask, env = mapped_authority(au, W, H, mode)
        diff = np.abs(mapped.astype(np.int16) - rt.astype(np.int16)).astype(np.uint8)
        mad = float(diff[mask].mean() / 255 * 100)
        env_mad = float(diff[env].mean() / 255 * 100) if env.any() else None
        s = ssim_map(cv2.cvtColor(mapped, cv2.COLOR_BGR2GRAY), cv2.cvtColor(rt, cv2.COLOR_BGR2GRAY))
        ssim = float(s[mask].mean())
        heat = cv2.applyColorMap(cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY) * 2, cv2.COLORMAP_INFERNO)
        heat[~mask] = (40, 40, 40)
        sheet = np.hstack([label(mapped, f'AUTHORITY {sid}'), label(rt, 'RUNTIME'), label(heat, f'DIFF MAD {mad:.1f}% SSIM {ssim:.2f}')])
        cv2.imwrite(str(out / f'{sid}_compare.png'), sheet)
        rows.append({'id': sid, 'authority': auth_file.name, 'runtime': run_file.name, 'mode': mode, 'viewport': f'{W}x{H}', 'mad_pct': round(mad, 2), 'ssim': round(ssim, 3), 'env_mad_pct': None if env_mad is None else round(env_mad, 2), 'sidekick_pair': ALIGNED.get(sid)})
    (out / 'dot01_fidelity.json').write_text(json.dumps({'method': __doc__.strip().splitlines()[0], 'states': rows}, indent=2))
    for r in rows:
        print(f"{r['id']} {r['mode']:7s} MAD {r['mad_pct']:5.1f}%  SSIM {r['ssim']:.3f}  ENV {r['env_mad_pct']}  {r['sidekick_pair'] or ''}")


if __name__ == '__main__':
    main()
