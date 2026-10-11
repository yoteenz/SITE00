#!/usr/bin/env python3
"""Email V2 R2 — copy-preservation QA for the nine art-direction territories.

The approved customer copy (benchmarks/B0*/COPY.md) is the authority. Every copy unit — each sentence, label,
and ledger cell — must appear verbatim in each of that email's territories. Any text a territory adds must be a
short structural label (drawing-sheet furniture), never new copy. Uppercase, alt-text, and internal-language
checks reuse the R1 detectors in ../qa_copy.py.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import qa_copy as r1  # noqa: E402

TERR = HERE / "territories"
COPY = r1.REPO / "docs/site00/idnty/visual-authority/email-v2/benchmarks"
OUT = r1.REPO / "docs/site00/idnty/visual-authority/email-v2/r2/qa"
MAX_LABEL_WORDS = 3


def norm(s: str) -> str:
    s = s.replace("{{FIELD}}", " ")
    s = re.sub(r"[^A-Z0-9' ]", " ", s.upper())
    return re.sub(r"\s+", " ", s).strip()


def copy_units(key: str, name: str) -> list[str]:
    md = (COPY / name / "COPY.md").read_text()
    envelope = re.search(r"## Envelope(.*?)## Body", md, re.S).group(1)
    body = re.search(r"## Body(.*?)## Image alt text", md, re.S).group(1)
    lines = []
    for row in envelope.splitlines():
        m = re.match(r"\| (Subject|Preheader) \| (.+) \|$", row)
        if m:
            lines.append(m.group(2))
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("**"):
            line = line.strip("*").split(" — ", 1)[-1]
        if not line or line.startswith("site00.com/") or re.match(r"^\|[-| ]+\|$", line):
            continue
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if cells[0] in ("No.",):
                continue
            lines += cells
            continue
        m = re.search(r"\bLabels?:\s*(.+)$", line)
        line = m.group(1) if m else re.sub(r"^[A-Z][a-z ]+:\s*", "", line)
        line = re.sub(r"`[^`]*`|\([^)]*\)|\{\{[^}]+\}\}|site00\.com|[\[\]]", " ", line)
        if re.search(r"[a-z]", line):
            continue
        lines.append(line)
    units = []
    for line in lines:
        line = re.sub(r"\{\{[^}]+\}\}", " ", line)
        for part in re.split(r"(?<=[.?!])\s+|\s[·/—→]\s", line):
            n = norm(part)
            if n:
                units.append(n)
    return units


def main() -> int:
    report: dict = {"authority": "benchmarks/B0*/COPY.md", "territories": {}}
    failures: list[str] = []
    for key, name in r1.EMAILS.items():
        units = copy_units(key, name)
        copy_text = " ".join(units)
        for t in "ABC":
            tid = f"{key}_{t}"
            p = r1.Extract()
            p.feed((TERR / f"{tid}.html").read_text())
            p._flush()
            segs = [s for s in p.segments if not s["chrome"]]
            stream = norm(" ".join("{{FIELD}}" if s["exempt"] else s["text"] for s in segs))
            missing = [u for u in units if f" {u} " not in f" {stream} "]
            added = sorted({norm(s["text"]) for s in segs if not s["exempt"] and norm(s["text"])
                            and f" {norm(s['text'])} " not in f" {copy_text} "})
            long_added = [a for a in added if len(a.split()) > MAX_LABEL_WORDS]
            upper = [s["text"].strip() for s in p.segments if not s["exempt"] and s["text"] != s["text"].upper()]
            joined = " ".join(b for b in p.blocks if b)
            internal = sorted({m.group(0) for pat in r1.INTERNAL_LANGUAGE for m in re.finditer(pat, joined, re.M)})
            no_alt = [i["src"] for i in p.imgs if i["alt"] is None]
            e = {
                "copy_units": len(units),
                "copy_units_missing": missing,
                "added_structural_labels": added,
                "added_text_over_label_length": long_added,
                "uppercase_violations": upper,
                "internal_language": internal,
                "images_without_alt_attribute": no_alt,
                "images": len(p.imgs),
            }
            report["territories"][tid] = e
            for f in ("copy_units_missing", "added_text_over_label_length", "uppercase_violations",
                      "internal_language", "images_without_alt_attribute"):
                if e[f]:
                    failures.append(f"{tid}.{f}: {e[f]}")
    report["failures"] = failures
    report["result"] = "PASS" if not failures else "FAIL"
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "R2_COPY_PRESERVATION_QA.json").write_text(json.dumps(report, indent=2) + "\n")
    for tid, e in report["territories"].items():
        print(f"{tid}  copy units present {e['copy_units'] - len(e['copy_units_missing'])}/{e['copy_units']}  added labels {e['added_structural_labels']}")
    print(report["result"])
    for f in failures:
        print("  ", f)
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
