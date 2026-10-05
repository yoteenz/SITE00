/**
 * JURNL canonical product tree — 16 families (source: founder sprint P0.JURNL.MONETIZATION-FOUNDATION1 §29).
 * Data only. F02 is SETUP (settles the F01 transition-authority "FINANCE" label conflict, J-01).
 */

export const JURNL_PRODUCT_TREE = [
  { familyId: 'F01', name: 'ENTRY', status: 'IMPLEMENTATION_PROOF' },
  { familyId: 'F02', name: 'SETUP', status: 'NOT_STARTED' },
  { familyId: 'F03', name: 'TODAY', status: 'NOT_STARTED' },
  { familyId: 'F04', name: 'ACTIVITY', status: 'NOT_STARTED' },
  { familyId: 'F05', name: 'MONEY', status: 'NOT_STARTED' },
  { familyId: 'F06', name: 'INCOME', status: 'NOT_STARTED' },
  { familyId: 'F07', name: 'UPCOMING', status: 'NOT_STARTED' },
  { familyId: 'F08', name: 'PLAN', status: 'NOT_STARTED' },
  { familyId: 'F09', name: 'SAFE TO SPEND', status: 'NOT_STARTED' },
  { familyId: 'F10', name: 'PURCHASES', status: 'NOT_STARTED' },
  { familyId: 'F11', name: 'TRIPS', status: 'NOT_STARTED' },
  { familyId: 'F12', name: 'CREDIT', status: 'NOT_STARTED' },
  { familyId: 'F13', name: 'PAYDOWN', status: 'NOT_STARTED' },
  { familyId: 'F14', name: 'GOALS', status: 'NOT_STARTED' },
  { familyId: 'F15', name: 'AHEAD', status: 'NOT_STARTED' },
  { familyId: 'F16', name: 'RECORDS', status: 'NOT_STARTED' },
] as const;

export type JurnlFamilyId = (typeof JURNL_PRODUCT_TREE)[number]['familyId'];
export const JURNL_FAMILY_IDS = JURNL_PRODUCT_TREE.map((f) => f.familyId) as readonly JurnlFamilyId[];
export const jurnlFamilyName = (id: string) => JURNL_PRODUCT_TREE.find((f) => f.familyId === id)?.name ?? null;
