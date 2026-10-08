/**
 * JURNL F01 ENTRY — screen tree + state authorities (data only).
 * Source: package MANIFEST/F01_SCREEN_TREE.json + STATES/* (OPUS ULTRALITE 2026-10-04).
 */

export const F01_SCREEN_IDS = [
  'F01.00',
  'F01.01',
  'F01.02',
  'F01.03',
  'F01.04',
  'F01.05',
  'F01.06',
  'F01.07',
  'F01.08',
  'F01.09',
  'F01.10',
  'F01.11',
  'F01.12',
  'F01.13',
] as const;
export type F01ScreenId = (typeof F01_SCREEN_IDS)[number];

export type F01ScreenDef = {
  id: F01ScreenId;
  name: string;
  /** Runtime route under `/production/jurnl/runtime/`. */
  route: string;
  /** Reference authority (served for inspection only — never mounted as UI). */
  authority: string;
  primaryCta: string;
};

const A = (file: string) => `children/${file}`;
/** ENTRY v2 authorities sit outside the F01 package (repo folder `ENTRY v2/`, path from the repo root). */
const ENTRY_V2_AUTHORITY = (dir: string, name: string) => `ENTRY v2/${dir}/authority/entry-v2-${name}-authority.png`;

export const F01_SCREENS: readonly F01ScreenDef[] = [
  { id: 'F01.00', name: 'WELCOME', route: 'entry', authority: 'F01.00_WELCOME_APPROVED.jpg', primaryCta: 'GET STARTED' },
  { id: 'F01.01', name: 'CREATE ACCOUNT', route: 'entry/create', authority: A('F01.01_CREATE_ACCOUNT.jpg'), primaryCta: 'CREATE ACCOUNT' },
  { id: 'F01.02', name: 'EMAIL VERIFICATION', route: 'entry/verify-email', authority: A('F01.02_EMAIL_VERIFICATION.jpg'), primaryCta: 'OPEN EMAIL APP' },
  { id: 'F01.03', name: 'SIGN IN', route: 'entry/sign-in', authority: A('F01.03_SIGN_IN.jpg'), primaryCta: 'SIGN IN' },
  { id: 'F01.04', name: 'RETURNING USER UNLOCK', route: 'entry/unlock', authority: A('F01.04_RETURNING_USER_UNLOCK.jpg'), primaryCta: 'UNLOCK WITH FACE ID' },
  { id: 'F01.05', name: 'FORGOT PASSWORD', route: 'entry/forgot-password', authority: A('F01.05_FORGOT_PASSWORD.jpg'), primaryCta: 'SEND RESET LINK' },
  { id: 'F01.06', name: 'RESET EMAIL SENT', route: 'entry/reset-sent', authority: A('F01.06_RESET_EMAIL_SENT.jpg'), primaryCta: 'OPEN EMAIL APP' },
  { id: 'F01.07', name: 'CREATE NEW PASSWORD', route: 'entry/new-password', authority: A('F01.07_CREATE_NEW_PASSWORD.jpg'), primaryCta: 'RESET PASSWORD' },
  { id: 'F01.08', name: 'PASSWORD RESET SUCCESS', route: 'entry/reset-success', authority: A('F01.08_PASSWORD_RESET_SUCCESS.jpg'), primaryCta: 'SIGN IN' },
  { id: 'F01.09', name: 'BIOMETRIC SETUP', route: 'entry/biometric', authority: A('F01.09_BIOMETRIC_SETUP.jpg'), primaryCta: 'ENABLE FACE ID' },
  { id: 'F01.10', name: 'DEVICE TRUST', route: 'entry/device-trust', authority: A('F01.10_DEVICE_TRUST.jpg'), primaryCta: 'TRUST THIS DEVICE' },
  { id: 'F01.11', name: 'PRIVACY PRIMER', route: 'entry/privacy', authority: A('F01.11_PRIVACY_PRIMER.jpg'), primaryCta: 'CONTINUE' },
  { id: 'F01.12', name: 'SECURITY PRIMER', route: 'entry/security', authority: A('F01.12_SECURITY_PRIMER.jpg'), primaryCta: 'CONTINUE' },
  { id: 'F01.13', name: 'ENTRY COMPLETE', route: 'entry/complete', authority: A('F01.13_ENTRY_COMPLETE.jpg'), primaryCta: 'CONTINUE TO SETUP' },
];

/**
 * ENTRY v2 parents 02–04 (P0.JURNL.ENTRY-V2.FIRST-7.AUTHORITY-PLUS-PLATE-LIVE-WIRING1): new routes between WELCOME and
 * CREATE ACCOUNT. They are not part of the 14-screen F01 package contract (JURNL/F01_ENTRY), so they are listed here.
 */
