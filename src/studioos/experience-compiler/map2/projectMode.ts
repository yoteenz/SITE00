import type { ProjectExperienceMode } from './map2Types';

export function resolveProjectMode(input: {
  has_existing_product: boolean;
  preserve_product_truth: boolean;
  requires_reconcept: boolean;
}): ProjectExperienceMode {
  if (!input.has_existing_product) return 'GREENFIELD';
  if (input.preserve_product_truth && !input.requires_reconcept) return 'INGEST';
  return 'HYBRID';
}

export const MODE_PIPELINES: Record<ProjectExperienceMode, string[]> = {
  GREENFIELD: [
    'PROJECT_INTELLIGENCE',
    'CREATIVE_CONCEPT_SET',
    'GATE_0',
    'EXPERIENCE_GRAPH',
    'GATE_A',
    'FAMILIES',
    'SURFACE_EXPRESSIONS',
    'GATE_B',
    'AUTHORITY_PLAN',
    'GATE_C',
    'OPENART_BATCH',
    'AUTHORITY_PACK',
    'SONNET_BATCHES',
  ],
  INGEST: [
    'FORENSIC_GRAPH',
    'GAP_ANALYSIS',
    'OPTIONAL_CREATIVE_EXTENSIONS',
    'FOUNDER_GATES',
    'AUTHORITY_SYSTEM',
    'PRODUCTION',
  ],
  HYBRID: ['INGEST', 'PRESERVE_REPLACE_REIMAGINE', 'CREATIVE_CONCEPT_SET', 'GATE_0', 'EXPERIENCE_GRAPH'],
};
