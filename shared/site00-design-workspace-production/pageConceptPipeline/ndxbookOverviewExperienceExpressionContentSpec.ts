/**
 * P0.VR.NDXBOOK-OVERVIEW-EXPRESSION-CONTENT-SPEC1
 * Page-specific experience expression prompts + packaging for NDXBOOK Overview.
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import type {
  CombinedExpressionGroup,
  ExperienceExpressionPrompt,
  ExperienceOutputLabel,
  ExperiencePackagingPlan,
  ExpressionPromptType,
} from './pageConceptExperienceExpressionPromptOrchestration.js';
import { themePromptBlockForMode } from './experienceThemeContinuity.js';
import {
  buildExperienceContentManifestsForPage,
  canonicalContentPromptBlock,
  manifestForState,
} from './experienceContentManifest.js';

export const NDXBOOK_OVERVIEW_EXPERIENCE_PROMPT_VERSION = 'page-experience-expression-ndxbook-overview-v1';

export type ExperiencePackageOutputRecord = {
  outputId: string;
  label: ExperienceOutputLabel;
  expressionTypes: readonly ExpressionPromptType[];
  falArtifactId: string | null;
  sourcePromptIds: readonly string[];
  approved: boolean;
  version: string;
  themeMode?: import('./experienceThemeContinuity.js').ExperienceThemeMode;
  contrastRationale?: string | null;
  themeContinuityStatus?: import('./experienceThemeContinuity.js').ThemeContinuityStatus;
  contentManifestId?: string | null;
  contentProvenanceStatus?: 'VERIFIED' | 'REVIEW_REQUIRED' | 'BLOCKED';
  contentCoveragePercent?: number;
};

export type ExperiencePackageContentManifestRef = {
  stateId: string;
  manifestId: string;
  provenanceStatus: import('./experienceContentManifest.js').ExperienceContentManifest['provenanceStatus'];
};

export type ExperiencePackageMetadata = {
  experiencePackageId: string;
  sourceMobileAuthorityId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  logicalExpressionPrompts: readonly string[];
  packagingPlanId: string;
  generatedOutputs: readonly ExperiencePackageOutputRecord[];
  contentManifests?: readonly ExperiencePackageContentManifestRef[];
};

const ANTI_DRIFT = [
  'Do not redesign the approved concept.',
  'Do not create a new page, moodboard, or poster.',
  'No phone chrome, browser chrome, or letterboxing.',
  'Do not replace the actual bottom SITE 00 product navigation.',
  'Do not invent SHOP, PROFILE, SOCIAL, SETTINGS unless in the function map.',
  'No floating explanatory text or behavior diagram.',
] as const;

export function isNdxbookOverviewExperiencePage(input: {
  projectId: string;
  route: string;
  pageId?: string;
  screenId?: string;
}): boolean {
  const pid = input.projectId.toLowerCase();
  if (pid !== 'ndxbook') return false;
  if (input.screenId === 'overview') return true;
  const route = input.route.toLowerCase();
  if (route.includes('overview')) return true;
  if (route.includes('/ndxbook/overview')) return true;
  /** Live function contract uses project root — that surface IS NDXBOOK Overview mobile authority. */
  if (/^\/projects\/(?:design\/)?ndxbook\/?$/.test(route)) return true;
  const pageId = (input.pageId ?? '').toLowerCase();
  if (pageId.includes('overview') || pageId.endsWith(':overview')) return true;
  return false;
}

function ndxbookSharedAuthorityBlock(input: {
  authorityId: string;
  conceptId: string;
  mobileArtifactId: string;
  territoryLabel: string;
  skinContract: ProjectSkinContract;
}): string {
  const visualSignals = compileNdxbookVisualInheritanceSignals(input.territoryLabel);
  return [
    'APPROVED MOBILE AUTHORITY:',
    input.mobileArtifactId,
    '',
    `CONCEPT: ${input.conceptId}`,
    'ROUTE: PROJECTS > NDXBOOK > OVERVIEW',
    'CONTEXT: NDXBOOK EXPRESSED INSIDE SITE 00 PROJECTS',
    'RULE: EDIT THE APPROVED AUTHORITY. DO NOT REDESIGN THE PAGE.',
    '',
    'PRESERVE:',
    '- exact visual territory from the approved concept',
    '- typography behavior, graphic language, materials, color relationships',
    '- image treatment, hierarchy, shell, actual bottom navigation, NDXBOOK identity',
    visualSignals,
    '',
    `SKIN CONTRACT: ${input.skinContract.version}`,
    `FORBIDDEN DRIFT: ${input.skinContract.forbiddenDrift.slice(0, 5).join(' · ')}`,
  ].join('\n');
}

