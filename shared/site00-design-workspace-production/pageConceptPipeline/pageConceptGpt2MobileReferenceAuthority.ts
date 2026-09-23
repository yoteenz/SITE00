/**
 * P0.VR.GPT2-MOBILE-FUNCTIONAL-REFERENCE-ONLY-AND-FULL-PAGE-CAPTURE-FIX1
 * Top / middle / bottom structural captures — FUNCTIONAL_REFERENCE_ONLY (no screenshot design authority).
 */

import {
  type Gpt2MobileSourceAuthorityManifest,
} from './pageConceptGpt2MobileContinuityLock.js';

export const GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1 = 'GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1' as const;

export const SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY = 'FUNCTIONAL_REFERENCE_ONLY' as const;

export const GPT2_MOBILE_INPUT_ROLE = {
  TOP_STRUCTURAL: 'TOP_STRUCTURAL_CAPTURE',
  MIDDLE_STRUCTURAL: 'MIDDLE_STRUCTURAL_CAPTURE',
  BOTTOM_STRUCTURAL: 'BOTTOM_STRUCTURAL_CAPTURE',
  /** @deprecated legacy — must not appear in provider dispatch */
  FULL_PAGE_SOURCE: 'FULL_PAGE_SOURCE_CAPTURE',
  FUNCTIONAL_PAGE: 'FULL_PAGE_SOURCE_CAPTURE',
  BOTTOM_HALF: 'BOTTOM_HALF_SOURCE_CAPTURE',
  BOTTOM_NAV: 'BOTTOM_NAV_AUTHORITY_CROP',
  CONTINUITY: 'BOTTOM_NAV_AUTHORITY_CROP',
  STITCHED_PAGE: 'STITCHED_FULL_PAGE_CAPTURE',
  CREATIVE_SUPPORT: 'CREATIVE_SUPPORT_REFERENCE',
} as const;

export type Gpt2MobileProviderInputRole =
  (typeof GPT2_MOBILE_INPUT_ROLE)[keyof typeof GPT2_MOBILE_INPUT_ROLE];

export const GPT2_MOBILE_STRUCTURAL_CAPTURE_UI_LABEL = {
  [GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL]: 'TOP STRUCTURE',
  [GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL]: 'MIDDLE STRUCTURE',
  [GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL]: 'BOTTOM STRUCTURE',
} as const;

/** Equal vertical thirds — disjoint top / middle / bottom semantic coverage. */
export const GPT2_MOBILE_TOP_STRUCTURAL_TOP_FRACTION = 0;
export const GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION = 1 / 3;
export const GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION = 1 / 3;
export const GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION = 1 / 3;
export const GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION = 2 / 3;
export const GPT2_MOBILE_BOTTOM_STRUCTURAL_HEIGHT_FRACTION = 1 / 3;

/** Minimum pixels for the source capture before slicing (reject preview/thumbnail strips). */
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_WIDTH = 320;
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_HEIGHT = 520;
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_ASPECT = 1.35;

/** Minimum height per structural slice after crop. */
export const GPT2_MOBILE_MIN_STRUCTURAL_SLICE_HEIGHT = 120;

export type Gpt2MobileProviderReferenceAsset = {
  role: Gpt2MobileProviderInputRole;
  assetId: string;
  sourcePath: string;
  width: number;
  height: number;
  base64: string;
  regionTopFraction: number;
  regionHeightFraction: number;
  uiLabel: string;
};

export type MobileStructuralCaptureCoverageResult = {
  ok: boolean;
  errorCode:
    | 'CAPTURE_PACKAGE_INVALID'
    | 'MISSING_BOTTOM_STRUCTURAL_CAPTURE'
    | 'REDUNDANT_CAPTURE_SET'
    | null;
  reason?: string;
  topPresent: boolean;
  middlePresent: boolean;
  bottomPresent: boolean;
  redundancyCheckPass: boolean;
  bottomReachesPageEnd: boolean;
};

