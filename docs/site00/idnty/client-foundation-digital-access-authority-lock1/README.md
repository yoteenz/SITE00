# Client Foundation — Digital Access & Launch Authority (LOCK1)

**Sprint:** `P0.SITE00.IDNTY.CLIENT-FOUNDATION.DIGITAL-ACCESS-AND-LAUNCH-AUTHORITY-LOCK1`
**Amends:** `../client-foundation-experience-living-portal-opus1/` (OPUS1, draft PR #1670). This is the same workstream; no competing package is created.
**Branch:** `claude/client-foundation-living-portal-authority-8d42xk` · OPUS1 head before amendment `282168cbb`
**Status:** authority correction and lock. **Not** a production implementation. Nothing is deployed, sent, charged or migrated.

## Scope

**Product A only:** the digital client-foundation home-screen experience. Two other products are **not touched**:
- **B**, partner referral business cards (physical, referral attribution, `site00-referrals` / referral card studio);
- **C**, SITE 00 business cards (physical).

## What the founder locked

1. **Home-screen app icon.** The white tile with the black "00" and the red underline. Master: `assets/master/SITE00_FOUNDATION_ICON_MASTER.png`.
2. **Light architectural launch experience.** Master: `assets/master/SITE00_FOUNDATION_LAUNCH_MASTER.png`.
3. **Launch copy:** "YOUR DIGITAL SPACE AWAITS." (baked into the approved image).
4. **Return methods:** home screen ("SAVE YOUR FOUNDATION") and verified email.
5. **The client foundation access card is retired from V1.**

## Documents

| # | Document |
|---|---|
| 01 | [Founder decision lock](01_FOUNDER_DECISION_LOCK.md) |
| 02 | [Approved icon asset](02_APPROVED_ICON_ASSET.md) |
| 03 | [Approved launch asset](03_APPROVED_LAUNCH_ASSET.md) |
| 04 | [Client access card retirement](04_CLIENT_ACCESS_CARD_RETIREMENT.md) |
| 05 | [Home screen install contract](05_HOME_SCREEN_INSTALL_CONTRACT.md) |
| 06 | [Secure reentry contract](06_SECURE_REENTRY_CONTRACT.md) |
| 07 | [Responsive launch spec](07_RESPONSIVE_LAUNCH_SPEC.md) |
| 08 | [Asset manifest](08_ASSET_MANIFEST.md) |
| 09 | [Backend gap reconciliation](09_BACKEND_GAP_RECONCILIATION.md) |
| 10 | [Updated Composer handoff](10_UPDATED_COMPOSER_HANDOFF.md) |
| 11 | [Founder approval record](11_FOUNDER_APPROVAL_RECORD.md) |
| 12 | [Validation](12_VALIDATION.md) |

`assets/derive-icons.py` reproduces every icon derivative from the master (crop and resample only). `assets/derived/derivation.json` records boxes, ratios and hashes.

## Traceability into OPUS1

| OPUS1 item | LOCK1 effect |
|---|---|
| `09_HOME_SCREEN_INSTALL_AUTHORITY` | CTA becomes "SAVE YOUR FOUNDATION"; approved icon; superseded by `05` here where they differ |
| `10_HOME_SCREEN_ICON_AND_LAUNCH` | placeholder icon/splash **superseded** by `02` + `03` + `07` |
| `11_FOUNDATION_ACCESS_CARD_AUTHORITY`, `12_ACCESS_CARD_SECURITY_AND_QR` | **RETIRED**; full text archived |
| `13_SECURE_CLIENT_REENTRY` | kept; card parameter removed; "card replaced" state becomes "link replaced" |
| `26_COMPONENT_REGISTRY` | CF-34 / CF-35 retired; CF-41 launch added |
| `21_GLOBAL_CLIENT_OVERLAY_REGISTRY` | OL-C06, OL-C08–C10 retired; OL-C14 installed toast added |
| `27_BACKEND_GAP_REGISTER` | G-11 retired; G-02, G-09, G-12 unchanged and blocking; G-13 updated |
| `29_OPUS_TO_COMPOSER_HANDOFF` | implementation order replaced by `10` here |
| `30_VISUAL_BOARD_MANIFEST` | M09, D11, AH06–AH10 retired and archived; AH01, AH05, TP08, TL08, X08, X10 revised; AH11–AH15, M21, D21 added |
| `31_FOUNDER_APPROVAL_REGISTER` | LOCK1 decisions recorded; card items superseded |
