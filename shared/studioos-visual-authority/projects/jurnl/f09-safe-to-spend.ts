/**
 * JURNL F09 SAFE TO SPEND — Visual Authority Development: three composition territories (founder review input).
 * Sprint P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1.
 *
 * A controlled test of the UPSTREAM contracts: can brand DNA + experience contract + family contract + functional truth
 * produce three distinct, brand-true SAFE TO SPEND territories with no legacy visual leakage? Data only. No page is
 * implemented, nothing is locked, no founder verdict is recorded (PENDING). Every current F09 surface is
 * FUNCTIONAL_REFERENCE_ONLY; the legacy screen was read by an isolated agent that reported function only.
 *
 * Package (docs + references + blur test): JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1/
 * Export: npx tsx scripts/studioos/jurnl-f09-territory-proof-export.ts
 */
import {
  checkBrandContext,
  checkLegacyUse,
  checkReferences,
  checkTerritoryDistinctness,
  evaluateAuthorityGate,
  type AuthorityGateResult,
} from '../../gate.js';
import type { AuthorityGateInput, BrandContext, CompositionTerritory, LegacySurface, LegacyUse, ReferenceAuthority } from '../../schema.js';

export const JURNL_F09_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1' as const;
export const JURNL_F09_PACKAGE_DIR = 'JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1' as const;
export const JURNL_F09_AT = '2026-10-06' as const;
const FAMILY = 'F09';
const FEATURE = 'JURNL.SAFE_TO_SPEND';

/* ─────────────────────────────── 01 brand DNA (repo-verified; sprint-stated items marked) ─────────────────────────────── */

/**
 * Built only from repository truth (src/projects/jurnl/data/jurnlProject.ts, JURNL/MANIFEST expression matrices).
 * Items the sprint stated but the repository does not hold are listed as open questions, never as canon.
 * AUDIENCE is not defined anywhere in either repository → the gate's brand check reports BRAND_CONTEXT_REQUIRED.
 */