export type Gpt2MobileProviderReferenceBundle = {
  capturePackageVersion: typeof GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1;
  screenshotAuthorityMode: typeof SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY;
  topStructuralCapture: Gpt2MobileProviderReferenceAsset;
  middleStructuralCapture: Gpt2MobileProviderReferenceAsset;
  bottomStructuralCapture: Gpt2MobileProviderReferenceAsset;
  /** @deprecated use topStructuralCapture */
  functionalPage: Gpt2MobileProviderReferenceAsset;
  /** @deprecated use middleStructuralCapture */
  bottomHalf: Gpt2MobileProviderReferenceAsset | null;
  /** @deprecated use bottomStructuralCapture */
  bottomNavAuthority: Gpt2MobileProviderReferenceAsset | null;
  /** @deprecated use bottomStructuralCapture */
  continuity: Gpt2MobileProviderReferenceAsset | null;
  stitchedFullPage: Gpt2MobileProviderReferenceAsset | null;
  creativeSupport: Gpt2MobileProviderReferenceAsset | null;
  providerImageOrder: readonly Gpt2MobileProviderInputRole[];
  imageRoleSummary: string;
  authorityManifest: Gpt2MobileSourceAuthorityManifest;
  coverageValidation: MobileStructuralCaptureCoverageResult;
};

export type CaptureImageDimensions = {
  width: number;
  height: number;
};

export async function probeCaptureImageDimensions(
  captureBase64: string,
  fallback?: CaptureImageDimensions,
): Promise<CaptureImageDimensions> {
  const trimmed = captureBase64.trim();
  if (!trimmed) {
    if (fallback) return fallback;
    throw new Error('GPT2_CAPTURE_DIMENSION_PROBE_FAILED: empty');
  }

  if (process.env.VITEST === 'true') {
    if (fallback) return fallback;
    return { width: 390, height: 844 };
  }

  const sharp = (await import('sharp')).default;
  const raw = Buffer.from(trimmed, 'base64');
  const meta = await sharp(raw).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width > 0 && height > 0) return { width, height };
  if (fallback) return fallback;
  throw new Error('GPT2_CAPTURE_DIMENSION_PROBE_FAILED: missing metadata');
}

export function validateFunctionalPageReferenceDimensions(dimensions: CaptureImageDimensions): {
  ok: boolean;
  errorCode: 'GPT2_FUNCTIONAL_REFERENCE_TOO_SMALL' | null;
  reason?: string;
} {
  const { width, height } = dimensions;
  if (width < GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_WIDTH || height < GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_HEIGHT) {
    return {
      ok: false,
      errorCode: 'GPT2_FUNCTIONAL_REFERENCE_TOO_SMALL',
      reason: `functional reference ${width}x${height} below minimum ${GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_WIDTH}x${GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_HEIGHT}`,
    };
  }
  const aspect = height / Math.max(width, 1);
  if (aspect < GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_ASPECT) {
    return {
      ok: false,
      errorCode: 'GPT2_FUNCTIONAL_REFERENCE_TOO_SMALL',
      reason: `functional reference aspect ${aspect.toFixed(2)} looks like a cropped strip, not a full mobile page`,
    };
  }
  return { ok: true, errorCode: null };
}

const FORBIDDEN_SCREENSHOT_DESIGN_AUTHORITY_PATTERNS: readonly RegExp[] = [
  /\bscreenshot\s+(?:as\s+(?:the\s+)?)?(?:visual|design|aesthetic)\s+authority\b/i,
  /\b(?:style|aesthetic|look-and-feel)\s+(?:reference|authority)\s+from\s+(?:the\s+)?capture\b/i,
  /\bimage\s+a\s+is\s+(?:the\s+)?(?:visual|design|style)\s+authority\b/i,
  /\bstructural capture[s]?\s+(?:as|are)\s+(?:the\s+)?(?:visual|design|aesthetic)\s+authority\b/i,
  /\bcapture\s+(?:is|as)\s+(?:the\s+)?(?:visual|design|style|aesthetic)\s+(?:reference|authority)\b/i,
];

export function assertScreenshotDesignAuthorityForbidden(serializedPromptOrBlock: string): void {
  const stripped = serializedPromptOrBlock.replace(/SCREENSHOT_DESIGN_AUTHORITY:\s*FORBIDDEN/gi, '');
  for (const pattern of FORBIDDEN_SCREENSHOT_DESIGN_AUTHORITY_PATTERNS) {
    if (pattern.test(stripped)) {
      throw new Error('SCREENSHOT_DESIGN_AUTHORITY_FORBIDDEN: capture serialized as design/style authority');
    }
  }
}

