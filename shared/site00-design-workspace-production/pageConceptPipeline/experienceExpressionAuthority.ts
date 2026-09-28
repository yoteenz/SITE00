/**
 * P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1
 * Structured experience expression artifact (behavior + visual states) inheriting confirmed mobile authority.
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageGpt2MobileConcept } from './pageConceptViewportAuthorityFamily.js';
import {
  buildExperienceExpressionPromptPipeline,
  PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
  type ExperienceExpressionPrompt,
  type ExperienceOutputLabel,
  type ExperienceOutputLineage,
  type ExperiencePackagingPlan,
  type ExpressionPromptType,
} from './pageConceptExperienceExpressionFalPlan.js';
import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import { validateExperiencePackagePlan } from './experiencePackageMaterialization.js';
import { enrichExperienceAuthorityThemeContinuity } from './experienceThemeContinuity.js';
import {
  attachContentManifestFieldsToVisualStates,
  auditExperienceContentForAuthority,
  buildExperienceContentManifestsForPage,
} from './experienceContentManifest.js';

export type ExperienceExpressionPatternType =
  | 'DRAWER'
  | 'MODAL'
  | 'POPUP'
  | 'MENU'
  | 'OVERLAY'
  | 'EXPANDED_PANEL'
  | 'SELECTED_STATE'
  | 'LOADING_STATE'
  | 'EMPTY_STATE'
  | 'ERROR_STATE';

export type ExperienceExpressionPatternRecord = {
  patternId: string;
  patternType: ExperienceExpressionPatternType;
  sourceTrigger: string;
  visualTreatment: string;
  entryBehavior: string;
  exitBehavior: string;
  backdropBehavior: string;
  position: string;
  sizeLogic: string;
  scrollBehavior: string;
  dismissBehavior: string;
  responsiveBehavior: string;
  focusBehavior: string;
  inheritanceScope: string;
};

export type ExperienceExpressionVisualState = {
  stateId: string;
  label: string;
  patternType: ExperienceExpressionPatternType | 'BASE_PAGE';
  /** Representative preview — inherited mobile or FAL-generated expression image. */
  previewImageUri: string | null;
  caption: string;
  sourceProvider?: 'INHERITED_MOBILE' | 'FAL_EXPERIENCE';
  generatedArtifactId?: string | null;
  falPromptVersion?: string | null;
  outputLabel?: ExperienceOutputLabel;
  packagingMode?: 'SINGLE' | 'COMBINED';
  sourceExpressionTypes?: readonly ExpressionPromptType[];
  materializationStatus?: 'INHERITED' | 'READY' | 'GENERATING' | 'FAILED' | 'PRESERVED';
  themeMode?: import('./experienceThemeContinuity.js').ExperienceThemeMode;
  contrastRationale?: string | null;
  themeContinuityStatus?: import('./experienceThemeContinuity.js').ThemeContinuityStatus;
  outputThemeDominance?: 'LIGHT' | 'DARK' | 'MIXED' | null;
  contentManifestId?: string | null;
  contentProvenanceStatus?: 'VERIFIED' | 'REVIEW_REQUIRED' | 'BLOCKED';
  contentCoveragePercent?: number;
};

