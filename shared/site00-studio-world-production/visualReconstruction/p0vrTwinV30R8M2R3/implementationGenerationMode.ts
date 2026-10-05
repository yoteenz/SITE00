import { PATCH_EXISTING_PROHIBITED } from './constants.js';

export type ImplementationGenerationMode = 'PATCH_EXISTING' | 'FULL_TRANSLATION_REBUILD';

/** Production twin compile must rebuild visuals from translation — patch mode forbidden. */
export function resolveProductionImplementationGenerationMode(): ImplementationGenerationMode {
  return 'FULL_TRANSLATION_REBUILD';
}

export function assertGenerationModeAllowed(mode: ImplementationGenerationMode): void {
  if (mode === 'PATCH_EXISTING') {
    throw new Error(PATCH_EXISTING_PROHIBITED);
  }
}
