/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-INTELLIGENCE-DOCK1 — dossier model for selected page concept.
 */

import type { PageConceptCandidate } from '../designProjectBinding/designPageConceptModel.js';
import type { PageMobileConceptSlotId } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptGenerationState } from './types.js';
import {
  buildScreenshotFunctionMapReceipt,
  compileScreenshotFunctionMapZoneSummary,
  inferZoneRole,
  validateScreenshotFunctionMapForGpt2Dispatch,
  type ScreenshotFunctionalPageMap,
} from './pageConceptScreenshotFunctionalPageMap.js';
import {
  compileNdxBrandFamiliarityBrief,
  ndxBrandFamiliarityApplies,
} from './pageConceptNdxBrandFamiliarityBrief.js';
import {
  webExpressionTerritoryForSlot,
  type WebExpressionTerritory,
} from './pageConceptWebExpressionTerritories.js';
import type { Gpt2ViewportFamilyHeroRailStage } from './designGpt2ViewportFamilyAuthorityRail.js';

export const CONCEPT_INTELLIGENCE_DOCK_TABS = [
  'CONCEPT',
  'EXPRESSION',
  'FUNCTION',
  'LINEAGE',
  'HISTORY',
  'HANDOFF',
] as const;

export type ConceptIntelligenceDockTab = (typeof CONCEPT_INTELLIGENCE_DOCK_TABS)[number];

export type ConceptIntelligenceDockConceptStatus =
  | 'CANDIDATE'
  | 'SELECTED'
  | 'MOBILE AUTHORITY'
  | 'APPROVED'
  | 'SUPERSEDED';

export type ConceptIntelligenceDockStateChip = {
  id: string;
  label: string;
  value: string;
  tone: 'ok' | 'pending' | 'neutral';
};

export type ConceptIntelligenceDockLineageNode = {
  id: string;
  label: string;
  present: boolean;
  version: string | null;
  shortId: string | null;
  fullId: string | null;
  status: string;
};

export type ConceptIntelligenceDockHistoryEvent = {
  id: string;
  whenLabel: string;
  action: string;
  artifact: string;
  stateChange: string;
};

export type ConceptIntelligenceDockHandoffStep = {
  id: string;
  label: string;
  complete: boolean;
};

export type ConceptIntelligenceDockExpressionRow = {
  label: string;
  value: string;
};

export type ConceptIntelligenceDockModel = {
  tabs: typeof CONCEPT_INTELLIGENCE_DOCK_TABS;
  emptyMessage: string | null;
  concept: {
    conceptLetter: 'A' | 'B' | 'C' | '—';
    viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
    territoryName: string;
    targetRoute: string;
    status: ConceptIntelligenceDockConceptStatus;
    runId: string | null;
    runIdShort: string | null;
    generatedAt: string | null;
    artifactVersion: string;
    previewSrc: string | null;
    headerThumbnailCrop: { topFraction: number; heightFraction: number; scale?: number } | null;
    previewStatus: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';
    creativePremise: string;
    distinctiveMove: string;
    bespokeMoment: string;
    stateStrip: readonly ConceptIntelligenceDockStateChip[];
  };
  expression: {
    territoryName: string;
    rows: readonly ConceptIntelligenceDockExpressionRow[];
    ndxBrandFamiliarity: 'PRESENT' | 'N/A';
  };
  function: {
    targetRoute: string;
    pageRegions: readonly string[];
    interactionsPreserved: string;
    bottomNav: string;
    hostOwnership: 'PASS' | 'FAIL' | 'PENDING';
    functionalValidation: 'PASS' | 'FAIL' | 'PENDING';
  };
  lineage: {
    chain: readonly ConceptIntelligenceDockLineageNode[];
    sourceStatus: readonly { label: string; value: string }[];
  };
  history: {
    runs: readonly { runLabel: string; slots: string }[];
    events: readonly ConceptIntelligenceDockHistoryEvent[];
  };
  handoff: {
    nextAction: string;
    pipeline: readonly ConceptIntelligenceDockHandoffStep[];
  };
};

