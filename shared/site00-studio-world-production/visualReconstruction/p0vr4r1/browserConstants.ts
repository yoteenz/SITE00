/**
 * P0.VR.4R1 — Browser-safe constants (no Node / FAL imports).
 */

export const PROJECTS_HEADER_PLANET_SLOT_ID = 'site00:projects-index:header-planet-icon';
export const LIVE_BINDINGS_REGISTRY_PATH = 'public/studio-world/design/design-asset-live-bindings.json';

export const PROJECTS_INDEX_APPROVED_REFERENCE_PATH =
  '/visual-references/founder/site00/projects-index-approved-reference.jpg';

export type CropRegion = { x: number; y: number; width: number; height: number; padding?: number };

export const PROJECTS_HEADER_PLANET_CROP: CropRegion = {
  x: 565,
  y: 52,
  width: 220,
  height: 220,
  padding: 16,
};
