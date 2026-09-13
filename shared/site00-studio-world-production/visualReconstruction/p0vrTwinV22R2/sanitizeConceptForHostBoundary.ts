import type { ConceptBlueprint } from '../p0vrTwinV22/types.js';
import { buildDefaultNdxbookMobileHostShellContract } from './hostShellContract.js';
import { buildHostShellCompositePreview } from './hostShellCompositePreview.js';
import { detectGeneratedHostArtifacts } from './detectGeneratedHostArtifacts.js';
import { resolveOwnershipReceipt } from './resolveOwnershipReceipt.js';
import { buildNdxbookMobileTwinV2CanvasBoundary } from './twinV2CanvasBoundary.js';
import type { SanitizedConceptBoundaryResult } from './types.js';

export function sanitizeConceptForHostBoundary(input: {
  conceptId: string;
  pageId: string;
  blueprint: ConceptBlueprint;
  originalConceptImageUrl: string | null;
}): SanitizedConceptBoundaryResult {
  const hostShellContract = buildDefaultNdxbookMobileHostShellContract();
  const canvasBoundary = buildNdxbookMobileTwinV2CanvasBoundary(input.pageId);
  const generatedHostArtifacts = detectGeneratedHostArtifacts({
    conceptId: input.conceptId,
    blueprint: input.blueprint,
  });
  const artifactIds = new Set(generatedHostArtifacts.map((a) => a.objectId));

  const sanitizedObjects = input.blueprint.objects
    .filter((o) => !artifactIds.has(o.objectId))
    .map((o) => ({
      ...o,
      ownership: o.ownership ?? 'CLIENT_OWNED_CREATIVE',
      isGeneratedHostArtifact: false,
    }));

  const sanitizedBlueprintId = `${input.blueprint.blueprintId}-sanitized`;
  const sanitizedBlueprint: ConceptBlueprint = {
    ...input.blueprint,
    blueprintId: sanitizedBlueprintId,
    objects: sanitizedObjects,
    shellRelationship: 'Sanitized NDXBOOK client canvas — host shell from HostShellContract only',
    status: input.blueprint.status === 'DRAFT' ? 'RECONCILED' : input.blueprint.status,
  };

  const ownershipReceipt = resolveOwnershipReceipt({
    conceptId: input.conceptId,
    blueprint: input.blueprint,
    generatedHostArtifacts,
  });

  const compositePreview = buildHostShellCompositePreview({
    conceptId: input.conceptId,
    originalConceptImageUrl: input.originalConceptImageUrl,
    clientCanvasImageUrl: input.originalConceptImageUrl,
    hostShellContract,
  });

  return {
    conceptId: input.conceptId,
    originalBlueprintId: input.blueprint.blueprintId,
    sanitizedBlueprintId,
    sanitizedBlueprint,
    generatedHostArtifacts,
    ownershipReceipt,
    canvasBoundary,
    hostShellContract,
    compositePreview,
    originalConceptImagePreserved: Boolean(input.originalConceptImageUrl),
  };
}
