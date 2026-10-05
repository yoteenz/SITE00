/**
 * Structural sanitation before gallery / authority promotion (no aesthetic edits).
 */

import { validateConceptCanvas } from './pageConceptViewportCanvasContract.js';
import type { AuthorityArtifactSanitationReceipt } from './pageConceptAuthorityArtifactSanitation.js';
import { validateAuthorityArtifactSanitationReceipt } from './pageConceptAuthorityArtifactSanitation.js';

export type ConceptArtifactNormalizationResult = {
  ok: boolean;
  errorCode: 'CONCEPT_CANVAS_INVALID' | 'CONCEPT_ARTIFACT_INCOMPLETE' | null;
  reason?: string;
  normalized: {
    productOnlyInterface: boolean;
    width: number;
    height: number;
    letterboxFree: boolean;
    deviceChromeFree: boolean;
  } | null;
};

export function normalizeConceptArtifact(input: {
  width: number | null | undefined;
  height: number | null | undefined;
  artifactStatus: string;
  sanitationApplied?: boolean;
  sanitationReceipt?: AuthorityArtifactSanitationReceipt | null;
}): ConceptArtifactNormalizationResult {
  const width = input.width ?? 0;
  const height = input.height ?? 0;
  if (input.artifactStatus !== 'READY' || width <= 0 || height <= 0) {
    return {
      ok: false,
      errorCode: 'CONCEPT_ARTIFACT_INCOMPLETE',
      reason: 'Artifact not READY or missing dimensions',
      normalized: null,
    };
  }
  if (input.sanitationReceipt) {
    const receiptOk = validateAuthorityArtifactSanitationReceipt(input.sanitationReceipt);
    if (!receiptOk.ok) {
      return {
        ok: false,
        errorCode: 'CONCEPT_CANVAS_INVALID',
        reason: receiptOk.reason,
        normalized: null,
      };
    }
  }

  const canvas = validateConceptCanvas({ width, height });
  if (!canvas.ok) {
    return {
      ok: false,
      errorCode: 'CONCEPT_CANVAS_INVALID',
      reason: canvas.reason,
      normalized: null,
    };
  }
  return {
    ok: true,
    errorCode: null,
    normalized: {
      productOnlyInterface: input.sanitationApplied !== false,
      width,
      height,
      letterboxFree: !canvas.letterboxDetected,
      deviceChromeFree: input.sanitationReceipt?.deviceChromeRemoved ?? input.sanitationApplied !== false,
    },
  };
}
