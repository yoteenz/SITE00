"""Email V2 R4 — the seventeen compositions that did not exist before R4.

B01 (personal-foundation-invitation), B02 (foundation-complete) and B03 (M06) continue from their R3 HTML sources
in this folder. Every function here returns one finished email. Copy stays inside
docs/site00/idnty/visual-authority/email-pack/DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md: subjects and primary CTAs
are the contract's; facts are only the ones the contract or validated benchmark copy states.
"""
from __future__ import annotations

from lib import FOUNDATION, INTAKE, NAME, Email, button, printed_link, stop, text_link, v

PAD = "padding:{t}px 48px 0 48px;"


def pad(t: int, b: int = 0) -> str:
    return f"padding:{t}px 48px {b}px 48px;"


def mast(left: str, right: str = "", icon: str = "", top: int = 34) -> str:
    ic = f'<td valign="middle" width="34" style="width:34px;"><img src="../assets/{icon}" width="24" height="24" alt=""></td>' if icon else ""
    r = f'<td valign="middle" align="right" class="sa micro desk" style="color:#141414;text-align:right;padding-left:16px;white-space:nowrap;">{right}</td>' if right else ""
    under = f'<span class="mob-i" style="display:none;mso-hide:all;"><br><span style="color:#6f6c67;">{right}</span></span>' if right else ""
    return (
        f'<tr><td class="px" style="{pad(top)}">'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{ic}'
        f'<td valign="middle" class="sa micro" style="color:#141414;">{left}{under}</td>{r}</tr></table></td></tr>'
    )


def label(text: str, color: str = "#141414") -> str:
    return (
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
        '<td width="28" style="width:28px;"><div style="width:18px;height:3px;background:#d90c0c;font-size:0;line-height:0;">&nbsp;</div></td>'
        f'<td class="sa sh" style="color:{color};">{text}</td></tr></table>'
    )


# ───────────────────────────────── TRANSACTIONAL ─────────────────────────────────


