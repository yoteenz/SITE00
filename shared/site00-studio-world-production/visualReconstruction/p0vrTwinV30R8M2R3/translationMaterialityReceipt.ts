import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import type { TranslationMaterialityReceipt } from './translationDrivenTypes.js';
import { TRANSLATION_REBUILD_NOT_MATERIAL } from './constants.js';
import { componentCompositionHash, renderTreeStructureSignature } from './staleRenderTreeReuseFirewall.js';

export function buildTranslationMaterialityReceipt(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  newDocument: CompiledMobileTwinImplementationDocument;
  priorLayoutContractHash: string;
  newLayoutContractHash: string;
  priorStyleContractHash: string;
  newStyleContractHash: string;
}): TranslationMaterialityReceipt {
  const priorRenderTreeHash = renderTreeStructureSignature(input.priorDocument);
  const newRenderTreeHash = renderTreeStructureSignature(input.newDocument);
  const priorComponentCompositionHash = componentCompositionHash(input.priorDocument);
  const newComponentCompositionHash = componentCompositionHash(input.newDocument);

  const sectionStructureChanged = priorRenderTreeHash !== newRenderTreeHash;
  const controlGroupingChanged = priorComponentCompositionHash !== newComponentCompositionHash;
  const layoutChanged = input.priorLayoutContractHash !== input.newLayoutContractHash;
  const styleChanged = input.priorStyleContractHash !== input.newStyleContractHash;

  const materiallyChanged =
    sectionStructureChanged && controlGroupingChanged && layoutChanged && styleChanged;

  let result: TranslationMaterialityReceipt['result'] = materiallyChanged ? 'PASS' : 'FAIL';
  let failureReason: string | undefined;
  if (!materiallyChanged) {
    failureReason = TRANSLATION_REBUILD_NOT_MATERIAL;
  }

  return {
    priorRenderTreeHash,
    newRenderTreeHash,
    priorComponentCompositionHash,
    newComponentCompositionHash,
    priorLayoutContractHash: input.priorLayoutContractHash,
    newLayoutContractHash: input.newLayoutContractHash,
    priorStyleContractHash: input.priorStyleContractHash,
    newStyleContractHash: input.newStyleContractHash,
    sectionStructureChanged,
    controlGroupingChanged,
    typographyMappingChanged: styleChanged,
    spacingSystemChanged: layoutChanged,
    result,
    failureReason,
  };
}

export function assertTranslationMaterialityForCompile(receipt: TranslationMaterialityReceipt): void {
  if (receipt.result === 'FAIL') {
    throw new Error(`${receipt.failureReason ?? 'TRANSLATION_NOT_MATERIALLY_APPLIED'}`);
  }
}
