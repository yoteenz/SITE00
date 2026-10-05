/**
 * Canonical mobile concept canvas — all A/B/C in a run share one viewport frame.
 */

export const SITE00_MOBILE_VIEWPORT_CANVAS_ID = 'site00-mobile-concept-v1' as const;

/** High-resolution generation target (2× logical 390×844). */
export const SITE00_MOBILE_GENERATION_CANVAS = {
  viewportCanvasId: SITE00_MOBILE_VIEWPORT_CANVAS_ID,
  width: 780,
  height: 1688,
  aspectRatio: 1688 / 780,
} as const;

export const SITE00_MOBILE_DISPLAY_CANVAS = {
  viewportCanvasId: 'site00-mobile-display-390x844',
  width: 390,
  height: 844,
  aspectRatio: 844 / 390,
} as const;

/** Legacy provider output still accepted when aspect matches. */
export const SITE00_MOBILE_LEGACY_GENERATION_CANVAS = {
  viewportCanvasId: 'site00-mobile-legacy-768x1376',
  width: 768,
  height: 1376,
  aspectRatio: 1376 / 768,
} as const;

export type ViewportCanvasContract = {
  viewportCanvasId: string;
  width: number;
  height: number;
  aspectRatio: number;
};

export type ViewportCanvasValidationResult = {
  ok: boolean;
  errorCode: 'CONCEPT_CANVAS_INVALID' | 'CONCEPT_ASPECT_MISMATCH' | null;
  reason?: string;
  matchedContract: ViewportCanvasContract | null;
};

const KNOWN_MOBILE_CANVASES: readonly ViewportCanvasContract[] = [
  SITE00_MOBILE_GENERATION_CANVAS,
  SITE00_MOBILE_DISPLAY_CANVAS,
  SITE00_MOBILE_LEGACY_GENERATION_CANVAS,
];

const ASPECT_TOLERANCE = 0.06;

export function resolveViewportCanvasContract(width: number, height: number): ViewportCanvasContract | null {
  if (width <= 0 || height <= 0) return null;
  const aspect = height / width;
  for (const contract of KNOWN_MOBILE_CANVASES) {
    if (width === contract.width && height === contract.height) return contract;
    if (Math.abs(aspect - contract.aspectRatio) <= ASPECT_TOLERANCE) {
      return contract;
    }
  }
  return null;
}

export function validateConceptCanvasDimensions(width: number, height: number): ViewportCanvasValidationResult {
  const matched = resolveViewportCanvasContract(width, height);
  if (!matched) {
    return {
      ok: false,
      errorCode: 'CONCEPT_CANVAS_INVALID',
      reason: `Canvas ${width}×${height} does not match canonical mobile viewport contracts`,
      matchedContract: null,
    };
  }
  if (width !== matched.width || height !== matched.height) {
    const aspectOk = Math.abs(height / width - matched.aspectRatio) <= ASPECT_TOLERANCE;
    if (!aspectOk) {
      return {
        ok: false,
        errorCode: 'CONCEPT_ASPECT_MISMATCH',
        reason: `Aspect ${(height / width).toFixed(3)} vs contract ${matched.aspectRatio.toFixed(3)}`,
        matchedContract: matched,
      };
    }
  }
  return { ok: true, errorCode: null, matchedContract: matched };
}

export function detectLetterboxCanvas(input: {
  width: number;
  height: number;
  expected: ViewportCanvasContract;
}): boolean {
  const { width, height, expected } = input;
  const actualAspect = height / Math.max(width, 1);
  const expectedAspect = expected.aspectRatio;
  if (Math.abs(actualAspect - expectedAspect) > ASPECT_TOLERANCE) return true;
  if (width > expected.width * 1.12 && Math.abs(actualAspect - expectedAspect) < 0.02) return true;
  return false;
}

export function validateConceptCanvas(input: {
  width: number;
  height: number;
}): ViewportCanvasValidationResult & { letterboxDetected: boolean } {
  const base = validateConceptCanvasDimensions(input.width, input.height);
  const expected = base.matchedContract ?? SITE00_MOBILE_GENERATION_CANVAS;
  const letterboxDetected = detectLetterboxCanvas({
    width: input.width,
    height: input.height,
    expected,
  });
  if (letterboxDetected) {
    return {
      ok: false,
      errorCode: 'CONCEPT_CANVAS_INVALID',
      reason: 'Letterbox or outer framing detected relative to canonical mobile canvas',
      matchedContract: expected,
      letterboxDetected: true,
    };
  }
  return { ...base, letterboxDetected: false };
}

export function assertRunMobileCanvasConsistency(sizes: readonly { width: number; height: number }[]): {
  ok: boolean;
  reason?: string;
} {
  if (sizes.length === 0) return { ok: true };
  const first = sizes[0]!;
  for (const s of sizes) {
    if (s.width !== first.width || s.height !== first.height) {
      return {
        ok: false,
        reason: `A/B/C canvas mismatch: ${first.width}×${first.height} vs ${s.width}×${s.height}`,
      };
    }
  }
  return { ok: true };
}