def intake_started() -> Email:
    e = Email("intake-started", "YOUR INTAKE IS OPEN", "YOUR ANSWERS ARE WHERE YOU LEFT THEM. PICK UP AT THE NEXT QUESTION.")
    e.style(".ajar-cap { padding: 10px 0 0 0; }")
    e.mobile(".ajar { padding: 22px 0 0 0 !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "BRIEFING · IN PROGRESS", "r3/icon-door-swing.png", top=38))
    e.add(f'<tr><td class="px" style="{pad(46)}">'
          + e.headline(f"YOU'VE MADE<br>A START{stop()}", 72, 52)
          + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><table role="presentation" class="fluid" width="452" cellpadding="0" cellspacing="0" border="0" style="width:452px;"><tr>'
          f'<td><p class="sa intro">THE BRIEFING FOR {NAME} IS OPEN, AND IT PICKS UP EXACTLY WHERE YOU LEFT IT.</p></td></tr></table></td></tr>')
    e.add('<tr><td class="ajar" align="right" style="padding:40px 0 0 96px;">'
          + e.picture(("gen/door_floor.jpg", 544, 233), "LOW SUN THROUGH AN OPEN RED GLASS DOOR, CASTING RED LIGHT ACROSS A PALE STONE FLOOR.", ("gen/door_floor_m.jpg", 390, 234))
          + '<p class="sa fig ajar-cap px" style="text-align:left;">FIG. 01 · <b>■</b> THE DOOR, LEFT AS YOU LEFT IT</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(40)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="top" class="col flush" width="300" style="width:300px;padding-right:28px;">'
          '<p class="sa body">ANSWER THE NEXT QUESTION WHEN YOU HAVE A MINUTE, OR SIT DOWN WITH THE REST IN ONE GO. WHICHEVER SUITS THE WAY YOU WORK.</p></td>'
          '<td valign="top" class="col mt-m" style="padding-top:4px;"><div class="note">'
          "<p>IF A QUESTION ASKS FOR SOMETHING NOBODY ON YOUR TEAM QUITE REMEMBERS, SAY SO. WORKING THAT OUT IS OUR PART OF THE JOB.</p>"
          "</div></td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}">' + button("CONTINUE INTAKE", INTAKE, "r") + printed_link(INTAKE) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}"><p class="sa micro" style="color:#141414;">SITE 00</p><p class="sa cap" style="margin-top:4px;">DIGITAL FOUNDATION</p></td></tr>')
    e.add(e.footer("ops"))
    return e


def intake_completed() -> Email:
    e = Email("intake-completed", "YOUR INTAKE IS RECEIVED", "THANK YOU. THE NEXT THING YOU'LL HEAR FROM US IS YOUR QUOTE.")
    e.style(".stamp { border: 3px double #141414; padding: 18px 22px 16px; }")
    e.style(".rail td { vertical-align: top; }")
    e.style(".rail .dot { width: 30px; padding-top: 3px; }")
    e.style(".rail .t { padding-bottom: 20px; }")
    e.style(".rail .t b { font-weight: 600; font-size: 11px; letter-spacing: .24em; color: #141414; }")
    e.mobile(".stamp-word { font-size: 64px !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "", "r3/icon-envelope-plan.png", top=36))
    e.add(f'<tr><td class="px" style="{pad(40)}">'
          '<table role="presentation" class="stamp" cellpadding="0" cellspacing="0" border="0"><tr><td>'
          '<p class="sa micro" style="color:#141414;">BRIEFING · <span style="letter-spacing:.06em;font-weight:500;">' + NAME + "</span></p>"
          '<p class="dp d900 stamp-word" style="margin-top:12px;font-size:92px;line-height:.82;color:#d90c0c;">RECEIVED</p>'
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}">' + e.headline("THANK YOU. WE HAVE YOUR ANSWERS.", 40, 32, weight=800) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(20)}"><table role="presentation" class="fluid" width="470" cellpadding="0" cellspacing="0" border="0" style="width:470px;"><tr><td>'
          "<p class=\"sa body\">WE'LL READ THROUGH WHAT YOU'VE TOLD US AND PREPARE A QUOTE FOR YOUR FOUNDATION. IT ARRIVES IN ITS OWN EMAIL, WITH THE TOTAL AND WHAT IT COVERS.</p>"
          "</td></tr></table></td></tr>")
    rail = [
        ("#d90c0c", "01 · RECEIVED", "YOUR BRIEFING, AS OF TODAY."),
        ("#141414", "02 · READ", "SITE 00 GOES THROUGH IT, LINE BY LINE."),
        ("#c9c6c0", "03 · QUOTE", "SENT TO YOU AS ITS OWN EMAIL."),
    ]
    cells = "".join(
        f'<tr><td class="dot"><div style="width:12px;height:12px;background:{c};font-size:0;line-height:0;">&nbsp;</div></td>'
        f'<td class="t sa"><b>{k}</b><p class="sa body" style="margin-top:4px;color:#3a3a3a;">{t}</p></td></tr>'
        for c, k, t in rail
    )
    e.add(f'<tr><td class="px" style="{pad(40)}">' + label("WHAT HAPPENS NEXT")
          + f'<table role="presentation" class="rail" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">{cells}</table></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(18)}">' + button("VIEW YOUR FOUNDATION", FOUNDATION, "o") + "</td></tr>")
    e.add(e.footer("ops"))
    return e


def quote_ready() -> Email:
    e = Email("quote-ready", "YOUR QUOTE IS READY", "WHAT WE'LL SET UP FOR YOU, AND WHAT IT COSTS. READ IT WHEN YOU'RE READY.")
    e.style(".total { font-size: 54px; line-height: .9; }")
    e.mobile(".total { font-size: 44px !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "QUOTE · VERSION " + v("3"), "gfx/icon-scale-rule.png", top=34))
    e.add('<tr><td style="padding:28px 0 0 0;">'
          + e.picture(("gen/model.jpg", 640, 426), "A WHITE ARCHITECTURAL SCALE MODEL OF A PAVILION ON A TRAVERTINE PLINTH, ONE VOLUME IN RED GLASS, WITH A STEEL RULE AND A BRASS PENCIL BESIDE IT.", ("gen/model_m.jpg", 390, 266))
          + "</td></tr>")
    e.add(f'<tr><td class="px" style="padding:12px 48px 0 48px;"><p class="sa fig">FIG. 01 · <b>■</b> THE SCOPE, AT SCALE</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(40)}">' + e.headline(f"THE WORK,<br>MEASURED{stop()}", 78, 56) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><p class="sa intro">WE\'VE TURNED YOUR BRIEFING INTO A QUOTE FOR {NAME}: WHAT WE\'LL SET UP, AND WHAT IT COSTS.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="spec" width="100%" cellpadding="0" cellspacing="0" border="0">'
          f'<tr><td class="k sa">PREPARED FOR</td><td class="val sa">{NAME}</td></tr>'
          f'<tr><td class="k sa">VERSION</td><td class="val sa">{v("3")}</td></tr>'
          f'<tr><td class="k sa">TOTAL</td><td class="val"><span class="dp d900 total">{v("$2,400.00")}</span></td></tr>'
          '<tr><td class="k sa">STATUS</td><td class="val sa">WAITING FOR YOUR REVIEW</td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="top" class="col flush" width="300" style="width:300px;padding-right:28px;"><p class="sa body">READ IT AT YOUR OWN PACE. NOTHING IS AGREED UNTIL YOU ACCEPT IT IN YOUR FOUNDATION, AND PAYMENT IS A SEPARATE STEP AFTER THAT.</p></td>'
          '<td valign="top" class="col mt-m"><div class="note"><p>THE TOTAL HERE IS COPIED FROM YOUR QUOTE. IF THE TWO EVER DISAGREE, THE QUOTE IN YOUR FOUNDATION IS THE ONE THAT COUNTS.</p></div></td>'
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}">' + button("REVIEW YOUR QUOTE") + printed_link() + "</td></tr>")
    e.add(e.footer("ops"))
    return e


def quote_updated() -> Email:
    e = Email("quote-updated", "YOUR QUOTE WAS UPDATED", "VERSION " + v("3") + " REPLACES THE ONE YOU HAVE. HAVE A LOOK BEFORE YOU GO ON.")
    e.style(".rev td { border-top: 1px solid #e4e2dd; padding: 11px 0 10px; vertical-align: baseline; }")
    e.style(".rev tr.cur td { border-top: 1.5px solid #141414; border-bottom: 1.5px solid #141414; }")
    e.style(".rev .r { width: 92px; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "REVISION", "gfx/icon-revision.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(40)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="top" class="col" width="260" style="width:260px;">'
          + e.picture(("gen/model_detail.jpg", 260, 174), "CLOSE VIEW OF THE RED GLASS VOLUME IN A WHITE ARCHITECTURAL MODEL.", max_w=260)
          + '<p class="sa fig" style="margin-top:10px;">FIG. 02 · <b>■</b> ONE PART, RECONSIDERED</p></td>'
          '<td valign="bottom" class="col mt-m flush" style="padding-left:30px;">'
          + e.headline(f"A NEW VERSION OF YOUR QUOTE{stop()}", 50, 40)
          + "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(34)}"><p class="sa intro">WE\'VE REVISED YOUR QUOTE. PLEASE READ VERSION {v("3")} BEFORE YOU GO ANY FURTHER.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(34)}">' + label("REVISION TABLE")
          + '<table role="presentation" class="rev" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">'
          '<tr><td class="r sa micro">EARLIER</td><td class="sa body" style="color:#8a8780;text-decoration:line-through;">THE VERSION YOU HAD BEFORE</td><td class="sa micro" align="right" style="text-align:right;">REPLACED</td></tr>'
          f'<tr class="cur"><td class="r dp d800" style="font-size:24px;color:#d90c0c;">V{v("3")}</td><td class="sa body" style="color:#141414;"><span class="sa micro" style="color:#141414;">CURRENT · TOTAL</span><br><span style="font-weight:600;">{v("$2,400.00")}</span></td><td class="sa micro" align="right" style="text-align:right;color:#141414;">READ THIS ONE</td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(30)}"><table role="presentation" class="fluid" width="460" cellpadding="0" cellspacing="0" border="0" style="width:460px;"><tr><td>'
          "<p class=\"sa body\">IF YOU HAD ALREADY ACCEPTED AN EARLIER VERSION, YOUR FOUNDATION SHOWS WHETHER THAT ACCEPTANCE STILL STANDS.</p></td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}">' + button("REVIEW THE UPDATED QUOTE") + printed_link() + "</td></tr>")
    e.add(e.footer("ops", named=False))
    return e


def quote_accepted() -> Email:
    e = Email("quote-accepted", "YOUR QUOTE ACCEPTANCE IS RECORDED", "THANK YOU. THE NEXT STEP IS CHECKOUT, WHENEVER YOU'RE READY.")
    e.style(".sig td { vertical-align: bottom; }")
    e.style(".sig .ln { border-bottom: 1.5px solid #141414; height: 46px; }")
    e.style(".sig .lb { padding-top: 9px; }")
    e.mobile(".sig-gap { display: block !important; height: 26px !important; width: 100% !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "ACCEPTANCE", "gfx/icon-countersign.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(44)}">' + e.headline(f"AGREED{stop()}", 118, 72) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><p class="sa intro">THANK YOU. YOUR ACCEPTANCE OF QUOTE VERSION {v("3")} IS ON RECORD, UNDER TERMS {v("2026-10")}.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(44)}"><table role="presentation" class="sig" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td class="col" width="262" style="width:262px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
          '<tr><td class="ln" valign="bottom"><img src="../assets/gfx/icon-scale-rule.png" width="28" height="28" alt="" style="margin-bottom:8px;"></td></tr>'
          f'<tr><td class="lb"><p class="sa micro" style="color:#141414;">SITE 00</p><p class="sa cap" style="margin-top:3px;">QUOTE · VERSION {v("3")}</p></td></tr></table></td>'
          '<td class="sig-gap" width="20" style="width:20px;font-size:0;line-height:0;">&nbsp;</td>'
          '<td class="col" width="262" style="width:262px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
          '<tr><td class="ln" valign="bottom"><img src="../assets/gfx/icon-countersign.png" width="28" height="28" alt="" style="margin-bottom:8px;"></td></tr>'
          f'<tr><td class="lb"><p class="sa micro" style="color:#141414;">YOU</p><p class="sa cap" style="margin-top:3px;">ACCEPTED · TERMS {v("2026-10")}</p></td></tr></table></td>'
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(44)}"><table role="presentation" class="fluid" width="452" cellpadding="0" cellspacing="0" border="0" style="width:452px;"><tr><td>'
          "<p class=\"sa body\">THE NEXT STEP IS PAYMENT, WHICH HAPPENS SEPARATELY AT CHECKOUT. KEEP THIS EMAIL AS YOUR NOTE OF WHAT WAS AGREED; THE RECEIPT FOLLOWS ONCE PAYMENT IS CONFIRMED.</p>"
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}">' + button("CONTINUE TO CHECKOUT") + "</td></tr>")
    e.add(e.footer("ops", named=False))
    return e


def checkout_link_ready() -> Email:
    e = Email("checkout-link-ready", "YOUR CHECKOUT IS READY", "THE QUOTE YOU ACCEPTED, READY FOR PAYMENT WHEN YOU ARE.")
    e.style(".ticket { border: 1.5px solid #141414; }")
    e.style(".ticket .stub { border-left: 1.5px dashed #141414; width: 120px; text-align: center; }")
    e.mobile(".ticket .stub { width: 86px !important; }")
    e.add('<tr><td style="padding:0;">' + e.picture(("gen/threshold_slot.jpg", 640, 86), "A FLUSH PLATE OF RED GLASS SET INTO A TRAVERTINE THRESHOLD, LIT BY LOW SUN.") + "</td></tr>")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "CHECKOUT", "gfx/icon-ticket.png", top=30))
    e.add(f'<tr><td class="px" style="{pad(42)}">' + e.headline(f"CHECKOUT<br>IS OPEN{stop()}", 84, 60) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><p class="sa intro">WHENEVER YOU\'RE READY, PAYMENT FOR {NAME} IS WAITING IN YOUR FOUNDATION.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="ticket" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td style="padding:20px 22px 18px;">'
          '<p class="sa micro">ADMIT ONE · DIGITAL FOUNDATION</p>'
          f'<p class="sa" style="margin-top:10px;font-weight:600;font-size:20px;letter-spacing:.02em;color:#141414;">{NAME}</p>'
          '<p class="sa cap" style="margin-top:6px;">FOR THE QUOTE YOU ACCEPTED</p></td>'
          '<td class="stub" valign="middle"><img src="../assets/gfx/icon-ticket.png" width="34" height="34" alt="" style="margin:0 auto;"><p class="sa micro" style="margin-top:8px;color:#d90c0c;">OPEN</p></td>'
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(30)}"><table role="presentation" class="fluid" width="452" cellpadding="0" cellspacing="0" border="0" style="width:452px;"><tr><td>'
          "<p class=\"sa body\">THE BUTTON TAKES YOU STRAIGHT TO PAYMENT. ONCE IT HAS GONE THROUGH, WE'LL CONFIRM IT BY EMAIL.</p></td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}">' + button("CONTINUE TO PAYMENT") + printed_link() + "</td></tr>")
    e.add(e.footer("ops"))
    return e


