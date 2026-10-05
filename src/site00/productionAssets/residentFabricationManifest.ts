/**
 * Studio World resident geometry fabrication — manifest + panel stage pointers (IN_REVIEW only).
 * Full-resolution outputs live under artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/.
 */
import {
  RESIDENT_GEOMETRY_FRAMES,
  STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
  type ResidentFabricationProfile,
  type StudioWorldResidentId,
} from '../../../shared/site00-studio-world/resident-fabrication/residentGeometryFrames.js';
import {
  GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID,
  RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT,
} from '../../../shared/site00-studio-world/resident-fabrication/residentGeometryCompletePack.js';
import {
  buildMasterGeometryCompleteManifest,
  geometryCompletePublicPath,
  type ResidentGeometryAssetRecord,
} from '../../../shared/site00-studio-world/resident-fabrication/residentGeometryCompleteRegistry.js';

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

export const RESIDENT_FABRICATION_PACK_ROOT = RESIDENT_GEOMETRY_COMPLETE_PACK_ROOT;

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

function geometryAssetToFrameRecord(asset: ResidentGeometryAssetRecord): ResidentFabricationFrameRecord {
  const frameId = GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID[asset.slot as keyof typeof GEOMETRY_COMPLETE_SLOT_TO_FRAME_ID];
  const frame = RESIDENT_GEOMETRY_FRAMES.find((f) => f.frameId === frameId);
  const frameNumber = frame?.frameNumber ?? 0;
  return {
    resident_id: asset.resident_id,
    resident_name: asset.resident_name,
    frame_number: frameNumber,
    frame_type: asset.frame_type,
    camera_angle: asset.camera_angle,
    body_angle: asset.body_angle,
    pose: asset.pose,
    expression: frame?.expression ?? 'neutral',
    wardrobe_state: 'baseline_controlled',
    identity_source: asset.portrait_source_id,
    identity_source_quality: 'LITE_ONLY',
    openart_generation_id: asset.openart_generation_id,
    openart_output_url: asset.sha256 ? `/${asset.output_path.replace(/^public\//, '')}` : null,
    generation_model: 'gpt-image-2-5-sunburst',
    generation_settings: {
      mode: 'image2image',
      quality: 'high',
      resolutionTier: '2k',
      autoEnhancePrompt: false,
      projectId: RESIDENT_FABRICATION_OPENART_PROJECT_ID,
    },
    approval_status: asset.approval_status === 'NOT_GENERATED' ? 'NOT_GENERATED' : asset.approval_status,
    identity_confidence: asset.identity_confidence,
    continuity_notes: `${asset.slot} uniform=${asset.uniform_status}`,
    retry_count: asset.retry_count,
    created_at: asset.created_at,
    relative_path: asset.output_path,
    fabrication_asset_id: asset.fabrication_asset_id,
  };
}

export function buildInitialResidentFabricationManifest(): ResidentFabricationFrameRecord[] {
  const master = buildMasterGeometryCompleteManifest();
  const fromComplete = master.residents.flatMap((r) => r.assets.map(geometryAssetToFrameRecord));
  const anchors = STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES.flatMap((p) => {
    const portrait = RESIDENT_GEOMETRY_FRAMES.find((f) => f.frameId === '01_FRONT_PORTRAIT')!;
    const fullFront = RESIDENT_GEOMETRY_FRAMES.find((f) => f.frameId === '07_FULL_FRONT')!;
    return [portrait, fullFront].map((f) => {
      const base = buildEmptyResidentFabricationManifest(p).find((x) => x.frame_number === f.frameNumber)!;
      return {
        ...base,
        approval_status: 'APPROVED' as FabricationApprovalStatus,
        relative_path:
          f.frameId === '01_FRONT_PORTRAIT'
            ? geometryCompletePublicPath(p.folderName, '00_APPROVED_PORTRAIT_FRONT')
            : geometryCompletePublicPath(p.folderName, '00_APPROVED_FULL_BODY_FRONT'),
      };
    });
  });
  return [...anchors, ...fromComplete];
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
