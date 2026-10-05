/**
 * P0.5E.7A — Explicit narrative page role map per sequence.
 */

import { createHash } from 'node:crypto';
import type { NDXContentSeed, NDXPageRoleMap, NDXPageRoleMapEntry } from './types.js';
import { CHARACTER_FIRST_REGENERATION_VERSION, CREDIT_UTILIZATION_GOLDEN_PILOT_ID } from './constants.js';
import type { NdxPageRoleMapRole } from './types.js';
import { getPageRoleSemanticContract } from './pageRoleSemantics.js';
import { knowledgeStateForPageRole } from './ndxThoughtArcSnapshot.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

export const CREDIT_UTILIZATION_ROLE_MAP: NDXPageRoleMapEntry[] = [
  { slideNumber: 1, role: 'PERSONAL_CONTRADICTION', spokenCopyHint: 'I PAID IT DOWN.\nWHY DID MY SCORE DROP?', knowledgeState: 'THINKS', characterBeat: 'THAT_CANNOT_BE_RIGHT' },
  { slideNumber: 2, role: 'INITIAL_ASSUMPTION', spokenCopyHint: 'I THOUGHT LOWER BALANCE = BETTER.', knowledgeState: 'THINKS', characterBeat: 'THAT_CANNOT_BE_RIGHT' },
  { slideNumber: 3, role: 'WHAT_I_MISSED', spokenCopyHint: 'HERE IS WHAT I MISSED.', knowledgeState: 'LEARNS' },
  { slideNumber: 4, role: 'SYSTEM_LOGIC', spokenCopyHint: 'THEY CARE ABOUT THE RATIO.', knowledgeState: 'LEARNS' },
  { slideNumber: 5, role: 'TIMING_COMPLICATION', spokenCopyHint: 'TIMING MATTERS TOO.', knowledgeState: 'LEARNS' },
  { slideNumber: 6, role: 'BELIEF_REVISION', spokenCopyHint: "THE BALANCE ALONE WAS NOT THE WHOLE STORY.", knowledgeState: 'CHANGED_MIND', characterBeat: 'I_WAS_WRONG' },
  { slideNumber: 7, role: 'BEHAVIOR_CHANGE', spokenCopyHint: 'WATCH REPORTING / UTILIZATION / STATEMENT TIMING.', knowledgeState: 'KNOWS' },
  { slideNumber: 8, role: 'BOOKMARK', spokenCopyHint: 'BOOKMARK THIS.', knowledgeState: 'KNOWS' },
];

export function buildNDXPageRoleMap(seed: NDXContentSeed, entries?: NDXPageRoleMapEntry[]): NDXPageRoleMap {
  const mapId = `prm-${fp({ seedId: seed.seedId, v: CHARACTER_FIRST_REGENERATION_VERSION })}`;
  let resolvedEntries = entries;

  if (!resolvedEntries) {
    if (seed.seedId === CREDIT_UTILIZATION_GOLDEN_PILOT_ID || seed.isGoldenPilot) {
      resolvedEntries = CREDIT_UTILIZATION_ROLE_MAP;
    } else if (seed.legacyTopicSubject) {
      resolvedEntries = buildDefaultRoleMapFromSeed(seed);
    } else {
      resolvedEntries = [
        { slideNumber: 1, role: 'PERSONAL_CONTRADICTION', spokenCopyHint: seed.premise.spokenPremise, knowledgeState: 'THINKS', characterBeat: seed.characterBeat },
        { slideNumber: 2, role: 'INITIAL_ASSUMPTION', spokenCopyHint: seed.initialBelief, knowledgeState: 'ASSUMES' as never },
        { slideNumber: 8, role: 'BOOKMARK', spokenCopyHint: 'BOOKMARK THIS.', knowledgeState: 'KNOWS' },
      ];
    }
  }

  return {
    mapId,
    contentSeedId: seed.seedId,
    entries: resolvedEntries.map((e) => ({
      ...e,
      knowledgeState: e.knowledgeState ?? knowledgeStateForPageRole(e.role, e.slideNumber),
    })),
    version: CHARACTER_FIRST_REGENERATION_VERSION,
  };
}

function buildDefaultRoleMapFromSeed(seed: NDXContentSeed): NDXPageRoleMapEntry[] {
  const heroRole: NdxPageRoleMapRole =
    seed.premise.experienceMode === 'PERSONALLY_EXPERIENCED' ? 'PERSONAL_CONTRADICTION' : 'OBSERVATION';
  return [
    { slideNumber: 1, role: heroRole, spokenCopyHint: seed.premise.spokenPremise, knowledgeState: 'THINKS', characterBeat: seed.characterBeat },
    { slideNumber: 2, role: 'INITIAL_ASSUMPTION', spokenCopyHint: seed.initialBelief, knowledgeState: 'ASSUMES' as never },
    { slideNumber: 3, role: 'WHAT_I_MISSED', spokenCopyHint: 'HERE IS WHAT I MISSED.', knowledgeState: 'LEARNS' },
    { slideNumber: 4, role: 'SYSTEM_LOGIC', spokenCopyHint: seed.investigationTrigger, knowledgeState: 'LEARNS' },
    { slideNumber: 5, role: 'COMPLICATION', spokenCopyHint: seed.friction, knowledgeState: 'LEARNS' },
    { slideNumber: 6, role: 'BELIEF_REVISION', spokenCopyHint: seed.currentView, knowledgeState: 'CHANGED_MIND' },
    { slideNumber: 7, role: 'BEHAVIOR_CHANGE', spokenCopyHint: seed.currentView, knowledgeState: 'KNOWS' },
    { slideNumber: 8, role: 'BOOKMARK', spokenCopyHint: 'BOOKMARK THIS.', knowledgeState: 'KNOWS' },
  ];
}

export function getPageRoleForSlide(map: NDXPageRoleMap, slideNumber: number): NDXPageRoleMapEntry | null {
  return map.entries.find((e) => e.slideNumber === slideNumber) ?? null;
}

export function pageRoleMapSurvivesGeneration(map: NDXPageRoleMap, prompt: string): boolean {
  const upper = prompt.toUpperCase();
  return map.entries.every((e) => upper.includes(e.role.replace(/_/g, ' ')) || upper.includes(`SLIDE ${e.slideNumber}`));
}

export function getPageRoleSemantics(role: NdxPageRoleMapRole) {
  return getPageRoleSemanticContract(role);
}

export function creditUtilizationEightSlideRolesLocked(): boolean {
  return CREDIT_UTILIZATION_ROLE_MAP.length === 8;
}
