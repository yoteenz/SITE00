# F09 SAFE TO SPEND — Source Map

Sprint `P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1` · 2026-10-06 · base `main` @ `2225bc99`

Every source the territories were derived from, with its role and canonical status. Prompt wording was not trusted where the repository is more specific. Where the repository is silent, the gap is recorded instead of filled.

## Status key

| Status | Meaning |
|---|---|
| CANONICAL | Current governing truth. Used. |
| CANONICAL · SUPERSEDED IN PART | Used. A named part is overruled by a newer canonical source. |
| PRESERVED BY SPRINT | Global contracts this sprint explicitly keeps: CENTER_STAGE, nav, pagination and back, uppercase, no circular controls. |
| FUNCTIONAL_REFERENCE_ONLY | Legacy. Read for function only (see the firewall). |
| NON-CANONICAL | A sample or fixture. Not used as intent. |
| NOT FOUND | Searched in both `yoteenz/SITE00` and `yoteenz/fsbw`. Does not exist. |

## Brand DNA

| Source | Role | Status | Contributes |
|---|---|---|---|
| `src/projects/jurnl/data/jurnlProject.ts` | JURNL project record | CANONICAL | Contributes the following: <br>• Palette with roles: bone, ivory, greige, taupe, blush, muted rose, deep emerald, burgundy, champagne <br>• Instrument Serif (display) and Barlow Semi Condensed (functional) <br>• Hard rules: UPPERCASE_ONLY, NO_CIRCULAR_CONTROLS, LOGO_SMALL, LIVE_UI, NO_UNSUBSTANTIATED_CLAIMS <br>• Tagline PLAN TODAY. GROW FREELY. <br>• Voice QUIETLY ASSURED + SMART / HUMAN <br>• Visual language: luxury architectural lifestyle, editorial collage, tactile materiality, soft structured financial information <br>• Viewport 393×852, phone safe insets 59 / 34, 4-column grid |
| `JURNL/MANIFEST/JURNL_EXPRESSION_MATRIX.json` | Global expression DNA | CANONICAL | Contributes the following: <br>• Principle: SAME BRAND. SAME WORLD. … NOT THE SAME SCREEN <br>• Corner geometry SQUARE_ROUNDED <br>• The occupied list, where **SAFE_TO_SPEND_FIGURE is owned by F03** |
| `JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json` and `JURNL_FAMILY_ENVIRONMENT_DISTINCTNESS.json` | World traits | CANONICAL | Contributes the following: <br>• World: Mediterranean coastal luxury; plaster, stone, travertine, paper; burgundy, emerald, bone, taupe, champagne; sculptural objects; botanical language; natural light <br>• **Forbidden departures:** FUTURISTIC_TECH, INDUSTRIAL_LOFT, DARK_BANK_VAULT |
| `public/site00/projects/jurnl/brand/jurnl-logo-official.png` and `public/site00/projects/jurnl/fonts/*` | Brand assets | CANONICAL | The vertical botanical book-spine logo (stays small) and the brand font files used in the renders. |
| `src/projects/jurnl/runtime/components/icons.tsx` (F01 icon pack) | Icon authority | CANONICAL | Glyphs for back, gear, info, nav and chevron. |
| *“MONEY IN SERVICE OF LIFE.” / “FINANCIAL LIFE, BEAUTIFULLY ORGANIZED.”* | Positioning lines | **NOT FOUND** | Stated by the sprint only. |
| JURNL audience / persona | Brand field the gate requires | **NOT FOUND** | The gate brand check returns `BRAND_CONTEXT_REQUIRED (audience)`. |
| Voice avoid list (poetic, finance-bro, corporate, robotic, slang, wit) | Voice contract | **NOT FOUND** (partly) | Only “CLARITY OVERRIDES POETIC AMBIGUITY” is encoded (refinement 2, rule 7). |

## F09 family, experience and expression

