#!/usr/bin/env python3
"""Build OpenArt generate payload JSON for F09 Sunburst (exact Opus prompt file)."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

PREFIX = (
    "REFERENCE GUIDANCE: Image 1 is the GEOMETRY AUTHORITY ONLY (zone positions, proportions, hierarchy). "
    "Do NOT preserve its low-fidelity flat styling. Render high-fidelity photographic-architectural quality. "
    "Image 2 is the OFFICIAL JURNL LOGO — match botanical mark and vertical wordmark exactly; composite faithfully if needed.\n\n"
)

TERRITORIES = {
    "T01": {
        "prompt_file": "SUNBURST_PROMPTS/T01_OPEN_FLOOR.txt",
        "study_id": "P0lbJcH5lroQG8PGEdW1",
        "study_url": "https://cdn.openart.ai/openart-uploads/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/F09_T01_SURVEYED_COURTYARD_VALUE_STUDY_9x16_1791312714222_818ba905.png",
    },
    "T02": {
        "prompt_file": "SUNBURST_PROMPTS/T02_PLAIN_ANSWER.txt",
        "study_id": "eoRRrQ3Ua3IHFjEdB9jS",
        "study_url": "https://cdn.openart.ai/openart-uploads/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/F09_T02_ANSWER_IN_RAKING_LIGHT_VALUE_STUDY_9x16_1791312714747_06853a8a.png",
    },
    "T03": {
        "prompt_file": "SUNBURST_PROMPTS/T03_OPEN_ENVELOPE.txt",
        "study_id": "OCg9a5QxJDMEwSTyBvcb",
        "study_url": "https://cdn.openart.ai/openart-uploads/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/F09_T03_SORTING_RACK_VALUE_STUDY_9x16_1791312715229_80f764b1.png",
    },
}

LOGO = {
    "id": "ObAvYU84IDmDgLJU1PtN",
    "url": "https://cdn.openart.ai/openart-uploads/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/jurnl-logo-official_1791312725373_93f70409.png",
}

BASE = Path(__file__).resolve().parents[2] / "JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1"
PROJECT = "VdiPtgVqb21sYl003uox"


def build(territory: str) -> dict:
    t = TERRITORIES[territory]
    prompt = PREFIX + (BASE / t["prompt_file"]).read_text(encoding="utf-8")
    return {
        "model": "gpt-image-2-5-sunburst",
        "mode": "image2image",
        "projectId": PROJECT,
        "params": {
            "prompt": prompt,
            "aspectRatio": "9:16",
            "resolutionTier": "4k",
            "quality": "high",
            "autoEnhancePrompt": False,
            "variant": "sunburst",
            "outputFormat": "png",
            "imageCount": 1,
            "visualReferences": [
                {"type": "image", "id": t["study_id"], "url": t["study_url"], "label": f"{territory}_GEOMETRY"},
                {"type": "image", "id": LOGO["id"], "url": LOGO["url"], "label": "JURNL_LOGO"},
            ],
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("territory", choices=sorted(TERRITORIES))
    ap.add_argument("-o", "--out", required=True)
    args = ap.parse_args()
    payload = build(args.territory)
    Path(args.out).write_text(json.dumps(payload), encoding="utf-8")
    print(len(payload["params"]["prompt"]), "prompt chars ->", args.out)


if __name__ == "__main__":
    main()
