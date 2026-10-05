import type { MobileImplementationRender } from './types.js';

export const LOCAL_STUB_RENDER_MODE = 'PIPELINE_PROOF_STUB' as const;
export const REAL_PROVIDER_RENDER_MODE = 'REAL_PROVIDER_RENDER' as const;

export function classifyLegacyMobileRender(render: MobileImplementationRender): MobileImplementationRender {
  if (render.renderMode) return render;
  if (render.provider === 'LOCAL_COMPILER') {
    return {
      ...render,
      renderMode: LOCAL_STUB_RENDER_MODE,
      providerArtifactType: 'LOCAL_PROOF_ONLY',
      providerStatus: render.providerStatus ?? 'GENERATED',
    };
  }
  return {
    ...render,
    renderMode: REAL_PROVIDER_RENDER_MODE,
    providerArtifactType: 'REAL_VISUAL_GENERATION',
    providerStatus: render.providerStatus ?? 'GENERATED',
  };
}

export function isRenderEligibleForFinalAuthority(render: MobileImplementationRender, founderStubOverride?: boolean): boolean {
  const classified = classifyLegacyMobileRender(render);
  if (classified.renderMode === REAL_PROVIDER_RENDER_MODE && classified.providerStatus === 'GENERATED') {
    return true;
  }
  if (founderStubOverride && classified.renderMode === LOCAL_STUB_RENDER_MODE) return true;
  return false;
}

export function assertRenderCanBecomeImplementationAuthority(
  render: MobileImplementationRender,
  founderStubOverride?: boolean,
): void {
  if (!isRenderEligibleForFinalAuthority(render, founderStubOverride)) {
    throw new Error('LOCAL_COMPILER_STUB_CANNOT_BECOME_FINAL_IMPLEMENTATION_AUTHORITY');
  }
  if (render.providerStatus === 'FAILED') {
    throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
  }
}
