import { LEGACY_V2_RENDERER_COMPONENTS } from './constants.js';
import type { StrategyRoutingReceipt } from './types.js';

export function assertVisualCompilerRoute(receipt: StrategyRoutingReceipt): void {
  if (receipt.oldRendererInvoked) {
    throw new Error('TWIN_V2_OLD_RENDERER_INVOKED');
  }
  if (receipt.resolvedStrategy !== 'VISUAL_TO_CODE_COMPILER') {
    throw new Error('TWIN_V2_OLD_RENDERER_INVOKED: strategy not VISUAL_TO_CODE_COMPILER');
  }
  if (receipt.fallbackUsed) {
    throw new Error('TWIN_V2_VISUAL_COMPILER_FAILED_CLOSED: fallback not allowed');
  }
  if (!receipt.compilerInvoked || !receipt.visualAuthorityAttached) {
    throw new Error('TWIN_V2_VISUAL_COMPILER_FAILED_CLOSED');
  }
}

export function assertRenderComponentNotLegacy(componentRef: string): void {
  if ((LEGACY_V2_RENDERER_COMPONENTS as readonly string[]).includes(componentRef)) {
    throw new Error(`TWIN_V2_OLD_RENDERER_INVOKED: ${componentRef}`);
  }
}
