#!/usr/bin/env python3
"""Email V2 benchmark — prepare editorial crops and the code-native slab monument.

Sources are the founder-approved DF-I01/I02/I03 plates from release df-v2-mass-cj-2026-10-11.
No OpenArt calls. No new artwork is generated; the slab is drawn in code and textured with
travertine cropped from DF-I03.
"""
from __future__ import annotations

import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "source" / "assets"
FONTS = HERE / "source" / "fonts"
CACHE = Path("/tmp/df-email-assets")
PLATES = CACHE / "SITE00_DF_V2_MASS_PRODUCTION_C-J" / "BATCH_I"
RELEASE = "df-v2-mass-cj-2026-10-11"

FONT_URLS = {
    400: "https://fonts.gstatic.com/s/sairasemicondensed/v15/U9MD6c-2-nnJkHxyCjRcnMHcWVWV1cWRRU8L.ttf",
    500: "https://fonts.gstatic.com/s/sairasemicondensed/v15/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXf_S8MW.ttf",
    600: "https://fonts.gstatic.com/s/sairasemicondensed/v15/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXfTTMMW.ttf",
    700: "https://fonts.gstatic.com/s/sairasemicondensed/v15/U9MM6c-2-nnJkHxyCjRcnMHcWVWV1cWRRXe3TcMW.ttf",
}

# (source plate, full-resolution box, role). Boxes keep baked plate typography out of frame.
CROPS = {
    "b01_door_tall": ("i01", (1400, 200, 1730, 1060), "CROPPED OBSERVATION"),
    "b01_door_band": ("i01", (1420, 330, 2780, 860), "CROPPED OBSERVATION (mobile)"),
    "b02_horizon": ("i03", (1300, 1175, 2290, 1580), "CLOSING IMAGE"),
    "b03_hero": ("i02", (735, 160, 2460, 755), "HERO"),
    "b03_hero_m": ("i02", (820, 160, 1600, 755), "HERO (mobile)"),
    "b03_place": ("i02", (380, 1235, 890, 1575), "SECTION ANCHOR"),
    "b03_feel": ("i02", (1330, 1235, 1840, 1575), "SECTION ANCHOR"),
    "b03_work": ("i02", (2400, 1235, 3420, 1575), "SECTION ANCHOR"),
    "b03_place_m": ("i02", (300, 1235, 980, 1575), "SECTION ANCHOR (mobile)"),
    "b03_feel_m": ("i02", (1300, 1235, 1980, 1575), "SECTION ANCHOR (mobile)"),
    "b03_rest": ("i02", (0, 1768, 1800, 2016), "TRANSITION"),
}
TRAVERTINE = ("i03", (150, 700, 600, 925))

PLATE_FILES = {
    "i01": "01_EDUCATION.png",
    "i02": "02_BLDR_JOURNEY.png",
    "i03": "03_POST_COMPLETION.png",
}


def ensure_plates() -> None:
    if all((PLATES / f).exists() for f in PLATE_FILES.values()):
        return
    CACHE.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["gh", "release", "download", RELEASE, "-p", "SITE00_DF_V2_BATCH_I.zip", "-D", str(CACHE), "--clobber"],
        check=True,
    )
    with zipfile.ZipFile(CACHE / "SITE00_DF_V2_BATCH_I.zip") as z:
        z.extractall(CACHE)


def ensure_fonts() -> None:
    FONTS.mkdir(parents=True, exist_ok=True)
    for weight, url in FONT_URLS.items():
        dest = FONTS / f"SairaSemiCondensed-{weight}.ttf"
        if dest.exists():
            continue
        cached = Path("/tmp/df-fonts") / dest.name
        if cached.exists():
            shutil.copy2(cached, dest)
        else:
            urllib.request.urlretrieve(url, dest)


def crop_all(plates: dict[str, Image.Image]) -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name, (key, box, _role) in CROPS.items():
        plates[key].crop(box).save(ASSETS / f"{name}.jpg", quality=88, optimize=True, progressive=True)


def _affine_to(texture: Image.Image, origin, u, v, size) -> Image.Image:
    """Map texture's unit square onto the parallelogram origin + s*u + t*v."""
    w, h = texture.size
    det = u[0] * v[1] - u[1] * v[0]
    # inverse of [[u0, v0], [u1, v1]] scaled to texture pixels
    a = v[1] / det * w
    b = -v[0] / det * w
    d = -u[1] / det * h
    e = u[0] / det * h
    c = -(a * origin[0] + b * origin[1])
    f = -(d * origin[0] + e * origin[1])
    return texture.transform(size, Image.AFFINE, (a, b, c, d, e, f), resample=Image.BICUBIC)


def _dashed(draw: ImageDraw.ImageDraw, p, q, dash, gap, fill, width) -> None:
    import math

    dx, dy = q[0] - p[0], q[1] - p[1]
    length = math.hypot(dx, dy)
    ux, uy = dx / length, dy / length
    pos = 0.0
    while pos < length:
        end = min(pos + dash, length)
        draw.line([(p[0] + ux * pos, p[1] + uy * pos), (p[0] + ux * end, p[1] + uy * end)], fill=fill, width=width)
        pos += dash + gap


