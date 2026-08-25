import type { NDXIconName } from '../types.js';
import {
  NDX_ICON_FIRST_PASS_TRACED,
  NDX_ICON_EXTENDED_TRACED,
  NDX_ICON_REFERENCE_SOURCE_ID,
} from './constants.js';
import { NDX_ICON_VISUAL_REFERENCE_AUTHORITY, boardToScreenCropBounds } from './authority.js';
import type { IconReferenceSample } from './types.js';

const ALL_TRACED = [...NDX_ICON_FIRST_PASS_TRACED, ...NDX_ICON_EXTENDED_TRACED];

export function buildIconReferenceSamples(): IconReferenceSample[] {
  const authority = NDX_ICON_VISUAL_REFERENCE_AUTHORITY;
  return ALL_TRACED.map((iconName) => {
    const cropKey = iconName === 'ellipsis' ? 'ellipsis' : iconName;
    const inner = authority.iconCropBounds[cropKey] ?? authority.iconCropBounds[iconName];
    if (!inner) {
      throw new Error(`Missing crop bounds for ${iconName}`);
    }
    const boardCrop = boardToScreenCropBounds(cropKey === 'ellipsis' ? 'ellipsis' : iconName);
    const refW = Math.round(boardCrop.width * authority.boardWidth);
    const refH = Math.round(boardCrop.height * authority.boardHeight);
    return {
      iconName,
      sourceReferenceId: NDX_ICON_REFERENCE_SOURCE_ID,
      cropBounds: inner,
      referenceAssetId: authority.sourceAssetPath,
      referenceWidth: refW,
      referenceHeight: refH,
      activeState: 'inactive',
      screenContext: authority.screenContext,
      confidence: 0.92,
      cropAssetPath: `visual-references/founder/ndxbook/icon-crops/${iconName}.png`,
    };
  });
}

export function iconReferenceSampleId(iconName: NDXIconName): string {
  return `${NDX_ICON_REFERENCE_SOURCE_ID}:${iconName}`;
}

export function referenceSampleIdsByIcon(): Record<NDXIconName, string> {
  const ids = {} as Record<NDXIconName, string>;
  for (const name of ALL_TRACED) {
    ids[name] = iconReferenceSampleId(name);
  }
  return ids;
}

export function getIconReferenceSample(iconName: NDXIconName): IconReferenceSample | undefined {
  return buildIconReferenceSamples().find((s) => s.iconName === iconName);
}
