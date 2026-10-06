/**
 * JURNL runtime store — device + session state, overlay stack, toast, navigation.
 * Device state persists per device (remembered accounts, Face ID, device trust, privacy choices); session state
 * persists for the tab unless KEEP ME SIGNED IN.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { f03ScreenForRoute } from '../../data/f03/screens';
import { f04ScreenForRoute } from '../../data/f04/screens';
import { F01_FAMILY_BOUNDARY, F01_SCREENS, F01_STATE_OVERLAYS, f01ScreenForRoute } from '../../data/f01/screens';
import { f02ScreenForRoute, F02_SCREENS } from '../../data/f02/screens';
import { resolveFamilyRoute } from '../../data/foundation/familyRegistry';
import { setRepositoryUserId } from '../../data/repository/deviceRepository';
import {
  browserKV,
  createDesignPreviewAuthAdapter,
  createDesignPreviewNativeBridge,
  createUnconfiguredAuthAdapter,
  createWebUnavailableNativeBridge,
  readScenario,
  type JurnlAccount,
  type JurnlAuthAdapter,
  type JurnlNativeBridge,
  type JurnlScenario,
} from './adapters';

export type AiKey = 'personalizedInsights' | 'smartCategorization' | 'budgetRecommendations' | 'naturalLanguage' | 'marketTrends';

export type RememberedAccount = { email: string; firstName: string; lastName: string };

export type DeviceState = {
  remembered: RememberedAccount[];
  biometric: 'UNDECIDED' | 'ENABLED' | 'DECLINED' | 'UNAVAILABLE';
  biometricMethod: 'FACE_ID' | 'TOUCH_ID';
  deviceTrust: 'UNDECIDED' | 'TRUSTED' | 'NOT_NOW';
  ai: Record<AiKey, boolean>;
  exportRequested: boolean;
};

export type SessionState = {
  account: JurnlAccount | null;
  status: 'SIGNED_OUT' | 'ACTIVE';
  keepSignedIn: boolean;
  /** Email the latest verification / reset link was sent to. */
  pendingEmail: string | null;
};

export type Toast = { id: number; tone: 'success' | 'error'; title: string; body?: string; testId?: string };

export const DEFAULT_DEVICE: DeviceState = {
  remembered: [],
  biometric: 'UNDECIDED',
  biometricMethod: 'FACE_ID',
  deviceTrust: 'UNDECIDED',
  // AI access defaults OFF (opt-in) — see docs/jurnl/F01_IMPLEMENTATION_DECISIONS.md.
  ai: { personalizedInsights: false, smartCategorization: false, budgetRecommendations: false, naturalLanguage: false, marketTrends: false },
  exportRequested: false,
};
export const DEFAULT_SESSION: SessionState = { account: null, status: 'SIGNED_OUT', keepSignedIn: false, pendingEmail: null };

const DEVICE_KEY = 'jurnl.runtime.v1.device';
const SESSION_KEY = 'jurnl.runtime.v1.session';
const PREVIEW_ACCOUNTS_KEY = 'jurnl.runtime.v1.preview-accounts';

type Ctx = {
  basePath: string;
  mode: 'design-preview' | 'production';
  scenario: JurnlScenario;
  auth: JurnlAuthAdapter;
  bridge: JurnlNativeBridge;
  device: DeviceState;
  session: SessionState;
  setDevice: (patch: Partial<DeviceState>) => void;
  setSession: (patch: Partial<SessionState>) => void;
  signOut: () => void;
  overlay: string | null;
  openOverlay: (id: string) => void;
  closeOverlay: () => void;
  toast: Toast | null;
  showToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: () => void;
  go: (target: string, query?: Record<string, string>) => void;
  /** Forced state from `?state=` (design-workspace inspection). */
  forcedState: string | null;
  postToHost: (message: Record<string, unknown>) => void;
};

const JurnlCtx = createContext<Ctx | null>(null);

export function useJurnl(): Ctx {
  const c = useContext(JurnlCtx);
  if (!c) throw new Error('JURNL runtime store missing');
  return c;
}

function readJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

/** Resolve a screen id (`F01.03`, `F02.01`), a family handoff (`F02`, `F03`) or a raw route. */
export function resolveJurnlRoute(target: string): string {
  if (target === 'F02') return F01_FAMILY_BOUNDARY.route;
  if (/^F\d{2}$/.test(target)) return resolveFamilyRoute(target);
  if (target === 'parents') return 'parents';
  return F01_SCREENS.find((s) => s.id === target)?.route ?? F02_SCREENS.find((s) => s.id === target)?.route ?? target.replace(/^\/+/, '');
}

export function JurnlStoreProvider({ basePath, mode, children }: { basePath: string; mode: 'design-preview' | 'production'; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  // Inspection switches (?state / ?overlay / ?scenario / ?os) exist for the SITE 00 design workspace only. A production
  // shell never honours them — the user-facing app has no debug surface.
  const inspect = mode === 'design-preview';
  const q = (k: string) => (inspect ? params.get(k) : null);
  const scenarioKey = `${q('scenario') ?? ''}|${q('os') ?? ''}`;
  const scenario = useMemo(() => readScenario(inspect ? params : new URLSearchParams()), [scenarioKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const local = useMemo(() => browserKV('local'), []);
  const tab = useMemo(() => browserKV('session'), []);
  // `?reset=1` (design-preview "fresh device"): the runtime clears ONLY its own keys before reading them.
  useMemo(() => {
    if (mode !== 'design-preview' || params.get('reset') !== '1') return;
    for (const k of [DEVICE_KEY, SESSION_KEY, PREVIEW_ACCOUNTS_KEY]) {
      local.set(k, '');
      tab.set(k, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [device, setDeviceState] = useState<DeviceState>(() => readJson(local.get(DEVICE_KEY), DEFAULT_DEVICE));
  const [session, setSessionState] = useState<SessionState>(() => {
    const initial = readJson(tab.get(SESSION_KEY) ?? local.get(SESSION_KEY), DEFAULT_SESSION);
    setRepositoryUserId(initial.account?.email?.trim().toUpperCase() || 'preview-guest');
    return initial;
  });
  const relPath = location.pathname.slice(basePath.length).replace(/^\/+/, '');
  const stateOverlay = F01_STATE_OVERLAYS[`${f01ScreenForRoute(relPath)?.id ?? ''}:${q('state') ?? ''}`] ?? null;
  const [overlay, setOverlay] = useState<string | null>(() => q('overlay') ?? stateOverlay);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastSeq = useRef(0);

  const postToHost = useCallback((message: Record<string, unknown>) => {
    if (typeof window === 'undefined' || window.parent === window) return;
    window.parent.postMessage({ source: 'site00-project-runtime', projectId: 'jurnl', ...message }, window.location.origin);
  }, []);

  const auth = useMemo(
    () => (mode === 'design-preview' ? createDesignPreviewAuthAdapter({ kv: local, scenario }) : createUnconfiguredAuthAdapter()),
    [mode, local, scenario],
  );
  const bridge = useMemo(
    () =>
      mode === 'design-preview' ?
        createDesignPreviewNativeBridge({ scenario, notify: (target, boundary) => postToHost({ type: 'handoff', target, boundary }) })
      : createWebUnavailableNativeBridge(),
    [mode, scenario, postToHost],
  );

  const setDevice = useCallback(
    (patch: Partial<DeviceState>) =>
      setDeviceState((prev) => {
        const next = { ...prev, ...patch };
        local.set(DEVICE_KEY, JSON.stringify(next));
        return next;
      }),
    [local],
  );
  const setSession = useCallback(
    (patch: Partial<SessionState>) =>
      setSessionState((prev) => {
        const next = { ...prev, ...patch };
        tab.set(SESSION_KEY, JSON.stringify(next));
        local.set(SESSION_KEY, JSON.stringify(next.keepSignedIn ? next : DEFAULT_SESSION));
        return next;
      }),
    [local, tab],
  );
  const signOut = useCallback(() => {
    setSession({ ...DEFAULT_SESSION });
  }, [setSession]);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => setToast({ ...t, id: ++toastSeq.current }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast((cur) => (cur?.id === toast.id ? null : cur)), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const go = useCallback(
    (target: string, query?: Record<string, string>) => {
      setOverlay(null);
      const qs = new URLSearchParams(query ?? {});
      // Scenario switches are host-owned; keep them across in-app navigation.
      for (const k of ['scenario', 'os']) {
        const v = inspect ? params.get(k) : null;
        if (v && !qs.has(k)) qs.set(k, v);
      }
      const s = qs.toString();
      navigate(`${basePath}/${resolveJurnlRoute(target)}${s ? `?${s}` : ''}`);
    },
    [basePath, navigate, params, inspect],
  );

  // Route → host. F02 → F03 posts only on the step from setup/ready into today.
  const prevRel = useRef<string | null>(null);
  useEffect(() => {
    const rel = location.pathname.slice(basePath.length).replace(/^\/+/, '');
    const screen = f01ScreenForRoute(rel) ?? f02ScreenForRoute(rel) ?? f03ScreenForRoute(rel) ?? f04ScreenForRoute(rel);
    const parentId =
      rel === 'parents' ? 'F05_F16.BOARD'
      : rel === 'money' ? 'F05.00'
      : rel === 'income' ? 'F06.00'
      : rel === 'upcoming' ? 'F07.00'
      : rel === 'plan' ? 'F08.00'
      : rel === 'safe' ? 'F09.00'
      : rel === 'purchases' ? 'F10.00'
      : rel === 'trips' ? 'F11.00'
      : rel === 'credit' ? 'F12.00'
      : rel === 'paydown' ? 'F13.00'
      : rel === 'goals' ? 'F14.00'
      : rel === 'ahead' ? 'F15.00'
      : rel === 'records' ? 'F16.00'
      : null;
    postToHost({ type: 'route', screenId: screen?.id ?? parentId, path: rel });
    if (rel === F01_FAMILY_BOUNDARY.route) postToHost({ type: 'family-boundary', from: F01_FAMILY_BOUNDARY.from, to: F01_FAMILY_BOUNDARY.to });
    if (rel === 'today' && prevRel.current === 'setup/ready') postToHost({ type: 'family-boundary', from: 'F02', to: 'F03' });
    prevRel.current = rel;
  }, [location.pathname, basePath, postToHost]);

  // `?overlay=` deep links and overlay states (design-workspace inspection) re-open on param change.
  const overlayParam = q('overlay') ?? stateOverlay;
  useEffect(() => {
    if (overlayParam) setOverlay(overlayParam);
  }, [overlayParam, location.pathname]);

  useEffect(() => {
    const uid = session.account?.email?.trim().toUpperCase() || 'preview-guest';
    setRepositoryUserId(uid);
  }, [session.account?.email]);

  const value = useMemo<Ctx>(
    () => ({
      basePath,
      mode,
      scenario,
      auth,
      bridge,
      device,
      session,
      setDevice,
      setSession,
      signOut,
      overlay,
      openOverlay: setOverlay,
      closeOverlay: () => setOverlay(null),
      toast,
      showToast,
      dismissToast,
      go,
      forcedState: q('state'),
      postToHost,
    }),
    [basePath, mode, scenario, auth, bridge, device, session, setDevice, setSession, signOut, overlay, toast, showToast, dismissToast, go, params, postToHost],
  );
  return <JurnlCtx.Provider value={value}>{children}</JurnlCtx.Provider>;
}

export function rememberAccount(device: DeviceState, account: JurnlAccount): RememberedAccount[] {
  const rest = device.remembered.filter((r) => r.email !== account.email);
  return [{ email: account.email, firstName: account.firstName, lastName: account.lastName }, ...rest].slice(0, 4);
}

export const initialsOf = (a: { firstName: string; lastName: string }) => `${a.firstName[0] ?? ''}${a.lastName[0] ?? ''}`.toUpperCase() || 'J';
