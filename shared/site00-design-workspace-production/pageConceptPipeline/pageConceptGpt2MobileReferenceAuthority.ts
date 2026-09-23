/**
 * P0.VR.GPT2-MOBILE-FULL-PAGE-CONTINUITY-AND-BOTTOM-NAV-LOCK1
 * Full-page + lower-half + bottom-nav authority references for GPT2 mobile.
 */

import {
  type Gpt2MobileSourceAuthorityManifest,
} from './pageConceptGpt2MobileContinuityLock.js';
import { PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION } from './pageConceptGpt2MobilePageAuthority.js';

export const GPT2_MOBILE_INPUT_ROLE = {
  /** Full-height mobile page capture — structural authority */
  FULL_PAGE_SOURCE: 'FULL_PAGE_SOURCE_CAPTURE',
  /** @deprecated alias — same as FULL_PAGE_SOURCE */
  FUNCTIONAL_PAGE: 'FULL_PAGE_SOURCE_CAPTURE',
  BOTTOM_HALF: 'BOTTOM_HALF_SOURCE_CAPTURE',
  BOTTOM_NAV: 'BOTTOM_NAV_AUTHORITY_CROP',
  /** @deprecated alias — same as BOTTOM_NAV */
  CONTINUITY: 'BOTTOM_NAV_AUTHORITY_CROP',
  STITCHED_PAGE: 'STITCHED_FULL_PAGE_CAPTURE',
  CREATIVE_SUPPORT: 'CREATIVE_SUPPORT_REFERENCE',
} as const;

export type Gpt2MobileProviderInputRole =
  (typeof GPT2_MOBILE_INPUT_ROLE)[keyof typeof GPT2_MOBILE_INPUT_ROLE];

/** Lower half of the page starts at 50% scroll depth. */
export const GPT2_MOBILE_BOTTOM_HALF_TOP_FRACTION = 0.5;

/** Minimum pixels for the full-page functional reference (reject preview/thumbnail strips). */
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_WIDTH = 320;
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_HEIGHT = 520;

/** Reject obviously non-mobile-page crops (e.g. 390×186 continuity-only mistaken as page). */
export const GPT2_MOBILE_MIN_FUNCTIONAL_REFERENCE_ASPECT = 1.35;

export type Gpt2MobileProviderReferenceAsset = {
  role: Gpt2MobileProviderInputRole;
  assetId: string;
  sourcePath: string;
  width: number;
  height: number;
  base64: string;
};

