import type { ConceptBlueprint, ConceptBlueprintObject } from '../p0vrTwinV22/types.js';
import type { ConceptVisualBlueprint, ConceptVisualObject } from './types.js';

function mapType(o: ConceptVisualObject): ConceptBlueprintObject['type'] {
  if (o.type === 'NAV_ITEM') return 'nav';
  if (o.type === 'METRIC' || o.type === 'STATUS') return 'metric';
  if (o.type === 'IMAGE' || o.type === 'GRAPHIC') return 'image';
  if (o.type === 'DIVIDER' || o.type === 'BORDER') return 'divider';
  if (o.type === 'TEXT' || o.type === 'BUTTON' || o.type === 'ACTIVITY_ROW') return 'text';
  if (o.type.startsWith('PROGRESS')) return 'metric';
  return 'surface';
}

export function convertVisualBlueprintToConceptBlueprint(vb: ConceptVisualBlueprint): ConceptBlueprint {
  const objects: ConceptBlueprintObject[] = vb.objects.map((o) => ({
    objectId: o.objectId,
    parentId: o.parentId,
    role: o.role,
    type: mapType(o),
    bounds: { x: o.x, y: o.y, w: o.width, h: o.height },
    textRole: o.fontRole,
    assetRole: o.assetSlotId ? o.role : null,
    surface: o.background ?? null,
    color: o.color,
    typography: o.fontFamily,
    border: o.border,
    zLayer: o.zIndex,
    interactionRole: o.interactionRole,
    ownership: o.ownership === 'HOST' ? 'HOST_OWNED_LOCKED' : 'CLIENT_OWNED_CREATIVE',
  }));

  return {
    blueprintId: `cbp-${vb.conceptId}`,
    conceptId: vb.conceptId,
    pageStructure: vb.bands.map((b) => b.label).join(' → '),
    sections: vb.bands.map((b) => ({
      id: b.bandId,
      label: b.label,
      bounds: { x: 0.04, y: b.y, w: 0.92, h: b.h },
    })),
    objects,
    grid: { columns: vb.grid.columns, gutterNorm: vb.grid.gutter, marginNorm: vb.grid.margin },
    typography: {
      familyClass: 'ndx_condensed_industrial',
      roles: vb.typographyTokens.map((t) => ({
        role: t.role,
        sizeNorm: t.size,
        weight: t.weight,
        case: 'uppercase',
      })),
    },
    colors: {
      background: vb.colorTokens.filter((c) => c.role.includes('surface')).map((c) => c.value),
      lime: vb.colorTokens.filter((c) => c.role === 'lime').map((c) => c.value),
      surfaces: vb.surfaceTokens,
      dividers: vb.borderTokens,
    },
    surfaces: vb.surfaceTokens,
    dividers: vb.borderTokens,
    assetSlots: vb.assetSlots,
    overlaps: [],
    zLayers: vb.zLayers.map((z) => ({ layer: z.layer, objectIds: z.objectIds })),
    responsiveRelationships: vb.responsiveRules,
    interactionRegions: vb.objects
      .filter((o) => o.interactionRole)
      .map((o) => ({ regionId: o.objectId, role: o.interactionRole! })),
    shellRelationship: vb.hostBoundary,
    createdAt: vb.createdAt,
    status: vb.status === 'LOCKED' ? 'LOCKED' : vb.status === 'RECONCILED' ? 'RECONCILED' : 'DRAFT',
  };
}
