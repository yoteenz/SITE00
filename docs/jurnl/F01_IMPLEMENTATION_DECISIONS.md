# JURNL F01 ENTRY — IMPLEMENTATION DECISIONS

Sprint: `P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1` · 2026-10-05
Status: **IMPLEMENTATION_READY · LIVE_QA_PASSED · FOUNDER RUNTIME REVIEW PENDING** (founder approval is never inferred).

## 1. Where F01 lives

| Layer | Path |
|-------|------|
| Project record | `src/projects/jurnl/data/jurnlProject.ts` (registered in `src/projects/registry.ts`) |
| Screen tree + 27 state authorities | `src/projects/jurnl/data/f01/screens.ts` |
| All user-facing copy (UPPERCASE) + claims register | `src/projects/jurnl/data/f01/copy.ts` |
| Interaction manifest → runtime bindings (74/74) | `src/projects/jurnl/data/f01/interactionBindings.ts` |
| Family production contract instance + budget | `src/projects/jurnl/data/f01/contract.ts` |
| Runtime coverage (gate input) | `src/projects/jurnl/data/f01/coverage.ts` |
| Live runtime (React, scoped `.jrn`) | `src/projects/jurnl/runtime/` |
| Host mount | `/production/jurnl/runtime/*` via `src/site00/projectRuntime/` |
| Design workspace | `/production/jurnl/design?mode=brand|experience|surfaces|compiler|assets|viewport` |

## 2. Authority hierarchy applied

1. F01.00 approved parent (visual DNA lock) → 2. child authorities (layout per screen) → 3. interaction authorities (behaviour,
   uppercase regenerated sheets) → 4. state sheets (coverage only; two are off-brand, rendered in the JURNL palette) →
5. global brand locks (uppercase, square-rounded controls, palette, official logo).
Where two authorities conflict, the more specific / later authority wins and the conflict is logged (`SYSTEM_DEFECT_REPAIR_LOG.md` §C).

## 3. Visual construction (no harvest, no baked UI)

- Every text, form, button, drawer, sheet, modal, toast and icon is **live code** (React + CSS + inline SVG).
- Environment (wall, light shafts, arch + coast view, curtain, olive, plinth, bowl, books, vase, face-id plaque, journal,
  padlock, table, envelope, seal, linen, tray, collage) is **code-constructed SVG/CSS**, `aria-hidden`, `pointer-events: none`.
- The **only raster** in the runtime is the official JURNL logo (`/site00/projects/jurnl/brand/jurnl-logo-official.png`),
  derived from the package master logo. Test-enforced.
- The failed F01 harvest (`JURNL/F01_ENTRY/ASSET_HARVEST_PROOF1/`, `ASSETS/`, `OVERLAYS/`, sheet crops) is pre-existing on `main`,
  left untouched as a record, and **excluded** from runtime (contract `assetPolicy.excludedSources` + test).
- The marble bust is **not reconstructed** (no canonical asset; contract marks it `MISSING`).
- Typography: `INSTRUMENT SERIF` (display) + `BARLOW SEMI CONDENSED` (functional), both SIL OFL, self-hosted woff2 under the
  project's font folder. Chosen by measured comparison against the parent's display/label lettering.
- Headline scale per screen follows the authorities (base / large / extra-large display steps); authored line breaks never re-wrap.

## 4. Global locks — how they are enforced

| Lock | Enforcement |
|------|-------------|
| ALL USER-FACING TEXT UPPERCASE | Copy authored uppercase; `.jrn { text-transform: uppercase }` as a safety net; tests scan copy, rendered text and aria-labels; live capture counts lowercase glyphs (0 in 42 captures). |
| Exception | Typed / revealed **password values** keep their case (`input[type=password]` and revealed state): a password is case-sensitive, so uppercasing it would change the secret. Placeholder / labels remain uppercase. |
| No circular tappable controls | Controls use ≤16 px radii; checkbox is square; status glyphs drawn without circles; tests parse every radius; live DOM check: interactive round elements = 0. Circles only in decorative environment (`.jrn-p--*`). |
| Host / project firewall | Iframe isolation; CSS fully scoped under `.jrn`; runtime only importable through the runtime registry. |

## 5. Auth boundary (no second auth system, no fake production success)

