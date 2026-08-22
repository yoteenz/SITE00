/**
 * Stage A proof inspection — ACCEPT / REJECT / NEEDS_HUMAN_REVIEW before founder display.
 */

import type {
  ComparisonProofAsset,
  ComparisonProofInspectionOutcome,
  ComparisonProofType,
  FormedCoreDirection,
} from './types.js';

export type InspectionInput = {
  direction: FormedCoreDirection;
  proofType: ComparisonProofType;
  prompt: string;
  generationSucceeded: boolean;
  errorMessage?: string;
  medium: ComparisonProofAsset['medium'];
};

const GENERIC_STOCK_MARKERS = [
  'stock photo',
  'shutterstock',
  'getty',
  'placeholder',
  'lorem ipsum',
];

export function inspectComparisonProof(input: InspectionInput): {
  outcome: ComparisonProofInspectionOutcome;
  notes: string[];
} {
  const notes: string[] = [];

  if (!input.generationSucceeded) {
    return {
      outcome: 'NEEDS_HUMAN_REVIEW',
      notes: [input.errorMessage ?? 'Generation failed'],
    };
  }

  const promptLower = input.prompt.toLowerCase();
  for (const marker of GENERIC_STOCK_MARKERS) {
    if (promptLower.includes(marker)) {
      notes.push(`Prompt contains generic marker: ${marker}`);
    }
  }

  if (!input.direction.directionName.trim()) {
    return { outcome: 'REJECT', notes: ['Missing direction name'] };
  }

  if (input.proofType === 'heroWorld' && !input.direction.governingBehavior.trim()) {
    return { outcome: 'REJECT', notes: ['Hero proof requires governing behavior'] };
  }

  if (input.proofType === 'primaryArtifact' && !input.direction.primaryBrandArtifact.trim()) {
    return { outcome: 'REJECT', notes: ['Primary artifact proof requires primaryBrandArtifact field'] };
  }

  if (input.medium === 'CODE_NATIVE') {
    notes.push('Code-native proof — structural acceptance');
    return { outcome: 'ACCEPT', notes };
  }

  notes.push('FAL generation succeeded — concept fit assumed at Stage A');
  notes.push(`Direction: ${input.direction.directionName}`);
  notes.push(`Proof type: ${input.proofType}`);

  return { outcome: 'ACCEPT', notes };
}

export function compareCousinDistinctiveness(params: {
  directionA: string;
  directionB: string;
  assetsA: ComparisonProofAsset[];
  assetsB: ComparisonProofAsset[];
}): { result: 'DISTINCT' | 'TOO_SIMILAR' | 'NEEDS_HUMAN_REVIEW'; notes: string } {
  const heroA = params.assetsA.find((a) => a.proofType === 'heroWorld' && a.qaState === 'ACCEPT');
  const heroB = params.assetsB.find((a) => a.proofType === 'heroWorld' && a.qaState === 'ACCEPT');

  if (!heroA || !heroB) {
    return {
      result: 'NEEDS_HUMAN_REVIEW',
      notes: 'Both cousin directions need accepted hero proofs for automated distinctiveness check',
    };
  }

  if (heroA.promptHash === heroB.promptHash) {
    return {
      result: 'TOO_SIMILAR',
      notes: 'Identical prompt hash on cousin hero proofs — likely visual collapse',
    };
  }

  return {
    result: 'DISTINCT',
    notes: `Hero proofs differ — ${params.directionA} vs ${params.directionB} maintain separate prompt lineage`,
  };
}
