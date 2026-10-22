# 10 — Updated Composer Handoff

This **supersedes** the implementation order and access sections of OPUS1 `29_OPUS_TO_COMPOSER_HANDOFF.md`. Everything else in OPUS1 `29` stands: component maps, primitives, grid, type, tokens, lifecycle matrix and payment gates.

Composer uses the **two exact approved assets**. It does not invent, regenerate or substitute any visual.

## 1. Asset source files

| Asset | Source of truth | sha256 |
|---|---|---|
| Icon master | `docs/site00/idnty/client-foundation-digital-access-authority-lock1/assets/master/SITE00_FOUNDATION_ICON_MASTER.png` | `4dccf2ae…2f9b76` |
| Launch master | `…/assets/master/SITE00_FOUNDATION_LAUNCH_MASTER.png` | `f8855565…46b249` |
| Icon derivatives | `…/assets/derived/*` (regenerate with `derive-icons.py`; hashes in `08`) | see `08` |

**Asset identity check:** before mounting, Composer verifies these hashes. A mismatch fails the build step.

## 2. Canonical repository paths (deploy)

| File | Path |
|---|---|
| Launch | `public/site00/idnty/foundation/foundation-launch.png` |
| Icon any 192 / 512 | `public/site00/idnty/foundation/foundation-icon-192.png`, `…-512.png` |
| Icon maskable 512 | `public/site00/idnty/foundation/foundation-icon-maskable-512.png` (only after founder review FR-02; otherwise omit the maskable entry) |
| Apple touch 180 | `public/site00/idnty/foundation/apple-touch-icon-foundation-180.png` |
| Manifest | `public/foundation-manifest.webmanifest` |

## 3. Icon export specification

See `02`. Use D1 for `any` and Apple, and D2 for `maskable`. Both are opaque PNGs with stripped metadata. Do not use the master directly as an icon (double rounding). Do not redraw it as a vector.

## 4. Launch image contract

See `03` and `07`:
- shown exactly;
- never stretched;
- cover when the viewport aspect is ≤ 0.67, a portrait panel in the `--df-bg` field when it is > 0.67;
- safe zones always fully visible;
- no overlay text inside the zones;
- `alt` = "SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS."

## 5. Responsive safe zones

| Zone | x % | y % |
|---|---|---|
| Wordmark | 22.8–77.7 | 9.3–15.2 |
| 00 + underline | 41.7–58.6 | 69.3–78.5 |
| Headline | 23.6–77.5 | 82.9–89.3 |

## 6–10. PWA manifest, Apple touch icon, Android icons, theme colour, token-free start URL

See `05`:
- `start_url` is `/foundation/return?src=home`; `scope` is `/foundation/`;
- `theme_color` and `background_color` are `#f3f2ef`;
- `short_name` is "MY FOUNDATION";
- the manifest and head tags are linked only on `/foundation/*`;
- no token in any manifest field.

## 11–13. Install flow, iOS guidance, Android guidance

See `05`. The CTA is SAVE YOUR FOUNDATION, contextual and optional.
- **iOS:** Share → Add to Home Screen → Add, with no button.
- **Android:** `prompt()` only when `beforeinstallprompt` was captured; otherwise menu steps.
- **Desktop:** bookmark guidance.
- **Installed:** the entries are hidden.

## 14–16. Secure email reentry, session restoration, persistent identity

See `06`:
- `/foundation/return`;
- httpOnly session cookie, 30 days;
- email link (15 min) plus 6-digit code;
- 12 states;
- token exchange with `replaceState`;
- one canonical artifact for every entry.

## 17. Backend security gates (blocking)

| Gate | Required before |
|---|---|
| G-12 token hardening | phase 1 (it is phase 1) |
| G-09 sessions + email reentry | phases 5–6, and before the home-screen icon is mounted (phase 7) |
| G-02 draft-quote withholding | phase 2, and before any proposal UI (phase 12) |

## 18. Post-intake status flow

OPUS1 `05` gives "YOUR FOUNDATION IS TAKING SHAPE." Its truth strip shows:
- STATUS;
- RECEIVED;
- **LAST UPDATE** (the most recent recorded event, not the fetch time);
- REFERENCE;
- STATUS AS OF (fetch time) with REFRESH.

The stages are INTAKE RECEIVED → FOUNDATION REVIEW → PERSONALIZED PROPOSAL → APPROVAL & PAYMENT → FOUNDATION SETUP → FINAL VERIFICATION → COMPLETE. No fake progress is shown.

## 19. Quote approval gate

No proposal or price is visible to the client until the founder approves it (G-02, option (a): the quote stays DRAFT). The client accepts the exact version. A changed version needs re-acceptance.

## 20. Payment verification gate

Only the HMAC-verified Stripe webhook marks the quote PAID. It checks quote-version binding, idempotency, amount, currency and artifact linkage (OPUS1 `17`). The redirect never marks it paid. Pricing is unchanged: base $500, add-ons as configured.

## 21. Client navigation

