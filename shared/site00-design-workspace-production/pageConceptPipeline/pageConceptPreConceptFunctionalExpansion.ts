/**
 * P0.VR.FUNCTIONAL-EXPANSION-UPSTREAM-OF-AUTHORITY-CONCEPTS1
 * Functional gap analysis + founder expansion gate before GPT2 mobile concepts.
 */

import type { PageConceptPageArchitectureBrief, PageArchitectureRegion } from './pageConceptPageArchitectureBrief.js';
import { PAGE_ARCHITECTURE_BRIEF_VERSION } from './pageConceptPageArchitectureBrief.js';
import type {
  PageFunctionalExpansionIntelligence,
  ProposedFunctionalExpansion,
} from './pageFunctionalExpansionIntelligence.js';
import {
  approvedExpansionPromptBlock,
  buildPageFunctionalExpansionIntelligence,
  unapprovedExpansionsEnterFalPrompt,
} from './pageFunctionalExpansionIntelligence.js';
import type { ScreenshotFunctionalPageMap } from './pageConceptScreenshotFunctionalPageMap.js';
import { SCREENSHOT_FUNCTIONAL_PAGE_MAP_VERSION } from './pageConceptScreenshotFunctionalPageMap.js';
import type { PageFunctionContract } from './types.js';

export type ExpansionVisibility =
  | 'MUST_BE_VISUALLY_REPRESENTED'
  | 'MAY_BE_RECESSED'
  | 'INTERACTION_ONLY';

export type ExpansionMateriality = 'MINOR' | 'MAJOR';

export type ApprovedFuturePageTruth = {
  truthId: string;
  version: string;
  projectId: string;
  anchorPageId: string;
  existingTruthVersion: string;
  functionalExpansionDecisionVersion: string;
  summaryLines: readonly string[];
  approvedExpansionIds: readonly string[];
  approvedTitles: readonly string[];
  childImpactPageIds: readonly string[];
  grandchildImpactPageIds: readonly string[];
  visibilityByExpansionId: Record<string, ExpansionVisibility>;
  createdAt: string;
};

export type PreConceptFunctionalLineage = {
  existingTruthVersion: string;
  functionalExpansionDecisionVersion: string;
  futurePageTruthVersion: string;
  pageArchitectureVersion: string;
  functionMapVersion: string;
};

export type PostConceptExpansionCandidate = {
  candidateId: string;
  title: string;
  origin: 'CONCEPT_GENERATION' | 'EXPERIENCE_GENERATION';
  materiality: ExpansionMateriality;
  status: 'PROPOSED';
  rationale: string;
  createdAt: string;
};

const DEFAULT_EXPANSION_VISIBILITY: Record<string, ExpansionVisibility> = {
  'pfe-recent-activity': 'MAY_BE_RECESSED',
  'pfe-project-access': 'INTERACTION_ONLY',
};

export function preConceptFunctionalExpansionGateEnabled(input: {
  dryRun?: boolean;
  projectId: string;
}): boolean {
  if (input.dryRun) return false;
  // Vitest integration runs exercise full CGPT→GPT2 pipeline without founder expansion UI;
  // gate behavior is covered in p0vrFunctionalExpansionUpstreamOfAuthorityConcepts1.test.ts.
  if (process.env.VITEST === 'true' && process.env.SITE00_PAGE_CONCEPT_FORCE_PRECONCEPT_EXPANSION_GATE !== '1') {
    return false;
  }
  if (process.env.SITE00_PAGE_CONCEPT_SKIP_PRECONCEPT_EXPANSION_GATE === '1') return false;
  return input.projectId.toLowerCase() === 'ndxbook';
}

export function functionalExpansionGateBlocksGpt2Generation(
  intelligence: PageFunctionalExpansionIntelligence | null | undefined,
): boolean {
  if (!intelligence) return false;
  return intelligence.proposals.some((p) => p.status === 'PROPOSED');
}