def payment_confirmed() -> Email:
    e = Email("payment-confirmed", "YOUR PAYMENT IS CONFIRMED", "THANK YOU. THE PAYMENT IS RECORDED AGAINST YOUR FOUNDATION.")
    e.style(".amt { font-size: 96px; line-height: .84; letter-spacing: -.01em; }")
    e.style(".perf { border-top: 2px dotted #141414; font-size: 0; line-height: 0; }")
    e.mobile(".amt { font-size: 64px !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "RECEIPT", "gfx/icon-ticket.png", top=34))
    e.add('<tr><td style="padding:26px 0 0 0;">'
          + e.picture(("gen/threshold.jpg", 640, 360), "A PLATE OF RED GLASS SET FLUSH INTO A TRAVERTINE THRESHOLD, WHERE A SHADED FLOOR MEETS A SUNLIT TERRACE ABOVE THE SEA.", ("gen/threshold_m.jpg", 390, 314))
          + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(44)}"><p class="sa micro" style="color:#d90c0c;">■ RECEIVED WITH THANKS</p>'
          f'<p class="dp d900 amt" style="margin-top:14px;color:#141414;">{v("$2,400.00")}</p>'
          f'<p class="sa cap" style="margin-top:26px;">FOR YOUR DIGITAL FOUNDATION</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(34)}"><div class="perf">&nbsp;</div></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(34)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="top" class="col flush" width="250" style="width:250px;padding-right:26px;">' + e.headline("THANK YOU. THE PAYMENT IS IN.", 36, 32, weight=800, tag="h2") + "</td>"
          '<td valign="top" class="col mt-m"><p class="sa body">IT\'S RECORDED AGAINST YOUR FOUNDATION. WHEN THE PROJECT OPENS, YOU\'LL HEAR FROM US IN ITS OWN EMAIL.</p>'
          '<p class="sa body" style="margin-top:14px;color:#5e5e5e;">KEEP THIS MESSAGE FOR YOUR RECORDS.</p></td>'
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}">' + button("OPEN YOUR PROJECT") + "</td></tr>")
    e.add(e.footer("service", named=False))
    return e


