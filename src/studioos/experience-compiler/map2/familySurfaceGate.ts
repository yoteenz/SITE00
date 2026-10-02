import type { FamilySurfaceGate } from './map2Types';

export function createGateB(): FamilySurfaceGate {
  return {
    gate_id: 'GATE_B_FAMILY_SURFACE',
    status: 'PENDING',
    approved_family_ids: [],
    icon_expression_approved: false,
    micro_asset_expression_approved: false,
    history: [],
  };
}

export function approveFamiliesAndSurfaces(
  gate: FamilySurfaceGate,
  familyIds: string[],
  iconOpts?: { icon_expression_approved?: boolean; micro_asset_expression_approved?: boolean },
): FamilySurfaceGate {
  gate.approved_family_ids = [...new Set(familyIds)];
  gate.status = 'APPROVED';
  if (iconOpts?.icon_expression_approved) gate.icon_expression_approved = true;
  if (iconOpts?.micro_asset_expression_approved) gate.micro_asset_expression_approved = true;
  gate.history.push({ action: 'APPROVE', at: new Date().toISOString(), detail: familyIds.join(',') });
  return gate;
}

export function assertAuthorityPlanAllowed(gateB: FamilySurfaceGate): void {
  if (gateB.status !== 'APPROVED' || gateB.approved_family_ids.length === 0) {
    throw new Error('GATE_B_NOT_APPROVED: visual authority plan blocked until family + surface approval');
  }
  if (!gateB.icon_expression_approved) {
    throw new Error('GATE_B_ICON_NOT_APPROVED: page authority plan blocked until icon expression approved');
  }
}
