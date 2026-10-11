#!/usr/bin/env python3
"""Email V2 R2 — art-directed crops and code-native graphics for the nine territories.

Sources: the approved DF-I01/I02/I03 plates (release df-v2-mass-cj-2026-10-11). No OpenArt calls.
Every graphic here is either a new crop of an approved plate or drawn in code.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import prepare_assets as r1  # noqa: E402

OUT = HERE / "assets"
INK = (20, 20, 20)
RED = (217, 12, 12)
HAIR = (150, 148, 144)
FAINT = (205, 202, 196)

# (plate, full-resolution box). Boxes keep baked plate typography out of frame.
CROPS = {
    "a_glass_spine": ("i01", (1640, 260, 1790, 1040)),
    "b_wall": ("i01", (1205, 250, 1560, 1040)),
    "b_view": ("i01", (1600, 215, 2150, 1045)),
    "b_view_m": ("i01", (1560, 330, 2700, 1045)),
    "b_stair": ("i01", (150, 1210, 1140, 1590)),
    "m_travertine": ("i03", (150, 700, 600, 925)),
    "c_seam": ("i03", (640, 200, 2000, 1010)),
    "x_glass_bar": ("i02", (995, 175, 1115, 690)),
    "x_hero": ("i02", (735, 160, 2460, 755)),
    "x_hero_m": ("i02", (820, 160, 1600, 755)),
    "s_far": ("i02", (735, 330, 2760, 760)),
    "s_door": ("i01", (1590, 215, 2140, 1045)),
    "s_inside": ("i02", (1300, 1235, 1880, 1575)),
    "s_work": ("i02", (2400, 1235, 3420, 1575)),
    "u_sketch": ("i02", (2560, 820, 3345, 1050)),
    "u_rest": ("i02", (0, 1768, 1800, 2016)),
}


def crops(plates: dict[str, Image.Image]) -> None:
    for name, (key, box) in CROPS.items():
        plates[key].crop(box).save(OUT / f"{name}.jpg", quality=86, optimize=True, progressive=True)
    wall = Image.open(OUT / "b_wall.jpg")
    ImageOps.mirror(wall).save(OUT / "b_wall_r.jpg", quality=86, optimize=True, progressive=True)


def drawn_from_photo(img: Image.Image) -> Image.Image:
    """Render a photograph as an ink line drawing on white: the plan before it was built."""
    g = img.convert("L").filter(ImageFilter.GaussianBlur(1.4))
    edges = g.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges, cutoff=2)
    lines = edges.point(lambda v: 255 if v > 58 else int(v * 2.6))
    lines = ImageOps.invert(lines)
    paper = Image.new("RGB", img.size, (255, 255, 255))
    ink = Image.new("RGB", img.size, (52, 56, 62))
    return Image.composite(paper, ink, lines)


def seam_pair() -> None:
    """B02-C: the same frame, drawn above the datum and built below it."""
    photo = Image.open(OUT / "c_seam.jpg").convert("RGB")
    w, h = photo.size
    cut = int(h * 0.52)
    drawn = drawn_from_photo(photo)
    tint = Image.new("RGB", drawn.size, (255, 255, 255))
    mask = Image.new("L", drawn.size, 0)
    md = ImageDraw.Draw(mask)
    red_glass = (430, 0, 640, cut)
    md.rectangle(red_glass, fill=255)
    redwash = Image.blend(drawn, Image.new("RGB", drawn.size, RED), 0.18)
    drawn = Image.composite(redwash, drawn, mask)
    del tint
    drawn.crop((0, 0, w, cut)).save(OUT / "c_drawn.jpg", quality=88, optimize=True)
    photo.crop((0, cut, w, h)).save(OUT / "c_built.jpg", quality=88, optimize=True)


def _iso_slab(img, d, origin, ex, ey, t, tex, S, red_edge=False):
    P = lambda x, y: (x * S, y * S)  # noqa: E731
    p0 = origin
    p1 = (p0[0] + ex[0], p0[1] + ex[1])
    p2 = (p1[0] + ey[0], p1[1] + ey[1])
    p3 = (p0[0] + ey[0], p0[1] + ey[1])
    d.polygon([P(*p3), P(*p2), P(p2[0], p2[1] + t), P(p3[0], p3[1] + t)], fill=(228, 223, 215))
    d.polygon([P(*p2), P(*p1), P(p1[0], p1[1] + t), P(p2[0], p2[1] + t)], fill=(203, 197, 188))
    top = r1._affine_to(tex, P(*p0), (ex[0] * S, ex[1] * S), (ey[0] * S, ey[1] * S), img.size)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([P(*p0), P(*p1), P(*p2), P(*p3)], fill=255)
    img.paste(top, (0, 0), mask)
    d = ImageDraw.Draw(img)
    for a, b in ((p0, p1), (p0, p3)):
        d.line([P(*a), P(*b)], fill=INK, width=S)
    d.line([P(p3[0], p3[1] + t), P(p2[0], p2[1] + t), P(p1[0], p1[1] + t)], fill=INK, width=S)
    for p in (p1, p2, p3):
        d.line([P(*p), P(p[0], p[1] + t)], fill=INK, width=S)
    if red_edge:
        d.line([P(*p3), P(*p2), P(*p1)], fill=RED, width=int(2.4 * S))
    return d


def stepped_monument(plates) -> None:
    """B02-A: three courses of travertine, stepped like a plinth. The top course carries the red edge."""
    S = 3
    W, H = 1280, 600
    img = Image.new("RGB", (W * S, H * S), (255, 255, 255))
    tex = plates["i03"].crop((150, 700, 600, 925)).convert("RGB")
    tex = tex.resize((tex.width * 2, tex.height * 2), Image.BICUBIC)

    cx = 640
    courses = [(470, 52), (360, 48), (250, 46)]
    hw0, t0 = courses[0]
    top = H - 34 - hw0 - t0

    shadow = Image.new("L", img.size, 0)
    ImageDraw.Draw(shadow).polygon(
        [((cx + hw0 + 30) * S, (top + hw0 / 2 + t0 + 20) * S), (cx * S, (top + hw0 + t0 + 30) * S),
         ((cx - hw0 - 10) * S, (top + hw0 / 2 + t0 + 16) * S), (cx * S, (top + t0 + 10) * S)],
        fill=80,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22 * S))
    img.paste(Image.new("RGB", img.size, (60, 54, 46)), (0, 0), shadow)
    d = ImageDraw.Draw(img)

    tops = []
    for i, (hw, t) in enumerate(courses):
        d = _iso_slab(img, d, (cx, top), (hw, hw / 2), (-hw, hw / 2), t, tex, S, red_edge=(i == len(courses) - 1))
        tops.append(top)
        if i + 1 < len(courses):
            nhw, nt = courses[i + 1]
            top = top + hw / 2 - nt - nhw / 2
    # vertical dimension: the height the three courses raise the ground
    x0 = cx + hw0 + 40
    ya, yb = tops[-1] + courses[-1][0] / 2, H - 34 - hw0 / 2
    d.line([(x0 * S, ya * S), (x0 * S, yb * S)], fill=HAIR, width=S)
    for yy in (ya, yb):
        d.line([((x0 - 8) * S, (yy + 8) * S), ((x0 + 8) * S, (yy - 8) * S)], fill=INK, width=S)
    final = img.resize((W, H), Image.LANCZOS)
    final.save(OUT / "a_monument.png", optimize=True)
    final.crop((120, 0, 1160, H)).save(OUT / "a_monument_m.png", optimize=True)


def strata_section() -> None:
    """B02-B: a section through the ground, five strata, each one a stage. Row height 76px at 1x."""
    S = 2
    row = 76
    W, H = 260, row * 5 + 24
    img = Image.new("RGB", (W * S, H * S), (255, 255, 255))
    d = ImageDraw.Draw(img)
    x0, x1 = 24, 236

    def band(i):
        top = 12 + i * row
        return top, top + row

    # top to bottom: 05 verification (marble), 04 devices, 03 dns, 02 email, 01 domain (ground)
    order = [5, 4, 3, 2, 1]
    for i, stage in enumerate(order):
        t, b = band(i)
        box = [x0 * S, t * S, x1 * S, b * S]
        if stage == 5:
            d.rectangle(box, fill=(246, 244, 239))
            for k in range(0, 260, 18):
                d.line([((x0 + k) * S, (t + 12) * S), ((x0 + k + 40) * S, (t + 30) * S)], fill=(222, 218, 210), width=S)
        elif stage == 4:
            for yy in range(t + 8, b, 10):
                d.line([(x0 * S, yy * S), (x1 * S, yy * S)], fill=(176, 172, 166), width=1)
        elif stage == 3:
            for k in range(-row, x1 - x0, 12):
                d.line([((x0 + k) * S, b * S), ((x0 + k + row) * S, t * S)], fill=(170, 166, 160), width=S)
            for k in range(-row, x1 - x0, 12):
                d.line([((x0 + k) * S, t * S), ((x0 + k + row) * S, b * S)], fill=(205, 201, 195), width=1)
        elif stage == 2:
            for yy in range(t + 9, b - 4, 14):
                for xx in range(x0 + (7 if (yy // 14) % 2 else 0), x1, 14):
                    d.ellipse([(xx) * S, (yy) * S, (xx + 3) * S, (yy + 3) * S], fill=(150, 146, 140))
        else:
            for yy in range(t + 6, b, 6):
                for xx in range(x0 + (yy % 12), x1, 12):
                    d.point((xx * S, yy * S), fill=(120, 116, 110))
        d.rectangle(box, outline=INK, width=S)
    t0, _ = band(0)
    d.line([(x0 * S, t0 * S), (x1 * S, t0 * S)], fill=RED, width=3 * S)
    # break lines at both sides
    for x in (x0, x1):
        d.line([(x * S, (12 + row * 5) * S), (x * S, (H - 2) * S)], fill=HAIR, width=1)
    img.resize((W, H), Image.LANCZOS).save(OUT / "b_strata.png", optimize=True)


def _plan(d, ox, oy, s, rooms, red, ink, width, fill_alpha):
    for (x, y, w, h) in rooms:
        d.rectangle([ox + x * s, oy + y * s, ox + (x + w) * s, oy + (y + h) * s], outline=ink, width=width)
    x, y, w, h = red
    d.rectangle([ox + x * s, oy + y * s, ox + (x + w) * s, oy + (y + h) * s], fill=(217, 12, 12, fill_alpha), outline=RED + (255,), width=width)


def superimposed_plans() -> None:
    """B03-C: three possible plans drawn on the same site, one over another."""
    S = 3
    W, H = 1280, 760
    base = Image.new("RGBA", (W * S, H * S), (255, 255, 255, 255))
    s = 7 * S
    ox, oy = 330 * S, 150 * S
    # A gallery, B courtyard, C open hall: same footprint, three organisations
    plans = [
        ([(0, 0, 30, 22), (30, 0, 26, 22), (56, 0, 30, 22), (0, 22, 86, 32)], (30, 0, 26, 22), (-40, -26)),
        ([(0, 0, 86, 54), (0, 0, 22, 54), (64, 0, 22, 54), (22, 40, 42, 14)], (26, 12, 34, 24), (0, 0)),
        ([(0, 0, 86, 54), (0, 0, 86, 12), (62, 12, 24, 42)], (6, 18, 50, 30), (40, 26)),
    ]
    tones = [(178, 176, 172, 255), (120, 118, 114, 255), (36, 36, 36, 255)]
    alphas = [0, 0, 46]
    for (rooms, red, (dx, dy)), tone, a in zip(plans, tones, alphas):
        layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        _plan(ld, ox + dx * S * 2, oy + dy * S * 2, s, rooms, red, tone, int(1.3 * S), a)
        base = Image.alpha_composite(base, layer)
    d = ImageDraw.Draw(base)
    # site boundary, dashed
    bx0, by0, bx1, by1 = 150 * S, 50 * S, 1130 * S, 700 * S
    for (p, q) in (((bx0, by0), (bx1, by0)), ((bx1, by0), (bx1, by1)), ((bx1, by1), (bx0, by1)), ((bx0, by1), (bx0, by0))):
        r1._dashed(d, p, q, 14 * S, 9 * S, (120, 118, 114, 255), S)
    for (x, y) in ((bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)):
        d.line([(x - 12 * S, y), (x + 12 * S, y)], fill=RED + (255,), width=int(1.3 * S))
        d.line([(x, y - 12 * S), (x, y + 12 * S)], fill=RED + (255,), width=int(1.3 * S))
    out = base.convert("RGB").resize((W, H), Image.LANCZOS)
    out.save(OUT / "u_plans.png", optimize=True)
    out.crop((120, 30, 1160, 730)).resize((780, 525), Image.LANCZOS).save(OUT / "u_plans_m.png", optimize=True)


def station_maps() -> None:
    """B03-B: a small plan with the reader's position, one per station."""
    S = 3
    W, H = 132, 96
    stations = [(14, 78), (58, 70), (66, 40), (104, 28)]
    for i in range(4):
        img = Image.new("RGB", (W * S, H * S), (255, 255, 255))
        d = ImageDraw.Draw(img)
        g = (175, 172, 166)
        d.rectangle([30 * S, 14 * S, 124 * S, 74 * S], outline=INK, width=S)
        d.line([(30 * S, 44 * S), (84 * S, 44 * S)], fill=g, width=S)
        d.line([(84 * S, 14 * S), (84 * S, 74 * S)], fill=g, width=S)
        d.line([(54 * S, 74 * S), (66 * S, 74 * S)], fill=(255, 255, 255), width=2 * S)
        path = stations[: i + 1]
        for a, b in zip(path, path[1:]):
            r1._dashed(d, (a[0] * S, a[1] * S), (b[0] * S, b[1] * S), 3 * S, 3 * S, HAIR, S)
        for j, (x, y) in enumerate(stations):
            r = 3.4 if j == i else 1.8
            fill = RED if j == i else (j < i and (120, 118, 114) or (205, 202, 196))
            d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=fill)
        img.resize((W, H), Image.LANCZOS).save(OUT / f"s_map_{i + 1}.png", optimize=True)


def perforation() -> None:
    """B01-A: the tear line of the reply card."""
    S = 2
    W, H = 640, 18
    img = Image.new("RGB", (W * S, H * S), (250, 249, 246))
    d = ImageDraw.Draw(img)
    for x in range(6, W, 12):
        d.ellipse([(x - 2.2) * S, (H / 2 - 2.2) * S, (x + 2.2) * S, (H / 2 + 2.2) * S], fill=(214, 210, 203))
    img.resize((W, H), Image.LANCZOS).save(OUT / "a_perf.png", optimize=True)


def main() -> None:
    r1.ensure_plates()
    r1.ensure_fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    plates = {k: Image.open(r1.PLATES / f).convert("RGB") for k, f in r1.PLATE_FILES.items()}
    crops(plates)
    seam_pair()
    stepped_monument(plates)
    strata_section()
    superimposed_plans()
    station_maps()
    perforation()
    for p in sorted(OUT.iterdir()):
        with Image.open(p) as im:
            print(f"{p.name:22s} {im.size[0]}x{im.size[1]}  {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    _ = (math, ImageChops)
    main()