def draw_slab(plates: dict[str, Image.Image]) -> None:
    """Foundation slab: drawn in blueprint line above, laid in travertine below."""
    S = 3
    W, H = 1040, 540
    img = Image.new("RGBA", (W * S, H * S), (255, 255, 255, 255))

    def P(x, y):
        return (x * S, y * S)

    ex, ey = (250, 144), (-250, 144)
    p0 = (520, 150)
    p1 = (p0[0] + ex[0], p0[1] + ex[1])
    p2 = (p0[0] + ex[0] + ey[0], p0[1] + ex[1] + ey[1])
    p3 = (p0[0] + ey[0], p0[1] + ey[1])
    t = 44
    lift = 112

    # ground shadow
    shadow = Image.new("L", img.size, 0)
    ImageDraw.Draw(shadow).polygon(
        [P(p1[0] + 10, p1[1] + t + 14), P(p2[0] + 6, p2[1] + t + 20), P(p3[0] - 6, p3[1] + t + 14), P(p0[0], p0[1] + t + 12)],
        fill=70,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(18 * S))
    img.paste(Image.new("RGBA", img.size, (40, 36, 30, 255)), (0, 0), shadow)

    d = ImageDraw.Draw(img)

    # faint isometric ground grid
    grid = (232, 230, 226, 255)
    for i in range(-6, 7):
        off = i * 46
        a0 = (p2[0] + off * 0.866 - 330 * 0.866, p2[1] + t + 6 + off * 0.5 + 330 * 0.5 - 60)
        _dashed(d, P(*a0), P(a0[0] + 520 * 0.866, a0[1] - 520 * 0.5), 3 * S, 5 * S, grid, max(1, S // 2))

    hair = (120, 120, 120, 255)
    # the drawing, hovering where the slab was planned; the laid slab is painted over it
    q = [(x, y - lift) for (x, y) in (p0, p1, p2, p3)]
    for a, b in ((0, 1), (1, 2), (2, 3), (3, 0)):
        _dashed(d, P(*q[a]), P(*q[b]), 7 * S, 5 * S, hair, max(1, int(1.1 * S)))
    for i, base in enumerate((p0, p1, p2, p3)):
        if i != 2:
            _dashed(d, P(*q[i]), P(*base), 3 * S, 5 * S, hair, max(1, S // 2))
        r = 3.2
        d.ellipse([P(q[i][0] - r, q[i][1] - r), P(q[i][0] + r, q[i][1] + r)], outline=hair, width=max(1, S // 2))

    # side faces
    left = [P(*p3), P(*p2), P(p2[0], p2[1] + t), P(p3[0], p3[1] + t)]
    right = [P(*p2), P(*p1), P(p1[0], p1[1] + t), P(p2[0], p2[1] + t)]
    d.polygon(left, fill=(226, 221, 213, 255))
    d.polygon(right, fill=(201, 195, 186, 255))

    # top face in travertine
    key, box = TRAVERTINE
    tex = plates[key].crop(box).convert("RGB")
    tex = tex.resize((tex.width * 2, tex.height * 2), Image.BICUBIC)
    top = _affine_to(tex, P(*p0), (ex[0] * S, ex[1] * S), (ey[0] * S, ey[1] * S), img.size)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([P(*p0), P(*p1), P(*p2), P(*p3)], fill=255)
    img.paste(top, (0, 0), mask)

    d = ImageDraw.Draw(img)
    ink = (24, 24, 24, 255)
    red = (217, 12, 12, 255)

    # crisp outlines of the laid slab
    d.line([P(*p0), P(*p1)], fill=ink, width=S)
    d.line([P(*p0), P(*p3)], fill=ink, width=S)
    d.line([P(p3[0], p3[1] + t), P(p2[0], p2[1] + t), P(p1[0], p1[1] + t)], fill=ink, width=S)
    d.line([P(*p3), P(p3[0], p3[1] + t)], fill=ink, width=S)
    d.line([P(*p1), P(p1[0], p1[1] + t)], fill=ink, width=S)
    d.line([P(*p2), P(p2[0], p2[1] + t)], fill=ink, width=S)
    # red leading edge
    d.line([P(*p3), P(*p2), P(*p1)], fill=red, width=int(2.6 * S))

    # dimension line along the left front edge
    off = 34
    a = (p3[0] - off * 0.5, p3[1] + t + off * 0.866)
    b = (p2[0] - off * 0.5, p2[1] + t + off * 0.866)
    d.line([P(*a), P(*b)], fill=hair, width=max(1, S // 2))
    for pt in (a, b):
        d.line([P(pt[0] - 5, pt[1] - 8), P(pt[0] + 5, pt[1] + 8)], fill=ink, width=S)
    d.line([P(p3[0], p3[1] + t + 4), P(a[0] - 4, a[1] + 6)], fill=hair, width=max(1, S // 2))
    d.line([P(p2[0], p2[1] + t + 4), P(b[0] - 4, b[1] + 6)], fill=hair, width=max(1, S // 2))

    # registration crosshair
    cx, cy = 168, 92
    d.line([P(cx - 13, cy), P(cx + 13, cy)], fill=red, width=int(1.4 * S))
    d.line([P(cx, cy - 13), P(cx, cy + 13)], fill=red, width=int(1.4 * S))

    final = img.convert("RGB").resize((W, H), Image.LANCZOS)
    final.save(ASSETS / "b02_slab.png", optimize=True)
    final.crop((136, 16, 828, H)).save(ASSETS / "b02_slab_m.png", optimize=True)


def main() -> None:
    ensure_plates()
    ensure_fonts()
    plates = {k: Image.open(PLATES / f).convert("RGB") for k, f in PLATE_FILES.items()}
    crop_all(plates)
    draw_slab(plates)
    for p in sorted(ASSETS.iterdir()):
        with Image.open(p) as im:
            print(f"{p.name:22s} {im.size[0]}x{im.size[1]}  {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
