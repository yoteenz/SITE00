import { useLocation } from 'react-router-dom';
import { SITE00_LOCATIONS_SECTIONS } from '../../config/locations-directory';
import { LocationsDirectoryHeader } from './LocationsDirectoryHeader';
import { DirectorySpine } from './DirectorySpine';
import { DirectoryCard } from './DirectoryCard';

export function LocationsDirectory() {
  const { pathname } = useLocation();
  const isDirectoryPage = pathname.startsWith('/origin/locations');
  const totalCards = SITE00_LOCATIONS_SECTIONS.reduce((sum, section) => sum + section.entries.length, 0);
  let cardIndex = 0;

  return (
    <div className="site00-locations-directory-wrap">
      {isDirectoryPage ? <LocationsDirectoryHeader /> : null}
      {SITE00_LOCATIONS_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="site00-locations-directory"
          aria-label={`${section.title} destinations`}
        >
          <h2 className="site00-locations-directory__section-title">{section.title}</h2>
          <div className="site00-locations-directory__grid">
            <DirectorySpine cardCount={section.entries.length} />
            <div className="site00-locations-directory__cards" role="list">
              {section.entries.map((entry) => {
                const index = cardIndex;
                cardIndex += 1;
                return (
                  <div
                    key={entry.id}
                    className="site00-locations-directory__card-wrap"
                    role="listitem"
                    style={{ ['--site00-directory-card-index' as string]: index }}
                  >
                    <DirectoryCard entry={entry} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
      <span className="site00-visually-hidden" aria-hidden="true">
        {totalCards} directory destinations
      </span>
    </div>
  );
}
