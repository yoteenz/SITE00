# 01 — Source and Product Audit

The audit covers base `d68038a87` (`cursor/idnty-founder-readiness-e2e-be3b`; PR #1667 merged after the sprint's quoted head `255576b5d`). It was read-only: no production source was changed.

## 1. Canonical client routes

| Route | Component | Notes |
|---|---|---|
| `/foundation/:token` | `DigitalFoundationArtifactPage` → `FoundationClient` | The one personalized link. Sub-views live in history state `{dfView, dfAnchor}`, never in the path |
| `/foundation/review` | `DigitalFoundationReviewPage` | Internal design review of P01–P07 + BLDR. A literal path under `/foundation/` that already shadows `:token` |
| `/invite/:code` | invitation entry | API returns `foundation_route: /foundation/<token>` |
| `?checkout=return\|cancel` | read by FoundationClient | Stripe success/cancel return markers |
| `?simulated_checkout=1` | read by FoundationClient | Test adapter banner |
| `?step=intake` | **ignored** | Added by admin pages and FNDATN-01 emails 01/06. `resolveDigitalFoundationArtifactUiStep` is used only by a test |

**New route proposed by this authority:** `/foundation/return`, a literal sibling of `/foundation/review`. Tokens are 32-character base64url strings, so the literal cannot collide with one. It is the public reentry entry and the home-screen `start_url`. The access-card QR target was retired in LOCK1. Composer registers it before `:token` in `Site00Routes.tsx`, the same way `/foundation/review` is registered. No other new route is introduced. The four areas stay history-state views inside the one artifact URL, as they are today.

## 2. Client views and what renders

| View (`DfView`) | Label (`DF_VIEW_META`) | Renders today |
|---|---|---|
| P01 | 01 GET STARTED | `P01Entry` |
| P02 | 02 BUSINESS INFORMATION | `P02Intake` |
| P03 | 03 BUILD YOUR FOUNDATION | `P03Configure` (read-only on INTAKE_SUBMITTED) |
| P04 | 04 RECOMMENDATION | `P04Recommendation` |
| P05 | 05 REVIEW + CHECKOUT | `P05Review` |
| P06 | 06 ACTIVATION | `P06Activation` |
| OVERVIEW | 07 PROJECT OVERVIEW | `InterimOverview` ("INTERIM VIEW — THE FULL PROJECT PORTAL ARRIVES IN A LATER RELEASE") |
| ROADMAP · STAGE · NEEDS_YOU · RECORDS · RECORD · COMM_PREFS | 08 · 09 · 10 · MY RECORDS · RECORD DETAIL · COMMUNICATION PREFERENCES | **nothing**: no `case` in the switch, so the body is `null` |
| COMPLETE / BUILD_UPSELL surface | — | `DigitalFoundationCompleteSurface` (older styling, sentence case) |
| ARCHIVED | — | "THIS LINK HAS BEEN CLOSED" panel |

The portal screens exist in `parents/ProjectPortal.tsx` (443 lines) and are imported nowhere. They were wired by `7ba509e6e` (PR #1577), were still present at `2001e373e`, and were lost in merge `b0b988db6` (PR #1527). The menu (`buildDfMenu`) still offers ROADMAP, NEEDS YOU, RECORDS and COMMUNICATION PREFERENCES, so selecting them today opens an empty frame.

## 3. Lifecycle source of truth

- `shared/site00-digital-foundation/types.ts` — `DigitalFoundationArtifactState` has 17 values: INVITED … ARCHIVED. It matches the sprint list exactly.
- `lifecycle.ts` holds the allowed-transition table. `assertArtifactTransition` is called through `service.transitionArtifact`.
- Sub-states:
  - intake: NOT_STARTED / IN_PROGRESS / COMPLETE;
  - payment: NONE / CHECKOUT_PENDING / PAID / FAILED / REFUNDED / DISPUTED;
  - project: NOT_STARTED / ACTIVE / WAITING_ON_CLIENT / WAITING_ON_PROVIDER / FINAL_VERIFICATION / COMPLETE;
  - quote: DRAFT / READY / CLIENT_REVIEW / ACCEPTED / SUPERSEDED / EXPIRED / PAID;
  - stage: WAITING / IN_PROGRESS / NEEDS_CLIENT / NEEDS_PROVIDER / COMPLETE / BLOCKED;
  - client action: OPEN / COMPLETED / CANCELLED.
- Server surface (`surface.ts`): PROSPECT · INTAKE · INTAKE_SUBMITTED (launch gate only) · RECOMMENDATION · QUOTE · CHECKOUT · PORTAL · COMPLETE · BUILD_UPSELL · PAYMENT_RECOVERY.
- Client-derived presentation in `model.ts`: `ReviewState` (11 values), `ActivationState` (10), `foundationProgress`. These are presentation derivations, not a second state machine. This authority adds one more presentation derivation, the client roadmap stage (7). It is computed from the same canonical state (`04`).

## 4. Post-submission behaviour today

- **Launch gate off (default).** `completeIntake` (`service.ts:256-298`) moves INTAKE_COMPLETE → RECOMMENDATION_READY → QUOTE_READY and creates quote v1 with status CLIENT_REVIEW. The client then runs `go('P04')`, so the quote is instant. There is no "received" moment and no founder approval before the client sees prices.
- **Launch gate on** (`SITE00_DIGITAL_FOUNDATION_LAUNCH_GATE_INTAKE_ONLY=1`). The surface is INTAKE_SUBMITTED, which shows a read-only P03 with a disabled button and no confirmation copy. The old `P03IntakeSubmitted` screen is gone; `FOUNDATION_INTAKE_ONLY_FLAG_AUDIT.md` still names it.
- **Email.** FNDATN-01 email 02 (`intake-completed`, "WE'VE RECEIVED YOUR INTAKE", "OUR TEAM IS NOW REVIEWING IT") contradicts the instant quote.

## 5. Quote, acceptance, checkout, payment

- Quote versioning is real. `updateQuoteSelections` creates v+1 and marks the previous version SUPERSEDED. `QUOTE_LOCKED` is thrown after ACCEPTED or PAID. Founder `applyManualQuoteAdjustment` also bumps the version.
- Acceptance (`acceptQuote`) requires the three verbatim disclosures (`DF_DISCLOSURES`). It records the version, `df-terms-v1`, IP and user agent, then moves to AWAITING_PAYMENT.
- Expiry is `quote_expiry_days: 14`. It is checked only at read time; nothing ever sets status EXPIRED.
- Checkout: `startCheckout` → `createCheckoutSession` → Stripe Checkout Sessions API, with metadata artifact_id / quote_id / quote_version / lead_id. Return URLs are `?checkout=return|cancel`.
- Confirmation comes only from the HMAC-verified webhook. `checkout.session.completed` (paid) or `payment_intent.succeeded` → `confirmPaymentFromWebhook` → PAID → PROJECT_ACTIVE → IN_PROGRESS, plus 7 stages, the readiness clock and the runbook. **The redirect never marks paid.** P06 polls 10 × 3 s.

## 6. Access control (critical)

- The token is `randomBytes(24).toString('base64url')`, stored in plaintext in `site00_df_artifacts.public_token`.
- Every API action resolves the artifact by token. There is no session, email verification, expiry, rotation, revocation or rate limit. CORS is `Access-Control-Allow-Origin: *`.
- A token holder can read the contact email, the intake (including phone), quote, approvals, ownership record and credit. They can also mutate the intake, quote, acceptance and client actions.
- ARCHIVED shows a "closed" panel in the UI, but the API keeps serving the payload. Whether POSTs on an archived artifact are rejected is unverified.

## 7. PWA / home screen

None. There is no manifest, apple-touch-icon, `theme-color`, service worker or vite-plugin-pwa. `index.html` links `/site00/favicon.svg`, which does not exist. FoundationClient sets `robots: noindex, nofollow` and the title "DIGITAL FOUNDATION — SITE 00".

## 8. Email lifecycle

- `communications/eventMap.ts` maps 17 events to templates, all `enabled: false`. Send flags default OFF and `dispatch.ts` records DRY_RUN intents.
- FNDATN-01 pack 01–07, all `dispatch_enabled: false`:

| # | Template / subject |
|---|---|
| 01 | Invitation |
| 02 | WE'VE RECEIVED YOUR INTAKE |
| 03 | YOUR RECOMMENDATION IS READY |
| 04 | PAYMENT RECEIVED |
| 05 | YOUR FOUNDATION IS COMPLETE |
| 06 | Intake resume reminder |
| 07 | Quote expiry reminder |

- No scheduler evaluates the derived reminders.

## 9. Design system (reused, not replaced)

- Tokens in `site00-df-client.css` (2610 lines): `--df-bg #f3f2ef`, `--df-card #f9f8f6`, `--df-ink #0c0c0c`, `--df-muted #75736e`, `--df-rule #dcdad5`, `--df-red #ce1017`, `--df-red-ink #b30f17`.
- Fonts: 'SITE 00 Display' (400–900) and 'Saira Semi Condensed' (300–600) via `site00-correspondence-fonts.css`.
- Icons: about 150 monoline glyphs in `foundation-client/icons/glyphs.ts`.
- Objects: `DfThresholdHero`, `DfCrownObject`, `DfCornerFragment` (`objects.tsx`; raster slots `DF_ARCHITECTURE_RENDERS` are still null).
- Brand mark: text only ("SITE 00"). No logo file exists, and none is invented here.
- Discrepancy noted, not resolved: `DF_VISUAL_FIDELITY_ASSET_ICON_V1.md` claims red `#E50107` and stroke 1.25, while the code uses `#ce1017` / `#d3121b` and stroke 1.65. **This authority follows the code.**

## 10. Existing → proposed mapping

| Existing | Proposed authority | Change kind |
|---|---|---|
| P03 read-only (launch gate) / instant P04 | A · POST-INTAKE REVIEW ("YOUR FOUNDATION IS TAKING SHAPE") | new view + server gate (G-02) |
| `InterimOverview` | B · OVERVIEW, lifecycle-aware | re-wire `P07ProjectOverview`, re-skin |
| `P08Roadmap` (unwired) | C · ROADMAP, 7 client stages | re-wire, new stage derivation |
| `P10NeedsYou` (unwired) | D · NEEDS YOU, 5 action states | re-wire, payload additions (G-04–G-06) |
| `RecordsLibrary` / `RecordDetail` (unwired) | E · RECORDS + verified view | re-wire, step-up (G-10) |
| — | F · SAVE YOUR FOUNDATION + approved launch (LOCK1) | new (manifest, approved icon, launch, guidance) |
| — | ~~G · ACCESS CARD~~ | **RETIRED** (LOCK1 L-05) |
| token link only | H · SECURE REENTRY | new route + session (G-09) |
| P04 Recommendation | I · PROPOSAL + J · OPTIONS | re-skin; recommendation reasons (G-25) |
| P05 Review + checkout | K · ACCEPTANCE + L · AWAITING PAYMENT | split presentation; same API |
| P06 Activation | M · CONFIRMATION → "YOUR FOUNDATION IS UNDERWAY" | copy + layout |
| — | N · IN PROGRESS (8 workstreams) | new projection (G-07) |
| — | O · FINAL VERIFICATION | new view on existing state |
| `DigitalFoundationCompleteSurface` | P · ESTABLISHED | re-skin into the DF grammar |
| — | Q · ACTIVITY | client-safe event projection (G-08) |
| `CommunicationPreferences` (unwired) | R · UPDATES BY EMAIL | re-wire; API exists |
| DfSystemPanel errors | S · ERROR CATALOGUE | extend |
| DfMenu drawer | T · OVERLAYS | extend |
