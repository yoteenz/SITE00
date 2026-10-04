/**
 * Studio World resident geometry fabrication — manifest + panel stage pointers (IN_REVIEW only).
 * Full-resolution outputs live under artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/ (not committed as masters).
 */
import {
  RESIDENT_GEOMETRY_FRAMES,
  STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
  type ResidentFabricationProfile,
  type StudioWorldResidentId,
} from '../../../shared/site00-studio-world/resident-fabrication/residentGeometryFrames.js';

export type FabricationApprovalStatus =
  | 'IN_REVIEW'
  | 'FOUNDER_REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'NOT_GENERATED'
  | 'SUPERSEDED_OUTPUT_WRONG_SOURCE';

export type ResidentFabricationFrameRecord = {
  resident_id: StudioWorldResidentId;
  resident_name: string;
  frame_number: number;
  frame_type: string;
  camera_angle: string;
  body_angle: string;
  pose: string;
  expression: string;
  wardrobe_state: 'baseline_controlled';
  identity_source: string;
  identity_source_quality: 'LITE_ONLY' | 'HIGH_RES_ARCHIVE';
  openart_generation_id: string | null;
  openart_output_url: string | null;
  generation_model: string;
  generation_settings: {
    mode: 'image2image';
    quality: 'high';
    resolutionTier: '2k';
    autoEnhancePrompt: false;
    projectId: string;
  };
  approval_status: FabricationApprovalStatus;
  identity_confidence: 'high' | 'medium' | 'low';
  continuity_notes: string;
  retry_count: number;
  created_at: string | null;
  relative_path: string;
  fabrication_asset_id: string;
};

export type ResidentFabricationStagePointers = {
  residentId: StudioWorldResidentId;
  identity: { status: 'IN_REVIEW' | 'PENDING'; portraitAssetId: string; geometryPackPath: string };
  faceGeometry: { status: 'IN_REVIEW' | 'PENDING'; frameNumbers: readonly number[] };
  bodyGeometry: { status: 'IN_REVIEW' | 'PENDING' | 'NOT_GENERATED'; frameNumbers: readonly number[] };
  pose: { status: 'IN_REVIEW' | 'PENDING' | 'NOT_GENERATED'; frameNumbers: readonly number[] };
  performance: { status: 'NOT_GENERATED' };
  wardrobe: { status: 'NOT_GENERATED' };
  continuity: { status: 'NOT_GENERATED' };
};

export const RESIDENT_FABRICATION_OPENART_PROJECT_ID = 'Q7IHYCEK3RPn2c1ConEG';

/** RECOVERY4: geometry batch halted until founder confirms recovered white-tee/red-collar authorities. */
export { listFabricationSourceAuthorities, FABRICATION_BATCH_STATUS } from '../../../shared/site00-studio-world/resident-fabrication/fabricationSourceAuthority.js';

export const RESIDENT_FABRICATION_PACK_ROOT = 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION';

export function fabricationAssetId(residentId: StudioWorldResidentId, frameNumber: number): string {
  const slug = residentId.toLowerCase();
  return `fabrication.${slug}.geometry.f${String(frameNumber).padStart(2, '0')}`;
}

export function buildEmptyResidentFabricationManifest(profile: ResidentFabricationProfile): ResidentFabricationFrameRecord[] {
  const sourceQuality: ResidentFabricationFrameRecord['identity_source_quality'] = 'LITE_ONLY';
  return RESIDENT_GEOMETRY_FRAMES.map((f) => ({
    resident_id: profile.residentId,
    resident_name: profile.displayName,
    frame_number: f.frameNumber,
    frame_type: f.frameType,
    camera_angle: f.cameraAngle,
    body_angle: f.bodyAngle,
    pose: f.pose,
    expression: f.expression,
    wardrobe_state: 'baseline_controlled' as const,
    identity_source: profile.portraitAssetId,
    identity_source_quality: sourceQuality,
    openart_generation_id: null,
    openart_output_url: null,
    generation_model: 'gpt-image-2-5-sunburst',
    generation_settings: {
      mode: 'image2image',
      quality: 'high',
      resolutionTier: '2k',
      autoEnhancePrompt: false,
      projectId: RESIDENT_FABRICATION_OPENART_PROJECT_ID,
    },
    approval_status: 'IN_REVIEW',
    identity_confidence: 'high',
    continuity_notes: profile.registryNotes,
    retry_count: 0,
    created_at: null,
    relative_path: `${RESIDENT_FABRICATION_PACK_ROOT}/${profile.folderName}/${f.folder}/${profile.residentId}_${f.fileSuffix}.png`,
    fabrication_asset_id: fabricationAssetId(profile.residentId, f.frameNumber),
  }));
}

export function buildResidentStagePointers(
  profile: ResidentFabricationProfile,
  frames: readonly ResidentFabricationFrameRecord[],
): ResidentFabricationStagePointers {
  const face = frames.filter((r) => r.frame_number <= 6).map((r) => r.frame_number);
  const body = frames.filter((r) => r.frame_number >= 7 && r.frame_number <= 12).map((r) => r.frame_number);
  const pose = frames.filter((r) => r.frame_number >= 13).map((r) => r.frame_number);
  const anyUrl = (nums: number[]) => nums.every((n) => !!frames.find((f) => f.frame_number === n)?.openart_output_url);
  return {
    residentId: profile.residentId,
    identity: {
      status: 'IN_REVIEW',
      portraitAssetId: profile.portraitAssetId,
      geometryPackPath: `${RESIDENT_FABRICATION_PACK_ROOT}/${profile.folderName}`,
    },
    faceGeometry: {
      status: anyUrl(face) ? 'IN_REVIEW' : 'PENDING',
      frameNumbers: face,
    },
    bodyGeometry: {
      status: body.length && anyUrl(body) ? 'IN_REVIEW' : 'NOT_GENERATED',
      frameNumbers: body,
    },
    pose: {
      status: pose.length && anyUrl(pose) ? 'IN_REVIEW' : 'NOT_GENERATED',
      frameNumbers: pose,
    },
    performance: { status: 'NOT_GENERATED' },
    wardrobe: { status: 'NOT_GENERATED' },
    continuity: { status: 'NOT_GENERATED' },
  };
}

export function buildInitialResidentFabricationManifest(): ResidentFabricationFrameRecord[] {
  return STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.flatMap((p) => buildEmptyResidentFabricationManifest(p));
}

export function buildCastingPanelResidentGeometryMap(): Record<
  StudioWorldResidentId,
  ResidentFabricationStagePointers
> {
  const out = {} as Record<StudioWorldResidentId, ResidentFabricationStagePointers>;
  for (const profile of STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES) {
    const frames = buildEmptyResidentFabricationManifest(profile);
    out[profile.residentId] = buildResidentStagePointers(profile, frames);
  }
  return out;
}
