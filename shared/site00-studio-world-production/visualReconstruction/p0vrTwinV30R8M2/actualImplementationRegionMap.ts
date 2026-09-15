import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { CriticalImplementationRegionId } from './constants.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';

export type ActualImplementationRegionEntry = {
  regionId: CriticalImplementationRegionId;
  structuredRegionId: string;
  blueprintRegionId: string;
  implementationComponent: string;
  objectIds: string[];
  visualImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  assetSlotIds: string[];
};

function regionIdForKey(key: string): CriticalImplementationRegionId {
  if (key.startsWith('host-')) return 'HOST_HEADER';
  if (key.startsWith('context-')) return 'PROJECT_CONTEXT';
  if (key === 'context-stage-badge' || key.includes('viewport')) return 'TARGET_VIEWPORT_STAGE';
  if (
    key.includes('dominant-') ||
    key.includes('authority') ||
    key.includes('select-') ||
    key.includes('promote-') ||
    key.includes('pair-review') ||
    key.includes('lock-pair')
  ) {
    return key.includes('authority') || key.includes('select-') || key.includes('promote-') || key.includes('lock-pair') ?
        'AUTHORITY_PANEL'
      : 'HERO_WORKSPACE';
  }
  if (key.includes('gallery')) return 'CANDIDATE_GALLERY';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card'].includes(key)) {
    return 'STRUCTURED_OUTPUT';
  }
  if (key.includes('readiness')) return 'READINESS';
  if (key.includes('history') || key.includes('amendment') || key.includes('concept')) return 'CONCEPT_DATA';
  if (key.startsWith('mobile-nav-')) return 'BOTTOM_NAV';
  return 'HERO_WORKSPACE';
}

export function buildActualImplementationRegionMap(
  composition: MobileTwinCompositionState,
): ActualImplementationRegionEntry[] {
  const buckets = new Map<CriticalImplementationRegionId, ActualImplementationRegionEntry>();

  for (const obj of composition.objectDefinitions) {
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const regionId = regionIdForKey(key);
    const existing = buckets.get(regionId) ?? {
      regionId,
      structuredRegionId: obj.regionId,
      blueprintRegionId: `bp-${obj.regionId}`,
      implementationComponent: `Site00TwinRegion_${regionId}`,
      objectIds: [],
      visualImportance: obj.visualImportance === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      assetSlotIds: [],
    };
    existing.objectIds.push(obj.objectId);
    if (obj.assetRef) existing.assetSlotIds.push(obj.assetRef);
    buckets.set(regionId, existing);
  }

  for (const regionId of ['TARGET_VIEWPORT_STAGE', 'CONCEPT_DATA'] as CriticalImplementationRegionId[]) {
    if (!buckets.has(regionId)) {
      buckets.set(regionId, {
        regionId,
        structuredRegionId: `struct-${regionId.toLowerCase()}`,
        blueprintRegionId: `bp-${regionId.toLowerCase()}`,
        implementationComponent: `Site00TwinRegion_${regionId}`,
        objectIds: [],
        visualImportance: 'MEDIUM',
        assetSlotIds: [],
      });
    }
  }

  return [...buckets.values()];
}
