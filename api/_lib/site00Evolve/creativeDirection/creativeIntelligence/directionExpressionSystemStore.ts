/**
 * Persist DirectionExpressionSystem records — separate from board manifest.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');

function manifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.directionExpressionSystems.json');
}

export function loadDirectionExpressionSystems(): DirectionExpressionSystem[] {
  const path = manifestPath();
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as DirectionExpressionSystem[];
  } catch {
    return [];
  }
}

export function findDirectionExpressionSystem(params: {
  directionId: string;
  brandLoreFingerprint: string;
  brandLoreVersion: number;
}): DirectionExpressionSystem | null {
  return (
    loadDirectionExpressionSystems().find(
      (e) =>
        e.directionId === params.directionId &&
        e.brandLoreFingerprint === params.brandLoreFingerprint &&
        e.brandLoreVersion === params.brandLoreVersion &&
        e.directionName === MARKED_UP_COPY_DIRECTION_NAME,
    ) ?? null
  );
}

export function upsertDirectionExpressionSystem(system: DirectionExpressionSystem): DirectionExpressionSystem {
  const all = loadDirectionExpressionSystems().filter((e) => e.expressionSystemId !== system.expressionSystemId);
  all.push(system);
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(manifestPath(), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return system;
}
