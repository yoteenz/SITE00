import type { DesignPageAuthorityReviewSession } from '../types.js';
import { classifyLegacyMobileRender } from './mobileRenderClassification.js';

export const FOUNDER_MOBILE_RENDER_REJECT_REASONS = [
  'TOO_CLOSE_TO_REFERENCE',
  'LOST_APPROVED_COMPOSITION',
  'TOO_GENERIC_SAAS_DRIFT',
  'FEATURE_MANIFEST_NOT_RESOLVED',
  'PROJECT_ATMOSPHERE_LOST',
  'HOST_PROJECT_FIREWALL_BROKEN',
  'CONTENT_TOO_PLACEHOLDER_LIKE',
  'NEEDS_MORE_IMPLEMENTATION_RESOLUTION',
] as const;

export type FounderMobileRenderRejectReason = (typeof FOUNDER_MOBILE_RENDER_REJECT_REASONS)[number];

export function rejectMobileImplementationRender(
  session: DesignPageAuthorityReviewSession,
  reason: FounderMobileRenderRejectReason,
  notes?: string,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.activeRenderId) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  const render = classifyLegacyMobileRender(
    pipeline.renders.find((r) => r.id === pipeline.activeRenderId)!,
  );
  if (render.status !== 'FOUNDER_REVIEW' && render.status !== 'GENERATED') {
    throw new Error('MOBILE_RENDER_NOT_APPROVED');
  }

  const rejectedRender = {
    ...render,
    status: 'SUPERSEDED' as const,
    founderRejectReason: reason,
    founderRejectNotes: notes ?? null,
  };

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      renders: pipeline.renders.map((r) => (r.id === render.id ? rejectedRender : classifyLegacyMobileRender(r))),
      renderGate: reason === 'TOO_CLOSE_TO_REFERENCE' ? 'NEEDS_REFINEMENT' : 'REJECTED',
      artifactsById: {
        ...pipeline.artifactsById,
        [render.id]: rejectedRender,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
