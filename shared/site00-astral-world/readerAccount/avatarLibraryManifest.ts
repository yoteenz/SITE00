/**
 * P0.R.1 — AW_AVATAR_LIBRARY_V1 curated canonical avatar manifest.
 * 28 library slots (24–36 target). Pilot batch: 4 slots for FAL validation first.
 */

import type { CanonicalAvatarRecord } from './types.js';

export const AW_AVATAR_LIBRARY_V1 = 'AW_AVATAR_LIBRARY_V1' as const;

function libAvatar(
  avatarId: string,
  presentation: CanonicalAvatarRecord['presentation'],
  displayLabel: string,
  opts?: Partial<CanonicalAvatarRecord>,
): CanonicalAvatarRecord {
  const slot = avatarId.replace(/-/g, '_').toUpperCase();
  return {
    avatarId,
    projectId: 'astral-world',
    presentation,
    displayLabel,
    masterAssetSlot: `AW_AVATAR_MASTER_${slot}`,
    portraitAssetSlot: `AW_AVATAR_PORTRAIT_${slot}`,
    thumbnailAssetSlot: `AW_AVATAR_THUMB_${slot}`,
    circleSafeCrop: { xPercent: 50, yPercent: 38, sizePercent: 72 },
    approvalState: opts?.approvalState ?? 'PENDING_GENERATION',
    promptVersion: 'v1',
    assignedUserId: opts?.assignedUserId ?? null,
    version: 1,
    pilotBatch: opts?.pilotBatch,
  };
}

/** Full curated library — pilot generates F_01, F_02, M_01, M_02 first */
export const CURATED_AVATAR_LIBRARY: CanonicalAvatarRecord[] = [
  // Pilot batch
  libAvatar('AW_AVATAR_F_01', 'feminine', 'Elena Ashford', { pilotBatch: true, approvalState: 'GENERATED' }),
  libAvatar('AW_AVATAR_F_02', 'feminine', 'Maya Chen', { pilotBatch: true, approvalState: 'GENERATED' }),
  libAvatar('AW_AVATAR_M_01', 'masculine', 'Jordan Vale', { pilotBatch: true, approvalState: 'GENERATED' }),
  libAvatar('AW_AVATAR_M_02', 'masculine', 'Marcus Reid', { pilotBatch: true, approvalState: 'GENERATED' }),
  // Feminine-presenting
  libAvatar('AW_AVATAR_F_03', 'feminine', 'Madame J', { approvalState: 'APPROVED_LIBRARY_ASSET' }),
  libAvatar('AW_AVATAR_F_04', 'feminine', 'Aria Bloom', { approvalState: 'APPROVED_LIBRARY_ASSET' }),
  libAvatar('AW_AVATAR_F_05', 'feminine', 'Sage Moonwater', { approvalState: 'APPROVED_LIBRARY_ASSET' }),
  libAvatar('AW_AVATAR_F_06', 'feminine', 'Nova Sterling'),
  libAvatar('AW_AVATAR_F_07', 'feminine', 'Isabel Cruz'),
  libAvatar('AW_AVATAR_F_08', 'feminine', 'Renée Park'),
  libAvatar('AW_AVATAR_F_09', 'feminine', 'Camille Frost'),
  libAvatar('AW_AVATAR_F_10', 'feminine', 'Yuki Tanaka'),
  libAvatar('AW_AVATAR_F_11', 'feminine', 'Amara Singh'),
  libAvatar('AW_AVATAR_F_12', 'feminine', 'Claire Whitmore'),
  libAvatar('AW_AVATAR_F_13', 'feminine', 'Diana Cole'),
  libAvatar('AW_AVATAR_F_14', 'feminine', 'Freya Lind'),
  // Masculine-presenting
  libAvatar('AW_AVATAR_M_03', 'masculine', 'Kai the Oracle', { approvalState: 'APPROVED_LIBRARY_ASSET' }),
  libAvatar('AW_AVATAR_M_04', 'masculine', 'Orion Vale', { approvalState: 'APPROVED_LIBRARY_ASSET' }),
  libAvatar('AW_AVATAR_M_05', 'masculine', 'Ethan Brooks'),
  libAvatar('AW_AVATAR_M_06', 'masculine', 'David Okonkwo'),
  libAvatar('AW_AVATAR_M_07', 'masculine', 'Leo Hartman'),
  libAvatar('AW_AVATAR_M_08', 'masculine', 'Samuel Wright'),
  libAvatar('AW_AVATAR_M_09', 'masculine', 'Noah Pierce'),
  libAvatar('AW_AVATAR_M_10', 'masculine', 'Andre Laurent'),
  libAvatar('AW_AVATAR_M_11', 'masculine', 'Theo Nakamura'),
  libAvatar('AW_AVATAR_M_12', 'masculine', 'Chris Dalton'),
  // Androgynous
  libAvatar('AW_AVATAR_N_01', 'androgynous', 'River Ash'),
  libAvatar('AW_AVATAR_N_02', 'androgynous', 'Quinn Mercer'),
];

/** Maps prototype reader fixture IDs → canonical library avatar IDs */
export const READER_FIXTURE_AVATAR_MAP: Record<string, string> = {
  'reader-madame-j': 'AW_AVATAR_F_03',
  'reader-kai': 'AW_AVATAR_M_03',
  'reader-earth-mama': 'AW_AVATAR_F_07',
  'reader-sage': 'AW_AVATAR_F_05',
  'reader-orion': 'AW_AVATAR_M_04',
  'reader-aria': 'AW_AVATAR_F_04',
};

export function getCuratedAvatar(avatarId: string): CanonicalAvatarRecord | null {
  return CURATED_AVATAR_LIBRARY.find((a) => a.avatarId === avatarId) ?? null;
}

export function listApprovedLibraryAvatars(): CanonicalAvatarRecord[] {
  return CURATED_AVATAR_LIBRARY.filter((a) => a.approvalState === 'APPROVED_LIBRARY_ASSET' || a.pilotBatch);
}

export function listPilotAvatars(): CanonicalAvatarRecord[] {
  return CURATED_AVATAR_LIBRARY.filter((a) => a.pilotBatch);
}

export function avatarIdForReaderFixture(readerId: string): string | null {
  return READER_FIXTURE_AVATAR_MAP[readerId] ?? null;
}
