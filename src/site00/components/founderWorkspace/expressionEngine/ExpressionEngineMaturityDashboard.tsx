/**
 * P0.CJ.1 — Expression Engine maturity dashboard (founder-only scaffold).
 */

import type { CreativeJudgmentResult } from '../../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export type ExpressionEngineMaturityPayload = {
  engineVersion: string;
  benchmarkBriefCount: number;
  benchmarkCoverage: { total: number; categories: number; ndxOnly: number };
  entry003Golden: CreativeJudgmentResult;
  verdantRowGolden: CreativeJudgmentResult;
  maturity: {
    conceptualReasoningMedian: number;
    packageArchitectureMedian: number;
    brandFidelityMedian: number;
    autonomousJudgmentMedian: number;
    founderRescueRate: number;
    selfCritiqueAccuracy: number;
    operational100Eligible: boolean;
    sampleSize: number;
  };
  founderRescueRate: { ratePercent: number };
  selfCritiqueAccuracy: { accuracyPercent: number };
  visualAuthority: string;
};

type Props = {
  payload: ExpressionEngineMaturityPayload | Record<string, unknown> | null;
  loading?: boolean;
  onRunEntry003?: () => void;
  onSubmitJudgment?: (label: string) => void;
};

const QUICK_JUDGMENTS = [
  'LOVE_IT',
  'PROMISING',
  'TOO_SAFE',
  'TOO_GENERIC',
  'TOO_CLOSE',
  'WRONG_MECHANISM',
  'NOT_BRAND',
  'KILL_IT',
] as const;

export function ExpressionEngineMaturityDashboard({ payload, loading, onRunEntry003, onSubmitJudgment }: Props) {
  if (loading) return <p className="site00-expr-engine-maturity__loading">Loading maturity intelligence…</p>;
  if (!payload || !('maturity' in payload)) return null;

  const data = payload as ExpressionEngineMaturityPayload;
  const m = data.maturity;

  return (
    <section className="site00-expr-engine-maturity" data-visual-authority={data.visualAuthority}>
      <header>
        <h2>EXPRESSION ENGINE MATURITY</h2>
        <p>{data.engineVersion} · {data.benchmarkBriefCount} benchmark briefs · {data.benchmarkCoverage.categories} categories</p>
      </header>

      <dl className="site00-expr-engine-maturity__grid">
        <div><dt>CONCEPTUAL REASONING</dt><dd>{m.conceptualReasoningMedian}</dd></div>
        <div><dt>PACKAGE ARCHITECTURE</dt><dd>{m.packageArchitectureMedian}</dd></div>
        <div><dt>BRAND FIDELITY</dt><dd>{m.brandFidelityMedian}</dd></div>
        <div><dt>AUTONOMOUS JUDGMENT</dt><dd>{m.autonomousJudgmentMedian}</dd></div>
        <div><dt>FOUNDER RESCUE RATE</dt><dd>{data.founderRescueRate.ratePercent}%</dd></div>
        <div><dt>SELF-CRITIQUE ACCURACY</dt><dd>{data.selfCritiqueAccuracy.accuracyPercent}%</dd></div>
        <div><dt>OPERATIONAL 100</dt><dd>{m.operational100Eligible ? 'ELIGIBLE (large set required)' : 'NOT YET — need larger benchmark batch'}</dd></div>
      </dl>

      <article className="site00-expr-engine-maturity__golden">
        <h3>ENTRY 003 — EMPLOYEES ONLY</h3>
        <p>Decision: {data.entry003Golden.decision} · Score: {data.entry003Golden.overallScore}</p>
        <p>Mechanism: {data.entry003Golden.conceptProof.mechanism}</p>
        <p>Failures: {data.entry003Golden.failureClasses.join(' · ') || 'NONE'}</p>
        {onRunEntry003 ? (
          <button type="button" className="site00-v3-btn site00-v3-btn--outline" onClick={onRunEntry003}>
            RE-RUN ENTRY 003 JUDGMENT
          </button>
        ) : null}
      </article>

      <article className="site00-expr-engine-maturity__golden">
        <h3>NON-NDX — VERDANT ROW</h3>
        <p>Decision: {data.verdantRowGolden.decision} · NDX leak: {data.verdantRowGolden.crossBrandLeak?.leaked ? 'YES' : 'NO'}</p>
      </article>

      {onSubmitJudgment ? (
        <footer className="site00-expr-engine-maturity__judgment">
          <h4>QUICK FOUNDER JUDGMENT</h4>
          <div className="site00-expr-engine-maturity__judgment-btns">
            {QUICK_JUDGMENTS.map((label) => (
              <button key={label} type="button" className="site00-v3-btn site00-v3-btn--ghost" onClick={() => onSubmitJudgment(label)}>
                {label.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </footer>
      ) : null}
    </section>
  );
}
