/**
 * P0.VR.4 — Visual QA engine for asset reconstruction.
 */

import { QA_DOMAINS } from './types.js';
import type {
  DesignAssetReconstructionFailureClass,
  DesignAssetReconstructionQA,
  QaDomain,
  QaDomainResult,
  QaVerdict,
  TransparencyValidationResult,
} from './types.js';

function domainResult(
  domain: QaDomain,
  verdict: QaVerdict,
  reason?: string,
  recommendedCorrection?: string,
): QaDomainResult {
  return { domain, verdict, reason, recommendedCorrection };
}

export function evaluateAssetReconstructionQA(input: {
  hasReferenceCrop: boolean;
  transparency: TransparencyValidationResult;
  generatedUrlPresent: boolean;
}): DesignAssetReconstructionQA {
  const domains: QaDomainResult[] = [];

  if (!input.hasReferenceCrop) {
    domains.push(domainResult('REFERENCE_FIDELITY', 'FAIL', 'Missing reference crop'));
  } else {
    domains.push(domainResult('REFERENCE_FIDELITY', 'PASS'));
  }

  if (!input.generatedUrlPresent) {
    domains.push(domainResult('SILHOUETTE_MATCH', 'FAIL', 'No generated asset'));
  } else {
    domains.push(domainResult('SILHOUETTE_MATCH', 'WARNING', 'Automated silhouette match requires vision review'));
    domains.push(domainResult('PROPORTION_MATCH', 'WARNING'));
    domains.push(domainResult('COLOR_MATCH', 'WARNING'));
    domains.push(domainResult('MATERIAL_MATCH', 'WARNING'));
    domains.push(domainResult('LIGHTING_MATCH', 'WARNING'));
    domains.push(domainResult('ORIENTATION_MATCH', 'WARNING'));
    domains.push(domainResult('DETAIL_MATCH', 'WARNING'));
    domains.push(domainResult('VISUAL_WEIGHT', 'WARNING'));
    domains.push(domainResult('NO_EXTRA_OBJECTS', 'WARNING'));
    domains.push(domainResult('NO_TEXT_CONTAMINATION', 'WARNING'));
  }

  const transparencyVerdict: QaVerdict = input.transparency.overallPass
    ? 'PASS'
    : input.transparency.alphaChannelPresent
      ? 'WARNING'
      : 'FAIL';
  domains.push(
    domainResult(
      'TRANSPARENCY',
      transparencyVerdict,
      input.transparency.overallPass ? undefined : 'Transparency validation incomplete',
      transparencyVerdict !== 'PASS' ? 'Run background removal or regenerate with transparent output' : undefined,
    ),
  );

  domains.push(
    domainResult(
      'EDGE_QUALITY',
      input.transparency.edgeQuality,
      input.transparency.edgeErosion ? 'Edge erosion detected' : undefined,
    ),
  );

  domains.push(
    domainResult(
      'NO_BACKGROUND',
      input.transparency.backgroundConfidence >= 0.7 ? 'PASS' : 'FAIL',
      input.transparency.backgroundConfidence < 0.7 ? 'Background still present' : undefined,
      'Remove background using configured provider',
    ),
  );

  const failureClasses: DesignAssetReconstructionFailureClass[] = [];
  if (!input.hasReferenceCrop) failureClasses.push('REFERENCE_CROP_INVALID');
  if (!input.transparency.alphaChannelPresent) failureClasses.push('TRANSPARENCY_MISSING');
  if (input.transparency.transparentMaterialLoss) failureClasses.push('TRANSPARENT_MATERIAL_LOSS');
  if (input.transparency.glowClipping) failureClasses.push('GLOW_CLIPPING');
  if (input.transparency.edgeErosion) failureClasses.push('EDGE_EROSION');
  if (input.transparency.backgroundConfidence < 0.7) failureClasses.push('BACKGROUND_PRESENT');

  const hasFail = domains.some((d) => d.verdict === 'FAIL');
  const revisionRequired = hasFail || domains.some((d) => d.verdict === 'WARNING');

  return {
    domains,
    overallPass: !hasFail && input.transparency.overallPass && input.generatedUrlPresent,
    revisionRequired,
    failureClasses,
  };
}

export function qaDomainsExist(): boolean {
  return QA_DOMAINS.length >= 14;
}

export function extractTargetedRevisionDiagnosis(qa: DesignAssetReconstructionQA): string | null {
  const fail = qa.domains.find((d) => d.verdict === 'FAIL' && d.recommendedCorrection);
  if (fail?.reason) return fail.reason;
  const warn = qa.domains.find((d) => d.verdict === 'WARNING' && d.recommendedCorrection);
  return warn?.reason ?? null;
}
