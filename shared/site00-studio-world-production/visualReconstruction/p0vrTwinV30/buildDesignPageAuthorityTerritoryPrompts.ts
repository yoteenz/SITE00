import { NDXBOOK_LIME, SITE00_HOST_RED } from './activeProjectExpressionContract.js';
import {
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  P0_VR_TWIN_V30R3_LINEAGE,
} from './constants.js';
import { canonicalReframeBlock, foundershiTestLine } from './designPageAuthoritySelfCheck.js';
import {
  DESIGN_PAGE_V3_TERRITORY_DEFINITIONS,
  HOST_CONTROLS_STABLE_RULE,
  HOST_PROJECT_EXPRESSION_CORE_RULE,
  type DesignPageV3TerritoryId,
} from './hostProjectExpressionModel.js';
import { skeletonZoneLabelsForPrompt } from './lockedExperienceSkeleton.js';

const THREE_LAYER_MODEL = `
THREE VISUAL LAYERS (do not collapse):
1. HOST SHELL — ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME}: white/off-white, black, ${SITE00_HOST_RED} reserved for host nav state, system warnings, approval at host level, critical host actions. Martian Mono for wayfinding, shell controls, workflow labels, compiler/meta labels.
2. ACTIVE PROJECT WORKSPACE — ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()}: ${NDXBOOK_LIME} accents on project-owned surfaces, black/white editorial contrast, archive/cultural-intelligence rhythm, expressive project type inside workspace only.
3. SYSTEM / COMPILER META — ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} system language even when workspace feels ${DESIGN_PAGE_V3_PILOT_PROJECT_ID.toUpperCase()}.

CORE RULE: ${HOST_PROJECT_EXPRESSION_CORE_RULE}
SECOND RULE: ${HOST_CONTROLS_STABLE_RULE}

DO NOT use ${SITE00_HOST_RED} as main client accent inside NDXBOOK workspace content.
DO NOT use ${NDXBOOK_LIME} for host errors, global nav, account, or SITE 00 system warnings.
`.trim();

const SPATIAL_GRAMMAR = `
SPATIAL GRAMMAR (fail if generic admin dashboard):
- One dominant central work surface (eye lands on creative artifact, not a grid of system cards).
- One visually quiet workflow spine (TARGET→MASTER→BUNDLE→APPROVE→BUILD→FIDELITY — edge spine / index rail / architectural marks, NOT generic SaaS stepper).
- One contextual decision layer (approve feels like operating state, not random red button in a box).
- Secondary technical detail recessed (mobile: bottom sheet; desktop: edge inspector).
- Artifacts are NOT uniform small white cards — use layers, stacks, filmstrips, trays, large previews where appropriate.

ANTI-PATTERNS (regenerate): left sidebar + top bar + generic cards + right inspector as entire composition; long mobile card stack; Martian Mono on every artifact; SITE 00 red dominating workspace; missing NDXBOOK lime on project surfaces.
`.trim();

const R3_QUALITY = `
${P0_VR_TWIN_V30R3_LINEAGE} — three spatially DISTINCT territories (not color skins). Creative workstation / editorial environment — NOT enterprise admin SaaS template.

${foundershiTestLine()}
Plus: "I can immediately feel NDXBOOK is the project I have open." — both reactions required.

${canonicalReframeBlock()}
`.trim();

function territoryBlock(id: DesignPageV3TerritoryId): string {
  const def = DESIGN_PAGE_V3_TERRITORY_DEFINITIONS[id];
  return `
TERRITORY ${def.id} — ${def.name}:
${def.spatialIdea}
Must differ in COMPOSITION from territories A/B/C — not a palette swap.
`.trim();
}

function sharedBrief(viewport: 'mobile' | 'desktop'): string {
  const zones = skeletonZoneLabelsForPrompt();
  const form =
    viewport === 'mobile' ?
      'Mobile: SITE 00 shell visible; NDXBOOK atmosphere obvious in working area; not a long stack of generic white cards.'
    : 'Desktop: creative workstation; strong central stage; quiet host frame; less admin dashboard.';
  return `
${THREE_LAYER_MODEL}
${SPATIAL_GRAMMAR}

LOCKED SKELETON ZONES (A–G — all present, hierarchical):
${zones}

${form}
`.trim();
}

export function buildTerritoryDesignPageAuthorityPrompt(input: {
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
  clientProjectId: string;
  refineNotes?: string[];
}): string {
  const client = input.clientProjectId.toUpperCase();
  const refine =
    input.refineNotes?.length ?
      `\nFOUNDER REFINE:\n${input.refineNotes.map((n) => `- ${n}`).join('\n')}\n`
    : '';
  const canvas =
    input.viewport === 'mobile' ?
      `${DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX}px portrait`
    : '1440px landscape creative workstation';
  return `
Generate HIGH-FIDELITY founder-review UI MOCKUP — ${input.viewport.toUpperCase()} — ${DESIGN_PAGE_V3_CANONICAL_PATH}.
Active project ${client} OPEN inside ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} shell (not ${client}-owned app).
Canvas: ${canvas}.

${R3_QUALITY}
${sharedBrief(input.viewport)}
${territoryBlock(input.territoryId)}
${refine}

Output: unmistakably ${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} architecture + ${client} atmosphere in workspace.
`.trim();
}

export function buildAllTerritoryPrompts(input: {
  clientProjectId: string;
  refineNotes?: string[];
}): Record<DesignPageV3TerritoryId, { mobile: string; desktop: string }> {
  const ids: DesignPageV3TerritoryId[] = ['A', 'B', 'C'];
  const out = {} as Record<DesignPageV3TerritoryId, { mobile: string; desktop: string }>;
  for (const id of ids) {
    out[id] = {
      mobile: buildTerritoryDesignPageAuthorityPrompt({ ...input, territoryId: id, viewport: 'mobile' }),
      desktop: buildTerritoryDesignPageAuthorityPrompt({ ...input, territoryId: id, viewport: 'desktop' }),
    };
  }
  return out;
}
