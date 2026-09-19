import type { TwinGenerationMode } from './types.js';

export const DEFAULT_TWIN_GENERATION_MODE: TwinGenerationMode = 'FORENSIC_REPLICATION_V1';

export function resolveTwinGenerationMode(mode: string | null | undefined): TwinGenerationMode {
  return mode === 'CONCEPT_DIRECTED_V2' ? 'CONCEPT_DIRECTED_V2' : 'FORENSIC_REPLICATION_V1';
}

export function isConceptDirectedV2(mode: TwinGenerationMode): boolean {
  return mode === 'CONCEPT_DIRECTED_V2';
}
