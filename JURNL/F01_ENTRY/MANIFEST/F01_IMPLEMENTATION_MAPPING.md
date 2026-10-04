# F01 Entry — Implementation Mapping

Reference viewports (authorities generated at **9:16 mobile**):

| Breakpoint | Size | Notes |
|------------|------|--------|
| Mobile | 393 × 852 | Primary OpenArt authority size (1296×2304 @2K export) |
| Tablet | 834 × 1194 | Expand architecture/material crops; constrain form max-width ~480px |
| Desktop | 1440 × 900 | Split layout: material field left/right, form column center 420–480px |

## Screen → route sketch (implementation TBD)

| Screen ID | Suggested route | Primary CTA |
|-----------|-----------------|-------------|
| F01.00 | `/entry` | GET STARTED → F01.01 |
| F01.01 | `/entry/create` | CREATE ACCOUNT |
| F01.02 | `/entry/verify-email` | OPEN EMAIL APP |
| F01.03 | `/entry/sign-in` | SIGN IN |
| F01.04 | `/entry/unlock` | UNLOCK WITH FACE ID |
| F01.05 | `/entry/forgot-password` | SEND RESET LINK |
| F01.06 | `/entry/reset-sent` | OPEN EMAIL APP |
| F01.07 | `/entry/new-password` | RESET PASSWORD |
| F01.08 | `/entry/reset-success` | SIGN IN |
| F01.09 | `/entry/biometric` | ENABLE FACE ID |
| F01.10 | `/entry/device-trust` | TRUST THIS DEVICE |
| F01.11 | `/entry/privacy` | CONTINUE |
| F01.12 | `/entry/security` | CONTINUE |
| F01.13 | `/setup` (Family 02) | CONTINUE TO SETUP |

## Asset usage

- Full-screen backgrounds: composited from `ASSETS/ENTRY.*` harvest + child PNG crops.
- Icons: extract from `ICONS/F01_ICON_PACK_SHEET.png` into SVG/React components (linear + filled pairs).
- State UX: implement from `STATES/*.png` panels; do not invent new visual worlds per state.

## QA gates (hard fail)

- All UI strings uppercase
- No circular interactive controls
- Logo small and integrated
- No blank white form screens
