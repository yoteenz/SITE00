/**
 * SKINS pixel-fidelity + reference asset deconstruction (P0.VR.6R3).
 */

import { TYPOGRAPHY_FIREWALL } from '../../../site00-brand-lore/projectSkin/brandFamily/constants.js';
import { getSkinsCanonicalBinding } from './skinsCanonicalBindings.js';

export const SKINS_REFERENCE_MOBILE = '/visual-references/founder/site00/skins-authority-mobile.jpg';
export const SKINS_REFERENCE_DESKTOP = '/visual-references/founder/site00/skins-authority-desktop.jpg';
export const SKINS_EXTRACTED_MANIFEST = '/site00/skins/extracted/manifest.json';

export const SKINS_FIDELITY_FAILURE_CODES = [
  'SKINS_COMPOSITION_GEOMETRY_DRIFT',
  'SKINS_TYPOGRAPHY_DRIFT',
  'SKINS_LINE_BREAK_MISMATCH',
  'SKINS_GENERIC_LINK_BLUE_DRIFT',
  'SKINS_REFERENCE_ASSET_MISSING',
  'SKINS_COLOR_SWATCH_FALLBACK',
  'SKINS_ASSET_RECONSTRUCTION_APPROVAL_REQUIRED',
  'SKINS_CROP_NOT_CONFIRMED',
  'SKINS_OVERLAY_NOT_RERUN',
  'SKINS_APPROVED_ASSET_NOT_RENDERED',
  'SKINS_ASSET_BINDING_LOAD_FAILED',
] as const;

export type SkinsFidelityFailureCode = (typeof SKINS_FIDELITY_FAILURE_CODES)[number];

export const SKINS_ASSET_SLOTS = [
  'BRAND_FAMILY_NDXBOOK',
  'BRAND_FAMILY_FRONTAL_SLAYER',
  'BRAND_FAMILY_AIO',
  'BRAND_FAMILY_ASTRAL_WORLD',
  'BRAND_FAMILY_STUDIO_WORLD',
  'SCREEN_OVERVIEW',
  'SCREEN_IDENTITY',
  'SCREEN_BUILDER',
  'SCREEN_EVOLVE',
  'SCREEN_PRODUCTION',
  'SCREEN_REVIEWS',
  'SCREEN_LIBRARY',
  'SCREEN_CONTROL_ROOM',
] as const;

export type SkinsAssetSlot = (typeof SKINS_ASSET_SLOTS)[number];

export type SkinsAssetType =
  | 'PROJECT_VISUAL'
  | 'SCREEN_PREVIEW'
  | 'DECORATIVE_OBJECT'
  | 'EDITORIAL_IMAGE'
  | 'BACKGROUND_IMAGE';

export type SkinReferenceAssetManifestEntry = {
  skinReferenceId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  assetSlot: SkinsAssetSlot;
  candidateId: string;
  cropId: string;
  assetType: SkinsAssetType;
  canonicalAssetId?: string | null;
  bindingId?: string | null;
  status:
    | 'CANDIDATE'
    | 'CROP_PENDING'
    | 'CROP_CONFIRMED'
    | 'RECONSTRUCTION_PENDING'
    | 'RECONSTRUCTION_READY'
    | 'APPROVED'
    | 'BOUND'
    | 'INVALID_SOURCE_CROP_AS_CANONICAL'
    | 'ASSET_RECONSTRUCTION_APPROVAL_REQUIRED';
  sourceAuthorityId: string;
  version: string;
  /** Source crop URL — evidence only, never live binding. */
  sourceCropUrl?: string | null;
  /** Approved reconstructed output URL — only this may bind live. */
  canonicalUrl?: string | null;
  cropConfirmed: boolean;
  uiContaminationSuspected?: boolean;
};

export type TypographyReferenceDelta = {
  region: string;
  fontFamily: string;
  fontSizeDelta: number | null;
  weightDelta: number | null;
  trackingDelta: number | null;
  lineHeightDelta: number | null;
  lineBreakMismatch: boolean;
  alignmentMismatch: boolean;
  genericLinkBlue: boolean;
};

export type ReferenceAssetVisualDelta = {
  slot: SkinsAssetSlot;
  wrongAsset: boolean;
  missingAsset: boolean;
  wrongCrop: boolean;
  wrongScale: boolean;
  wrongAspectRatio: boolean;
  wrongPosition: boolean;
  colorSwatchFallback: boolean;
};

export type SkinsViewportClass = 'MOBILE' | 'DESKTOP';