def payment_failed() -> Email:
    e = Email("payment-failed", "YOUR PAYMENT NEEDS ATTENTION", "THE PAYMENT DIDN'T COMPLETE. YOU CAN REVIEW IT FROM YOUR FOUNDATION.")
    e.style(".facts td { border-top: 1px solid #e4e2dd; padding: 14px 0 13px; vertical-align: top; }")
    e.style(".facts tr:last-child td { border-bottom: 1px solid #e4e2dd; }")
    e.style(".facts .k { width: 150px; }")
    e.mobile(".facts .k { width: 112px !important; }")
    e.add(f'<tr><td class="px" style="{pad(34)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="middle" width="26" style="width:26px;"><div style="width:12px;height:12px;border:2px solid #d90c0c;font-size:0;line-height:0;">&nbsp;</div></td>'
          '<td valign="middle" class="sa micro" style="color:#141414;">PAYMENT · NOT COMPLETED</td>'
          '<td valign="middle" align="right" class="sa micro" style="text-align:right;">SITE 00</td></tr></table></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(18)}"><div class="rule-k">&nbsp;</div></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(46)}">' + e.headline("YOUR PAYMENT DIDN'T GO THROUGH.", 52, 40, weight=800) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(24)}"><p class="sa intro">THE PAYMENT FOR THE DIGITAL FOUNDATION OF {NAME} DIDN\'T COMPLETE. YOU CAN REVIEW IT AND TRY AGAIN FROM YOUR FOUNDATION.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(34)}"><table role="presentation" class="facts" width="100%" cellpadding="0" cellspacing="0" border="0">'
          '<tr><td class="k sa micro">WHAT HAPPENED</td><td class="sa body">THE PAYMENT DIDN\'T COMPLETE.</td></tr>'
          '<tr><td class="k sa micro">WHAT TO DO</td><td class="sa body">REVIEW THE PAYMENT IN YOUR FOUNDATION.</td></tr>'
          '<tr><td class="k sa micro">YOUR CARD</td><td class="sa body">WE NEVER PUT CARD DETAILS IN EMAIL.</td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(38)}">' + button("REVIEW PAYMENT") + printed_link() + "</td></tr>")
    e.add(e.footer("service"))
    return e


def project_activated() -> Email:
    e = Email("project-activated", "YOUR PROJECT IS ACTIVE", "THE GROUND IS MARKED OUT. HERE IS WHAT WILL BE BUILT ON IT.")
    e.style(".stages td { vertical-align: top; width: 20%; padding-right: 8px; }")
    e.style(".stages .bar { height: 3px; background: #e4e2dd; font-size: 0; line-height: 0; }")
    e.style(".stages .first .bar { background: #d90c0c; }")
    e.style(".stages .n { font-size: 30px; line-height: 1; margin-top: 12px; color: #c9c6c0; }")
    e.style(".stages .first .n { color: #d90c0c; }")
    e.style(".stages .s { font-weight: 600; font-size: 10.5px; line-height: 1.45; letter-spacing: .14em; color: #141414; margin-top: 8px; }")
    e.mobile(".stages td { display: block !important; width: 100% !important; padding: 0 0 14px 0 !important; }")
    e.mobile(".stages .n { display: inline-block !important; width: 44px; margin-top: 10px !important; font-size: 24px !important; }")
    e.mobile(".stages .s { display: inline-block !important; margin-top: 0 !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "PROJECT · ACTIVE", "gfx/icon-plumb.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(42)}">' + e.headline(f"THE GROUND<br>IS MARKED OUT{stop()}", 74, 50) + "</td></tr>")
    e.add('<tr><td style="padding:34px 0 0 0;">'
          + e.picture(("gen/setout.jpg", 640, 360), "EARLY MORNING ON A CLEARED CLIFF-TOP SITE: RED STRING LINES ON STEEL PINS MARK OUT A RECTANGLE, WITH ONE TRAVERTINE CORNER FOOTING SET AND THE SEA BEYOND.", ("gen/setout_m.jpg", 390, 342))
          + "</td></tr>")
    e.add(f'<tr><td class="px" style="padding:12px 48px 0 48px;"><p class="sa fig">FIG. 01 · <b>■</b> SETTING OUT</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(36)}"><p class="sa intro">YOUR FOUNDATION PROJECT IS ACTIVE. FROM HERE, THE WORK BEGINS ON THE GROUND {NAME} WILL STAND ON.</p></td></tr>')
    stages = ["DOMAIN", "PROFESSIONAL EMAIL", "DNS AND SECURITY", "DEVICES AND SIGNATURE", "FINAL VERIFICATION"]
    cells = "".join(
        f'<td class="{"first" if i == 0 else ""}"><div class="bar">&nbsp;</div><div class="n dp d800">{i + 1:02d}</div><div class="s sa"><span>{s}</span></div></td>'
        for i, s in enumerate(stages)
    )
    e.add(f'<tr><td class="px" style="{pad(40)}">' + label("WHAT WILL BE BUILT")
          + f'<table role="presentation" class="stages" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr>{cells}</tr></table></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(32)}"><table role="presentation" class="fluid" width="460" cellpadding="0" cellspacing="0" border="0" style="width:460px;"><tr><td>'
          "<p class=\"sa body\">YOUR FOUNDATION IS WHERE THE PROJECT LIVES WHILE WE WORK. WE'LL WRITE AGAIN WHEN THE FOUNDATION IS COMPLETE, AND YOUR RECORDS FOLLOW IN AN EMAIL OF THEIR OWN.</p>"
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(38)}">' + button("OPEN YOUR PROJECT") + "</td></tr>")
    e.add(e.footer("ops"))
    return e


