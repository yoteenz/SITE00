import type { ClientAppOnboardingState } from './types.js';

export function resolveOnboardingState(meta?: Record<string, unknown>): ClientAppOnboardingState {
  const raw = typeof meta?.client_app_onboarding === 'string' ? meta.client_app_onboarding.toUpperCase() : '';
  const valid: ClientAppOnboardingState[] = [
    'NOT_INVITED',
    'INVITED',
    'OPENED_DOWNLOAD',
    'INSTALLED',
    'ONBOARDED',
    'DECLINED_FOR_NOW',
  ];
  if (valid.includes(raw as ClientAppOnboardingState)) return raw as ClientAppOnboardingState;
  if (meta?.client_app_invited_at) return 'INVITED';
  return 'NOT_INVITED';
}

export function nextOnboardingState(
  current: ClientAppOnboardingState,
  event: 'INVITE' | 'OPEN_DOWNLOAD' | 'INSTALL' | 'ONBOARD' | 'DECLINE',
): ClientAppOnboardingState {
  switch (event) {
    case 'INVITE':
      return current === 'NOT_INVITED' ? 'INVITED' : current;
    case 'OPEN_DOWNLOAD':
      return ['INVITED', 'NOT_INVITED'].includes(current) ? 'OPENED_DOWNLOAD' : current;
    case 'INSTALL':
      return ['OPENED_DOWNLOAD', 'INVITED'].includes(current) ? 'INSTALLED' : current;
    case 'ONBOARD':
      return 'ONBOARDED';
    case 'DECLINE':
      return 'DECLINED_FOR_NOW';
    default:
      return current;
  }
}

export function shouldShowWebAppCta(onboarding: ClientAppOnboardingState): boolean {
  return onboarding !== 'ONBOARDED' && onboarding !== 'DECLINED_FOR_NOW';
}
