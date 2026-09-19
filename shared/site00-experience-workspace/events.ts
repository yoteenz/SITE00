/**
 * P0.EXPERIENCE.MODULE-WIRING1 — experience event taxonomy (fixture audit trail).
 */

export const EXPERIENCE_EVENT_KINDS = [
  'experience_created',
  'experience_updated',
  'experience_type_changed',
  'experience_scene_created',
  'experience_scene_updated',
  'experience_character_created',
  'experience_asset_added',
  'experience_asset_version_created',
  'experience_asset_approved',
  'experience_mechanic_created',
  'experience_mechanic_tested',
  'experience_build_created',
  'experience_build_ready',
  'experience_build_reviewed',
  'experience_tool_registered',
  'experience_tool_status_changed',
  'experience_tool_plan_created',
  'experience_task_created',
  'experience_task_approved',
  'experience_task_started',
  'experience_task_completed',
  'experience_task_failed',
  'experience_capture_created',
  'experience_reference_updated',
] as const;

export type ExperienceEventKind = (typeof EXPERIENCE_EVENT_KINDS)[number];

export function isExperienceEventKind(value: string): value is ExperienceEventKind {
  return (EXPERIENCE_EVENT_KINDS as readonly string[]).includes(value);
}