export const JURNL_BRAND_CONTEXT: BrandContext = {
  brand_context_id: 'JURNL.BRAND@repo-2026-10-06',
  project_id: 'JURNL',
  positioning: 'PERSONAL FINANCE + LIFESTYLE APPLICATION · tagline PLAN TODAY. GROW FREELY. (jurnlProject.ts). No positioning statement beyond the product class and tagline is encoded.',
  audience: '',
  voice: ['QUIETLY ASSURED + SMART / HUMAN (jurnlProject.ts)', 'CALM, CLEAR, SMART, HUMAN, QUIETLY ASSURED (language clarity rules)', 'CLARITY OVERRIDES POETIC AMBIGUITY (refinement 2 durable rule 7)'],
  color: ['BONE / CREAM #F9F6EF base field', 'IVORY #F3EDE2 surfaces', 'GREIGE #D2C8BA borders', 'TAUPE #B6A594 muted text / material', 'BLUSH #EBCFC8 soft fields', 'MUTED ROSE #C9949A brand mark', 'DEEP EMERALD #0F3D32 primary action / focus / success', 'BURGUNDY / WINE #6E1F2D error / destructive', 'CHAMPAGNE #C6A676 metal details'],
  materials: ['PLASTER', 'STONE', 'TRAVERTINE', 'PAPER', 'TACTILE MATERIALITY', 'SCULPTURAL OBJECTS', 'BOTANICAL LANGUAGE', 'NATURAL LIGHT'],
  typography: 'DISPLAY: INSTRUMENT SERIF (fashion condensed display). FUNCTIONAL: BARLOW SEMI CONDENSED 300/400/500. ALL USER-FACING TEXT UPPERCASE (hard rule).',
  logo_rules: 'Official vertical botanical book-spine logo: SMALL, INTEGRATED — NEVER THE HERO. Product chrome carries the JURNL wordmark (FamilyChrome).',
  mood: 'LUXURY ARCHITECTURAL LIFESTYLE · EDITORIAL COLLAGE · TACTILE MATERIALITY · SOFT STRUCTURED FINANCIAL INFORMATION · MEDITERRANEAN COASTAL LUXURY · EDITORIAL RESTRAINT · CALM EXPENSIVE MATERIAL',
  references: ['public/site00/projects/jurnl/brand/jurnl-logo-official.png', 'JURNL/F01_ENTRY/ICONS/F01_ICON_PACK_SHEET.png (icon family, drawn in runtime/components/icons.tsx)'],
  architectural_language: 'Mediterranean coastal architecture in plaster, stone and travertine; rooms with natural light (family expression matrices: SAME WORLD, DIFFERENT ROOM).',
  avoid_list: ['CIRCULAR TAPPABLE CONTROLS', 'TEXT, FORMS OR CONTROLS BAKED INTO IMAGERY', 'UNSUBSTANTIATED SECURITY / PRIVACY CLAIMS', 'LOGO AS HERO', 'FUTURISTIC_TECH', 'INDUSTRIAL_LOFT', 'DARK_BANK_VAULT', 'ENUMS, FAMILY IDS OR REGISTRY TERMS IN UI COPY', 'PLACEHOLDER FIGURES (only real values; zero bands hidden)'],
  history: ['F01–F16 structural waves 0–5 + functional closure (FUNCTIONAL_CLOSED)', 'F05–F16 OpenArt parent plates (UNREVIEWED; F09 plate interference FAIL)', 'Mobile composition refinement 2 (archetype per family; F09 TENSION_THRESHOLD) — legacy, not founder-promoted', 'CENTER_STAGE refinement 3 (nav-aligned field) — preserved by this sprint', 'Founder froze JURNL visual polish pending the Visual Authority Development Gate'],
  approved_decisions: ['UPPERCASE_ONLY (hard)', 'NO_CIRCULAR_CONTROLS (hard)', 'LOGO_SMALL (hard)', 'CENTER_STAGE for every nav-bearing screen', '5-item nav HOME · MONEY · + · PLAN · CREDIT, + is the centre anchor'],
  open_brand_questions: [
    'POSITIONING: the sprint states MONEY IN SERVICE OF LIFE. / FINANCIAL LIFE, BEAUTIFULLY ORGANIZED. — neither line exists in yoteenz/SITE00 or yoteenz/fsbw. Encode or correct them.',
    'AUDIENCE: no audience definition exists in either repository (required brand field).',
    'VOICE AVOID LIST: the sprint lists poetic everyday UX, finance-bro, corporate, robotic, slang-heavy, unnecessary wit — only “clarity overrides poetic ambiguity” is encoded.',
    'VISUAL WORLD: obsidian and champagne-as-surface, Mediterranean / coastal, editorial collage are sprint-stated; the repo holds them only as family-matrix world traits, not as brand DNA.',
  ],
};

/* ─────────────────────────────── 03 legacy firewall ─────────────────────────────── */

const legacy = (s: Omit<LegacySurface, 'project_id' | 'visual_class' | 'founder_decision'> & Partial<Pick<LegacySurface, 'visual_class' | 'founder_decision'>>): LegacySurface => ({
  project_id: 'JURNL',
  visual_class: 'FUNCTIONAL_REFERENCE_ONLY',
  founder_decision: null,
  ...s,
});

