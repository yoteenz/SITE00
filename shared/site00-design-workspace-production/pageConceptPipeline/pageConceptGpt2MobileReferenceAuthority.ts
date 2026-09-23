/**
 * P0.VR.GPT2-MOBILE-DUAL-REFERENCE-AUTHORITY-WIRING-FIX1
 * Separated provider image roles: functional page vs continuity vs optional creative support.
 */

import { PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION } from './pageConceptGpt2MobilePageAuthority.js';

export const GPT2_MOBILE_INPUT_ROLE = {
  FUNCTIONAL_PAGE: 'FUNCTIONAL_PAGE_REFERENCE',
  CONTINUITY: 'CONTINUITY_REFERENCE',
  CREATIVE_SUPPORT: 'CREATIVE_SUPPORT_REFERENCE',
} as const;

export type Gpt2MobileProviderInputRole =
  (typeof GPT2_MOBILE_INPUT_ROLE)[keyof typeof GPT2_MOBILE_INPUT_ROLE];

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
  continuity: Gpt2MobileProviderReferenceAsset | null;
  creativeSupport: Gpt2MobileProviderReferenceAsset | null;
  /** Provider upload order — Image A, B, C */
  providerImageOrder: readonly Gpt2MobileProviderInputRole[];
  imageRoleSummary: string;
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

export async function extractContinuityReferenceFromFunctionalCapture(input: {
  functionalCaptureBase64: string;
  fallbackViewport?: CaptureImageDimensions;
  fraction?: number;
  continuityAssetId: string;
  continuitySourcePath: string;
}): Promise<Gpt2MobileProviderReferenceAsset | null> {
  const fraction = input.fraction ?? PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION;
  const sourceDims = await probeCaptureImageDimensions(input.functionalCaptureBase64, input.fallbackViewport);
  const cropHeight = Math.max(32, Math.round(sourceDims.height * fraction));
  const cropTop = Math.max(0, sourceDims.height - cropHeight);

  if (process.env.VITEST === 'true') {
    return {
      role: GPT2_MOBILE_INPUT_ROLE.CONTINUITY,
      assetId: input.continuityAssetId,
      sourcePath: input.continuitySourcePath,
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
    role: GPT2_MOBILE_INPUT_ROLE.CONTINUITY,
    assetId: input.continuityAssetId,
    sourcePath: input.continuitySourcePath,
    width: sourceDims.width,
    height: cropHeight,
    base64: cropped.toString('base64'),
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
}): Promise<Gpt2MobileProviderReferenceBundle> {
  const functionalDims = await probeCaptureImageDimensions(
    input.functionalCaptureBase64,
    input.fallbackViewport,
  );
  const functionalCheck = validateFunctionalPageReferenceDimensions(functionalDims);
  if (!functionalCheck.ok) {
    throw new Error(
      `${functionalCheck.errorCode}: ${functionalCheck.reason ?? 'invalid functional page reference'}`,
    );
  }

  const functionalPage: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE,
    assetId: input.functionalAssetId,
    sourcePath: input.functionalSourcePath,
    width: functionalDims.width,
    height: functionalDims.height,
    base64: input.functionalCaptureBase64,
  };

  const continuity = await extractContinuityReferenceFromFunctionalCapture({
    functionalCaptureBase64: input.functionalCaptureBase64,
    fallbackViewport: functionalDims,
    continuityAssetId: `${input.captureSetId}:bottom-continuity`,
    continuitySourcePath: `${input.functionalSourcePath}#bottom-${PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION}`,
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

  const providerImageOrder: Gpt2MobileProviderInputRole[] = [GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE];
  if (continuity) providerImageOrder.push(GPT2_MOBILE_INPUT_ROLE.CONTINUITY);
  if (creativeSupport) providerImageOrder.push(GPT2_MOBILE_INPUT_ROLE.CREATIVE_SUPPORT);

  const imageRoleSummary = [
    `Image A (${GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE}): ${functionalPage.width}×${functionalPage.height}`,
    continuity ?
      `Image B (${GPT2_MOBILE_INPUT_ROLE.CONTINUITY}): ${continuity.width}×${continuity.height}`
    : null,
    creativeSupport ?
      `Image C (${GPT2_MOBILE_INPUT_ROLE.CREATIVE_SUPPORT}): ${creativeSupport.width}×${creativeSupport.height}`
    : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    functionalPage,
    continuity,
    creativeSupport,
    providerImageOrder,
    imageRoleSummary,
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
    ...(bundle.continuity ? [line(bundle.continuity)] : ['CONTINUITY_REFERENCE: —']),
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
  const continuityHeight = Math.max(32, Math.round(height * PAGE_GPT2_MOBILE_BOTTOM_CONTINUITY_FRACTION));
  const functionalPage: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE,
    assetId: 'test-functional-page',
    sourcePath: 'test/mobile-functional-page.png',
    width,
    height,
    base64: functionalBase64,
  };
  const continuity: Gpt2MobileProviderReferenceAsset = {
    role: GPT2_MOBILE_INPUT_ROLE.CONTINUITY,
    assetId: 'test-continuity',
    sourcePath: 'test/mobile-functional-page.png#bottom',
    width,
    height: continuityHeight,
    base64: input?.continuityBase64 ?? 'bbb',
  };
  return {
    functionalPage,
    continuity,
    creativeSupport: null,
    providerImageOrder: [GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE, GPT2_MOBILE_INPUT_ROLE.CONTINUITY],
    imageRoleSummary: `Image A (${GPT2_MOBILE_INPUT_ROLE.FUNCTIONAL_PAGE}): ${width}×${height} · Image B (${GPT2_MOBILE_INPUT_ROLE.CONTINUITY}): ${width}×${continuityHeight}`,
  };
}

export function orderedProviderReferenceAssets(
  bundle: Gpt2MobileProviderReferenceBundle,
): Gpt2MobileProviderReferenceAsset[] {
  const map = new Map<Gpt2MobileProviderInputRole, Gpt2MobileProviderReferenceAsset>();
  map.set(bundle.functionalPage.role, bundle.functionalPage);
  if (bundle.continuity) map.set(bundle.continuity.role, bundle.continuity);
  if (bundle.creativeSupport) map.set(bundle.creativeSupport.role, bundle.creativeSupport);
  return bundle.providerImageOrder.map((role) => {
    const asset = map.get(role);
    if (!asset) throw new Error(`GPT2_MOBILE_REFERENCE_ORDER_MISSING: ${role}`);
    return asset;
  });
}
