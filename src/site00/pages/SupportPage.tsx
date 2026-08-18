import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import {
  BracketHeading,
  EmptyState,
  PageIntro,
  SearchField,
} from '../components/pages/Site00PagePrimitives';
import { SITE00_SUPPORT_TOPICS_SEED } from '../config/seed/site00-page-seed';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSignedInFromStorage } from '../../hooks/useSignedInFromStorage';

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [isSignedIn] = useSignedInFromStorage();
  const topics = SITE00_SUPPORT_TOPICS_SEED.filter(
    (t) => !query.trim() || t.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--support">
        <PageIntro title={<BracketHeading>SUPPORT</BracketHeading>} subtitle="GET HELP. FIND ANSWERS. CONTACT OUR TEAM." />
        <div className="site00-support-hero">
          <div>
            <p className="site00-label-red">HOW CAN WE HELP?</p>
            <SearchField value={query} onChange={setQuery} placeholder="SEARCH FOR HELP ARTICLES…" id="support-search" />
          </div>
          <aside className="site00-support-contact">
            <p className="site00-label-red">CONTACT SUPPORT</p>
            <p className="site00-body">NEED MORE HELP? OUR TEAM IS HERE FOR YOU.</p>
            <a href="mailto:support@site00.com" className="site00-link-red">
              CONTACT US →
            </a>
          </aside>
        </div>
        <div className="site00-support-topics">
          {topics.map((topic) => (
            <Link key={topic.id} to={topic.href} className="site00-support-topic">
              <div>
                <h2 className="site00-support-topic__title">{topic.title}</h2>
                <p className="site00-support-topic__desc">{topic.description}</p>
              </div>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
        {isSignedIn ? (
          <section className="site00-system-panel">
            <h2 className="site00-label-red">RECENT SUPPORT ACTIVITY</h2>
            <EmptyState title="NO RECENT ACTIVITY" body="YOUR SUPPORT TICKETS WILL APPEAR HERE." />
          </section>
        ) : null}
      </div>
    </Site00PublicShell>
  );
}
