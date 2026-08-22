/**
 * Persist brand-native visual pilot records — separate from board manifest.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrandNativeVisualPilotRecord } from './brandNativeVisualBriefTypes.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');

function manifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.brandNativeVisualPilots.json');
}

export function loadBrandNativeVisualPilots(): BrandNativeVisualPilotRecord[] {
  const path = manifestPath();
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as BrandNativeVisualPilotRecord[];
  } catch {
    return [];
  }
}

export function findLatestBrandNativeVisualPilot(): BrandNativeVisualPilotRecord | null {
  const pilots = loadBrandNativeVisualPilots().filter((p) => p.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function upsertBrandNativeVisualPilot(record: BrandNativeVisualPilotRecord): BrandNativeVisualPilotRecord {
  const all = loadBrandNativeVisualPilots().filter((p) => p.pilotId !== record.pilotId);
  all.push(record);
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(manifestPath(), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return record;
}
