/**
 * P0.5E.7A — Hero slide authority + founder hero lock.
 */

import type {
  CharacterPremiseAuthority,
  FounderHeroLockState,
  HeroSlideAuthority,
  NDXPageRoleMap,
} from './types.js';
import { PROHIBITED_HERO_SLIDE_ROLES } from './constants.js';
import type { HeroSlideRoleType } from './types.js';

export function defaultFounderHeroLockState(overrides?: Partial<FounderHeroLockState>): FounderHeroLockState {
  return {
    lockHeroPremise: true,
    lockHeroCopy: false,
    lockHeroPhoto: false,
    lockHeroCompositionIntent: false,
    ...overrides,
  };
}

export function resolveHeroSlideRole(pageRoleMap: NDXPageRoleMap): HeroSlideRoleType {
  const slide01 = pageRoleMap.entries.find((e) => e.slideNumber === 1);
  const role = slide01?.role ?? 'PERSONAL_CONTRADICTION';
  switch (role) {
    case 'PERSONAL_CONTRADICTION':
      return 'PERSONAL_CONTRADICTION';
    case 'INITIAL_ASSUMPTION':
      return 'MISTAKEN_ASSUMPTION';
    case 'OBSERVATION':
      return 'OBSERVATION';
    case 'INCITING_INCIDENT':
      return 'INCITING_INCIDENT';
    default:
      return 'PERSONAL_CONTRADICTION';
  }
}

export function buildHeroSlideAuthority(params: {
  premiseAuthority: CharacterPremiseAuthority;
  pageRoleMap: NDXPageRoleMap;
  founderHeroLock?: Partial<FounderHeroLockState>;
  approvedReferenceAssetId?: string | null;
}): HeroSlideAuthority {
  const role = resolveHeroSlideRole(params.pageRoleMap);
  return {
    slideNumber: 1,
    role,
    spokenPremise: params.premiseAuthority.spokenPremise,
    emotionalFunction: params.premiseAuthority.firstReaction,
    incitingIncident: params.premiseAuthority.incitingIncident,
    characterBeat: params.premiseAuthority.characterBeat,
    visualAuthority: 'P0.5C.7',
    mustPreserve: [
      params.premiseAuthority.spokenPremise,
      params.premiseAuthority.firstReaction,
      'first-person causal arc',
      'NOT a general educational post about the topic alone',
    ],
    approvedReferenceAssetId: params.approvedReferenceAssetId ?? null,
    approvedReferencePrompt: null,
    founderLocked: defaultFounderHeroLockState(params.founderHeroLock),
    prohibitedRoles: [...PROHIBITED_HERO_SLIDE_ROLES],
  };
}

export function heroSlideHasDistinctAuthority(hero: HeroSlideAuthority): boolean {
  return hero.slideNumber === 1 && Boolean(hero.spokenPremise) && hero.prohibitedRoles.length > 0;
}

export function heroPremiseLockActive(hero: HeroSlideAuthority): boolean {
  return hero.founderLocked.lockHeroPremise;
}

export function regenerateCurrentPreservesHeroPremise(params: {
  hero: HeroSlideAuthority;
  candidateHeadline: string;
}): boolean {
  if (!params.hero.founderLocked.lockHeroPremise) return true;
  const normalize = (s: string) => s.toUpperCase().replace(/\s+/g, ' ').trim();
  const approved = normalize(params.hero.spokenPremise);
  const candidate = normalize(params.candidateHeadline);
  return candidate.includes(approved.split('?')[0]?.slice(0, 20) ?? approved.slice(0, 20));
}

export function slide01IsNotGenericExplainer(hero: HeroSlideAuthority): boolean {
  return !hero.prohibitedRoles.includes(hero.role as never);
}
