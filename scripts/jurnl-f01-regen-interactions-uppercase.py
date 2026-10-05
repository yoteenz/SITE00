#!/usr/bin/env python3
"""Regenerate F01 interaction PNGs via OpenArt API — used with MCP historyIds from stdin JSON."""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

INTERACTIONS = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY" / "INTERACTIONS"
LOG_PATH = INTERACTIONS / "openart_interaction_log.json"

PREFIX = (
    "CRITICAL TYPOGRAPHY RULE: 100% UPPERCASE ONLY FOR ALL USER-FACING TEXT. "
    "NO LOWERCASE LETTERS ANYWHERE ON THE BOARD. "
)

PROMPTS: dict[str, str] = {
    "F01_INTERACTION_MASTER_SHEET.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper texture background, deep emerald primary CTAs, burgundy error states, muted rose accents. "
        "Fashion Condensed UPPERCASE headline typography. Square-rounded corners ONLY on all buttons and chips — NO circular tappable buttons. "
        "Match Master visual reference colors, typography weight, and flat UI illustration style exactly. "
        "Single authority sheet grid showing 12 labeled mobile interaction primitives with clear uppercase labels beneath each: "
        "BOTTOM DRAWER SHORT, BOTTOM DRAWER LONG SCROLLABLE, FULL-SCREEN SHEET, CONFIRMATION MODAL, INLINE EXPANSION, ERROR PANEL, "
        "SUCCESS BANNER TOAST, LOADING BUTTON, FORM FIELD FOCUS, EXTERNAL APP HANDOFF, NATIVE OS HANDOFF BOUNDARY, ROUTE TRANSITION. "
        "Every button label, field placeholder, and annotation must be ALL CAPS."
    ),
    "F01_CREATE_ACCOUNT_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper texture background, deep emerald primary CTAs, burgundy error states, muted rose accents. "
        "Fashion Condensed UPPERCASE headline typography. Square-rounded corners ONLY — NO circular tappable buttons. Match Master visual reference. "
        "Create account flow interaction specimens in one board: FORM FIELD FOCUS state, PASSWORD REQUIREMENTS INLINE EXPANSION, "
        "TERMS OF SERVICE BOTTOM DRAWER, PRIVACY POLICY BOTTOM DRAWER, CONTINUE WITH APPLE and CONTINUE WITH GOOGLE EXTERNAL APP HANDOFF ROWS, "
        "LOADING CREATE ACCOUNT BUTTON, EMAIL ALREADY IN USE ERROR PANEL, VALIDATION SUMMARY ERROR STRIP. "
        "All visible UI strings ALL CAPS."
    ),
    "F01_SIGN_IN_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. "
        "Square-rounded ONLY — NO circular buttons. Match Master reference. Sign in interaction board: "
        "EMAIL FIELD FOCUS, SHOW/HIDE PASSWORD TOGGLE, KEEP ME SIGNED IN CHECKBOX, FORGOT PASSWORD? LINK, "
        "CONTINUE WITH APPLE and CONTINUE WITH GOOGLE SOCIAL HANDOFF ROWS, INCORRECT PASSWORD ERROR, ACCOUNT NOT FOUND ERROR, "
        "ACCOUNT LOCKED FULL-SCREEN SHEET, SIGNING IN LOADING BUTTON STATE. All labels ALL CAPS."
    ),
    "F01_RETURNING_USER_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Returning user interactions: FACE ID NATIVE OS HANDOFF BOUNDARY PANEL (abstract system boundary, NO fake Apple UI chrome), "
        "FAILED BIOMETRIC RECOVERY ERROR, USE PASSWORD BOTTOM SHEET, SWITCH ACCOUNT DRAWER LIST, SIGN OUT CONFIRMATION MODAL with emerald CONFIRM and muted CANCEL. "
        "All text ALL CAPS."
    ),
    "F01_EMAIL_VERIFICATION_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Email verification interactions: OPEN EMAIL APP EXTERNAL HANDOFF ROW, RESEND EMAIL SUCCESS TOAST BANNER, "
        "CHANGE EMAIL BOTTOM DRAWER, EXPIRED VERIFICATION LINK ERROR PANEL, VERIFICATION SUCCESS ROUTE TRANSITION SCREEN with emerald CONTINUE. "
        "All text ALL CAPS."
    ),
    "F01_BIOMETRIC_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Biometric setup interactions: ENABLE FACE ID OS HANDOFF BOUNDARY, ACCESS GRANTED SUCCESS STATE, "
        "ACCESS DENIED EXPLANATION SHEET, UNSUPPORTED DEVICE PANEL, NOT NOW SECONDARY ACTION; plus DEVICE TRUSTED SUCCESS TOAST and "
        "LEARN WHAT THIS MEANS BOTTOM DRAWER. All text ALL CAPS."
    ),
    "F01_PRIVACY_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Privacy interactions: PRIVACY DETAIL DRAWER SHELL plus five content variants — YOUR DATA, CONNECTED ACCOUNTS, "
        "AI ACCESS, DATA EXPORT, REMOVE ACCESS — each showing realistic list rows, square-rounded toggles, emerald primary actions on ivory paper. "
        "All text ALL CAPS."
    ),
    "F01_SECURITY_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Security settings interaction board: bottom drawers and full sheets for BIOMETRIC SIGN IN, DEVICE SECURITY, "
        "CONNECTED ACCOUNT CONTROL, SECURE DATA HANDLING, SESSION MANAGEMENT with ACTIVE SESSIONS LIST and REVOKE ACTIONS. All text ALL CAPS."
    ),
    "F01_RECOVERY_INTERACTIONS.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Password recovery flow interactions: FORGOT PASSWORD ENTRY, RESET EMAIL SENT CONFIRMATION, NEW PASSWORD FIELD FOCUS, "
        "SEND RESET LINK LOADING BUTTON, WEAK PASSWORD VALIDATION ERRORS, NETWORK ERROR TOAST, PASSWORD RESET SUCCESS BANNER AND TRANSITION. "
        "All text ALL CAPS."
    ),
    "F01_FAMILY_TRANSITION_AUTHORITY.png": (
        "JURNL F01 mobile INTERACTION design authority board. FLAT 9:16 — NO phone mockup/frame. "
        "Bone ivory plaster paper, deep emerald CTAs, burgundy errors, muted rose. Fashion Condensed UPPERCASE headlines. Square-rounded ONLY. "
        "Match Master reference. Auth family boundary transition authority: three hero transition screens — GET STARTED ENTRY, SIGN IN ENTRY, "
        "CONTINUE TO SETUP marking F01 TO F02 FAMILY HANDOFF — with uppercase Fashion Condensed headlines, emerald primary CTAs, "
        "consistent ivory paper system, clear flow arrows or step labels between family states. All text ALL CAPS."
    ),
}


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "SITE00-jurnl-regen/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        dest.write_bytes(resp.read())


def main() -> None:
    # JSON array: [{ "file", "historyId", "url" }, ...]
    results = json.loads(sys.stdin.read())
    items = []
    ok = 0
    for row in results:
        fname = row["file"]
        url = row["url"]
        dest = INTERACTIONS / fname
        try:
            download(url, dest)
            ok += 1
        except Exception as e:
            print(f"FAIL download {fname}: {e}", file=sys.stderr)
        items.append(
            {
                "file": fname,
                "historyId": row["historyId"],
                "url": url,
            }
        )

    log = {
        "model": "gpt-image-2-5-sunburst",
        "mode": "image2image",
        "projectId": "TToQavm9coU1QGPRfEzU",
        "settings": {
            "aspectRatio": "9:16",
            "resolutionTier": "2k",
            "quality": "high",
            "autoEnhancePrompt": false,
            "outputFormat": "png",
            "visualReferenceMaster": "OYiiyxbcSxfsKxaDEevS",
        },
        "note": "uppercase-only regen 2026-10-04",
        "generatedAt": row.get("generatedAt", "2026-10-04T23:45:00Z"),
        "items": items,
    }
    LOG_PATH.write_text(json.dumps(log, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"success": ok, "total": len(results)}))


if __name__ == "__main__":
    main()
