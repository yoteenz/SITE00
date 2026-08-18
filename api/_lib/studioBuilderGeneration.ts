/**
 * Studio Builder™ — department-agnostic generation via existing FAL + Supabase stack.
 * Reuses patterns from studioAssetGeneration.ts without Weather Studio hardcoding.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STUDIO_BUILDER_BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
export const STUDIO_BUILDER_PREFIX = 'studio-assets/departments';

let cachedWorldArchitectModel: string | null = null;

/** ModelRoutingEngine™ default — cached after first bundle resolve. */
export async function resolveStudioBuilderFalModel(): Promise<string> {
  if (cachedWorldArchitectModel) return cachedWorldArchitectModel;
  const { getWorldArchitectDefaultModel } = await import('./creativeProduction/studio-os-server.bundle.js');
  cachedWorldArchitectModel = getWorldArchitectDefaultModel();
  return cachedWorldArchitectModel;
}

/** @deprecated Use resolveStudioBuilderFalModel() — retained for diagnostic fallbacks only. */
export const STUDIO_BUILDER_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

async function resolveDefaultBuilderModel(input: StudioBuilderGenerateInput): Promise<string> {
  const { getWorldArchitectDefaultModel, resolveModelRoutingFromLayerId, resolveModelRoutingDecision } =
    await import('./creativeProduction/studio-os-server.bundle.js');

  if (input.productionGroupId.startsWith('founder-render-')) {
    const decision = resolveModelRoutingDecision({
      artifactIntent: 'founder-full-room-preview',
      surface: 'founder-render',
    });
    return decision.providerModel;
  }

  if (input.layerId || input.productionGroupId.startsWith('scene-stack-')) {
    const { resolveLayerIdFromProductionGroupId } = await import('./creativeProduction/studio-os-server.bundle.js');
    const layerId = input.layerId
      ? (input.layerId as import('../../src/studio-os-core/scene-stack/types.js').SceneStackLayerId)
      : resolveLayerIdFromProductionGroupId(input.productionGroupId);
    if (layerId) {
      return resolveModelRoutingFromLayerId(layerId, {
        organizationId: input.organizationId,
        brandGroundingRequired: (input.brandReferenceUrls?.length ?? 0) > 0,
      }).providerModel;
    }
  }

  return getWorldArchitectDefaultModel();
}

export type StudioBuilderGenerateInput = {
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  heroAssetId: string;
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  /** Shell placement URL only — never cumulative prior layers (see reference-chain.ts) */
  referenceImageUrls?: string[];
  layerId?: string;
  generationMode?: string;
  textToImageOnly?: boolean;
  providerModel?: string;
  isolationAttempt?: number;
  negativePrompt?: string;
  brandReferenceUrls?: string[];
  organizationId?: string;
};

type BuilderRoute = {
  model: string;
  textToImageOnly: boolean;
  route?: unknown;
};

function usesSceneStackRouting(input: StudioBuilderGenerateInput): boolean {
  return Boolean(input.layerId) || input.productionGroupId.startsWith('scene-stack-');
}

async function resolveBuilderRoute(input: StudioBuilderGenerateInput): Promise<BuilderRoute> {
  if (!usesSceneStackRouting(input)) {
    const defaultModel = await resolveDefaultBuilderModel(input);
    return {
      model: input.providerModel ?? defaultModel,
      textToImageOnly: input.textToImageOnly === true,
    };
  }

  const {
    resolveLayerIdFromProductionGroupId,
    resolveSceneStackLayerModelRoute,
  } = await import('./creativeProduction/studio-os-server.bundle.js');

  const layerId = input.layerId
    ? (input.layerId as import('../../src/studio-os-core/scene-stack/types.js').SceneStackLayerId)
    : resolveLayerIdFromProductionGroupId(input.productionGroupId);
  if (!layerId) {
    const defaultModel = await resolveDefaultBuilderModel(input);
    return {
      model: input.providerModel ?? defaultModel,
      textToImageOnly: input.textToImageOnly === true,
    };
  }
  const route = resolveSceneStackLayerModelRoute(layerId, input.isolationAttempt ?? 0, {
    organizationId: input.organizationId,
    brandGroundingRequired: (input.brandReferenceUrls?.length ?? 0) > 0,
  });
  return {
    model: input.providerModel ?? route.providerModel,
    textToImageOnly: input.textToImageOnly ?? route.textToImageOnly,
    route,
  };
}

