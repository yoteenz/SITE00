import { mobileTwinPipelineDataScore } from './mobileTwinPipelineDataScore.js';
import { readMobileTwinPipelineFromBrowser } from './mobileTwinPipelinePersistence.js';
import type { MobileTwinPipelineState } from './types.js';

const BACKUP_KEY = 'site00:mobile-twin-pipeline:backup:v1';

function readBackupRow(projectId: string): MobileTwinPipelineState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, MobileTwinPipelineState>;
    return parsed[projectId.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

/** Main dedicated LS row or backup snapshot — whichever preserves more founder work. */
export function readRichestMobileTwinPipelineFromBrowser(projectId: string): MobileTwinPipelineState | null {
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  const backup = readBackupRow(projectId);
  if (stored && backup) {
    return mobileTwinPipelineDataScore(stored) >= mobileTwinPipelineDataScore(backup) ? stored : backup;
  }
  return stored ?? backup ?? null;
}
