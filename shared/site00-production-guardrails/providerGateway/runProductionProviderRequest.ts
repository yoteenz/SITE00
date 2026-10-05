import { precheckGenerationDispatch } from '../precheckGenerationDispatch.js';
import type { GenerationRequest, PrecheckResult } from '../types.js';
import type { ValidateOptions } from '../validateGenerationReferenceBinding.js';
import { buildCostReceipt, type CostReceiptWriter } from './costReceipt.js';
import {
  consumeSpendAuthorization,
  rejectCallerOnlySpendConfirmation,
  validateSpendAuthorization,
} from './spendAuthorization.js';

export type ProductionProviderGatewayRequest = GenerationRequest & {
  requestId: string;
  spendAuthorizationId?: string | null;
  /** Legacy body flag — ignored unless paired with server authorization. */
  founderConfirmedSpend?: boolean;
  requestedBy?: string;
  purpose?: string;
  lineageParent?: string | null;
  /** UI occupancy zones for JURNL full-page authorities (stored on receipt metadata). */
  uiOccupancy?: Record<string, unknown>;
  paidGeneration?: boolean;
};

export type ProductionGatewayOptions = ValidateOptions & {
  allowPreAuthorityExploration?: boolean;
  costReceiptWriter?: CostReceiptWriter;
  /** When false, skip spend gate (non-paid / dry-run classification). */
  requireSpendAuthorization?: boolean;
};

export type ProductionGatewayIncident = {
  kind: string;
  blockedReason: string | null;
  requestId: string;
  projectId: string;
  at: string;
};

const incidents: ProductionGatewayIncident[] = [];

export function resetProductionGatewayIncidentsForTests(): void {
  incidents.length = 0;
}

export function listProductionGatewayIncidentsForTests(): readonly ProductionGatewayIncident[] {
  return incidents;
}

function recordIncident(kind: string, precheck: PrecheckResult, requestId: string): void {
  incidents.push({
    kind,
    blockedReason: precheck.blockedReason,
    requestId,
    projectId: precheck.classification.projectId,
    at: new Date().toISOString(),
  });
}

export type ProductionProviderDispatchFn<T> = (precheck: PrecheckResult) => Promise<T>;

export type ProductionProviderGatewayResult<T> = {
  precheck: PrecheckResult;
  spendAuthorized: boolean;
  result?: T;
  receiptId?: string;
};

/**
 * Canonical paid / generative provider dispatch path for SITE 00 production.
 * Runs spend authorization → guardrail precheck (reference binding, expression, authority-first) → provider adapter.
 */
