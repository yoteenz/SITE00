#!/usr/bin/env python3
"""Lean Digital Foundation email pack — editable HTML from audited contracts and approved plates.

Does not call OpenArt. Does not send email. Does not wire dispatch.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "docs/site00/idnty/visual-authority/email-pack/DF_V2_COMPLETE_EMAIL_TEMPLATE_REGISTRY.json"
PACK = Path("/tmp/SITE00_DF_V2_EMAIL_PACK_LEAN")
PLATES = Path("/tmp/df-email-assets/SITE00_DF_V2_MASS_PRODUCTION_C-J")
FONTS = Path("/tmp/df-fonts")
AUTHORITY = Path("/tmp/df-email-assets/AUTHORITY.jpg")

ORDER = [
    "personal-foundation-invitation",
    "intake-started",
    "intake-completed",
    "quote-ready",
    "quote-updated",
    "quote-accepted",
    "checkout-link-ready",
    "payment-confirmed",
    "payment-failed",
    "project-activated",
    "foundation-complete",
    "records-available",
    "client-action-required",
    "approval-requested",
    "approval-completed",
    "foundation-credit-issued",
    "bldr-discovery",
    "M01",
    "M06",
    "M13",
]

# layout key drives a distinct composition. Archetype stays the audited value.
LAYOUT = {
    "personal-foundation-invitation": "invitation",
    "intake-started": "progress-open",
    "intake-completed": "progress-done",
    "quote-ready": "ledger",
    "quote-updated": "revision",
    "quote-accepted": "recorded",
    "checkout-link-ready": "checkout",
    "payment-confirmed": "receipt",
    "payment-failed": "alert",
    "project-activated": "activation",
    "foundation-complete": "complete",
    "records-available": "records",
    "client-action-required": "action",
    "approval-requested": "approve-wait",
    "approval-completed": "approve-done",
    "foundation-credit-issued": "mkt-credit",
    "bldr-discovery": "mkt-discovery",
    "M01": "mkt-edu",
    "M06": "mkt-bldr",
    "M13": "mkt-after",
}

# Distinct crops. Boxes chosen so baked headlines from the Type A boards stay outside the frame.
CROPS = {
    "glass": ("i02", (620, 320, 1500, 720)),
    "sea": ("i01", (2480, 480, 3400, 980)),
    "place": ("i02", (90, 1288, 1160, 1605)),
    "feel": ("i02", (1260, 1288, 2320, 1605)),
    "work": ("i02", (2420, 1288, 3490, 1605)),
    "steps": ("i01", (90, 1240, 1140, 1600)),
    "olive": ("i01", (1240, 1240, 2300, 1600)),
    "door": ("i01", (2400, 1240, 3480, 1600)),
    "pool": ("i03", (1260, 1320, 2320, 1640)),
    "handles": ("i03", (2420, 1320, 3480, 1640)),
    "lounge": ("i03", (90, 1320, 1160, 1640)),
}

HERO = {
    "personal-foundation-invitation": "place",
    "intake-started": "steps",
    "intake-completed": "olive",
    "quote-ready": "feel",
    "quote-updated": "work",
    "quote-accepted": "handles",
    "checkout-link-ready": "door",
    "payment-confirmed": "lounge",
    "payment-failed": "steps",
    "project-activated": "olive",
    "foundation-complete": "pool",
    "records-available": "handles",
    "client-action-required": "work",
    "approval-requested": "door",
    "approval-completed": "olive",
    "foundation-credit-issued": "steps",
    "bldr-discovery": "glass",
    "M01": "olive",
    "M06": "work",
    "M13": "pool",
}

STATUS = {
    "personal-foundation-invitation": "PERSONAL LINK",
    "intake-started": "IN PROGRESS",
    "intake-completed": "RECEIVED",
    "quote-ready": "READY TO REVIEW",
    "quote-updated": "REVISED",
    "quote-accepted": "RECORDED · NOT PAID",
    "checkout-link-ready": "CHECKOUT OPEN",
    "payment-confirmed": "PAYMENT CONFIRMED",
    "payment-failed": "NOT COMPLETE",
    "project-activated": "PROJECT ACTIVE",
    "foundation-complete": "FOUNDATION COMPLETE",
    "records-available": "RECORDS AVAILABLE",
    "client-action-required": "ACTION WAITING",
    "approval-requested": "DECISION OPEN",
    "approval-completed": "RECORDED COMPLETE",
    "foundation-credit-issued": "CREDIT ON RECORD",
    "bldr-discovery": "INTEREST RECORDED",
    "M01": "EDUCATION",
    "M06": "INTRODUCTION",
    "M13": "OPTIONAL FOLLOW-UP",
}


def family_dir(family: str) -> str:
    return {"TRANSACTIONAL": "TRANSACTIONAL", "OPERATIONAL": "OPERATIONAL", "MARKETING": "MARKETING"}[family]


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def crop_assets() -> None:
    from PIL import Image

    sources = {
        "i01": Image.open(PLATES / "BATCH_I/01_EDUCATION.png").convert("RGB"),
        "i02": Image.open(PLATES / "BATCH_I/02_BLDR_JOURNEY.png").convert("RGB"),
        "i03": Image.open(PLATES / "BATCH_I/03_POST_COMPLETION.png").convert("RGB"),
    }
    out = PACK / "SHARED_ASSETS" / "crops"
    out.mkdir(parents=True, exist_ok=True)
    for name, (key, box) in CROPS.items():
        sources[key].crop(box).save(out / f"{name}.jpg", quality=90, optimize=True)
    # Provenance copies of the seven approved files (not used as the email itself).
    orig = PACK / "SHARED_ASSETS" / "ORIGINALS"
    orig.mkdir(parents=True, exist_ok=True)
    mapping = {
        "DF-H01_TRANSACTIONAL_HEADER.png": PLATES / "BATCH_H/01_TRANSACTIONAL_HEADER.png",
        "DF-H02_TRANSACTIONAL_MOBILE.png": PLATES / "BATCH_H/02_TRANSACTIONAL_MOBILE.png",
        "DF-H03_TRANSACTIONAL_DESKTOP.png": PLATES / "BATCH_H/03_TRANSACTIONAL_DESKTOP.png",
        "DF-I01_EDUCATION.png": PLATES / "BATCH_I/01_EDUCATION.png",
        "DF-I02_BLDR_JOURNEY.png": PLATES / "BATCH_I/02_BLDR_JOURNEY.png",
        "DF-I03_POST_COMPLETION.png": PLATES / "BATCH_I/03_POST_COMPLETION.png",
        "SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg": AUTHORITY,
    }
    for name, src in mapping.items():
        dest = orig / name
        if not dest.exists():
            shutil.copy2(src, dest)
    font_out = PACK / "SHARED_ASSETS" / "fonts"
    font_out.mkdir(parents=True, exist_ok=True)
    for p in FONTS.glob("*.ttf"):
        shutil.copy2(p, font_out / p.name)


CSS = r"""
@font-face { font-family: "Saira Semi Condensed"; font-weight: 400; src: url("__FONT__/SairaSemiCondensed-400.ttf") format("truetype"); }
@font-face { font-family: "Saira Semi Condensed"; font-weight: 500; src: url("__FONT__/SairaSemiCondensed-500.ttf") format("truetype"); }
@font-face { font-family: "Saira Semi Condensed"; font-weight: 600; src: url("__FONT__/SairaSemiCondensed-600.ttf") format("truetype"); }
@font-face { font-family: "Saira Semi Condensed"; font-weight: 700; src: url("__FONT__/SairaSemiCondensed-700.ttf") format("truetype"); }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ececec; }
body { font-family: "Saira Semi Condensed", "Arial Narrow", sans-serif; color: #121212; }
.stage { padding: 28px 24px 36px; }
.email { width: 600px; margin: 0 auto; background: #fff; color: #121212; }
.mob .stage { padding: 0; }
.mob .email { width: 390px; }
.envelope { padding: 14px 28px 12px; border-bottom: 1px solid #ececec; }
.mob .envelope { padding: 12px 18px; }
.env-k { font-size: 10px; letter-spacing: .16em; color: #8a8a8a; font-weight: 500; }
.env-v { font-size: 13px; letter-spacing: .04em; font-weight: 600; line-height: 1.35; margin: 2px 0 8px; }
.top { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 28px 0; }
.mob .top { padding: 16px 18px 0; }
.word { font-weight: 700; font-size: 22px; letter-spacing: .12em; line-height: 1; }
.subw { margin-top: 4px; font-size: 11px; letter-spacing: .18em; color: #6d6d6d; font-weight: 500; }
.mark { width: 14px; height: 14px; background: #E10600; clip-path: polygon(100% 0, 0 100%, 100% 100%); }
.mob .center-copy, .mob h1.center { text-align: left; }
.hero { display: block; width: calc(100% - 56px); height: 168px; object-fit: cover; margin: 16px 28px 0; }
.mob .hero { width: calc(100% - 36px); height: 210px; margin: 14px 18px 0; }
.hero.tall { height: 240px; }
.mob .hero.tall { height: 250px; }
.hero.slim { height: 92px; }
.mob .hero.slim { height: 120px; }
.pad { padding: 18px 28px 8px; }
.mob .pad { padding: 16px 18px 6px; }
.eyebrow { font-size: 11px; letter-spacing: .18em; color: #6d6d6d; font-weight: 500; }
.rule { height: 1px; background: #111; margin: 10px 0 0; position: relative; }
.rule:after { content: ""; position: absolute; right: 0; top: -1px; width: 56px; height: 3px; background: #E10600; }
.status { display: inline-block; margin-top: 14px; border: 1px solid #111; padding: 4px 8px; font-size: 11px; letter-spacing: .14em; font-weight: 600; }
.status.alert { border-color: #E10600; color: #E10600; }
.status.quiet { border-color: #111; }
h1 { font-weight: 700; font-size: 40px; line-height: .92; letter-spacing: -.01em; margin: 14px 0 10px; }
.mob h1 { font-size: 32px; }
h1.center { text-align: center; }
.lede { font-weight: 500; font-size: 15px; letter-spacing: .06em; line-height: 1.45; color: #3a3a3a; margin: 0 0 12px; }
.mob .lede { font-size: 16px; letter-spacing: .04em; line-height: 1.4; }
p.body { font-weight: 400; font-size: 15px; letter-spacing: .045em; line-height: 1.45; margin: 0 0 10px; }
.mob p.body { font-size: 16px; letter-spacing: .03em; line-height: 1.42; }
.token { font-weight: 500; }
.center-copy { text-align: center; }
.cta { display: block; background: #E10600; color: #fff; text-align: center; text-decoration: none; font-weight: 600; letter-spacing: .14em; font-size: 13px; padding: 16px 18px; margin: 16px 28px 8px; }
.mob .cta { margin: 16px 18px 8px; font-size: 14px; padding: 18px 16px; }
.cta.secondary { background: #fff; color: #111; border: 1px solid #111; margin-top: 0; }
.path { font-size: 11px; letter-spacing: 0; font-weight: 400; color: #6d6d6d; margin: 0 28px 8px; word-break: break-all; }
.mob .path { margin: 0 18px 8px; font-size: 12px; }
.rows { margin: 8px 28px 4px; border-top: 1px solid #e5e5e5; }
.mob .rows { margin: 8px 18px; }
.row { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #e5e5e5; padding: 10px 0; font-size: 13px; letter-spacing: .08em; }
.mob .row { display: block; padding: 12px 0; }
.row b { font-weight: 600; }
.row span { font-weight: 400; text-align: right; }
.mob .row span { display: block; text-align: left; margin-top: 4px; font-size: 15px; letter-spacing: .03em; }
.rail { display: flex; gap: 8px; margin: 8px 28px; }
.mob .rail { display: block; margin: 8px 18px; }
.step { flex: 1; border-top: 2px solid #111; padding-top: 8px; font-size: 12px; letter-spacing: .1em; font-weight: 500; }
.mob .step { margin-bottom: 12px; }
.step em { display: block; font-style: normal; font-weight: 700; font-size: 18px; letter-spacing: .08em; }
.step.off { border-color: #ddd; color: #8a8a8a; }
.banner { margin: 8px 28px; padding: 12px 14px; background: #111; color: #fff; font-size: 13px; letter-spacing: .1em; font-weight: 600; }
.mob .banner { margin: 8px 18px; }
.banner.line { background: #fff; color: #E10600; border: 1px solid #E10600; }
.card { margin: 8px 28px; border: 1px solid #111; padding: 14px; }
.mob .card { margin: 8px 18px; }
.card .k { font-size: 11px; letter-spacing: .16em; color: #6d6d6d; font-weight: 500; }
.card .v { font-size: 20px; font-weight: 700; letter-spacing: .04em; margin-top: 4px; line-height: 1.15; }
.note { font-size: 13px; letter-spacing: .05em; font-weight: 400; line-height: 1.4; margin-top: 8px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 10px 28px; }
.mob .grid3 { grid-template-columns: 1fr; margin: 10px 18px; }
.cell img { width: 100%; height: 92px; object-fit: cover; display: block; }
.mob .cell img { height: 160px; }
.cell .n { font-weight: 700; font-size: 12px; letter-spacing: .12em; margin: 6px 0 2px; }
.cell p { margin: 0; font-size: 12px; letter-spacing: .05em; font-weight: 400; line-height: 1.35; }
.mob .cell p { font-size: 15px; }
.split { display: grid; grid-template-columns: 1.15fr .85fr; gap: 16px; margin: 8px 28px; align-items: start; }
.mob .split { grid-template-columns: 1fr; margin: 8px 18px; }
.foot { margin-top: 18px; border-top: 1px solid #111; padding: 14px 28px 20px; font-size: 11px; letter-spacing: .08em; line-height: 1.45; font-weight: 500; color: #3a3a3a; }
.mob .foot { padding: 14px 18px 22px; font-size: 12px; letter-spacing: .05em; }
.foot strong { font-weight: 700; color: #111; }
.cities { color: #8a8a8a; margin-top: 6px; }
"""


def paragraphs(lines: list[str]) -> str:
    return "\n".join(f'<p class="body">{esc(line)}</p>' for line in lines)


def rows(pairs: list[tuple[str, str]]) -> str:
    body = "\n".join(
        f'<div class="row"><b>{esc(a)}</b><span>{esc(b)}</span></div>' for a, b in pairs
    )
    return f'<div class="rows">{body}</div>'


def cta_block(t: dict) -> str:
    c = t["copy_contract"]
    primary = f'<a class="cta" href="#">{esc(c["primary_cta"])}</a>'
    secondary = ""
    if c.get("secondary_cta"):
        secondary = f'<a class="cta secondary" href="#">{esc(c["secondary_cta"])}</a>'
    path = f'<div class="path">{esc(c["destination_route"])}</div>'
    return primary + secondary + path


def module(layout: str, t: dict) -> str:
    c = t["copy_contract"]
    lines = c["body_outline"]
    hero = HERO[t["template_id"]]
    if layout == "invitation":
        return f'''
        <img class="hero" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad center-copy">
          <div class="eyebrow">01 · PERSONAL FOUNDATION</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1 class="center">{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          <p class="body">FOR {{{{business_name}}}}</p>
          {paragraphs(lines)}
        </div>
        {cta_block(t)}'''
    if layout == "progress-open":
        return f'''
        <div class="pad">
          <div class="eyebrow">02 · INTAKE</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
        </div>
        <div class="rail">
          <div class="step"><em>01</em>INTAKE OPEN</div>
          <div class="step off"><em>02</em>QUOTE LATER</div>
        </div>
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">{paragraphs(lines)}</div>
        {cta_block(t)}'''
    if layout == "progress-done":
        return f'''
        <div class="pad">
          <div class="eyebrow">02 · INTAKE</div>
          <div class="rule"></div>
          <div class="status quiet">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
        </div>
        <div class="rail">
          <div class="step"><em>01</em>INTAKE RECEIVED</div>
          <div class="step off"><em>02</em>QUOTE NOT IN THIS MESSAGE</div>
        </div>
        <div class="pad">{paragraphs(lines)}</div>
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "ledger":
        return f'''
        <div class="pad">
          <div class="eyebrow">03 · QUOTE</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("VERSION", "{{quote_version}}"), ("TOTAL", "{{quote_total_display}}"), ("STATE", "READY TO REVIEW"), ("ACCEPTED", "NOT STATED")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "revision":
        return f'''
        <div class="banner line">EARLIER ACCEPTANCE DOES NOT CARRY FORWARD UNLESS THE SYSTEM SAYS SO.</div>
        <div class="pad">
          <div class="eyebrow">03 · QUOTE REVISION</div>
          <div class="rule"></div>
          <div class="status alert">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("VERSION", "{{quote_version}}"), ("TOTAL", "{{quote_total_display}}"), ("PAYMENT", "NOT STATED")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "recorded":
        return f'''
        <div class="banner">ACCEPTANCE RECORDED · THIS IS NOT A PAYMENT RECEIPT</div>
        <div class="pad">
          <div class="eyebrow">03 · ACCEPTANCE</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("VERSION", "{{quote_version}}"), ("TERMS", "{{terms_version}}"), ("PAYMENT", "A SEPARATE STEP")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "checkout":
        return f'''
        <div class="split">
          <div>
            <div class="eyebrow">04 · CHECKOUT</div>
            <div class="rule"></div>
            <div class="status">{esc(STATUS[t["template_id"]])}</div>
            <h1>{esc(c["subject"])}</h1>
            <p class="lede">{esc(c["preheader"])}</p>
            {paragraphs(lines)}
          </div>
          <img src="__CROP__/{hero}.jpg" alt="" style="width:100%;height:180px;object-fit:cover;display:block" />
        </div>
        {rows([("PAYMENT RESULT", "NOT STATED"), ("CARD DATA", "NOT IN THIS MESSAGE"), ("NEXT", "CONTINUE TO PAYMENT")])}
        {cta_block(t)}'''
    if layout == "receipt":
        return f'''
        <div class="pad">
          <div class="eyebrow">04 · PAYMENT</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("AMOUNT", "{{payment_amount_display}}"), ("FOUNDATION", "NOT MARKED COMPLETE"), ("RECORD", "PAYMENT RECORD")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "alert":
        return f'''
        <div class="banner line">THE PAYMENT DID NOT COMPLETE</div>
        <div class="pad">
          <div class="eyebrow">04 · PAYMENT</div>
          <div class="rule"></div>
          <div class="status alert">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("CARD NUMBER", "NOT SHOWN"), ("SECOND CHARGE", "NOT STATED"), ("NEXT", "REVIEW PAYMENT")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "activation":
        return f'''
        <img class="hero tall" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">05 · PROJECT</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {cta_block(t)}'''
    if layout == "complete":
        return f'''
        <img class="hero tall" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">06 · COMPLETION</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
          <p class="body">NO OFFER IS ATTACHED TO THIS MESSAGE.</p>
        </div>
        {cta_block(t)}'''
    if layout == "records":
        return f'''
        <div class="pad">
          <div class="eyebrow">07 · RECORDS</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("VERIFICATION", "RECORDED"), ("DOCUMENT LIST", "NOT IN THIS MESSAGE"), ("WHERE", "INSIDE THE FOUNDATION")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "action":
        return f'''
        <div class="card">
          <div class="k">PENDING ACTION</div>
          <div class="v">{{{{action_title}}}}</div>
          <div class="note">{{{{client_message}}}}</div>
        </div>
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">08 · ACTION</div>
          <div class="rule"></div>
          <div class="status alert">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {cta_block(t)}'''
    if layout == "approve-wait":
        return f'''
        <div class="card">
          <div class="k">REVIEW ITEM</div>
          <div class="v">{{{{approval_subject}}}}</div>
          <div class="note">THIS MESSAGE DOES NOT SAY THE ITEM IS APPROVED.</div>
        </div>
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">09 · APPROVAL</div>
          <div class="rule"></div>
          <div class="status alert">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {cta_block(t)}'''
    if layout == "approve-done":
        return f'''
        <div class="banner">RECORDED COMPLETE · NOT A NEW REQUEST</div>
        <div class="pad">
          <div class="eyebrow">09 · RECORD</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("TITLE", "{{action_title}}"), ("STATE", "RECORDED COMPLETE"), ("SECOND EMAIL", "NOT SENT FOR A SEPARATE APPROVED EVENT")])}
        <img class="hero slim" src="__CROP__/{hero}.jpg" alt="" />
        {cta_block(t)}'''
    if layout == "mkt-credit":
        return f'''
        <img class="hero tall" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">10 · FOUNDATION CREDIT</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        {rows([("AMOUNT", "{{credit_amount_display}}"), ("WINDOW", "{{credit_window}}"), ("RECEIPT", "NOT A PAYMENT RECEIPT"), ("COMPLETION", "NOT A COMPLETION NOTICE")])}
        <div class="grid3">
          <div class="cell"><img src="__CROP__/steps.jpg" alt="" /><div class="n">01 · OPPORTUNITY</div><p>THE CREDIT IS A NEXT STEP ON THE PROJECT.</p></div>
          <div class="cell"><img src="__CROP__/place.jpg" alt="" /><div class="n">02 · RECORD</div><p>FIGURES COME FROM THE CREDIT RECORD ONLY.</p></div>
          <div class="cell"><img src="__CROP__/olive.jpg" alt="" /><div class="n">03 · CHOICE</div><p>THIS SEND REQUIRES MARKETING OPT-IN.</p></div>
        </div>
        {cta_block(t)}'''
    if layout == "mkt-discovery":
        return f'''
        <img class="hero tall" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">11 · BLDR DISCOVERY</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        <div class="grid3">
          <div class="cell"><img src="__CROP__/glass.jpg" alt="" /><div class="n">01 · INTEREST</div><p>BUILD INTEREST IS ON THE RECORD.</p></div>
          <div class="cell"><img src="__CROP__/feel.jpg" alt="" /><div class="n">02 · NOT BOOKED</div><p>THIS IS NOT A BOOKING CONFIRMATION.</p></div>
          <div class="cell"><img src="__CROP__/work.jpg" alt="" /><div class="n">03 · CONTINUE</div><p>THE CONVERSATION STAYS ON THE FOUNDATION.</p></div>
        </div>
        {cta_block(t)}'''
    if layout == "mkt-edu":
        return f'''
        <div class="pad">
          <div class="eyebrow">12 · BRIEFING</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        <div class="grid3">
          <div class="cell"><img src="__CROP__/steps.jpg" alt="" /><div class="n">01 · WHAT IT IS</div><p>A FOUNDATION FOR THE DIGITAL ADDRESS.</p></div>
          <div class="cell"><img src="__CROP__/olive.jpg" alt="" /><div class="n">02 · WHAT IT IS NOT</div><p>NO PRICE. NO PAYMENT STATUS. NO PROJECT PERCENTAGE.</p></div>
          <div class="cell"><img src="__CROP__/door.jpg" alt="" /><div class="n">03 · WHAT YOU DECIDE</div><p>THE NEXT STEP STAYS INSIDE THE PROJECT.</p></div>
        </div>
        {cta_block(t)}'''
    if layout == "mkt-bldr":
        return f'''
        <img class="hero tall" src="__CROP__/{hero}.jpg" alt="" />
        <div class="pad">
          <div class="eyebrow">13 · BLDR</div>
          <div class="rule"></div>
          <div class="status">{esc(STATUS[t["template_id"]])}</div>
          <h1>{esc(c["subject"])}</h1>
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        <div class="grid3">
          <div class="cell"><img src="__CROP__/place.jpg" alt="" /><div class="n">01 · PLACE</div><p>A DIGITAL LOCATION TO EXPLORE.</p></div>
          <div class="cell"><img src="__CROP__/feel.jpg" alt="" /><div class="n">02 · NO CLAIM</div><p>NO INTEREST IS CLAIMED. NO BOOKING IS CLAIMED.</p></div>
          <div class="cell"><img src="__CROP__/work.jpg" alt="" /><div class="n">03 · INTRODUCTION</div><p>THIS MESSAGE ONLY INTRODUCES BLDR.</p></div>
        </div>
        {cta_block(t)}'''
    if layout == "mkt-after":
        return f'''
        <div class="split">
          <img src="__CROP__/{hero}.jpg" alt="" style="width:100%;height:220px;object-fit:cover;display:block" />
          <div>
            <div class="eyebrow">14 · AFTER</div>
            <div class="rule"></div>
            <div class="status">{esc(STATUS[t["template_id"]])}</div>
            <h1>{esc(c["subject"])}</h1>
          </div>
        </div>
        <div class="pad">
          <p class="lede">{esc(c["preheader"])}</p>
          {paragraphs(lines)}
        </div>
        <div class="grid3">
          <div class="cell"><img src="__CROP__/lounge.jpg" alt="" /><div class="n">01 · COMPLETE</div><p>THE FOUNDATION SERVICE IS ALREADY COMPLETE.</p></div>
          <div class="cell"><img src="__CROP__/pool.jpg" alt="" /><div class="n">02 · OPTIONAL</div><p>THIS MESSAGE IS OPTIONAL.</p></div>
          <div class="cell"><img src="__CROP__/handles.jpg" alt="" /><div class="n">03 · NOT A REOPEN</div><p>IT DOES NOT REOPEN A PAYMENT OR A VERIFICATION CLAIM.</p></div>
        </div>
        {cta_block(t)}'''
    raise SystemExit(f"unknown layout {layout}")


def footer_line(t: dict) -> str:
    family = t["email_family"]
    tid = t["template_id"]
    if tid == "personal-foundation-invitation":
        return "ACCESS MESSAGE. NOT A MARKETING SEND. NO UNSUBSCRIBE."
    if tid in ("payment-confirmed", "payment-failed", "foundation-complete", "records-available"):
        return "SERVICE NOTICE. NO MARKETING UNSUBSCRIBE."
    if family == "MARKETING":
        return "MARKETING. REQUIRES OPT-IN. UNSUBSCRIBE AND MANAGE PREFERENCES."
    return "PROJECT OPERATIONS. NO MARKETING UNSUBSCRIBE."


def footer(t: dict) -> str:
    c = t["copy_contract"]
    opt_line = footer_line(t)
    return f'''
    <footer class="foot">
      <strong>SITE 00</strong> · DIGITAL FOUNDATION · BRANDS BUILT FOR WHAT'S NEXT.<br />
      CLASSIFICATION · {esc(c["message_classification"])}<br />
      {esc(opt_line)}<br />
      SENDER IDENTITY IS UNREGISTERED ON THE DIGITAL FOUNDATION COMMUNICATIONS DOMAIN.<br />
      <div class="cities">TEMPLATE · {esc(t["template_id"])} · {esc(t["design_archetype"])}</div>
    </footer>'''


def envelope(t: dict) -> str:
    c = t["copy_contract"]
    return f'''
    <div class="envelope">
      <div class="env-k">SUBJECT</div>
      <div class="env-v">{esc(c["subject"])}</div>
      <div class="env-k">PREHEADER</div>
      <div class="env-v">{esc(c["preheader"])}</div>
    </div>'''


def html_doc(t: dict, view: str) -> str:
    layout = LAYOUT[t["template_id"]]
    klass = "desk" if view == "desktop" else "mob"
    family = t["email_family"]
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\" />\n<title>"
        + esc(t["template_id"])
        + " "
        + view
        + "</title>\n<style>"
        + CSS
        + "</style>\n</head>\n<body class=\""
        + klass
        + "\">\n  <div class=\"stage\">\n    <article class=\"email\" data-template=\""
        + esc(t["template_id"])
        + "\" data-view=\""
        + view
        + "\">\n"
        + envelope(t)
        + "\n      <header class=\"top\">\n        <div>\n          <div class=\"word\">SITE 00</div>\n          <div class=\"subw\">"
        + esc(family)
        + " · DIGITAL FOUNDATION</div>\n        </div>\n        <div class=\"mark\" aria-hidden=\"true\"></div>\n      </header>\n"
        + module(layout, t)
        + "\n"
        + footer(t)
        + "\n    </article>\n  </div>\n</body>\n</html>\n"
    )


def write_sources(templates: list[dict]) -> None:
    by_id = {t["template_id"]: t for t in templates}
    src = PACK / "EDITABLE_SOURCE"
    if src.exists():
        shutil.rmtree(src)
    for index, tid in enumerate(ORDER, start=1):
        t = by_id[tid]
        folder = src / f"{index:02d}_{tid}"
        folder.mkdir(parents=True)
        for view in ("desktop", "mobile"):
            doc = html_doc(t, view)
            # Paths relative to EDITABLE_SOURCE/NN_id/
            doc = doc.replace("__FONT__", "../../SHARED_ASSETS/fonts")
            doc = doc.replace("__CROP__", "../../SHARED_ASSETS/crops")
            (folder / f"{view}.html").write_text(doc, encoding="utf-8")
        contract = {
            "template_id": tid,
            "index": index,
            "template_name": t["template_name"],
            "email_family": t["email_family"],
            "design_archetype": t["design_archetype"],
            "layout": LAYOUT[tid],
            "hero_crop": HERO[tid],
            "founder_review": "PENDING",
            "copy_contract": t["copy_contract"],
            "message_classification": t["message_classification"],
            "consent": t.get("consent"),
            "trigger_event": t["trigger_event"],
            "primary_cta": t["primary_cta"],
            "destination_route": t["copy_contract"]["destination_route"],
        }
        (PACK / "COPY_CONTRACTS" / f"{index:02d}_{tid}.json").write_text(
            json.dumps(contract, indent=2) + "\n", encoding="utf-8"
        )


def write_manifests(templates: list[dict]) -> None:
    man = PACK / "MANIFESTS"
    man.mkdir(parents=True, exist_ok=True)
    by_id = {t["template_id"]: t for t in templates}
    arche = {}
    rows = []
    for index, tid in enumerate(ORDER, start=1):
        t = by_id[tid]
        arche.setdefault(t["design_archetype"], []).append(tid)
        rows.append(
            {
                "index": index,
                "template_id": tid,
                "family": t["email_family"],
                "archetype": t["design_archetype"],
                "layout": LAYOUT[tid],
                "hero_crop": HERO[tid],
                "desktop": f"{family_dir(t['email_family'])}/DESKTOP/{index:02d}_{tid}.png",
                "mobile": f"{family_dir(t['email_family'])}/MOBILE/{index:02d}_{tid}.png",
            }
        )
    (man / "DESIGN_ARCHETYPE_MAP.json").write_text(
        json.dumps({"distinct_archetypes": len(arche), "map": arche, "templates": rows}, indent=2) + "\n",
        encoding="utf-8",
    )
    lines = ["# Design archetype map", "", f"Distinct archetypes: **{len(arche)}**.", ""]
    for name, ids in arche.items():
        lines.append(f"- `{name}`: " + ", ".join(f"`{i}`" for i in ids))
    lines.append("")
    lines.append("Each template also has its own layout key so shared archetypes are not the same composition.")
    lines.append("")
    (man / "DESIGN_ARCHETYPE_MAP.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (man / "ASSET_SOURCE_MANIFEST.json").write_text(
        json.dumps(
            {
                "openart_generations": 0,
                "credits_spent": 0,
                "reused": [
                    {"id": "DF-H01", "file": "SHARED_ASSETS/ORIGINALS/DF-H01_TRANSACTIONAL_HEADER.png", "role": "Provenance. Not pasted as an email."},
                    {"id": "DF-H02", "file": "SHARED_ASSETS/ORIGINALS/DF-H02_TRANSACTIONAL_MOBILE.png", "role": "Provenance. Sample layout. Not pasted."},
                    {"id": "DF-H03", "file": "SHARED_ASSETS/ORIGINALS/DF-H03_TRANSACTIONAL_DESKTOP.png", "role": "Provenance. Sample layout. Not pasted."},
                    {"id": "DF-I01", "file": "SHARED_ASSETS/ORIGINALS/DF-I01_EDUCATION.png", "role": "Photo crops: steps, olive, door."},
                    {"id": "DF-I02", "file": "SHARED_ASSETS/ORIGINALS/DF-I02_BLDR_JOURNEY.png", "role": "Photo crops: glass, sea, place, feel, work."},
                    {"id": "DF-I03", "file": "SHARED_ASSETS/ORIGINALS/DF-I03_POST_COMPLETION.png", "role": "Photo crops: pool, handles, lounge."},
                    {"id": "AUTHORITY", "file": "SHARED_ASSETS/ORIGINALS/SITE00_MARKETING_EMAIL_APPROVED_AUTHORITY_V1.jpg", "sha256": "e814042c318f7f45d7db07a6d11e4878fcc20888c583a76537828cfa3c2ede83", "role": "Registered marketing language. Composition reference. Not flattened into the twenty emails."},
                ],
                "crops": sorted(CROPS),
                "release_source": "df-v2-mass-cj-2026-10-11 SITE00_DF_V2_BATCH_H.zip and SITE00_DF_V2_BATCH_I.zip",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    if PACK.exists():
        shutil.rmtree(PACK)
    for folder in (
        "TRANSACTIONAL/DESKTOP",
        "TRANSACTIONAL/MOBILE",
        "OPERATIONAL/DESKTOP",
        "OPERATIONAL/MOBILE",
        "MARKETING/DESKTOP",
        "MARKETING/MOBILE",
        "SHARED_ASSETS",
        "CONTACT_SHEETS",
        "MANIFESTS",
        "COPY_CONTRACTS",
        "EDITABLE_SOURCE",
        "REVIEW_GUIDE",
    ):
        (PACK / folder).mkdir(parents=True, exist_ok=True)
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    templates = registry["templates"]
    ids = [t["template_id"] for t in templates]
    if ids != ORDER and set(ids) != set(ORDER):
        raise SystemExit(f"registry ids drifted: {ids}")
    # Preserve audited order if it matches ORDER; else reorder.
    by_id = {t["template_id"]: t for t in templates}
    ordered = [by_id[i] for i in ORDER]
    crop_assets()
    write_sources(ordered)
    write_manifests(ordered)
    print(f"sources {PACK}")


if __name__ == "__main__":
    main()
