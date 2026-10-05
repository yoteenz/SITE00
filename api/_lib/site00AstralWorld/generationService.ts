/**
 * P0.E.FT4 — Astral World FAL generation service.
 * Reuses canonical falImageModels + ASSTS storage + studioBuilder queue poll.
 */

import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { compileAstralPrompt } from '../../../shared/site00-astral-world/generation/promptCompiler.js';
import { getContractBySlot } from '../../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { resolveReferenceUrlsForContract } from '../../../shared/site00-astral-world/generation/assetResolver.js';
import type { AstralAssetRecord, AstralGenerationReceipt } from '../../../shared/site00-astral-world/generation/types.js';
import { AW_VISUAL_FOUNDATION_BATCH, ASTRAL_WORLD_PROJECT_ID } from '../../../shared/site00-astral-world/generation/types.js';
import { AW_GENERATION_MANIFEST_V1, getP0Contracts, getP1Contracts, getP2Contracts } from '../../../shared/site00-astral-world/generation/generationManifest.js';
import {
  pollStudioBuilderFalQueue,
  fetchStudioBuilderFalResult,
} from '../studioBuilderGeneration.js';
import { uploadSite00AssetBuffer, downloadUrlToBuffer } from '../site00Assts/storage.js';
import { enqueueFalBackgroundWork, shouldRunFalSynchronously } from '../site00Evolve/falBackgroundJob.js';
import {
  computeBatchStatus,
  getAstralAssetRecord,
  hasActiveJobForSlot,
  markJobActive,
  markJobInactive,
  upsertAstralAssetRecord,
  initializeMissingContracts,
  getAstralAssetStoreSnapshot,
  countActiveJobs,
  ensureAstralAssetStoreHydrated,
} from './assetRecordStore.js';
import type { PortraitPromptVars } from '../../../shared/site00-astral-world/generation/portraitContracts.js';

const STORAGE_ROOT = 'site00/astral-world/generation';

export type ProductionPreflight = {
  falKey: 'AVAILABLE' | 'MISSING';
  supabaseStorage: 'AVAILABLE' | 'MISSING';
  generationEndpoint: 'AVAILABLE' | 'MISSING';
  assetPersistence: 'AVAILABLE' | 'MISSING';
  falKeyClientExposure: 'SAFE';
};

export function getProductionPreflight(): ProductionPreflight {
  const falKey = process.env.FAL_KEY?.trim() ? 'AVAILABLE' : 'MISSING';
  const supabaseStorage = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ? 'AVAILABLE' : 'MISSING';
  return {
    falKey,
    supabaseStorage,
    generationEndpoint: falKey === 'AVAILABLE' ? 'AVAILABLE' : 'MISSING',
    assetPersistence: supabaseStorage === 'AVAILABLE' ? 'AVAILABLE' : 'MISSING',
    falKeyClientExposure: 'SAFE',
  };
}

async function waitForConcurrencySlot(): Promise<void> {
  const max = AW_GENERATION_MANIFEST_V1.maxConcurrentJobs;
  while (countActiveJobs() >= max) {
    await new Promise((r) => setTimeout(r, 1500));
  }
}

