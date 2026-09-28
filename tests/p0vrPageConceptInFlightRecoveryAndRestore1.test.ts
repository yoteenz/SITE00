/**
 * Stale CGPT_RUNNING must recover to mobile review; GENERATE must not wipe gallery.
 */

import { describe, expect, it } from 'vitest';

import {
  pageConceptGenerationActivelyRunningForUi,
  recoverStalePageConceptInFlightGenerationState,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptInFlightRecovery.js';
import { mergePageConceptTerminalRunResultIntoState } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import { pageConceptConfirmMobileAuthority, pageConceptSelectMobileConcept } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptServerRunSnapshot } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

function mobileReadyState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    generationStatus: 'CGPT_RUNNING',
    activeGenerationStage: 'PAGE_INTELLIGENCE',
    generationJobs: [
      {
        artifactId: 'pcga-MOBILE_CONCEPT_A',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'cap',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractId: 'fc',
        creativeInjectionId: 'inj',
        gpt2AuthorityConceptId: 'concept-a',
        renditionId: 'r1',
        provider: 'GPT2_MOBILE',
        model: 'm',
        providerJobId: 'p1',
        promptVersion: 'v1',
        createdAt: '2026-09-27T12:00:00.000Z',
        status: 'READY',
        artifactPath: null,
        imageUri: 'data:image/png;base64,aaa',
        width: 390,
        height: 844,
      },
    ],
    history: [],
    pipelineSet: {
      pipelineSetId: 'ps1',
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      captureSetId: 'cap',
      creativeInjection: {
        injectionId: 'inj1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        projectContextVersion: '1',
        pageContextVersion: '1',
        functionContractVersion: '1',
        creativeThesis: 't',
        pagePurposeInterpretation: 'overview',
        visualOpportunity: 'v',
        hierarchyDirection: 'h',
        spatialDirection: 's',
        informationPriority: 'i',
        imageDataBalance: 'b',
        responsiveDirection: 'r',
        mobileDirection: 'm',
        desktopDirection: 'd',
        creativeLatitude: 'l',
        immutableRequirements: [],
        referenceStrategy: 'ref',
        assetStrategy: 'assets',
        createdAt: '2026-09-27T12:00:00.000Z',
        cgptProvider: 'anthropic',
        cgptModel: 'claude',
      },
      mobileConcepts: [
        {
          conceptId: 'concept-a',
          slot: 'MOBILE_CONCEPT_A',
          artifactId: 'pcga-MOBILE_CONCEPT_A',
          imageUri: 'data:image/png;base64,aaa',
          status: 'READY',
          createdAt: '2026-09-27T12:00:00.000Z',
        },
      ],
    },
    activeGenerationRunId: 'run-stale',
  };
}

describe('P0 page concept in-flight recovery and terminal merge', () => {
  it('recovers stale CGPT_RUNNING to GPT2_MOBILE_AWAITING_SELECTION when mobile gallery exists', () => {
    const recovered = recoverStalePageConceptInFlightGenerationState(mobileReadyState(), false);
    expect(recovered.generationStatus).toBe('GPT2_MOBILE_AWAITING_SELECTION');
    expect(recovered.activeGenerationStage).toBeNull();
    expect(recovered.liveProgress).toBeNull();
  });

  it('UI actively-running is false for stale CGPT_RUNNING without founder session', () => {
    expect(pageConceptGenerationActivelyRunningForUi(mobileReadyState(), false, false)).toBe(false);
    const emptyInFlight: PageConceptGenerationState = {
      ...mobileReadyState(),
      generationJobs: [],
      pipelineSet: null,
      generationStatus: 'CGPT_RUNNING',
    };
    expect(pageConceptGenerationActivelyRunningForUi(emptyInFlight, false, false)).toBe(false);
  });

  it('terminal run merge preserves confirmed mobile authority', () => {
    let local = mobileReadyState();
    local = pageConceptConfirmMobileAuthority(pageConceptSelectMobileConcept(local, 'concept-a').state).state;
    local = { ...local, generationStatus: 'CGPT_RUNNING' };

    const terminalRun: PageConceptServerRunSnapshot = {
      runId: 'run-123',
      projectId: 'ndxbook',
      pageId: 'page-overview',
      status: 'COMPLETED',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      currentStage: null,
      createdAt: '2026-09-27T12:00:00.000Z',
      updatedAt: '2026-09-27T11:00:00.000Z',
      completedAt: '2026-09-27T12:00:00.000Z',
      jobs: local.generationJobs,
      pipelineSet: {
        ...local.pipelineSet!,
        viewportAuthorityFamily: null,
      },
      plan: null,
      cgptMeta: null,
      panelProgress: null,
      cgptSubsteps: null,
      progressEvents: [],
      latestProgressSequence: 0,
    };

    const merged = mergePageConceptTerminalRunResultIntoState(local, terminalRun, {
      pipelineSet: terminalRun.pipelineSet!,
      jobs: terminalRun.jobs,
    });
    expect(merged.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('CONFIRMED');
  });
});