export async function runProductionProviderRequest<T>(
  request: ProductionProviderGatewayRequest,
  options: ProductionGatewayOptions,
  dispatch: ProductionProviderDispatchFn<T>,
): Promise<ProductionProviderGatewayResult<T>> {
  const paid = request.paidGeneration !== false;
  const requireSpend = options.requireSpendAuthorization !== false && paid;

  if (requireSpend) {
    const callerOnly = rejectCallerOnlySpendConfirmation({
      founderConfirmedSpend: request.founderConfirmedSpend,
      spendAuthorizationId: request.spendAuthorizationId,
    });
    if (callerOnly) {
      const precheck: PrecheckResult = {
        classification: { ...request, referenceRequired: false },
        status: 'BLOCKED',
        dispatchAllowed: false,
        blockedReason: callerOnly.blockedReason,
        referenceRequired: false,
        referenceFound: false,
        referenceAttached: false,
        generationMode: request.generationMode,
        resolvedReference: null,
        referencePath: null,
        referenceAuthorityId: null,
        referenceStatus: null,
        creditsSpent: 0,
      };
      recordIncident('UNAUTHORIZED_SPEND', precheck, request.requestId);
      await options.costReceiptWriter?.write(
        buildCostReceipt({
          requestId: request.requestId,
          authorizationId: request.spendAuthorizationId ?? null,
          projectId: request.projectId,
          familyId: request.familyId,
          visualId: request.visualId,
          generationClass: request.generationClass,
          provider: request.provider,
          model: request.model,
          estimatedCredits: request.estimatedCostCredits ?? null,
          actualCredits: 0,
          spendKind: 'FAILED',
          status: 'BLOCKED',
          referenceAuthorityId: request.referenceAuthorityIdHint ?? null,
          metadata: { blockedReason: callerOnly.detail },
        }),
      );
      return { precheck, spendAuthorized: false };
    }
    const spend = validateSpendAuthorization(request.spendAuthorizationId, request);
    if (!spend.ok) {
      const precheck: PrecheckResult = {
        classification: { ...request, referenceRequired: false },
        status: 'BLOCKED',
        dispatchAllowed: false,
        blockedReason: spend.blockedReason,
        referenceRequired: false,
        referenceFound: false,
        referenceAttached: false,
        generationMode: request.generationMode,
        resolvedReference: null,
        referencePath: null,
        referenceAuthorityId: null,
        referenceStatus: null,
        creditsSpent: 0,
      };
      recordIncident('UNAUTHORIZED_SPEND', precheck, request.requestId);
      return { precheck, spendAuthorized: false };
    }
  }

  const precheck = precheckGenerationDispatch(request, options);

  if (!precheck.dispatchAllowed) {
    if (precheck.blockedReason === 'AUTHORITY_FIRST_REQUIRED') {
      recordIncident('AUTHORITY_FIRST_REQUIRED', precheck, request.requestId);
    }
    if (precheck.blockedReason === 'REFERENCE_BINDING_FAILURE_PREVENTED' || precheck.blockedReason === 'INVALID_GENERATION_MODE') {
      recordIncident('REFERENCE_BINDING_FAILURE', precheck, request.requestId);
    }
    await options.costReceiptWriter?.write(
      buildCostReceipt({
        requestId: request.requestId,
        authorizationId: request.spendAuthorizationId ?? null,
        projectId: request.projectId,
        familyId: request.familyId,
        visualId: request.visualId,
        generationClass: request.generationClass,
        provider: request.provider,
        model: request.model,
        estimatedCredits: request.estimatedCostCredits ?? null,
        actualCredits: 0,
        spendKind: 'FAILED',
        status: 'BLOCKED',
        referenceAuthorityId: precheck.referenceAuthorityId,
        metadata: { blockedReason: precheck.blockedReason },
      }),
    );
    return { precheck, spendAuthorized: requireSpend };
  }

  const result = await dispatch(precheck);
  if (requireSpend && request.spendAuthorizationId) {
    consumeSpendAuthorization(request.spendAuthorizationId);
  }

  const receipt = buildCostReceipt({
    requestId: request.requestId,
    authorizationId: request.spendAuthorizationId ?? null,
    projectId: request.projectId,
    familyId: request.familyId,
    visualId: request.visualId,
    generationClass: request.generationClass,
    provider: request.provider,
    model: request.model,
    estimatedCredits: request.estimatedCostCredits ?? null,
    actualCredits: request.estimatedCostCredits ?? null,
    spendKind: 'PRODUCTIVE',
    status: 'COMPLETED',
    referenceAuthorityId: precheck.referenceAuthorityId,
    environmentPlateOrigin:
      request.generationClass === 'ENVIRONMENT_PLATE' ? 'DERIVED_FROM_AUTHORITY' : undefined,
    plateAuthorityId: request.generationClass === 'ENVIRONMENT_PLATE' ? precheck.referenceAuthorityId : undefined,
    metadata: { purpose: request.purpose, uiOccupancy: request.uiOccupancy, lineageParent: request.lineageParent },
  });
  await options.costReceiptWriter?.write(receipt);

  return { precheck, spendAuthorized: requireSpend, result, receiptId: receipt.receiptId };
}