export const JURNL_F09_LEGACY_SURFACES: LegacySurface[] = [
  legacy({ surface_id: 'JURNL.LEGACY.F09.HUB', actor: 'CLIENT', route: 'safe (F09.00)', source: 'src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx · data/f09/safeToSpend.ts', functional_value: ['computeSafeToSpend fields + completeness rules', 'state lines (5) verbatim', 'CLEAR TO SPEND / OVER BY', 'held-back item labels', 'actions SEE THE FULL BREAKDOWN · CHANGE WHAT’S HELD · PLAN', 'chrome BACK TO TODAY · ACCOUNT · ASK JURNL'], note: 'Read by an isolated agent instructed to report function only. Its layout was never described to the territory author.' }),
  legacy({ surface_id: 'JURNL.LEGACY.F09.WHY', actor: 'CLIENT', route: 'safe/why (F09.WHY)', source: 'SafeToSpendScreens.tsx (SafeToSpendWhyScreen)', functional_value: ['factor list + sources', 'BACK TO SAFE'], note: 'Omits purchase / trip reserves and shows raw enums (functional gaps).' }),
  legacy({ surface_id: 'JURNL.LEGACY.F09.HOLD', actor: 'CLIENT', route: 'safe (HoldSheet, local state)', source: 'SafeToSpendScreens.tsx (HoldSheet)', functional_value: ['PROTECTED AMOUNT + SAFETY BUFFER inputs', 'CONTINUE → CONFIRM THE HOLD → SAVE', 'patchSetup + patchSettings'] }),
  legacy({ surface_id: 'JURNL.LEGACY.F09.PLATE_LOGGIA', actor: 'CLIENT', route: 'safe (environment plate)', source: 'src/projects/jurnl/families/F09_SAFE (ENV.LOGGIA) · JURNL/F09_SAFE/MANIFEST/F09_PARENT_AUTHORITY_MANIFEST.json', functional_value: ['none — plate, founder UNREVIEWED, interference FAIL'], note: 'Image not opened in this sprint.' }),
  legacy({ surface_id: 'JURNL.LEGACY.REFINEMENT2.F09_TENSION_THRESHOLD', actor: 'CLIENT', route: 'safe (archetype)', source: 'docs/jurnl/refinements/mobile-creative-composition2/ (family composition map, archetype library, distinctness + blur audits) · runtime/jurnl-archetypes.css', functional_value: ['language clarity copy (function → state → editorial)', 'only real values; zero bands hidden; HELD and OWED never netted'], note: 'Text read during source discovery; screenshots not opened. Composition text used ONLY as a negative anti-convergence check (no threshold line, no hatched bands, no arched panel, no centred-symmetric figure-over-bands stack).' }),
  legacy({ surface_id: 'JURNL.LEGACY.F03.TODAY_FIGURE', actor: 'CLIENT', route: 'today (F03)', source: 'runtime/screens/HomeScreens.tsx · JURNL_EXPRESSION_MATRIX occupied_territories SAFE_TO_SPEND_FIGURE', functional_value: ['F03 shows the same value read-only + its own SEE WHY sheet'], note: 'Distinctness boundary only: F09 must not repeat “the figure inside a journal”.' }),
  legacy({ surface_id: 'JURNL.GLOBAL.CENTER_STAGE_NAV_CHROME', actor: 'ALL', route: 'every nav-bearing route', source: 'docs/jurnl/refinements/mobile-center-stage3/ · runtime/components/ProductNav.tsx · FamilyChrome.tsx · jurnl-frame.css tokens', visual_class: 'PARTIAL_AUTHORITY', founder_decision: `${JURNL_F09_SPRINT}: “does not supersede CENTER_STAGE / JURNL navigation / bottom-nav contract — do not redesign navigation”`, promoted_dimensions: ['NAV_VISUALS', 'GEOMETRY'], functional_value: ['stage = nav footprint on the + axis', 'nav HOME · MONEY · + · PLAN · CREDIT', 'chrome back · JURNL · account · ask', 'atomic pagination + context-aware back'] }),
];

