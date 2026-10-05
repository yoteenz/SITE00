/**
 * Post-submit Identity commercial activation (intake → authorize → project bootstrap).
 */

import type { IdentityCommercialState } from './types.js';

export type IdentityIntakeActivationRecord = {
  id: string;
  email: string | null;
  projectId: string | null;
  draftPayload: Record<string, unknown>;
};
import {
  identityTierPurchaseBlockedByFounderDecision,
  IDENTITY_TIER_PURCHASE_DECISION_ID,
} from './founderDecisionGate.js';
import {
  authorizeIdentityCommercial,
  validateIdentityIntakePayload,
} from './pipeline.js';
import { getIdentityProductionSnapshot, setIdentityProductionSnapshot } from './runtimeStore.js';

export type IdentityCommercialActivationResult = {
  ok: boolean;
  validationErrors: readonly string[];
  state: IdentityCommercialState | null;
  projectId: string | null;
  projectSlug: string | null;
  projectCreated: boolean;
  founderDecisionBlocked: boolean;
  founderDecisionId: string | null;
};

export function applyFounderDecisionBlockToSnapshot(
  intakeId: string,
  decisionId: string,
): void {
  const snap = getIdentityProductionSnapshot(intakeId);
  if (!snap) return;
  setIdentityProductionSnapshot(intakeId, {
    ...snap,
    founderDecisionBlockId: decisionId,
  });
}

export function buildActivationResultFromState(
  state: IdentityCommercialState,
  extras: Partial<IdentityCommercialActivationResult> = {},
): IdentityCommercialActivationResult {
  return {
    ok: true,
    validationErrors: [],
    state,
    projectId: state.bootstrap.projectId,
    projectSlug: state.bootstrap.projectSlug,
    projectCreated: false,
    founderDecisionBlocked: state.bootstrap.blockedByFounderDecisionId != null,
    founderDecisionId: state.bootstrap.blockedByFounderDecisionId,
    ...extras,
  };
}

export function validateIdentityIntakeForCommercialActivation(
  draftPayload: Record<string, unknown>,
): { ok: boolean; errors: readonly string[] } {
  return validateIdentityIntakePayload(draftPayload);
}

export function authorizeStateAfterValidIntake(
  state: IdentityCommercialState,
  intakeId: string,
): IdentityCommercialState {
  return authorizeIdentityCommercial(state, {
    authorizationRef: `submit-${intakeId}`,
    method: 'QUOTE_APPROVED',
  });
}

export function tierFounderBlockForSelection(
  state: IdentityCommercialState,
): typeof IDENTITY_TIER_PURCHASE_DECISION_ID | null {
  return identityTierPurchaseBlockedByFounderDecision(state.selection);
}

export function mergeFounderBlockIntoCommercialState(
  state: IdentityCommercialState,
  decisionId: string,
): IdentityCommercialState {
  return {
    ...state,
    bootstrap: {
      ...state.bootstrap,
      blockedByFounderDecisionId: decisionId,
    },
  };
}

/** Server-side orchestration entry (imported from api/_lib only). */
export type IdentityIntakeActivationDeps = {
  ensureCommercial: (intake: IdentityIntakeActivationRecord) => Promise<IdentityCommercialState>;
  authorizeCommercial: (intake: IdentityIntakeActivationRecord, ref: string) => Promise<IdentityCommercialState>;
  convertToProject: (
    intake: IdentityIntakeActivationRecord,
    actorEmail?: string,
  ) => Promise<{ projectId: string; projectSlug: string | null; created: boolean }>;
  saveState: (intakeId: string, state: IdentityCommercialState) => Promise<void>;
};

export async function activateIdentityCommercialAfterIntakeSubmit(
  intake: IdentityIntakeActivationRecord,
  deps: IdentityIntakeActivationDeps,
): Promise<IdentityCommercialActivationResult> {
  const draft = intake.draftPayload as Record<string, unknown>;
  const validation = validateIdentityIntakeForCommercialActivation(draft);
  if (!validation.ok) {
    return {
      ok: false,
      validationErrors: validation.errors,
      state: null,
      projectId: intake.projectId,
      projectSlug: null,
      projectCreated: false,
      founderDecisionBlocked: false,
      founderDecisionId: null,
    };
  }

  let state = await deps.ensureCommercial(intake);
  state = await deps.authorizeCommercial(intake, `submit-${intake.id}`);

  const founderBlock = tierFounderBlockForSelection(state);
  if (founderBlock) {
    state = mergeFounderBlockIntoCommercialState(state, founderBlock);
    await deps.saveState(intake.id, state);
    applyFounderDecisionBlockToSnapshot(intake.id, founderBlock);
    return buildActivationResultFromState(state, {
      founderDecisionBlocked: true,
      founderDecisionId: founderBlock,
    });
  }

  if (intake.projectId) {
    return buildActivationResultFromState(state, { projectId: intake.projectId });
  }

  const actor = intake.email ?? 'identity-submit@site00.local';
  const converted = await deps.convertToProject(intake, actor);
  state = {
    ...state,
    bootstrap: {
      ...state.bootstrap,
      projectId: converted.projectId,
      projectSlug: converted.projectSlug,
    },
  };
  await deps.saveState(intake.id, state);

  return buildActivationResultFromState(state, {
    projectId: converted.projectId,
    projectSlug: converted.projectSlug,
    projectCreated: converted.created,
  });
}