export function compileNdxbookVisualInheritanceSignals(territoryLabel: string): string {
  const t = territoryLabel.toLowerCase();
  const signals: string[] = ['VISUAL INHERITANCE (from approved territory):'];
  if (/editorial|signal|archival|record/.test(t)) {
    signals.push(
      '- black masthead / editorial header band if present in authority',
      '- lime signal blocks and mono metadata labels',
      '- paper-field modules and archival image crops',
      '- hard editorial rules — not generic card UI',
    );
  } else {
    signals.push('- match masthead, accent, module shapes, and metadata style from the reference exactly');
  }
  return signals.join('\n');
}

function assembleNdxbookPrompt(input: {
  sharedBlock: string;
  expression: string;
  expressionType: ExpressionPromptType;
  trigger: string;
  changeOnly: string;
  keepVisible: string;
  stateContent: string;
  interactionCharacter: string;
}): string {
  const text = [
    'SITE 00 — NDXBOOK OVERVIEW EXPERIENCE EXPRESSION (FAL edit from approved mobile authority)',
    input.sharedBlock,
    '',
    'SHARED AUTHORITY INHERITANCE (required)',
    '',
    `EXPRESSION: ${input.expression}`,
    `EXPRESSION TYPE: ${input.expressionType}`,
    `TRIGGER: ${input.trigger}`,
    'PRIMARY GOAL:',
    input.interactionCharacter,
    'WHAT MUST REMAIN UNCHANGED:',
    input.keepVisible,
    'WHAT IS ALLOWED TO CHANGE:',
    input.changeOnly,
    'STATE CONTENT:',
    input.stateContent,
    'INTERACTION CHARACTER:',
    input.interactionCharacter,
    'ANTI-DRIFT RULES:',
    ...ANTI_DRIFT.map((r) => `- ${r}`),
    'OUTPUT:',
    '- production-quality mobile UI on same canonical canvas',
    '- same approved NDXBOOK Overview concept with requested interaction active',
    '- no device frame, browser frame, or external letterboxing',
  ].join('\n');
  return text;
}

