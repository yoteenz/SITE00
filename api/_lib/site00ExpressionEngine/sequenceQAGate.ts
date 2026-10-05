/**
 * Expression Engine V0 — sequence QA wired to blocking production behavior.
 */

import { runSequenceCohesionGate } from '../../../shared/site00-brand-lore/sequenceCreative/cohesionGate.js';
import type { CarouselSlideRecord } from '../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { SequenceCreativeSystem } from '../../../shared/site00-brand-lore/sequenceCreative/types.js';
import type { SequenceQAResult } from '../../../shared/site00-expression-engine/types.js';
import { EXPRESSION_QA_MAX_REPAIR_LOOPS } from '../../../shared/site00-expression-engine/constants.js';

export function runBlockingSequenceQA(params: {
  sequenceSystem: SequenceCreativeSystem;
  slides: CarouselSlideRecord[];
  visionAvailable?: boolean;
  repairLoopsUsed?: number;
}): SequenceQAResult {
  const report = runSequenceCohesionGate({
    sequenceSystem: params.sequenceSystem,
    slides: params.slides,
    visionAvailable: params.visionAvailable,
  });

  const resizeDim = report.dimensions.find((d) => d.dimension === 'RESIZE_ONLY_SEQUENCE');
  const compositionalDim = report.dimensions.find((d) => d.dimension === 'COMPOSITIONAL_VARIETY');
  const typographyDim = report.dimensions.find((d) => d.dimension === 'TYPOGRAPHY_COHERENCE');

  const samenessFail =
    resizeDim?.result === 'FAIL' ||
    compositionalDim?.result === 'FAIL' ||
    (typographyDim?.result === 'FAIL' && params.slides.length > 2);

  const cohesionFail = report.dimensions.some(
    (d) => d.dimension === 'CONTROLLED_DEVIATION_VALIDITY' && d.result === 'FAIL',
  );

  const failures: string[] = [];
  if (samenessFail) failures.push('Sequence sameness / resize-only detected');
  if (cohesionFail) failures.push('Unexplained deviation breaks cohesion');

  for (const dim of report.dimensions) {
    if (dim.result === 'FAIL') {
      failures.push(`${dim.dimension}: ${dim.notes.join('; ') || 'FAIL'}`);
    }
  }

  const repairLoopsUsed = params.repairLoopsUsed ?? 0;
  const repairLoopsRemaining = Math.max(0, EXPRESSION_QA_MAX_REPAIR_LOOPS - repairLoopsUsed);
  const blocking = failures.length > 0 && repairLoopsRemaining === 0;

  return {
    passed: failures.length === 0,
    cohesion: cohesionFail ? 'FAIL' : report.overallResult === 'WARN' ? 'WARN' : 'PASS',
    sameness: samenessFail ? 'FAIL' : 'PASS',
    blocking,
    failures,
    repairLoopsRemaining,
  };
}
