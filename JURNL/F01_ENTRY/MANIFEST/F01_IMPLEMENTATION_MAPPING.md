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

## Interaction authorities (Opus handoff)

| Authority | Path | Scope |
|-----------|------|--------|
| Master primitives | `INTERACTIONS/F01_INTERACTION_MASTER_SHEET.png` | 12 shared F01 interaction components |
| Create account | `INTERACTIONS/F01_CREATE_ACCOUNT_INTERACTIONS.png` | F01.01 triggers |
| Sign in | `INTERACTIONS/F01_SIGN_IN_INTERACTIONS.png` | F01.03 triggers |
| Returning user | `INTERACTIONS/F01_RETURNING_USER_INTERACTIONS.png` | F01.04 triggers |
| Email verification | `INTERACTIONS/F01_EMAIL_VERIFICATION_INTERACTIONS.png` | F01.02 triggers |
| Biometric + device trust | `INTERACTIONS/F01_BIOMETRIC_INTERACTIONS.png` | F01.09–F01.10 |
| Privacy | `INTERACTIONS/F01_PRIVACY_INTERACTIONS.png` | F01.11 drawers |
| Security | `INTERACTIONS/F01_SECURITY_INTERACTIONS.png` | F01.12 surfaces |
| Recovery | `INTERACTIONS/F01_RECOVERY_INTERACTIONS.png` | F01.05–F01.08 |
| Family transition | `INTERACTIONS/F01_FAMILY_TRANSITION_AUTHORITY.png` | F01.00 routes + F01.13 → F02 |

Machine-readable index: `MANIFEST/F01_INTERACTION_MANIFEST.json` (74 interactions).

Implement using `F01_COMPONENT_MANIFEST.json` → `interactionPrimitives` (drawer, modal, handoff, etc.).

## QA gates (hard fail)

- All UI strings uppercase
- No circular interactive controls
- Logo small and integrated
- No blank white form screens
- Interaction surfaces use JURNL materials (not generic system white cards)
