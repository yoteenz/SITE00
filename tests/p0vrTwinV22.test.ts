/**
 * P0.VR.TWINV2.2 — Concept gallery, blueprint lineage, build-readiness contract.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  P0_VR_TWIN_V22_BUILD,
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  composeConceptDirectedTwinV2,
  approveActiveConceptCandidate,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  ensureConceptGallery,
  backfillConceptGalleryFromHistory,
  setActiveConceptId,
  getActiveConceptCandidate,
  sortCandidatesForGallery,
  addConceptCandidateFromGeneration,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { generateConceptBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/generateConceptBlueprint.js';
import { reconcileConceptBlueprint } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/reconcileConceptBlueprint.js';
import { generateConceptAssetManifest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/generateConceptAssetManifest.js';
import { generateConceptFunctionBindingPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/generateConceptFunctionBindingPlan.js';
import {
  canBuildConcept,
  computeConceptBuildReadiness,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/computeConceptBuildReadiness.js';
import { buildExecutableConceptPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/buildExecutableConceptPackage.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithConcepts(count: number) {
  let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'gal-1' });
  for (let i = 0; i < count; i++) {
    session = mergeVisualConceptApiResult(session, {
      action: i === 0 ? 'generate' : 'regenerate',
      imageUrl: `/concept-${i + 1}.jpg`,
      imageStorageRef: `ref-${i + 1}`,
    });
  }
  return ensureConceptGallery(session);
}

describe('P0.VR.TWINV2.2 concept gallery + executable package', () => {
  it('1–7 ConceptCandidate model, gallery order, activeConceptId, persistence shape', () => {
    const session = sessionWithConcepts(3);
    const gallery = session.conceptGallery!;
    expect(gallery.buildRef).toBe(P0_VR_TWIN_V22_BUILD);
    expect(gallery.candidates.length).toBe(3);
    expect(gallery.candidates.every((c) => c.conceptBlueprintId && c.assetManifestId)).toBe(true);
    const sorted = sortCandidatesForGallery(gallery.candidates);
    expect(sorted.map((c) => c.versionNumber)).toEqual([1, 2, 3]);
    expect(gallery.activeConceptId).toBe(sorted.at(-1)!.conceptId);
    const switched = setActiveConceptId(session, sorted[0].conceptId);
    expect(getActiveConceptCandidate(switched)?.conceptId).toBe(sorted[0].conceptId);
    expect(JSON.stringify(switched.conceptGallery).length).toBeGreaterThan(100);
  });

  it('2–4 regenerate creates sibling; previous concepts preserved', () => {
    const session = sessionWithConcepts(2);
    const ids = session.conceptGallery!.candidates.map((c) => c.conceptId);
    expect(new Set(ids).size).toBe(2);
    expect(session.conceptGallery!.candidates[0].visualAssetUrl).toBe('/concept-1.jpg');
    expect(session.conceptGallery!.candidates[1].generationType).toBe('REGENERATED');
    expect(session.history.length).toBe(2);
  });

  it('5 refinement creates child with parentConceptId', () => {
    let session = sessionWithConcepts(1);
    const parent = getActiveConceptCandidate(session)!;
    session = mergeVisualConceptApiResult(session, {
      action: 'refine',
      imageUrl: '/concept-refined.jpg',
      imageStorageRef: 'ref-r',
      refineInstruction: 'tighten hero',
      parentVersionId: parent.legacyVersionId ?? undefined,
    });
    const child = session.conceptGallery!.candidates.at(-1)!;
    expect(child.generationType).toBe('REFINED');
    expect(child.parentConceptId).toBe(parent.conceptId);
    expect(session.conceptGallery!.candidates.length).toBe(2);
  });

  it('8–9 backfill existing history without new paid generation', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p-back', sessionId: 'bf-1' });
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/legacy-a.jpg',
      imageStorageRef: null,
    });
    session = mergeVisualConceptApiResult(session, {
      action: 'regenerate',
      imageUrl: '/legacy-b.jpg',
      imageStorageRef: null,
    });
    const stripped = { ...session, conceptGallery: undefined };
    const backfilled = ensureConceptGallery(stripped);
    expect(backfilled.conceptGallery!.candidates.length).toBe(2);
    expect(backfilled.conceptGallery!.candidates[0].generationType).toBe('LEGACY_V2_CONCEPT');
    expect(backfillConceptGalleryFromHistory(backfilled).candidates.length).toBe(2);
  });

  it('10–15 ConceptBlueprint, reconciliation, object inventory, typography/color', () => {
    const session = sessionWithConcepts(1);
    const c = session.conceptGallery!.candidates[0];
    const bp = session.conceptGallery!.blueprints[c.conceptBlueprintId];
    expect(bp.conceptId).toBe(c.conceptId);
    expect(bp.objects.length).toBeGreaterThan(2);
    expect(bp.typography.roles.length).toBeGreaterThan(0);
    expect(bp.colors.lime).toContain('#c8ff00');
    const recon = reconcileConceptBlueprint({
      conceptId: c.conceptId,
      plannedDirection: c.creativeDirection,
      blueprint: bp,
    });
    expect(recon.winner).toBe('GENERATED_VISUAL');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/generateConceptBlueprint.ts')).not.toContain(
      'forensicReplicationBlueprint',
    );
  });

  it('16–18 asset manifest slots and classification', () => {
    const session = sessionWithConcepts(1);
    const c = session.conceptGallery!.candidates[0];
    const manifest = session.conceptGallery!.manifests[c.assetManifestId];
    expect(manifest.slots.some((s) => s.sourceStrategy === 'GENERATED_CONCEPT_ASSET')).toBe(true);
    expect(manifest.slots.some((s) => s.sourceStrategy === 'CONCEPT_REGION_DERIVATION')).toBe(true);
  });

  it('19–20 function binding plan and required function coverage', () => {
    const session = sessionWithConcepts(1);
    const c = session.conceptGallery!.candidates[0];
    const plan = session.conceptGallery!.bindingPlans[c.functionBindingPlanId];
    expect(plan.requiredFunctions.length).toBeGreaterThanOrEqual(8);
    expect(plan.requiredFunctionCoverage).toBeGreaterThanOrEqual(0.75);
    expect(plan.bindings.some((b) => b.visualRegion.includes('PROGRESS'))).toBe(true);
  });

  it('21–23 build readiness, visual-only guard, approval package', () => {
    let session = sessionWithConcepts(1);
    const c = session.conceptGallery!.candidates[0];
    expect(c.buildReadiness.visualReady).toBe(true);
    expect(canBuildConcept(c.buildReadiness, false)).toBe(false);
    session = approveActiveConceptCandidate(session);
    const approved = getActiveConceptCandidate(session)!;
    expect(approved.founderJudgment).toBe('APPROVED');
    expect(approved.visualAuthorityStatus).toBe('LOCKED_FOR_BUILD');
    expect(canBuildConcept(approved.buildReadiness, true)).toBe(true);
    const pkgId = `ecp-${approved.conceptId}`;
    expect(session.conceptGallery!.packages[pkgId]).toBeDefined();
  });

  it('24–28 build requires ExecutableConceptPackage; no image-only build', () => {
    let session = sessionWithConcepts(1);
    expect(() => composeConceptDirectedTwinV2(session)).toThrow(/approve active concept/);
    session = approveActiveConceptCandidate(session);
    const { sessionPatch, functionBindingSummary } = composeConceptDirectedTwinV2(session);
    expect(sessionPatch.renderedTwin?.componentRef).toBe('ConceptDirectedNdxOverviewTwinV2');
    expect(functionBindingSummary.length).toBeGreaterThan(0);
    expect(sessionPatch.conceptGallery?.fidelityReceipts).toBeDefined();
    const bare = { ...session, conceptGallery: { ...session.conceptGallery!, packages: {} } };
    expect(() => composeConceptDirectedTwinV2(bare)).toThrow(/ExecutableConceptPackage required/);
  });

  it('29–31 V1 isolation, live untouched, UI gallery swipe rail', () => {
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/composeFromExecutablePackage.ts')).not.toContain(
      'promoteTwinToLive',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'site00-twin-v2-gallery__rail',
    );
    expect(read('src/site00/styles/site00-twin-v2-concept.css')).toMatch(/scroll-snap|gallery__rail/);
  });

  it('32 first existing concept READY_TO_BUILD proof (no new generation)', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'proof', sessionId: 'proof-1' });
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/existing-only.jpg',
      imageStorageRef: 'stored-ref',
    });
    const c = getActiveConceptCandidate(ensureConceptGallery(session))!;
    expect(c.buildReadiness.status).toBe('READY_TO_BUILD');
    expect(c.buildReadiness.hostBoundaryReady).toBe(true);
    session = approveActiveConceptCandidate(session);
    const approved = getActiveConceptCandidate(session)!;
    const sanitized =
      Object.values(session.conceptGallery!.sanitizedBlueprints).find((b) => b.conceptId === approved.conceptId) ??
      session.conceptGallery!.blueprints[approved.conceptBlueprintId];
    const pkg = buildExecutableConceptPackage({
      candidate: approved,
      blueprint: sanitized,
      manifest: session.conceptGallery!.manifests[approved.assetManifestId],
      bindingPlan: session.conceptGallery!.bindingPlans[approved.functionBindingPlanId],
      shellContract: ['SITE_00 host'],
    });
    expect(pkg.status).toBe('READY');
    expect(P0_VR_TWIN_V22_BUILD).toBe('v362');
  });

  it('blueprint generation is concept-specific from creative direction', () => {
    const session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'bp', sessionId: 'bp-1' });
    const bp = generateConceptBlueprint({
      conceptId: 'cc-test',
      creativeDirection: session.creativeDirection!,
      blueprintGrammar: session.blueprintGrammar,
      imageUrl: '/x.jpg',
    });
    expect(bp.pageStructure).toBe(session.creativeDirection!.heroConcept);
    expect(bp.sections.length).toBeGreaterThan(0);
  });

  it('addConceptCandidateFromGeneration never replaces prior candidate', () => {
    let session = sessionWithConcepts(1);
    const before = session.conceptGallery!.candidates[0].conceptId;
    session = addConceptCandidateFromGeneration(session, {
      generationType: 'DUPLICATED',
      imageUrl: '/dup.jpg',
      imageStorageRef: null,
      creativeDirection: session.creativeDirection!,
    });
    expect(session.conceptGallery!.candidates.length).toBe(2);
    expect(session.conceptGallery!.candidates.some((c) => c.conceptId === before)).toBe(true);
  });
});
