/** Browser build stub — R7M node render/twin writers run in vitest/Railway only. */

export async function writeLocalMobileImplementationRender(): Promise<never> {
  throw new Error('MOBILE_RENDER_GENERATION_FAILED: node writer unavailable in browser bundle');
}

export async function writeLocalMobileBlueprintTwinSvg(): Promise<never> {
  throw new Error('BLUEPRINT_TWIN_COMPOSITION_MISMATCH: node writer unavailable in browser bundle');
}