- `JurnlAuthAdapter` interface. Two implementations:
  - **DESIGN_PREVIEW** (workspace runtime only): device-local accounts so every state is reachable. Seeds
    `EMMA@EXAMPLE.COM / Jurnl-2026` and `LOCKED@EXAMPLE.COM` (locked). 5 failed attempts → LOCKED. Reset token `preview:<email>`.
  - **UNCONFIGURED** (production path): every call returns an honest "NOT AVAILABLE YET" error — never succeeds.
- **JURNL end-user auth provider is unresolved.** SITE 00 Supabase is host auth (shared with FSBW) and is **not** silently reused.
- Apple / Google: boundary implemented; returns `PROVIDER_NOT_CONFIGURED` and shows the not-configured modal.
- Native bridge: Face ID unlock / enable go through `JurnlNativeBridge` which reports OS outcomes (granted / denied / failed /
  unavailable). JURNL never draws Apple's system UI. Preview outcomes are selectable with `?os=`.
- External handoffs (MAIL app, SUPPORT, provider redirect) are explicit boundaries reported to the host.

## 6. Founder-facing product decisions taken (reversible)

| Decision | Reason |
|----------|--------|
| AI ACCESS toggles default **OFF** (opt-in). | Privacy primer; safest default for a finance product. Founder may change. |
| Password rules = 8+ / uppercase / number / special. | Interaction authorities (more specific than children). |
| Terms agreement checkbox on F01.01 (square). | Validation authority requires it. |
| F01.11 / F01.12 eyebrow without internal F01 codes. | Internal production codes are not user copy. |
| F01.04 remembered account `EMMA S.` with initials tile (square). | Child authority; avatar circles not allowed as controls. |
| F01 → F02 boundary is a holding surface "SETUP STARTS HERE." | F02 not implemented (no downstream drift). |

## 7. Security / privacy claims register (`F01_CLAIMS`)

**WITHHELD** (not rendered anywhere):

| ID | Claim (authority text) | Category | Reason |
|----|------------------------|----------|--------|
| C01 | ENCRYPTED DATA | ENCRYPTION | No verified encryption implementation for JURNL. |
| C02 | SECURE SERVERS | BANK_LEVEL_SECURITY | No JURNL backend exists yet. |
| C03 | NO UNAUTHORIZED SHARING | DATA_SALE_OR_SHARING | No published data-sharing policy. |
| C04 | WE FOLLOW INDUSTRY BEST PRACTICES TO KEEP YOUR INFORMATION SAFE. | AUDIT | Unverifiable compliance claim. |
| C05 | BIOMETRIC DATA STAYS ON YOUR DEVICE AND IS NEVER SHARED WITH JURNL. | NATIVE_PLATFORM | Depends on a native integration that does not exist yet. |
| C06 | SECURED BY APPLE. YOUR BIOMETRIC DATA NEVER LEAVES YOUR DEVICE. | NATIVE_PLATFORM | Fakes native OS UI and speaks for Apple. |
| C07 | SECURITY KEEPS YOUR WORK MOVING. JURNL PROTECTS WHAT MATTERS. | AUDIT | Generic protection guarantee. |

**FLAGGED — REQUIRES SUBSTANTIATION** (rendered because they are canonical child copy, but listed in the inspector CLAIMS tab and
cannot ship to production silently):

| ID | Claim | Needs |
|----|-------|-------|
| C08 | USE FACE ID TO KEEP JURNL EASY TO OPEN AND HARDER TO ACCESS WITHOUT YOU. | Native biometric app lock. |
| C09 | WE'LL REMEMBER THIS DEVICE SO YOU WON'T NEED TO VERIFY EVERY TIME YOU SIGN IN. | Device-trust backend (today device-local). |
| C10 | WE'LL SEND YOUR DATA TO YOUR EMAIL SOON. | Export pipeline + email delivery. |
| C11 | THE DEVICE HAS BEEN SIGNED OUT AND CAN NO LONGER ACCESS YOUR ACCOUNT. | Server-side session revocation. |

## 8. Runtime query switches (design preview)

`?state=<key>` (27 authorities + 6 runtime states) · `?overlay=<id>` · `?scenario=network-error|offline` ·
`?os=denied|failed|unavailable` · `?link=valid|expired` · `?token=preview|expired` · `?reset=1` (clears JURNL device keys only).
The DESIGN → VIEWPORT ROUTE / STATE / SCENARIO selects drive these.

## 9. Responsive

Mobile 393×852 is the authority. Tablet (≥600 px) and desktop (≥1100 px) are **re-composed** layouts (column widths, display
scale, environment placement; from tablet up, drawers and full-screen sheets become centred 560 px floating panels) — not
upscaled mobile.
