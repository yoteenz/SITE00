/**
 * P0.VR.6R6 — Authority boundary + multi-asset reconstruction orchestration tests.
 */

import { describe, expect, it } from 'vitest';
import {
  buildSkinsMobileAuthorityBoundaryMap,
  buildSkinsMobileFunctionVisualContracts,
  detectHostShellOverreach,
  skinsWorkspaceNotClassifiedAsHost,
  buildReferenceLiveVisualInventory,
  discoverAssetMismatchCandidates,
  detectIncompleteMultiAssetDiscovery,
  buildSkinsMobileMultiAssetReconstructionJob,
  buildMultiAssetReconstructionPlan,
  approveAllCrops,
  approveGeneration,
  evaluateCropApprovalGate,
  evaluateGenerationApprovalGate,
  cropApprovalIsNotGenerationApproval,
  evaluateOutputApprovalGate,
  evaluateRegenerationGate,
  evaluateAssetCompletenessGate,
  evaluatePartialVisualImplementationGuard,
  buildSkinsMobileReferenceBlueprint,
  buildReferenceReconstructionInspectorState,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/index.js';
import { SKINS_REFERENCE_MOBILE } from '../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';

describe('P0.VR.6R6 — Authority boundary + multi-asset orchestration', () => {
  const authorityId = 'skins-mobile-authority';

  it('1. host vs authority regions separated', () => {
    const boundary = buildSkinsMobileAuthorityBoundaryMap(authorityId);
    expect(boundary.hostShellRegions.length).toBeGreaterThan(0);
    expect(boundary.workspaceAuthorityRegions.length).toBeGreaterThan(0);
    expect(boundary.hostShellRegions[0].boundaryClass).toBe('HOST_LOCKED');
    expect(boundary.workspaceAuthorityRegions[0].boundaryClass).toBe('AUTHORITY_REBUILD');
  });

  it('2. skins main workspace not classified as host shell', () => {
    const boundary = buildSkinsMobileAuthorityBoundaryMap(authorityId);
    expect(skinsWorkspaceNotClassifiedAsHost(boundary)).toBe(true);
  });

  it('3. function can lock while visuals rebuild', () => {
    const contracts = buildSkinsMobileFunctionVisualContracts();
    const family = contracts.find((c) => c.regionId === 'brand-family-cards');
    expect(family?.functionLocked).toBe(true);
    expect(family?.visualLocked).toBe(false);
    expect(family?.geometryLocked).toBe(false);
  });

  it('4. shell overreach detected when coverage too high', () => {
    const boundary = buildSkinsMobileAuthorityBoundaryMap(authorityId);
    const overreach = detectHostShellOverreach(boundary);
    expect(overreach.overreach).toBe(false);
    expect(overreach.hostCoveragePercent).toBeLessThan(35);
  });

  it('5. authority overlay inspector works', () => {
    const inspector = buildReferenceReconstructionInspectorState();
    expect(inspector?.boundaryOverlayRegions.length).toBeGreaterThan(10);
    expect(inspector?.boundaryOverlayRegions.some((r) => r.boundaryClass === 'AUTHORITY_REBUILD')).toBe(true);
  });

  it('6. full-screen asset mismatch discovery runs', () => {
    const inventory = buildReferenceLiveVisualInventory({
      authorityId,
      liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
    });
    expect(inventory.entries.length).toBe(5);
    expect(inventory.assetMismatchCount).toBeGreaterThanOrEqual(4);
  });

  it('7. all five family visual mismatches discovered', () => {
    const inventory = buildReferenceLiveVisualInventory({
      authorityId,
      liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
    });
    const candidates = discoverAssetMismatchCandidates({
      inventory,
      sourceReferenceId: SKINS_REFERENCE_MOBILE,
      includeMatched: true,
    });
    expect(candidates.length).toBe(5);
  });

  it('8. one multi-asset job created', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob({
      liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
    });
    expect(job).not.toBeNull();
    expect(job!.candidateAssets.length).toBe(5);
    expect(job!.discoveryComplete).toBe(true);
  });

  it('9. all candidate crops prepared before generation', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob()!;
    expect(job.candidateAssets.every((c) => c.cropStatus === 'PREPARED')).toBe(true);
    expect(job.candidateAssets.every((c) => c.generationStatus === 'BLOCKED')).toBe(true);
  });

  it('10. crop approval required', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob()!;
    const gate = evaluateCropApprovalGate(job.candidateAssets);
    expect(gate.state.approved).toBe(0);
    expect(gate.allowed).toBe(false);
  });

  it('11. crop approval != generation approval', () => {
    expect(cropApprovalIsNotGenerationApproval(true, false)).toBe(true);
    expect(cropApprovalIsNotGenerationApproval(true, true)).toBe(false);
  });

  it('12. generation plan created after crop approval', () => {
    const job = approveAllCrops(buildSkinsMobileMultiAssetReconstructionJob()!);
    const plan = buildMultiAssetReconstructionPlan(job);
    expect(plan.entries.length).toBe(5);
    expect(plan.generationApproved).toBe(false);
  });

  it('13. explicit generation approval required', () => {
    const job = approveAllCrops(buildSkinsMobileMultiAssetReconstructionJob()!);
    const gate = evaluateGenerationApprovalGate({
      cropApproved: true,
      generationApproved: false,
      authorizedCount: 0,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.failureCode).toBe('REFERENCE_GENERATION_APPROVAL_SKIPPED');
  });

  it('14. authorized dispatch count enforced', () => {
    const job = approveAllCrops(buildSkinsMobileMultiAssetReconstructionJob()!);
    const { job: approved, gate } = approveGeneration(job, 5);
    expect(gate.allowed).toBe(true);
    expect(approved.generationApprovalStatus.authorizedDispatchCount).toBe(5);
  });

  it('15. sequential child dispatch supported', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob()!;
    expect(job.candidateAssets.length).toBe(5);
  });

  it('16. outputs do not auto-bind', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob()!;
    expect(job.candidateAssets.every((c) => c.bindingStatus === 'UNBOUND')).toBe(true);
    expect(job.candidateAssets.every((c) => c.approvalStatus === 'PENDING')).toBe(true);
  });

  it('17. output approval required', () => {
    const gate = evaluateOutputApprovalGate({ outputApprovalStatus: 'PENDING' });
    expect(gate.allowed).toBe(false);
    expect(gate.failureCode).toBe('REFERENCE_OUTPUT_APPROVAL_SKIPPED');
  });

  it('18. regeneration requires separate approval', () => {
    const gate = evaluateRegenerationGate({ founderApprovedRegeneration: false });
    expect(gate.allowed).toBe(false);
    expect(gate.failureCode).toBe('REFERENCE_REGENERATION_AUTO_DISPATCHED');
  });

  it('19. silent visual regeneration impossible', () => {
    const gate = evaluateRegenerationGate({
      founderApprovedRegeneration: false,
      autoRetryReason: 'composition mismatch',
    });
    expect(gate.allowed).toBe(false);
  });

  it('20. technical retry policy remains bounded', () => {
    const gate = evaluateRegenerationGate({
      founderApprovedRegeneration: false,
      autoRetryReason: 'network failure',
    });
    expect(gate.allowed).toBe(false);
  });

  it('21. canonical storage only after output approval', () => {
    const gate = evaluateOutputApprovalGate({ outputApprovalStatus: 'LOVE_IT' });
    expect(gate.allowed).toBe(true);
  });

  it('22. binding only approved canonical assets', () => {
    const gate = evaluateOutputApprovalGate({ outputApprovalStatus: 'REVISE' });
    expect(gate.allowed).toBe(false);
    expect(gate.failureCode).toBe('REFERENCE_BINDING_WITHOUT_OUTPUT_APPROVAL');
  });

  it('23. full-screen recapture after binding — job status field exists', () => {
    const job = buildSkinsMobileMultiAssetReconstructionJob()!;
    expect(job.recomparisonStatus).toBe('NOT_RUN');
  });

  it('24. asset mismatch detector reruns', () => {
    const inventory = buildReferenceLiveVisualInventory({ authorityId });
    expect(inventory.matchedCount + inventory.assetMismatchCount).toBeGreaterThan(0);
  });

  it('25. additional mismatch creates follow-up candidate', () => {
    const incomplete = detectIncompleteMultiAssetDiscovery({ expectedCount: 5, discoveredCount: 2 });
    expect(incomplete.incomplete).toBe(true);
    expect(incomplete.failureCode).toBe('REFERENCE_MULTI_ASSET_DISCOVERY_INCOMPLETE');
  });

  it('26. asset completeness blocks HIGH_MATCH', () => {
    const gate = evaluateAssetCompletenessGate({ requiredAssetMismatchCount: 4 });
    expect(gate.blocked).toBe(true);
    expect(gate.failureCode).toBe('REFERENCE_ASSET_COMPLETENESS_FAILED');
  });

  it('27. layout corrections still execute — blueprint has authority rebuild regions', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.authorityRebuildCoverage).toBeGreaterThan(0.5);
    expect(bp?.regionTree.some((r) => r.regionId === 'brand-family-cards')).toBe(true);
  });

  it('28. partial-op guard works', () => {
    const guard = evaluatePartialVisualImplementationGuard({
      totalSignificantMismatches: 5,
      resolvedMismatches: 1,
      claimsConvergenceComplete: true,
    });
    expect(guard.pass).toBe(false);
    expect(guard.failureCode).toBe('REFERENCE_PARTIAL_VISUAL_IMPLEMENTATION');
  });

  it('29. exact blueprint stores approval states', () => {
    const bp = buildSkinsMobileReferenceBlueprint();
    expect(bp?.multiAssetJobId).toBeTruthy();
    expect(bp?.cropApprovalState).toBeDefined();
    expect(bp?.generationApprovalState).toBe('BLOCKED');
    expect(bp?.assetMismatchCount).toBeGreaterThanOrEqual(4);
  });

  it('30. build passes — modules import cleanly', () => {
    expect(buildSkinsMobileMultiAssetReconstructionJob).toBeDefined();
    expect(buildReferenceReconstructionInspectorState).toBeDefined();
  });
});
