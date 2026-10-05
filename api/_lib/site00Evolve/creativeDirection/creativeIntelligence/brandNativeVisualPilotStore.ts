/**
 * Persist visual pilot records — brand-native + identity-native V1 + V2 (A/B/C).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrandNativeVisualPilotRecord } from './brandNativeVisualBriefTypes.js';
import type { IdentityNativeVisualPilotRecord } from './identityNativeArtDirectionTypes.js';
import type { IdentityNativeV2PilotRecord, VisualPilotComparisonPayload } from './creativeExpressionTypes.js';
import { IDENTITY_NATIVE_HERO_V2_ASSET_ID } from './creativeExpressionTypes.js';
import { IDENTITY_NATIVE_HERO_ASSET_ID } from './identityNativeVisualPromptCompiler.js';
import { MARKED_UP_COPY_DIRECTION_NAME } from './creativeDirectionBoardTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');

function brandNativeManifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.brandNativeVisualPilots.json');
}

function identityNativeManifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.identityNativeVisualPilots.json');
}

function identityNativeV2ManifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.identityNativeV2VisualPilots.json');
}

export function loadBrandNativeVisualPilots(): BrandNativeVisualPilotRecord[] {
  const path = brandNativeManifestPath();
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as BrandNativeVisualPilotRecord[];
    return raw.map((p) => ({
      ...p,
      pilotKind: 'BRAND_NATIVE' as const,
      assetId: 'MUC-BRAND-NATIVE-HERO-PILOT' as const,
    }));
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

export function loadIdentityNativeV2VisualPilots(): IdentityNativeV2PilotRecord[] {
  const path = identityNativeV2ManifestPath();
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as IdentityNativeV2PilotRecord[];
  } catch {
    return [];
  }
}

export function findBrandNativeHeroPilot(): BrandNativeVisualPilotRecord | null {
  const pilots = loadBrandNativeVisualPilots().filter((p) => p.directionName === MARKED_UP_COPY_DIRECTION_NAME);
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function findIdentityNativeHeroPilotV1(): IdentityNativeVisualPilotRecord | null {
  const pilots = loadIdentityNativeVisualPilots().filter(
    (p) =>
      p.directionName === MARKED_UP_COPY_DIRECTION_NAME &&
      (p.assetId === IDENTITY_NATIVE_HERO_ASSET_ID || p.pilotKind === 'IDENTITY_NATIVE'),
  );
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function findIdentityNativeHeroPilotV2(): IdentityNativeV2PilotRecord | null {
  const pilots = loadIdentityNativeV2VisualPilots().filter(
    (p) => p.directionName === MARKED_UP_COPY_DIRECTION_NAME && p.assetId === IDENTITY_NATIVE_HERO_V2_ASSET_ID,
  );
  return pilots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

/** @deprecated use findIdentityNativeHeroPilotV1 */
export function findIdentityNativeHeroPilot(): IdentityNativeVisualPilotRecord | null {
  return findIdentityNativeHeroPilotV1();
}

/** @deprecated use findBrandNativeHeroPilot */
export function findLatestBrandNativeVisualPilot(): BrandNativeVisualPilotRecord | null {
  return findBrandNativeHeroPilot();
}

export function getVisualPilotComparisonPayload(): VisualPilotComparisonPayload {
  return {
    brandNativePilot: findBrandNativeHeroPilot(),
    identityNativePilot: findIdentityNativeHeroPilotV1(),
    identityNativeV2Pilot: findIdentityNativeHeroPilotV2(),
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

export function upsertIdentityNativeV2Pilot(record: IdentityNativeV2PilotRecord): IdentityNativeV2PilotRecord {
  const all = loadIdentityNativeV2VisualPilots().filter((p) => p.pilotId !== record.pilotId);
  all.push(record);
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(identityNativeV2ManifestPath(), `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  return record;
}
