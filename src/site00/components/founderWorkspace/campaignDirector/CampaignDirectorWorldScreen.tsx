import type {
  CampaignWorldCandidate,
  WorldGenesisResult,
} from '../../../../../shared/site00-expression-engine/campaign-genesis-orchestration/types.js';

type Props = {
  genesis: WorldGenesisResult;
  selected: CampaignWorldCandidate | null;
  onSelect: (c: CampaignWorldCandidate) => void;
  onApprove: (c: CampaignWorldCandidate) => void;
  brandSlug: string;
};

function WorldCard({ c, selected, onSelect }: { c: CampaignWorldCandidate; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`site00-campaign-director__world-card${selected ? ' site00-campaign-director__world-card--selected' : ''}`} onClick={onSelect} data-tier={c.tier}>
      <span className="site00-campaign-director__world-tier">{c.tier.replace('_', ' ')}</span>
      <h3>{c.coreConcept}</h3>
      <p className="site00-campaign-director__world-setting">{c.setting}</p>
      <p className="site00-campaign-director__world-yield">
        Yield {Math.round(c.conceptualYield.overall * 100)}% · {c.conceptualYield.classification.replace(/_/g, ' ')}
      </p>
      <div className="site00-campaign-director__world-tags">
        {c.motifs.slice(0, 3).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <p className="site00-campaign-director__world-chain">{c.associationChain.connectiveLogic}</p>
    </button>
  );
}

export function CampaignDirectorWorldScreen({ genesis, selected, onSelect, onApprove, brandSlug }: Props) {
  const tierCards = [genesis.safe, genesis.fresh, genesis.wildCard].filter(Boolean) as CampaignWorldCandidate[];

  return (
    <section className="site00-campaign-director__screen">
      <h2>CAMPAIGN WORLD GENESIS · {brandSlug.toUpperCase()}</h2>
      <p className="site00-campaign-director__screen-lead">Select a high-yield world — association chain drives everything downstream.</p>

      <div className="site00-campaign-director__world-grid">
        {(tierCards.length ? tierCards : genesis.candidates.slice(0, 3)).map((c) => (
          <WorldCard key={c.candidateId} c={c} selected={selected?.candidateId === c.candidateId} onSelect={() => onSelect(c)} />
        ))}
      </div>

      {selected ? (
        <div className="site00-campaign-director__world-detail">
          <h3>{selected.campaignTitleLanguage}</h3>
          <p>{selected.whyItWorks}</p>
          <h4>ASSOCIATION CHAIN</h4>
          <ol>
            {selected.associationChain.links.map((l) => (
              <li key={l.term}>
                <strong>{l.term}</strong> ({l.distance}) — {l.rationale}
              </li>
            ))}
          </ol>
          <h4>HUMAN EXPRESSION</h4>
          <ul>
            {selected.humanExpression.hair.map((h) => (
              <li key={h}>Hair: {h}</li>
            ))}
            {selected.humanExpression.nails.map((n) => (
              <li key={n}>Nails: {n}</li>
            ))}
            {selected.humanExpression.hands.map((h) => (
              <li key={h}>Hands: {h}</li>
            ))}
          </ul>
          <button type="button" className="site00-campaign-director__btn-primary" onClick={() => onApprove(selected)}>
            APPROVE WORLD
          </button>
        </div>
      ) : null}
    </section>
  );
}