export type F01EntryV2ScreenId = 'F01.14' | 'F01.15' | 'F01.16';
export const F01_ENTRY_V2_SCREENS: readonly { id: F01EntryV2ScreenId; name: string; route: string; authority: string; primaryCta: string }[] = [
  { id: 'F01.14', name: 'VALUE PROPOSITION', route: 'entry/value', authority: ENTRY_V2_AUTHORITY('02_VALUE_PROPOSITION', 'value-proposition'), primaryCta: 'CONTINUE' },
  { id: 'F01.15', name: 'KEY BENEFITS', route: 'entry/benefits', authority: ENTRY_V2_AUTHORITY('03_KEY_BENEFITS', 'key-benefits'), primaryCta: 'CONTINUE' },
  { id: 'F01.16', name: 'GET STARTED', route: 'entry/begin', authority: ENTRY_V2_AUTHORITY('04_GET_STARTED', 'get-started'), primaryCta: 'GET STARTED' },
];

/**
 * ENTRY v2 parents live on these F01 routes (authority = layout, plate = environment). F01.14–F01.16 are new; the rest
 * keep their ids, routes and behaviour and are redrawn on the ENTRY v2 authorities.
 */
export const F01_ENTRY_V2 = {
  'F01.00': '01_WELCOME',
  'F01.14': '02_VALUE_PROPOSITION',
  'F01.15': '03_KEY_BENEFITS',
  'F01.16': '04_GET_STARTED',
  'F01.01': '05_CREATE_ACCOUNT',
  'F01.02': '06_EMAIL_VERIFICATION',
  'F01.03': '07_SIGN_IN',
} as const;

/** F01 → F02 boundary (F02 is not implemented; this is the family hand-off surface). */
export const F01_FAMILY_BOUNDARY = { from: 'F01', to: 'F02', route: 'setup', authority: 'interactions/F01_FAMILY_TRANSITION_AUTHORITY.jpg' } as const;

export const f01Screen = (id: string) => F01_SCREENS.find((s) => s.id === id) ?? null;
export const f01ScreenForRoute = (route: string) => F01_SCREENS.find((s) => s.route === route.replace(/^\/+|\/+$/g, '')) ?? null;

export type F01StateDef = {
  /** `?state=` selector value. */
  key: string;
  id: string;
  screenId: F01ScreenId;
  label: string;
  sheet: 'STATES.F01.01' | 'STATES.F01.03' | 'STATES.EMAIL_RECOVERY' | 'STATES.SECURITY_NETWORK';
};

const S = (screenId: F01ScreenId, sheet: F01StateDef['sheet'], keys: string[]): F01StateDef[] =>
  keys.map((key) => ({ key, id: `${screenId}.${key.toUpperCase()}`, screenId, label: key.replace(/_/g, ' ').toUpperCase(), sheet }));

/** 27 state authorities from the four state sheets, mapped to the screen that owns each state. */
export const F01_STATES: readonly F01StateDef[] = [
  ...S('F01.01', 'STATES.F01.01', ['default', 'focused', 'validation_error', 'email_in_use', 'password_satisfied', 'loading']),
  ...S('F01.03', 'STATES.F01.03', ['default', 'incorrect_password', 'account_not_found', 'locked', 'loading']),
  ...S('F01.02', 'STATES.EMAIL_RECOVERY', ['verification_pending', 'resent', 'expired_link', 'verification_success']),
  ...S('F01.06', 'STATES.EMAIL_RECOVERY', ['reset_email_sent']),
  ...S('F01.07', 'STATES.EMAIL_RECOVERY', ['invalid_reset_link']),
  ...S('F01.08', 'STATES.EMAIL_RECOVERY', ['reset_success']),
  ...S('F01.09', 'STATES.SECURITY_NETWORK', ['biometric_prompt', 'biometric_enabled', 'biometric_declined', 'biometric_unavailable']),
  ...S('F01.10', 'STATES.SECURITY_NETWORK', ['device_trusted', 'device_verify_required']),
  ...S('F01.03', 'STATES.SECURITY_NETWORK', ['offline']),
  ...S('F01.04', 'STATES.SECURITY_NETWORK', ['session_expired', 'reauthentication']),
];

export const F01_STATE_SHEETS: Record<F01StateDef['sheet'], string> = {
  'STATES.F01.01': 'states/STATES.F01.01.jpg',
  'STATES.F01.03': 'states/STATES.F01.03.jpg',
  'STATES.EMAIL_RECOVERY': 'states/STATES.EMAIL_RECOVERY.jpg',
  'STATES.SECURITY_NETWORK': 'states/STATES.SECURITY_NETWORK.jpg',
};

export const statesForF01Screen = (screenId: string) => F01_STATES.filter((s) => s.screenId === screenId);

/** State authorities that ARE an overlay (the runtime opens it when the state is selected). */
export const F01_STATE_OVERLAYS: Record<string, string> = {
  'F01.03:locked': 'locked',
  'F01.09:biometric_prompt': 'faceid-enable',
  'F01.09:biometric_declined': 'biometric-denied',
};