export type DesignConceptIntelligenceDockCandidateSlice = {
  id: string;
  slotLabel?: string | null;
  version: string;
  previewSrc?: string | null;
  headerThumbnailUri?: string | null;
  headerThumbnailCrop?: { topFraction: number; heightFraction: number; scale?: number };
  runId?: string | null;
  runLabel?: string | null;
  createdAtLabel?: string | null;
  territoryLabel?: string;
  artifactStatus?: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';
  runGroup?: 'CURRENT' | 'HISTORY';
  selectedMobileAuthority?: boolean;
};

export type DesignConceptIntelligenceDockInput = {
  projectId: string;
  pageId: string;
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  targetRouteLabel: string;
  selectedCandidate: DesignConceptIntelligenceDockCandidateSlice | null;
  inspectedConcept: PageConceptCandidate | null;
  selectedMobileConceptId: string | null;
  generationState: PageConceptGenerationState | null;
  currentRunId: string | null;
  galleryCurrent: readonly DesignConceptIntelligenceDockCandidateSlice[];
  galleryHistory: readonly DesignConceptIntelligenceDockCandidateSlice[];
  viewportFamilyHeroRailStages: readonly Gpt2ViewportFamilyHeroRailStage[];
  productionHistory: readonly { id: string; type: string; summary: string; at?: string }[];
};

