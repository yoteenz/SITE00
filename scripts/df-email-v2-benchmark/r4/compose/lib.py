"""Email V2 R4 — small helpers for the hand-composed emails in pack.py.

The helpers only remove repetition (document shell, buttons, footers, image pairs). Every composition still
decides its own structure, order, scale and devices.
"""
from __future__ import annotations

from dataclasses import dataclass, field

NAME = '<span class="v">Halden &amp; Rowe</span>'
TOKEN = "hr7Kq2Lm9x"
HOST = "https://site00.com"
FOUNDATION = f"{HOST}/foundation/{TOKEN}"
INTAKE = f"{FOUNDATION}?step=intake"
A = "../assets"

FAMILY_FOOTER = {
    "service": "A SERVICE MESSAGE ABOUT {whose}.",
    "ops": "YOU'RE RECEIVING THIS BECAUSE PROJECT UPDATES ARE SWITCHED ON FOR {whose}. YOU CAN TURN THEM OFF IN YOUR FOUNDATION'S PREFERENCES.",
}


def v(sample: str) -> str:
    """A review sample value. build_r4.py swaps it for its token in the send template."""
    return f'<span class="v">{sample}</span>'


def printed_link(url: str = FOUNDATION, pad_top: int = 12) -> str:
    path = url.replace(HOST, "site00.com").replace(TOKEN, v(TOKEN))
    return f'<p class="sa anno" style="margin-top:{pad_top}px;">OR OPEN <span class="url" style="letter-spacing:.04em;">{path}</span></p>'


def button(label: str, href: str = FOUNDATION, kind: str = "k") -> str:
    bg = {"k": "#141414", "r": "#d90c0c", "o": "#ffffff"}[kind]
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fluid"><tr>'
        f'<td class="btn-{kind} sa cta" bgcolor="{bg}" style="background:{bg};"><a href="{href}">{label} <span style="letter-spacing:0;">→</span></a></td>'
        f"</tr></table>"
    )


def text_link(label: str, href: str = FOUNDATION) -> str:
    return f'<p class="sa cta tlink" style="font-size:12px;color:#141414;"><a href="{href}">{label} <span style="letter-spacing:0;">→</span></a></p>'


def stop() -> str:
    return '<span class="stop"></span>'


@dataclass
class Email:
    eid: str
    subject: str
    preheader: str
    css: list[str] = field(default_factory=list)
    mobile_css: list[str] = field(default_factory=list)
    rows: list[str] = field(default_factory=list)
    _n: int = 0

    def style(self, rule: str) -> None:
        self.css.append(rule)

    def mobile(self, rule: str) -> None:
        self.mobile_css.append(rule)

    def add(self, html: str) -> None:
        self.rows.append(html)

    def uid(self, prefix: str) -> str:
        self._n += 1
        return f"{prefix}{self._n}"

    def headline(self, inner: str, size: int, msize: int, *, weight: int = 900, tag: str = "h1", style: str = "", color: str = "#141414") -> str:
        cls = self.uid("h")
        lh = ".88" if weight == 900 else ".98"
        self.mobile(f".{cls} {{ font-size: {msize}px !important; }}")
        return f'<{tag} class="dp d{weight} {cls}" style="margin:0;font-size:{size}px;line-height:{lh};color:{color};{style}">{inner}</{tag}>'

    def picture(self, desk: tuple[str, int, int], alt: str, mob: tuple[str, int, int] | None = None, *, max_w: int = 640) -> str:
        src, w, h = desk
        if not mob:
            return f'<img src="{A}/{src}" width="{w}" height="{h}" class="fluid" alt="{alt}" style="width:100%;max-width:{max_w}px;">'
        msrc, mw, mh = mob
        return (
            f'<img class="desk" src="{A}/{src}" width="{w}" height="{h}" alt="{alt}" style="width:{w}px;height:{h}px;">'
            f'<div class="mob"><img src="{A}/{msrc}" width="{mw}" height="{mh}" class="fluid" alt="{alt}" style="width:100%;"></div>'
        )

    def footer(self, kind: str, reason: str = "", named: bool = True) -> str:
        """named=False for templates whose contract does not supply business_name."""
        if kind == "marketing":
            return (
                '<tr><td class="px" style="padding:40px 48px 40px 48px;">'
                f'<p class="sa cap" style="letter-spacing:.1em;">{reason}</p>'
                '<p class="sa cap" style="margin-top:8px;letter-spacing:.1em;"><a href="{{preference_url}}">MANAGE PREFERENCES → <span class="tok">{{preference_url}}</span></a> · '
                '<a href="{{unsubscribe_url}}">UNSUBSCRIBE → <span class="tok">{{unsubscribe_url}}</span></a></p>'
                '<p class="sa micro" style="margin-top:12px;color:#141414;">SITE 00 · <span class="tok">{{postal_address}}</span> · <span class="url" style="letter-spacing:.08em;">site00.com</span></p>'
                "</td></tr>"
            )
        whose = f"THE DIGITAL FOUNDATION OF {NAME}" if named else "YOUR DIGITAL FOUNDATION"
        text = FAMILY_FOOTER[kind].format(whose=whose)
        return (
            '<tr><td class="px" style="padding:36px 48px 38px 48px;">'
            f'<p class="sa cap" style="letter-spacing:.1em;">{text}</p>'
            '<p class="sa micro" style="margin-top:10px;color:#141414;">SITE 00 · <span class="url" style="letter-spacing:.08em;">site00.com</span></p>'
            "</td></tr>"
        )

    def html(self, note: str) -> str:
        mobile = "\n".join(f"  {r}" for r in self.mobile_css)
        css = "\n".join(self.css)
        rows = "\n\n".join(self.rows)
        return f"""<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, address=no, email=no, date=no">
<title>{self.subject}</title>
<style>
/*BASE*/
/* {note} */
{css}
@media (max-width: 480px) {{
{mobile}
}}
</style>
</head>
<body>
<div class="stage">
  <div class="inbox">
    <div class="from">FROM · SENDER ADDRESS PENDING REGISTRATION</div>
    <div class="subj">{self.subject}</div>
    <div class="pre">{self.preheader}</div>
  </div>

  <!-- MESSAGE -->
  <table role="presentation" class="wrap" width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="width:640px;margin:0 auto;background:#ffffff;">
    <tr><td style="display:none;font-size:1px;line-height:1px;max-height:0;overflow:hidden;mso-hide:all;" class="sa">{self.preheader}</td></tr>

{rows}
  </table>
</div>
</body>
</html>
"""
