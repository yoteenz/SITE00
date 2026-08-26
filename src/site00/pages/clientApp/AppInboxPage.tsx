import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { clientAppInboxPath } from '../../../../shared/site00-client-app/client.js';
import type { ClientInboxThread } from '../../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../../services/clientAppApi';
import { AppEmptyState, AppLoadingState, AppSectionLabel } from '../../components/clientApp/Site00ClientAppShell';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppInboxPage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  const [threads, setThreads] = useState<ClientInboxThread[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    void site00ClientAppApi
      .inbox(manifest.projectSlug)
      .then((r) => {
        setThreads(r.threads);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [manifest.projectSlug]);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error') return <AppEmptyState title="INBOX UNAVAILABLE" />;

  return (
    <div>
      <AppSectionLabel>MESSAGES</AppSectionLabel>
      {threads.map((t) => (
        <Link key={t.id} to={clientAppInboxPath(manifest.projectSlug, t.id)} className="site00-app-inbox-item">
          <div className="site00-app-inbox-item__title">
            {t.title}
            {t.unread ? ' · NEW' : ''}
          </div>
          <div className="site00-app-inbox-item__preview">{t.preview}</div>
          <div className="site00-app-inbox-item__preview">{t.timestamp}</div>
        </Link>
      ))}
    </div>
  );
}

export function AppInboxThreadPage() {
  const { threadId = '' } = useParams();
  const { manifest } = useOutletContext<AppOutletContext>();
  return (
    <div>
      <AppSectionLabel>THREAD</AppSectionLabel>
      <div className="site00-app-card">
        <p className="site00-app-home__moment">Project conversation for {threadId.replace(/-/g, ' ').toUpperCase()}.</p>
        <p className="site00-app-home__moment">SITE 00 replies and review-linked messages appear here.</p>
      </div>
      <Link to={clientAppInboxPath(manifest.projectSlug)} className="site00-app-link-cta">
        ← BACK TO INBOX
      </Link>
    </div>
  );
}
