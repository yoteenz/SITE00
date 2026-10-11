# Email V2 R3 — editorial publishing compositions

Sprint `P0.SITE00.IDNTY.EMAIL-V2-R3-EDITORIAL-PUBLISHING-BESPOKE-GRAPHIC-INTELLIGENCE-AND-TYPOGRAPHIC-AUTHORITY1`.

One integrated composition per benchmark email, converged from the nine R2 territories:

| Email | R3 | Build |
|---|---|---|
| B01 · Personal Foundation Invitation | THE INVITATION | `scripts/df-email-v2-benchmark/r3/emails/B01_R3.html` |
| B02 · Foundation Complete | THE RECORD | `scripts/df-email-v2-benchmark/r3/emails/B02_R3.html` |
| B03 · M06 BLDR Introduction | THE ISSUE | `scripts/df-email-v2-benchmark/r3/emails/B03_R3.html` |

**Status: FOUNDER REVIEW PENDING.** Agent selection is not approval. The remaining seventeen emails are not authorized.
No sends, no merge, no deploy. OpenArt generations: 0.

## Where to review

- Correspondence Studio: `/admin/site00/correspondence-studio` → Digital Foundation → Client lifecycle → the email. R3 is the
  current version; V1, V2 and the three R2 territories stay selectable, and COMPARE WITH puts any two side by side.
- Self-contained review: `scripts/df-email-v2-benchmark/r3/review/index.html` (email, R3 / R2 A–C / R1, device, compare,
  rationale, graphic provenance).

## Documents

| Deliverable | File |
|---|---|
| Art direction, why each composition, R2 → R3 comparison | `ART_DIRECTION_R3.md` |
| Copy contracts | `B01_COPY_R3.md`, `B02_COPY_R3.md`, `B03_COPY_R3.md` |
| Typographic authority (verified display face) | `TYPOGRAPHIC_AUTHORITY.md` |
| Graphic and icon manifest | `GRAPHIC_ASSET_MANIFEST.json` |
| Email-safe implementation | `EMAIL_SAFE_IMPLEMENTATION.md` |
| Premium asset candidates | `PREMIUM_ASSET_CANDIDATES_R3.md` |
| QA | `qa/R3_QA.json`, `qa/render_report.json` |
| Rendered previews (390 / 768 / 1024, webfont) | `previews/B0x_R3_{MOBILE,TABLET,DESKTOP}.jpg`, `previews/R3_CONTACT_SHEET.jpg` |

## Sources and tools (`scripts/df-email-v2-benchmark/r3/`)

| Path | Purpose |
|---|---|
| `compose/` | Editable composition sources and the shared email base CSS |
| `graphics/icons/`, `graphics/devices/` | Editable vector sources (SVG) and the display lockup source (`lockups.html`) |
| `prepare_r3.py` | Copies the approved R1/R2 crops into `assets/` |
| `render_graphics.mjs` | Rasterizes icons, devices and lockups to `assets/gfx/` at 2x |
| `build_emails.py` | Builds `emails/` (review) and `emails/templates/` (send templates with tokens) |
| `render.mjs` | Renders 390 / 768 / 1024 with and without web fonts; fails on overflow or missing assets |
| `qa_r3.mjs` | Copy, case, type-role, alt and link QA against the benchmark COPY.md |
| `build_review.py` | Builds the review data, the asset manifest and `ART_DIRECTION_R3.md` |
| `scripts/correspondence-studio/sync-r3-previews.mjs` | Publishes R3 and R2 previews into `public/` for the studio |

## Ownership

SITE 00 owns email marketing. Studio World owns the editorial methodology these compositions apply. Correspondence Studio is
the review environment. NDX was the pilot brand for the earlier benchmark and is not the methodology's name. The
`NdxCreativeHandoff` type in `shared/site00-correspondence-studio/types.ts` still carries the pilot name; renaming it is
a separate change.
