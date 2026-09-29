import { useState } from 'react';
import { getStudioWorldActorCatalogue } from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { PW_IMG } from '../../components/production/productionImagery';
import { PwFrame } from '../../components/production/PwFrame';
import { PwChip, PwScreenHead } from '../../components/production/PwPrimitives';

type Lib = { id: string; title: string; sub: string; img: string; scope: string };

const LIBRARIES: Lib[] = [
  { id: 'actors', title: 'Actor Catalogue', sub: 'Characters, faces, profiles', img: PW_IMG.library.actors, scope: 'Cross-project casting authority. Actor ≠ Character ≠ Campaign Look.' },
  { id: 'wardrobe', title: 'Wardrobe Library', sub: 'Clothing, accessories, looks', img: PW_IMG.library.wardrobe, scope: 'Garments, styling notes, era, role compatibility.' },
  { id: 'hair', title: 'Hair + Makeup Library', sub: 'Styles, beauty, grooming', img: PW_IMG.library.hair, scope: 'Hair styles and makeup / grooming looks.' },
  { id: 'environment', title: 'Environment Library', sub: 'Locations, atmospheres', img: PW_IMG.library.environment, scope: 'Reusable environments and lighting modes.' },
  { id: 'sets', title: 'Set Library', sub: 'Sets, zones, anchors', img: PW_IMG.library.sets, scope: 'Sets with zones, interaction anchors, prop compatibility.' },
  { id: 'prop', title: 'Prop Library', sub: 'Props, practical objects', img: PW_IMG.library.prop, scope: 'Props and practical objects tagged for set compatibility.' },
  { id: 'graphic', title: 'Graphic / Text Asset Library', sub: 'Signage, screens, text anchors', img: PW_IMG.library.graphic, scope: 'Signage, screens, framed graphics and replaceable text.' },
  { id: 'performance', title: 'Performance Library', sub: 'Movement, behavior, voice', img: PW_IMG.library.performance, scope: 'Behavior, movement and animation skins.' },
];

export function ProductionLibrariesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const actors = getStudioWorldActorCatalogue().actors;

  return (
    <PwFrame variant="production">
      <main data-testid="production-libraries">
        <PwScreenHead backTo="/production" backLabel="Production" title="Libraries" sub="Shared production assets" />
        <div className="pw-list">
          {LIBRARIES.map((l) => {
            const expanded = open === l.id;
            const live = l.id === 'actors';
            return (
              <div key={l.id} className="pw-libgroup">
                <button
                  type="button"
                  className="pw-row"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : l.id)}
                  data-testid={`library-${l.id}`}
                >
                  <span className="pw-row__thumb" style={{ backgroundImage: `url(${l.img})` }} aria-hidden />
                  <span className="pw-row__text">
                    <span className="pw-row__title">{l.title}</span>
                    <span className="pw-row__sub">{l.sub}</span>
                  </span>
                  <PwChip tone={live ? 'green' : 'gray'}>{live ? `${actors.length} RECORDS` : 'NO RECORDS'}</PwChip>
                </button>
                {expanded ?
                  <div className="pw-libgroup__panel">
                    <p className="pw-label">{l.scope}</p>
                    {live ?
                      <ul>
                        {actors.slice(0, 8).map((a) => (
                          <li key={a.actorId}>
                            <strong>{a.catalogueNumber}</strong> {a.stageName}
                            <span>{a.ageRange} · {a.roleArchetypes.slice(0, 2).map((r) => r.replace(/_/g, ' ')).join(' / ')}</span>
                          </li>
                        ))}
                      </ul>
                    : <p className="pw-libgroup__none">No records in this library yet. Assets appear here as productions publish them.</p>}
                  </div>
                : null}
              </div>
            );
          })}
        </div>
      </main>
    </PwFrame>
  );
}
