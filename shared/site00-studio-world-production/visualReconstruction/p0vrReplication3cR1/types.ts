/**
 * P0.VR.REPLICATION.3C-R1 — Hero asset materialization proof types.
 */

export const MATERIALIZATION_FAILURE_STAGES = [
  'AUTHORITY_CROP',
  'ASSET_CREATION',
  'PERSISTENCE',
  'URL_CREATION',
  'SOURCE_BINDING',
  'NETWORK',
  'DECODE',
  'LAYOUT',
  'Z_INDEX',
  'PLACEHOLDER',
  'VISIBLE_RENDER',
  'UNKNOWN',
] as const;

export type MaterializationFailureStage = (typeof MATERIALIZATION_FAILURE_STAGES)[number];

export const MATERIALIZATION_FAILURE_CODES = [
  'AUTHORITY_CROP_INVALID',
  'ASSET_CREATION_FAILED',
  'ASSET_PERSISTENCE_FAILED',
  'ASSET_URL_INVALID',
  'ASSET_URL_404',
  'ASSET_URL_403',
  'ASSET_URL_EXPIRED',
  'ASSET_URL_CORS',
  'ASSET_RESPONSE_EMPTY',
  'ASSET_DECODE_FAILED',
  'ASSET_ZERO_DIMENSIONS',
  'ASSET_HIDDEN_BY_LAYOUT',
  'ASSET_HIDDEN_BY_PLACEHOLDER',
  'STALE_TWIN_RENDERED',
  'STALE_ASSET_MANIFEST',
  'VISIBLE_RENDER_FAILED',
] as const;

export type MaterializationFailureCode = (typeof MATERIALIZATION_FAILURE_CODES)[number];

export const ASSET_BINDING_STAGES = [
  'RESOLVED',
  'PERSISTED',
  'SOURCE_BOUND',
  'REQUESTED',
  'DECODED',
  'VISIBLE',
] as const;

export type AssetBindingStage = (typeof ASSET_BINDING_STAGES)[number];

export type AssetMaterializationTrace = {
  slotId: string;
  authorityCropValid: boolean;
  assetCreated: boolean;
  assetPersisted: boolean;
  urlCreated: boolean;
  sourceBound: boolean;
  requestStatus: number | null;
  contentType: string | null;
  decoded: boolean;
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
  placeholderRemoved: boolean;
  visible: boolean;
  failureStage: MaterializationFailureStage | null;
  failureCode: MaterializationFailureCode | null;
  publicUrl: string | null;
  storageBackend: string | null;
  storagePath: string | null;
  sourceBuildVersion: string | null;
  notes: string;
};

export type HeroMaterializationResult = {
  ok: boolean;
  slotId: string;
  publicUrl: string | null;
  trace: AssetMaterializationTrace;
};
