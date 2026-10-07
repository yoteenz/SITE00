/**
 * JURNL F09 SAFE TO SPEND — three-concept art-direction regeneration
 * (P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1).
 *
 * The composite rounds were founder-rejected: scene plates with UI laid on top, sparse worlds, blank primitives on show,
 * device chrome, glitched type. This round keeps the three structural territories, drops the failed treatment, and authors
 * each candidate as one finished image: a text-free, benchmark-rich Sunburst scene with the signature object fully
 * realised, plus a product layer set by hand in the scene's light (official logo, JURNL type, runtime nav) with no device
 * chrome. Package: JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1/.
 */
import { AUTHORED_AUTHORITY_RULE, FINISH_QA } from '../../hybrid-authority.js';
import { JURNL_RICHNESS_BENCHMARK } from './composition-grammar.js';

export const JURNL_F09_REGEN_SPRINT = 'P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1' as const;
export const JURNL_F09_REGEN_DIR = 'JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1' as const;

export const JURNL_F09_REGEN_SUPERSEDES = [
  'P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1',
  'P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1',
  'P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1',
  'P0.JURNL.F09-SAFE-TO-SPEND.HYBRID-COMPOSITE-AUTHORITY-EXECUTION1',
] as const;

/** The three founder decisions the F09 blueprint left open, settled by this sprint's brief (product expression list). */
export const F09_DECISIONS_SETTLED = [
  { id: 'D-F09-PRIMARY-ACTION-LABEL', decision: 'SEE WHY THIS AMOUNT', source: 'REGEN-CORRECTION1 brief: "primary CTA equivalent to WHY / SEE WHY THIS AMOUNT" + F09_FOUNDER_REVIEW_PAYLOAD.json' },
  { id: 'D-F09-PURCHASES-BRIDGE', decision: 'INCLUDED — WANT TO SPEND ON SOMETHING? / CHECK HOW IT FITS YOUR PLAN BEFORE YOU BUY. / CHECK A PURCHASE', source: 'brief: "secondary purchase-check module"' },
  { id: 'D-F09-AVAILABLE-DATE', decision: 'INCLUDED — AVAILABLE THROUGH OCT 18 (sample)', source: 'brief: "available-through date"', implementation_note: 'computeSafeToSpend has no horizon yet; implementation needs a formula decision for the date. The authority shows the founder sample.' },
] as const;

export type RegenConcept = {
  territory_id: string;
  name: string;
  preserved_intent: string;
  art_direction: string;
  scene_prompt: string;
  composition: string;
  held_clarity: string;
  logo: string;
  purchase_module: string;
  wit: string;
  distinct_by: string;
  previous_round_failure: string;
};

