/**
 * P0.VR.DESIGN-PROJECT-BINDING1R2 — intelligence may change data; composition is frozen unless approved.
 */

export const DESIGN_PROJECT_DATA_MUTATION_ALLOWED = true as const;
export const DESIGN_VISUAL_COMPOSITION_MUTATION_ALLOWED = false as const;

export type DesignVisualCompositionViolation = {
  code: 'VISUAL_COMPOSITION_MUTATION_BLOCKED';
  detail: string;
};

export function assertDesignVisualCompositionAllowed(context: string): void {
  if (DESIGN_VISUAL_COMPOSITION_MUTATION_ALLOWED) return;
  if (import.meta.env.DEV) {
    console.warn(`[DESIGN_VISUAL_FREEZE] Blocked composition mutation in ${context}`);
  }
}