export function functionalExpansionDecisionVersion(
  intelligence: PageFunctionalExpansionIntelligence,
): string {
  const sig = intelligence.proposals
    .map((p) => `${p.expansionId}:${p.status}`)
    .sort()
    .join('|');
  let h = 2166136261;
  for (let i = 0; i < sig.length; i++) {
    h ^= sig.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fed-${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export function existingTruthVersion(intelligence: PageFunctionalExpansionIntelligence): string {
  return `ept-${intelligence.intelligenceId}-v1`;
}

export function resolveExpansionVisibility(expansionId: string): ExpansionVisibility {
  return DEFAULT_EXPANSION_VISIBILITY[expansionId] ?? 'MUST_BE_VISUALLY_REPRESENTED';
}

export function buildApprovedFuturePageTruth(
  intelligence: PageFunctionalExpansionIntelligence,
): ApprovedFuturePageTruth {
  const approved = intelligence.proposals.filter((p) => p.status === 'FOUNDER_APPROVED');
  const decisionVersion = functionalExpansionDecisionVersion(intelligence);
  const existingVersion = existingTruthVersion(intelligence);
  const anchorTruth = intelligence.existingPageTruths.find((t) => t.pageId === intelligence.anchorPageId);
  const summaryLines = [
    `CURRENT FUNCTION: ${anchorTruth?.currentPageFunction ?? 'Canonical page function from ExistingPageTruth.'}`,
    ...approved.map((p) => `APPROVED EXPANSION · ${p.title}: ${p.proposedBehavior}`),
  ];
  const childImpact = [...new Set(approved.flatMap((p) => p.affectedChildren))];
  const grandchildImpact = [...new Set(approved.flatMap((p) => p.affectedGrandchildren))];
  const visibilityByExpansionId: Record<string, ExpansionVisibility> = {};
  for (const p of approved) {
    visibilityByExpansionId[p.expansionId] = resolveExpansionVisibility(p.expansionId);
  }
  return {
    truthId: `afpt-${intelligence.projectId}-${intelligence.anchorPageId}`,
    version: `${decisionVersion}-future`,
    projectId: intelligence.projectId,
    anchorPageId: intelligence.anchorPageId,
    existingTruthVersion: existingVersion,
    functionalExpansionDecisionVersion: decisionVersion,
    summaryLines,
    approvedExpansionIds: approved.map((p) => p.expansionId),
    approvedTitles: approved.map((p) => p.title),
    childImpactPageIds: childImpact,
    grandchildImpactPageIds: grandchildImpact,
    visibilityByExpansionId,
    createdAt: new Date().toISOString(),
  };
}

function hashPayload(payload: unknown): string {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function recompilePageArchitectureWithApprovedExpansions(input: {
  brief: PageConceptPageArchitectureBrief;
  intelligence: PageFunctionalExpansionIntelligence | null;
}): PageConceptPageArchitectureBrief {
  const approved =
    input.intelligence?.proposals.filter((p) => p.status === 'FOUNDER_APPROVED') ?? [];
  if (!approved.length) return input.brief;

  const extraRegions: PageArchitectureRegion[] = approved.map((p, i) => ({
    regionId: `REGION_EXP_${i + 1}`,
    title: `APPROVED EXPANSION · ${p.title}`,
    obligations: [
      p.proposedBehavior,
      `Visibility: ${resolveExpansionVisibility(p.expansionId)}`,
      `Family impact — children: ${p.affectedChildren.length}, grandchildren: ${p.affectedGrandchildren.length}`,
      ...p.requiredInteractions.slice(0, 2),
    ],
  }));

  const mobileRegionMap = [...input.brief.mobileRegionMap, ...extraRegions];
  const translatedPagePurpose = [
    ...input.brief.translatedPagePurpose,
    ...approved.map((p) => `Founder-approved future function: ${p.title} — ${p.proposedBehavior}`),
  ];

  const contentHash = hashPayload({ mobileRegionMap, translatedPagePurpose, approvedIds: approved.map((a) => a.expansionId) });

  return {
    ...input.brief,
    version: `${PAGE_ARCHITECTURE_BRIEF_VERSION}+approved-expansions`,
    contentHash,
    mobileRegionMap,
    translatedPagePurpose,
    creativeRegions: [...input.brief.creativeRegions, ...approved.map((p) => p.title)],
  };
}

export function recompileScreenshotFunctionMapWithApprovedExpansions(input: {
  map: ScreenshotFunctionalPageMap;
  intelligence: PageFunctionalExpansionIntelligence | null;
}): ScreenshotFunctionalPageMap {
  const approved =
    input.intelligence?.proposals.filter((p) => p.status === 'FOUNDER_APPROVED') ?? [];
  if (!approved.length) return input.map;

  const expansionRegions = approved.map((p, i) => ({
    regionId: `SFM_EXP_${i + 1}`,
    regionName: p.title,
    sourceCapture: 'MIDDLE_STRUCTURAL_CAPTURE' as const,
    verticalOrder: input.map.regions.length + i + 1,
    hostOrProject: 'PROJECT_OWNED' as const,
    persistentOrLocal: 'LOCAL' as const,
    interactiveOrStatic: 'INTERACTIVE' as const,
    requiredOrOptional: 'REQUIRED' as const,
  }));

  const expansionElements = approved.flatMap((p, pi) =>
    p.requiredInteractions.map((label, ii) => ({
      elementId: `sfm-exp-el-${pi}-${ii}`,
      regionId: `SFM_EXP_${pi + 1}`,
      label,
      elementType: 'BUTTON' as const,
      functionType: p.title,
      interactionType: 'OPEN_DRAWER' as const,
      destinationOrEffect: p.requiredRoutes[0] ?? p.proposedBehavior,
      persistentState: 'LOCAL_PAGE' as const,
      visualOnly: resolveExpansionVisibility(p.expansionId) === 'INTERACTION_ONLY',
      mustPreserveFunction: true,
      mayMove: true,
      mayRestyle: true,
      mayRename: false,
      mayRemove: false,
      confidence: 'HIGH' as const,
      source: 'PAGE_ARCHITECTURE' as const,
    })),
  );

  return {
    ...input.map,
    version: SCREENSHOT_FUNCTIONAL_PAGE_MAP_VERSION,
    mapId: `${input.map.mapId}-exp-${hashPayload(approved.map((a) => a.expansionId))}`,
    regions: [...input.map.regions, ...expansionRegions],
    elements: [...input.map.elements, ...expansionElements],
    functionalInvariants: [
      ...input.map.functionalInvariants,
      'All three GPT2 concepts must include the same founder-approved functional expansion set.',
      ...approved.map((p) => `APPROVED: ${p.title}`),
    ],
  };
}

export function buildApprovedFutureStateGpt2PromptBlock(input: {
  futureTruth: ApprovedFuturePageTruth | null;
  intelligence: PageFunctionalExpansionIntelligence | null;
}): string {
  if (!input.futureTruth || !input.intelligence) return '';
  const approved = input.intelligence.proposals.filter((p) => p.status === 'FOUNDER_APPROVED');
  const futureTruth = input.futureTruth;
  const visibilityLines = approved.map(
    (p) =>
      `- ${p.title}: ${futureTruth.visibilityByExpansionId[p.expansionId] ?? 'MUST_BE_VISUALLY_REPRESENTED'}`,
  );
  return [
    'APPROVED FUTURE-STATE PAGE TRUTH (same functional product for concepts A, B, and C):',
    ...input.futureTruth.summaryLines.map((l) => `- ${l}`),
    '',
    'EXPANSION VISIBILITY (resting page vs interaction-only):',
    ...visibilityLines,
    '',
    'CHILD / GRANDCHILD IMPACT (architecture must support):',
    `- affected children: ${input.futureTruth.childImpactPageIds.length}`,
    `- affected grandchildren: ${input.futureTruth.grandchildImpactPageIds.length}`,
    '',
    approvedExpansionPromptBlock(approved),
    'Do not omit an approved expansion in one concept territory while showing it in another.',
    'Do not treat approved expansions as optional unless founder marked DEFERRED.',
  ].join('\n');
}

export function approvedFunctionalSetForAllMobileConcepts(
  intelligence: PageFunctionalExpansionIntelligence | null,
): readonly string[] {
  if (!intelligence) return [];
  return intelligence.proposals.filter((p) => p.status === 'FOUNDER_APPROVED').map((p) => p.expansionId);
}

export function gpt2PromptContainsUnapprovedExpansionProposals(
  promptText: string,
  intelligence: PageFunctionalExpansionIntelligence | null,
): boolean {
  if (!intelligence) return false;
  return unapprovedExpansionsEnterFalPrompt(promptText, intelligence.proposals);
}

export function buildPreConceptFunctionalLineage(input: {
  intelligence: PageFunctionalExpansionIntelligence;
  futureTruth: ApprovedFuturePageTruth;
  pageArchitectureBrief: PageConceptPageArchitectureBrief;
  screenshotFunctionalPageMap: ScreenshotFunctionalPageMap | null;
}): PreConceptFunctionalLineage {
  return {
    existingTruthVersion: input.futureTruth.existingTruthVersion,
    functionalExpansionDecisionVersion: input.futureTruth.functionalExpansionDecisionVersion,
    futurePageTruthVersion: input.futureTruth.version,
    pageArchitectureVersion: input.pageArchitectureBrief.version,
    functionMapVersion: input.screenshotFunctionalPageMap?.version ?? 'pre-map',
  };
}

export function classifyPostConceptExpansionMateriality(input: {
  affectsAboveFold: boolean;
  affectsPrimaryNavigation: boolean;
  affectsMajorContentRegions: boolean;
}): ExpansionMateriality {
  if (input.affectsAboveFold || input.affectsPrimaryNavigation || input.affectsMajorContentRegions) {
    return 'MAJOR';
  }
  return 'MINOR';
}

export function majorExpansionInvalidatesMobileAuthority(input: {
  candidate: PostConceptExpansionCandidate;
  mobileAuthorityConfirmed: boolean;
}): boolean {
  return input.mobileAuthorityConfirmed && input.candidate.materiality === 'MAJOR';
}

export function createPostConceptExpansionCandidate(input: {
  title: string;
  origin: PostConceptExpansionCandidate['origin'];
  rationale: string;
  materiality?: ExpansionMateriality;
}): PostConceptExpansionCandidate {
  return {
    candidateId: `pce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    origin: input.origin,
    materiality: input.materiality ?? 'MINOR',
    status: 'PROPOSED',
    rationale: input.rationale,
    createdAt: new Date().toISOString(),
  };
}

export function experiencePromptInventsUnapprovedFunction(input: {
  promptText: string;
  intelligence: PageFunctionalExpansionIntelligence | null;
}): boolean {
  if (!input.intelligence) return false;
  const unapproved = input.intelligence.proposals.filter(
    (p) => p.status === 'PROPOSED' || p.status === 'DEFERRED' || p.status === 'FOUNDER_REJECTED',
  );
  for (const p of unapproved) {
    if (p.status !== 'PROPOSED') continue;
    const re = new RegExp(`\\b${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(input.promptText)) return true;
  }
  return false;
}

export function resolvePreConceptFunctionalExpansionIntelligence(input: {
  projectId: string;
  anchorPageId: string;
  functionContract: PageFunctionContract | null;
  existing: PageFunctionalExpansionIntelligence | null | undefined;
}): PageFunctionalExpansionIntelligence | null {
  if (input.existing) return input.existing;
  if (!input.functionContract) return null;
  return buildPageFunctionalExpansionIntelligence({
    projectId: input.projectId,
    anchorPageId: input.anchorPageId,
    functionContract: input.functionContract,
  });
}

export function preparePreConceptGpt2PipelineArtifacts(input: {
  pageArchitectureBrief: PageConceptPageArchitectureBrief;
  intelligence: PageFunctionalExpansionIntelligence;
}): {
  pageArchitectureBrief: PageConceptPageArchitectureBrief;
  approvedFuturePageTruth: ApprovedFuturePageTruth;
} {
  const pageArchitectureBrief = recompilePageArchitectureWithApprovedExpansions({
    brief: input.pageArchitectureBrief,
    intelligence: input.intelligence,
  });
  const approvedFuturePageTruth = buildApprovedFuturePageTruth(input.intelligence);
  return { pageArchitectureBrief, approvedFuturePageTruth };
}

export function approveAllProposedExpansionsForTests(
  intelligence: PageFunctionalExpansionIntelligence,
  decision: 'FOUNDER_APPROVED' | 'FOUNDER_REJECTED' | 'DEFERRED' = 'FOUNDER_APPROVED',
): PageFunctionalExpansionIntelligence {
  const proposals: ProposedFunctionalExpansion[] = intelligence.proposals.map((p) =>
    p.status === 'PROPOSED' ? { ...p, status: decision } : p,
  );
  const pending = proposals.filter((p) => p.status === 'PROPOSED').length;
  return {
    ...intelligence,
    proposals,
    readiness: {
      ...intelligence.readiness,
      expansionProposalsReviewed: pending === 0,
      readyForOpus: pending === 0 && intelligence.readiness.pageTruthResolved,
    },
  };
}
