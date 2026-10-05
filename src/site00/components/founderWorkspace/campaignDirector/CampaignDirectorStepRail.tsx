import type { DirectorWizardStep } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

const LABELS: Record<DirectorWizardStep, string> = {
  world: 'WORLD',
  look: 'LOOK',
  styling: 'STYLING',
  shots: 'SHOTS',
  sequence: 'SEQUENCE',
  production: 'PRODUCTION',
  review: 'REVIEW',
};

type Props = {
  steps: DirectorWizardStep[];
  current: DirectorWizardStep;
  onSelect: (s: DirectorWizardStep) => void;
  worldApproved: boolean;
};

export function CampaignDirectorStepRail({ steps, current, onSelect, worldApproved }: Props) {
  return (
    <nav className="site00-campaign-director__rail" aria-label="Campaign director steps">
      {steps.map((s, i) => {
        const locked = !worldApproved && s !== 'world';
        return (
          <button
            key={s}
            type="button"
            className={`site00-campaign-director__rail-step${current === s ? ' site00-campaign-director__rail-step--active' : ''}${locked ? ' site00-campaign-director__rail-step--locked' : ''}`}
            onClick={() => !locked && onSelect(s)}
            disabled={locked}
          >
            <span className="site00-campaign-director__rail-num">{i + 1}</span>
            {LABELS[s]}
          </button>
        );
      })}
    </nav>
  );
}