/** What the territories take from each surface. Visual dimensions appear only where the founder preserved them. */
export const JURNL_F09_LEGACY_USES: LegacyUse[] = [
  { surface_id: 'JURNL.LEGACY.F09.HUB', uses: ['FUNCTION', 'DATA', 'ROUTING', 'CONTENT_TRUTH', 'STATE', 'INTERACTION'] },
  { surface_id: 'JURNL.LEGACY.F09.WHY', uses: ['FUNCTION', 'DATA', 'ROUTING'] },
  { surface_id: 'JURNL.LEGACY.F09.HOLD', uses: ['FUNCTION', 'DATA', 'INTERACTION'] },
  { surface_id: 'JURNL.LEGACY.REFINEMENT2.F09_TENSION_THRESHOLD', uses: ['CONTENT_TRUTH'] },
  { surface_id: 'JURNL.LEGACY.F03.TODAY_FIGURE', uses: ['FUNCTION', 'CONTENT_TRUTH'] },
  { surface_id: 'JURNL.GLOBAL.CENTER_STAGE_NAV_CHROME', uses: ['ROUTING', 'NAV_VISUALS', 'GEOMETRY'] },
];

/* ─────────────────────────────── 04 territories ─────────────────────────────── */

const base = { project_id: 'JURNL', family_id: FAMILY, feature_id: FEATURE, actor: 'CLIENT' as const, status: 'IN_REVIEW' as const, founder_decision: null };

