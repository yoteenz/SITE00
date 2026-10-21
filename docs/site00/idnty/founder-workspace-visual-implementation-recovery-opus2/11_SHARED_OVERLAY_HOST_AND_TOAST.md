# 11 · Shared overlay host and toast system

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


`overlay/OverlayHost.tsx` + `overlay/OverlayContext.tsx` + `overlay/ToastStack.tsx` + `overlays/bodies/OverlayFormShell.tsx`.

| Requirement | Implementation |
| --- | --- |
| Dialogs | `data-t/d='dialog'` (centered, width per family) |
| Mobile sheets | `data-m='sheet'` bottom sheet, `full`, `drawer`, `action` |
| Tablet right sheets | `data-t='sheet-r'` (inspector families OL-12/16/19, RO-11/14) |
| Desktop inspectors | `data-d='sheet-r'` at `--ws-insp` width + docked page inspectors ≥ 1100 (shell slot) |
| Contextual panels | anchored popovers (OL-05/06/07/18, RO-06/08) positioned from the trigger rect |
| Confirmations | scrim-locked financial / destructive families (`scrimLocked`) |
| Validation | field-level errors (`WsField err`), disabled primaries until valid |
| Async feedback | busy primary (`ws-btn--busy`, aria-busy); red “NOT SAVED — THE SERVER DID NOT CONFIRM” banner |
| Scroll lock | `body` overflow + `.ws[data-ifw-locked] .ws-stage` |
| Focus | first field → first action → panel on open; Tab trap; return to the trigger on close |
| Escape | closes (or cancels the discard prompt) |
| Unsaved changes | in-panel DISCARD / KEEP EDITING (the browser `window.confirm` is gone) |
| Safe area | sheet / full / drawer / action footers pad `env(safe-area-inset-bottom)` |
| Z-index | scrim 60 · panel 61 · toasts 70 — above the bottom bar and sidebar |
| Never undismissable | CLOSE icon and Escape on every family; scrim lock only blocks accidental scrim clicks |

Toasts: SUCCESS (CONFIRMED) · ERROR (NOT SAVED, role=alert, sticky) · INFO (NOTE) · ACTION REQUIRED (sticky) · BLOCKED BY
POLICY (sticky); bottom above the phone bar, bottom-right on tablet/desktop; max 4; optional action. Every success toast in
the workspace is pushed after the awaited server call resolves (“CONFIRMED BY THE SERVER”); copy actions toast after the
clipboard resolves; nothing claims saved / sent / paid without evidence.

SHARED_OVERLAY_HOST: COMPLETE · GLOBAL_TOAST_SYSTEM: COMPLETE