export function validateMobileStructuralCaptureCoverage(input: {
  sourcePageHeight: number;
  top: Gpt2MobileProviderReferenceAsset;
  middle: Gpt2MobileProviderReferenceAsset;
  bottom: Gpt2MobileProviderReferenceAsset;
}): MobileStructuralCaptureCoverageResult {
  const topPresent =
    input.top.role === GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL &&
    input.top.height >= GPT2_MOBILE_MIN_STRUCTURAL_SLICE_HEIGHT &&
    input.top.regionTopFraction === GPT2_MOBILE_TOP_STRUCTURAL_TOP_FRACTION;
  const middlePresent =
    input.middle.role === GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL &&
    input.middle.height >= GPT2_MOBILE_MIN_STRUCTURAL_SLICE_HEIGHT &&
    input.middle.regionTopFraction === GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION;
  const bottomPresent =
    input.bottom.role === GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL &&
    input.bottom.height >= GPT2_MOBILE_MIN_STRUCTURAL_SLICE_HEIGHT &&
    input.bottom.regionTopFraction === GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION;

  const bottomEndFraction = input.bottom.regionTopFraction + input.bottom.regionHeightFraction;
  const bottomReachesPageEnd = bottomEndFraction >= 0.99;

  const regions = [
    { key: 'top', top: input.top.regionTopFraction, height: input.top.regionHeightFraction },
    { key: 'middle', top: input.middle.regionTopFraction, height: input.middle.regionHeightFraction },
    { key: 'bottom', top: input.bottom.regionTopFraction, height: input.bottom.regionHeightFraction },
  ];
  let redundant = false;
  for (let i = 0; i < regions.length; i++) {
    for (let j = i + 1; j < regions.length; j++) {
      const a = regions[i]!;
      const b = regions[j]!;
      const overlap =
        Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
      const minHeight = Math.min(a.height, b.height);
      if (overlap > minHeight * 0.15) {
        redundant = true;
      }
      if (
        Math.abs(a.top - b.top) < 0.001 &&
        Math.abs(a.height - b.height) < 0.001
      ) {
        redundant = true;
      }
    }
  }
  const redundancyCheckPass = !redundant;

  if (!redundancyCheckPass) {
    return {
      ok: false,
      errorCode: 'REDUNDANT_CAPTURE_SET',
      reason: 'structural captures overlap the same semantic region without adding coverage',
      topPresent,
      middlePresent,
      bottomPresent,
      redundancyCheckPass,
      bottomReachesPageEnd,
    };
  }
  if (!bottomPresent || !bottomReachesPageEnd) {
    return {
      ok: false,
      errorCode: 'MISSING_BOTTOM_STRUCTURAL_CAPTURE',
      reason: 'bottom structural capture missing or does not include true page bottom',
      topPresent,
      middlePresent,
      bottomPresent,
      redundancyCheckPass,
      bottomReachesPageEnd,
    };
  }
  if (!topPresent || !middlePresent) {
    return {
      ok: false,
      errorCode: 'CAPTURE_PACKAGE_INVALID',
      reason: 'top or middle structural capture missing or undersized',
      topPresent,
      middlePresent,
      bottomPresent,
      redundancyCheckPass,
      bottomReachesPageEnd,
    };
  }
  return {
    ok: true,
    errorCode: null,
    topPresent,
    middlePresent,
    bottomPresent,
    redundancyCheckPass,
    bottomReachesPageEnd,
  };
}

