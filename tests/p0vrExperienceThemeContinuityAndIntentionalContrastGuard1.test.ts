/**
 * P0.VR.EXPERIENCE-THEME-CONTINUITY-AND-INTENTIONAL-CONTRAST-GUARD1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { executePageConceptExperienceExpressionGeneration } from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { pageConceptBeginExperienceExpressionGeneration } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { ExperienceExpressionAuthority } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import {
  classifyAuthorityThemeProfile,
  classifyExperienceVisualStateTheme,
  experienceThemeContinuityBlocksApproval,
  founderThemeReviewLine,
  inferOutputThemeDominance,
  themeLabelForState,
  themePromptBlockForMode,
  validateExperienceThemeContinuity,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceThemeContinuity.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  return listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
}

async function stateAfterMobileConfirmed() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = overviewPageId();
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-theme-guard',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  let state = loadPageConceptGenerationState(PROJECT, pageId);
  const gen = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  state = {
    ...state,
    pipelineSet: gen.pipelineSet,
    generationJobs: [...gen.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  const conceptId = gen.pipelineSet!.mobileConcepts![0]!.conceptId;
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  return r.state;
}

describe('P0.VR.EXPERIENCE-THEME-CONTINUITY-AND-INTENTIONAL-CONTRAST-GUARD1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('classifies NDXBOOK overview mobile authority as LIGHT', () => {
    const profile = classifyAuthorityThemeProfile({
      projectId: 'ndxbook',
      route: '/projects/ndxbook',
      pageId: overviewPageId(),
    });
    expect(profile.authorityTheme).toBe('LIGHT');
    expect(profile.dominantSurface).toBe('LIGHT');
  });

  it('defaults experience prompts to INHERIT_AUTHORITY theme contract language', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    for (const p of begun.authority.expressionPrompts ?? []) {
      expect(p.themeMode ?? 'INHERIT_AUTHORITY').toBe('INHERIT_AUTHORITY');
      expect(p.promptText).toContain('THEME MODE: INHERIT_AUTHORITY');
      expect(themePromptBlockForMode('INHERIT_AUTHORITY', null)).toContain('dominant light theme');
    }
  });

  it('flags global dark drift on light authority as UNJUSTIFIED_THEME_DRIFT', () => {
    const classified = classifyExperienceVisualStateTheme({
      state: {
        stateId: 'entry-detail',
        label: 'ENTRY DETAIL / PANEL',
        patternType: 'EXPANDED_PANEL',
        previewImageUri: 'x',
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
        outputThemeDominance: 'DARK',
      },
      prompt: {
        id: 'p1',
        authorityId: 'a',
        conceptId: 'c',
        route: '/projects/ndxbook',
        expressionType: 'OVERLAY_OR_DETAIL_STATE',
        promptText: '',
        preserveBlock: '',
        changeBlock: '',
        outputIntent: '',
        combinableWith: [],
        priority: 1,
        primaryGoal: '',
        interactionSurface: '',
        antiDriftRules: [],
        themeMode: 'INHERIT_AUTHORITY',
      },
      authorityTheme: 'LIGHT',
    });
    expect(classified.themeContinuityStatus).toBe('UNJUSTIFIED_THEME_DRIFT');
  });

  it('requires rationale for INTENTIONAL_CONTRAST mode', () => {
    const classified = classifyExperienceVisualStateTheme({
      state: {
        stateId: 'menu',
        label: 'MENU / EXPANDED NAV',
        patternType: 'MENU',
        previewImageUri: 'x',
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
        outputThemeDominance: 'MIXED',
      },
      prompt: {
        id: 'p1',
        authorityId: 'a',
        conceptId: 'c',
        route: '/projects/ndxbook',
        expressionType: 'MENU_EXPANDED_NAV',
        promptText: '',
        preserveBlock: '',
        changeBlock: '',
        outputIntent: '',
        combinableWith: [],
        priority: 1,
        primaryGoal: '',
        interactionSurface: '',
        antiDriftRules: [],
        themeMode: 'INTENTIONAL_CONTRAST',
        contrastRationale: null,
      },
      authorityTheme: 'LIGHT',
    });
    expect(classified.themeContinuityStatus).toBe('UNJUSTIFIED_THEME_DRIFT');
  });

  it('allows localized menu MIXED contrast as pending founder review', () => {
    const classified = classifyExperienceVisualStateTheme({
      state: {
        stateId: 'menu',
        label: 'MENU / EXPANDED NAV',
        patternType: 'MENU',
        previewImageUri: 'x',
        caption: '',
        sourceProvider: 'FAL_EXPERIENCE',
        outputThemeDominance: 'MIXED',
      },
      prompt: {
        id: 'p1',
        authorityId: 'a',
        conceptId: 'c',
        route: '/projects/ndxbook',
        expressionType: 'MENU_EXPANDED_NAV',
        promptText: '',
        preserveBlock: '',
        changeBlock: '',
        outputIntent: '',
        combinableWith: [],
        priority: 1,
        primaryGoal: '',
        interactionSurface: '',
        antiDriftRules: [],
        themeMode: 'INHERIT_AUTHORITY',
      },
      authorityTheme: 'LIGHT',
    });
    expect(classified.themeContinuityStatus).toBe('INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW');
    expect(classified.contrastRationale).toContain('archival index layer');
  });

  it('blocks package approval when unjustified theme drift is present', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const driftAuthority: ExperienceExpressionAuthority = {
      ...begun.authority,
      status: 'READY_FOR_REVIEW',
      visualStates: begun.authority.visualStates.map((v) =>
        v.stateId === 'entry-detail' ?
          { ...v, previewImageUri: 'data:image/png;base64,xx', outputThemeDominance: 'DARK' as const }
        : v.stateId === 'base' ?
          { ...v, previewImageUri: begun.mobileConcept.imageUri! }
        : { ...v, previewImageUri: 'data:image/png;base64,xx' },
      ),
    };
    const receipt = validateExperienceThemeContinuity(driftAuthority);
    expect(receipt.ok).toBe(false);
    expect(experienceThemeContinuityBlocksApproval(driftAuthority).blocked).toBe(true);
    await expect(
      runPageConceptViewportFamilyAction(
        {
          ...state,
          pipelineSet: {
            ...state.pipelineSet!,
            experienceExpressionAuthority: driftAuthority,
            experienceExpressionContract: begun.contract,
          },
        },
        { type: 'approveExperienceExpression' },
      ),
    ).rejects.toThrow(/EXPERIENCE_THEME_DRIFT/);
  });

  it('enriches generated package with theme continuity and tablet/desktop metadata', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const { authority } = await executePageConceptExperienceExpressionGeneration({
      authority: begun.authority,
      mobileAuthorityImageUri: begun.mobileConcept.imageUri!,
      planMeta: {
        projectId: PROJECT,
        pageId: overviewPageId(),
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: begun.mobileConcept.conceptId,
      },
      functionContract: state.functionContract!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      injection: state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });
    expect(authority.authorityThemeProfile?.authorityTheme).toBe('LIGHT');
    const menu = authority.visualStates.find((v) => v.stateId === 'menu');
    expect(menu?.themeContinuityStatus).toBe('INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW');
    expect(inferOutputThemeDominance(menu!)).toBe('MIXED');
    const meta = authority.experiencePackageMetadata;
    expect(meta?.generatedOutputs.find((o) => o.outputId === 'menu')?.themeMode).toBe('INHERIT_AUTHORITY');
    expect(meta?.generatedOutputs.find((o) => o.outputId === 'menu')?.themeContinuityStatus).toBe(
      'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW',
    );
  });

  it('exposes review-card theme labels for inherited vs contrast states', () => {
    const inherited = {
      stateId: 'entry-detail',
      label: 'ENTRY DETAIL / PANEL',
      patternType: 'EXPANDED_PANEL' as const,
      previewImageUri: null,
      caption: '',
      themeMode: 'INHERIT_AUTHORITY' as const,
      themeContinuityStatus: 'THEME_MATCH' as const,
    };
    const contrastPending = {
      stateId: 'menu',
      label: 'MENU / EXPANDED NAV',
      patternType: 'MENU' as const,
      previewImageUri: null,
      caption: '',
      themeMode: 'INHERIT_AUTHORITY' as const,
      themeContinuityStatus: 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW' as const,
      contrastRationale: 'Black archival index layer over light authority.',
    };
    expect(themeLabelForState(inherited)).toBe('INHERITED');
    expect(founderThemeReviewLine(inherited)).toBe('THEME MATCH');
    expect(themeLabelForState({ ...contrastPending, themeMode: 'INTENTIONAL_CONTRAST' })).toBe('INTENTIONAL CONTRAST');
    expect(founderThemeReviewLine(contrastPending)).toBe('CONTRAST REVIEW REQUIRED');
  });

  it('supports single-state regeneration with forced authority theme inherit', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const gen = await executePageConceptExperienceExpressionGeneration({
      authority: begun.authority,
      mobileAuthorityImageUri: begun.mobileConcept.imageUri!,
      planMeta: {
        projectId: PROJECT,
        pageId: overviewPageId(),
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: begun.mobileConcept.conceptId,
      },
      functionContract: state.functionContract!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      injection: state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });
    const applied = await runPageConceptViewportFamilyAction(
      {
        ...state,
        pipelineSet: {
          ...state.pipelineSet!,
          experienceExpressionAuthority: gen.authority,
          experienceExpressionContract: begun.contract,
        },
      },
      { type: 'regenerateExperienceExpressionState', stateId: 'menu', forceInheritAuthorityTheme: true },
    );
    const menu = applied.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((v) => v.stateId === 'menu');
    expect(menu?.themeMode).toBe('INHERIT_AUTHORITY');
    expect(menu?.themeContinuityStatus).toBe('THEME_MATCH');
    expect(menu?.outputThemeDominance).toBe('LIGHT');
  });
});
