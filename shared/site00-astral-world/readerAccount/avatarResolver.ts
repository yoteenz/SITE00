/**
 * P0.R.1 — Canonical avatar resolver.
 * One avatar_id → consistent portrait/thumbnail everywhere. No arbitrary URLs on Reader records.
 */

import { getIsolatedPortrait, semanticKeyForPerson } from '../portraitAssetRegistry.js';
import type { AstralAssetStoreSnapshot } from '../generation/assetResolver.js';
import { avatarIdForReaderFixture, getCuratedAvatar } from './avatarLibraryManifest.js';
import type { ResolvedAvatarAssets } from './types.js';

/** Legacy fixture reader → isolated portrait bridge until all slots are FAL ACTIVE */
const FIXTURE_TO_SEMANTIC: Record<string, string> = {
  'reader-madame-j': 'READER_MADAME_J',
  'reader-kai': 'READER_KAI_ORACLE',
  'reader-earth-mama': 'READER_EARTH_MAMA',
  'reader-sage': 'READER_SAGE_MOONWATER',
  'reader-orion': 'READER_ORION_VALE',
  'reader-aria': 'READER_ARIA_BLOOM',
};

export function resolveAvatarIdForPerson(personId: string, explicitAvatarId?: string | null): string | null {
  if (explicitAvatarId) return explicitAvatarId;
  return avatarIdForReaderFixture(personId);
}

export function resolveCanonicalAvatarAssets(input: {
  avatarId: string | null;
  personId?: string;
  displayName?: string;
  store?: AstralAssetStoreSnapshot;
  origin?: string;
}): ResolvedAvatarAssets {
  const { avatarId, personId, store, origin = '' } = input;
  const effectiveAvatarId = avatarId ?? (personId ? avatarIdForReaderFixture(personId) : null);

  if (effectiveAvatarId) {
    const library = getCuratedAvatar(effectiveAvatarId);
    if (library) {
      const portraitSlot = library.portraitAssetSlot;
      const active = store?.[portraitSlot];
      if (active?.outputUrl && (active.status === 'ACTIVE' || active.status === 'READY')) {
        const url = active.outputUrl.startsWith('http') ? active.outputUrl : `${origin}${active.outputUrl}`;
        return {
          avatarId: effectiveAvatarId,
          portraitUrl: url,
          thumbnailUrl: url,
          circleStyle: {
            backgroundImage: `url(${url})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          },
          sceneCutoutSlot: `AW_AVATAR_SCENE_${effectiveAvatarId.replace(/-/g, '_').toUpperCase()}`,
          source: 'FAL_ACTIVE',
        };
      }
    }
  }

  if (personId) {
    const semantic = FIXTURE_TO_SEMANTIC[personId] ?? semanticKeyForPerson(personId);
    const isolated = semantic ? getIsolatedPortrait(personId) : null;
    if (isolated) {
      return {
        avatarId: effectiveAvatarId ?? isolated.fixtureId,
        portraitUrl: null,
        thumbnailUrl: null,
        circleStyle: {
          backgroundImage: `url(${isolated.src})`,
          backgroundPosition: isolated.position,
          backgroundSize: isolated.size,
          backgroundRepeat: 'no-repeat',
        },
        sceneCutoutSlot: isolated.falSlotKey,
        source: 'ISOLATED_REFERENCE',
      };
    }
  }

  return {
    avatarId: effectiveAvatarId ?? personId ?? 'unknown',
    portraitUrl: null,
    thumbnailUrl: null,
    circleStyle: null,
    sceneCutoutSlot: null,
    source: 'INITIALS',
  };
}
