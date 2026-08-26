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

export function ReferenceShellSuspenseFallback() {
  const pathname = resolvePathname();
  const { isPreviewDesktop } = useSite00();
  const isWideViewport = useSite00OriginWideViewport();

  if (!isNdxReconstructedRoute(pathname)) {
    return null;
  }

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