function truncateLine(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

function slotLetterFromCandidate(
  candidate: DesignConceptIntelligenceDockCandidateSlice | null,
  concept: PageConceptCandidate | null,
): 'A' | 'B' | 'C' | '—' {
  const label = candidate?.slotLabel ?? null;
  if (label === 'A' || label === 'B' || label === 'C') return label;
  if (concept?.conceptSlot === 'MOBILE_CONCEPT_A') return 'A';
  if (concept?.conceptSlot === 'MOBILE_CONCEPT_B') return 'B';
  if (concept?.conceptSlot === 'MOBILE_CONCEPT_C') return 'C';
  if (concept?.renditionSlot === 'RENDITION_A') return 'A';
  if (concept?.renditionSlot === 'RENDITION_B') return 'B';
  if (concept?.renditionSlot === 'RENDITION_C') return 'C';
  return '—';
}

function mobileSlotId(letter: 'A' | 'B' | 'C'): PageMobileConceptSlotId {
  if (letter === 'A') return 'MOBILE_CONCEPT_A';
  if (letter === 'B') return 'MOBILE_CONCEPT_B';
  return 'MOBILE_CONCEPT_C';
}

function resolveTerritory(
  generationState: PageConceptGenerationState | null,
  letter: 'A' | 'B' | 'C' | '—',
): WebExpressionTerritory | null {
  const set = generationState?.pipelineSet?.webExpressionTerritorySet ?? null;
  if (!set || letter === '—') return null;
  try {
    return webExpressionTerritoryForSlot(set, mobileSlotId(letter));
  } catch {
    return null;
  }
}

function resolveFunctionMap(generationState: PageConceptGenerationState | null): ScreenshotFunctionalPageMap | null {
  return generationState?.pipelineSet?.screenshotFunctionalPageMap ?? null;
}

function displayZoneRole(role: ReturnType<typeof inferZoneRole>): string {
  switch (role) {
    case 'PAGE_IDENTITY':
      return 'PAGE IDENTITY';
    case 'STATUS_PHASE':
      return 'PROJECT STATUS';
    case 'VIEW_TOGGLE':
      return 'VIEW MODE';
    case 'ENTRY_INDEX':
      return 'ENTRY INDEX';
    case 'CURRENT_WORK':
      return 'CURRENT WORK';
    case 'LOWER_CTA_ACCESS':
      return 'LOWER CONTINUITY';
    case 'BOTTOM_NAVIGATION':
      return 'BOTTOM NAV';
    case 'TOP_ROUTE_BREADCRUMB':
      return 'ROUTE CONTEXT';
    case 'PROJECT_TITLE':
      return 'PROJECT TITLE';
    default:
      return 'CONTENT';
  }
}

function functionPageRegions(map: ScreenshotFunctionalPageMap | null): readonly string[] {
  if (!map) {
    return [
      'PAGE IDENTITY',
      'PROJECT STATUS',
      'VIEW MODE',
      'ENTRY INDEX',
      'CURRENT WORK',
      'LOWER CONTINUITY',
      'BOTTOM NAV',
    ];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of [...map.regions].sort((a, b) => a.verticalOrder - b.verticalOrder)) {
    const label = displayZoneRole(inferZoneRole(r.regionName));
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(label);
  }
  return out.length ? out : ['PAGE IDENTITY'];
}

function resolveConceptStatus(input: DesignConceptIntelligenceDockInput): ConceptIntelligenceDockConceptStatus {
  const c = input.selectedCandidate;
  if (c?.runGroup === 'HISTORY') return 'SUPERSEDED';
  const family = input.generationState?.pipelineSet?.viewportAuthorityFamily ?? null;
  if (family?.status === 'APPROVED' || family?.status === 'LOCKED') {
    if (input.selectedMobileConceptId && c?.id === input.selectedMobileConceptId) return 'APPROVED';
  }
  if (input.selectedMobileConceptId && c?.id === input.selectedMobileConceptId) return 'MOBILE AUTHORITY';
  if (c?.selectedMobileAuthority) return 'MOBILE AUTHORITY';
  if (c?.id) return 'SELECTED';
  return 'CANDIDATE';
}

function shortId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function formatHistoryWhen(iso: string | null | undefined, fallback: string | null): string {
  if (iso) {
    try {
      const d = new Date(iso);
      return d
        .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        .toUpperCase()
        .replace(',', ' ·');
    } catch {
      /* fall through */
    }
  }
  return fallback ?? '—';
}

function buildHistory(input: DesignConceptIntelligenceDockInput): ConceptIntelligenceDockModel['history'] {
  const runMap = new Map<string, Set<string>>();
  const all = [...input.galleryCurrent, ...input.galleryHistory];
  for (const c of all) {
    const run = c.runLabel ?? c.runId ?? 'RUN';
    const slot = c.slotLabel ?? '?';
    const set = runMap.get(run) ?? new Set<string>();
    set.add(slot);
    runMap.set(run, set);
  }
  const runs = [...runMap.entries()].map(([runLabel, slots], index) => ({
    runLabel: runLabel.startsWith('RUN') ? runLabel : `RUN ${String(index + 1).padStart(2, '0')}`,
    slots: [...slots].sort().join(' / '),
  }));

  const events: ConceptIntelligenceDockHistoryEvent[] = [];
  for (const entry of input.generationState?.history ?? []) {
    events.push({
      id: `gen-${entry.at}-${entry.type}`,
      whenLabel: formatHistoryWhen(entry.at, null),
      action: entry.type.replace(/_/g, ' ').toUpperCase(),
      artifact: '—',
      stateChange: truncateLine(entry.summary, 80),
    });
  }
  for (const entry of input.productionHistory.slice(-8)) {
    events.push({
      id: entry.id,
      whenLabel: formatHistoryWhen(entry.at ?? null, null),
      action: entry.type.replace(/_/g, ' ').toUpperCase(),
      artifact: 'WORKSPACE',
      stateChange: truncateLine(entry.summary, 80),
    });
  }
  if (input.selectedCandidate?.version) {
    events.unshift({
      id: 'current-selection',
      whenLabel: 'CURRENT',
      action: 'INSPECTING CONCEPT',
      artifact: input.selectedCandidate.version,
      stateChange: resolveConceptStatus(input),
    });
  }

  return { runs, events: events.slice(0, 12) };
}

function handoffFromHeroRail(
  stages: readonly Gpt2ViewportFamilyHeroRailStage[],
  generationState: PageConceptGenerationState | null,
): { nextAction: string; pipeline: ConceptIntelligenceDockHandoffStep[] } {
  const byId = new Map(stages.map((s) => [s.id, s]));
  const mobile = byId.get('mobile-authority');
  const experience = byId.get('experience');
  const tablet = byId.get('tablet');
  const desktop = byId.get('desktop');
  const family = byId.get('viewport-family');
  const twinReady = Boolean(generationState?.pipelineSet?.twinImplementationPackage);
  const liveReady = Boolean(generationState?.pipelineSet?.liveRouteHashAfter);

  const complete = (stage: Gpt2ViewportFamilyHeroRailStage | undefined) => {
    if (!stage) return false;
    return (
      stage.statusTone === 'approved' ||
      stage.statusTone === 'locked' ||
      stage.statusTone === 'active' ||
      stage.statusLabel === 'SELECTED'
    );
  };

  const pipeline: ConceptIntelligenceDockHandoffStep[] = [
    { id: 'mobile', label: 'MOBILE', complete: complete(mobile) },
    { id: 'experience', label: 'EXPERIENCE', complete: complete(experience) },
    { id: 'tablet', label: 'TABLET', complete: complete(tablet) },
    { id: 'desktop', label: 'DESKTOP', complete: complete(desktop) },
    { id: 'family', label: 'FAMILY', complete: complete(family) },
    { id: 'twin', label: 'TWIN', complete: twinReady },
    { id: 'live', label: 'LIVE', complete: liveReady },
  ];

  let nextAction = 'GENERATE PAGE CONCEPTS';
  if (!complete(mobile)) nextAction = 'SELECT MOBILE AUTHORITY';
  else if (!complete(experience)) nextAction = 'REVIEW EXPERIENCE EXPRESSION';
  else if (!complete(tablet)) nextAction = 'GENERATE TABLET';
  else if (!complete(desktop)) nextAction = 'GENERATE DESKTOP';
  else if (!complete(family)) nextAction = 'REVIEW VIEWPORT FAMILY';
  else if (!twinReady) nextAction = 'CREATE TWIN';
  else if (!liveReady) nextAction = 'PROMOTE LIVE';
  else nextAction = 'REVIEW TWIN';

  return { nextAction, pipeline };
}

export function buildDesignConceptIntelligenceDockModel(
  input: DesignConceptIntelligenceDockInput,
): ConceptIntelligenceDockModel {
  const pipelineSet = input.generationState?.pipelineSet ?? null;
  const letter = slotLetterFromCandidate(input.selectedCandidate, input.inspectedConcept);
  const territory = resolveTerritory(input.generationState, letter);
  const functionMap = resolveFunctionMap(input.generationState);
  const arch = pipelineSet?.pageArchitectureBrief ?? null;
  const cgpt = pipelineSet?.cgptCreativeBrief ?? null;
  const targetRoute =
    arch?.targetRouteContract?.targetRouteLabel?.toUpperCase() ?? input.targetRouteLabel.toUpperCase();

  const ndxBrief =
    ndxBrandFamiliarityApplies(input.projectId) && arch?.targetRouteContract && functionMap ?
      compileNdxBrandFamiliarityBrief({
        projectId: input.projectId,
        pageId: input.pageId,
        target: arch.targetRouteContract,
        pageArchitectureBrief: arch,
        screenshotFunctionalPageMap: functionMap,
      })
    : null;

  const previewSrc =
    input.selectedCandidate?.previewSrc ??
    input.selectedCandidate?.headerThumbnailUri ??
    null;

  const premise =
    territory?.creativePremise ??
    cgpt?.creativePremise ??
    input.inspectedConcept?.creativeRationale ??
    '—';
  const distinctive =
    territory?.distinctiveMove ?? cgpt?.distinctiveMove ?? input.inspectedConcept?.conceptTerritory ?? '—';
  const bespoke = territory?.bespokeMoment ?? cgpt?.pageSurprise ?? '—';

  const family = pipelineSet?.viewportAuthorityFamily ?? null;
  const familyStatus = family?.status ?? null;

  const stateStrip: ConceptIntelligenceDockStateChip[] = [
    {
      id: 'function',
      label: 'FUNCTION',
      value: functionMap ? '✓ LOCKED' : 'PENDING',
      tone: functionMap ? 'ok' : 'pending',
    },
    {
      id: 'expression',
      label: 'EXPRESSION',
      value: territory ? '✓ ACTIVE' : 'PENDING',
      tone: territory ? 'ok' : 'pending',
    },
    {
      id: 'mobile-authority',
      label: 'MOBILE AUTHORITY',
      value:
        input.selectedMobileConceptId && input.selectedCandidate?.id === input.selectedMobileConceptId ?
          'SELECTED'
        : input.selectedMobileConceptId ?
          'OTHER SELECTED'
        : 'PENDING',
      tone:
        input.selectedMobileConceptId && input.selectedCandidate?.id === input.selectedMobileConceptId ?
          'ok'
        : 'pending',
    },
    {
      id: 'viewport-family',
      label: 'VIEWPORT FAMILY',
      value:
        familyStatus === 'LOCKED' ? 'LOCKED'
        : familyStatus === 'APPROVED' ? 'READY'
        : 'PENDING',
      tone: familyStatus === 'APPROVED' || familyStatus === 'LOCKED' ? 'ok' : 'pending',
    },
    {
      id: 'twin',
      label: 'TWIN',
      value:
        pipelineSet?.twinImplementationPackage ? 'READY'
        : familyStatus === 'LOCKED' ? 'ACTIVE'
        : 'NOT STARTED',
      tone: pipelineSet?.twinImplementationPackage ? 'ok' : 'neutral',
    },
  ];

  const dispatchGuard = functionMap ? validateScreenshotFunctionMapForGpt2Dispatch(functionMap) : null;
  const receipt =
    functionMap && dispatchGuard ?
      buildScreenshotFunctionMapReceipt(functionMap, dispatchGuard)
    : null;
  const interactiveTotal = functionMap?.elements.length ?? 0;
  const interactivePreserved =
    functionMap?.elements.filter((e) => e.mustPreserveFunction && !e.visualOnly).length ?? 0;

  const expressionRows: ConceptIntelligenceDockExpressionRow[] = territory ?
    [
      { label: 'ART DIRECTION', value: truncateLine(territory.artDirectionPremise, 120) },
      { label: 'SIGNATURE GRAPHIC DEVICE', value: truncateLine(territory.signatureGraphicDevice, 100) },
      { label: 'TYPOGRAPHIC CONCEPT', value: truncateLine(territory.typographicConcept, 100) },
      { label: 'IMAGE ART DIRECTION', value: truncateLine(territory.imageArtDirection, 100) },
      { label: 'COMPOSITION RULE', value: truncateLine(territory.editorialCompositionRule, 100) },
      { label: 'COLOR EXPRESSION', value: truncateLine(territory.colorExpressionSystem, 100) },
      { label: 'CONTROLLED DISRUPTION', value: truncateLine(territory.controlledDisruption, 100) },
      { label: 'BESPOKE MOMENT', value: truncateLine(territory.bespokeMoment, 100) },
    ]
  : [
      {
        label: 'ART DIRECTION',
        value: cgpt ? truncateLine(cgpt.compositionStrategy, 120) : 'PENDING TERRITORY COMPILE',
      },
    ];

  const lineageChain: ConceptIntelligenceDockLineageNode[] = [
    {
      id: 'cgpt',
      label: 'CGPT',
      present: Boolean(cgpt),
      version: cgpt?.version ?? null,
      shortId: shortId(cgpt?.briefId),
      fullId: cgpt?.briefId ?? null,
      status: cgpt ? 'COMPLETE' : 'PENDING',
    },
    {
      id: 'architecture',
      label: 'PAGE ARCHITECTURE',
      present: Boolean(arch),
      version: arch?.version ?? null,
      shortId: shortId(arch?.briefId),
      fullId: arch?.briefId ?? null,
      status: arch ? 'COMPLETE' : 'PENDING',
    },
    {
      id: 'function-map',
      label: 'SCREENSHOT FUNCTION MAP',
      present: Boolean(functionMap),
      version: functionMap?.version ?? null,
      shortId: shortId(functionMap?.mapId),
      fullId: functionMap?.mapId ?? null,
      status: functionMap ? 'COMPLETE' : 'PENDING',
    },
    {
      id: 'brand',
      label: 'NDX BRAND FAMILIARITY',
      present: Boolean(ndxBrief),
      version: ndxBrief?.version ?? null,
      shortId: shortId(ndxBrief?.briefId),
      fullId: ndxBrief?.briefId ?? null,
      status: ndxBrief ? 'COMPLETE' : ndxBrandFamiliarityApplies(input.projectId) ? 'PENDING' : 'N/A',
    },
    {
      id: 'territory',
      label: 'WEB EXPRESSION TERRITORY',
      present: Boolean(territory),
      version: pipelineSet?.webExpressionTerritorySet?.version ?? null,
      shortId: shortId(territory?.territoryId),
      fullId: territory?.territoryId ?? null,
      status: territory ? 'COMPLETE' : 'PENDING',
    },
    {
      id: 'gpt2',
      label: 'GPT2 CONCEPT',
      present: Boolean(input.inspectedConcept?.artifactId ?? input.selectedCandidate?.previewSrc),
      version: input.selectedCandidate?.version ?? null,
      shortId: shortId(input.inspectedConcept?.artifactId ?? input.selectedCandidate?.id),
      fullId: input.inspectedConcept?.artifactId ?? input.selectedCandidate?.id ?? null,
      status: input.selectedCandidate?.artifactStatus ?? 'PENDING',
    },
    {
      id: 'founder',
      label: 'FOUNDER SELECTION',
      present: Boolean(input.selectedCandidate?.id),
      version: null,
      shortId: letter !== '—' ? `CONCEPT ${letter}` : null,
      fullId: input.selectedCandidate?.id ?? null,
      status: resolveConceptStatus(input),
    },
  ];

  const handoff = handoffFromHeroRail(input.viewportFamilyHeroRailStages, input.generationState);

  return {
    tabs: CONCEPT_INTELLIGENCE_DOCK_TABS,
    emptyMessage: input.selectedCandidate ? null : 'SELECT A PAGE CONCEPT IN THE GALLERY',
    concept: {
      conceptLetter: letter,
      viewport: input.viewport,
      territoryName: (territory?.name ?? input.selectedCandidate?.territoryLabel ?? '—').toUpperCase(),
      targetRoute,
      status: resolveConceptStatus(input),
      runId: input.selectedCandidate?.runId ?? input.currentRunId,
      runIdShort: shortId(input.selectedCandidate?.runId ?? input.currentRunId),
      generatedAt: input.selectedCandidate?.createdAtLabel ?? null,
      artifactVersion: input.selectedCandidate?.version ?? '—',
      previewSrc,
      headerThumbnailCrop: input.selectedCandidate?.headerThumbnailCrop ?? null,
      previewStatus:
        input.selectedCandidate?.artifactStatus === 'FAILED' ? 'FAILED'
        : input.selectedCandidate?.artifactStatus === 'RUNNING' ? 'RUNNING'
        : previewSrc ? 'READY'
        : 'PENDING',
      creativePremise: truncateLine(premise, 140),
      distinctiveMove: truncateLine(distinctive, 90),
      bespokeMoment: truncateLine(bespoke, 90),
      stateStrip,
    },
    expression: {
      territoryName: (territory?.name ?? '—').toUpperCase(),
      rows: expressionRows,
      ndxBrandFamiliarity: ndxBrief ? 'PRESENT' : 'N/A',
    },
    function: {
      targetRoute,
      pageRegions: functionPageRegions(functionMap),
      interactionsPreserved: functionMap ? `${interactivePreserved} / ${interactiveTotal}` : '— / —',
      bottomNav: functionMap ? 'LOCKED TO SOURCE' : 'PENDING',
      hostOwnership: receipt?.hostProjectOwnership ?? 'PENDING',
      functionalValidation: receipt?.screenshotFunctionMap ?? 'PENDING',
    },
    lineage: {
      chain: lineageChain,
      sourceStatus: [
        { label: 'CGPT BRIEF', value: cgpt ? 'COMPLETE' : 'PENDING' },
        { label: 'PAGE ARCHITECTURE', value: arch ? 'COMPLETE' : 'PENDING' },
        { label: 'FUNCTION MAP', value: functionMap ? 'COMPLETE' : 'PENDING' },
        { label: 'BRAND FAMILIARITY', value: ndxBrief ? 'COMPLETE' : ndxBrandFamiliarityApplies(input.projectId) ? 'PENDING' : 'N/A' },
        { label: 'TERRITORY', value: territory ? 'COMPLETE' : 'PENDING' },
        { label: 'PROVIDER PROMPT', value: territory && functionMap ? 'COMPILED' : 'PENDING' },
        { label: 'ARTIFACT', value: previewSrc ? 'READY' : 'PENDING' },
      ],
    },
    history: buildHistory(input),
    handoff,
  };
}

/** Static guard — legacy default metadata must not appear in dock model strings. */
export function conceptIntelligenceDockLegacyMetadataAbsent(model: ConceptIntelligenceDockModel): boolean {
  const blob = JSON.stringify(model);
  return (
    !blob.includes('ENTRY001_V1.3') &&
    !blob.includes('ENTRY001-CAMPAIGN-ARCHIVE') &&
    !blob.includes('THE SIGNAL IS THE INDEX') &&
    !blob.includes('DESIGN SYSTEM')
  );
}

export function conceptIntelligenceDockFunctionMapBound(model: ConceptIntelligenceDockModel): boolean {
  return model.function.functionalValidation !== 'PENDING' || model.function.pageRegions.length > 0;
}

export function conceptIntelligenceDockHandoffMatchesRail(
  model: ConceptIntelligenceDockModel,
  stages: readonly Gpt2ViewportFamilyHeroRailStage[],
): boolean {
  const railComplete = (id: string) => {
    const s = stages.find((x) => x.id === id);
    if (!s) return false;
    return s.statusTone === 'approved' || s.statusTone === 'locked' || s.statusTone === 'active';
  };
  const mobile = model.handoff.pipeline.find((p) => p.id === 'mobile');
  const experience = model.handoff.pipeline.find((p) => p.id === 'experience');
  const tablet = model.handoff.pipeline.find((p) => p.id === 'tablet');
  const desktop = model.handoff.pipeline.find((p) => p.id === 'desktop');
  const family = model.handoff.pipeline.find((p) => p.id === 'family');
  return (
    Boolean(mobile?.complete) === railComplete('mobile-authority') &&
    Boolean(experience?.complete) === railComplete('experience') &&
    Boolean(tablet?.complete) === railComplete('tablet') &&
    Boolean(desktop?.complete) === railComplete('desktop') &&
    Boolean(family?.complete) === railComplete('viewport-family')
  );
}

export function screenshotFunctionMapZoneSummaryForDock(map: ScreenshotFunctionalPageMap): string {
  return compileScreenshotFunctionMapZoneSummary(map);
}
