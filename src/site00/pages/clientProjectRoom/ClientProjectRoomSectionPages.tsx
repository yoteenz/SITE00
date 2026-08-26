import { useParams } from 'react-router-dom';
import { useClientProjectRoom } from '../../hooks/useClientProjectRoom';
import { ClientProjectRoomShell } from '../../components/clientProjectRoom/ClientProjectRoomShell';

type ClientProjectRoomSectionPageProps = {
  section: 'reviews' | 'library' | 'activity' | 'messages';
  title: string;
  description: string;
};

export function ClientProjectRoomSectionPage({ section, title, description }: ClientProjectRoomSectionPageProps) {
  const { projectSlug = 'preview-client-room' } = useParams();
  const { data, state, error, reload } = useClientProjectRoom(projectSlug);

  if (state === 'loading' || state === 'idle') {
    return <div className="site00-cpr site00-cpr-loading">LOADING…</div>;
  }

  if (state === 'error' || !data) {
    return (
      <div className="site00-cpr site00-cpr-error">
        {error ?? 'Could not load project room.'}
        <div>
          <button type="button" onClick={() => void reload()}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientProjectRoomShell manifest={data.manifest} activeSection={section}>
      <header className="site00-cpr-header">
        <div className="site00-cpr-header__eyebrow">{title}</div>
        <h1 className="site00-cpr-header__title">{data.manifest.displayName}</h1>
      </header>
      <div className="site00-cpr-section-empty">
        <p>{description}</p>
        <p style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.08em' }}>
          Full {title.toLowerCase()} interactions ship in a follow-on sprint. Data contract and navigation are live.
        </p>
      </div>
    </ClientProjectRoomShell>
  );
}

export function ClientProjectRoomReviewsPage() {
  return (
    <ClientProjectRoomSectionPage
      section="reviews"
      title="REVIEWS"
      description="Review directions, compare versions, and record your decision when SITE 00 marks work ready for review."
    />
  );
}

export function ClientProjectRoomLibraryPage() {
  return (
    <ClientProjectRoomSectionPage
      section="library"
      title="LIBRARY"
      description="Approved identity, brand assets, page designs, and final deliverables appear here as they are delivered."
    />
  );
}

export function ClientProjectRoomActivityPage() {
  return (
    <ClientProjectRoomSectionPage
      section="activity"
      title="THE PROJECT SO FAR"
      description="A human-readable timeline of your project — the making-of story without internal studio machinery."
    />
  );
}

export function ClientProjectRoomMessagesPage() {
  return (
    <ClientProjectRoomSectionPage
      section="messages"
      title="MESSAGES"
      description="Project-specific messages from the SITE 00 team."
    />
  );
}
