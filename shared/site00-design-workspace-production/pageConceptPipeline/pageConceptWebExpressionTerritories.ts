/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-TERRITORIES-AND-ROUTE-CONTEXT-FIX1
 * Structured website concept layer between Screenshot Function Map and GPT2 mobile.
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection } from './types.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptTargetRouteContract } from './pageConceptTargetPageContext.js';

export const WEB_EXPRESSION_TERRITORY_SET_VERSION = 'web-expression-territory-set-v1';

export type WebExpressionTerritorySlot = 'A' | 'B' | 'C';

export type WebExpressionTerritory = {
  territoryId: string;
  territorySlot: WebExpressionTerritorySlot;
  pageId: string;
  projectId: string;
  sourceCgptBriefId: string;
  sourcePageArchitectureId: string;
  sourceFunctionMapId: string;
  name: string;
  creativePremise: string;
  websiteMetaphor: string;
  graphicLanguage: string;
  compositionSystem: string;
  informationRhythm: string;
  imageRole: string;
  interactionCharacter: string;
  navigationExpression: string;
  materialLanguage: string;
  typographicBehavior: string;
  motionCharacter: string;
  distinctiveMove: string;
  pageSurprise: string;
  lowerPageTreatment: string;
  bottomContinuityTreatment: string;
  mobileSpecificBehavior: string;
  graphicDevice: string;
  imageComposition: string;
  typographicComposition: string;
  editorialRhythm: string;
  creativeTension: string;
  createdAt: string;
};

export type WebExpressionTerritorySet = {
  setId: string;
  version: typeof WEB_EXPRESSION_TERRITORY_SET_VERSION;
  territories: readonly [WebExpressionTerritory, WebExpressionTerritory, WebExpressionTerritory];
  sourceFunctionMapId: string;
  sourcePageArchitectureId: string;
  sourceCgptBriefId: string;
  createdAt: string;
};