export async function extractVerticalRegionCrop(input: {
  functionalCaptureBase64: string;
  fallbackViewport?: CaptureImageDimensions;
  regionTopFraction: number;
  regionHeightFraction: number;
  role: Gpt2MobileProviderInputRole;
  assetId: string;
  sourcePath: string;
  uiLabel: string;
}): Promise<Gpt2MobileProviderReferenceAsset> {
  const sourceDims = await probeCaptureImageDimensions(input.functionalCaptureBase64, input.fallbackViewport);
  const cropTop = Math.max(0, Math.round(sourceDims.height * input.regionTopFraction));
  const cropHeight = Math.max(
    32,
    Math.min(sourceDims.height - cropTop, Math.round(sourceDims.height * input.regionHeightFraction)),
  );

  if (process.env.VITEST === 'true') {
    return {
      role: input.role,
      assetId: input.assetId,
      sourcePath: input.sourcePath,
      width: sourceDims.width,
      height: cropHeight,
      base64: input.functionalCaptureBase64,
      regionTopFraction: input.regionTopFraction,
      regionHeightFraction: input.regionHeightFraction,
      uiLabel: input.uiLabel,
    };
  }

  const sharp = (await import('sharp')).default;
  const raw = Buffer.from(input.functionalCaptureBase64, 'base64');
  const cropped = await sharp(raw)
    .extract({ left: 0, top: cropTop, width: sourceDims.width, height: cropHeight })
    .png()
    .toBuffer();

  return {
    role: input.role,
    assetId: input.assetId,
    sourcePath: input.sourcePath,
    width: sourceDims.width,
    height: cropHeight,
    base64: cropped.toString('base64'),
    regionTopFraction: input.regionTopFraction,
    regionHeightFraction: input.regionHeightFraction,
    uiLabel: input.uiLabel,
  };
}