function buildStoragePath(slotKey: string, version: number): string {
  const safe = slotKey.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${STORAGE_ROOT}/${AW_VISUAL_FOUNDATION_BATCH}/${safe}_v${String(version).padStart(2, '0')}.webp`;
}

function localPublicPathForReferenceUrl(referenceUrl: string): string | null {
  try {
    const pathname = new URL(referenceUrl).pathname;
    const localPath = join(process.cwd(), 'public', pathname.replace(/^\//, ''));
    return existsSync(localPath) ? localPath : null;
  } catch {
    return null;
  }
}

async function uploadReferenceToFal(referenceUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const localPath = localPublicPathForReferenceUrl(referenceUrl);
  if (localPath) {
    const bytes = readFileSync(localPath);
    const name = localPath.split('/').pop() || 'ref.png';
    const type = name.endsWith('.png') ? 'image/png' : 'image/webp';
    return fal.storage.upload(new File([bytes], name, { type }));
  }

  const res = await fetch(referenceUrl);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status})`);
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Reference URL returned non-image content (${contentType || 'unknown'})`);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = referenceUrl.split('/').pop()?.split('?')[0] || 'ref.png';
  const type = contentType.split(';')[0] || (name.endsWith('.png') ? 'image/png' : 'image/webp');
  return fal.storage.upload(new File([bytes], name, { type }));
}

function formatFalError(err: unknown): string {
  if (err instanceof Error && err.name === 'ApiError' && typeof (err as { status?: unknown }).status === 'number') {
    const apiErr = err as { message: string; status: number; body?: unknown };
    const bodyPreview =
      typeof apiErr.body === 'string'
        ? apiErr.body.slice(0, 256)
        : apiErr.body
          ? JSON.stringify(apiErr.body).slice(0, 256)
          : '';
    return bodyPreview ? `${apiErr.message} (${apiErr.status}): ${bodyPreview}` : `${apiErr.message} (${apiErr.status})`;
  }
  return err instanceof Error ? err.message : String(err);
}

async function submitFalJob(
  prompt: string,
  aspectRatio: string,
  referenceUrls: string[],
): Promise<{ providerRequestId: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const uploadedRefs: string[] = [];
  for (const url of referenceUrls) {
    uploadedRefs.push(url.startsWith('http') ? await uploadReferenceToFal(url) : url);
  }

  const built = buildFalImageInput({
    prompt,
    aspectRatio,
    outputFormat: 'webp',
    referenceImageUrls: uploadedRefs.length ? uploadedRefs : undefined,
  });

  try {
    const { request_id: providerRequestId } = await fal.queue.submit(built.model, { input: built.input });
    return { providerRequestId, model: built.model };
  } catch (err) {
    throw new Error(formatFalError(err));
  }
}

function validateImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 1024) return false;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isWebp = buffer.slice(0, 4).toString('ascii') === 'RIFF';
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  return isPng || isWebp || isJpeg;
}

function portraitVarsForSlot(slotKey: string): PortraitPromptVars | undefined {
  if (slotKey.startsWith('READER_PORTRAIT_')) {
    const id = slotKey.replace('READER_PORTRAIT_', '');
    const names: Record<string, string> = {
      'reader-madame-j': 'Madame J',
      'reader-kai': 'Kai the Oracle',
      'reader-earth-mama': 'Earth Mama',
      'reader-sage': 'Sage Moonwater',
      'reader-orion': 'Orion Vale',
      'reader-aria': 'Aria Bloom',
    };
    return { reader_name: names[id] ?? id, destination: 'Astréa' };
  }
  if (slotKey.startsWith('FRIEND_AVATAR_')) {
    const id = slotKey.replace('FRIEND_AVATAR_', '');
    const names: Record<string, string> = {
      'friend-jane': 'Jane Doe',
      'friend-marcus': 'Marcus Chen',
      'friend-luna': 'Luna Reyes',
      'friend-lux': 'Love Lux',
    };
    return { friend_name: names[id] ?? id };
  }
  return undefined;
}

export function getAstralGenerationStatus() {
  initializeMissingContracts();
  return {
    batch: computeBatchStatus(),
    manifest: AW_GENERATION_MANIFEST_V1.batchId,
    maxConcurrent: AW_GENERATION_MANIFEST_V1.maxConcurrentJobs,
  };
}

export async function queueAstralAssetGeneration(
  slotKey: string,
  origin: string,
  opts?: { force?: boolean },
): Promise<{ ok: boolean; error?: string; duplicate?: boolean }> {
  initializeMissingContracts();
  const contract = getContractBySlot(slotKey);
  if (!contract) return { ok: false, error: `Unknown slot: ${slotKey}` };

  const existing = getAstralAssetRecord(slotKey);
  if (!opts?.force) {
    if (existing?.status === 'ACTIVE' || existing?.status === 'READY') {
      return { ok: false, error: 'Asset already ready', duplicate: true };
    }
    if (hasActiveJobForSlot(slotKey) || existing?.status === 'PROCESSING' || existing?.status === 'QUEUED') {
      return { ok: false, error: 'Job already active', duplicate: true };
    }
  }

  const compiled = compileAstralPrompt(contract, portraitVarsForSlot(slotKey));
  const refUrls = resolveReferenceUrlsForContract(contract.referenceSources, origin);
  const version = (existing?.version ?? 0) + 1;
  const now = new Date().toISOString();

  const queued: AstralAssetRecord = {
    assetContractId: contract.assetContractId,
    targetSlot: slotKey,
    status: 'QUEUED',
    version,
    approvalState: 'GENERATED',
    canonState: 'FOUNDER_FAST_TRACK',
    outputUrl: existing?.outputUrl ?? null,
    storagePath: null,
    provider: 'fal',
    model: null,
    requestId: null,
    generationReceipt: null,
    referenceCropKey: null,
    error: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    supersededByVersion: null,
  };
  upsertAstralAssetRecord(queued);
  markJobActive(slotKey);

  const run = async () => {
    await waitForConcurrencySlot();
    try {
      upsertAstralAssetRecord({ ...queued, status: 'PROCESSING', updatedAt: new Date().toISOString() });
      const { providerRequestId, model } = await submitFalJob(compiled.promptText, contract.aspectRatio, refUrls);

      let { status } = await pollStudioBuilderFalQueue(model, providerRequestId);
      let attempts = 0;
      while ((status === 'IN_QUEUE' || status === 'IN_PROGRESS') && attempts < 120) {
        await new Promise((r) => setTimeout(r, 2000));
        ({ status } = await pollStudioBuilderFalQueue(model, providerRequestId));
        attempts += 1;
      }

      if (status !== 'COMPLETED') {
        throw new Error(`FAL job did not complete: ${status}`);
      }

      const falUrl = await fetchStudioBuilderFalResult(model, providerRequestId);
      if (!falUrl) throw new Error('FAL returned no image URL');

      const buffer = await downloadUrlToBuffer(falUrl);
      if (!validateImageBuffer(buffer)) throw new Error('Generated image failed validation');

      const storagePath = buildStoragePath(slotKey, version);
      const { publicUrl } = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp', { upsert: true });

      const receipt: AstralGenerationReceipt = {
        receiptId: randomUUID(),
        provider: 'fal',
        model,
        prompt: compiled.promptText,
        promptVersion: compiled.promptVersion,
        promptHash: compiled.promptHash,
        inputReferenceUrls: refUrls,
        requestId: providerRequestId,
        generationSettings: { aspectRatio: contract.aspectRatio, outputFormat: 'webp' },
        generatedAt: new Date().toISOString(),
        costUsd: null,
        parentAssetVersion: existing?.version ?? null,
        targetSlot: slotKey,
        projectId: ASTRAL_WORLD_PROJECT_ID,
      };

      upsertAstralAssetRecord({
        assetContractId: contract.assetContractId,
        targetSlot: slotKey,
        status: 'READY',
        version,
        approvalState: 'READY_FOR_VISUAL_REVIEW',
        canonState: 'FOUNDER_FAST_TRACK',
        outputUrl: publicUrl,
        storagePath,
        provider: 'fal',
        model,
        requestId: providerRequestId,
        generationReceipt: receipt,
        referenceCropKey: null,
        error: null,
        createdAt: queued.createdAt,
        updatedAt: new Date().toISOString(),
        supersededByVersion: null,
      });
    } catch (err) {
      const message = formatFalError(err);
      upsertAstralAssetRecord({
        ...queued,
        status: 'FAILED',
        error: message,
        updatedAt: new Date().toISOString(),
        outputUrl: existing?.outputUrl ?? null,
      });
    } finally {
      markJobInactive(slotKey);
    }
  };

  if (shouldRunFalSynchronously()) {
    await run();
  } else {
    enqueueFalBackgroundWork(run);
  }

  return { ok: true };
}

export async function queueMissingP0Assets(origin: string): Promise<{ queued: string[]; skipped: string[] }> {
  return dispatchBatch(origin, getP0Contracts().map((c) => c.targetSlot));
}

export async function dispatchBatch(
  origin: string,
  slotKeys: string[],
): Promise<{ queued: string[]; skipped: string[] }> {
  await ensureAstralAssetStoreHydrated();
  initializeMissingContracts();
  const queued: string[] = [];
  const skipped: string[] = [];
  for (const slotKey of slotKeys) {
    const result = await queueAstralAssetGeneration(slotKey, origin);
    if (result.ok) queued.push(slotKey);
    else skipped.push(slotKey);
  }
  return { queued, skipped };
}

export async function dispatchP0Batch(origin: string): Promise<{ queued: string[]; skipped: string[] }> {
  return dispatchBatch(origin, getP0Contracts().map((c) => c.targetSlot));
}

export async function dispatchP1Batch(origin: string): Promise<{ queued: string[]; skipped: string[] }> {
  return dispatchBatch(origin, getP1Contracts().map((c) => c.targetSlot));
}

export async function dispatchP2Batch(origin: string): Promise<{ queued: string[]; skipped: string[] }> {
  return dispatchBatch(origin, getP2Contracts().map((c) => c.targetSlot));
}

export function activateFounderAsset(slotKey: string): { ok: boolean; error?: string } {
  initializeMissingContracts();
  const record = getAstralAssetRecord(slotKey);
  if (!record?.outputUrl) return { ok: false, error: 'No generated output to activate' };
  if (record.status !== 'READY' && record.status !== 'ACTIVE') {
    return { ok: false, error: `Cannot activate from status ${record.status}` };
  }
  upsertAstralAssetRecord({
    ...record,
    status: 'ACTIVE',
    approvalState: 'APPROVED',
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function supersedeAndRegenerate(
  slotKey: string,
  origin: string,
): Promise<{ ok: boolean; error?: string; duplicate?: boolean }> {
  initializeMissingContracts();
  return queueAstralAssetGeneration(slotKey, origin, { force: true });
}

export async function pollAstralGenerationJobs(): Promise<{ stillProcessing: number }> {
  initializeMissingContracts();
  const snapshot = getAstralAssetStoreSnapshot();
  const stillProcessing = Object.values(snapshot).filter(
    (r) => r.status === 'PROCESSING' || r.status === 'QUEUED',
  ).length;
  return { stillProcessing };
}

/** Test hook: simulate READY asset without FAL spend */
export function activateTestAsset(slotKey: string, outputUrl: string): void {
  initializeMissingContracts();
  const contract = getContractBySlot(slotKey);
  if (!contract) return;
  const now = new Date().toISOString();
  upsertAstralAssetRecord({
    assetContractId: contract.assetContractId,
    targetSlot: slotKey,
    status: 'ACTIVE',
    version: 1,
    approvalState: 'READY_FOR_VISUAL_REVIEW',
    canonState: 'FOUNDER_FAST_TRACK',
    outputUrl,
    storagePath: buildStoragePath(slotKey, 1),
    provider: 'fal',
    model: 'test/mock',
    requestId: 'test-request',
    generationReceipt: {
      receiptId: randomUUID(),
      provider: 'fal',
      model: 'test/mock',
      prompt: 'test',
      promptVersion: 'v1',
      promptHash: createHash('sha256').update('test').digest('hex').slice(0, 16),
      inputReferenceUrls: [],
      requestId: 'test-request',
      generationSettings: {},
      generatedAt: now,
      costUsd: null,
      parentAssetVersion: null,
      targetSlot: slotKey,
      projectId: ASTRAL_WORLD_PROJECT_ID,
    },
    referenceCropKey: null,
    error: null,
    createdAt: now,
    updatedAt: now,
    supersededByVersion: null,
  });
}

export { getAstralAssetStoreSnapshot };
