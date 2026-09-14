/**
 * Node-only render/twin artifact writers (vitest + cloud agent).
 */

import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE } from '../constants.js';
import { resolveFounderAuthorityAbsolutePath } from '../designWorkspaceDerivation/pixelGroundedAuthorityAnalysisNode.js';
import type { MobileTwinCompositionState } from './types.js';

export function mobileTwinGeneratedDir(): string {
  const dir = path.join(process.cwd(), 'public', DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE.replace(/^\//, ''), 'founder-r5f2-ndxbook', 'r7m-generated');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function writeLocalMobileImplementationRender(input: {
  referenceUri: string;
  renderId: string;
}): Promise<{ publicPath: string; hash: string; width: number; height: number }> {
  const src = resolveFounderAuthorityAbsolutePath(input.referenceUri);
  const outName = `${input.renderId}.jpg`;
  const outAbs = path.join(mobileTwinGeneratedDir(), outName);
  const publicPath = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/founder-r5f2-ndxbook/r7m-generated/${outName}`;
  await sharp(src).modulate({ brightness: 1.02, saturation: 1.05 }).sharpen().jpeg({ quality: 92 }).toFile(outAbs);
  const buf = await sharp(outAbs).toBuffer();
  const hash = createHash('sha256').update(buf).digest('hex');
  const meta = await sharp(outAbs).metadata();
  return { publicPath, hash, width: meta.width ?? 0, height: meta.height ?? 0 };
}

export async function writeLocalMobileBlueprintTwinSvg(input: {
  composition: MobileTwinCompositionState;
  twinId: string;
  width: number;
  height: number;
}): Promise<{ publicPath: string; hash: string }> {
  const outName = `${input.twinId}.svg`;
  const outAbs = path.join(mobileTwinGeneratedDir(), outName);
  const publicPath = `${DESIGN_PAGE_V3_AUTHORITY_ASSET_BASE}/founder-r5f2-ndxbook/r7m-generated/${outName}`;
  const rects = input.composition.objectDefinitions
    .map(
      (o) =>
        `<rect id="${o.objectId}" x="${o.x}" y="${o.y}" width="${o.width}" height="${o.height}" fill="none" stroke="#0a7a3e" stroke-width="2" data-feature="${o.featureId ?? ''}"/>`,
    )
    .join('\n');
  const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 ${input.width} ${input.height}"><rect width="100%" height="100%" fill="#f4f4f4"/>${rects}</svg>`;
  const { writeFileSync } = await import('node:fs');
  writeFileSync(outAbs, svg, 'utf8');
  const hash = createHash('sha256').update(svg).digest('hex');
  return { publicPath, hash };
}
