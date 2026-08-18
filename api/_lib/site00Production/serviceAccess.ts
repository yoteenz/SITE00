import type { ServiceConnectionState } from './readinessTypes.js';

/** Canonical phase order for access + environment readiness. */
export const PHASE_ORDER = ['DISCOVERY', 'DESIGN', 'BUILD', 'INTEGRATION', 'LAUNCH'] as const;

const PHASE_ALIASES: Record<string, (typeof PHASE_ORDER)[number]> = {
  DISCOVERY: 'DISCOVERY',
  DESIGN: 'DESIGN',
  DESIGN_DIRECTION: 'DESIGN',
  ART_DIRECTION: 'DESIGN',
  BUILD: 'BUILD',
  DEVELOPMENT: 'BUILD',
  DEV: 'BUILD',
  INTEGRATION: 'INTEGRATION',
  LAUNCH: 'LAUNCH',
  PRODUCTION: 'LAUNCH',
};

export function normalizeProjectPhase(phase: string): (typeof PHASE_ORDER)[number] {
  const key = phase.trim().toUpperCase().replace(/\s+/g, '_');
  return PHASE_ALIASES[key] ?? 'DESIGN';
}

export function phaseIndex(phase: string): number {
  const norm = normalizeProjectPhase(phase);
  const idx = PHASE_ORDER.indexOf(norm);
  return idx === -1 ? 0 : idx;
}

export function isPhaseAtOrPast(currentPhase: string, requiredPhase: string): boolean {
  return phaseIndex(currentPhase) >= phaseIndex(requiredPhase);
}

const CONNECTED_STATES = new Set<ServiceConnectionState>(['CONNECTED', 'ACCESS_LIMITED']);

const BLOCKING_WHEN_REQUIRED = new Set<ServiceConnectionState>([
  'CLIENT_ACTION_REQUIRED',
  'INVITE_PENDING',
  'CONNECTING',
  'EXPIRED',
  'REVOKED',
  'ERROR',
  'REQUIRED_NOW',
]);

export function normalizeConnectionState(state: string | null | undefined): ServiceConnectionState {
  const s = String(state ?? 'NOT_REQUIRED').toUpperCase() as ServiceConnectionState;
  const allowed: ServiceConnectionState[] = [
    'NOT_REQUIRED',
    'REQUIRED_LATER',
    'REQUIRED_NOW',
    'CLIENT_ACTION_REQUIRED',
    'INVITE_PENDING',
    'CONNECTING',
    'CONNECTED',
    'ACCESS_LIMITED',
    'EXPIRED',
    'REVOKED',
    'ERROR',
  ];
  return allowed.includes(s) ? s : 'ERROR';
}

export function isServiceConnected(state: ServiceConnectionState): boolean {
  return CONNECTED_STATES.has(state);
}

export function isServiceBlockingWhenRequired(state: ServiceConnectionState): boolean {
  return BLOCKING_WHEN_REQUIRED.has(state);
}

/**
 * Whether a service requirement applies to the current project phase.
 * REQUIRED_LATER / NOT_REQUIRED never block current-phase work.
 */
export function isServiceRequiredForCurrentPhase(
  requiredPhase: string,
  currentPhase: string,
  connectionState: ServiceConnectionState,
): boolean {
  if (connectionState === 'NOT_REQUIRED') return false;
  if (!isPhaseAtOrPast(currentPhase, requiredPhase)) return false;
  return true;
}

export function effectiveServiceState(input: {
  requirementState: string;
  connectionState?: string | null;
  requiredPhase: string;
  currentPhase: string;
}): ServiceConnectionState {
  const fromConnection = input.connectionState
    ? normalizeConnectionState(input.connectionState)
    : null;
  const fromRequirement = normalizeConnectionState(input.requirementState);

  const effective = fromConnection ?? fromRequirement;

  if (effective === 'NOT_REQUIRED') return 'NOT_REQUIRED';
  if (!isPhaseAtOrPast(input.currentPhase, input.requiredPhase)) {
    return effective === 'CONNECTED' || effective === 'ACCESS_LIMITED' ? effective : 'REQUIRED_LATER';
  }
  if (isServiceConnected(effective)) return effective;
  if (effective === 'REQUIRED_LATER') return 'REQUIRED_NOW';
  return effective;
}

export function connectionStateLabel(state: ServiceConnectionState): string {
  return state.replace(/_/g, ' ');
}

export function provisioningPriorityBucket(
  requiredPhase: string,
  currentPhase: string,
  connectionState: ServiceConnectionState,
): 'NEEDED_NOW' | 'COMING_UP' | 'LATER' | 'COMPLETE' {
  if (isServiceConnected(connectionState)) return 'COMPLETE';
  const cur = phaseIndex(currentPhase);
  const req = phaseIndex(requiredPhase);
  if (connectionState === 'NOT_REQUIRED') return 'LATER';
  if (cur >= req) return 'NEEDED_NOW';
  if (req - cur === 1) return 'COMING_UP';
  return 'LATER';
}

export function canSendClientReminder(state: ServiceConnectionState): boolean {
  return state === 'CLIENT_ACTION_REQUIRED';
}
