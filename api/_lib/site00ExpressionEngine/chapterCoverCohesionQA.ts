/**
 * Sprint B3.1 — chapter-level cover cohesion QA.
 * Validates presentation grammar consistency without freezing entry-specific variation.
 */

import type {
  ChapterCoverCohesionQAResult,
  EntryCoverPresentationSpec,
} from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import {
  buildChapter01CoverPresentationGrammar,
  buildEntry001CoverPresentationSpec,
  buildEntry002FounderCoverPresentationSpec,
  getChapter01EntryCoverSpecs,
} from './chapterCoverPresentationGrammar.js';

function annotationSignature(spec: EntryCoverPresentationSpec): string {
  return spec.annotations.map((a) => a.type).sort().join('|') || 'NONE';
}

function artifactClass(spec: EntryCoverPresentationSpec): string {
  return spec.heroArtifact.artifactClass;
}

function hasEnvironmentalComposition(spec: EntryCoverPresentationSpec): boolean {
  return !spec.heroArtifact.isolated || !spec.heroArtifact.noEnvironmentVisible;
}

function hasExcessiveText(spec: EntryCoverPresentationSpec): boolean {
  const headlineWords = spec.headline.fullText.split(/\s+/).length;
  const annotationCount = spec.annotations.length;
  return headlineWords > 12 || annotationCount > 3;
}

function isGraphicFlyerPattern(spec: EntryCoverPresentationSpec): boolean {
  const desc = spec.heroArtifact.contentDescription?.toLowerCase() ?? '';
  return (
    desc.includes('edit suite environment') ||
    desc.includes('room visible') ||
    desc.includes('foreground props') ||
    (!spec.heroArtifact.isolated && spec.background !== 'PURE_BLACK')
  );
}

function hierarchyConsistent(spec: EntryCoverPresentationSpec): boolean {
  const expected = ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'];
  return spec.hierarchyOrder.every((h, i) => h === expected[i]);
}

function lowerIdentityConsistent(spec: EntryCoverPresentationSpec): boolean {
  return (
    spec.entryLabel.startsWith('ENTRY ') &&
    spec.entryLabelUnderline === 'HAND_DRAWN_LIME' &&
    spec.subjectLabel.length > 0 &&
    spec.bottomLogo === false
  );
}

export function validateCoverAgainstGrammar(
  spec: EntryCoverPresentationSpec,
): ChapterCoverCohesionQAResult {
  const checks: ChapterCoverCohesionQAResult['checks'] = [];
  const grammar = buildChapter01CoverPresentationGrammar();

  checks.push({
    check: 'black field required',
    passed: spec.background === 'PURE_BLACK' || spec.background === 'NEAR_PURE_BLACK',
    severity: 'CONSISTENT',
  });
  checks.push({
    check: '9:16 aspect',
    passed: spec.aspect === grammar.constants.aspect,
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'artifact-first — isolated hero on black',
    passed: spec.heroArtifact.isolated && spec.heroArtifact.noEnvironmentVisible,
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'lime glow family',
    passed: spec.heroArtifact.limeGlow === 'EDGE_UNDERGLOW',
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'typography hierarchy — cream display headline',
    passed: spec.headline.style === 'CREAM_CONDENSED_DISPLAY_DISTRESSED',
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'entry metadata placement',
    passed: hierarchyConsistent(spec) && lowerIdentityConsistent(spec),
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'negative space — pure black background',
    passed: spec.background === 'PURE_BLACK',
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'cinematic object treatment',
    passed: spec.heroArtifact.tactileQualities.length >= 4,
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'no NDX logo at bottom',
    passed: spec.bottomLogo === false,
    severity: 'CONSISTENT',
  });
  checks.push({
    check: 'annotation remains entry-specific',
    passed: spec.annotations.length >= 1,
    severity: 'VARIABLE',
    detail: `annotation type: ${annotationSignature(spec)}`,
  });
  checks.push({
    check: 'artifact class varies per entry',
    passed: Boolean(spec.heroArtifact.artifactClass),
    severity: 'VARIABLE',
    detail: `artifact: ${artifactClass(spec)}`,
  });

  if (hasEnvironmentalComposition(spec)) {
    checks.push({
      check: 'environment must not overwhelm artifact',
      passed: false,
      severity: 'BLOCK',
      detail: 'Environmental composition detected — cover reads as room/scene not isolated artifact',
    });
  }
  if (isGraphicFlyerPattern(spec)) {
    checks.push({
      check: 'cover must not become graphic flyer',
      passed: false,
      severity: 'BLOCK',
    });
  }
  if (hasExcessiveText(spec)) {
    checks.push({
      check: 'text discipline — sparse intentional copy',
      passed: false,
      severity: 'BLOCK',
    });
  }

  const blockers = checks.filter((c) => !c.passed && c.severity === 'BLOCK').map((c) => c.check);
  const warnings = checks.filter((c) => !c.passed && c.severity === 'WARN').map((c) => c.check);

  return {
    chapterId: CHAPTER_01_ID,
    passed: blockers.length === 0,
    blocking: blockers.length > 0,
    checks,
    blockers,
    warnings,
  };
}

