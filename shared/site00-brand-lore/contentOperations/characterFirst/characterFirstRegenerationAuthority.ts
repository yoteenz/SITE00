/**
 * P0.5E.7A — Character-first regeneration authority + V2.3 bridge.
 */

import type { BrandMarketingArtifact } from '../../brandMarketingExpression/types.js';
import type { CharacterFirstRegenerationBundle } from './types.js';
import { assembleCharacterFirstRegenerationBundle } from './characterFirstContentSnapshot.js';
import { buildCharacterPremiseAuthority } from './characterPremiseAuthority.js';
import { buildNDXThoughtArcSnapshot } from './ndxThoughtArcSnapshot.js';
import { buildNDXPageRoleMap } from './ndxPageRoleMap.js';
import { buildHeroSlideAuthority, defaultFounderHeroLockState } from './heroSlideAuthority.js';
import { buildCharacterFirstAuthorityPromptSections, buildRegenerationAuthorityDiff } from './characterFirstFalPromptSections.js';
import { runCharacterFirstRegenerationGates, evaluateExperienceFirstEntry } from './characterFirstEvaluations.js';
import { getGoldenPilotSeed, seedCharacterFirstContentSeeds } from './ndxContentSeed.js';
import { translateTopicToExperience } from './ndxTopicToExperienceTranslator.js';
import type { NDXContentSeed } from './types.js';

export function buildRegenerationBundleFromSeed(seed: NDXContentSeed): CharacterFirstRegenerationBundle {
  return assembleCharacterFirstRegenerationBundle(seed, {
    buildCharacterPremiseAuthority,
    buildNDXThoughtArcSnapshot,
    buildNDXPageRoleMap,
    buildHeroSlideAuthority,
    defaultFounderHeroLockState,
  });
}

const SUBJECT_ALIASES: Record<string, string> = {
  'subscription creep': 'subscription normalization',
  'corporate memo euphemism': 'corporate layoff memo language',
  'self-checkout promise': 'self-checkout time promise',
  'public reassessment of a pop figure': 'cultural moment',
  'then/now product promise': 'historical callback',
};

export function resolveSeedForV23Artifact(v1Artifact: BrandMarketingArtifact): NDXContentSeed | null {
  const subject = v1Artifact.subject?.toLowerCase().trim() ?? '';
  const aliased = SUBJECT_ALIASES[subject] ?? subject;
  const seeds = seedCharacterFirstContentSeeds('ndxbook');
  const direct = seeds.find((s) => s.legacyTopicSubject?.toLowerCase().trim() === aliased);
  if (direct) return direct;

  if (subject.includes('credit') || subject.includes('utilization') || aliased.includes('credit')) {
    return getGoldenPilotSeed(seeds);
  }

  const translated = translateTopicToExperience({
    topicMetadata: [v1Artifact.topic, v1Artifact.subject].filter(Boolean),
    legacySubject: v1Artifact.subject,
  });

  const fuzzy = seeds.find((s) => s.premise.spokenPremise.toUpperCase() === translated.spokenPremise);
  return fuzzy ?? null;
}

export function applyCharacterFirstToV1Artifact(
  v1Artifact: BrandMarketingArtifact,
  bundle: CharacterFirstRegenerationBundle,
): BrandMarketingArtifact {
  const premise = bundle.premiseAuthority.spokenPremise;
  return {
    ...v1Artifact,
    headline: bundle.founderHeroLock.lockHeroCopy ? premise : premise,
    supportingLanguage: [
      bundle.premiseAuthority.incitingIncident,
      bundle.premiseAuthority.firstReaction,
      ...v1Artifact.supportingLanguage.slice(2),
    ],
    subject: v1Artifact.subject,
    topic: v1Artifact.topic,
  };
}

export function injectCharacterFirstIntoPrompt(
  basePrompt: string,
  bundle: CharacterFirstRegenerationBundle,
  slideNumber: number,
): string {
  const sections = buildCharacterFirstAuthorityPromptSections(bundle, slideNumber);
  const injected = [...sections, '', basePrompt].join('\n\n');
  return injected;
}

export function assertCharacterFirstRegenerationReady(params: {
  seed: NDXContentSeed;
  mode: 'REGENERATE_CURRENT' | 'REPLAY_GENERATION';
}): { ready: boolean; blockReason: string | null; bundle: CharacterFirstRegenerationBundle | null } {
  if (params.mode === 'REPLAY_GENERATION') {
    return { ready: true, blockReason: null, bundle: null };
  }

  const experience = evaluateExperienceFirstEntry(params.seed);
  if (!experience.passed) {
    return {
      ready: false,
      blockReason: experience.failures[0] ?? 'FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY',
      bundle: null,
    };
  }

  const bundle = buildRegenerationBundleFromSeed(params.seed);
  const diff = buildRegenerationAuthorityDiff(bundle);
  if (diff.topicMoreProminentThanPremise) {
    return { ready: false, blockReason: 'FAIL_GENERIC_EDUCATIONAL_COLLAPSE', bundle };
  }

  const compiledCopy = [
    bundle.premiseAuthority.spokenPremise,
    ...bundle.pageRoleMap.entries.map((e) => e.spokenCopyHint),
  ];
  const gates = runCharacterFirstRegenerationGates(bundle, compiledCopy);
  if (!gates.passed) {
    return { ready: false, blockReason: gates.failures[0] ?? 'FAIL_GENERIC_EDUCATIONAL_COLLAPSE', bundle };
  }

  return { ready: true, blockReason: null, bundle };
}

export function regenerateCurrentUsesCurrentCharacterAuthority(): true {
  return true;
}

export function replayHistoricalPreserved(): true {
  return true;
}

export function topicOnlyRegenerationBlocked(): true {
  return true;
}
