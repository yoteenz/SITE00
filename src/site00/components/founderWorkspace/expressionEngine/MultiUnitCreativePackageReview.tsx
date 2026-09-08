/**
 * C1.6 — Multi-unit creative package founder review (generic, non-NDXBOOK).
 */

import { useState } from 'react';

type UnitCard = {
  unitId: string;
  medium: string;
  role: { campaignRole: string };
  initialDirection: string;
  finalDirection: string;
  mediumRationale: string;
  heroMoment: string;
  handoffOut: string;
  qualityTier: string;
  founderHandholdingRisk: string;
  reviewType: string;
  judgment: {
    firstAnswerChallenge: { resolution: string };
    challenger: { conceptName: string };
  };
};

export type MultiUnitCampaignReviewData = {
  brief: { brandName: string; campaignObjective: string };
  campaignResponsibility: {
    campaignThesis: string;
    audienceStartingBelief: string;
    audienceDesiredShift: string;
  };
  initialCampaignWinner: string;
  runtimeMode?: string;
  principlesApplied: string[];
  units: UnitCard[];
  packageJudgment: {
    campaignIdea: string;
    packageFirstAnswerChallenge: string;
    packageChallenger: string;
    finalCampaignDirection: string;
    campaignCreativeDNA: { coreTension: string };
    packageQualityTier: string;
    packageFounderHandholdingRisk: string;
    status: string;
  };
};

type Props = {
  campaign: MultiUnitCampaignReviewData | null;
};

function runtimeLabel(mode: string | undefined): string {
  if (mode === 'FULL_REASONING') return 'FULL REASONING';
  if (mode === 'HYBRID') return 'HYBRID';
  if (mode === 'FULL_REASONING_LIVE_TEST_BLOCKED') return 'FULL REASONING BLOCKED';
  return 'FALLBACK';
}

export function MultiUnitCreativePackageReview({ campaign }: Props) {
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  if (!campaign) return null;

  const pkg = campaign.packageJudgment;
  const majorUnits = campaign.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT');

  return (
    <section className="site00-expr-engine-panel site00-expr-engine-senior-review">
      <header className="site00-expr-engine-panel__head">
        <h2>MULTI-UNIT CREATIVE PACKAGE</h2>
        <span
          className={`site00-expr-engine-senior-review__tier site00-expr-engine-senior-review__tier--${pkg.packageQualityTier.toLowerCase()}`}
        >
          {pkg.packageQualityTier}
        </span>
        <span className="site00-expr-engine-senior-review__runtime">{runtimeLabel(campaign.runtimeMode)}</span>
      </header>

      <dl className="site00-expr-engine-senior-review__grid">
        <div>
          <dt>THE BRIEF</dt>
          <dd>
            {campaign.brief.brandName} — {campaign.brief.campaignObjective}
          </dd>
        </div>
        <div>
          <dt>CAMPAIGN THESIS</dt>
          <dd>{campaign.campaignResponsibility.campaignThesis}</dd>
        </div>
        <div>
          <dt>AUDIENCE SHIFT</dt>
          <dd>
            {campaign.campaignResponsibility.audienceStartingBelief} →{' '}
            {campaign.campaignResponsibility.audienceDesiredShift}
          </dd>
        </div>
        <div>
          <dt>CAMPAIGN IDEA</dt>
          <dd>{pkg.campaignIdea}</dd>
        </div>
        <div>
          <dt>INITIAL PACKAGE DIRECTION</dt>
          <dd>{campaign.initialCampaignWinner}</dd>
        </div>
        <div>
          <dt>PACKAGE CHALLENGE</dt>
          <dd>{pkg.packageFirstAnswerChallenge}</dd>
        </div>
        <div>
          <dt>PACKAGE CHALLENGER</dt>
          <dd>{pkg.packageChallenger}</dd>
        </div>
        <div>
          <dt>FINAL PACKAGE DIRECTION</dt>
          <dd>{pkg.finalCampaignDirection}</dd>
        </div>
        <div>
          <dt>CAMPAIGN DNA</dt>
          <dd>{pkg.campaignCreativeDNA.coreTension}</dd>
        </div>
        <div>
          <dt>PACKAGE HANDHOLDING</dt>
          <dd>{pkg.packageFounderHandholdingRisk}</dd>
        </div>
        <div>
          <dt>STATUS</dt>
          <dd>{pkg.status}</dd>
        </div>
      </dl>

      <h3 className="site00-expr-engine-senior-review__subhead">CONTENT SEQUENCE</h3>
      <div className="site00-expr-engine-senior-review__units">
        {majorUnits.map((unit) => (
          <article key={unit.unitId} className="site00-expr-engine-senior-review__unit-card">
            <button
              type="button"
              className="site00-expr-engine-senior-review__unit-toggle"
              onClick={() => setExpandedUnit(expandedUnit === unit.unitId ? null : unit.unitId)}
            >
              <strong>{unit.medium.replace(/_/g, ' ')}</strong> · {unit.role.campaignRole} · {unit.qualityTier}
            </button>
            <p>{unit.finalDirection.slice(0, 160)}</p>
            <p className="site00-expr-engine-senior-review__meta">
              Handholding: {unit.founderHandholdingRisk} · {unit.mediumRationale.slice(0, 80)}
            </p>
            {expandedUnit === unit.unitId ? (
              <dl className="site00-expr-engine-senior-review__grid site00-expr-engine-senior-review__grid--nested">
                <div>
                  <dt>INITIAL DIRECTION</dt>
                  <dd>{unit.initialDirection.slice(0, 120)}</dd>
                </div>
                <div>
                  <dt>CHALLENGE</dt>
                  <dd>{unit.judgment.firstAnswerChallenge.resolution}</dd>
                </div>
                <div>
                  <dt>CHALLENGER</dt>
                  <dd>{unit.judgment.challenger.conceptName}</dd>
                </div>
                <div>
                  <dt>HERO MOMENT</dt>
                  <dd>{unit.heroMoment}</dd>
                </div>
                <div>
                  <dt>HANDOFF</dt>
                  <dd>{unit.handoffOut}</dd>
                </div>
              </dl>
            ) : null}
          </article>
        ))}
      </div>

      {campaign.principlesApplied.length > 0 ? (
        <details className="site00-expr-engine-senior-review__details">
          <summary>CORRECTIONS APPLIED ({campaign.principlesApplied.length})</summary>
          <ul>
            {campaign.principlesApplied.map((p) => (
              <li key={p.slice(0, 40)}>{p}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
