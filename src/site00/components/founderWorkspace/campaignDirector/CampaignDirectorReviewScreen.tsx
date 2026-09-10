import type {
  ConceptDriftDiagnosis,
  ConceptToExecutionFidelityScore,
  RevisionDirection,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  fidelity: ConceptToExecutionFidelityScore;
  drift: ConceptDriftDiagnosis;
  revision: RevisionDirection;
};

export function CampaignDirectorReviewScreen({ fidelity, revision }: Props) {
  return (
    <section className="site00-campaign-director__screen">
      <h2>CONCEPT FIDELITY REVIEW</h2>
      <p className="site00-campaign-director__screen-lead">
        Does this visual actually execute the idea? (Demo: generic pool-table pose)
      </p>

      <div className={`site00-campaign-director__fidelity${fidelity.pass ? ' site00-campaign-director__fidelity--pass' : ' site00-campaign-director__fidelity--fail'}`}>
        <div>
          <span>VISUAL QUALITY</span>
          <strong>{Math.round(fidelity.visualQuality * 100)}</strong>
        </div>
        <div>
          <span>CONCEPT FIDELITY</span>
          <strong>{Math.round(fidelity.conceptFidelity * 100)}</strong>
        </div>
        <div>
          <span>OVERALL</span>
          <strong>{Math.round(fidelity.overall * 100)}</strong>
        </div>
      </div>

      {fidelity.beautifulButGeneric ? (
        <p className="site00-campaign-director__fail-banner">
          BEAUTIFUL BUT GENERIC — visual quality {Math.round(fidelity.visualQuality * 100)} but concept fidelity {Math.round(fidelity.conceptFidelity * 100)}. Does not pass.
        </p>
      ) : null}

      <h3>REVISION DIRECTION</h3>
      <ul>
        {revision.specificDirections.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
