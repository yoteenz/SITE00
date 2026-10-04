#!/usr/bin/env python3
"""Build F01_INTERACTION_MANIFEST.json — full interaction inventory for Opus handoff."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "JURNL" / "F01_ENTRY"
INTERACTIONS = ROOT / "INTERACTIONS"


def I(  # noqa: N802
    interaction_id: str,
    source_screen: str,
    trigger: str,
    interaction_type: str,
    authority_file: str,
    shared_or_distinct: str,
    component_reference: str,
    opening: str,
    closing: str,
    nav: str,
    **extra: str,
) -> dict:
    row = {
        "interaction_id": interaction_id,
        "source_screen": source_screen,
        "trigger": trigger,
        "interaction_type": interaction_type,
        "authority_file": authority_file,
        "shared_or_distinct": shared_or_distinct,
        "component_reference": component_reference,
        "opening_behavior": opening,
        "closing_behavior": closing,
        "navigation_result": nav,
        "data_dependency": extra.get("data_dependency", "none"),
        "error_behavior": extra.get("error_behavior", "inline_or_panel_per_manifest"),
        "responsive_behavior": "mobile_primary_393x852_tablet_desktop_drawer_max_width_constrained",
        "accessibility_notes": "UPPERCASE labels; focus trap in modals/sheets; square-rounded targets min 44pt",
    }
    return row


def build() -> list[dict]:
    auth = "INTERACTIONS/{file}"
    rows: list[dict] = []

    # F01.00
    rows += [
        I("F01.00.ROUTE.GET_STARTED", "F01.00", "GET STARTED", "route_transition", auth.format(file="F01_FAMILY_TRANSITION_AUTHORITY.png"), "shared", "JURNL_ROUTE_TRANSITION", "crossfade_push", "complete", "F01.01"),
        I("F01.00.ROUTE.SIGN_IN", "F01.00", "SIGN IN", "route_transition", auth.format(file="F01_FAMILY_TRANSITION_AUTHORITY.png"), "shared", "JURNL_ROUTE_TRANSITION", "crossfade_push", "complete", "F01.03"),
    ]

    # Global primitives (master sheet)
    for pid, label, comp, itype in [
        ("PRIM.DRAWER.SHORT", "BOTTOM DRAWER SHORT", "JURNL_DRAWER_SHORT", "bottom_drawer"),
        ("PRIM.DRAWER.LONG", "BOTTOM DRAWER LONG SCROLLABLE", "JURNL_DRAWER_LONG", "bottom_drawer"),
        ("PRIM.SHEET.FULL", "FULL-SCREEN SHEET", "JURNL_FULL_SCREEN_SHEET", "full_screen_sheet"),
        ("PRIM.MODAL.CONFIRM", "CONFIRMATION MODAL", "JURNL_CONFIRMATION_MODAL", "modal"),
        ("PRIM.INLINE.EXPAND", "INLINE EXPANSION", "JURNL_INLINE_EXPANSION", "inline"),
        ("PRIM.ERROR.PANEL", "ERROR PANEL", "JURNL_ERROR_PANEL", "inline"),
        ("PRIM.BANNER.SUCCESS", "SUCCESS BANNER TOAST", "JURNL_SUCCESS_BANNER", "toast_banner"),
        ("PRIM.BUTTON.LOADING", "LOADING BUTTON", "JURNL_LOADING_BUTTON", "loading"),
        ("PRIM.INPUT.FOCUS", "FORM FIELD FOCUS", "JURNL_INPUT_FOCUSED", "focus_input"),
        ("PRIM.HANDOFF.EXTERNAL", "EXTERNAL APP HANDOFF", "JURNL_EXTERNAL_HANDOFF", "external_app_handoff"),
        ("PRIM.HANDOFF.NATIVE", "NATIVE OS HANDOFF BOUNDARY", "JURNL_NATIVE_HANDOFF_BOUNDARY", "native_os_handoff"),
        ("PRIM.ROUTE.TRANSITION", "ROUTE TRANSITION", "JURNL_ROUTE_TRANSITION", "route_transition"),
    ]:
        rows.append(
            I(f"F01.GLOBAL.{pid}", "GLOBAL", label, itype, auth.format(file="F01_INTERACTION_MASTER_SHEET.png"), "shared", comp, "per_primitive", "per_primitive", "contextual")
        )

    ca = auth.format(file="F01_CREATE_ACCOUNT_INTERACTIONS.png")
    rows += [
        I("F01.01.INPUT.FOCUS", "F01.01", "FIELD TAP", "focus_input", ca, "distinct", "JURNL_INPUT_FOCUSED", "emerald_border", "blur_or_next", "remain_on_F01.01"),
        I("F01.01.PASSWORD.REQS", "F01.01", "CREATE PASSWORD", "inline_expansion", ca, "distinct", "JURNL_INLINE_EXPANSION", "expand_below_field", "collapse_on_blur", "remain_on_F01.01"),
        I("F01.01.DRAWER.TERMS", "F01.01", "TERMS OF SERVICE", "bottom_drawer", ca, "shared_shell_distinct_content", "JURNL_DRAWER_LONG", "slide_from_bottom", "swipe_or_close", "remain_on_F01.01"),
        I("F01.01.DRAWER.PRIVACY", "F01.01", "PRIVACY POLICY", "bottom_drawer", ca, "shared_shell_distinct_content", "JURNL_DRAWER_LONG", "slide_from_bottom", "swipe_or_close", "remain_on_F01.01"),
        I("F01.01.SOCIAL.APPLE", "F01.01", "CONTINUE WITH APPLE", "native_os_handoff", ca, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "jurnl_transition_then_system", "return_or_error", "provider_flow"),
        I("F01.01.SOCIAL.GOOGLE", "F01.01", "CONTINUE WITH GOOGLE", "native_os_handoff", ca, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "jurnl_transition_then_system", "return_or_error", "provider_flow"),
        I("F01.01.SUBMIT.LOADING", "F01.01", "CREATE ACCOUNT", "loading", ca, "shared", "JURNL_LOADING_BUTTON", "disabled_with_label", "complete_or_error", "remain_on_F01.01"),
        I("F01.01.ERROR.EMAIL_IN_USE", "F01.01", "CREATE ACCOUNT", "inline", ca, "distinct", "JURNL_ERROR_PANEL", "inline_banner", "dismiss_or_sign_in", "F01.03_optional"),
        I("F01.01.ERROR.VALIDATION", "F01.01", "CREATE ACCOUNT", "inline", ca, "shared", "JURNL_ERROR_PANEL", "field_highlights", "fix_fields", "remain_on_F01.01"),
    ]

    ev = auth.format(file="F01_EMAIL_VERIFICATION_INTERACTIONS.png")
    rows += [
        I("F01.02.HANDOFF.MAIL", "F01.02", "OPEN EMAIL APP", "external_app_handoff", ev, "distinct", "JURNL_EXTERNAL_HANDOFF", "transition_screen", "external_app", "os_mail"),
        I("F01.02.RESEND.SUCCESS", "F01.02", "RESEND EMAIL", "toast_banner", ev, "shared", "JURNL_SUCCESS_BANNER", "slide_in_top", "auto_dismiss", "remain_on_F01.02"),
        I("F01.02.CHANGE.EMAIL", "F01.02", "CHANGE EMAIL", "bottom_drawer", ev, "distinct", "JURNL_DRAWER_SHORT", "slide_from_bottom", "close", "remain_on_F01.02"),
        I("F01.02.ERROR.EXPIRED", "F01.02", "EXPIRED LINK", "inline", ev, "distinct", "JURNL_ERROR_PANEL", "panel", "resend", "remain_on_F01.02"),
        I("F01.02.SUCCESS.VERIFY", "F01.02", "VERIFICATION SUCCESS", "route_transition", ev, "shared", "JURNL_ROUTE_TRANSITION", "success_state", "auto_advance", "F01.09_or_F01.11"),
    ]

    si = auth.format(file="F01_SIGN_IN_INTERACTIONS.png")
    rows += [
        I("F01.03.INPUT.FOCUS", "F01.03", "FIELD TAP", "focus_input", si, "distinct", "JURNL_INPUT_FOCUSED", "emerald_border", "blur", "remain_on_F01.03"),
        I("F01.03.PASSWORD.TOGGLE", "F01.03", "SHOW/HIDE PASSWORD", "inline", si, "shared", "JURNL_INLINE_EXPANSION", "toggle_icon", "toggle", "remain_on_F01.03"),
        I("F01.03.CHECKBOX.REMEMBER", "F01.03", "KEEP ME SIGNED IN", "inline", si, "shared", "JURNL_INPUT_FOCUSED", "square_checkbox", "toggle", "remain_on_F01.03"),
        I("F01.03.ROUTE.FORGOT", "F01.03", "FORGOT PASSWORD?", "route_transition", si, "shared", "JURNL_ROUTE_TRANSITION", "push", "complete", "F01.05"),
        I("F01.03.SOCIAL.APPLE", "F01.03", "CONTINUE WITH APPLE", "native_os_handoff", si, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "transition", "return", "provider"),
        I("F01.03.SOCIAL.GOOGLE", "F01.03", "CONTINUE WITH GOOGLE", "native_os_handoff", si, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "transition", "return", "provider"),
        I("F01.03.ERROR.PASSWORD", "F01.03", "SIGN IN", "inline", si, "distinct", "JURNL_ERROR_PANEL", "inline", "retry", "remain_on_F01.03"),
        I("F01.03.ERROR.NOT_FOUND", "F01.03", "SIGN IN", "inline", si, "distinct", "JURNL_ERROR_PANEL", "inline_cta", "create_account", "F01.01"),
        I("F01.03.LOCKED.PANEL", "F01.03", "TEMPORARILY LOCKED", "bottom_drawer", si, "distinct", "JURNL_DRAWER_SHORT", "slide_up", "close", "remain_on_F01.03"),
        I("F01.03.SUBMIT.LOADING", "F01.03", "SIGN IN", "loading", si, "shared", "JURNL_LOADING_BUTTON", "loading", "complete", "post_auth_routing"),
    ]

    ru = auth.format(file="F01_RETURNING_USER_INTERACTIONS.png")
    rows += [
        I("F01.04.HANDOFF.FACEID", "F01.04", "UNLOCK WITH FACE ID", "native_os_handoff", ru, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "jurnl_hold", "system_ui", "unlock_success"),
        I("F01.04.ERROR.FACEID", "F01.04", "FACE ID FAILED", "inline", ru, "distinct", "JURNL_ERROR_PANEL", "panel", "retry_or_password", "remain_on_F01.04"),
        I("F01.04.SHEET.PASSWORD", "F01.04", "USE PASSWORD", "full_screen_sheet", ru, "distinct", "JURNL_FULL_SCREEN_SHEET", "slide_up", "close", "remain_on_F01.04"),
        I("F01.04.SHEET.SWITCH", "F01.04", "SWITCH ACCOUNT", "bottom_drawer", ru, "distinct", "JURNL_DRAWER_LONG", "slide_up", "select_account", "F01.03_or_F01.01"),
        I("F01.04.MODAL.SIGNOUT", "F01.04", "SIGN OUT", "modal", ru, "shared", "JURNL_CONFIRMATION_MODAL", "fade_scale", "confirm_cancel", "F01.00"),
    ]

    rec = auth.format(file="F01_RECOVERY_INTERACTIONS.png")
    for sid, triggers in [
        ("F01.05", [("SEND RESET LINK", "loading"), ("INVALID EMAIL", "inline"), ("SUCCESS", "route_transition"), ("BACK TO SIGN IN", "route_transition")]),
    ]:
        pass
    rows += [
        I("F01.05.INPUT.FOCUS", "F01.05", "EMAIL FIELD", "focus_input", rec, "shared", "JURNL_INPUT_FOCUSED", "focus", "blur", "remain"),
        I("F01.05.SUBMIT.LOADING", "F01.05", "SEND RESET LINK", "loading", rec, "shared", "JURNL_LOADING_BUTTON", "loading", "done", "F01.06"),
        I("F01.05.ERROR.EMAIL", "F01.05", "SEND RESET LINK", "inline", rec, "shared", "JURNL_ERROR_PANEL", "inline", "fix", "remain"),
        I("F01.06.HANDOFF.MAIL", "F01.06", "OPEN EMAIL APP", "external_app_handoff", rec, "shared", "JURNL_EXTERNAL_HANDOFF", "transition", "external", "mail"),
        I("F01.06.RESEND.TOAST", "F01.06", "RESEND EMAIL", "toast_banner", rec, "shared", "JURNL_SUCCESS_BANNER", "toast", "dismiss", "remain"),
        I("F01.06.ERROR.EXPIRED", "F01.06", "EXPIRED LINK", "inline", rec, "shared", "JURNL_ERROR_PANEL", "panel", "resend", "remain"),
        I("F01.07.INPUT.FOCUS", "F01.07", "PASSWORD FIELDS", "focus_input", rec, "shared", "JURNL_INPUT_FOCUSED", "focus", "blur", "remain"),
        I("F01.07.PASSWORD.REQS", "F01.07", "NEW PASSWORD", "inline_expansion", rec, "shared", "JURNL_INLINE_EXPANSION", "expand", "collapse", "remain"),
        I("F01.07.ERROR.MISMATCH", "F01.07", "CONFIRM PASSWORD", "inline", rec, "shared", "JURNL_ERROR_PANEL", "inline", "fix", "remain"),
        I("F01.07.SUBMIT.LOADING", "F01.07", "RESET PASSWORD", "loading", rec, "shared", "JURNL_LOADING_BUTTON", "loading", "done", "F01.08"),
        I("F01.08.ROUTE.SIGNIN", "F01.08", "SIGN IN", "route_transition", rec, "shared", "JURNL_ROUTE_TRANSITION", "push", "done", "F01.03"),
    ]

    bio = auth.format(file="F01_BIOMETRIC_INTERACTIONS.png")
    rows += [
        I("F01.09.HANDOFF.ENABLE", "F01.09", "ENABLE FACE ID", "native_os_handoff", bio, "distinct", "JURNL_NATIVE_HANDOFF_BOUNDARY", "pre_system", "system_permission", "settings_or_success"),
        I("F01.09.SUCCESS.ENABLED", "F01.09", "PERMISSION GRANTED", "toast_banner", bio, "distinct", "JURNL_SUCCESS_BANNER", "confirm", "auto", "F01.10"),
        I("F01.09.DENIED.SHEET", "F01.09", "PERMISSION DENIED", "bottom_drawer", bio, "distinct", "JURNL_DRAWER_SHORT", "slide_up", "continue", "F01.10"),
        I("F01.09.UNSUPPORTED.PANEL", "F01.09", "DEVICE UNSUPPORTED", "inline", bio, "distinct", "JURNL_ERROR_PANEL", "panel", "continue", "F01.10"),
        I("F01.09.SKIP.CONTINUE", "F01.09", "NOT NOW", "route_transition", bio, "shared", "JURNL_ROUTE_TRANSITION", "continue", "done", "F01.10"),
    ]

    rows += [
        I("F01.10.TRUST.CONFIRM", "F01.10", "TRUST THIS DEVICE", "toast_banner", auth.format(file="F01_BIOMETRIC_INTERACTIONS.png"), "distinct", "JURNL_SUCCESS_BANNER", "toast", "dismiss", "continue"),
        I("F01.10.DRAWER.LEARN", "F01.10", "LEARN WHAT THIS MEANS", "bottom_drawer", auth.format(file="F01_BIOMETRIC_INTERACTIONS.png"), "shared", "JURNL_DRAWER_LONG", "slide_up", "close", "remain"),
    ]

    pr = auth.format(file="F01_PRIVACY_INTERACTIONS.png")
    for block in ["YOUR DATA", "CONNECTED ACCOUNTS", "AI ACCESS", "DATA EXPORT", "REMOVE ACCESS"]:
        key = block.replace(" ", "_")
        rows.append(
            I(f"F01.11.DRAWER.{key}", "F01.11", block, "bottom_drawer", pr, "shared_shell_distinct_content", "JURNL_DRAWER_LONG", "slide_from_bottom", "close", "remain_on_F01.11")
        )
    rows.append(I("F01.11.ROUTE.CONTINUE", "F01.11", "CONTINUE", "route_transition", pr, "shared", "JURNL_ROUTE_TRANSITION", "push", "done", "F01.12"))

    sec = auth.format(file="F01_SECURITY_INTERACTIONS.png")
    for block in ["BIOMETRIC SIGN IN", "DEVICE SECURITY", "CONNECTED ACCOUNT CONTROL", "SECURE DATA HANDLING", "SESSION MANAGEMENT"]:
        key = block.replace(" ", "_")[:24]
        rows.append(
            I(f"F01.12.SURFACE.{key}", "F01.12", block, "bottom_drawer", sec, "shared_shell_distinct_content", "JURNL_DRAWER_LONG", "slide_up", "close_or_promote_sheet", "remain_on_F01.12")
        )
    rows.append(I("F01.12.ROUTE.CONTINUE", "F01.12", "CONTINUE", "route_transition", sec, "shared", "JURNL_ROUTE_TRANSITION", "push", "done", "F01.13"))

    ft = auth.format(file="F01_FAMILY_TRANSITION_AUTHORITY.png")
    rows.append(I("F01.13.ROUTE.SETUP", "F01.13", "CONTINUE TO SETUP", "route_transition", ft, "distinct", "JURNL_ROUTE_TRANSITION", "family_boundary_f01_f02", "complete", "FAMILY_02"))

    return rows


def main() -> None:
    INTERACTIONS.mkdir(parents=True, exist_ok=True)
    rows = build()
    out = {
        "family": "F01_ENTRY",
        "sprint": "P0.JURNL.F01-INTERACTION-AUTHORITY-COMPLETE1",
        "screensAudited": 14,
        "interactionCount": len(rows),
        "interactions": rows,
    }
    path = ROOT / "MANIFEST" / "F01_INTERACTION_MANIFEST.json"
    path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(len(rows))


if __name__ == "__main__":
    main()