function hashSeed(parts: readonly string[]): number {
  const s = parts.join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function slotFromId(slot: PageMobileConceptSlotId): WebExpressionTerritorySlot {
  if (slot === 'MOBILE_CONCEPT_A') return 'A';
  if (slot === 'MOBILE_CONCEPT_B') return 'B';
  return 'C';
}

function clip(text: string, max = 220): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

type Archetype = {
  nameStem: string;
  websiteMetaphor: string;
  graphicDevice: string;
  compositionSystem: string;
  distinctiveMoveStem: string;
  creativeTension: string;
  lowerPageTreatment: string;
  sterile: boolean;
};

const ARCHETYPES: readonly Archetype[] = [
  {
    nameStem: 'ARCHIVAL INDEX FIELD',
    websiteMetaphor: 'Physical archival filing system — numbered index plates organize the live project overview.',
    graphicDevice: 'Oversized index numerals + rule system anchoring each scroll band.',
    compositionSystem: 'Vertical register lanes with evidence plates sliding between index rails.',
    distinctiveMoveStem: 'Index numbers become page architecture — sections keyed like catalog drawers.',
    creativeTension: 'Rigid data grid vs expressive archival imagery.',
    lowerPageTreatment: 'Index rails continue through lower content — final rows compress into catalog footer before nav.',
    sterile: false,
  },
  {
    nameStem: 'EDITORIAL SIGNAL FRONT',
    websiteMetaphor: 'Living editorial front page — cultural intelligence broadcast with dated signal blocks.',
    graphicDevice: 'Publishing marks + annotation rails interrupting the editorial grid.',
    compositionSystem: 'Masthead band + asymmetric editorial columns with signal interrupts.',
    distinctiveMoveStem: 'Evidence plates interrupt the editorial grid as breaking signal inserts.',
    creativeTension: 'Clean index structure vs aggressive typographic interruption.',
    lowerPageTreatment: 'Editorial rhythm decelerates into a closing ledger band above bottom nav.',
    sterile: false,
  },
  {
    nameStem: 'INVESTIGATIVE EVIDENCE WALL',
    websiteMetaphor: 'Investigative field wall — annotated evidence map of project state and entries.',
    graphicDevice: 'Evidence frames + annotation marks + structural mapping lines.',
    compositionSystem: 'Wall grid with pinned plates, connective lines, and depth layers.',
    distinctiveMoveStem: 'Annotation rails create navigation hierarchy across the evidence wall.',
    creativeTension: 'Systematic modules vs one oversized graphic gesture.',
    lowerPageTreatment: 'Evidence wall resolves into a grounded continuity strip — pins align above real bottom nav.',
    sterile: false,
  },
];

function pickArchetype(index: number, _brief: PageConceptCgptCreativeBrief): Archetype {
  const pool = ARCHETYPES.filter((a) => !a.sterile);
  return pool[index % pool.length] ?? ARCHETYPES[index % ARCHETYPES.length]!;
}

function buildTerritoryForSlot(input: {
  slot: PageMobileConceptSlotId;
  brief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  target: PageConceptTargetRouteContract;
  pageArchitectureBriefId: string;
  functionMapId: string;
  projectId: string;
  pageId: string;
}): WebExpressionTerritory {
  const letter = slotFromId(input.slot);
  const archetypeIndex = letter === 'A' ? 0 : letter === 'B' ? 1 : 2;
  const archetype = pickArchetype(archetypeIndex, input.brief);
  const premise = clip(input.brief.creativePremise || input.injection.creativeThesis);
  const story = clip(input.brief.pageStory || input.injection.pagePurposeInterpretation);
  const move = clip(input.brief.distinctiveMove || input.injection.distinctiveMove || input.injection.informationPriority);
  const surprise = clip(input.brief.pageSurprise || input.injection.pageSurprise || 'One authored interrupt in the first viewport.');
  const imagery = clip(input.brief.imageryStrategy || input.injection.imageryStrategy || '');
  const hierarchy = clip(input.brief.hierarchyStrategy || input.injection.hierarchyDirection);
  const mobileDir = clip(input.brief.mobileDirection || input.injection.mobileDirection);

  const territoryId = `wet-${input.functionMapId}-${letter}-${hashSeed([input.brief.briefId, letter]).toString(16)}`;

  return {
    territoryId,
    territorySlot: letter,
    pageId: input.pageId,
    projectId: input.projectId,
    sourceCgptBriefId: input.brief.briefId,
    sourcePageArchitectureId: input.pageArchitectureBriefId,
    sourceFunctionMapId: input.functionMapId,
    name: `${letter} — ${archetype.nameStem}`,
    creativePremise: `[${letter}] ${archetype.nameStem}: ${premise}`,
    websiteMetaphor: archetype.websiteMetaphor,
    graphicLanguage: `${archetype.graphicDevice} Material language follows project skin — not screenshot mimicry.`,
    compositionSystem: archetype.compositionSystem,
    informationRhythm: `Alternate dense register bands with breathing fields; hierarchy: ${hierarchy}.`,
    imageRole: imagery || 'Imagery supports narrative plates — never decorative poster fills.',
    interactionCharacter: 'Tappable regions read as product controls — uppercase labels, clear affordances.',
    navigationExpression: `In-page nav expresses ${input.target.targetRouteLabel} — not design workspace tabs.`,
    materialLanguage: clip(input.brief.materialStrategy || input.injection.assetStrategy),
    typographicBehavior: clip(input.brief.typographyStrategy || 'Display/body/mono hierarchy with uppercase UI.'),
    motionCharacter: 'Static concept frame — imply micro-motion via offset marks, not animation chrome.',
    distinctiveMove: `${archetype.distinctiveMoveStem} Project move: ${move}.`,
    pageSurprise: surprise,
    lowerPageTreatment: archetype.lowerPageTreatment,
    bottomContinuityTreatment: 'Bottom nav: same destinations/order as source — surface material and active-state expression may change.',
    mobileSpecificBehavior: mobileDir || 'Portrait scroll narrative — full page through bottom nav.',
    graphicDevice: archetype.graphicDevice,
    imageComposition: 'Images masked/plated within graphic system — not edge-to-edge stock hero.',
    typographicComposition: 'Display anchors section bands; mono carries metadata rails.',
    editorialRhythm: story,
    creativeTension: archetype.creativeTension,
    createdAt: new Date().toISOString(),
  };
}

export function compileWebExpressionTerritorySet(input: {
  brief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  target: PageConceptTargetRouteContract;
  pageArchitectureBriefId: string;
  functionMapId: string;
  projectId: string;
  pageId: string;
}): WebExpressionTerritorySet {
  const slots: PageMobileConceptSlotId[] = ['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'];
  const territories = slots.map((slot) =>
    buildTerritoryForSlot({ ...input, slot }),
  ) as [WebExpressionTerritory, WebExpressionTerritory, WebExpressionTerritory];

  const setId = `wets-${input.functionMapId}-${hashSeed([input.brief.briefId, input.pageArchitectureBriefId]).toString(16)}`;

  return {
    setId,
    version: WEB_EXPRESSION_TERRITORY_SET_VERSION,
    territories,
    sourceFunctionMapId: input.functionMapId,
    sourcePageArchitectureId: input.pageArchitectureBriefId,
    sourceCgptBriefId: input.brief.briefId,
    createdAt: new Date().toISOString(),
  };
}

export function webExpressionTerritoryForSlot(
  set: WebExpressionTerritorySet,
  slot: PageMobileConceptSlotId,
): WebExpressionTerritory {
  const letter = slotFromId(slot);
  const found = set.territories.find((t) => t.territorySlot === letter);
  if (!found) throw new Error(`WEB_EXPRESSION_TERRITORY_MISSING: ${letter}`);
  return found;
}

function normalizeDistinctToken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 24)
    .join(' ');
}

