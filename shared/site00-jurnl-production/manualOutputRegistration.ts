import path from 'node:path';
import { checkReferenceFileHealth } from '../site00-production-guardrails/referenceFileHealth.js';
import { precheckGenerationDispatch } from '../site00-production-guardrails/precheckGenerationDispatch.js';
import type { JurnlLineageRecord } from './types.js';
import { jurnlRoleToGenerationClass, type JurnlProductionDispatchInput } from './types.js';
import { createJurnlFamilyLedgerCostReceiptWriter } from './familyLedgerWriter.js';
import { buildCostReceipt } from '../site00-production-guardrails/providerGateway/costReceipt.js';

export type ManualOutputRegistrationInput = {
  requestId: string;
  familyId: string;
  visualId: string;
  role: JurnlProductionDispatchInput['role'];
  generationMode: JurnlProductionDispatchInput['generationMode'];
  referenceAuthorityIdHint?: string | null;
  outputAbsolutePath: string;
  outputAssetId?: string | null;
  providerGenerationId?: string | null;
  actualCredits?: number | null;
  spendAuthorizationId?: string | null;
  derivationSourceType?: 'FULL_PAGE' | null;
};

export type ManualRegistrationResult =
  | { status: 'REGISTERED'; lineage: JurnlLineageRecord }
  | { status: 'BLOCKED'; blockedReason: string; detail?: string };

/** Register OpenArt/manual output — same guardrails as dispatch; cannot bypass canon rules. */
export async function registerJurnlManualProviderOutput(
  repoRoot: string,
  input: ManualOutputRegistrationInput,
): Promise<ManualRegistrationResult> {
  if (!checkReferenceFileHealth(input.outputAbsolutePath).ok) {
    return { status: 'BLOCKED', blockedReason: 'REFERENCE_FILE_CORRUPT', detail: 'Output file unhealthy' };
  }

  const pre = precheckGenerationDispatch(
    {
      visualId: input.visualId,
      projectId: 'JURNL',
      familyId: input.familyId,
      generationClass: jurnlRoleToGenerationClass(input.role),
      generationIntent: input.role === 'CONCEPT_EXPLORATION' ? 'NEW_ASSET_REQUIRED' : 'DERIVED',
      generationMode: input.generationMode,
      referenceAuthorityIdHint: input.referenceAuthorityIdHint,
      referenceInputAttached: Boolean(input.referenceAuthorityIdHint),
      derivationSourceType: input.derivationSourceType ?? (input.role === 'ENVIRONMENT_PLATE_DERIVATION' ? 'FULL_PAGE' : null),
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
    },
    { resolverContext: { repoRoot }, enforceFileHealth: false },
  );

  if (!pre.dispatchAllowed) {
    return { status: 'BLOCKED', blockedReason: pre.blockedReason ?? 'UNKNOWN', detail: 'Manual registration failed precheck' };
  }

  const lineage: JurnlLineageRecord = {
    requestId: input.requestId,
    receiptId: null,
    projectId: 'JURNL',
    familyId: input.familyId,
    visualId: input.visualId,
    screenId: null,
    assetId: input.outputAssetId ?? null,
    generationClass: jurnlRoleToGenerationClass(input.role),
    role: input.role,
    parentAuthorityId: input.referenceAuthorityIdHint ?? null,
    referenceAuthorityId: pre.referenceAuthorityId,
    plateAuthorityId: input.role === 'ENVIRONMENT_PLATE_DERIVATION' ? input.referenceAuthorityIdHint ?? null : null,
    environmentPlateOrigin: input.role === 'ENVIRONMENT_PLATE_DERIVATION' ? 'DERIVED_FROM_AUTHORITY' : undefined,
    provider: 'OpenArt',
    model: 'gpt-image-2-5-sunburst',
    generationMode: input.generationMode,
    outputPath: path.relative(repoRoot, input.outputAbsolutePath),
    outputAssetId: input.outputAssetId ?? null,
    status: 'READY_FOR_FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
    costReceiptId: null,
    spendAuthorizationId: input.spendAuthorizationId ?? null,
  };

  const writer = createJurnlFamilyLedgerCostReceiptWriter(repoRoot);
  await writer.writeLineage(lineage);
  await writer.write(
    buildCostReceipt({
      requestId: input.requestId,
      authorizationId: input.spendAuthorizationId ?? null,
      projectId: 'JURNL',
      familyId: input.familyId,
      visualId: input.visualId,
      generationClass: jurnlRoleToGenerationClass(input.role),
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      estimatedCredits: input.actualCredits ?? null,
      actualCredits: input.actualCredits ?? null,
      spendKind: 'PRODUCTIVE',
      status: 'COMPLETED',
      referenceAuthorityId: pre.referenceAuthorityId,
      metadata: { manual: true, providerGenerationId: input.providerGenerationId },
    }),
  );

  return { status: 'REGISTERED', lineage };
}
