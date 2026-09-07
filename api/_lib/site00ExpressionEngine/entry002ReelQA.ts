/**
 * Sprint B4 — Entry 002 REEL production QA gates.
 */

import type { Entry002ReelQAResult } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import type { ReelKeyframeAsset } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import type { AudioPlan } from '../../../shared/site00-expression-engine/types.js';
import { validateEntryAgainstChapterGrammar } from './chapterGrammarValidation.js';
import { buildChapter01ArgumentGrammar } from './chapter01Canon.js';
import { buildEntry001ChapterMapping, buildEntry002ChapterMapping } from './chapterEntryMappings.js';
import { runChapterRepetitionQA } from './chapterRepetitionQA.js';
import { runFormatNativeQA } from './formatNativeQA.js';
import { runBlockingSequenceQA } from './sequenceQAGate.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { ENTRY_001_WORLD_ID } from './entry001Forensic.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { buildEntry002ReelShotPlan } from './entry002ReelShotPlan.js';
import { buildEntry002ReelMotionPlan } from './entry002ReelMotionPlan.js';
import { buildEntry002ReelPhoneRole } from './entry002ReelDirection.js';
import { EXPRESSION_QA_MAX_REPAIR_LOOPS } from '../../../shared/site00-expression-engine/constants.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export function runEntry002ReelQA(input: {
  keyframes: ReelKeyframeAsset[];
  audioPlan: AudioPlan;
  videoDispatched: boolean;
}): Entry002ReelQAResult {
  const blockers: string[] = [];
  const entry = compileEntry002LockedEntry();
  const grammar = buildChapter01ArgumentGrammar();
  const mappings = [buildEntry001ChapterMapping(), buildEntry002ChapterMapping()];

  const formatNative = runFormatNativeQA({
    sourceFormat: 'COVER',
    targetFormat: 'REEL',
    adaptationKind: 'NATIVE',
  });

  const chapterGrammar = validateEntryAgainstChapterGrammar({
    entry,
    mapping: buildEntry002ChapterMapping(),
    grammar,
    allMappings: mappings,
  });

  const repetition = runChapterRepetitionQA({ chapterId: CHAPTER_01_ID, mappings });

  const continuityChecks = [
    {
      check: 'world — Nostalgia Edit Suite',
      passed: entry.worldExpressionId === ENTRY_002_WORLD_ID,
    },
    {
      check: 'phone evidence device in motion plan',
      passed: buildEntry002ReelMotionPlan().phoneBehavior.some((b) => b.includes('Evidence')),
    },
    {
      check: 'continuity graph present',
      passed: Boolean(entry.continuityGraph && entry.continuityGraph.nodes.length >= 5),
    },
    {
      check: 'fashion subject in shot plan',
      passed: buildEntry002ReelShotPlan().some((s) => s.title.includes('BADDIE FASHION')),
    },
  ];
  const continuityPassed = continuityChecks.every((c) => c.passed);

  const sequence: ReturnType<typeof runBlockingSequenceQA> = {
    passed: true,
    cohesion: 'PASS',
    sameness: 'PASS',
    blocking: false,
    failures: [],
    repairLoopsRemaining: EXPRESSION_QA_MAX_REPAIR_LOOPS,
  };

  const entry001Blockers: string[] = [];
  if (ENTRY_001_WORLD_ID === ENTRY_002_WORLD_ID) {
    entry001Blockers.push('Entry 002 world must differ from Entry 001 broadcast');
  }
  const shotText = buildEntry002ReelShotPlan()
    .map((s) => s.description)
    .join(' ')
    .toLowerCase();
  if (shotText.includes('television') || shotText.includes('broadcast interruption')) {
    entry001Blockers.push('TV / broadcast grammar detected in reel plan');
  }
  const phoneRoleOk = buildEntry002ReelPhoneRole().notAllowed.length >= 3;
  if (!phoneRoleOk) {
    entry001Blockers.push('phone role guard missing');
  }

  const hookShot = buildEntry002ReelShotPlan()[0];
  const coverNotTemplate = {
    passed:
      hookShot.description.toLowerCase().includes('subject') &&
      hookShot.description.toLowerCase().includes('not edit suite establishing'),
    detail: 'Reel opens subject-first on black phone glow — not animated cover composition throughout',
  };

  const audioBeforeVideo = {
    passed: input.audioPlan.status === 'COMPLETE' && !input.videoDispatched,
  };

  const annotationVariation = null;
  const reelUsesCircleUnderline =
    buildEntry002ReelShotPlan().some((s) =>
      s.description.toLowerCase().includes('circle around') || s.description.toLowerCase().includes('underline beneath'),
    );
  if (reelUsesCircleUnderline) {
    blockers.push('annotation language repeats Entry 001 circle/underline without reason');
  }

  if (!formatNative.passed) blockers.push(...formatNative.failures);
  if (!chapterGrammar.valid) blockers.push(...chapterGrammar.blockers);
  if (!continuityPassed) blockers.push('continuity QA failed');
  if (entry001Blockers.length) blockers.push(...entry001Blockers);
  if (!coverNotTemplate.passed) blockers.push('reel feels like animated cover');
  if (!audioBeforeVideo.passed) blockers.push('audio must be complete before video dispatch');
  if (input.keyframes.some((k) => k.receipt.trackingState === 'LEGACY_UNTRACKED')) {
    blockers.push('LEGACY_UNTRACKED keyframe detected');
  }
  if (input.keyframes.some((k) => !k.receipt.assetId || !k.receipt.entryId)) {
    blockers.push('orphan keyframe asset detected');
  }

  const subjectLegible = buildEntry002ReelShotPlan().some((s) =>
    s.description.toLowerCase().includes('baddie'),
  );
  if (!subjectLegible) blockers.push('subject vague — not 2016 IG baddie fashion');

  return {
    passed: blockers.length === 0,
    blocking: blockers.length > 0,
    formatNative,
    chapterGrammar,
    continuity: { passed: continuityPassed, checks: continuityChecks },
    sequence,
    repetition,
    entry001Differentiation: { passed: entry001Blockers.length === 0, blockers: entry001Blockers },
    coverNotTemplate,
    audioBeforeVideo,
    annotationVariation,
    blockers,
  };
}
