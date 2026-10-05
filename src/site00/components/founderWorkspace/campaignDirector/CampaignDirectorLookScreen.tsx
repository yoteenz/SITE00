import type { CampaignExecutionBible, CampaignWorldBible } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  world: CampaignWorldBible;
  execution: CampaignExecutionBible;
  onContinue: () => void;
};

export function CampaignDirectorLookScreen({ world, execution, onContinue }: Props) {
  return (
    <section className="site00-campaign-director__screen">
      <h2>LOOK · VISUAL GRAMMAR</h2>
      <div className="site00-campaign-director__visual-board">
        <div className="site00-campaign-director__visual-card">
          <span>LIGHT</span>
          <p>Observational — not studio sterility</p>
        </div>
        <div className="site00-campaign-director__visual-card">
          <span>CAMERA</span>
          <p>Mix wide + macro — behavior-led</p>
        </div>
        <div className="site00-campaign-director__visual-card">
          <span>COLOR</span>
          <p>{world.colorLogic}</p>
        </div>
        <div className="site00-campaign-director__visual-card">
          <span>MATERIAL</span>
          <p>{world.materialLogic}</p>
        </div>
        <div className="site00-campaign-director__visual-card">
          <span>ENVIRONMENT</span>
          <p>{world.setting}</p>
        </div>
        <div className="site00-campaign-director__visual-card">
          <span>GRAPHIC</span>
          <p>{world.graphicLanguage}</p>
        </div>
      </div>
      <ul className="site00-campaign-director__rules">
        {execution.visualGrammar.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <button type="button" className="site00-campaign-director__btn-primary" onClick={onContinue}>
        CONTINUE TO STYLING
      </button>
    </section>
  );
}
