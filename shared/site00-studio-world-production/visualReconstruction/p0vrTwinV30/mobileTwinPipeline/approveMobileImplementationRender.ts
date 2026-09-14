import type { DesignPageAuthorityReviewSession } from '../types.js';
import type { MobileImplementationVisualAuthority, MobileTwinCompositionState } from './types.js';
import { assertRenderPassesReferenceCloneFirewall } from './referenceCloneFirewall.js';
import { assertRenderCanBecomeImplementationAuthority, classifyLegacyMobileRender } from './mobileRenderClassification.js';

export function approveMobileImplementationRender(
  session: DesignPageAuthorityReviewSession,
  notes = '',
): DesignPageAuthorityReviewSession {
  void notes;
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.activeRenderId) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  const render = classifyLegacyMobileRender(pipeline.renders.find((r) => r.id === pipeline.activeRenderId)!);
  assertRenderCanBecomeImplementationAuthority(render, pipeline.founderStubOverride);
  assertRenderPassesReferenceCloneFirewall(render);
  if (pipeline.renderGate === 'NEEDS_REFINEMENT' || pipeline.renderGate === 'REJECTED') {
    throw new Error('MOBILE_RENDER_NOT_APPROVED');
  }
  if (render.status !== 'FOUNDER_REVIEW' && render.status !== 'GENERATED') {
    throw new Error('MOBILE_RENDER_NOT_APPROVED');
  }
  const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId);
  if (!composition) throw new Error('MOBILE_COMPOSITION_STATE_MISSING');

  const now = new Date().toISOString();
  const approvedRender = { ...render, status: 'APPROVED' as const };
  const frozenComposition: MobileTwinCompositionState = {
    ...composition,
    status: 'FROZEN',
  };
  const visualAuthority: MobileImplementationVisualAuthority = {
    id: `miva-${render.id}`,
    renderId: render.id,
    sourceProviderJobId: render.providerJobRef,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    referenceAuthorityId: render.referenceAuthorityId,
    featureManifestVersion: composition.featureManifestVersion,
    projectCreativeContextVersion: composition.projectCreativeContextVersion,
    imageUri: render.renderImageUri,
    imageHash: render.renderImageHash,
    approvedAt: now,
    approvedBy: 'founder',
    status: 'FROZEN_IMPLEMENTATION_AUTHORITY',
  };

  return {
    ...session,
    authorityPipeline: session.authorityPipeline ?
      {
        ...session.authorityPipeline,
        executionIntent: 'TRANSLATION',
        inventionBudget: 'NONE',
      }
    : session.authorityPipeline,
    mobileTwinPipeline: {
      ...pipeline,
      renders: pipeline.renders.map((r) => (r.id === render.id ? approvedRender : classifyLegacyMobileRender(r))),
      compositionStates: pipeline.compositionStates.map((c) => (c.id === composition.id ? frozenComposition : c)),
      renderGate: 'FROZEN',
      implementationVisualAuthority: visualAuthority,
      artifactsById: {
        ...pipeline.artifactsById,
        [render.id]: approvedRender,
        [composition.id]: frozenComposition,
        [visualAuthority.id]: visualAuthority,
      },
    },
    updatedAt: now,
  };
}

export function requestMobileRenderRegenerate(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) throw new Error('MOBILE_REFERENCE_MISSING');
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      renderGate: 'REGENERATE_REQUESTED',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function requestMobileRenderRefine(
  session: DesignPageAuthorityReviewSession,
  founderNotes: string[],
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline) throw new Error('MOBILE_REFERENCE_MISSING');
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      renderGate: 'REFINE_REQUESTED',
      artifactsById: {
        ...pipeline.artifactsById,
        'pending-refine-notes': founderNotes,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function selectMobileImplementationRender(
  session: DesignPageAuthorityReviewSession,
  renderId: string,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.renders.some((r) => r.id === renderId)) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      activeRenderId: renderId,
    },
    updatedAt: new Date().toISOString(),
  };
}
