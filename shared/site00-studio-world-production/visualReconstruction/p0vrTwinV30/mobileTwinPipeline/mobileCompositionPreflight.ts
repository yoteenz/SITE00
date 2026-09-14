import { DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from '../designWorkspaceFeatureAuthority/featureDefinitionsV1.js';
import { DESIGN_WORKSPACE_FEATURE_MANIFEST_V1 } from '../constants.js';
import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';

export type MobileCompositionPreflightResult = {
  pass: boolean;
  errors: string[];
};

export function runMobileCompositionPreflight(input: {
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
}): MobileCompositionPreflightResult {
  const errors: string[] = [];
  if (input.reference.status !== 'REFERENCE_LOCKED') errors.push('MOBILE_REFERENCE_MISSING');
  if (!input.composition.compositionHash) errors.push('MOBILE_COMPOSITION_STATE_MISSING');
  if (input.composition.featureManifestVersion !== DESIGN_WORKSPACE_FEATURE_MANIFEST_V1) {
    errors.push('FEATURE_MANIFEST_STALE');
  }
  if (input.composition.referenceAuthorityId !== input.reference.id) {
    errors.push('REFERENCE_AUTHORITY_MISMATCH');
  }
  for (const fid of DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1) {
    if (!input.composition.featureBindings.some((fb) => fb.featureId === fid)) {
      errors.push(`FEATURE_BINDING_GAP:${fid}`);
    }
  }
  return { pass: errors.length === 0, errors };
}