export function decomposeNdxbookOverviewExperiencePrompts(input: {
  authorityId: string;
  conceptId: string;
  mobileArtifactId: string;
  route: string;
  pageId: string;
  territoryLabel: string;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
}): readonly ExperienceExpressionPrompt[] {
  const contentManifests = buildExperienceContentManifestsForPage({
    projectId: input.functionContract.projectId,
    pageId: input.pageId,
    route: input.route,
    functionContract: input.functionContract,
  });

  const shared = ndxbookSharedAuthorityBlock({
    authorityId: input.authorityId,
    conceptId: input.conceptId,
    mobileArtifactId: input.mobileArtifactId,
    territoryLabel: input.territoryLabel,
    skinContract: input.skinContract,
  });

  const preserveNav = [
    'NDXBOOK identity, approved header styling, project progress, current phase, entry index behind interaction,',
    'typography, color family, graphic language, material system, bottom SITE 00 product navigation, page composition.',
  ].join(' ');

  const mk = (
    expressionType: ExpressionPromptType,
    fields: {
      expression: string;
      outputLabel: ExperienceOutputLabel;
      stateId: string;
      trigger: string;
      changeOnly: string;
      keepVisible: string;
      stateContent: string;
      interactionCharacter: string;
      combinableWith: ExpressionPromptType[];
      priority: number;
      themeMode?: ExperienceExpressionPrompt['themeMode'];
      contrastRationale?: string | null;
    },
    index: number,
  ): ExperienceExpressionPrompt => ({
    id: `ndx-eeprompt-${fields.stateId}-${index}`,
    authorityId: input.authorityId,
    conceptId: input.conceptId,
    route: input.route,
    expressionType,
    promptText: (() => {
      const manifest = manifestForState(contentManifests, fields.stateId);
      const contentBlock = manifest ? canonicalContentPromptBlock(manifest) : '';
      return [
        assembleNdxbookPrompt({
          sharedBlock: shared,
          expression: fields.expression,
          expressionType,
          trigger: fields.trigger,
          changeOnly: fields.changeOnly,
          keepVisible: fields.keepVisible,
          stateContent: fields.stateContent,
          interactionCharacter: fields.interactionCharacter,
        }),
        '',
        contentBlock,
        '',
        themePromptBlockForMode(fields.themeMode ?? 'INHERIT_AUTHORITY', fields.contrastRationale ?? null),
      ]
        .filter(Boolean)
        .join('\n');
    })(),
    preserveBlock: fields.keepVisible,
    changeBlock: fields.changeOnly,
    outputIntent: fields.interactionCharacter,
    combinableWith: fields.combinableWith,
    priority: fields.priority,
    primaryGoal: fields.interactionCharacter,
    interactionSurface: fields.trigger,
    antiDriftRules: ANTI_DRIFT,
    outputLabel: fields.outputLabel,
    stateId: fields.stateId,
    themeMode: fields.themeMode ?? 'INHERIT_AUTHORITY',
    contrastRationale: fields.contrastRationale ?? null,
  });

  return [
    mk(
      'BASE_PAGE_AT_REST',
      {
        expression: 'BASE_PAGE_AT_REST',
        outputLabel: 'BASE PAGE',
        stateId: 'base',
        trigger: 'Resting/default — no overlay or panel open.',
        changeOnly: 'Nothing — inherit approved mobile artifact; do not regenerate if clean.',
        keepVisible: 'Complete approved page: project identity, progress, phase, entry index, production state, bottom nav.',
        stateContent: 'Normal navigation, entry index, in-production state — control image for AT REST vs ACTIVE.',
        interactionCharacter: 'Anchor resting state for downstream AT REST vs INTERACTION ACTIVE comparison.',
        combinableWith: [],
        priority: 0,
      },
      0,
    ),
    mk(
      'MENU_EXPANDED_NAV',
      {
        expression: 'PRIMARY_NAV_EXPANDED',
        outputLabel: 'MENU / EXPANDED NAV',
        stateId: 'menu',
        trigger: 'Actual primary project/page navigation control visible in the approved concept — do not invent a new trigger.',
        changeOnly: 'Open only the navigation/menu layer native to this concept (drawer, sheet, editorial index layer — not generic hamburger).',
        keepVisible: preserveNav,
        stateContent:
          'Show only canonical NDXBOOK page-family navigation destinations from the content manifest — no simplified taxonomy.',
        interactionCharacter:
          'Opening the project structure should feel like revealing the index architecture of the record — not a generic mobile app menu.',
        combinableWith: ['PANEL_OR_DRAWER'],
        priority: 10,
      },
      1,
    ),
    mk(
      'PANEL_OR_DRAWER',
      {
        expression: 'ENTRY_DETAIL_PANEL',
        outputLabel: 'ENTRY DETAIL / PANEL',
        stateId: 'entry-detail',
        trigger: 'Founder selects one Entry from the Entry Index (e.g. ENTRY 003 · FOUNDER REVIEW).',
        changeOnly: 'Open entry detail panel/sheet while Overview remains visibly present underneath or beside.',
        keepVisible: 'Overview page identity — founder still on Overview with entry context open.',
        stateContent:
          'Entry detail panel uses only canonical entry fields and OPEN FULL ENTRY from the content manifest — no invented metadata columns.',
        interactionCharacter:
          'Inspecting an entry should feel like pulling one indexed record forward while preserving its place in the larger archival system.',
        combinableWith: ['MENU_EXPANDED_NAV'],
        priority: 20,
      },
      2,
    ),
    mk(
      'OVERLAY_OR_DETAIL_STATE',
      {
        expression: 'PROJECT_ACCESS_DRAWER_OR_OVERLAY',
        outputLabel: 'PROJECT ACCESS / OVERLAY',
        stateId: 'project-access',
        trigger: 'Deeper project access control from approved concept (explore project family surfaces from canonical hierarchy).',
        changeOnly: 'Open broader project exploration surface — not duplicate of single entry detail.',
        keepVisible: preserveNav,
        stateContent:
          'Project access overlay lists canonical page-family regions from the manifest — not invented archive/analytics categories.',
        interactionCharacter:
          'Deeper access should feel like opening the larger archive behind the overview rather than a generic secondary menu.',
        combinableWith: [],
        priority: 30,
      },
      3,
    ),
  ];
}

export function planNdxbookOverviewExperiencePackaging(input: {
  authorityId: string;
  conceptId: string;
  candidatePrompts: readonly ExperienceExpressionPrompt[];
}): ExperiencePackagingPlan {
  const falPrompts = input.candidatePrompts.filter((p) => p.expressionType !== 'BASE_PAGE_AT_REST');
  const groupedOutputs: CombinedExpressionGroup[] = falPrompts.map((p, i) => ({
    id: `ndx-pkg-${p.stateId ?? i}`,
    groupedExpressionTypes: [p.expressionType],
    rationale: `NDXBOOK Overview content spec — dedicated ${p.outputLabel ?? p.expressionType} for founder + tablet/desktop inheritance.`,
    expectedOutputCount: 1,
    label: p.outputLabel ?? 'PANEL / DRAWER',
    stateId: p.stateId ?? `ndx-${i}`,
  }));

  return {
    authorityId: input.authorityId,
    conceptId: input.conceptId,
    candidatePrompts: input.candidatePrompts,
    groupedOutputs,
    totalRequestedOutputs: falPrompts.length,
    totalPlannedOutputs: groupedOutputs.length,
    packagingReasoning: `NDXBOOK Overview spec: ${groupedOutputs.length} FAL outputs + 1 inherited BASE (target 4 visuals). No combining unless future budget pressure — entry detail ≠ project access.`,
    promptVersion: NDXBOOK_OVERVIEW_EXPERIENCE_PROMPT_VERSION,
  };
}

