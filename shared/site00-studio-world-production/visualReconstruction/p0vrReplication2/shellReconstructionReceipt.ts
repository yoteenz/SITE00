/**
 * P0.VR.REPLICATION.2 — Shell-first reconstruction execution receipt.
 */

import type { AuthorityShellBlueprint } from './authorityShellBlueprint.js';
import type { ShellMatchResult } from './shellMatchResult.js';

export type ShellReconstructionStrategy = 'SHELL_FIRST_DIRECT' | 'SHELL_FIRST_WITH_CONTENT_BIND';

export type ShellReconstructionReceipt = {
  receiptId: string;
  sessionId: string;
  authorityVersionId: string;
  authorityShellBlueprintId: string;
  strategy: ShellReconstructionStrategy;
  blueprintGenerated: boolean;
  shellMatched: boolean;
  fallbackUsed: boolean;
  buildRef: string;
  shellMatchResultId: string | null;
  message: string;
};

export function buildShellReconstructionReceipt(input: {
  sessionId: string;
  blueprint: AuthorityShellBlueprint;
  shellMatch: ShellMatchResult;
  buildRef: string;
  fallbackUsed?: boolean;
}): ShellReconstructionReceipt {
  return {
    receiptId: `srr_${input.sessionId}_${Date.now()}`,
    sessionId: input.sessionId,
    authorityVersionId: input.blueprint.authorityVersionId,
    authorityShellBlueprintId: input.blueprint.blueprintId,
    strategy: 'SHELL_FIRST_DIRECT',
    blueprintGenerated: input.blueprint.status === 'READY',
    shellMatched: input.shellMatch.status === 'PASS',
    fallbackUsed: input.fallbackUsed ?? false,
    buildRef: input.buildRef,
    shellMatchResultId: input.shellMatch.resultId,
    message: input.shellMatch.gateLabel,
  };
}
