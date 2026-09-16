/**
 * P0.VR.OPUS-NATIVE1 — Phase 15 + 16: execution mode contracts and model effort.
 *
 * Mode is the single dial the founder turns. Everything downstream — how much
 * context is compiled, how many browser loops are permitted, how much may be
 * spent, and how hard the model is asked to think — is derived from it, so a
 * QUICK border tweak cannot silently cost what a FORENSIC reconstruction costs.
 */

import type { OpusNativeCostGuardLimits, OpusNativeMode } from './types.js';

export type OpusModelEffort = 'low' | 'medium' | 'high';

export interface OpusNativeModeContract {
  mode: OpusNativeMode;
  purpose: string;
  useFor: string[];
  /** Phase 4 — how much of the project is compiled into context. */
  contextBudgetTokens: number;
  includeProjectContext: boolean;
  includeInteractionContract: boolean;
  /** Phase 12/13 — how many render/screenshot loops are permitted. */
  maxVisualLoops: number;
  /** Phase 16 — default effort. The founder may escalate explicitly. */
  defaultEffort: OpusModelEffort;
  maxOutputTokens: number;
  limits: OpusNativeCostGuardLimits;
  /** Dependency expansion depth for the code access boundary (Phase 9). */
  dependencyDepth: number;
}

export const OPUS_NATIVE_MODE_CONTRACTS: Record<OpusNativeMode, OpusNativeModeContract> = {
  QUICK: {
    mode: 'QUICK',
    purpose: 'Small, well-understood corrections to an already-converged surface.',
    useFor: [
      'border colour or weight changes',
      'type-weight corrections',
      'small spacing adjustments',
      'tiny component polish',
    ],
    contextBudgetTokens: 12_000,
    includeProjectContext: false,
    includeInteractionContract: false,
    maxVisualLoops: 1,
    defaultEffort: 'low',
    maxOutputTokens: 4_000,
    dependencyDepth: 0,
    limits: {
      // The protocol's own required method is inspect, render, patch, render,
      // verify, report. Six turns is the floor for a correct QUICK run, so the
      // ceiling sits just above it; spend, not turn count, is the real guard.
      maxIterations: 8,
      maxInputTokens: 60_000,
      maxOutputTokens: 8_000,
      maxRunCostUsd: 0.75,
      warnAtCostUsd: 0.4,
      hardStopAtCostUsd: 0.75,
    },
  },

  DESIGN: {
    mode: 'DESIGN',
    purpose: 'Normal page refinement and component work against an approved reference.',
    useFor: [
      'page refinement',
      'component reconstruction',
      'visual-system implementation',
    ],
    contextBudgetTokens: 45_000,
    includeProjectContext: true,
    includeInteractionContract: true,
    maxVisualLoops: 4,
    defaultEffort: 'medium',
    maxOutputTokens: 16_000,
    dependencyDepth: 1,
    limits: {
      maxIterations: 12,
      maxInputTokens: 400_000,
      maxOutputTokens: 48_000,
      maxRunCostUsd: 6,
      warnAtCostUsd: 3,
      hardStopAtCostUsd: 6,
    },
  },

  FORENSIC: {
    mode: 'FORENSIC',
    purpose: 'Golden reconstruction and difficult visual convergence.',
    useFor: [
      'golden reconstruction',
      'difficult visual mismatch',
      'major design convergence',
    ],
    contextBudgetTokens: 120_000,
    includeProjectContext: true,
    includeInteractionContract: true,
    maxVisualLoops: 10,
    defaultEffort: 'high',
    maxOutputTokens: 32_000,
    dependencyDepth: 2,
    limits: {
      maxIterations: 30,
      maxInputTokens: 1_500_000,
      maxOutputTokens: 160_000,
      maxRunCostUsd: 25,
      warnAtCostUsd: 12,
      hardStopAtCostUsd: 25,
    },
  },
};

export function modeContract(mode: OpusNativeMode): OpusNativeModeContract {
  return OPUS_NATIVE_MODE_CONTRACTS[mode] ?? OPUS_NATIVE_MODE_CONTRACTS.DESIGN;
}

/**
 * Phase 16. Escalation is explicit and one-way per run: the founder can ask for
 * more thinking than the mode's default, never less than the floor, and never
 * beyond the mode's own ceiling. FORENSIC is the only mode that reaches 'high'
 * by default, so escalation cannot turn a QUICK tweak into a maximum-reasoning
 * run without also changing mode.
 */
export function resolveEffort(
  mode: OpusNativeMode,
  requested?: OpusModelEffort | null,
): { effort: OpusModelEffort; escalated: boolean } {
  const contract = modeContract(mode);
  if (!requested || requested === contract.defaultEffort) {
    return { effort: contract.defaultEffort, escalated: false };
  }
  const order: OpusModelEffort[] = ['low', 'medium', 'high'];
  const ceiling = mode === 'QUICK' ? 'medium' : 'high';
  const requestedRank = order.indexOf(requested);
  const defaultRank = order.indexOf(contract.defaultEffort);
  const ceilingRank = order.indexOf(ceiling as OpusModelEffort);

  if (requestedRank < defaultRank) {
    return { effort: contract.defaultEffort, escalated: false };
  }
  if (requestedRank > ceilingRank) {
    return { effort: order[ceilingRank], escalated: true };
  }
  return { effort: requested, escalated: true };
}
