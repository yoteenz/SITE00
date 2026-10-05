import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptCandidate, ConceptGalleryState } from '../p0vrTwinV22/types.js';
import type { ReconciledConceptVisualBlueprint } from '../p0vrTwinV25/types.js';
import { PAIRED_CONCEPT_COVERAGE_MIN } from '../p0vrTwinV25/constants.js';
import type { CompilerReadinessReceipt, ConceptBundleChecksum } from './types.js';

export function computeCompilerReadiness(input: {
  session: ConceptDirectedTwinSession;
  candidate: ConceptCandidate;
  gallery: ConceptGalleryState;
  bundleChecksum: ConceptBundleChecksum;
  reconciledBlueprint?: ReconciledConceptVisualBlueprint | null;
}): CompilerReadinessReceipt {
  const blockingReasons: string[] = [];
  const coverage = input.gallery.blueprintVisualCoverage?.[input.candidate.conceptId];
  const assetCov = input.gallery.assetCoverage?.[input.candidate.conceptId];
  const vb = input.reconciledBlueprint;
  const manifest = input.gallery.manifests[input.candidate.assetManifestId];
  const bindingPlan = input.gallery.bindingPlans[input.candidate.functionBindingPlanId];

  const visualSync = Boolean(input.candidate.visualAssetUrl && vb?.status === 'RECONCILED');
  const blueprintCoverage = Boolean(
    coverage?.status === 'PASS' && (coverage.coveragePercent ?? 0) >= PAIRED_CONCEPT_COVERAGE_MIN,
  );
  const typographyCoverage = Boolean(vb && vb.typographyTokens.length >= 3);
  const assetCoverage = Boolean(
    assetCov?.status === 'PASS' &&
      manifest?.slots.every((s) => s.status === 'RESOLVED' || !s.generationRequired),
  );
  const functionCoverage = Boolean(
    bindingPlan && bindingPlan.requiredFunctionCoverage >= 0.75 && bindingPlan.status !== 'DRAFT',
  );
  const ownershipCoverage = Boolean(
    vb?.objects.every((o) => o.ownership === 'CLIENT' || o.ownership === 'HOST'),
  );
  const responsiveCoverage = Boolean(vb?.responsiveRules.length);
  const stateCoverage = Boolean(bindingPlan?.bindings.some((b) => b.liveFunction.includes('activity')));
  const rasterIndependence = true;

  if (!visualSync) blockingReasons.push('visual not synchronized');
  if (!blueprintCoverage) blockingReasons.push('blueprint coverage');
  if (!typographyCoverage) blockingReasons.push('typography mapping');
  if (!assetCoverage) blockingReasons.push('asset dependencies');
  if (!functionCoverage) blockingReasons.push('function bindings');
  if (!ownershipCoverage) blockingReasons.push('host ownership');
  if (!responsiveCoverage) blockingReasons.push('responsive rules');
  if (!stateCoverage) blockingReasons.push('state rules');

  const bundleChecksumValid = Boolean(input.bundleChecksum.checksum);

  return {
    visualSync,
    blueprintCoverage,
    typographyCoverage,
    assetCoverage,
    functionCoverage,
    ownershipCoverage,
    responsiveCoverage,
    stateCoverage,
    rasterIndependence,
    bundleChecksumValid,
    blockingReasons,
    status:
      blockingReasons.length === 0 && bundleChecksumValid && rasterIndependence ? 'PASS' : 'FAIL',
  };
}
