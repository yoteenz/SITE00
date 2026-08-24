/**
 * P0.5C.5A — GenerationPromptFreshnessEvaluation
 */

import { createHash, randomUUID } from 'node:crypto';
import type { GenerationPromptFreshnessEvaluation, GenerationPromptSnapshot, PromptFreshnessState } from './types.js';

export function snapshotFingerprint(prompt: string, contractFingerprint: string): string {
  return createHash('sha256').update(`${contractFingerprint}:${prompt}`).digest('hex').slice(0, 16);
}

export function evaluatePromptFreshness(params: {
  artifactId: string;
  structuredContractFingerprint: string;
  currentMethodologyVersions: string[];
  currentCompilerVersion: string;
  latestSnapshot: GenerationPromptSnapshot | null;
  contractMutatedSinceLastCompile?: boolean;
}): GenerationPromptFreshnessEvaluation {
  const reasons: string[] = [];
  let state: PromptFreshnessState = 'CURRENT';

  if (!params.latestSnapshot) {
    state = 'LEGACY_UNKNOWN';
    reasons.push('No prompt snapshot lineage recorded');
  } else if (params.latestSnapshot.artifactContractFingerprint !== params.structuredContractFingerprint) {
    state = 'STALE_CONTRACT';
    reasons.push('Structured contract fingerprint changed since last compile');
  } else if (params.contractMutatedSinceLastCompile) {
    state = 'STALE_CONTRACT';
    reasons.push('Contract mutated since last compile');
  } else if (params.latestSnapshot.compilerVersion !== params.currentCompilerVersion) {
    state = 'STALE_METHODOLOGY';
    reasons.push('Compiler version changed');
  } else {
    const missing = params.currentMethodologyVersions.filter(
      (v) => !params.latestSnapshot!.methodologyVersions.includes(v),
    );
    if (missing.length) {
      state = 'STALE_METHODOLOGY';
      reasons.push(`Missing methodology versions: ${missing.join(', ')}`);
    }
  }

  if (params.latestSnapshot && !params.latestSnapshot.prompt.includes('PUBLIC AUTHORSHIP MODE') && state === 'CURRENT') {
    state = 'STALE_C5' as PromptFreshnessState;
    reasons.push('Snapshot predates C.5 public authorship');
  }

  const promptRecompileRequired = state !== 'CURRENT';

  return {
    evaluationId: randomUUID(),
    artifactId: params.artifactId,
    state: state === ('STALE_C5' as PromptFreshnessState) ? 'STALE_METHODOLOGY' : state,
    structuredContractFingerprint: params.structuredContractFingerprint,
    snapshotContractFingerprint: params.latestSnapshot?.artifactContractFingerprint ?? null,
    compilerVersion: params.latestSnapshot?.compilerVersion ?? null,
    methodologyVersions: params.currentMethodologyVersions,
    reasons,
    promptRecompileRequired,
    evaluatedAt: new Date().toISOString(),
  };
}

export function markPromptStaleAfterContractMutation(params: {
  artifactId: string;
  structuredContractFingerprint: string;
}): GenerationPromptFreshnessEvaluation {
  return {
    evaluationId: randomUUID(),
    artifactId: params.artifactId,
    state: 'STALE_CONTRACT',
    structuredContractFingerprint: params.structuredContractFingerprint,
    snapshotContractFingerprint: null,
    compilerVersion: null,
    methodologyVersions: [],
    reasons: ['Contract mutation — PROMPT_RECOMPILE_REQUIRED'],
    promptRecompileRequired: true,
    evaluatedAt: new Date().toISOString(),
  };
}

export function classifyLegacySnapshot(params: {
  prompt: string;
  contractFingerprint: string;
  snapshotContractFingerprint: string | null;
}): import('./types.js').LegacySnapshotClassification {
  if (params.snapshotContractFingerprint && params.snapshotContractFingerprint !== params.contractFingerprint) {
    return 'STALE_PUBLIC_COPY';
  }
  if (!params.prompt.includes('PUBLIC AUTHORSHIP MODE')) return 'STALE_C5';
  if (!params.prompt.includes('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION')) return 'STALE_PRE_C4B1';
  if (!params.prompt.includes('SIGNATURE LIME REQUIREMENT')) return 'STALE_C4B';
  if (!params.prompt.includes('HUMAN-MADE MARKS')) return 'STALE_C4A';
  if (
    params.snapshotContractFingerprint === params.contractFingerprint &&
    params.prompt.includes('PUBLIC AUTHORSHIP MODE') &&
    params.prompt.includes('SIGNATURE LIME REQUIREMENT') &&
    params.prompt.includes('SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION')
  ) {
    return 'CURRENT';
  }
  return 'LEGACY_UNKNOWN';
}
