/**
 * P0.5E.7A — Character-first content snapshot versioning.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CharacterFirstContentSnapshot,
  CharacterFirstRegenerationBundle,
  CharacterPremiseAuthority,
  HeroSlideAuthority,
  NDXPageRoleMap,
  NDXThoughtArcSnapshot,
} from './types.js';
import { CHARACTER_FIRST_REGENERATION_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

export function buildCharacterFirstContentSnapshot(params: {
  premiseAuthority: CharacterPremiseAuthority;
  thoughtArcSnapshot: NDXThoughtArcSnapshot;
  pageRoleMap: NDXPageRoleMap;
  heroSlideAuthority: HeroSlideAuthority;
}): CharacterFirstContentSnapshot {
  return {
    snapshotId: `cfs-${randomUUID().slice(0, 8)}`,
    premiseVersion: fp(params.premiseAuthority),
    thoughtArcVersion: fp(params.thoughtArcSnapshot),
    pageRoleMapVersion: fp(params.pageRoleMap),
    characterBeatVersion: fp(params.premiseAuthority.characterBeat),
    knowledgeStateVersion: fp(params.thoughtArcSnapshot.knowledgeStateProgression),
    evidenceVersion: fp(params.thoughtArcSnapshot.evidenceNeeded),
    visualGrammarVersion: 'P0.5C.7',
    compiledAt: new Date().toISOString(),
  };
}

export function assembleCharacterFirstRegenerationBundle(
  seed: import('./types.js').NDXContentSeed,
  deps: {
    buildCharacterPremiseAuthority: typeof import('./characterPremiseAuthority.js').buildCharacterPremiseAuthority;
    buildNDXThoughtArcSnapshot: typeof import('./ndxThoughtArcSnapshot.js').buildNDXThoughtArcSnapshot;
    buildNDXPageRoleMap: typeof import('./ndxPageRoleMap.js').buildNDXPageRoleMap;
    buildHeroSlideAuthority: typeof import('./heroSlideAuthority.js').buildHeroSlideAuthority;
    defaultFounderHeroLockState: typeof import('./heroSlideAuthority.js').defaultFounderHeroLockState;
  },
): CharacterFirstRegenerationBundle {
  const pageRoleMap = deps.buildNDXPageRoleMap(seed);
  const premiseAuthority = deps.buildCharacterPremiseAuthority(seed);
  const thoughtArcSnapshot = deps.buildNDXThoughtArcSnapshot(
    seed,
    pageRoleMap.entries.map((e) => ({ slideNumber: e.slideNumber, role: e.role })),
  );
  const founderHeroLock = deps.defaultFounderHeroLockState({
    lockHeroPremise: seed.isGoldenPilot,
    lockHeroCopy: seed.isGoldenPilot,
  });
  const heroSlideAuthority = deps.buildHeroSlideAuthority({
    premiseAuthority,
    pageRoleMap,
    founderHeroLock,
    approvedReferenceAssetId: seed.isGoldenPilot ? 'CHARACTER_FIRST_CREDIT_UTILIZATION_VISUAL_NORTH_STAR' : null,
  });
  const contentSnapshot = buildCharacterFirstContentSnapshot({
    premiseAuthority,
    thoughtArcSnapshot,
    pageRoleMap,
    heroSlideAuthority,
  });
  return {
    premiseAuthority,
    thoughtArcSnapshot,
    pageRoleMap,
    heroSlideAuthority,
    contentSnapshot,
    founderHeroLock,
  };
}

export function characterFirstSnapshotVersion(): string {
  return CHARACTER_FIRST_REGENERATION_VERSION;
}
