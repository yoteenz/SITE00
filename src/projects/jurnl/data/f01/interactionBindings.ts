/**
 * JURNL F01 — interaction manifest → runtime bindings (data only).
 *
 * Every row of JURNL/F01_ENTRY/MANIFEST/F01_INTERACTION_MANIFEST.json (74) resolves to:
 *   - a runtime COMPONENT (the manifest's component_reference → exported runtime primitive), and
 *   - a runtime TRIGGER (`data-jrn-trigger` in the live markup) on a reachable SURFACE (route + optional
 *     `?state=` / `?overlay=` selector), except the 12 GLOBAL primitive rows which bind to the component only.
 * tests/jurnlF01Runtime.test.tsx renders every surface and asserts every trigger exists.
 */

import manifest from '../../../../../JURNL/F01_ENTRY/MANIFEST/F01_INTERACTION_MANIFEST.json';

export type F01ManifestRow = {
  interaction_id: string;
  source_screen: string;
  trigger: string;
  interaction_type: string;
  authority_file: string;
  shared_or_distinct: string;
  component_reference: string;
  opening_behavior: string;
  closing_behavior: string;
  navigation_result: string;
  data_dependency: string;
  error_behavior: string;
  responsive_behavior: string;
  accessibility_notes: string;
};

export const F01_INTERACTION_MANIFEST = manifest as { family: string; interactionCount: number; typographyRule: string; interactions: F01ManifestRow[] };

/** Manifest component_reference → the runtime component that implements it (src/projects/jurnl/runtime/components/primitives.tsx). */
export const JURNL_COMPONENT_RUNTIME: Record<string, { component: string; variant?: string; primitive: string }> = {
  JURNL_BUTTON_PRIMARY: { component: 'JurnlButton', variant: 'primary', primitive: 'BUTTON' },
  JURNL_BUTTON_SECONDARY: { component: 'JurnlButton', variant: 'secondary', primitive: 'BUTTON' },
  JURNL_LOADING_BUTTON: { component: 'JurnlButton', variant: 'loading', primitive: 'BUTTON' },
  JURNL_INPUT: { component: 'JurnlInput', primitive: 'INPUT' },
  JURNL_INPUT_FOCUSED: { component: 'JurnlInput', variant: 'focused', primitive: 'INPUT' },
  JURNL_CHECKBOX: { component: 'JurnlCheckbox', primitive: 'CHECKBOX' },
  JURNL_TOGGLE: { component: 'JurnlToggle', primitive: 'TOGGLE' },
  JURNL_DRAWER_SHORT: { component: 'JurnlDrawer', variant: 'short', primitive: 'DRAWER' },
  JURNL_DRAWER_LONG: { component: 'JurnlDrawer', variant: 'long', primitive: 'DRAWER' },
  JURNL_FULL_SCREEN_SHEET: { component: 'JurnlSheet', primitive: 'SHEET' },
  JURNL_CONFIRMATION_MODAL: { component: 'JurnlModal', primitive: 'MODAL' },
  JURNL_INLINE_EXPANSION: { component: 'JurnlInlineExpansion', primitive: 'PANEL' },
  JURNL_ERROR_PANEL: { component: 'JurnlErrorPanel', primitive: 'PANEL' },
  JURNL_SUCCESS_BANNER: { component: 'JurnlSuccessBanner', primitive: 'TOAST' },
  JURNL_EXTERNAL_HANDOFF: { component: 'JurnlExternalHandoff', primitive: 'MODAL' },
  JURNL_NATIVE_HANDOFF_BOUNDARY: { component: 'JurnlNativeHandoff', primitive: 'MODAL' },
  JURNL_ROUTE_TRANSITION: { component: 'JurnlScreenTransition', primitive: 'ROUTE' },
};

export type F01Binding = {
  interactionId: string;
  /** `data-jrn-trigger` of the live element; null = global primitive (component-only binding). */
  trigger: string | null;
  /** Surface that renders the trigger: screen + optional selector. */
  surface: { screenId: string; query?: string } | null;
  /** Where the interaction lands. */
  result: { kind: 'route'; screenId: string } | { kind: 'overlay'; overlayId: string } | { kind: 'inline'; marker: string } | { kind: 'toast' } | { kind: 'loading' } | { kind: 'focus' } | { kind: 'boundary'; family: string } | { kind: 'primitive' };
};