export async function buildGpt2MobileProviderReferenceBundle(input: {
  captureSetId: string;
  functionalCaptureBase64: string;
  functionalAssetId: string;
  functionalSourcePath: string;
  fallbackViewport: CaptureImageDimensions;
  creativeSupportCaptureBase64?: string | null;
  creativeSupportAssetId?: string | null;
  creativeSupportSourcePath?: string | null;
  stitchedCaptureBase64?: string | null;
  stitchedAssetId?: string | null;
  stitchedSourcePath?: string | null;
}): Promise<Gpt2MobileProviderReferenceBundle> {
  const functionalDims = await probeCaptureImageDimensions(
    input.functionalCaptureBase64,
    input.fallbackViewport,
  );
  let fullPageBase64 = input.functionalCaptureBase64;
  let fullPageDims = functionalDims;
  let stitchedFallbackUsed = false;

  const functionalCheck = validateFunctionalPageReferenceDimensions(functionalDims);
  if (!functionalCheck.ok) {
    const stitchedB64 = input.stitchedCaptureBase64?.trim();
    if (stitchedB64) {
      const stitchedDims = await probeCaptureImageDimensions(stitchedB64, input.fallbackViewport);
      const stitchedCheck = validateFunctionalPageReferenceDimensions(stitchedDims);
      if (stitchedCheck.ok) {
        fullPageBase64 = stitchedB64;
        fullPageDims = stitchedDims;
        stitchedFallbackUsed = true;
      } else {
        throw new Error(
          `${stitchedCheck.errorCode}: stitched ${stitchedCheck.reason ?? 'invalid stitched full page'}`,
        );
      }
    } else {
      throw new Error(
        `${functionalCheck.errorCode}: ${functionalCheck.reason ?? 'invalid functional page reference'}`,
      );
    }
  }

  const topStructuralCapture = await extractVerticalRegionCrop({
    functionalCaptureBase64: fullPageBase64,
    fallbackViewport: fullPageDims,
    regionTopFraction: GPT2_MOBILE_TOP_STRUCTURAL_TOP_FRACTION,
    regionHeightFraction: GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION,
    role: GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
    assetId: `${input.captureSetId}:top-structural`,
    sourcePath: `${input.functionalSourcePath}#top-structural`,
    uiLabel: GPT2_MOBILE_STRUCTURAL_CAPTURE_UI_LABEL[GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL],
  });

  const middleStructuralCapture = await extractVerticalRegionCrop({
    functionalCaptureBase64: fullPageBase64,
    fallbackViewport: fullPageDims,
    regionTopFraction: GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION,
    regionHeightFraction: GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION,
    role: GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
    assetId: `${input.captureSetId}:middle-structural`,
    sourcePath: `${input.functionalSourcePath}#middle-structural`,
    uiLabel: GPT2_MOBILE_STRUCTURAL_CAPTURE_UI_LABEL[GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL],
  });

  const bottomStructuralCapture = await extractVerticalRegionCrop({
    functionalCaptureBase64: fullPageBase64,
    fallbackViewport: fullPageDims,
    regionTopFraction: GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION,
    regionHeightFraction: GPT2_MOBILE_BOTTOM_STRUCTURAL_HEIGHT_FRACTION,
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    assetId: `${input.captureSetId}:bottom-structural`,
    sourcePath: `${input.functionalSourcePath}#bottom-structural`,
    uiLabel: GPT2_MOBILE_STRUCTURAL_CAPTURE_UI_LABEL[GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL],
  });

  const coverageValidation = validateMobileStructuralCaptureCoverage({
    sourcePageHeight: fullPageDims.height,
    top: topStructuralCapture,
    middle: middleStructuralCapture,
    bottom: bottomStructuralCapture,
  });
  if (!coverageValidation.ok) {
    throw new Error(
      `${coverageValidation.errorCode}: ${coverageValidation.reason ?? 'structural capture package invalid'}`,
    );
  }

  let stitchedFullPage: Gpt2MobileProviderReferenceAsset | null = null;
  if (stitchedFallbackUsed && input.stitchedAssetId) {
    stitchedFullPage = {
      role: GPT2_MOBILE_INPUT_ROLE.STITCHED_PAGE,
      assetId: input.stitchedAssetId,
      sourcePath: input.stitchedSourcePath ?? `${input.functionalSourcePath}#stitched`,
      width: fullPageDims.width,
      height: fullPageDims.height,
      base64: fullPageBase64,
      regionTopFraction: 0,
      regionHeightFraction: 1,
      uiLabel: 'STITCHED SOURCE',
    };
  }

  let creativeSupport: Gpt2MobileProviderReferenceAsset | null = null;
  const creativeB64 = input.creativeSupportCaptureBase64?.trim();
  if (creativeB64) {
    const creativeDims = await probeCaptureImageDimensions(creativeB64, input.fallbackViewport);
    creativeSupport = {
      role: GPT2_MOBILE_INPUT_ROLE.CREATIVE_SUPPORT,
      assetId: input.creativeSupportAssetId ?? `${input.captureSetId}:creative-support`,
      sourcePath: input.creativeSupportSourcePath ?? 'creative-support',
      width: creativeDims.width,
      height: creativeDims.height,
      base64: creativeB64,
      regionTopFraction: 0,
      regionHeightFraction: 1,
      uiLabel: 'CREATIVE SUPPORT',
    };
  }

  const providerImageOrder: Gpt2MobileProviderInputRole[] = [
    GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
    GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
  ];

  const imageRoleSummary = [
    `Structural Capture A (${GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL}): ${topStructuralCapture.width}×${topStructuralCapture.height}`,
    `Structural Capture B (${GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL}): ${middleStructuralCapture.width}×${middleStructuralCapture.height}`,
    `Structural Capture C (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL}): ${bottomStructuralCapture.width}×${bottomStructuralCapture.height}`,
  ].join(' · ');

  const authorityManifest: Gpt2MobileSourceAuthorityManifest = {
    capturePackageVersion: GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1,
    screenshotAuthorityMode: SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY,
    designAuthoritySource: 'CGPT_PLUS_PAGE_ARCHITECTURE_BRIEF',
    topStructuralAttached: true,
    middleStructuralAttached: true,
    bottomStructuralAttached: true,
    topAssetId: topStructuralCapture.assetId,
    middleAssetId: middleStructuralCapture.assetId,
    bottomAssetId: bottomStructuralCapture.assetId,
    stitchedFallbackUsed,
    bottomContinuityLockActive: true,
    stitchedAssetId: stitchedFullPage?.assetId ?? null,
    fullPageSourceAttached: false,
    bottomHalfSourceAttached: false,
    bottomNavAuthorityAttached: false,
    fullPageAssetId: null,
    bottomHalfAssetId: null,
    bottomNavAssetId: null,
  };

  return {
    capturePackageVersion: GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1,
    screenshotAuthorityMode: SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY,
    topStructuralCapture,
    middleStructuralCapture,
    bottomStructuralCapture,
    functionalPage: topStructuralCapture,
    bottomHalf: middleStructuralCapture,
    bottomNavAuthority: bottomStructuralCapture,
    continuity: bottomStructuralCapture,
    stitchedFullPage,
    creativeSupport,
    providerImageOrder,
    imageRoleSummary,
    authorityManifest,
    coverageValidation,
  };
}

