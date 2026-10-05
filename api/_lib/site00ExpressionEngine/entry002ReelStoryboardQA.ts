/**
 * Sprint B4.4 — Entry 002 REEL storyboard QA (runReelStoryboardQA).
 */

import type {
  ReelStoryboard,
  ReelStoryboardQAResult,
} from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';

type CheckDef = {
  check: string;
  evaluate: (sb: ReelStoryboard) => boolean;
  severity: 'PASS' | 'WARN' | 'FAIL';
  failMessage?: string;
};

const QA_CHECKS: CheckDef[] = [
  {
    check: 'complete argument arc',
    evaluate: (sb) => {
      const beats = sb.panels.map((p) => p.argumentBeat);
      return (
        beats.includes('CLAIM') &&
        beats.includes('RECEIPT') &&
        beats.includes('CONTRADICTION') &&
        beats.includes('INTERJECTION') &&
        beats.includes('SYNTHESIS')
      );
    },
    severity: 'FAIL',
    failMessage: 'Argument arc missing required beats',
  },
  {
    check: 'subject appears early',
    evaluate: (sb) => {
      const early = sb.panels.filter((p) => p.panelNumber <= 3);
      return early.some(
        (p) =>
          p.fashionEvidence.length > 0 ||
          p.visualDescription.toLowerCase().includes('2016') ||
          p.visualDescription.toLowerCase().includes('baddie'),
      );
    },
    severity: 'FAIL',
    failMessage: '2016 IG baddie fashion subject not legible in first 3 panels',
  },
  {
    check: 'contradiction is visually clear',
    evaluate: (sb) => {
      const contradictionPanels = sb.panels.filter((p) => p.argumentBeat === 'CONTRADICTION');
      return contradictionPanels.some(
        (p) =>
          p.visualDescription.toLowerCase().includes('same') &&
          (p.textBehavior.includes('TACKY') || p.textBehavior.includes('ICONIC')),
      );
    },
    severity: 'FAIL',
    failMessage: 'Contradiction panels lack same-image relabel clarity',
  },
  {
    check: 'sequence progresses rather than repeats',
    evaluate: (sb) => {
      const purposes = sb.panels.map((p) => p.shotPurpose);
      const unique = new Set(purposes);
      return unique.size >= sb.panels.length - 2;
    },
    severity: 'FAIL',
    failMessage: 'Storyboard panels feel repetitive',
  },
  {
    check: 'phone has correct role',
    evaluate: (sb) => {
      const phoneRoles = sb.panels.map((p) => p.phoneRole.toLowerCase());
      const hasPortal = phoneRoles.some(
        (r) => r.includes('portal') || r.includes('evidence') || r.includes('archive'),
      );
      const noCommentWall = !phoneRoles.some(
        (r) => r.includes('comment wall') || r.includes('comment feed') || r.includes('comment graveyard'),
      );
      return hasPortal && noCommentWall;
    },
    severity: 'FAIL',
    failMessage: 'Phone role incorrect — must be evidence/portal not comment graveyard',
  },
  {
    check: 'edit suite enters at appropriate moment',
    evaluate: (sb) => {
      const firstSuite = sb.panels.findIndex((p) => {
        const behavior = p.editSuiteBehavior.toLowerCase();
        return (
          behavior.includes('edit suite') ||
          behavior.includes('suite depth') ||
          behavior.includes('suite world') ||
          behavior.includes('light table')
        ) && !behavior.includes('not entered');
      });
      return firstSuite >= 4 && firstSuite <= 6;
    },
    severity: 'FAIL',
    failMessage: 'Edit suite enters too early or too late',
  },
  {
    check: 'fashion specificity is maintained',
    evaluate: (sb) => {
      const allFashion = sb.panels.flatMap((p) => p.fashionEvidence).join(' ').toLowerCase();
      return (
        allFashion.includes('choker') ||
        allFashion.includes('bodycon') ||
        allFashion.includes('bomber') ||
        allFashion.includes('baddie')
      );
    },
    severity: 'FAIL',
    failMessage: 'Fashion specificity lost across panels',
  },
  {
    check: 'character continuity is plausible',
    evaluate: (sb) => {
      const nails = sb.panels.filter((p) => p.characterBehavior.toLowerCase().includes('lime'));
      return nails.length >= 3;
    },
    severity: 'WARN',
  },
  {
    check: 'text is restrained',
    evaluate: (sb) => {
      const textHeavy = sb.panels.filter(
        (p) => p.textBehavior.length > 80 && !p.textBehavior.includes('APOLOGY'),
      );
      return textHeavy.length <= 1;
    },
    severity: 'FAIL',
    failMessage: 'Too many text-heavy panels — reel must work without explanatory text everywhere',
  },
  {
    check: 'no Entry 001 broadcast repetition',
    evaluate: (sb) => {
      const joined = sb.panels.map((p) => p.continuityNotes + p.visualDescription).join(' ').toLowerCase();
      return !joined.includes('broadcast wall') && !joined.includes('comment graveyard');
    },
    severity: 'FAIL',
    failMessage: 'Entry 001 broadcast patterns detected',
  },
  {
    check: 'start / mid / end can be extracted logically',
    evaluate: (sb) => {
      const startCandidates = sb.panels.filter((p) => p.keyframeExtractionCandidate && p.panelNumber <= 3);
      const midCandidates = sb.panels.filter(
        (p) => p.keyframeExtractionCandidate && p.panelNumber >= 5 && p.panelNumber <= 8,
      );
      const endCandidates = sb.panels.filter((p) => p.keyframeExtractionCandidate && p.panelNumber >= 9);
      return startCandidates.length >= 1 && midCandidates.length >= 1 && endCandidates.length >= 1;
    },
    severity: 'FAIL',
    failMessage: 'Cannot extract START/MID/END keyframes from storyboard panels',
  },
  {
    check: 'audio progression exists',
    evaluate: (sb) => {
      const cues = sb.panels.map((p) => p.audioFoleyCue);
      const unique = new Set(cues);
      return unique.size >= sb.panels.length - 2;
    },
    severity: 'WARN',
  },
  {
    check: 'reel can be understood without every frame containing text',
    evaluate: (sb) => {
      const noText = sb.panels.filter((p) => p.textBehavior.toLowerCase().includes('none'));
      return noText.length >= 2;
    },
    severity: 'WARN',
  },
  {
    check: 'not just 3 polished images',
    evaluate: (sb) => sb.panels.length >= 8,
    severity: 'FAIL',
    failMessage: 'Storyboard is just 3 polished images — need 8–12 panel sequence',
  },
];

export function runReelStoryboardQA(storyboard: ReelStoryboard): ReelStoryboardQAResult {
  const checks = QA_CHECKS.map((def) => {
    const passed = def.evaluate(storyboard);
    return {
      check: def.check,
      passed,
      severity: passed ? ('PASS' as const) : def.severity,
    };
  });

  const blockers = checks
    .filter((c) => !c.passed && c.severity === 'FAIL')
    .map((c) => QA_CHECKS.find((d) => d.check === c.check)?.failMessage ?? c.check);

  const failCount = checks.filter((c) => !c.passed && c.severity === 'FAIL').length;
  const warnCount = checks.filter((c) => !c.passed && c.severity === 'WARN').length;

  let result: ReelStoryboardQAResult['result'] = 'PASS';
  if (failCount > 0) result = 'FAIL';
  else if (warnCount > 0) result = 'WARN';

  return {
    passed: failCount === 0,
    checks,
    blockers,
    result,
  };
}
