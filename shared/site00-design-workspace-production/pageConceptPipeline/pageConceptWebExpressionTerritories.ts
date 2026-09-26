/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-TERRITORIES + ART-DIRECTION-AMPLIFICATION1
 * Structured website concept layer between Screenshot Function Map and GPT2 mobile.
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection } from './types.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptTargetRouteContract } from './pageConceptTargetPageContext.js';
import {
  compileNdxColorExpressionHandoffSentence,
  validateNdxColorExpressionForTerritories,
} from './pageConceptNdxColorExpressionContract.js';

export const WEB_EXPRESSION_TERRITORY_SET_VERSION = 'web-expression-territory-set-v2';

export type WebExpressionTerritorySlot = 'A' | 'B' | 'C';

export type TypeScaleDrama = 'LOW' | 'MEDIUM' | 'HIGH';

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
  artDirectionPremise: string;
  signatureGraphicDevice: string;
  secondaryGraphicDevices: readonly string[];
  typographicConcept: string;
  displayTypographyBehavior: string;
  bodyTypographyBehavior: string;
  monoTypographyBehavior: string;
  typeScaleDrama: TypeScaleDrama;
  editorialCompositionRule: string;
  imageArtDirection: string;
  imageCroppingBehavior: string;
  imageGraphicRelationship: string;
  colorExpressionSystem: string;
  materialExpression: string;
  sectionTransitionLanguage: string;
  interactionGraphicLanguage: string;
  controlledDisruption: string;
  bespokeMoment: string;
  creativeDensityPattern: string;
  lowerPageCreativeContinuation: string;
  bottomNavVisualIntegration: string;
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

type ArchetypeStem = {
  nameStem: string;
  websiteMetaphor: string;
  compositionSystem: string;
  distinctiveMoveStem: string;
  creativeTension: string;
  lowerPageTreatment: string;
};

type ArtDirectionBundle = {
  artDirectionPremise: string;
  signatureGraphicDevice: string;
  secondaryGraphicDevices: readonly string[];
  typographicConcept: string;
  displayTypographyBehavior: string;
  bodyTypographyBehavior: string;
  monoTypographyBehavior: string;
  typeScaleDrama: TypeScaleDrama;
  editorialCompositionRule: string;
  imageArtDirection: string;
  imageCroppingBehavior: string;
  imageGraphicRelationship: string;
  colorExpressionSystem: string;
  materialExpression: string;
  sectionTransitionLanguage: string;
  interactionGraphicLanguage: string;
  controlledDisruption: string;
  bespokeMoment: string;
  creativeDensityPattern: string;
  lowerPageCreativeContinuation: string;
  bottomNavVisualIntegration: string;
  graphicLanguageStem: string;
  informationRhythmStem: string;
  interactionCharacterStem: string;
};

const ARCHETYPE_STEMS: readonly ArchetypeStem[] = [
  {
    nameStem: 'ARCHIVAL INDEX FIELD',
    websiteMetaphor:
      'Physical archival filing system — numbered index plates organize the live NDXBOOK overview as a catalog drawer opened on mobile.',
    compositionSystem:
      'Side-rail index columns with evidence plates sliding between vertical register lanes — not a uniform card stack.',
    distinctiveMoveStem:
      'Catalog numerals become structural dividers — sections keyed like drawer labels crossing module boundaries.',
    creativeTension: 'Rigid index grammar vs expressive archival imagery bleeding across rails.',
    lowerPageTreatment:
      'Index rails continue through entries and in-production — final rows compress into catalog footer before nav.',
  },
  {
    nameStem: 'EDITORIAL SIGNAL FRONT',
    websiteMetaphor:
      'Living editorial broadcast — cultural intelligence blocks interrupt a publication grid like a signal desk for NDXBOOK state.',
    compositionSystem:
      'Masthead band + asymmetric editorial columns with signal inserts — open fields alternate dense typographic bands.',
    distinctiveMoveStem:
      'Breaking-signal strips cut across columns — metadata rails carry dates and codes beside headlines.',
    creativeTension: 'Clean publication grid vs aggressive typographic interruption and crop marks.',
    lowerPageTreatment:
      'Editorial rhythm decelerates into a closing ledger band — masthead logic persists above bottom nav.',
  },
  {
    nameStem: 'INVESTIGATIVE EVIDENCE WALL',
    websiteMetaphor:
      'Investigative field wall — annotated evidence map of project state, entries, and production threads pinned for review.',
    compositionSystem:
      'Wall grid with pinned plates, connective mapping lines, and depth layers — asymmetric grouping over rectangle stacks.',
    distinctiveMoveStem:
      'Annotation rails and redaction-style labels create navigation hierarchy across the evidence wall.',
    creativeTension: 'Systematic evidence modules vs one oversized gesture spanning the wall.',
    lowerPageTreatment:
      'Evidence wall resolves into grounded continuity strip — pins and lines align above real bottom nav.',
  },
];

