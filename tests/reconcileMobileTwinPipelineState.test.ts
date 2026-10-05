import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { buildMobileTwinCompositionState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/buildMobileTwinCompositionState.js';
import { ensureMobileTwinPipelineDefaults } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import {
  isCapabilityTestFounderReviewReady,
  mergeMobileTwinPipelineRich,
  reconcileMobileTwinPipelineState,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import type { MobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';

describe('reconcileMobileTwinPipelineState', () => {
  it('merge keeps twinCapabilityTest when stored pipeline has more renders', async () => {
    let session = ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 'r1', reference: ref });
    comp.status = 'FROZEN';

    const sessionPipeline: MobileTwinPipelineState = {
      ...session.mobileTwinPipeline!,
      compositionStates: [comp],
      twinCapabilityTest: {
        testId: 't1',
        snapshot: {
          id: 'snap',
          referenceAuthorityId: ref.id,
          referenceHash: ref.sourceImageHash,
          compositionStateId: comp.id,
          compositionHash: comp.compositionHash,
          featureManifestVersion: comp.featureManifestVersion,
          projectContextVersion: comp.projectCreativeContextVersion,
          hostProjectContractVersion: comp.hostProjectContractVersion,
          createdAt: new Date().toISOString(),
          status: 'FROZEN',
        },
        actualControlMode: 'SHARED_CANONICAL_ACTUAL',
        canonicalActualRenderId: 'actual-1',
        flowABlueprintId: 'bp-1',
        flowBBlueprintId: null,
        flowAReceiptId: 'tfar-1',
        flowBReceiptId: 'tfbr-1',
        flowAVisualMatchReceiptId: 'a',
        flowBVisualMatchReceiptId: 'b',
        status: 'FOUNDER_REVIEW_READY',
        founderDecision: null,
        founderSelectedStrategy: 'UNRESOLVED',
        idempotencyKey: 'k',
        capabilityTestCostUsd: 0,
        assetJobsDispatched: 0,
        fullPackageFanoutBlocked: true,
      },
      renders: [
        {
          id: 'actual-1',
          compositionStateId: comp.id,
          compositionHash: comp.compositionHash,
          referenceAuthorityId: ref.id,
          renderImageUri: 'https://example.com/a.png',
          renderImageHash: 'ha',
          widthPx: 1080,
          heightPx: 1920,
          provider: 'FAL',
          providerJobRef: 'j1',
          providerModel: 'openai/gpt-image-2/edit',
          providerStatus: 'GENERATED',
          renderMode: 'REAL_PROVIDER_RENDER',
          providerArtifactType: 'REAL_VISUAL_GENERATION',
          status: 'FOUNDER_REVIEW',
          createdAt: new Date().toISOString(),
        },
      ],
      blueprintTwins: [
        {
          id: 'bp-1',
          compositionStateId: comp.id,
          compositionHash: comp.compositionHash,
          implementationRenderId: 'actual-1',
          twinImageUri: 'https://example.com/b.png',
          twinImageHash: 'hb',
          provider: 'FAL',
          providerJobRef: 'j2',
          structuralSource: 'FROZEN_COMPOSITION_STATE',
          outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const storedPipeline: MobileTwinPipelineState = {
      ...sessionPipeline,
      twinCapabilityTest: null,
      mobileTwinVisualGenerationStrategy: 'UNRESOLVED',
      renders: [
        ...sessionPipeline.renders,
        {
          ...sessionPipeline.renders[0],
          id: 'extra-render',
          renderImageUri: 'https://example.com/x.png',
          renderImageHash: 'hx',
        },
      ],
    };

    const merged = mergeMobileTwinPipelineRich(sessionPipeline, storedPipeline)!;
    expect(merged.twinCapabilityTest?.status).toBe('FOUNDER_REVIEW_READY');
    expect(merged.renders.length).toBe(2);
    expect(isCapabilityTestFounderReviewReady(ensureMobileTwinPipelineDefaults(merged))).toBe(true);
  });

  it('reconcile rebuilds capability test from flow A pair alone', () => {
    let session = ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession()));
    const ref = session.mobileTwinPipeline!.designReference!;
    const comp = buildMobileTwinCompositionState({ runId: 'r2', reference: ref });
    const pipeline: MobileTwinPipelineState = {
      ...session.mobileTwinPipeline!,
      compositionStates: [comp],
      twinCapabilityTest: null,
      renders: [
        {
          id: 'actual-x',
          compositionStateId: comp.id,
          compositionHash: comp.compositionHash,
          referenceAuthorityId: ref.id,
          renderImageUri: 'https://fal.media/a.jpg',
          renderImageHash: 'ha',
          widthPx: 1080,
          heightPx: 1920,
          provider: 'FAL',
          providerJobRef: 'j1',
          providerModel: 'm',
          providerStatus: 'GENERATED',
          renderMode: 'REAL_PROVIDER_RENDER',
          providerArtifactType: 'REAL_VISUAL_GENERATION',
          status: 'FOUNDER_REVIEW',
          createdAt: new Date().toISOString(),
        },
      ],
      blueprintTwins: [
        {
          id: 'bp-x',
          compositionStateId: comp.id,
          compositionHash: comp.compositionHash,
          implementationRenderId: 'actual-x',
          twinImageUri: 'https://fal.media/b.jpg',
          twinImageHash: 'hb',
          provider: 'FAL',
          providerJobRef: 'j2',
          structuralSource: 'FROZEN_COMPOSITION_STATE',
          outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const fixed = reconcileMobileTwinPipelineState(pipeline);
    expect(fixed.twinCapabilityTest?.status).toBe('FOUNDER_REVIEW_READY');
    expect(fixed.twinCapabilityTest?.flowABlueprintId).toBe('bp-x');
  });
});
