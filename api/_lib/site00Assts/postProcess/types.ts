/** SITE 00 post-processing — extensible derivative pipeline. */

export type PostProcessDerivativeStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'NEEDS_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'LOCKED'
  | 'FAILED';

export type PostProcessJobStatus = 'QUEUED' | 'PROCESSING' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'LOCKED' | 'FAILED';

export type PostProcessorId = 'BACKGROUND_REMOVE_VIDEO' | 'BACKGROUND_REMOVE_IMAGE';

export type PostProcessorDefinition = {
  id: PostProcessorId;
  label: string;
  provider: 'fal';
  acceptedInputTypes: Array<'video' | 'image'>;
  outputTypes: Array<'video/webm' | 'video/mp4' | 'image/png'>;
  reviewRequired: boolean;
  models: PostProcessModelDefinition[];
};

export type PostProcessModelDefinition = {
  modelId: string;
  label: string;
  notes?: string;
  defaultSettings?: Record<string, unknown>;
};

export type LoaderGeometrySourceMetadata = {
  assetRole: 'LOADER_GEOMETRY_MASTER';
  container: string;
  videoCodec: string;
  audioCodec: string | null;
  width: number;
  height: number;
  frameRate: number;
  durationSeconds: number;
  hasAlpha: boolean;
  fileSizeBytes: number;
  filePath: string;
  publicUrl: string;
  inspectedAt: string;
};

export const LOADER_GEOMETRY_MASTER_ASSET_KEY = 's00_loader_geometry_master';
export const LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY = 's00_loader_geometry_transparent_v01';
export const LOADER_GEOMETRY_MASTER_SLOT = 'site00.loader.geometry.master';
export const LOADER_GEOMETRY_PRODUCTION_SLOT = 'site00.loader.geometry.production';
export const LOADER_POST_PROCESS_JOB_KEY = 'POST-ASSET-LOADER-001';

export const LOADER_GEOMETRY_MASTER_STORAGE_PATH = 'site00/loader/v1/assts-loader-geometry-v1-source.mp4';
export const LOADER_GEOMETRY_MASTER_REMOTE_FILE = 'openart-output_kling-v2_aUsaRicK38pEp4ieayl8.mp4';
