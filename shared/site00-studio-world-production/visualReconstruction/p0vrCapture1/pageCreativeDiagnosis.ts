/**
 * P0.VR.CAPTURE.1 / P0.VR.UPGRADE.1 — Diagnose live capture vs design authority drift.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { buildPageVisualDiagnosis } from './pageVisualDiagnosis.js';
import type { PageCreativeDiagnosis, PageCreativeDiagnosisCode } from './types.js';

export function buildPageCreativeDiagnosis(options?: {
  isChildPage?: boolean;
  isRootPage?: boolean;
  viewport?: DesignViewportClass | string;
  hasDenseText?: boolean;
  missingParentGrammar?: boolean;
  pagePurpose?: string;
}): PageCreativeDiagnosis {
  const visual = buildPageVisualDiagnosis({
    isRootPage: options?.isRootPage,
    viewport: options?.viewport as DesignViewportClass | undefined,
    pagePurpose: options?.pagePurpose,
  });

  const codes: PageCreativeDiagnosisCode[] = [];
  if (options?.hasDenseText) codes.push('TEXT_DENSITY', 'CONTENT_OVERLOAD');
  if (options?.missingParentGrammar) codes.push('PARENT_GRAMMAR_DRIFT');
  if (options?.isChildPage) codes.push('VISUAL_HIERARCHY_WEAKNESS');
  if (options?.viewport === 'mobile') codes.push('MOBILE_DRIFT');
  if (options?.viewport === 'desktop') codes.push('DESKTOP_DRIFT');
  for (const f of visual.findings) {
    if (f.dimension === 'SPACING' || f.dimension === 'CONTENT_DENSITY') codes.push('SPACING_DRIFT');
    if (f.dimension === 'NAVIGATION' || f.dimension === 'CONTROLS') codes.push('CTA_DRIFT');
    if (f.dimension === 'PARENT_GEOMETRY' || f.dimension === 'COMPONENT_PROPORTIONS') {
      codes.push('FUNCTION_VISUAL_MISMATCH');
    }
  }
  if (codes.length === 0) codes.push('FUNCTION_VISUAL_MISMATCH');

  return {
    codes: [...new Set(codes)],
    summary: visual.summary,
    detectedAt: visual.detectedAt,
  };
}