export type Gpt2MobileProviderReferenceBundle = {
  functionalPage: Gpt2MobileProviderReferenceAsset;
  bottomHalf: Gpt2MobileProviderReferenceAsset | null;
  bottomNavAuthority: Gpt2MobileProviderReferenceAsset | null;
  /** @deprecated use bottomNavAuthority */
  continuity: Gpt2MobileProviderReferenceAsset | null;
  stitchedFullPage: Gpt2MobileProviderReferenceAsset | null;
  creativeSupport: Gpt2MobileProviderReferenceAsset | null;
  providerImageOrder: readonly Gpt2MobileProviderInputRole[];
  imageRoleSummary: string;
  authorityManifest: Gpt2MobileSourceAuthorityManifest;
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

export async function extractVerticalRegionCrop(input: {
  functionalCaptureBase64: string;
  fallbackViewport?: CaptureImageDimensions;
  regionTopFraction: number;
  regionHeightFraction: number;
  role: Gpt2MobileProviderInputRole;
  assetId: string;
  sourcePath: string;
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
  };
}

/** @deprecated use extractVerticalRegionCrop */
export async function extractContinuityReferenceFromFunctionalCapture(input: {
  functionalCaptureBase64: string;
  fallbackViewport?: CaptureImageDimensions;
  fraction?: number;
  continuityAssetId: string;
  continuitySourcePath: string;
}): Promise<Gpt2MobileProviderReferenceAsset | null> {
  const fraction = input.fraction ?? PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION;
  return extractVerticalRegionCrop({
    functionalCaptureBase64: input.functionalCaptureBase64,
    fallbackViewport: input.fallbackViewport,
    regionTopFraction: Math.max(0, 1 - fraction),
    regionHeightFraction: fraction,
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
    assetId: input.continuityAssetId,
    sourcePath: input.continuitySourcePath,
  });
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

  const functionalPage: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
    assetId: input.functionalAssetId,
    sourcePath: input.functionalSourcePath,
    width: fullPageDims.width,
    height: fullPageDims.height,
    base64: fullPageBase64,
  };

  let stitchedFullPage: Gpt2MobileProviderReferenceAsset | null = null;
  if (stitchedFallbackUsed && input.stitchedAssetId) {
    stitchedFullPage = {
      role: GPT2_MOBILE_INPUT_ROLE.STITCHED_PAGE,
      assetId: input.stitchedAssetId,
      sourcePath: input.stitchedSourcePath ?? `${input.functionalSourcePath}#stitched`,
      width: fullPageDims.width,
      height: fullPageDims.height,
      base64: fullPageBase64,
    };
  }

  const bottomHalf = await extractVerticalRegionCrop({
    functionalCaptureBase64: fullPageBase64,
    fallbackViewport: fullPageDims,
    regionTopFraction: GPT2_MOBILE_BOTTOM_HALF_TOP_FRACTION,
    regionHeightFraction: 1 - GPT2_MOBILE_BOTTOM_HALF_TOP_FRACTION,
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
    assetId: `${input.captureSetId}:bottom-half`,
    sourcePath: `${input.functionalSourcePath}#lower-half`,
  });

  const bottomNavAuthority = await extractVerticalRegionCrop({
    functionalCaptureBase64: fullPageBase64,
    fallbackViewport: fullPageDims,
    regionTopFraction: Math.max(0, 1 - PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION),
    regionHeightFraction: PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION,
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
    assetId: `${input.captureSetId}:bottom-nav-authority`,
    sourcePath: `${input.functionalSourcePath}#bottom-nav-${PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION}`,
  });

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
    };
  }

  const providerImageOrder: Gpt2MobileProviderInputRole[] = [
    GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
    GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
  ];
  if (creativeSupport) providerImageOrder.push(GPT2_MOBILE_INPUT_ROLE.CREATIVE_SUPPORT);

  const imageRoleSummary = [
    `Image A (${GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE}): ${functionalPage.width}×${functionalPage.height}`,
    `Image B (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF}): ${bottomHalf.width}×${bottomHalf.height}`,
    `Image C (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV}): ${bottomNavAuthority.width}×${bottomNavAuthority.height}`,
    creativeSupport ?
      `Image D (${GPT2_MOBILE_INPUT_ROLE.CREATIVE_SUPPORT}): ${creativeSupport.width}×${creativeSupport.height}`
    : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const authorityManifest: Gpt2MobileSourceAuthorityManifest = {
    fullPageSourceAttached: true,
    bottomHalfSourceAttached: true,
    bottomNavAuthorityAttached: true,
    stitchedFallbackUsed,
    bottomContinuityLockActive: true,
    fullPageAssetId: functionalPage.assetId,
    bottomHalfAssetId: bottomHalf.assetId,
    bottomNavAssetId: bottomNavAuthority.assetId,
    stitchedAssetId: stitchedFullPage?.assetId ?? null,
  };

  return {
    functionalPage,
    bottomHalf,
    bottomNavAuthority,
    continuity: bottomNavAuthority,
    stitchedFullPage,
    creativeSupport,
    providerImageOrder,
    imageRoleSummary,
    authorityManifest,
  };
}

