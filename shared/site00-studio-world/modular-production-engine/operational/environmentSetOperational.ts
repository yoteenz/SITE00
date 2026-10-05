/**
 * Environment library, sets, zones, camera coverage, anchors.
 */

import type { OwnerScope } from './wardrobeDepartment.js';

export type StudioWorldEnvironment = {
  environmentId: string;
  name: string;
  category: string;
  visualLanguage: string;
  ownerScope: OwnerScope;
  tags: readonly string[];
};

export type CameraCoverageKind =
  | 'WIDE'
  | 'MEDIUM'
  | 'CLOSE'
  | 'REVERSE'
  | 'SIDE'
  | 'OVERHEAD'
  | 'DETAIL'
  | 'ENTRY_ANGLE';

export type SetZone = {
  zoneId: string;
  label: string;
  blockingNotes: string;
};

export type TextAnchor = {
  anchorId: string;
  setId: string;
  position: string;
  surface: string;
  contentType: string;
  replacementRules: string;
  brandOwnership: string;
  approvedAssetId: string | null;
};

export type GraphicAnchor = {
  anchorId: string;
  setId: string;
  position: string;
  graphicType: string;
  approvedAssetId: string | null;
};

export type PropAnchor = {
  anchorId: string;
  setId: string;
  position: string;
  propType: string;
  approvedPropId: string | null;
};

export type StudioWorldSet = {
  setId: string;
  environmentId: string;
  name: string;
  function: string;
  brandCompatibility: readonly string[];
  era: string;
  visualLanguage: string;
  materials: readonly string[];
  lightingModes: readonly string[];
  zones: readonly SetZone[];
  cameraCoverage: readonly { coverage: CameraCoverageKind; referenceAssetId: string | null }[];
  propAnchors: readonly PropAnchor[];
  graphicAnchors: readonly GraphicAnchor[];
  textAnchors: readonly TextAnchor[];
  interactionAnchors: readonly string[];
  campaignHistory: readonly string[];
  exclusivityScope: OwnerScope;
  tags: readonly string[];
  ownerScope: OwnerScope;
};

export type SetSearchOperation = 'REUSE' | 'RESKIN' | 'CUSTOMIZE' | 'NET_NEW';

export function environmentDistinctFromSet(environmentId: string, set: StudioWorldSet): boolean {
  return set.environmentId === environmentId;
}

export type StudioWorldPropLibraryEntry = {
  propId: string;
  name: string;
  tags: readonly string[];
  setCompatibility: readonly string[];
  ownerScope: OwnerScope;
};

export type StudioWorldGraphicLibraryEntry = {
  graphicId: string;
  graphicType: string;
  readableText: boolean;
  tags: readonly string[];
  ownerScope: OwnerScope;
};
