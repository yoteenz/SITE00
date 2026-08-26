/** Browser-safe P0.PAF.1 exports for Product Asset Factory UI. */
export {
  P0_PAF_1_LINEAGE,
  PRODUCT_ASSET_FACTORY_ROUTE,
  FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON,
  FRONTAL_SLAYER_PROJECT_ID,
  BUILD_A_WIG_DEFAULT_AXES,
  CANVAS_LOCK,
} from './constants.js';
export type {
  ProductMasterHero,
  ProductVariantBatch,
  ProductVariantRecord,
  ProductVisualAssetRecord,
  ProductVariantMatrixPreview,
  BatchProgressSummary,
  FactoryMode,
  VariationAxis,
  BackgroundMode,
  VariantSelection,
} from './types.js';
export {
  listHairColorOptions,
  getActiveHairColors,
} from './hairColorRegistry.js';
export {
  listHairStyleOptions,
  getActiveHairStyles,
} from './hairStyleRegistry.js';
export {
  registerMasterHeroUpload,
  approveMasterHero,
  getMasterHero,
  getActiveCanonicalMasterHero,
  listMasterHeroes,
  persistMasterHeroToSupabase,
} from './masterHeroRegistry.js';
export {
  applySelectAll,
  selectAllForAxis,
  expandSelectionToCombinations,
  isValidConfiguration,
} from './configurationGraph.js';
export {
  computeVariantMatrixPreview,
  buildVariantKey,
  formatVariantKeyForDisplay,
} from './variantMatrix.js';
export {
  planBatch,
  confirmBatchCost,
  dispatchBatch,
  getBatchProgress,
  getBatch,
  listVariantsForBatch,
  cancelQueuedVariants,
  retryFailedVariants,
  resumeMissingVariants,
  approveVariant,
  dispatchProductPageColorVariant,
} from './batchPipeline.js';
export {
  compileProductVariantPrompt,
} from './promptCompiler.js';
export {
  checkDuplicateVariant,
  lookupBuildAWigAsset,
  lookupPdpColorDerivative,
  bindPreviewAsset,
  bindCanonAsset,
} from './assetRecordRegistry.js';
export {
  listProductAssetNotifications,
} from './notifications.js';
