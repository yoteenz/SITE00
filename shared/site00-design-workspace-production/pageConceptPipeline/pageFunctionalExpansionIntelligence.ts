/**
 * P0.VR.EXISTING-TRUTH-PLUS-FUNCTIONAL-EXPANSION-INTELLIGENCE1
 */

import { compilePageFunctionContract } from './functionContract.js';
import { discoverProjectPageFamilyLayout } from './projectPageFamilyHierarchyDiscovery.js';
import type { PageFamilyBlueprint } from './pageConceptPageFamilyBlueprint.js';
import type { PageFamilyInteractionMap } from './pageConceptPageFamilyInteractionMap.js';
import type { PageConceptGenerationState, PageFunctionContract } from './types.js';
import type { ExperienceContentManifest } from './experienceContentManifest.js';
import type { ExpressionPromptType } from './pageConceptExperienceExpressionPromptOrchestration.js';
import {
  buildNdxbookFalDiscoveryAudit,
  buildNdxbookFunctionalExpansionProposals,
  buildNdxbookPageCapabilityAnalyses,
  buildNdxbookExistingPageTruths,
} from './ndxbookFunctionalExpansionIntelligence.js';

export type FunctionalGapType =
  | 'NAVIGATION_GAP'
  | 'DETAIL_ACCESS_GAP'
  | 'STATE_VISIBILITY_GAP'
  | 'CONTENT_CONTEXT_GAP'
  | 'HISTORY_GAP'
  | 'ACTIVITY_GAP'
  | 'EVIDENCE_GAP'
  | 'ACTION_GAP'
  | 'DISCOVERY_GAP'
  | 'FILTERING_GAP'
  | 'SEARCH_GAP'
  | 'WORKFLOW_CONTINUITY_GAP'
  | 'RELATED_CONTENT_GAP'
  | 'AUDITABILITY_GAP'
  | 'EXPORT_GAP'
  | 'APPROVAL_GAP'
  | 'CROSS_PAGE_CONTINUITY_GAP';

export type ExpansionOrigin =
  | 'SYSTEM_ANALYSIS'
  | 'EXPERIENCE_GENERATION_DISCOVERY'
  | 'FOUNDER_REQUEST'
  | 'PAGE_FUNCTION_AUDIT';

export type ExpansionStatus = 'PROPOSED' | 'FOUNDER_APPROVED' | 'FOUNDER_REJECTED' | 'DEFERRED';

export type FalDiscoveryClassification =
  | 'ALREADY_CANONICAL'
  | 'USEFUL_EXPANSION_CANDIDATE'
  | 'REDUNDANT'
  | 'CONFLICTS_WITH_EXISTING_MODEL'
  | 'NOT_USEFUL'
  | 'NEEDS_FOUNDER_REVIEW';

export type ExistingPageTruth = {
  pageId: string;
  pageName: string;
  depth: 0 | 1 | 2;
  currentPageFunction: string;
  contentRegions: readonly string[];
  navigation: readonly string[];
  controls: readonly string[];
  interactions: readonly string[];
  dataModel: readonly string[];
  relationships: readonly string[];
  actions: readonly string[];
  states: readonly string[];
  responsiveBehavior: readonly string[];
  knownLimitations: readonly string[];
  sources: readonly string[];
};

export type PageCapabilityAnalysis = {
  pageId: string;
  pageName: string;
  currentlyDoes: string;
  doesWell: string;
  underdeveloped: string;
  impliedMissing: string;
  usefulInformation: string;
  naturalActions: string;
  clarityImprovements: string;
  exposedMissingFunctionality: string;
  gapTypes: readonly FunctionalGapType[];
};

export type ProposedFunctionalExpansion = {
  expansionId: string;
  sourcePageId: string;
  title: string;
  problemObserved: string;
  currentBehavior: string;
  proposedBehavior: string;
  userBenefit: string;
  whyItFitsProduct: string;
  requiredContent: readonly string[];
  requiredData: readonly string[];
  requiredInteractions: readonly string[];
  requiredRoutes: readonly string[];
  requiredStates: readonly string[];
  affectedPages: readonly string[];
  affectedChildren: readonly string[];
  affectedGrandchildren: readonly string[];
  affectedExperiencePatterns: readonly string[];
  responsiveImpact: { mobile: string; tablet: string; desktop: string };
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  status: ExpansionStatus;
  origin: ExpansionOrigin;
  gapTypes: readonly FunctionalGapType[];
};

export type FalDiscoveryAuditRow = {
  label: string;
  classification: FalDiscoveryClassification;
  rationale: string;
  linkedExpansionId: string | null;
};

