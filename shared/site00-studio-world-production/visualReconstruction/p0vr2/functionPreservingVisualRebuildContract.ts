import type { FunctionPreservingVisualRebuildContract } from './types.js';

/** Default contract: preserve all function; allow full visual replacement when reference differs. */
export function createDefaultFunctionPreservingVisualRebuildContract(): FunctionPreservingVisualRebuildContract {
  return {
    preserveRoutes: true,
    preserveData: true,
    preserveState: true,
    preserveActions: true,
    preserveAccessibility: true,
    preserveBusinessLogic: true,
    allowShellReplacement: true,
    allowLayoutReplacement: true,
    allowCSSReplacement: true,
    allowSVGGeometryReplacement: true,
    allowAssetReplacement: true,
  };
}

export function functionalPreservationIntact(contract: FunctionPreservingVisualRebuildContract): boolean {
  return (
    contract.preserveRoutes &&
    contract.preserveData &&
    contract.preserveState &&
    contract.preserveActions &&
    contract.preserveAccessibility &&
    contract.preserveBusinessLogic
  );
}

export function visualReplacementAllowed(contract: FunctionPreservingVisualRebuildContract): boolean {
  return (
    contract.allowShellReplacement &&
    contract.allowLayoutReplacement &&
    contract.allowCSSReplacement &&
    contract.allowSVGGeometryReplacement &&
    contract.allowAssetReplacement
  );
}
