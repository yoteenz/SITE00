/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-FOUNDER-REVIEW-UX-REFINEMENT1
 * Founder-facing presentation only — maps persisted pipeline state to copy, rails, and CTAs.
 */

import type { PageConceptStageState } from '../designPageConceptGeneratorShell.js';
import { pageConceptCanonicalGpt2MobileActive } from './pageConceptGeneratorBinding.js';
import type { PageConceptCgptCreativeBrief, PageConceptGenerationState } from './types.js';

export const PAGE_CONCEPT_LEGACY_FOUNDER_TERMS = [
  'NBP RENDITIONS',
  '6 VIEWPORT OUTPUTS',
  'AUTHORITY PAIR',
  'PAIR REVIEW',
  'BLUEPRINT',
  'RENDER SET',
  'VIEW RENDITIONS',
  'LEGACY NBP',
] as const;

export type FounderSummaryMetric = {
  id: string;
  role: string;
  count: string;
  stateLabel: string;
  state: PageConceptStageState;
};

export type FounderJourneyRailStep = {
  id: 'CREATIVE' | 'CONCEPT' | 'AUTHORITY' | 'TWIN' | 'PROMOTE';
  step: number;
  groupTitle: string;
  groupNote: string;
  state: PageConceptStageState;
  blockedReason?: string | null;
};

export type CgptBriefDigestField = {
  id: string;
  label: string;
  excerpt: string;
};

export type FounderErrorPresentation = {
  headline: string;
  hint: string | null;
  technicalCode: string | null;
  retryable: boolean;
};

export type FounderFooterPhase =
  | 'CGPT_REVIEW'
  | 'MOBILE_REVIEW'
  | 'MOBILE_SELECTED'
  | 'EXPERIENCE_REVIEW'
  | 'VIEWPORT_FAMILY'
  | 'PAGE_FAMILY'
  | 'READY_FOR_TWIN'
  | 'TWIN_REVIEW'
  | 'LIVE_PROMOTION'
  | 'GENERATING'
  | 'POST_RUN'
  | 'IDLE';

function excerpt(text: string, max = 140): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function buildCgptBriefDigest(brief: PageConceptCgptCreativeBrief): readonly CgptBriefDigestField[] {
  const visualTerritory = [brief.colorStrategy, brief.materialStrategy, brief.imageryStrategy]
    .filter(Boolean)
    .join(' · ');
  return [
    { id: 'premise', label: 'CREATIVE PREMISE', excerpt: excerpt(brief.creativePremise, 120) },
    { id: 'visual-territory', label: 'VISUAL TERRITORY', excerpt: excerpt(visualTerritory || brief.compositionStrategy, 80) },
    { id: 'distinctive-move', label: 'DISTINCTIVE MOVE', excerpt: excerpt(brief.distinctiveMove, 80) },
  ].filter((f) => f.excerpt.length > 0);
}

export function containsLegacyFounderTerminology(text: string): boolean {
  const upper = text.toUpperCase();
  return PAGE_CONCEPT_LEGACY_FOUNDER_TERMS.some((term) => upper.includes(term));
}

const ERROR_MAP: Record<string, Omit<FounderErrorPresentation, 'technicalCode'>> = {
  RUN_NOT_FOUND: {
    headline: 'GENERATION RUN COULD NOT BE RESTORED',
    hint: 'RETRY RECOVERY OR START A NEW GENERATION BRANCH',
    retryable: true,
  },
};

