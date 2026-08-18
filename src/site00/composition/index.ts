export type {
  CompositionAnalysisStatus,
  CompositionFocalPoint,
  CompositionLayoutContext,
  CompositionRules,
  CompositionZone,
  CompositionZoneType,
  DisplayedImageBounds,
  EnvironmentCompositionMap,
  NormalizedRect,
  RegisteredOverlay,
  SemanticZoneRole,
  ViewportRect,
} from './types';

export {
  allCompositionZones,
  buildCompositionLayout,
  compositionCssVars,
  computeDisplayedImageBounds,
  isImplementationReady,
  normalizedRectToViewport,
} from './engine';

export {
  detectProtectedCollisions,
  formatCompositionWarnings,
  type CompositionCollision,
} from './collision';

export {
  EnvironmentalStage,
  useCompositionStage,
  useCompositionZone,
  CompositionStageContext,
} from './EnvironmentalStage';

export { CompositionZoneSlot } from './CompositionZoneSlot';
export { useCompositionOverlayRef } from './useCompositionOverlayRef';

export {
  CompositionStudio,
  createAsstsLibraryStudioDocument,
  getLockedCompositionDocument,
  loadCompositionDocument,
  saveCompositionDocument,
  lockedCompositionCssVars,
  validateCompositionDocument,
  hasBlockingErrors,
} from './studio';

export type {
  CompositionStudioDocument,
  CompositionStudioObject,
  CompositionWorkflowStatus,
  RecompositionRequest,
} from './studio';
