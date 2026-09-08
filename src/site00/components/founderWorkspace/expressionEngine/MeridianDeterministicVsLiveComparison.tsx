/**
 * C1.9R1 — Side-by-side Meridian deterministic vs FULL_REASONING comparison.
 */

import { useState } from 'react';
import type { MultiUnitCampaignReviewData } from './MultiUnitCreativePackageReview.js';

export type MeridianComparisonViewData = {
  sprint: string;
  capabilityStatus: string;
  fullReasoningBlocked: boolean;
  blockReason?: string;
  briefVerified: boolean;
  sameBriefHash: string;
  comparison: {
    overallJudgment: string;
    materialImprovement: boolean;
    whatChanged: string[];
    whyItChanged: string[];
    whatFullReasoningChallenged: string[];
    whatItKept: string[];
    recommendation: string;
    dimensions: Array<{ dimension: string; control: string; fullReasoning: string; delta: string }>;
  };
  controlRun: {
    runId: string;
    label: string;
    campaign: MultiUnitCampaignReviewData;
  };
  fullReasoningRun: {
    runId: string;
    label: string;
    campaign: MultiUnitCampaignReviewData;
  } | null;
  runtimeReceipt: {
    providerName: string;
    model: string;
    runtimeMode: string;
    providerAvailable: boolean;
    creativeReasoningDispatchCount: number;
    copyReasoningDispatchCount: number;
    totalDispatchCount: number;
    healthCheckStatus: string;
  };
  heroLineCandidates: { control: string[]; full: string[] };
  brandRhetoricalSignature?: { description: string };
  founderJudgment?: string;
  comparisonId?: string;
};

type Props = {
  data: MeridianComparisonViewData | null;
  onFounderJudgment?: (judgment: string, comparisonId?: string) => void;
  judging?: boolean;
};

