/**
 * JURNL runtime boundaries: auth + native bridge.
 *
 * - DESIGN_PREVIEW adapter: device-local, deterministic account store so the SITE 00 Design workspace can exercise
 *   every F01 state. It is selected ONLY when SITE 00 mounts the runtime in design-preview mode.
 * - UNCONFIGURED adapter: the production path until JURNL's own auth provider exists. It never fakes success.
 * - Social auth (Apple / Google) is NOT configured in either adapter: the JURNL side of the boundary is
 *   implemented and the provider step returns PROVIDER_NOT_CONFIGURED.
 * - The native bridge never imitates OS UI. It reports outcomes; JURNL renders only its own side of the handoff.
 */

export type AuthErrorCode =
  | 'EMAIL_IN_USE'
  | 'INCORRECT_PASSWORD'
  | 'ACCOUNT_NOT_FOUND'
  | 'LOCKED'
  | 'NETWORK'
  | 'OFFLINE'
  | 'INVALID_LINK'
  | 'NOT_CONFIGURED'
  | 'PROVIDER_NOT_CONFIGURED';

export type AuthResult<T = true> = { ok: true; value: T } | { ok: false; code: AuthErrorCode };

export type JurnlAccount = { firstName: string; lastName: string; email: string; emailVerified: boolean };
export type JurnlSession = { id: string; label: string; detail: string; current: boolean };
export type SocialProvider = 'APPLE' | 'GOOGLE';

