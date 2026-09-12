/**
 * P0.VR.CONVERGE.1 — Minimum real CSS variable patch for twin preview (NDXBOOK pilot).
 */

import type { ReconstructionPlan } from '../p0vrCapture1/reconstructionPlan.js';
import type { RegionExecutionDecision } from './types.js';

export type TwinCssPatch = {
  cssVariables: Record<string, string>;
  inlineRules: string[];
};

function parsePx(value: string | undefined): number | null {
  if (!value) return null;
  const m = /([\d.]+)\s*px/.exec(value);
  return m ? Number(m[1]) : null;
}

export function buildTwinCssPatch(input: {
  plan: ReconstructionPlan;
  regionDecisions?: RegionExecutionDecision[];
}): TwinCssPatch {
  const cssVariables: Record<string, string> = {};
  const inlineRules: string[] = [];

  const allChanges = [
    ...input.plan.geometryChanges,
    ...input.plan.spacingChanges,
    ...input.plan.componentChanges,
  ];

  for (const change of allChanges) {
    const px = parsePx(change.authorityValue) ?? parsePx(change.correction);
    if (px == null) continue;
    const name = (change.regionName ?? change.label ?? '').toUpperCase();
    if (name.includes('HEADER') || name.includes('HEADER SHELL')) {
      cssVariables['--site00-twin-header-height'] = `${px}px`;
    }
    if (name.includes('GUTTER') || name.includes('CONTENT PADDING')) {
      cssVariables['--site00-twin-content-padding-x'] = `${px}px`;
    }
    if (name.includes('GAP') || name.includes('SECTION')) {
      cssVariables['--site00-twin-section-gap'] = `${px}px`;
    }
    if (name.includes('BOTTOM NAV')) {
      cssVariables['--site00-twin-bottom-nav-height'] = `${px}px`;
    }
    if (name.includes('SECTION NAV') || name.includes('NAVIGATION')) {
      cssVariables['--site00-twin-nav-band-height'] = `${px}px`;
    }
    if (name.includes('METRIC') || name.includes('KPI')) {
      cssVariables['--site00-twin-metric-cell-min-height'] = `${px}px`;
    }
    if (name.includes('HERO') || name.includes('MEDIA')) {
      cssVariables['--site00-twin-hero-min-height'] = `${px}px`;
    }
    if (name.includes('PROGRESS') || name.includes('PHASE')) {
      cssVariables['--site00-twin-progress-band-height'] = `${px}px`;
    }
  }

  if (Object.keys(cssVariables).length) {
    inlineRules.push(
      '.site00-reconstruction-twin-root .site00-fws-mobile-overview { gap: var(--site00-twin-section-gap, 10px); }',
    );
    inlineRules.push(
      '.site00-reconstruction-twin-root .site00-fws-hub-kpis--mobile { min-height: var(--site00-twin-nav-band-height, auto); }',
    );
    inlineRules.push(
      '.site00-reconstruction-twin-root .site00-fws-hub-kpis__cell { min-height: var(--site00-twin-metric-cell-min-height, auto); }',
    );
    inlineRules.push(
      '.site00-reconstruction-twin-root .site00-fws-mobile-overview__progress { min-height: var(--site00-twin-progress-band-height, auto); }',
    );
  }

  for (const d of input.regionDecisions ?? []) {
    if (d.executionMode === 'FOUNDER_REVIEW_REQUIRED') {
      inlineRules.push(
        `[data-region-id="${d.regionId}"] { outline: 1px dashed rgba(245, 200, 66, 0.45); outline-offset: 2px; }`,
      );
    }
  }

  return { cssVariables, inlineRules };
}
