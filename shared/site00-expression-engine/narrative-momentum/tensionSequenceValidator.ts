import type {
  NarrativeBeat,
  NarrativeMomentumValidationFlag,
  NarrativeValidationIssue,
  TensionCurveStage,
  TensionModel,
} from './types.js';

const CANONICAL_ORDER: TensionCurveStage[] = [
  'LOW',
  'RISING',
  'INTERRUPTION',
  'ESCALATION',
  'PEAK',
  'RELEASE',
  'RESIDUAL',
];

const STAGE_RANK: Record<TensionCurveStage, number> = {
  LOW: 0,
  RISING: 1,
  INTERRUPTION: 2,
  ESCALATION: 3,
  PEAK: 4,
  RELEASE: 5,
  RESIDUAL: 6,
};

export const CULTURAL_GLITCH_BEAT_TENSION: TensionCurveStage[] = CANONICAL_ORDER;

export function tensionStageForBeatIndex(grammarId: string, index: number, total: number): TensionCurveStage {
  if (grammarId === 'CULTURAL_GLITCH' && total === CULTURAL_GLITCH_BEAT_TENSION.length) {
    return CULTURAL_GLITCH_BEAT_TENSION[index] ?? 'RISING';
  }
  if (index === 0) return 'LOW';
  if (index === total - 1) return 'RESIDUAL';
  if (index === total - 2) return 'RELEASE';
  if (index === Math.floor(total / 2)) return 'PEAK';
  if (index === 1) return 'RISING';
  if (index === 2) return 'INTERRUPTION';
  return 'ESCALATION';
}

function isPeakToEscalation(a: TensionCurveStage, b: TensionCurveStage): boolean {
  return a === 'PEAK' && b === 'ESCALATION';
}

export function validateNarrativeTensionSequence(input: {
  beats: readonly NarrativeBeat[];
  tensionModel: TensionModel;
}): NarrativeValidationIssue[] {
  const issues: NarrativeValidationIssue[] = [];
  const { beats, tensionModel } = input;

  for (let i = 0; i < beats.length - 1; i++) {
    const cur = beats[i]!;
    const next = beats[i + 1]!;
    if (isPeakToEscalation(cur.tensionStage, next.tensionStage)) {
      if (tensionModel !== 'DOUBLE_PEAK' && tensionModel !== 'NONLINEAR') {
        issues.push({
          flagId: 'TENSION_SEQUENCE_INCOHERENT' as NarrativeMomentumValidationFlag,
          severity: 'WARNING',
          trigger: `Beat ${cur.order} (${cur.tensionStage}) → beat ${next.order} (${next.tensionStage})`,
          affectedBeatIds: [cur.beatId, next.beatId],
          explanation:
            'PEAK followed by ESCALATION reads as a second climb unless the story declares DOUBLE_PEAK or NONLINEAR tension.',
          suggestedCorrection: 'Move revelation to PEAK on NDX LENS / recontext beat, or set tensionModel to DOUBLE_PEAK with explicit reason.',
          blocking: false,
        });
      }
    }
  }

  if (tensionModel === 'CANONICAL') {
    let lastRank = -1;
    for (const b of beats) {
      const rank = STAGE_RANK[b.tensionStage];
      if (rank < lastRank && !isPeakToEscalation(beats.find((x) => x.tensionStage === 'PEAK')?.tensionStage ?? 'PEAK', b.tensionStage)) {
        issues.push({
          flagId: 'TENSION_SEQUENCE_INCOHERENT' as NarrativeMomentumValidationFlag,
          severity: 'ADVISORY',
          trigger: `Non-monotonic tension at beat ${b.order}`,
          affectedBeatIds: [b.beatId],
          explanation: 'Canonical model expects LOW → RISING → INTERRUPTION → ESCALATION → PEAK → RELEASE → RESIDUAL without backward steps.',
          suggestedCorrection: 'Re-map beat tension stages or declare an explicit variant model.',
          blocking: false,
        });
      }
      lastRank = Math.max(lastRank, rank);
    }
  }

  return issues;
}