export function buildFounderErrorPresentation(notice: string): FounderErrorPresentation {
  const raw = notice.trim();
  const codeMatch = /^([A-Z0-9_]+)(?:\s|$|·)/.exec(raw);
  const code = raw === 'RUN_NOT_FOUND' || raw.includes('RUN_NOT_FOUND') ? 'RUN_NOT_FOUND' : codeMatch?.[1] ?? null;
  const mapped = code ? ERROR_MAP[code] : undefined;
  if (mapped) {
    return { ...mapped, technicalCode: code };
  }
  if (raw.length <= 64 && /^[A-Z0-9_]+$/.test(raw)) {
    return {
      headline: raw.replace(/_/g, ' '),
      hint: 'VIEW TECHNICAL DETAILS FOR MORE CONTEXT',
      technicalCode: raw,
      retryable: true,
    };
  }
  return {
    headline: raw.split('. ')[0]?.toUpperCase() ?? raw.toUpperCase(),
    hint: raw.includes('. ') ? raw.slice(raw.indexOf('. ') + 2).toUpperCase() : null,
    technicalCode: code,
    retryable: true,
  };
}

export function resolveFounderFooterPhase(state: PageConceptGenerationState): FounderFooterPhase {
  const status = state.generationStatus;
  if (status === 'CGPT_AWAITING_FOUNDER_REVIEW') return 'CGPT_REVIEW';
  if (status === 'GPT2_MOBILE_AWAITING_SELECTION') return 'MOBILE_REVIEW';
  if (status === 'VIEWPORT_FAMILY_REVIEW') {
    const family = state.pipelineSet?.viewportAuthorityFamily;
    const experience = state.pipelineSet?.experienceExpressionContract;
    if (family?.selectedMobileConceptId && !experience?.approvedAt) return 'EXPERIENCE_REVIEW';
    return 'VIEWPORT_FAMILY';
  }
  if (status === 'PAGE_FAMILY_CONTRACT_REVIEW') return 'PAGE_FAMILY';
  if (status === 'VIEWPORT_FAMILY_LOCKED' || status === 'TWIN_IMPLEMENTATION_PACKAGE_READY') return 'READY_FOR_TWIN';
  if (status === 'TWIN_READY_FOR_REVIEW') return 'TWIN_REVIEW';
  if (status === 'READY_FOR_FOUNDER_REVIEW' || status === 'PARTIAL_GENERATION') return 'POST_RUN';
  if (
    status === 'CGPT_RUNNING' ||
    status === 'GPT2_RUNNING' ||
    status === 'NBP_RUNNING' ||
    status === 'VIEWPORT_TABLET_RUNNING' ||
    status === 'VIEWPORT_DESKTOP_RUNNING'
  ) {
    return 'GENERATING';
  }
  return 'IDLE';
}