def records_available() -> Email:
    e = Email("records-available", "YOUR RECORDS ARE AVAILABLE", "FILED IN ONE PLACE, BEHIND YOUR OWN LINK, FOR THE DAY YOU NEED THEM.")
    e.style(".card { border: 1.5px solid #141414; }")
    e.style(".card .tab { background: #d90c0c; width: 10px; font-size: 0; line-height: 0; }")
    e.style(".card .ix td { border-top: 1px solid #e4e2dd; padding: 11px 0 10px; }")
    e.add('<tr><td style="padding:0;">'
          + e.picture(("gen/archive.jpg", 640, 426), "A QUIET ARCHIVE OF TRAVERTINE FLAT-FILE DRAWERS, ONE DRAWER OPEN WITH STACKED DRAWINGS AND A SMALL RED GLASS INDEX TAB, THE SEA THROUGH A WIDE WINDOW.", ("gen/archive_m.jpg", 390, 350))
          + "</td></tr>")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "RECORDS", "gfx/icon-drawer.png", top=30))
    e.add(f'<tr><td class="px" style="{pad(38)}">' + e.headline(f"FILED, AND<br>YOURS TO OPEN{stop()}", 70, 48) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><p class="sa intro">VERIFICATION OF YOUR FOUNDATION IS COMPLETE, AND THE RECORDS FOR {NAME} ARE READY TO OPEN.</p></td></tr>')
    items = ["WHERE EACH ACCOUNT LIVES", "WHO ADMINISTERS IT", "HOW IT ALL CONNECTS"]
    ix = "".join(f'<tr><td class="sa body" style="color:#141414;">{t}</td><td align="right" class="sa micro" style="text-align:right;">{i + 1:02d}</td></tr>' for i, t in enumerate(items))
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td class="tab">&nbsp;</td><td style="padding:18px 22px 10px;">'
          f'<p class="sa micro" style="color:#141414;">INDEX · <span style="letter-spacing:.06em;font-weight:500;">{NAME}</span></p>'
          f'<table role="presentation" class="ix" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">{ix}</table>'
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(32)}"><table role="presentation" class="fluid" width="460" cellpadding="0" cellspacing="0" border="0" style="width:460px;"><tr><td>'
          "<p class=\"sa body\">WE DON'T SEND THE RECORDS THEMSELVES BY EMAIL. THEY STAY IN YOUR FOUNDATION, BEHIND YOUR OWN LINK, SO THERE IS ONE PLACE TO FIND THEM ON THE DAY YOU NEED THEM.</p>"
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(38)}">' + button("OPEN YOUR RECORDS") + "</td></tr>")
    e.add(e.footer("service"))
    return e


# ───────────────────────────────── OPERATIONAL ─────────────────────────────────


def client_action_required() -> Email:
    e = Email("client-action-required", "A FOUNDATION ACTION NEEDS YOU", "ONE REQUEST IS WAITING ON YOU. IT'S QUICKEST TO HANDLE IN YOUR FOUNDATION.")
    e.style(".pinned { background: #f4f2ee; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "REQUEST · OPEN", "gfx/icon-pin.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(44)}">' + e.headline(f"ONE THING<br>NEEDS YOU{stop()}", 72, 52) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="pinned" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 26px 26px 26px;">'
          '<div style="width:14px;height:14px;background:#d90c0c;margin:0 auto 0 0;font-size:0;line-height:0;">&nbsp;</div>'
          '<p class="sa micro" style="margin-top:20px;">THE REQUEST</p>'
          f'<p class="sa" style="margin-top:10px;font-weight:600;font-size:22px;line-height:1.3;letter-spacing:.01em;color:#141414;text-transform:none;">{v("Confirm the names for your new mailboxes")}</p>'
          '<p class="sa micro" style="margin-top:20px;">THE NOTE WITH IT</p>'
          f'<p class="sa" style="margin-top:8px;font-weight:400;font-size:15px;line-height:1.6;letter-spacing:.01em;color:#3a3a3a;text-transform:none;">{v("We need the exact spelling for each person before we create their address.")}</p>'
          "</td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(32)}"><table role="presentation" class="fluid" width="460" cellpadding="0" cellspacing="0" border="0" style="width:460px;"><tr><td>'
          f"<p class=\"sa body\">IT'S WAITING ON YOUR DIGITAL FOUNDATION, AND IT STAYS OPEN UNTIL YOU'VE DEALT WITH IT.</p></td></tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fluid"><tr>'
          '<td class="col" valign="middle">' + button("COMPLETE THE REQUEST") + "</td>"
          '<td class="col mt-m flush" valign="middle" style="padding-left:26px;">' + text_link("OPEN YOUR PROJECT") + "</td>"
          "</tr></table></td></tr>")
    e.add(e.footer("ops", named=False))
    return e


