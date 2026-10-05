import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { CRITICAL_RECONSTRUCTION_REGIONS } from './constants.js';
import type { ActualToCodeReconstructionDirective } from './actualFirstTypes.js';

export function buildActualToCodeReconstructionDirective(input: {
  packageId: string;
  actualAuthorityId: string;
  blueprintAuthorityId: string;
  translationBriefId: string;
  expressionIrId: string;
}): ActualToCodeReconstructionDirective {
  const body = JSON.stringify({
    ...input,
    targetMode: 'PIXEL_FIDELITY_RECONSTRUCTION',
    visualAuthority: 'APPROVED_ACTUAL',
  });
  return {
    id: `atcrd-${fnv1aHex(body).slice(0, 12)}`,
    ...input,
    targetMode: 'PIXEL_FIDELITY_RECONSTRUCTION',
    visualAuthority: 'APPROVED_ACTUAL',
    creativeFreedom: 'NONE',
    layoutInvention: 'FORBIDDEN',
    styleInvention: 'FORBIDDEN',
    genericComponentSubstitution: 'FORBIDDEN',
    runtimeAuthorityRasterUsage: 'FORBIDDEN',
    screenshotComparisonRequired: true,
    iterativeCorrectionRequired: true,
    regionReconstructionRules: [...CRITICAL_RECONSTRUCTION_REGIONS],
    hash: fnv1aHex(body),
    status: 'ACTIVE',
  };
}
