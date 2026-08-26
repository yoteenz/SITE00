/**
 * P0.E.FT5 — Canonical founder-fast-track reference manifest.
 * Every Astral World screen resolves design authority through this registry.
 */

import {
  ASTRAL_REFERENCE_DESKTOP,
  ASTRAL_REFERENCE_MOBILE,
} from '../referenceAssets.js';

export type ReferenceAuthorityLevel =
  | 'MASTER'
  | 'DESTINATION'
  | 'FEATURE'
  | 'SUPPORTING';

export type AstralReferenceEntry = {
  referenceId: string;
  label: string;
  sourcePath: string;
  publicPath?: string;
  viewport: 'desktop' | 'mobile' | 'both';
  state: 'default' | 'overlay' | 'drawer' | 'transport';
  scope: string;
  authorityLevel: ReferenceAuthorityLevel;
  assetDependencies: string[];
  relatedRoute: string;
  relatedSceneId: string;
  decompositionNotes?: string;
};

/** Hierarchy: specific destination > master board > generated asset > visual contract */
export const ASTRAL_REFERENCE_MANIFEST: Record<string, AstralReferenceEntry> = {
  MASTER_DESKTOP_REFERENCE: {
    referenceId: 'MASTER_DESKTOP_REFERENCE',
    label: 'Astral World Desktop Master Board',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    publicPath: ASTRAL_REFERENCE_DESKTOP.publicPath,
    viewport: 'desktop',
    state: 'default',
    scope: 'full-desktop-composition',
    authorityLevel: 'MASTER',
    assetDependencies: ['ASTRAL_WORLD_HERO_DESKTOP', 'ASTREA_DISTRICT_PANORAMA_DESKTOP'],
    relatedRoute: 'home',
    relatedSceneId: 'HOME_ARRIVAL',
    decompositionNotes: 'Nav left · cinematic hero + Astréa panorama top · mid-band routing · destination showcase bottom · rail right',
  },
  MASTER_MOBILE_REFERENCE: {
    referenceId: 'MASTER_MOBILE_REFERENCE',
    label: 'Astral World Mobile Master Board',
    sourcePath: ASTRAL_REFERENCE_MOBILE.repoPath,
    publicPath: ASTRAL_REFERENCE_MOBILE.publicPath,
    viewport: 'mobile',
    state: 'default',
    scope: 'full-mobile-composition',
    authorityLevel: 'MASTER',
    assetDependencies: ['ASTRAL_WORLD_HERO_MOBILE', 'ASTREA_DISTRICT_PANORAMA_MOBILE'],
    relatedRoute: 'home',
    relatedSceneId: 'HOME_ARRIVAL',
    decompositionNotes: 'Viewport scenes · bottom HUD nav · glass overlays · portrait-led presence',
  },
  ASTRAL_WORLD_ENTRY_REFERENCE: {
    referenceId: 'ASTRAL_WORLD_ENTRY_REFERENCE',
    label: 'Arrival / Enter Astréa',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    publicPath: ASTRAL_REFERENCE_DESKTOP.publicPath,
    viewport: 'both',
    state: 'default',
    scope: 'hero-arrival-crop',
    authorityLevel: 'DESTINATION',
    assetDependencies: ['ASTRAL_WORLD_HERO_DESKTOP', 'ASTRAL_WORLD_HERO_MOBILE'],
    relatedRoute: 'home',
    relatedSceneId: 'HOME_ARRIVAL',
  },
  ASTREA_DISTRICT_REFERENCE: {
    referenceId: 'ASTREA_DISTRICT_REFERENCE',
    label: 'Astréa District Overview',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'district-panorama',
    authorityLevel: 'DESTINATION',
    assetDependencies: ['ASTREA_DISTRICT_PANORAMA_DESKTOP', 'ASTREA_DISTRICT_PANORAMA_MOBILE'],
    relatedRoute: 'astrea',
    relatedSceneId: 'ASTREA_DISTRICT',
  },
  TAROT_SUITE_REFERENCE: {
    referenceId: 'TAROT_SUITE_REFERENCE',
    label: 'Tarot Suite Interior',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'suite-interior',
    authorityLevel: 'DESTINATION',
    assetDependencies: ['TAROT_SUITE_HERO_DESKTOP', 'TAROT_SUITE_HERO_MOBILE', 'TAROT_SUITE_READING_SCENE'],
    relatedRoute: 'astrea/tarot-suite',
    relatedSceneId: 'TAROT_SUITE',
  },
  ASTRAL_MALL_REFERENCE: {
    referenceId: 'ASTRAL_MALL_REFERENCE',
    label: 'Astral Mall Interior',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'mall-interior-kiosks',
    authorityLevel: 'DESTINATION',
    assetDependencies: ['ASTRAL_MALL_HERO_DESKTOP', 'ASTRAL_MALL_HERO_MOBILE', 'ASTRAL_MALL_KIOSK_SCENE'],
    relatedRoute: 'astrea/astral-mall',
    relatedSceneId: 'ASTRAL_MALL',
  },
  COFFEE_SHOP_REFERENCE: {
    referenceId: 'COFFEE_SHOP_REFERENCE',
    label: 'Coffee Shop Social Hub',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'coffee-interior-tables',
    authorityLevel: 'DESTINATION',
    assetDependencies: ['COFFEE_SHOP_HERO_DESKTOP', 'COFFEE_SHOP_HERO_MOBILE', 'COFFEE_SHOP_TABLE_SCENE'],
    relatedRoute: 'astrea/coffee-shop',
    relatedSceneId: 'COFFEE_SHOP',
  },
  READER_DISCOVERY_REFERENCE: {
    referenceId: 'READER_DISCOVERY_REFERENCE',
    label: 'Find My Reader',
    sourcePath: ASTRAL_REFERENCE_MOBILE.repoPath,
    viewport: 'both',
    state: 'overlay',
    scope: 'reader-orbit-discovery',
    authorityLevel: 'FEATURE',
    assetDependencies: ['CIRCLE_COMMUNITY_HERO', 'READER_PORTRAIT_*'],
    relatedRoute: 'readers',
    relatedSceneId: 'FIND_MY_READER',
  },
  SOCIAL_PRESENCE_REFERENCE: {
    referenceId: 'SOCIAL_PRESENCE_REFERENCE',
    label: "Who's Here / Friends",
    sourcePath: ASTRAL_REFERENCE_MOBILE.repoPath,
    viewport: 'both',
    state: 'overlay',
    scope: 'spatial-presence-groups',
    authorityLevel: 'FEATURE',
    assetDependencies: ['CIRCLE_COMMUNITY_HERO', 'FRIEND_AVATAR_*'],
    relatedRoute: 'friends',
    relatedSceneId: 'FRIENDS_PRESENCE',
  },
  JOURNAL_REFERENCE: {
    referenceId: 'JOURNAL_REFERENCE',
    label: 'Tarot Journal Artifact',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'journal-artifact',
    authorityLevel: 'FEATURE',
    assetDependencies: ['JOURNAL_ARTIFACT'],
    relatedRoute: 'journal',
    relatedSceneId: 'JOURNAL_ARTIFACT',
  },
  PROFILE_REFERENCE: {
    referenceId: 'PROFILE_REFERENCE',
    label: 'My Astral Self / Your World Your Way',
    sourcePath: ASTRAL_REFERENCE_DESKTOP.repoPath,
    viewport: 'both',
    state: 'default',
    scope: 'avatar-led-profile',
    authorityLevel: 'FEATURE',
    assetDependencies: ['CUSTOM_AVATAR_HERO', 'DAILY_CARD_ARTIFACT', 'CREATE_A_DECK_HERO', 'CIRCLE_COMMUNITY_HERO'],
    relatedRoute: 'profile',
    relatedSceneId: 'PROFILE_AVATAR',
  },
};

export function getReferenceForRoute(routeSegment: string): AstralReferenceEntry | undefined {
  const normalized = routeSegment.replace(/^\//, '').replace(/\/$/, '');
  return Object.values(ASTRAL_REFERENCE_MANIFEST).find((r) => {
    const rr = r.relatedRoute.replace(/^\//, '');
    return normalized === rr || normalized.startsWith(`${rr}/`);
  });
}

export function getReferenceForScene(sceneId: string): AstralReferenceEntry | undefined {
  return Object.values(ASTRAL_REFERENCE_MANIFEST).find((r) => r.relatedSceneId === sceneId);
}
