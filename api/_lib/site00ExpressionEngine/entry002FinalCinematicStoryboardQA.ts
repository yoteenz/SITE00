/**
 * Sprint B4.9 — Final cinematic storyboard continuity QA.
 */

import type { FinalCinematicStoryboardQAResult } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

export function runFinalCinematicStoryboardQA(
  brief: FinalCinematicStoryboardBrief,
): FinalCinematicStoryboardQAResult {
  const checks: FinalCinematicStoryboardQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  checks.push({
    check: 'panel count in 12–16 range',
    passed: brief.panels.length >= 12 && brief.panels.length <= 16,
  });
  if (brief.panels.length !== FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT) {
    warnings.push(`Panel count ${brief.panels.length} (target ${FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT})`);
  }

  checks.push({
    check: 'all five authority IDs consumed',
    passed: brief.authorityIds.length === 5,
  });

  checks.push({
    check: 'historical cinematic sequence excluded',
    passed: brief.historicalSequenceExcluded === 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001',
  });

  checks.push({
    check: 'nail continuity contract present',
    passed:
      brief.characterFirewall.ndxNails === 'SHORT_LIME_GREEN' &&
      brief.characterFirewall.subjectNails === 'FRENCH_TIPS',
  });

  checks.push({
    check: 'full-body phone content requirement',
    passed: brief.phoneContentRules.framing === 'FULL_BODY_OUTFIT_LED',
  });

  checks.push({
    check: 'pose variation requirement',
    passed: brief.phoneContentRules.poseVariation === true,
  });

  const narrativeText = brief.panels
    .map((p) => `${p.panelTitle} ${p.visualDescription} ${p.ndxPresence} ${p.subjectWomanPresence}`)
    .join(' ');
  checks.push({
    check: '2016 old Instagram landing present',
    passed: narrativeText.toLowerCase().includes('2016') && narrativeText.toLowerCase().includes('instagram'),
  });

  checks.push({
    check: 'memory lifts from phone',
    passed: narrativeText.toLowerCase().includes('lift') || narrativeText.toLowerCase().includes('dimensionally'),
  });

  checks.push({
    check: '2016 negative receipts present',
    passed: narrativeText.includes('TACKY') && narrativeText.includes('BASIC'),
  });

  checks.push({
    check: 'mandatory interjection present',
    passed: brief.panels.some((p) => p.mandatoryText?.includes('THE CLOTHES NEVER GOT AN APOLOGY')),
  });

  checks.push({
    check: 'snap-back beat present',
    passed: brief.panels.some((p) => p.panelTitle.toLowerCase().includes('snap-back')),
  });

  checks.push({
    check: 'NDX partial presence preserved',
    passed: brief.panels.every((p) => p.ndxPresence.toLowerCase().includes('partial') || p.ndxPresence.toLowerCase().includes('macro') || p.ndxPresence.toLowerCase().includes('hand') || p.ndxPresence.toLowerCase().includes('silhouette') || p.ndxPresence.toLowerCase().includes('over-shoulder') || p.ndxPresence.toLowerCase().includes('observer')),
  });

  checks.push({
    check: 'Entry 003 not invented',
    passed: !/\bentry[\s-]?003\b/i.test(narrativeText),
  });

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  if (brief.authorityAssetUrls.length < 5) {
    warnings.push('Fewer than 5 authority reference assets available for conditioning');
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? (warnings.length ? 'WARN' : 'PASS') : 'FAIL',
    checks,
    blockers,
    warnings,
  };
}
