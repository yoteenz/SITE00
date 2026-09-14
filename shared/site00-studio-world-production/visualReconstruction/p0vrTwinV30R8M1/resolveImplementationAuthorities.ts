import type { MobileTwinPipelineState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { resolveMobileTwinReviewSlots } from '../p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { NDXBOOK_PROJECT_CONTEXT_VERSION } from './constants.js';

export type ImplementationAuthorityBundle = {
  actualRenderId: string;
  actualRenderUri: string;
  blueprintRenderId: string;
  blueprintRenderUri: string;
  projectContextVersion: string;
  featureManifestVersion: string;
  designReferenceUri: string | null;
};

export function resolveImplementationAuthorities(
  pipeline: MobileTwinPipelineState,
  pkg: MobileTwinPackage,
): ImplementationAuthorityBundle {
  const slots = resolveMobileTwinReviewSlots(pipeline);
  const actual = slots.actualRender ?? pipeline.renders.find((r) => r.id === pkg.implementationRenderId) ?? null;
  const blueprint =
    slots.blueprintTwin ?? pipeline.blueprintTwins.find((b) => b.id === pkg.blueprintTwinVisualId) ?? null;

  if (!actual?.renderImageUri) throw new Error('IMPLEMENTATION_ACTUAL_AUTHORITY_MISSING');
  if (!blueprint?.twinImageUri) throw new Error('IMPLEMENTATION_BLUEPRINT_AUTHORITY_MISSING');

  const ctx = pkg.projectCreativeContextVersion || pipeline.designReference?.projectCreativeContextVersion;
  if (!ctx) throw new Error('IMPLEMENTATION_PROJECT_CONTEXT_MISSING');

  return {
    actualRenderId: actual.id,
    actualRenderUri: actual.renderImageUri,
    blueprintRenderId: blueprint.id,
    blueprintRenderUri: blueprint.twinImageUri,
    projectContextVersion: ctx,
    featureManifestVersion: pkg.featureManifestVersion,
    designReferenceUri: pipeline.designReference?.sourceImageUri ?? null,
  };
}

export function assertNdxbookProjectContext(version: string): void {
  if (version !== NDXBOOK_PROJECT_CONTEXT_VERSION && !version.includes('ndxbook')) {
    throw new Error('IMPLEMENTATION_PROJECT_CONTEXT_VERSION_MISMATCH');
  }
}