Four areas, and only four: OVERVIEW · ROADMAP · NEEDS YOU · RECORDS.
- **Phone:** bottom bar.
- **Tablet portrait:** tabs.
- **Tablet landscape:** rail.
- **Desktop:** sidebar.

Utilities: SAVE YOUR FOUNDATION · UPDATES BY EMAIL · HELP · SIGN OUT ON THIS DEVICE. There is **no access card tab, no card download section and no QR scanner.**

## 22. Removed card component list (do **not** build)

| Removed | Was |
|---|---|
| Access card preview | CF-34 |
| Download / share / PDF / wallet-style / replace card | CF-35 |
| Card QR generation and `?card=` handling | OPUS1 `12` |
| Card id issuance / revocation service, `df_access_cards` | G-11 |
| Replace-card dialog | OL-C06 |
| Card saved / shared / save-failed toasts | OL-C08, OL-C09, OL-C10 |
| `ACCESS_CARD` history-state view | OPUS1 `03` |
| Card email attachment, card onboarding prompt | — |

Referral-card components (product B) never enter the client experience.

## 23. Updated test requirements

| # | Test | Kind |
|---|---|---|
| 1 | Asset identity: deployed launch and icons match the `08` hashes (or a documented lossless re-encode) | build |
| 2 | Icon render: 192/512/180 decode, are opaque and square, and the content bbox is centred within 2 % | unit |
| 3 | PWA manifest validation: required fields, icons resolve, `start_url` and `id` token-free, `scope` `/foundation/` | unit + Lighthouse installability |
| 4 | Home-screen entry: `/foundation/return?src=home` with a session shows the current state; without one, CONFIRM IT'S YOU; never the homepage | e2e |
| 5 | iOS Safari guidance: no install button; three steps | e2e (WebKit) + on-device |
| 6 | Android guidance: button only with `beforeinstallprompt` mocked; `appinstalled` toast; menu steps otherwise | e2e (Chromium) + on-device |
| 7 | Launch responsive: safe zones fully visible at the 18 viewports in `07`; aspect never distorted; veil skipped when height < 480 | e2e |
| 8 | Launch behaviour: skipped when ready < 150 ms; 3 s / 10 s chips; reduced motion = no fade; failed restore → reentry | e2e |
| 9 | No token exposure: no `/foundation/<32-char token>` in manifest, icons, DOM after exchange, `location`, `history`, logs or analytics payloads | e2e + log scan |
| 10 | Session restoration / expiration / reauthentication / step-up | API + e2e |
| 11 | Email link reentry; invalid / expired / replaced link handling (12 states) | e2e |
| 12 | Client data authorization: no private record without a session; no cross-artifact access | API |
| 13 | Post-intake persistence: refresh and return show the same submitted intake and stage | e2e |
| 14 | Draft quote withholding (G-02); founder quote approval releases it | API + e2e |
| 15 | Exact quote-version acceptance; superseded versions unpayable | API + e2e |
| 16 | Stripe payment verification; no false PAID state from a redirect; webhook idempotency, amount and currency | API |
| 17 | **No retired card CTA**: no "ACCESS CARD", card download, QR or `?card=` in any client view | e2e + grep gate |
| 18 | **No retired card route** introduced by new work (no `/foundation/card*`, no card API action) | grep gate |
| 19 | Accessibility: axe per view; focus on exit from the veil; `alt` on the launch image; reduced motion | e2e |

## 24. Implementation order (LOCK1 §25; replaces OPUS1 `29` §25)

| Phase | Scope | Gate / depends on |
|---|---|---|
| 0 | Verify real source and asset access (hash check, route audit) | — |
| 1 | Secure the client artifact entry model (G-12) | — |
| 2 | Correct draft quote release behaviour (G-02) | 1 |
| 3 | Client portal shell (re-wire `ProjectPortal.tsx`; four areas; tier navigation) | 1 |
| 4 | Post-intake review experience | 2, 3 |
| 5 | Verified email reentry (G-09) | 1 |
| 6 | Session restoration | 5 |
| 7 | Mount the approved home-screen icon | 0, 6 |
| 8 | Configure the PWA manifest and entry (`/foundation/return`) | 6, 7 |
| 9 | Mount the approved launch experience | 8 |
| 10 | Platform-aware install flow (SAVE YOUR FOUNDATION) | 8 |
| 11 | Status and roadmap updates | 3 |
| 12 | Personalized proposal experience | 2, 11 |
| 13 | Acceptance and checkout gates | 12 |
| 14 | End-to-end staging verification (tests 1–19) | all |

There is **no client access card phase, no client QR phase and no card export phase.** This order does not authorize uncontrolled production changes.

## 25. Acceptance criteria (amended)

OPUS1 `29` §26 criteria 1–5 and 8–12 stand. Criteria 6–7 are replaced by:
- **6.** The iOS install sheet has no button; the Android button calls only `prompt()`; the icon is the approved D1/D2.
- **7.** Home screen and email resolve to the same foundation via `/foundation/return`; no QR, card or token in any shortcut, asset or file.
- **13 (new).** The launch shows the approved image exactly, with safe zones visible at every audited viewport, and never delays a ready portal.
