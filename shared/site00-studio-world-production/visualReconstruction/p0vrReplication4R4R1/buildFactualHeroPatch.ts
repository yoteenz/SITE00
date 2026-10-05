import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroOutlierPatch } from './types.js';

const SOURCE_FILE = 'src/site00/styles/site00-forensic-blueprint-twin.css';

function parseNum(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function nudgeKey(objectId: HeroObjectId, axis: 'x' | 'y' | 'w' | 'h'): string {
  return `--hero-nudge-${objectId}-${axis}`;
}

export function buildFactualHeroPatch(input: {
  objectId: HeroObjectId;
  delta: HeroGeometryDeltaFull;
  cssPatch: Record<string, string>;
}): { patch: Record<string, string>; outlierPatch: HeroOutlierPatch } {
  const { objectId, delta, cssPatch } = input;
  const patch: Record<string, string> = {};
  let property = '';
  let oldValue = '';
  let newValue = '';
  let rootCause = 'live DOM measured outlier';

  if (delta.status === 'WITHIN_TOLERANCE' || objectId === 'H07') {
    return {
      patch: {},
      outlierPatch: {
        objectId,
        beforeDelta: delta,
        rootCause: 'within tolerance',
        sourceFile: SOURCE_FILE,
        property: '',
        oldValue: '',
        newValue: '',
        expectedEffect: 'none',
        afterDelta: null,
        status: 'SKIPPED',
      },
    };
  }

  const nx = parseNum(cssPatch[nudgeKey(objectId, 'x')], 0) - Math.round(delta.deltaX);
  const ny = parseNum(cssPatch[nudgeKey(objectId, 'y')], 0) - Math.round(delta.deltaY);
  patch[nudgeKey(objectId, 'x')] = `${nx}px`;
  patch[nudgeKey(objectId, 'y')] = `${ny}px`;
  property = nudgeKey(objectId, 'x');
  oldValue = cssPatch[property] ?? '0px';
  newValue = patch[property]!;

  if (objectId === 'H14' && Math.abs(delta.deltaHeight) > 0) {
    property = '--fb-hero-h';
    oldValue = cssPatch[property] ?? '220px';
    const h = parseNum(oldValue, 220) - Math.round(delta.deltaHeight);
    newValue = `${h}px`;
    patch[property] = newValue;
    rootCause = 'hero root height vs authority band';
  }

  if (objectId === 'H06') {
    if (Math.abs(delta.deltaX) > 1) {
      property = '--hero-h06-left';
      oldValue = cssPatch[property] ?? '37%';
      const left = parseNum(oldValue, 37) - delta.deltaX * 0.12;
      newValue = `${left.toFixed(2)}%`;
      patch[property] = newValue;
      rootCause = 'center media horizontal anchor';
    }
    if (Math.abs(delta.deltaWidth) > 2) {
      property = '--hero-h06-right-inset';
      oldValue = cssPatch[property] ?? '23%';
      const inset = parseNum(oldValue, 23) + delta.deltaWidth * 0.08;
      newValue = `${Math.max(10, inset).toFixed(2)}%`;
      patch[property] = newValue;
      rootCause = 'center media width via right inset';
    }
  }

  if (objectId === 'H08') {
    if (Math.abs(delta.deltaX) > 1) {
      property = '--hero-h08-left';
      oldValue = cssPatch[property] ?? '52%';
      newValue = `${(parseNum(oldValue, 52) - delta.deltaX * 0.08).toFixed(2)}%`;
      patch[property] = newValue;
    }
    if (Math.abs(delta.deltaY) > 1) {
      property = '--hero-h08-bottom';
      oldValue = cssPatch[property] ?? '8px';
      newValue = `${Math.round(parseNum(oldValue, 8) + delta.deltaY)}px`;
      patch[property] = newValue;
    }
    if (Math.abs(delta.deltaHeight) > 2 || Math.abs(delta.deltaWidth) > 2) {
      property = '--hero-h08-font-size';
      oldValue = cssPatch[property] ?? '44px';
      const fs = parseNum(oldValue, 44) - Math.round(delta.deltaHeight * 0.35);
      newValue = `${Math.max(36, fs)}px`;
      patch[property] = newValue;
      rootCause = 'NDX overlay font-size vs measured box';
    }
  }

  if (objectId === 'H09') {
    property = '--hero-h09-width';
    oldValue = cssPatch[property] ?? '88px';
    newValue = `${Math.round(parseNum(oldValue, 88) - delta.deltaWidth)}px`;
    patch[property] = newValue;
    rootCause = 'right utility column width';
  }

  if (objectId === 'H12') {
    if (Math.abs(delta.deltaWidth) > 1 || Math.abs(delta.deltaHeight) > 1) {
      property = '--hero-h12-width';
      oldValue = cssPatch[property] ?? '64px';
      newValue = `${Math.round(parseNum(oldValue, 64) - delta.deltaWidth)}px`;
      patch[property] = newValue;
      property = '--hero-h12-height';
      oldValue = cssPatch[property] ?? '56px';
      patch[property] = `${Math.round(parseNum(oldValue, 56) - delta.deltaHeight)}px`;
      rootCause = 'lower-right media slot dimensions';
    }
    if (Math.abs(delta.deltaX) > 1 || Math.abs(delta.deltaY) > 1) {
      patch[nudgeKey('H12', 'x')] = `${parseNum(cssPatch[nudgeKey('H12', 'x')], 0) - Math.round(delta.deltaX)}px`;
      patch[nudgeKey('H12', 'y')] = `${parseNum(cssPatch[nudgeKey('H12', 'y')], 0) - Math.round(delta.deltaY)}px`;
    }
  }

  if (objectId === 'H01') {
    property = '--hero-left-pad-top';
    oldValue = cssPatch[property] ?? '10px';
    newValue = `${Math.round(parseNum(oldValue, 10) - delta.deltaY)}px`;
    patch[property] = newValue;
    rootCause = 'left editorial stack top padding';
  }

  if (objectId === 'H02' && Math.abs(delta.deltaY) > 1) {
    property = '--hero-h02-mb';
    oldValue = cssPatch[property] ?? '8px';
    newValue = `${Math.round(parseNum(oldValue, 8) - delta.deltaY * 0.25)}px`;
    patch[property] = newValue;
  }

  if (objectId === 'H04' && Math.abs(delta.deltaY) > 1) {
    property = '--hero-h04-mt';
    oldValue = cssPatch[property] ?? '4px';
    newValue = `${Math.round(parseNum(oldValue, 4) - delta.deltaY * 0.2)}px`;
    patch[property] = newValue;
  }

  if (objectId === 'H05' && Math.abs(delta.deltaY) > 1) {
    property = '--hero-h05-mt';
    oldValue = cssPatch[property] ?? '12px';
    newValue = `${Math.round(parseNum(oldValue, 12) - delta.deltaY * 0.35)}px`;
    patch[property] = newValue;
  }

  return {
    patch,
    outlierPatch: {
      objectId,
      beforeDelta: delta,
      rootCause,
      sourceFile: SOURCE_FILE,
      property,
      oldValue,
      newValue,
      expectedEffect: `Correct ${objectId} toward authority using measured delta`,
      afterDelta: null,
      status: 'APPLIED',
    },
  };
}
