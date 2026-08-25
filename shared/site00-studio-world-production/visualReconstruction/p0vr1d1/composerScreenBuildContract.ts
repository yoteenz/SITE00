/**
 * P0.VR.1D.1 — ComposerScreenBuildContract
 * Composer receives extracted reference + ScreenImplementationSpec; no redesign freedom.
 */

import { randomUUID } from 'node:crypto';
import type { ComposerScreenBuildContract, ExtractedScreenReference, ScreenImplementationSpec } from './types.js';
import { COMPOSER_RECONSTRUCTION_DIRECTIVES, SCREENSHOT_EMULATION_MODE } from './constants.js';

export function buildComposerScreenBuildContract(input: {
  screen: ExtractedScreenReference;
  implementationSpec: ScreenImplementationSpec;
  lockedRegionIds?: string[];
  referenceImagePath?: string | null;
}): ComposerScreenBuildContract {
  const authority = input.screen.authority;
  const referenceImageUrl = authority?.referenceImageUrl ?? '';
  const lockedRegionIds = input.lockedRegionIds ?? input.implementationSpec.doNotChangeRegions;

  return {
    contractId: randomUUID(),
    screenId: input.screen.screenId,
    route: input.implementationSpec.route,
    referenceImageUrl,
    referenceImagePath: input.referenceImagePath ?? authority?.imageAuthorityPath ?? null,
    implementationSpec: {
      ...input.implementationSpec,
      doNotChangeRegions: lockedRegionIds,
    },
    lockedRegionIds,
    viewportWidth: input.implementationSpec.viewportWidth,
    viewportHeight: input.implementationSpec.viewportHeight,
    workflowMode: 'WEBSITE_RECONSTRUCTION',
    emulationMode: SCREENSHOT_EMULATION_MODE,
    designFreedom: false,
    promptDirectives: COMPOSER_RECONSTRUCTION_DIRECTIVES,
  };
}

export function composerAllowedToFreelyReinterpretLayout(_contract: ComposerScreenBuildContract): false {
  return false;
}

export function screenshotEmulationBlocksRedesign(contract: ComposerScreenBuildContract): boolean {
  return contract.emulationMode === 'SCREENSHOT_EMULATION' && contract.designFreedom === false;
}

export function composerReceivesReferenceAndSpec(contract: ComposerScreenBuildContract): boolean {
  return Boolean(contract.referenceImageUrl) && contract.implementationSpec.regions.length > 0;
}