export const JURNL_F09_REGEN_CONCEPTS: RegenConcept[] = [
  {
    territory_id: 'JURNL.F09.T01',
    name: 'THE SURVEYED COURTYARD',
    preserved_intent: 'Spendable area vs held-back perimeter: the open, sunlit floor is the money; the shaded edges hold the commitments.',
    art_direction: 'A real courtyard of a limewashed cliff villa seen from the upper loggia: far wall with an arched opening to the sea, an olive spilling over, a linen-cushioned limestone bench, a stone basin, terracotta planters with lemon and lavender, a sheer curtain at the near edge. The sunlit centre is bounded by the arcade’s shade on all four sides.',
    scene_prompt: `${JURNL_F09_REGEN_DIR}/SCENE_PROMPTS/T01_SURVEYED_COURTYARD.txt`,
    composition: 'Figure set in the sunlit square (the money sits in the open area); survey corner ticks measure the square; the commitments are annotated on the shaded perimeter; actions and nav rest on the near loggia floor in shade.',
    held_clarity: 'BILLS (bench side), PLANS (basin side), GOALS (planter side), BUFFER (step side) annotated on the perimeter, plus HELD FOR BILLS, PLANS, GOALS & BUFFER under the figure.',
    logo: 'Official vertical lockup top-left over the plain far wall, multiplied into the plaster.',
    purchase_module: 'Frosted limestone panel, one row: question + line left, outlined CHECK A PURCHASE right.',
    wit: 'The emptiest, brightest part of the page is the money you can spend.',
    distinct_by: 'High overhead architectural view; centred figure inside the scene; survey annotation grammar.',
    previous_round_failure: 'An empty plan-diagram frame floating on blank paving, labels misplaced and doubled, logo in a pasted box.',
  },
  {
    territory_id: 'JURNL.F09.T02',
    name: 'THE ANSWER IN RAKING LIGHT',
    preserved_intent: 'The editorial answer: one plain sentence answers the question, set where the morning light falls.',
    art_direction: 'One thick limestone wall seen square-on, early sun raking through a deep arched window with an oak casement, sea and cypress outside, a lifting linen curtain; a travertine ledge with an olive branch in a hand-thrown vase and blank linen books.',
    scene_prompt: `${JURNL_F09_REGEN_DIR}/SCENE_PROMPTS/T02_ANSWER_IN_RAKING_LIGHT.txt`,
    composition: 'Left editorial column inside the light patch: SAFE TO SPEND → YOU CAN SPEND → $1,284 (the largest thing on the page) → AVAILABLE THROUGH OCT 18 → hairline → AFTER BILLS, PLANS, GOALS & BUFFER. The window carries the world on the right; actions sit below the ledge.',
    held_clarity: 'The sentence names all four holds; the held words are set in brass ink — only the words that hold money are metal.',
    logo: 'Official vertical lockup as the column’s masthead, top-left.',
    purchase_module: 'Limestone band with an editorial serif question and an outlined CHECK A PURCHASE.',
    wit: 'Metal means “this is held”: the material of a word says what it is.',
    distinct_by: 'Frontal elevation; typographic hero; asymmetric column against the window.',
    previous_round_failure: 'Text dropped onto a pale wall with an empty hanging brass tag and a placeholder maker’s plate.',
  },
  {
    territory_id: 'JURNL.F09.T03',
    name: 'THE SORTING RACK',
    preserved_intent: 'Sorting by category: what is held stays sealed; what you can spend is the only letter opened.',
    art_direction: 'A bespoke built-in cabinet of five arched oak-lined niches carved into a limewashed entrance-hall wall, a continuous limestone sill, four sealed linen envelopes with burgundy wax, the centre niche empty in a beam of light with the broken seal on its sill; a travertine console with a hand-thrown bowl and olive sprig; a glimpse of sea at the window edge.',
    scene_prompt: `${JURNL_F09_REGEN_DIR}/SCENE_PROMPTS/T03_SORTING_RACK.txt`,
    composition: 'Symmetric: the figure centred on the plain upper wall, a fine thread drops to the open centre niche; categories engraved on the sill under each sealed niche; actions on the shaded lower wall.',
    held_clarity: 'BILLS · PLANS · GOALS · BUFFER under their sealed envelopes; the official botanical mark pressed into each seal.',
    logo: 'Official vertical lockup top-left, and the official botanical mark embossed into every wax seal (deterministic emboss of the official asset, never redrawn).',
    purchase_module: 'A cream stationery card with a letterpress edge.',
    wit: 'The empty niche and its broken seal: the only envelope opened is the money you can spend.',
    distinct_by: 'Frontal still life; classical symmetry; object grid with sealed / opened states.',
    previous_round_failure: 'A plain mail-rack with blank brass plates, a dashed debug border around the purchase module, clipped labels.',
  },
];

/* ─────────────── render ledger ─────────────── */

