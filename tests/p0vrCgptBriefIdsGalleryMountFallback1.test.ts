import { describe, expect, it } from 'vitest';

import { resolveCgptBriefIdsForViewportFamily } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileConceptCatalog.js';
import type { PageConceptPipelineSet } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

describe('resolveCgptBriefIdsForViewportFamily gallery mount fallback', () => {
  it('uses GPT2 job creativeInjectionId when creativeInjection object missing', () => {
    const ps = {
      pipelineSetId: 'ps-mount',
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      captureSetId: 'cap',
    } as PageConceptPipelineSet;
    const ids = resolveCgptBriefIdsForViewportFamily(ps, [
      {
        artifactId: 'a1',
        projectId: 'ndxbook',
        pageId: 'p1',
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: 'cap',
        projectContextVersion: 'pcv',
        pageContextVersion: 'pgv',
        functionContractId: 'fc',
        creativeInjectionId: 'inj-from-job',
        gpt2AuthorityConceptId: 'g1',
        renditionId: 'r1',
        provider: 'GPT2_MOBILE',
        model: 'm',
        providerJobId: 'pj',
        promptVersion: 'v1',
        createdAt: '2026-09-28T00:00:00.000Z',
        status: 'READY',
        artifactPath: null,
        imageUri: null,
        width: 390,
        height: 844,
      },
    ]);
    expect(ids.briefId).toBe('inj-from-job');
  });
});
