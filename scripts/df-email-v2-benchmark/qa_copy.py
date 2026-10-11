#!/usr/bin/env python3
"""Email V2 benchmark — copy, uppercase, customer-language, and visual-variety QA.

Patterns mirror the expression engine's own detectors:
  api/_lib/site00ExpressionEngine/brandLanguage/rhetoricalPatternLineage.ts
  api/_lib/site00ExpressionEngine/brandLanguage/crossBrandVoiceContaminationQA.ts
plus the internal-language list from the founder correction.
"""
from __future__ import annotations

import itertools
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "source"
REPO = HERE.parents[1]
OUT = REPO / "docs/site00/idnty/visual-authority/email-v2/qa"

EMAILS = {
    "B01": "B01_personal-foundation-invitation",
    "B02": "B02_foundation-complete",
    "B03": "B03_M06-bldr-introduction",
}

CASE_EXEMPT = {"v", "url", "tok"}
REVIEW_CHROME = {"from", "note"}

INTERNAL_LANGUAGE = [
    r"\bIS CLAIMED\b", r"\bNO INTEREST\b", r"\bNO BOOKING\b", r"\bIS INTRODUCED\b",
    r"\bRECORDED COMPLETE\b", r"\bNO UPSELL\b", r"\bUPSELL\b", r"\bCLASSIFICATION\b",
    r"PLANNED_CONTRACT", r"\bSENDER IDENTITY\b", r"\bUNREGISTERED\b", r"\bREQUIRES MARKETING OPT-IN\b",
    r"\bOPT-IN\b", r"\bTEMPLATE\b", r"\bPLACEHOLDER\b", r"\bSAMPLE LAYOUT\b", r"\bTRANSACTIONAL\b",
    r"\bPAYLOAD\b", r"\bTRIGGER\b", r"\b[A-Z]+_[A-Z_]+\b", r"\bTHIS MESSAGE DOES NOT\b", r"\bIS NOT CONFIRMED\b",
    r"\bIN THIS MESSAGE\b", r"\bIS CONFIRMED IN\b", r"\bIN THIS EMAIL\b", r"\bTHIS SEND\b",
]
AI_RHETORICAL = {
    "you-didnt-x-you-y": r"YOU DIDN'T .+?\. YOU ",
    "its-not-x-its-y": r"IT'S NOT .+?\. IT'S ",
    "not-x-y": r"(^|\. )NOT [^.]+\. [^.]+\.",
    "x-already-told-you": r"THE .+ ALREADY TOLD YOU",
    "this-isnt-x-its-y": r"THIS ISN'T .+?\. IT'S ",
    "because-x": r"(^|\. )BECAUSE [^.]+\.$",
    "meet-x": r"(^|\. )MEET [^.]+\.$",
}
NDX_LEAK = [r"\bRECEIPT\b", r"\bYOU CALLED\b", r"\bCOMPETENCE THEATER\b", r"\bHOT TAKE:", r"\bCONFESSION\b", r"\bDIAGNOSTIC\b"]
GENERIC = [
    r"^DISCOVER\b", r"^INTRODUCING\b", r"^WE ARE EXCITED\b", r"^WE'RE EXCITED\b", r"^SHOP NOW\b",
    r"\bTIMELESS\b", r"\bELEVATE\b", r"\bINDULGE\b", r"\bCURATED\b", r"\bSEAMLESS\b", r"\bUNLOCK\b",
    r"\bJOURNEY\b", r"\bEMPOWER\b", r"\bWHERE SOPHISTICATION MEETS\b", r"\bNEXT LEVEL\b", r"\bGAME[- ]CHANGER\b",
]
URGENCY = [
    r"\bHURRY\b", r"\bLIMITED\b", r"\bLAST CHANCE\b", r"\bACT NOW\b", r"\bDON'T MISS\b", r"\bEXPIRES?\b",
    r"\bBOOK(ED|ING)?\b", r"\bRESERVE[D]?\b", r"\bYOUR SPOT\b", r"\bYOUR REQUEST\b", r"\bSPOTS? LEFT\b",
]
B02_FORBIDDEN = [r"\bBLDR\b", r"\bCREDIT\b", r"\bOFFER\b", r"\bUPGRADE\b", r"\bWHAT'S NEXT\b", r"\bDISCOUNT\b"]


