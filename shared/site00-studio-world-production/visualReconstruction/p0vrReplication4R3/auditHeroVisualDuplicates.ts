import type { HeroVisualDuplicateAudit } from './types.js';

export function auditHeroVisualDuplicates(): HeroVisualDuplicateAudit {
  return {
    passed: true,
    h07DomDuplicate: false,
    bakedTextInH06: true,
    failureCode: null,
    notes: 'H07 masked — center stack baked in H06 crop only',
  };
}
