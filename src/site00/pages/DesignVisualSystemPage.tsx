import { DesignVisualIcon } from '../visualSystem/DesignVisualIcon';
import { DVS_INK, DVS_LIME, DVS_PAPER, DVS_SIZES, type DvsIconState } from '../visualSystem/geometry';
import { DVS_GROUPS, DVS_MANIFEST, DVS_STAGED_ASSET_COUNT, type DvsManifestEntry } from '../visualSystem/manifest';
import '../styles/site00-design-visual-system.css';

const HERO = ['canonical', 'list', 'opus', 'grok', 'mobile', 'tablet', 'desktop'] as const;
const STATES: DvsIconState[] = ['default', 'active', 'disabled'];

function groupEntries(group: string): DvsManifestEntry[] {
  return DVS_MANIFEST.filter((entry) => entry.group === group);
}

function StateRow({ id, ground }: { id: string; ground: 'paper' | 'ink' }) {
  return (
    <div className={`dvs-states dvs-states--${ground}`} data-testid={`dvs-states-${id}-${ground}`}>
      {STATES.map((state) => (
        <figure key={state} className="dvs-state">
          <DesignVisualIcon name={id} size={24} state={state} title={`${id} ${state} on ${ground}`} />
          <figcaption>{state}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function SizeRow({ id, ground }: { id: string; ground: 'paper' | 'ink' }) {
  return (
    <div className={`dvs-sizes dvs-sizes--${ground}`} data-testid={`dvs-sizes-${id}-${ground}`}>
      {DVS_SIZES.map((size) => (
        <figure key={size} className="dvs-size">
          <DesignVisualIcon name={id} size={size} state="default" title={`${id} ${size}px`} />
          <figcaption>{size}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Card({ entry }: { entry: DvsManifestEntry }) {
  return (
    <article className="dvs-card" data-dvs-id={entry.id} data-testid={`dvs-card-${entry.id}`}>
      <header className="dvs-card__head">
        <DesignVisualIcon name={entry.id} size={24} state="default" />
        <div>
          <h3>{entry.semantic}</h3>
          <p>{entry.slot}</p>
        </div>
        <span className="dvs-card__status">STAGED</span>
      </header>
      <dl className="dvs-card__meta">
        <div>
          <dt>Default</dt>
          <dd>{entry.defaultState}</dd>
        </div>
        <div>
          <dt>Active</dt>
          <dd>{entry.activeState}</dd>
        </div>
        {entry.disabledState ? (
          <div>
            <dt>Disabled</dt>
            <dd>{entry.disabledState}</dd>
          </div>
        ) : null}
      </dl>
      <StateRow id={entry.id} ground="paper" />
      <StateRow id={entry.id} ground="ink" />
      <SizeRow id={entry.id} ground="paper" />
      <SizeRow id={entry.id} ground="ink" />
    </article>
  );
}

export function DesignVisualSystemPage() {
  return (
    <div className="dvs" data-testid="design-visual-system-page">
      <header className="dvs-mast">
        <p className="dvs-kicker">SITE 00 / NDXBOOK</p>
        <h1>DESIGN VISUAL SYSTEM</h1>
        <p className="dvs-sub">
          P0.VR.DESIGN.GROK-VISUAL-SYSTEM1 · STAGED CANDIDATE · FOUNDER REVIEW
        </p>
        <ul className="dvs-facts">
          <li>COUNT {DVS_STAGED_ASSET_COUNT}</li>
          <li>GRID 24 / STROKE 1.5 / INSET 4</li>
          <li>LIME {DVS_LIME}</li>
          <li>INK {DVS_INK}</li>
          <li>PAPER {DVS_PAPER}</li>
          <li>GEOMETRY UNTOUCHED</li>
        </ul>
      </header>

      <section className="dvs-spec" data-testid="dvs-construction">
        <h2>CONSTRUCTION</h2>
        <p>
          One family. Square caps. Miter joins. Optical 16 inside a 24 box. Lime only for
          active / selected / approved. No generic stroke kits. No emoji. Composer implements
          only after founder APPROVE.
        </p>
        <div className="dvs-hero-row" data-testid="dvs-hero-family">
          {HERO.map((id) => (
            <figure key={id} className="dvs-hero">
              <div className="dvs-hero__ink">
                <DesignVisualIcon name={id} size={32} state="default" />
              </div>
              <div className="dvs-hero__paper">
                <DesignVisualIcon name={id} size={32} state="active" />
              </div>
              <figcaption>{id}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="dvs-upload-demo" data-testid="dvs-upload-demo">
        <h2>UPLOAD / DROP</h2>
        <div className="dvs-drop">
          <DesignVisualIcon name="drop-zone" size={32} state="default" />
          <p>DROP IMAGE OR CLICK TO UPLOAD</p>
          <span>PNG, JPG, WEBP · MAX 10MB</span>
        </div>
        <div className="dvs-upload-badges">
          <span>
            <DesignVisualIcon name="attach" size={16} /> ATTACH
          </span>
          <span>
            <DesignVisualIcon name="file-ok" size={16} /> COMPLETE
          </span>
          <span className="is-invalid">
            <DesignVisualIcon name="file-invalid" size={16} /> INVALID
          </span>
        </div>
      </section>

      {DVS_GROUPS.map((group) => {
        const entries = groupEntries(group);
        if (!entries.length) return null;
        return (
          <section key={group} className="dvs-group" data-testid={`dvs-group-${group}`}>
            <h2>{group.replace(/-/g, ' ')}</h2>
            <div className="dvs-grid">
              {entries.map((entry) => (
                <Card key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
