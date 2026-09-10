/**
 * P0.PCI.3 — In-memory founder approval store for page families.
 */

import type { PageDesignApproval, PageFamily, ReconstructionWorkflowStep } from './types.js';

const approvals = new Map<string, PageDesignApproval[]>();
const workflowByFamily = new Map<string, ReconstructionWorkflowStep>();
const structureConfirmed = new Set<string>();
const familyApproved = new Set<string>();
const selectedNodeByFamily = new Map<string, string>();

export function clearPageFamilyStoreForTest(): void {
  approvals.clear();
  workflowByFamily.clear();
  structureConfirmed.clear();
  familyApproved.clear();
  selectedNodeByFamily.clear();
}

export function getFamilyApprovals(familyId: string): PageDesignApproval[] {
  return approvals.get(familyId) ?? [];
}

export function approveNodeDesign(input: {
  familyId: string;
  nodeId: string;
  route: string;
  approvedBy?: string;
}): PageDesignApproval {
  const list = approvals.get(input.familyId) ?? [];
  const existing = list.find((a) => a.nodeId === input.nodeId);
  const record: PageDesignApproval = existing ?? {
    approvalId: `approval:${input.familyId}:${input.nodeId}`,
    nodeId: input.nodeId,
    route: input.route,
    approvedAt: new Date().toISOString(),
    approvedBy: input.approvedBy ?? 'founder',
    structureConfirmed: structureConfirmed.has(input.familyId),
    designApproved: false,
    wiringVerified: false,
  };
  record.designApproved = true;
  record.approvedAt = new Date().toISOString();
  const next = [...list.filter((a) => a.nodeId !== input.nodeId), record];
  approvals.set(input.familyId, next);
  return record;
}

export function confirmFamilyStructure(familyId: string): void {
  structureConfirmed.add(familyId);
  workflowByFamily.set(familyId, 'REVIEW_CHILD');
}

export function approveFamily(familyId: string): void {
  familyApproved.add(familyId);
  workflowByFamily.set(familyId, 'REVIEW_CHILD');
}

export function isFamilyStructureConfirmed(familyId: string): boolean {
  return structureConfirmed.has(familyId);
}

export function isFamilyApproved(familyId: string): boolean {
  return familyApproved.has(familyId);
}

export function getWorkflowStep(familyId: string): ReconstructionWorkflowStep {
  return workflowByFamily.get(familyId) ?? 'DETECT_LINKS';
}

export function setWorkflowStep(familyId: string, step: ReconstructionWorkflowStep): void {
  workflowByFamily.set(familyId, step);
}

export function saveSelectedNode(familyId: string, nodeId: string): void {
  selectedNodeByFamily.set(familyId, nodeId);
}

export function getSavedSelectedNode(familyId: string): string | null {
  return selectedNodeByFamily.get(familyId) ?? null;
}

export function applyApprovalToFamily(family: PageFamily): PageFamily {
  const approved = getFamilyApprovals(family.familyId);
  const approvedIds = new Set(approved.filter((a) => a.designApproved).map((a) => a.nodeId));
  return {
    ...family,
    status: isFamilyApproved(family.familyId)
      ? 'DESIGN_IN_PROGRESS'
      : isFamilyStructureConfirmed(family.familyId)
        ? 'STRUCTURE_CONFIRMED'
        : family.status,
    approvedAt: isFamilyApproved(family.familyId) ? new Date().toISOString() : family.approvedAt,
    nodes: family.nodes.map((n) =>
      approvedIds.has(n.nodeId)
        ? { ...n, designStatus: 'APPROVED', statusLabel: 'APPROVED', statusVisual: 'ready' as const }
        : n,
    ),
  };
}