export function buildFounderSummaryMetrics(state: PageConceptGenerationState): readonly FounderSummaryMetric[] {
  const canonical = pageConceptCanonicalGpt2MobileActive(state);
  const status = state.generationStatus;
  const injection = Boolean(state.pipelineSet?.creativeInjection);
  const mobileConcepts = state.pipelineSet?.mobileConcepts ?? [];
  const mobileReady = mobileConcepts.filter((c) => c.status === 'READY').length;
  const family = state.pipelineSet?.viewportAuthorityFamily;
  const twinPkg = state.pipelineSet?.twinImplementationPackage;

  let cgptState: PageConceptStageState = 'PENDING';
  if (status === 'CGPT_RUNNING' || status === 'CGPT_RATE_LIMITED') cgptState = 'ACTIVE';
  else if (injection) cgptState = 'COMPLETE';
  else if (status === 'FAILED' && !injection) cgptState = 'FAILED';

  let gpt2State: PageConceptStageState = 'PENDING';
  if (status === 'GPT2_RUNNING') gpt2State = 'ACTIVE';
  else if (mobileReady >= 3 || status === 'GPT2_MOBILE_AWAITING_SELECTION') gpt2State = 'COMPLETE';
  else if (mobileReady > 0) gpt2State = 'PARTIAL';
  else if (injection && status !== 'CGPT_RUNNING') gpt2State = 'PENDING';

  let viewportState: PageConceptStageState = 'PENDING';
  if (family?.tabletArtifactId && family.desktopArtifactId) viewportState = 'COMPLETE';
  else if (status === 'VIEWPORT_TABLET_RUNNING' || status === 'VIEWPORT_DESKTOP_RUNNING') viewportState = 'ACTIVE';
  else if (family?.selectedMobileConceptId) viewportState = 'PENDING';

  let twinState: PageConceptStageState = 'PENDING';
  if (twinPkg) twinState = 'READY';
  else if (status === 'TWIN_READY_FOR_REVIEW') twinState = 'COMPLETE';
  else if (status === 'TWIN_IMPLEMENTATION_PACKAGE_READY' || status === 'VIEWPORT_FAMILY_LOCKED') twinState = 'ACTIVE';

  const cgptStateLabel =
    cgptState === 'COMPLETE' ? 'COMPLETE'
    : cgptState === 'ACTIVE' ? 'RUNNING'
    : cgptState === 'FAILED' ? 'FAILED'
    : 'PENDING';

  const gpt2StateLabel =
    gpt2State === 'COMPLETE' ?
      status === 'GPT2_MOBILE_AWAITING_SELECTION' ?
        'READY FOR REVIEW'
      : 'COMPLETE'
    : gpt2State === 'ACTIVE' ? 'RUNNING'
    : gpt2State === 'PARTIAL' ? 'PARTIAL'
    : injection ? 'LOCKED UNTIL CGPT' : 'PENDING';

  const viewportStateLabel =
    viewportState === 'COMPLETE' ? 'INTERPRETATIONS READY'
    : viewportState === 'ACTIVE' ? 'INTERPRETING'
    : family?.selectedMobileConceptId ? 'IN PROGRESS'
    : mobileReady >= 3 ? 'LOCKED UNTIL SELECTION'
    : 'LOCKED UNTIL SELECTION';

  const twinStateLabel =
    twinState === 'READY' ? 'PACKAGE READY'
    : twinState === 'COMPLETE' ? 'AWAITING APPROVAL'
    : twinState === 'ACTIVE' ? 'PREPARING'
    : 'PENDING';

  if (!canonical) {
    return [
      { id: 'cgpt', role: 'CGPT', count: '1', stateLabel: cgptStateLabel, state: cgptState },
      { id: 'gpt2', role: 'GPT2', count: '1', stateLabel: gpt2StateLabel, state: gpt2State },
      { id: 'viewport', role: 'VIEWPORT', count: 'LEGACY', stateLabel: 'LEGACY PIPELINE', state: 'PENDING' },
      { id: 'twin', role: 'TWIN', count: '→ LIVE', stateLabel: twinStateLabel, state: twinState },
    ];
  }

  return [
    {
      id: 'cgpt',
      role: 'CGPT',
      count: 'CREATIVE DIRECTION',
      stateLabel: cgptStateLabel,
      state: cgptState,
    },
    {
      id: 'gpt2',
      role: 'GPT2',
      count: '3 MOBILE CONCEPTS',
      stateLabel: gpt2StateLabel,
      state: gpt2State,
    },
    {
      id: 'viewport',
      role: 'VIEWPORT',
      count: 'TABLET + DESKTOP',
      stateLabel: viewportStateLabel,
      state: viewportState,
    },
    {
      id: 'twin',
      role: 'TWIN',
      count: 'IMPLEMENTATION',
      stateLabel: twinStateLabel,
      state: twinState,
    },
  ];
}

function railState(
  active: boolean,
  complete: boolean,
  failed: boolean,
): PageConceptStageState {
  if (failed) return 'FAILED';
  if (active) return 'ACTIVE';
  if (complete) return 'COMPLETE';
  return 'PENDING';
}

