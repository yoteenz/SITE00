import type { CampaignContentSequenceItem } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  sequence: CampaignContentSequenceItem[];
  onContinue: () => void;
};

export function CampaignDirectorSequenceScreen({ sequence, onContinue }: Props) {
  return (
    <section className="site00-campaign-director__screen">
      <h2>SEQUENCE</h2>
      <ol className="site00-campaign-director__sequence">
        {sequence.map((item) => (
          <li key={item.sequenceIndex}>
            <strong>{String(item.sequenceIndex).padStart(2, '0')}</strong>
            <span>{item.shotRole}</span>
            <span>{item.storyBeat}</span>
            <span className="site00-campaign-director__seq-channel">{item.channel.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="site00-campaign-director__btn-primary" onClick={onContinue}>
        CONTINUE TO PRODUCTION
      </button>
    </section>
  );
}
