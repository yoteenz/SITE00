import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { TerritorySpecimenCanvas } from '../../../admin/components/evolve/creative-direction/TerritorySpecimenCanvas';

export type CreativeDirectionTerritory = {
  id: string;
  index: number;
  name: string;
  thesis: string;
  strategicRationale: string;
  emotionalCharacter: string;
  visualPrinciples: string[];
  colorLogic: Record<string, string>;
  typographyLogic: Record<string, string>;
  strengths: string[];
  risks: string[];
  specimens: Array<{ id: string; specimenType: string; status: string; renderSpec: Record<string, unknown> }>;
  evolveAnalysis: Record<string, string>;
  lifecycleState: string;
};

export type CreativeDirectionPayload = {
  engagement: {
    lifecycle_state: string;
    knownIntelligence: Array<{ label: string; value: string }>;
    openQuestions: string[];
    creativeBrief: {
      mustCommunicate: string[];
      mustFeelLike: string[];
      mustNotFeelLike: string[];
      visualTensions: string[];
    };
    territories: CreativeDirectionTerritory[];
    comparison: {
      dimensions: string[];
      territories: Array<{ territoryId: string; name: string; ratings: Record<string, string> }>;
      evolveRecommendation: { territoryId: string; rationale: string };
    };
    visualDna: { status: string };
    page001Gate: { productionEligible: boolean; blockedReason: string | null };
    founderDecision: Record<string, unknown> | null;
  };
  meta: { visualDnaStatus: string };
  page001: { topic: string; productionStarted: boolean } | null;
};

export type CreativeDirectionDecisionInput = {
  type: 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
  selectedTerritoryId?: string;
  refinementNotes?: string;
};

export type CreativeDirectionApi = {
  load: (orgSlug: string) => Promise<CreativeDirectionPayload>;
  submitDecision: (orgSlug: string, input: CreativeDirectionDecisionInput) => Promise<void>;
};

type CreativeDirectionExperienceProps = {
  orgSlug: string;
  api: CreativeDirectionApi;
  backLink?: ReactNode;
  adminFooter?: ReactNode;
};

