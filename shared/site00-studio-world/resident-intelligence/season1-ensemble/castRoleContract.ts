/**
 * Future-facing cast role contract shape — not a full legal/commercial system in ingest1.
 * Documents separation: resident identity persists; role instructions are temporary.
 */

export type CastRoleContractStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'UNSET';

export type CastRoleContract = {
  contractId: string;
  residentId: string;
  roleId: string;
  projectId: string;
  expressionId: string | null;
  scope: string | null;
  dates: { start: string | null; end: string | null };
  wardrobeOverride: string | null;
  appearanceOverride: string | null;
  performanceDirection: string | null;
  continuityRequirements: readonly string[];
  exclusivity: string | null;
  usage: string | null;
  disclosure: string | null;
  status: CastRoleContractStatus;
};
