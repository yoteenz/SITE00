/**
 * P0.VR.TWINV3.0 — Founder review for design page visual authority (no page implementation).
 */

import { useCallback, useState } from 'react';
import {
  approveDesignPageAuthorityPair,
  appendDesignPageAuthorityRefineNote,
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_AUTHORITY_LOCK_ID,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  isDesignPageAuthorityLocked,
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

  const approvePair = useCallback(() => {
    if (!session.lastResult) return;
    persist(approveDesignPageAuthorityPair(session));
  }, [persist, session]);

  if (!pilot) return null;

  const locked = isDesignPageAuthorityLocked(session);
  const result = session.lastResult;

  return (
    <section className="site00-dw-v3-authority" aria-label="Twin V3 design page authority review" data-build-ref={P0_VR_TWIN_V30_BUILD}>
      <header className="site00-dw-v3-authority__head">
        <strong>TWIN V3 · DESIGN PAGE AUTHORITY</strong>
        <span>NDXBOOK · authority only · no implementation</span>
        {locked ? <span className="site00-dw-v3-authority__lock">{DESIGN_PAGE_V3_AUTHORITY_LOCK_ID} locked</span> : null}
      </header>
      <p className="site00-dw-v3-authority__hint">
        Generate mobile + desktop visual authorities inside the locked product skeleton. Approve both to lock; next sprint implements
        the approved look — not this sprint.
      </p>
      <div className="site00-dw-v3-authority__actions">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={running || locked} onClick={() => void run('GENERATE')}>
          {running ? 'Generating…' : result ? 'REGENERATE AUTHORITY PAIR' : 'GENERATE AUTHORITY PAIR'}
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={!result || locked} onClick={approvePair}>
          APPROVE MOBILE + DESKTOP ({DESIGN_PAGE_V3_AUTHORITY_LOCK_ID})
        </button>
      </div>
      <div className="site00-dw-v3-authority__refine">
        <label htmlFor="v3-authority-refine">Refine notes (preserves skeleton)</label>
        <textarea
          id="v3-authority-refine"
          value={refineDraft}
          disabled={locked}
          onChange={(e) => setRefineDraft(e.target.value)}
          placeholder="e.g. make master preview larger; quiet the workflow rail"
        />
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--compact" disabled={running || locked || !refineDraft.trim()} onClick={() => void run('REFINE')}>
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
            Classification: {result.classification.replace(/DESIGN_PAGE_AUTHORITY_/, '')} · candidate #{session.candidateGeneration}
          </p>
          <div className="site00-dw-v3-authority__pair">
            <figure className="site00-dw-v3-authority__frame">
              <figcaption>Mobile authority {result.mobile.representativePrototype ? '(prototype)' : ''}</figcaption>
              <img src={result.mobile.storageUrl} alt="Mobile design page authority" />
            </figure>
            <figure className="site00-dw-v3-authority__frame">
              <figcaption>Desktop authority {result.desktop.representativePrototype ? '(prototype)' : ''}</figcaption>
              <img src={result.desktop.storageUrl} alt="Desktop design page authority" />
            </figure>
          </div>
        </>
      ) : null}
    </section>
  );
}