def approval_requested() -> Email:
    e = Email("approval-requested", "YOUR APPROVAL IS REQUESTED", "SOMETHING ON YOUR FOUNDATION IS READY FOR YOUR SIGN-OFF.")
    e.style(".dec { border-top: 1.5px solid #141414; border-bottom: 1.5px solid #141414; }")
    e.style(".how td { vertical-align: top; padding-bottom: 16px; }")
    e.style(".how .n { width: 46px; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "FOR YOUR DECISION", "gfx/icon-decision.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(46)}"><p class="sa kick">WHEN YOU HAVE A MOMENT,</p>'
          + e.headline(f'YOUR <span style="white-space:nowrap;">SIGN-OFF,</span><br>PLEASE{stop()}', 64, 46, style="margin-top:12px;") + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="dec" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="middle" width="64" style="width:64px;padding:20px 0;"><img src="../assets/gfx/icon-decision.png" width="40" height="40" alt=""></td>'
          f'<td valign="middle" style="padding:20px 0;"><p class="sa micro">FOR APPROVAL</p><p class="sa" style="margin-top:8px;font-weight:600;font-size:22px;line-height:1.3;color:#141414;text-transform:none;">{v("Your email signature layout")}</p></td>'
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(32)}"><p class="sa intro">WE\'VE PREPARED SOMETHING ON YOUR DIGITAL FOUNDATION THAT NEEDS YOUR APPROVAL.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(32)}">' + label("HOW TO DECIDE")
          + '<table role="presentation" class="how" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">'
          '<tr><td class="n"><span class="num dp d800" style="font-size:14px;">01</span></td><td><p class="sa body">LOOK IT OVER IN YOUR FOUNDATION, AS CLOSELY AS YOU LIKE.</p></td></tr>'
          '<tr><td class="n"><span class="num dp d800" style="font-size:14px;">02</span></td><td><p class="sa body">APPROVE IT WHEN IT\'S RIGHT. NOTHING COUNTS AS APPROVED UNTIL YOU DO.</p></td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(24)}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fluid"><tr>'
          '<td class="col" valign="middle">' + button("REVIEW AND APPROVE") + "</td>"
          '<td class="col mt-m flush" valign="middle" style="padding-left:26px;">' + text_link("OPEN YOUR PROJECT") + "</td>"
          "</tr></table></td></tr>")
    e.add(e.footer("ops", named=False))
    return e


def approval_completed() -> Email:
    e = Email("approval-completed", "YOUR ACTION IS RECORDED", "DONE, AND ON RECORD. THANK YOU.")
    e.style(".rec td { border-top: 1px solid #e4e2dd; padding: 12px 0 11px; vertical-align: baseline; }")
    e.style(".rec tr:last-child td { border-bottom: 1px solid #e4e2dd; }")
    e.add(f'<tr><td class="px" style="{pad(40)}"><p class="sa micro" style="color:#141414;">SITE 00 · DIGITAL FOUNDATION</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(40)}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="top" width="96" style="width:96px;"><img src="../assets/gfx/icon-recorded.png" width="72" height="72" alt=""></td>'
          '<td valign="middle">' + e.headline(f"DONE.<br>THANK YOU{stop()}", 56, 40) + "</td>"
          "</tr></table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(34)}"><table role="presentation" class="rec" width="100%" cellpadding="0" cellspacing="0" border="0">'
          f'<tr><td class="sa micro" width="110" style="width:110px;">ITEM</td><td class="sa" style="font-weight:500;font-size:15px;color:#141414;text-transform:none;">{v("Confirm the names for your new mailboxes")}</td></tr>'
          '<tr><td class="sa micro">STATUS</td><td class="sa micro" style="color:#d90c0c;">■ COMPLETE</td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(28)}"><p class="sa body">IT\'S ON RECORD IN YOUR FOUNDATION, AND THE PROJECT CARRIES ON FROM HERE.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(32)}">' + button("VIEW PROJECT STATUS", FOUNDATION, "o") + "</td></tr>")
    e.add(e.footer("ops", named=False))
    return e


# ───────────────────────────────── MARKETING ─────────────────────────────────


def band(label_text: str, href: str = FOUNDATION) -> str:
    return (
        '<tr><td class="band" bgcolor="#d90c0c" style="background:#d90c0c;">'
        f'<a href="{href}" class="px" style="padding:30px 48px 29px 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        f'<td class="sa cta" style="color:#ffffff;font-size:14px;">{label_text}</td>'
        '<td align="right" class="sa" style="color:#ffffff;font-size:22px;line-height:1;">→</td></tr></table></a></td></tr>'
    )


def foundation_credit_issued() -> Email:
    e = Email("foundation-credit-issued", "A FOUNDATION CREDIT IS ON YOUR PROJECT", "SET ASIDE IN YOUR NAME, AND KEPT FOR YOU IN YOUR FOUNDATION.")
    e.style(".plate td { border-top: 1.5px solid #141414; padding: 16px 0 14px; vertical-align: baseline; }")
    e.style(".plate tr:last-child td { border-bottom: 1.5px solid #141414; }")
    e.style(".credit-amt { font-size: 66px; line-height: .86; }")
    e.mobile(".credit-amt { font-size: 52px !important; }")
    e.mobile(".credit-txt { padding: 30px 24px 0 24px !important; }")
    e.add(mast("SITE 00 · DIGITAL FOUNDATION", "A NOTE FROM SITE 00", "gfx/icon-token.png", top=34))
    e.add('<tr><td style="padding:34px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="bottom" class="col px credit-txt" style="padding:0 30px 0 48px;">'
          '<p class="sa micro" style="color:#d90c0c;">■ HELD FOR YOU</p>'
          + e.headline(f"SET<br>ASIDE,<br>IN YOUR<br>NAME{stop()}", 78, 60, style="margin-top:16px;")
          + "</td>"
          '<td valign="top" class="desk" width="280" style="width:280px;">' + e.picture(("gen/credit_col.jpg", 280, 435), "A BLOCK OF RED GLASS RESTING ON A TRAVERTINE PLINTH IN A CONCRETE NICHE, GLOWING IN A SHAFT OF AFTERNOON SUN.", max_w=280) + "</td>"
          "</tr></table></td></tr>")
    e.add('<tr><td style="padding:0;"><div class="mob" style="padding-top:28px;">'
          + e.picture(("gen/credit_m.jpg", 390, 263), "A BLOCK OF RED GLASS RESTING ON A TRAVERTINE PLINTH IN A CONCRETE NICHE, GLOWING IN A SHAFT OF AFTERNOON SUN.")
          + "</div></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(40)}"><p class="sa intro">A FOUNDATION CREDIT IS NOW ON YOUR PROJECT. IT\'S KEPT FOR YOU IN YOUR FOUNDATION, WITH ITS TERMS BESIDE IT.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="plate" width="100%" cellpadding="0" cellspacing="0" border="0">'
          f'<tr><td class="sa micro" width="150" style="width:150px;">CREDIT</td><td><span class="dp d900 credit-amt">{v("$250.00")}</span></td></tr>'
          f'<tr><td class="sa micro">HELD UNTIL</td><td class="sa" style="font-weight:600;font-size:17px;letter-spacing:.06em;color:#141414;">{v("30 APRIL 2027")}</td></tr>'
          "</table></td></tr>")
    e.add(f'<tr><td class="px" style="{pad(30)}"><table role="presentation" class="fluid" width="440" cellpadding="0" cellspacing="0" border="0" style="width:440px;"><tr><td>'
          "<p class=\"sa body\">THERE'S NOTHING TO CLAIM AND NO CODE TO REMEMBER. WHEN YOU WANT TO SEE IT, IT'S WAITING IN YOUR FOUNDATION.</p></td></tr></table></td></tr>")
    e.add('<tr><td style="padding:44px 0 0 0;"></td></tr>')
    e.add(band("VIEW YOUR CREDIT"))
    e.add(e.footer("marketing", "YOU'RE RECEIVING THIS BECAUSE YOU ASKED SITE 00 TO KEEP YOU UP TO DATE ABOUT YOUR FOUNDATION."))
    return e