class Extract(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stack: list[tuple[str, set[str]]] = []
        self.skip = 0
        self.segments: list[dict] = []
        self.blocks: list[str] = []
        self.imgs: list[dict] = []
        self.classes: set[str] = set()
        self._block: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = set((a.get("class") or "").split())
        self.classes |= cls
        if tag in ("style", "title", "script"):
            self.skip += 1
        if tag == "img":
            parent_role = any("plans" in c for _, c in self.stack)
            self.imgs.append({"src": a.get("src"), "alt": a.get("alt"), "decorative_in_labelled_group": parent_role})
            return
        if tag in ("p", "h1", "h2", "div", "a", "br"):
            self._flush()
        if tag == "br":
            return
        self.stack.append((tag, cls))

    def handle_endtag(self, tag):
        if tag in ("style", "title", "script"):
            self.skip -= 1
        if tag in ("p", "h1", "h2", "div", "a"):
            self._flush()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.skip or not data.strip():
            return
        active = set().union(*(c for _, c in self.stack)) if self.stack else set()
        self.segments.append({
            "text": data,
            "exempt": bool(active & CASE_EXEMPT),
            "chrome": bool(active & REVIEW_CHROME),
            "inbox": "inbox" in active,
        })
        if not (active & REVIEW_CHROME):
            self._block.append(data if not (active & CASE_EXEMPT) else "{{FIELD}}")

    def _flush(self):
        text = re.sub(r"\s+", " ", "".join(self._block)).strip()
        if text:
            self.blocks.append(text)
        self._block = []


def contrast(fg: str, bg: str = "#ffffff") -> float:
    def lum(h: str) -> float:
        h = h.lstrip("#")
        rgb = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
        lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]

    a, b = sorted((lum(fg), lum(bg)), reverse=True)
    return round((a + 0.05) / (b + 0.05), 2)


def sentences(blocks: list[str]) -> list[str]:
    out = []
    for b in blocks:
        out += [s.strip() for s in re.split(r"(?<=[.!?])\s+", b) if len(s.strip()) > 3]
    return out


def ngrams(text: str, n: int = 5) -> set[str]:
    words = re.findall(r"[A-Z0-9']+", text)
    return {" ".join(words[i : i + n]) for i in range(len(words) - n + 1)}


def structure(classes: set[str], imgs: list[dict], html: str) -> dict:
    cta = "INLINE_RED_BUTTON" if "letter" in classes else "BLACK_BUTTON" if "seal" in classes else "FULL_WIDTH_RED_BAND"
    desk_imgs = [i for i in imgs if "_m." not in (i["src"] or "") and "band" not in (i["src"] or "")]
    return {
        "composition": "PERSONAL_LETTER" if "letter" in classes else "MILESTONE_RECORD" if "ledger" in classes else "EDITORIAL_FEATURE",
        "desktop_images": len(desk_imgs),
        "photographs": len([i for i in desk_imgs if (i["src"] or "").endswith(".jpg")]),
        "code_native_art": len([i for i in desk_imgs if (i["src"] or "").endswith((".svg", ".png"))]),
        "full_bleed_hero": "hero" in classes,
        "numbered_items": len(re.findall(r'class="(?:n|no)">0\d<', html)),
        "cta": cta,
        "signoff": "sign" in classes,
        "stone_band_section": "reveal" in classes,
        "two_column_letter": "letter" in classes,
        "ledger": "ledger" in classes,
    }


