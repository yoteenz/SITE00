/**
 * P0.E.FT5.2 — Extract source region → canonical screen master PNG.
 */

import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ASTRAL_REFERENCE_DESKTOP, ASTRAL_REFERENCE_MOBILE } from '../referenceAssets.js';
import { getBoardToScreenEntry } from './boardToScreenMap.js';

const BOARD_PATHS: Record<string, string> = {
  MASTER_DESKTOP_REFERENCE: ASTRAL_REFERENCE_DESKTOP.repoPath,
  MASTER_MOBILE_REFERENCE: ASTRAL_REFERENCE_MOBILE.repoPath,
};

export type ExtractScreenMasterResult = {
  ok: boolean;
  screenId: string;
  sourceRegionPath: string;
  canonicalMasterPath: string;
  publicMasterPath: string;
  width: number;
  height: number;
  error?: string;
};

export async function extractCanonicalScreenMaster(
  screenId: string,
  opts?: { targetWidth?: number; repoRoot?: string },
): Promise<ExtractScreenMasterResult> {
  const entry = getBoardToScreenEntry(screenId);
  if (!entry) return { ok: false, screenId, sourceRegionPath: '', canonicalMasterPath: '', publicMasterPath: '', width: 0, height: 0, error: 'Unknown screen' };

  const root = opts?.repoRoot ?? process.cwd();
  const boardPath = join(root, BOARD_PATHS[entry.sourceBoard]);
  if (!existsSync(boardPath)) {
    return { ok: false, screenId, sourceRegionPath: '', canonicalMasterPath: '', publicMasterPath: '', width: 0, height: 0, error: `Board missing: ${boardPath}` };
  }

  const { x, y, width, height } = entry.sourceRegion;
  const targetWidth = opts?.targetWidth ?? entry.targetViewportWidth;
  const targetHeight = Math.round((height / width) * targetWidth);

  const docsDir = join(root, 'docs/projects/astral-world/screen-masters', entry.viewport, screenId);
  const publicDir = join(root, 'public/astral-world/screen-masters', entry.viewport, screenId);
  mkdirSync(docsDir, { recursive: true });
  mkdirSync(publicDir, { recursive: true });

  const sourceRegionPath = join(docsDir, 'source-region.png');
  const canonicalMasterPath = join(docsDir, 'canonical-master-v1.png');
  const publicMasterPath = join(publicDir, 'canonical-master-v1.png');

  const extracted = sharp(boardPath).extract({ left: x, top: y, width, height });
  await extracted.clone().png().toFile(sourceRegionPath);
  await extracted
    .clone()
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(canonicalMasterPath);
  await sharp(canonicalMasterPath).png().toFile(publicMasterPath);

  return {
    ok: true,
    screenId,
    sourceRegionPath,
    canonicalMasterPath,
    publicMasterPath,
    width: targetWidth,
    height: targetHeight,
  };
}

export function repoRelativePublicPath(absolutePublicPath: string, repoRoot = process.cwd()): string {
  const rel = absolutePublicPath.replace(repoRoot, '').replace(/^\//, '');
  return rel.startsWith('public/') ? `/${rel.replace(/^public/, '')}` : `/${rel}`;
}
