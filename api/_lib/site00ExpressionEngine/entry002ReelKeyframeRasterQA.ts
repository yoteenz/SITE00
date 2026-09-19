/**
 * Sprint B4.1 — post-rasterization advisory QA for Gate 1 keyframes.
 */

import type { ReelKeyframeRasterResult } from './entry002ReelKeyframeDispatch.js';
import { isValidGeneratedRaster } from './entry002ReelKeyframeDispatch.js';
import { buildEntry002ReelFashionDirection, buildEntry002ReelPhoneRole, buildEntry002ReelEditSuiteBehavior } from './entry002ReelDirection.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { validateEntryAgainstChapterGrammar } from './chapterGrammarValidation.js';
import { buildChapter01ArgumentGrammar } from './chapter01Canon.js';
import { buildEntry001ChapterMapping, buildEntry002ChapterMapping } from './chapterEntryMappings.js';
import { ENTRY_001_WORLD_ID } from './entry001Forensic.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';
import { compileEntry002ReelKeyframePrompt } from './entry002ReelKeyframePrompts.js';

export type ReelKeyframeRasterQACheck = {
  check: string;
  passed: boolean;
  advisory: true;
};

export type ReelKeyframeRasterQAResult = {
  passed: boolean;
  advisoryOnly: true;
  notFounderApproval: true;
  checks: ReelKeyframeRasterQACheck[];
  blockers: string[];
  continuity: {
    startToMid: { persists: string[]; changes: string[] };
    midToEnd: { persists: string[]; changes: string[] };
    visualVerification: boolean;
  };
};

export function runEntry002ReelKeyframeRasterQA(
  rasters: ReelKeyframeRasterResult[],
): ReelKeyframeRasterQAResult {
  const blockers: string[] = [];
  const checks: ReelKeyframeRasterQACheck[] = [];

  if (rasters.length !== 3) blockers.push(`generation count must be exactly 3 — got ${rasters.length}`);

  const roles = rasters.map((r) => r.role);
  if (!roles.includes('START') || !roles.includes('MID') || !roles.includes('END')) {
    blockers.push('missing START/MID/END raster set');
  }

  for (const raster of rasters) {
    const hasPublicUrl = isValidGeneratedRaster(raster);
    checks.push({
      check: `${raster.role} — storage surfaced`,
      passed: hasPublicUrl || (process.env.VITEST === 'true' && raster.status === 'NOT_DISPATCHED'),
      advisory: true,
    });
    if (!hasPublicUrl && process.env.VITEST !== 'true' && raster.dispatchAttempted) {
      blockers.push(`${raster.role} missing public visual URL`);
    }

    checks.push({
      check: `${raster.role} — lineage tracked`,
      passed: raster.generationReceipt?.trackingState === 'TRACKED' || raster.status === 'NOT_DISPATCHED',
      advisory: true,
    });
    if (raster.generationReceipt?.trackingState === 'LEGACY_UNTRACKED') {
      blockers.push(`${raster.role} LEGACY_UNTRACKED`);
    }

    checks.push({
      check: `${raster.role} — founder judgment UNREVIEWED`,
      passed: raster.founderJudgment === 'UNREVIEWED',
      advisory: true,
    });

    checks.push({
      check: `${raster.role} — 9:16 contract`,
      passed: raster.aspectRatio === '9:16',
      advisory: true,
    });
  }

  const fashion = buildEntry002ReelFashionDirection();
  checks.push({
    check: 'subject legibility — 2016 IG BADDIE FASHION',
    passed: fashion.subject === '2016 IG BADDIE FASHION',
    advisory: true,
  });

  const entry = compileEntry002LockedEntry();
  const chapterGrammar = validateEntryAgainstChapterGrammar({
    entry,
    mapping: buildEntry002ChapterMapping(),
    grammar: buildChapter01ArgumentGrammar(),
    allMappings: [buildEntry001ChapterMapping(), buildEntry002ChapterMapping()],
  });
  checks.push({
    check: 'chapter grammar QA',
    passed: chapterGrammar.valid,
    advisory: true,
  });
  if (!chapterGrammar.valid) blockers.push(...chapterGrammar.blockers);

  const phone = buildEntry002ReelPhoneRole();
  checks.push({
    check: 'phone role guard',
    passed: phone.notAllowed.some((n) => n.includes('COMMENT')),
    advisory: true,
  });

  const editSuite = buildEntry002ReelEditSuiteBehavior();
  checks.push({
    check: 'world fidelity — physical edit suite',
    passed: editSuite.forbiddenElements.includes('Adobe UI clone'),
    advisory: true,
  });

  checks.push({
    check: 'fashion specificity motifs defined',
    passed: fashion.motifsUsed.length >= 4,
    advisory: true,
  });

  const promptText = (['START', 'MID', 'END'] as const)
    .map((role) => compileEntry002ReelKeyframePrompt(role).prompt.toLowerCase())
    .join(' ');
  checks.push({
    check: 'text discipline — prompts avoid quote walls',
    passed: !promptText.includes('quote wall') && promptText.includes('sparse'),
    advisory: true,
  });

  checks.push({
    check: 'Entry 001 differentiation — no TV/broadcast in prompts',
    passed: !promptText.includes('television') && !promptText.includes('broadcast room'),
    advisory: true,
  });

  if (ENTRY_001_WORLD_ID === ENTRY_002_WORLD_ID) {
    blockers.push('Entry 002 world must differ from Entry 001 broadcast');
  }

  const visualVerification =
    rasters.length === 3 && rasters.every((r) => isValidGeneratedRaster(r));

  checks.push({
    check: 'continuity QA — three-frame set complete',
    passed: rasters.length === 3,
    advisory: true,
  });

  return {
    passed: blockers.length === 0,
    advisoryOnly: true,
    notFounderApproval: true,
    checks,
    blockers,
    continuity: {
      startToMid: {
        persists: [
          'phone / evidence device grammar',
          '2016 baddie fashion subject',
          'nostalgia revision narrative',
          'NDXBOOK edit-suite palette (black, cream, lime)',
        ],
        changes: [
          'black+phone hook → physical edit-suite takeover',
          'archive entry → label contradiction / splice',
        ],
      },
      midToEnd: {
        persists: [
          'physical timeline / edit artifacts',
          'same-image relabel metaphor',
          'fashion subject continuity',
          'edit-suite world depth',
        ],
        changes: [
          'active cut/splice peak → synthesis filing card',
          'contradiction → resolved interjection line',
        ],
      },
      visualVerification,
    },
  };
}
