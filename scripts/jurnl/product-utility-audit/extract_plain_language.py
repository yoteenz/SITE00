#!/usr/bin/env python3
"""Extract user-facing JURNL strings for plain-language audit (read-only)."""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = ROOT / "JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1"
RUNTIME = ROOT / "src/projects/jurnl/runtime"
DATA = ROOT / "src/projects/jurnl/data"

ABSTRACT_HINTS = re.compile(
    r"\b(horizon|intention|moment|picture|landscape|gallery|approach|descent|editorial|preview composition|not a live|not connected)\b",
    re.I,
)


def catalog_strings() -> list[dict]:
    text = (DATA / "parents/catalog.ts").read_text(encoding="utf-8")
    rows: list[dict] = []
    for block in re.finditer(r"id: '(F\d+)'[\s\S]*?question: '([^']+)'", text):
        fid, q = block.group(1), block.group(2)
        rows.append(
            {
                "string_id": f"parent.{fid}.question",
                "current_text": q,
                "source_file": "src/projects/jurnl/data/parents/catalog.ts",
                "route": "parent hub",
                "component": "ParentSpec.question",
                "context": "jrn-lang__editorial on family hubs",
                "problem": "EDITORIAL" if ABSTRACT_HINTS.search(q) else "",
                "recommended_text": "",
                "rationale": "",
                "data_requirements": "",
                "founder_approval_status": "PENDING",
            }
        )
    return rows


def scan_tsx_literals() -> list[dict]:
    rows: list[dict] = []
    pat = re.compile(r"(?:title|lead|label)=['\"]([^'\"]{8,})['\"]|>([A-Z][^<]{6,})<")
    for path in RUNTIME.rglob("*.tsx"):
        rel = path.relative_to(ROOT).as_posix()
        if "EntryScreens" in rel and "F01" in rel:
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        for i, line in enumerate(content.splitlines(), 1):
            if "className=" in line and "jrn-lang" not in line and "JurnlButton" not in line and "RefText" not in line:
                continue
            for m in pat.finditer(line):
                s = (m.group(1) or m.group(2) or "").strip()
                if not s or s.startswith("{"):
                    continue
                if len(s) > 120:
                    continue
                problem = ""
                if ABSTRACT_HINTS.search(s):
                    problem = "ABSTRACT_OR_EDITORIAL"
                elif "?" not in s and any(w in s for w in ("WHAT", "HOW", "WHY")) and "USD" not in s:
                    problem = "VAGUE_PROMPT"
                rows.append(
                    {
                        "string_id": f"{rel}:{i}",
                        "current_text": s,
                        "source_file": rel,
                        "route": "",
                        "component": path.name,
                        "context": "tsx literal",
                        "problem": problem,
                        "recommended_text": "",
                        "rationale": "",
                        "data_requirements": "",
                        "founder_approval_status": "PENDING",
                    }
                )
    return rows


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = catalog_strings() + scan_tsx_literals()
    # de-dupe by text
    seen: set[str] = set()
    unique: list[dict] = []
    for r in rows:
        key = r["current_text"]
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)
    csv_path = OUT_DIR / "JURNL_PLAIN_LANGUAGE_AUDIT.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(unique[0].keys()) if unique else [])
        w.writeheader()
        w.writerows(unique)
    (OUT_DIR / "plain_language_extract_meta.json").write_text(
        json.dumps({"row_count": len(unique), "abstract_flagged": sum(1 for r in unique if r["problem"])}, indent=2) + "\n"
    )
    print(json.dumps({"csv": str(csv_path), "rows": len(unique)}, indent=2))


if __name__ == "__main__":
    main()