export function formatGpt2MobileCapturePackageDebugLines(
  bundle: Gpt2MobileProviderReferenceBundle,
): string[] {
  const v = bundle.coverageValidation;
  return [
    `CAPTURE_PACKAGE_VERSION: ${bundle.capturePackageVersion}`,
    `CAPTURE_A_ROLE: ${GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL} · ${bundle.topStructuralCapture.uiLabel}`,
    `CAPTURE_B_ROLE: ${GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL} · ${bundle.middleStructuralCapture.uiLabel}`,
    `CAPTURE_C_ROLE: ${GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL} · ${bundle.bottomStructuralCapture.uiLabel}`,
    `TOP_COVERAGE: ${v.topPresent ? 'PASS' : 'FAIL'}`,
    `MIDDLE_COVERAGE: ${v.middlePresent ? 'PASS' : 'FAIL'}`,
    `BOTTOM_COVERAGE: ${v.bottomPresent ? 'PASS' : 'FAIL'}`,
    `REDUNDANCY_CHECK: ${v.redundancyCheckPass ? 'PASS' : 'FAIL'}`,
    `SCREENSHOT_AUTHORITY_MODE: ${bundle.screenshotAuthorityMode}`,
    `DESIGN_AUTHORITY_SOURCE: ${bundle.authorityManifest.designAuthoritySource}`,
    `SCREENSHOT_DESIGN_AUTHORITY: FORBIDDEN`,
  ];
}

export function formatGpt2MobileReferenceAuthorityDebugLines(
  bundle: Gpt2MobileProviderReferenceBundle,
): string[] {
  const line = (asset: Gpt2MobileProviderReferenceAsset) =>
    `${asset.uiLabel} · ${asset.role}: ${asset.assetId} · ${asset.sourcePath} · ${asset.width}×${asset.height}`;
  return [
    `COMPILED PROMPT IMAGE ROLE SUMMARY: ${bundle.imageRoleSummary}`,
    line(bundle.topStructuralCapture),
    line(bundle.middleStructuralCapture),
    line(bundle.bottomStructuralCapture),
    ...(bundle.stitchedFullPage ? [line(bundle.stitchedFullPage)] : []),
    ...(bundle.creativeSupport ?
      [`CREATIVE_SUPPORT_REFERENCE: ${bundle.creativeSupport.assetId} (not sent — v1 package is 3 captures only)`]
    : []),
    `PROVIDER IMAGE ORDER: ${bundle.providerImageOrder.join(' → ')}`,
    ...formatGpt2MobileCapturePackageDebugLines(bundle),
  ];
}