| Source | Role | Status | Contributes |
|---|---|---|---|
| `JURNL/F09_SAFE/MANIFEST/F09_FAMILY_EXPRESSION_BRIEF.json` and `.md` | F09 family expression contract | CANONICAL · SUPERSEDED IN PART | **Used:** <br>• Job: *Give a clear signal after obligations and intentions.* <br>• Question: *What can I actually spend without undermining my plans?* <br>• Signal: *One open answer.* <br>• Emotion: *Clarity, relief, confidence.* <br>• Density: *One signal. Almost no secondary matter.* <br>• Data visualisation: *A single mark.* <br>• Interaction: *The answer is the parent. Why stays closed.* <br>• Type: *One word or figure. Wide tracking. Short.* <br>• Motion: *Still.* <br>• Relationships: *Plan arranges … the breath after*, *Purchases asks about one object inside that breath*, *Today previews the figure inside a journal* <br>• Risks: *Looking empty*, *Copying today's journal* <br>**Superseded:** `composition_bias` *Left signal, right opening* and the left-rail occupancy. CENTER_STAGE overrules them for nav-bearing screens. |
| `JURNL/F09_SAFE/MANIFEST/F09_EXPRESSION_TREE.json` | Child, state and interaction nodes | CANONICAL | Node jobs: <br>• F09.WHY *The factors* (same room) <br>• F09.HOLD *What is held back* (a dossier; the sheet rises) <br>• F09.ST.UNSTATED *The signal cannot be said yet* (one return) <br>• F09.IX.HOLD *A confirmation. Closed.* <br>Child production is BLOCKED_UNTIL_FOUNDER. |
| `JURNL/F09_SAFE/MANIFEST/F09_PLATE_OCCUPANCY.json` | Plate occupancy | CANONICAL · SUPERSEDED IN PART | Read only to record that its left rail (all three viewports) is superseded. |
| `JURNL/F09_SAFE/MANIFEST/F09_PARENT_AUTHORITY_MANIFEST.json` and `F09_PARENT_GENERATION_LEDGER.json` | Legacy plate authority | FUNCTIONAL_REFERENCE_ONLY | Status facts only: UNREVIEWED, interference FAIL, 324 + 315 credits historically. The image was not opened. |
| `shared/studioos-experience-brain/projects/samples/portability.ts` (`JURNL.SAFE_TO_SPEND`) | Experience Brain | NON-CANONICAL | Proves the gap: JURNL has **no** Workspace Experience Brain contract. Its metaphor “DECISION THRESHOLD” is a schema-proof sample (“must not be used as build instructions”) and **was not used**. |
| `docs/jurnl/structural-completion/F09_SAFE_TO_SPEND_STRUCTURAL_BLUEPRINT.json` and `scripts/jurnl/structural-blueprint/model.ts` | Product tree / structural contract | CANONICAL (audited 2026-10-05, partly stale) | Contributes the following: <br>• Purpose <br>• Boundaries: *F09 is a derived decision system*; *one formula, one owner*; *F10 / F11 ask F09 what changes* <br>• Planned states LOADING, UNSTATED, ERROR, BELOW_ZERO (*said plainly, not shamed*) |
| `src/projects/jurnl/data/parents/catalog.ts` (F09) | Parent catalog contract | CANONICAL (labels drift from code) | Contributes the following: <br>• Signal OPEN <br>• Hint *PREVIEW SIGNAL. NOT TODAY’S JOURNAL.* <br>• Editorial question *WHAT CAN I SPEND WITHOUT UNDOING THE PLAN?* |

## Data, state and interaction (functional truth)

| Source | Role | Status | Contributes |
|---|---|---|---|
| `src/projects/jurnl/data/f09/safeToSpend.ts` | Data contract (single formula owner) | CANONICAL | Contributes the following: <br>• Inputs: cash, upcoming, protected, safetyBuffer, assigned, goalReserved, purchaseReserved, tripReserved <br>• Output: `value` (unclamped) <br>• Completeness: COMPLETE · PARTIAL · UNSTATED · NEEDS_SETUP · NEEDS_ACCOUNT <br>• Source fields |
| `docs/jurnl/structural-completion/JURNL_DATA_OWNERSHIP_MAP.json` and `wave3/JURNL_SAFE_TO_SPEND_INPUT_OUTPUT_CONTRACT.json` | Data ownership | CANONICAL (IO contract predates the purchase and trip reserves) | Contributes the following: <br>• DD.SAFE_TO_SPEND is derived and never stored; readers are F03, F09, F10 and F11 <br>• DD.PROTECTED_HOLD is owned by F09 |
| `src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx` | Current F09 UI | FUNCTIONAL_REFERENCE_ONLY | Read by an isolated agent for function only: <br>• Routes <br>• State lines <br>• Labels <br>• Actions <br>• Hold sheet <br>• Accessibility |
| Store, `GlobalSheets.tsx`, `FamilyChrome.tsx`, `ProductNav.tsx`, `familyRegistry.ts`, `familyLinks.ts`, `askJurnl.ts`, `quickAddRegistry.ts`, settings, accounts, plan / goals / purchases / trips stores, the F03 contract, monetization | Functional implementation | FUNCTIONAL_REFERENCE_ONLY (global chrome and nav are PRESERVED BY SPRINT) | Contributes the following: <br>• Ask JURNL (consent-gated, explanation only) <br>• Quick Add (MOVEMENT only on F09) <br>• Nav, with HOME current on F09 <br>• Entry points <br>• Back behaviour (fixed BACK TO TODAY) <br>• Downstream readers <br>• F09.NUMBER is free |
| `tests/jurnlWave*.test.ts`, `tests/jurnlCenterStage.test.tsx`, `tests/jurnlMobileComposition.test.tsx`, `e2e/jurnl/*.e2e.ts` | E2E / unit truth | CANONICAL | Contributes the following: <br>• F09 is `CENTER_STAGE` <br>• Mutations change the number <br>• A paydown simulation does not <br>• A target alone does not <br>• The test hooks a future implementation must keep |
| `docs/jurnl/functional-closure/*` | Production hardening / approval | CANONICAL | `functional_closed: true`, `visual_design_frozen: true`, axe 0 critical on `safe`. |
| `scripts/jurnl/mobile-composition-qa.mjs` (`seedPopulated`) | QA seed | NON-CANONICAL (fixture) | Source of the representational sample values in the three candidates. |

