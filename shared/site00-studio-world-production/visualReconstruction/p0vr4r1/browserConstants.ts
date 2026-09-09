/**
 * P0.VR.4R1 — Browser-safe constants (no Node / FAL imports).
 */

export const PROJECTS_HEADER_PLANET_SLOT_ID = 'site00:projects-index:header-planet-icon';
export const LIVE_BINDINGS_REGISTRY_PATH = 'public/studio-world/design/design-asset-live-bindings.json';

export const PROJECTS_INDEX_APPROVED_REFERENCE_PATH =
  '/visual-references/founder/site00/projects-index-approved-reference.jpg';

export type CropRegion = { x: number; y: number; width: number; height: number; padding?: number };

/** @deprecated P0.VR.4R2 — use PROJECTS_HEADER_PLANET_OBJECT_BOUNDS from p0vr4r2 */
export const PROJECTS_HEADER_PLANET_CROP: CropRegion = {
  x: 528,
  y: 42,
  width: 365,
  height: 318,
  padding: 0,
};
