import { GENERATED_HOST_BOTTOM_NAV_LABELS } from './constants.js';
import type { VisualOwnership } from './types.js';
import type { ConceptBlueprint, ConceptBlueprintObject } from '../p0vrTwinV22/types.js';

function tagObject(obj: ConceptBlueprintObject, ownership: VisualOwnership, extra?: Partial<ConceptBlueprintObject>): ConceptBlueprintObject {
  return { ...obj, ownership, ...extra };
}

/** Tag blueprint objects + add typical full-page invented host chrome from image models. */
export function applyBlueprintOwnershipTags(blueprint: ConceptBlueprint, opts?: { fullPageConceptImage?: boolean }): ConceptBlueprint {
  const fullPage = opts?.fullPageConceptImage ?? true;
  const objects: ConceptBlueprintObject[] = blueprint.objects.map((obj) => {
    if (obj.objectId === 'obj-host-header') {
      return tagObject(obj, 'HOST_OWNED_LOCKED', { isGeneratedHostArtifact: true });
    }
    if (obj.interactionRole === 'host_wayfinding') {
      return tagObject(obj, 'HOST_OWNED_LOCKED', { isGeneratedHostArtifact: true });
    }
    if (obj.type === 'nav' && obj.bounds.y >= 0.82) {
      return tagObject(obj, 'HOST_OWNED_LOCKED', { isGeneratedHostArtifact: true });
    }
    return tagObject(obj, 'CLIENT_OWNED_CREATIVE');
  });

  if (fullPage && !objects.some((o) => o.objectId === 'obj-generated-host-bottom-nav')) {
    objects.push({
      objectId: 'obj-generated-host-bottom-nav',
      parentId: null,
      role: GENERATED_HOST_BOTTOM_NAV_LABELS.join(' · '),
      type: 'nav',
      bounds: { x: 0, y: 0.9, w: 1, h: 0.1 },
      textRole: 'host_bottom_nav',
      assetRole: null,
      surface: 'generated_host_nav',
      color: '#ffffff',
      typography: 'system_caps',
      border: 'top_divider',
      zLayer: 99,
      interactionRole: 'host_wayfinding',
      ownership: 'HOST_OWNED_LOCKED',
      isGeneratedHostArtifact: true,
    });
  }

  return { ...blueprint, objects };
}
