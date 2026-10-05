# IDNTY intake methodology

**Sprint:** `P0.SITE00.IDNTY.INTAKE-METHODOLOGY-FORMALIZATION1`  
**Status:** Product / intelligence architecture (no intake UI in this sprint)

## Product truth

Brand intake is **not** administrative pre-work. It is the **entryway to IDNTY**.

SITE 00 does not run a generic branding questionnaire and interpret it later. Intake is **reverse-engineered** from the twelve canonical IDNTY dimensions so every question resolves specific brand-truth fields.

### Client provides

Truth, meaning, constraints, behavior, context, preferences, boundaries, existing equity, approval authority.

### SITE 00 provides

Interpretation, strategic synthesis, creative direction, logo territories, color logic, typographic logic, visual grammar, expression system, final authority.

**Do not ask clients to design their own brand.** Ask what the mark should symbolize—not what logo style they want. Ask what the brand should feel like before a word is read—not which colors they like.

## Canonical dimensions

| ID | Dimension |
|----|-----------|
| 01 | TRUTH |
| 02 | POSITION |
| 03 | PROMISE |
| 04 | PERSONALITY (+ voice genome) |
| 05 | LANGUAGE |
| 06 | VERBAL SYSTEM |
| 07 | MARK |
| 08 | PALETTE |
| 09 | TYPE |
| 10 | VISUAL GRAMMAR |
| 11 | EXPRESSION |
| 12 | AUTHORITY |

Schemas: `IDNTY_DIMENSION_SCHEMA.json`  
Questions: `IDNTY_QUESTION_BANK.json` (generated — `node scripts/idnty/build-idnty-intake-artifacts.mjs`)

## Entry states

Aligned with `IDNTY_BRAND_STATES` in `src/site00/config/identity.ts`:

| State | Name | Intake mode |
|-------|------|-------------|
| `IDNTY_00` | Starting at zero | Discovery — no design decisions |
| `IDNTY_01` | Partial | Equity audit + evidence |
| `IDNTY_02` | Evolution | Maturity without losing recognition |
| `IDNTY_03` | Build ready | Verify kit; reclassify gaps |

Branching: `IDNTY_ENTRY_STATE_BRANCHING.json`

## Question architecture

Every question includes: purpose, answer type, entry states, branch conditions, field targets, evidence targets, review relevance, inference flags, repeat policy.

Traceability: `IDNTY_QUESTION_FIELD_MAP.json`

## Voice genome

Personality dimension includes a structured **voice genome**: primary archetype (backbone), relationship archetype, distinctive character, optional weights, **contextual modulation** (modulation beats rigid math), and boundaries.

AIO worked example: Operator + Business Partner + Road Office (~40/30/30 indicative). Road language is **selective character**, not constant punning.

## Outputs

Intake produces answer records, evidence, raw vs interpreted signals, **canonical `IDNTY_PROFILE`**, conflicts, review queue, and derived brief inputs — see `IDNTY_OUTPUT_CONTRACTS.json`.

Downstream systems consume one profile — see `IDNTY_DOWNSTREAM_CONSUMERS.json`.

## Progress

Not “80% of questions.” Track question completion, dimension resolution, evidence, review, and authority — `IDNTY_PROGRESS_MODEL.json`.

## Inference & conflicts

Low-risk pattern inference allowed; silent inference forbidden for authority, locked equity, legal claims, and final lines — `IDNTY_INFERENCE_RULES.json`.

Contradictions are recorded, not flattened — `IDNTY_CONTRADICTION_MODEL.json`.

## Validation case

**All In One Enterprises (AIO)** — `AIO_IDNTY_INTAKE_VALIDATION_CASE.json`. Verbal decisions are represented as founder-reviewed synthesis; mark/palette/type remain open for a later mark sprint.

## Explicit non-goals (this sprint)

- No intake UI implementation  
- No image / logo / video generation  
- No provider calls  

## Next recommended work

**IDNTY intake UI design** bound to this question bank and profile contract, then **AIO mark development** after authority + mark brief inputs are locked.
