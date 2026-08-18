/**
 * ASSTS Library Home — composition anchors (legacy ids + region map).
 * Reference canvas: 711×1536 (approved coordinate map v1).
 */

export {
  ASSTS_LIBRARY_HOME_COMPOSITION_ID,
  ASSTS_LIBRARY_HOME_REFERENCE_CANVAS as ASSTS_LIBRARY_HOME_REFERENCE,
  ASSTS_LIBRARY_HOME_REGIONS,
  ASSTS_LIBRARY_HOME_Y_LANDMARKS,
  type LibraryHomeRegionId as AsstsLibraryHomeAnchorId,
} from './library-home-composition-map';

import { LIBRARY_HOME_ANCHOR_TO_REGION } from './library-home-composition-map';

export function libraryHomeAnchorAttr(id: string): { 'data-anchor': string } {
  return { 'data-anchor': id };
}

export function libraryHomeRegionForAnchor(anchorId: string): string | undefined {
  return LIBRARY_HOME_ANCHOR_TO_REGION[anchorId];
}
