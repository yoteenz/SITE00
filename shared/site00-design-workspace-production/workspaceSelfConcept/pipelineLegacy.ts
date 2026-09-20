import type { WorkspaceSelfCreativePipelineSet, WorkspaceSelfPipelineSchemaVersion } from './creativePipelineTypes.js';
import type { WorkspaceSelfConceptSet } from './generationTypes.js';

export const WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE = 'SINGLE_CONCEPT_MULTI_RENDITION' as const;
export const WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY = 'LEGACY_MULTI_CONCEPT' as const;

export function inferPipelineSchemaVersion(
  pipeline: WorkspaceSelfCreativePipelineSet | null | undefined,
): WorkspaceSelfPipelineSchemaVersion | null {
  if (!pipeline) return null;
  if (pipeline.schemaVersion) return pipeline.schemaVersion;
  if (pipeline.slots?.length) return WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY;
  if (pipeline.creativeContext && pipeline.gpt2AuthorityConcept) return WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE;
  return null;
}

export function inferConceptSetSchemaVersion(
  conceptSet: WorkspaceSelfConceptSet | null | undefined,
): WorkspaceSelfPipelineSchemaVersion | null {
  if (!conceptSet) return null;
  return conceptSet.schemaVersion ?? WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY;
}

export function isLegacyMultiConceptPipeline(
  pipeline: WorkspaceSelfCreativePipelineSet | null | undefined,
): boolean {
  return inferPipelineSchemaVersion(pipeline) === WORKSPACE_SELF_PIPELINE_SCHEMA_LEGACY;
}
