import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { getClientAppInboxThreads } from '../../../../shared/site00-client-app/appContent.js';
import type { ClientInboxThread } from '../../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../../services/clientAppApi';
import { AppEmptyState, AppLoadingState } from '../../components/clientApp/Site00ClientAppShell';
import { SelfDirectedInboxThreadView, SelfDirectedInboxView } from '../../components/selfDirected/SelfDirectedInboxView';
import type { AppOutletContext } from './AppProjectLayout';
import { useAppPaths, useIsAppPreview } from '../../hooks/useAppBasePath';

function threadMessages(thread: ClientInboxThread) {
  return [
    {
      id: `${thread.id}-1`,
      author: thread.category === 'SITE00' ? 'SITE 00' : 'STUDIO',
      body: thread.preview,
      timestamp: thread.timestamp,
      isSite00: thread.category === 'SITE00',
    },
    {
      id: `${thread.id}-2`,
      author: 'YOU',
      body: 'Thanks — reviewing now and will share feedback shortly.',
      timestamp: 'Earlier',
    },
  ];
}

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
    <SelfDirectedInboxView
      threads={threads}
      threadHref={(threadId) => paths.inbox(threadId)}
      projectLabel={manifest.projectNumber}
    />
  );
}

export function AppInboxThreadPage() {
  const { threadId = '' } = useParams();
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

  const thread = useMemo(() => threads.find((t) => t.id === threadId) ?? null, [threads, threadId]);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error' || !thread) {
    return <AppEmptyState title="THREAD UNAVAILABLE" body="This conversation could not be loaded." />;
  }

  return (
    <SelfDirectedInboxThreadView thread={thread} backHref={paths.inbox()} messages={threadMessages(thread)} />
  );
}