export type JurnlAuthAdapter = {
  kind: 'DESIGN_PREVIEW' | 'UNCONFIGURED' | 'SUPABASE';
  signUp(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResult<JurnlAccount>>;
  signIn(email: string, password: string): Promise<AuthResult<JurnlAccount>>;
  resendVerification(email: string): Promise<AuthResult>;
  changeEmail(fromEmail: string, toEmail: string): Promise<AuthResult>;
  confirmEmailLink(email: string, link: string): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<AuthResult>;
  validateResetToken(token: string | null): Promise<AuthResult>;
  resetPassword(token: string | null, password: string): Promise<AuthResult>;
  social(provider: SocialProvider): Promise<AuthResult<JurnlAccount>>;
  deleteAccount(email: string): Promise<AuthResult>;
  listSessions(): Promise<JurnlSession[]>;
  revokeSession(id: string): Promise<AuthResult>;
};

export type BiometricOutcome = 'GRANTED' | 'DENIED' | 'FAILED' | 'UNAVAILABLE';
export type ExternalTarget = 'MAIL' | 'SUPPORT' | 'SETTINGS';

export type JurnlNativeBridge = {
  kind: 'DESIGN_PREVIEW' | 'WEB_UNAVAILABLE';
  requestBiometric(purpose: 'ENABLE' | 'UNLOCK'): Promise<BiometricOutcome>;
  openExternal(target: ExternalTarget): Promise<void>;
};

/** Scenario switches set by the host Design workspace (`?scenario=` / `?os=`). */
export type JurnlScenario = { network: 'ok' | 'network-error' | 'offline'; os: 'granted' | 'denied' | 'failed' | 'unavailable' };

export function readScenario(search: URLSearchParams): JurnlScenario {
  const s = search.get('scenario');
  const os = search.get('os');
  return {
    network: s === 'network-error' || s === 'offline' ? s : 'ok',
    os: os === 'denied' || os === 'failed' || os === 'unavailable' ? os : 'granted',
  };
}

const ACCOUNTS_KEY = 'jurnl.runtime.v1.preview-accounts';
type StoredAccount = JurnlAccount & { password: string; failed: number; locked: boolean };

/** Design-preview seed accounts (shown in the host workspace, never in the JURNL body). */
export const JURNL_PREVIEW_SEED: Record<string, StoredAccount> = {
  'EMMA@EXAMPLE.COM': { firstName: 'EMMA', lastName: 'S.', email: 'EMMA@EXAMPLE.COM', emailVerified: true, password: 'Jurnl-2026', failed: 0, locked: false },
  'LOCKED@EXAMPLE.COM': { firstName: 'ALEX', lastName: 'TAYLOR', email: 'LOCKED@EXAMPLE.COM', emailVerified: true, password: 'Jurnl-2026', failed: 5, locked: true },
};

type KV = { get(k: string): string | null; set(k: string, v: string): void };

const memory = new Map<string, string>();
export const memoryKV: KV = { get: (k) => memory.get(k) ?? null, set: (k, v) => void memory.set(k, v) };

export function browserKV(kind: 'local' | 'session'): KV {
  return {
    get: (k) => {
      try {
        return (kind === 'local' ? window.localStorage : window.sessionStorage).getItem(k);
      } catch {
        return memoryKV.get(k);
      }
    },
    set: (k, v) => {
      try {
        (kind === 'local' ? window.localStorage : window.sessionStorage).setItem(k, v);
      } catch {
        memoryKV.set(k, v);
      }
    },
  };
}

const norm = (email: string) => email.trim().toUpperCase();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createDesignPreviewAuthAdapter(opts: { kv: KV; scenario: JurnlScenario; latencyMs?: number }): JurnlAuthAdapter {
  const latency = opts.latencyMs ?? 900;
  const load = (): Record<string, StoredAccount> => {
    try {
      const raw = opts.kv.get(ACCOUNTS_KEY);
      return raw ? { ...JURNL_PREVIEW_SEED, ...(JSON.parse(raw) as Record<string, StoredAccount>) } : { ...JURNL_PREVIEW_SEED };
    } catch {
      return { ...JURNL_PREVIEW_SEED };
    }
  };
  const save = (all: Record<string, StoredAccount>) => opts.kv.set(ACCOUNTS_KEY, JSON.stringify(all));
  const net = async <T>(fn: () => AuthResult<T>): Promise<AuthResult<T>> => {
    await wait(latency);
    if (opts.scenario.network === 'offline') return { ok: false, code: 'OFFLINE' };
    if (opts.scenario.network === 'network-error') return { ok: false, code: 'NETWORK' };
    return fn();
  };
  const publicAccount = (a: StoredAccount): JurnlAccount => ({ firstName: a.firstName, lastName: a.lastName, email: a.email, emailVerified: a.emailVerified });

  return {
    kind: 'DESIGN_PREVIEW',
    signUp: (input) =>
      net(() => {
        const all = load();
        const email = norm(input.email);
        if (all[email]) return { ok: false, code: 'EMAIL_IN_USE' };
        all[email] = { firstName: input.firstName.trim().toUpperCase(), lastName: input.lastName.trim().toUpperCase(), email, emailVerified: false, password: input.password, failed: 0, locked: false };
        save(all);
        return { ok: true, value: publicAccount(all[email]!) };
      }),
    signIn: (emailIn, password) =>
      net(() => {
        const all = load();
        const a = all[norm(emailIn)];
        if (!a) return { ok: false, code: 'ACCOUNT_NOT_FOUND' };
        if (a.locked) return { ok: false, code: 'LOCKED' };
        if (a.password !== password) {
          a.failed += 1;
          if (a.failed >= 5) a.locked = true;
          save(all);
          return { ok: false, code: a.locked ? 'LOCKED' : 'INCORRECT_PASSWORD' };
        }
        a.failed = 0;
        save(all);
        return { ok: true, value: publicAccount(a) };
      }),
    resendVerification: () => net(() => ({ ok: true, value: true })),
    changeEmail: (from, to) =>
      net(() => {
        const all = load();
        const a = all[norm(from)];
        if (all[norm(to)]) return { ok: false, code: 'EMAIL_IN_USE' };
        if (a) {
          delete all[norm(from)];
          all[norm(to)] = { ...a, email: norm(to), emailVerified: false };
          save(all);
        }
        return { ok: true, value: true };
      }),
    confirmEmailLink: (email, link) =>
      net(() => {
        if (link !== 'valid') return { ok: false, code: 'INVALID_LINK' };
        const all = load();
        const a = all[norm(email)];
        if (a) {
          a.emailVerified = true;
          save(all);
        }
        return { ok: true, value: true };
      }),
    requestPasswordReset: () => net(() => ({ ok: true, value: true })),
    validateResetToken: async (token) => {
      await wait(Math.min(latency, 300));
      return token && token !== 'expired' ? { ok: true, value: true } : { ok: false, code: 'INVALID_LINK' };
    },
    resetPassword: (token, password) =>
      net(() => {
        if (!token || token === 'expired') return { ok: false, code: 'INVALID_LINK' };
        const all = load();
        const email = token.startsWith('preview:') ? norm(token.slice(8)) : null;
        if (email && all[email]) {
          all[email]!.password = password;
          all[email]!.locked = false;
          all[email]!.failed = 0;
          save(all);
        }
        return { ok: true, value: true };
      }),
    social: async () => {
      await wait(Math.min(latency, 600));
      return { ok: false, code: 'PROVIDER_NOT_CONFIGURED' };
    },
    deleteAccount: (email) =>
      net(() => {
        const all = load();
        delete all[norm(email)];
        save(all);
        return { ok: true, value: true };
      }),
    listSessions: async () => [
      { id: 'this-device', label: 'THIS DEVICE', detail: 'NOW', current: true },
      { id: 'preview-laptop', label: 'LAPTOP', detail: '2 HOURS AGO', current: false },
    ],
    revokeSession: (id) => net(() => (id === 'this-device' ? { ok: false, code: 'NOT_CONFIGURED' } : { ok: true, value: true })),
  };
}

/** Production path until JURNL has its own provider: honest failure, never success. */
export function createUnconfiguredAuthAdapter(): JurnlAuthAdapter {
  const no = async () => ({ ok: false, code: 'NOT_CONFIGURED' }) as const;
  return {
    kind: 'UNCONFIGURED',
    signUp: no,
    signIn: no,
    resendVerification: no,
    changeEmail: no,
    confirmEmailLink: no,
    requestPasswordReset: no,
    validateResetToken: no,
    resetPassword: no,
    social: async () => ({ ok: false, code: 'PROVIDER_NOT_CONFIGURED' }) as const,
    deleteAccount: no,
    listSessions: async () => [],
    revokeSession: no,
  };
}

export function createDesignPreviewNativeBridge(opts: { scenario: JurnlScenario; notify: (target: string, boundary: 'EXTERNAL_APP' | 'NATIVE_OS') => void; latencyMs?: number }): JurnlNativeBridge {
  const latency = opts.latencyMs ?? 1200;
  return {
    kind: 'DESIGN_PREVIEW',
    requestBiometric: async (purpose) => {
      opts.notify(purpose === 'ENABLE' ? 'FACE_ID_PERMISSION' : 'FACE_ID_UNLOCK', 'NATIVE_OS');
      await wait(latency);
      return ({ granted: 'GRANTED', denied: 'DENIED', failed: 'FAILED', unavailable: 'UNAVAILABLE' } as const)[opts.scenario.os];
    },
    openExternal: async (target) => {
      opts.notify(target, 'EXTERNAL_APP');
    },
  };
}

/** A plain web build has no biometric API wired; JURNL says so instead of pretending. */
export function createWebUnavailableNativeBridge(): JurnlNativeBridge {
  return {
    kind: 'WEB_UNAVAILABLE',
    requestBiometric: async () => 'UNAVAILABLE',
    openExternal: async () => undefined,
  };
}
