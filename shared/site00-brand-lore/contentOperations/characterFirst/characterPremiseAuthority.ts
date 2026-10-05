/**
 * P0.5E.7A — Character premise as primary creative authority.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { NDXContentSeed } from './types.js';
import type { CharacterPremiseAuthority } from './types.js';
import { CHARACTER_FIRST_REGENERATION_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

export function buildCharacterPremiseAuthority(seed: NDXContentSeed): CharacterPremiseAuthority {
  const premiseId = `cpa-${fp({ seedId: seed.seedId, v: CHARACTER_FIRST_REGENERATION_VERSION })}`;
  return {
    premiseId,
    contentSeedId: seed.seedId,
    spokenPremise: seed.premise.spokenPremise.toUpperCase(),
    firstPersonPremise: seed.premise.spokenPremise.toUpperCase(),
    incitingIncident: seed.notice.toUpperCase(),
    firstReaction: seed.firstReaction.toUpperCase(),
    initialBelief: seed.initialBelief.toUpperCase(),
    investigationQuestion: seed.question.toUpperCase(),
    knowledgeStateAtStart: seed.thoughtArc.knowledgeState === 'LEARNS' ? 'THINKS' : seed.thoughtArc.knowledgeState,
    beliefRevisionState: seed.thoughtArc.beliefRevision,
    currentView: seed.currentView.toUpperCase(),
    behaviorChange: seed.currentView.toUpperCase(),
    bookTrace: seed.bookTrace,
    characterBeat: seed.characterBeat,
    founderApprovalState: seed.isGoldenPilot ? 'READY_TO_GENERATE' : null,
    authorityVersion: CHARACTER_FIRST_REGENERATION_VERSION,
    topicMetadata: [...seed.topicMetadata],
    experienceMode: seed.premise.experienceMode,
  };
}

export function characterPremiseOutranksTopic(authority: CharacterPremiseAuthority): boolean {
  return Boolean(authority.spokenPremise && authority.spokenPremise !== authority.topicMetadata[0]?.toUpperCase());
}

export function topicRemainsMetadata(authority: CharacterPremiseAuthority): boolean {
  return authority.topicMetadata.length > 0 && !authority.topicMetadata.includes(authority.spokenPremise);
}

export function resolveHeadlineFromCharacterPremise(authority: CharacterPremiseAuthority): string {
  return authority.spokenPremise;
}

export function resolveSubjectFromCharacterPremise(_authority: CharacterPremiseAuthority, legacySubject: string): string {
  return legacySubject;
}

export function assertNoAutobiographyFabrication(params: {
  authority: CharacterPremiseAuthority;
  seed: NDXContentSeed;
}): { allowed: boolean; reason: string | null } {
  const mode = params.authority.experienceMode;
  const personalClaims = /\b(I PAID|I LOST MY JOB|I GOT FIRED|MY DIVORCE|MY SURGERY)\b/i;
  if (
    (mode === 'OBSERVED' || mode === 'AUDIENCE_TRIGGERED' || mode === 'RESEARCH_REACTION') &&
    personalClaims.test(params.authority.spokenPremise)
  ) {
    return { allowed: false, reason: 'FIRST_PERSON_FABRICATED_AUTOBIOGRAPHY' };
  }
  return { allowed: true, reason: null };
}

export function createPremiseAuthorityId(): string {
  return `cpa-${randomUUID().slice(0, 8)}`;
}
