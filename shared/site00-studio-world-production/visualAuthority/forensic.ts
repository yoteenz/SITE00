/**
 * P0.5C.6 — V2.1 vs V2.3 visual authority forensic comparison.
 */

import type { ExperimentVisualAuthorityForensic } from './types.js';

export function buildExperimentVisualAuthorityForensic(params: {
  v21Modes: string[];
  v23Modes: string[];
  v21AppetiteScores: string[];
  v23EvidenceLedCount: number;
}): ExperimentVisualAuthorityForensic {
  const v21ImageLed = params.v21Modes.filter((m) => m.includes('IMAGE') || m === 'MIXED_MEDIA' || m === 'PHOTOGRAPHIC_ASSEMBLAGE').length;
  const v23ArtifactLed = params.v23Modes.filter((m) => m === 'ARTIFACT_DOMINANT').length;

  return {
    forensicId: `evaf-${Date.now()}`,
    v21VisualStrengths: [
      'graphic design sophistication',
      'cultural image participation',
      'visual appetite / feed-stopping energy',
      'compositional curiosity',
      'human and photographic presence',
      'artistic range across topics',
    ],
    v23LogicStrengths: [
      'information hierarchy',
      'material causality',
      'first-person authorship',
      'signature lime restraint',
      'human-made behavior',
      'editorial discipline',
    ],
    weakenedByLaterMethodology: v21ImageLed > v23ArtifactLed
      ? ['visual subject led composition', 'pre-reading appetite', 'cultural photography authority']
      : ['some image-led modes preserved'],
    genuineImprovements: [
      'one dominant thought',
      'character trace causality',
      'lime restraint',
      'internal label quarantine',
      'generation lineage',
    ],
    constraintsBecameVisualPrescriptions: [
      'information budget interpreted as visual sparsity',
      'evidence architecture becoming default composition',
      'materiality substituting for art direction',
    ],
    informationRestraintMinimalismConflation: params.v23EvidenceLedCount >= 5,
    evidenceAsCompositionProblem: params.v23EvidenceLedCount >= 4,
    typographyCarryingVisualInterest: params.v23Modes.filter((m) => m === 'TYPOGRAPHY_DOMINANT').length >= 4,
    materialityAsArtDirectionSubstitute: v23ArtifactLed >= 5,
    governanceConvergence: new Set(params.v23Modes).size < 4,
    evaluatedAt: new Date().toISOString(),
  };
}

export function visualFlatteningCause(forensic: ExperimentVisualAuthorityForensic): string {
  if (forensic.materialityAsArtDirectionSubstitute) return 'Materiality became art-direction substitute';
  if (forensic.evidenceAsCompositionProblem) return 'Evidence architecture became default composition';
  if (forensic.informationRestraintMinimalismConflation) return 'Information restraint conflated with visual minimalism';
  return 'Authority order placed editorial systems before visual conception';
}
