import { SITE00_BLDR_BUILD_DIRECTIONS } from '../../config/bldr-entry';
import { BldrEntryIntro } from './BldrEntryIntro';
import { BuildDirectionCard } from './BuildDirectionCard';
import { DirectionInterchange } from './DirectionInterchange';

/** Screen 02 — BLDR ENTRY content (intro + SITE/WORLD direction cards). */
export function BldrEntryPage() {
  const [siteDirection, worldDirection] = SITE00_BLDR_BUILD_DIRECTIONS;

  return (
    <div className="site00-bldr-entry">
      <BldrEntryIntro />
      <div className="site00-bldr-entry__cards">
        <BuildDirectionCard direction={siteDirection} />
        <DirectionInterchange />
        <BuildDirectionCard direction={worldDirection} />
      </div>
    </div>
  );
}