export function buildFounderJourneyRail(state: PageConceptGenerationState): readonly FounderJourneyRailStep[] {
  const status = state.generationStatus;
  const injection = Boolean(state.pipelineSet?.creativeInjection);
  const mobileReady = (state.pipelineSet?.mobileConcepts ?? []).filter((c) => c.status === 'READY').length;
  const family = state.pipelineSet?.viewportAuthorityFamily;
  const pageFamily = state.pipelineSet?.pageFamilySkinBehaviorContract;
  const twinPkg = state.pipelineSet?.twinImplementationPackage;
  const experienceApproved = Boolean(state.pipelineSet?.experienceExpressionContract?.approvedAt);

  const creativeComplete = injection;
  const creativeActive = status === 'CGPT_RUNNING' || status === 'CGPT_RATE_LIMITED' || status === 'CGPT_AWAITING_FOUNDER_REVIEW';

  const conceptComplete = mobileReady >= 3 || status === 'GPT2_MOBILE_AWAITING_SELECTION';
  const conceptActive = status === 'GPT2_RUNNING';

  const authorityComplete =
    Boolean(family?.viewportFamilyApprovalId) &&
    Boolean(pageFamily?.approvedAt) &&
    experienceApproved;
  const authorityActive =
    status === 'VIEWPORT_FAMILY_REVIEW' ||
    status === 'PAGE_FAMILY_CONTRACT_REVIEW' ||
    status === 'VIEWPORT_TABLET_RUNNING' ||
    status === 'VIEWPORT_DESKTOP_RUNNING' ||
    Boolean(family?.selectedMobileConceptId);

  const twinComplete = status === 'TWIN_READY_FOR_REVIEW';
  const twinActive =
    status === 'VIEWPORT_FAMILY_LOCKED' ||
    status === 'TWIN_IMPLEMENTATION_PACKAGE_READY' ||
    Boolean(twinPkg);

  const promoteActive = false;

  let blockedReason: string | null = null;
  if (!injection && status === 'FAILED') blockedReason = 'CGPT DID NOT COMPLETE';

  return [
    {
      id: 'CREATIVE',
      step: 1,
      groupTitle: 'CREATIVE',
      groupNote: 'CGPT',
      state: railState(creativeActive, creativeComplete, status === 'FAILED' && !injection),
      blockedReason: !creativeComplete && blockedReason ? blockedReason : null,
    },
    {
      id: 'CONCEPT',
      step: 2,
      groupTitle: 'CONCEPT',
      groupNote: '3 MOBILE GPT2',
      state: railState(conceptActive, conceptComplete, false),
      blockedReason: !creativeComplete ? 'AWAITING CGPT' : null,
    },
    {
      id: 'AUTHORITY',
      step: 3,
      groupTitle: 'AUTHORITY',
      groupNote: 'SELECT + INTERPRET',
      state: railState(authorityActive, authorityComplete, false),
      blockedReason: !conceptComplete ? 'AWAITING 3 MOBILE CONCEPTS' : null,
    },
    {
      id: 'TWIN',
      step: 4,
      groupTitle: 'TWIN',
      groupNote: 'OPUS + COMPOSER',
      state: railState(twinActive, twinComplete, false),
      blockedReason: !authorityComplete ? 'AWAITING VIEWPORT FAMILY APPROVAL' : null,
    },
    {
      id: 'PROMOTE',
      step: 5,
      groupTitle: 'PROMOTE',
      groupNote: 'FOUNDER LIVE MERGE',
      state: railState(promoteActive, false, false),
      blockedReason: !twinComplete ? 'AWAITING TWIN APPROVAL' : null,
    },
  ];
}

export type FounderFooterCtaHint = {
  phase: FounderFooterPhase;
  primaryLabel: string | null;
  secondaryLabel: string | null;
  statusLine: string | null;
};

