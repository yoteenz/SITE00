import { Link } from 'react-router-dom';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { Site00ExperiencePage } from '../../components/experience/Site00ExperiencePage';
import { SITE00_CONTACT_CHANNELS_SEED } from '../../config/seed/site00-page-seed';
import { SITE00_ROUTES } from '../../config/routes';

export default function ContactPage() {
  return (
    <Site00ExperiencePage pageClassName="site00-page--contact" pageLabel="CONTACT">
      <PageIntro title={<BracketHeading>CONTACT</BracketHeading>} subtitle="REACH THE SITE 00 TEAM." />
      <div className="site00-contact-channels">
        {SITE00_CONTACT_CHANNELS_SEED.map((channel) => (
          <article key={channel.id} className="site00-contact-channel">
            <p className="site00-label-red">{channel.label}</p>
            <a href={`mailto:${channel.email}`} className="site00-link-red">
              {channel.email}
            </a>
          </article>
        ))}
      </div>
      <p className="site00-body">
        FOR HELP ARTICLES, VISIT{' '}
        <Link to={SITE00_ROUTES.support} className="site00-link-red">
          SUPPORT
        </Link>
        .
      </p>
    </Site00ExperiencePage>
  );
}
