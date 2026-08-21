import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  anchorSpecimenType,
  COMMON_ANCHOR_LABELS,
  isTerritoryNativeSpecimen,
} from './compareAnchors';
import { renderTerritoryView, territoryRendererKeyFromIndex } from './TerritoryRendererRegistry';

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
  compositionBehavior?: string;
  rendererKey?: string;
  strengths: string[];
  risks: string[];
  specimens: Array<{ id: string; specimenType: string; title: string; status: string; renderSpec?: Record<string, unknown> }>;
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
      evolveRecommendation: { territoryId: string; rationale: string; isApproval?: boolean };
    };
    visualDna: { status: string };
    page001Gate: { productionEligible: boolean; blockedReason: string | null };
    founderDecision: Record<string, unknown> | null;
    /** Brand Lore readiness gate (XXXI) — no org, including NDX BOOK, bypasses this. */
    brandLoreReadiness?: {
      state: 'CONTEXT_INCOMPLETE' | 'CONTEXT_PARTIAL' | 'CORE_DIRECTION_READY';
      blocked: boolean;
      message: string | null;
      missingDomains: string[];
    } | null;
  };
  meta: { visualDnaStatus: string };
  page001: { topic: string; productionStarted: boolean } | null;
};

export type CreativeDirectionDecisionInput = {
  type: 'APPROVE' | 'REFINE' | 'HYBRIDIZE' | 'REJECT';
  selectedTerritoryId?: string;
  refinementNotes?: string;
  hybridSelections?: Array<{ territoryId: string; elements: string[] }>;
  rejectedTerritoryIds?: string[];
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
  /** Rendered inside the readiness banner when Brand Lore context is incomplete (XXXV). */
  calibrationLink?: ReactNode;
};

function specimenForAnchor(
  territory: CreativeDirectionTerritory,
  anchorKey: (typeof COMMON_ANCHOR_LABELS)[number]['key'],
) {
  const type = anchorSpecimenType(anchorKey, territory.index);
  return (
    territory.specimens.find((s) => s.specimenType === type) ?? {
      id: `${territory.id}-${type}`,
      specimenType: type,
      title: type.replace(/_/g, ' ').toUpperCase(),
      status: 'SPEC_RENDERED',
    }
  );
}

function renderOptions(structuralDiffMode: boolean) {
  return {
    structuralDiffMode,
    grayscale: structuralDiffMode,
    hideLabels: structuralDiffMode,
  };
}

