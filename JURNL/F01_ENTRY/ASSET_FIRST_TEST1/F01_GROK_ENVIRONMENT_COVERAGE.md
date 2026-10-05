# F01 environment coverage — child plates

Screen authorities were used as references. Nothing was cropped out of a finished screen. Failed harvest libraries were not mounted. The welcome atrium plate is not scaled or cropped onto a child.

Distinct environment plates: 14. Welcome reuses `ENTRY.ENVIRONMENT.PLATE.001`. The other 13 F01 screens each mount their own file.

| Screen | Route | Class | Asset | Credits this pass | QA | Mount |
| --- | --- | --- | --- | --- | --- | --- |
| F01.00 WELCOME | entry | SHARED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | PASS | MOUNTED |
| F01.01 CREATE ACCOUNT | entry/create | CHILD_PLATE | ENTRY.ENVIRONMENT.CREATE_ACCOUNT.001 | 317 | PASS | MOUNTED |
| F01.02 EMAIL VERIFICATION | entry/verify-email | CHILD_PLATE | ENTRY.ENVIRONMENT.VERIFY.001 | 0 | PASS | MOUNTED |
| F01.03 SIGN IN | entry/sign-in | CHILD_PLATE | ENTRY.ENVIRONMENT.SIGN_IN.001 | 317 | PASS | MOUNTED |
| F01.04 RETURNING USER UNLOCK | entry/unlock | CHILD_PLATE | ENTRY.ENVIRONMENT.UNLOCK.001 | 317 | PASS | MOUNTED |
| F01.05 FORGOT PASSWORD | entry/forgot-password | CHILD_PLATE | ENTRY.ENVIRONMENT.FORGOT.001 | 0 | PASS | MOUNTED |
| F01.06 RESET EMAIL SENT | entry/reset-sent | CHILD_PLATE | ENTRY.ENVIRONMENT.RESET_SENT.001 | 0 | PASS | MOUNTED |
| F01.07 CREATE NEW PASSWORD | entry/new-password | CHILD_PLATE | ENTRY.ENVIRONMENT.NEW_PASSWORD.001 | 317 | PASS | MOUNTED |
| F01.08 PASSWORD RESET SUCCESS | entry/reset-success | CHILD_PLATE | ENTRY.ENVIRONMENT.RESET_SUCCESS.001 | 317 | PASS | MOUNTED |
| F01.09 BIOMETRIC SETUP | entry/biometric | CHILD_PLATE | ENTRY.ENVIRONMENT.BIOMETRIC.001 | 317 | PASS | MOUNTED |
| F01.10 DEVICE TRUST | entry/device-trust | CHILD_PLATE | ENTRY.ENVIRONMENT.DEVICE_TRUST.001 | 317 | PASS | MOUNTED |
| F01.11 PRIVACY PRIMER | entry/privacy | CHILD_PLATE | ENTRY.ENVIRONMENT.PRIVACY.001 | 0 | PASS | MOUNTED |
| F01.12 SECURITY PRIMER | entry/security | CHILD_PLATE | ENTRY.ENVIRONMENT.SECURITY.001 | 317 | PASS | MOUNTED |
| F01.13 ENTRY COMPLETE | entry/complete | CHILD_PLATE | ENTRY.ENVIRONMENT.COMPLETE.001 | 317 | PASS | MOUNTED |
| F02 boundary | setup | TRANSFORMED_EXISTING_PLATE | ENTRY.ENVIRONMENT.PLATE.001 | 0 | PASS | MOUNTED |

This pass spent 2,853 credits (9 × 317). Balance 50,362 → 47,509. Corrections: 0. The earlier four plates stay mounted and were not regenerated.

Descendant overlays inherit the plate of the screen that opens them. Drawers, sheets, and modals stay live code.

Isolated objects generated: 0. Botanicals generated: 0. Materials generated: 0. Icons generated: 0. Light stays baked in the plates.
