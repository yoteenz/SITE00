import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { MobileTwinCompiledImplementationRenderer } from '../components/designWorkspace/MobileTwinCompiledImplementationRenderer.js';
import { DesignTwinImplementationReviewPanel } from '../components/designWorkspace/DesignTwinImplementationReviewPanel.js';
import { resolveTwinImplementationPreview } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveTwinImplementationPreview.js';
import { P0_VR_TWIN_V30R8M1_LINEAGE } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/constants.js';
import '../styles/site00-twin-v3-design-authority.css';

export function DesignTwinImplementationPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<Awaited<ReturnType<typeof resolveTwinImplementationPreview>> | null>(null);
  const [reviewMode, setReviewMode] = useState<'LIVE' | 'ACTUAL' | 'BLUEPRINT' | 'COMPARE_ACTUAL' | 'COMPARE_BLUEPRINT' | 'PACKAGE'>('LIVE');

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
      <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M1_LINEAGE}>
        {header}
        <p>Loading twin implementation…</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M1_LINEAGE}>
        {header}
        <p data-testid="twin-implementation-gate">{err ?? 'TWIN_IMPLEMENTATION_NOT_BUILT'}</p>
        <p className="site00-dw-v3-authority__hint">
          If you already approved the package: open Design → BUILD TWIN DESIGN ROUTE, then reopen this page. Railway must
          serve v446+ API for durable cross-device state.
        </p>
      </div>
    );
  }

  const serverBacked = loaded.source === 'API';

  return (
    <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M1_LINEAGE}>
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
        onUpdated={() => void reload()}
      />
      {reviewMode === 'LIVE' || reviewMode.startsWith('COMPARE') ?
        <MobileTwinCompiledImplementationRenderer document={loaded.document} />
      : <p className="site00-dw-v3-authority__hint">Authority / package compare modes use Design workspace authorities.</p>}
    </div>
  );
}
