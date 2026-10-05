/**
 * Resolve SKINS reference-extracted assets + thumbnail precedence.
 */

import { useMemo } from 'react';
import {
  buildDefaultSkinsManifest,
  resolveFamilyThumbnailUrl,
  resolveScreenThumbnailUrl,
  SKINS_FAMILY_LINE_BREAKS,
  type SkinsViewportClass,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsReferenceFidelity.js';
import type { SkinsAuthorityRecord } from './useDesignSkinsState.js';

const MANIFEST = buildDefaultSkinsManifest();

export function useSkinsReferenceAssets(viewport: SkinsViewportClass) {
  const manifest = MANIFEST;

  const familyThumbnailFor = useMemo(
    () => (brandKey: string) => resolveFamilyThumbnailUrl({ brandKey, viewport, manifest }),
    [viewport],
  );

  const screenThumbnailFor = useMemo(
    () => (packScreenType: string, authority?: SkinsAuthorityRecord | null) =>
      resolveScreenThumbnailUrl({
        viewport,
        packScreenType,
        authorityReferenceAssetId: authority?.referenceAssetId,
        manifest,
      }),
    [viewport],
  );

  const previewForActive = useMemo(
    () => (packScreenType: string, authority?: SkinsAuthorityRecord | null) => {
      const fromAuthority = resolveScreenThumbnailUrl({
        viewport,
        packScreenType,
        authorityReferenceAssetId: authority?.referenceAssetId,
        manifest,
      });
      if (fromAuthority.url && fromAuthority.source === 'AUTHORITY') return fromAuthority;
      return resolveScreenThumbnailUrl({ viewport, packScreenType, manifest });
    },
    [viewport],
  );

  return {
    manifest,
    familyThumbnailFor,
    screenThumbnailFor,
    previewForActive,
    familyLineBreaks: SKINS_FAMILY_LINE_BREAKS,
  };
}
