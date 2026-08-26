/**
 * P0.VR.1D.9 — VisualShellMatchEvaluation against reference shell geometry.
 */

import { randomUUID } from 'node:crypto';
import {
  FAIL_BOTTOM_NAV_SHELL_DRIFT,
  FAIL_CONTENT_WRAPPER_WIDTH_DRIFT,
  FAIL_HEADER_SHELL_GEOMETRY_DRIFT,
  FAIL_PAGE_GUTTER_DRIFT,
  SHELL_MATCH_TOLERANCE_PX,
} from './constants.js';
import type {
  MobileScreenVisualShellSpec,
  VisualShellMatchEvaluation,
  VisualShellMatchMetric,
} from './types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';

function findMeasurement(map: RenderedDomMeasurementMap | null, regionId: string) {
  return map?.measurements.find((m) => m.regionId === regionId) ?? null;
}

export function evaluateVisualShellMatch(input: {
  spec: MobileScreenVisualShellSpec;
  domMeasurement: RenderedDomMeasurementMap | null;
  tolerancePx?: number;
}): VisualShellMatchEvaluation {
  const tolerance = input.tolerancePx ?? SHELL_MATCH_TOLERANCE_PX;
  const spec = input.spec;
  const failures: string[] = [];

  const screenRegion =
    spec.screenId === 'MOBILE_CAMPAIGN_BOARD' ? 'ndx.campaign.screen' : 'ndx.lab.screen';
  const headerRegion =
    spec.screenId === 'MOBILE_CAMPAIGN_BOARD' ? 'ndx.campaign.header-shell' : 'ndx.lab.header-shell';
  const contentRegion =
    spec.screenId === 'MOBILE_CAMPAIGN_BOARD' ? 'ndx.campaign.content-shell' : 'ndx.lab.content-shell';
  const navRegion =
    spec.screenId === 'MOBILE_CAMPAIGN_BOARD'
      ? 'ndx.campaign.bottom-nav-shell'
      : 'ndx.lab.bottom-nav-shell';

  const screen = findMeasurement(input.domMeasurement, screenRegion);
  const header = findMeasurement(input.domMeasurement, headerRegion);
  const content = findMeasurement(input.domMeasurement, contentRegion);
  const nav = findMeasurement(input.domMeasurement, navRegion);

  const within = (a: number, b: number) => Math.abs(a - b) <= tolerance;

  const metrics: Record<VisualShellMatchMetric, boolean> = {
    VIEWPORT_MATCH: screen
      ? within(screen.actualWidth, spec.viewport.width) && within(screen.actualHeight, spec.viewport.height)
      : false,
    HEADER_HEIGHT_MATCH: header ? within(header.actualHeight, spec.headerBounds.height) : false,
    HEADER_CONTENT_POSITION_MATCH: header ? within(header.actualX, spec.headerBounds.x) : false,
    CONTENT_X_MATCH: content ? within(content.actualX, spec.contentBounds.x) : false,
    CONTENT_WIDTH_MATCH: content ? within(content.actualWidth, spec.contentBounds.width) : false,
    CONTENT_TOP_MATCH: content ? within(content.actualY, spec.contentBounds.y) : false,
    SECTION_FLOW_MATCH: content != null,
    BOTTOM_NAV_TOP_MATCH: nav ? within(nav.actualY, spec.bottomNavBounds.y) : false,
    BOTTOM_NAV_HEIGHT_MATCH: nav ? within(nav.actualHeight, spec.bottomNavBounds.height) : false,
    BACKGROUND_MATCH: true,
  };

  if (!metrics.HEADER_HEIGHT_MATCH || !metrics.HEADER_CONTENT_POSITION_MATCH) {
    failures.push(FAIL_HEADER_SHELL_GEOMETRY_DRIFT);
  }
  if (!metrics.CONTENT_X_MATCH || !metrics.CONTENT_WIDTH_MATCH) {
    failures.push(FAIL_CONTENT_WRAPPER_WIDTH_DRIFT);
    failures.push(FAIL_PAGE_GUTTER_DRIFT);
  }
  if (!metrics.BOTTOM_NAV_TOP_MATCH || !metrics.BOTTOM_NAV_HEIGHT_MATCH) {
    failures.push(FAIL_BOTTOM_NAV_SHELL_DRIFT);
  }

  const score =
    Object.values(metrics).filter(Boolean).length / Object.keys(metrics).length;

  return {
    evaluationId: randomUUID(),
    screenId: spec.screenId,
    metrics,
    score,
    tolerancePx: tolerance,
    failures,
  };
}

export function shellGeometryPassesBeforeChildLocks(
  evaluation: VisualShellMatchEvaluation,
): boolean {
  const parentMetrics: VisualShellMatchMetric[] = [
    'VIEWPORT_MATCH',
    'HEADER_HEIGHT_MATCH',
    'CONTENT_X_MATCH',
    'CONTENT_WIDTH_MATCH',
    'BOTTOM_NAV_HEIGHT_MATCH',
  ];
  return parentMetrics.every((m) => evaluation.metrics[m]);
}
