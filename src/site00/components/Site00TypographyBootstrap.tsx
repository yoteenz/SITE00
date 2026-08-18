import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Site00TypeTestOverlay } from './Site00TypeTestOverlay';
import { isSite00TypeTestEnabled, logSite00TypefaceStatusOnce } from '../utils/site00FontVerify';

const SITE00_PATH_PREFIXES = [
  '/origin',
  '/enter',
  '/idnty',
  '/bldr',
  '/assts',
  '/bluprint',
  '/build',
  '/control',
  '/live',
  '/sites',
  '/services',
  '/system',
  '/about',
  '/journal',
  '/support',
  '/projects',
];

function isSite00Path(pathname: string): boolean {
  if (pathname === '/' && import.meta.env.VITE_SITE00_ROOT === '1') return true;
  return SITE00_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Mounts SITE 00 typography verification + dev inspector.
 * Scoped to SITE 00 routes only (via Site00Routes).
 */
export function Site00TypographyBootstrap() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isSite00Path(pathname)) return;
    void logSite00TypefaceStatusOnce();
  }, [pathname]);

  if (!isSite00Path(pathname)) return null;

  return isSite00TypeTestEnabled() ? <Site00TypeTestOverlay /> : null;
}
