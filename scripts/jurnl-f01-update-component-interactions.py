#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
comp_path = ROOT / "MANIFEST" / "F01_COMPONENT_MANIFEST.json"
comp = json.loads(comp_path.read_text(encoding="utf-8"))

comp["interactionPrimitives"] = {
    "JURNL_DRAWER_SHORT": {
        "geometry": "square-rounded top corners",
        "maxHeight": "45vh mobile",
        "material": "bone ivory + paper",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_DRAWER_LONG": {
        "geometry": "square-rounded top corners",
        "scroll": True,
        "maxHeight": "85vh mobile",
        "material": "bone ivory + paper + plaster hint",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_FULL_SCREEN_SHEET": {
        "geometry": "square-rounded header bar",
        "material": "bone ivory",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_CONFIRMATION_MODAL": {
        "geometry": "square-rounded card",
        "dimmedScrim": True,
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_INLINE_EXPANSION": {
        "geometry": "square-rounded inset panel",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_ERROR_PANEL": {
        "fill": "burgundy wine text on bone panel",
        "geometry": "square-rounded",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_SUCCESS_BANNER": {
        "fill": "deep emerald accent strip",
        "geometry": "square-rounded",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_LOADING_BUTTON": {
        "geometry": "square-rounded",
        "spinner": "inline square pulse — NOT circular button",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_INPUT_FOCUSED": {
        "border": "deep emerald",
        "geometry": "square-rounded",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_EXTERNAL_HANDOFF": {
        "description": "JURNL transition card before opening Mail/external app",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_NATIVE_HANDOFF_BOUNDARY": {
        "description": "JURNL-branded hold screen — never fake system Face ID / Apple sheets",
        "authority": "INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png",
    },
    "JURNL_ROUTE_TRANSITION": {
        "description": "Crossfade/push between F01 routes and F01→F02 boundary",
        "authority": "INTERACTIONS/F01_FAMILY_TRANSITION_AUTHORITY.png",
    },
}

comp_path.write_text(json.dumps(comp, indent=2), encoding="utf-8")
