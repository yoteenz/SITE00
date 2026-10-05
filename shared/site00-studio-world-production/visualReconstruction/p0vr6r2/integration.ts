/**
 * P0.VR.6R2 — Pipeline integration with P0.VR.7 fidelity contract.
 */

import {
  getFidelityContract,
  patchFidelityContract,
  updateFidelityContractStatus,
} from '../p0vr7/contractStore.js';
import type { DesignReferenceFidelityContract } from '../p0vr7/types.js';
import {
  finalizeReferenceVerification,
  prepareReference,
  requiresVisualConvergence,
  runConvergenceComparison,
} from './convergenceEngine.js';
import { buildDesignExecutionFidelityEnvelope } from './executionEnvelope.js';
import {
  getComparisonSession,
  getComparisonSessionByContract,
  saveComparisonSession,
} from './sessionStore.js';
import { runAutomaticConvergenceLoop } from './iterationLoop.js';
import type { DesignReferenceComparisonSession } from './types.js';

export function ensureConvergenceSessionForContract(
  contract: DesignReferenceFidelityContract,
): DesignReferenceComparisonSession | null {
  if (!requiresVisualConvergence(contract)) return null;

  const existing = getComparisonSessionByContract(contract.contractId);
  if (existing) return existing;

  return prepareReference({ contract });
}

export function onImplementationComplete(input: {
  contractId: string;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Parameters<typeof runConvergenceComparison>[0]['liveGeometryHints'];
}): {
  contract: DesignReferenceFidelityContract | null;
  session: DesignReferenceComparisonSession | null;
} {
  const contract = patchFidelityContract(input.contractId, { status: 'RENDER_QA_REQUIRED' });
  if (!contract || !requiresVisualConvergence(contract)) {
    return { contract, session: null };
  }

  let session = ensureConvergenceSessionForContract(contract);
  if (!session) return { contract, session: null };

  session = runConvergenceComparison({
    session,
    referencePath: input.referencePath,
    livePath: input.livePath,
    liveWidth: input.liveWidth,
    liveHeight: input.liveHeight,
    liveGeometryHints: input.liveGeometryHints,
  });

  saveComparisonSession(session);
  return { contract, session };
}

export function startVisualConvergenceForContract(contractId: string): DesignReferenceComparisonSession | null {
  const contract = getFidelityContract(contractId);
  if (!contract) return null;
  return ensureConvergenceSessionForContract(contract);
}

export function runVisualConvergenceIteration(input: {
  sessionId: string;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Parameters<typeof runConvergenceComparison>[0]['liveGeometryHints'];
}): DesignReferenceComparisonSession | null {
  const session = getComparisonSession(input.sessionId);
  if (!session) return null;
  return runConvergenceComparison({
    session,
    referencePath: input.referencePath,
    livePath: input.livePath,
    liveWidth: input.liveWidth,
    liveHeight: input.liveHeight,
    liveGeometryHints: input.liveGeometryHints,
  });
}

export function founderVerifyVisualMatch(sessionId: string): DesignReferenceComparisonSession | null {
  const session = getComparisonSession(sessionId);
  if (!session) return null;
  const verified = finalizeReferenceVerification(session, 'FOUNDER');
  updateFidelityContractStatus(session.contractId, 'VERIFIED');
  patchFidelityContract(session.contractId, { latestFidelityStatus: 'VERIFIED', status: 'VERIFIED' });
  return verified;
}

export function systemVerifyVisualMatch(sessionId: string): DesignReferenceComparisonSession | null {
  const session = getComparisonSession(sessionId);
  if (!session) return null;
  if (session.status !== 'HIGH_MATCH') return session;
  const verified = finalizeReferenceVerification(session, 'SYSTEM');
  updateFidelityContractStatus(session.contractId, 'VERIFIED');
  patchFidelityContract(session.contractId, { latestFidelityStatus: 'VERIFIED', status: 'VERIFIED' });
  return verified;
}

export function getExecutionEnvelopeForContract(contractId: string) {
  const contract = getFidelityContract(contractId);
  if (!contract) return null;
  const session = getComparisonSessionByContract(contractId);
  return buildDesignExecutionFidelityEnvelope({
    contract,
    visualConvergenceSessionId: session?.sessionId ?? null,
  });
}

export { runAutomaticConvergenceLoop, buildDesignExecutionFidelityEnvelope };
export { requiresVisualConvergence, blockExecutorSelfPass } from './convergenceEngine.js';
export {
  getComparisonSession,
  getComparisonSessionByContract,
  getComparisonSessionByReference,
  listComparisonSessions,
} from './sessionStore.js';
