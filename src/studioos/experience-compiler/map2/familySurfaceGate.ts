import type { FamilySurfaceGate } from './map2Types';

export function createGateB(): FamilySurfaceGate {
  return { gate_id: 'GATE_B_FAMILY_SURFACE', status: 'PENDING', approved_family_ids: [], history: [] };
}

export function approveFamiliesAndSurfaces(gate: FamilySurfaceGate, familyIds: string[]): FamilySurfaceGate {
  gate.approved_family_ids = [...new Set(familyIds)];
  gate.status = 'APPROVED';
  gate.history.push({ action: 'APPROVE', at: new Date().toISOString(), detail: familyIds.join(',') });
  return gate;
}

export function assertAuthorityPlanAllowed(gateB: FamilySurfaceGate): void {
  if (gateB.status !== 'APPROVED' || gateB.approved_family_ids.length === 0) {
    throw new Error('GATE_B_NOT_APPROVED: visual authority plan blocked until family + surface approval');
  }
}
