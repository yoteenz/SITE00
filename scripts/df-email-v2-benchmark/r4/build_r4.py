"""Email V2 R4 — build the full twenty-email Digital Foundation pack.

compose/<id>.html      R3 lineage sources (personal-foundation-invitation, foundation-complete, M06)
compose/pack.py        the seventeen R4 compositions
emails/<id>.html       review build: sample data underlined, inbox chrome shown
emails/templates/<id>.template.html   send template: tokens restored, chrome and sample styling removed
emails/pack.json       manifest read by the review artifact and the Correspondence Studio import

Usage: python3 build_r4.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
COMPOSE = HERE / "compose"
OUT = HERE / "emails"
TEMPLATES = OUT / "templates"
sys.path.insert(0, str(COMPOSE))

from pack import COMPOSITIONS  # noqa: E402

COMMON = {"Halden &amp; Rowe": "{{business_name}}", "studio@haldenrowe.com": "{{recipient_email}}", "hr7Kq2Lm9x": "{{public_token}}"}
SAMPLES: dict[str, dict[str, str]] = {
    "quote-ready": {"3": "{{quote_version}}", "$2,400.00": "{{quote_total_display}}"},
    "quote-updated": {"3": "{{quote_version}}", "$2,400.00": "{{quote_total_display}}"},
    "quote-accepted": {"3": "{{quote_version}}", "2026-10": "{{terms_version}}"},
    "payment-confirmed": {"$2,400.00": "{{payment_amount_display}}"},
    "client-action-required": {
        "Confirm the names for your new mailboxes": "{{action_title}}",
        "We need the exact spelling for each person before we create their address.": "{{client_message}}",
    },
    "approval-requested": {"Your email signature layout": "{{approval_subject}}"},
    "approval-completed": {"Confirm the names for your new mailboxes": "{{action_title}}"},
    "foundation-credit-issued": {"$250.00": "{{credit_amount_display}}", "30 APRIL 2027": "{{credit_valid_until}}"},
}

# Registry order (shared/site00-correspondence-studio/manifests/digital-foundation-lifecycle.ts).
# class: P1 unique premium art · P2 shared premium family art · P3 utility composition with drawn devices.
PACK = [
    ("TR-01", "personal-foundation-invitation", "transactional", "PERSONAL FOUNDATION INVITATION", "LETTER", "THE INVITATION", "P1", ["R4-G01"], "Letterhead, two-voice headline beside the native portrait doorway, reply card, P.S."),
    ("TR-02", "intake-started", "transactional", "INTAKE STARTED", "LETTER", "THE DOOR, AJAR", "P2", ["R4-G01"], "Short note; the open door returns as a floor-light detail stepped in from the right; margin note."),
    ("TR-03", "intake-completed", "transactional", "INTAKE COMPLETED", "RECORD", "RECEIVED", "P3", [], "Double-ruled RECEIVED stamp, three-step progress rail, outlined action."),
    ("TR-04", "quote-ready", "transactional", "QUOTE READY", "BRIEF", "THE WORK, MEASURED", "P1", ["R4-G04"], "Scale-model hero, figure caption, specification sheet with the total set in display type, margin note."),
    ("TR-05", "quote-updated", "transactional", "QUOTE UPDATED", "BRIEF", "REVISION", "P2", ["R4-G04"], "Model detail beside the headline; drawing-style revision table with the earlier version struck."),
    ("TR-06", "quote-accepted", "transactional", "QUOTE ACCEPTED", "RECORD", "AGREED", "P3", [], "One-word monument headline; countersignature device with version and terms."),
    ("TR-07", "checkout-link-ready", "transactional", "CHECKOUT LINK READY", "NOTICE", "CHECKOUT IS OPEN", "P2", ["R4-G05"], "Threshold slot as a letterbox header; admission ticket with a perforated stub."),
    ("TR-08", "payment-confirmed", "transactional", "PAYMENT CONFIRMED", "RECORD", "RECEIPT", "P1", ["R4-G05"], "Threshold hero, amount as monument numerals, perforation rule, split thanks."),
    ("TR-09", "payment-failed", "transactional", "PAYMENT FAILED / RECOVERY", "NOTICE", "ATTENTION", "P3", [], "Status bar with a hollow red square; three-row fact sheet; no imagery on purpose."),
    ("TR-10", "project-activated", "transactional", "PROJECT ACTIVATED", "FEATURE", "THE GROUND IS MARKED OUT", "P1", ["R4-G06"], "Headline before image; setting-out photograph; five-stage map with stage 01 in red."),
    ("TR-11", "foundation-complete", "transactional", "FOUNDATION COMPLETE", "RECORD", "THE RECORD", "P1", ["R4-G02"], "Seal, groundwork lockup, built travertine slab with its title block, schedule, datum, ownership."),
    ("TR-12", "records-available", "transactional", "RECORDS AVAILABLE", "RECORD", "THE ARCHIVE", "P1", ["R4-G07"], "Archive photograph opens the email; index card with a red tab; no documents in email."),
    ("OP-01", "client-action-required", "operational", "CLIENT ACTION REQUIRED", "NOTICE", "ONE THING NEEDS YOU", "P3", [], "Pinned stone card carrying the request and its note in original case; primary plus text link."),
    ("OP-02", "approval-requested", "operational", "APPROVAL REQUESTED", "BRIEF", "YOUR SIGN-OFF, PLEASE", "P3", [], "Kicker into headline; ruled decision strip; two numbered steps."),
    ("OP-03", "approval-completed", "operational", "APPROVAL COMPLETED", "RECORD", "DONE. THANK YOU", "P3", [], "Registration tick beside the headline; two-line record; the shortest email in the pack."),
    ("MK-01", "foundation-credit-issued", "marketing", "FOUNDATION CREDIT ISSUED", "FEATURE", "SET ASIDE, IN YOUR NAME", "P1", ["R4-G08"], "Stacked headline beside the red-glass still life; value plate; red band."),
    ("MK-02", "bldr-discovery", "marketing", "BLDR DISCOVERY", "LETTER", "YOU MENTIONED YOU MIGHT BUILD", "P2", ["R4-G03"], "Pavilion band from the BLDR cover; three illustrative plans; letter sign-off."),
    ("MK-03", "M01", "marketing", "M01 — DIGITAL FOUNDATION EDUCATION", "FEATURE", "WHAT'S UNDER THE FLOOR", "P1", ["R4-G09"], "Field-guide masthead; sectional model with numbered markers; legend; stone panel on what a foundation is not; red band."),
    ("MK-04", "M06", "marketing", "M06 — BLDR INTRODUCTION", "FEATURE", "THE ISSUE", "P1", ["R4-G03"], "Magazine cover with the nameplate in the sky; stepped headline; three stations; plan reveal; ink spread; closing link."),
    ("MK-05", "M13", "marketing", "M13 — POST-COMPLETION FOLLOW-UP", "FEATURE", "AFTER HOURS", "P1", ["R4-G10"], "Dusk pavilion into a night band; three vignettes in white; terrace strip; red band."),
]

WIDOW = re.compile(r"([^\s<>;]+) ([^\s<>]{1,16})((?:<span class=\"stop\"></span>)?\s*</(?:p|h1|h2|td|div)>)")
PAIR_MAX = {"h1": 15, "h2": 15}
PAIR_MAX_TEXT = 24
WIDOW_VALUE = re.compile(r"([^\s>]) (<span class=\"v\">[^<]{1,16}</span>[.,]?)(\s*</(?:p|h1|h2|td|div)>)")


def keep_last_pair(html: str) -> str:
    """Bind the last two words of every text block so no line ends a paragraph with one word."""
    body_start = html.index("<!-- MESSAGE -->")
    head, body = html[:body_start], html[body_start:]

    def bind(m: re.Match[str]) -> str:
        tag = re.search(r"</(\w+)>", m.group(3)).group(1)
        if m.re is WIDOW and len(m.group(1)) + len(m.group(2)) > PAIR_MAX.get(tag, PAIR_MAX_TEXT):
            return m.group(0)
        return f"{m.group(1)}&nbsp;{m.group(2)}{m.group(3)}"

    return head + WIDOW_VALUE.sub(bind, WIDOW.sub(bind, body))


def to_template(html: str, eid: str) -> str:
    html, n = re.subn(r'<div class="inbox">.*?(?=<!-- MESSAGE -->)', "", html, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"{eid}: inbox chrome not found before <!-- MESSAGE -->")
    html = re.sub(r"<!--REVIEW-->.*?<!--/REVIEW-->", "", html, flags=re.S)
    table = {**COMMON, **SAMPLES.get(eid, {})}

    def swap(m: re.Match[str]) -> str:
        sample = m.group(1)
        if sample not in table:
            raise SystemExit(f"{eid}: sample value with no token mapping: {sample!r}")
        return table[sample]

    html = re.sub(r'<span class="v">(.*?)</span>', swap, html)
    for sample, token in COMMON.items():
        html = html.replace(sample, token)
    return html.replace("../assets/", "{{asset_base}}/").replace("../fonts/", "{{font_base}}/")


def main() -> None:
    base = (COMPOSE / "base.css").read_text(encoding="utf-8")
    TEMPLATES.mkdir(parents=True, exist_ok=True)
    composed = {fn().eid: fn for fn in COMPOSITIONS}
    manifest = []
    for code, eid, family, name, register, title, cls, art, devices in PACK:
        src_path = COMPOSE / f"{eid}.html"
        if src_path.exists():
            src, lineage = src_path.read_text(encoding="utf-8"), "R3 composition refined in R4"
        elif eid in composed:
            src, lineage = composed[eid]().html(f"{code} {eid} — {title}. {devices}"), "New in R4"
        else:
            raise SystemExit(f"{eid}: no composition")
        if "/*BASE*/" not in src:
            raise SystemExit(f"{eid}: missing /*BASE*/ marker")
        bad = [c for c in src if (ord(c) < 32 and c not in "\n\t") or c == "\ufffd"]
        if bad:
            raise SystemExit(f"{eid}: control or replacement characters")
        html = keep_last_pair(src.replace("/*BASE*/", base.strip()))
        (OUT / f"{eid}.html").write_text(html, encoding="utf-8")
        tpl = to_template(html, eid)
        if 'class="v"' in tpl:
            raise SystemExit(f"{eid}: sample styling left in template")
        (TEMPLATES / f"{eid}.template.html").write_text(tpl, encoding="utf-8")
        subject = re.search(r"<title>(.*?)</title>", html).group(1)
        preheader = re.sub(r"<[^>]+>", "", re.search(r'<div class="pre">(.*?)</div>', html).group(1))
        manifest.append({
            "code": code, "template_id": eid, "family": family, "name": name, "register": register, "title": title,
            "visual_class": cls, "premium_assets": art, "devices": devices, "lineage": lineage,
            "subject": subject, "preheader": preheader,
            "review_file": f"{eid}.html", "template_file": f"templates/{eid}.template.html",
            "tokens": sorted(set(re.findall(r"\{\{\s*([a-z_]+)\s*\}\}", tpl)) - {"asset_base", "font_base"}),
        })
        print(f"{code} {eid}: {len(html) // 1024} KB review · {len(tpl) // 1024} KB template")
    if len(manifest) != 20:
        raise SystemExit(f"expected 20 emails, built {len(manifest)}")
    (OUT / "pack.json").write_text(json.dumps({"version": "r4-premium", "count": len(manifest), "emails": manifest}, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
