import { Link } from 'react-router-dom';
import type { ClientInboxThread } from '../../../../shared/site00-client-app/types.js';
import { useSite00MobileViewport } from '../../hooks/useSite00MobileViewport';
import { AppSectionLabel, AppStatusDot } from '../clientApp/Site00ClientAppShell';

type SelfDirectedInboxViewProps = {
  threads: ClientInboxThread[];
  threadHref: (threadId: string) => string;
  projectLabel?: string;
};

function categoryIcon(category: ClientInboxThread['category']): string {
  if (category === 'DESIGN_REVIEW') return 'review';
  if (category === 'FILES') return 'files';
  return 'site00';
}

function ThreadRow({ thread, href }: { thread: ClientInboxThread; href: string }) {
  return (
    <Link to={href} className={`site00-sd-inbox__thread${thread.unread ? ' site00-sd-inbox__thread--unread' : ''}`}>
      <span className={`site00-sd-inbox__icon site00-sd-inbox__icon--${categoryIcon(thread.category)}`} aria-hidden="true" />
      <div className="site00-sd-inbox__thread-body">
        <div className="site00-sd-inbox__thread-top">
          <strong>{thread.title}</strong>
          <time>{thread.timestamp}</time>
        </div>
        <p>{thread.preview}</p>
        {thread.unread ? (
          <span className="site00-sd-inbox__unread-badge">
            <AppStatusDot tone="accent" /> UNREAD
          </span>
        ) : null}
      </div>
      <span className="site00-sd-inbox__thread-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function InboxMobile({ threads, threadHref, projectLabel }: SelfDirectedInboxViewProps) {
  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="site00-sd-inbox site00-sd-inbox--mobile">
      <header className="site00-sd-inbox__header">
        <AppStatusDot />
        <span>INBOX</span>
        {projectLabel ? <span className="site00-sd-muted">{projectLabel}</span> : null}
      </header>
      <div className="site00-sd-inbox__summary">
        <strong>{unreadCount > 0 ? unreadCount : '—'}</strong>
        <span>UNREAD THREADS</span>
      </div>
      <AppSectionLabel>
        PROJECT DISCUSSION <span className="site00-sd-muted">NOT SYSTEM ALERTS</span>
      </AppSectionLabel>
      {threads.length === 0 ? (
        <div className="site00-sd-inbox__empty">NO MESSAGES YET.</div>
      ) : (
        <div className="site00-sd-inbox__list">
          {threads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} href={threadHref(thread.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function InboxDesktop({ threads, threadHref, projectLabel }: SelfDirectedInboxViewProps) {
  const unread = threads.filter((t) => t.unread);
  const read = threads.filter((t) => !t.unread);

  return (
    <div className="site00-sd-inbox site00-sd-inbox--desktop">
      <header className="site00-sd-inbox__header site00-sd-inbox__header--desktop">
        <div>
          <AppStatusDot />
          <span>INBOX</span>
          <h1>PROJECT COMMUNICATION</h1>
        </div>
        {projectLabel ? <span className="site00-sd-muted">{projectLabel}</span> : null}
      </header>

      <div className="site00-sd-inbox__desktop-split">
        <div className="site00-sd-inbox__thread-pane">
          <AppSectionLabel>
            THREADS {unread.length > 0 ? <span className="site00-sd-inbox__count">{unread.length} UNREAD</span> : null}
          </AppSectionLabel>
          {threads.length === 0 ? (
            <div className="site00-sd-inbox__empty">NO MESSAGES YET.</div>
          ) : (
            <div className="site00-sd-inbox__list site00-sd-inbox__list--desktop">
              {unread.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} href={threadHref(thread.id)} />
              ))}
              {read.map((thread) => (
                <ThreadRow key={thread.id} thread={thread} href={threadHref(thread.id)} />
              ))}
            </div>
          )}
        </div>
        <aside className="site00-sd-inbox__compose-rail">
          <AppSectionLabel>COMPOSE</AppSectionLabel>
          <div className="site00-sd-inbox__compose-card">
            <p>START A THREAD WITH SITE 00 ABOUT THIS PROJECT.</p>
            <button type="button" className="site00-sd-inbox__compose-btn">
              NEW MESSAGE →
            </button>
          </div>
          <div className="site00-sd-inbox__rail-note">
            <p>REVIEW-LINKED MESSAGES APPEAR HERE — NOT GLOBAL NOTIFICATIONS.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function SelfDirectedInboxView(props: SelfDirectedInboxViewProps) {
  const isMobile = useSite00MobileViewport();
  return isMobile ? <InboxMobile {...props} /> : <InboxDesktop {...props} />;
}

export function SelfDirectedInboxThreadView({
  thread,
  backHref,
  messages,
}: {
  thread: ClientInboxThread;
  backHref: string;
  messages: Array<{ id: string; author: string; body: string; timestamp: string; isSite00?: boolean }>;
}) {
  const isMobile = useSite00MobileViewport();

  return (
    <div className={`site00-sd-inbox-thread${isMobile ? '' : ' site00-sd-inbox-thread--desktop'}`}>
      <header className="site00-sd-inbox-thread__header">
        <Link to={backHref} className="site00-sd-inbox-thread__back">
          ← INBOX
        </Link>
        <div>
          <AppStatusDot tone={thread.unread ? 'accent' : 'grey'} />
          <h1>{thread.title}</h1>
          <span className="site00-sd-muted">{thread.category.replace(/_/g, ' ')}</span>
        </div>
      </header>

      <div className={`site00-sd-inbox-thread__messages${isMobile ? '' : ' site00-sd-inbox-thread__messages--split'}`}>
        {messages.map((msg) => (
          <article
            key={msg.id}
            className={`site00-sd-inbox-thread__message${msg.isSite00 ? ' site00-sd-inbox-thread__message--site00' : ''}`}
          >
            <header>
              <strong>{msg.author}</strong>
              <time>{msg.timestamp}</time>
            </header>
            <p>{msg.body}</p>
          </article>
        ))}
      </div>

      <footer className="site00-sd-inbox-thread__reply">
        <textarea placeholder="WRITE A REPLY…" rows={isMobile ? 3 : 2} />
        <button type="button" className="site00-sd-inbox-thread__send">
          SEND →
        </button>
      </footer>
    </div>
  );
}