export type ExperienceStatePlan = {
  stateId: string;
  expressionType: ExpressionPromptType;
  existingContent: readonly string[];
  existingInteractions: readonly string[];
  approvedExpansions: readonly string[];
  rejectedExpansions: readonly string[];
  deferredExpansions: readonly string[];
  visualStateIntent: string;
};

export type PageFunctionalExpansionIntelligence = {
  intelligenceId: string;
  projectId: string;
  anchorPageId: string;
  existingPageTruths: readonly ExistingPageTruth[];
  capabilityAnalyses: readonly PageCapabilityAnalysis[];
  proposals: readonly ProposedFunctionalExpansion[];
  falDiscoveryAudit: readonly FalDiscoveryAuditRow[];
  experienceStatePlans: readonly ExperienceStatePlan[];
  readiness: {
    pageTruthResolved: boolean;
    functionalGapsAnalyzed: boolean;
    expansionProposalsReviewed: boolean;
    approvedExpansionsPropagated: boolean;
    readyForOpus: boolean;
  };
};

export type ComposerExpansionImplementationContract = {
  expansionId: string;
  routes: readonly string[];
  state: readonly string[];
  data: readonly string[];
  apis: readonly string[];
  persistence: readonly string[];
  permissions: readonly string[];
  responsiveBehavior: readonly string[];
  loadingErrorStates: readonly string[];
};

export function buildPageFunctionalExpansionIntelligence(input: {
  projectId: string;
  anchorPageId: string;
  functionContract?: PageFunctionContract | null;
}): PageFunctionalExpansionIntelligence | null {
  if (input.projectId.toLowerCase() !== 'ndxbook') return null;
  const functionContract =
    input.functionContract ?? compilePageFunctionContract(input.projectId, input.anchorPageId);
  if (!functionContract) return null;

  const layout = discoverProjectPageFamilyLayout(input.projectId, input.anchorPageId);
  const existingPageTruths = buildNdxbookExistingPageTruths(layout, functionContract);
  const capabilityAnalyses = buildNdxbookPageCapabilityAnalyses(existingPageTruths, layout);
  const falDiscoveryAudit = buildNdxbookFalDiscoveryAudit();
  const proposals = buildNdxbookFunctionalExpansionProposals({
    anchorPageId: input.anchorPageId,
    layout,
    analyses: capabilityAnalyses,
    falDiscoveryAudit,
  });
  const experienceStatePlans = buildExperienceStatePlans({
    proposals,
    anchorPageId: input.anchorPageId,
  });

  const pending = proposals.filter((p) => p.status === 'PROPOSED').length;
  const approved = proposals.filter((p) => p.status === 'FOUNDER_APPROVED').length;

  return {
    intelligenceId: `pfei-${input.projectId}-${input.anchorPageId}`,
    projectId: input.projectId,
    anchorPageId: input.anchorPageId,
    existingPageTruths,
    capabilityAnalyses,
    proposals,
    falDiscoveryAudit,
    experienceStatePlans,
    readiness: {
      pageTruthResolved: existingPageTruths.length > 0,
      functionalGapsAnalyzed: capabilityAnalyses.length > 0,
      expansionProposalsReviewed: pending === 0,
      approvedExpansionsPropagated: approved === 0 || approved > 0,
      readyForOpus: pending === 0 && existingPageTruths.length > 0,
    },
  };
}

export function buildExperienceStatePlans(input: {
  proposals: readonly ProposedFunctionalExpansion[];
  anchorPageId: string;
}): ExperienceStatePlan[] {
  const states: { stateId: string; expressionType: ExpressionPromptType; intent: string }[] = [
    { stateId: 'menu', expressionType: 'MENU_EXPANDED_NAV', intent: 'Canonical project-family navigation only.' },
    { stateId: 'entry-detail', expressionType: 'PANEL_OR_DRAWER', intent: 'Entry detail from canonical entry model.' },
    { stateId: 'project-access', expressionType: 'OVERLAY_OR_DETAIL_STATE', intent: 'Project-family access surfaces.' },
  ];
  return states.map((s) => {
    const approved = input.proposals.filter(
      (p) => p.status === 'FOUNDER_APPROVED' && p.affectedExperiencePatterns.some((pat) => pat.includes(s.stateId)),
    );
    const rejected = input.proposals.filter((p) => p.status === 'FOUNDER_REJECTED');
    const deferred = input.proposals.filter((p) => p.status === 'DEFERRED');
    return {
      stateId: s.stateId,
      expressionType: s.expressionType,
      existingContent: ['Resolved from ExistingPageTruth + ExperienceContentManifest'],
      existingInteractions: ['Page function map + Interaction Map (canonical only)'],
      approvedExpansions: approved.map((p) => p.title),
      rejectedExpansions: rejected.map((p) => p.title),
      deferredExpansions: deferred.map((p) => p.title),
      visualStateIntent: s.intent,
    };
  });
}