function tokenOverlap(a: string, b: string): number {
  const sa = new Set(normalizeDistinctToken(a).split(' ').filter(Boolean));
  const sb = new Set(normalizeDistinctToken(b).split(' ').filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / Math.max(sa.size, sb.size);
}

function isPaletteOnlyPair(a: WebExpressionTerritory, b: WebExpressionTerritory): boolean {
  const fields: (keyof WebExpressionTerritory)[] = [
    'creativePremise',
    'websiteMetaphor',
    'compositionSystem',
    'graphicLanguage',
    'distinctiveMove',
  ];
  let same = 0;
  for (const f of fields) {
    if (normalizeDistinctToken(String(a[f])) === normalizeDistinctToken(String(b[f]))) same++;
  }
  if (same < 4) return false;
  const paletteHints = /light|dark|off-white|black|contrast|palette|theme/;
  const aPal = paletteHints.test(a.materialLanguage) || paletteHints.test(a.graphicLanguage);
  const bPal = paletteHints.test(b.materialLanguage) || paletteHints.test(b.graphicLanguage);
  return aPal || bPal;
}

export function validateWebExpressionTerritoryDistance(set: WebExpressionTerritorySet): {
  ok: boolean;
  errorCode: 'TERRITORIES_TOO_SIMILAR' | 'DISTINCTIVE_MOVE_COLLISION' | null;
  detail: string | null;
} {
  const [a, b, c] = set.territories;
  const pairs: [WebExpressionTerritory, WebExpressionTerritory][] = [
    [a, b],
    [a, c],
    [b, c],
  ];
  for (const [x, y] of pairs) {
    if (x.distinctiveMove.trim().toLowerCase() === y.distinctiveMove.trim().toLowerCase()) {
      return { ok: false, errorCode: 'DISTINCTIVE_MOVE_COLLISION', detail: `${x.territorySlot}/${y.territorySlot}` };
    }
    const premiseOverlap = tokenOverlap(x.creativePremise, y.creativePremise);
    const metaphorOverlap = tokenOverlap(x.websiteMetaphor, y.websiteMetaphor);
    const moveOverlap = tokenOverlap(x.distinctiveMove, y.distinctiveMove);
    if (premiseOverlap > 0.72 && metaphorOverlap > 0.65) {
      return { ok: false, errorCode: 'TERRITORIES_TOO_SIMILAR', detail: `premise/metaphor ${x.territorySlot}/${y.territorySlot}` };
    }
    if (moveOverlap > 0.78 && tokenOverlap(x.compositionSystem, y.compositionSystem) > 0.7) {
      return { ok: false, errorCode: 'TERRITORIES_TOO_SIMILAR', detail: `composition ${x.territorySlot}/${y.territorySlot}` };
    }
    if (isPaletteOnlyPair(x, y)) {
      return { ok: false, errorCode: 'TERRITORIES_TOO_SIMILAR', detail: `palette-only ${x.territorySlot}/${y.territorySlot}` };
    }
  }
  return { ok: true, errorCode: null, detail: null };
}

export function validateSterileWebExpressionTerritory(territory: WebExpressionTerritory): {
  ok: boolean;
  errorCode: 'STERILE_GENERIC_TERRITORY' | null;
} {
  const blob = [
    territory.creativePremise,
    territory.websiteMetaphor,
    territory.compositionSystem,
    territory.graphicDevice,
  ]
    .join(' ')
    .toLowerCase();
  const sterileOnly =
    (blob.includes('card stack') || blob.includes('dashboard') || blob.includes('saas')) &&
    !territory.graphicDevice.trim() &&
    !territory.distinctiveMove.trim();
  if (sterileOnly) return { ok: false, errorCode: 'STERILE_GENERIC_TERRITORY' };
  if (!territory.graphicDevice.trim() || !territory.distinctiveMove.trim()) {
    return { ok: false, errorCode: 'STERILE_GENERIC_TERRITORY' };
  }
  return { ok: true, errorCode: null };
}

export function compileWebExpressionTerritoryPromptBlock(territory: WebExpressionTerritory): string {
  return [
    'WEB EXPRESSION TERRITORY (THIS CONCEPT ONLY — SIBLINGS USE DIFFERENT TERRITORIES):',
    `NAME: ${territory.name}`,
    `CREATIVE PREMISE: ${territory.creativePremise}`,
    `WEBSITE METAPHOR: ${territory.websiteMetaphor}`,
    `GRAPHIC DEVICE: ${territory.graphicDevice}`,
    `GRAPHIC LANGUAGE: ${territory.graphicLanguage}`,
    `COMPOSITION SYSTEM: ${territory.compositionSystem}`,
    `IMAGE ROLE / COMPOSITION: ${territory.imageRole} · ${territory.imageComposition}`,
    `TYPOGRAPHIC COMPOSITION: ${territory.typographicComposition}`,
    `EDITORIAL RHYTHM: ${territory.editorialRhythm}`,
    `INFORMATION RHYTHM: ${territory.informationRhythm}`,
    `INTERACTION CHARACTER: ${territory.interactionCharacter}`,
    `NAVIGATION EXPRESSION: ${territory.navigationExpression}`,
    `DISTINCTIVE MOVE: ${territory.distinctiveMove}`,
    `CREATIVE TENSION: ${territory.creativeTension}`,
    `PAGE SURPRISE: ${territory.pageSurprise}`,
    `LOWER PAGE TREATMENT: ${territory.lowerPageTreatment}`,
    `BOTTOM CONTINUITY TREATMENT: ${territory.bottomContinuityTreatment}`,
    `MOBILE BEHAVIOR: ${territory.mobileSpecificBehavior}`,
    'THEME/PALETTE ALONE IS NOT A TERRITORY — express the graphic system above.',
    'Avoid sterile card stacking, generic dashboard grids, uniform SaaS modules.',
  ].join('\n');
}

export function formatWebExpressionTerritoryDebugLines(
  territory: WebExpressionTerritory | null,
  target: PageConceptTargetRouteContract | null,
): string[] {
  return [
    `TARGET_PRODUCT_ROUTE: ${target?.targetRouteLabel ?? '—'}`,
    `AUTHORING_CONTEXT: ${target?.authoringContext ?? 'DESIGN_WORKSPACE'}`,
    `AUTHORING_CONTEXT_IN_OUTPUT: ${target?.authoringContextInTargetOutput === false ? 'NO' : 'YES'}`,
    `WEB_TERRITORY_ID: ${territory?.territoryId ?? '—'}`,
    `WEB_TERRITORY_NAME: ${territory?.name ?? '—'}`,
  ];
}
