/**
 * Visual expression evaluators — direction fidelity, distinctiveness, range.
 */

import type { BrandPresentationVisualExpressionCandidate, BrandPresentationDirectionVisualBenchmark } from './types.js';
import type { BrandPresentationDirectionCandidate } from '../brandPresentationDirectionTerritory/types.js';

const STYLE_ONLY_PATTERNS = [
  /\bserif\b/i,
  /\bsans[- ]serif\b/i,
  /\bminimal\b/i,
  /\bmaximal\b/i,
  /\bblack\b.*\bcream\b/i,
  /\bred palette\b/i,
];

const DIRECTION_BEHAVIOR_FIELDS = [
  'brandPosture',
  'audienceRelationship',
  'publishingBehavior',
  'knowledgeBehavior',
  'authorityBehavior',
  'participationBehavior',
  'recurrenceBehavior',
] as const;

export function evaluateExpressionDirectionDrift(params: {
  direction: BrandPresentationDirectionCandidate;
  expression: BrandPresentationVisualExpressionCandidate;
}): { result: 'PASS' | 'DIRECTION_DRIFT' | 'NOT_EVALUATED'; notes: string[] } {
  const notes: string[] = [];
  const thesis = params.expression.expressionThesis.toLowerCase();
  const driftSignals = [
    'new audience relationship',
    'different publishing logic',
    'replaces knowledge behavior',
    'changes authority posture',
    'becomes a campaign',
    'topic-specific direction',
  ];
  for (const signal of driftSignals) {
    if (thesis.includes(signal)) {
      notes.push(`Possible direction drift signal: ${signal}`);
    }
  }

  for (const field of DIRECTION_BEHAVIOR_FIELDS) {
    const dirVal = params.direction[field]?.toLowerCase() ?? '';
    const exprCombined = [
      params.expression.directionInterpretation,
      params.expression.visualBehavior,
      params.expression.recurrenceBehavior,
    ]
      .join(' ')
      .toLowerCase();
    if (dirVal && exprCombined.includes('contradicts') && exprCombined.includes(field)) {
      notes.push(`Expression may contradict direction ${field}`);
    }
  }

  if (notes.length >= 2) {
    return { result: 'DIRECTION_DRIFT', notes };
  }
  return { result: 'PASS', notes };
}

export function evaluateWithinFinalistDistinctiveness(
  expressions: BrandPresentationVisualExpressionCandidate[],
): { result: 'PASS' | 'STYLE_ONLY_DIFFERENTIATION' | 'VISUAL_RANGE_TOO_NARROW' | 'NOT_EVALUATED'; notes: string[] } {
  if (expressions.length < 2) {
    return { result: 'NOT_EVALUATED', notes: ['Insufficient expressions for distinctiveness evaluation'] };
  }

  const dimensions = [
    'compositionBehavior',
    'typographyBehavior',
    'imageryBehavior',
    'informationBehavior',
    'densityBehavior',
    'rhythmBehavior',
    'graphicLanguage',
    'artifactLanguage',
    'socialSurfaceBehavior',
  ] as const;

  let differingDimensions = 0;
  const notes: string[] = [];

  for (let i = 0; i < expressions.length; i++) {
    for (let j = i + 1; j < expressions.length; j++) {
      const a = expressions[i]!;
      const b = expressions[j]!;
      let pairDiff = 0;
      for (const dim of dimensions) {
        if (a[dim].trim().toLowerCase() !== b[dim].trim().toLowerCase()) {
          pairDiff++;
        }
      }
      if (pairDiff >= 4) differingDimensions++;
      else notes.push(`${a.expressionLabel} vs ${b.expressionLabel}: only ${pairDiff} behavioral dimensions differ`);
    }
  }

  const combinedText = expressions.map((e) => e.expressionThesis).join(' ');
  if (STYLE_ONLY_PATTERNS.some((p) => p.test(combinedText)) && differingDimensions === 0) {
    return { result: 'STYLE_ONLY_DIFFERENTIATION', notes: [...notes, 'Differentiation appears style-swap only'] };
  }

  if (differingDimensions === 0) {
    return { result: 'VISUAL_RANGE_TOO_NARROW', notes: [...notes, 'All expressions converge on same visual logic'] };
  }

  return { result: 'PASS', notes };
}

