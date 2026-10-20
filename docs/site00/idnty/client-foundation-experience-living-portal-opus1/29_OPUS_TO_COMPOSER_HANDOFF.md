# 29 — Opus → Composer Handoff

> **LOCK1 amendment:** the implementation order (§25), access sections (§14–17), test matrix and acceptance criteria 6–7 are **superseded** by [LOCK1 10 — Updated Composer handoff](../client-foundation-digital-access-authority-lock1/10_UPDATED_COMPOSER_HANDOFF.md). The access card is retired; build none of its components.

Composer builds from this package and does **not** invent design. Where a decision is open, it is listed in `31`. Do not ship around an open decision.

Constraints carried forward:
- do not change the founder workspace implementation, design system or navigation;
- do not edit the OPUS recovery workstream;
- do not create a second client state machine;
- do not send emails or trigger Stripe in tests outside the existing simulated adapter.

## 1. Source route map

| Route | Today | After |
|---|---|---|
| `/foundation/:token` | FoundationClient (bearer) | same component; first visit exchanges the token for a session and `replaceState`s to `/foundation/return` (G-09/G-12) |
| `/foundation/return` | — | **new** literal route, registered before `:token`, like `/foundation/review`. Public reentry (CF-36) or the session-authorised portal |
| `/foundation/review` | internal design review | unchanged (OD-04) |
| `/foundation-manifest.webmanifest` | — | **new** static file (G-13) |
| views | history state `dfView` | add `ACTION`, `ACTIVITY`; keep the rest (no `ACCESS_CARD`, retired) |

## 2. Current component map → 3. New component map

| Existing (src/site00/foundation-client) | Becomes | Registry |
|---|---|---|
| `shell.tsx` DfFrame / DfMenu / DfSystemPanel / DfCta / DfLoading | Frame gains tier navigation (CF-02/03/04), account cluster (CF-01), DfOverlayHost (`21`) | CF-01–04, CF-38 |
| `objects.tsx` | unchanged; crown on all portal heroes, corner on system panels | CF-05 |
| `icons/glyphs.ts` | unchanged | — |
| `parents/EntryIntake.tsx` P01–P03 | unchanged (intake) | — |
| *(new)* `parents/Review.tsx` | Family A | CF-05/06/08/09/12/17 |
| `parents/Recommendation.tsx` P04 | Proposal + options (I, J) | CF-20/21/22/23 |
| `parents/CheckoutActivation.tsx` P05 | Acceptance + awaiting payment (K, L) | CF-24/25/26 |
| `parents/CheckoutActivation.tsx` P06 | Confirmation (M) | CF-27 |
| `parents/CheckoutActivation.tsx` InterimOverview | **removed**, replaced by P07 | — |
| `parents/ProjectPortal.tsx` P07/P08/P09/P10/Records/RecordDetail/CommPrefs | **re-wire** into FoundationClient's switch; re-skin per B, C, D, E, R | CF-10/13/14/15/18/19/32 |
| *(new)* `parents/Operations.tsx` | workstreams + verification (N, O) | CF-28/29 |
| `pages/foundation/DigitalFoundationCompleteSurface.tsx` | replaced by `parents/Established.tsx` (P), keeping `build-interest` | CF-30 |
| *(new)* `access/HomeScreenSheet.tsx`, `access/LaunchVeil.tsx`, `access/Reentry.tsx` | F, H (G retired) | CF-33, CF-36, CF-37, CF-41 |
| *(new)* `parents/Activity.tsx` | Q | CF-31 |
| `model.ts` | add `clientStage()`, posture derivations, the new view ids. **No new lifecycle state** | `04` |

## 4. Reusable visual primitives

Primitives, from the specimens:
- rail;
- headline with red period;
- lede;
- truth strip;
- section label with rule;
- row (icon / title / sub / value / arrow);
- spec block (icon / key+sub / value);
- status chip (7 kinds);
- dot (6 kinds);
- ticks;
- strip;
- action card;
- record row;
- quote table + total;
- version chip;
- recommendation card;
- checkbox row;
- workstream card;
- timeline entry;
- panel (card / white / red);
- CTA (primary / outline / ink / ghost / disabled / busy);
- link;
- trust line;
- footer;
- sheet / dialog / drawer / toast / banner.

