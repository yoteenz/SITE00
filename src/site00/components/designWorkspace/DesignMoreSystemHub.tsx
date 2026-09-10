/**
 * P0.VR.MOF.R1 — System & Settings control-room landing (MORE tab overview).
 */

import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { P0_VR_MOF_R1_BUILD } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/constants.js';
import type { MoreCategory } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import type { ProjectCaptureRefreshState } from './usePageMirror';
import { captureNeedsAttention } from './more/moreStatus';

type StatusTone = 'ready' | 'attention' | 'neutral';

type ToolTile = {
  id: MoreCategory;
  icon: Parameters<typeof DesignDwSectionIcon>[0]['iconId'];
  title: string;
  descriptor: string;
  status: string;
  tone: StatusTone;
};

type Props = {
  onSelectCategory: (category: MoreCategory) => void;
  falAvailable: boolean | null;
  presetCount: number;
  automationOn: boolean;
  captureRefresh?: ProjectCaptureRefreshState;
  recentActivityCount?: number;
};

function buildToolTiles(
  falAvailable: boolean | null,
  presetCount: number,
  automationOn: boolean,
  captureRefresh?: ProjectCaptureRefreshState,
): ToolTile[] {
  const captureAttention = captureNeedsAttention(captureRefresh);
  return [
    {
      id: 'system',
      icon: 'gear',
      title: 'SYSTEM',
      descriptor: 'STATUS, BUILD INFO, SPEND GUARD',
      status: 'ONLINE',
      tone: 'ready',
    },
    {
      id: 'providers',
      icon: 'providers',
      title: 'PROVIDERS',
      descriptor: 'AI ENGINES & ROUTING',
      status: falAvailable === false ? 'BLOCKED' : falAvailable ? 'ACTIVE' : 'CHECKING',
      tone: falAvailable === false ? 'attention' : 'ready',
    },
    {
      id: 'capture',
      icon: 'play',
      title: 'CAPTURE',
      descriptor: 'WORKER, QUEUE, PAGE CAPTURE',
      status: captureAttention ? 'NEEDS ATTENTION' : 'READY',
      tone: captureAttention ? 'attention' : 'ready',
    },
    {
      id: 'route-audit',
      icon: 'list',
      title: 'ROUTE AUDIT',
      descriptor: 'RECOVERED ROUTES & MANIFESTS',
      status: 'READY',
      tone: 'ready',
    },
    {
      id: 'storage',
      icon: 'storage',
      title: 'STORAGE',
      descriptor: 'SUPABASE, OUTPUTS, BINDINGS',
      status: 'CONNECTED',
      tone: 'ready',
    },
    {
      id: 'automation',
      icon: 'automation',
      title: 'AUTOMATION',
      descriptor: 'RULES, SYNC, NOTIFICATIONS',
      status: automationOn ? 'ON' : 'OFF',
      tone: automationOn ? 'ready' : 'neutral',
    },
    {
      id: 'presets',
      icon: 'presets',
      title: 'PRESETS',
      descriptor: 'SAVED INSTRUCTIONS & WORKFLOWS',
      status: presetCount > 0 ? `${presetCount} SAVED` : 'NONE',
      tone: presetCount > 0 ? 'neutral' : 'neutral',
    },
  ];
}

function SystemHubHero() {
  return (
    <header className="site00-dw-more-hub__hero">
      <div className="site00-dw-more-hub__hero-motif" aria-hidden>
        <span className="site00-dw-more-hub__hero-ring site00-dw-more-hub__hero-ring--outer" />
        <span className="site00-dw-more-hub__hero-ring site00-dw-more-hub__hero-ring--mid" />
        <span className="site00-dw-more-hub__hero-ring site00-dw-more-hub__hero-ring--inner" />
        <span className="site00-dw-more-hub__hero-core" />
      </div>
      <div className="site00-dw-more-hub__hero-copy">
        <p className="site00-dw-more-hub__hero-kicker">SYSTEM TOOLS</p>
        <h2 className="site00-dw-more-hub__hero-title">SYSTEM &amp; SETTINGS</h2>
        <p className="site00-dw-more-hub__hero-support">
          Technical tools and configuration live here — not in your primary creative flows.
        </p>
      </div>
      <p className="site00-dw-more-hub__hero-aside">
        <span>SAME ENGINE.</span>
        <span>NEW POSSIBILITIES.</span>
        <span className="site00-dw-more-hub__hero-line" aria-hidden />
      </p>
    </header>
  );
}

