/**
 * Sprint B3 — pre/post anchor QA gates.
 */

import type {
  Entry002AnchorQAResult,
  Entry002PreAnchorQAResult,
  Entry002AnchorCompositionRoute,
} from '../../../shared/site00-expression-engine/anchorTypes.js';
import type { CreativeEntry } from '../../../shared/site00-expression-engine/types.js';
import { runEntry002ConceptCollapseGate } from './entry002Territories.js';
import { validateEntryAgainstChapterGrammar } from './chapterGrammarValidation.js';
import { buildEntry002ChapterMapping, buildEntry001ChapterMapping } from './chapterEntryMappings.js';
import { buildChapter01ArgumentGrammar } from './chapter01Canon.js';
import { runChapterRepetitionQA } from './chapterRepetitionQA.js';
import { runFormatNativeQA } from './formatNativeQA.js';
import { ENTRY_001_WORLD_ID } from './entry001Forensic.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';

export function runPreAnchorQAGates(entry: CreativeEntry): Entry002PreAnchorQAResult {
  const grammar = buildChapter01ArgumentGrammar();
  const mappings = [buildEntry001ChapterMapping(), buildEntry002ChapterMapping()];
  const entry002Mapping = buildEntry002ChapterMapping();

  const formatNativeQA = runFormatNativeQA({
    sourceFormat: 'COVER',
    targetFormat: 'COVER',
    adaptationKind: 'NATIVE',
  });

  const chapterGrammarValidation = validateEntryAgainstChapterGrammar({
    entry,
    mapping: entry002Mapping,
    grammar,
    allMappings: mappings,
  });

  const chapterRepetitionQA = runChapterRepetitionQA({
    chapterId: grammar.chapterId,
    mappings,
  });

  const collapse = runEntry002ConceptCollapseGate();

  const entry001DifferentiationPassed = ENTRY_001_WORLD_ID !== ENTRY_002_WORLD_ID;

  const passed =
    formatNativeQA.passed &&
    chapterGrammarValidation.valid &&
    chapterRepetitionQA.passed &&
    collapse.passed &&
    entry001DifferentiationPassed;

  return {
    passed,
    formatNativeQA,
    chapterGrammarValidation,
    chapterRepetitionQA,
    conceptCollapsePassed: collapse.passed,
    entry001DifferentiationPassed,
  };
}

export function evaluateEntry002AnchorQA(route: Entry002AnchorCompositionRoute): Entry002AnchorQAResult {
  const checks = [
    {
      check: 'subject legibility — 2016 Instagram baddie fashion',
      passed: route.fashionEvidence.length >= 3 && route.focalMechanism.toLowerCase().includes('2016'),
    },
    {
      check: 'premise legibility — cultural reframe',
      passed:
        route.focalMechanism.toLowerCase().includes('edit') ||
        route.editSuiteBehavior.toLowerCase().includes('label') ||
        route.editSuiteBehavior.toLowerCase().includes('timeline'),
    },
    {
      check: 'world fidelity — physical cinematic edit suite',
      passed:
        !route.editSuiteBehavior.toLowerCase().includes('software') &&
        route.editSuiteBehavior.toLowerCase().includes('physical'),
    },
    {
      check: 'phone role — evidence not world',
      passed:
        route.phoneBehavior.toLowerCase().includes('evidence') ||
        route.phoneBehavior.toLowerCase().includes('archived') ||
        route.phoneBehavior.toLowerCase().includes('table'),
    },
    {
      check: 'text discipline — sparse intentional copy',
      passed: route.visibleCopy.length <= 6 && route.marginalInterjection.length > 0,
    },
    {
      check: 'Entry 001 differentiation — no broadcast/TV grammar',
      passed: !route.focalMechanism.toLowerCase().includes('television'),
    },
    {
      check: 'chapter grammar — contradiction embodied',
      passed: route.focalMechanism.toLowerCase().includes('fashion') || route.focalMechanism.includes('2016'),
    },
    {
      check: 'artifact supports argument',
      passed: route.artifactBehavior.toLowerCase().includes('razor') || route.artifactBehavior.toLowerCase().includes('timeline'),
    },
  ];

  const blockers = checks.filter((c) => !c.passed).map((c) => c.check);

  return {
    passed: blockers.length === 0,
    checks,
    blockers,
  };
}

export function downstreamProductionBlocked(): Record<string, 'BLOCKED_PENDING_ANCHOR_APPROVAL'> {
  return {
    REEL: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    CAROUSEL: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    STORY: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    CTA_STORY: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    HIGHLIGHT: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    TIKTOK: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
    X: 'BLOCKED_PENDING_ANCHOR_APPROVAL',
  };
}
