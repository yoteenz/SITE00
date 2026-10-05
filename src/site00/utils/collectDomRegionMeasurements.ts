/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Collect DOM region measurements from live page for forensics.
 */

import type { DomRegionMeasurement } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/types.js';

function measureNodes(doc: Document, selector: string): DomRegionMeasurement[] {
  const nodes = Array.from(doc.querySelectorAll(selector));
  return nodes.map((node) => {
    const el = node as HTMLElement;
    const rect = el.getBoundingClientRect();
    const styles = doc.defaultView?.getComputedStyle(el) ?? window.getComputedStyle(el);
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
      computedFontWeight: styles.fontWeight,
      computedLetterSpacing: styles.letterSpacing,
      computedTextTransform: styles.textTransform,
      computedDisplay: styles.display,
      computedAlignItems: styles.alignItems,
      computedJustifyContent: styles.justifyContent,
      componentId: el.dataset.componentId ?? null,
    };
  });
}

export function collectDomRegionMeasurements(selector = '[data-vr-region]'): DomRegionMeasurement[] {
  if (typeof document === 'undefined') return [];

  const results = measureNodes(document, selector);

  const iframes = Array.from(document.querySelectorAll('iframe'));
  for (const frame of iframes) {
    try {
      const doc = frame.contentDocument;
      if (!doc) continue;
      const frameResults = measureNodes(doc, selector);
      for (const m of frameResults) {
        if (!results.some((r) => r.regionId === m.regionId)) results.push(m);
      }
    } catch {
      // cross-origin iframe — skip
    }
  }

  return results;
}

export function collectCssSnapshotFromMobileShell(): Record<string, string | number> {
  if (typeof document === 'undefined') return {};

  const tryChrome = (doc: Document): Record<string, string | number> => {
    const chrome = doc.querySelector('.site00-fws-mobile-chrome') as HTMLElement | null;
    if (!chrome) return {};
    const styles = doc.defaultView?.getComputedStyle(chrome) ?? window.getComputedStyle(chrome);
    return {
      headerHeightPx: styles.getPropertyValue('--ndx-mobile-header-h').trim(),
      headerPaddingX: styles.getPropertyValue('--ndx-mobile-header-padding-x').trim() || styles.getPropertyValue('--ndx-mobile-content-px').trim(),
      contentPaddingX: styles.getPropertyValue('--ndx-mobile-content-px').trim(),
      sectionGap: styles.getPropertyValue('--ndx-mobile-section-gap').trim(),
      bottomNavHeightPx: styles.getPropertyValue('--ndx-mobile-bottom-nav-h').trim(),
    };
  };

  const direct = tryChrome(document);
  if (Object.keys(direct).length) return direct;

  for (const frame of Array.from(document.querySelectorAll('iframe'))) {
    try {
      const doc = frame.contentDocument;
      if (!doc) continue;
      const snap = tryChrome(doc);
      if (Object.keys(snap).length) return snap;
    } catch {
      // skip
    }
  }

  return {};
}
