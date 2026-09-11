/**
 * P0.VR.CAPTURE.1 — Diagnose live capture vs parent authority drift.
 */

import type { PageCreativeDiagnosis, PageCreativeDiagnosisCode } from './types.js';

export function buildPageCreativeDiagnosis(options?: {
  isChildPage?: boolean;
  isRootPage?: boolean;
  viewport?: string;
  hasDenseText?: boolean;
  missingParentGrammar?: boolean;
}): PageCreativeDiagnosis {
  const codes: PageCreativeDiagnosisCode[] = [];
  if (options?.hasDenseText) codes.push('TEXT_DENSITY', 'CONTENT_OVERLOAD');
  if (options?.missingParentGrammar) codes.push('PARENT_GRAMMAR_DRIFT', 'GENERIC_SAAS_DRIFT');
  if (options?.isChildPage) codes.push('VISUAL_HIERARCHY_WEAKNESS');
  if (options?.viewport === 'mobile') codes.push('MOBILE_DRIFT');
  if (options?.viewport === 'desktop') codes.push('DESKTOP_DRIFT');
  if (codes.length === 0) codes.push('FUNCTION_VISUAL_MISMATCH');

  const summary = options?.isRootPage
    ? 'Live root page drifts from approved design authority reference.'
    : codes.includes('PARENT_GRAMMAR_DRIFT')
      ? 'Live page drifts from approved parent experience grammar.'
      : 'Live implementation needs creative-directed convergence with parent authority.';

  return {
    codes: [...new Set(codes)],
    summary,
    detectedAt: new Date().toISOString(),
  };
}
