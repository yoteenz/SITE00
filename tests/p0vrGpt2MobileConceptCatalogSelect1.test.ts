/**
 * Gallery conceptIds from GPT2 jobs must resolve for founder mobile select.
 */

import { describe, expect, it } from 'vitest';

import {
  ensureGpt2MobileConceptCatalog,
  resolveMobileConceptForSelection,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileConceptCatalog.js';
import { pageConceptSelectMobileConcept } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function jobOnlyState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    generationJobs: [
      {
        artifactId: 'pcga-MOBILE_CONCEPT_C-art',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        renditionSlot: 'RENDITION_C',
        viewport: 'MOBILE',
        captureSetId: 'cap',
        projectContextVersion: 'pcv1',
        pageContextVersion: 'pgv1',
        functionContractId: 'fc1',
        creativeInjectionId: 'inj1',
        gpt2AuthorityConceptId: 'gpt2-mobile-concept-c-alias',
        renditionId: 'r-c',
        provider: 'GPT2_MOBILE',
        model: 'test',
        providerJobId: 'p-c',
        promptVersion: 'v1',
        createdAt: '2026-09-27T12:00:00.000Z',
        status: 'READY',
        artifactPath: null,
        imageUri: 'data:image/png;base64,ccc',
        width: 390,
        height: 844,
        displayTitle: 'Concept C',
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
        projectContextVersion: 'pcv1',
        pageContextVersion: 'pgv1',
        functionContractVersion: 'fc1',
        creativeThesis: 'thesis',
        pagePurposeInterpretation: 'overview',
        visualOpportunity: 'editorial',
        hierarchyDirection: 'clear',
        spatialDirection: 'stack',
        informationPriority: 'progress',
        imageDataBalance: 'balanced',
        responsiveDirection: 'mobile-first',
        mobileDirection: 'compact',
        desktopDirection: 'wide',
        creativeLatitude: 'medium',
        immutableRequirements: [],
        referenceStrategy: 'capture',
        assetStrategy: 'generated',
        createdAt: '2026-09-27T12:00:00.000Z',
        cgptProvider: 'anthropic',
        cgptModel: 'claude',
      },
      mobileConcepts: [],
    },
    activeGenerationRunId: 'run-123',
  };
}

describe('P0 GPT2 mobile concept catalog select', () => {
  it('builds mobileConcepts from READY jobs and selects by gpt2AuthorityConceptId alias', () => {
    const cataloged = ensureGpt2MobileConceptCatalog(jobOnlyState());
    expect(cataloged.pipelineSet?.mobileConcepts?.length).toBe(1);
    const resolved = resolveMobileConceptForSelection(cataloged, 'gpt2-mobile-concept-c-alias');
    expect(resolved?.slot).toBe('MOBILE_CONCEPT_C');

    const selected = pageConceptSelectMobileConcept(cataloged, 'gpt2-mobile-concept-c-alias');
    expect(selected.state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId).toBe(
      resolved!.conceptId,
    );
    expect(selected.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');
  });
});