export const JURNL_F09_TERRITORIES: CompositionTerritory[] = [
  {
    ...base,
    territory_id: 'JURNL.F09.T01',
    name: '01 THE OPEN FLOOR',
    concept: 'What you can spend is the open floor of a room. Everything already held back is the wall around it.',
    core_idea: 'The page draws one room in plan. Its width is your cash. The walls are what bills, the plan, goals and reserves already hold; the open floor inside them is safe to spend, and the figure is written on that floor.',
    metaphor: 'AN OPEN ROOM SEEN IN PLAN (the loggia brief drawn from above: open, not unfinished)',
    primary_object: 'THE OPEN FLOOR — a drawn room whose open area is the safe-to-spend value and whose wall mass is the held-back total',
    page_logic: 'Proportional plan drawing: room = cash; wall ring area = held back; open floor area = value. One wall course per non-zero held-back field, clockwise from the door. The figure sits on the floor. The door, on the + axis, is the way into the breakdown.',
    major_zones: ['FUNCTION LABEL + STATE LINE', 'DIMENSION LINE = CASH', 'THE ROOM (walls = held back · floor = clear to spend · figure on the floor)', 'DOOR → SEE THE FULL BREAKDOWN', 'INLINE ACTIONS (CHANGE WHAT’S HELD · PLAN)', 'LEGEND + EDITORIAL CAPTION'],
    structure: {
      spatial_logic: 'Concentric plan view read from the centre outward: the room is cash, the wall ring is what is held back, the open floor is what is clear.',
      primary_zone: 'The open floor at the centre of a drawn room, figure inscribed on it.',
      visual_hierarchy: 'Figure on the floor → state line → proportion of wall to floor → door → breakdown → legend and question.',
      interaction_emphasis: 'Spatial inspection: tap a wall course or the door (SEE THE FULL BREAKDOWN) and the walls take their names and amounts in place — same room, the job narrows.',
      information_density: 'One figure and one proportional drawing; wall courses unnamed until inspected.',
      media_relationship: 'Perimeter-only imagery (plaster, daylight, olive at the right edge); the drawing itself carries the data.',
    },
    composition_logic: 'CENTER_STAGE field; the room spans the stage on the + axis; the door, the breakdown button and the + share that axis.',
    actor_fit: 'CLIENT (the JURNL user): reads the answer as space — how much room is left once commitments stand.',
    state_fit: 'COMPLETE solid walls · PARTIAL dashed BILLS course · UNSTATED no BILLS course (not deducted) · NEEDS_SETUP / NEEDS_ACCOUNT unmeasured outline · BELOW ZERO walls close the floor, OVER BY on the dimension line · NOTHING HELD hairline walls.',
    mobile_logic: '393×852: room 300×300 on the axis inside the 340 stage; single screen, no pagination at parent density.',
    desktop_logic: 'Not authored (founder selection first). Note: a plan drawing scales without recomposition; the 560 stage would allow named walls at rest.',
    visual_language: 'Architectural drafting on plaster: travertine poché, paver joints, dimension line, door swing; emerald figure; champagne-free.',
    risks: ['Reads as diagram, not comfort, for users who do not read plans', 'At low held-back ratios the walls get thin (the drawing must stay a room, not a frame)', 'Plan-view drafting is not encoded in JURNL brand DNA (invented from architectural-lifestyle DNA)', 'Proportion is area, which people estimate poorly — the figure must stay primary'],
    brand_fit: 'Architectural lifestyle + plaster / travertine + editorial restraint; the room is the JURNL world drawn as information.',
    experience_fit: '“One open answer”, “the room stays open, not unfinished”, “more air”, “why stays closed” (the door is closed).',
  },
  {
    ...base,
    territory_id: 'JURNL.F09.T02',
    name: '02 THE PLAIN ANSWER',
    concept: 'The page is one plain sentence that answers the question, set into stone.',
    core_idea: 'YOU CAN SPEND $X NOW, AFTER BILLS, YOUR PLAN, GOALS AND TRIPS. The figure is a word in the sentence; each held-back field is a word you can open in place. One rule under the figure shows how much of your cash it is.',
    metaphor: 'AN INSCRIPTION — the answer cut into travertine: still, plain, permanent-feeling',
    primary_object: 'THE ANSWER SENTENCE — generated from the breakdown, the figure as its second line',
    page_logic: 'Typographic declaration generated from SafeToSpendBreakdown: fixed grammar; one word per non-zero held-back field in a fixed order; the figure inline; confidence as the closing short sentence.',
    major_zones: ['FUNCTION LABEL', 'THE SENTENCE (lead · figure · single rule · after-clause of held-back words)', 'READING (completeness in plain words)', 'SEE THE FULL BREAKDOWN', 'INLINE ACTIONS (CHANGE WHAT’S HELD · PLAN)', 'EDITORIAL FOOTNOTE (the family question)'],
    structure: {
      spatial_logic: 'Linear reading column: one sentence top to bottom, left-aligned inside the centred field.',
      primary_zone: 'The sentence block in the upper two thirds; the figure is its second line.',
      visual_hierarchy: 'YOU CAN SPEND → figure → single proportional rule → NOW, AFTER + held-back words → reading → breakdown → question.',
      interaction_emphasis: 'Inline disclosure: each held-back word opens its amount where it stands; SEE THE FULL BREAKDOWN gives the whole reading.',
      information_density: 'Words only: one figure, one rule, one word per non-zero held-back field.',
      media_relationship: 'The answer is set into the material (travertine field); dappled olive shade at the outer frame only.',
    },
    composition_logic: 'CENTER_STAGE field; text keeps its own left alignment inside the centred field (the field is centred, not every element).',
    actor_fit: 'CLIENT: reads the answer the way JURNL would say it aloud — quietly assured, direct.',
    state_fit: 'COMPLETE “A FULL READING.” · PARTIAL “ABOUT $X” + BILLS word marked unknown · UNSTATED / NEEDS_* the sentence says it cannot answer yet · BELOW ZERO “YOU ARE OVER BY $X” with the rule overrunning in wine · NOTHING HELD “NOTHING IS HELD BACK YET.”',
    mobile_logic: '393×852: display 104px figure, 32px sentence, inline amount chips 24px tall; long sentences paginate atomically (the sentence is one panel).',
    desktop_logic: 'Not authored. A sentence scales by measure (line length) — desktop would need its own measure, not a stretched column.',
    visual_language: 'Instrument Serif set large and cut into travertine; Barlow tracked labels; champagne underlines on openable words; emerald figure and chips.',
    risks: ['Closest of the three to a hero-number page; its identity depends on the sentence grammar staying intact', 'Long held-back lists make long sentences (7 words worst case)', 'Inline amount chips must stay compact (typographic containment rule)', 'Inscription material is invented (travertine is brand; cutting the answer into it is not encoded)'],
    brand_fit: 'The JURNL voice made visible: quietly assured, clear, direct; display serif + tracked sans; travertine.',
    experience_fit: '“One word or figure. Wide tracking. Short.”, “The answer is the parent.”, function label → state → editorial with the question never carrying meaning.',
  },
  {
    ...base,
    territory_id: 'JURNL.F09.T03',
    name: '03 THE OPEN ENVELOPE',
    concept: 'One envelope is open: what you can spend. Everything held back is sealed beside it.',
    core_idea: 'A set of envelopes, one per held-back field, sealed. One larger envelope is open, its slip raised with the figure. The explanation stays sealed until you open it.',
    metaphor: 'OPEN AND SEALED ENVELOPES — setting money aside, in JURNL paper, linen and wax',
    primary_object: 'THE OPEN ENVELOPE and the slip that carries the safe-to-spend figure',
    page_logic: 'Object hierarchy by scale and state: one open object (value) above a row of sealed objects (one per non-zero held-back field, labelled, amounts sealed). Opening a sealed envelope reveals its amount; the open one is the answer.',
    major_zones: ['FUNCTION LABEL', 'THE OPEN ENVELOPE (slip with figure · state stamp · editorial addressee line)', 'SEALED · HELD BACK (total + labelled sealed envelopes)', 'SEE THE FULL BREAKDOWN', 'INLINE ACTIONS (CHANGE WHAT’S HELD · PLAN)'],
    structure: {
      spatial_logic: 'Object stage in depth: one open object in front and above, the sealed set beneath it in a row — scale and open / closed carry the hierarchy.',
      primary_zone: 'The open envelope and the slip rising out of it.',
      visual_hierarchy: 'Slip figure → state stamp → sealed envelopes and their labels → held-back total → breakdown.',
      interaction_emphasis: 'Object manipulation: tap a sealed envelope to open it (its amount rises on a slip); SEE THE FULL BREAKDOWN opens them all; CHANGE WHAT’S HELD reseals the protected / buffer envelopes.',
      information_density: 'One figure plus one labelled envelope per non-zero held-back field; amounts sealed.',
      media_relationship: 'Imagery lives inside the object (flap liner) and in the linen ground; no environment plate.',
    },
    composition_logic: 'CENTER_STAGE field; the open envelope sits on the + axis; the sealed row spans the stage in equal cells.',
    actor_fit: 'CLIENT: sees money already set aside as things put away, and the open one as theirs to use.',
    state_fit: 'COMPLETE stamp FULL READING · PARTIAL BILLS envelope unsealed with AMOUNT MISSING, stamp ESTIMATE · UNSTATED no BILLS envelope (not deducted) · NEEDS_SETUP / NEEDS_ACCOUNT open envelope with no slip + one return · BELOW ZERO open envelope empty, wine slip OVER BY $X · NOTHING HELD no sealed row.',
    mobile_logic: '393×852: open envelope 304 wide on the axis; up to 4 sealed envelopes per row (7 max → a second row or atomic pagination).',
    desktop_logic: 'Not authored. Objects keep their size; desktop gains a wider sealed row, not a bigger envelope.',
    visual_language: 'Paper and linen, wax seals in wine on square-rounded tiles, blush / rose botanical liner, emerald figure and stamp.',
    risks: ['Skeuomorphic / stationery kitsch if over-rendered', 'Sealed row of equal cells can read as a card grid if the envelope geometry is weakened', 'Envelope budgeting implies money is moved; JURNL only earmarks it (copy must not say “moved”)', 'Envelope, liner and seal are invented objects (not encoded in brand DNA)'],
    brand_fit: 'Paper, textile, champagne / wine / blush, botanical language, tactile materiality; avoids the forbidden DARK_BANK_VAULT reading of “safe”.',
    experience_fit: '“One open answer” (the open envelope), “why stays closed” (sealed), F09.HOLD “what is held back”, IX.HOLD “a confirmation, closed”.',
  },
];

