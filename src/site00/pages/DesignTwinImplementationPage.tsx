import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { MobileTwinCompiledImplementationRenderer } from '../components/designWorkspace/MobileTwinCompiledImplementationRenderer.js';
import { DesignTwinImplementationReviewPanel } from '../components/designWorkspace/DesignTwinImplementationReviewPanel.js';
import type { CompiledMobileTwinImplementationDocument } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { fetchMobileTwinImplementationState } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestMobileTwinImplementation.js';
import { P0_VR_TWIN_V30R8M_LINEAGE } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import '../styles/site00-twin-v3-design-authority.css';

type LoadedBuild = {
  buildId: string;
  implementationVersion: string;
  document: CompiledMobileTwinImplementationDocument;
  previewRoute: string;
  founderStatus: string;
  promotionStatus: string;
};

export function DesignTwinImplementationPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<LoadedBuild | null>(null);
  const [reviewMode, setReviewMode] = useState<'LIVE' | 'ACTUAL' | 'BLUEPRINT' | 'COMPARE_ACTUAL' | 'COMPARE_BLUEPRINT' | 'PACKAGE'>('LIVE');

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const state = (await fetchMobileTwinImplementationState(projectId)) as {
        latestBuildId?: string | null;
        status?: string;
        implementationPayload?: {
          latestBuild?: {
            id: string;
            implementationVersion: string;
            previewRoute: string;
            founderStatus: string;
            promotionStatus: string;
            compiledDocument?: CompiledMobileTwinImplementationDocument;
          };
        };
      } | null;
      if (!state?.latestBuildId) {
        setLoaded(null);
        setErr(state?.status === 'READY_TO_COMPILE' ? 'TWIN_IMPLEMENTATION_NOT_BUILT' : 'NO_APPROVED_MOBILE_TWIN_PACKAGE');
        return;
      }
      const build = state.implementationPayload?.latestBuild;
      const document = build?.compiledDocument;
      if (!build || !document) {
        setErr('TWIN_IMPLEMENTATION_NOT_BUILT');
        setLoaded(null);
        return;
      }
      setLoaded({
        buildId: build.id,
        implementationVersion: build.implementationVersion,
        document,
        previewRoute: build.previewRoute,
        founderStatus: build.founderStatus,
        promotionStatus: build.promotionStatus,
      });
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
      <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M_LINEAGE}>
        {header}
        <p>Loading twin implementation…</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M_LINEAGE}>
        {header}
        <p data-testid="twin-implementation-gate">{err ?? 'TWIN_IMPLEMENTATION_NOT_BUILT'}</p>
      </div>
    );
  }

  return (
    <div className="site00-page site00-page--twin-implementation" data-lineage={P0_VR_TWIN_V30R8M_LINEAGE}>
      {header}
      <DesignTwinImplementationReviewPanel
        projectId={projectId}
        buildId={loaded.buildId}
        reviewMode={reviewMode}
        onReviewModeChange={setReviewMode}
        implementationVersion={loaded.implementationVersion}
        founderStatus={loaded.founderStatus}
        promotionStatus={loaded.promotionStatus}
        onUpdated={() => void reload()}
      />
      {reviewMode === 'LIVE' || reviewMode.startsWith('COMPARE') ?
        <MobileTwinCompiledImplementationRenderer document={loaded.document} />
      : <p className="site00-dw-v3-authority__hint">Authority / package compare modes use Design workspace authorities.</p>}
    </div>
  );
}
