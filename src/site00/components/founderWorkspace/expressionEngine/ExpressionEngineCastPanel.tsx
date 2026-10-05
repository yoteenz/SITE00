/**
 * CAST stage — character slots + catalogue browse (no provider dispatch on mount).
 */

import { useMemo, useState } from 'react';
import type { NarrativeMomentumPlan } from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import {
  buildEntry002ProductionCastState,
  entry002CastProof,
  evaluateCastGate,
  getStudioWorldActorCatalogue,
  recommendActorsForCharacter,
} from '../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import type { ProductionCastState } from '../../../../../shared/site00-studio-world/acting-catalogue/types.js';
import { StudioWorldActingCataloguePanel } from './StudioWorldActingCataloguePanel.js';
import '../../../styles/site00-cast-stage.css';

type Props = {
  plan: NarrativeMomentumPlan | null;
  onGoToCatalogue?: () => void;
};

export function ExpressionEngineCastPanel({ plan }: Props) {
  const [showCatalogue, setShowCatalogue] = useState(false);
  const castState: ProductionCastState = useMemo(() => {
    if (plan?.entryId === 'entry-002') return buildEntry002ProductionCastState();
    return buildEntry002ProductionCastState();
  }, [plan?.entryId]);

  const gate = useMemo(() => evaluateCastGate(castState), [castState]);
  const lockedCount = castState.characters.filter((c) => c.status === 'LOCKED').length;
  const requiredHero = castState.requirements.filter(
    (r) => r.screenImportance === 'HERO' || r.screenImportance === 'SUPPORTING',
  ).length;

  const recommendations = useMemo(() => {
    if (!plan) return [];
    const openReq = castState.requirements.find((r) => r.requirementId.includes('commenter'));
    if (!openReq) return [];
    return recommendActorsForCharacter({
      requirement: openReq,
      brand: plan.projectId,
      project: plan.projectId,
      creativeTerritory: plan.creativeTerritoryLabel,
      narrativePlan: plan,
      previousActorUsage: [],
    });
  }, [castState.requirements, plan]);

  const proof = entry002CastProof(castState);

  return (
    <section className="site00-cast-stage" data-testid="expression-engine-cast-stage">
      <header className="site00-cast-stage__masthead">
        <div>
          <h2 className="site00-cast-stage__title">Studio World · Cast</h2>
          <p className="site00-expr-engine-panel__meta">
            Actor ≠ Character ≠ Campaign Look · provider dispatch {castState.providerDispatchCount}
          </p>
        </div>
        <div className="site00-cast-stage__stats">
          <span data-testid="cast-required-count">CAST REQUIRED: {castState.requirements.length}</span>
          <span data-testid="cast-locked-count">
            CAST: {lockedCount} / {castState.requirements.length} LOCKED
          </span>
          <span data-testid="cast-gate-status">{gate.allRequiredCharactersLocked ? 'CAST GATE OPEN' : 'CAST_GATE_BLOCKED'}</span>
        </div>
      </header>

      <div className="site00-cast-stage__slots">
        {castState.characters.map((character, index) => {
          const req = castState.requirements.find((r) => r.requirementId === character.castingRequirementId);
          return (
            <article key={character.characterId} className="site00-cast-slot" data-testid={`cast-slot-${index + 1}`}>
              <div className="site00-cast-slot__index">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <p className="site00-cast-slot__role">{req?.narrativeRole ?? character.narrativeRole}</p>
                <h3 className="site00-cast-slot__name">{character.characterName}</h3>
                <p className="site00-cast-slot__role">{character.screenImportance}</p>
                <p
                  className={`site00-cast-slot__cast-id${character.actorId ? ' site00-cast-slot__cast-id--locked' : ' site00-cast-slot__cast-id--open'}`}
                >
                  {character.actorId ?
                    `CAST: ${getStudioWorldActorCatalogue().actors.find((a) => a.actorId === character.actorId)?.catalogueNumber ?? character.actorId}`
                  : 'UNCAST'}
                </p>
              </div>
              <div className="site00-cast-slot__actions">
                <button type="button" className="site00-cast-slot__btn" onClick={() => setShowCatalogue(true)}>
                  Browse actors
                </button>
                <button type="button" className="site00-cast-slot__btn">
                  View character sheet
                </button>
                <button type="button" className="site00-cast-slot__btn" disabled={character.status === 'LOCKED'}>
                  Lock character
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {recommendations.length > 0 ?
        <p className="site00-expr-engine-panel__meta" data-testid="cast-ensemble-recommendations">
          Ensemble matches: {recommendations.map((r) => r.actor.catalogueNumber).join(', ')}
        </p>
      : null}

      <details className="site00-expr-engine-panel__meta" data-testid="entry002-cast-proof">
        <summary>Entry 002 cast proof</summary>
        <ul>
          <li>Same person 2016/2026: {proof.samePersonAcross20162026}</li>
          <li>Temporal looks: {proof.temporalLookCount}</li>
          <li>Missing authorities: {proof.missingCharacterAuthorities.join(', ') || 'none'}</li>
        </ul>
      </details>

      {showCatalogue ?
        <div className="site00-cast-catalogue">
          <StudioWorldActingCataloguePanel onClose={() => setShowCatalogue(false)} />
        </div>
      : null}

      {gate.uncataloguedHeroes.length > 0 ?
        <p className="site00-expr-engine-panel__meta" data-testid="uncatalogued-hero-warning">
          UNCATALOGUED_HERO_CHARACTER: {gate.uncataloguedHeroes.join(', ')}
        </p>
      : null}

      <p className="site00-expr-engine-panel__meta" data-testid="cast-hero-supporting-required">
        Hero/supporting locked: {lockedCount >= requiredHero ? 'yes' : 'no'}
      </p>
    </section>
  );
}
