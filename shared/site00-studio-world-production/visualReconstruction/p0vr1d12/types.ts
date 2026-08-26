import type { NdxReconstructedMobileScreenId } from './constants.js';

export type ReferenceShellLoadingTarget = {
  screenId: NdxReconstructedMobileScreenId;
  projectSlug: string;
};

export type LegacyShellFlashForensic = {
  initialRenderComponent: string;
  initialRenderShell: string;
  finalRenderComponent: string;
  finalRenderShell: string;
  swapTrigger: string;
  legacyShellSource: string;
};
