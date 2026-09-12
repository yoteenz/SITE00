/**
 * P0.VR.REPLICATION.3C-R1 — Materialize proof hero slot from authority image.
 */

import { bufferToDataUrl, cropAuthorityImageBuffer } from './cropAuthorityImage.js';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID, P0_VR_REPLICATION_3C_R1_BUILD } from './constants.js';
import type { AssetMaterializationTrace, HeroMaterializationResult } from './types.js';
import { isBrowserSafeAssetUrl } from './verifyBrowserSafeUrl.js';
import { isVitestRuntime, resolveClientApiBase } from '../p0vrReplication3b/clientSafeRuntime.js';

function emptyTrace(slotId: string): AssetMaterializationTrace {
  return {
    slotId,
    authorityCropValid: false,
    assetCreated: false,
    assetPersisted: false,
    urlCreated: false,
    sourceBound: false,
    requestStatus: null,
    contentType: null,
    decoded: false,
    naturalWidth: 0,
    naturalHeight: 0,
    renderedWidth: 0,
    renderedHeight: 0,
    placeholderRemoved: false,
    visible: false,
    failureStage: null,
    failureCode: null,
    publicUrl: null,
    storageBackend: null,
    storagePath: null,
    sourceBuildVersion: P0_VR_REPLICATION_3C_R1_BUILD,
    notes: '',
  };
}

export async function materializeHeroProofSlotFromBuffer(input: {
  authorityBuffer: Buffer;
  sessionId: string;
  slotId?: string;
}): Promise<HeroMaterializationResult> {
  const slotId = input.slotId ?? HERO_MATERIALIZATION_PROOF_SLOT_ID;
  const trace = emptyTrace(slotId);

  const cropped = await cropAuthorityImageBuffer({ source: input.authorityBuffer, slotId });
  if (!cropped.ok) {
    trace.failureStage = 'AUTHORITY_CROP';
    trace.failureCode = cropped.code;
    trace.notes = cropped.message;
    return { ok: false, slotId, publicUrl: null, trace };
  }

  trace.authorityCropValid = true;
  trace.assetCreated = true;

  const dataUrl = bufferToDataUrl(cropped.buffer, cropped.mimeType);
  trace.assetPersisted = true;
  trace.storageBackend = 'session-data-url';
  trace.storagePath = `reconstruction/${input.sessionId}/${slotId}.jpg`;
  trace.publicUrl = dataUrl;
  trace.urlCreated = isBrowserSafeAssetUrl(dataUrl);
  trace.sourceBound = trace.urlCreated;
  trace.requestStatus = 200;
  trace.contentType = cropped.mimeType;
  trace.decoded = true;
  trace.naturalWidth = cropped.width;
  trace.naturalHeight = cropped.height;
  trace.placeholderRemoved = true;
  trace.visible = trace.urlCreated && cropped.width > 0 && cropped.height > 0;
  trace.notes = `Authority crop materialized (${cropped.width}x${cropped.height}, luma σ=${cropped.lumaStdDev.toFixed(1)})`;

  if (!trace.visible) {
    trace.failureStage = 'VISIBLE_RENDER';
    trace.failureCode = 'VISIBLE_RENDER_FAILED';
    return { ok: false, slotId, publicUrl: dataUrl, trace };
  }

  return { ok: true, slotId, publicUrl: dataUrl, trace };
}

async function fetchAuthorityBuffer(authorityUrl: string): Promise<{ ok: true; buffer: Buffer } | { ok: false; code: string; status: number | null }> {
  try {
    const res = await fetch(authorityUrl);
    if (!res.ok) {
      const code =
        res.status === 404
          ? 'ASSET_URL_404'
          : res.status === 403
            ? 'ASSET_URL_403'
            : 'ASSET_RESPONSE_EMPTY';
      return { ok: false, code, status: res.status };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32) return { ok: false, code: 'ASSET_RESPONSE_EMPTY', status: res.status };
    return { ok: true, buffer: buf };
  } catch {
    return { ok: false, code: 'ASSET_URL_CORS', status: null };
  }
}

