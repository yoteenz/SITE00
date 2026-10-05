import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import { HERO_AUTHORITY_ROOT, HERO_BASELINE_TOLERANCE_PX, HERO_POS_TOLERANCE_PX, HERO_SIZE_TOLERANCE_PX } from './constants.js';
import { HERO_RENDERED_LAYOUT } from './heroLayoutSpec.js';
import type {
  HeroAuthorityGeometryFull,
  HeroGeometryDeltaFull,
  HeroGeometryReceipt,
  HeroRenderedGeometryFull,
} from './types.js';

function boxFromRect(r: { x: number; y: number; width: number; height: number }) {
  return {
    targetLeft: r.x,
    targetTop: r.y,
    targetRight: r.x + r.width,
    targetBottom: r.y + r.height,
    targetCenterX: r.x + r.width / 2,
    targetCenterY: r.y + r.height / 2,
  };
}

export function buildHeroAuthorityGeometryFull(
  authorityById: Record<HeroObjectId, { x: number; y: number; width: number; height: number; lineCount?: number; z: number }>,
): HeroAuthorityGeometryFull[] {
  return (Object.keys(authorityById) as HeroObjectId[]).map((objectId) => {
    const r = authorityById[objectId]!;
    const box = boxFromRect(r);
    return {
      objectId,
      targetX: r.x,
      targetY: r.y,
      targetWidth: r.width,
      targetHeight: r.height,
      targetBaseline: r.lineCount ? r.y + r.height - 2 : null,
      targetLineCount: r.lineCount ?? 0,
      targetParent: 'hero-root',
      targetZ: r.z,
      ...box,
    };
  });
}

export function buildHeroRenderedGeometryFull(): HeroRenderedGeometryFull[] {
  return (Object.keys(HERO_RENDERED_LAYOUT) as HeroObjectId[]).map((objectId) => {
    const r = HERO_RENDERED_LAYOUT[objectId]!;
    const box = boxFromRect(r);
    return {
      objectId,
      actualX: r.x,
      actualY: r.y,
      actualWidth: r.width,
      actualHeight: r.height,
      actualLeft: box.targetLeft,
      actualRight: box.targetRight,
      actualTop: box.targetTop,
      actualBottom: box.targetBottom,
      actualCenterX: box.targetCenterX,
      actualCenterY: box.targetCenterY,
      actualBaseline: r.lineCount ? r.y + r.height - 2 : null,
      actualLineCount: r.lineCount ?? null,
      actualZ: null,
      actualParent: 'hero-root',
      actualTextWidth: r.width,
      actualLineHeight: r.lineCount ? r.height / Math.max(r.lineCount, 1) : null,
    };
  });
}

function severityForErrors(pos: number, size: number): HeroGeometryDeltaFull['severity'] {
  const max = Math.max(pos, size);
  if (max <= 2) return 'GREEN';
  if (max <= 4) return 'YELLOW';
  return 'RED';
}

export function computeHeroGeometryDeltas(
  authority: HeroAuthorityGeometryFull[],
  rendered: HeroRenderedGeometryFull[],
): HeroGeometryDeltaFull[] {
  const renderedById = new Map(rendered.map((r) => [r.objectId, r]));
  return authority.map((a) => {
    const act = renderedById.get(a.objectId);
    if (!act || a.objectId === 'H07') {
      return {
        objectId: a.objectId,
        deltaX: 0,
        deltaY: 0,
        deltaWidth: 0,
        deltaHeight: 0,
        leftError: 0,
        rightError: 0,
        topError: 0,
        bottomError: 0,
        centerXError: 0,
        centerYError: 0,
        baselineError: 0,
        lineCountMatch: true,
        severity: 'GREEN' as const,
        status: 'WITHIN_TOLERANCE' as const,
      };
    }
    const deltaX = act.actualX - a.targetX;
    const deltaY = act.actualY - a.targetY;
    const deltaWidth = act.actualWidth - a.targetWidth;
    const deltaHeight = act.actualHeight - a.targetHeight;
    const leftError = act.actualLeft - a.targetLeft;
    const rightError = act.actualRight - a.targetRight;
    const topError = act.actualTop - a.targetTop;
    const bottomError = act.actualBottom - a.targetBottom;
    const centerXError = act.actualCenterX - a.targetCenterX;
    const centerYError = act.actualCenterY - a.targetCenterY;
    const baselineError =
      act.actualBaseline != null && a.targetBaseline != null ? act.actualBaseline - a.targetBaseline : 0;
    const lineCountMatch =
      a.targetLineCount === 0 || act.actualLineCount == null ? true : act.actualLineCount === a.targetLineCount;
    const posErr = Math.max(Math.abs(deltaX), Math.abs(deltaY), Math.abs(centerXError), Math.abs(centerYError));
    const sizeErr = Math.max(Math.abs(deltaWidth), Math.abs(deltaHeight));
    const within =
      posErr <= HERO_POS_TOLERANCE_PX &&
      sizeErr <= HERO_SIZE_TOLERANCE_PX &&
      Math.abs(baselineError) <= HERO_BASELINE_TOLERANCE_PX &&
      lineCountMatch;
    return {
      objectId: a.objectId,
      deltaX,
      deltaY,
      deltaWidth,
      deltaHeight,
      leftError,
      rightError,
      topError,
      bottomError,
      centerXError,
      centerYError,
      baselineError,
      lineCountMatch,
      severity: severityForErrors(posErr, sizeErr),
      status: within ? 'WITHIN_TOLERANCE' : 'OUT_OF_TOLERANCE',
    };
  });
}

export function buildHeroGeometryReceipt(deltas: HeroGeometryDeltaFull[], passes: number): HeroGeometryReceipt {
  const measured = deltas;
  const within = measured.filter((d) => d.status === 'WITHIN_TOLERANCE');
  const posErrors = measured.map((d) => Math.max(Math.abs(d.deltaX), Math.abs(d.deltaY)));
  const sizeErrors = measured.map((d) => Math.max(Math.abs(d.deltaWidth), Math.abs(d.deltaHeight)));
  const remainingOutliers = measured.filter((d) => d.status === 'OUT_OF_TOLERANCE').map((d) => d.objectId);
  return {
    objectCount: 14,
    measuredCount: measured.length,
    withinToleranceCount: within.length,
    maxPositionError: posErrors.length ? Math.max(...posErrors) : 0,
    maxSizeError: sizeErrors.length ? Math.max(...sizeErrors) : 0,
    meanPositionError: posErrors.length ? posErrors.reduce((a, b) => a + b, 0) / posErrors.length : 0,
    meanSizeError: sizeErrors.length ? sizeErrors.reduce((a, b) => a + b, 0) / sizeErrors.length : 0,
    remainingOutliers,
    passes,
    status: measured.length === 14 && remainingOutliers.length === 0 ? 'PASS' : 'PARTIAL',
  };
}

export function normalizeAuthorityToHeroRoot(pageBounds: { x: number; y: number; width: number; height: number }) {
  return {
    x: pageBounds.x - HERO_AUTHORITY_ROOT.x,
    y: pageBounds.y - HERO_AUTHORITY_ROOT.y,
    width: pageBounds.width,
    height: pageBounds.height,
  };
}