def bldr_discovery() -> Email:
    e = Email("bldr-discovery", "YOUR BUILD INTEREST IS RECORDED", "YOU MENTIONED YOU MIGHT BUILD. HERE'S WHERE THAT CONVERSATION STARTS.")
    e.style(".plans td { vertical-align: top; }")
    e.style(".plan-l { font-weight: 600; font-size: 10px; letter-spacing: .24em; color: #141414; padding-top: 8px; }")
    e.add(mast("SITE 00 · BLDR", "PREPARED FOR " + NAME, "r3/icon-north.png", top=34))
    e.add('<tr><td style="padding:26px 0 0 0;">' + e.picture(("gen/pavilion_band.jpg", 640, 288), "A LOW PAVILION WITH RED GLASS WALLS AND A CANTILEVERED CONCRETE ROOF, ITS TERRACE RUNNING TO AN INFINITY EDGE ABOVE THE SEA.") + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(44)}">' + e.headline(f"YOU MENTIONED<br>YOU MIGHT BUILD{stop()}", 66, 46) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(28)}"><p class="sa intro">WE NOTED IT ON YOUR FOUNDATION, SO WHEN YOU\'RE READY TO TALK IT THROUGH, THE CONVERSATION STARTS FROM WHAT WE ALREADY KNOW ABOUT {NAME}.</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(30)}"><table role="presentation" class="fluid" width="460" cellpadding="0" cellspacing="0" border="0" style="width:460px;"><tr><td>'
          "<p class=\"sa body\">BLDR IS WHERE SITE 00 DESIGNS WHAT PEOPLE FIND WHEN THEY ARRIVE AT YOUR ADDRESS. NOTHING IS BOOKED, AND THERE IS NO DATE IN THE DIARY. CONSIDER THIS THE DOOR, LEFT OPEN.</p>"
          "</td></tr></table></td></tr>")
    plans = [("plan-a-gallery", "A · GALLERY", "FLOOR PLAN A: ROOMS IN A ROW ALONG ONE LONG HALL."),
             ("plan-b-courtyard", "B · COURTYARD", "FLOOR PLAN B: ROOMS AROUND AN OPEN CENTRE."),
             ("plan-c-open-hall", "C · OPEN HALL", "FLOOR PLAN C: ONE LARGE ROOM WITH SERVICE ALONG TWO EDGES.")]
    cells = '<td width="4%" style="width:4%;"></td>'.join(
        f'<td valign="top" width="30%"><img src="../assets/r3/{f}.png" width="168" height="121" class="fluid" alt="{a}" style="width:100%;max-width:168px;"><div class="sa plan-l">{lbl}</div></td>'
        for f, lbl, a in plans)
    e.add(f'<tr><td class="px" style="{pad(40)}">' + label("THREE WAYS A SITE CAN BE PLANNED")
          + f'<table role="presentation" class="plans" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>{cells}</tr></table>'
          '<p class="sa fig" style="margin-top:14px;">ILLUSTRATIVE PLANS · YOURS WOULD START FROM YOUR BUSINESS</p></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(40)}">' + button("CONTINUE WITH BLDR", FOUNDATION, "r") + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(36)}"><p class="sa micro" style="color:#141414;">SITE 00</p><p class="sa cap" style="margin-top:4px;">BLDR</p></td></tr>')
    e.add(e.footer("marketing", "YOU'RE RECEIVING THIS BECAUSE YOU TOLD SITE 00 YOU MIGHT BUILD, AND YOU'VE ASKED TO HEAR FROM US."))
    return e


