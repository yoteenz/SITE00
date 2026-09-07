/**
 * Sprint B4.5 — Cinematic visual sequence QA.
 */

import type {
  CinematicVisualSequenceBoard,
  CinematicSequenceQAResult,
} from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';

type CheckDef = {
  check: string;
  evaluate: (seq: CinematicVisualSequenceBoard) => boolean;
  severity: 'PASS' | 'WARN' | 'FAIL';
  failMessage?: string;
};

const QA_CHECKS: CheckDef[] = [
  {
    check: 'complete argument arc',
    evaluate: (s) => {
      const beats = s.frames.map((f) => f.argumentBeat);
      return (
        beats.includes('CLAIM') &&
        beats.includes('RECEIPT') &&
        beats.includes('CONTRADICTION') &&
        beats.includes('INTERJECTION') &&
        beats.includes('SYNTHESIS')
      );
    },
    severity: 'FAIL',
  },
  {
    check: 'not sketch storyboard style',
    evaluate: (s) => s.visualStyle === 'CINEMATIC_VISUAL_DEVELOPMENT',
    severity: 'FAIL',
    failMessage: 'Visual style must be cinematic development not sketch storyboard',
  },
  {
    check: 'subject appears early',
    evaluate: (s) => {
      const early = s.frames.filter((f) => f.frameNumber <= 3);
      return early.some((f) => f.fashionEvidence.length > 0 || f.phoneRole.includes('evidence'));
    },
    severity: 'FAIL',
  },
  {
    check: 'edit suite not computer workstation',
    evaluate: (s) => {
      const joined = s.frames.map((f) => f.editSuiteBehavior + f.visualDescription).join(' ').toLowerCase();
      const banned = [
        'premiere pro',
        'final cut pro',
        'desktop monitor editing ui',
        'computer editing workstation',
        'editing a video on a computer',
      ];
      return !banned.some((b) => joined.includes(b));
    },
    severity: 'FAIL',
    failMessage: 'Edit suite must be surreal physical world not desktop editing software',
  },
  {
    check: 'edit suite enters at appropriate moment',
    evaluate: (s) => {
      const first = s.frames.findIndex((f) =>
        f.editSuiteBehavior.toLowerCase().includes('light table') ||
        f.editSuiteBehavior.toLowerCase().includes('edit suite') ||
        f.visualDescription.toLowerCase().includes('edit suite'),
      );
      return first >= 4 && first <= 6;
    },
    severity: 'FAIL',
  },
  {
    check: 'contradiction visually clear',
    evaluate: (s) =>
      s.frames.some(
        (f) =>
          f.visualDescription.toLowerCase().includes('same') &&
          (f.textBehavior.includes('TACKY') || f.textBehavior.includes('ICONIC')),
      ),
    severity: 'FAIL',
  },
  {
    check: 'short lime nails enforced',
    evaluate: (s) => {
      const nailRefs = s.frames.filter((f) =>
        f.characterPresence.toLowerCase().includes('lime') ||
        f.visualDescription.toLowerCase().includes('lime nail'),
      );
      return nailRefs.length >= 3;
    },
    severity: 'FAIL',
    failMessage: 'Short lime nails must appear consistently',
  },
  {
    check: 'visual rhythm varies',
    evaluate: (s) => {
      const cameras = s.frames.map((f) => f.cameraBehavior);
      const unique = new Set(cameras);
      return unique.size >= s.frames.length - 3;
    },
    severity: 'WARN',
  },
  {
    check: 'not 10 identical compositions',
    evaluate: (s) => {
      const purposes = s.frames.map((f) => f.shotPurpose);
      return new Set(purposes).size >= s.frames.length - 2;
    },
    severity: 'FAIL',
    failMessage: 'Sequence must progress — not 10 portraits or 10 phone shots',
  },
  {
    check: 'continuity references registered',
    evaluate: (s) => s.continuityReferences.some((b) => b.resolved),
    severity: 'WARN',
  },
  {
    check: 'keyframe extraction candidates exist',
    evaluate: (s) => {
      const start = s.frames.filter((f) => f.keyframeExtractionCandidate && f.frameNumber <= 3);
      const mid = s.frames.filter((f) => f.keyframeExtractionCandidate && f.frameNumber >= 5 && f.frameNumber <= 8);
      const end = s.frames.filter((f) => f.keyframeExtractionCandidate && f.frameNumber >= 9);
      return start.length >= 1 && mid.length >= 1 && end.length >= 1;
    },
    severity: 'FAIL',
  },
  {
    check: 'text discipline',
    evaluate: (s) => {
      const noText = s.frames.filter((f) => f.textBehavior === 'None');
      return noText.length >= 2;
    },
    severity: 'WARN',
  },
  {
    check: 'frame count in range',
    evaluate: (s) => s.frames.length >= 8 && s.frames.length <= 10,
    severity: 'FAIL',
  },
];

export function runCinematicVisualSequenceQA(
  sequence: CinematicVisualSequenceBoard,
): CinematicSequenceQAResult {
  const checks = QA_CHECKS.map((def) => ({
    check: def.check,
    passed: def.evaluate(sequence),
    severity: (def.evaluate(sequence) ? 'PASS' : def.severity) as 'PASS' | 'WARN' | 'FAIL',
  }));

  const blockers = checks
    .filter((c) => !c.passed && c.severity === 'FAIL')
    .map((c) => QA_CHECKS.find((d) => d.check === c.check)?.failMessage ?? c.check);

  const failCount = checks.filter((c) => !c.passed && c.severity === 'FAIL').length;
  const warnCount = checks.filter((c) => !c.passed && c.severity === 'WARN').length;

  let result: CinematicSequenceQAResult['result'] = 'PASS';
  if (failCount > 0) result = 'FAIL';
  else if (warnCount > 0) result = 'WARN';

  return { passed: failCount === 0, checks, blockers, result };
}