export type StudioBuilderGenerateResult = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  error?: string;
  /** Internal diagnostic category — not for public clients without sanitization */
  failureCategory?: string;
  providerHttpStatus?: number;
  providerResponsePreview?: string;
};

function repoRoot(): string {
  return process.cwd();
}

function marbleRefPath(): string {
  const custom = process.env.MARBLE_REF?.trim();
  if (custom) return join(repoRoot(), custom.replace(/^\//, ''));
  return join(repoRoot(), 'public/assets/marble-half.png');
}

async function uploadLocalOrSiteRefToFal(
  fal: { storage: { upload: (f: File) => Promise<string> } },
  localPath: string,
  siteRelativePath: string,
  label: string
): Promise<string> {
  if (existsSync(localPath)) {
    const bytes = readFileSync(localPath);
    const name = localPath.split('/').pop() || 'ref.png';
    return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
  }
  const { resolveSiteOrigin } = await import('./email/brandAssets.js');
  const assetPath = siteRelativePath.replace(/^\//, '');
  const url = `${resolveSiteOrigin()}/${assetPath.startsWith('assets/') ? assetPath : `assets/${assetPath}`}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const name = url.split('/').pop()?.split('?')[0] || 'ref.png';
    return fal.storage.upload(new File([bytes], name, { type: 'image/png' }));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `${label} reference missing locally (${localPath}) and could not fetch ${url}: ${detail}`
    );
  }
}

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function storagePathFor(input: StudioBuilderGenerateInput): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '_');
  const ext = input.outputFormat === 'webp' ? 'webp' : 'png';
  return `${STUDIO_BUILDER_PREFIX}/${safe(input.departmentId)}/${safe(input.packageId)}/${safe(input.projectId)}/${safe(input.productionGroupId)}/${safe(input.heroAssetId)}/${Date.now()}.${ext}`;
}

export type StudioBuilderFalQueueSubmitResult =
  | { ok: true; providerRequestId: string; model: string; imageUrls: string[] }
  | { ok: false; error: string; failureCategory?: string; providerHttpStatus?: number; providerResponsePreview?: string };

export type StudioBuilderFalQueueStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string;

export async function prepareStudioBuilderFalImageUrls(
  input: StudioBuilderGenerateInput
): Promise<{ ok: true; imageUrls: string[]; model: string; textToImageOnly: boolean } | { ok: false; error: string }> {
  const route = await resolveBuilderRoute(input);
  const brandRefs = input.brandReferenceUrls?.filter((u) => u?.startsWith('http') || u?.startsWith('/')) ?? [];

  if (route.textToImageOnly && brandRefs.length === 0) {
    return { ok: true, imageUrls: [], model: route.model, textToImageOnly: true };
  }

  if (route.textToImageOnly && brandRefs.length > 0) {
    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) return { ok: false, error: 'FAL_KEY not configured on server' };
    try {
      const { fal } = await import('@fal-ai/client');
      fal.config({ credentials: falKey });
      const imageUrls: string[] = [];
      for (const ref of brandRefs) {
        if (ref.startsWith('http')) {
          imageUrls.push(ref);
        } else {
          const localPath = join(repoRoot(), 'public', ref.replace(/^\//, ''));
          imageUrls.push(
            await uploadLocalOrSiteRefToFal(fal, localPath, ref.replace(/^\//, ''), 'Brand material reference')
          );
        }
      }
      const { resolveModelRoutingDecision } = await import('./creativeProduction/studio-os-server.bundle.js');
      const brandEditDecision = resolveModelRoutingDecision({
        artifactIntent: 'landmark-asset',
        brandGroundingRequired: true,
        surface: 'creative-direction-studio',
      });
      const editModel = brandEditDecision.providerModel;
      return { ok: true, imageUrls, model: editModel, textToImageOnly: false };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Failed to prepare brand material references' };
    }
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) return { ok: false, error: 'FAL_KEY not configured on server' };

  const marbleRef = marbleRefPath();
  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const imageUrls: string[] = [];
    if (input.referenceImageUrls?.length) {
      const placementRef = input.referenceImageUrls.find((u) => u?.startsWith('http'));
      if (placementRef) imageUrls.push(placementRef);
    }
    if (imageUrls.length === 0) {
      imageUrls.push(
        await uploadLocalOrSiteRefToFal(fal, marbleRef, 'assets/marble-half.png', 'Marble brand anchor')
      );
    }
    return { ok: true, imageUrls, model: route.model, textToImageOnly: false };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to prepare FAL image references' };
  }
}

export async function submitStudioBuilderFalQueue(
  input: StudioBuilderGenerateInput,
  imageUrls: string[],
  modelOverride?: string
): Promise<StudioBuilderFalQueueSubmitResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) return { ok: false, error: 'FAL_KEY not configured on server' };

  const route = await resolveBuilderRoute(input);
  const model = modelOverride ?? route.model;
  const textToImageOnly = route.textToImageOnly;
  const brandRefs = input.brandReferenceUrls ?? [];

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const isNanoBanana2 = model.startsWith('fal-ai/nano-banana-2');
    let falInput: Record<string, unknown>;

    if (isNanoBanana2) {
      const { buildNanoBanana2FalInput } = await import('./creativeProduction/studio-os-server.bundle.js');
      const nb2 = buildNanoBanana2FalInput({
        prompt: input.prompt,
        aspectRatio: input.aspectRatio,
        outputFormat: input.outputFormat,
        brandReferenceUrls: imageUrls.length ? imageUrls : brandRefs,
        negativePrompt: input.negativePrompt,
      });
      falInput = nb2.falInput as unknown as Record<string, unknown>;
      const resolvedModel = nb2.usesReferences ? nb2.endpoint : model;
      const { request_id: providerRequestId } = await fal.queue.submit(resolvedModel, { input: falInput });
      return { ok: true, providerRequestId, model: resolvedModel, imageUrls };
    }

    falInput = textToImageOnly
      ? {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio as '16:9',
          output_format: input.outputFormat,
          resolution: '4K',
          num_images: 1,
        }
      : {
          prompt: input.prompt,
          image_urls: imageUrls,
          num_images: 1,
          aspect_ratio: input.aspectRatio as '16:9',
          output_format: input.outputFormat,
        };
    const { request_id: providerRequestId } = await fal.queue.submit(model, { input: falInput });
    return { ok: true, providerRequestId, model, imageUrls };
  } catch (e) {
    const isApiError =
      typeof e === 'object' &&
      e !== null &&
      (e as { name?: string }).name === 'ApiError' &&
      typeof (e as { status?: unknown }).status === 'number';
    if (isApiError) {
      const apiErr = e as { message: string; status: number; body?: unknown; requestId?: string };
      const bodyPreview =
        typeof apiErr.body === 'string'
          ? apiErr.body.slice(0, 512)
          : apiErr.body
            ? JSON.stringify(apiErr.body).slice(0, 512)
            : undefined;
      return {
        ok: false,
        error: apiErr.message,
        failureCategory: apiErr.status >= 500 ? 'PROVIDER_REQUEST_FAILED' : 'PROVIDER_REJECTED',
        providerHttpStatus: apiErr.status,
        providerResponsePreview: apiErr.requestId
          ? `[requestId=${apiErr.requestId}] ${bodyPreview ?? ''}`.trim()
          : bodyPreview,
      };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'FAL queue submit failed' };
  }
}

export async function pollStudioBuilderFalQueue(
  model: string,
  providerRequestId: string
): Promise<{ status: StudioBuilderFalQueueStatus; raw: unknown }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const queueStatus = await fal.queue.status(model, { requestId: providerRequestId });
  const status = String((queueStatus as { status?: string }).status || 'IN_PROGRESS');
  return { status, raw: queueStatus };
}

export async function fetchStudioBuilderFalResult(model: string, providerRequestId: string): Promise<string | null> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const result = await fal.queue.result(model, { requestId: providerRequestId });
  return (result as { data?: { images?: Array<{ url?: string }> } })?.data?.images?.[0]?.url ?? null;
}

export async function finalizeStudioBuilderFromFalUrl(
  input: StudioBuilderGenerateInput,
  imageUrl: string,
  model?: string
): Promise<StudioBuilderGenerateResult> {
  try {
    const mime = input.outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const path = storagePathFor(input);
    const upload = await uploadStudioBuilderAssetBytes(await downloadImageToBuffer(imageUrl), path, mime);
    if (!upload.ok) return { ok: false, error: upload.error };
    const resolvedModel = model ?? (await resolveBuilderRoute(input)).model;
    return {
      ok: true,
      publicUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      model: resolvedModel,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Finalize failed' };
  }
}

export async function uploadStudioBuilderAssetBytes(
  bytes: Buffer,
  storagePath: string,
  mime: string
): Promise<{ ok: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: 'Supabase credentials not configured' };
  }

  try {
    const { getSupabaseAdminServiceRole } = await import('./supabase.js');
    const admin = getSupabaseAdminServiceRole();

    const { data: existingBucket } = await admin.storage.getBucket(STUDIO_BUILDER_BUCKET);
    if (!existingBucket) {
      await admin.storage.createBucket(STUDIO_BUILDER_BUCKET, {
        public: true,
        fileSizeLimit: 12 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });
    }

    const { error: uploadError } = await admin.storage.from(STUDIO_BUILDER_BUCKET).upload(storagePath, bytes, {
      upsert: true,
      contentType: mime,
    });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: publicData } = admin.storage.from(STUDIO_BUILDER_BUCKET).getPublicUrl(storagePath);
    return { ok: true, publicUrl: publicData.publicUrl, storagePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

export async function generateStudioBuilderAsset(
  input: StudioBuilderGenerateInput
): Promise<StudioBuilderGenerateResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) return { ok: false, error: 'FAL_KEY not configured on server' };

  const route = await resolveBuilderRoute(input);
  const marbleRef = marbleRefPath();

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    let result: { data?: { images?: Array<{ url?: string }> } };

    if (route.textToImageOnly) {
      result = await fal.subscribe(route.model, {
        input: {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio as '16:9',
          output_format: input.outputFormat,
          resolution: '2K',
          num_images: 1,
        },
        logs: false,
      });
    } else {
      const imageUrls: string[] = [];
      if (input.referenceImageUrls?.length) {
        const placementRef = input.referenceImageUrls.find((u) => u?.startsWith('http'));
        if (placementRef) imageUrls.push(placementRef);
      }
      if (imageUrls.length === 0) {
        imageUrls.push(
          await uploadLocalOrSiteRefToFal(fal, marbleRef, 'assets/marble-half.png', 'Marble brand anchor')
        );
      }

      result = await fal.subscribe(route.model, {
        input: {
          prompt: input.prompt,
          image_urls: imageUrls,
          num_images: 1,
          aspect_ratio: input.aspectRatio as '16:9',
          output_format: input.outputFormat,
        },
        logs: false,
      });
    }

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) return { ok: false, error: 'Fal returned no image URL' };

    const mime = input.outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const path = storagePathFor(input);
    const upload = await uploadStudioBuilderAssetBytes(await downloadImageToBuffer(imageUrl), path, mime);
    if (!upload.ok) return { ok: false, error: upload.error };

    return {
      ok: true,
      publicUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      model: route.model,
    };
  } catch (e) {
    const isApiError =
      typeof e === 'object' &&
      e !== null &&
      (e as { name?: string }).name === 'ApiError' &&
      typeof (e as { status?: unknown }).status === 'number';
    if (isApiError) {
      const apiErr = e as { message: string; status: number; body?: unknown; requestId?: string };
      const bodyPreview =
        typeof apiErr.body === 'string'
          ? apiErr.body.slice(0, 512)
          : apiErr.body
            ? JSON.stringify(apiErr.body).slice(0, 512)
            : undefined;
      return {
        ok: false,
        error: apiErr.message,
        failureCategory: apiErr.status >= 500 ? 'PROVIDER_REQUEST_FAILED' : 'PROVIDER_REJECTED',
        providerHttpStatus: apiErr.status,
        providerResponsePreview: apiErr.requestId
          ? `[requestId=${apiErr.requestId}] ${bodyPreview ?? ''}`.trim()
          : bodyPreview,
      };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Studio Builder generation failed' };
  }
}
