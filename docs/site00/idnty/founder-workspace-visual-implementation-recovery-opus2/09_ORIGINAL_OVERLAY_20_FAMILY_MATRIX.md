# 09 · Original overlay families OL-01…OL-20

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`

| ID | Family | Modes (phone · tablet · desktop) | Captured | In view | Notes |
| --- | --- | --- | --- | --- | --- |
| OL-01 | Create foundation | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | createLeadLink; OL-02 only after link returned |
| OL-02 | Link ready | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | link, client view, open foundation |
| OL-03 | Workspace menu | drawer · drawer · drawer | 390x844 | YES | phone drawer; ≥ 768 the rail / sidebar replace it (authority d: none) |
| OL-04 | Search / command palette | full · palette · palette | 390x844, 820x1180, 1440x900 | YES | live client search + commands, ↑↓↵ |
| OL-05 | Notification center | sheet · popover · popover | 390x844, 820x1180, 1440x900 | YES | derived from pipeline (founder decisions + blockers) |
| OL-06 | Row action menu | action · popover · popover | 390x844, 820x1180, 1440x900 | YES | action sheet / anchored popover; resend + revoke disabled (G-05/G-06) |
| OL-07 | Filter / sort | sheet · popover · popover | 390x844, 820x1180, 1440x900 | YES | shared filter context; views + exact states + sort |
| OL-08 | Approve quote confirmation | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | scrim-locked; quoteCommercialReady awaited |
| OL-09 | Revise quote / manual adjustment | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | dollars → integer cents; scrim-locked |
| OL-10 | Mark foundation complete | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | gate enforced; no TBD / example.com defaults; scrim-locked |
| OL-11 | Request changes / add note | sheet · dialog · dialog | 390x844, 820x1180 | YES | phone/tablet; desktop decides inline (authority d: none) |
| OL-12 | Task detail | sheet · sheet-r · sheet-r | 390x844, 820x1180, 1440x900 | YES | inspector sheet; START only when READY |
| OL-13 | Set blocker | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | real BlockerCategory values |
| OL-14 | Compose message | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | portal message only; 8000-char limit |
| OL-15 | Send (gated, approval tick) | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | one approval tick per send; without intent the send is blocked |
| OL-16 | System module detail | sheet · sheet-r · sheet-r | 390x844, 820x1180 | YES | module inspector from report |
| OL-17 | Reset test data confirmation | sheet · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | type RESET; scrim-locked |
| OL-18 | Account menu | drawer · popover · popover | 390x844, 820x1180, 1440x900 | YES | popover above account (desktop/tablet), via MENU on phone |
| OL-19 | Client preview | sheet · sheet-r · sheet-r | 390x844, 820x1180 | YES | client preview sheet below dock width |
| OL-20 | Technical error detail | full · dialog · dialog | 390x844, 820x1180, 1440x900 | YES | technical detail, copy, no secrets |

All 20 families: RECOVERED 20 / 20 · VISUALLY VERIFIED 20 / 20 (opened from their real triggers in the React app;
sheets: `evidence/overlays/OL-phone.jpg`, `OL-tablet.jpg`, `OL-desktop.jpg`). Families use different containers per tier
(full screen, bottom sheet, action sheet, drawer, dialog, right sheet, anchored popover, palette) — not one generic
modal. IDs, triggers and API calls are unchanged (`overlayRegistry.ts`, `WorkspaceOverlayBody.tsx`).
