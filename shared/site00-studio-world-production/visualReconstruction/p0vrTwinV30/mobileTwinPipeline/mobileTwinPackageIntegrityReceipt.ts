import type { MobileTwinPackage } from './types.js';

export const PACKAGE_ARTIFACT_MISSING = 'PACKAGE_ARTIFACT_MISSING' as const;

export type MobileTwinPackageIntegrityReceipt = {
  id: string;
  packageId: string;
  compositionPresent: boolean;
  visualPairPresent: boolean;
  surgicalBlueprintPresent: boolean;
  objectMapPresent: boolean;
  assetManifestPresent: boolean;
  functionMapPresent: boolean;
  ownershipMapPresent: boolean;
  primitiveContractPresent: boolean;
  traceabilityPresent: boolean;
  validationReceiptsPresent: boolean;
  missingArtifactIds: { id: string; label: string }[];
  result: 'PASS' | 'FAIL';
  createdAt: string;
};

export function buildMobileTwinPackageIntegrityReceipt(input: {
  pkg: MobileTwinPackage;
  artifactsById: Record<string, unknown>;
  visualPairPresent: boolean;
}): MobileTwinPackageIntegrityReceipt {
  const required: { id: string; label: string }[] = [
    { id: input.pkg.compositionStateId, label: 'CompositionState' },
    { id: input.pkg.surgicalBlueprintId, label: 'SurgicalBlueprint' },
    { id: input.pkg.objectMapId, label: 'ObjectMap' },
    { id: input.pkg.canonicalAssetManifestId, label: 'AssetManifest' },
    { id: input.pkg.functionBindingMapId, label: 'FunctionMap' },
    { id: input.pkg.hostProjectOwnershipMapId, label: 'OwnershipMap' },
    { id: input.pkg.implementationPrimitiveContractId, label: 'ImplementationPrimitiveContract' },
    { id: input.pkg.reverseTraceabilityMapId, label: 'TraceabilityMap' },
    { id: input.pkg.reconciliationReceiptId, label: 'ReconciliationReceipt' },
    { id: input.pkg.referenceTranslationFidelityReceiptId, label: 'ReferenceTranslationFidelityReceipt' },
    { id: input.pkg.twinFidelityReceiptId, label: 'TwinFidelityReceipt' },
  ];

  const missingArtifactIds = required.filter((r) => !input.artifactsById[r.id]);
  const validationReceiptsPresent =
    Boolean(input.artifactsById[input.pkg.reconciliationReceiptId]) &&
    Boolean(input.artifactsById[input.pkg.referenceTranslationFidelityReceiptId]) &&
    Boolean(input.artifactsById[input.pkg.twinFidelityReceiptId]);

  const flags = {
    compositionPresent: Boolean(input.artifactsById[input.pkg.compositionStateId]),
    surgicalBlueprintPresent: Boolean(input.artifactsById[input.pkg.surgicalBlueprintId]),
    objectMapPresent: Boolean(input.artifactsById[input.pkg.objectMapId]),
    assetManifestPresent: Boolean(input.artifactsById[input.pkg.canonicalAssetManifestId]),
    functionMapPresent: Boolean(input.artifactsById[input.pkg.functionBindingMapId]),
    ownershipMapPresent: Boolean(input.artifactsById[input.pkg.hostProjectOwnershipMapId]),
    primitiveContractPresent: Boolean(input.artifactsById[input.pkg.implementationPrimitiveContractId]),
    traceabilityPresent: Boolean(input.artifactsById[input.pkg.reverseTraceabilityMapId]),
  };

  const result =
    missingArtifactIds.length === 0 && input.visualPairPresent && validationReceiptsPresent ? 'PASS' : 'FAIL';

  return {
    id: `mpir-${input.pkg.id}`,
    packageId: input.pkg.id,
    visualPairPresent: input.visualPairPresent,
    validationReceiptsPresent,
    missingArtifactIds,
    ...flags,
    result,
    createdAt: new Date().toISOString(),
  };
}
