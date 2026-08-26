/**
 * P0.VR.1D.12 — Suspense fallback for reconstructed NDX routes.
 * Renders current reference shell chrome immediately — never legacy project-lore-calibration layout.
 */

import {
  CURRENT_VISUAL_SHELL_VERSION,
  extractProjectSlugFromPath,
  isNdxReconstructedRoute,
  resolveReconstructedScreenIdFromPath,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr1d12/client.js';
import { MobileFounderWorkspaceChrome } from '../founderWorkspace/MobileFounderWorkspaceChrome';
import { ReferenceShellLoadingState } from '../founderWorkspace/ReferenceShellLoadingState';
import { renderMobileFounderWorkspaceScreen } from '../founderWorkspace/MobileFounderWorkspaceScreens';
import { resolveMobileVisualShellSpec } from '../../config/ndxMobileVisualShellSpecs';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { useSite00 } from '../../state/Site00Context';
import '../../styles/site00-founder-workspace.css';

function resolvePathname(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname || '';
}

/** Astral World routes render outside Site00Provider — never call useSite00 on these paths. */
function isAstralWorldPrototypeRoute(pathname: string): boolean {
  return (
    pathname.includes('/projects/astral-world/experience') ||
    pathname.includes('/projects/astral-world/debug/world')
  );
}

export function ReferenceShellSuspenseFallback() {
  const pathname = resolvePathname();

  if (isAstralWorldPrototypeRoute(pathname)) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '100vh',
          background: '#06080f',
          color: '#c9a962',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
        }}
      >
        Entering Astral World…
      </div>
    );
  }

  if (!isNdxReconstructedRoute(pathname)) {
    return null;
  }

  return <ReferenceShellSuspenseFallbackNdx pathname={pathname} />;
}

function ReferenceShellSuspenseFallbackNdx({ pathname }: { pathname: string }) {
  const { isPreviewDesktop } = useSite00();
  const isWideViewport = useSite00OriginWideViewport();

  const projectSlug = extractProjectSlugFromPath(pathname) ?? 'ndxbook';
  const screenId = resolveReconstructedScreenIdFromPath(pathname, projectSlug);
  if (!screenId) {
    return null;
  }

  const visualSpec = resolveMobileVisualShellSpec(screenId);
  const mobilePresentation = !isPreviewDesktop || !isWideViewport;

  return (
    <div
      className="site00-fws site00-fws--mobile-presentation site00-fws--reference-shell-suspense"
      data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}
      data-reference-shell-suspense={screenId}
    >
      <main className={`site00-fws-canvas site00-fws-canvas--${screenId}`}>
        <section className="site00-fws-layer site00-fws-layer--operate" aria-label="Operate">
          <MobileFounderWorkspaceChrome projectSlug={projectSlug} visualSpec={visualSpec}>
            {mobilePresentation ? (
              renderMobileFounderWorkspaceScreen(screenId, projectSlug)
            ) : (
              <ReferenceShellLoadingState screenId={screenId} />
            )}
          </MobileFounderWorkspaceChrome>
        </section>
      </main>
    </div>
  );
}
