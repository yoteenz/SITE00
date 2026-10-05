import { describe, expect, it } from 'vitest';
import {
  mergeMobileTwinPipelinePreferRenders,
  slimMobileTwinPipelineForStorage,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('mobileTwinPipelinePersistence', () => {
  it('prefers pipeline row with more renders when merging storage', () => {
    const empty = emptyMobileTwinPipelineState();
    const withRender = {
      ...empty,
      renders: [
        {
          id: 'r1',
          compositionStateId: 'c1',
          compositionHash: 'abc',
          referenceAuthorityId: 'ref',
          renderImageUri: 'https://fal.media/render.webp',
          renderImageHash: 'hash',
          widthPx: 100,
          heightPx: 200,
          provider: 'FAL' as const,
          providerJobRef: 'job',
          renderMode: 'REAL_PROVIDER_RENDER' as const,
          status: 'FOUNDER_REVIEW' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      activeRenderId: 'r1',
      renderGate: 'FOUNDER_REVIEW' as const,
      falJobsDispatched: 1,
    };
    const merged = mergeMobileTwinPipelinePreferRenders(empty, withRender)!;
    expect(merged.renders).toHaveLength(1);
    expect(merged.activeRenderId).toBe('r1');
  });

  it('slims inactive composition object definitions', () => {
    const state = emptyMobileTwinPipelineState();
    state.activeCompositionStateId = 'c-active';
    state.compositionStates = [
      {
        id: 'c-active',
        projectId: 'ndxbook',
        workspaceType: 'DESIGN_PAGE_V3',
        viewport: 'MOBILE',
        referenceAuthorityId: 'ref',
        featureManifestVersion: 'design-workspace-feature-manifest-v1',
        projectCreativeContextVersion: 'ndxbook-pilot-r4-v1',
        hostProjectContractVersion: 'site00-design-host-project-v1',
        compositionVersion: 1,
        objectDefinitions: [{ objectId: 'o1' } as never],
        regionDefinitions: [],
        typographyDefinitions: [],
        assetSlots: [],
        functionTargets: [],
        featureBindings: [],
        ownershipBindings: [],
        stateDefinitions: [],
        interactionDefinitions: [],
        relationships: [],
        zOrder: [],
        responsiveIntent: 'MOBILE_ONLY',
        providerMetadata: { provider: 'FAL', model: 'x', jobRef: null },
        compositionHash: 'deadbeef',
        status: 'FROZEN',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c-old',
        projectId: 'ndxbook',
        workspaceType: 'DESIGN_PAGE_V3',
        viewport: 'MOBILE',
        referenceAuthorityId: 'ref',
        featureManifestVersion: 'design-workspace-feature-manifest-v1',
        projectCreativeContextVersion: 'ndxbook-pilot-r4-v1',
        hostProjectContractVersion: 'site00-design-host-project-v1',
        compositionVersion: 1,
        objectDefinitions: [{ objectId: 'o-old' } as never],
        regionDefinitions: [],
        typographyDefinitions: [],
        assetSlots: [],
        functionTargets: [],
        featureBindings: [],
        ownershipBindings: [],
        stateDefinitions: [],
        interactionDefinitions: [],
        relationships: [],
        zOrder: [],
        responsiveIntent: 'MOBILE_ONLY',
        providerMetadata: { provider: 'FAL', model: 'x', jobRef: null },
        compositionHash: 'cafebabe',
        status: 'GENERATED',
        createdAt: new Date().toISOString(),
      },
    ];
    const slim = slimMobileTwinPipelineForStorage(state);
    expect(slim.compositionStates.find((c) => c.id === 'c-active')!.objectDefinitions.length).toBe(1);
    expect(slim.compositionStates.find((c) => c.id === 'c-old')!.objectDefinitions.length).toBe(0);
  });
});