def m01_education() -> Email:
    e = Email("M01", "HOW THE DIGITAL FOUNDATION WORKS", "FOUR LAYERS NOBODY SEES, AND WHY EVERYTHING ELSE STANDS ON THEM.")
    e.style(".legend td { vertical-align: top; padding-bottom: 22px; }")
    e.style(".legend .n { width: 46px; padding-top: 2px; }")
    e.style(".legend .k { font-size: 22px; line-height: 1; }")
    e.style(".legend .t { padding-top: 6px; }")
    e.style(".isnt { background: #f4f2ee; }")
    e.mobile(".isnt-h { font-size: 30px !important; }")
    e.add(mast("SITE 00 · FIELD GUIDE", "THE DIGITAL FOUNDATION", "gfx/icon-layers.png", top=34))
    e.add(f'<tr><td class="px" style="{pad(42)}">' + e.headline(f"WHAT'S UNDER<br>THE FLOOR{stop()}", 80, 56) + "</td></tr>")
    e.add(f'<tr><td class="px" style="{pad(26)}"><p class="sa intro">EVERY BUSINESS STANDS ON A FEW THINGS NOBODY SEES: AN ADDRESS, THE RECORDS BEHIND IT, THE MAIL THAT LEAVES FROM IT. HERE IS HOW THEY FIT TOGETHER, ONE LAYER AT A TIME.</p></td></tr>')
    e.add('<tr><td style="padding:38px 0 0 0;">' + e.picture(("gfx/section-r4.jpg", 640, 360), "A SECTIONAL MODEL OF A SMALL PAVILION CUT THROUGH THE MIDDLE, SHOWING EARTH, A GRAVEL BED, A CONCRETE FOUNDATION AND A TRAVERTINE FLOOR. FOUR RED MARKERS NUMBER THE LAYERS.") + "</td></tr>")
    e.add(f'<tr><td class="px" style="padding:12px 48px 0 48px;"><p class="sa fig">FIG. 01 · <b>■</b> A FOUNDATION IN SECTION</p></td></tr>')
    layers = [
        ("THE GROUND", "DOMAIN", "YOUR ADDRESS ON THE INTERNET, REGISTERED IN YOUR NAME."),
        ("THE BED", "DNS AND SECURITY", "THE RECORDS THAT SAY WHERE YOUR MAIL AND SITE LIVE, AND WHICH MAIL IS GENUINELY YOURS."),
        ("THE SLAB", "PROFESSIONAL EMAIL", "MAILBOXES ON YOUR OWN DOMAIN: THE SURFACE YOU WORK FROM EVERY DAY."),
        ("THE FLOOR", "DEVICES AND SIGNATURE", "YOUR MAIL ON THE DEVICES YOU USE, SIGNED THE WAY YOU'D SIGN IT."),
    ]
    rows = "".join(
        f'<tr><td class="n"><span class="num dp d800" style="font-size:14px;">{i + 1:02d}</span></td>'
        f'<td><p class="sa micro">{a}</p><p class="dp d800 k" style="margin-top:6px;">{b}</p><p class="sa body t">{c}</p></td></tr>'
        for i, (a, b, c) in enumerate(layers))
    e.add(f'<tr><td class="px" style="{pad(36)}"><table role="presentation" class="legend" width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table></td></tr>')
    e.add(f'<tr><td class="px" style="{pad(10)}"><table role="presentation" class="isnt" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:28px 28px 30px 28px;">'
          '<p class="sa micro" style="color:#d90c0c;">■ WHAT A FOUNDATION ISN\'T</p>'
          + e.headline("IT ISN'T A WEBSITE,<br>AND IT DOESN'T<br>PROMISE CUSTOMERS.", 34, 28, weight=800, tag="h2", style="margin-top:14px;")
          + '<p class="sa body" style="margin-top:14px;">IT\'S THE GROUND A WEBSITE STANDS ON, ALONG WITH EVERYTHING ELSE THAT CARRIES YOUR NAME.</p>'
          "</td></tr></table></td></tr>")
    e.add('<tr><td style="padding:44px 0 0 0;"></td></tr>')
    e.add(band("LEARN THE FOUNDATION"))
    e.add(e.footer("marketing", "YOU'RE RECEIVING THIS BECAUSE YOU ASKED SITE 00 FOR GUIDES ABOUT YOUR FOUNDATION."))
    return e


def m13_after() -> Email:
    e = Email("M13", "AFTER THE FOUNDATION", "THE GROUND IS LAID. A SHORT NOTE ON WHAT IT'S FOR, NOW THAT IT'S THERE.")
    e.style(".night { background: #141414; }")
    e.style(".night .intro, .night .body { color: #f1efeb; }")
    e.style(".vign td { vertical-align: top; padding-bottom: 24px; }")
    e.style(".vign .k { font-size: 24px; line-height: 1; color: #ffffff; }")
    e.style(".vign .rule-w { border-top: 1px solid #3a3a3a; font-size: 0; line-height: 0; }")
    e.add('<tr><td style="padding:0;">' + e.picture(("gen/after.jpg", 640, 360), "THE RED GLASS PAVILION AT DUSK, LIT WARM FROM INSIDE, A LOW TABLE WITH TWO GLASSES ON THE TERRACE AND THE SEA IN THE LAST LIGHT.", ("gen/after_m.jpg", 390, 314)) + "</td></tr>")
    e.add('<tr><td class="night px" bgcolor="#141414" style="padding:40px 48px 0 48px;">'
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
          '<td valign="middle" width="34" style="width:34px;"><img src="../assets/gfx/icon-horizon.png" width="24" height="24" alt="" style="background:#f1efeb;"></td>'
          '<td class="sa micro" style="color:#c9c6c0;">SITE 00 · AFTER THE FOUNDATION</td></tr></table>'
          + e.headline(f"THE WORK IS DONE.<br>THIS IS WHAT<br>IT WAS FOR{stop()}", 66, 46, color="#ffffff", style="margin-top:30px;")
          + f'<p class="sa intro" style="margin-top:28px;">YOUR FOUNDATION IS COMPLETE, AND THIS EMAIL ASKS NOTHING OF YOU. IT\'S A NOTE ABOUT WHAT THE GROUND UNDER {NAME} IS FOR, NOW THAT IT\'S THERE.</p>'
          "</td></tr>")
    vign = [
        ("A NAME PEOPLE CAN FIND", "YOUR DOMAIN IS THE ADDRESS PEOPLE TYPE TO FIND YOU, AND IT'S REGISTERED TO YOU."),
        ("MAIL THAT ARRIVES AS YOU", "MAILBOXES ON YOUR OWN DOMAIN, WITH THE RECORDS THAT HELP THEM REACH INBOXES."),
        ("ROOM TO BUILD", "WHEN YOU WANT TO PUT SOMETHING ON IT, BLDR IS WHERE SITE 00 DESIGNS IT WITH YOU."),
    ]
    rows = "".join(
        f'<tr><td><div class="rule-w">&nbsp;</div><p class="dp d800 k" style="margin-top:18px;">{k}</p><p class="sa body" style="margin-top:8px;">{t}</p></td></tr>'
        for k, t in vign)
    e.add(f'<tr><td class="night px" bgcolor="#141414" style="padding:40px 48px 16px 48px;"><table role="presentation" class="vign" width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table></td></tr>')
    e.add('<tr><td style="padding:0;">' + e.picture(("gen/after_strip.jpg", 640, 108), "THE TERRACE EDGE AND STILL WATER AT DUSK, WARM LIGHT REFLECTED IN THE POOL.") + "</td></tr>")
    e.add(band("SEE WHAT COMES NEXT"))
    e.add(e.footer("marketing", "YOU'RE RECEIVING THIS BECAUSE YOU ASKED SITE 00 TO SHARE WHAT COMES AFTER THE FOUNDATION."))
    return e


COMPOSITIONS = [
    intake_started, intake_completed, quote_ready, quote_updated, quote_accepted, checkout_link_ready,
    payment_confirmed, payment_failed, project_activated, records_available,
    client_action_required, approval_requested, approval_completed,
    foundation_credit_issued, bldr_discovery, m01_education, m13_after,
]
