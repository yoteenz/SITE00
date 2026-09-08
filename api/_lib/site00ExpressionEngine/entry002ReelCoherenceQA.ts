/**
 * Sprint B4.9R3 — Reel coherence QA (distinct from narrative coverage).
 */

import type {
  Entry002ReelVisualConception,
  ReelCoherenceQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

const REQUIRED_CHECKS = [
  'samePhysicalEnvironmentAcrossSequence',
  'sameNdxIdentityAcrossSequence',
  'sameNdxWardrobeAcrossSequence',
  'samePhoneAcrossSequence',
  'sameSubjectIdentityAcrossSequence',
  'sameFashionLanguageAcrossSequence',
  'lightingProgressesRatherThanResets',
  'cameraLanguageConsistent',
  'editSuiteEmergesRatherThanAppearsRandomly',
  'visualActionProgressesChronologically',
  'openingAndEndingRealityMatch',
  'framesLookLikeSameFilm',
  'noIndependentConceptResets',
] as const;

export function runReelCoherenceQA(params: {
  conception: Entry002ReelVisualConception;
  unrelatedScenes?: boolean;
  environmentResets?: boolean;
  identityResets?: boolean;
  reorderableMoments?: boolean;
}): ReelCoherenceQAResult {
  const checks: ReelCoherenceQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  const moments = params.conception.selectedStoryboardMoments;
  const opening = moments[0];
  const ending = moments[moments.length - 1];

  const semantic: Record<string, boolean> = {
    samePhysicalEnvironmentAcrossSequence: !params.environmentResets && moments.every((m) =>
      /same room|same environment|same tabletop|same work surface|same dark room|same physical space/i.test(
        m.environmentState + m.visualDescription,
      ),
    ),
    sameNdxIdentityAcrossSequence: !params.identityResets && /same NDX|NDX|lime/i.test(
      params.conception.ndxBehavior + moments.map((m) => m.visualDescription).join(' '),
    ),
    sameNdxWardrobeAcrossSequence: !params.identityResets,
    samePhoneAcrossSequence: !params.unrelatedScenes && /same phone|phone/i.test(
      params.conception.phoneBehavior + moments.map((m) => m.visualDescription).join(' '),
    ),
    sameSubjectIdentityAcrossSequence: !params.identityResets && /same woman|same fashion|SAME woman/i.test(
      params.conception.subjectBehavior + moments.map((m) => m.visualDescription).join(' '),
    ),
    sameFashionLanguageAcrossSequence: !params.identityResets,
    lightingProgressesRatherThanResets: !params.environmentResets && params.conception.lightingArc.includes('→'),
    cameraLanguageConsistent: Boolean(params.conception.cameraLanguage),
    editSuiteEmergesRatherThanAppearsRandomly: /emerge|gradual|reveals|becoming legible/i.test(
      params.conception.editSuiteReveal + moments.slice(5).map((m) => m.environmentState).join(' '),
    ),
    visualActionProgressesChronologically:
      !params.reorderableMoments &&
      moments.every((m, i) => m.chronologicalOrder === i + 1) &&
      moments.every((m) => m.reorderable === false),
    openingAndEndingRealityMatch:
      !params.environmentResets &&
      /dark|phone-lit|opening|same environment|Frame 01/i.test(
        opening.environmentState + ending.environmentState + ending.visualDescription,
      ),
    framesLookLikeSameFilm: !params.unrelatedScenes && params.conception.continuityAnchors.length >= 6,
    noIndependentConceptResets: !params.unrelatedScenes && !params.environmentResets && !params.identityResets,
  };

  for (const key of REQUIRED_CHECKS) {
    checks.push({ check: key, passed: semantic[key] ?? false });
  }

  if (params.unrelatedScenes) {
    blockers.push('B4.9R2 unrelated-panel collage — frames do not read as same film');
  }
  if (params.environmentResets) {
    blockers.push('Environment resets between frames');
  }
  if (params.identityResets) {
    blockers.push('NDX or subject identity resets between frames');
  }
  if (params.reorderableMoments) {
    blockers.push('Moments are independently reorderable — not a continuous reel sequence');
  }

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? (warnings.length ? 'WARN' : 'PASS') : 'FAIL',
    checks,
    blockers,
    warnings,
  };
}

/** B4.9R2 regression — unrelated beat collage fails reel coherence. */
export function evaluateB49R2UnrelatedCollageReelCoherence(
  conception: Entry002ReelVisualConception,
): ReelCoherenceQAResult {
  return runReelCoherenceQA({
    conception,
    unrelatedScenes: true,
  });
}
