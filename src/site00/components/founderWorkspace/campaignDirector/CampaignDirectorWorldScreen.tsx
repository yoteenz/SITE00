import { useState } from 'react';
import type {
  CampaignWorldCandidate,
  WorldGenesisResult,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';
import { runCreativeReductionPass } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/creativeReductionPass.js';
import type { CreativeReductionPass } from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/conceptualEfficiencyTypes.js';

type Props = {
  genesis: WorldGenesisResult;
  selected: CampaignWorldCandidate | null;
  onSelect: (c: CampaignWorldCandidate) => void;
  onApprove: (c: CampaignWorldCandidate) => void;
  brandSlug: string;
  filterMode?: 'ALL' | 'HIGH_CONCEPT_LOW_COMPLEXITY';
};

function efficiencyChip(label: string, value: string, tone: 'high' | 'medium' | 'low') {
  return (
    <span className={`site00-campaign-director__chip site00-campaign-director__chip--${tone}`} key={label}>
      {label}: {value}
    </span>
  );
}

function WorldCard({ c, selected, onSelect }: { c: CampaignWorldCandidate; selected: boolean; onSelect: () => void }) {
  const e = c.efficiencyEnrichment;
  const interaction = e?.interactionBridge.interactionPoint ?? c.humanExpression.hands[0] ?? c.humanExpression.hair[0] ?? 'ACTION';
  const yieldLabel = c.conceptualYield.classification.replace(/_/g, ' ');
  const effLabel = e?.conceptualEfficiency.classification.replace(/_/g, ' ') ?? '—';
  const prodLabel = e?.productionComplexity.level ?? '—';

  return (
    <button
      type="button"
      className={`site00-campaign-director__world-card${selected ? ' site00-campaign-director__world-card--selected' : ''}`}
      onClick={onSelect}
      data-tier={c.tier}
    >
      <span className="site00-campaign-director__world-tier">{c.tier.replace('_', ' ')}</span>
      <h3>{c.coreConcept}</h3>
      <p className="site00-campaign-director__world-setting">{c.setting}</p>
      <p className="site00-campaign-director__world-interaction">
        Interaction: {interaction} — {e?.interactionBridge.requiredAction ?? 'behavior-led'}
      </p>
      <p className="site00-campaign-director__world-oneline">{c.whyItWorks.split('.')[0]}.</p>
      <div className="site00-campaign-director__world-chips">
        {efficiencyChip('Yield', yieldLabel.includes('HIGH') ? 'HIGH' : 'MED', yieldLabel.includes('HIGH') ? 'high' : 'medium')}
        {efficiencyChip('Efficiency', effLabel.includes('HIGH') ? 'HIGH' : 'MED', effLabel.includes('HIGH') ? 'high' : 'medium')}
        {efficiencyChip('Production', prodLabel, prodLabel === 'LOW' ? 'high' : prodLabel === 'EXTREME' ? 'low' : 'medium')}
      </div>
      <div className="site00-campaign-director__world-tags">
        {c.motifs.slice(0, 3).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </button>
  );
}

export function CampaignDirectorWorldScreen({
  genesis,
  selected,
  onSelect,
  onApprove,
  brandSlug,
  filterMode = 'ALL',
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [reduction, setReduction] = useState<CreativeReductionPass | null>(null);

  let tierCards = [genesis.safe, genesis.fresh, genesis.wildCard].filter(Boolean) as CampaignWorldCandidate[];
  if (filterMode === 'HIGH_CONCEPT_LOW_COMPLEXITY') {
    tierCards = tierCards.filter(
      (c) => c.efficiencyEnrichment?.conceptValueRatio.quadrant === 'HIGH_YIELD_HIGH_EFFICIENCY',
    );
    if (!tierCards.length) {
      tierCards = genesis.candidates
        .filter((c) => (c.efficiencyEnrichment?.conceptualEfficiency.overall ?? 0) >= 0.65)
        .slice(0, 3);
    }
  }

  const handleReduce = () => {
    if (!selected) return;
    setReduction(runCreativeReductionPass({ candidate: selected }));
  };

  const leap = selected?.efficiencyEnrichment?.creativeLeapTrace;

  return (
    <section className="site00-campaign-director__screen">
      <h2>CAMPAIGN WORLD GENESIS · {brandSlug.toUpperCase()}</h2>
      <p className="site00-campaign-director__screen-lead">
        Lateral worlds through natural product interaction — high yield, high efficiency preferred.
      </p>

      <div className="site00-campaign-director__world-grid">
        {(tierCards.length ? tierCards : genesis.candidates.slice(0, 3)).map((c) => (
          <WorldCard key={c.candidateId} c={c} selected={selected?.candidateId === c.candidateId} onSelect={() => onSelect(c)} />
        ))}
      </div>

      {selected ? (
        <div className="site00-campaign-director__world-detail">
          <h3>{selected.campaignTitleLanguage}</h3>
          <p>{selected.whyItWorks}</p>

          {leap ? (
            <>
              <h4>CREATIVE LEAP</h4>
              <ol className="site00-campaign-director__leap-trace">
                {leap.steps.map((s) => (
                  <li key={s.stage}>
                    <strong>{s.stage}</strong> → {s.value}
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          <button type="button" className="site00-campaign-director__btn-secondary" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'HIDE DETAILS' : 'VIEW DETAILS'}
          </button>

          {showDetails && selected.efficiencyEnrichment ? (
            <div className="site00-campaign-director__score-detail">
              <p>Brand fit {Math.round(selected.brandFit * 100)}%</p>
              <p>Natural visibility {Math.round(selected.efficiencyEnrichment.naturalProductVisibility.overall * 100)}%</p>
              <p>World distance {selected.efficiencyEnrichment.worldDistance}</p>
              <p>Quadrant {selected.efficiencyEnrichment.conceptValueRatio.quadrant.replace(/_/g, ' ')}</p>
              {selected.efficiencyEnrichment.minimalExecution ? (
                <p>
                  Micro reel: {selected.efficiencyEnrichment.minimalExecution.durationSeconds}s ·{' '}
                  {selected.efficiencyEnrichment.minimalExecution.shotCount} shot(s)
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="site00-campaign-director__reduction-block">
            <p className="site00-campaign-director__reduction-q">CAN THIS IDEA BE SAID WITH LESS?</p>
            <button type="button" className="site00-campaign-director__btn-secondary" onClick={handleReduce}>
              REDUCE EXECUTION
            </button>
            {reduction ? (
              <ul className="site00-campaign-director__reduction-list">
                {reduction.items
                  .filter((i) => i.recommendation !== 'KEEP')
                  .map((i) => (
                    <li key={i.element}>
                      {i.recommendation}: {i.element} ({i.elementType})
                    </li>
                  ))}
                <li>
                  <em>Concept after reduction: {reduction.conceptStrengthAfter}</em>
                </li>
              </ul>
            ) : null}
          </div>

          <button type="button" className="site00-campaign-director__btn-primary" onClick={() => onApprove(selected)}>
            APPROVE WORLD
          </button>
        </div>
      ) : null}
    </section>
  );
}
