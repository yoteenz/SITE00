/**
 * JURNL canonical product tree — 16 families (source: founder sprint P0.JURNL.MONETIZATION-FOUNDATION1 §29).
 * Data only. F02 is SETUP (settles the F01 transition-authority "FINANCE" label conflict, J-01).
 */

export const JURNL_PRODUCT_TREE = [
  { familyId: 'F01', name: 'ENTRY', status: 'IMPLEMENTATION_PROOF' },
  { familyId: 'F02', name: 'SETUP', status: 'IMPLEMENTATION_PROOF' },
  { familyId: 'F03', name: 'TODAY', status: 'IMPLEMENTATION_PROOF' },
  { familyId: 'F04', name: 'ACTIVITY', status: 'IMPLEMENTATION_PROOF' },
  { familyId: 'F05', name: 'MONEY', status: 'STRUCTURE_ONLY' },
  { familyId: 'F06', name: 'INCOME', status: 'STRUCTURE_ONLY' },
  { familyId: 'F07', name: 'UPCOMING', status: 'STRUCTURE_ONLY' },
  { familyId: 'F08', name: 'PLAN', status: 'STRUCTURE_ONLY' },
  { familyId: 'F09', name: 'SAFE TO SPEND', status: 'STRUCTURE_ONLY' },
  { familyId: 'F10', name: 'PURCHASES', status: 'STRUCTURE_ONLY' },
  { familyId: 'F11', name: 'TRIPS', status: 'STRUCTURE_ONLY' },
  { familyId: 'F12', name: 'CREDIT', status: 'STRUCTURE_ONLY' },
  { familyId: 'F13', name: 'PAYDOWN', status: 'STRUCTURE_ONLY' },
  { familyId: 'F14', name: 'GOALS', status: 'STRUCTURE_ONLY' },
  { familyId: 'F15', name: 'AHEAD', status: 'STRUCTURE_ONLY' },
  { familyId: 'F16', name: 'RECORDS', status: 'STRUCTURE_ONLY' },
] as const;

export type JurnlFamilyId = (typeof JURNL_PRODUCT_TREE)[number]['familyId'];
export const JURNL_FAMILY_IDS = JURNL_PRODUCT_TREE.map((f) => f.familyId) as readonly JurnlFamilyId[];
export const jurnlFamilyName = (id: string) => JURNL_PRODUCT_TREE.find((f) => f.familyId === id)?.name ?? null;
