import { Link, useNavigate } from 'react-router-dom';
import { BLDR_FRAMEWORK_PILLARS, BLDR_HOMEPAGE_EXPANDED } from '../../config/builder';
import { EVOLVE_FRAMEWORK_PILLARS, EVOLVE_HOMEPAGE_EXPANDED } from '../../config/evolve';
import { IDNTY_FRAMEWORK_PILLARS, IDNTY_HOMEPAGE_EXPANDED } from '../../config/identity';
import { resolveOriginBackgroundByViewport } from '../../config/origin-background-assets';
import {
  BUILDER_PANELS,
  ORIGIN_EXPANDED_TITLES,
  ORIGIN_PANEL_SIDE_NOTES,
} from '../../config/public-redesign-content';
import { SITE00_ROUTES } from '../../config/routes';
import { SITE00_ORIGIN_COPY } from '../../config/status';
import type { useOriginLocationsTransition } from '../../hooks/useOriginLocationsTransition';
import type { HomeMode } from '../../state/types';
import { BldrFrameworkIcon } from '../homepage/BldrFrameworkIcon';
import { EvolveFrameworkIcon } from '../homepage/EvolveFrameworkIcon';
import { IdntyFrameworkIcon } from '../homepage/IdntyFrameworkIcon';
import { OriginPanelIcon } from '../homepage/OriginPanelIcon';
import { AssetSlot } from './AssetSlot';
import { PublicDiamond } from './IdentityDiagnosticChrome';
import { PublicRedesignShell } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';

type OriginPanelId = 'idnty' | 'bldr' | 'evolve';

const AUTHORITY_ID: Record<HomeMode, string> = {
  origin: '01_ORIGIN_MAIN',
  'idnty-expanded': '02_ORIGIN_IDNTY_EXPANDED',
  'bldr-expanded': '03_ORIGIN_BLDR_EXPANDED',
  'evolve-expanded': '04_ORIGIN_EVOLVE_EXPANDED',
};

function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 12" width={size} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 6h17M13 1l5 5-5 5" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 20 12" width="20" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 6H2M7 1 2 6l5 5" />
    </svg>
  );
}

/* ----------------------------------------------------------- collapsed */

const COLLAPSED_CARDS: { panel: OriginPanelId; number: string; title: string; slotId: string }[] = [
  { panel: 'idnty', number: '01', title: 'IDNTY', slotId: 'CARD.ORIGIN.IDNTY' },
  { panel: 'bldr', number: '02', title: 'BLDR', slotId: 'CARD.ORIGIN.BLDR' },
  { panel: 'evolve', number: '03', title: 'EVOLVE', slotId: 'CARD.ORIGIN.EVOLVE' },
];

type PublicOriginMobileProps = {
  homeMode: HomeMode;
  onExpand: (panel: OriginPanelId) => void;
  onCollapse: () => void;
  locationsTransition: ReturnType<typeof useOriginLocationsTransition>;
};

/**
 * ORIGIN — public entry point. Canonical choices are exactly IDNTY / BLDR / EVOLVE (no worlds, no
 * library, no fourth service). The double-zero landmark plate stays; panels, hero and navigation
 * are live DOM. Swipe-up → Locations keeps working through the existing transition hook.
 */
