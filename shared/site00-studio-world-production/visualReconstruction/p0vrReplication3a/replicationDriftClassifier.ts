/**
 * P0.VR.REPLICATION.3A — Classify where drift enters the pipeline.
 */

import type {
  BlueprintRegionSnapshot,
  DetectedRegionSnapshot,
  GeneratedSourceSnapshot,
  ReconstructionDecisionSnapshot,
  RegionReferenceSnapshot,
  ReplicationDriftStage,
  ReplicationFailureLayer,
} from './types.js';

export function classifyDriftLayer(input: {
  reference: RegionReferenceSnapshot;
  detected: DetectedRegionSnapshot;
  blueprint: BlueprintRegionSnapshot | null;
  decision: ReconstructionDecisionSnapshot;
  source: GeneratedSourceSnapshot;
  assetMissing: boolean;
  renderMismatch: boolean;
}): { layer: ReplicationFailureLayer; stage: ReplicationDriftStage; evidence: string[] } {
  const evidence: string[] = [];
  const refRich = input.reference.majorChildBlocks.length >= 3 || input.reference.imageBlockCount >= 2;
  const detectPoor =
    input.detected.subregionCount < Math.min(2, input.reference.majorChildBlocks.length) ||
    input.detected.confidence === 'LOW' ||
    input.detected.features.length < input.reference.majorChildBlocks.length / 2;

  if (refRich && detectPoor) {
    evidence.push(
      `Reference has ${input.reference.majorChildBlocks.length} blocks / ${input.reference.imageBlockCount} images; detection: ${input.detected.summary}`,
    );
    return { layer: 'VISUAL_INTELLIGENCE', stage: 'VISUAL_DETECTION', evidence };
  }

  if (
    input.detected.subregionCount >= 3 &&
    input.blueprint &&
    input.blueprint.genericness === 'GENERIC'
  ) {
    evidence.push('Detection richer than blueprint storage (genericness GENERIC)');
    return { layer: 'ORCHESTRATION', stage: 'AUTHORITY_BLUEPRINT', evidence };
  }

  if (input.blueprint && input.decision.collapsedToGeneric) {
    evidence.push(`Decision collapsed structure: ${input.decision.notes}`);
    return { layer: 'EXECUTION_POLICY', stage: 'RECONSTRUCTION_DECISION', evidence };
  }

  if (input.decision.literalReplication && input.source.subregionCount < input.detected.subregionCount) {
    evidence.push(
      `Source ${input.source.elementSummary} has ${input.source.subregionCount} subregions vs ${input.detected.subregionCount} detected`,
    );
    return { layer: 'SOURCE_GENERATION', stage: 'SOURCE_GENERATION', evidence };
  }

  if (input.assetMissing) {
    evidence.push('Authority asset slot not bound or placeholder rendered');
    return { layer: 'ASSET_BINDING', stage: 'ASSET_BINDING', evidence };
  }

  if (input.renderMismatch) {
    evidence.push('Rendered bounds/styles diverge from generated source intent');
    return { layer: 'RENDERING', stage: 'BROWSER_RENDER', evidence };
  }

  if (input.decision.collapsedToGeneric) {
    evidence.push(input.decision.notes);
    return { layer: 'EXECUTION_POLICY', stage: 'RECONSTRUCTION_DECISION', evidence };
  }

  if (input.source.subregionCount < input.reference.majorChildBlocks.length / 2) {
    evidence.push(`Source simplified vs reference blocks (${input.source.subregionCount} vs ${input.reference.majorChildBlocks.length})`);
    return { layer: 'SOURCE_GENERATION', stage: 'SOURCE_GENERATION', evidence };
  }

  return { layer: 'UNKNOWN', stage: 'VISUAL_COMPARE', evidence: ['Drift present but layer ambiguous — review trace'] };
}
