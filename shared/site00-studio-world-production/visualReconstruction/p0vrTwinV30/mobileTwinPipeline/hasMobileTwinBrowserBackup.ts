import { readMobileTwinAuthorityImageSnapshot } from './mobileTwinAuthorityImageSnapshot.js';
import { readMobileTwinPipelineFromBrowser } from './mobileTwinPipelinePersistence.js';

const BACKUP_KEY = 'site00:mobile-twin-pipeline:backup:v1';

function readBackupStore(): Record<string, unknown> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Any dedicated mobile-twin persistence on this browser (main LS, backup, or authority URI snapshot). */
export function hasMobileTwinBrowserBackup(projectId: string): boolean {
  const key = projectId.toLowerCase();
  if (readMobileTwinPipelineFromBrowser(projectId)) return true;
  if (readBackupStore()[key]) return true;
  if (readMobileTwinAuthorityImageSnapshot(projectId)) return true;
  return false;
}