export function evaluateCrossFinalistCollapse(params: {
  finalist1Expressions: BrandPresentationVisualExpressionCandidate[];
  finalist2Expressions: BrandPresentationVisualExpressionCandidate[];
}): { result: 'PASS' | 'FINALIST_VISUAL_COLLAPSE' | 'NOT_EVALUATED'; notes: string[] } {
  if (params.finalist1Expressions.length === 0 || params.finalist2Expressions.length === 0) {
    return { result: 'NOT_EVALUATED', notes: ['Insufficient expressions for cross-finalist evaluation'] };
  }

  const f1Signature = params.finalist1Expressions
    .map((e) => `${e.compositionBehavior}|${e.typographyBehavior}|${e.graphicLanguage}`)
    .sort()
    .join('::');
  const f2Signature = params.finalist2Expressions
    .map((e) => `${e.compositionBehavior}|${e.typographyBehavior}|${e.graphicLanguage}`)
    .sort()
    .join('::');

  if (f1Signature === f2Signature) {
    return {
      result: 'FINALIST_VISUAL_COLLAPSE',
      notes: ['Both finalist directions produced effectively identical visual expression signatures'],
    };
  }

  return { result: 'PASS', notes: [] };
}

export function evaluateReferenceExclusions(sourceLabel: string): { allowed: boolean; reason: string | null } {
  const blocked = [
    'SITE00_HOST_VISUAL_MEMORY',
    'PROJECTS_UX',
    'PROJECT_WORKSPACE_UI',
    'EXPERIMENT_D_VISUAL',
    'EXPERIMENT_F_VISUAL',
    'FRONTAL_SLAYER_WORKBENCH',
    'REJECTED_WORKBENCH',
    'DOSSIER_IMAGERY',
  ];
  for (const b of blocked) {
    if (sourceLabel.toUpperCase().includes(b.replace(/_/g, ' ')) || sourceLabel.toUpperCase().includes(b)) {
      return { allowed: false, reason: `${b} excluded from NDXBOOK Brand Presentation visual references` };
    }
  }
  return { allowed: true, reason: null };
}

export function burnBookReferenceAllowed(params: {
  directionRequiresArtifactBehavior: boolean;
  artifactLanguage: string;
}): boolean {
  const artifactText = params.artifactLanguage.toLowerCase();
  const requiresScrapbook =
    artifactText.includes('scrapbook') ||
    artifactText.includes('collage') ||
    artifactText.includes('notebook') ||
    artifactText.includes('handwriting') ||
    artifactText.includes('paper artifact');
  return params.directionRequiresArtifactBehavior && requiresScrapbook;
}

export function visionQaUnavailable(): {
  directionFidelity: 'NOT_EVALUATED';
  brandFidelity: 'NOT_EVALUATED';
  referenceAdherence: 'NOT_EVALUATED';
  genericRisk: 'NOT_EVALUATED';
  visualRange: 'NOT_EVALUATED';
  notes: string[];
} {
  return {
    directionFidelity: 'NOT_EVALUATED',
    brandFidelity: 'NOT_EVALUATED',
    referenceAdherence: 'NOT_EVALUATED',
    genericRisk: 'NOT_EVALUATED',
    visualRange: 'NOT_EVALUATED',
    notes: ['Vision QA unavailable — founder judgment remains authoritative'],
  };
}