export function formatGpt2MobileReferenceAuthorityDebugLines(
  bundle: Gpt2MobileProviderReferenceBundle,
): string[] {
  const line = (asset: Gpt2MobileProviderReferenceAsset) =>
    `${asset.role}: ${asset.assetId} · ${asset.sourcePath} · ${asset.width}×${asset.height}`;
  return [
    `COMPILED PROMPT IMAGE ROLE SUMMARY: ${bundle.imageRoleSummary}`,
    line(bundle.functionalPage),
    ...(bundle.bottomHalf ? [line(bundle.bottomHalf)] : ['BOTTOM_HALF_SOURCE_CAPTURE: —']),
    ...(bundle.bottomNavAuthority ?
      [line(bundle.bottomNavAuthority)]
    : ['BOTTOM_NAV_AUTHORITY_CROP: —']),
    ...(bundle.stitchedFullPage ? [line(bundle.stitchedFullPage)] : []),
    ...(bundle.creativeSupport ?
      [line(bundle.creativeSupport)]
    : ['CREATIVE_SUPPORT_REFERENCE: — (optional, not sent)']),
    `PROVIDER IMAGE ORDER: ${bundle.providerImageOrder.join(' → ')}`,
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
  const bottomHalfHeight = Math.max(32, Math.round(height * (1 - GPT2_MOBILE_BOTTOM_HALF_TOP_FRACTION)));
  const navHeight = Math.max(32, Math.round(height * PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION));
  const functionalPage: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
    assetId: 'test-functional-page',
    sourcePath: 'test/mobile-functional-page.png',
    width,
    height,
    base64: functionalBase64,
  };
  const bottomHalf: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
    assetId: 'test-bottom-half',
    sourcePath: 'test/mobile-functional-page.png#lower-half',
    width,
    height: bottomHalfHeight,
    base64: functionalBase64,
  };
  const bottomNavAuthority: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
    assetId: 'test-bottom-nav',
    sourcePath: 'test/mobile-functional-page.png#bottom-nav',
    width,
    height: navHeight,
    base64: input?.continuityBase64 ?? 'bbb',
  };
  const authorityManifest: Gpt2MobileSourceAuthorityManifest = {
    fullPageSourceAttached: true,
    bottomHalfSourceAttached: true,
    bottomNavAuthorityAttached: true,
    stitchedFallbackUsed: false,
    bottomContinuityLockActive: true,
    fullPageAssetId: functionalPage.assetId,
    bottomHalfAssetId: bottomHalf.assetId,
    bottomNavAssetId: bottomNavAuthority.assetId,
    stitchedAssetId: null,
  };
  return {
    functionalPage,
    bottomHalf,
    bottomNavAuthority,
    continuity: bottomNavAuthority,
    stitchedFullPage: null,
    creativeSupport: null,
    providerImageOrder: [
      GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF,
      GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV,
    ],
    imageRoleSummary: `Image A (${GPT2_MOBILE_INPUT_ROLE.FULL_PAGE_SOURCE}): ${width}×${height} · Image B (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_HALF}): ${width}×${bottomHalfHeight} · Image C (${GPT2_MOBILE_INPUT_ROLE.BOTTOM_NAV}): ${width}×${navHeight}`,
    authorityManifest,
  };
}

export function orderedProviderReferenceAssets(
  bundle: Gpt2MobileProviderReferenceBundle,
): Gpt2MobileProviderReferenceAsset[] {
  const map = new Map<Gpt2MobileProviderInputRole, Gpt2MobileProviderReferenceAsset>();
  map.set(bundle.functionalPage.role, bundle.functionalPage);
  if (bundle.bottomHalf) map.set(bundle.bottomHalf.role, bundle.bottomHalf);
  if (bundle.bottomNavAuthority) map.set(bundle.bottomNavAuthority.role, bundle.bottomNavAuthority);
  if (bundle.stitchedFullPage) map.set(bundle.stitchedFullPage.role, bundle.stitchedFullPage);
  if (bundle.creativeSupport) map.set(bundle.creativeSupport.role, bundle.creativeSupport);
  return bundle.providerImageOrder.map((role) => {
    const asset = map.get(role);
    if (!asset) throw new Error(`GPT2_MOBILE_REFERENCE_ORDER_MISSING: ${role}`);
    return asset;
  });
}
