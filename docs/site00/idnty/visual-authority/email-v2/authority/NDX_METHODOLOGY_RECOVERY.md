# NDX creative methodology — recovered for SITE 00 correspondence

Status: recovered from repository authority. Nothing here is invented. Every principle cites the file it came from.

What transfers is the discipline. NDX's product identity does not transfer: no Signal Lime, no Electric Cobalt, no Kinetic Field palette, no social-feed formats, no NDX voice.

## Sources read

| Source | What it holds |
|---|---|
| `docs/site00/CORE_DIRECTION_METHODOLOGY.md` | Stage A / Stage B gating, core direction definition, branch lineage test, variety rule. Formalized after the NDX BOOK three-direction sprint. Section 14 names "email families" as in scope. |
| `docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md` | Expression-context classification, reference decomposition, code-native vs generated decision, composite maps with independently authored mobile, two-cycle visual QA. |
| `docs/studio-world/ndxbook/NDXBOOK_CD_REFERENCE_DECOMPOSITION.md` | The worked NDX example: every tile has a purpose, a behavior, and its own responsive recomposition. Negative constraints per direction. |
| `docs/ndxbook-creative-lineage.md` | Brand Canon vs Content Canon. `portableCore` vs `originalExpression`. Translation keeps the idea and audience value and replaces the visual system. |
| `shared/site00-expression-engine/senior-creative-judgment/types.ts` | Metaphor maturity scale, artifact necessity, failure and correction taxonomy. |
| `shared/site00-expression-engine/brand-language/types.ts` | Brand language identity, restraint profile, rhetorical signature, brand-language failure classes. |
| `api/_lib/site00ExpressionEngine/brandLanguage/rhetoricalPatternLineage.ts` | AI rhetorical pattern detector. |
| `api/_lib/site00ExpressionEngine/brandLanguage/crossBrandVoiceContaminationQA.ts` | NDX voice leak patterns, generic luxury and "could be any brand" detectors. |

## Recovered principles and their email translation

### 1. Find the world before you expand it

Source: `CORE_DIRECTION_METHODOLOGY.md` canonical principle and section 14: "First find the world. Then prove the world. Then lock its DNA. Then let the world expand."

Email translation: three benchmarks first. The remaining seventeen wait for founder approval. The lean pack failed because it expanded a template to twenty before the core idea was proven.

### 2. A core direction has a governing behavior, not a look

Source: `CoreDirectionDefinition` fields in `CORE_DIRECTION_METHODOLOGY.md` §02–03 (`bigIdea`, `governingBehavior`, `visualMetaphor`, `antiDirection`). NDX Editorial Utility's behavior is `ANNOTATION`. Index Signal's is `SCANNING`.

Email translation: SITE 00 correspondence has one governing idea, already present in shipped copy: a business has an address, the Foundation is the ground at that address, and what gets built on it comes next. Sources: `src/site00/pages/invitation/InvitationEntryPage.tsx` ("YOUR BUSINESS HAS AN ADDRESS."), `invitationJourney.ts` stage 02 ("WELCOME TO YOUR NEXT ADDRESS"), the marketing authority ("FROM FOUNDATION TO DIGITAL LOCATION."), and DF-I02 ("THE NEXT ROOM."). The governing behavior is **building**: surveying, laying ground, raising structure. Architecture is the argument, not decoration.

### 3. Family resemblance, not identical twins

Source: `CORE_DIRECTION_METHODOLOGY.md` §09: "CORE DNA → EXPRESSION A/B/C/D … never CORE DESIGN → copy → copy → copy."

Email translation: the lean pack was copy → copy → copy. Each V2 email is an expression of the same DNA with a different behavior: a letter, a milestone record, an editorial walk-through.

### 4. Every branch must pass the lineage test

Source: the seven questions in `CORE_DIRECTION_METHODOLOGY.md` §07–08, enforced by `branchPassesLineageTest()`.

Email translation: each benchmark is checked against all seven in its editorial intent brief. The two that matter most here: "Does it introduce meaningful visual or behavioral variation?" and "Would removing the brand name still leave evidence it belongs to the same creative universe?"

### 5. Every component earns its place and has a declared purpose

