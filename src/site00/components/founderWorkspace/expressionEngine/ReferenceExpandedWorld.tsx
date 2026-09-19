/**
 * B5.3 — World expanded accordion (visual card + metadata modules).
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';

type Props = {
  blueprint: Entry002ProductionBlueprint;
  worldImageUrl?: string | null;
};

function parsePaletteSwatches(paletteSystem: string): string[] {
  const lower = paletteSystem.toLowerCase();
  const swatches: string[] = [];
  if (lower.includes('black')) swatches.push('#0a0a0a');
  if (lower.includes('cream') || lower.includes('off-white')) swatches.push('#f3f0ea');
  if (lower.includes('lime')) swatches.push('#c8f542');
  if (swatches.length === 0) swatches.push('#0a0a0a', '#f3f0ea', '#c8f542');
  return swatches.slice(0, 4);
}

export function ReferenceExpandedWorld({ blueprint, worldImageUrl }: Props) {
  const world = blueprint.worldExpressionSystem;
  const palette = parsePaletteSwatches(world.paletteSystem);

  return (
    <article className="site00-ee-ref-world">
      <div className="site00-ee-ref-world__visual">
        {worldImageUrl ? (
          <img src={worldImageUrl} alt="" loading="lazy" />
        ) : (
          <div className="site00-ee-ref-world__placeholder" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      <div className="site00-ee-ref-world__body">
        <h4>{blueprint.territoryName.toUpperCase()}</h4>
        <p className="site00-ee-ref-world__descriptor">
          {world.directionName} — {world.conceptAlignment.replace(/^HIGH — /i, '').slice(0, 120)}
        </p>
        <div className="site00-ee-ref-world__modules">
          <div className="site00-ee-ref-world__module">
            <span className="site00-ee-ref-world__module-kicker">ENVIRONMENT</span>
            <strong>{world.materialSystem.split(',')[0]?.trim().slice(0, 48) ?? 'Edit suite interior'}</strong>
          </div>
          <div className="site00-ee-ref-world__module">
            <span className="site00-ee-ref-world__module-kicker">ARTIFACT LANGUAGE</span>
            <strong>{world.artifactSystem.split('—')[0]?.trim().slice(0, 48) ?? blueprint.entryArtifact.type}</strong>
          </div>
          <div className="site00-ee-ref-world__module site00-ee-ref-world__module--palette">
            <span className="site00-ee-ref-world__module-kicker">PALETTE</span>
            <div className="site00-ee-ref-world__swatches">
              {palette.map((color) => (
                <span key={color} style={{ background: color }} aria-hidden />
              ))}
            </div>
          </div>
          <div className="site00-ee-ref-world__module">
            <span className="site00-ee-ref-world__module-kicker">LIGHTING</span>
            <strong>{world.imagerySystem.split('—')[0]?.trim().slice(0, 48) ?? 'Low-light cinematic'}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
