import { useState } from 'react';
import { DesignVisualIcon } from '../visualSystem/DesignVisualIcon';
import { DVS_LIME } from '../visualSystem/geometry';
import { VIEW_MODE_ICON_PUBLIC } from '../visualSystem/viewModeIcons';
import '../styles/site00-design-viewmode-icons.css';

type Mode = 'canonical' | 'list';
type ButtonState = 'default' | 'hover' | 'active' | 'disabled';

const SIZES = [16, 20, 24] as const;

function ModeButton({
  mode,
  state,
  onSelect,
}: {
  mode: Mode;
  state: ButtonState;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      className={`dvm-btn dvm-btn--${state}`}
      data-testid={`dvm-btn-${mode}-${state}`}
      data-dvm-mode={mode}
      data-dvm-state={state}
      disabled={state === 'disabled'}
      aria-pressed={state === 'active'}
      aria-label={mode === 'canonical' ? 'Canonical view' : 'List view'}
      onClick={state === 'disabled' ? undefined : onSelect}
    >
      <DesignVisualIcon name={mode} size={20} state={state === 'active' ? 'active' : 'default'} />
    </button>
  );
}

export function DesignViewModeIconsPage() {
  const [selected, setSelected] = useState<Mode>('canonical');

  return (
    <div className="dvm" data-testid="design-viewmode-icons-page">
      <header className="dvm-mast">
        <p className="dvm-kicker">SITE 00 / NDXBOOK</p>
        <h1>VIEW MODE ICONS</h1>
        <p className="dvm-sub">P0.VR.DESIGN.GROK-VIEWMODE-ICONS1 · STAGED · ICON ONLY</p>
        <ul className="dvm-facts">
          <li>SLOT design-workspace.view-toggle</li>
          <li>LIVE UI UNTOUCHED</li>
          <li>LIME {DVS_LIME}</li>
        </ul>
      </header>

      <section className="dvm-slot" data-testid="dvm-slot-mock">
        <h2>RIGHT RAIL SLOT</h2>
        <p>Icon-only pair above Opus / Grok. Geometry of the live panel is not changed.</p>
        <div className="dvm-rail">
          <div className="dvm-rail__modes" role="group" aria-label="View mode">
            <ModeButton
              mode="canonical"
              state={selected === 'canonical' ? 'active' : 'default'}
              onSelect={() => setSelected('canonical')}
            />
            <ModeButton
              mode="list"
              state={selected === 'list' ? 'active' : 'default'}
              onSelect={() => setSelected('list')}
            />
          </div>
          <div className="dvm-rail__agents" aria-hidden="true">
            <span className="dvm-ghost">
              <DesignVisualIcon name="opus" size={16} />
            </span>
            <span className="dvm-ghost">
              <DesignVisualIcon name="grok" size={16} />
            </span>
          </div>
        </div>
      </section>

      <section className="dvm-pair" data-testid="dvm-final-pair">
        <article className="dvm-card" data-testid="dvm-card-canonical">
          <h2>CANONICAL VIEW</h2>
          <p className="dvm-semantic">canonical-view</p>
          <p>Framed authoritative field. Dominant plate plus secondary column. Designed composition, not a dashboard grid.</p>
          <div className="dvm-preview dvm-preview--ink">
            <DesignVisualIcon name="canonical" size={32} state="default" title="Canonical view" />
          </div>
          <p className="dvm-file">{VIEW_MODE_ICON_PUBLIC.canonical}</p>
        </article>
        <article className="dvm-card" data-testid="dvm-card-list">
          <h2>LIST VIEW</h2>
          <p className="dvm-semantic">list-view</p>
          <p>Indexed sequential records. Three horizontal rows with leading marks. Inspection list, not a menu.</p>
          <div className="dvm-preview dvm-preview--ink">
            <DesignVisualIcon name="list" size={32} state="default" title="List view" />
          </div>
          <p className="dvm-file">{VIEW_MODE_ICON_PUBLIC.list}</p>
        </article>
      </section>

      <section className="dvm-states" data-testid="dvm-states">
        <h2>STATES</h2>
        {(['canonical', 'list'] as Mode[]).map((mode) => (
          <div key={mode} className="dvm-state-row">
            <h3>{mode}</h3>
            {(['default', 'hover', 'active', 'disabled'] as ButtonState[]).map((state) => (
              <figure key={state}>
                <ModeButton mode={mode} state={state} />
                <figcaption>{state}</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </section>

      <section className="dvm-sizes" data-testid="dvm-sizes">
        <h2>SIZE RANGE</h2>
        <p>Icon 16 / 20 / 24 inside a 36px control. Prefer 20px in the live slot.</p>
        {(['canonical', 'list'] as Mode[]).map((mode) => (
          <div key={mode} className="dvm-size-row">
            <h3>{mode}</h3>
            {SIZES.map((size) => (
              <figure key={`${mode}-${size}`}>
                <div className="dvm-size-ink">
                  <DesignVisualIcon name={mode} size={size} />
                </div>
                <div className="dvm-size-paper">
                  <DesignVisualIcon name={mode} size={size} state="active" />
                </div>
                <figcaption>{size}</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </section>

      <section className="dvm-handoff" data-testid="dvm-handoff">
        <h2>COMPOSER HANDOFF</h2>
        <ul>
          <li>One SVG per icon. Active / hover / disabled via CSS + currentColor.</li>
          <li>Active: black field, lime or paper icon. Inactive: paper field, ink icon, 1px border.</li>
          <li>Disabled: 34% opacity, still the same geometry.</li>
          <li>No text labels on the control. aria-label only.</li>
          <li>Do not implement into the live DESIGN toolbar until founder APPROVE.</li>
        </ul>
      </section>
    </div>
  );
}
