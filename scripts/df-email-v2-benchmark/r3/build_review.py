#!/usr/bin/env python3
"""Email V2 R3 — build the review data, the graphic asset manifest and the art-direction document.

Inputs:  emails.json, graphics/**/*.svg (titles), prepare_r3.REUSE (photo provenance), emails/*.html (usage)
Outputs: review/data.js
         docs/site00/idnty/visual-authority/email-v2/r3/GRAPHIC_ASSET_MANIFEST.json
         docs/site00/idnty/visual-authority/email-v2/r3/ART_DIRECTION_R3.md
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from prepare_r3 import REUSE

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
DOCS = REPO / "docs/site00/idnty/visual-authority/email-v2/r3"
EMAILS = ["B01_R3", "B02_R3", "B03_R3"]

# Graphic devices that are not standalone SVG icons: name -> (kind, source, role)
DEVICES = {
    "completion-seal": ("vector → PNG", "graphics/devices/completion-seal.svg", "B02 status seal: lettered ring with the surveyor's benchmark at its centre."),
    "lockup-groundwork": ("display lockup → PNG", "graphics/devices/lockups.html#groundwork (+ #groundwork-m)", "B02 headline at monument scale; GROUNDWORK fitted to the full measure. Alt carries the exact words."),
    "lockup-bldr": ("display lockup → PNG", "graphics/devices/lockups.html#bldr (+ #bldr-m)", "B03 nameplate set to the full measure."),
    "plan-a-gallery": ("vector → PNG", "graphics/devices/plan-a-gallery.svg", "B03 reveal: plan A, rooms along one long hall."),
    "plan-b-courtyard": ("vector → PNG", "graphics/devices/plan-b-courtyard.svg", "B03 reveal: plan B, rooms around an open court."),
    "plan-c-open-hall": ("vector → PNG", "graphics/devices/plan-c-open-hall.svg", "B03 reveal: plan C, one large hall with service on two edges."),
    "interior-annotations": ("vector overlay → JPG", "graphics/devices/interior-annotations.svg over assets/inside.jpg", "B03 station 02: leader lines naming the marble and the red glass."),
    "perforation": ("reused R2 raster", "r2/assets/a_perf.png", "B01 tear line above the reply card."),
    "red-glass sliver": ("live HTML", "compose/B01_R3.html .sliver", "B01 8px glass cell beside the promise (background crop of the doorway)."),
    "title block": ("live HTML", "compose/B02_R3.html .tb", "B02 drawing title block hung from the slab: GROUND · LAID | client."),
    "schedule": ("live HTML", "compose/B02_R3.html .sched", "B02 schedule: faint display numerals, stage icons, Barlow stage names; row 05 emphasised."),
    "datum band": ("live HTML", "compose/B02_R3.html .datum", "B02 red level line (±0.00) between the drawn and the built plate."),
    "station numerals": ("live HTML", "compose/B03_R3.html .st-n", "B03 64px display numerals that mark the three stations."),
    "red square stop": ("live HTML", "compose/base.css .stop", "The SITE 00 full stop after display headlines, drawn as a red square."),
}


def svg_title(path: Path) -> str:
    m = re.search(r"<title>(.*?)</title>", path.read_text(encoding="utf-8"), re.S)
    return m.group(1).strip() if m else ""


def usage(needle: str, html: dict[str, str]) -> list[str]:
    return [eid.split("_")[0] for eid, text in html.items() if needle in text]


def main() -> None:
    data = json.loads((HERE / "emails.json").read_text(encoding="utf-8"))
    html = {eid: (HERE / "emails" / f"{eid}.html").read_text(encoding="utf-8") for eid in EMAILS}

    icons = []
    for svg in sorted((HERE / "graphics/icons").glob("*.svg")):
        name = svg.stem
        icons.append({
            "id": f"icon-{name}",
            "source_svg": f"scripts/df-email-v2-benchmark/r3/graphics/icons/{svg.name}",
            "png": f"scripts/df-email-v2-benchmark/r3/assets/gfx/icon-{name}.png",
            "role": svg_title(svg),
            "used_in": usage(f"icon-{name}.png", html),
        })
    devices = []
    for name, (kind, source, role) in DEVICES.items():
        needle = {
            "lockup-groundwork": "lockup-groundwork", "lockup-bldr": "lockup-bldr", "interior-annotations": "inside-annotated",
            "perforation": "perforation.png", "red-glass sliver": 'class="sliver', "title block": 'class="tb', "schedule": 'class="sched',
            "datum band": 'class="datum', "station numerals": "st-n", "red square stop": 'class="stop',
        }.get(name, f"{name}.png")
        devices.append({"id": name, "kind": kind, "source": f"scripts/df-email-v2-benchmark/r3/{source}" if not source.startswith("r2/") else f"scripts/df-email-v2-benchmark/{source}", "role": role, "used_in": usage(needle, html)})
    photos = [
        {"id": name, "file": f"scripts/df-email-v2-benchmark/r3/assets/{name}", "reused_from": f"scripts/df-email-v2-benchmark/{(folder / src).relative_to(HERE.parent).as_posix()}", "used_in": usage("inside-annotated" if name == "inside.jpg" else f"assets/{name}", html)}
        for name, (folder, src) in REUSE.items()
    ]
    unused = [x["id"] for x in icons + devices + photos if not x["used_in"]]
    if unused:
        raise SystemExit(f"assets registered but not used in any R3 email: {unused}")

    manifest = {
        "sprint": data["sprint"],
        "status": data["status"],
        "openart_generations": 0,
        "openart_credits_spent": 0,
        "plates": "DF-I01 / I02 / I03 (release df-v2-mass-cj-2026-10-11), via R1 and R2 crops",
        "custom_icons": icons,
        "custom_graphic_devices": devices,
        "reused_photographs": photos,
        "counts": {"custom_icons": len(icons), "custom_graphic_devices": len(devices), "reused_photographs": len(photos)},
    }
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "GRAPHIC_ASSET_MANIFEST.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    review = dict(data)
    review["icons"] = [{"id": i["id"], "role": i["role"], "used_in": i["used_in"]} for i in icons]
    review["devices"] = [{"id": d["id"], "kind": d["kind"], "role": d["role"], "used_in": d["used_in"]} for d in devices]
    (HERE / "review/data.js").write_text(
        "// Generated by build_review.py from emails.json and the graphic sources. Do not edit by hand.\n"
        f"window.R3_DATA = {json.dumps(review, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )

    t = data["typography"]
    out = [
        "# Email V2 R3 — art direction",
        "",
        "One integrated composition per email. The copy is the benchmark copy, restructured into editorial moments (pull quotes,",
        "legends, schedules, captions) without changing its words. Agent selection is not founder approval: all three are",
        "**FOUNDER REVIEW PENDING**.",
        "",
        "Review: `scripts/df-email-v2-benchmark/r3/review/index.html` (email, R3 / R2 A–C / R1, device, compare, rationale,",
        "graphic provenance). Studio: `/admin/site00/correspondence-studio` → Digital Foundation → client lifecycle → email.",
        "",
        "| Email | R3 composition | Central idea |",
        "|---|---|---|",
    ]
    for e in data["emails"]:
        out.append(f"| {e['id']} · {e['name']} | {e['title']} | {e['central_idea']} |")
    for e in data["emails"]:
        out += [
            "",
            f"<a id=\"{e['id'].lower()}\"></a>",
            f"## {e['id']} · {e['name']} — {e['title']}",
            "",
            f"**Job.** {e['job']}",
            "",
            f"**Central idea.** {e['central_idea']}",
            "",
            f"**Why this composition.** {e['why_chosen']}",
            "",
            "**What it takes from R2.**",
            "",
        ]
        out += [f"- {src}: {what}" for src, what in e["converges"]]
        out += [
            "",
            "| Aspect | Direction |",
            "|---|---|",
            f"| Composition | {e['composition']} |",
            f"| Typography | {e['typography']} |",
            f"| Graphic devices | {', '.join(e['devices'])} |",
            f"| Red | {e['red']} |",
            f"| Action | {e['cta']} |",
            f"| Email-safe build | {e['email_safe']} |",
            f"| Known risk | {e['risk']} |",
            "",
            f"**R2 → R3.** {e['r2_comparison']}",
            "",
            f"**Premium asset candidate (not commissioned).** {e['premium']}",
        ]
    out += [
        "",
        "## Typographic roles",
        "",
        f"Display: {t['display']}. Body: {t['body']}. Full evidence in `TYPOGRAPHIC_AUTHORITY.md`.",
        "",
        "| Role | Face | Size | Tracking | Leading |",
        "|---|---|---|---|---|",
    ]
    out += [f"| {' | '.join(r)} |" for r in t["roles"]]
    out += [
        "",
        "## Family distinction",
        "",
        "B01 is a letter on white with one photograph and a stone reply card. B02 is a drawing set: lockup, slab, schedule, datum,",
        "two plates and a horizon. B03 is a magazine issue: nameplate, cover, stations and the only ink spread. With the copy",
        "removed, each still reads as its own kind of document, and each still reads as SITE 00 (red square stop, Barlow display,",
        "Saira text, red glass and marble from the same plates).",
        "",
        "## Status",
        "",
        "FOUNDER REVIEW PENDING. Full 20-email rollout not authorized. No sending, no merge, no deploy. OpenArt generations: 0.",
        "",
    ]
    (DOCS / "ART_DIRECTION_R3.md").write_text("\n".join(out), encoding="utf-8")
    print("wrote review/data.js,", (DOCS / "GRAPHIC_ASSET_MANIFEST.json").relative_to(REPO), "and", (DOCS / "ART_DIRECTION_R3.md").relative_to(REPO))
    print("counts:", manifest["counts"])


if __name__ == "__main__":
    main()
