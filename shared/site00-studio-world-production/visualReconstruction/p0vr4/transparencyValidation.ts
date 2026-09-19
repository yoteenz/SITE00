/**
 * P0.VR.4 — Transparency validation.
 */

import type { TransparencyValidationResult, QaVerdict } from './types.js';

export type TransparencyMetadata = {
  hasAlpha?: boolean;
  channels?: number;
  backgroundLuminance?: number;
  edgeContamination?: number;
};

function verdictFromScore(score: number, passAt: number, warnAt: number): QaVerdict {
  if (score >= passAt) return 'PASS';
  if (score >= warnAt) return 'WARNING';
  return 'FAIL';
}

export function validateTransparency(meta: TransparencyMetadata): TransparencyValidationResult {
  const alphaChannelPresent = meta.hasAlpha === true || meta.channels === 4;
  const backgroundConfidence = alphaChannelPresent ? 0.95 : Math.max(0, 1 - (meta.backgroundLuminance ?? 0.5));
  const edgeScore = 1 - (meta.edgeContamination ?? 0.2);

  const haloRisk = verdictFromScore(edgeScore, 0.85, 0.65);
  const edgeQuality = verdictFromScore(edgeScore, 0.8, 0.6);

  const semiTransparentMaterialPreserved = alphaChannelPresent;
  const glowPreserved = edgeScore >= 0.7;
  const transparentMaterialLoss = !semiTransparentMaterialPreserved && (meta.channels ?? 3) === 3;
  const glowClipping = !glowPreserved && alphaChannelPresent;
  const edgeErosion = edgeQuality === 'FAIL';
  const chromeHalo = haloRisk === 'FAIL';
  const glassAlphaFailure = transparentMaterialLoss;

  const overallPass =
    alphaChannelPresent &&
    haloRisk !== 'FAIL' &&
    edgeQuality !== 'FAIL' &&
    !transparentMaterialLoss &&
    !glassAlphaFailure;

  return {
    alphaChannelPresent,
    backgroundConfidence,
    haloRisk,
    edgeQuality,
    semiTransparentMaterialPreserved,
    glowPreserved,
    transparentMaterialLoss,
    glowClipping,
    edgeErosion,
    chromeHalo,
    glassAlphaFailure,
    overallPass,
  };
}

export function backgroundRemovalRequired(transparency: TransparencyValidationResult): boolean {
  if (transparency.overallPass) return false;
  return (
    !transparency.alphaChannelPresent ||
    transparency.haloRisk === 'FAIL' ||
    transparency.edgeQuality === 'FAIL' ||
    transparency.backgroundConfidence < 0.7
  );
}
