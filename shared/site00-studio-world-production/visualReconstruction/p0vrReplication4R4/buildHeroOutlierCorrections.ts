import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroOutlierCorrection } from './types.js';

const SOURCE_FILE = 'src/site00/styles/site00-forensic-blueprint-twin.css';

function nudgeKey(objectId: HeroObjectId, axis: 'x' | 'y' | 'w' | 'h'): string {
  return `--hero-nudge-${objectId}-${axis}`;
}

function parsePx(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function buildHeroOutlierCssDelta(
  objectId: HeroObjectId,
  delta: HeroGeometryDeltaFull,
  existingPatch: Record<string, string>,
): Record<string, string> {
  if (delta.status === 'WITHIN_TOLERANCE' || objectId === 'H07') return {};

  const patch: Record<string, string> = {};
  const nx = parsePx(existingPatch[nudgeKey(objectId, 'x')]) - Math.round(delta.deltaX);
  const ny = parsePx(existingPatch[nudgeKey(objectId, 'y')]) - Math.round(delta.deltaY);
  const nw = parsePx(existingPatch[nudgeKey(objectId, 'w')]) - Math.round(delta.deltaWidth);
  const nh = parsePx(existingPatch[nudgeKey(objectId, 'h')]) - Math.round(delta.deltaHeight);

  if (Math.abs(delta.deltaX) > 0 || nx !== 0) patch[nudgeKey(objectId, 'x')] = `${nx}px`;
  if (Math.abs(delta.deltaY) > 0 || ny !== 0) patch[nudgeKey(objectId, 'y')] = `${ny}px`;
  if (Math.abs(delta.deltaWidth) > 0 || nw !== 0) patch[nudgeKey(objectId, 'w')] = `${nw}px`;
  if (Math.abs(delta.deltaHeight) > 0 || nh !== 0) patch[nudgeKey(objectId, 'h')] = `${nh}px`;

  if (objectId === 'H14' && Math.abs(delta.deltaHeight) > 0) {
    const baseH = parsePx(existingPatch['--fb-hero-h']?.replace('px', '') ?? '220');
    patch['--fb-hero-h'] = `${Math.round(baseH - delta.deltaHeight)}px`;
  }

  if (objectId === 'H06') {
    if (Math.abs(delta.deltaWidth) > 2 || Math.abs(delta.deltaX) > 2) {
      const left = parsePx(existingPatch['--hero-h06-left']?.replace('%', '')) || 37;
      patch['--hero-h06-left'] = `${(left - delta.deltaX * 0.08).toFixed(2)}%`;
    }
  }

  if (objectId === 'H08') {
    if (Math.abs(delta.deltaX) > 0) {
      const left = parsePx(existingPatch['--hero-h08-left']?.replace('%', '')) || 52;
      patch['--hero-h08-left'] = `${(left - delta.deltaX * 0.06).toFixed(2)}%`;
    }
    if (Math.abs(delta.deltaY) > 0) {
      const bottom = parsePx(existingPatch['--hero-h08-bottom']?.replace('px', '')) || 8;
      patch['--hero-h08-bottom'] = `${Math.round(bottom + delta.deltaY)}px`;
    }
  }

  if (objectId === 'H09' && Math.abs(delta.deltaWidth) > 0) {
    const w = parsePx(existingPatch['--hero-h09-width']?.replace('px', '')) || 88;
    patch['--hero-h09-width'] = `${Math.round(w - delta.deltaWidth)}px`;
  }

  return patch;
}

export function buildHeroOutlierCorrection(input: {
  objectId: HeroObjectId;
  delta: HeroGeometryDeltaFull;
  existingPatch: Record<string, string>;
  rootCause: string;
}): { correction: HeroOutlierCorrection; patchDelta: Record<string, string> } {
  if (input.delta.status === 'WITHIN_TOLERANCE') {
    return {
      correction: {
        objectId: input.objectId,
        beforeDelta: input.delta,
        rootCause: 'within tolerance',
        sourceFile: SOURCE_FILE,
        cssPropertyChanged: '',
        oldValue: '',
        newValue: '',
        expectedEffect: 'no change',
        afterDelta: null,
        status: 'SKIPPED_PASSING',
      },
      patchDelta: {},
    };
  }

  const patchDelta = buildHeroOutlierCssDelta(input.objectId, input.delta, input.existingPatch);
  const [cssPropertyChanged, newValue] = Object.entries(patchDelta)[0] ?? ['', ''];
  const oldValue = input.existingPatch[cssPropertyChanged] ?? '';

  return {
    correction: {
      objectId: input.objectId,
      beforeDelta: input.delta,
      rootCause: input.rootCause,
      sourceFile: SOURCE_FILE,
      cssPropertyChanged,
      oldValue,
      newValue,
      expectedEffect: `Move ${input.objectId} toward authority by negating measured delta`,
      afterDelta: null,
      status: 'APPLIED',
    },
    patchDelta,
  };
}
