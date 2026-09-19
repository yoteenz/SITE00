import type {
  CampaignContentSequenceItem,
  CampaignShotRole,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  shots: CampaignShotRole[];
  sequence: CampaignContentSequenceItem[];
  onContinue: () => void;
};

export function CampaignDirectorProductionScreen({ shots, sequence, onContinue }: Props) {
  const imageCount = sequence.filter((s) => s.assetType === 'IMAGE').length;
  const videoCount = sequence.filter((s) => s.assetType === 'VIDEO').length;

  return (
    <section className="site00-campaign-director__screen">
      <h2>READY TO PRODUCE</h2>
      <div className="site00-campaign-director__production-summary">
        <div><strong>{shots.length}</strong><span>SHOTS</span></div>
        <div><strong>{imageCount}</strong><span>IMAGES</span></div>
        <div><strong>{videoCount}</strong><span>MOTION</span></div>
      </div>
      <p className="site00-campaign-director__screen-lead">
        Production adapters: image gen, video gen, photographer brief, stylist brief, editor brief, copy brief.
      </p>
      <button type="button" className="site00-campaign-director__btn-primary" onClick={onContinue}>
        REVIEW CONCEPT FIDELITY
      </button>
    </section>
  );
}
