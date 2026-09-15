import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const GITHUB_RAW_FOUNDER_MOBILE =
  'https://raw.githubusercontent.com/yoteenz/SITE00/main/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';

const GITHUB_RAW_NDXBOOK_RECONSTRUCTION_BASE =
  'https://raw.githubusercontent.com/yoteenz/SITE00/main/public/assets/ndxbook-reconstruction';

function ndxbookReconstructionFileName(source: string): string | null {
  const match = source.match(/\/assets\/ndxbook-reconstruction\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function githubRawNdxbookReconstruction(fileName: string): string {
  return `${GITHUB_RAW_NDXBOOK_RECONSTRUCTION_BASE}/${fileName}`;
}

function isAlreadyFalCdn(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('fal.media') || host.includes('fal.ai') || host.includes('fal.run');
  } catch {
    return false;
  }
}

function resolveRepoPublicPath(publicPath: string): string {
  const rel = publicPath.replace(/^\//, '');
  return path.join(process.cwd(), 'public', rel);
}

function mimeForName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function assertJpegOrPng(bytes: Buffer, context: string): void {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  if (!isJpeg && !isPng) {
    throw new Error(
      `MOBILE_RENDER_REFERENCE_FETCH_FAILED: ${context} is not a raster image (site00.com may be serving SPA HTML — redeploy public JPG or use FAL upload)`,
    );
  }
}

async function loadReferenceBytes(source: string): Promise<{ bytes: Buffer; fileName: string }> {
  if (source.startsWith('/')) {
    const abs = resolveRepoPublicPath(source);
    if (existsSync(abs)) {
      const bytes = readFileSync(abs);
      assertJpegOrPng(bytes, abs);
      return { bytes, fileName: path.basename(abs) };
    }
  }

  const ndxFile = ndxbookReconstructionFileName(source);
  if (ndxFile) {
    const localAbs = resolveRepoPublicPath(`/assets/ndxbook-reconstruction/${ndxFile}`);
    if (existsSync(localAbs)) {
      const bytes = readFileSync(localAbs);
      assertJpegOrPng(bytes, localAbs);
      return { bytes, fileName: path.basename(localAbs) };
    }
  }

  const candidates: string[] = [];
  if (source.startsWith('http')) candidates.push(source);
  if (source.includes('founder-r5f2-ndxbook/mobile-master.jpg')) {
    candidates.push(GITHUB_RAW_FOUNDER_MOBILE);
  }
  if (ndxFile) {
    candidates.push(githubRawNdxbookReconstruction(ndxFile));
  }

  for (const url of candidates) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) continue;
    const ct = (res.headers.get('content-type') ?? '').toLowerCase();
    if (ct.includes('text/html')) continue;
    const bytes = Buffer.from(await res.arrayBuffer());
    try {
      assertJpegOrPng(bytes, url);
    } catch {
      continue;
    }
    const fileName = url.split('/').pop()?.split('?')[0] || 'reference.jpg';
    return { bytes, fileName };
  }

  throw new Error('MOBILE_RENDER_REFERENCE_FETCH_FAILED: could not load design reference bytes for FAL');
}

async function uploadBytesToFal(bytes: Buffer, fileName: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY_MISSING');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const mime = mimeForName(fileName);
  return fal.storage.upload(new File([bytes], fileName, { type: mime }));
}

/**
 * FAL cannot fetch site00.com SPA paths (HTML 200). Upload references to fal.storage first.
 */
export async function ensureFalAccessibleReferenceUrls(referenceSources: string[]): Promise<string[]> {
  if (process.env.VITEST === 'true') return referenceSources;

  const out: string[] = [];
  for (const source of referenceSources) {
    if (isAlreadyFalCdn(source)) {
      out.push(source);
      continue;
    }
    const { bytes, fileName } = await loadReferenceBytes(source);
    out.push(await uploadBytesToFal(bytes, fileName));
  }
  return out;
}