## Responsive, composition mode and navigation

| Source | Role | Status | Contributes |
|---|---|---|---|
| `docs/jurnl/refinements/mobile-center-stage3/*` (mode contract, safe zone, nav-aligned content, perimeter rules) | Mobile composition contract | CANONICAL · PRESERVED BY SPRINT | Contributes the following: <br>• CENTER_STAGE for every nav-bearing screen <br>• Field = nav footprint (340 on phone) on the + axis <br>• Content rect <br>• Composition edge <br>• Nav reserve <br>• DESIGN AT THE PERIMETER. FUNCTION IN THE CENTRE. <br>• Central-field forbidden list |
| `docs/jurnl/refinements/mobile-creative-composition2/JURNL_MOBILE_PAGINATION_CONTRACT.json`, `…CONTINUATION_BACK_CONTRACT.json`, `…NAV_GEOMETRY_CONTRACT.json` | Pagination, back and nav | CANONICAL · PRESERVED BY SPRINT | Contributes the following: <br>• Atomic panels <br>• NEXT on the composition edge <br>• BACK TO SCREEN n <br>• No body scroll |
| `docs/jurnl/refinements/mobile-creative-composition2/JURNL_FAMILY_LANGUAGE_CLARITY_AUDIT.json` (rules and layers) | Copy contract | CANONICAL | Contributes the following: <br>• Function label → state / task → editorial <br>• No enums in copy <br>• Only real values <br>• Zero bands hidden <br>• The question never carries primary meaning |
| `docs/jurnl/refinements/mobile-creative-composition2/` family composition map, archetype library, distinctness and blur audits | Previous F09 composition (TENSION_THRESHOLD) | FUNCTIONAL_REFERENCE_ONLY (legacy visual, not founder-promoted) | Used **only** as a negative anti-convergence check. See the firewall. |
| `JURNL/MANIFEST/JURNL_GLOBAL_COMPOSITION_RULES.json` | Global JURNL rules | CANONICAL · SUPERSEDED IN PART | **Used:** <br>• Top chrome zone <br>• Typographic containment <br>• Icon-label row <br>• Money via `formatMoney` <br>**Superseded:** *the right side of an environment plate stays open*, a plate-era rule. |
| `motherboard/CORE.md` (JURNL sections) | Project memory | CANONICAL · SUPERSEDED IN PART | **Used:** <br>• `SEE WHY` stays primary <br>• Secondary actions use `JurnlInlineAction` <br>• Currency rules <br>• The Visual Authority Gate <br>**Superseded:** *Primary content stays in a left rail*, overruled for nav-bearing screens by CENTER_STAGE refinement 3. |
| `JURNL/MANIFEST/JURNL_QUICK_ADD_CONTRACT.json` and `JURNL_CURRENCY_CONTRACT.json` | Interaction / data | CANONICAL | Contributes the following: <br>• Quick Add moves cash and safe-to-spend <br>• `formatMoney` and USD canonical |

## Methodology

| Source | Role | Status | Contributes |
|---|---|---|---|
| `shared/studioos-visual-authority/*` and `docs/studioos/visual-authority-development/VISUAL_AUTHORITY_DEVELOPMENT_GATE.md` | Visual Authority Development Gate | CANONICAL | Contributes the following: <br>• The sequence <br>• Five legacy classes <br>• Six structural dimensions (≥ 3 differing, including spatial logic or primary zone) <br>• Six reference proofs <br>• Formats <br>• Nothing locks without the founder |
| `shared/studioos-visual-authority/projects/aio/*` and `docs/aio/ifta/authority-bundle/` | AIO IFTA precedent | CANONICAL for AIO | Repo conventions only (data module, export, test). **No AIO territory concept was used.** |
