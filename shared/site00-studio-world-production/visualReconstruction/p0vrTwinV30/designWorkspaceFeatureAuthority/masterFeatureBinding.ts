import type { MasterFeatureBinding } from './types.js';
import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';

export function buildPromotionFeatureBindings(
  master: ViewportMasterAuthority,
  featureIds: string[],
): MasterFeatureBinding[] {
  const viewport = master.viewport === 'MOBILE' ? 'mobile' : 'desktop';
  return featureIds.map((featureId, index) => ({
    id: `mfb-${master.id}-${featureId}-${index}`,
    featureId,
    authorityId: master.id,
    viewport,
    visualRegionId: 'AUTHORITY_WORKSPACE_SURFACE',
    visualObjectIds: [],
    presentationMode: 'NATIVE_TO_TERRITORY',
    interactionIntent: 'FOUNDER_AUTHORITY',
    ownership: 'SHARED',
    structuralBindingState: 'PLANNED',
    functionBindingState: 'PLANNED',
    implementationBindingState: 'UNBOUND',
    qaState: 'UNKNOWN',
  }));
}