export function directionBenchmarkVisionQaUnavailable(): import('./types.js').DirectionBenchmarkVisionEvaluation {
  return {
    parentConceptFidelity: 'NOT_EVALUATED',
    directionFidelity: 'NOT_EVALUATED',
    ndxbookFidelity: 'NOT_EVALUATED',
    visualDistinctiveness: 'NOT_EVALUATED',
    siblingDistinctiveness: 'NOT_EVALUATED',
    metaphorLiteralization: 'NOT_EVALUATED',
    genericSocialDesignRisk: 'NOT_EVALUATED',
    genericEditorialRisk: 'NOT_EVALUATED',
    recurrencePlausibility: 'NOT_EVALUATED',
    socialNativePotential: 'NOT_EVALUATED',
    typographicQuality: 'NOT_EVALUATED',
    compositionQuality: 'NOT_EVALUATED',
    notes: ['Vision QA unavailable — founder judgment remains authoritative'],
  };
}

export function evaluateBenchmarkDirectionDrift(params: {
  direction: BrandPresentationDirectionCandidate;
  benchmark: BrandPresentationDirectionVisualBenchmark;
}): { result: 'PASS' | 'DIRECTION_DRIFT' | 'NOT_EVALUATED'; notes: string[] } {
  const notes: string[] = [];
  const thesis = params.benchmark.benchmarkThesis.toLowerCase();
  const driftSignals = [
    'new audience relationship',
    'different publishing logic',
    'replaces knowledge behavior',
    'changes authority posture',
    'becomes a campaign',
    'topic-specific direction',
  ];
  for (const signal of driftSignals) {
    if (thesis.includes(signal)) {
      notes.push(`Possible direction drift signal: ${signal}`);
    }
  }
  if (notes.length >= 2) {
    return { result: 'DIRECTION_DRIFT', notes };
  }
  return { result: 'PASS', notes };
}

export function evaluateSiblingBenchmarkDistinctiveness(
  benchmarks: BrandPresentationDirectionVisualBenchmark[],
): { result: 'PASS' | 'STYLE_ONLY_DIFFERENTIATION' | 'VISUAL_RANGE_TOO_NARROW' | 'SIBLING_VISUAL_COLLAPSE' | 'NOT_EVALUATED'; notes: string[] } {
  if (benchmarks.length < 2) {
    return { result: 'NOT_EVALUATED', notes: ['Insufficient benchmarks for sibling evaluation'] };
  }

  const dimensions = [
    'compositionBehavior',
    'typographyBehavior',
    'imageryBehavior',
    'informationBehavior',
    'densityBehavior',
    'rhythmBehavior',
    'graphicBehavior',
    'artifactBehavior',
    'socialNativeBehavior',
  ] as const;

  let differingDimensions = 0;
  const notes: string[] = [];

  for (let i = 0; i < benchmarks.length; i++) {
    for (let j = i + 1; j < benchmarks.length; j++) {
      const a = benchmarks[i]!;
      const b = benchmarks[j]!;
      let pairDiff = 0;
      for (const dim of dimensions) {
        if (a[dim].trim().toLowerCase() !== b[dim].trim().toLowerCase()) {
          pairDiff++;
        }
      }
      if (pairDiff >= 4) differingDimensions++;
      else {
        notes.push(`${a.directionName} vs ${b.directionName}: only ${pairDiff} behavioral dimensions differ`);
        if (pairDiff <= 1) {
          notes.push('SIBLING_VISUAL_COLLAPSE risk');
        }
      }
    }
  }

  if (differingDimensions === 0 && benchmarks.length >= 2) {
    return { result: 'SIBLING_VISUAL_COLLAPSE', notes: [...notes, 'Sibling benchmarks converge on same visual logic'] };
  }

  const combinedText = benchmarks.map((b) => b.benchmarkThesis).join(' ');
  if (STYLE_ONLY_PATTERNS.some((p) => p.test(combinedText)) && differingDimensions === 0) {
    return { result: 'STYLE_ONLY_DIFFERENTIATION', notes: [...notes, 'Differentiation appears style-swap only'] };
  }

  if (differingDimensions === 0) {
    return { result: 'VISUAL_RANGE_TOO_NARROW', notes: [...notes, 'All benchmarks converge on same visual logic'] };
  }

  return { result: 'PASS', notes };
}
