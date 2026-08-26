import { useLocation } from 'react-router-dom';
import { isPreviewEnvironment } from '../../../utils/adminAuth';
import { Site00AccountRouteGuard } from './Site00AccountRouteGuard';

/** Founder fast-track + experience prototype paths (outside Site00Layout). */
export function isAstralWorldPrototypePath(pathname: string): boolean {
  return (
    pathname.includes('/projects/astral-world/debug/world') ||
    pathname.includes('/projects/astral-world/experience') ||
    pathname.includes('/projects/astral-world/reader')
  );
}

/**
 * Preview hosts (fsbw-dev, cloud tunnel): open Astral World prototype without CTRL ROOM auth gate.
 * Production site00.com still requires sign-in.
 */
export function AstralWorldRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (isPreviewEnvironment() && isAstralWorldPrototypePath(location.pathname)) {
    return <>{children}</>;
  }
  return <Site00AccountRouteGuard>{children}</Site00AccountRouteGuard>;
}