Class names in `boards/src/cf.css` map one-to-one to the existing `.df-*` names where they exist (`.cf-row` ↔ `.df-row`, `.cf-cta` ↔ `.df-cta`, `.cf-hl` ↔ `.df-headline`). Extend `site00-df-client.css` / `site00-df-components.css`; do not create a parallel stylesheet.

## 5–10. Grid, type, tokens, fonts, assets, motion

`22`, `23` (tokens, type scale, font map), `24`, `25`.

## 11–12. Lifecycle UI matrix, post-intake mapping

`04`, `05`. The client stage is derived; the server stays the only state machine.

## 13. Proposal / quote versioning

See `14`–`16`. Rendering rules:
- the version chip always shows;
- superseded versions are struck and have no actions;
- a mismatch at accept re-renders the CHANGED state;
- required-declined goes through G-17.

## 14. Home-screen install contract

See `09`, `10`. The browser `prompt()` is used only when `beforeinstallprompt` fired. iOS gets steps only. Desktop gets bookmark guidance. Standalone hides the entries. The manifest is static, and its `start_url` never carries a token.

## 15. Safe reentry architecture

See `13`. Session cookie: httpOnly, Secure, SameSite=Lax, 30 days. Link: 15 min, single use. Code: 10 min, 5 tries. Step-up: 30 min idle. The flow is non-enumerating, and the 12 states are listed in `13`.

## 16–17. ~~Access card file contract, QR security~~ — RETIRED (LOCK1)

No card files, no QR. Token exposure rules remain in `28` and LOCK1 `06`.

See `11`, `12`.

## 18. Email event contract

Events and templates are listed in `20`. Every mapping stays `enabled: false`. CTAs point to `/foundation/return?src=email&e=<event>` after G-09. The founder approves copy before any send flag changes.

## 19. Payment event gates

See `17` and X07: verified webhook, quote-version binding, idempotency, amount, currency and artifact linkage. Only the webhook writes PAID.

## 20. Backend gaps

See `27`. Blockers: G-02, G-09, G-12.

## 21. Accessibility

- One `h1` per view, and focus moves to it on view change.
- Landmarks: `header`, `nav` (labelled YOUR FOUNDATION), `main`, `aside`, `footer`.
- `aria-current="page"` on the current area.
- Status chips, dots and workstream states carry text, never colour alone.
- Contrast (measured):
  - ink on bg: 17.5:1;
  - ink-2 on bg: 12.0:1;
  - red on bg: 5.05:1;
  - white on red: 5.66:1;
  - card grey on dark card: 10.2:1;
  - **muted `#75736e` on bg: 4.23:1, which fails AA for small text** (4.46:1 on card).

  The live client has the same issue. This authority proposes darkening `--df-muted` to `#6b6964` (≥ 4.9:1 on bg and card) as founder decision OD-08. It is not applied in the boards, so they match the live palette. `--df-faint` (2.31:1) is reserved for decorative and struck text only.
- Dialogs: focus trap, Esc closes, focus returns to the trigger. Toasts are `role=status`, errors `role=alert`.
- The code input uses `autocomplete="one-time-code"` and `inputmode="numeric"`.
- Reduced motion is honoured (`25`).
- Targets are ≥ 44px. The bottom bar has a safe-area inset.

## 22. Error states

S-catalogue (X11):
- OFFLINE, LOAD FAILED, UNAVAILABLE, PAYMENT RECOVERY (paused), LINK CLOSED, ACTION FAILED, CHECKOUT DOWN, RECORD NOT FOUND;
- plus the 12 reentry states (`13`) and the payment states (`17`).

Each says what happened, that nothing was lost, and gives one way forward. Internal codes are never shown (`checkoutErrorCopy` pattern).

## 23. Test matrix (minimum for Composer)

