# Brand Expression Gate + Candidate Authority

**Sprint:** P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1
**Source of truth:** `shared/studioos-visual-authority/creative-direction.ts`. `BRAND_EXPRESSION_GATE.json` is generated.

## Brand expression: before any generation

Every item must **PASS with evidence** (`checkBrandExpression` → `BRAND_EXPRESSION_READY`):

| # | Item |
|---|---|
| 1 | Visual world present |
| 2 | Product philosophy present |
| 3 | Family-specific logic present |
| 4 | Custom graphic-design idea present |
| 5 | Bespoke material object present (where appropriate) |
| 6 | Meaningful environmental role |
| 7 | Logo placement intentionally art-directed |
| 8 | Tagline / descriptors intentionally handled |
| 9 | Primary signal unmistakable |
| 10 | Secondary data does not compete |
| 11 | No generic dashboard composition |
| 12 | No generic card stack |
| 13 | No default AI composition |
| 14 | No unrelated decoration |
| 15 | Visual idea survives without marketing copy |
| 16 | Mobile geometry works |
| 17 | Bottom navigation works |
| 18 | No circular tappable buttons |
| 19 | **Brand evident with the logo hidden** (critical) |

> IF THE LOGO IS HIDDEN, THE SCREEN SHOULD STILL FEEL LIKE THE BRAND.

## Candidate authority: after generation

`checkCandidateAuthority` returns `REFERENCE_AUTHORITY_READY` only when every condition below holds. Otherwise it returns the status in the right-hand column:

| # | Condition | Blocked status |
|---|---|---|
| 1 | Creative direction ready | `CREATIVE_DIRECTION_REQUIRED` |
| 2 | Brand expression ready | `BRAND_EXPRESSION_REQUIRED` |
| 3 | A generated candidate exists | `CANDIDATE_REQUIRED` |
| 4 | It was made by the **profile renderer**: model, quality, aspect ratio, auto-enhance and generation mode all match. <br>• A local HTML/CSS render is never a final candidate. <br>• A deviation counts only with a recorded founder exception (`renderer_exceptions`). | `RENDERER_MISMATCH` |
| 5 | The **anti-AI visual audit** has no MATERIAL flag | `ANTI_AI_FAILURE` |
| 6 | The **typography guard** has no unrepaired defect | `TYPOGRAPHY_FAILURE` |

### Anti-AI flags

- GENERIC_LUXURY_APP
- GENERIC_FINTECH
- GENERIC_MEDITERRANEAN
- CARD_STACK_DRIFT
- GLASSMORPHISM_DEFAULT
- OVERLY_CENTERED_AI_LAYOUT
- DECORATIVE_ICON_NOISE
- RANDOM_BOTANICALS
- RANDOM_GOLD_ACCENTS
- FAKE_EDITORIAL_COPY
- MATERIAL_OVERLOAD
- UNJUSTIFIED_3D_OBJECT
- PHOTOREAL_SCENE_WITH_UI_PASTED_ON
- AI_TYPOGRAPHY_ARTIFACTS
- ILLEGIBLE_TEXT
- GENERIC_PROMO_LAYOUT
- TEMPLATE_DASHBOARD
- MOODBOARD_NOT_PRODUCT

### Typography defects

Each defect is either regenerated or repaired. A repair means compositing the official asset, and it is recorded.

- misspelling
- fake word
- random label
- duplicated nav item
- mutated wordmark
- garbled amount
- broken tagline

## Baseline

The JURNL F09 territory-proof-1 candidates (local HTML renders, no translation) evaluate to `CREATIVE_DIRECTION_REQUIRED`. That is the methodology gap this gate closes. See `JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/F09_CREATIVE_GATE_STATUS.json`.