const ART_DIRECTION_BY_SLOT: Record<WebExpressionTerritorySlot, ArtDirectionBundle> = {
  A: {
    artDirectionPremise:
      'Treat the overview as a live archival index opened mid-audit — oversized drawer numerals and registration marks govern scroll, not card templates.',
    signatureGraphicDevice:
      'Monumental vertical index numerals (01–09 scale) crossing section boundaries with horizontal catalog rules.',
    secondaryGraphicDevices: [
      'Micro classification bands (NDX / REV / STATUS codes)',
      'Corner registration ticks anchoring image plates',
      'Mono caption rails threading between entries',
    ],
    typographicConcept:
      'Index typography as architecture — display numerals at structural scale, body compressed into catalog rows.',
    displayTypographyBehavior:
      'Sparse monumental numerals and section keys cropped by page edges; headlines sit beside rails, not above boxed cards.',
    bodyTypographyBehavior:
      'Tight uppercase rows with deliberate line breaks mimicking catalog ledgers — never centered SaaS paragraphs.',
    monoTypographyBehavior:
      'Metadata codes run continuous rails — dates, entry ids, and status tokens repeat as vertical index.',
    typeScaleDrama: 'HIGH',
    editorialCompositionRule:
      'Controlled asymmetry: heavy left index rail, offset evidence plates, open paper breathing fields on the right.',
    imageArtDirection:
      'Evidence plates on warm archival paper — duotone documentation fragments, not full-bleed stock heroes.',
    imageCroppingBehavior:
      'Hard crop fragments with visible registration marks; partial images bleed into index gutters.',
    imageGraphicRelationship:
      'Images sit under index numerals — numerals overlap plate corners like physical folder tabs.',
    colorExpressionSystem:
      'Cool paper whites with graphite blacks; signal lime appears only on index keys and active entry markers.',
    materialExpression: 'Archival stock + toner lines + light photocopy grain on evidence fields.',
    sectionTransitionLanguage:
      'Horizontal catalog rules + scale drop on numerals mark each chapter — negative-space resets between drawers.',
    interactionGraphicLanguage:
      'Tappable rows inherit index underline ticks; active state uses lime registration bar, not filled pill buttons.',
    controlledDisruption:
      'One index numeral at 2× section height crosses into the hero band, overlapping imagery while preserving legibility.',
    bespokeMoment:
      'NDXBOOK overview title rendered as a catalog drawer label plate — embossed rule frame with mono accession code beside it.',
    creativeDensityPattern:
      'Dense index header and entry band, open paper mid-scroll, dense in-production ledger before nav.',
    lowerPageCreativeContinuation:
      'Index numerals shrink but rails persist through entries, evidence, and CTA — footer reads as final catalog row.',
    bottomNavVisualIntegration:
      'Nav sits on concrete-gray strip with mono tab codes; active tab gets lime index tick aligned to page rail.',
    graphicLanguageStem: 'Oversized index numerals + catalog rules + classification bands.',
    informationRhythmStem: 'Alternate dense register bands with breathing paper fields.',
    interactionCharacterStem: 'Rows read as catalog entries — uppercase labels, clear tappable rails.',
  },
  B: {
    artDirectionPremise:
      'The page is a signal desk publishing live NDXBOOK intelligence — crop marks and marginalia interrupt a precise editorial grid.',
    signatureGraphicDevice:
      'Publication crop marks and marginal annotation fields weaving through navigation and section headers.',
    secondaryGraphicDevices: [
      'Dated signal stamps in mono',
      'Vertical sidebar notes (EDITORIAL / FIELD / DESK)',
      'Thin interrupt rules breaking column alignment',
    ],
    typographicConcept:
      'Broadcast typography — compressed headline columns explode into oversized signal words at chapter breaks.',
    displayTypographyBehavior:
      'Headlines compress into multi-line stacks with intentional breaks; one word per line at medium-high scale.',
    bodyTypographyBehavior:
      'Justified-feel uppercase columns with annotation offsets — body never isolated inside bordered cards.',
    monoTypographyBehavior:
      'Signal timestamps and edition codes orbit headlines like marginalia — repeated at section transitions.',
    typeScaleDrama: 'MEDIUM',
    editorialCompositionRule:
      'Monumental top masthead, compressed middle entry index, expansive lower signal field before nav.',
    imageArtDirection:
      'Editorial plates with annotated borders — images framed by crop marks and caption strips, collage logic allowed.',
    imageCroppingBehavior:
      'Diagonal crops and overlapping plates — one image may break column grid asymmetrically.',
    imageGraphicRelationship:
      'Captions overlap image corners; crop marks extend into adjacent typography fields.',
    colorExpressionSystem:
      'Warm archival white base, near-black ink, acid lime reserved for signal stamps and breaking inserts.',
    materialExpression: 'Newsprint + ink + light halftone on photography — no glossy campaign finish.',
    sectionTransitionLanguage:
      'Typographic chapter breaks: oversized SIGNAL word + rule reset; material shifts from newsprint to toned gray.',
    interactionGraphicLanguage:
      'Links appear as underlined signal tokens with small crop-mark corners — not generic chevron cards.',
    controlledDisruption:
      'Full-width signal strip spans modules mid-page with oversized date stamp interrupting the grid.',
    bespokeMoment:
      'Live status block styled as a breaking ticker tape — mono timestamp + lime SIGNAL tag wrapping overview metrics.',
    creativeDensityPattern:
      'Dense masthead, rhythmic column entry list, open signal field, dense closing desk note above nav.',
    lowerPageCreativeContinuation:
      'Marginalia and crop marks continue through entries and production — CTA reads as final edition notice.',
    bottomNavVisualIntegration:
      'Nav labels on newsprint strip with crop-mark active indicator; lime underline beneath active destination only.',
    graphicLanguageStem: 'Crop marks + marginalia rails + signal stamps.',
    informationRhythmStem: 'Broadcast cadence — dense signal blocks alternating open editorial fields.',
    interactionCharacterStem: 'Tappable editorial tokens — uppercase, underlined signal affordances.',
  },
  C: {
    artDirectionPremise:
      'Overview as investigative evidence wall — mapping lines, pin labels, and annotation layers prove project state like a case board.',
    signatureGraphicDevice:
      'Connective mapping lines and pin labels linking evidence plates across an asymmetric wall grid.',
    secondaryGraphicDevices: [
      'Redaction-style highlight bars',
      'Evidence ID hex labels',
      'Toner halftone fields behind plates',
    ],
    typographicConcept:
      'Forensic indexing — mixed scale labels, pinned headlines, micro evidence IDs clustering around plates.',
    displayTypographyBehavior:
      'Headlines pinned like case notes — moderate scale with surrounding micro-ID cloud, not centered hero type.',
    bodyTypographyBehavior:
      'Short uppercase evidence summaries in irregular groupings — avoids repeating label/headline/body/arrow stacks.',
    monoTypographyBehavior:
      'Evidence IDs and chain-of-custody codes in dense clusters — lines connect IDs to image corners.',
    typeScaleDrama: 'MEDIUM',
    editorialCompositionRule:
      'Alternating dense evidence clusters and open concrete fields — horizontal bands of pins, not vertical card stack.',
    imageArtDirection:
      'Documentary fragments on concrete/photocopy fields — halftone artifacts, annotated corners, isolated objects on paper.',
    imageCroppingBehavior:
      'Irregular masks and torn-edge crops; images may break grid to connect via mapping lines.',
    imageGraphicRelationship:
      'Lines anchor image corners to mono IDs; halftone bleeds under typography where overlap stays readable.',
    colorExpressionSystem:
      'Graphite and concrete grays with cool paper inserts; chartreuse-leaning signal on pins and active links only.',
    materialExpression: 'Concrete surface + photocopy toner + brushed industrial texture on nav-adjacent bands.',
    sectionTransitionLanguage:
      'Mapping lines terminate at band rules; material shifts from concrete to paper when entering entry index.',
    interactionGraphicLanguage:
      'Tappable pins glow with lime ring; lines pulse implied via offset doubles — no generic arrow cards.',
    controlledDisruption:
      'One evidence plate scales 150% and breaks the wall grid, connected by three mapping lines to entry rows.',
    bespokeMoment:
      'Overview hero becomes a case board header — NDXBOOK title on metal plate with pinned photo fragment and case number.',
    creativeDensityPattern:
      'Open concrete top, dense wall mid-scroll, layered evidence + production pins, grounded strip before nav.',
    lowerPageCreativeContinuation:
      'Mapping lines and pin grammar persist through entries and deeper access — CTA as sealed evidence folder tab.',
    bottomNavVisualIntegration:
      'Nav on brushed industrial strip; active item shows pin + lime ring; labels stay uppercase mono-aligned.',
    graphicLanguageStem: 'Mapping lines + pin labels + halftone evidence fields.',
    informationRhythmStem: 'Wall rhythm — cluster, breathe, cluster; horizontal bands dominate.',
    interactionCharacterStem: 'Pin-and-line affordances — tappable evidence plates and linked entry nodes.',
  },
};

