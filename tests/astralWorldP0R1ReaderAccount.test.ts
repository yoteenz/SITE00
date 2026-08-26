/**
 * P0.R.1 — Reader account + canonical avatar identity tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  CURATED_AVATAR_LIBRARY,
  READER_FIXTURE_AVATAR_MAP,
  listPilotAvatars,
} from '../shared/site00-astral-world/readerAccount/avatarLibraryManifest.js';
import { ASTRAL_WORLD_AVATAR_MASTER_CONTRACT } from '../shared/site00-astral-world/readerAccount/avatarMasterContract.js';
import { resolveCanonicalAvatarAssets } from '../shared/site00-astral-world/readerAccount/avatarResolver.js';
import {
  resetReaderAccountStoreForTest,
  getOrCreateReaderProfile,
  advanceOnboardingStep,
} from '../shared/site00-astral-world/readerAccount/readerAccountStore.js';
import { canNotifyReaderOfClientPresence } from '../shared/site00-astral-world/readerAccount/readerAlertService.js';
import { CUSTOM_AVATAR_ENTITLEMENT_POLICY } from '../shared/site00-astral-world/readerAccount/customAvatarEntitlement.js';
import { buildAvatarLibraryPilotContracts } from '../shared/site00-astral-world/readerAccount/avatarLibraryContracts.js';
import { ASTRAL_READER_ROUTE_BASE } from '../shared/site00-astral-world/readerAccount/readerRoutes.js';
import { PROTOTYPE_READERS } from '../shared/site00-astral-world/fixtures.js';

describe('P0.R.1 Astral World Reader Account + Avatar Identity', () => {
  beforeEach(() => {
    resetReaderAccountStoreForTest();
  });

  it('PR1-1 — curated avatar library has 28 slots with pilot batch', () => {
    expect(CURATED_AVATAR_LIBRARY.length).toBe(28);
    expect(listPilotAvatars().length).toBe(4);
    expect(CURATED_AVATAR_LIBRARY.some((a) => a.presentation === 'androgynous')).toBe(true);
  });

  it('PR1-2 — avatar master contract exists', () => {
    expect(ASTRAL_WORLD_AVATAR_MASTER_CONTRACT.contractId).toBe('ASTRAL_WORLD_AVATAR_MASTER_CONTRACT');
    expect(ASTRAL_WORLD_AVATAR_MASTER_CONTRACT.avoid).toContain('stock photography');
  });

  it('PR1-3 — prototype readers map to canonical avatar_id (no random URLs)', () => {
    for (const reader of PROTOTYPE_READERS) {
      expect(reader.avatarId).toBeTruthy();
      expect(reader.avatarId).toBe(READER_FIXTURE_AVATAR_MAP[reader.id]);
      expect(reader.avatarUrl).toBeNull();
    }
  });

  it('PR1-4 — same reader resolves same identity across resolver calls', () => {
    const a = resolveCanonicalAvatarAssets({ personId: 'reader-madame-j', avatarId: 'AW_AVATAR_F_03' });
    const b = resolveCanonicalAvatarAssets({ personId: 'reader-madame-j', avatarId: 'AW_AVATAR_F_03' });
    expect(a.avatarId).toBe(b.avatarId);
    expect(a.source).toBe(b.source);
    expect(a.circleStyle?.backgroundImage).toBe(b.circleStyle?.backgroundImage);
  });

  it('PR1-5 — seeker privacy overrides reader alerts', () => {
    const ok = canNotifyReaderOfClientPresence({
      clientPrivacy: 'HIDDEN',
      clientPermitsSharing: true,
      readerPrefs: {
        CLIENT_ENTERED_WORLD: true,
        CLIENT_ENTERED_DESTINATION: true,
        CLIENT_REQUESTED_ME: true,
        NEW_READING_REQUEST: true,
        NEW_FAVORITE_FOLLOW: true,
        TABLE_INVITATION: true,
      },
      alertType: 'CLIENT_ENTERED_WORLD',
      relationshipPermits: true,
    });
    expect(ok).toBe(false);
  });

  it('PR1-6 — reader onboarding store advances steps', () => {
    const p = getOrCreateReaderProfile('user-test-1');
    expect(p.onboardingStep).toBe('WELCOME');
    const next = advanceOnboardingStep('user-test-1', 'IDENTITY', { displayName: 'Test Reader' });
    expect(next.onboardingStep).toBe('IDENTITY');
    expect(next.displayName).toBe('Test Reader');
  });

  it('PR1-7 — custom avatar entitlement policy configurable (no hardcoded price)', () => {
    expect(CUSTOM_AVATAR_ENTITLEMENT_POLICY.productKey).toBe('CUSTOM_ASTRAL_AVATAR');
    expect(CUSTOM_AVATAR_ENTITLEMENT_POLICY.candidatesPerPurchase).toBeGreaterThan(0);
    expect(CUSTOM_AVATAR_ENTITLEMENT_POLICY.requiresUserSelection).toBe(true);
  });

  it('PR1-8 — pilot FAL contracts for library batch', () => {
    const contracts = buildAvatarLibraryPilotContracts();
    expect(contracts.length).toBe(4);
    expect(contracts.every((c) => c.promptTemplateId === 'AW_AVATAR_LIBRARY_PORTRAIT')).toBe(true);
  });

  it('PR1-9 — reader routes and UI modules exist', () => {
    expect(ASTRAL_READER_ROUTE_BASE).toBe('/projects/astral-world/reader');
    expect(existsSync('src/site00/astral-world/reader/AstralWorldReaderRouter.tsx')).toBe(true);
    expect(existsSync('src/site00/astral-world/reader/pages/ReaderOnboardingPage.tsx')).toBe(true);
    expect(existsSync('src/site00/astral-world/reader/components/AvatarSelector.tsx')).toBe(true);
    expect(existsSync('api/site00/astral-world-reader-account.ts')).toBe(true);
    expect(existsSync('supabase/migrations/20260826220000_site00_astral_reader_accounts.sql')).toBe(true);
  });

  it('PR1-10 — AstralPortrait uses canonical avatar resolver', () => {
    const src = readFileSync('src/site00/astral-world/components/immersive/AstralPortrait.tsx', 'utf8');
    expect(src).toContain('resolveCanonicalAvatarAssets');
    expect(src).toContain('avatarId');
    expect(src).toContain('data-avatar-id');
  });
});
