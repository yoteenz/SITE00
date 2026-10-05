import { lookupFamilyOutputProject } from '../site00-production-guardrails/familyOutputProjects.js';
import { checkReferenceFileHealth } from '../site00-production-guardrails/referenceFileHealth.js';
import {
  createJsonlCostReceiptWriter,
  type CostReceiptWriter,
} from '../site00-production-guardrails/providerGateway/costReceipt.js';
import {
  runProductionProviderRequest,
  type ProductionProviderGatewayResult,
} from '../site00-production-guardrails/providerGateway/runProductionProviderRequest.js';
import { validateSpendAuthorization } from '../site00-production-guardrails/providerGateway/spendAuthorization.js';
import type { PrecheckResult } from '../site00-production-guardrails/types.js';
import { validateJurnlBudgetPrecheck } from './budgetPrecheck.js';
import { validateJurnlDistinctnessForCanonicalFinal } from './distinctnessGate.js';
import { createJurnlFamilyLedgerCostReceiptWriter } from './familyLedgerWriter.js';
import { checkJurnlIdempotency, recordJurnlIdempotency } from './idempotency.js';
import { loadJurnlOccupancyContract, parentAuthorityRequiresOccupancy } from './occupancyContract.js';
import type { JurnlDispatchTicket, JurnlLineageRecord, JurnlProductionDispatchInput } from './types.js';
import { jurnlRoleToGenerationClass } from './types.js';

export const JURNL_DEFAULT_PROVIDER = 'OpenArt';
export const JURNL_DEFAULT_MODEL = 'gpt-image-2-5-sunburst';

export type JurnlProductionDispatchResult = ProductionProviderGatewayResult<JurnlDispatchTicket | null> & {
  lineage?: JurnlLineageRecord;
  blockedDetail?: string;
};

function compositeReceiptWriter(repoRoot: string): CostReceiptWriter {
  const jsonl = createJsonlCostReceiptWriter(repoRoot);
  const family = createJurnlFamilyLedgerCostReceiptWriter(repoRoot);
  return {
    async write(receipt) {
      await jsonl.write(receipt);
      await family.write(receipt);
    },
  };
}

function buildLineage(
  input: JurnlProductionDispatchInput,
  precheck: PrecheckResult,
  receiptId: string | undefined,
  ticket: JurnlDispatchTicket | null,
): JurnlLineageRecord {
  const generationClass = jurnlRoleToGenerationClass(input.role);
  return {
    requestId: input.requestId,
    receiptId: receiptId ?? null,
    projectId: 'JURNL',
    familyId: input.familyId,
    visualId: input.visualId,
    screenId: input.screenId ?? null,
    assetId: input.assetId ?? null,
    generationClass,
    role: input.role,
    parentAuthorityId: input.sourceAuthorityId ?? null,
    referenceAuthorityId: precheck.referenceAuthorityId,
    plateAuthorityId: input.plateAuthorityId ?? precheck.referenceAuthorityId,
    environmentPlateOrigin:
      input.role === 'ENVIRONMENT_PLATE_DERIVATION' ? 'DERIVED_FROM_AUTHORITY'
      : input.role === 'CONCEPT_EXPLORATION' ? 'CONCEPT_EXPLORATION'
      : undefined,
    provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
    model: input.model ?? JURNL_DEFAULT_MODEL,
    generationMode: input.generationMode,
    outputPath: ticket?.referencePath ?? precheck.referencePath,
    outputAssetId: input.assetId ?? null,
    status: input.dryRun ? 'DRY_RUN' : 'READY_FOR_FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
    costReceiptId: receiptId ?? null,
    spendAuthorizationId: input.spendAuthorizationId,
  };
}

/**
 * Canonical JURNL paid generative path — all production agents must use this (OpenArt manual dispatch ticket after precheck).
 */
