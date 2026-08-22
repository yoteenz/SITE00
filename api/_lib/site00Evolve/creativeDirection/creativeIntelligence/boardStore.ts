/**
 * Durable Creative Direction Board manifest — pilot storage.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSupabaseAdmin } from '../../../supabase.js';
import { SITE00_ASSETS_BUCKET } from '../../../site00Assts/storage.js';
import type { BoardAssetRecord, CreativeDirectionBoard } from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');

type PersistedBoard = Omit<
  CreativeDirectionBoard,
  'desktopBoardUrl' | 'mobileBoardUrl' | 'socialProofUrl' | 'motionProofUrl'
> & {
  assetRecords: Omit<BoardAssetRecord, 'url'>[];
};

function manifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.creativeDirectionBoards.json');
}

function withPublicUrls(board: PersistedBoard): CreativeDirectionBoard {
  const supabase = getSupabaseAdmin();
  const urlFor = (path: string) =>
    supabase.storage.from(SITE00_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;

  return {
    ...board,
    desktopBoardUrl: urlFor(board.desktopBoardStoragePath),
    mobileBoardUrl: urlFor(board.mobileBoardStoragePath),
    socialProofUrl: board.socialProofStoragePath ? urlFor(board.socialProofStoragePath) : undefined,
    motionProofUrl: board.motionProofStoragePath ? urlFor(board.motionProofStoragePath) : undefined,
    assetRecords: board.assetRecords.map((a) => ({
      ...a,
      url: urlFor(a.storagePath),
    })),
  };
}

export function loadCreativeDirectionBoardManifest(): CreativeDirectionBoard[] {
  const path = manifestPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, 'utf8');
    const persisted = JSON.parse(raw) as PersistedBoard[];
    return persisted.map(withPublicUrls);
  } catch {
    return [];
  }
}

function saveManifest(boards: CreativeDirectionBoard[]): void {
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  const persisted: PersistedBoard[] = boards.map((b) => {
    const { desktopBoardUrl: _d, mobileBoardUrl: _m, socialProofUrl: _s, motionProofUrl: _mo, ...rest } = b;
    return {
      ...rest,
      assetRecords: b.assetRecords.map(({ url: _u, ...assetRest }) => assetRest),
    };
  });
  writeFileSync(manifestPath(), `${JSON.stringify(persisted, null, 2)}\n`, 'utf8');
}

export function findCreativeDirectionBoard(params: {
  comparisonSetKey: string;
  directionId: string;
  boardPlanVersion: string;
}): CreativeDirectionBoard | null {
  return (
    loadCreativeDirectionBoardManifest().find(
      (b) =>
        b.comparisonSetKey === params.comparisonSetKey &&
        b.directionId === params.directionId &&
        b.boardPlanVersion === params.boardPlanVersion,
    ) ?? null
  );
}

export function upsertCreativeDirectionBoard(board: CreativeDirectionBoard): CreativeDirectionBoard {
  const all = loadCreativeDirectionBoardManifest().filter((b) => b.boardId !== board.boardId);
  all.push(board);
  saveManifest(all);
  return board;
}

export function storagePathForBoardAsset(params: {
  comparisonIndex: number;
  manifestId: string;
  iteration: number;
  ext: 'webp' | 'svg' | 'png';
}): string {
  const iter = params.iteration > 0 ? `_i${params.iteration}` : '';
  return `site00/creative-direction/ndxbook/boards/${String(params.comparisonIndex).padStart(2, '0')}/${params.manifestId}${iter}.${params.ext}`;
}

export function storagePathForFinalBoard(params: {
  comparisonIndex: number;
  breakpoint: 'desktop' | 'mobile';
  boardPlanVersion: string;
}): string {
  const safe = params.boardPlanVersion.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `site00/creative-direction/ndxbook/boards/${String(params.comparisonIndex).padStart(2, '0')}/final-${params.breakpoint}-${safe}.svg`;
}

export function groupBoardsByDirection(
  boards: CreativeDirectionBoard[],
  comparisonSetKey: string,
): Record<string, CreativeDirectionBoard> {
  const grouped: Record<string, CreativeDirectionBoard> = {};
  for (const board of boards) {
    if (board.comparisonSetKey !== comparisonSetKey) continue;
    if (board.directionName !== MARKED_UP_COPY_DIRECTION_NAME) continue;
    if (board.productionState !== 'READY' && board.productionState !== 'NEEDS_HUMAN_REVIEW') continue;
    if (!board.founderVisible) continue;
    grouped[board.directionId] = board;
  }
  return grouped;
}

export function attachCreativeDirectionBoardsToComparisonSet<
  T extends { brandLoreFingerprint: string; brandLoreProfileVersion: number; directions: Array<{ directionId: string }> },
>(comparisonSet: T): T & { creativeDirectionBoardsByDirection?: Record<string, CreativeDirectionBoard> } {
  const key = `ndxbook:6-direction:v${comparisonSet.brandLoreProfileVersion}:${comparisonSet.brandLoreFingerprint}`;
  const boards = groupBoardsByDirection(loadCreativeDirectionBoardManifest(), key);
  if (!Object.keys(boards).length) return comparisonSet;
  return { ...comparisonSet, creativeDirectionBoardsByDirection: boards };
}