function ToolGrid({ tiles, onSelect }: { tiles: ToolTile[]; onSelect: (id: MoreCategory) => void }) {
  return (
    <div className="site00-dw-more-hub__grid" role="list">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          className={`site00-dw-more-hub__tile${tile.id === 'presets' ? ' site00-dw-more-hub__tile--wide' : ''}`}
          onClick={() => onSelect(tile.id)}
          role="listitem"
        >
          <span className="site00-dw-more-hub__tile-icon">
            <DesignDwSectionIcon iconId={tile.icon} />
          </span>
          <span className="site00-dw-more-hub__tile-body">
            <strong>{tile.title}</strong>
            <em>{tile.descriptor}</em>
          </span>
          <span className={`site00-dw-more-hub__tile-status is-${tile.tone}`}>{tile.status}</span>
          <span className="site00-dw-more-hub__tile-chevron" aria-hidden>
            ›
          </span>
        </button>
      ))}
    </div>
  );
}

export function DesignMoreSystemHub({
  onSelectCategory,
  falAvailable,
  presetCount,
  automationOn,
  captureRefresh,
  recentActivityCount = 0,
}: Props) {
  const tiles = buildToolTiles(falAvailable, presetCount, automationOn, captureRefresh);
  const captureAttention = captureNeedsAttention(captureRefresh);
  const systemsOk = !captureAttention && falAvailable !== false;

  return (
    <section className="site00-dw-more-hub" data-design-tab="more" data-more-view="hub">
      <SystemHubHero />

      <div className="site00-dw-more-hub__section-head">
        <h3>CHOOSE A SYSTEM AREA TO MANAGE</h3>
      </div>

      <ToolGrid tiles={tiles} onSelect={onSelectCategory} />

      {captureAttention ? (
        <article className="site00-dw-more-hub__recommended">
          <div className="site00-dw-more-hub__recommended-head">
            <span className="site00-dw-more-hub__recommended-label">RECOMMENDED</span>
            <span className="site00-dw-more-hub__recommended-icon" aria-hidden>
              ⚡
            </span>
          </div>
          <div className="site00-dw-more-hub__recommended-body">
            <div>
              <strong>TEST CAPTURE WORKER</strong>
              <p>Verify the capture service before refreshing project pages.</p>
            </div>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={() => onSelectCategory('capture')}>
              OPEN CAPTURE →
            </button>
          </div>
        </article>
      ) : null}

      <div className="site00-dw-more-hub__summary-row">
        <button type="button" className="site00-dw-more-hub__summary-tile" onClick={() => onSelectCategory('system')}>
          <DesignDwSectionIcon iconId="clock" />
          <span>
            <strong>RECENT ACTIVITY</strong>
            <em>Latest system events</em>
          </span>
          {recentActivityCount > 0 ? (
            <span className="site00-dw-more-hub__summary-badge">{recentActivityCount}</span>
          ) : null}
        </button>
        <button type="button" className="site00-dw-more-hub__summary-tile" onClick={() => onSelectCategory('system')}>
          <DesignDwSectionIcon iconId="coverage" />
          <span>
            <strong>SYSTEM STATUS</strong>
            <em>{systemsOk ? 'All systems operational' : 'Review capture & providers'}</em>
          </span>
          <span className={`site00-dw-more-hub__summary-dot${systemsOk ? ' is-ready' : ' is-attention'}`} aria-hidden />
        </button>
      </div>

      <footer className="site00-dw-more-hub__footer">
        <span>SITE 00 — DESIGN RECONSTRUCTION</span>
        <span>
          {P0_VR_MOF_R1_BUILD} <span className={`site00-dw-more-hub__footer-dot${systemsOk ? ' is-ready' : ' is-attention'}`}>●</span> ONLINE
        </span>
      </footer>
    </section>
  );
}