function UnitSummary({ campaign, label }: { campaign: MultiUnitCampaignReviewData | null; label: string }) {
  if (!campaign) {
    return (
      <div className="site00-meridian-compare__panel site00-meridian-compare__panel--blocked">
        <h3>{label}</h3>
        <p>FULL_REASONING not executed — provider unavailable or zero dispatch.</p>
      </div>
    );
  }

  const pkg = campaign.packageJudgment;
  const copy = campaign.copyPackage;

  return (
    <div className="site00-meridian-compare__panel">
      <h3>{label}</h3>
      <p className="site00-meridian-compare__runtime">{campaign.runtimeMode ?? 'FALLBACK'}</p>
      <dl className="site00-meridian-compare__dl">
        <div>
          <dt>CAMPAIGN IDEA</dt>
          <dd>{pkg.campaignIdea}</dd>
        </div>
        <div>
          <dt>FINAL DIRECTION</dt>
          <dd>{pkg.finalCampaignDirection}</dd>
        </div>
        <div>
          <dt>QUALITY</dt>
          <dd>{pkg.packageQualityTier}</dd>
        </div>
        <div>
          <dt>HANDHOLDING</dt>
          <dd>{pkg.packageFounderHandholdingRisk}</dd>
        </div>
      </dl>
      {copy ? (
        <ul className="site00-meridian-compare__units">
          {copy.unitCopyDirections
            .filter((u) => u.medium !== 'LIGHTWEIGHT_CRAFT_REVIEW')
            .map((u) => (
              <li key={u.unitId}>
                <strong>{u.medium}</strong>
                <p>{u.finalCaption || u.primaryCaption}</p>
                {u.copyPackage?.ctaCopy ? (
                  <span className="site00-meridian-compare__cta">{u.copyPackage.ctaCopy}</span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

export function MeridianDeterministicVsLiveComparison({ data, onFounderJudgment, judging }: Props) {
  const [showDiff, setShowDiff] = useState(true);

  if (!data) {
    return <p className="site00-meridian-compare__loading">Loading Meridian comparison…</p>;
  }

  return (
    <section className="site00-meridian-compare" data-visual-reconstruction="meridian-c19r1-comparison">
      <header className="site00-meridian-compare__head">
        <p className="site00-meridian-compare__eyebrow">MERIDIAN ATELIER · NOCTURNE PARFUM LAUNCH</p>
        <h2>DETERMINISTIC vs FULL REASONING</h2>
        <span className="site00-meridian-compare__status">{data.capabilityStatus.replace(/_/g, ' ')}</span>
      </header>

      <div className="site00-meridian-compare__receipt">
        <span>{data.runtimeReceipt.providerName}</span>
        <span>{data.runtimeReceipt.model}</span>
        <span>{data.runtimeReceipt.healthCheckStatus}</span>
        <span>
          DISPATCH {data.runtimeReceipt.totalDispatchCount} (creative {data.runtimeReceipt.creativeReasoningDispatchCount}{' '}
          · copy {data.runtimeReceipt.copyReasoningDispatchCount})
        </span>
      </div>

      {data.fullReasoningBlocked && data.blockReason ? (
        <div className="site00-meridian-compare__banner" role="alert">
          <strong>FULL_REASONING_LIVE_TEST_BLOCKED</strong>
          <p>{data.blockReason}</p>
        </div>
      ) : null}

      <div className="site00-meridian-compare__grid">
        <UnitSummary campaign={data.controlRun.campaign} label="CONTROL A · DETERMINISTIC" />
        <UnitSummary
          campaign={data.fullReasoningRun?.campaign ?? null}
          label="FULL REASONING B · LIVE"
        />
      </div>

      {showDiff ? (
        <div className="site00-meridian-compare__diff">
          <h3>WHAT CHANGED</h3>
          <ul>
            {data.comparison.whatChanged.length ? (
              data.comparison.whatChanged.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No material surface changes detected</li>
            )}
          </ul>
          <h3>WHY IT CHANGED</h3>
          <ul>
            {data.comparison.whyItChanged.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>WHAT FULL REASONING CHALLENGED</h3>
          <ul>
            {data.comparison.whatFullReasoningChallenged.length ? (
              data.comparison.whatFullReasoningChallenged.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>—</li>
            )}
          </ul>
          <h3>OVERALL JUDGMENT</h3>
          <p className="site00-meridian-compare__judgment">{data.comparison.overallJudgment.replace(/_/g, ' ')}</p>
          <p>{data.comparison.recommendation}</p>
        </div>
      ) : null}

      <button type="button" className="site00-meridian-compare__toggle" onClick={() => setShowDiff((v) => !v)}>
        {showDiff ? 'HIDE DIFF' : 'SHOW DIFF'}
      </button>

      <div className="site00-meridian-compare__hero-lines">
        <h3>HERO LINE CANDIDATES</h3>
        <div className="site00-meridian-compare__hero-cols">
          <div>
            <h4>CONTROL</h4>
            <ul>
              {data.heroLineCandidates.control.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {data.heroLineCandidates.full.length ? (
            <div>
              <h4>FULL REASONING</h4>
              <ul>
                {data.heroLineCandidates.full.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {data.brandRhetoricalSignature ? (
        <p className="site00-meridian-compare__signature">
          BRAND RHETORICAL SIGNATURE: {data.brandRhetoricalSignature.description}
        </p>
      ) : null}

      {onFounderJudgment ? (
        <div className="site00-meridian-compare__actions">
          <p className="site00-meridian-compare__actions-label">FOUNDER JUDGMENT</p>
          {data.founderJudgment && data.founderJudgment !== 'UNREVIEWED' ? (
            <p className="site00-meridian-compare__chosen">Recorded: {data.founderJudgment.replace(/_/g, ' ')}</p>
          ) : null}
          {(['FULL_REASONING_WINS', 'DETERMINISTIC_WINS', 'HYBRIDIZE', 'NEITHER', 'PUSH_FURTHER'] as const).map(
            (action) => (
              <button
                key={action}
                type="button"
                disabled={judging}
                onClick={() => onFounderJudgment(action, data.comparisonId)}
              >
                {action.replace(/_/g, ' ')}
              </button>
            ),
          )}
        </div>
      ) : null}
    </section>
  );
}
