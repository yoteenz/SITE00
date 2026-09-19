import type { CampaignWorldBible } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  world: CampaignWorldBible;
  onContinue: () => void;
};

export function CampaignDirectorStylingScreen({ world, onContinue }: Props) {
  const boards = [
    { label: 'HAIR', dir: world.hairDirection },
    { label: 'NAILS', dir: world.nailDirection },
    { label: 'MAKEUP', dir: world.makeupDirection },
    { label: 'WARDROBE', dir: world.wardrobeDirection },
    { label: 'PROPS', dir: world.propSystem.join(', ') },
    { label: 'MOTIFS', dir: world.motifs.join(', ') },
  ];

  return (
    <section className="site00-campaign-director__screen">
      <h2>STYLING · DIRECTION BOARDS</h2>
      <div className="site00-campaign-director__styling-grid">
        {boards.map((b) => (
          <div key={b.label} className="site00-campaign-director__styling-card">
            <span>{b.label}</span>
            <p>{b.dir || '—'}</p>
          </div>
        ))}
      </div>
      <button type="button" className="site00-campaign-director__btn-primary" onClick={onContinue}>
        CONTINUE TO SHOTS
      </button>
    </section>
  );
}
