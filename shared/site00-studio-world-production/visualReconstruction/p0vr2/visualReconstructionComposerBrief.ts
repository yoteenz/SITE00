import { CANONICAL_VIEWPORT_DIMENSIONS, DEFAULT_QA_THRESHOLDS, P0_VR_2_LINEAGE } from './constants.js';
import { createDefaultFunctionPreservingVisualRebuildContract } from './functionPreservingVisualRebuildContract.js';
import type { CanonicalVisualReference, VisualReconstructionComposerBrief } from './types.js';
import { findDesignScreen } from './designScreenRegistry.js';

export function buildVisualReconstructionComposerBrief(input: {
  reference: CanonicalVisualReference;
  targetDomRoots?: string[];
  replaceableVisualRegions?: string[];
  assetDependencies?: string[];
}): VisualReconstructionComposerBrief {
  const contract = createDefaultFunctionPreservingVisualRebuildContract();
  const screen = findDesignScreen(input.reference.projectId, input.reference.screenId);
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[input.reference.viewportClass];

  return {
    briefId: `brief-${input.reference.referenceId}-${Date.now()}`,
    projectId: input.reference.projectId,
    screenId: input.reference.screenId,
    route: input.reference.route,
    viewportClass: input.reference.viewportClass,
    viewportWidth: input.reference.viewportWidth ?? viewport.width,
    viewportHeight: input.reference.viewportHeight ?? viewport.height,
    scope: input.reference.scope,
    referenceId: input.reference.referenceId,
    referenceStoragePath: input.reference.storagePath,
    referenceImageUrl: input.reference.storagePath,
    targetDomRoots: input.targetDomRoots ?? [screen?.scopeTargetId ?? `[data-visual-reconstruction="${input.reference.screenId}"]`],
    preservedBehaviors: [
      'routing',
      'click handlers',
      'notification behavior',
      'project menu behavior',
      'data fetching',
      'accessibility labels',
    ],
    replaceableVisualRegions: input.replaceableVisualRegions ?? [
      'viewport',
      'shell',
      'header',
      'content_frame',
      'major_regions',
      'assets',
      'typography',
    ],
    assetDependencies: input.assetDependencies ?? [],
    qaThresholds: DEFAULT_QA_THRESHOLDS,
    preservationContract: contract,
    visualReplacementContract: contract,
    coreRule: 'REFERENCE_IS_DESIGN_AUTHORITY',
    parentGeometryFirst: true,
    textDescriptionIsPrimaryAuthority: false,
    actualReferenceRequired: true,
    generatedAt: new Date().toISOString(),
  };
}

export function composerBriefIncludesActualReference(brief: VisualReconstructionComposerBrief): boolean {
  return Boolean(brief.referenceStoragePath && brief.referenceImageUrl && brief.actualReferenceRequired);
}

export function composerBriefLineage(): string {
  return P0_VR_2_LINEAGE;
}