const r = (screenId: string) => ({ kind: 'route', screenId }) as const;
const o = (overlayId: string) => ({ kind: 'overlay', overlayId }) as const;
const inl = (marker: string) => ({ kind: 'inline', marker }) as const;
const at = (screenId: string, query?: string) => ({ screenId, query });

export const F01_BINDINGS: Record<string, Omit<F01Binding, 'interactionId'>> = {
  'F01.00.ROUTE.GET_STARTED': { trigger: 'welcome-get-started', surface: at('F01.00'), result: r('F01.01') },
  'F01.00.ROUTE.SIGN_IN': { trigger: 'welcome-sign-in', surface: at('F01.00'), result: r('F01.03') },

  'F01.GLOBAL.PRIM.DRAWER.SHORT': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.DRAWER.LONG': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.SHEET.FULL': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.MODAL.CONFIRM': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.INLINE.EXPAND': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.ERROR.PANEL': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.BANNER.SUCCESS': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.BUTTON.LOADING': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.INPUT.FOCUS': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.HANDOFF.EXTERNAL': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.HANDOFF.NATIVE': { trigger: null, surface: null, result: { kind: 'primitive' } },
  'F01.GLOBAL.PRIM.ROUTE.TRANSITION': { trigger: null, surface: null, result: { kind: 'primitive' } },

  'F01.01.INPUT.FOCUS': { trigger: 'create-first-name', surface: at('F01.01'), result: { kind: 'focus' } },
  'F01.01.PASSWORD.REQS': { trigger: 'create-password', surface: at('F01.01', 'state=password_satisfied'), result: inl('create-password-requirements') },
  'F01.01.DRAWER.TERMS': { trigger: 'create-terms-link', surface: at('F01.01'), result: o('terms') },
  'F01.01.DRAWER.PRIVACY': { trigger: 'create-privacy-link', surface: at('F01.01'), result: o('privacy-policy') },
  'F01.01.SOCIAL.APPLE': { trigger: 'create-apple', surface: at('F01.01'), result: o('social-apple') },
  'F01.01.SOCIAL.GOOGLE': { trigger: 'create-google', surface: at('F01.01'), result: o('social-google') },
  'F01.01.SUBMIT.LOADING': { trigger: 'create-submit', surface: at('F01.01', 'state=loading'), result: { kind: 'loading' } },
  'F01.01.ERROR.EMAIL_IN_USE': { trigger: 'create-error-email-in-use', surface: at('F01.01', 'state=email_in_use'), result: r('F01.03') },
  'F01.01.ERROR.VALIDATION': { trigger: 'create-error-validation', surface: at('F01.01', 'state=validation_error'), result: inl('create-error-validation') },

  'F01.02.HANDOFF.MAIL': { trigger: 'verify-open-mail', surface: at('F01.02'), result: o('mail') },
  'F01.02.RESEND.SUCCESS': { trigger: 'verify-resend', surface: at('F01.02'), result: { kind: 'toast' } },
  'F01.02.CHANGE.EMAIL': { trigger: 'verify-change-email', surface: at('F01.02'), result: o('change-email') },
  'F01.02.ERROR.EXPIRED': { trigger: 'verify-error-expired', surface: at('F01.02', 'state=expired_link'), result: inl('verify-error-expired') },
  'F01.02.SUCCESS.VERIFY': { trigger: 'verify-success-continue', surface: at('F01.02', 'state=verification_success'), result: r('F01.09') },

  'F01.03.INPUT.FOCUS': { trigger: 'signin-email', surface: at('F01.03'), result: { kind: 'focus' } },
  'F01.03.PASSWORD.TOGGLE': { trigger: 'signin-password-toggle', surface: at('F01.03'), result: inl('signin-password') },
  'F01.03.CHECKBOX.REMEMBER': { trigger: 'signin-keep', surface: at('F01.03'), result: inl('signin-keep') },
  'F01.03.ROUTE.FORGOT': { trigger: 'signin-forgot', surface: at('F01.03'), result: r('F01.05') },
  'F01.03.SOCIAL.APPLE': { trigger: 'signin-apple', surface: at('F01.03'), result: o('social-apple') },
  'F01.03.SOCIAL.GOOGLE': { trigger: 'signin-google', surface: at('F01.03'), result: o('social-google') },
  'F01.03.ERROR.PASSWORD': { trigger: 'signin-error-incorrect', surface: at('F01.03', 'state=incorrect_password'), result: inl('signin-error-incorrect') },
  'F01.03.ERROR.NOT_FOUND': { trigger: 'signin-error-not-found', surface: at('F01.03', 'state=account_not_found'), result: r('F01.01') },
  'F01.03.LOCKED.PANEL': { trigger: 'locked-back', surface: at('F01.03', 'state=locked'), result: o('locked') },
  'F01.03.SUBMIT.LOADING': { trigger: 'signin-submit', surface: at('F01.03', 'state=loading'), result: { kind: 'loading' } },

  'F01.04.HANDOFF.FACEID': { trigger: 'unlock-faceid', surface: at('F01.04'), result: o('faceid-unlock') },
  'F01.04.ERROR.FACEID': { trigger: 'unlock-error-faceid', surface: at('F01.04', 'state=faceid_failed'), result: inl('unlock-error-faceid') },
  'F01.04.SHEET.PASSWORD': { trigger: 'unlock-use-password', surface: at('F01.04'), result: o('use-password') },
  'F01.04.SHEET.SWITCH': { trigger: 'unlock-switch-account', surface: at('F01.04'), result: o('switch-account') },
  'F01.04.MODAL.SIGNOUT': { trigger: 'switch-sign-out', surface: at('F01.04', 'overlay=switch-account'), result: o('sign-out') },

  'F01.05.INPUT.FOCUS': { trigger: 'forgot-email', surface: at('F01.05'), result: { kind: 'focus' } },
  'F01.05.SUBMIT.LOADING': { trigger: 'forgot-submit', surface: at('F01.05'), result: r('F01.06') },
  'F01.05.ERROR.EMAIL': { trigger: 'forgot-error-email', surface: at('F01.05', 'state=invalid_email'), result: inl('forgot-error-email') },

  'F01.06.HANDOFF.MAIL': { trigger: 'reset-sent-open-mail', surface: at('F01.06'), result: o('mail') },
  'F01.06.RESEND.TOAST': { trigger: 'reset-sent-resend', surface: at('F01.06'), result: { kind: 'toast' } },
  'F01.06.ERROR.EXPIRED': { trigger: 'reset-sent-error-expired', surface: at('F01.06', 'state=expired_link'), result: inl('reset-sent-error-expired') },

  'F01.07.INPUT.FOCUS': { trigger: 'newpw-password', surface: at('F01.07'), result: { kind: 'focus' } },
  'F01.07.PASSWORD.REQS': { trigger: 'newpw-requirements', surface: at('F01.07'), result: inl('newpw-requirements') },
  'F01.07.ERROR.MISMATCH': { trigger: 'newpw-error-mismatch', surface: at('F01.07', 'state=mismatch'), result: inl('newpw-error-mismatch') },
  'F01.07.SUBMIT.LOADING': { trigger: 'newpw-submit', surface: at('F01.07'), result: r('F01.08') },

  'F01.08.ROUTE.SIGNIN': { trigger: 'reset-success-sign-in', surface: at('F01.08'), result: r('F01.03') },

  'F01.09.HANDOFF.ENABLE': { trigger: 'bio-enable', surface: at('F01.09'), result: o('faceid-enable') },
  'F01.09.SUCCESS.ENABLED': { trigger: 'bio-enabled', surface: at('F01.09', 'state=biometric_enabled'), result: r('F01.10') },
  'F01.09.DENIED.SHEET': { trigger: 'bio-denied-continue', surface: at('F01.09', 'state=biometric_declined'), result: o('biometric-denied') },
  'F01.09.UNSUPPORTED.PANEL': { trigger: 'bio-error-unavailable', surface: at('F01.09', 'state=biometric_unavailable'), result: r('F01.10') },
  'F01.09.SKIP.CONTINUE': { trigger: 'bio-not-now', surface: at('F01.09'), result: r('F01.10') },

  'F01.10.TRUST.CONFIRM': { trigger: 'trust-confirm', surface: at('F01.10'), result: { kind: 'toast' } },
  'F01.10.DRAWER.LEARN': { trigger: 'trust-learn', surface: at('F01.10'), result: o('device-learn') },

  'F01.11.DRAWER.YOUR_DATA': { trigger: 'privacy-row-your-data', surface: at('F01.11'), result: o('privacy-your-data') },
  'F01.11.DRAWER.CONNECTED_ACCOUNTS': { trigger: 'privacy-row-connected-accounts', surface: at('F01.11'), result: o('privacy-connected-accounts') },
  'F01.11.DRAWER.AI_ACCESS': { trigger: 'privacy-row-ai-access', surface: at('F01.11'), result: o('privacy-ai-access') },
  'F01.11.DRAWER.DATA_EXPORT': { trigger: 'privacy-row-data-export', surface: at('F01.11'), result: o('privacy-data-export') },
  'F01.11.DRAWER.REMOVE_ACCESS': { trigger: 'privacy-row-remove-access', surface: at('F01.11'), result: o('privacy-remove-access') },
  'F01.11.ROUTE.CONTINUE': { trigger: 'privacy-continue', surface: at('F01.11'), result: r('F01.12') },

  'F01.12.SURFACE.BIOMETRIC_SIGN_IN': { trigger: 'security-row-biometric', surface: at('F01.12'), result: o('security-biometric') },
  'F01.12.SURFACE.DEVICE_SECURITY': { trigger: 'security-row-device', surface: at('F01.12'), result: o('security-device') },
  'F01.12.SURFACE.CONNECTED_ACCOUNT_CONTRO': { trigger: 'security-row-connected', surface: at('F01.12'), result: o('security-connected') },
  'F01.12.SURFACE.SECURE_DATA_HANDLING': { trigger: 'security-row-data', surface: at('F01.12'), result: o('security-data') },
  'F01.12.SURFACE.SESSION_MANAGEMENT': { trigger: 'security-row-sessions', surface: at('F01.12'), result: o('security-sessions') },
  'F01.12.ROUTE.CONTINUE': { trigger: 'security-continue', surface: at('F01.12'), result: r('F01.13') },

  'F01.13.ROUTE.SETUP': { trigger: 'complete-continue', surface: at('F01.13'), result: { kind: 'boundary', family: 'F02' } },
};

