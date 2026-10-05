import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from '../site00-production-guardrails/familyEnvironmentDistinctness.js';
import type { JurnlUiOccupancyContract } from './types.js';

const MATRIX_PATH = 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json';

export type OccupancyLoadResult =
  | { ok: true; contract: JurnlUiOccupancyContract; filePath: string }
  | { ok: false; reason: 'PLATE_OCCUPANCY_REQUIRED' | 'MISSING_OCCUPANCY_MAP'; detail: string };

export function loadJurnlOccupancyContract(repoRoot: string, familyId: string): OccupancyLoadResult {
  const key = familyKey(familyId);
  const matrixFile = path.join(repoRoot, MATRIX_PATH);
  if (!fs.existsSync(matrixFile)) {
    return { ok: false, reason: 'MISSING_OCCUPANCY_MAP', detail: 'Expression matrix missing' };
  }
  const matrix = JSON.parse(fs.readFileSync(matrixFile, 'utf8')) as {
    families?: Record<string, { plate_occupancy?: string }>;
  };
  const rel = matrix.families?.[key]?.plate_occupancy;
  if (!rel) {
    return { ok: false, reason: 'PLATE_OCCUPANCY_REQUIRED', detail: `No plate_occupancy for ${key}` };
  }
  const filePath = path.join(repoRoot, rel);
  if (!fs.existsSync(filePath)) {
    return { ok: false, reason: 'PLATE_OCCUPANCY_REQUIRED', detail: `Occupancy file missing: ${rel}` };
  }
  const map = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  const mobile = map.mobile as Record<string, string> | undefined;
  if (!mobile) {
    return { ok: false, reason: 'PLATE_OCCUPANCY_REQUIRED', detail: 'mobile occupancy zones missing' };
  }
  const contract: JurnlUiOccupancyContract = {
    primary_ui_zone: String(mobile.primary_ui_zone ?? ''),
    secondary_ui_zone: String(mobile.secondary_ui_zone ?? ''),
    environment_focal_zone: String(mobile.environment_focal_zone ?? ''),
    protected_negative_space: String(mobile.protected_negative_space ?? ''),
    occlusion_allowed_zone: String(mobile.occlusion_allowed_zone ?? ''),
    drawer_overlay_zone: String(mobile.drawer_overlay_zone ?? ''),
    text_density_zone: String(mobile.text_density_zone ?? ''),
    screen_exposure_class: map.screen_class as JurnlUiOccupancyContract['screen_exposure_class'],
  };
  return { ok: true, contract, filePath };
}

export function parentAuthorityRequiresOccupancy(role: string): boolean {
  return role === 'FULL_PAGE_AUTHORITY';
}
