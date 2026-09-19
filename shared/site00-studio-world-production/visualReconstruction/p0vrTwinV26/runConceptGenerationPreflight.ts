import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { PendingDualOutputGeneration } from '../p0vrTwinV25/types.js';
import type { ConceptGenerationPreflightReceipt } from './types.js';

export function runConceptGenerationPreflight(
  session: ConceptDirectedTwinSession,
  pending?: PendingDualOutputGeneration | null,
): ConceptGenerationPreflightReceipt {
  const blockingReasons: string[] = [];
  const intentReady = Boolean(session.pageIntent?.summary && session.creativeDirection);
  const objectsReady = Boolean(pending && pending.visualBlueprint.objects.length >= 20);
  const assetsPlanned = Boolean(pending && pending.assetPlan.assetSlots.length > 0);
  const functionsPlanned = Boolean(pending && pending.functionTargetPlan.targets.length >= 5);
  const hostBoundaryReady = Boolean(session.brandContext?.hostClientFirewall);
  const viewportReady = true;
  const typographyReady = Boolean(session.brandContext?.typographicGrammar?.length);
  const colorReady = Boolean(session.brandContext?.colorLanguage?.length);
  const responsiveReady = Boolean(session.blueprintGrammar?.informationBands?.length);
  const statesReady = Boolean(session.functionGraph?.sectionNavigation?.length);

  if (!intentReady) blockingReasons.push('page intent / creative direction');
  if (!objectsReady) blockingReasons.push('object plan incomplete');
  if (!assetsPlanned) blockingReasons.push('asset plan incomplete');
  if (!functionsPlanned) blockingReasons.push('function targets incomplete');
  if (!hostBoundaryReady) blockingReasons.push('host boundary contract');
  if (!typographyReady) blockingReasons.push('typography constraints');
  if (!colorReady) blockingReasons.push('color constraints');
  if (!responsiveReady) blockingReasons.push('responsive baseline bands');
  if (!statesReady) blockingReasons.push('state / navigation requirements');

  return {
    intentReady,
    objectsReady,
    assetsPlanned,
    functionsPlanned,
    hostBoundaryReady,
    viewportReady,
    typographyReady,
    colorReady,
    responsiveReady,
    statesReady,
    blockingReasons,
    status: blockingReasons.length === 0 ? 'PASS' : 'FAIL',
  };
}

export function assertConceptGenerationPreflight(receipt: ConceptGenerationPreflightReceipt): void {
  if (receipt.status !== 'PASS') {
    throw new Error(
      `CONCEPT_GENERATION_PREFLIGHT_FAILED: ${receipt.blockingReasons.join(', ') || 'incomplete contract'}`,
    );
  }
}