/* ─────────────────────────────── 05 reference authority candidates ─────────────────────────────── */

const REF_DIR = `${JURNL_F09_PACKAGE_DIR}/REFERENCE_CANDIDATES`;
const ref = (n: 1 | 2 | 3, file: string): ReferenceAuthority => ({
  reference_id: `JURNL.F09.T0${n}.REF.MOBILE`,
  territory_id: `JURNL.F09.T0${n}`,
  format: 'WIREFRAME_PLUS_BRAND_RENDER',
  reference_paths: [`${REF_DIR}/${file}`, `${REF_DIR}/source/t0${n}.html`],
  viewport: 'MOBILE',
  states_shown: ['COMPLETE'],
  shows: ['composition', 'hierarchy', 'zones', 'media_relationship', 'interaction_emphasis', 'actor_intent'],
  role: 'PAGE_LOGIC_COMPOSITION_DIRECTION_CONTRACT',
  paid_generation: false,
});

export const JURNL_F09_REFERENCES: ReferenceAuthority[] = [
  ref(1, 'F09_T01_THE_OPEN_FLOOR_MOBILE_393x852.png'),
  ref(2, 'F09_T02_THE_PLAIN_ANSWER_MOBILE_393x852.png'),
  ref(3, 'F09_T03_THE_OPEN_ENVELOPE_MOBILE_393x852.png'),
];

