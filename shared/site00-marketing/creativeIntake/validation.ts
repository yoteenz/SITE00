/** Stage validation — required fields per stage */

import type { CreativeIntakeExperience } from './types.js';

export function validateStage(
  experience: CreativeIntakeExperience,
  stageIndex: number,
  form: Record<string, string | string[]>,
): { ok: true } | { ok: false; errors: string[] } {
  const stage = experience.stages[stageIndex];
  if (!stage) return { ok: false, errors: ['Invalid stage'] };

  const errors: string[] = [];
  const isLast = stageIndex >= experience.stages.length - 1;

  for (const field of stage.fields) {
    const val = form[field.id];
    const empty = val === undefined || val === null || (Array.isArray(val) ? val.length === 0 : !String(val).trim());
    if (empty && stageIndex === 0 && field.id === 'campaignObjective') {
      errors.push(`${field.a11yLabel} is required`);
    }
    if (empty && isLast && field.id === 'businessName') {
      errors.push(`${field.a11yLabel} is required before completing intake`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

export function draftStorageKey(serviceId: string): string {
  return `site00_creative_intake_draft_v1_${serviceId}`;
}
