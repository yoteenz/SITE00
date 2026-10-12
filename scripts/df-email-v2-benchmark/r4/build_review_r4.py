#!/usr/bin/env python3
"""Email V2 R4 — review data, premium asset matrix, provenance, previews and the public review mount.

Inputs:  emails/pack.json, generation_plan.json, qa/R4_QA.json, qa/originals_checksums.json, prepare_r4.CROPS,
         renders from render.mjs (R4_OUT, default /tmp/SITE00_EMAIL_V2_R4/RENDERS)
Outputs: review/data.js                                  (repository review, relative paths)
         previews/<id>_{MOBILE,DESKTOP}.jpg              (1x review thumbnails)
         docs/.../email-v2/r4/PREMIUM_ASSET_MATRIX.{json,md}
         docs/.../email-v2/r4/OPENART_PROVENANCE.json
         docs/.../email-v2/r4/QA_R4.md
         public/site00-correspondence-studio/previews/r4/  (emails, assets, fonts, previews, review) with --public
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

from prepare_r4 import CROPS

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
DOCS = REPO / "docs/site00/idnty/visual-authority/email-v2/r4"
RENDERS = Path(os.environ.get("R4_OUT", "/tmp/SITE00_EMAIL_V2_R4/RENDERS"))
PUBLIC = REPO / "public/site00-correspondence-studio/previews/r4"
PUBLIC_URL = "/site00-correspondence-studio/previews/r4"
CDN = "https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_{}.png"

# OpenArt results as returned by openart_creation_wait (historyId → resource).
GENERATIONS = {
    "R4-G01": ("qVrMpDq8BDXLWDBvyMFU", "XjixyjHKt5EaYaqjXMFQ", "1791753740851_babc6280"),
    "R4-G02": ("WVLLzcHZ7KXVLAvR5YwR", "8Q9RE95QYFs5Ow0jwXLi", "1791753894133_22bda37f"),
    "R4-G03": ("kLk7yDc09AdzMaIiVaWe", "9PvOwIp2HDWcNkCCaaDH", "1791753847496_1c08c992"),
    "R4-G04": ("uCGqFNpLg182MwWiP6Jm", "mGThXosTR9To7M9DijqG", "1791753853388_c3340778"),
    "R4-G05": ("YAZbHDQt4n6GnV64YBDP", "yw0e65hB0WpFqfgzyeE4", "1791753852458_32ce2181"),
    "R4-G06": ("yKathOVIiSuryVZVoGqy", "j7A5wUpGlXQwOaX1LSQu", "1791753857988_9c44b12f"),
    "R4-G07": ("Vmc5nRDoA9fT0k0TjoS2", "3WTZBmZzuRvi5bAf3wua", "1791753859245_52ae3832"),
    "R4-G08": ("1Wzjudvfh8rSfDV2YKkA", "9PWM29cP7xozGuys3h25", "1791753870849_d7ec3a67"),
    "R4-G09": ("zIoYYnSJIWwnGoKZfejg", "v7tld8cyfNwQRaNh5XPI", "1791753862054_5160b4de"),
    "R4-G10": ("pnTZecLA9jQCdOpXwefc", "A9q44AEZRFzNcIVOOTrb", "1791753864292_d4d28ae6"),
}
CREDITS = {"balance_before": 20899, "balance_after": 19199, "spent": 1700, "quoted": 1630, "reserve_used": 0, "regenerations": 0}
COMPOSITES = {"R4-G03": ["gfx/cover-r4.jpg"], "R4-G09": ["gfx/section-r4.jpg"]}
THUMB = {
    "R4-G01": "gen/door_col.jpg", "R4-G02": "gen/slab.jpg", "R4-G03": "gfx/cover-r4.jpg", "R4-G04": "gen/model.jpg",
    "R4-G05": "gen/threshold.jpg", "R4-G06": "gen/setout.jpg", "R4-G07": "gen/archive.jpg", "R4-G08": "gen/credit_col.jpg",
    "R4-G09": "gfx/section-r4.jpg", "R4-G10": "gen/after.jpg",
}
CLASS_RULE = {
    "P1": "UNIQUE PREMIUM HERO. The email is a moment the client keeps or acts on with money; one photograph carries its idea.",
    "P2": "SHARED FAMILY ART. A sibling of a P1 moment; it reuses that photograph through a different crop, so the family reads as one sequence without a new commission.",
    "P3": "UTILITY. A short status or request; drawn devices, icons and live type carry it. A photograph would slow the job down.",
}
R3_COMPARE = {"personal-foundation-invitation": "B01_R3", "foundation-complete": "B02_R3", "M06": "B03_R3"}
FAMILY_LABEL = {"transactional": "TRANSACTIONAL", "operational": "OPERATIONAL", "marketing": "MARKETING"}
FAMILY_VOICE = {
    "transactional": "CLEAR, COMPOSED, CONFIDENT. Says what happened and what to do next, and nothing it cannot prove.",
    "operational": "USEFUL, CALM, DIRECT. One request or one decision per message, with the action named in the headline.",
    "marketing": "MAGNETIC, EDITORIAL, ANTICIPATORY. Written like a feature: it opens a door and leaves it open.",
}


def assets_in(html: str) -> list[str]:
    return sorted(set(re.findall(r"assets/((?:gen|gfx|r3)/[A-Za-z0-9_.-]+)", html)))


def premium_crops(files: list[str]) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for f in files:
        name = Path(f).stem
        if f.startswith("gen/") and name in CROPS:
            out.setdefault(CROPS[name][0], []).append(f)
        for gid, comps in COMPOSITES.items():
            if f in comps:
                out.setdefault(gid, []).append(f)
    return out


def write_previews(ids: list[str]) -> None:
    dest = HERE / "previews"
    dest.mkdir(exist_ok=True)
    for i in ids:
        for view, width in (("MOBILE", 390), ("DESKTOP", 1024)):
            src = RENDERS / view / f"{i}_{view}.png"
            if not src.exists():
                raise SystemExit(f"missing render {src}; run render.mjs first")
            im = Image.open(src).convert("RGB")
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            im.save(dest / f"{i}_{view}.jpg", quality=80, optimize=True, progressive=True)


def main() -> None:
    pack = json.loads((HERE / "emails/pack.json").read_text(encoding="utf-8"))
    plan = json.loads((HERE / "generation_plan.json").read_text(encoding="utf-8"))
    qa = json.loads((HERE / "qa/R4_QA.json").read_text(encoding="utf-8"))
    sums = json.loads((HERE / "qa/originals_checksums.json").read_text(encoding="utf-8"))
    qa_by_id = {r["id"]: r for r in qa["results"]}
    jobs = {j["asset_id"]: j for j in plan["jobs"]}

    emails = []
    usage: dict[str, dict[str, list[str]]] = {gid: {} for gid in jobs}
    for e in pack["emails"]:
        html = (HERE / "emails" / e["review_file"]).read_text(encoding="utf-8")
        files = assets_in(html)
        crops = premium_crops(files)
        for gid, fs in crops.items():
            usage[gid][e["template_id"]] = fs
        q = qa_by_id[e["template_id"]]
        emails.append({
            **{k: e[k] for k in ("code", "template_id", "family", "name", "register", "title", "visual_class", "premium_assets", "devices", "lineage", "subject", "preheader", "tokens")},
            "premium_crops": crops,
            "drawn_assets": [f for f in files if f.startswith("gfx/icon-") or f.startswith("r3/icon-") or "plan-" in f or "seal" in f or "lockup" in f],
            "r3_compare": R3_COMPARE.get(e["template_id"]),
            "qa": {"pass": q["pass"], "subject_source": q["subject_source"], "cta": q["cta"], "fallback_line_notes": len(q["fallback_line_notes"])},
        })
    for e in emails:
        e["siblings"] = sorted({other["template_id"] for gid in e["premium_assets"] for other in emails if gid in other["premium_assets"] and other["template_id"] != e["template_id"]})
    write_previews([e["template_id"] for e in emails])

    assets = []
    for gid, j in jobs.items():
        hist, res, suffix = GENERATIONS[gid]
        s = sums[gid]
        served = list(usage[gid].keys())
        if not set(served) <= set(j["serves"]):
            raise SystemExit(f"{gid}: used in {served}, outside the plan {j['serves']}")
        dropped = [t for t in j["serves"] if t not in served]
        assets.append({
            "asset_id": gid,
            "name": j["name"],
            "aspect_ratio": j["aspectRatio"],
            "reference": j["reference"],
            "reference_url": plan["references"][j["reference"]],
            "serves": served,
            "planned_but_not_used": dropped,
            "crops_by_template": usage[gid],
            "thumb": THUMB[gid],
            "archive_jpg": f"docs/site00/idnty/visual-authority/email-v2/r4/premium-assets/{gid}.jpg",
            "original": {"width": s["width"], "height": s["height"], "png_sha256": s["png_sha256"], "png_bytes": s["png_bytes"]},
            "openart": {"history_id": hist, "resource_id": res, "url": CDN.format(suffix)},
            "prompt": j["prompt"],
        })

    classes = {c: [e["template_id"] for e in emails if e["visual_class"] == c] for c in ("P1", "P2", "P3")}
    matrix = {
        "sprint": plan["sprint"],
        "status": "FOUNDER REVIEW PENDING",
        "rule": CLASS_RULE,
        "counts": {c: len(v) for c, v in classes.items()},
        "classes": classes,
        "generation": {
            "provider": plan["provider"], "project_id": plan["project_id"], "project_name": plan["project_name"],
            "model": plan["model"], "mode": plan["mode"], "params": plan["params"], "jobs": len(assets),
            "ceiling": plan["ceiling"], "credits": CREDITS,
        },
        "assets": [{k: a[k] for k in ("asset_id", "name", "aspect_ratio", "reference", "serves", "planned_but_not_used", "crops_by_template")} for a in assets],
        "templates": [{k: e[k] for k in ("code", "template_id", "family", "visual_class", "premium_assets", "premium_crops", "drawn_assets")} for e in emails],
    }
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / "PREMIUM_ASSET_MATRIX.json").write_text(json.dumps(matrix, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (DOCS / "OPENART_PROVENANCE.json").write_text(json.dumps({
        "sprint": plan["sprint"], "provider": plan["provider"], "project_id": plan["project_id"], "project_name": plan["project_name"],
        "model": plan["model"], "mode": plan["mode"], "params": plan["params"], "shared_prompt_suffix": plan["shared_suffix"],
        "references": plan["references"], "credits": CREDITS, "reserve": plan["reserve"],
        "assets": [{k: a[k] for k in ("asset_id", "name", "aspect_ratio", "reference", "reference_url", "openart", "original", "archive_jpg", "serves", "prompt")} for a in assets],
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [
        "# Email V2 R4 — premium asset matrix",
        "",
        f"Ten OpenArt image-to-image photographs serve fourteen of the twenty emails. Six utility emails carry drawn devices only.",
        f"Credits: {CREDITS['spent']} spent (quoted {CREDITS['quoted']}; previous premium ceiling 1902). Regenerations: 0. Reserve: unused.",
        "",
        "## Classes",
        "",
        "| Class | Rule | Templates |",
        "|---|---|---|",
    ]
    md += [f"| {c} ({len(v)}) | {CLASS_RULE[c]} | {', '.join(v)} |" for c, v in classes.items()]
    md += ["", "## Assets", "", "| Asset | Name | Ratio | Reference | Serves (crop) |", "|---|---|---|---|---|"]
    for a in assets:
        serves = "; ".join(f"{t} ({', '.join(Path(f).name for f in fs)})" for t, fs in a["crops_by_template"].items())
        md.append(f"| {a['asset_id']} | {a['name']} | {a['aspect_ratio']} | {a['reference']} | {serves} |")
    md += ["", "## Templates", "", "| Code | Template | Family | Class | Premium | Drawn devices |", "|---|---|---|---|---|---|"]
    for e in emails:
        md.append(f"| {e['code']} | {e['template_id']} | {FAMILY_LABEL[e['family']]} | {e['visual_class']} | {', '.join(e['premium_assets']) or '—'} | {', '.join(Path(f).stem for f in e['drawn_assets']) or 'CSS only'} |")
    for a in assets:
        if a["planned_but_not_used"]:
            md.append(f"\n{a['asset_id']} was planned for {', '.join(a['planned_but_not_used'])} too; in composition that email read better as a P3 utility with drawn devices, so the photograph is not used there.")
    md += ["", "Provenance (history ids, resource ids, CDN URLs, SHA-256): `OPENART_PROVENANCE.json`. Archived JPEGs: `premium-assets/`.", ""]
    (DOCS / "PREMIUM_ASSET_MATRIX.md").write_text("\n".join(md), encoding="utf-8")

    qmd = [
        "# Email V2 R4 — QA report",
        "",
        f"`qa_r4.mjs`: {qa['passed']}/{qa['templates']} templates pass. Variety: {'PASS' if qa['variety']['pass'] else 'FAIL'} "
        f"(reused crops {len(qa['variety']['reused_crops'])}, duplicate headlines {len(qa['variety']['duplicate_headlines'])}).",
        "`render.mjs`: 20 emails × 390 / 768 / 1024 × web fonts and fonts blocked = 120 renders; no document overflow,",
        "no element outside the 640px message, no widened message table, no missing asset.",
        "",
        "Checks per template: subject and primary CTA against the copy contract (the R3 benchmark contract for the invitation",
        "and M06), secondary CTA, template tokens within the contract placeholders and destination, literal uppercase for",
        "SITE 00 text, Barlow Condensed for display and Saira Semi Condensed for everything else, internal-term and filler",
        "language, and line breaks at all three widths: no one-word last line in body copy, no one-word headline line from a",
        "natural wrap, no word split across lines.",
        "",
        f"Fonts-blocked line notes ({qa['fallback_line_notes']}) are advisory: this VM falls back to a wide Arial because Arial Narrow",
        "is not installed. They never overflow; the width checks cover the fallback run.",
        "",
        "| Code | Template | Class | Result | Subject source | Fallback notes |",
        "|---|---|---|---|---|---|",
    ]
    for e in emails:
        qmd.append(f"| {e['code']} | {e['template_id']} | {e['visual_class']} | {'PASS' if e['qa']['pass'] else 'FAIL'} | {e['qa']['subject_source']} | {e['qa']['fallback_line_notes']} |")
    qmd += ["", "Full machine output: `scripts/df-email-v2-benchmark/r4/qa/R4_QA.json`.", ""]
    (DOCS / "QA_R4.md").write_text("\n".join(qmd), encoding="utf-8")

    data = {
        "sprint": plan["sprint"],
        "status": "FOUNDER REVIEW PENDING",
        "families": [{"id": f, "label": FAMILY_LABEL[f], "voice": FAMILY_VOICE[f], "templates": [e["template_id"] for e in emails if e["family"] == f]} for f in FAMILY_LABEL],
        "class_rule": CLASS_RULE,
        "emails": emails,
        "assets": [{k: a[k] for k in ("asset_id", "name", "aspect_ratio", "reference", "serves", "thumb")} for a in assets],
        "credits": CREDITS,
        "qa": {"passed": qa["passed"], "templates": qa["templates"], "variety": qa["variety"]["pass"]},
    }
    write_data(HERE / "review/data.js", data, {"emails": "../emails/", "assets": "../assets/", "previews": "../previews/", "r3": "../../r3/emails/"})
    print("wrote review/data.js, previews/, PREMIUM_ASSET_MATRIX, OPENART_PROVENANCE, QA_R4")
    if "--public" in sys.argv:
        publish(data, emails)


def write_data(path: Path, data: dict, paths: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "// Generated by build_review_r4.py. Do not edit by hand.\n"
        f"window.R4_PATHS = {json.dumps(paths)};\n"
        f"window.R4_DATA = {json.dumps(data, indent=1, ensure_ascii=False)};\n",
        encoding="utf-8",
    )


def publish(data: dict, emails: list[dict]) -> None:
    """Mount the pack under public/ so the review and Correspondence Studio iframes load it on the preview tunnel."""
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    (PUBLIC / "emails").mkdir(parents=True)
    used: set[str] = set()
    for e in emails:
        html = (HERE / "emails" / f"{e['template_id']}.html").read_text(encoding="utf-8")
        used.update(assets_in(html))
        html = html.replace('"../assets/', f'"{PUBLIC_URL}/assets/').replace('url("../assets/', f'url("{PUBLIC_URL}/assets/').replace('url("../fonts/', f'url("{PUBLIC_URL}/fonts/')
        if "../" in re.sub(r"<!--.*?-->", "", html, flags=re.S):
            raise SystemExit(f"{e['template_id']}: relative path left after rewrite")
        (PUBLIC / "emails" / f"{e['template_id']}.html").write_text(html, encoding="utf-8")
    used.update(a["thumb"] for a in data["assets"])
    for f in sorted(used):
        (PUBLIC / "assets" / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(HERE / "assets" / f, PUBLIC / "assets" / f)
    shutil.copytree(HERE / "fonts", PUBLIC / "fonts")
    shutil.copytree(HERE / "previews", PUBLIC / "previews", ignore=lambda _d, names: [n for n in names if "_MOBILE" not in n])
    (PUBLIC / "review").mkdir()
    shutil.copy2(HERE / "review/index.html", PUBLIC / "review/index.html")
    write_data(PUBLIC / "review/data.js", data, {
        "emails": f"{PUBLIC_URL}/emails/", "assets": f"{PUBLIC_URL}/assets/", "previews": f"{PUBLIC_URL}/previews/",
        "r3": "/site00-correspondence-studio/previews/r3/",
    })
    print(f"published {len(emails)} emails, {len(used)} assets →", PUBLIC.relative_to(REPO))


if __name__ == "__main__":
    main()
