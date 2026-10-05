# F01 environment coverage — P0.JURNL.F01-GROK-CANONICAL-ASSET-REGEN-INJECTION1

Screen authorities were used as references. Nothing was cropped out of a finished screen. Failed harvest libraries were not mounted.

Distinct environment groups: 5.

| Screen | Route | Class | Asset | New generations | Credits | QA | Mount | Visual match |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F01.00 WELCOME | entry | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Atrium plate matches the approved room |
| F01.01 CREATE ACCOUNT | entry/create | TRANSFORMED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same room, arch-weighted crop. Vase is not a separate object |
| F01.02 EMAIL VERIFICATION | entry/verify-email | NEW_DISTINCT_PLATE | ENTRY.ENVIRONMENT.VERIFY.001 | 1 | 317 | PASS | MOUNTED | Envelope flat-lay, UI removed |
| F01.03 SIGN IN | entry/sign-in | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same atrium |
| F01.04 RETURNING USER UNLOCK | entry/unlock | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same atrium |
| F01.05 FORGOT PASSWORD | entry/forgot-password | NEW_DISTINCT_PLATE | ENTRY.ENVIRONMENT.FORGOT.001 | 1 | 317 | PASS | MOUNTED | Torn-paper collage, UI removed |
| F01.06 RESET EMAIL SENT | entry/reset-sent | NEW_DISTINCT_PLATE | ENTRY.ENVIRONMENT.RESET_SENT.001 | 1 | 317 | PASS | MOUNTED | Blank deckle sheet, UI removed |
| F01.07 CREATE NEW PASSWORD | entry/new-password | TRANSFORMED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same room, arch-weighted crop |
| F01.08 PASSWORD RESET SUCCESS | entry/reset-success | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same atrium |
| F01.09 BIOMETRIC SETUP | entry/biometric | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same room. Face-id stone is not a separate asset |
| F01.10 DEVICE TRUST | entry/device-trust | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same room. Journal box is not a separate asset |
| F01.11 PRIVACY PRIMER | entry/privacy | NEW_DISTINCT_PLATE | ENTRY.ENVIRONMENT.PRIVACY.001 | 1 | 317 | PASS | MOUNTED | Blank paper stack, UI removed |
| F01.12 SECURITY PRIMER | entry/security | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same room. Padlock is not a separate asset |
| F01.13 ENTRY COMPLETE | entry/complete | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Same atrium |
| F02 boundary | setup | TRANSFORMED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | 0 | PASS | MOUNTED | Inherits the atrium |

Descendant overlays (29) inherit the plate of the screen that opens them. Drawers, sheets, and modals stay live code.

Isolated objects generated: 0. Botanicals generated: 0. Materials generated: 0. Light stays baked in the plates.

Proof captures: `/opt/cursor/artifacts/jurnl-f01-grok/`.