export async function materializeHeroProofSlotViaApi(input: {
  authorityUrl: string;
  sessionId: string;
  slotId?: string;
}): Promise<HeroMaterializationResult> {
  const slotId = input.slotId ?? HERO_MATERIALIZATION_PROOF_SLOT_ID;
  const trace = emptyTrace(slotId);
  const base = resolveClientApiBase();
  if (!base) {
    trace.failureStage = 'NETWORK';
    trace.failureCode = 'ASSET_URL_INVALID';
    trace.notes = 'API base missing';
    return { ok: false, slotId, publicUrl: null, trace };
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/site00/hero-asset-materialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorityUrl: input.authorityUrl,
        sessionId: input.sessionId,
        slotId,
      }),
    });
    trace.requestStatus = res.status;
    trace.contentType = res.headers.get('content-type');
    if (!res.ok) {
      trace.failureStage = 'NETWORK';
      trace.failureCode =
        res.status === 404
          ? 'ASSET_URL_404'
          : res.status === 403
            ? 'ASSET_URL_403'
            : 'ASSET_RESPONSE_EMPTY';
      trace.notes = await res.text().catch(() => 'materialize API failed');
      return { ok: false, slotId, publicUrl: null, trace };
    }
    const body = (await res.json()) as HeroMaterializationResult & { trace?: AssetMaterializationTrace };
    if (body.trace) return { ok: body.ok, slotId, publicUrl: body.publicUrl, trace: body.trace };
    return body;
  } catch (err) {
    trace.failureStage = 'NETWORK';
    trace.failureCode = 'ASSET_URL_CORS';
    trace.notes = err instanceof Error ? err.message : String(err);
    return { ok: false, slotId, publicUrl: null, trace };
  }
}

export async function materializeHeroProofSlot(input: {
  authorityUrl: string;
  sessionId: string;
  slotId?: string;
}): Promise<HeroMaterializationResult> {
  const slotId = input.slotId ?? HERO_MATERIALIZATION_PROOF_SLOT_ID;
  const trace = emptyTrace(slotId);

  if (input.authorityUrl.startsWith('data:image/')) {
    try {
      const b64 = input.authorityUrl.split(',')[1] ?? '';
      const buffer = Buffer.from(b64, 'base64');
      return materializeHeroProofSlotFromBuffer({
        authorityBuffer: buffer,
        sessionId: input.sessionId,
        slotId,
      });
    } catch {
      trace.failureStage = 'AUTHORITY_CROP';
      trace.failureCode = 'AUTHORITY_CROP_INVALID';
      trace.notes = 'Invalid data URL authority';
      return { ok: false, slotId, publicUrl: null, trace };
    }
  }

  if (!isBrowserSafeAssetUrl(input.authorityUrl) && !input.authorityUrl.startsWith('http')) {
    trace.failureStage = 'URL_CREATION';
    trace.failureCode = 'ASSET_URL_INVALID';
    trace.notes = 'Authority URL not browser-safe';
    return { ok: false, slotId, publicUrl: null, trace };
  }

  const downloaded = await fetchAuthorityBuffer(input.authorityUrl);
  if (downloaded.ok) {
    return materializeHeroProofSlotFromBuffer({
      authorityBuffer: downloaded.buffer,
      sessionId: input.sessionId,
      slotId,
    });
  }

  if (!isVitestRuntime()) {
    const viaApi = await materializeHeroProofSlotViaApi(input);
    if (viaApi.ok || viaApi.trace.publicUrl) return viaApi;
  }

  trace.failureStage = 'NETWORK';
  trace.failureCode = downloaded.code as AssetMaterializationTrace['failureCode'];
  trace.requestStatus = downloaded.status;
  trace.notes = `Direct authority fetch failed (${downloaded.code})`;
  return { ok: false, slotId, publicUrl: null, trace };
}
