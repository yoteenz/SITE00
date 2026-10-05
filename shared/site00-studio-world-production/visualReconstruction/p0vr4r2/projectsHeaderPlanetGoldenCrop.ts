/**
 * P0.VR.4R2 — Projects Header Planet golden object bounds (946×667 source).
 *
 * Root-cause fix: prior 220×220 region captured only the central red core (feature point),
 * clipping outer diagonal orbit, circular orbit, and satellite elements.
 */

import type { SourcePixelBounds } from './types.js';

export const PROJECTS_REFERENCE_SOURCE_WIDTH = 946;
export const PROJECTS_REFERENCE_SOURCE_HEIGHT = 667;

/** Full object bounding box — NOT a feature/saliency point. */
export const PROJECTS_HEADER_PLANET_OBJECT_BOUNDS: SourcePixelBounds = {
  x: 528,
  y: 42,
  width: 365,
  height: 318,
};

export const PROJECTS_HEADER_PLANET_PADDING_PERCENT = 0.1;

/** Expected final crop after 10% padding + clamp (golden fixture). */
export const PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS: SourcePixelBounds = {
  x: 492,
  y: 10,
  width: 438,
  height: 382,
};

/** @deprecated Use PROJECTS_HEADER_PLANET_OBJECT_BOUNDS — old tiny core-only crop */
export const PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS: SourcePixelBounds = {
  x: 565,
  y: 52,
  width: 220,
  height: 220,
};

export function isLegacyBadPlanetCrop(bounds: SourcePixelBounds): boolean {
  return bounds.width <= 230 && bounds.height <= 230 && bounds.x >= 560;
}
