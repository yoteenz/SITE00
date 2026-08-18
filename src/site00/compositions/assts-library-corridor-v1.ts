import type { EnvironmentCompositionMap } from '../composition/types';

/**
 * Manually authored V1 composition for the locked ASSTS library corridor (9:16).
 * Coordinates derived from the approved corridor asset — central vanishing point protected.
 *
 * Canvas reference: 1080×1920 (canonical mobile environment aspect).
 * object-fit: cover · object-position: center top (matches runtime shell).
 */
export const ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1: EnvironmentCompositionMap = {
  environmentId: 'assts.library.corridor.v1',
  assetId: 's00_env_assts_library_hero',
  version: '1.0.0',
  canvasWidth: 1080,
  canvasHeight: 1920,
  aspectRatio: 1080 / 1920,
  objectFit: 'cover',
  objectPosition: 'center top',
  textContrast: 'dark-on-light',
  analysisStatus: 'APPROVED',
  approvalStatus: 'APPROVED',
  focalPoints: [
    { x: 0.5, y: 0.34, label: 'vanishing-point' },
    { x: 0.5, y: 0.72, label: 'floor-reflection' },
  ],
  cropAnchor: { x: 0.5, y: 0, label: 'top-center' },
  rules: {
    minCorridorVisibility: 0.55,
    contentBelowY: 0.52,
    zoneInsetPx: 8,
  },
  protectedZones: [
    {
      id: 'central-corridor',
      type: 'protected',
      role: 'hero',
      label: 'Central Corridor / Vanishing Point',
      collisionTolerance: 0.06,
      rect: { x: 0.36, y: 0.2, width: 0.28, height: 0.58 },
      notes: 'Persistent UI must not substantially cover the receding arch axis.',
    },
  ],
  preferredZones: [
    {
      id: 'upper-identity',
      type: 'preferred',
      role: 'header',
      label: 'Upper Identity / Header',
      rect: { x: 0.06, y: 0.03, width: 0.88, height: 0.13 },
    },
    {
      id: 'upper-metrics',
      type: 'preferred',
      role: 'metrics',
      label: 'Metrics HUD',
      rect: { x: 0.04, y: 0.155, width: 0.92, height: 0.075 },
    },
    {
      id: 'left-peripheral',
      type: 'preferred',
      role: 'floating-panel-left',
      label: 'Left Alcove / Peripheral',
      rect: { x: 0.02, y: 0.36, width: 0.3, height: 0.22 },
    },
    {
      id: 'right-peripheral',
      type: 'preferred',
      role: 'floating-panel-right',
      label: 'Right Alcove / Peripheral',
      rect: { x: 0.68, y: 0.36, width: 0.3, height: 0.22 },
    },
    {
      id: 'lower-library',
      type: 'preferred',
      role: 'library',
      label: 'Browse Library Content',
      rect: { x: 0.04, y: 0.6, width: 0.92, height: 0.26 },
    },
  ],
  conditionalZones: [
    {
      id: 'status-review',
      type: 'conditional',
      role: 'status',
      label: 'Needs Review / Status',
      rect: { x: 0.06, y: 0.24, width: 0.88, height: 0.1 },
      notes: 'Collapses when zero items need review.',
    },
    {
      id: 'batch-peripheral-band',
      type: 'conditional',
      role: 'content',
      label: 'Recent Batches Peripheral Band',
      rect: { x: 0.04, y: 0.46, width: 0.92, height: 0.12 },
      notes: 'Compact batch modules — flanking corridor, not spanning center.',
    },
  ],
  navigationZones: [
    {
      id: 'bottom-navigation',
      type: 'navigation',
      role: 'navigation',
      label: 'Bottom Navigation Reserved',
      rect: { x: 0.06, y: 0.875, width: 0.88, height: 0.11 },
    },
  ],
};

/** Lookup composition by environment id — extensible for future environments. */
const MAPS: Record<string, EnvironmentCompositionMap> = {
  [ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1.environmentId]: ASSTS_LIBRARY_CORRIDOR_COMPOSITION_V1,
};

export function getEnvironmentCompositionMap(environmentId: string): EnvironmentCompositionMap | null {
  return MAPS[environmentId] ?? null;
}
