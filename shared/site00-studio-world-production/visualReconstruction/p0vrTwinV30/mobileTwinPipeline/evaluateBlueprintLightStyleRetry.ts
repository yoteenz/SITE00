import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  LIGHT_BACKGROUND_PASS,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  type BlueprintVisualStyleReceipt,
} from './blueprintVisualStyleContract.js';
import { resolveLightBlueprintStyleReferenceUrl } from './resolveLightBlueprintStyleReference.js';
import type { MobileBlueprintTwinVisual, MobileImplementationRender } from './types.js';

export type BlueprintLightStyleRetryView = {
  /** Show founder-facing retry strip (mobile-first, above the fold). */
  showRetryStrip: boolean;
  /** Automated contract failure — emphasize warning copy. */
  urgentLightStyleRequired: boolean;
  /** Enable RETRY LIGHT BLUEPRINT button. */
  canRetryLightBlueprint: boolean;
  dominantBackground: BlueprintVisualStyleReceipt['dominantBackground'] | '—';
  styleReceiptResult: BlueprintVisualStyleReceipt['result'] | '—';
  styleAnchorConfigured: boolean;
  reasons: string[];
};

function loadStyleReceipt(
  blueprint: MobileBlueprintTwinVisual | null,
  artifactsById: Record<string, unknown>,
): BlueprintVisualStyleReceipt | null {
  if (!blueprint?.styleReceiptId) return null;
  return (artifactsById[blueprint.styleReceiptId] as BlueprintVisualStyleReceipt | undefined) ?? null;
}

/** Founder + UI gate for P6F1 blueprint-only light retry (review UX — no Actual regen). */
export function evaluateBlueprintLightStyleRetry(input: {
  actualRender: MobileImplementationRender | null;
  blueprintTwin: MobileBlueprintTwinVisual | null;
  artifactsById: Record<string, unknown>;
  publicOrigin?: string;
}): BlueprintLightStyleRetryView {
  const { actualRender, blueprintTwin, artifactsById, publicOrigin } = input;
  const styleReceipt = loadStyleReceipt(blueprintTwin, artifactsById);
  const styleAnchorConfigured = Boolean(resolveLightBlueprintStyleReferenceUrl(publicOrigin));

  const usesLightContract =
    blueprintTwin?.styleContractId === MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID ||
    blueprintTwin?.outputRepresentationMode === 'LIGHT_TECHNICAL_BLUEPRINT';

  const twinReady = Boolean(actualRender?.renderImageUri && blueprintTwin?.twinImageUri);
  const showRetryStrip = twinReady && usesLightContract;

  const reasons: string[] = [];
  if (blueprintTwin?.blueprintStyleStatus === 'REVIEW_REQUIRED') reasons.push('blueprintStyleStatus=REVIEW_REQUIRED');
  if (blueprintTwin?.blueprintStyleStatus === 'BLOCKED') reasons.push('blueprintStyleStatus=BLOCKED');
  if (blueprintTwin?.styleFailureCode === BLUEPRINT_DARK_MODE_VIOLATION) reasons.push('styleFailureCode=DARK');
  if (styleReceipt?.failureCode === BLUEPRINT_DARK_MODE_VIOLATION) reasons.push('receipt.failureCode=DARK');
  if (styleReceipt?.result === 'REVIEW_REQUIRED') reasons.push('receipt.result=REVIEW_REQUIRED');
  if (styleReceipt?.result === 'FAIL') reasons.push('receipt.result=FAIL');
  if (styleReceipt?.dominantBackground === 'DARK') reasons.push('receipt.background=DARK');
  if (
    styleReceipt?.dominantBackground === 'UNKNOWN' &&
    styleReceipt.backgroundClassification !== LIGHT_BACKGROUND_PASS
  ) {
    reasons.push('receipt.background=UNKNOWN');
  }

  const urgentLightStyleRequired =
    blueprintTwin?.blueprintStyleStatus === 'REVIEW_REQUIRED' ||
    blueprintTwin?.blueprintStyleStatus === 'BLOCKED' ||
    blueprintTwin?.styleFailureCode === BLUEPRINT_DARK_MODE_VIOLATION ||
    styleReceipt?.failureCode === BLUEPRINT_DARK_MODE_VIOLATION ||
    styleReceipt?.result === 'FAIL' ||
    styleReceipt?.dominantBackground === 'DARK';

  return {
    showRetryStrip,
    urgentLightStyleRequired,
    canRetryLightBlueprint: showRetryStrip,
    dominantBackground: styleReceipt?.dominantBackground ?? '—',
    styleReceiptResult: styleReceipt?.result ?? '—',
    styleAnchorConfigured,
    reasons,
  };
}
