/**
 * P0.VR.TWINV3.0R2 — SITE 00 design page authority lock (A–G zones).
 */

import { useCallback, useState } from 'react';
import {
  approveDesignPageAuthorityViewport,
  appendDesignPageAuthorityRefineNote,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_HOST_PRODUCT_NAME,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  isDesignPageAuthorityFullyLocked,
  isDesignPageAuthorityViewportLocked,
  P0_VR_TWIN_V30R2_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  readDesignPageAuthoritySession,
  requestDesignPageAuthorityGeneration,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

export function DesignPageV3AuthorityReviewPanel({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [session, setSession] = useState<DesignPageAuthorityReviewSession>(() => {
    if (!pilot) return createDesignPageAuthorityReviewSession({ projectId });
    return readDesignPageAuthoritySession(projectId) ?? createDesignPageAuthorityReviewSession({ projectId });
  });
  const [refineDraft, setRefineDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((next: DesignPageAuthorityReviewSession) => {
    setSession(next);
    writeDesignPageAuthoritySession(next);
  }, []);

  const run = useCallback(
    async (action: 'GENERATE' | 'REFINE' | 'REGENERATE') => {
      setRunning(true);
      setError(null);
      try {
        let working = session;
        if (action === 'REFINE' && refineDraft.trim()) {
          working = appendDesignPageAuthorityRefineNote(working, refineDraft);
          setRefineDraft('');
          persist(working);
        }
        const res = await requestDesignPageAuthorityGeneration({
          session: working,
          action: action === 'GENERATE' ? 'GENERATE' : action,
          founderConfirmedSpend: true,
        });
        persist(res.session);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed');
      } finally {
        setRunning(false);
      }
    },
    [persist, refineDraft, session],
  );

  const approveViewport = useCallback(
    (viewport: 'mobile' | 'desktop') => {
      if (!session.lastResult) return;
      persist(approveDesignPageAuthorityViewport(session, viewport));
    },
    [persist, session],
  );

  if (!pilot) return null;

  const fullyLocked = isDesignPageAuthorityFullyLocked(session);
  const mobileLocked = isDesignPageAuthorityViewportLocked(session, 'mobile');
  const desktopLocked = isDesignPageAuthorityViewportLocked(session, 'desktop');
  const result = session.lastResult;

  return (
    <section
      className="site00-dw-v3-authority"
      aria-label="Twin V3 SITE 00 design page authority review"
      data-build-ref={P0_VR_TWIN_V30_BUILD}
    >
      <header className="site00-dw-v3-authority__head">
        <strong>{P0_VR_TWIN_V30R2_LINEAGE} · {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} DESIGN PAGE</strong>
        <span>Project {projectId.toUpperCase()} open · authority lock · no implementation</span>
        {mobileLocked ? <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE}</span> : null}
        {desktopLocked ? <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP}</span> : null}
      </header>
      <p className="site00-dw-v3-authority__hint">
        Canonical: {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} → PROJECT: NDXBOOK → PAGE: DESIGN. {DESIGN_PAGE_V3_HOST_PRODUCT_NAME} owns the
        workspace; NDXBOOK is the active client project. Pass test: “This is SITE 00’s design workspace, and I am working on NDXBOOK
        inside it.” Fail: “This looks like an NDXBOOK app.”
      </p>
      <div className="site00-dw-v3-authority__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={running || fullyLocked}
          onClick={() => void run(result ? 'REGENERATE' : 'GENERATE')}
        >
          {running ? 'Generating…' : result ? 'REGENERATE AUTHORITY PAIR' : 'GENERATE AUTHORITY PAIR'}
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!result || mobileLocked}
          onClick={() => approveViewport('mobile')}
        >
          APPROVE MOBILE ({DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE})
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--outline"
          disabled={!result || desktopLocked}
          onClick={() => approveViewport('desktop')}
        >
          APPROVE DESKTOP ({DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP})
        </button>
      </div>
      <div className="site00-dw-v3-authority__refine">
        <label htmlFor="v3-authority-refine">Refine notes (host/client firewall preserved)</label>
        <textarea
          id="v3-authority-refine"
          value={refineDraft}
          disabled={fullyLocked}
          onChange={(e) => setRefineDraft(e.target.value)}
          placeholder="e.g. strengthen SITE 00 header; NDXBOOK only in project band; enlarge primary work area"
        />
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled={running || fullyLocked || !refineDraft.trim()}
          onClick={() => void run('REFINE')}
        >
          REFINE + REGENERATE
        </button>
      </div>
      {error ? (
        <p className="site00-dw-v3-authority__error" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <>
          <p className="site00-dw-v3-authority__hint">
            {result.lineage} · {result.canonicalPath} · R2 self-check {result.r2SelfCheck.pass ? 'PASS' : 'FAIL'} ·{' '}
            {result.classification.replace(/DESIGN_PAGE_AUTHORITY_/, '')} · candidate #{session.candidateGeneration}
          </p>
          <div className="site00-dw-v3-authority__pair">
            <figure className="site00-dw-v3-authority__frame">
              <figcaption>Mobile {result.mobile.representativePrototype ? '(prototype)' : ''}</figcaption>
              <img src={result.mobile.storageUrl} alt="SITE 00 design page mobile authority" />
            </figure>
            <figure className="site00-dw-v3-authority__frame">
              <figcaption>Desktop {result.desktop.representativePrototype ? '(prototype)' : ''}</figcaption>
              <img src={result.desktop.storageUrl} alt="SITE 00 design page desktop authority" />
            </figure>
          </div>
        </>
      ) : null}
    </section>
  );
}