export function runChapterCoverCohesionQA(input?: {
  covers?: EntryCoverPresentationSpec[];
  founderApprovedAnnotationReuse?: string[];
}): ChapterCoverCohesionQAResult {
  const covers = input?.covers ?? getChapter01EntryCoverSpecs();
  const founderApproved = input?.founderApprovedAnnotationReuse ?? [];
  const allChecks: ChapterCoverCohesionQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const cover of covers) {
    const result = validateCoverAgainstGrammar(cover);
    allChecks.push(...result.checks.map((c) => ({ ...c, detail: `${cover.entryId}: ${c.detail ?? c.check}` })));
    blockers.push(...result.blockers.map((b) => `${cover.entryId}: ${b}`));
    warnings.push(...result.warnings.map((w) => `${cover.entryId}: ${w}`));
  }

  const artifactClasses = covers.map(artifactClass);
  const uniqueArtifacts = new Set(artifactClasses);
  if (uniqueArtifacts.size < artifactClasses.length) {
    blockers.push('BLOCK: entry copies another entry artifact');
    allChecks.push({
      check: 'unique artifact per entry',
      passed: false,
      severity: 'BLOCK',
      detail: `duplicate artifacts: ${artifactClasses.join(', ')}`,
    });
  } else {
    allChecks.push({
      check: 'unique artifact per entry',
      passed: true,
      severity: 'VARIABLE',
    });
  }

  const annotationSigs = covers.map((c) => `${c.entryId}:${annotationSignature(c)}`);
  const sigValues = covers.map(annotationSignature);
  const uniqueSigs = new Set(sigValues);
  if (uniqueSigs.size < sigValues.length) {
    const label = 'BLOCK: entry copies another entry annotation pattern';
    if (!founderApproved.includes('ANNOTATION_PATTERN_REUSE')) {
      blockers.push(label);
      allChecks.push({
        check: 'unique annotation pattern per entry',
        passed: false,
        severity: 'BLOCK',
        detail: annotationSigs.join('; '),
      });
    } else {
      warnings.push('WARN: duplicated annotation pattern — founder approved');
    }
  } else {
    allChecks.push({
      check: 'unique annotation pattern per entry',
      passed: true,
      severity: 'VARIABLE',
      detail: annotationSigs.join('; '),
    });
  }

  for (const cover of covers) {
    if (cover.entryNumber === 1) {
      const e1 = buildEntry001CoverPresentationSpec();
      if (cover.annotations[0]?.type !== e1.annotations[0]?.type) {
        warnings.push(`${cover.entryId}: Entry 001 should use circle/underline annotation language`);
      }
    }
    if (cover.entryNumber === 2) {
      const e2 = buildEntry002FounderCoverPresentationSpec();
      if (cover.annotations[0]?.type !== e2.annotations[0]?.type) {
        warnings.push(`${cover.entryId}: Entry 002 should use asterisk/arrow annotation language`);
      }
      if (cover.annotations[0]?.type === 'CIRCLE_UNDERLINE') {
        blockers.push(`${cover.entryId}: BLOCK — Entry 002 must not repeat Entry 001 circle/underline pattern`);
      }
    }
  }

  return {
    chapterId: CHAPTER_01_ID,
    passed: blockers.length === 0,
    blocking: blockers.length > 0,
    checks: allChecks,
    blockers,
    warnings,
  };
}

/** Fixture for QA failure tests — environmental flyer composition. */
export function buildGraphicFlyerCoverFixture(): EntryCoverPresentationSpec {
  const base = buildEntry002FounderCoverPresentationSpec();
  return {
    ...base,
    heroArtifact: {
      ...base.heroArtifact,
      isolated: false,
      noEnvironmentVisible: false,
      contentDescription: 'edit suite environment with room visible and foreground props',
    },
  } as EntryCoverPresentationSpec;
}

/** Fixture for duplicate artifact failure. */
export function buildDuplicateArtifactCoverFixture(): EntryCoverPresentationSpec {
  const e1 = buildEntry001CoverPresentationSpec();
  return {
    ...buildEntry002FounderCoverPresentationSpec(),
    heroArtifact: { ...e1.heroArtifact },
  };
}

/** Fixture for duplicated annotation pattern. */
export function buildDuplicatedAnnotationCoverFixture(): EntryCoverPresentationSpec {
  const e1 = buildEntry001CoverPresentationSpec();
  return {
    ...buildEntry002FounderCoverPresentationSpec(),
    annotations: [...e1.annotations],
  };
}
