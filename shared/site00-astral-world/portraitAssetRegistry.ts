/**
 * P0.E.FT3.2 — Isolated portrait asset registry (semantic keys + face-centered extraction).
 * Interim: tight extraction crops from reference boards until FAL ACTIVE assets arrive.
 */

import { ASTRAL_REFERENCE_DESKTOP, ASTRAL_REFERENCE_MOBILE } from './referenceAssets.js';

export type PortraitSemanticKey =
  | 'READER_MADAME_J'
  | 'READER_KAI_ORACLE'
  | 'READER_EARTH_MAMA'
  | 'READER_SAGE_MOONWATER'
  | 'READER_ORION_VALE'
  | 'READER_ARIA_BLOOM'
  | 'FRIEND_JANE_DOE'
  | 'FRIEND_MARCUS_CHEN'
  | 'FRIEND_LUNA_REYES'
  | 'FRIEND_LOVE_LUX'
  | 'USER_DEMO_TEENA';

export type IsolatedPortraitSpec = {
  semanticKey: PortraitSemanticKey;
  fixtureId: string;
  falSlotKey: string;
  kind: 'reader' | 'friend' | 'user';
  /** Isolated face-centered extraction — not a loose board crop */
  src: string;
  position: string;
  size: string;
  displayName: string;
};

const D = ASTRAL_REFERENCE_DESKTOP.publicPath;
const M = ASTRAL_REFERENCE_MOBILE.publicPath;

/** Face-centered extraction coordinates tuned per character region on reference boards */
export const ISOLATED_PORTRAIT_ASSETS: Record<PortraitSemanticKey, IsolatedPortraitSpec> = {
  READER_MADAME_J: {
    semanticKey: 'READER_MADAME_J',
    fixtureId: 'reader-madame-j',
    falSlotKey: 'READER_PORTRAIT_reader-madame-j',
    kind: 'reader',
    src: D,
    position: '86.2% 31.8%',
    size: '420% auto',
    displayName: 'Madame J',
  },
  READER_KAI_ORACLE: {
    semanticKey: 'READER_KAI_ORACLE',
    fixtureId: 'reader-kai',
    falSlotKey: 'READER_PORTRAIT_reader-kai',
    kind: 'reader',
    src: D,
    position: '88.1% 35.2%',
    size: '420% auto',
    displayName: 'Kai the Oracle',
  },
  READER_EARTH_MAMA: {
    semanticKey: 'READER_EARTH_MAMA',
    fixtureId: 'reader-earth-mama',
    falSlotKey: 'READER_PORTRAIT_reader-earth-mama',
    kind: 'reader',
    src: D,
    position: '90.0% 39.5%',
    size: '420% auto',
    displayName: 'Earth Mama',
  },
  READER_SAGE_MOONWATER: {
    semanticKey: 'READER_SAGE_MOONWATER',
    fixtureId: 'reader-sage',
    falSlotKey: 'READER_PORTRAIT_reader-sage',
    kind: 'reader',
    src: D,
    position: '87.4% 43.6%',
    size: '420% auto',
    displayName: 'Sage Moonwater',
  },
  READER_ORION_VALE: {
    semanticKey: 'READER_ORION_VALE',
    fixtureId: 'reader-orion',
    falSlotKey: 'READER_PORTRAIT_reader-orion',
    kind: 'reader',
    src: M,
    position: '70.2% 69.8%',
    size: '440% auto',
    displayName: 'Orion Vale',
  },
  READER_ARIA_BLOOM: {
    semanticKey: 'READER_ARIA_BLOOM',
    fixtureId: 'reader-aria',
    falSlotKey: 'READER_PORTRAIT_reader-aria',
    kind: 'reader',
    src: M,
    position: '72.1% 71.6%',
    size: '440% auto',
    displayName: 'Aria Bloom',
  },
  FRIEND_JANE_DOE: {
    semanticKey: 'FRIEND_JANE_DOE',
    fixtureId: 'friend-jane',
    falSlotKey: 'FRIEND_AVATAR_friend-jane',
    kind: 'friend',
    src: M,
    position: '72.0% 33.8%',
    size: '480% auto',
    displayName: 'Jane Doe',
  },
  FRIEND_MARCUS_CHEN: {
    semanticKey: 'FRIEND_MARCUS_CHEN',
    fixtureId: 'friend-marcus',
    falSlotKey: 'FRIEND_AVATAR_friend-marcus',
    kind: 'friend',
    src: M,
    position: '74.2% 35.6%',
    size: '480% auto',
    displayName: 'Marcus Chen',
  },
  FRIEND_LUNA_REYES: {
    semanticKey: 'FRIEND_LUNA_REYES',
    fixtureId: 'friend-luna',
    falSlotKey: 'FRIEND_AVATAR_friend-luna',
    kind: 'friend',
    src: M,
    position: '76.1% 37.4%',
    size: '480% auto',
    displayName: 'Luna Reyes',
  },
  FRIEND_LOVE_LUX: {
    semanticKey: 'FRIEND_LOVE_LUX',
    fixtureId: 'friend-lux',
    falSlotKey: 'FRIEND_AVATAR_friend-lux',
    kind: 'friend',
    src: M,
    position: '78.0% 39.2%',
    size: '480% auto',
    displayName: 'Love Lux',
  },
  USER_DEMO_TEENA: {
    semanticKey: 'USER_DEMO_TEENA',
    fixtureId: 'user-demo-teena',
    falSlotKey: 'CUSTOM_AVATAR_HERO',
    kind: 'user',
    src: D,
    position: '12.2% 57.8%',
    size: '380% auto',
    displayName: 'Teena',
  },
};

const FIXTURE_TO_SEMANTIC: Record<string, PortraitSemanticKey> = Object.fromEntries(
  Object.values(ISOLATED_PORTRAIT_ASSETS).map((p) => [p.fixtureId, p.semanticKey]),
);

export function semanticKeyForPerson(personId: string): PortraitSemanticKey | null {
  return FIXTURE_TO_SEMANTIC[personId] ?? null;
}

export function getIsolatedPortrait(personId: string): IsolatedPortraitSpec | null {
  const key = semanticKeyForPerson(personId);
  return key ? ISOLATED_PORTRAIT_ASSETS[key] : null;
}

export function getIsolatedPortraitBySemantic(key: PortraitSemanticKey): IsolatedPortraitSpec {
  return ISOLATED_PORTRAIT_ASSETS[key];
}

export const READER_SEMANTIC_KEYS = Object.values(ISOLATED_PORTRAIT_ASSETS)
  .filter((p) => p.kind === 'reader')
  .map((p) => p.semanticKey);

export const FRIEND_SEMANTIC_KEYS = Object.values(ISOLATED_PORTRAIT_ASSETS)
  .filter((p) => p.kind === 'friend')
  .map((p) => p.semanticKey);

export function isolatedPortraitStyle(spec: IsolatedPortraitSpec): {
  backgroundImage: string;
  backgroundPosition: string;
  backgroundSize: string;
  backgroundRepeat: 'no-repeat';
} {
  return {
    backgroundImage: `url(${spec.src})`,
    backgroundPosition: spec.position,
    backgroundSize: spec.size,
    backgroundRepeat: 'no-repeat',
  };
}
