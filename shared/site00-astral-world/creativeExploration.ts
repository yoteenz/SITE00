/**
 * P0.E.1 creative exploration registration — NOT canon.
 */

export const ASTRAL_EXPERIENCE_CREATIVE_EXPLORATION = {
  truthLayer: 'CREATIVE_EXPLORATION' as const,
  sprint: 'P0.E.1',
  designAuthority: {
    referenceA: 'Desktop / wide-screen Astral World + Astréa experience board',
    referenceB: 'Mobile Astral World experience board',
  },
  fidelityDirective: 'KEEP_FUNCTION_REBUILD_LOOK',
  autoCanonized: false,
  note: 'Implementation is founder review surface — explicit canon promotion required.',
} as const;

export function isCreativeExplorationOnly(): true {
  return true;
}
