import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  ENTRY_002_ID,
  ENTRY_002_PRE_STORYBOARD_AUTHORITIES,
  ENTRY_002_REEL_KEYFRAME_CATALOG,
  entry002FinalStoryboardPanelPublicPath,
  entry002PreStoryboardPublicPath,
} from './assetCatalog.js';

export type RecoveredAssetRecord = {
  assetId: string;
  sourceLocation: string;
  sourceHash: string | null;
  entryId: string;
  sceneId: string | null;
  shotId: string | null;
  characterId: string | null;
  approvalStatus: 'FOUNDER_APPROVED' | 'REFERENCE_MISSING' | 'UNVERIFIED_ON_DISK';
  approvalVersion: string;
  creativeRole: string;
  width: number | null;
  height: number | null;
  mediaType: string;
  referencedContent: string;
  licenseStatus: 'INTERNAL_NDXBOOK_PRODUCTION';
};

export type Entry002AssetRecoveryReport = {
  entryId: typeof ENTRY_002_ID;
  recoveredAt: string;
  assetsFound: RecoveredAssetRecord[];
  assetsMissing: RecoveredAssetRecord[];
  stalePathNotes: string[];
};

function sha256File(absPath: string): string | null {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
  } catch {
    return null;
  }
}

function resolvePublicFile(repoRoot: string, publicPath: string): string {
  return path.join(repoRoot, 'public', publicPath.replace(/^\//, ''));
}

function probe(repoRoot: string, input: {
  assetId: string;
  publicPath?: string;
  storagePath?: string;
  creativeRole: string;
  approvalVersion: string;
  referencedContent: string;
  sceneId?: string | null;
  shotId?: string | null;
  characterId?: string | null;
}): RecoveredAssetRecord {
  let abs: string | null = null;
  if (input.publicPath) {
    abs = resolvePublicFile(repoRoot, input.publicPath);
  } else if (input.storagePath) {
    abs = path.join(repoRoot, input.storagePath);
    if (!fs.existsSync(abs)) {
      abs = path.join(repoRoot, 'public', input.storagePath.replace(/^site00\//, 'site00/'));
    }
  }

  const exists = abs && fs.existsSync(abs);
  const hash = exists && abs ? sha256File(abs) : null;
  return {
    assetId: input.assetId,
    sourceLocation: exists && abs ? abs : input.publicPath ?? input.storagePath ?? 'MISSING',
    sourceHash: hash,
    entryId: ENTRY_002_ID,
    sceneId: input.sceneId ?? null,
    shotId: input.shotId ?? null,
    characterId: input.characterId ?? null,
    approvalStatus: exists ? 'FOUNDER_APPROVED' : 'REFERENCE_MISSING',
    approvalVersion: input.approvalVersion,
    creativeRole: input.creativeRole,
    width: null,
    height: null,
    mediaType: exists && abs?.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
    referencedContent: input.referencedContent,
    licenseStatus: 'INTERNAL_NDXBOOK_PRODUCTION',
  };
}

export function recoverEntry002Assets(repoRoot: string): Entry002AssetRecoveryReport {
  const assets: RecoveredAssetRecord[] = [];

  for (const board of ENTRY_002_PRE_STORYBOARD_AUTHORITIES) {
    assets.push(
      probe(repoRoot, {
        assetId: board.assetId,
        publicPath: entry002PreStoryboardPublicPath(board.boardNumber),
        creativeRole: board.creativeRole,
        approvalVersion: 'B4.7',
        referencedContent: 'Five pre-storyboard visual authorities',
      }),
    );
  }

  for (let panel = 1; panel <= 16; panel += 1) {
    assets.push(
      probe(repoRoot, {
        assetId: `NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002-PANEL-${String(panel).padStart(2, '0')}`,
        publicPath: entry002FinalStoryboardPanelPublicPath(panel),
        creativeRole: 'FINAL_CINEMATIC_STORYBOARD_PANEL',
        approvalVersion: 'B4.9R',
        referencedContent: `Final cinematic storyboard panel ${panel}`,
        sceneId: 'cultural_glitch-familiar',
        shotId: `PANEL-${String(panel).padStart(2, '0')}`,
      }),
    );
  }

  for (const kf of ENTRY_002_REEL_KEYFRAME_CATALOG) {
    assets.push(
      probe(repoRoot, {
        assetId: kf.assetId,
        storagePath: kf.storagePath,
        creativeRole: `REEL_KEYFRAME_${kf.role}`,
        approvalVersion: 'B4.3',
        referencedContent: 'Authoritative flux-pro reel keyframe raster',
        characterId: 'char-entry002-subject-woman',
      }),
    );
  }

  const assetsFound = assets.filter((a) => a.approvalStatus === 'FOUNDER_APPROVED');
  const assetsMissing = assets.filter((a) => a.approvalStatus === 'REFERENCE_MISSING');

  return {
    entryId: ENTRY_002_ID,
    recoveredAt: new Date().toISOString(),
    assetsFound,
    assetsMissing,
    stalePathNotes: [
      'Panel manifest code references STORYBOARD-004 IDs while on-disk panel rasters use STORYBOARD-002 filenames — binding must use public path, not manifest ID alone.',
      'Reel keyframe storage paths target site00/assts/… webp rasters; none ship in public/ for this repo snapshot.',
    ],
  };
}
