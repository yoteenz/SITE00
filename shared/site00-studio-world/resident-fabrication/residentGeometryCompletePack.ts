/**
 * Geometry-complete sprint pack layout (14 new frames + 2 approved anchors per resident).
 * Maps sprint folder slot names to canonical RESIDENT_GEOMETRY_FRAMES frame ids.
 */
import type { ResidentGeometryFrameId } from './residentGeometryFrames.js';

export const RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT =
  'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE' as const;

export type GeometryCompleteAnchorSlot =
  | '00_APPROVED_PORTRAIT_FRONT'
  | '00_APPROVED_FULL_BODY_FRONT';

export type GeometryCompleteNewSlot =
  | '01_PORTRAIT_LEFT_3Q'
  | '02_PORTRAIT_RIGHT_3Q'
  | '03_PROFILE_LEFT'
  | '04_PROFILE_RIGHT'
  | '05_REAR_HEAD'
  | '06_FULL_BODY_LEFT_3Q'
  | '07_FULL_BODY_RIGHT_3Q'
  | '08_FULL_BODY_LEFT_PROFILE'
  | '09_FULL_BODY_RIGHT_PROFILE'
  | '10_FULL_BODY_BACK'
  | '11_SEATED_NEUTRAL'
  | '12_STANDING_CONVERSATIONAL'
  | '13_NATURAL_WALK'
  | '14_DOCUMENTARY_CAMERA_AWARE';

export type GeometryCompleteSlot = GeometryCompleteAnchorSlot | GeometryCompleteNewSlot;

export const GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID: Record<GeometryCompleteNewSlot, ResidentGeometryFrameId> = {
  '01_PORTRAIT_LEFT_3Q': '02_LEFT_3Q_PORTRAIT',
  '02_PORTRAIT_RIGHT_3Q': '03_RIGHT_3Q_PORTRAIT',
  '03_PROFILE_LEFT': '04_LEFT_PROFILE',
  '04_PROFILE_RIGHT': '05_RIGHT_PROFILE',
  '05_REAR_HEAD': '06_REAR_HEAD',
  '06_FULL_BODY_LEFT_3Q': '08_FULL_LEFT_3Q',
  '07_FULL_BODY_RIGHT_3Q': '09_FULL_RIGHT_3Q',
  '08_FULL_BODY_LEFT_PROFILE': '10_FULL_LEFT_PROFILE',
  '09_FULL_BODY_RIGHT_PROFILE': '11_FULL_RIGHT_PROFILE',
  '10_FULL_BODY_BACK': '12_FULL_BACK',
  '11_SEATED_NEUTRAL': '13_SEATED',
  '12_STANDING_CONVERSATIONAL': '14_CONVERSATIONAL',
  '13_NATURAL_WALK': '15_WALK',
  '14_DOCUMENTARY_CAMERA_AWARE': '16_DOCUMENTARY',
};

export const GEOMETRY_COMPLETE_NEW_SLOTS: readonly GeometryCompleteNewSlot[] = Object.keys(
  GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
) as GeometryCompleteNewSlot[];

export const GEOMETRY_COMPLETE_FRAMES_PER_RESIDENT = 14;

export type ResidentOutfitSystem = 'WOMEN_LEGGINGS' | 'MEN_COMPRESSION_SHORTS';

export const RESIDENT_OUTFIT_SYSTEM: Record<`SW-${string}`, ResidentOutfitSystem> = {
  'SW-001': 'WOMEN_LEGGINGS',
  'SW-002': 'WOMEN_LEGGINGS',
  'SW-003': 'MEN_COMPRESSION_SHORTS',
  'SW-004': 'MEN_COMPRESSION_SHORTS',
  'SW-005': 'MEN_COMPRESSION_SHORTS',
  'SW-006': 'WOMEN_LEGGINGS',
  'SW-007': 'MEN_COMPRESSION_SHORTS',
  'SW-008': 'MEN_COMPRESSION_SHORTS',
};

export function geometryCompleteAssetRole(slot: GeometryCompleteSlot): string {
  if (slot.startsWith('00_')) return slot.replace('00_APPROVED_', '').toLowerCase();
  return slot.toLowerCase();
}

export function geometryCompleteRelativePath(folderName: string, slot: GeometryCompleteSlot, ext = 'png'): string {
  return `${RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT}/${folderName}/${slot}.${ext}`;
}
