import { ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1 } from '../../compositions/assts-library-corridor-v1';
import { flattenZonesFromMap, type CompositionStudioDocument, type CompositionStudioObject } from './types';
import type { NormalizedRect } from '../types';

function zoneRect(map: typeof ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1, id: string, fallback: NormalizedRect): NormalizedRect {
  const all = [
    ...map.protectedZones,
    ...map.preferredZones,
    ...map.conditionalZones,
    ...map.navigationZones,
  ];
  return all.find((z) => z.id === id)?.rect ?? fallback;
}

/** Default interface objects for ASSTS Asset Vault library — maps to V1 zones. */
export function createAsstsLibraryStudioObjects(): CompositionStudioObject[] {
  const map = ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1;
  const mk = (
    id: string,
    label: string,
    role: CompositionStudioObject['semanticRole'],
    zoneId: string,
    text?: CompositionStudioObject['text'],
    sourceType: CompositionStudioObject['sourceType'] = 'ui',
  ): CompositionStudioObject => ({
    id,
    objectClass: sourceType === 'environment-baked' ? 'environment' : 'interface',
    sourceType,
    semanticRole: role,
    label,
    rect: zoneRect(map, zoneId, { x: 0.06, y: 0.1, width: 0.88, height: 0.08 }),
    visible: true,
    positionLocked: false,
    zIndex: 10,
    zoneId,
    text,
    editableProperties:
      sourceType === 'environment-baked'
        ? ['recompose']
        : text
          ? ['position', 'size', 'text', 'visibility', 'alignment']
          : ['position', 'size', 'visibility'],
  });

  return [
    mk('assts-eyebrow', 'SITE 00 · ASSTS', 'header', 'upper-identity', {
      content: 'SITE 00 · ASSTS',
      align: 'left',
      scale: 0.85,
    }),
    mk('assts-title', 'THE ASSET VAULT.', 'primary-copy', 'upper-identity', {
      content: 'THE ASSET VAULT.',
      align: 'left',
      scale: 1,
    }),
    mk('assts-tagline', 'EVERYTHING WE BUILD LIVES HERE.', 'secondary-copy', 'upper-identity', {
      content: 'EVERYTHING WE BUILD LIVES HERE.',
      align: 'left',
      scale: 0.9,
    }),
    {
      ...mk('assts-metrics', 'Metrics HUD', 'metrics', 'upper-metrics'),
      rect: zoneRect(map, 'upper-metrics', { x: 0.04, y: 0.155, width: 0.92, height: 0.075 }),
      zIndex: 12,
    },
    {
      ...mk('assts-review', 'Needs Your Review', 'status', 'status-review'),
      rect: zoneRect(map, 'status-review', { x: 0.06, y: 0.24, width: 0.88, height: 0.1 }),
      zIndex: 14,
    },
    {
      ...mk('assts-batches', 'Recent Batches', 'content', 'batch-peripheral-band'),
      rect: zoneRect(map, 'batch-peripheral-band', { x: 0.04, y: 0.46, width: 0.92, height: 0.12 }),
      zIndex: 13,
    },
    {
      ...mk('assts-library', 'Browse Library', 'library', 'lower-library'),
      rect: zoneRect(map, 'lower-library', { x: 0.04, y: 0.6, width: 0.92, height: 0.26 }),
      zIndex: 11,
    },
    {
      ...mk('assts-navigation', 'Bottom Navigation', 'navigation', 'bottom-navigation'),
      rect: zoneRect(map, 'bottom-navigation', { x: 0.06, y: 0.875, width: 0.88, height: 0.11 }),
      zIndex: 20,
    },
    {
      id: 'assts-corridor-architecture',
      objectClass: 'environment',
      sourceType: 'environment-baked',
      semanticRole: 'hero',
      label: 'Central Corridor Architecture',
      rect: zoneRect(map, 'central-corridor', { x: 0.36, y: 0.2, width: 0.28, height: 0.58 }),
      visible: true,
      positionLocked: true,
      zIndex: 0,
      zoneId: 'central-corridor',
      editableProperties: ['recompose'],
    },
  ];
}

export function createAsstsLibraryStudioDocument(environmentAssetUrl?: string): CompositionStudioDocument {
  const map = ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1;
  const now = new Date().toISOString();
  return {
    id: `comp-${map.environmentId}-${Date.now()}`,
    environmentId: map.environmentId,
    environmentAssetUrl,
    baseMap: map,
    objects: createAsstsLibraryStudioObjects(),
    zones: flattenZonesFromMap(map),
    focalPoints: [...map.focalPoints],
    cropAnchor: { ...map.cropAnchor },
    architecturalGuides: map.focalPoints.map((fp, i) => ({
      id: `guide-${i}`,
      kind: fp.label === 'vanishing-point' ? 'vanishing-point' : 'focal-object',
      x: fp.x,
      y: fp.y,
      label: fp.label,
    })),
    status: 'ORIGINAL_ANALYSIS',
    version: '1.0.0',
    versionLabel: 'ORIGINAL_ANALYSIS',
    createdAt: now,
    updatedAt: now,
    validationOverrides: [],
  };
}
