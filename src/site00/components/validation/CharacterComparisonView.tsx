import type { BrandCharacterTerritory } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import type { BrandCharacterTerritoryAssurance } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/territoryAssurance';
import { extractTerritoryDistillation } from '../../../../shared/site00-brand-lore/brandCharacterTerritory/providerSchemaMapping';

const COMPARISON_ROWS: Array<{ key: keyof ReturnType<typeof extractTerritoryDistillation>; label: string }> = [
  { key: 'character', label: 'CHARACTER' },
  { key: 'coreTension', label: 'CORE TENSION' },
  { key: 'intelligence', label: 'INTELLIGENCE' },
  { key: 'socialEnergy', label: 'SOCIAL ENERGY' },
  { key: 'humor', label: 'HUMOR' },
  { key: 'culturalPosition', label: 'CULTURAL POSITION' },
  { key: 'audienceRelationship', label: 'AUDIENCE' },
  { key: 'taste', label: 'TASTE' },
  { key: 'signatureBehavior', label: 'SIGNATURE BEHAVIOR' },
  { key: 'artifactPotential', label: 'ARTIFACT POTENTIAL' },
];

function truncate(text: string, max = 120): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type CharacterComparisonViewProps = {
  characters: BrandCharacterTerritory[];
  assurance?: BrandCharacterTerritoryAssurance[] | null;
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
};

export function CharacterComparisonView({
  characters,
  assurance,
  activeIndex = 0,
  onSelectIndex,
}: CharacterComparisonViewProps) {
  if (!characters.length) return null;

  const distillations = characters.map((c) => extractTerritoryDistillation(c));
  const safeIndex = Math.min(activeIndex, characters.length - 1);

  return (
    <section className="site00-character-compare" aria-label="Character comparison">
      <h3 className="site00-character-compare__title">CHARACTER COMPARISON</h3>
      <p className="site00-character-compare__hint">Scan all six before opening full cards.</p>

      <div className="site00-character-compare__switcher" role="tablist" aria-label="Select character">
        {characters.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === safeIndex}
            className={i === safeIndex ? 'site00-character-compare__tab site00-character-compare__tab--active' : 'site00-character-compare__tab'}
            onClick={() => onSelectIndex?.(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="site00-character-compare__scroll">
        <table className="site00-character-compare__table">
          <thead>
            <tr>
              <th scope="col">DIMENSION</th>
              {characters.map((c, i) => (
                <th key={c.id} scope="col" className={i === safeIndex ? 'site00-character-compare__col--active' : undefined}>
                  #{i + 1}
                </th>
              ))}
            </tr>
            <tr>
              <th scope="row">NAME</th>
              {characters.map((c) => (
                <td key={`name-${c.id}`}>{truncate(c.name, 40)}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {distillations.map((d, i) => (
                  <td key={`${row.key}-${i}`} className={i === safeIndex ? 'site00-character-compare__col--active' : undefined}>
                    {truncate(String(d[row.key] ?? ''), 100) || (
                      <span className="site00-character-compare__missing">Not formed</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {assurance?.length ? (
              <tr>
                <th scope="row">ASSURANCE</th>
                {characters.map((c) => {
                  const a = assurance.find((x) => x.territoryId === c.id);
                  return (
                    <td key={`assurance-${c.id}`}>
                      {a ? `${a.territoryStrength} · ${a.archetypeRisk} risk` : '—'}
                    </td>
                  );
                })}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="site00-character-compare__mobile-card" aria-live="polite">
        <h4>{characters[safeIndex]?.name}</h4>
        <dl>
          {COMPARISON_ROWS.map((row) => (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd>{truncate(String(distillations[safeIndex]?.[row.key] ?? ''), 160) || 'Not formed at territory stage'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