Source: the NDX decomposition table. Every tile has `PURPOSE`, `CLASSIFICATION`, `COMPOSITE_BEHAVIOR`, `RESPONSIVE_BEHAVIOR`. EU-05 MARGIN NOTES is "full-bleed tile, generous whitespace". EU-10 THE CENTERFOLD "spans 2 grid cells". Scale follows role.

Email translation: no section exists because the template has a slot for it. Each block in each email is listed with its job in `COMPOSITION_AUTHORITY.md` and the per-email brief.

### 6. Mobile is recomposed, not shrunk

Source: `CREATIVE_DIRECTION_METHODOLOGY.md` §6: "an independently authored mobile recomposition (never a proportional shrink of the desktop map)." NDX EU-03: "Mobile: paper fragment recomposed to top 60% of tile (not shrunk in place)."

Email translation: each mobile email changes crop, order, or scale where the desktop composition would not survive a 390px column. Recorded per email.

### 7. Code-native where words and diagrams carry meaning, photography where material carries it

Source: `CREATIVE_DIRECTION_METHODOLOGY.md` §3.

Email translation: all words are live text. Blueprint drawings are code-native SVG (exported to PNG for send). Photography is reused from the approved plates only where its material quality (marble, red glass, horizon) says something the type cannot.

### 8. Metaphor must be structural

Source: `METAPHOR_MATURITY_CLASSES` in `senior-creative-judgment/types.ts`: DECORATIVE → ILLUSTRATIVE → FUNCTIONAL → STRUCTURAL → TRANSFORMATIVE. Failure classes `WORLD_TOO_DECORATIVE`, `EXPLANATORY_PROP`, `METAPHOR_TOO_LITERAL`.

Email translation: the address and building metaphor organizes the copy and the layout. The invitation is a letter delivered to an address. The completion email is a record of ground laid. The BLDR email walks through a building. If an image is only there to be pretty, it is cut.

### 9. Restraint is a voice property

Source: `BrandRestraintProfile` (`allowsSilence`, `allowsWithheldExplanation`, `minimalCtaPreferred`) and failure class `OVEREXPLAINED_COOL_BRAND`.

Email translation: transactional facts are said once and plainly. White space is a deliberate pause. The completion email does not upsell.

### 10. Known failure patterns are named and checked

Source: `AI_RHETORICAL_PATTERNS` (`it's-not-x-it's-y`, `you-didn't-x-you-y`, `not-x-y`, `this-isn't-x-it's-y`, `because-x`, `meet-x`), `captionCouldBelongToAnyBrand` (openings like "DISCOVER", "INTRODUCING", "WE ARE EXCITED"), `GENERIC_LUXURY_CLICHES`, and senior-judgment `FOUNDER_CONNECTING_DOTS`, `RECEIPT_TOO_EXPLANATORY`.

Email translation: `scripts/df-email-v2-benchmark/qa_copy.py` runs these same patterns, plus the internal-language list from the founder correction, against all three emails.

### 11. Brand canon is separate from content canon

Source: `docs/ndxbook-creative-lineage.md` principle 4.

Email translation: brand canon is fixed (luminous white, SITE 00 red, black editorial type, photoreal architecture, marble and red glass, blueprint detail, uppercase). Content canon varies per email: structure, image role, numbering, CTA treatment, emotional register.

### 12. Two visual QA cycles minimum

Source: `CREATIVE_DIRECTION_METHODOLOGY.md` §7.

Email translation: render, inspect, classify discrepancies, fix, render again. Logged in `qa/V2_BENCHMARK_QA_REPORT.md`.

## What must not transfer from NDX

| NDX property | Why it stays out |
|---|---|
| Signal Lime, Electric Cobalt, Rose/Orange/Purple | Not SITE 00 brand canon. |
| NDX voice markers: "receipt", "you called", "the … already told you", "hot take:", "confession", "diagnostic" | Listed as `NDX_LEAK_PATTERNS`. The QA script blocks them. |
| Opinionated, provocative social posture | SITE 00 correspondence is attentive and assured. It is not a magazine taking a stance on culture. |
| Social-first formats (feed, carousel, reel) | Email is the expression context here. |