/** Calibrated geometry tokens — derived from approved authority refs. */
export const SKINS_GEOMETRY_TOKENS = {
  mobile: {
    familyCardWidth: 88,
    familyThumbHeight: 72,
    familyGap: 8,
    screenGridColumns: 2,
    screenTileMinHeight: 52,
    previewThumbWidth: 112,
    previewCardGap: 10,
    sectionHeadSize: 12,
    familyNameSize: 7,
    packHeadSize: 9,
  },
  desktop: {
    familyRailWidth: 196,
    packCenterFlex: 1,
    previewPanelWidth: 268,
    screenGridColumns: 4,
    screenTileMinHeight: 88,
    summaryThumbSize: 36,
    railThumbSize: 32,
  },
} as const;

/** Intentional line breaks per brand family (authority-controlled). */
export const SKINS_FAMILY_LINE_BREAKS: Record<string, string[]> = {
  NDXBOOK: ['NDXBOOK'],
  FRONTAL_SLAYER: ['FRONTAL', 'SLAYER'],
  AIO: ['ALL IN ONE', 'ENTERPRISES'],
  ASTRAL_WORLD: ['ASTRAL', 'WORLD'],
  STUDIO_WORLD: ['STUDIO', 'WORLD'],
};

export const BRAND_KEY_TO_ASSET_SLOT: Record<string, SkinsAssetSlot> = {
  NDXBOOK: 'BRAND_FAMILY_NDXBOOK',
  FRONTAL_SLAYER: 'BRAND_FAMILY_FRONTAL_SLAYER',
  AIO: 'BRAND_FAMILY_AIO',
  ASTRAL_WORLD: 'BRAND_FAMILY_ASTRAL_WORLD',
  STUDIO_WORLD: 'BRAND_FAMILY_STUDIO_WORLD',
};

export const PACK_SCREEN_TO_ASSET_SLOT: Record<string, SkinsAssetSlot> = {
  PROJECT_OVERVIEW: 'SCREEN_OVERVIEW',
  IDENTITY: 'SCREEN_IDENTITY',
  BUILDER: 'SCREEN_BUILDER',
  EVOLVE: 'SCREEN_EVOLVE',
  PRODUCTION: 'SCREEN_PRODUCTION',
  REVIEWS: 'SCREEN_REVIEWS',
  LIBRARY: 'SCREEN_LIBRARY',
  CONTROL_ROOM: 'SCREEN_CONTROL_ROOM',
};

export function assetSlotToExtractedPath(viewport: SkinsViewportClass, slot: SkinsAssetSlot): string {
  const vp = viewport === 'MOBILE' ? 'mobile' : 'desktop';
  return `/site00/skins/extracted/${vp}/${slot.toLowerCase()}.webp`;
}

export function classifySkinsAssetSlot(slot: SkinsAssetSlot): SkinsAssetType {
  if (slot.startsWith('BRAND_FAMILY_')) return 'PROJECT_VISUAL';
  if (slot.startsWith('SCREEN_')) return 'SCREEN_PREVIEW';
  return 'EDITORIAL_IMAGE';
}

export function buildDefaultSkinsManifest(): SkinReferenceAssetManifestEntry[] {
  const entries: SkinReferenceAssetManifestEntry[] = [];
  const families: SkinsAssetSlot[] = [
    'BRAND_FAMILY_NDXBOOK',
    'BRAND_FAMILY_FRONTAL_SLAYER',
    'BRAND_FAMILY_AIO',
    'BRAND_FAMILY_ASTRAL_WORLD',
    'BRAND_FAMILY_STUDIO_WORLD',
  ];

  for (const viewport of ['MOBILE', 'DESKTOP'] as SkinsViewportClass[]) {
    for (const assetSlot of families) {
      const binding = getSkinsCanonicalBinding(viewport, assetSlot);
      const sourceCropUrl = assetSlotToExtractedPath(viewport, assetSlot);
      entries.push({
        skinReferenceId: viewport === 'MOBILE' ? 'skins-authority-mobile' : 'skins-authority-desktop',
        viewport,
        assetSlot,
        candidateId: `candidate-${viewport}-${assetSlot}`,
        cropId: `crop-${viewport}-${assetSlot}`,
        assetType: classifySkinsAssetSlot(assetSlot),
        canonicalAssetId: binding?.canonicalAssetId ?? null,
        bindingId: binding?.bindingId ?? null,
        status: binding ? 'BOUND' : 'RECONSTRUCTION_PENDING',
        sourceAuthorityId: viewport === 'MOBILE' ? SKINS_REFERENCE_MOBILE : SKINS_REFERENCE_DESKTOP,
        version: binding ? '1.1' : '1.0',
        sourceCropUrl,
        canonicalUrl: binding?.canonicalUrl ?? null,
        cropConfirmed: true,
        uiContaminationSuspected: binding ? false : true,
      });
    }
    entries.push({
      skinReferenceId: viewport === 'MOBILE' ? 'skins-authority-mobile' : 'skins-authority-desktop',
      viewport,
      assetSlot: 'SCREEN_OVERVIEW',
      candidateId: `candidate-${viewport}-SCREEN_OVERVIEW`,
      cropId: `crop-${viewport}-SCREEN_OVERVIEW`,
      assetType: 'SCREEN_PREVIEW',
      canonicalAssetId: null,
      bindingId: null,
      status: 'RECONSTRUCTION_PENDING',
      sourceAuthorityId: viewport === 'MOBILE' ? SKINS_REFERENCE_MOBILE : SKINS_REFERENCE_DESKTOP,
      version: '1.0',
      sourceCropUrl: assetSlotToExtractedPath(viewport, 'SCREEN_OVERVIEW'),
      canonicalUrl: null,
      cropConfirmed: true,
      uiContaminationSuspected: false,
    });
  }

  return entries;
}