export function CreativeDirectionExperience({
  orgSlug,
  api,
  backLink,
  adminFooter,
  calibrationLink,
}: CreativeDirectionExperienceProps) {
  const [payload, setPayload] = useState<CreativeDirectionPayload | null>(null);
  const [activeTerritory, setActiveTerritory] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [structuralDiffMode, setStructuralDiffMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refinementNotes, setRefinementNotes] = useState('');
  const [hybridPrimaryIdx, setHybridPrimaryIdx] = useState(0);
  const [hybridSecondaryIdx, setHybridSecondaryIdx] = useState(1);
  const [hybridKeep, setHybridKeep] = useState('');
  const [hybridRemove, setHybridRemove] = useState('');
  const [showHybridPanel, setShowHybridPanel] = useState(false);

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
    const primary = payload.engagement.territories[hybridPrimaryIdx] ?? payload.engagement.territories[activeTerritory];
    const secondary = payload.engagement.territories[hybridSecondaryIdx];
    setBusy(type);
    try {
      const hybridNotes = [hybridKeep && `KEEP: ${hybridKeep}`, hybridRemove && `REMOVE: ${hybridRemove}`, refinementNotes]
        .filter(Boolean)
        .join('\n');
      await api.submitDecision(orgSlug, {
        type,
        selectedTerritoryId: type === 'HYBRIDIZE' ? primary?.id : (payload.engagement.territories[activeTerritory]?.id),
        refinementNotes: type === 'REFINE' || type === 'HYBRIDIZE' ? hybridNotes || refinementNotes : undefined,
        hybridSelections:
          type === 'HYBRIDIZE' && secondary
            ? [{ territoryId: secondary.id, elements: hybridKeep.split(',').map((s) => s.trim()).filter(Boolean) }]
            : undefined,
      });
      setShowHybridPanel(false);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DECISION FAILED');
    } finally {
      setBusy(null);
    }
  };

  const territory = payload?.engagement.territories[activeTerritory];
  const renderOpts = renderOptions(structuralDiffMode);

  return (
    <div className={`site00-cd ${structuralDiffMode ? 'site00-cd--structural-diff' : ''}`.trim()}>
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

      {payload?.engagement.brandLoreReadiness?.blocked ? (
        <section className="site00-cd__readiness-banner" role="status">
          <p className="site00-cd__readiness-banner-title">
            {payload.engagement.brandLoreReadiness.state === 'CONTEXT_PARTIAL'
              ? 'WE KNOW PART OF THE STORY.'
              : 'ONE MORE THING BEFORE WE DECIDE WHAT THIS LOOKS LIKE.'}
          </p>
          <p className="site00-cd__readiness-banner-body">
            WE NEED A LITTLE MORE OF THE WORLD BEHIND {orgSlug.toUpperCase()} BEFORE CREATIVE DIRECTION CAN BE
            APPROVED. THE DIRECTIONS BELOW ARE A PREVIEW ONLY — NOT YET READY FOR A FOUNDER DECISION.
          </p>
          {calibrationLink}
        </section>
      ) : null}

      {payload && !loading ? (
        <>
          {!structuralDiffMode ? (
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
            </>
          ) : null}

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
                  {structuralDiffMode ? `CANVAS ${t.index}` : `DIRECTION 0${t.index}`}
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
            <label className="site00-cd__structural-toggle">
              <input
                type="checkbox"
                checked={structuralDiffMode}
                onChange={(e) => setStructuralDiffMode(e.target.checked)}
              />
              STRUCTURAL DIFFERENTIATION
            </label>
          </div>

          {compareMode ? (
            <section className="site00-cd__compare" aria-label="Territory comparison">
              {!structuralDiffMode ? (
                <>
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
                </>
              ) : null}

              <h3 className="site00-cd__section-title">COMMON ANCHORS</h3>
              <div className="site00-cd__anchor-grid">
                {COMMON_ANCHOR_LABELS.map((anchor) => (
                  <div key={anchor.key} className="site00-cd__anchor-row">
                    {!structuralDiffMode ? <p className="site00-cd__anchor-label">{anchor.label}</p> : null}
                    <div className="site00-cd__anchor-cols">
                      {payload.engagement.territories.map((t) => {
                        const spec = specimenForAnchor(t, anchor.key);
                        return (
                          <div key={t.id} className="site00-cd__anchor-col" data-renderer={territoryRendererKeyFromIndex(t.index)}>
                            {!structuralDiffMode ? <p className="site00-cd__anchor-territory">{t.name}</p> : null}
                            {renderTerritoryView(t.index, {
                              specimens: [{ ...spec, title: anchor.label }],
                              options: renderOpts,
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="site00-cd__section-title">TERRITORY-NATIVE SPECIMENS</h3>
              <div className="site00-cd__native-compare">
                {payload.engagement.territories.map((t) => {
                  const native = t.specimens.filter((s) => isTerritoryNativeSpecimen(s.specimenType, t.index));
                  return (
                    <div key={t.id} className="site00-cd__native-col" data-renderer={territoryRendererKeyFromIndex(t.index)}>
                      {!structuralDiffMode ? <p className="site00-cd__native-title">{t.name}</p> : null}
                      {renderTerritoryView(t.index, { specimens: native.slice(0, 6), options: renderOpts })}
                    </div>
                  );
                })}
              </div>

              {structuralDiffMode ? (
                <div className="site00-cd__structural-diff-note">
                  <p>Headlines hidden · color normalized · identify territories by composition alone</p>
                </div>
              ) : null}
            </section>
          ) : territory ? (
            <section className="site00-cd__territory">
              {!structuralDiffMode ? (
                <div className="site00-cd__territory-copy">
                  <h2 className="site00-cd__territory-name">{territory.name}</h2>
                  <p className="site00-cd__thesis">{territory.thesis}</p>
                  <p>{territory.strategicRationale}</p>
                  <p className="site00-cd__character">{territory.emotionalCharacter}</p>
                  {territory.compositionBehavior ? (
                    <p className="site00-cd__composition">{territory.compositionBehavior}</p>
                  ) : null}
                  <h3>STRENGTHS</h3>
                  <ul>{territory.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
                  <h3>RISKS</h3>
                  <ul>{territory.risks.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
              ) : null}
              <div className="site00-cd__specimens site00-cd__specimens--territory-view">
                {renderTerritoryView(territory.index, {
                  specimens: territory.specimens.map((s) => ({
                    ...s,
                    title: s.title ?? s.specimenType.replace(/_/g, ' ').toUpperCase(),
                  })),
                  options: renderOpts,
                })}
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
            {showHybridPanel ? (
              <div className="site00-cd__hybrid-panel">
                <h3>HYBRIDIZE CONTRACT</h3>
                <label>
                  PRIMARY TERRITORY
                  <select value={hybridPrimaryIdx} onChange={(e) => setHybridPrimaryIdx(Number(e.target.value))}>
                    {payload.engagement.territories.map((t, i) => (
                      <option key={t.id} value={i}>{t.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  SECONDARY TERRITORY
                  <select value={hybridSecondaryIdx} onChange={(e) => setHybridSecondaryIdx(Number(e.target.value))}>
                    {payload.engagement.territories.map((t, i) => (
                      <option key={t.id} value={i}>{t.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  ELEMENTS TO KEEP (comma-separated)
                  <input type="text" value={hybridKeep} onChange={(e) => setHybridKeep(e.target.value)} placeholder="typography, motion, index taxonomy" />
                </label>
                <label>
                  ELEMENTS TO REMOVE (comma-separated)
                  <input type="text" value={hybridRemove} onChange={(e) => setHybridRemove(e.target.value)} placeholder="palette-only traits" />
                </label>
                <button type="button" disabled={!!busy} onClick={() => void submitDecision('HYBRIDIZE')}>RECORD HYBRID CONTRACT</button>
              </div>
            ) : null}
            <div className="site00-cd__decision-actions">
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('APPROVE')}>APPROVE DIRECTION</button>
              <button type="button" disabled={!!busy} onClick={() => void submitDecision('REFINE')}>REFINE DIRECTION</button>
              <button type="button" disabled={!!busy} onClick={() => { setShowHybridPanel(true); }}>HYBRIDIZE</button>
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
