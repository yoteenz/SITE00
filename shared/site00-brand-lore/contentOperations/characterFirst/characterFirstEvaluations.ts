/**
 * P0.5E.7A — Experience-first gate + character-first evaluations.
 */

import type {
  CharacterFirstEvaluationResult,
  CharacterFirstRegenerationBundle,
  CharacterPremiseAuthority,
  NDXContentSeed,
  NDXPageRoleMap,
  NDXThoughtArcSnapshot,
} from './types.js';
import { PROHIBITED_HERO_SLIDE_ROLES } from './constants.js';
import type { HeroSlideRoleType } from './types.js';

export function evaluateExperienceFirstEntry(seed: NDXContentSeed): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  const warnings: string[] = [];

  if (!seed.notice?.trim()) failures.push('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');
  if (!seed.firstReaction?.trim()) failures.push('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');
  if (!seed.initialBelief?.trim()) failures.push('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');
  if (!seed.whySheCares?.trim()) failures.push('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');
  if (!seed.question?.trim()) failures.push('FAIL_TOPIC_WITHOUT_CHARACTER_ENTRY');

  return { passed: failures.length === 0, failures, warnings };
}

export function evaluateBeliefRevisionVisibility(params: {
  snapshot: NDXThoughtArcSnapshot;
  pageRoleMap: NDXPageRoleMap;
}): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  if (
    params.snapshot.beliefRevision !== 'UNCHANGED' &&
    params.snapshot.beliefRevision !== 'STRENGTHENED'
  ) {
    const hasRevisionRole = params.pageRoleMap.entries.some((e) => e.role === 'BELIEF_REVISION');
    if (!hasRevisionRole) failures.push('FAIL_REVISION_NOT_VISIBLE');
  }
  return { passed: failures.length === 0, failures, warnings: [] };
}

export function evaluateGenericEducationalCollapse(params: {
  premiseAuthority: CharacterPremiseAuthority;
  compiledCopy: string[];
  pageRoleMap: NDXPageRoleMap;
}): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  const joined = params.compiledCopy.join(' ').toUpperCase();
  const premise = params.premiseAuthority.spokenPremise.toUpperCase();

  if (!joined.includes(premise.split('.')[0] ?? premise)) {
    failures.push('FAIL_GENERIC_EDUCATIONAL_COLLAPSE');
  }

  const genericPatterns = [
    'EXPLAINED',
    'WHAT YOU NEED TO KNOW',
    'CHEAT SHEET',
    'HOW IT WORKS',
    'DEFINITION',
  ];
  const topicOnlyHeadline = params.premiseAuthority.topicMetadata.some((t) =>
    joined.startsWith(t.toUpperCase()),
  );
  if (topicOnlyHeadline && !joined.includes(premise)) {
    failures.push('FAIL_GENERIC_EDUCATIONAL_COLLAPSE');
  }
  if (genericPatterns.some((p) => joined.includes(p) && !joined.includes('I '))) {
    failures.push('FAIL_GENERIC_EDUCATIONAL_COLLAPSE');
  }

  const hasCharacterRoles = params.pageRoleMap.entries.some((e) =>
    ['PERSONAL_CONTRADICTION', 'INITIAL_ASSUMPTION', 'BELIEF_REVISION'].includes(e.role),
  );
  if (!hasCharacterRoles) failures.push('FAIL_GENERIC_EDUCATIONAL_COLLAPSE');

  return { passed: failures.length === 0, failures, warnings: [] };
}

