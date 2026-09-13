import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptCandidate, ConceptGalleryState } from '../p0vrTwinV22/types.js';
import { applyBlueprintOwnershipTags } from './applyBlueprintOwnershipTags.js';
import { sanitizeConceptForHostBoundary } from './sanitizeConceptForHostBoundary.js';
import { buildHostBoundarySanitizationReceipt } from './buildHostBoundarySanitizationReceipt.js';
import { generateConceptAssetManifest } from '../p0vrTwinV22/generateConceptAssetManifest.js';
import { generateConceptFunctionBindingPlan } from '../p0vrTwinV22/generateConceptFunctionBindingPlan.js';
import { computeConceptBuildReadiness } from '../p0vrTwinV22/computeConceptBuildReadiness.js';
import { generateConceptBlueprint } from '../p0vrTwinV22/generateConceptBlueprint.js';
import type { HostBoundarySanitizationReceipt } from './buildHostBoundarySanitizationReceipt.js';

function repairOneCandidate(
  session: ConceptDirectedTwinSession,
  candidate: ConceptCandidate,
  gallery: ConceptGalleryState,
): ConceptCandidate {
  let raw = gallery.blueprints[candidate.conceptBlueprintId];
  if (!raw) {
    raw = generateConceptBlueprint({
      conceptId: candidate.conceptId,
      creativeDirection: candidate.creativeDirection,
      blueprintGrammar: candidate.blueprintGrammarSnapshot,
      imageUrl: candidate.visualAssetUrl,
    });
    raw.blueprintId = candidate.conceptBlueprintId;
    gallery.blueprints[raw.blueprintId] = raw;
  }
  const tagged = applyBlueprintOwnershipTags({ ...raw, status: raw.status ?? 'RECONCILED' }, {
    fullPageConceptImage: Boolean(candidate.visualAssetUrl),
  });
  gallery.blueprints[tagged.blueprintId] = tagged;

  const boundary = sanitizeConceptForHostBoundary({
    conceptId: candidate.conceptId,
    pageId: candidate.pageId,
    blueprint: tagged,
    originalConceptImageUrl: candidate.visualAssetUrl,
  });

  gallery.sanitizedBlueprints[boundary.sanitizedBlueprintId] = boundary.sanitizedBlueprint;
  gallery.generatedHostArtifacts[candidate.conceptId] = boundary.generatedHostArtifacts;
  gallery.ownershipReceipts[candidate.conceptId] = boundary.ownershipReceipt;
  gallery.canvasBoundaries[candidate.conceptId] = boundary.canvasBoundary;
  gallery.hostShellContracts[candidate.conceptId] = boundary.hostShellContract;
  gallery.compositePreviews[candidate.conceptId] = boundary.compositePreview;

  const manifest = generateConceptAssetManifest({
    conceptId: candidate.conceptId,
    blueprint: boundary.sanitizedBlueprint,
    conceptImageUrl: candidate.visualAssetUrl,
    referenceAssets: session.referenceAssets,
  });
  manifest.manifestId = candidate.assetManifestId;
  gallery.manifests[manifest.manifestId] = manifest;

  const bindingPlan = generateConceptFunctionBindingPlan({
    conceptId: candidate.conceptId,
    blueprint: boundary.sanitizedBlueprint,
    functionGraph: candidate.functionGraphSnapshot,
  });
  bindingPlan.bindingPlanId = candidate.functionBindingPlanId;
  gallery.bindingPlans[bindingPlan.bindingPlanId] = bindingPlan;

  const buildReadiness = computeConceptBuildReadiness({
    candidate,
    blueprint: boundary.sanitizedBlueprint,
    manifest,
    bindingPlan,
    hostBoundary: boundary,
  });

  const receipt = buildHostBoundarySanitizationReceipt({
    conceptId: candidate.conceptId,
    originalBlueprint: tagged,
    executionBlueprint: boundary.sanitizedBlueprint,
    generatedHostArtifacts: boundary.generatedHostArtifacts,
    hostShellContract: boundary.hostShellContract,
    hostBoundaryReady: buildReadiness.hostBoundaryReady,
  });
  gallery.hostBoundarySanitizationReceipts = gallery.hostBoundarySanitizationReceipts ?? {};
  gallery.hostBoundarySanitizationReceipts[candidate.conceptId] = receipt;
  gallery.clientCanvasBoundaries = gallery.clientCanvasBoundaries ?? {};
  gallery.clientCanvasTrimReceipts = gallery.clientCanvasTrimReceipts ?? {};
  gallery.clientCanvasBoundaries[candidate.conceptId] = boundary.clientCanvasBoundary;
  gallery.clientCanvasTrimReceipts[candidate.conceptId] = boundary.clientCanvasTrimReceipt;

  return {
    ...candidate,
    originalBlueprintId: tagged.blueprintId,
    executionBlueprintId: boundary.sanitizedBlueprintId,
    buildReadiness,
    updatedAt: new Date().toISOString(),
  };
}

/** Re-bind execution blueprints for persisted galleries (pre-R2R1 localStorage). */
export function repairConceptGalleryHostBoundary(
  session: ConceptDirectedTwinSession,
  gallery: ConceptGalleryState,
): ConceptGalleryState {
  if (!gallery.candidates.length) return gallery;

  const sanitizedBlueprints = { ...(gallery.sanitizedBlueprints ?? {}) };
  const generatedHostArtifacts = { ...(gallery.generatedHostArtifacts ?? {}) };
  const ownershipReceipts = { ...(gallery.ownershipReceipts ?? {}) };
  const canvasBoundaries = { ...(gallery.canvasBoundaries ?? {}) };
  const hostShellContracts = { ...(gallery.hostShellContracts ?? {}) };
  const compositePreviews = { ...(gallery.compositePreviews ?? {}) };
  const hostBoundarySanitizationReceipts = { ...(gallery.hostBoundarySanitizationReceipts ?? {}) };
  const clientCanvasBoundaries = { ...(gallery.clientCanvasBoundaries ?? {}) };
  const clientCanvasTrimReceipts = { ...(gallery.clientCanvasTrimReceipts ?? {}) };
  const blueprints = { ...gallery.blueprints };
  const manifests = { ...gallery.manifests };
  const bindingPlans = { ...gallery.bindingPlans };

  const workingGallery: ConceptGalleryState = {
    ...gallery,
    sanitizedBlueprints,
    generatedHostArtifacts,
    ownershipReceipts,
    canvasBoundaries,
    hostShellContracts,
    compositePreviews,
    hostBoundarySanitizationReceipts,
    clientCanvasBoundaries,
    clientCanvasTrimReceipts,
    blueprints,
    manifests,
    bindingPlans,
  };

  const candidates = gallery.candidates.map((c) => {
    const needsRepair =
      !c.executionBlueprintId ||
      !workingGallery.sanitizedBlueprints[c.executionBlueprintId] ||
      c.buildReadiness.hostBoundaryReady !== true ||
      (workingGallery.generatedHostArtifacts[c.conceptId]?.length ?? 0) === 0 ||
      !workingGallery.clientCanvasBoundaries?.[c.conceptId];
    if (!needsRepair && c.executionBlueprintId && c.originalBlueprintId) {
      return c;
    }
    return repairOneCandidate(session, c, workingGallery);
  });

  return { ...workingGallery, candidates };
}

export type { HostBoundarySanitizationReceipt };