def main() -> int:
    report: dict = {"emails": {}, "cross": {}}
    failures: list[str] = []
    all_text: dict[str, str] = {}

    for key, name in EMAILS.items():
        html = (SOURCE / f"{name}.html").read_text()
        p = Extract()
        p.feed(html)
        p._flush()
        customer_blocks = [b for b in p.blocks if b]
        text = " ".join(customer_blocks)
        all_text[key] = text
        e: dict = {"blocks": len(customer_blocks), "words": len(re.findall(r"[A-Z']+", text))}

        lower_hits = [s["text"].strip() for s in p.segments if not s["exempt"] and s["text"] != s["text"].upper()]
        e["uppercase_violations"] = lower_hits
        e["preserved_case_fields"] = sorted({s["text"].strip() for s in p.segments if s["exempt"]})

        def hits(patterns, where=text):
            return sorted({m.group(0) for pat in patterns for m in re.finditer(pat, where, re.M)})

        e["internal_language"] = hits(INTERNAL_LANGUAGE)
        e["ndx_voice_leak"] = hits(NDX_LEAK)
        e["generic_or_any_brand"] = sorted({m for b in customer_blocks for m in hits(GENERIC, b)})
        e["ai_rhetorical_patterns"] = sorted({pid for pid, pat in AI_RHETORICAL.items() for b in customer_blocks if re.search(pat, b)})
        if key == "B03":
            e["manufactured_urgency_or_booking"] = hits(URGENCY)
        if key == "B02":
            e["upsell_terms"] = hits(B02_FORBIDDEN)

        sents = [s for s in sentences(customer_blocks) if len(s.split()) >= 4]
        dup = sorted({s for s in sents if sents.count(s) > 1})
        e["repeated_sentences"] = dup
        h1 = re.search(r"<h1>(.*?)</h1>", html, re.S)
        headline = re.sub(r"<[^>]+>", " ", h1.group(1))
        headline = re.sub(r"\s+", " ", headline).strip(" .") if h1 else ""
        e["headline"] = headline
        subj = re.search(r'class="subj">(.*?)</div>', html, re.S)
        e["subject"] = re.sub(r"<[^>]+>", "", subj.group(1)).strip() if subj else ""
        norm = lambda s: re.sub(r"[^A-Z ]", "", s.upper()).strip()
        body_only = norm(text).replace(norm(headline), "", 1)
        e["headline_restated_in_body"] = norm(headline) in body_only
        openings = [b.split()[0] for b in customer_blocks if len(b.split()) > 8]
        e["paragraph_openings"] = openings
        e["opening_diversity"] = round(len(set(openings)) / max(len(openings), 1), 2)

        e["images_missing_alt"] = [i["src"] for i in p.imgs if not i["alt"] and not i["decorative_in_labelled_group"]]
        e["structure"] = structure(p.classes, p.imgs, html)
        report["emails"][key] = e

        for field in ("uppercase_violations", "internal_language", "ndx_voice_leak", "generic_or_any_brand",
                      "ai_rhetorical_patterns", "repeated_sentences", "images_missing_alt"):
            if e[field]:
                failures.append(f"{key}.{field}: {e[field]}")
        if e["headline_restated_in_body"]:
            failures.append(f"{key}.headline_restated_in_body")
        if e.get("manufactured_urgency_or_booking"):
            failures.append(f"{key}.urgency: {e['manufactured_urgency_or_booking']}")
        if e.get("upsell_terms"):
            failures.append(f"{key}.upsell: {e['upsell_terms']}")

    shared = {}
    boiler = {"SITE 00 DIGITAL FOUNDATION", "{{FIELD}}"}
    for a, b in itertools.combinations(all_text, 2):
        common = sorted(g for g in ngrams(all_text[a]) & ngrams(all_text[b]) if not any(x in g for x in ("FIELD", "SITE 00 SITE")))
        shared[f"{a}-{b}"] = common
    report["cross"]["shared_5grams"] = shared

    structs = {k: v["structure"] for k, v in report["emails"].items()}
    variety = {}
    for a, b in itertools.combinations(structs, 2):
        diff = [f for f in structs[a] if structs[a][f] != structs[b][f]]
        variety[f"{a}-{b}"] = diff
        if len(diff) < 5 or structs[a]["composition"] == structs[b]["composition"] or structs[a]["cta"] == structs[b]["cta"]:
            failures.append(f"variety {a}-{b}: only {diff}")
    report["cross"]["structural_differences"] = variety

    report["contrast_on_white"] = {c: contrast(c) for c in ("#141414", "#1e1e1e", "#5e5e5e", "#72706c", "#d90c0c")}
    report["contrast_white_on_red"] = contrast("#ffffff", "#d90c0c")
    report["contrast_mute_on_stone"] = contrast("#5e5e5e", "#f6f5f2")
    report["failures"] = failures
    report["result"] = "PASS" if not failures else "FAIL"

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "V2_COPY_QA.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: report[k] for k in ("result", "failures", "contrast_on_white", "contrast_white_on_red", "contrast_mute_on_stone")}, indent=2))
    for k, e in report["emails"].items():
        print(k, e["words"], "words · openings", e["opening_diversity"], "·", e["structure"]["composition"])
    print("shared 5-grams:", {k: v for k, v in shared.items()})
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
