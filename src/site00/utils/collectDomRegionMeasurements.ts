/**
 * P0.VR.DIAG.1 — Collect DOM region measurements from live page for forensics.
 */

import type { DomRegionMeasurement } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/types.js';

export function collectDomRegionMeasurements(selector = '[data-vr-region]'): DomRegionMeasurement[] {
  if (typeof document === 'undefined') return [];
  const nodes = Array.from(document.querySelectorAll(selector));
  return nodes.map((node) => {
    const el = node as HTMLElement;
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    return {
      regionId: el.dataset.vrRegion ?? el.dataset.visualReconstruction ?? 'unknown',
      actualX: rect.x,
      actualY: rect.y,
      actualWidth: rect.width,
      actualHeight: rect.height,
      computedPadding: styles.padding,
      computedMargin: styles.margin,
      computedGap: styles.gap,
      computedFontSize: styles.fontSize,
      computedLineHeight: styles.lineHeight,
      componentId: el.dataset.componentId ?? null,
    };
  });
}

export function collectCssSnapshotFromMobileShell(): Record<string, string | number> {
  if (typeof document === 'undefined') return {};
  const chrome = document.querySelector('.site00-fws-mobile-chrome') as HTMLElement | null;
  if (!chrome) return {};
  const styles = window.getComputedStyle(chrome);
  return {
    headerHeightPx: styles.getPropertyValue('--ndx-mobile-header-h').trim(),
    contentPaddingX: styles.getPropertyValue('--ndx-mobile-content-px').trim(),
    sectionGap: styles.getPropertyValue('--ndx-mobile-section-gap').trim(),
    bottomNavHeightPx: styles.getPropertyValue('--ndx-mobile-bottom-nav-h').trim(),
  };
}
