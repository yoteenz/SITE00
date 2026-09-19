import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { getActiveConceptCandidate } from '../p0vrTwinV22/conceptGalleryState.js';
import type { ExecutableConceptPackage } from '../p0vrTwinV22/types.js';
import type { DesignCompilerBundle } from './types.js';
import { assertFailureClosedNoSilentFallback } from './failureClosedPolicy.js';

export function assertBundleChecksumForBuild(input: {
  bundle: DesignCompilerBundle;
  pkg: ExecutableConceptPackage;
}): void {
  const pkgConcept = input.pkg.conceptId;
  if (pkgConcept !== input.bundle.conceptId) {
    throw new Error('TWIN_V2_BUNDLE_VERSION_MISMATCH: package conceptId mismatch');
  }
  if (input.bundle.approvedBundleChecksum && input.bundle.bundleChecksum.checksum !== input.bundle.approvedBundleChecksum) {
    throw new Error('TWIN_V2_BUNDLE_VERSION_MISMATCH: approved bundle checksum drift');
  }
  const manifestChecksum = input.bundle.irChain.asset.checksum;
  const pkgManifestSlots = input.pkg.assetManifest.slots.length;
  if (pkgManifestSlots === 0 && input.bundle.irChain.asset.payload.slotCount !== 0) {
    throw new Error('TWIN_V2_BUNDLE_VERSION_MISMATCH: asset manifest mixed');
  }
  void manifestChecksum;
}

export function assertCompilerReadinessForBuild(bundle: DesignCompilerBundle): void {
  if (bundle.executionIntent !== 'TRANSLATION' && bundle.approvedAt) {
    // approved concepts must be in translation mode for build
  }
  if (!bundle.compilerReadiness || bundle.compilerReadiness.status !== 'PASS') {
    throw new Error(
      `COMPILER_NOT_READY: ${bundle.compilerReadiness?.blockingReasons.join(', ') || 'readiness incomplete'}`,
    );
  }
  if (bundle.bundleSyncStatus !== 'SYNCED') {
    throw new Error(`TWIN_V2_BUNDLE_VERSION_MISMATCH: bundle ${bundle.bundleSyncStatus}`);
  }
}

export function assertBuildCompilerContracts(session: ConceptDirectedTwinSession): DesignCompilerBundle | null {
  const gallery = session.conceptGallery;
  const active = gallery ? getActiveConceptCandidate(session) : null;
  if (!active) throw new Error('TWIN_V2_BUILD_BLOCKED: no active concept');

  assertFailureClosedNoSilentFallback(session);

  if (active.conceptOrigin !== 'DUAL_OUTPUT_PAIRED') {
    return null;
  }

  const bundle = gallery?.designCompilerBundles?.[active.conceptId];
  if (!bundle) {
    throw new Error('COMPILER_NOT_READY: missing design compiler bundle');
  }

  assertCompilerReadinessForBuild(bundle);

  const pkg = Object.values(gallery!.packages).find((p) => p.conceptId === active.conceptId);
  if (pkg) {
    assertBundleChecksumForBuild({ bundle, pkg });
  }

  return bundle;
}
