/**
 * Canonical resident geometry-complete registry — single source for Expression, Library, Experience.
 */
import {
  GEOMETRY_COMPLETE_NEW_SLOTS,
  GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
  RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT,
  RESIDENT_OUTFIT_SYSTEM,
  type GeometryCompleteNewSlot,
  type GeometryCompleteSlot,
} from './residentGeometryCompletePack.js';
import {
  RESIDENT_GEOMETRY_FRAMES,
  STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
  type StudioWorldResidentId,
} from './residentGeometryFrames.js';

export type GeometryAssetApprovalStatus =
  | 'IN_REVIEW'
  | 'FOUNDER_REVIEW_REQUIRED'
  | 'APPROVED'
  | 'NOT_GENERATED';

export type ResidentGeometryAssetRecord = {
  resident_id: StudioWorldResidentId;
  resident_name: string;
  asset_role: string;
  frame_type: string;
  camera_angle: string;
  body_angle: string;
  pose: string;
  slot: GeometryCompleteSlot;
  portrait_source_id: string;
  fullbody_source_id: string;
  openart_generation_id: string | null;
  openart_reference_ids: string[];
  output_path: string;
  sha256: string | null;
  approval_status: GeometryAssetApprovalStatus;
  identity_confidence: 'high' | 'medium' | 'low';
  uniform_status: 'LOCKED' | 'DRIFT' | 'UNKNOWN';
  geometry_status: 'VALID' | 'REVIEW' | 'FAILED';
  retry_count: number;
  created_at: string | null;
  fabrication_asset_id: string;
};

export type ResidentGeometryManifest = {
  resident_id: StudioWorldResidentId;
  resident_name: string;
  folder: string;
  outfit_system: (typeof RESIDENT_OUTFIT_SYSTEM)[StudioWorldResidentId];
  portrait_front: string;
  full_body_front: string;
  assets: ResidentGeometryAssetRecord[];
};

export const GEOMETRY_COMPLETE_MANIFEST_RELATIVE = `${RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT}/geometry_complete_master_manifest.json`;

export const GEOMETRY_COMPLETE_PUBLIC_ROOT = 'public/site00/studio-world-residents/geometry-complete-v1';

export function geometryCompletePublicPath(folderName: string, slot: GeometryCompleteSlot): string {
  return `${GEOMETRY_COMPLETE_PUBLIC_ROOT}/${folderName}/${slot}.png`;
}

function frameSpecForSlot(slot: GeometryCompleteNewSlot) {
  const frameId = GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID[slot];
  return RESIDENT_GEOMETRY_FRAMES.find((f) => f.frameId === frameId)!;
}

function fabricationAssetId(residentId: StudioWorldResidentId, slot: GeometryCompleteSlot): string {
  const slug = residentId.toLowerCase();
  const role = slot.replace(/^\d+_/, '').toLowerCase();
  return `geometry.${slug}.${role}`;
}

export function buildEmptyResidentGeometryManifest(residentId: StudioWorldResidentId): ResidentGeometryManifest {
  const profile = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.find((p) => p.residentId === residentId);
  if (!profile) throw new Error(`Unknown resident ${residentId}`);
  const outfit = RESIDENT_OUTFIT_SYSTEM[residentId];
  const assets: ResidentGeometryAssetRecord[] = GEOMETRY_COMPLETE_NEW_SLOTS.map((slot) => {
    const frame = frameSpecForSlot(slot);
    return {
      resident_id: residentId,
      resident_name: profile.displayName,
      asset_role: slot,
      frame_type: frame.frameType,
      camera_angle: frame.cameraAngle,
      body_angle: frame.bodyAngle,
      pose: frame.pose,
      slot,
      portrait_source_id: profile.portraitAssetId,
      fullbody_source_id: `uniform.${residentId.toLowerCase()}.front`,
      openart_generation_id: null,
      openart_reference_ids: [],
      output_path: geometryCompletePublicPath(profile.folderName, slot),
      sha256: null,
      approval_status: 'NOT_GENERATED',
      identity_confidence: 'high',
      uniform_status: 'LOCKED',
      geometry_status: 'REVIEW',
      retry_count: 0,
      created_at: null,
      fabrication_asset_id: fabricationAssetId(residentId, slot),
    };
  });
  return {
    resident_id: residentId,
    resident_name: profile.displayName,
    folder: profile.folderName,
    outfit_system: outfit,
    portrait_front: geometryCompletePublicPath(profile.folderName, '00_APPROVED_PORTRAIT_FRONT'),
    full_body_front: geometryCompletePublicPath(profile.folderName, '00_APPROVED_FULL_BODY_FRONT'),
    assets,
  };
}

export function buildMasterGeometryCompleteManifest(): {
  sprint: string;
  pack_root: string;
  residents: ResidentGeometryManifest[];
} {
  const ids = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.map((p) => p.residentId);
  return {
    sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.GEOMETRY-COMPLETE-PRODUCTION-INJECTION.OPENART1',
    pack_root: RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT,
    residents: ids.map((id) => buildEmptyResidentGeometryManifest(id)),
  };
}

export function listGeometryCompleteResidents(): StudioWorldResidentId[] {
  return STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.map((p) => p.residentId);
}

export function geometrySlotCategory(slot: GeometryCompleteSlot): 'PORTRAIT' | 'BODY' | 'GEOMETRY' | 'POSE' {
  if (slot.includes('PORTRAIT') || slot.includes('PROFILE') || slot.includes('REAR_HEAD')) return 'PORTRAIT';
  if (slot.includes('FULL_BODY') || slot.includes('APPROVED_FULL')) return 'BODY';
  if (slot.includes('SEATED') || slot.includes('CONVERSATIONAL') || slot.includes('WALK') || slot.includes('DOCUMENTARY'))
    return 'POSE';
  return 'GEOMETRY';
}