| Area | Tests |
|---|---|
| Derivations | `clientStage()` for all 17 states × payment sub-states; marker rules; posture per state |
| Views | each view renders for its states (vitest + RTL), using the fictional fixture only |
| Responsive | Playwright at 320, 390, 820, 1194, 1440 and 2560: no horizontal overflow, no text < 10px, areas reachable |
| Home screen | platform detection: iOS shows no button; Android shows the button only with `beforeinstallprompt` mocked; standalone hides entries; manifest has no token |
| ~~Access card~~ | RETIRED. Replaced by LOCK1 `10` tests 1–9 and 17–18 (asset identity, icon, manifest, launch, no card CTA or route) |
| Reentry | 12 states; enumeration-safe responses (same body for match/no match); rate limit; code 5 tries |
| Payment | redirect alone never shows UNDERWAY; webhook replay idempotent; amount/currency mismatch rejected (server tests) |
| A11y | axe on each view; focus management on view change and dialogs |
| Regression | existing DF tests (`tests/digitalFoundation*`), founder workspace untouched |

## 24. Migration impact

- **Client.** InterimOverview is removed and ProjectPortal re-wired. Existing token links keep working. The localStorage key `site00.df.activation-seen.<id>` is kept.
- **Server.**
  - New tables are **proposed** (not created here): `df_client_sessions`, `df_login_challenges` (`df_access_cards` retired with G-11).
  - New payload fields: `review`, `client_activity`, `client_workstreams`, `recommendations`, `fetched_at`, `client_note`.
  - CORS restriction and ARCHIVED handling may affect any external caller of the artifact API. None is known.
- **Email.** Copy changes for template 02; three new templates; sending remains disabled.
- **Founder workspace.** Parity only; no change in this sprint (`X06`).

## 25. Implementation order (§45)

| Phase | Scope | Depends on | Docs |
|---|---|---|---|
| 0 | Source and contract audit: re-verify `01` against HEAD | — | 01, 27 |
| 1 | Client portal shell: tier nav, re-wire ProjectPortal, view ids, overlay host | 0 | 03, 21, 22 |
| 2 | Post-intake review experience | 1, G-02 (or launch gate) | 05 |
| 3 | Persistent status + roadmap | 1, G-19 | 06, 20 |
| 4 | Secure return access | G-09, G-12 | 13, 28 |
| 5 | Save to home screen | 4, G-13 | 09, 10 |
| 6 | ~~Personal access card~~ — **RETIRED**; see LOCK1 `10` for the new order | — | — |
| 7 | Founder review status parity | G-01, G-02 | 04, X06 |
| 8 | Personalized proposal | 7, G-23, G-25, G-18 | 14, 15 |
| 9 | Quote acceptance and versioning | 8, G-17 | 16 |
| 10 | Stripe checkout integration (presentation; gates verified) | 9, G-15 | 17 |
| 11 | Post-payment project roadmap | 10, G-07, G-08 | 18 |
| 12 | Needs You and records | 11, G-04/05/06/10/26 | 07, 08, 19 |
| 13 | Email lifecycle (templates; sends stay off until founder approval) | 2–12, G-14, G-24 | 20 |
| 14 | End-to-end staging acceptance | all | 33 |

This sequence does not authorize uncontrolled production changes.

## 26. Acceptance criteria

1. Every board family A–T is implemented at all five tiers, matching the boards within the tolerances of `22` and `23`.
2. Zero layout-audit failures at the 16 audited viewports.
3. No client view shows a percentage, a countdown, a "just updated" label or simulated activity.
4. Records show READY only for existing records.
5. No page, image, file, log or manifest contains a `/foundation/<token>` URL except the invitation email link and the token route itself.
6. The iOS install sheet has no button. The Android button calls only `prompt()`.
7. *(superseded by LOCK1 `10` §25)* Home screen and email resolve to the same foundation via `/foundation/return`; no QR, card or token in any shortcut, asset or file.
8. The 12 reentry states are reachable in tests, with enumeration-safe responses.
9. Superseded quote versions cannot be accepted or paid from the UI. The redirect alone never shows UNDERWAY.
10. Push is never requested, and no email is sent without founder approval.
11. The founder workspace is unchanged.
12. `npm run build` and existing tests pass.
