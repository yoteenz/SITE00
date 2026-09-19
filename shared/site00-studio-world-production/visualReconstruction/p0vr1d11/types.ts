/**
 * P0.VR.1D.11 — Character Lab full-screen reconstruction types.
 */

import type { ScreenImplementationSpec } from '../p0vr1d1/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { PixelMatchEvaluation } from '../p0vr1d/types.js';

export type CharacterLabAssetRole =
  | 'CHARACTER_PORTRAIT'
  | 'LANGUAGE_NOTE_SURFACE'
  | 'WORKING_DRAFT_STICKY_NOTE'
  | 'GREEN_TAPE'
  | 'PAPER_TEXTURES';

export type CharacterLabAssetSource =
  | 'EXISTING_ASSET'
  | 'REFERENCE_CROP'
  | 'FAL_RECONSTRUCTION_REQUIRED'
  | 'DOM_REPRODUCIBLE';

export type CharacterLabVisualAssetEntry = {
  assetRole: CharacterLabAssetRole;
  source: CharacterLabAssetSource;
  assetId: string | null;
  storagePath: string | null;
  referenceCrop: string | null;
  generationRequired: boolean;
  provider: 'none' | 'fal' | 'dom';
  status: 'RESOLVED' | 'MISSING' | 'DOM_FALLBACK';
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  aspectRatio?: number;
  objectFit?: string;
  objectPosition?: string;
};

export type CharacterLabVisualAssetManifest = {
  manifestId: string;
  screenId: 'MOBILE_CHARACTER_LAB';
  referencePath: string;
  entries: CharacterLabVisualAssetEntry[];
};

export type CharacterLabMobileVisualShellSpec = {
  specId: string;
  screenId: 'MOBILE_CHARACTER_LAB';
  referencePath: string;
  viewport: { width: number; height: number };
  background: string;
  headerBounds: { heightPx: number; paddingX: number };
  contentBounds: { paddingX: number; paddingTop: number; maxWidthPx: number };
  contentGutters: number;
  tabsBounds: { heightPx: number };
  heroBounds: { heightPx: number; columnRatio: string };
  identityBounds: { minHeightPx: number };
  quoteBounds: { minHeightPx: number };
  performanceBounds: { columns: number };
  bottomNavBounds: { heightPx: number };
  sectionGaps: { titleToTabs: number; tabsToHero: number; heroToIdentity: number; identityToQuote: number; quoteToPerformance: number };
  zLayers: { header: number; content: number; stickyNote: number; bottomNav: number };
};

export type NdxCharacterLabCorrectionReport = {
  reportId: string;
  executedAt: string;
  referencePath: string;
  shellSpec: CharacterLabMobileVisualShellSpec;
  implementationSpec: ScreenImplementationSpec;
  assetManifest: CharacterLabVisualAssetManifest;
  domMeasurement: RenderedDomMeasurementMap | null;
  pixelMatch: PixelMatchEvaluation | null;
  overlayPath: string | null;
  renderPath: string | null;
  structuralScore: number;
  visualScore: number;
  iterations: number;
  falCandidateCount: number;
  falGeneratedCount: number;
  falImageReferenceRequests: number;
  falTextToImageRequests: number;
};
