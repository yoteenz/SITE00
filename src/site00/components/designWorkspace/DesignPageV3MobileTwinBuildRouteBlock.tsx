import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  mobileTwinTwinPreviewRoute,
  P0_VR_TWIN_V30R8M_LINEAGE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import { compileAndCacheMobileTwinImplementation } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestMobileTwinImplementation.js';
import { SITE00_ROUTES } from '../../config/routes.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  /** When embedded in pipeline or package inspector (no outer section wrapper). */
  embedded?: boolean;
  /** Primary button test id (strip vs pipeline vs inspector). */
  buildTestId?: string;
};

export function DesignPageV3MobileTwinBuildRouteBlock({
  session,
  embedded,
  buildTestId = 'v3-build-twin-design-route-strip',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const pipeline = session.mobileTwinPipeline;
  const hasBuild = Boolean(pipeline?.mobileTwinImplementation?.latestBuildId);
  const twinRoute = SITE00_ROUTES.projectDesignTwin.replace(':projectSlug', session.projectId.toLowerCase());
  const previewPath = mobileTwinTwinPreviewRoute(session.projectId);

  const runBuild = () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    void compileAndCacheMobileTwinImplementation({ session })
      .then((res) => {
        if (!res.ok) {
          setErr(res.message);
          return;
        }
        setMsg(res.message);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const inner = (
    <>
      <header className="site00-dw-v3-mobile-twin-build-route__head">
        <strong>TWIN DESIGN ROUTE · POST-APPROVAL</strong>
        <span>{hasBuild ? 'PREVIEW CACHED · REBUILD OK' : 'NEXT ACTION · BUILD ONCE'}</span>
      </header>
      <p className="site00-dw-v3-authority__hint" data-testid="v3-build-twin-strip-copy">
        Package is approved. Tap once to compile structured artifacts into the twin preview (writes browser cache; hits
        Railway when API is live). Then open the twin route to review — no auto-promote to live Design.
      </p>
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-build-route__primary"
        data-testid={buildTestId}
        disabled={busy}
        onClick={runBuild}
      >
        {hasBuild ? 'REBUILD TWIN DESIGN ROUTE' : 'BUILD TWIN DESIGN ROUTE'}
      </button>
      <p className="site00-dw-v3-mobile-twin-build-route__links">
        <Link to={twinRoute} data-testid="v3-review-twin-implementation-link">
          OPEN TWIN IMPLEMENTATION REVIEW
        </Link>
        <span className="site00-dw-v3-authority__hint">{previewPath}</span>
      </p>
      {msg ?
        <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-build-twin-success-msg">
          {msg}
        </p>
      : null}
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
    </>
  );

  if (embedded) {
    return (
      <div
        className="site00-dw-v3-mobile-twin-build-route site00-dw-v3-mobile-twin-build-route--embedded"
        data-testid="v3-next-action-build-twin"
      >
        {inner}
      </div>
    );
  }

  return (
    <section
      className="site00-dw-v3-mobile-twin-build-route"
      data-testid="v3-mobile-twin-build-route-strip"
      data-lineage={P0_VR_TWIN_V30R8M_LINEAGE}
      aria-label="Build twin design route"
    >
      {inner}
    </section>
  );
}
