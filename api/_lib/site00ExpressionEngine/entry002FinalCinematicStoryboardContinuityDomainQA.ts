/**
 * Sprint B4.9R — Per-domain continuity QA for final cinematic storyboard.
 */

import type {
  FinalCinematicStoryboardPanelManifestEntry,
  StoryboardContinuityDomainQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

export function runStoryboardContinuityDomainQA(
  manifest: FinalCinematicStoryboardPanelManifestEntry[],
): StoryboardContinuityDomainQAResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const ndxHandPanels = manifest.filter((p) =>
    /hand|macro|lime|tap|scroll|stitch|extract|nail/i.test(p.ndxVisibility),
  );
  const ndxHandsPass =
    ndxHandPanels.length > 0 &&
    manifest.some((p) => /lime/i.test(p.ndxVisibility + p.continuityRequirements.join(' ')));

  const subjectPanels = manifest.filter((p) => p.subjectVisibility && p.subjectVisibility !== 'absent');
  const subjectIdentityPass =
    subjectPanels.some((p) => /same woman|full-body|full body/i.test(p.description)) &&
    manifest.some((p) => p.beatId === '2016_LANDING');

  const domains: StoryboardContinuityDomainQAResult['domains'] = {
    NDX_PRESENCE: manifest.every(
      (p) =>
        /partial|hand|macro|silhouette|over-shoulder|absent|edge|reflection|lime|tap|nail|observer|assembler|stitch|scroll|extract/i.test(
          p.ndxVisibility,
        ),
    )
      ? 'PASS'
      : 'FAIL',
    SUBJECT_IDENTITY: subjectIdentityPass ? 'PASS' : 'FAIL',
    NDX_HANDS: ndxHandsPass ? 'PASS' : 'FAIL',
    SUBJECT_FASHION:
      manifest.some((p) => /bodycon|fashion|outfit/i.test(p.description)) ? 'PASS' : 'FAIL',
    PHONE_GLITCH:
      manifest.some((p) => /phone|glitch|fracture|crack/i.test(p.phoneState + p.description))
        ? 'PASS'
        : 'WARN',
    ERA_CONTINUITY:
      manifest.some((p) => p.era === '2016') && manifest.some((p) => p.era === '2026')
        ? 'PASS'
        : 'FAIL',
    NARRATIVE_SEQUENCE:
      manifest.some((p) => p.beatId === 'DISCOVERY') && manifest.some((p) => p.beatId === 'SNAP_BACK')
        ? 'PASS'
        : 'FAIL',
  };

  for (const [domain, status] of Object.entries(domains)) {
    if (status === 'FAIL') blockers.push(`${domain} continuity failed`);
    if (status === 'WARN') warnings.push(`${domain} continuity warning`);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? (warnings.length ? 'WARN' : 'PASS') : 'FAIL',
    domains,
    blockers,
    warnings,
  };
}