export function resolveFounderFooterCtaHint(state: PageConceptGenerationState): FounderFooterCtaHint {
  const phase = resolveFounderFooterPhase(state);
  switch (phase) {
    case 'CGPT_REVIEW':
      return { phase, primaryLabel: 'CONTINUE TO GPT2', secondaryLabel: 'CANCEL', statusLine: 'REVIEW CREATIVE DIRECTION' };
    case 'MOBILE_REVIEW':
      return { phase, primaryLabel: 'SELECT MOBILE CONCEPT', secondaryLabel: 'REGENERATE ALL', statusLine: 'SELECTED: NONE' };
    case 'MOBILE_SELECTED':
      return { phase, primaryLabel: 'CONFIRM SELECTION', secondaryLabel: 'CHANGE', statusLine: 'MOBILE AUTHORITY SELECTED' };
    case 'EXPERIENCE_REVIEW':
      return { phase, primaryLabel: 'APPROVE EXPERIENCE EXPRESSION', secondaryLabel: 'BACK', statusLine: 'EXPERIENCE EXPRESSION REVIEW' };
    case 'VIEWPORT_FAMILY':
      return { phase, primaryLabel: 'APPROVE VIEWPORT FAMILY', secondaryLabel: 'REQUEST CHANGES', statusLine: 'VIEWPORT FAMILY READY' };
    case 'PAGE_FAMILY':
      return { phase, primaryLabel: 'APPROVE PAGE FAMILY SYSTEM', secondaryLabel: 'BACK', statusLine: 'PAGE FAMILY SYSTEM REVIEW' };
    case 'READY_FOR_TWIN':
      return { phase, primaryLabel: 'CREATE TWIN SHELL WITH OPUS', secondaryLabel: 'VIEW PACKAGE', statusLine: 'LIVE PAGE WILL NOT BE MODIFIED' };
    case 'TWIN_REVIEW':
      return { phase, primaryLabel: 'APPROVE TWIN', secondaryLabel: 'REQUEST CORRECTION', statusLine: 'AUTHORITY VS TWIN' };
    case 'LIVE_PROMOTION':
      return { phase, primaryLabel: 'PROMOTE TWIN TO LIVE', secondaryLabel: null, statusLine: 'TWIN APPROVED · EXPLICIT CONFIRMATION REQUIRED' };
    case 'POST_RUN':
      return { phase, primaryLabel: 'REVIEW OUTPUTS', secondaryLabel: 'NEW GENERATION', statusLine: 'RUN COMPLETE' };
    default:
      return { phase, primaryLabel: null, secondaryLabel: null, statusLine: null };
  }
}

/** Brief drawer primary sections (founder-visible). */
export const CGPT_BRIEF_FOUNDER_SECTIONS = [
  { num: '01', title: 'PREMISE', field: 'creativePremise' as const },
  { num: '02', title: 'PAGE STORY', field: 'pageStory' as const },
  { num: '03', title: 'VISUAL TERRITORY', field: 'imageryStrategy' as const },
  { num: '04', title: 'COMPOSITION', field: 'compositionStrategy' as const },
  { num: '05', title: 'HIERARCHY', field: 'hierarchyStrategy' as const },
  { num: '06', title: 'TYPE', field: 'typographyStrategy' as const },
  { num: '07', title: 'COLOR', field: 'colorStrategy' as const },
  { num: '08', title: 'MATERIAL', field: 'materialStrategy' as const },
  { num: '09', title: 'IMAGERY', field: 'imageryStrategy' as const },
  { num: '10', title: 'INTERACTION', field: 'interactionCharacter' as const },
  { num: '11', title: 'DISTINCTIVE MOVE', field: 'distinctiveMove' as const },
  { num: '12', title: 'PAGE SURPRISE', field: 'pageSurprise' as const },
  { num: '13', title: 'MOBILE DIRECTION', field: 'mobileDirection' as const },
  { num: '14', title: 'DESKTOP DIRECTION', field: 'desktopDirection' as const },
  { num: '15', title: 'AVOID', field: 'avoidList' as const, join: true },
  { num: '16', title: 'REQUIRED FUNCTION', field: 'requiredContent' as const, join: true },
] as const;

export function livePromotionVisible(state: PageConceptGenerationState): boolean {
  return state.generationStatus === 'TWIN_READY_FOR_REVIEW';
}
