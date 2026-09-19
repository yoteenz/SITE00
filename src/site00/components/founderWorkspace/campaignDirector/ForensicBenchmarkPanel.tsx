import { FORENSIC_BENCHMARK_LABEL } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/forensicBenchmark.js';

type Props = {
  comparison: ReturnType<
    typeof import('../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/campaignWorldGenesisEngine.js').campaignWorldGenesisEngine.compareForensicVsWeak
  >;
};

export function ForensicBenchmarkPanel({ comparison }: Props) {
  const { forensic, weak, yieldDelta, summary } = comparison;

  return (
    <section className="site00-campaign-director__forensic">
      <h2>{FORENSIC_BENCHMARK_LABEL}</h2>
      <p className="site00-campaign-director__forensic-note">
        Benchmark only — demonstrates associative depth. Not a default template.
      </p>

      <div className="site00-campaign-director__forensic-compare">
        <article className="site00-campaign-director__forensic-card site00-campaign-director__forensic-card--strong">
          <h3>HIGH YIELD · {forensic.coreConcept}</h3>
          <p>Setting: {forensic.setting}</p>
          <p className="site00-campaign-director__forensic-yield">
            Conceptual yield: <strong>{Math.round(forensic.conceptualYield.overall * 100)}%</strong>
          </p>
          <p>{forensic.associationChain.connectiveLogic}</p>
          <ul>
            {forensic.motifs.slice(0, 5).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </article>

        <article className="site00-campaign-director__forensic-card site00-campaign-director__forensic-card--weak">
          <h3>LOW YIELD · {weak.coreConcept}</h3>
          <p>Setting: {weak.setting}</p>
          <p className="site00-campaign-director__forensic-yield">
            Conceptual yield: <strong>{Math.round(weak.conceptualYield.overall * 100)}%</strong>
          </p>
          <p>{weak.whyItWorks}</p>
        </article>
      </div>

      <p className="site00-campaign-director__forensic-summary">{summary}</p>
      <p className="site00-campaign-director__forensic-delta">
        Yield delta: +{Math.round(yieldDelta * 100)} points — high-yield worlds generate setting, props, nails, copy, and sequence together.
      </p>
    </section>
  );
}
