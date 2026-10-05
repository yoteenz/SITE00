import type { GenerationClass, GenerationIntent } from './types.js';

const DERIVED_CLASSES_REQUIRING_REFERENCE: readonly GenerationClass[] = [
  'SCREEN_CHILD',
  'SCREEN_GRANDCHILD',
  'STATE_AUTHORITY',
  'INTERACTION_AUTHORITY',
  'ENVIRONMENT_PLATE',
  'BOTANICAL',
  'BRAND_LOCKUP',
  'MATERIAL',
  'OBJECT',
  'ICON',
  'DECORATIVE',
  'ILLUSTRATION',
  'SPECIAL_PANEL',
  'SPECIAL_CONTROL',
  'SIDEKICK_DERIVED',
];

/** SCREEN_PARENT may be net-new or reference-guided depending on intent and registry. */
export function isReferenceRequiredByClass(generationClass: GenerationClass, generationIntent: GenerationIntent): boolean {
  if (DERIVED_CLASSES_REQUIRING_REFERENCE.includes(generationClass)) return true;
  if (generationClass === 'SCREEN_PARENT' && generationIntent === 'DERIVED') return true;
  if (generationClass === 'NET_NEW_AUTHORITY' && generationIntent === 'NEW_AUTHORITY_REQUIRED') return false;
  if (generationIntent === 'NEW_AUTHORITY_REQUIRED' || generationIntent === 'NEW_ASSET_REQUIRED') return false;
  if (generationClass === 'SCREEN_PARENT') return false;
  return generationIntent === 'DERIVED';
}

export function classifyReferenceRequired(
  generationClass: GenerationClass,
  generationIntent: GenerationIntent,
  registryHasMatch: boolean,
): boolean {
  const byClass = isReferenceRequiredByClass(generationClass, generationIntent);
  if (generationIntent === 'NEW_AUTHORITY_REQUIRED' || generationIntent === 'NEW_ASSET_REQUIRED') {
    return registryHasMatch;
  }
  return byClass;
}