export const JURNL_F09_REGEN_RENDER_LEDGER = {
  sprint: JURNL_F09_REGEN_SPRINT,
  renderer: { model: 'gpt-image-2.5-sunburst', aspect: '9:16', auto_enhance: 'not exposed by the route', text: 'none rendered by the generator (scenes are text-free)' },
  route: 'Figma MCP generate_image (team plan) — the only gpt-image-2.5-sunburst route reachable in this environment',
  routes_unavailable: [
    'OpenArt: not connected in this environment (no credential / connector).',
    'Figma Weave (upscaling): account not linked to Weave.',
  ],
  generations: [
    { territory_id: 'JURNL.F09.T01', requested: '1152×2048', returned: '864×1536', asset: 'https://www.figma.com/api/mcp/asset/7657f6dc-45c7-4099-a0ef-0295f1f3c45e.png', preview: `${JURNL_F09_REGEN_DIR}/SCENES_PROOF/T01_preview_144x256.jpg` },
    { territory_id: 'JURNL.F09.T02', requested: '1152×2048', returned: '864×1536', asset: 'https://www.figma.com/api/mcp/asset/8a6f59f2-e48c-4bbe-8337-b9bc8de97e2e.png', preview: `${JURNL_F09_REGEN_DIR}/SCENES_PROOF/T02_preview_144x256.jpg` },
    { territory_id: 'JURNL.F09.T03', requested: '1152×2048', returned: '864×1536', asset: 'https://www.figma.com/api/mcp/asset/57e04fbe-51c5-4d37-8b7a-55c5d76c7121.png', preview: `${JURNL_F09_REGEN_DIR}/SCENES_PROOF/T03_preview_144x256.jpg` },
  ],
  generated_at: '2026-10-06T22:06Z',
  assets_expire: '2026-10-13',
  primary_generations: 3,
  retries: 0,
  paid: 'Figma AI credits, 3 calls',
  retrieval: 'BLOCKED — the environment network policy denies www.figma.com, so the full-resolution scenes cannot be downloaded into the container. Only the 144×256 previews returned with the tool call are on disk.',
  resolution_exception: 'This route returns 864×1536 (requested 1152×2048; cap 2048). The 4K spec cannot be met here. With retrieval enabled the photographic layer is upscaled ×1.66 to the 1179×2556 (@3x) canvas; type, logo and UI render natively at @3x. True 4K needs OpenArt connected to this environment.',
};

export type RegenStatus = 'BLOCKED_ON_SCENE_RETRIEVAL' | 'CANDIDATES_DELIVERED';

export const JURNL_F09_REGEN_STATUS = {
  status: 'BLOCKED_ON_SCENE_RETRIEVAL' as RegenStatus,
  candidates_delivered: 0,
  layout_proof: `${JURNL_F09_REGEN_DIR}/LAYOUT_PROOF/F09_FOUNDER_REVIEW_BOARD.png`,
  layout_proof_rule: 'Built on the 144×256 previews to lock layout against the real scene compositions. Watermarked LAYOUT PROOF · NOT AUTHORITY; never a candidate.',
  assembly: 'node scripts/jurnl/f09-art-direction-regen-assemble.mjs (expects SCENES/T0n_SCENE.png; --proof for the layout proof)',
  unblock: [
    'Allow www.figma.com in this environment’s network access → download the three scenes (assets valid until 2026-10-13), QA them at full size, assemble, audit, board. Below 4K (see resolution_exception).',
    'Or connect OpenArt to this environment (credential + network) → regenerate the three scenes at 4K from SCENE_PROMPTS/, then the same assembly.',
  ],
  device_chrome: 'NONE by construction (no status bar, home indicator, phone or browser frame in the assembly).',
};

export const JURNL_F09_REGEN_STANDARD = {
  rule: AUTHORED_AUTHORITY_RULE,
  finish_qa: FINISH_QA,
  benchmark: JURNL_RICHNESS_BENCHMARK,
  scene_rule: 'The generator paints a finished world with the signature object fully realised and no text. Blank plates, tags, panels or mockup zones are never visible in the final image.',
  product_layer_rule: 'Type, logo and controls are set in the scene’s light: multiply-blended ink on plaster and stone, frosted material panels, shadows from the scene’s light direction, one grain over the whole page.',
  review_rule: 'Only finished candidates reach the founder board; previews, plates and proofs never do.',
};