/** Sample values used by all three candidates — QA seed commitments on real SafeToSpendBreakdown fields. */
export const JURNL_F09_SAMPLE_VALUES = {
  source: 'scripts/jurnl/mobile-composition-qa.mjs seedPopulated → figures quoted in docs/jurnl/refinements/mobile-creative-composition2/JURNL_FAMILY_LANGUAGE_CLARITY_AUDIT.json',
  fields: { cash: 30960, upcoming: 1875, assigned: 2400, goalReserved: 900, tripReserved: 900, purchaseReserved: 0, protected: 0, safetyBuffer: 0, value: 24885 },
  held_back: 6075,
  state_shown: 'COMPLETE (representational; the seed device itself was not set up)',
  caveat: 'The seed cash includes a LOAN balance (open functional flag: LOAN counts toward safe-to-spend cash). Representational only.',
} as const;

/* ─────────────────────────────── upstream scorecard (primary deliverable) ─────────────────────────────── */

export type UpstreamScore = 'SUFFICIENT' | 'PARTIAL' | 'MISSING';

export const JURNL_F09_UPSTREAM_SCORECARD: { contract: string; score: UpstreamScore; why: string }[] = [
  { contract: 'BRAND DNA', score: 'PARTIAL', why: 'Palette with roles, type pair, hard rules, world traits and forbidden departures are encoded. Positioning lines, audience, voice avoid list and mood statement are not (sprint-stated only). Gate brand check: BRAND_CONTEXT_REQUIRED (audience).' },
  { contract: 'EXPERIENCE CONTRACT', score: 'MISSING', why: 'No JURNL contract in the Workspace Experience Brain; JURNL.SAFE_TO_SPEND exists only as a non-material portability sample (“must not be used as build instructions”). Gate: EXPERIENCE_REQUIRED.' },
  { contract: 'FAMILY CONTRACT', score: 'PARTIAL', why: 'F09 brief + expression tree give job, question, signal, emotional role, child jobs and family relationships. Its composition fields are plate-era (left rail, right opening) and superseded by CENTER_STAGE; parent catalog labels drift from code.' },
  { contract: 'STATE CONTRACT', score: 'PARTIAL', why: 'Completeness enum and state copy are exact in code. The brief’s UNSTATED intent (“cannot be said yet · one return”) contradicts the runtime (number always shown); F03 and F09 disagree; no recovery actions; LOADING / ERROR undefined; no per-state visual relationships.' },
  { contract: 'INTERACTION CONTRACT', score: 'PARTIAL', why: 'Triggers, routes, sheets and mutations are exact. “Why stays closed” is the only parent interaction intent; no grammar for inspecting a held-back item; FF.SEE_WHY_VS_F09 unresolved; back fixed to TODAY.' },
  { contract: 'DATA CONTRACT', score: 'SUFFICIENT', why: 'One formula owner, every field and source defined, zero-bands-hidden rule. Functional defects flagged, not blocking concepting: BILLS BEFORE NEXT INCOME label ≠ formula, LOAN as cash, CARD ADDED expenses, purchase reserve unreachable, WHY omits trip / purchase.' },
  { contract: 'RESPONSIVE CONTRACT', score: 'PARTIAL', why: 'Mobile CENTER_STAGE, safe zone, nav, pagination and back are exact. Nothing F09-specific; the occupancy map’s tablet / desktop entries copy the superseded mobile left rail.' },
  { contract: 'EXPRESSION GUIDANCE', score: 'PARTIAL', why: 'Strong on feeling and restraint (one open answer, a single mark, why stays closed, still, more air; risks: looking empty, copying today’s journal). Its spatial content describes a room photograph (loggia, arch and sea on the right), not a page composition. Every primary object had to be invented.' },
];

