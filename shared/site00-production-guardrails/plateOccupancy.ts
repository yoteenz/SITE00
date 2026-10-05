import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from './familyEnvironmentDistinctness.js';
import type { BlockedReason, GenerationRequest } from './types.js';

/** UI occupancy is defined before a plate is approved. Legacy families omit the matrix key. */
export const PLATE_OCCUPANCY_MATRIX_PATH = 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json';

const ZONE_FIELDS = [
  'primary_ui_zone',
  'secondary_ui_zone',
  'environment_focal_zone',
  'protected_negative_space',
  'occlusion_allowed_zone',
  'drawer_overlay_zone',
  'text_density_zone',
] as const;

const SCREEN_CLASSES = new Set([
  'ENVIRONMENT_DEPENDENT',
  'ENVIRONMENT_SUPPORTIVE',
  'ENVIRONMENT_MOSTLY_OCCLUDED',
  'ENVIRONMENT_MINIMAL',
]);

const PLATE_CLASSES = new Set(['SCREEN_PARENT', 'ENVIRONMENT_PLATE', 'NET_NEW_AUTHORITY']);

export type OccupancyCheck =
  | { status: 'PASS' }
  | { status: 'BLOCKED'; blockedReason: Extract<BlockedReason, 'PLATE_OCCUPANCY_REQUIRED'> };

function present(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function zonesReady(zone: unknown): boolean {
  if (!zone || typeof zone !== 'object') return false;
  const record = zone as Record<string, unknown>;
  return ZONE_FIELDS.every((field) => present(record[field]));
}

function counterbalanced(ui: string, environment: string): boolean {
  if (ui === 'LEFT') return environment === 'RIGHT' || environment === 'UPPER_RIGHT' || environment === 'LOWER_RIGHT';
  if (ui === 'RIGHT') return environment === 'LEFT' || environment === 'UPPER_LEFT' || environment === 'LOWER_LEFT';
  if (ui === 'CENTER') return environment === 'FRAME';
  return false;
}

/**
 * A mapped family cannot spend on a plate until the occupancy map exists.
 * Families without `plate_occupancy` in the matrix are unchanged.
 */
export function validatePlateOccupancy(request: GenerationRequest, repoRoot: string): OccupancyCheck {
  if (request.projectId !== 'JURNL') return { status: 'PASS' };
  if (!PLATE_CLASSES.has(request.generationClass)) return { status: 'PASS' };
  const key = familyKey(request.familyId);
  if (!/^F\d+$/.test(key)) return { status: 'PASS' };

  const matrixFile = path.join(repoRoot, PLATE_OCCUPANCY_MATRIX_PATH);
  if (!fs.existsSync(matrixFile)) return { status: 'PASS' };
  const matrix = JSON.parse(fs.readFileSync(matrixFile, 'utf8')) as {
    families?: Record<string, { plate_occupancy?: string }>;
  };
  const rel = matrix.families?.[key]?.plate_occupancy;
  if (!rel) return { status: 'PASS' };
  const file = path.join(repoRoot, rel);
  if (!fs.existsSync(file)) return { status: 'BLOCKED', blockedReason: 'PLATE_OCCUPANCY_REQUIRED' };

  const map = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
  const screen = String(map.screen_class ?? '');
  const ui = String(map.ui_weight ?? '');
  const environment = String(map.environmental_weight ?? '');
  const ready =
    map.family_id === key &&
    SCREEN_CLASSES.has(screen) &&
    map.scrim_fix_forbidden === true &&
    counterbalanced(ui, environment) &&
    zonesReady(map.mobile) &&
    zonesReady(map.tablet) &&
    zonesReady(map.desktop) &&
    (screen !== 'ENVIRONMENT_DEPENDENT' || counterbalanced(ui, environment));
  if (!ready) return { status: 'BLOCKED', blockedReason: 'PLATE_OCCUPANCY_REQUIRED' };
  return { status: 'PASS' };
}