export function CreativeDirectionExperience({ orgSlug, api, backLink, adminFooter }: CreativeDirectionExperienceProps) {
  const [payload, setPayload] = useState<CreativeDirectionPayload | null>(null);
  const [activeTerritory, setActiveTerritory] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refinementNotes, setRefinementNotes] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.load(orgSlug);
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED TO LOAD CREATIVE DIRECTION');
    } finally {
      setLoading(false);
    }
  }, [api, orgSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submitDecision = async (type: CreativeDirectionDecisionInput['type']) => {
    if (!payload) return;
    const territory = payload.engagement.territories[activeTerritory];
    setBusy(type);
    try {
      await api.submitDecision(orgSlug, {
        type,
        selectedTerritoryId: territory?.id,
        refinementNotes: type === 'REFINE' ? refinementNotes : undefined,
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DECISION FAILED');
    } finally {
      setBusy(null);
    }
  };

  const territory = payload?.engagement.territories[activeTerritory];

  return (
    <div className="site00-cd">
      {backLink ? <nav className="site00-cd__back">{backLink}</nav> : null}

      <header className="site00-cd__hero">
        <p className="site00-cd__kicker">EVOLVE / CREATIVE DIRECTION</p>
        <h1 className="site00-cd__title">{orgSlug.toUpperCase()}</h1>
        <p className="site00-cd__headline">WE KNOW THE BRAND. NOW WE DECIDE WHAT IT LOOKS LIKE.</p>
        <p className="site00-cd__lifecycle">
          LIFECYCLE · {payload?.engagement.lifecycle_state ?? 'LOADING'}
          {payload?.engagement.visualDna.status ? ` · VISUAL DNA ${payload.engagement.visualDna.status}` : ''}
        </p>
      </header>

      {error ? <p className="site00-cd__error" role="alert">{error}</p> : null}
      {loading ? <p className="site00-cd__loading" aria-busy="true">SYNTHESIZING CREATIVE DIRECTION…</p> : null}

      {payload && !loading ? (
        <>
          <section className="site00-cd__briefing" aria-labelledby="cd-briefing">
            <div className="site00-cd__panel">
              <h2 id="cd-briefing" className="site00-cd__panel-title">KNOWN INTELLIGENCE</h2>
              <ul className="site00-cd__intel-list">
                {payload.engagement.knownIntelligence.slice(0, 10).map((item) => (
                  <li key={item.label}>
                    <span className="site00-cd__intel-label">{item.label}</span>
                    <span className="site00-cd__intel-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site00-cd__panel">
              <h2 className="site00-cd__panel-title">OPEN</h2>
              <ul className="site00-cd__open-list">
                {payload.engagement.openQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="site00-cd__brief" aria-labelledby="cd-creative-brief">
            <h2 id="cd-creative-brief" className="site00-cd__section-title">CREATIVE BRIEF · PROPOSED</h2>
            <div className="site00-cd__brief-grid">
              <div>
                <h3>MUST COMMUNICATE</h3>
                <ul>{payload.engagement.creativeBrief.mustCommunicate.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h3>MUST FEEL LIKE</h3>
                <ul>{payload.engagement.creativeBrief.mustFeelLike.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h3>MUST NOT FEEL LIKE</h3>
                <ul>{payload.engagement.creativeBrief.mustNotFeelLike.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h3>VISUAL TENSIONS</h3>
                <ul>{payload.engagement.creativeBrief.visualTensions.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
          </section>

          <div className="site00-cd__toolbar">
            <div className="site00-cd__tabs" role="tablist" aria-label="Creative territories">
              {payload.engagement.territories.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={!compareMode && activeTerritory === i}
                  className={`site00-cd__tab ${!compareMode && activeTerritory === i ? 'site00-cd__tab--active' : ''}`.trim()}
                  onClick={() => { setCompareMode(false); setActiveTerritory(i); }}
                >
                  DIRECTION 0{t.index}
                </button>
              ))}
              <button
                type="button"
                className={`site00-cd__tab ${compareMode ? 'site00-cd__tab--active' : ''}`.trim()}
                onClick={() => setCompareMode(true)}
              >
                COMPARE
              </button>
            </div>
          </div>

          {compareMode ? (
            <section className="site00-cd__compare" aria-label="Territory comparison">
              <table className="site00-cd__compare-table">
                <thead>
                  <tr>
                    <th>DIMENSION</th>
                    {payload.engagement.comparison.territories.map((t) => (
                      <th key={t.territoryId}>{t.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payload.engagement.comparison.dimensions.map((dim) => (
                    <tr key={dim}>
                      <td>{dim.replace(/_/g, ' ')}</td>
                      {payload.engagement.comparison.territories.map((t) => (
                        <td key={t.territoryId}>{t.ratings[dim] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="site00-cd__recommendation">
                <p className="site00-cd__recommendation-label">EVOLVE ANALYSIS · NOT APPROVAL</p>
                <p>{payload.engagement.comparison.evolveRecommendation.rationale}</p>
              </div>
            </section>
          ) : territory ? (
            <section className="site00-cd__territory">
              <div className="site00-cd__territory-copy">
                <h2 className="site00-cd__territory-name">{territory.name}</h2>
                <p className="site00-cd__thesis">{territory.thesis}</p>
                <p>{territory.strategicRationale}</p>
                <p className="site00-cd__character">{territory.emotionalCharacter}</p>
                <h3>STRENGTHS</h3>
                <ul>{territory.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
                <h3>RISKS</h3>
                <ul>{territory.risks.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div className="site00-cd__specimens">
                {territory.specimens.slice(0, 6).map((spec) => (
                  <figure key={spec.id} className="site00-cd-specimen">
                    <TerritorySpecimenCanvas
                      specimenType={spec.specimenType}
                      palette={territory.colorLogic}
                      displayFont={String(territory.typographyLogic.display ?? 'NDXBOOK')}
                      territoryName={territory.name}
                      index={territory.index}
                    />
                    <figcaption>
                      {spec.specimenType.replace(/_/g, ' ').toUpperCase()} · {spec.status}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <section className="site00-cd__decision" aria-labelledby="cd-founder-decision">
            <h2 id="cd-founder-decision" className="site00-cd__section-title">FOUNDER DECISION</h2>
            <p className="site00-cd__decision-note">Recommendation ≠ approval. Visual DNA promotes only on APPROVE.</p>
            <textarea
              className="site00-cd__refine-input"
              placeholder="Refinement notes (optional)"
              value={refinementNotes}
              onChange={(e) => setRefinementNotes(e.target.value)}
              rows={2}
            />
            <div className="site00-cd__decision-actions">
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('APPROVE')}>APPROVE DIRECTION</button>
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('REFINE')}>REFINE DIRECTION</button>
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('HYBRIDIZE')}>HYBRIDIZE</button>
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('REJECT')}>REJECT</button>
            </div>
          </section>

          {payload.page001 ? (
            <section className="site00-cd__gate">
              <h2 className="site00-cd__section-title">PAGE 001 READINESS GATE</h2>
              <p>Topic: {payload.page001.topic} · Production started: {payload.page001.productionStarted ? 'YES' : 'NO'}</p>
              <p>{payload.engagement.page001Gate.blockedReason ?? 'Eligible for next production phase'}</p>
            </section>
          ) : null}

          {adminFooter ? <footer className="site00-cd__footer">{adminFooter}</footer> : null}
        </>
      ) : null}
    </div>
  );
}
