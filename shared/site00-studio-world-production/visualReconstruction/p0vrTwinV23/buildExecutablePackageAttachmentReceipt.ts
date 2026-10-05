import type { ExecutableConceptPackage } from '../p0vrTwinV22/types.js';
import type { ExecutablePackageAttachmentReceipt } from './types.js';

export function buildExecutablePackageAttachmentReceipt(
  pkg: ExecutableConceptPackage,
  builderReceivedPackageId: string,
): ExecutablePackageAttachmentReceipt {
  const visualAttached = Boolean(pkg.visualAuthority?.lockedAt);
  const blueprintAttached = Boolean(pkg.blueprint?.blueprintId && pkg.blueprint.conceptId === pkg.conceptId);
  const assetsAttached = Boolean(
    pkg.assetManifest?.manifestId && pkg.assetManifest.conceptId === pkg.conceptId,
  );
  const functionsAttached = Boolean(
    pkg.functionBindingPlan?.bindingPlanId && pkg.functionBindingPlan.conceptId === pkg.conceptId,
  );
  const hostShellAttached = Boolean(pkg.hostShellContract);
  const responsiveContractAttached = Boolean(pkg.responsiveContract?.length);

  const missing: string[] = [];
  if (!visualAttached) missing.push('visualAuthority');
  if (!blueprintAttached) missing.push('blueprint');
  if (!assetsAttached) missing.push('assetManifest');
  if (!functionsAttached) missing.push('functionBindingPlan');
  if (!hostShellAttached) missing.push('hostShellContract');
  if (!responsiveContractAttached) missing.push('responsiveContract');

  const allTrue =
    visualAttached &&
    blueprintAttached &&
    assetsAttached &&
    functionsAttached &&
    hostShellAttached &&
    responsiveContractAttached &&
    builderReceivedPackageId === pkg.packageId;

  return {
    packageId: pkg.packageId,
    conceptId: pkg.conceptId,
    visualAttached,
    blueprintAttached,
    assetsAttached,
    functionsAttached,
    hostShellAttached,
    responsiveContractAttached,
    builderReceivedPackageId,
    status: allTrue ? 'PASS' : 'FAIL',
    missing: missing.length ? missing : undefined,
  };
}
