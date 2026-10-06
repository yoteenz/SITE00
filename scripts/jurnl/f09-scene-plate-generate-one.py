#!/usr/bin/env python3
"""Build OpenArt payload for F09 hybrid scene plates (plate guide only — no logo)."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BP_DIR = ROOT / "JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1"
RAW = json.loads((BP_DIR / "F09_RAW_GENERATION_CONTRACT.json").read_text(encoding="utf-8"))
PROJECT = "VdiPtgVqb21sYl003uox"

PREFIX = (
    "REFERENCE: The attached image is the ONLY geometry authority (tonal blocking — not style). "
    "Match object position and proportions exactly. Render high-fidelity materials and light. "
    "This is an art plate only: absolutely no text, numbers, logos, buttons, nav, or UI.\n\n"
)

TERRITORY = {"T01": "JURNL.F09.T01", "T02": "JURNL.F09.T02", "T03": "JURNL.F09.T03"}


def plate_for(territory: str) -> dict:
    tid = TERRITORY[territory]
    p = next(x for x in RAW["plates"] if x["territory_id"] == tid)
    return p


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("territory", choices=sorted(TERRITORY))
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--guide-id", default="", help="OpenArt upload id for plate guide")
    ap.add_argument("--guide-url", default="", help="OpenArt CDN url for plate guide")
    args = ap.parse_args()
    p = plate_for(args.territory)
    guide_path = ROOT / p["plate_guide"]
    payload = {
        "model": "gpt-image-2-5-sunburst",
        "mode": "image2image",
        "projectId": PROJECT,
        "params": {
            "prompt": PREFIX + p["prompt"],
            "aspectRatio": "9:16",
            "resolutionTier": "4k",
            "quality": "high",
            "autoEnhancePrompt": False,
            "variant": "sunburst",
            "outputFormat": "png",
            "imageCount": 1,
            "visualReferences": [],
        },
        "meta": {
            "plate_id": p["plate_id"],
            "local_guide": str(guide_path.relative_to(ROOT)),
            "territory": args.territory,
        },
    }
    if args.guide_id and args.guide_url:
        payload["params"]["visualReferences"] = [
            {
                "type": "image",
                "id": args.guide_id,
                "url": args.guide_url,
                "label": f"{args.territory}_PLATE_GUIDE",
            }
        ]
    Path(args.out).write_text(json.dumps(payload), encoding="utf-8")
    print(len(payload["params"]["prompt"]), "chars", p["plate_id"], "->", args.out)


if __name__ == "__main__":
    main()
