import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { getClientAppInboxThreads } from '../../../../shared/site00-client-app/appContent.js';
import type { ClientInboxThread } from '../../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../../services/clientAppApi';
import { AppEmptyState, AppLoadingState, AppSectionLabel } from '../../components/clientApp/Site00ClientAppShell';
import type { AppOutletContext } from './AppProjectLayout';
import { useAppPaths, useIsAppPreview } from '../../hooks/useAppBasePath';

export default function AppInboxPage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  const isPreview = useIsAppPreview();
  const paths = useAppPaths(manifest.projectSlug);
  const [threads, setThreads] = useState<ClientInboxThread[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (isPreview) {
      setThreads(getClientAppInboxThreads(manifest));
      setState('ready');
      return;
    }
    void site00ClientAppApi
      .inbox(manifest.projectSlug)
      .then((r) => {
        setThreads(r.threads);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [manifest, isPreview]);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error') return <AppEmptyState title="INBOX UNAVAILABLE" />;

  return (
    <div>
      <AppSectionLabel>MESSAGES</AppSectionLabel>
      {threads.map((t) => (
        <Link key={t.id} to={paths.inbox(t.id)} className="site00-app-inbox-item">
          <span className={`site00-app-inbox-item__icon site00-app-inbox-item__icon--${t.category.toLowerCase()}`} />
          <div className="site00-app-inbox-item__content">
            <div className="site00-app-inbox-item__title">
              {t.title}
              {t.unread ? <span className="site00-app-inbox-item__unread"> · NEW</span> : null}
            </div>
            <div className="site00-app-inbox-item__preview">{t.preview}</div>
            <div className="site00-app-inbox-item__time">{t.timestamp}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function AppInboxThreadPage() {
  const { threadId = '' } = useParams();
  const { manifest } = useOutletContext<AppOutletContext>();
  const paths = useAppPaths(manifest.projectSlug);
  return (
    <div>
      <AppSectionLabel>THREAD</AppSectionLabel>
      <div className="site00-app-card">
        <p className="site00-app-home__moment">{threadId.replace(/-/g, ' ').toUpperCase()}</p>
        <p className="site00-app-home__moment">SITE 00 replies and review-linked messages appear here.</p>
      </div>
      <Link to={paths.inbox()} className="site00-app-link-cta">
        ← BACK TO INBOX
      </Link>
    </div>
  );
}
