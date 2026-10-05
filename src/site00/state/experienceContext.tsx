import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import type { Site00ExperienceContext } from '../../../shared/site00-access/types';
import {
  inferExperienceContextFromPath,
  site00AdminDashboardRoute,
  site00ProjectDetailRoute,
} from '../../../shared/site00-access/routes';
import { canAccessAdminPages } from '../../utils/adminAuth';

export const SITE00_EXPERIENCE_CONTEXT_KEY = 'site00_experience_context';
export const SITE00_CLIENT_QA_MODE_KEY = 'site00_client_qa_mode';

type ExperienceContextValue = {
  activeContext: Site00ExperienceContext;
  setActiveContext: (ctx: Site00ExperienceContext) => void;
  clientQaMode: boolean;
  setClientQaMode: (enabled: boolean) => void;
  showPrivilegedUtilities: boolean;
  isDualContextUser: boolean;
  adminDashboardHref: string;
  clientExperienceHref: string;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

function readSession(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function ExperienceContextProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isDualContextUser = canAccessAdminPages();
  const urlContext = inferExperienceContextFromPath(pathname);

  const [clientQaMode, setClientQaModeState] = useState(() => readSession(SITE00_CLIENT_QA_MODE_KEY) === 'true');

  // Explicit URL wins over stale preference
  const activeContext: Site00ExperienceContext = urlContext;

  useEffect(() => {
    writeSession(SITE00_EXPERIENCE_CONTEXT_KEY, activeContext);
  }, [activeContext]);

  const setActiveContext = useCallback((ctx: Site00ExperienceContext) => {
    writeSession(SITE00_EXPERIENCE_CONTEXT_KEY, ctx);
  }, []);

  const setClientQaMode = useCallback((enabled: boolean) => {
    writeSession(SITE00_CLIENT_QA_MODE_KEY, enabled ? 'true' : 'false');
    setClientQaModeState(enabled);
  }, []);

  const showPrivilegedUtilities = isDualContextUser && !clientQaMode && activeContext === 'CLIENT';

  const clientExperienceHref = useMemo(() => {
    if (pathname.startsWith('/projects/')) {
      const slug = pathname.split('/')[2];
      if (slug) return site00ProjectDetailRoute(slug);
    }
    return '/projects';
  }, [pathname]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      activeContext,
      setActiveContext,
      clientQaMode,
      setClientQaMode,
      showPrivilegedUtilities,
      isDualContextUser,
      adminDashboardHref: site00AdminDashboardRoute(),
      clientExperienceHref,
    }),
    [activeContext, setActiveContext, clientQaMode, setClientQaMode, showPrivilegedUtilities, isDualContextUser, clientExperienceHref],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperienceContext(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    return {
      activeContext: 'CLIENT',
      setActiveContext: () => {},
      clientQaMode: false,
      setClientQaMode: () => {},
      showPrivilegedUtilities: false,
      isDualContextUser: false,
      adminDashboardHref: site00AdminDashboardRoute(),
      clientExperienceHref: '/projects',
    };
  }
  return ctx;
}