function pickArchetypeStem(index: number): ArchetypeStem {
  return ARCHETYPE_STEMS[index % ARCHETYPE_STEMS.length]!;
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
  const stem = pickArchetypeStem(archetypeIndex);
  const art = ART_DIRECTION_BY_SLOT[letter];

  const premise = clip(input.brief.creativePremise || input.injection.creativeThesis);
  const story = clip(input.brief.pageStory || input.injection.pagePurposeInterpretation);
  const move = clip(input.brief.distinctiveMove || input.injection.distinctiveMove || input.injection.informationPriority);
  const surprise = clip(input.brief.pageSurprise || input.injection.pageSurprise || art.controlledDisruption);
  const imagery = clip(input.brief.imageryStrategy || input.injection.imageryStrategy || art.imageArtDirection);
  const hierarchy = clip(input.brief.hierarchyStrategy || input.injection.hierarchyDirection);
  const mobileDir = clip(input.brief.mobileDirection || input.injection.mobileDirection);
  const material = clip(input.brief.materialStrategy || input.injection.materialStrategy || art.materialExpression);

  const territoryId = `wet-${input.functionMapId}-${letter}-${hashSeed([input.brief.briefId, letter, WEB_EXPRESSION_TERRITORY_SET_VERSION]).toString(16)}`;

  const signatureGraphicDevice = art.signatureGraphicDevice;
  const graphicDevice = signatureGraphicDevice;

  return {
    territoryId,
    territorySlot: letter,
    pageId: input.pageId,
    projectId: input.projectId,
    sourceCgptBriefId: input.brief.briefId,
    sourcePageArchitectureId: input.pageArchitectureBriefId,
    sourceFunctionMapId: input.functionMapId,
    name: `${letter} — ${stem.nameStem}`,
    creativePremise: `[${letter}] ${stem.nameStem}: ${premise}`,
    websiteMetaphor: stem.websiteMetaphor,
    graphicLanguage: `${art.graphicLanguageStem} Material follows NDXBOOK skin — not screenshot mimicry.`,
    compositionSystem: stem.compositionSystem,
    informationRhythm: `${art.informationRhythmStem} Hierarchy: ${hierarchy}.`,
    imageRole: imagery || art.imageArtDirection,
    interactionCharacter: art.interactionCharacterStem,
    navigationExpression: `In-page nav expresses ${input.target.targetRouteLabel} — not design workspace tabs.`,
    materialLanguage: material,
    typographicBehavior: clip(input.brief.typographyStrategy || art.typographicConcept),
    motionCharacter: 'Static concept frame — imply motion via offset marks and overlap, not animation chrome.',
    distinctiveMove: `${stem.distinctiveMoveStem} Project move: ${move}.`,
    pageSurprise: surprise,
    lowerPageTreatment: stem.lowerPageTreatment,
    bottomContinuityTreatment:
      'Bottom nav: locked destinations/order/labels — art-directed surface, material, and active graphic only.',
    mobileSpecificBehavior: mobileDir || 'Portrait scroll narrative — full page through bottom nav.',
    graphicDevice,
    imageComposition: art.imageGraphicRelationship,
    typographicComposition: `${art.displayTypographyBehavior} ${art.bodyTypographyBehavior}`,
    editorialRhythm: story,
    creativeTension: stem.creativeTension,
    artDirectionPremise: art.artDirectionPremise,
    signatureGraphicDevice,
    secondaryGraphicDevices: art.secondaryGraphicDevices,
    typographicConcept: art.typographicConcept,
    displayTypographyBehavior: art.displayTypographyBehavior,
    bodyTypographyBehavior: art.bodyTypographyBehavior,
    monoTypographyBehavior: art.monoTypographyBehavior,
    typeScaleDrama: art.typeScaleDrama,
    editorialCompositionRule: art.editorialCompositionRule,
    imageArtDirection: art.imageArtDirection,
    imageCroppingBehavior: art.imageCroppingBehavior,
    imageGraphicRelationship: art.imageGraphicRelationship,
    colorExpressionSystem: art.colorExpressionSystem,
    materialExpression: art.materialExpression,
    sectionTransitionLanguage: art.sectionTransitionLanguage,
    interactionGraphicLanguage: art.interactionGraphicLanguage,
    controlledDisruption: art.controlledDisruption,
    bespokeMoment: art.bespokeMoment,
    creativeDensityPattern: art.creativeDensityPattern,
    lowerPageCreativeContinuation: art.lowerPageCreativeContinuation,
    bottomNavVisualIntegration: art.bottomNavVisualIntegration,
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

  const colorCheck = validateNdxColorExpressionForTerritories(
    territories.map((t) => t.colorExpressionSystem),
  );
  if (!colorCheck.ok) {
    throw new Error(`${colorCheck.errorCode}: color expression outside NDX family`);
  }

  const setId = `wets-${input.functionMapId}-${hashSeed([input.brief.briefId, input.pageArchitectureBriefId, WEB_EXPRESSION_TERRITORY_SET_VERSION]).toString(16)}`;

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

const ART_DIRECTION_REQUIRED_KEYS: (keyof WebExpressionTerritory)[] = [
  'artDirectionPremise',
  'signatureGraphicDevice',
  'typographicConcept',
  'editorialCompositionRule',
  'imageArtDirection',
  'controlledDisruption',
  'bespokeMoment',
  'lowerPageCreativeContinuation',
  'colorExpressionSystem',
];

export function validateWebExpressionTerritoryArtDirectionCompleteness(territory: WebExpressionTerritory): {
  ok: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  for (const key of ART_DIRECTION_REQUIRED_KEYS) {
    const val = territory[key];
    if (typeof val !== 'string' || !val.trim()) missing.push(key);
  }
  if (!territory.secondaryGraphicDevices?.length) missing.push('secondaryGraphicDevices');
  if (!territory.typeScaleDrama) missing.push('typeScaleDrama');
  return { ok: missing.length === 0, missing };
}

export function validateWebExpressionTypeScaleDramaRequirement(set: WebExpressionTerritorySet): {
  ok: boolean;
  errorCode: 'TYPE_DRAMA_REQUIREMENT_FAILED' | null;
} {
  const elevated = set.territories.filter((t) => t.typeScaleDrama === 'MEDIUM' || t.typeScaleDrama === 'HIGH');
  if (elevated.length < 2) return { ok: false, errorCode: 'TYPE_DRAMA_REQUIREMENT_FAILED' };
  return { ok: true, errorCode: null };
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

const DISTANCE_COMPARE_FIELDS: (keyof WebExpressionTerritory)[] = [
  'creativePremise',
  'websiteMetaphor',
  'artDirectionPremise',
  'signatureGraphicDevice',
  'typographicConcept',
  'editorialCompositionRule',
  'imageArtDirection',
  'controlledDisruption',
  'bespokeMoment',
  'distinctiveMove',
  'lowerPageTreatment',
];

function isPaletteOnlyPair(a: WebExpressionTerritory, b: WebExpressionTerritory): boolean {
  const structuralFields: (keyof WebExpressionTerritory)[] = [
    'artDirectionPremise',
    'signatureGraphicDevice',
    'typographicConcept',
    'editorialCompositionRule',
    'imageArtDirection',
    'controlledDisruption',
    'bespokeMoment',
  ];
  let same = 0;
  for (const f of structuralFields) {
    if (normalizeDistinctToken(String(a[f])) === normalizeDistinctToken(String(b[f]))) same++;
  }
  if (same < 5) return false;
  const paletteHints = /light|dark|off-white|black|contrast|palette|theme|white base|gray only/;
  const aPal =
    paletteHints.test(a.colorExpressionSystem) ||
    paletteHints.test(a.materialLanguage) ||
    paletteHints.test(a.materialExpression);
  const bPal =
    paletteHints.test(b.colorExpressionSystem) ||
    paletteHints.test(b.materialLanguage) ||
    paletteHints.test(b.materialExpression);
  return aPal || bPal || same >= 6;
}

function structuralSimilarityScore(x: WebExpressionTerritory, y: WebExpressionTerritory): number {
  let sum = 0;
  let n = 0;
  for (const f of DISTANCE_COMPARE_FIELDS) {
    sum += tokenOverlap(String(x[f]), String(y[f]));
    n++;
  }
  return n ? sum / n : 0;
}

export function validateWebExpressionTerritoryDistance(set: WebExpressionTerritorySet): {
  ok: boolean;
  errorCode:
    | 'TERRITORIES_TOO_SIMILAR'
    | 'DISTINCTIVE_MOVE_COLLISION'
    | 'TERRITORY_VISUAL_IDEA_TOO_WEAK'
    | 'SIGNATURE_DEVICE_COLLISION'
    | null;
  detail: string | null;
} {
  const [a, b, c] = set.territories;
  const pairs: [WebExpressionTerritory, WebExpressionTerritory][] = [
    [a, b],
    [a, c],
    [b, c],
  ];

  const signatures = new Set(set.territories.map((t) => t.signatureGraphicDevice.trim().toLowerCase()));
  if (signatures.size < 3) {
    return { ok: false, errorCode: 'SIGNATURE_DEVICE_COLLISION', detail: 'signatureGraphicDevice' };
  }

  for (const [x, y] of pairs) {
    if (x.distinctiveMove.trim().toLowerCase() === y.distinctiveMove.trim().toLowerCase()) {
      return { ok: false, errorCode: 'DISTINCTIVE_MOVE_COLLISION', detail: `${x.territorySlot}/${y.territorySlot}` };
    }
    if (isPaletteOnlyPair(x, y)) {
      return {
        ok: false,
        errorCode: 'TERRITORY_VISUAL_IDEA_TOO_WEAK',
        detail: `palette-only ${x.territorySlot}/${y.territorySlot}`,
      };
    }
    const score = structuralSimilarityScore(x, y);
    if (score > 0.62) {
      return {
        ok: false,
        errorCode: 'TERRITORIES_TOO_SIMILAR',
        detail: `structural overlap ${x.territorySlot}/${y.territorySlot} ${score.toFixed(2)}`,
      };
    }
    const premiseOverlap = tokenOverlap(x.artDirectionPremise, y.artDirectionPremise);
    const deviceOverlap = tokenOverlap(x.signatureGraphicDevice, y.signatureGraphicDevice);
    if (premiseOverlap > 0.7 && deviceOverlap > 0.65) {
      return {
        ok: false,
        errorCode: 'TERRITORIES_TOO_SIMILAR',
        detail: `art direction ${x.territorySlot}/${y.territorySlot}`,
      };
    }
  }
  return { ok: true, errorCode: null, detail: null };
}

const CARD_STACK_PATTERN =
  /rectangular border|label\s*→\s*headline|card stack|uniform vertical spacing|center-aligned saas|dashboard grid|generic module/i;

export function validateExpressionSterility(territory: WebExpressionTerritory): {
  ok: boolean;
  errorCode: 'EXPRESSION_TOO_SYSTEMIC' | null;
  detail: string | null;
} {
  const completeness = validateWebExpressionTerritoryArtDirectionCompleteness(territory);
  if (!completeness.ok) {
    return { ok: false, errorCode: 'EXPRESSION_TOO_SYSTEMIC', detail: completeness.missing.join(',') };
  }

  const blob = [
    territory.compositionSystem,
    territory.editorialCompositionRule,
    territory.graphicLanguage,
    territory.typographicConcept,
    territory.imageArtDirection,
    territory.controlledDisruption,
    territory.bespokeMoment,
  ]
    .join(' ')
    .toLowerCase();

  const lacksDevices =
    !territory.signatureGraphicDevice.trim() ||
    !territory.controlledDisruption.trim() ||
    !territory.bespokeMoment.trim();

  const cardStackOnly =
    (blob.includes('card stack') || blob.includes('dashboard') || blob.includes('saas')) &&
    lacksDevices;

  const systemicLayout =
    CARD_STACK_PATTERN.test(blob) &&
    !territory.signatureGraphicDevice.trim() &&
    territory.typeScaleDrama === 'LOW';

  if (cardStackOnly || systemicLayout) {
    return { ok: false, errorCode: 'EXPRESSION_TOO_SYSTEMIC', detail: territory.territorySlot };
  }

  if (CARD_STACK_PATTERN.test(territory.compositionSystem) && !territory.controlledDisruption.trim()) {
    return { ok: false, errorCode: 'EXPRESSION_TOO_SYSTEMIC', detail: 'composition-card-default' };
  }

  return { ok: true, errorCode: null, detail: null };
}

/** @deprecated Prefer validateExpressionSterility — maps legacy code for callers. */
export function validateSterileWebExpressionTerritory(territory: WebExpressionTerritory): {
  ok: boolean;
  errorCode: 'STERILE_GENERIC_TERRITORY' | null;
} {
  const result = validateExpressionSterility(territory);
  if (!result.ok) return { ok: false, errorCode: 'STERILE_GENERIC_TERRITORY' };
  return { ok: true, errorCode: null };
}

export function compileWebExpressionTerritoryArtDirectionHandoffBlock(territory: WebExpressionTerritory): string {
  const secondary = territory.secondaryGraphicDevices.slice(0, 3).join('; ');
  return [
    'WEB EXPRESSION TERRITORY (THIS CONCEPT ONLY — SIBLINGS USE DIFFERENT ART DIRECTION):',
    `NAME: ${territory.name}`,
    '',
    'ART DIRECTION:',
    territory.artDirectionPremise,
    '',
    'SIGNATURE GRAPHIC DEVICE:',
    territory.signatureGraphicDevice,
    secondary ? `SUPPORTING DEVICES: ${secondary}` : null,
    '',
    'TYPOGRAPHIC BEHAVIOR:',
    `${territory.typographicConcept} Display: ${territory.displayTypographyBehavior} Body: ${territory.bodyTypographyBehavior} Mono: ${territory.monoTypographyBehavior} Drama: ${territory.typeScaleDrama}.`,
    '',
    'IMAGE SYSTEM:',
    `${territory.imageArtDirection} Crop: ${territory.imageCroppingBehavior} Relationship: ${territory.imageGraphicRelationship}.`,
    '',
    'COMPOSITION:',
    `${territory.editorialCompositionRule} Transitions: ${territory.sectionTransitionLanguage}. Avoid solving every region as bordered card → label → headline → body → arrow.`,
    '',
    'COLOR EXPRESSION:',
    compileNdxColorExpressionHandoffSentence(territory.colorExpressionSystem),
    '',
    'CONTROLLED DISRUPTION:',
    territory.controlledDisruption,
    '',
    'BESPOKE MOMENT:',
    territory.bespokeMoment,
    '',
    'LOWER PAGE / NAV:',
    `${territory.lowerPageCreativeContinuation} Bottom nav integration: ${territory.bottomNavVisualIntegration}`,
    '',
    'PALETTE OR LIGHT/DARK ALONE IS NOT A TERRITORY — grayscale concept must stay distinct.',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

/** GPT2 provider handoff — compact art-direction block (budget-friendly). */
export function compileWebExpressionTerritoryPromptBlock(territory: WebExpressionTerritory): string {
  return compileWebExpressionTerritoryArtDirectionHandoffBlock(territory);
}

export const WEB_EXPRESSION_TERRITORY_HANDOFF_MAX_CHARS = 4200;

export function webExpressionTerritoryHandoffWithinBudget(territory: WebExpressionTerritory): boolean {
  return compileWebExpressionTerritoryArtDirectionHandoffBlock(territory).length <= WEB_EXPRESSION_TERRITORY_HANDOFF_MAX_CHARS;
}

export function formatWebExpressionTerritoryPreviewLines(territory: WebExpressionTerritory): string[] {
  return [
    `${territory.territorySlot} · ${territory.name}`,
    clip(territory.artDirectionPremise, 140),
    `Device: ${clip(territory.signatureGraphicDevice, 100)}`,
    `Bespoke: ${clip(territory.bespokeMoment, 100)}`,
  ];
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
    `ART_DIRECTION: ${territory?.artDirectionPremise ? clip(territory.artDirectionPremise, 80) : '—'}`,
  ];
}
