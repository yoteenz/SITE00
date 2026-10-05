import { GENERATED_HOST_BOTTOM_NAV_LABELS } from './constants.js';
import type { GeneratedHostArtifact } from './types.js';
import type { ConceptBlueprint, ConceptBlueprintObject } from '../p0vrTwinV22/types.js';

export function isInventedBottomNavObject(obj: ConceptBlueprintObject): boolean {
  if (obj.type === 'nav' && obj.bounds.y >= 0.82) return true;
  const role = `${obj.role} ${obj.textRole ?? ''} ${obj.interactionRole ?? ''}`.toUpperCase();
  if (obj.bounds.y >= 0.82 && role.includes('HOST')) return true;
  if (obj.objectId.includes('generated-host-bottom') || obj.objectId.includes('host-bottom-nav')) return true;
  const navHit = GENERATED_HOST_BOTTOM_NAV_LABELS.some((label) => role.includes(label));
  if (navHit && obj.bounds.y >= 0.8) return true;
  return false;
}

function isInventedTopHostHeader(obj: ConceptBlueprintObject): boolean {
  if (obj.objectId === 'obj-host-header') return true;
  if (obj.type === 'shell' && obj.bounds.y <= 0.02 && obj.bounds.h <= 0.08) {
    const role = obj.role.toUpperCase();
    if (role.includes('SITE_00') || role.includes('HOST')) return true;
  }
  if (obj.interactionRole === 'host_wayfinding' && obj.bounds.y < 0.1) return true;
  return false;
}

export function detectGeneratedHostArtifacts(input: {
  conceptId: string;
  blueprint: ConceptBlueprint;
}): GeneratedHostArtifact[] {
  const artifacts: GeneratedHostArtifact[] = [];

  for (const obj of input.blueprint.objects) {
    if (isInventedBottomNavObject(obj)) {
      artifacts.push({
        objectId: obj.objectId,
        conceptId: input.conceptId,
        visualBounds: { ...obj.bounds },
        artifactType: 'INVENTED_BOTTOM_NAV',
        reasonExcluded: `Generated host bottom nav (${GENERATED_HOST_BOTTOM_NAV_LABELS.join('/')}) — use ${'TwinSite00HostBottomNav'}`,
        status: 'EXCLUDED_FROM_CLIENT_BUILD',
      });
      continue;
    }
    if (isInventedTopHostHeader(obj)) {
      artifacts.push({
        objectId: obj.objectId,
        conceptId: input.conceptId,
        visualBounds: { ...obj.bounds },
        artifactType: 'INVENTED_TOP_HEADER',
        reasonExcluded: 'Generated SITE 00 global header — host shell is locked product surface',
        status: 'EXCLUDED_FROM_CLIENT_BUILD',
      });
    }
  }

  return artifacts;
}