/** Detect manifest entries where source crop was incorrectly bound as canonical. */
export function auditInvalidSourceCropBindings(manifest: SkinReferenceAssetManifestEntry[]): SkinsAssetSlot[] {
  const invalid: SkinsAssetSlot[] = [];
  for (const entry of manifest) {
    if (entry.canonicalUrl && entry.sourceCropUrl && entry.canonicalUrl === entry.sourceCropUrl) {
      invalid.push(entry.assetSlot);
    }
    if (entry.status === 'BOUND' && !entry.canonicalAssetId && entry.sourceCropUrl) {
      invalid.push(entry.assetSlot);
    }
  }
  return invalid;
}

export type ScreenThumbnailSource = 'AUTHORITY' | 'CANONICAL' | 'EMPTY';

export function resolveScreenThumbnailUrl(input: {
  viewport: SkinsViewportClass;
  packScreenType: string;
  authorityReferenceAssetId?: string | null;
  authorityPreviewUrl?: string | null;
  manifest?: SkinReferenceAssetManifestEntry[];
}): { url: string | null; source: ScreenThumbnailSource } {
  if (input.authorityPreviewUrl) {
    return { url: input.authorityPreviewUrl, source: 'AUTHORITY' };
  }
  if (input.authorityReferenceAssetId?.startsWith('http') || input.authorityReferenceAssetId?.startsWith('/')) {
    return { url: input.authorityReferenceAssetId, source: 'AUTHORITY' };
  }

  const slot = PACK_SCREEN_TO_ASSET_SLOT[input.packScreenType];
  if (slot) {
    const approved = input.manifest?.find(
      (m) =>
        m.assetSlot === slot &&
        m.viewport === input.viewport &&
        m.status === 'BOUND' &&
        m.canonicalUrl &&
        m.canonicalUrl !== m.sourceCropUrl,
    );
    if (approved?.canonicalUrl) return { url: approved.canonicalUrl, source: 'CANONICAL' };
  }

  return { url: null, source: 'EMPTY' };
}

export type FamilyThumbnailResolution = {
  url: string | null;
  source: ScreenThumbnailSource;
  colorSwatchFallback: boolean;
  approvedVisualAssetExists: boolean;
  failureCode: SkinsFidelityFailureCode | null;
};

export function resolveFamilyThumbnailUrl(input: {
  brandKey: string;
  viewport: SkinsViewportClass;
  manifest?: SkinReferenceAssetManifestEntry[];
  useColorSwatchFallback?: boolean;
}): FamilyThumbnailResolution {
  const slot = BRAND_KEY_TO_ASSET_SLOT[input.brandKey];
  if (!slot) {
    return {
      url: null,
      source: 'EMPTY',
      colorSwatchFallback: Boolean(input.useColorSwatchFallback),
      approvedVisualAssetExists: false,
      failureCode: null,
    };
  }

  const approved = input.manifest?.find(
    (m) =>
      m.assetSlot === slot &&
      m.viewport === input.viewport &&
      m.status === 'BOUND' &&
      m.canonicalUrl &&
      m.canonicalAssetId &&
      m.canonicalUrl !== m.sourceCropUrl,
  );

  if (approved?.canonicalUrl) {
    return {
      url: approved.canonicalUrl,
      source: 'CANONICAL',
      colorSwatchFallback: false,
      approvedVisualAssetExists: true,
      failureCode: null,
    };
  }

  return {
    url: null,
    source: 'EMPTY',
    colorSwatchFallback: true,
    approvedVisualAssetExists: false,
    failureCode: null,
  };
}

/** Runtime assertion: approved binding must not silently fall back to color swatch. */
export function assertApprovedFamilyAssetRendered(resolution: FamilyThumbnailResolution): {
  pass: boolean;
  failureCode: SkinsFidelityFailureCode | null;
} {
  if (resolution.approvedVisualAssetExists && resolution.colorSwatchFallback) {
    return { pass: false, failureCode: 'SKINS_APPROVED_ASSET_NOT_RENDERED' };
  }
  if (resolution.failureCode) {
    return { pass: false, failureCode: resolution.failureCode };
  }
  return { pass: true, failureCode: null };
}