export function mockGpt2MobileProviderReferenceBundleForTest(input?: {
  functionalBase64?: string;
  continuityBase64?: string;
  width?: number;
  height?: number;
}): Gpt2MobileProviderReferenceBundle {
  const width = input?.width ?? 390;
  const height = input?.height ?? 844;
  const functionalBase64 = input?.functionalBase64 ?? 'aaa';
  const sliceHeight = Math.max(32, Math.round(height * GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION));
  const mk = (
    role: Gpt2MobileProviderInputRole,
    assetId: string,
    sourcePath: string,
    topFraction: number,
    heightFraction: number,
  ): Gpt2MobileProviderReferenceAsset => ({
    role,
    assetId,
    sourcePath,
    width,
    height: sliceHeight,
    base64: role === GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL ? (input?.continuityBase64 ?? 'bbb') : functionalBase64,
    regionTopFraction: topFraction,
    regionHeightFraction: heightFraction,
    uiLabel:
      role === GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL ? 'TOP STRUCTURE'
      : role === GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL ? 'MIDDLE STRUCTURE'
      : 'BOTTOM STRUCTURE',
  });
  const topStructuralCapture = mk(
    GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
    'test-top-structural',
    'test/mobile-functional-page.png#top-structural',
    GPT2_MOBILE_TOP_STRUCTURAL_TOP_FRACTION,
    GPT2_MOBILE_TOP_STRUCTURAL_HEIGHT_FRACTION,
  );
  const middleStructuralCapture = mk(
    GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
    'test-middle-structural',
    'test/mobile-functional-page.png#middle-structural',
    GPT2_MOBILE_MIDDLE_STRUCTURAL_TOP_FRACTION,
    GPT2_MOBILE_MIDDLE_STRUCTURAL_HEIGHT_FRACTION,
  );
  const bottomStructuralCapture = mk(
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    'test-bottom-structural',
    'test/mobile-functional-page.png#bottom-structural',
    GPT2_MOBILE_BOTTOM_STRUCTURAL_TOP_FRACTION,
    GPT2_MOBILE_BOTTOM_STRUCTURAL_HEIGHT_FRACTION,
  );
  const coverageValidation = validateMobileStructuralCaptureCoverage({
    sourcePageHeight: height,
    top: topStructuralCapture,
    middle: middleStructuralCapture,
    bottom: bottomStructuralCapture,
  });
  const authorityManifest: Gpt2MobileSourceAuthorityManifest = {
    capturePackageVersion: GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1,
    screenshotAuthorityMode: SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY,
    designAuthoritySource: 'CGPT_PLUS_PAGE_ARCHITECTURE_BRIEF',
    topStructuralAttached: true,
    middleStructuralAttached: true,
    bottomStructuralAttached: true,
    topAssetId: topStructuralCapture.assetId,
    middleAssetId: middleStructuralCapture.assetId,
    bottomAssetId: bottomStructuralCapture.assetId,
    stitchedFallbackUsed: false,
    bottomContinuityLockActive: true,
    stitchedAssetId: null,
    fullPageSourceAttached: false,
    bottomHalfSourceAttached: false,
    bottomNavAuthorityAttached: false,
    fullPageAssetId: null,
    bottomHalfAssetId: null,
    bottomNavAssetId: null,
  };
  return {
    capturePackageVersion: GPT2_FUNCTIONAL_REFERENCE_PACKAGE_V1,
    screenshotAuthorityMode: SCREENSHOT_AUTHORITY_MODE_FUNCTIONAL_REFERENCE_ONLY,
    topStructuralCapture,
    middleStructuralCapture,
    bottomStructuralCapture,
    functionalPage: topStructuralCapture,
    bottomHalf: middleStructuralCapture,
    bottomNavAuthority: bottomStructuralCapture,
    continuity: bottomStructuralCapture,
    stitchedFullPage: null,
    creativeSupport: null,
    providerImageOrder: [
      GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL,
    ],
    imageRoleSummary: `Structural Capture A (${GPT2_MOBILE_INPUT_ROLE.TOP_STRUCTURAL}): ${width}×${sliceHeight} · Structural Capture B (${GPT2_MOBILE_INPUT_ROLE.MIDDLE_STRUCTURAL}): ${width}×${sliceHeight} · Structural Capture C (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_STRUCTURAL}): ${width}×${sliceHeight}`,
    authorityManifest,
    coverageValidation,
  };
}

export function orderedProviderReferenceAssets(
  bundle: Gpt2MobileProviderReferenceBundle,
): Gpt2MobileProviderReferenceAsset[] {
  const legacyRoles = new Set<string>([
    GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
  ]);
  for (const role of bundle.providerImageOrder) {
    if (legacyRoles.has(role)) {
      throw new Error(`GPT2_MOBILE_LEGACY_REFERENCE_ROLE_FORBIDDEN: ${role}`);
    }
  }
  const map = new Map<Gpt2MobileProviderInputRole, Gpt2MobileProviderReferenceAsset>();
  map.set(bundle.topStructuralCapture.role, bundle.topStructuralCapture);
  map.set(bundle.middleStructuralCapture.role, bundle.middleStructuralCapture);
  map.set(bundle.bottomStructuralCapture.role, bundle.bottomStructuralCapture);
  return bundle.providerImageOrder.map((role) => {
    const asset = map.get(role);
    if (!asset) throw new Error(`GPT2_MOBILE_REFERENCE_ORDER_MISSING: ${role}`);
    return asset;
  });
}
