import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { MobileTwinCompiledImplementationRenderer } from '../components/designWorkspace/MobileTwinCompiledImplementationRenderer.js';
import { DesignTwinImplementationReviewPanel } from '../components/designWorkspace/DesignTwinImplementationReviewPanel.js';
import { resolveTwinImplementationPreview } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveTwinImplementationPreview.js';
import {
  FORENSIC_API_NOT_DEPLOYED,
  FORENSIC_BLUEPRINT_GENERATION_FAILED,
  P0_VR_TWIN_V30R8M2R5F1_LINEAGE,
  P0_VR_TWIN_V30R8M2R5_LINEAGE,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import { P0_VR_TWIN_V30_BUILD } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { DesignTwinForensicBlueprintPanel } from '../components/designWorkspace/DesignTwinForensicBlueprintPanel.js';
import { DesignTwinActualLiveCompareOverlay } from '../components/designWorkspace/DesignTwinActualLiveCompareOverlay.js';
import '../styles/site00-twin-v3-design-authority.css';

export function DesignTwinImplementationPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<Awaited<ReturnType<typeof resolveTwinImplementationPreview>> | null>(null);
  const [reviewMode, setReviewMode] = useState<
    'LIVE' | 'ACTUAL' | 'FORENSIC_BLUEPRINT' | 'BLUEPRINT' | 'COMPARE_ACTUAL' | 'COMPARE_BLUEPRINT' | 'PACKAGE'
  >('LIVE');

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      const preview = await resolveTwinImplementationPreview(projectId);
      setLoaded(preview);
      setNotice(preview.notice);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'TWIN_IMPLEMENTATION_LOAD_FAILED');
      setLoaded(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const header = useMemo(
    () => (
      <header className="site00-dw-v3-twin-impl-header" data-testid="twin-implementation-header">
        <span>TWIN IMPLEMENTATION</span>
        <span>MOBILE REVIEW</span>
        <span data-testid="twin-implementation-status">IMPLEMENTATION_REVIEW</span>
        <Link to={SITE00_ROUTES.site00Design + `?project=${projectId}`}>← DESIGN WORKSPACE</Link>
      </header>
    ),
    [projectId],
  );

  if (loading) {
    return (
      <div
        className="site00-page site00-page--twin-implementation"
        data-lineage={P0_VR_TWIN_V30R8M2R5F1_LINEAGE}
        data-build={P0_VR_TWIN_V30_BUILD}
      >
        {header}
        <p>Loading twin implementation…</p>
      </div>
    );
  }

  if (!loaded) {
    const forensicFailed =
      err?.includes(FORENSIC_BLUEPRINT_GENERATION_FAILED) ||
      err?.includes(FORENSIC_API_NOT_DEPLOYED) ||
      err?.includes('FORENSIC_BLUEPRINT_NOT_PRIMED') ||
      err?.includes('FORENSIC_BLUEPRINT') ||
      err?.includes('FAL_KEY');
    return (
      <div
        className="site00-page site00-page--twin-implementation"
        data-lineage={P0_VR_TWIN_V30R8M2R5F1_LINEAGE}
        data-build={P0_VR_TWIN_V30_BUILD}
      >
        {header}
        {forensicFailed ?
          <div data-testid="forensic-blueprint-generation-failed" role="alert">
            <p>
              <strong>FORENSIC BLUEPRINT GENERATION FAILED</strong>
            </p>
            <p data-testid="forensic-blueprint-error-class">{err}</p>
            <button type="button" className="site00-btn" onClick={() => void reload()}>
              Retry forensic blueprint
            </button>
          </div>
        : null}
        <p data-testid="twin-implementation-gate">{err ?? 'TWIN_IMPLEMENTATION_NOT_BUILT'}</p>
        <p className="site00-dw-v3-authority__hint">
          On fsbw-dev preview, forensic Fal runs via this tab&apos;s origin (Vite local API). On site00.com, redeploy
          Railway after merge so api.site00.com serves twin-v3-forensic-ui-blueprint. Build {P0_VR_TWIN_V30_BUILD}.
        </p>
      </div>
    );
  }

  const serverBacked = loaded.source === 'API';

  return (
    <div
      className="site00-page site00-page--twin-implementation"
      data-lineage={P0_VR_TWIN_V30R8M2R5F1_LINEAGE}
      data-build={P0_VR_TWIN_V30_BUILD}
      data-parent-lineage={P0_VR_TWIN_V30R8M2R5_LINEAGE}
    >
      {header}
      {notice ?
        <p className="site00-dw-v3-authority__hint" data-testid="twin-implementation-notice" role="status">
          {notice}
        </p>
      : null}
      <DesignTwinImplementationReviewPanel
        projectId={projectId}
        buildId={loaded.buildId}
        reviewMode={reviewMode}
        onReviewModeChange={setReviewMode}
        implementationVersion={loaded.implementationVersion}
        founderStatus={loaded.founderStatus}
        promotionStatus={loaded.promotionStatus}
        serverBacked={serverBacked}
        implementationDocument={loaded.document}
        onUpdated={() => void reload()}
      />
      {reviewMode === 'FORENSIC_BLUEPRINT' ?
        <DesignTwinForensicBlueprintPanel document={loaded.document} />
      : reviewMode === 'COMPARE_ACTUAL' ?
        <DesignTwinActualLiveCompareOverlay
          document={loaded.document}
          actualAuthorityUri={loaded.document.authoritiesLoaded?.actualRenderUri}
        />
      : reviewMode === 'LIVE' || reviewMode === 'COMPARE_BLUEPRINT' ?
        <MobileTwinCompiledImplementationRenderer document={loaded.document} />
      : <p className="site00-dw-v3-authority__hint">Authority / package compare modes use Design workspace authorities.</p>}
    </div>
  );
}
