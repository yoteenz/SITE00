# Email V2 R4 — premium editorial pack (20 emails)

**Status:** FOUNDER REVIEW PENDING · no send · no ESP wiring · OpenArt credits spent: 1700 (10 images, 0 regenerations)

## How to review

1. **Review artifact (primary).** Preview tunnel or production: `/site00-correspondence-studio/previews/r4/review/index.html`.
   In the client ZIP: `review/index.html`. In the repo: `scripts/df-email-v2-benchmark/r4/review/index.html`.
   - **VIEW · EMAIL:** an inbox-style index (subject plus preheader) grouped by family; the email in a live iframe; a panel with art class, photograph, composition, family relationship, tokens and QA.
   - **DEVICE:** MOBILE 390 · TABLET 768 · DESKTOP 1024 · ALL 3 side by side.
   - **VERSION:** R4 · R3 · COMPARE (R3 and R4 side by side) for the three benchmarks: invitation, foundation-complete, M06.
   - **FAMILY / ART:** filter by transactional, operational, marketing, and by P1 / P2 / P3.
   - **VIEW · FAMILY WALL:** all twenty as mobile thumbnails by family, with the art each one shares.
   - **VIEW · ASSETS:** the ten photographs and which emails each serves.
   - Keyboard: ↑ / ↓ (or k / j) steps through the list. The URL hash keeps your place, so a link reopens the same view.
2. **Correspondence Studio.** `/admin/site00/correspondence-studio` → Digital Foundation → client lifecycle → any
   template. R4 is the current version on all twenty; V2, R2 and R3 stay selectable for comparison.

## What to decide

- Approve, revise or reject per email (Studio review state). Every R4 version enters at `founder_review`.
- P1 / P2 / P3 classification (below). Change any class and the matrix says which photograph moves.
- The two R3-contract subjects (invitation, M06) versus the pack contract subjects.
- Routes still open before any send: `{{preference_url}}`, `{{unsubscribe_url}}`, the BLDR route for M06, and a registered sender.

## Unique, shared and utility art

| Class | Count | Templates |
|---|---|---|
| **P1 · unique premium hero** | 10 | personal-foundation-invitation (G01), quote-ready (G04), payment-confirmed (G05), project-activated (G06), foundation-complete (G02), records-available (G07), foundation-credit-issued (G08), M01 (G09), M06 (G03), M13 (G10) |
| **P2 · shared family art** | 4 | intake-started (G01 floor-light crop), quote-updated (G04 model detail), checkout-link-ready (G05 threshold slot), bldr-discovery (G03 pavilion band + R3 plans) |
| **P3 · utility, drawn only** | 6 | intake-completed, quote-accepted, payment-failed, client-action-required, approval-requested, approval-completed |

## Files

| File | What it is |
|---|---|
| `CREATIVE_AUTHORITY_R4.md` | Laws, type roles, device library, family dialects, one entry per template |
| `PREMIUM_ASSET_MATRIX.md` / `.json` | Classes, assets, crops per template, drawn devices |
| `COST_REPORT.md` | Budget, quote vs. spend, ceiling decision |
| `OPENART_PROVENANCE.json` | Per image: history id, resource id, CDN URL, PNG SHA-256, prompt, reference |
| `QA_R4.md` | Render and QA results (machine output: `scripts/df-email-v2-benchmark/r4/qa/R4_QA.json`) |
| `premium-assets/R4-G01 … G10.jpg` | Archived JPEGs of the ten originals (PNG originals are in the client ZIP) |

## Rebuild

```bash
cd scripts/df-email-v2-benchmark/r4
python3 build_r4.py                      # 20 review emails + 20 send templates + pack.json
ln -sf ../../../node_modules node_modules
node render.mjs                          # 120 renders → /tmp/SITE00_EMAIL_V2_R4/RENDERS
node qa_r4.mjs                           # qa/R4_QA.json
rm -f node_modules
python3 build_review_r4.py --public      # review data, previews, matrix, provenance, public mount
```
