/**
 * P0.VR.TWINV3.0R8M3 — forensic blueprint ingestion + merged object map + DOM rebuild
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { isProductionReadyImplementationDocument } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/implementationDocumentValidity.js';
import { compileVisualMobileTwinImplementationR8M2R5 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/compileVisualMobileTwinImplementationR8M2R5.js';
import { clearForensicBlueprintCacheForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_INGESTION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M3,
  P0_VR_TWIN_V30R8M3_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M3/constants.js';
import {
  assertForensicBlueprintAvailableIfConfigured,
  buildForensicBlueprintIngestionReceipt,
  getActiveForensicBlueprintForPackage,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M3/ingestForensicBlueprint.js';
import { renderTreeStructureSignatureR8M3 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M3/staleRenderTreeReuseFirewallR8M3.js';
import { readFileSync } from 'node:fs';

function founderCompileInput() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  session = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
  const pipeline = session.mobileTwinPipeline!;
  return { pipeline, packageId: pipeline.latestPackageId! };
}

describe('P0.VR.TWINV3.0R8M3 forensic ingestion pipeline', () => {
  beforeEach(() => {
    clearForensicBlueprintCacheForTests();
  });

  it('ingests existing forensic blueprint as implementation spec (no regeneration)', () => {
    const input = founderCompileInput();
    const priorR5 = compileVisualMobileTwinImplementationR8M2R5(input);
    const artifact = getActiveForensicBlueprintForPackage({
      packageId: input.packageId,
      authority: priorR5.forensicUiBlueprintAuthority,
    });
    expect(artifact?.artifactKind).toBe('FORENSIC_BLUEPRINT_IMPLEMENTATION_SPEC');
    assertForensicBlueprintAvailableIfConfigured(artifact);
    const receipt = buildForensicBlueprintIngestionReceipt({ packageId: input.packageId, artifact: artifact! });
    expect(receipt.noRegeneration).toBe(true);
  });

  it('production compile produces cleaned + merged maps and fm3 render tree', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M3);
    expect(doc.lineage).toBe(P0_VR_TWIN_V30R8M3_LINEAGE);
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_INGESTION);
    expect(doc.forensicBlueprintArtifact?.classification).toBe('FORENSIC_BLUEPRINT_MACHINE_USABLE_WITH_VALIDATION');
    expect(doc.cleanedForensicObjectMapReceipt?.cleanedObjectCount).toBeGreaterThan(10);
    expect(doc.mergedImplementationObjectMap?.objects.length).toBeGreaterThan(10);
    expect(doc.forensicIngestionDrivenCompile).toBe(true);
    expect(doc.renderTree?.nodes.every((n) => n.sectionId.startsWith('fm3-'))).toBe(true);
    expect(isProductionReadyImplementationDocument(doc)).toBe(true);
  });

  it('fidelity receipt reports translation layer and material improvement', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    const fr = doc.forensicReconstructionFidelityReceipt;
    expect(fr?.forensicEvidenceConsumed).toBe(true);
    expect(fr?.regionDeltas.length).toBeGreaterThan(5);
    expect(fr?.translationLayerEffect.materialImprovement).toBe(true);
  });

  it('stale tree firewall rejects R8M2R5 reuse', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2R5(input);
    const doc = compileApprovedMobileTwinPackage(input);
    expect(renderTreeStructureSignatureR8M3(prior)).not.toBe(renderTreeStructureSignatureR8M3(doc));
  });

  it('UI surfaces ingestion evidence in inspector', () => {
    const inspector = readFileSync(
      'src/site00/components/designWorkspace/DesignTwinForensicImplementationInspector.tsx',
      'utf8',
    );
    expect(inspector).toContain('twin-forensic-ingestion-status');
    expect(inspector).toContain('forensicBlueprintArtifact');
  });
});
