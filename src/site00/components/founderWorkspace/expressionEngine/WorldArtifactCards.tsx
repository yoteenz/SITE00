/**
 * B5.0 — World + Artifact visual cards.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';

type Props = {
  blueprint: Entry002ProductionBlueprint;
};

export function WorldCard({ blueprint }: Props) {
  const world = blueprint.worldExpressionSystem;
  return (
    <article className="site00-ee-world-card">
      <header>
        <span className="site00-ee-world-card__kicker">WORLD</span>
        <h3>{blueprint.territoryName}</h3>
        <p className="site00-ee-world-card__mechanism">
          {world.signatureBehaviors.slice(0, 3).join(' → ').toUpperCase()}
        </p>
      </header>
      <div className="site00-ee-world-card__visual" aria-hidden>
        <span className="site00-ee-world-card__swatch" style={{ background: '#0a0a0a' }} />
        <span className="site00-ee-world-card__swatch" style={{ background: '#f5f0e8' }} />
        <span className="site00-ee-world-card__swatch" style={{ background: 'var(--ndx-lime, #c8f542)' }} />
      </div>
      <p className="site00-ee-world-card__descriptor">{world.conceptAlignment.slice(0, 120)}…</p>
      <footer className="site00-ee-world-card__footer">
        <span>STATUS</span>
        <strong>{blueprint.territoryLockStatus.replace(/_/g, ' ')}</strong>
      </footer>
      <details className="site00-ee-world-card__intel">
        <summary>VIEW WORLD INTELLIGENCE</summary>
        <dl>
          <div><dt>Typography</dt><dd>{world.typographySystem}</dd></div>
          <div><dt>Palette</dt><dd>{world.paletteSystem}</dd></div>
          <div><dt>Motion</dt><dd>{world.motionSystem}</dd></div>
          <div><dt>Graphic grammar</dt><dd>{world.graphicGrammar}</dd></div>
        </dl>
      </details>
    </article>
  );
}

export function ArtifactCard({ blueprint }: Props) {
  const artifact = blueprint.entryArtifact;
  return (
    <article className="site00-ee-artifact-card">
      <header>
        <span className="site00-ee-artifact-card__kicker">PRIMARY ARTIFACT</span>
        <h3>{artifact.type}</h3>
      </header>
      <div className="site00-ee-artifact-card__visual">
        <span className="site00-ee-artifact-card__glyph">⌁</span>
      </div>
      <dl className="site00-ee-artifact-card__meta">
        <div><dt>ROLE</dt><dd>{artifact.symbolicRole}</dd></div>
        <div><dt>CONNECTED TO</dt><dd>{artifact.formatUsage.join(' · ')}</dd></div>
      </dl>
      <details>
        <summary>Artifact brief</summary>
        <p>{artifact.visualBrief}</p>
      </details>
    </article>
  );
}

export function CreativeAnchorCard({ blueprint }: Props) {
  const anchor = blueprint.creativeAnchorRecommendation;
  return (
    <article className="site00-ee-anchor-card">
      <span className="site00-ee-anchor-card__kicker">CREATIVE ANCHOR</span>
      <h3>{anchor.format}</h3>
      <p>{anchor.rationale.slice(0, 160)}…</p>
      <span className="site00-ee-anchor-card__dispatch">{anchor.productionDispatch}</span>
    </article>
  );
}