export type NdxbookOverviewExperienceValidation = {
  ok: boolean;
  checks: Record<string, boolean>;
  errors: readonly string[];
};

export function validateNdxbookOverviewExperiencePackage(
  authority: ExperienceExpressionAuthority | null | undefined,
): NdxbookOverviewExperienceValidation {
  const errors: string[] = [];
  const checks: Record<string, boolean> = {};
  if (!authority) {
    return { ok: false, checks: { AUTHORITY_PRESENT: false }, errors: ['EXPERIENCE_AUTHORITY_MISSING'] };
  }

  const labels = authority.visualStates.map((v) => v.outputLabel ?? v.label);
  checks.BASE_PAGE_PRESENT = labels.includes('BASE PAGE');
  checks.PRIMARY_NAV_EXPRESSION_PRESENT = labels.some((l) => l.includes('MENU') || l.includes('NAV'));
  checks.ENTRY_DETAIL_EXPRESSION_PRESENT = labels.some((l) => l.includes('ENTRY DETAIL'));
  checks.PROJECT_ACCESS_EXPRESSION_PRESENT = labels.some((l) => l.includes('PROJECT ACCESS'));
  const outputCount = authority.visualStates.filter((v) => v.previewImageUri).length;
  checks.OUTPUT_COUNT_LTE_5 = outputCount <= 5;
  checks.OUTPUT_COUNT_GTE_2 = outputCount >= 2;
  checks.ALL_OUTPUTS_USE_APPROVED_AUTHORITY = authority.sourceConceptId === authority.sourceMobileAuthorityId;
  checks.NO_TEXT_ONLY_OUTPUTS = authority.visualStates
    .filter((v) => v.sourceProvider === 'FAL_EXPERIENCE')
    .every((v) => Boolean(v.previewImageUri?.trim()) || authority.status === 'GENERATING');

  for (const [key, pass] of Object.entries(checks)) {
    if (!pass) errors.push(`VALIDATION_FAILED:${key}`);
  }

  return { ok: errors.length === 0, checks, errors };
}

export function buildExperiencePackageMetadata(input: {
  authority: ExperienceExpressionAuthority;
  territoryId: string | null;
}): ExperiencePackageMetadata {
  const plan = input.authority.packagingPlan;
  return {
    experiencePackageId: `ndx-expkg-${input.authority.id}`,
    sourceMobileAuthorityId: input.authority.sourceMobileArtifactId,
    sourceConceptId: input.authority.sourceConceptId,
    sourceTerritoryId: input.territoryId,
    logicalExpressionPrompts: input.authority.expressionPrompts?.map((p) => p.id) ?? [],
    packagingPlanId: plan ? `${plan.authorityId}-pkg` : input.authority.id,
    generatedOutputs: input.authority.visualStates.map((v) => ({
      outputId: v.stateId,
      label: (v.outputLabel ?? v.label) as ExperienceOutputLabel,
      expressionTypes: v.sourceExpressionTypes ?? [],
      falArtifactId: v.generatedArtifactId ?? null,
      sourcePromptIds:
        input.authority.outputLineage?.find((l) => l.outputStateId === v.stateId)?.sourcePromptIds ?? [],
      approved: input.authority.status === 'APPROVED',
      version: input.authority.packagingPlan?.promptVersion ?? NDXBOOK_OVERVIEW_EXPERIENCE_PROMPT_VERSION,
      themeMode: v.themeMode ?? 'INHERIT_AUTHORITY',
      contrastRationale: v.contrastRationale ?? null,
      themeContinuityStatus: v.themeContinuityStatus ?? 'THEME_MATCH',
      contentManifestId: v.contentManifestId ?? null,
      contentProvenanceStatus: v.contentProvenanceStatus ?? 'VERIFIED',
      contentCoveragePercent: v.contentCoveragePercent ?? 100,
    })),
    contentManifests:
      input.authority.experienceContentManifests?.map((m) => ({
        stateId: m.stateId,
        manifestId: m.manifestId,
        provenanceStatus: m.provenanceStatus,
      })) ?? [],
  };
}
