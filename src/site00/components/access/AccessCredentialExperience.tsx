import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeAccessCredentialCode } from '../../config/access-credentials';
import { SITE00_ROUTES } from '../../config/routes';
import { site00AccessApi } from '../../services/accessCredentialApi';
import {
  getOrCreateAccessVisitSessionId,
  markAccessCredentialScanned,
  writeActiveAccessCredential,
} from '../../utils/accessCredentialSession';
import { trackActivity } from '../../../utils/activity';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import {
  AccessCredentialClosedPanel,
  AccessCredentialInactivePanel,
  AccessCredentialNotRecognizedPanel,
  AccessCredentialRecognizedPanel,
} from './AccessCredentialPanels';

export function AccessCredentialExperience() {
  const { credentialId = '' } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const layout = isWide ? 'desktop' : 'mobile';
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [view, setView] = useState<Awaited<ReturnType<typeof site00AccessApi.resolve>>['view'] | null>(null);
  const scanRecorded = useRef(false);

  const normalizedCode = normalizeAccessCredentialCode(credentialId) ?? '';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        if (!normalizedCode) {
          if (!cancelled) setView({ resolved: 'not_found' } as never);
          return;
        }

        const { view: resolved } = await site00AccessApi.resolve(normalizedCode);
        if (cancelled) return;
        setView(resolved);

        if (resolved.resolved !== 'not_found' && !scanRecorded.current && markAccessCredentialScanned(normalizedCode)) {
          scanRecorded.current = true;
          const sessionId = getOrCreateAccessVisitSessionId();
          await site00AccessApi.recordScan(normalizedCode, sessionId).catch(() => {});
          trackActivity('access_credential_scanned', { code: normalizedCode });
        }
      } catch {
        if (!cancelled) setView({ resolved: 'not_found' } as never);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [normalizedCode]);

  const enterSite = useCallback(async () => {
    if (!normalizedCode || !view) return;
    setEntering(true);
    try {
      const sessionId = getOrCreateAccessVisitSessionId();
      if (view.resolved === 'valid') {
        await site00AccessApi.recordEnter(normalizedCode, sessionId).catch(() => {});
        writeActiveAccessCredential(normalizedCode);
        trackActivity('access_credential_entered', { code: normalizedCode });
      }
      navigate(SITE00_ROUTES.originAlias);
    } finally {
      setEntering(false);
    }
  }, [normalizedCode, navigate, view]);

  if (loading) {
    return (
      <div className={`site00-access-page site00-access-page--${layout}`.trim()} aria-busy="true">
        <div className="site00-access-page__loading">VERIFYING CREDENTIAL…</div>
      </div>
    );
  }

  if (!view || view.resolved === 'not_found') {
    return (
      <div className={`site00-access-page site00-access-page--${layout}`.trim()}>
        <AccessCredentialNotRecognizedPanel layout={layout} />
      </div>
    );
  }

  if (view.resolved === 'revoked' || view.resolved === 'expired') {
    return (
      <div className={`site00-access-page site00-access-page--${layout}`.trim()}>
        <AccessCredentialClosedPanel layout={layout} onEnterPublic={() => navigate(SITE00_ROUTES.originAlias)} />
      </div>
    );
  }

  if (view.resolved === 'inactive') {
    return (
      <div className={`site00-access-page site00-access-page--${layout}`.trim()}>
        <AccessCredentialInactivePanel layout={layout} />
      </div>
    );
  }

  return (
    <div className={`site00-access-page site00-access-page--${layout}`.trim()}>
      <AccessCredentialRecognizedPanel view={view} layout={layout} onEnter={() => void enterSite()} entering={entering} />
    </div>
  );
}
