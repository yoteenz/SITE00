# 10 · Original overlay (OL-01…OL-20) visual contract

**State:** all 20 families still exist (`overlay/overlayRegistry.ts`, `WorkspaceOverlayBody.tsx`). Existing tests (`idntyFounderWorkspace*.test.ts`) pass. OL-01 (create) and OL-03 (menu) were opened from the new shell at 390 and 1440 with no page errors.

**Changed in this pass:** only the OL-03 body, which now holds the authority menu rows (`.ws-menu__i`). It shows all seven destinations, the current one marked, and READINESS DESK.

**Not yet compliant (next checkpoint, after founder approval):**
| Item | Authority | Current |
| --- | --- | --- |
| Host chrome | `ws-ov` with `data-m/t/d` presentation: full / sheet / dialog / popover / drawer / palette, with kicker + display title + × | `ifw-overlay-host` generic sheet: title + “CLOSE” text button |
| Phone forms | Full-screen with sticky footer, keyboard-safe | Bottom sheet |
| Pickers | FD-1…FD-6 editorial selection sheet; native `<select>` not used | Native `<select>` in OL-01 (referral source kind) |
| OL-04 search | Palette with grouped results | Plain input |
| OL-03 menu | Drawer from the left on phone/tablet; not on desktop | Sheet with rows (content correct, chrome not) |

**Not claimed:** visual verification of all 20 families.