export type ResponsiveExperienceRule = {
  patternType: ExperienceExpressionPatternType;
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ExperienceExpressionAuthorityStatus =
  | 'NOT_STARTED'
  | 'GENERATING'
  | 'READY_FOR_REVIEW'
  | 'PARTIAL_FAILURE'
  | 'APPROVED'
  | 'FAILED'
  | 'SUPERSEDED';

export type ExperienceExpressionAuthority = {
  id: string;
  projectId: string;
  pageId: string;
  sourceMobileAuthorityId: string;
  sourceMobileArtifactId: string;
  sourceConceptId: string;
  status: ExperienceExpressionAuthorityStatus;
  patterns: readonly ExperienceExpressionPatternRecord[];
  behaviorContract: string;
  visualStateContract: string;
  responsiveRules: readonly ResponsiveExperienceRule[];
  visualStates: readonly ExperienceExpressionVisualState[];
  expressionAssetIds?: readonly string[];
  provider?: 'FAL' | 'COMPILED_ONLY';
  falModel?: string | null;
  generatedAt: string | null;
  approvedAt: string | null;
  expressionPrompts?: readonly ExperienceExpressionPrompt[];
  packagingPlan?: ExperiencePackagingPlan | null;
  outputLineage?: readonly ExperienceOutputLineage[];
  experiencePackageMetadata?: import('./ndxbookOverviewExperienceExpressionContentSpec.js').ExperiencePackageMetadata | null;
  generationJobs?: readonly import('./experiencePackageMaterialization.js').ExperienceGenerationJob[];
  authorityThemeProfile?: import('./experienceThemeContinuity.js').AuthorityThemeProfile;
  experienceContentManifests?: readonly import('./experienceContentManifest.js').ExperienceContentManifest[];
  experienceContentAudit?: import('./experienceContentManifest.js').ExperienceContentAudit;
  experienceExpressionCoverageMap?: import('./experienceExpressionCoverageMap.js').ExperienceExpressionCoverageMap | null;
  legacyReconciliationReceipt?: import('./experienceLegacyFalArtifactReconciliation.js').ExperienceLegacyReconciliationReceipt | null;
};

function inferPatterns(functionContract: PageFunctionContract): ExperienceExpressionPatternType[] {
  const blob = [
    ...functionContract.regions,
    ...functionContract.interactions,
    ...functionContract.immutableBehaviors,
  ]
    .join(' ')
    .toLowerCase();
  const patterns: ExperienceExpressionPatternType[] = ['SELECTED_STATE'];
  if (/drawer|sheet|panel|slide/.test(blob)) patterns.push('DRAWER', 'EXPANDED_PANEL');
  if (/modal|dialog|popup|overlay/.test(blob)) patterns.push('MODAL', 'OVERLAY');
  if (/menu|nav|dropdown/.test(blob)) patterns.push('MENU');
  patterns.push('LOADING_STATE', 'EMPTY_STATE', 'ERROR_STATE');
  return [...new Set(patterns)];
}

export function compileExperienceExpressionAuthority(input: {
  projectId: string;
  pageId: string;
  mobileConcept: PageGpt2MobileConcept;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
}): ExperienceExpressionAuthority {
  const patternTypes = inferPatterns(input.functionContract);
  const mobilePreview = input.mobileConcept.imageUri;
  const interactionCharacter =
    input.injection.interactionCharacter ?? input.cgptBrief.interactionCharacter;

  const patterns: ExperienceExpressionPatternRecord[] = patternTypes.map((patternType, index) => ({
    patternId: `eep-${patternType.toLowerCase()}-${index}`,
    patternType,
    sourceTrigger: `Derived from function map + ${input.functionContract.route}`,
    visualTreatment: `Inherits mobile authority typography, materials, and lime accent from skin ${input.skinContract.version}.`,
    entryBehavior: patternType === 'DRAWER' ? 'Slide-in preserving thumb reach on mobile authority.' : 'Contextual open aligned to hierarchy.',
    exitBehavior: 'Explicit dismiss or back affordance; no orphan overlays.',
    backdropBehavior: patternType === 'MODAL' || patternType === 'OVERLAY' ? 'Dimmed editorial scrim.' : 'None or inline expansion.',
    position: patternType === 'DRAWER' ? 'Bottom-anchored on mobile.' : 'Center or inline per pattern.',
    sizeLogic: 'Proportional to content; never generic system chrome.',
    scrollBehavior: 'Body lock when modal; nested scroll inside panels.',
    dismissBehavior: 'Swipe-down on sheets; escape on desktop when applicable.',
    responsiveBehavior: 'See responsiveRules — tablet/desktop interpret approved mobile character.',
    focusBehavior: 'Trap focus in modal; restore on close.',
    inheritanceScope: 'MOBILE AUTHORITY + SITE00 PROJECT EXPRESSION',
  }));

  const authorityId = `peea-${input.projectId}-${input.pageId}-${Date.now()}`;
  const boundPage = getDesignBoundPage(input.projectId, input.pageId);
  const screenId = boundPage?.screenId;
  const { plan, falTargets } = buildExperienceExpressionPromptPipeline({
    projectId: input.projectId,
    pageId: input.pageId,
    screenId,
    authorityId,
    conceptId: input.mobileConcept.conceptId,
    mobileArtifactId: input.mobileConcept.artifactId,
    route: input.functionContract.route,
    territoryLabel: input.mobileConcept.territoryLabel ?? 'mobile authority',
    skinContract: input.skinContract,
    cgptBrief: input.cgptBrief,
    injection: input.injection,
    functionContract: input.functionContract,
  });
  validateExperiencePackagePlan({
    plan,
    projectId: input.projectId,
    route: input.functionContract.route,
    pageId: input.pageId,
    screenId,
  });

  const visualStates: ExperienceExpressionVisualState[] = [
    {
      stateId: 'base',
      label: 'BASE PAGE',
      outputLabel: 'BASE PAGE',
      packagingMode: 'SINGLE',
      sourceExpressionTypes: ['BASE_PAGE_AT_REST'],
      patternType: 'BASE_PAGE',
      previewImageUri: mobilePreview,
      caption: 'Approved mobile concept at rest (anchor — not regenerated).',
      sourceProvider: 'INHERITED_MOBILE',
      materializationStatus: 'INHERITED',
      generatedArtifactId: input.mobileConcept.artifactId,
    },
    ...falTargets.map((target) => ({
      stateId: target.stateId,
      label: target.label,
      outputLabel: target.label,
      packagingMode: target.packagingMode,
      sourceExpressionTypes: target.sourceExpressionTypes,
      patternType: target.patternType,
      previewImageUri: null,
      caption: `${target.label} · ${target.packagingMode === 'COMBINED' ? 'combined states' : 'single state'} — pending FAL generation.`,
      sourceProvider: 'FAL_EXPERIENCE' as const,
      falPromptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
    })),
  ];

  const responsiveRules: ResponsiveExperienceRule[] = patternTypes
    .filter((p) => p === 'DRAWER' || p === 'MODAL' || p === 'MENU')
    .map((patternType) => ({
      patternType,
      mobile:
        patternType === 'DRAWER' ? 'Bottom sheet anchored to safe area.'
        : patternType === 'MENU' ? 'Full-width nav expansion.'
        : 'Centered modal with thumb-friendly actions.',
      tablet:
        patternType === 'DRAWER' ? 'Side sheet with two-column summary when space allows.'
        : patternType === 'MENU' ? 'Persistent side nav segment.'
        : 'Wider modal with inspector column optional.',
      desktop:
        patternType === 'DRAWER' ? 'Anchored side panel; content reflow beside shell.'
        : patternType === 'MENU' ? 'Horizontal nav + mega-menu when warranted.'
        : 'Split modal + inspector column.',
    }));

  const behaviorContract = [
    `Interaction character: ${interactionCharacter}`,
    `Function regions: ${input.functionContract.regions.join(', ')}`,
    `Immutable behaviors: ${input.functionContract.immutableBehaviors.join(', ')}`,
    'Experience answers HOW the approved concept behaves — not a new visual direction.',
  ].join('\n');

  const visualStateContract = [
    `Source concept: ${input.mobileConcept.conceptId}`,
    `Territory: ${input.mobileConcept.territoryLabel ?? 'mobile authority'}`,
    `Skin contract: ${input.skinContract.version}`,
    `Visual states: ${visualStates.map((v) => v.label).join(' · ')}`,
  ].join('\n');

  const now = new Date().toISOString();
  const compiled: ExperienceExpressionAuthority = {
    id: authorityId,
    projectId: input.projectId,
    pageId: input.pageId,
    sourceMobileAuthorityId: input.mobileConcept.conceptId,
    sourceMobileArtifactId: input.mobileConcept.artifactId,
    sourceConceptId: input.mobileConcept.conceptId,
    status: 'NOT_STARTED',
    provider: 'FAL',
    falModel: null,
    expressionAssetIds: [],
    patterns,
    behaviorContract,
    visualStateContract,
    responsiveRules,
    visualStates,
    expressionPrompts: plan.candidatePrompts,
    packagingPlan: plan,
    outputLineage: falTargets.map((t) => t.lineage),
    experiencePackageMetadata: null,
    generatedAt: now,
    approvedAt: null,
  };
  const withTheme = enrichExperienceAuthorityThemeContinuity(compiled, {
    projectId: input.projectId,
    route: input.functionContract.route,
    pageId: input.pageId,
    screenId,
    territoryLabel: input.mobileConcept.territoryLabel ?? null,
  });
  const manifests = buildExperienceContentManifestsForPage({
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.functionContract.route,
    screenId,
    functionContract: input.functionContract,
  });
  const undefinedBlocked = manifests.some((m) => m.provenanceStatus === 'UNDEFINED_BLOCKED');
  if (undefinedBlocked) {
    const blocked = manifests.find((m) => m.undefinedRequirements.length > 0);
    throw new Error(
      `EXPERIENCE_CONTENT_UNDEFINED:${blocked?.expressionType ?? 'UNKNOWN'}:${(blocked?.undefinedRequirements ?? []).join(',')}`,
    );
  }
  const visualStatesWithContent = attachContentManifestFieldsToVisualStates(withTheme, manifests);
  const experienceContentAudit = auditExperienceContentForAuthority({
    ...withTheme,
    experienceContentManifests: manifests,
    visualStates: visualStatesWithContent,
  });
  return {
    ...withTheme,
    visualStates: visualStatesWithContent,
    experienceContentManifests: manifests,
    experienceContentAudit,
  };
}
