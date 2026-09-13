import type { CreativeBrandContext } from './types.js';

export function buildNdxCreativeBrandContext(): CreativeBrandContext {
  return {
    projectIdentity: 'NDXBOOK — index book / cultural intelligence archive / founder pilot',
    editorialTone: 'editorial intelligence, archive publication, structured asymmetry, visual tension',
    methodology: 'GRAPHIC → PAGE → PRODUCT → WORLD',
    colorLanguage: ['black', 'white', 'lime accent (#b7f75f)', 'high contrast hero band'],
    typographicGrammar: [
      'condensed industrial sans headlines',
      'dense uppercase supporting copy',
      'small caps status labels',
      'lime accent rules and NDX overlays',
    ],
    compositionRules: [
      'image + data coexistence',
      'asymmetric hero with editorial left stack',
      'strong vertical dividers between bands',
      'compact status information',
    ],
    hostClientFirewall:
      'SITE 00 host shell (navigation, chrome, bottom nav) stays system-neutral; NDXBOOK client owns editorial typography, lime/black/white, imagery, and content composition.',
  };
}
