import type { BlueprintGrammar, PageCreativeDirection } from '../p0vrTwinV21/types.js';
import { isHostOwnedBlueprintLabel } from '../p0vrTwinV22R2/isHostOwnedBlueprintLabel.js';
import type { ConceptBlueprint, ConceptBlueprintObject } from './types.js';

/** Normalized height of SITE 00 global host header on the concept artboard (not client masthead). */
const CONCEPT_HOST_HEADER_NORM = 0.07;

/** Concept-specific blueprint from creative direction + post-image band plan (not V1 forensic blueprint). */
export function generateConceptBlueprint(input: {
  conceptId: string;
  creativeDirection: PageCreativeDirection;
  blueprintGrammar: BlueprintGrammar;
  imageUrl: string | null;
}): ConceptBlueprint {
  const now = new Date().toISOString();
  const blueprintId = `cbp-${input.conceptId}`;
  const bands = input.creativeDirection.sectionOrder.length
    ? input.creativeDirection.sectionOrder
    : input.blueprintGrammar.informationBands;

  const clientBands = bands.filter((label) => !isHostOwnedBlueprintLabel(label));
  const sectionHeight = 0.84 / Math.max(clientBands.length, 1);
  const sections = clientBands.map((label, i) => ({
    id: `sec-${i + 1}`,
    label,
    bounds: {
      x: 0.04,
      y: CONCEPT_HOST_HEADER_NORM + i * sectionHeight,
      w: 0.92,
      h: sectionHeight * 0.85,
    },
  }));

  const objects: ConceptBlueprintObject[] = [];
  sections.forEach((sec, si) => {
    objects.push({
      objectId: `obj-${si + 1}-shell`,
      parentId: sec.id,
      role: input.creativeDirection.sectionRoles[sec.label] ?? sec.label,
      type: sec.label.toLowerCase().includes('hero') ? 'image' : 'surface',
      bounds: { x: sec.bounds.x, y: sec.bounds.y, w: sec.bounds.w, h: sec.bounds.h * 0.4 },
      textRole: sec.label.toLowerCase().includes('hero') ? 'headline' : 'label',
      assetRole: sec.label.toLowerCase().includes('hero') ? 'hero_editorial' : null,
      surface: sec.label.toLowerCase().includes('hero') ? 'black_hero' : 'white_band',
      color: sec.label.toLowerCase().includes('hero') ? '#0a0a0a' : '#ffffff',
      typography: 'condensed_editorial',
      border: 'strong_divider_bottom',
      zLayer: si + 2,
      interactionRole: sec.label.toLowerCase().includes('nav') ? 'navigation' : null,
    });
    if (sec.label.toLowerCase().includes('metric') || sec.label.toLowerCase().includes('progress')) {
      objects.push({
        objectId: `obj-${si + 1}-metrics`,
        parentId: sec.id,
        role: 'metric_row',
        type: 'metric',
        bounds: { x: 0.06, y: sec.bounds.y + sec.bounds.h * 0.45, w: 0.88, h: 0.08 },
        textRole: 'metric',
        assetRole: null,
        surface: 'compact_status',
        color: '#c8ff00',
        typography: 'condensed_caps',
        border: null,
        zLayer: si + 3,
        interactionRole: null,
      });
    }
  });

  objects.unshift({
    objectId: 'obj-host-header',
    parentId: null,
    role: 'SITE_00 host chrome',
    type: 'shell',
    bounds: { x: 0, y: 0, w: 1, h: CONCEPT_HOST_HEADER_NORM },
    textRole: 'host_label',
    assetRole: null,
    surface: 'host_white',
    color: '#ffffff',
    typography: 'system_caps',
    border: 'divider',
    zLayer: 1,
    interactionRole: 'host_wayfinding',
  });

  return {
    blueprintId,
    conceptId: input.conceptId,
    pageStructure: input.creativeDirection.heroConcept,
    sections,
    objects,
    grid: { columns: 12, gutterNorm: 0.04, marginNorm: 0.04 },
    typography: {
      familyClass: 'ndx_condensed_industrial',
      roles: [
        { role: 'headline', sizeNorm: 0.042, weight: '700', case: 'uppercase' },
        { role: 'body', sizeNorm: 0.028, weight: '400', case: 'mixed' },
        { role: 'metric', sizeNorm: 0.022, weight: '600', case: 'uppercase' },
      ],
    },
    colors: {
      background: ['#ffffff', '#0a0a0a'],
      lime: ['#c8ff00'],
      surfaces: ['white_band', 'black_hero', 'host_white'],
      dividers: ['#111111'],
    },
    surfaces: ['white_band', 'black_hero', 'editorial_image_field'],
    dividers: ['strong_divider_bottom', 'band_separator'],
    assetSlots: objects.filter((o) => o.assetRole).map((o) => o.objectId),
    overlaps: [{ above: 'obj-1-shell', below: 'obj-host-header' }],
    zLayers: [{ layer: 1, objectIds: ['obj-host-header'] }],
    responsiveRelationships: ['375px mobile artboard — normalized 0–1 coords'],
    interactionRegions: objects
      .filter((o) => o.interactionRole)
      .map((o) => ({ regionId: o.objectId, role: o.interactionRole! })),
    shellRelationship: 'NDXBOOK client body inside SITE 00 host header + bottom nav',
    createdAt: now,
    status: 'DRAFT',
  };
}
