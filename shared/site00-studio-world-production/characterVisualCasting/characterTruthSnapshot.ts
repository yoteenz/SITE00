/**
 * P0.5E.4C — Build casting-authoritative CharacterTruthSnapshot from discovery run.
 */

import { randomUUID } from 'node:crypto';
import type { NdxFounderCharacterDiscoveryRun } from '../../site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import type { CharacterTruthSnapshot, CharacterTruthTruthLayer } from './types.js';

function founderLayer(text: string): CharacterTruthTruthLayer {
  return { text, authority: 'FOUNDER_CONFIRMED' };
}

function inferredLayer(text: string): CharacterTruthTruthLayer {
  return { text, authority: 'SYSTEM_INFERRED' };
}

export function buildCharacterTruthSnapshot(params: {
  run: NdxFounderCharacterDiscoveryRun;
  version: number;
  lockedForCasting?: boolean;
  supersededBySnapshotId?: string | null;
}): CharacterTruthSnapshot {
  const { run, version } = params;
  const synthesis = run.humanReadableSynthesis;
  const calibration = run.calibrationState;

  const founderConfirmedTruths = [
    ...(calibration?.directFounderTruths ?? []),
    ...run.scenarios
      .filter((s) => s.founderJudgment && (s.characterEvidence ?? s.situation))
      .map((s) => s.characterEvidence ?? s.situation),
    ...run.visualHypothesisReviews
      .filter((v) => v.judgment === 'YES' || v.judgment === 'MAYBE')
      .map((v) => `Visual hypothesis confirmed: ${v.hypothesisId}`),
  ].filter((value, index, array) => array.indexOf(value) === index);

  const systemInferences = [
    ...(calibration?.systemInferences.map((i) => i.inference) ?? []),
    ...run.contradictions.map((c) => `${c.traitA} ↔ ${c.traitB}: ${c.whyBothAreTrue}`),
    ...run.flawProfile.procrastinates,
  ].filter((value, index, array) => array.indexOf(value) === index);
  const unresolvedAreas = calibration?.stillUnsureAbout ?? synthesis?.whatIStillDontKnow ?? [];

  return {
    snapshotId: randomUUID(),
    version,
    characterId: 'ndx',
    projectId: run.projectId,
    createdAt: new Date().toISOString(),
    lockedForCasting: params.lockedForCasting ?? true,
    supersededBySnapshotId: params.supersededBySnapshotId ?? null,
    characterSummary: synthesis?.whoIThinkSheIs
      ? founderLayer(synthesis.whoIThinkSheIs)
      : null,
    intelligenceProfile: run.intelligenceMap.couldTalkForHours.map(founderLayer),
    contradictionProfile: run.contradictions.map((c) =>
      inferredLayer(`${c.traitA} ↔ ${c.traitB}: ${c.whyBothAreTrue}`),
    ),
    humor: run.humorBehavior.whatMakesHerLaugh.map(inferredLayer),
    emotionalRange: run.publicPrivate.friendsKnow.map(inferredLayer),
    values: founderConfirmedTruths.slice(0, 5).map(founderLayer),
    blindSpots: run.contradictions.flatMap((c) => c.whenAAppears).slice(0, 3).map(inferredLayer),
    culturalLife: run.culturalBoundaries.map((b) =>
      inferredLayer(`${b.topic} (${b.level})${b.researchNotPretendPhrase ? `: ${b.researchNotPretendPhrase}` : ''}`),
    ),
    privateHumanity: run.flawProfile.procrastinates.map(inferredLayer),
    languageVoiceTraits: run.voiceLabSamples.map((s) => inferredLayer(s.underlyingThought)),
    bookRelationship: run.bookDiscovery.whySheWritesThingsDown
      ? inferredLayer(run.bookDiscovery.whySheWritesThingsDown)
      : null,
    behavior: run.scenarios.filter((s) => s.founderJudgment).map((s) => founderLayer(s.characterEvidence ?? s.situation)),
    cameraBehavior: synthesis?.whatSheLooksLikeSoFar
      ? [founderLayer(synthesis.whatSheLooksLikeSoFar)]
      : [],
    visualHypotheses: run.visualHypothesisReviews
      .filter((v) => v.judgment)
      .map((v) => inferredLayer(`${v.hypothesisId}: ${v.judgment}`)),
    founderConfirmedTruths,
    systemInferences,
    unresolvedAreas,
  };
}

export function founderConfirmedDistinctFromInference(snapshot: CharacterTruthSnapshot): boolean {
  return (
    snapshot.founderConfirmedTruths.length > 0 &&
    snapshot.systemInferences.length >= 0 &&
    !snapshot.founderConfirmedTruths.some((t) => snapshot.systemInferences.includes(t))
  );
}
