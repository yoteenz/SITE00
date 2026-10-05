import type {
  MobileBlueprintTwinVisual,
  MobileImplementationRender,
  MobileTwinProviderJobRecord,
} from './types.js';

export type IngestedMobileTwinVisualArtifact = {
  artifactId: string;
  runId: string;
  providerJobId: string;
  provider: 'FAL';
  model: string;
  representationMode: 'IMPLEMENTATION_RENDER' | 'LIGHT_TECHNICAL_BLUEPRINT';
  providerOutputUrl: string;
  persistedAssetUrl: string;
  outputHash: string;
  width: number;
  height: number;
  compositionStateId: string;
  compositionHash: string;
  status: 'READY';
  createdAt: string;
};

export function ingestMobileTwinActualResult(input: {
  runId: string;
  render: MobileImplementationRender;
  providerJobRef: string;
  model: string;
}): IngestedMobileTwinVisualArtifact {
  return {
    artifactId: input.render.id,
    runId: input.runId,
    providerJobId: input.providerJobRef,
    provider: 'FAL',
    model: input.model,
    representationMode: 'IMPLEMENTATION_RENDER',
    providerOutputUrl: input.render.renderImageUri,
    persistedAssetUrl: input.render.renderImageUri,
    outputHash: input.render.renderImageHash,
    width: input.render.widthPx,
    height: input.render.heightPx,
    compositionStateId: input.render.compositionStateId,
    compositionHash: input.render.compositionHash,
    status: 'READY',
    createdAt: input.render.createdAt,
  };
}

export function ingestMobileTwinBlueprintResult(input: {
  runId: string;
  blueprint: MobileBlueprintTwinVisual;
  providerJobRef: string;
  model: string;
}): IngestedMobileTwinVisualArtifact {
  return {
    artifactId: input.blueprint.id,
    runId: input.runId,
    providerJobId: input.providerJobRef,
    provider: 'FAL',
    model: input.model,
    representationMode: 'LIGHT_TECHNICAL_BLUEPRINT',
    providerOutputUrl: input.blueprint.twinImageUri,
    persistedAssetUrl: input.blueprint.twinImageUri,
    outputHash: input.blueprint.twinImageHash,
    width: 0,
    height: 0,
    compositionStateId: input.blueprint.compositionStateId,
    compositionHash: input.blueprint.compositionHash,
    status: 'READY',
    createdAt: input.blueprint.createdAt,
  };
}

export function buildProviderJobRecord(input: {
  id: string;
  runId: string;
  leg: 'ACTUAL' | 'BLUEPRINT';
  providerJobRef: string;
  model: string;
  representationMode: 'IMPLEMENTATION_RENDER' | 'LIGHT_TECHNICAL_BLUEPRINT';
  compositionStateId: string;
  compositionHash: string;
  status: 'COMPLETE' | 'FAILED';
}): MobileTwinProviderJobRecord {
  return {
    id: input.id,
    runId: input.runId,
    leg: input.leg,
    provider: 'FAL',
    model: input.model,
    representationMode: input.representationMode,
    providerJobRef: input.providerJobRef,
    compositionStateId: input.compositionStateId,
    compositionHash: input.compositionHash,
    startedAt: new Date().toISOString(),
    status: input.status,
  };
}
