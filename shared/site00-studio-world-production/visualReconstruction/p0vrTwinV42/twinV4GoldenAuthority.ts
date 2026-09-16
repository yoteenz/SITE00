import { isLoadableForensicBlueprintUri } from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';
import { TWIN_V4_GOLDEN_AUTHORITY_INVALID, TWIN_V42_GOLDEN_AUTHORITY_KEY } from './constants.js';
import { readImageDimensionsFromBytes } from '../imageBytesDimensions.js';
import { sha256Hex } from './sha256Hex.js';
import type { TwinV4GoldenAuthority } from './twinV42Types.js';

const FORBIDDEN_AUTHORITY_PREFIXES = ['local-autobuild://', 'vitest-fal://', 'blob:'];

function isLocalhostGoldenUrl(url: string): boolean {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
}

export function isHttpsProductionGoldenUrl(url: string): boolean {
  if (site00IsBrowser() && import.meta.env?.DEV) {
    return isLoadableForensicBlueprintUri(url);
  }
  if (isLocalhostGoldenUrl(url)) return true;
  return url.startsWith('https://');
}

export async function fetchGoldenAuthorityBytes(url: string): Promise<{ bytes: Uint8Array; httpStatus: number }> {
  if (FORBIDDEN_AUTHORITY_PREFIXES.some((p) => url.startsWith(p))) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  if (!isLoadableForensicBlueprintUri(url) && !url.startsWith('file://')) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  if (url.startsWith('file://')) {
    if (site00IsBrowser()) throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
    const { readFileSync } = await import('node:fs');
    const filePath = decodeURIComponent(url.slice('file://'.length));
    return { bytes: new Uint8Array(readFileSync(filePath)), httpStatus: 200 };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  const mime = res.headers.get('content-type') ?? '';
  if (!mime.includes('image/png') && !mime.includes('image/jpeg') && !mime.includes('octet-stream')) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  return { bytes: new Uint8Array(await res.arrayBuffer()), httpStatus: res.status };
}

export async function measurePngDimensions(bytes: Uint8Array): Promise<{ width: number; height: number }> {
  if (site00IsBrowser()) {
    const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], {
      type: 'image/png',
    });
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  }
  return readImageDimensionsFromBytes(bytes);
}

const memoryPinnedGolden: { authority: TwinV4GoldenAuthority | null } = { authority: null };

export function readPinnedTwinV4GoldenAuthority(): TwinV4GoldenAuthority | null {
  if (memoryPinnedGolden.authority) return memoryPinnedGolden.authority;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TWIN_V42_GOLDEN_AUTHORITY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TwinV4GoldenAuthority;
  } catch {
    return null;
  }
}

export function writePinnedTwinV4GoldenAuthority(authority: TwinV4GoldenAuthority): void {
  memoryPinnedGolden.authority = authority;
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TWIN_V42_GOLDEN_AUTHORITY_KEY, JSON.stringify(authority));
}

export async function validateTwinV4GoldenAuthority(
  pin: TwinV4GoldenAuthority,
  options?: { preloadedBytes?: Uint8Array },
): Promise<TwinV4GoldenAuthority> {
  if (!pin.immutable || !pin.approvedByFounder) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  if (
    !isHttpsProductionGoldenUrl(pin.artifactUrl) &&
    !pin.artifactUrl.startsWith('file://') &&
    !isLocalhostGoldenUrl(pin.artifactUrl)
  ) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  let bytes: Uint8Array;
  let httpStatus: number;
  if (options?.preloadedBytes) {
    bytes = options.preloadedBytes;
    httpStatus = 200;
  } else {
    const fetched = await fetchGoldenAuthorityBytes(pin.artifactUrl);
    bytes = fetched.bytes;
    httpStatus = fetched.httpStatus;
  }
  const hash = await sha256Hex(bytes);
  if (hash !== pin.sha256) throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  const dims = await measurePngDimensions(bytes);
  if (dims.width !== pin.width || dims.height !== pin.height) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  return { ...pin, httpStatus };
}

export async function sealTwinV4GoldenAuthority(input: {
  artifactId: string;
  artifactUrl: string;
  bytes: Uint8Array;
  mimeType?: TwinV4GoldenAuthority['mimeType'];
}): Promise<TwinV4GoldenAuthority> {
  if (
    !isHttpsProductionGoldenUrl(input.artifactUrl) &&
    !input.artifactUrl.startsWith('file://') &&
    !isLocalhostGoldenUrl(input.artifactUrl)
  ) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  const dims = await measurePngDimensions(input.bytes);
  const authority: TwinV4GoldenAuthority = {
    artifactId: input.artifactId,
    artifactUrl: input.artifactUrl,
    sha256: await sha256Hex(input.bytes),
    width: dims.width,
    height: dims.height,
    mimeType: input.mimeType ?? 'image/png',
    approvedByFounder: true,
    approvedAt: new Date().toISOString(),
    immutable: true,
    authorityVersion: 'v42-golden-1',
  };
  writePinnedTwinV4GoldenAuthority(authority);
  return authority;
}

export async function resolveTwinV4GoldenAuthority(input: {
  candidate?: { artifactId: string; artifactUrl: string } | null;
  allowSeal?: boolean;
}): Promise<TwinV4GoldenAuthority> {
  const existing = readPinnedTwinV4GoldenAuthority();
  if (existing) {
    return validateTwinV4GoldenAuthority(existing);
  }
  if (!input.allowSeal || !input.candidate) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  const { bytes } = await fetchGoldenAuthorityBytes(input.candidate.artifactUrl);
  return sealTwinV4GoldenAuthority({
    artifactId: input.candidate.artifactId,
    artifactUrl: input.candidate.artifactUrl,
    bytes,
  });
}

export function clearTwinV4GoldenAuthorityForTests(): void {
  memoryPinnedGolden.authority = null;
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TWIN_V42_GOLDEN_AUTHORITY_KEY);
}
