import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HubArrow, HubEmpty, HubPanel, HubSearch, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { SITE00_SUPPORT_TOPICS_SEED } from '../config/seed/site00-page-seed';
import { useSignedInFromStorage } from '../../hooks/useSignedInFromStorage';

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [isSignedIn] = useSignedInFromStorage();
  const topics = SITE00_SUPPORT_TOPICS_SEED.filter((t) => !query.trim() || t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <PublicHubPage section="idnty" page="support" crumb="LOCATION / SUPPORT" title="SUPPORT" subtitle="GET HELP. FIND ANSWERS. CONTACT OUR TEAM." width="wide">
      <div className="s00pr-hubsplit">
        <HubPanel label="HOW CAN WE HELP?">
          <HubSearch value={query} onChange={setQuery} placeholder="SEARCH FOR HELP ARTICLES…" id="support-search" />
          <nav className="s00pr-hubdir s00pr-hubdir--topics" aria-label="SUPPORT TOPICS">
            {topics.map((topic) => (
              <Link key={topic.id} to={topic.href} className="s00pr-hubdir__row s00pr-hubdir__row--topic">
                <span>
                  <strong className="s00pr-hubdir__title">{topic.title}</strong>
                  <small className="s00pr-hubdir__desc">{topic.description}</small>
                </span>
                <i className="s00pr-hubdir__go">
                  <HubArrow size={16} />
                </i>
              </Link>
            ))}
            {topics.length === 0 ? <HubEmpty title="NO MATCHING TOPICS" body="TRY A DIFFERENT SEARCH OR CONTACT SUPPORT." /> : null}
          </nav>
        </HubPanel>
        <div>
          <HubPanel label="CONTACT SUPPORT" className="s00pr-hubsplit__cta">
            <p>NEED MORE HELP? OUR TEAM IS HERE FOR YOU.</p>
            <a href="mailto:support@site00.com">CONTACT US →</a>
          </HubPanel>
          {isSignedIn ? (
            <HubPanel label="RECENT SUPPORT ACTIVITY">
              <HubEmpty title="NO RECENT ACTIVITY" body="YOUR SUPPORT TICKETS WILL APPEAR HERE." />
            </HubPanel>
          ) : null}
        </div>
      </div>
    </PublicHubPage>
  );
}
