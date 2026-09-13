import type { ExecutableConceptPackage } from '../p0vrTwinV22/types.js';

export type PackageValidationResult =
  | { ok: true }
  | { ok: false; code: 'TWIN_V2_EXECUTABLE_PACKAGE_INCOMPLETE'; missing: string[] };

export function validateExecutableConceptPackage(pkg: ExecutableConceptPackage): PackageValidationResult {
  const missing: string[] = [];
  if (!pkg.packageId) missing.push('packageId');
  if (!pkg.conceptId) missing.push('conceptId');
  if (!pkg.visualAuthority?.lockedAt) missing.push('visualAuthority');
  if (!pkg.blueprint?.blueprintId || pkg.blueprint.conceptId !== pkg.conceptId) missing.push('blueprint');
  if (!pkg.assetManifest?.manifestId || pkg.assetManifest.conceptId !== pkg.conceptId) {
    missing.push('assetManifest');
  }
  if (!pkg.functionBindingPlan?.bindingPlanId || pkg.functionBindingPlan.conceptId !== pkg.conceptId) {
    missing.push('functionBindingPlan');
  }
  if (!pkg.shellContract?.length) missing.push('shellContract');
  if (!pkg.hostShellContract) missing.push('hostShellContract');
  if (!pkg.responsiveContract?.length) missing.push('responsiveContract');
  if (missing.length) {
    return { ok: false, code: 'TWIN_V2_EXECUTABLE_PACKAGE_INCOMPLETE', missing };
  }
  return { ok: true };
}

export function assertExecutablePackageLineage(pkg: ExecutableConceptPackage): void {
  const { conceptId } = pkg;
  if (pkg.blueprint.conceptId !== conceptId) {
    throw new Error('TWIN_V2_LINEAGE_MISMATCH: blueprint conceptId !== package conceptId');
  }
  if (pkg.assetManifest.conceptId !== conceptId) {
    throw new Error('TWIN_V2_LINEAGE_MISMATCH: asset manifest conceptId !== package conceptId');
  }
  if (pkg.functionBindingPlan.conceptId !== conceptId) {
    throw new Error('TWIN_V2_LINEAGE_MISMATCH: function plan conceptId !== package conceptId');
  }
}