export const JURNL_F09_UPSTREAM_VERDICT = {
  question: 'DID THE UPSTREAM SYSTEM PRODUCE ENOUGH INTELLIGENCE TO CREATE THREE STRONG TERRITORIES WITHOUT RELYING ON LEGACY UI?',
  answer: 'PARTIAL' as const,
  summary: 'Upstream fixed what the page must say, feel and refuse, and was enough to firewall legacy UI completely. It did not supply composition intelligence: the three primary objects (plan-view room, inscribed sentence, open / sealed envelopes) were invented by the territory author from brand materials + the formula + the brief’s abstractions.',
};

/* ─────────────────────────────── gate ─────────────────────────────── */

/** Formal gate input. No JURNL experience contract exists in the Brain → the gate holds at EXPERIENCE_REQUIRED. */
export function jurnlF09GateInput(): AuthorityGateInput {
  return {
    project_id: 'JURNL',
    family_id: FAMILY,
    feature_id: FEATURE,
    actor: 'CLIENT',
    material: true,
    family_locked: true,
    experience_contract: null,
    brand_context: JURNL_BRAND_CONTEXT,
    legacy_surfaces: JURNL_F09_LEGACY_SURFACES,
    legacy_uses: JURNL_F09_LEGACY_USES,
    territories: JURNL_F09_TERRITORIES,
    references: JURNL_F09_REFERENCES,
    founder_decision: null,
    authority: null,
  };
}

export type JurnlF09ProofStatus = {
  gate: AuthorityGateResult;
  brand: ReturnType<typeof checkBrandContext>;
  legacy: ReturnType<typeof checkLegacyUse>;
  territories: ReturnType<typeof checkTerritoryDistinctness>;
  references: ReturnType<typeof checkReferences>;
  legacy_visual_leak_count: number;
  founder_verdict: 'PENDING';
};

/** The formal gate plus each step evaluated on its own, so the proof shows what holds beyond the first stop. */
export function jurnlF09ProofStatus(): JurnlF09ProofStatus {
  const legacyCheck = checkLegacyUse(JURNL_F09_LEGACY_SURFACES, JURNL_F09_LEGACY_USES);
  return {
    gate: evaluateAuthorityGate(jurnlF09GateInput()),
    brand: checkBrandContext(JURNL_BRAND_CONTEXT),
    legacy: legacyCheck,
    territories: checkTerritoryDistinctness(JURNL_F09_TERRITORIES),
    references: checkReferences(JURNL_F09_TERRITORIES, JURNL_F09_REFERENCES),
    legacy_visual_leak_count: legacyCheck.leaks.length,
    founder_verdict: 'PENDING',
  };
}