export function approvedExpansionPromptBlock(
  approved: readonly ProposedFunctionalExpansion[],
): string {
  if (!approved.length) return '';
  return [
    'FOUNDER-APPROVED EXPANSION CONTENT (layer C — not canonical until listed here):',
    ...approved.map(
      (p) =>
        `- ${p.title}: ${p.proposedBehavior} [APPROVED expansionId=${p.expansionId}]`,
    ),
    'Do not render any expansion not listed above.',
  ].join('\n');
}

export function unapprovedExpansionsEnterFalPrompt(
  promptText: string,
  proposals: readonly ProposedFunctionalExpansion[],
): boolean {
  const unapproved = proposals.filter((p) => p.status === 'PROPOSED' || p.status === 'DEFERRED');
  for (const p of unapproved) {
    const re = new RegExp(`\\b${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(promptText)) return true;
  }
  return false;
}

export function applyFounderFunctionalExpansionDecision(
  intelligence: PageFunctionalExpansionIntelligence,
  expansionId: string,
  decision: 'APPROVE' | 'REJECT' | 'DEFER',
): PageFunctionalExpansionIntelligence {
  const status: ExpansionStatus =
    decision === 'APPROVE' ? 'FOUNDER_APPROVED'
    : decision === 'REJECT' ? 'FOUNDER_REJECTED'
    : 'DEFERRED';
  const proposals = intelligence.proposals.map((p) =>
    p.expansionId === expansionId ? { ...p, status } : p,
  );
  const next = {
    ...intelligence,
    proposals,
    experienceStatePlans: buildExperienceStatePlans({
      proposals,
      anchorPageId: intelligence.anchorPageId,
    }),
  };
  const pending = proposals.filter((p) => p.status === 'PROPOSED').length;
  return {
    ...next,
    readiness: {
      ...next.readiness,
      expansionProposalsReviewed: pending === 0,
      approvedExpansionsPropagated:
        proposals.some((p) => p.status === 'FOUNDER_APPROVED') || pending === 0,
      readyForOpus: pending === 0 && next.readiness.pageTruthResolved,
    },
  };
}

export type ProposedInteractionMapAddition = {
  interactionId: string;
  pageId: string;
  controlLabel: string;
  actionType: string;
  destinationRoute: string | null;
  status: 'PROPOSED';
};

export function propagateApprovedExpansionToFamily(input: {
  intelligence: PageFunctionalExpansionIntelligence;
  blueprint: PageFamilyBlueprint;
  interactionMap: PageFamilyInteractionMap | null;
  expansionId: string;
}): {
  blueprint: PageFamilyBlueprint;
  interactionMap: PageFamilyInteractionMap | null;
  proposedInteractionRecords: readonly ProposedInteractionMapAddition[];
} {
  const expansion = input.intelligence.proposals.find((p) => p.expansionId === input.expansionId);
  if (!expansion || expansion.status !== 'FOUNDER_APPROVED') {
    return {
      blueprint: input.blueprint,
      interactionMap: input.interactionMap,
      proposedInteractionRecords: [],
    };
  }
  const blueprint: PageFamilyBlueprint = {
    ...input.blueprint,
    expansionNotes: [
      ...(input.blueprint.expansionNotes ?? []),
      `APPROVED EXPANSION · ${expansion.title}: ${expansion.proposedBehavior}`,
    ],
  };
  const proposedInteractionRecords: ProposedInteractionMapAddition[] = expansion.requiredInteractions.map(
    (label, i) => ({
      interactionId: `pfei-proposed-${expansion.expansionId}-${i}`,
      pageId: expansion.sourcePageId,
      controlLabel: label,
      actionType: label.includes('NAVIGATE') ? 'NAVIGATE' : 'OPEN',
      destinationRoute: expansion.requiredRoutes[0] ?? null,
      status: 'PROPOSED' as const,
    }),
  );
  return { blueprint, interactionMap: input.interactionMap, proposedInteractionRecords };
}

export function buildComposerExpansionImplementationContracts(
  intelligence: PageFunctionalExpansionIntelligence,
): readonly ComposerExpansionImplementationContract[] {
  return intelligence.proposals
    .filter((p) => p.status === 'FOUNDER_APPROVED')
    .map((p) => ({
      expansionId: p.expansionId,
      routes: p.requiredRoutes,
      state: p.requiredStates,
      data: p.requiredData,
      apis: [`API stub for ${p.title}`],
      persistence: p.requiredData.length ? [`Persist ${p.requiredData.join(', ')}`] : [],
      permissions: ['Founder-gated until product policy defined'],
      responsiveBehavior: [
        `MOBILE: ${p.responsiveImpact.mobile}`,
        `TABLET: ${p.responsiveImpact.tablet}`,
        `DESKTOP: ${p.responsiveImpact.desktop}`,
      ],
      loadingErrorStates: ['Loading skeleton aligned to family shell', 'Calm recovery copy'],
    }));
}

export function buildOpusFunctionalExpansionHandoffLines(
  intelligence: PageFunctionalExpansionIntelligence | null | undefined,
): string[] {
  if (!intelligence) return [];
  const approved = intelligence.proposals.filter((p) => p.status === 'FOUNDER_APPROVED');
  return [
    'OPUS · EXISTING PRODUCT TRUTH: use ExistingPageTruth + blueprint (what exists today).',
    `OPUS · APPROVED EXPANSIONS: ${approved.length}`,
    ...approved.map((p) => `OPUS · EXPANSION · ${p.title}: ${p.proposedBehavior}`),
    'OPUS · VISUALS express approved function — manifests win for content semantics.',
  ];
}

export function patchPipelineFunctionalExpansionIntelligence(
  state: PageConceptGenerationState,
  intelligence: PageFunctionalExpansionIntelligence | null,
): PageConceptGenerationState {
  if (!state.pipelineSet) return state;
  return {
    ...state,
    pipelineSet: {
      ...state.pipelineSet,
      functionalExpansionIntelligence: intelligence,
    },
  };
}

export function mergeApprovedExpansionsIntoContentManifestPrompt(
  _manifest: ExperienceContentManifest | null | undefined,
  intelligence: PageFunctionalExpansionIntelligence | null | undefined,
  stateId: string,
): string {
  const approved =
    intelligence?.proposals.filter(
      (p) =>
        p.status === 'FOUNDER_APPROVED' &&
        p.affectedExperiencePatterns.some((pat) => pat.includes(stateId)),
    ) ?? [];
  return approvedExpansionPromptBlock(approved);
}

export function injectApprovedFunctionalExpansionsIntoAuthority(
  authority: import('./experienceExpressionAuthority.js').ExperienceExpressionAuthority,
  intelligence: PageFunctionalExpansionIntelligence | null | undefined,
): import('./experienceExpressionAuthority.js').ExperienceExpressionAuthority {
  if (!intelligence || !authority.expressionPrompts?.length) return authority;
  const expressionPrompts = authority.expressionPrompts.map((p) => {
    const stateId = p.stateId ?? 'base';
    const block = mergeApprovedExpansionsIntoContentManifestPrompt(null, intelligence, stateId);
    if (!block.trim()) return p;
    return { ...p, promptText: `${p.promptText}\n\n${block}` };
  });
  return { ...authority, expressionPrompts };
}

export function promoteFalDiscoveryLabelToProposal(
  intelligence: PageFunctionalExpansionIntelligence,
  label: string,
): PageFunctionalExpansionIntelligence {
  const row = intelligence.falDiscoveryAudit.find((r) => r.label.toUpperCase() === label.toUpperCase());
  if (!row || row.classification !== 'USEFUL_EXPANSION_CANDIDATE' || !row.linkedExpansionId) {
    return intelligence;
  }
  if (intelligence.proposals.some((p) => p.expansionId === row.linkedExpansionId)) return intelligence;
  const layout = discoverProjectPageFamilyLayout(intelligence.projectId, intelligence.anchorPageId);
  const extra = buildNdxbookFunctionalExpansionProposals({
    anchorPageId: intelligence.anchorPageId,
    layout,
    analyses: intelligence.capabilityAnalyses,
    falDiscoveryAudit: [{ ...row }],
  });
  const merged = new Map(intelligence.proposals.map((p) => [p.expansionId, p]));
  for (const p of extra) merged.set(p.expansionId, p);
  const proposals = [...merged.values()];
  return {
    ...intelligence,
    proposals,
    experienceStatePlans: buildExperienceStatePlans({
      proposals,
      anchorPageId: intelligence.anchorPageId,
    }),
  };
}
