/**
 * Persist visual pilot records — brand-native + identity-native (separate heroes for A/B).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrandNativeVisualPilotRecord } from './brandNativeVisualBriefTypes.js';
import type {
  IdentityNativeVisualPilotRecord,
  VisualPilotComparisonPayload,
} from './identityNativeArtDirectionTypes.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');

function brandNativeManifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.brandNativeVisualPilots.json');
}

function identityNativeManifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.identityNativeVisualPilots.json');
}

export function loadBrandNativeVisualPilots(): BrandNativeVisualPilotRecord[] {
  const path = brandNativeManifestPath();
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as BrandNativeVisualPilotRecord[];
    return raw.map((p) => ({ ...p, pilotKind: 'BRAND_NATIVE' as const, assetId: 'MUC-BRAND-NATIVE-HERO-PILOT' as const }));
  } catch {
    return [];
  }
}

export function loadIdentityNativeVisualPilots(): IdentityNativeVisualPilotRecord[] {
  const path = identityNativeManifestPath();
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as IdentityNativeVisualPilotRecord[];
  } catch {
    return [];
  }
}

export function findBrandNativeHeroPilot(): BrandNativeVisualPilotRecord | null {
  const pilots = loadBrandNativeVisualPilots().filter((p) => p.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function findIdentityNativeHeroPilot(): IdentityNativeVisualPilotRecord | null {
  const pilots = loadIdentityNativeVisualPilots().filter((p) => p.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

/** @deprecated use findBrandNativeHeroPilot */
export function findLatestBrandNativeVisualPilot(): BrandNativeVisualPilotRecord | null {
  return findBrandNativeHeroPilot();
}

export function getVisualPilotComparisonPayload(): VisualPilotComparisonPayload {
  return {
    brandNativePilot: findBrandNativeHeroPilot(),
    identityNativePilot: findIdentityNativeHeroPilot(),
  };
}

export function upsertBrandNativeVisualPilot(record: BrandNativeVisualPilotRecord): BrandNativeVisualPilotRecord {
  const all = loadBrandNativeVisualPilots().filter((p) => p.pilotId !== record.pilotId);
  all.push(record);
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(brandNativeManifestPath(), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return record;
}

export function upsertIdentityNativeVisualPilot(
  record: IdentityNativeVisualPilotRecord,
): IdentityNativeVisualPilotRecord {
  const all = loadIdentityNativeVisualPilots().filter((p) => p.pilotId !== record.pilotId);
  all.push(record);
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(identityNativeManifestPath(), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return record;
}
