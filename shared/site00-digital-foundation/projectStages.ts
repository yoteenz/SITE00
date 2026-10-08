import type { ProjectStageCode, ProjectStageRecord, ProjectStageStatus } from './types.js';

export const FOUNDATION_STAGE_ORDER: ProjectStageCode[] = [
  '01_DETAILS_RECEIVED',
  '02_DOMAIN',
  '03_PROFESSIONAL_EMAIL',
  '04_DNS_SECURITY',
  '05_DEVICE_SIGNATURE',
  '06_FINAL_VERIFICATION',
  '07_FOUNDATION_COMPLETE',
];

export function initialProjectStages(nowIso: string): ProjectStageRecord[] {
  return FOUNDATION_STAGE_ORDER.map((stage_code, index) => ({
    stage_code,
    status: (index === 0 ? 'IN_PROGRESS' : 'WAITING') as ProjectStageStatus,
    updated_at: nowIso,
  }));
}

export function stageLabel(code: ProjectStageCode): string {
  const map: Record<ProjectStageCode, string> = {
    '01_DETAILS_RECEIVED': 'Details received',
    '02_DOMAIN': 'Domain',
    '03_PROFESSIONAL_EMAIL': 'Professional email',
    '04_DNS_SECURITY': 'DNS + security',
    '05_DEVICE_SIGNATURE': 'Device + signature',
    '06_FINAL_VERIFICATION': 'Final verification',
    '07_FOUNDATION_COMPLETE': 'Foundation complete',
  };
  return map[code];
}