export function listF01Bindings(): F01Binding[] {
  return F01_INTERACTION_MANIFEST.interactions.map((row) => {
    const b = F01_BINDINGS[row.interaction_id];
    if (!b) throw new Error(`unbound F01 interaction: ${row.interaction_id}`);
    return { interactionId: row.interaction_id, ...b };
  });
}

/** Overlays the runtime can open directly with `?overlay=` (design-workspace inspection + tests). */
export const F01_OVERLAYS = {
  'F01.01': ['terms', 'privacy-policy', 'social-apple', 'social-google'],
  'F01.02': ['mail', 'change-email'],
  'F01.03': ['locked', 'social-apple', 'social-google', 'support'],
  'F01.04': ['faceid-unlock', 'use-password', 'switch-account', 'sign-out'],
  'F01.06': ['mail'],
  'F01.09': ['faceid-enable', 'biometric-denied'],
  'F01.10': ['device-learn', 'mail'],
  'F01.11': ['privacy-details', 'privacy-your-data', 'privacy-connected-accounts', 'privacy-ai-access', 'privacy-data-export', 'privacy-remove-access', 'delete-account'],
  'F01.12': ['security-details', 'security-biometric', 'security-device', 'security-connected', 'security-data', 'security-sessions', 'revoke-session'],
} as const satisfies Record<string, readonly string[]>;

export const overlaysForF01Screen = (screenId: string): readonly string[] => (F01_OVERLAYS as Record<string, readonly string[]>)[screenId] ?? [];
