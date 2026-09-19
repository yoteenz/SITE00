/**
 * P0.VR.CONVERGE.1 — Per-region twin build execution decisions.
 */

import type { AuthorityRelativeForensicsReport } from '../p0vrDiag1/types.js';
import type { PageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { RegionExecutionDecision } from './types.js';
import { confidenceForMode, executionModeForRegion } from './reconstructionConfidencePolicy.js';

export function buildRegionExecutionDecisions(input: {
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  authorityVersionId: string;
}): RegionExecutionDecision[] {
  const majorIds = new Set(input.profile.regions.filter((r) => r.significance === 'MAJOR').map((r) => r.regionId));
  return input.report.regionForensics
    .filter((b) => majorIds.has(b.regionId))
    .map((bundle) => {
      const mode = executionModeForRegion(bundle);
      const warnings: string[] = [];
      if (mode !== 'MEASURED' && mode !== 'HIGH_CONFIDENCE') {
        warnings.push('FOUNDER REVIEW REQUIRED');
      }
      if (mode === 'VISUAL_INFERENCE' || mode === 'CONSERVATIVE_ADAPTATION') {
        warnings.push('FORENSIC WARNING — authority geometry + current function');
      }
      const evidenceUsed: string[] = [];
      if (bundle.dimensions.length) evidenceUsed.push('QUALIFIED_FORENSIC_EVIDENCE');
      if (bundle.internalStructure?.anchorHierarchy?.length) evidenceUsed.push('INTERNAL_STRUCTURE');
      if (!evidenceUsed.length) evidenceUsed.push('AUTHORITY_VISUAL_GEOMETRY');

      return {
        regionId: bundle.regionId,
        regionName: bundle.regionName,
        executionMode: mode,
        evidenceUsed,
        authorityVersionId: input.authorityVersionId,
        currentComponentTarget: bundle.componentTarget?.componentId ?? bundle.componentTarget?.selector ?? null,
        warnings,
        confidence: confidenceForMode(mode),
        status: 'INCLUDED' as const,
      };
    });
}