export function evaluateNdxRemoval(params: {
  premiseAuthority: CharacterPremiseAuthority;
  compiledCopy: string[];
}): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  const joined = params.compiledCopy.join(' ').toUpperCase();
  const firstPersonMarkers = [' I ', ' MY ', ' ME ', 'I THOUGHT', 'I MISSED', 'I WAS', "I DIDN'T", 'I PAID', 'I KNOW', 'I KEEP'];
  const hasFirstPersonFraming = firstPersonMarkers.some((m) => joined.includes(m.trim()) || joined.startsWith(m.trim()));
  if (!hasFirstPersonFraming) {
    failures.push('FAIL_CHARACTER_NOT_CAUSAL');
    return { passed: false, failures, warnings: [] };
  }

  const withoutFirstPerson = joined
    .replace(/\bI\b/g, '')
    .replace(/\bMY\b/g, '')
    .replace(/\bME\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const educationalOnly = ['EXPLAINED', 'DEFINITION', 'CHEAT SHEET', 'HOW IT WORKS', 'WHAT YOU NEED TO KNOW'];
  if (educationalOnly.some((p) => withoutFirstPerson.includes(p)) && !joined.includes(params.premiseAuthority.spokenPremise.split('.')[0] ?? '')) {
    failures.push('FAIL_CHARACTER_NOT_CAUSAL');
  }
  return { passed: failures.length === 0, failures, warnings: [] };
}

export function evaluateHeroCausality(params: {
  heroRole: HeroSlideRoleType;
  premiseAuthority: CharacterPremiseAuthority;
}): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  if (PROHIBITED_HERO_SLIDE_ROLES.includes(params.heroRole as never)) {
    failures.push('FAIL_HERO_CAUSALITY');
  }
  if (!params.premiseAuthority.incitingIncident && !params.premiseAuthority.spokenPremise) {
    failures.push('FAIL_HERO_CAUSALITY');
  }
  const topicOnly =
    params.premiseAuthority.spokenPremise.toUpperCase() ===
    params.premiseAuthority.topicMetadata[0]?.toUpperCase();
  if (topicOnly) failures.push('FAIL_HERO_CAUSALITY');
  return { passed: failures.length === 0, failures, warnings: [] };
}

export function evaluateHeroPremiseLock(params: {
  approvedPremise: string;
  candidatePremise: string;
  lockEnabled: boolean;
}): CharacterFirstEvaluationResult {
  const failures: CharacterFirstEvaluationResult['failures'] = [];
  if (!params.lockEnabled) return { passed: true, failures, warnings: [] };

  const normalize = (s: string) =>
    s
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s?]/g, '')
      .trim();
  const approved = normalize(params.approvedPremise);
  const candidate = normalize(params.candidatePremise);

  if (approved !== candidate) {
    const approvedCore = approved.replace(/\?/g, '').split(' ').slice(0, 6).join(' ');
    if (!candidate.includes(approvedCore)) {
      failures.push('FAIL_HERO_PREMISE_DRIFT');
    }
  }
  return { passed: failures.length === 0, failures, warnings: [] };
}

export function runCharacterFirstRegenerationGates(
  bundle: CharacterFirstRegenerationBundle,
  compiledCopy: string[],
): CharacterFirstEvaluationResult {
  const allFailures: CharacterFirstEvaluationResult['failures'] = [];
  const allWarnings: string[] = [];

  for (const result of [
    evaluateBeliefRevisionVisibility({
      snapshot: bundle.thoughtArcSnapshot,
      pageRoleMap: bundle.pageRoleMap,
    }),
    evaluateGenericEducationalCollapse({
      premiseAuthority: bundle.premiseAuthority,
      compiledCopy,
      pageRoleMap: bundle.pageRoleMap,
    }),
    evaluateNdxRemoval({ premiseAuthority: bundle.premiseAuthority, compiledCopy }),
    evaluateHeroCausality({
      heroRole: bundle.heroSlideAuthority.role,
      premiseAuthority: bundle.premiseAuthority,
    }),
    evaluateHeroPremiseLock({
      approvedPremise: bundle.premiseAuthority.spokenPremise,
      candidatePremise: compiledCopy[0] ?? bundle.premiseAuthority.spokenPremise,
      lockEnabled: bundle.founderHeroLock.lockHeroPremise,
    }),
  ]) {
    allFailures.push(...result.failures);
    allWarnings.push(...result.warnings);
  }

  return { passed: allFailures.length === 0, failures: [...new Set(allFailures)], warnings: allWarnings };
}

export function topicOnlyCharacterPageAllowed(): false {
  return false;
}
