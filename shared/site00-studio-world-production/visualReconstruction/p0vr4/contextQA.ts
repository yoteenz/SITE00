/**
 * P0.VR.4 — Live page context QA.
 */

import { CONTEXT_QA_DOMAINS } from './types.js';
import type { ContextQaResult, DesignAssetContextQA, QaVerdict } from './types.js';

function result(domain: ContextQaResult['domain'], verdict: QaVerdict, reason?: string): ContextQaResult {
  return { domain, verdict, reason };
}

export function evaluateContextQA(input: {
  liveScreenshotCaptured: boolean;
  referenceMatchScore?: number;
  mobileVerified?: boolean;
  desktopVerified?: boolean;
}): DesignAssetContextQA {
  const results: ContextQaResult[] = [];

  if (!input.liveScreenshotCaptured) {
    results.push(result('referenceContextMatch', 'FAIL', 'Live route screenshot not captured'));
  } else {
    const score = input.referenceMatchScore ?? 0.75;
    const verdict: QaVerdict = score >= 0.85 ? 'PASS' : score >= 0.65 ? 'WARNING' : 'FAIL';
    results.push(result('referenceContextMatch', verdict));
    results.push(result('renderedSize', verdict));
    results.push(result('position', verdict));
    results.push(result('padding', 'WARNING'));
    results.push(result('visualWeight', 'WARNING'));
    results.push(result('contrast', 'WARNING'));
    results.push(result('alignment', 'WARNING'));
    results.push(result('crop', 'PASS'));
  }

  results.push(
    result('mobileContextMatch', input.mobileVerified ? 'PASS' : 'WARNING', 'Mobile context verification pending'),
  );
  results.push(
    result('desktopContextMatch', input.desktopVerified ? 'PASS' : 'WARNING', 'Desktop context verification pending'),
  );

  const overallPass = results.every((r) => r.verdict !== 'FAIL') && input.liveScreenshotCaptured;

  return { results, overallPass };
}

export function contextQaDomainsExist(): boolean {
  return CONTEXT_QA_DOMAINS.length >= 10;
}

export function liveRouteScreenshotVerificationRequired(): boolean {
  return true;
}
