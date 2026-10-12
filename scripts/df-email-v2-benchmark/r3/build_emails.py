"""Email V2 R3 — build the three compositions from compose/ into emails/.

compose/B0x_R3.html  editable source; `/*BASE*/` is replaced with compose/base.css
emails/B0x_R3.html   review build: sample data underlined, inbox chrome shown
emails/templates/B0x_R3.template.html   send template: tokens restored, chrome and sample styling removed

Usage: python3 build_emails.py
"""
from __future__ import annotations

import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
COMPOSE = HERE / "compose"
OUT = HERE / "emails"
TEMPLATES = OUT / "templates"

SAMPLES = {
    "Halden &amp; Rowe": "{{business_name}}",
    "studio@haldenrowe.com": "{{recipient_email}}",
    "hr7Kq2Lm9x": "{{public_token}}",
}
IDS = ["B01_R3", "B02_R3", "B03_R3"]


def to_template(html: str) -> str:
    html, n = re.subn(r'<div class="inbox">.*?(?=<!-- MESSAGE -->)', "", html, count=1, flags=re.S)
    if n != 1:
        raise SystemExit("inbox chrome not found before <!-- MESSAGE -->")
    html = re.sub(r"<!--REVIEW-->.*?<!--/REVIEW-->", "", html, flags=re.S)
    html = re.sub(r'<span class="v">(.*?)</span>', r"\1", html)
    for sample, token in SAMPLES.items():
        html = html.replace(sample, token)
    html = html.replace("../assets/", "{{asset_base}}/").replace("../fonts/", "{{font_base}}/")
    return html


def main() -> None:
    base = (COMPOSE / "base.css").read_text(encoding="utf-8")
    TEMPLATES.mkdir(parents=True, exist_ok=True)
    for eid in IDS:
        if not (COMPOSE / f"{eid}.html").exists():
            raise SystemExit(f"{eid}: compose source missing")
        src = (COMPOSE / f"{eid}.html").read_text(encoding="utf-8")
        if "/*BASE*/" not in src:
            raise SystemExit(f"{eid}: missing /*BASE*/ marker")
        bad = [c for c in src if (ord(c) < 32 and c not in "\n\t") or c == "\ufffd"]
        if bad:
            raise SystemExit(f"{eid}: control or replacement characters {sorted(set(map(hex, map(ord, bad))))}")
        html = src.replace("/*BASE*/", base.strip())
        (OUT / f"{eid}.html").write_text(html, encoding="utf-8")
        tpl = to_template(html)
        left = [s for s in SAMPLES if s in tpl]
        if left:
            raise SystemExit(f"{eid}: sample values left in template: {left}")
        (TEMPLATES / f"{eid}.template.html").write_text(tpl, encoding="utf-8")
        print(f"{eid}: {len(html) // 1024} KB review · {len(tpl) // 1024} KB template")


if __name__ == "__main__":
    main()
