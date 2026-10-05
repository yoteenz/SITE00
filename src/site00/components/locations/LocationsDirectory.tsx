import { useLocation } from 'react-router-dom';
import { SITE00_LOCATIONS_SECTIONS } from '../../config/locations-directory';
import { LocationsDirectoryHeader } from './LocationsDirectoryHeader';
import { LocationsDirectorySection } from './LocationsDirectorySection';

export function LocationsDirectory() {
  const { pathname } = useLocation();
  const isDirectoryPage = pathname.startsWith('/origin/locations');
  const totalCards = SITE00_LOCATIONS_SECTIONS.reduce((sum, section) => sum + section.entries.length, 0);
  let cardIndex = 0;

  return (
    <div className="site00-locations-directory-wrap">
      {isDirectoryPage ? <LocationsDirectoryHeader /> : null}
      {SITE00_LOCATIONS_SECTIONS.map((section) => {
        const cardIndexOffset = cardIndex;
        cardIndex += section.entries.length;
        return (
          <LocationsDirectorySection
            key={section.id}
            section={section}
            cardIndexOffset={cardIndexOffset}
          />
        );
      })}
      <span className="site00-visually-hidden" aria-hidden="true">
        {totalCards} directory destinations
      </span>
    </div>
  );
}
