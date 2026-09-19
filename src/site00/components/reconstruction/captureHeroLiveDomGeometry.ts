/**
 * P0.VR.REPLICATION.4R3R1 — Live browser DOM rect capture for hero inspection.
 */

import { HERO_OBJECT_IDS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3R1/constants.js';
import { buildGeometryReceiptV2FromLive } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3R1/buildPendingGeometryReceiptV2.js';
import type {
  HeroRenderedCaptureReceipt,
  HeroMeasurementSource,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3R1/types.js';
import type { HeroAuthorityGeometryFull, HeroGeometryDeltaFull, HeroRenderedGeometryFull } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/types.js';
import { computeHeroGeometryDeltas } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/measureHeroGeometry.js';
import type { HeroObjectId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/types.js';

export type HeroLiveDomCaptureResult = {
  captureReceipt: HeroRenderedCaptureReceipt;
  renderedGeometry: HeroRenderedGeometryFull[];
  geometryDeltas: HeroGeometryDeltaFull[];
  geometryReceiptV2: ReturnType<typeof buildGeometryReceiptV2FromLive>;
  measurementSource: HeroMeasurementSource;
};

function lineCountForElement(el: Element): number {
  if (!(el instanceof HTMLElement)) return 1;
  const text = el.innerText?.trim() ?? '';
  if (!text) return 0;
  return text.split('\n').filter(Boolean).length;
}

export async function waitForHeroRenderStabilization(): Promise<{ fontsReady: boolean; imagesSettled: boolean }> {
  await document.fonts.ready.catch(() => undefined);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const imgs = Array.from(document.querySelectorAll('#hero-inspection img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (!(img instanceof HTMLImageElement)) {
            resolve();
            return;
          }
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );
  return { fontsReady: true, imagesSettled: true };
}

export function captureHeroLiveDomGeometry(authority: HeroAuthorityGeometryFull[]): HeroLiveDomCaptureResult {
  const measurementSource: HeroMeasurementSource = 'LIVE_BROWSER_DOM';
  const heroRoot = document.querySelector('[data-hero-object="H14"]');
  const missingIds: HeroObjectId[] = [];
  const renderedGeometry: HeroRenderedGeometryFull[] = [];

  if (!heroRoot) {
    const captureReceipt: HeroRenderedCaptureReceipt = {
      expectedCount: 14,
      foundCount: 0,
      missingIds: [...HERO_OBJECT_IDS],
      measurementSource,
      captureTimestamp: new Date().toISOString(),
      heroRootFound: false,
      fontsReady: false,
      imagesSettled: false,
      status: 'FAIL',
      failureCode: 'HERO_RENDERED_OBJECTS_INCOMPLETE',
    };
    return {
      captureReceipt,
      renderedGeometry: [],
      geometryDeltas: [],
      geometryReceiptV2: buildGeometryReceiptV2FromLive({
        deltas: [],
        captureReceipt,
        measurementSource,
      }),
      measurementSource,
    };
  }

  const rootRect = heroRoot.getBoundingClientRect();

  for (const id of HERO_OBJECT_IDS) {
    const el = document.querySelector(`[data-hero-object="${id}"]`);
    if (!el) {
      missingIds.push(id);
      continue;
    }
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const relX = rect.left - rootRect.left;
    const relY = rect.top - rootRect.top;
    const lineCount = lineCountForElement(el);
    renderedGeometry.push({
      objectId: id,
      actualX: relX,
      actualY: relY,
      actualWidth: rect.width,
      actualHeight: rect.height,
      actualLeft: relX,
      actualRight: relX + rect.width,
      actualTop: relY,
      actualBottom: relY + rect.height,
      actualCenterX: relX + rect.width / 2,
      actualCenterY: relY + rect.height / 2,
      actualBaseline: lineCount > 0 ? relY + rect.height - 2 : null,
      actualLineCount: lineCount > 0 ? lineCount : null,
      actualZ: Number.parseInt(style.zIndex, 10) || null,
      actualParent: 'hero-root',
      actualTextWidth: rect.width,
      actualLineHeight: lineCount > 0 ? rect.height / lineCount : null,
    });
  }

  const foundCount = renderedGeometry.length;
  const captureReceipt: HeroRenderedCaptureReceipt = {
    expectedCount: 14,
    foundCount,
    missingIds,
    measurementSource,
    captureTimestamp: new Date().toISOString(),
    heroRootFound: true,
    fontsReady: true,
    imagesSettled: true,
    status: foundCount === 14 && missingIds.length === 0 ? 'PASS' : 'FAIL',
    failureCode: foundCount === 14 ? null : 'HERO_RENDERED_OBJECTS_INCOMPLETE',
  };

  const geometryDeltas = computeHeroGeometryDeltas(authority, renderedGeometry);
  const geometryReceiptV2 = buildGeometryReceiptV2FromLive({
    deltas: geometryDeltas,
    captureReceipt,
    measurementSource,
  });

  return {
    captureReceipt,
    renderedGeometry,
    geometryDeltas,
    geometryReceiptV2,
    measurementSource,
  };
}
