import { creativeDirectionOrchestrationSystem } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/index.js';
import type {
  CampaignExecutionBible,
  CampaignShotRole,
  CampaignWorldBible,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  shots: CampaignShotRole[];
  world: CampaignWorldBible;
  execution: CampaignExecutionBible;
  onContinue: () => void;
};

export function CampaignDirectorShotsScreen({ shots, world, execution, onContinue }: Props) {
  const clue = shots.find((s) => s.role === 'CLUE');
  const compiled = clue
    ? creativeDirectionOrchestrationSystem.compilePrompt(world, execution, clue)
    : null;

  return (
    <section className="site00-campaign-director__screen">
      <h2>SHOT SYSTEM</h2>
      <div className="site00-campaign-director__shot-strip">
        {shots.map((s) => (
          <div key={s.shotId} className="site00-campaign-director__shot-card">
            <span className="site00-campaign-director__shot-role">{s.role}</span>
            <p>{s.purpose}</p>
            <span className="site00-campaign-director__shot-req">{s.requirement}</span>
          </div>
        ))}
      </div>
      {compiled ? (
        <details className="site00-campaign-director__details">
          <summary>CLUE SHOT — PRODUCTION DIRECTION (not generic prompt)</summary>
          <pre>{compiled.promptSummary}</pre>
        </details>
      ) : null}
      <button type="button" className="site00-campaign-director__btn-primary" onClick={onContinue}>
        CONTINUE TO SEQUENCE
      </button>
    </section>
  );
}