export function PublicOriginMobile({ homeMode, onExpand, onCollapse, locationsTransition }: PublicOriginMobileProps) {
  const expanded = homeMode !== 'origin';
  const panel: OriginPanelId | null =
    homeMode === 'idnty-expanded' ? 'idnty' : homeMode === 'bldr-expanded' ? 'bldr' : homeMode === 'evolve-expanded' ? 'evolve' : null;
  const { goToLocations, transitioning, swipeHandlers } = locationsTransition;

  return (
    <PublicRedesignShell
      section="origin"
      headerVariant="wordmark"
      hideBottomNav
      authorityId={AUTHORITY_ID[homeMode]}
      className={`s00pr-shell--origin ${expanded ? 's00pr-shell--origin-expanded' : ''}`.trim()}
      environment={
        <SpatialEnvironmentFrame
          slotId={expanded ? 'ENV.ORIGIN.EXPANDED' : 'ENV.ORIGIN.COLLAPSED'}
          tone="daylight"
          // The approved CLEAN landmark plate (existing asset) stays mounted for both states; the old
          // WITH_PANELS image has panels baked in and is intentionally not used.
          fallbackImageUrl={resolveOriginBackgroundByViewport('mobile', 'CLEAN')}
        />
      }
    >
      <div className="s00pr-origin" data-origin-mode={homeMode}>
        <section className="s00pr-originhero" aria-label="ORIGIN MESSAGING">
          <p className="s00pr-originhero__eyebrow">{SITE00_ORIGIN_COPY.headlineLine1}</p>
          <h1 className="s00pr-originhero__title">{SITE00_ORIGIN_COPY.headlineLine2}</h1>
          <span className="s00pr-originhero__rule" aria-hidden="true">
            <i />
          </span>
          <p className="s00pr-originhero__tagline">{SITE00_ORIGIN_COPY.tagline}</p>
        </section>

        {!expanded ? (
          <>
            <aside className="s00pr-originnote s00pr-originnote--left" aria-hidden="true">
              <span className="s00pr-originnote__dot" />
              <p>IDEAS PEOPLE WORLDS EXPERIENCES AND BEYOND.</p>
            </aside>
            <aside className="s00pr-originnote s00pr-originnote--right" aria-hidden="true">
              <span className="s00pr-originnote__dot" />
              <p>A CREATIVE PLATFORM FOR WHAT'S NEXT.</p>
            </aside>

            <section className="s00pr-origincards" aria-label="ENTRY SELECTION" {...swipeHandlers}>
              <ul className="s00pr-origincards__row">
                {COLLAPSED_CARDS.map((card) => (
                  <li key={card.panel}>
                    <button type="button" className="s00pr-origincard" onClick={() => onExpand(card.panel)} aria-label={`EXPAND ${card.title}`}>
                      <AssetSlot slotId={card.slotId} className="s00pr-origincard__slot" />
                      <span className="s00pr-origincard__number">{card.number}</span>
                      <span className="s00pr-origincard__tick" aria-hidden="true" />
                      <span className="s00pr-origincard__title">{card.title}</span>
                      <span className="s00pr-origincard__go" aria-hidden="true">
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="s00pr-originswipe" aria-label="SWIPE UP TO OPEN SITE 00 LOCATIONS DIRECTORY" {...swipeHandlers}>
              <span className="s00pr-originswipe__connector" aria-hidden="true">
                <i />
                <b />
              </span>
              <svg className="s00pr-originswipe__chev" viewBox="0 0 24 12" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <path d="m2 11 10-9 10 9" />
              </svg>
              <button type="button" className="s00pr-originswipe__btn" onClick={goToLocations}>
                SWIPE UP TO ENTER
              </button>
            </section>
          </>
        ) : null}

        {panel ? <PublicOriginExpandedPanel panel={panel} onCollapse={onCollapse} /> : null}

        <footer className="s00pr-originfoot">
          <Link to={SITE00_ROUTES.originAlias} className="s00pr-originfoot__mark" aria-label="SITE 00 ORIGIN">
            00
          </Link>
          <span className="s00pr-originfoot__rule" aria-hidden="true" />
          <p className="s00pr-originfoot__line">REAL PLACES. DIGITAL PEOPLE. INFINITE POSSIBILITIES.</p>
          <nav className="s00pr-originfoot__links" aria-label="FOOTER">
            {/* TERMS / PRIVACY have no destination yet — rendered as labels, never as dead links. */}
            <span aria-disabled="true">TERMS</span>
            <span aria-disabled="true">PRIVACY</span>
            <Link to={SITE00_ROUTES.support}>CONTACT</Link>
          </nav>
        </footer>
      </div>

      {transitioning ? <div className="s00pr-origin-transition" aria-hidden="true" /> : null}
    </PublicRedesignShell>
  );
}

/* ------------------------------------------------------------ expanded */

export function SectionHead({ children, diamond = false }: { children: string; diamond?: boolean }) {
  return (
    <h2 className="s00pr-oh">
      <span>{children}</span>
      <span className="s00pr-oh__rule" aria-hidden="true" />
      {diamond ? <PublicDiamond /> : null}
    </h2>
  );
}

type PublicOriginExpandedPanelProps = { panel: OriginPanelId; onCollapse: () => void };

/** The glass panel shared by IDENTITY / BUILDER / EVOLVE — same shell, different machine and content. */
export function PublicOriginExpandedPanel({ panel, onCollapse }: PublicOriginExpandedPanelProps) {
  const navigate = useNavigate();
  const head = ORIGIN_EXPANDED_TITLES[panel];

  const subtitle =
    panel === 'idnty' ? IDNTY_HOMEPAGE_EXPANDED.subtitle : panel === 'bldr' ? BLDR_HOMEPAGE_EXPANDED.subtitle : EVOLVE_HOMEPAGE_EXPANDED.subtitle;
  const cta =
    panel === 'idnty' ? IDNTY_HOMEPAGE_EXPANDED.cta : panel === 'bldr' ? BLDR_HOMEPAGE_EXPANDED.cta : EVOLVE_HOMEPAGE_EXPANDED.cta.replace(' →', '');
  const target =
    panel === 'idnty' ? SITE00_ROUTES.idntyState : panel === 'bldr' ? SITE00_ROUTES.bldrState : SITE00_ROUTES.evolveState;
  const overview =
    panel === 'idnty' ? IDNTY_HOMEPAGE_EXPANDED.overview : panel === 'bldr' ? BUILDER_PANELS.overview.overview : EVOLVE_HOMEPAGE_EXPANDED.overview;

  return (
    <section
      className={`s00pr-opanel s00pr-opanel--${panel}`}
      aria-label={`${head.title} PANEL`}
      data-origin-panel={panel}
    >
      <header className="s00pr-opanel__head">
        <div className="s00pr-opanel__titles">
          <p className="s00pr-opanel__number">{head.number}</p>
          <span className="s00pr-opanel__tick" aria-hidden="true" />
          <h2 className="s00pr-opanel__title">{head.title}</h2>
          <p className="s00pr-opanel__sub">{subtitle}</p>
        </div>
        <AssetSlot
          slotId={
            panel === 'idnty' ? 'ILLUSTRATION.ORIGIN.IDENTITY' : panel === 'bldr' ? 'ILLUSTRATION.ORIGIN.BLDR' : 'ILLUSTRATION.ORIGIN.EVOLVE'
          }
          className="s00pr-opanel__art"
        >
          <OriginPanelIcon panel={panel} size="lg" className="s00pr-opanel__art-img" />
        </AssetSlot>
        <aside className="s00pr-opanel__note" aria-hidden="true">
          <p>{ORIGIN_PANEL_SIDE_NOTES[panel]}</p>
          <span className="s00pr-originnote__dot" />
        </aside>
        <button type="button" className="s00pr-opanel__close" onClick={onCollapse} aria-label="CLOSE PANEL">
          <span>CLOSE</span>
          <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="m3 3 14 14M17 3 3 17" />
          </svg>
        </button>
      </header>

      <div className="s00pr-opanel__body">
        <SectionHead diamond={panel === 'evolve'}>OVERVIEW</SectionHead>
        <p className="s00pr-opanel__text">{overview}</p>

        {panel === 'idnty' ? (
          <>
            <SectionHead>WHAT WE DEFINE</SectionHead>
            <ul className="s00pr-define">
              {IDNTY_HOMEPAGE_EXPANDED.defineItems.map((item) => (
                <li key={item}>
                  <span className="s00pr-define__plus" aria-hidden="true">
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <SectionHead>THE IDENTITY FRAMEWORK</SectionHead>
            <ol className="s00pr-framework">
              {IDNTY_FRAMEWORK_PILLARS.map((pillar, index) => (
                <li key={pillar.id}>
                  <span className="s00pr-framework__n">0{index + 1}</span>
                  <IdntyFrameworkIcon id={pillar.icon} title={pillar.title} className="s00pr-framework__icon" />
                  <span className="s00pr-framework__title">{pillar.title}</span>
                  <span className="s00pr-framework__desc">{pillar.description}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {panel === 'bldr' ? (
          <>
            <SectionHead>WHAT WE BUILD</SectionHead>
            <ul className="s00pr-define s00pr-define--items">
              {BUILDER_PANELS.overview.items.map((item, index) => (
                <li key={item.title}>
                  <span className="s00pr-define__plus" aria-hidden="true">
                    +
                  </span>
                  <span className="s00pr-define__body">
                    <b>
                      0{index + 1} {item.title}
                    </b>
                    <span>{item.description.split('|').pop()}</span>
                  </span>
                </li>
              ))}
            </ul>
            <SectionHead>THE BLDR FRAMEWORK</SectionHead>
            <ol className="s00pr-framework">
              {BLDR_FRAMEWORK_PILLARS.map((pillar, index) => (
                <li key={pillar.id}>
                  <span className="s00pr-framework__n">0{index + 1}</span>
                  <BldrFrameworkIcon id={pillar.icon} title={pillar.title} className="s00pr-framework__icon" />
                  <span className="s00pr-framework__title">{pillar.title}</span>
                  <span className="s00pr-framework__desc">{pillar.description}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {panel === 'evolve' ? (
          <>
            <SectionHead>CHOOSE YOUR PATH</SectionHead>
            <ol className="s00pr-framework s00pr-framework--three">
              {EVOLVE_FRAMEWORK_PILLARS.map((pillar, index) => (
                <li key={pillar.id}>
                  <span className="s00pr-framework__n">0{index + 1}</span>
                  <AssetSlot slotId={`ILLUSTRATION.ORIGIN.EVOLVE_PATH.${pillar.id.toUpperCase()}`} className="s00pr-framework__art">
                    <EvolveFrameworkIcon id={pillar.icon} title={pillar.title} className="s00pr-framework__icon" />
                  </AssetSlot>
                  <span className="s00pr-framework__title">{pillar.title}</span>
                  <span className="s00pr-framework__desc">{pillar.description}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div>

      <footer className="s00pr-opanel__foot">
        <button type="button" className="s00pr-circlebtn" onClick={onCollapse} aria-label="BACK">
          <ArrowLeft />
        </button>
        <span className="s00pr-opanel__footlabel">BACK</span>
        <span className="s00pr-opanel__footvr" aria-hidden="true" />
        <button type="button" className="s00pr-opanel__cta" onClick={() => navigate(target)}>
          <span>{cta}</span>
          <span className="s00pr-opanel__cta-go" aria-hidden="true">
            <ArrowRight />
          </span>
        </button>
      </footer>
      {panel === 'evolve' ? (
        <p className="s00pr-opanel__how">
          <Link to={SITE00_ROUTES.evolve}>{EVOLVE_HOMEPAGE_EXPANDED.secondaryCta} →</Link>
        </p>
      ) : null}
    </section>
  );
}
