/**
 * P0.VR.7 — Reference fidelity contract store.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  DEFAULT_DESIGN_AUTHORITY_MODE,
  DEFAULT_FIDELITY_MODE,
  SYSTEM_FIDELITY_INSTRUCTION,
} from './constants.js';
import type {
  AuthorityMode,
  DesignReferenceFidelityContract,
  FidelityContractStatus,
  FidelityMode,
} from './types.js';

const contracts = new Map<string, DesignReferenceFidelityContract>();

function now(): string {
  return new Date().toISOString();
}

function contractId(): string {
  return `fidelity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultFidelityContract(input: {
  referenceId: string;
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  authorityMode?: AuthorityMode;
  fidelityMode?: FidelityMode;
  founderInstruction?: string | null;
  referenceWidth?: number;
  referenceHeight?: number;
}): DesignReferenceFidelityContract {
  const isExactDesign =
    (input.authorityMode ?? DEFAULT_DESIGN_AUTHORITY_MODE) === 'DESIGN_AUTHORITY' &&
    (input.fidelityMode ?? DEFAULT_FIDELITY_MODE) === 'EXACT';

  const record: DesignReferenceFidelityContract = {
    contractId: contractId(),
    referenceId: input.referenceId,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    viewport: input.viewport,
    authorityMode: input.authorityMode ?? DEFAULT_DESIGN_AUTHORITY_MODE,
    fidelityMode: input.fidelityMode ?? DEFAULT_FIDELITY_MODE,
    preserveFunction: true,
    preserveData: true,
    preserveRouting: true,
    preservePermissions: true,
    allowVisualRebuild: isExactDesign,
    allowLayoutReplacement: isExactDesign,
    allowCurrentVisualProtection: false,
    requireGeometryAnalysis: isExactDesign,
    requireAssetAnalysis: isExactDesign,
    requireTypographyAnalysis: isExactDesign,
    requireScreenshotQA: isExactDesign,
    requireFounderApproval: isExactDesign,
    minimumFidelityScore: null,
    systemFidelityInstruction: SYSTEM_FIDELITY_INSTRUCTION,
    founderInstructionAdditive: input.founderInstruction?.trim() || null,
    status: 'REFERENCE_UPLOADED',
    decomposition: null,
    implementationPlan: null,
    viewportAuthorities: [],
    latestScreenshotQa: null,
    latestFidelityStatus: 'NOT_EVALUATED',
    driftFindings: [],
    correctionPlan: null,
    iterationCount: 0,
    founderConfirmedAt: null,
    verifiedAt: null,
    createdAt: now(),
    updatedAt: now(),
  };

  contracts.set(record.contractId, record);
  return record;
}

export function getFidelityContract(contractId: string): DesignReferenceFidelityContract | null {
  return contracts.get(contractId) ?? null;
}

export function getFidelityContractByReference(referenceId: string): DesignReferenceFidelityContract | null {
  return [...contracts.values()].find((c) => c.referenceId === referenceId) ?? null;
}

export function listFidelityContracts(filter?: {
  projectId?: string;
  pageId?: string;
}): DesignReferenceFidelityContract[] {
  return [...contracts.values()].filter((c) => {
    if (filter?.projectId && c.projectId !== filter.projectId) return false;
    if (filter?.pageId && c.pageId !== filter.pageId) return false;
    return true;
  });
}

export function updateFidelityContractStatus(
  contractId: string,
  status: FidelityContractStatus,
): DesignReferenceFidelityContract | null {
  const c = contracts.get(contractId);
  if (!c) return null;
  c.status = status;
  c.updatedAt = now();
  return c;
}

export function confirmFidelityContract(contractId: string): DesignReferenceFidelityContract | null {
  const c = contracts.get(contractId);
  if (!c) return null;
  c.founderConfirmedAt = now();
  c.status = 'REFERENCE_CONFIRMED';
  c.updatedAt = now();
  return c;
}

export function markFidelityVerified(contractId: string): DesignReferenceFidelityContract | null {
  const c = contracts.get(contractId);
  if (!c) return null;
  c.verifiedAt = now();
  c.status = 'VERIFIED';
  c.latestFidelityStatus = 'VERIFIED';
  c.updatedAt = now();
  return c;
}

export function patchFidelityContract(
  contractId: string,
  patch: Partial<
    Pick<
      DesignReferenceFidelityContract,
      | 'decomposition'
      | 'implementationPlan'
      | 'viewportAuthorities'
      | 'latestScreenshotQa'
      | 'latestFidelityStatus'
      | 'driftFindings'
      | 'correctionPlan'
      | 'iterationCount'
      | 'status'
      | 'founderInstructionAdditive'
    >
  >,
): DesignReferenceFidelityContract | null {
  const c = contracts.get(contractId);
  if (!c) return null;
  Object.assign(c, patch);
  c.updatedAt = now();
  return c;
}

export function mergeFounderInstructionWithContract(
  contract: DesignReferenceFidelityContract,
  founderInstruction: string,
): string {
  const parts = [contract.systemFidelityInstruction];
  if (founderInstruction.trim()) parts.push(founderInstruction.trim());
  return parts.join(' ');
}

export function implementationCompleteDoesNotEqualVerified(status: FidelityContractStatus): boolean {
  return status !== 'VERIFIED' && status !== 'HIGH_MATCH';
}

export function clearFidelityContractStoreForTest(): void {
  contracts.clear();
}
