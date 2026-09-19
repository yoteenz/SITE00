import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import type {
  ForensicBlueprintIngestionReceipt,
  MobileTwinForensicBlueprintArtifact,
} from './forensicIngestionTypes.js';
import { FORENSIC_BLUEPRINT_INGESTION_FAILED, FORENSIC_BLUEPRINT_MISSING } from './constants.js';

export function getActiveForensicBlueprintForPackage(input: {
  packageId: string;
  authority: ForensicUiBlueprintAuthority | null | undefined;
}): MobileTwinForensicBlueprintArtifact | null {
  if (!input.authority) return null;
  return {
    id: `mfba-${input.authority.id}`,
    packageId: input.packageId,
    artifactKind: 'FORENSIC_BLUEPRINT_IMPLEMENTATION_SPEC',
    contentUri: input.authority.blueprintImageUri,
    contentHash: input.authority.blueprintHash,
    sourceAuthorityId: input.authority.sourceActualAuthorityId,
    sourceActualHash: input.authority.sourceActualHash,
    classification: 'FORENSIC_BLUEPRINT_MACHINE_USABLE_WITH_VALIDATION',
    status: 'ACTIVE',
    ingestedAt: input.authority.generatedAt,
  };
}

export function assertForensicBlueprintAvailableIfConfigured(
  artifact: MobileTwinForensicBlueprintArtifact | null,
): asserts artifact is MobileTwinForensicBlueprintArtifact {
  if (!artifact) throw new Error(FORENSIC_BLUEPRINT_MISSING);
  if (artifact.classification === 'FORENSIC_BLUEPRINT_REJECTED') {
    throw new Error(FORENSIC_BLUEPRINT_INGESTION_FAILED);
  }
}

export function buildForensicBlueprintIngestionReceipt(input: {
  packageId: string;
  artifact: MobileTwinForensicBlueprintArtifact;
}): ForensicBlueprintIngestionReceipt {
  return {
    id: `fbir-${fnv1aHex(`${input.packageId}:${input.artifact.contentHash}`).slice(0, 12)}`,
    packageId: input.packageId,
    forensicBlueprintHash: input.artifact.contentHash,
    classification: input.artifact.classification,
    ingestedAt: new Date().toISOString(),
    noRegeneration: true,
  };
}
