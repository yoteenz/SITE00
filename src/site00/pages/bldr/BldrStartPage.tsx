import { useNavigate } from 'react-router-dom';
import { HubTile, HubTileGrid, PublicHubPage } from '../../components/public-redesign/PublicHubLayouts';
import { PublicLineIcon } from '../../components/public-redesign/PublicLineIcon';
import { SITE00_BLDR_BUILD_DIRECTIONS, SITE00_BLDR_ENTRY_COPY } from '../../config/bldr-entry';
import { useSite00 } from '../../state/Site00Context';

/** BLDR direction entry — SITE / WORLD (same selection + navigation behaviour as before). */
export default function BldrStartPage() {
  const navigate = useNavigate();
  const { selectBuildClass } = useSite00();
  const { headlineLine1, headlineLine2, subtitle } = SITE00_BLDR_ENTRY_COPY;

  return (
    <PublicHubPage
      section="bldr"
      page="bldr-start"
      envSlotId="ENV.BLDR.COMMAND_CENTER"
      crumb="LOCATION / BLDR / 00"
      title={
        <>
          {headlineLine1}
          <br />
          {headlineLine2}
        </>
      }
      subtitle={subtitle}
      width="narrow"
    >
      <HubTileGrid columns={2}>
        {SITE00_BLDR_BUILD_DIRECTIONS.map((direction) => (
          <HubTile
            key={direction.id}
            code={direction.id === 'site' ? '01' : '02'}
            title={direction.title}
            description={`${direction.descriptionLines.join(' ')} · ${direction.price}`}
            cta="CHOOSE →"
            icon={<PublicLineIcon id={direction.id === 'site' ? 'monitor' : 'globe'} size={26} />}
            onClick={() => {
              selectBuildClass(direction.buildClassId);
              navigate(direction.href, { state: { fromBldrEntry: true, buildClassId: direction.buildClassId } });
            }}
          />
        ))}
      </HubTileGrid>
    </PublicHubPage>
  );
}
