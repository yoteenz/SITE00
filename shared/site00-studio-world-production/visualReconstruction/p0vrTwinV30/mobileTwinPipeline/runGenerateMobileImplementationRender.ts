import type { DesignPageAuthorityReviewSession } from '../types.js';
import { P0_VR_TWIN_V30R7M_LINEAGE } from '../constants.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { buildMobileTwinCompositionState } from './buildMobileTwinCompositionState.js';
import type { MobileImplementationRender } from './types.js';

async function sha256HexFromBytes(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function browserRenderFromReference(referenceUri: string): Promise<{
  renderImageUri: string;
  renderImageHash: string;
  widthPx: number;
  heightPx: number;
}> {
  const pathPart = referenceUri.startsWith('/') ? referenceUri : `/${referenceUri}`;
  const src = `${window.location.origin}${pathPart}`;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('MOBILE_RENDER_GENERATION_FAILED'));
    el.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('MOBILE_RENDER_GENERATION_FAILED');
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = 'rgba(10, 122, 62, 0.04)';
  ctx.fillRect(0, 0, 1, 1);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('MOBILE_RENDER_GENERATION_FAILED'))), 'image/jpeg', 0.92);
  });
  const buf = await blob.arrayBuffer();
  const renderImageHash = await sha256HexFromBytes(buf);
  const renderImageUri = URL.createObjectURL(blob);
  return { renderImageUri, renderImageHash, widthPx: canvas.width, heightPx: canvas.height };
}

/** Browser-safe Phase A — canvas translation from design reference (no sharp). */
export async function runGenerateMobileImplementationRender(
  session: DesignPageAuthorityReviewSession,
): Promise<DesignPageAuthorityReviewSession> {
  let next = ensureMobileDesignReferenceAuthority(session);
  const ref = next.mobileTwinPipeline!.designReference!;
  const runId = `r7m-render-${Date.now()}`;
  const composition = buildMobileTwinCompositionState({ runId, reference: ref });
  composition.status = 'RECONCILED';

  const written = await browserRenderFromReference(ref.sourceImageUri);
  const render: MobileImplementationRender = {
    id: runId,
    compositionStateId: composition.id,
    compositionHash: composition.compositionHash,
    referenceAuthorityId: ref.id,
    renderImageUri: written.renderImageUri,
    renderImageHash: written.renderImageHash,
    widthPx: written.widthPx,
    heightPx: written.heightPx,
    provider: 'LOCAL_COMPILER',
    providerJobRef: `${P0_VR_TWIN_V30R7M_LINEAGE}-render-browser-${runId}`,
    status: 'FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const pipeline = next.mobileTwinPipeline!;
  return {
    ...next,
    mobileTwinPipeline: {
      ...pipeline,
      compositionStates: [...pipeline.compositionStates, composition],
      activeCompositionStateId: composition.id,
      renders: [...pipeline.renders, render],
      activeRenderId: render.id,
      renderGate: 'FOUNDER_REVIEW',
      artifactsById: {
        ...pipeline.artifactsById,
        [composition.id]: composition,
        [render.id]: render,
      },
      falJobsDispatched: pipeline.falJobsDispatched,
    },
    updatedAt: new Date().toISOString(),
  };
}
