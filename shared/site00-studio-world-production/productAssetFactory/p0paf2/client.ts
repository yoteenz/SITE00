/** Browser-safe P0.PAF.2 exports. */
export {
  P0_PAF_2_LINEAGE,
  FS_SHARED_SUPABASE_PROJECT_ID,
  P0_PAF_2_FAILURE_CODES,
} from './constants.js';
export {
  FS_STORAGE_ROOT,
  FS_NAMESPACE_SEGMENTS,
  masterHeroOriginalPath,
  buildAWigVariantPaths,
  pdpColorVariantPaths,
  storagePathIsHumanReadable,
} from './storageNamespace.js';
export {
  bindAssetAs,
  unbindAsset,
  rebindAsset,
  getLiveBindingPanel,
  previewBatchBindApprovedVariants,
  batchBindApprovedVariants,
  getWhereUsed,
  canDeleteAsset,
} from './bindingService.js';
export { buildAssetLibraryTree, getAssetDetail } from './assetLibrary.js';
export { createStudioWorldRuntimeReader, createPreviewRuntimeReader } from './runtimeAdapter.js';
export { onVariantApproved, onMasterHeroApproved, variantKeyFromRecord } from './p0paf1Bridge.js';
export { falUrlIsCanonical, assetIntegrationStatus } from './ingestPipeline.js';
