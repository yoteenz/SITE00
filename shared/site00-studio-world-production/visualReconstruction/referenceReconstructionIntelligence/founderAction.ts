/**
 * DesignFounderAction — surfaced founder gates for reconstruction.
 * P0.VR.6R7
 */

export const FOUNDER_ACTION_TYPES = [
  'REVIEW_CROPS',
  'APPROVE_GENERATION',
  'REVIEW_OUTPUTS',
  'APPROVE_REGENERATION',
  'REVIEW_BINDINGS',
  'REVIEW_VISUAL_MATCH',
  'REVIEW_AUTHORITY_BOUNDARY',
] as const;

export type FounderActionType = (typeof FOUNDER_ACTION_TYPES)[number];

export const FOUNDER_ACTION_STATUSES = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'SUPERSEDED'] as const;
export type FounderActionStatus = (typeof FOUNDER_ACTION_STATUSES)[number];

export const FOUNDER_ACTION_PRIORITIES = ['BLOCKING', 'HIGH', 'NORMAL'] as const;
export type FounderActionPriority = (typeof FOUNDER_ACTION_PRIORITIES)[number];

export type DesignFounderAction = {
  actionId: string;
  projectId: string;
  workspace: 'DESIGN' | 'SKINS' | 'ASSETS';
  jobId: string;
  candidateId?: string;
  authorityId?: string;
  actionType: FounderActionType;
  title: string;
  summary: string;
  priority: FounderActionPriority;
  blocking: boolean;
  status: FounderActionStatus;
  createdAt: string;
  resolvedAt?: string | null;
  deepLink: string;
  context: Record<string, string | number | boolean>;
};

export const R7_FAILURE_CODES = [
  'FOUNDER_GATE_NOT_SURFACED',
  'FOUNDER_ACTION_DEEPLINK_MISSING',
  'BLOCKED_ASSET_JOB_BLOCKED_STRUCTURE',
  'RECONSTRUCTION_SUBJOB_COUPLED',
  'FOUNDER_APPROVAL_DID_NOT_RESUME_PIPELINE',
  'GENERATION_APPROVED_BUT_NOT_STARTED',
  'OUTPUT_REVIEW_NOT_SURFACED',
  'REGENERATION_APPROVAL_NOT_SURFACED',
  'PIPELINE_BLOCKED_WITHOUT_ACTION',
] as const;

export type R7FailureCode = (typeof R7_FAILURE_CODES)[number];

export const R8_FAILURE_CODES = [
  'FOUNDER_ACTION_ASSETS_ALERT_MISSING',
  'FOUNDER_ACTION_NOTIFICATION_MISSING',
  'FOUNDER_ACTION_NOTIFICATION_DUPLICATE',
  'FOUNDER_ACTION_NOTIFICATION_STALE',
  'FOUNDER_ACTION_DEEPLINK_WRONG_PROJECT',
  'FOUNDER_ACTION_READ_MARKED_RESOLVED',
  'FOUNDER_ACTION_ALERT_STATE_DIVERGED',
  'FOUNDER_ACTION_DARK_THEME_DRIFT',
  'FOUNDER_ACTION_RAW_PIPELINE_COPY',
] as const;

export type R8FailureCode = (typeof R8_FAILURE_CODES)[number];

export type WorkflowView =
  | null
  | 'crop-review'
  | 'generation-plan'
  | 'generation-executing'
  | 'output-review'
  | 'binding-review';