export async function dispatchJurnlProductionRequest(
  repoRoot: string,
  input: JurnlProductionDispatchInput,
): Promise<JurnlProductionDispatchResult> {
  const idem = checkJurnlIdempotency(input.idempotencyKey);
  if (!idem.ok) {
    const precheck: PrecheckResult = {
      classification: {
        visualId: input.visualId,
        projectId: 'JURNL',
        familyId: input.familyId,
        generationClass: jurnlRoleToGenerationClass(input.role),
        generationIntent: input.generationIntent,
        generationMode: input.generationMode,
        provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
        model: input.model ?? JURNL_DEFAULT_MODEL,
        referenceRequired: false,
      },
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: 'UNAUTHORIZED_SPEND',
      referenceRequired: false,
      referenceFound: false,
      referenceAttached: false,
      generationMode: input.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: null,
      referenceStatus: null,
      creditsSpent: 0,
    };
    return { precheck, spendAuthorized: false, blockedDetail: `Idempotency key already used: ${idem.priorRequestId}` };
  }

  const canonicalFinal = input.canonicalFinal !== false;
  const distinctness = validateJurnlDistinctnessForCanonicalFinal(repoRoot, input.familyId, {
    canonicalFinal,
    role: input.role,
  });
  if (distinctness.status === 'BLOCKED') {
    const precheck: PrecheckResult = {
      classification: {
        visualId: input.visualId,
        projectId: 'JURNL',
        familyId: input.familyId,
        generationClass: jurnlRoleToGenerationClass(input.role),
        generationIntent: input.generationIntent,
        generationMode: input.generationMode,
        provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
        model: input.model ?? JURNL_DEFAULT_MODEL,
        referenceRequired: false,
      },
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: distinctness.blockedReason,
      referenceRequired: false,
      referenceFound: false,
      referenceAttached: false,
      generationMode: input.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: null,
      referenceStatus: null,
      creditsSpent: 0,
    };
    return { precheck, spendAuthorized: false, blockedDetail: distinctness.detail };
  }

  let uiOccupancy: Record<string, unknown> | undefined;
  if (parentAuthorityRequiresOccupancy(input.role)) {
    const occ = loadJurnlOccupancyContract(repoRoot, input.familyId);
    if (!occ.ok) {
      const precheck: PrecheckResult = {
        classification: {
          visualId: input.visualId,
          projectId: 'JURNL',
          familyId: input.familyId,
          generationClass: 'SCREEN_PARENT',
          generationIntent: input.generationIntent,
          generationMode: input.generationMode,
          provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
          model: input.model ?? JURNL_DEFAULT_MODEL,
          referenceRequired: false,
        },
        status: 'BLOCKED',
        dispatchAllowed: false,
        blockedReason: 'PLATE_OCCUPANCY_REQUIRED',
        referenceRequired: false,
        referenceFound: false,
        referenceAttached: false,
        generationMode: input.generationMode,
        resolvedReference: null,
        referencePath: null,
        referenceAuthorityId: null,
        referenceStatus: null,
        creditsSpent: 0,
      };
      return { precheck, spendAuthorized: false, blockedDetail: occ.detail };
    }
    uiOccupancy = { ...occ.contract, occupancy_file: occ.filePath };
  }

  const referenceAttached =
    Boolean(input.referenceAbsolutePath && checkReferenceFileHealth(input.referenceAbsolutePath).ok) ||
    Boolean(input.referenceAuthorityIdHint);

  const folderRow = lookupFamilyOutputProject('JURNL', input.familyId);
  if (!folderRow) {
    const precheck: PrecheckResult = {
      classification: {
        visualId: input.visualId,
        projectId: 'JURNL',
        familyId: input.familyId,
        generationClass: jurnlRoleToGenerationClass(input.role),
        generationIntent: input.generationIntent,
        generationMode: input.generationMode,
        provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
        model: input.model ?? JURNL_DEFAULT_MODEL,
        referenceRequired: false,
      },
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: 'FAMILY_PROJECT_REQUIRED',
      referenceRequired: false,
      referenceFound: false,
      referenceAttached: false,
      generationMode: input.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: null,
      referenceStatus: null,
      creditsSpent: 0,
    };
    return { precheck, spendAuthorized: false, blockedDetail: 'Family output project not registered' };
  }
  const folder = {
    providerProjectId: folderRow.providerProjectId,
    providerProjectName: folderRow.providerProjectName,
    repoFolder: folderRow.repoFolder,
  };

  const spend = validateSpendAuthorization(input.spendAuthorizationId, {
    projectId: 'JURNL',
    provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
    generationClass: jurnlRoleToGenerationClass(input.role),
    estimatedCostCredits: input.estimatedCostCredits,
  });
  if (!spend.ok) {
    const precheck: PrecheckResult = {
      classification: {
        visualId: input.visualId,
        projectId: 'JURNL',
        familyId: input.familyId,
        generationClass: jurnlRoleToGenerationClass(input.role),
        generationIntent: input.generationIntent,
        generationMode: input.generationMode,
        provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
        model: input.model ?? JURNL_DEFAULT_MODEL,
        referenceRequired: false,
      },
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: spend.blockedReason,
      referenceRequired: false,
      referenceFound: false,
      referenceAttached: false,
      generationMode: input.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: null,
      referenceStatus: null,
      creditsSpent: 0,
    };
    return { precheck, spendAuthorized: false, blockedDetail: spend.detail };
  }

  const budget = validateJurnlBudgetPrecheck({
    estimatedCostCredits: input.estimatedCostCredits,
    authorization: spend.record,
  });
  if (!budget.ok) {
    const precheck: PrecheckResult = {
      classification: {
        visualId: input.visualId,
        projectId: 'JURNL',
        familyId: input.familyId,
        generationClass: jurnlRoleToGenerationClass(input.role),
        generationIntent: input.generationIntent,
        generationMode: input.generationMode,
        provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
        model: input.model ?? JURNL_DEFAULT_MODEL,
        referenceRequired: false,
      },
      status: 'BLOCKED',
      dispatchAllowed: false,
      blockedReason: budget.blockedReason,
      referenceRequired: false,
      referenceFound: false,
      referenceAttached: false,
      generationMode: input.generationMode,
      resolvedReference: null,
      referencePath: null,
      referenceAuthorityId: null,
      referenceStatus: null,
      creditsSpent: 0,
    };
    return { precheck, spendAuthorized: false, blockedDetail: budget.detail };
  }

  const dryRun = input.dryRun === true;
  /** Dry-run still exercises spend + precheck; no external OpenArt execution. */
  const receiptWriter = compositeReceiptWriter(repoRoot);
  const familyLedger = createJurnlFamilyLedgerCostReceiptWriter(repoRoot);

  const gateway = await runProductionProviderRequest<JurnlDispatchTicket | null>(
    {
      requestId: input.requestId,
      visualId: input.visualId,
      projectId: 'JURNL',
      familyId: input.familyId,
      screenId: input.screenId,
      assetId: input.assetId,
      generationClass: jurnlRoleToGenerationClass(input.role),
      generationIntent: input.role === 'CONCEPT_EXPLORATION' ? 'NEW_ASSET_REQUIRED' : input.generationIntent,
      generationMode: input.generationMode,
      referenceAuthorityIdHint: input.referenceAuthorityIdHint,
      referenceInputAttached: referenceAttached,
      derivationSourceType: input.derivationSourceType ?? (input.role === 'ENVIRONMENT_PLATE_DERIVATION' ? 'FULL_PAGE' : null),
      provider: input.provider ?? JURNL_DEFAULT_PROVIDER,
      model: input.model ?? JURNL_DEFAULT_MODEL,
      providerProjectId: folder.providerProjectId,
      estimatedCostCredits: budget.estimatedCredits,
      spendAuthorizationId: input.spendAuthorizationId,
      requestedBy: input.requestedBy,
      purpose: input.purpose,
      lineageParent: input.lineageParent,
      uiOccupancy,
      paidGeneration: !dryRun,
    },
    {
      resolverContext: { repoRoot },
      enforceFileHealth: false,
      costReceiptWriter: receiptWriter,
      requireSpendAuthorization: !dryRun,
      allowPreAuthorityExploration: input.role === 'CONCEPT_EXPLORATION',
    },
    async (precheck) => {
      if (dryRun) {
        return {
          mode: 'DRY_RUN',
          openArtProjectId: folder.providerProjectId,
          openArtProjectName: folder.providerProjectName,
          repoFolder: folder.repoFolder,
          referencePath: precheck.referencePath,
          referenceAuthorityId: precheck.referenceAuthorityId,
          precheckPass: true,
        };
      }
      return {
        mode: 'MANUAL_OPENART_REQUIRED',
        openArtProjectId: folder.providerProjectId,
        openArtProjectName: folder.providerProjectName,
        repoFolder: folder.repoFolder,
        referencePath: precheck.referencePath,
        referenceAuthorityId: precheck.referenceAuthorityId,
        precheckPass: true,
      };
    },
  );

  if (gateway.precheck.dispatchAllowed && gateway.result) {
    recordJurnlIdempotency(input.idempotencyKey, input.requestId);
    const lineage = buildLineage(input, gateway.precheck, gateway.receiptId, gateway.result);
    await familyLedger.writeLineage(lineage);
    return { ...gateway, lineage };
  }

  return gateway;
}

/** Live path documentation for agents (no SDK — OpenArt manual after ticket). */
export const JURNL_PRODUCTION_LIVE_PATH = [
  'Agent / admin API → dispatchJurnlProductionRequest',
  '→ runProductionProviderRequest (spend + precheck + authority-first)',
  '→ OpenArt manual ticket OR dry-run mock',
  '→ registerJurnlManualProviderOutput after external generation',
  '→ family GENERATION_LEDGER gateway_lineage + gateway_receipts',
] as const;
