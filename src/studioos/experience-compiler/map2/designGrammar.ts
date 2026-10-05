/** Experience design grammar tokens — reusable across families (functional, not visual). */

export type DesignGrammarToken =
  | 'EDITORIAL_SPINE'
  | 'STEP_MACHINE'
  | 'LIVE_PREVIEW_STAGE'
  | 'ROOM_GRAPH'
  | 'CONCIERGE_OVERLAY'
  | 'MEMBERSHIP_VAULT';

export const FAMILY_GRAMMAR_MAP: Record<string, DesignGrammarToken[]> = {
  EDITORIAL_CONTENT: ['EDITORIAL_SPINE'],
  PRODUCT_ASSEMBLY_CONFIGURATOR: ['STEP_MACHINE', 'LIVE_PREVIEW_STAGE'],
  IMMERSIVE_DESTINATION: ['ROOM_GRAPH', 'CONCIERGE_OVERLAY'],
  MEMBERSHIP_LOUNGE: ['MEMBERSHIP_VAULT'],
};

export function grammarsForFamily(familyId: string): DesignGrammarToken[] {
  return FAMILY_GRAMMAR_MAP[familyId] ?? [];
}
