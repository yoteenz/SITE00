#!/usr/bin/env python3
"""Inventory JURNL identity-related assets (read-only)."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "JURNL/MANIFEST/IDENTITY_RECOVERY_V1/JURNL_IDENTITY_PROVENANCE_MATRIX.json"

CANDIDATES = [
    ("ID-001", "public/site00/projects/jurnl/brand/jurnl-logo-official.png", "SUPERSEDED_IDENTITY_REFERENCE", "Vertical rose botanical mark"),
    ("ID-002", "src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png", "RECOVERED_CANONICAL_CANDIDATE", "Primary horizontal sprig-over-word source"),
    ("ID-003", "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png", "APPROVED_DERIVATIVE", "Botanical component"),
    ("ID-004", "src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png", "APPROVED_DERIVATIVE", "Wordmark component"),
    ("ID-005", "JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES/01_SAFE_TO_SPEND.png", "CANONICAL", "Approved Safe to Spend parent reference"),
    ("ID-006", "ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png", "CANONICAL", "Approved ENTRY welcome authority"),
    ("ID-007", "JURNL/F02_SETUP/ASSETS/LOCKUPS/F02.BRANDLOCKUP.JURNL.001.png", "SUPERSEDED_IDENTITY_REFERENCE", "Horizontal rearrangement of vertical mark"),
    ("ID-008", "JURNL/F02_SETUP/ASSETS/LOCKUPS/F02.BRANDLOCKUP.JURNL_SETUP.001.png", "DO_NOT_USE", "Invented rose plus SETUP label"),
    ("ID-009", "public/site00/projects/jurnl/brand/jurnl-cover.png", "SUPERSEDED_IDENTITY_REFERENCE", "Vertical mark on cream"),
    ("ID-010", "src/projects/jurnl/runtime/components/ReferenceLockup.tsx", "RUNTIME_COMPOSITION", "Live sprig+word+descriptor layout"),
]


def sha256(path: Path) -> str | None:
    if not path.is_file():
        return None
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def git_meta(rel: str) -> dict:
    try:
        log = subprocess.check_output(
            ["git", "log", "-1", "--format=%H %ci", "--", rel],
            cwd=ROOT,
            text=True,
        ).strip()
        if not log:
            return {"source_commit": None, "source_commit_date": None}
        commit, date = log.split(" ", 1)
        return {"source_commit": commit, "source_commit_date": date}
    except subprocess.CalledProcessError:
        return {"source_commit": None, "source_commit_date": None}


def main() -> None:
    rows = []
    for asset_id, rel, classification, note in CANDIDATES:
        path = ROOT / rel
        meta = git_meta(rel)
        rows.append(
            {
                "asset_id": asset_id,
                "exact_path": rel,
                "file_type": path.suffix.lstrip(".") if path.suffix else "tsx",
                "content_hash_sha256": sha256(path),
                "candidate_classification": classification,
                "notes": note,
                "current_runtime_usage": "ReferenceLockup" if "LOCKUP" in rel or rel.endswith("ReferenceLockup.tsx") else ("JurnlLogo img" if "logo-official" in rel else "authority_only"),
                **meta,
            }
        )
    OUT.write_text(json.dumps({"assets": rows, "relationship": "One canonical horizontal treatment (ID-002) with two committed derivatives (ID-003, ID-004). ID-001 is filename-only legacy."}, indent=2) + "\n")


if __name__ == "__main__":
    main()