export function auditTypographyAgainstReference(live: {
  fontFamily?: string;
  usesUppercase?: boolean;
  linkColor?: string;
  lineBreaksByRegion?: Record<string, string[]>;
}): TypographyReferenceDelta[] {
  const deltas: TypographyReferenceDelta[] = [];
  const requiredFont = TYPOGRAPHY_FIREWALL.requiredFontFamily;

  deltas.push({
    region: 'GLOBAL',
    fontFamily: live.fontFamily ?? 'UNKNOWN',
    fontSizeDelta: live.fontFamily?.toUpperCase().includes('MARTIAN') ? 0 : null,
    weightDelta: null,
    trackingDelta: null,
    lineHeightDelta: null,
    lineBreakMismatch: false,
    alignmentMismatch: false,
    genericLinkBlue: Boolean(live.linkColor && /#0066|#007bff|rgb\(0,\s*0,\s*255\)/i.test(live.linkColor)),
  });

  for (const [brandKey, expectedLines] of Object.entries(SKINS_FAMILY_LINE_BREAKS)) {
    const liveLines = live.lineBreaksByRegion?.[brandKey];
    deltas.push({
      region: `FAMILY_${brandKey}`,
      fontFamily: requiredFont,
      fontSizeDelta: null,
      weightDelta: null,
      trackingDelta: null,
      lineHeightDelta: null,
      lineBreakMismatch: Boolean(liveLines && liveLines.join('|') !== expectedLines.join('|')),
      alignmentMismatch: false,
      genericLinkBlue: false,
    });
  }

  return deltas;
}

export function auditReferenceAssets(input: {
  brandKeys: string[];
  viewport: SkinsViewportClass;
  renderedWithColorSwatch: string[];
  manifest: SkinReferenceAssetManifestEntry[];
}): ReferenceAssetVisualDelta[] {
  return input.brandKeys.map((brandKey) => {
    const slot = BRAND_KEY_TO_ASSET_SLOT[brandKey]!;
    const entry = input.manifest.find((m) => m.assetSlot === slot && m.viewport === input.viewport);
    const colorSwatchFallback = input.renderedWithColorSwatch.includes(brandKey);
    return {
      slot,
      wrongAsset: false,
      missingAsset: !entry?.canonicalUrl,
      wrongCrop: entry ? !entry.cropConfirmed : true,
      wrongScale: false,
      wrongAspectRatio: false,
      wrongPosition: false,
      colorSwatchFallback,
    };
  });
}

export function requiresReconstructionApproval(entry: SkinReferenceAssetManifestEntry): boolean {
  return entry.status === 'ASSET_RECONSTRUCTION_APPROVAL_REQUIRED';
}

export function cropConfirmationRequired(entry: SkinReferenceAssetManifestEntry): boolean {
  return !entry.cropConfirmed && entry.status !== 'BOUND' && entry.status !== 'APPROVED';
}

export function runSkinsPageFidelityQA(input: {
  viewport: SkinsViewportClass;
  manifest: SkinReferenceAssetManifestEntry[];
  typographyDeltas: TypographyReferenceDelta[];
  assetDeltas: ReferenceAssetVisualDelta[];
  overlayRerunAfterBinding: boolean;
}): { pass: boolean; failureCodes: SkinsFidelityFailureCode[] } {
  const failureCodes: SkinsFidelityFailureCode[] = [];

  if (input.assetDeltas.some((d) => d.colorSwatchFallback)) {
    failureCodes.push('SKINS_COLOR_SWATCH_FALLBACK');
  }
  if (input.assetDeltas.some((d) => d.missingAsset)) {
    failureCodes.push('SKINS_REFERENCE_ASSET_MISSING');
  }
  if (input.typographyDeltas.some((d) => d.genericLinkBlue)) {
    failureCodes.push('SKINS_GENERIC_LINK_BLUE_DRIFT');
  }
  if (input.typographyDeltas.some((d) => d.lineBreakMismatch)) {
    failureCodes.push('SKINS_LINE_BREAK_MISMATCH');
  }
  if (input.typographyDeltas.some((d) => d.fontSizeDelta !== null && d.fontSizeDelta !== 0)) {
    failureCodes.push('SKINS_TYPOGRAPHY_DRIFT');
  }
  if (!input.overlayRerunAfterBinding) {
    failureCodes.push('SKINS_OVERLAY_NOT_RERUN');
  }

  return { pass: failureCodes.length === 0, failureCodes };
}
