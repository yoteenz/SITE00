import { useRef } from 'react';
import type { LocationsDirectorySection as LocationsDirectorySectionConfig } from '../../config/locations-directory';
import { DirectorySpine } from './DirectorySpine';
import { DirectoryCard } from './DirectoryCard';

type LocationsDirectorySectionProps = {
  section: LocationsDirectorySectionConfig;
  cardIndexOffset: number;
};

export function LocationsDirectorySection({ section, cardIndexOffset }: LocationsDirectorySectionProps) {
  const cardsRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="site00-locations-directory"
      aria-label={`${section.title} destinations`}
    >
      <h2 className="site00-locations-directory__section-title">{section.title}</h2>
      <div className="site00-locations-directory__grid">
        <DirectorySpine cardsContainerRef={cardsRef} />
        <div ref={cardsRef} className="site00-locations-directory__cards" role="list">
          {section.entries.map((entry, entryIndex) => {
            const index = cardIndexOffset + entryIndex;
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
  );
}
