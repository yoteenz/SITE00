/**
 * P0.VR.DESIGNBENCH.FABLE-DIRECT1 — isolated Claude Fable direct reconstruction of the
 * NDXBOOK DESIGN workspace golden (mobile master, 608×1088 reference viewport).
 *
 * Real DOM/CSS only. The golden screenshot is never rendered by this route — it was used
 * solely as the geometry authority during implementation and browser QA.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/site00-twin-fable-direct.css';

export const FABLE_DIRECT_ARTBOARD = { width: 608, height: 1088 } as const;

type ViewportId = 'MOBILE' | 'TABLET' | 'DESKTOP';
type LowerTabId = 'CONCEPT DATA' | 'VERSION HISTORY' | 'CHANGE HISTORY' | 'MASTER UPDATE' | 'AMENDMENT';
type BottomNavId = 'WORKSPACE' | 'DESIGN HISTORY' | 'FEATURE CHANGE HISTORY' | 'MASTER AMENDMENT STATUS' | 'CONTEXTUAL NEXT ACTION';

const PRIMARY_NAV = ['REFERENCES', 'ASSETS', 'PAGES', 'SKINS', 'HISTORY'] as const;
const VIEWPORTS: ViewportId[] = ['MOBILE', 'TABLET', 'DESKTOP'];
const LOWER_TABS: LowerTabId[] = ['CONCEPT DATA', 'VERSION HISTORY', 'CHANGE HISTORY', 'MASTER UPDATE', 'AMENDMENT'];

const CANDIDATES = [
  { id: 'V1.3', kind: 'signal' as const },
  { id: 'V1.2', kind: 'grid' as const },
  { id: 'V1.1', kind: 'collage' as const },
  { id: 'V1.0', kind: 'newsprint' as const },
];

const STRUCTURED_COLUMNS = [
  { label: 'GROUNDING', title: ['INDEX SIGNAL', 'MANIFEST'], source: 'SOURCE: APP.ASSET', kind: 'receipt' },
  { label: 'BLUEPRINT', title: ['LAYOUT + TYPE', 'SYSTEM'], source: 'NDXBOOK_GRID_V2', kind: 'blueprint' },
  { label: 'OVERLAY', title: ['ANNOTATION LAYER', 'ON'], source: 'ANNOTATION_LAYER_v1', kind: 'overlay' },
  { label: 'ASSETS', title: ['EVIDENCE PACK', '12 ITEMS'], source: 'ASSET_PACK_ENTRY001', kind: 'pack' },
  { label: 'FUNCTION', title: ['MAPPING', '6 FUNCTIONS'], source: 'FUNCTION_MAP_v1', kind: 'functions' },
] as const;

const FUNCTION_MAP = [
  'F01_INDEX_SIGNAL',
  'F02_CRONI_REFRENCE',
  'F03_ARCHVISAL_LINK',
  'F04_CONTEXT_THREAD',
  'F05_SOURCE_TRACE',
  'F06_VERIFICATION',
];

const CHECKS = [
  { label: 'LAYOUT SYSTEM', state: 'ok' },
  { label: 'TYPE SCALE', state: 'ok' },
  { label: 'ASSET LINKS', state: 'ok' },
  { label: 'FUNCTION MAP', state: 'warn' },
  { label: 'ACCESSIBILITY', state: 'ok' },
] as const;

const STATUS_ROWS = [
  ['APPROVED ELEMENTS', '18'],
  ['PENDING DECISIONS', '2'],
  ['BLOCKERS', '0'],
  ['WARNINGS', '1'],
] as const;

const BOTTOM_NAV: { id: BottomNavId; lines: string[]; icon: ReactNode }[] = [
  { id: 'WORKSPACE', lines: ['WORKSPACE'], icon: <IconWorkspace /> },
  { id: 'DESIGN HISTORY', lines: ['DESIGN HISTORY'], icon: <IconHistory /> },
  { id: 'FEATURE CHANGE HISTORY', lines: ['FEATURE CHANGE', 'HISTORY'], icon: <IconFeature /> },
  { id: 'MASTER AMENDMENT STATUS', lines: ['MASTER AMENDMENT', 'STATUS'], icon: <IconCheckCircle /> },
  { id: 'CONTEXTUAL NEXT ACTION', lines: ['CONTEXTUAL NEXT', 'ACTION'], icon: <IconBolt /> },
];

/* ------------------------------------------------------------------ icons */

function IconMenu() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconKebab() {
  return (
    <svg viewBox="0 0 4 16" width="4" height="16" aria-hidden="true">
      <circle cx="2" cy="2.5" r="1.6" fill="currentColor" />
      <circle cx="2" cy="8" r="1.6" fill="currentColor" />
      <circle cx="2" cy="13.5" r="1.6" fill="currentColor" />
    </svg>
  );
}
function IconCaret() {
  return (
    <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true">
      <path d="M0 0h10L5 6z" fill="currentColor" />
    </svg>
  );
}
function IconChevronUp() {
  return (
    <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true">
      <path d="M1 5.5 5 1.5 9 5.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 8 12" width="6" height="9" aria-hidden="true">
      <path d="M1.5 1 6 6l-4.5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 14 11" width="12" height="9" aria-hidden="true">
      <path d="M1 5.5 5 9.5 13 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 12 14" width="10" height="12" aria-hidden="true">
      <rect x="1" y="6" width="10" height="7.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 14 24" width="14" height="24" aria-hidden="true">
      <rect x="1" y="1" width="12" height="22" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 3.5h4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function IconTablet() {
  return (
    <svg viewBox="0 0 18 24" width="17" height="24" aria-hidden="true">
      <rect x="1" y="1" width="16" height="22" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="20" r="0.9" fill="currentColor" />
    </svg>
  );
}
function IconDesktop() {
  return (
    <svg viewBox="0 0 34 24" width="34" height="24" aria-hidden="true">
      <rect x="1" y="1" width="32" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 23h10M17 19v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconSliders() {
  return (
    <svg viewBox="0 0 16 14" width="15" height="13" aria-hidden="true">
      <path d="M0 3h16M0 7h16M0 11h16" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5" cy="3" r="1.8" fill="currentColor" />
      <circle cx="11" cy="7" r="1.8" fill="currentColor" />
      <circle cx="6" cy="11" r="1.8" fill="currentColor" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 1.5v3.5h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconInspect() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconExpand() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 1l5 5M15 1l-5 5M15 15l-5-5M1 15l5-5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true">
      <path d="M1 1h6.5L11 4.5V13H1z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 7h5M3.5 9.5h5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function IconWorkspace() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
    </svg>
  );
}
function IconHistory() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 2v3h3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3.5l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconFeature() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 5h5M4 8h4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11" cy="11" r="2.4" fill="currentColor" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2 2 4-4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 12 16" width="12" height="15" aria-hidden="true">
      <path d="M7 1 1.5 9H6l-1 6L10.5 7H6z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------- hero art */

function PointingHand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 240" aria-hidden="true">
      {/* raised index finger + folded fist + thumb + forearm */}
      <path
        d="M57 4c6.5 0 11 4.5 11 11v83l7-2c9-2.5 18 1 24 8 6 7 8 17 5 26l-1 22c0 13-5 24-14 32l-2 2-1 54H31l-2-56c-9-6-14-16-15-27l-2-30c-1-9 4-17 12-20l22-8V15c0-6.5 4.5-11 11-11z"
        fill="#0a0a0a"
      />
      <path
        d="M68 100c11-4 22 0 29 9M66 122c12-3 24 1 31 10M64 144c11-1 22 3 29 9M30 116c-9 5-13 15-11 26"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M50 20v66M63 26v58" fill="none" stroke="#3a3a3a" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}

function Newsprint({ dense = false }: { dense?: boolean }) {
  return <div className={`fd-newsprint${dense ? ' fd-newsprint--dense' : ''}`} aria-hidden="true" />;
}

function MiniSignalCard({ className }: { className?: string }) {
  return (
    <div className={`fd-mini-signal${className ? ` ${className}` : ''}`} aria-hidden="true">
      <div className="fd-mini-signal__headline">
        THE SIGNAL
        <br />
        IS THE INDEX
      </div>
      <div className="fd-mini-signal__tag">
        CULTURE AS EVIDENCE.
        <br />
        IDEAS AS INDEX.
        <br />
        NDXBOOK.
      </div>
      <div className="fd-mini-signal__photo">
        <Newsprint />
        <PointingHand className="fd-mini-signal__hand" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export function DesignTwinFableDirectPage() {
  const { projectSlug } = useParams();
  const projectLabel = (projectSlug ?? 'ndxbook').toUpperCase();

  const [viewport, setViewport] = useState<ViewportId>('MOBILE');
  const [selectedCandidate, setSelectedCandidate] = useState('V1.3');
  const [mobileSelected, setMobileSelected] = useState(true);
  const [desktopSelected, setDesktopSelected] = useState(false);
  const [pairOpen, setPairOpen] = useState(true);
  const [lowerTab, setLowerTab] = useState<LowerTabId>('CONCEPT DATA');
  const [bottomNav, setBottomNav] = useState<BottomNavId>('WORKSPACE');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(Math.min(1, window.innerWidth / FABLE_DIRECT_ARTBOARD.width));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = `SITE 00 › ${projectLabel} › DESIGN — TWIN FABLE DIRECT`;
    return () => {
      document.title = prev;
    };
  }, [projectLabel]);

  const readiness = useMemo(() => ({ percent: 82, circumference: 2 * Math.PI * 24 }), []);

  return (
    <div className="fd-viewport" data-route="twin-fable-direct" data-model="claude-fable-5.1-high">
      <div
        className="fd-scale"
        style={{
          width: FABLE_DIRECT_ARTBOARD.width * scale,
          height: FABLE_DIRECT_ARTBOARD.height * scale,
        }}
      >
        <div className="fd-artboard" style={{ transform: `scale(${scale})` }}>
          {/* 01 SITE00_HEADER */}
          <header className="fd-header">
            <div className="fd-header__crumbs">
              <span className="fd-header__brand">SITE 00</span>
              <span className="fd-header__sep">&gt;</span>
              <span>PROJECT: {projectLabel}</span>
              <span className="fd-header__sep">&gt;</span>
              <span className="fd-header__current">DESIGN</span>
            </div>
            <div className="fd-header__right">
              <span className="fd-header__compiler">
                COMPILER: READY <i className="fd-dot fd-dot--green" />
              </span>
              <button type="button" className="fd-header__kebab" aria-label="More options">
                <IconKebab />
              </button>
            </div>
          </header>

          {/* 02 PRIMARY_NAV */}
          <nav className="fd-nav" aria-label="Design workspace">
            <button type="button" className="fd-nav__menu" aria-label="Open menu">
              <IconMenu />
            </button>
            {PRIMARY_NAV.map((item) => (
              <button key={item} type="button" className="fd-nav__item">
                {item}
              </button>
            ))}
            <button type="button" className="fd-nav__item fd-nav__item--more">
              MORE <IconCaret />
            </button>
          </nav>

          {/* 03 NDXBOOK_CONTEXT_BAR */}
          <div className="fd-context">
            <span className="fd-context__chip">{projectLabel}</span>
            <span className="fd-context__label">CULTURAL_INTELLIGENCE_EDITORIAL</span>
            <span className="fd-context__right">
              PROJECT CREATIVE CONTEXT <i className="fd-dot fd-dot--lime" />
            </span>
          </div>

          {/* 04 TARGET_VIEWPORT_STAGE_BAND */}
          <section className="fd-stage" aria-label="Target, viewport and stage">
            <div className="fd-stage__target">
              <div className="fd-label">TARGET</div>
              <div className="fd-stage__lines">
                <span>ENTRY 001</span>
                <span>ENTRY COVER</span>
                <span>HOMEPAGE HERO</span>
              </div>
            </div>
            <div className="fd-stage__viewport">
              <div className="fd-label">VIEWPORT</div>
              <div className="fd-stage__devices" role="tablist" aria-label="Viewport">
                {VIEWPORTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={viewport === v}
                    className={`fd-device fd-device--${v.toLowerCase()}${viewport === v ? ' is-active' : ''}`}
                    onClick={() => setViewport(v)}
                  >
                    <span className="fd-device__icon">
                      {v === 'MOBILE' ? <IconPhone /> : v === 'TABLET' ? <IconTablet /> : <IconDesktop />}
                    </span>
                    <span className="fd-device__label">{v}</span>
                    <span className="fd-device__bar" />
                  </button>
                ))}
              </div>
            </div>
            <div className="fd-stage__meta">
              <div className="fd-label">STAGE</div>
              <div className="fd-stage__value">REVIEW_ACTIVE_CONCEPT</div>
              <div className="fd-label fd-stage__authority-label">AUTHORITY</div>
              <div className="fd-stage__value">
                PAIR: UNLOCKED • V1.3 <IconLock />
              </div>
            </div>
          </section>

          {/* 05 MAIN_HERO + 06 AUTHORITY_RAIL */}
          <section className="fd-hero-row">
            <article className="fd-hero" aria-label="Entry 001 cultural receipt">
              <div className="fd-hero__top">
                <span>ENTRY 001</span>
                <span className="fd-hero__top-right">
                  <span>CULTURAL RECEIPT</span>
                  <span className="fd-hero__num">001</span>
                </span>
              </div>
              <h1 className="fd-hero__headline">
                <span className="fd-hero__line">THE SIGNAL</span>
                <span className="fd-hero__line">IS THE INDEX</span>
              </h1>
              <p className="fd-hero__tagline">
                CULTURE AS EVIDENCE.
                <br />
                IDEAS AS INDEX.
                <br />
                NDXBOOK.
              </p>
              <div className="fd-hero__photo" aria-hidden="true">
                <Newsprint dense />
                <div className="fd-hero__photo-notes">
                  <span className="fd-hero__note fd-hero__note--a">
                    CRITIC REF:
                    <br />
                    P.197
                    <br />
                    P.208
                    <br />
                    P.311
                  </span>
                  <span className="fd-hero__note fd-hero__note--b">ARCHIVE</span>
                  <span className="fd-hero__note fd-hero__note--c">S 8 3 8</span>
                </div>
                <PointingHand className="fd-hero__hand" />
              </div>
              <div className="fd-hero__foot">
                <div className="fd-hero__foot-item">
                  <span className="fd-hero__foot-text">
                    INDEX SIGNAL:
                    <br />
                    PAGE 001 INDEXED
                  </span>
                  <span className="fd-hero__arrow">
                    <IconChevronRight />
                  </span>
                </div>
                <div className="fd-hero__foot-item">
                  <span className="fd-hero__foot-text">
                    ARCHIVAL EVIDENCE
                    <br />
                    ATTACHED
                  </span>
                </div>
                <span className="fd-hero__evidence">EVIDENCE</span>
                <span className="fd-hero__plus">+12</span>
              </div>
            </article>

            <aside className="fd-rail" aria-label="Authority controls">
              <button
                type="button"
                className={`fd-rail__select${mobileSelected ? ' is-selected' : ''}`}
                aria-pressed={mobileSelected}
                onClick={() => setMobileSelected((v) => !v)}
              >
                <span className="fd-rail__select-main">
                  <IconCheck /> SELECT FOR MOBILE
                </span>
                <span className="fd-rail__select-sub">{mobileSelected ? 'SELECTED' : 'NOT SELECTED'}</span>
              </button>
              <button
                type="button"
                className={`fd-btn fd-btn--outline fd-rail__desktop${desktopSelected ? ' is-selected' : ''}`}
                aria-pressed={desktopSelected}
                onClick={() => setDesktopSelected((v) => !v)}
              >
                SELECT FOR DESKTOP
              </button>

              <div className="fd-pair">
                <button
                  type="button"
                  className="fd-pair__head"
                  aria-expanded={pairOpen}
                  onClick={() => setPairOpen((v) => !v)}
                >
                  <span>AUTHORITY PAIR</span>
                  <IconChevronUp />
                </button>
                {pairOpen && (
                  <div className="fd-pair__body">
                    <div className="fd-pair__master fd-pair__master--mobile">
                      <div className="fd-pair__master-label">MOBILE MASTER</div>
                      <div className="fd-pair__master-row">
                        <div className="fd-pair__thumb fd-pair__thumb--mobile" aria-hidden="true">
                          <span className="fd-pair__thumb-title">
                            THE SIGNAL
                            <br />
                            IS THE INDEX
                          </span>
                          <span className="fd-pair__thumb-block" />
                          <span className="fd-pair__thumb-block fd-pair__thumb-block--b" />
                        </div>
                        <div className="fd-pair__master-meta">
                          <span>V1.3</span>
                          <span className="fd-pair__selected">SELECTED</span>
                        </div>
                      </div>
                    </div>
                    <div className="fd-pair__master fd-pair__master--desktop">
                      <div className="fd-pair__master-label">DESKTOP MASTER</div>
                      <div className="fd-pair__master-row">
                        <div className="fd-pair__thumb fd-pair__thumb--desktop" aria-hidden="true">
                          <span className="fd-pair__thumb-title">
                            THE SIGNAL
                            <br />
                            IS THE INDEX
                          </span>
                          <span className="fd-pair__thumb-block" />
                        </div>
                        <div className="fd-pair__master-meta">
                          <span>V1.1</span>
                          <button type="button" className="fd-btn fd-btn--outline fd-pair__replace">
                            REPLACE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button type="button" className="fd-btn fd-btn--lime">
                PROMOTE MOBILE
              </button>
              <button type="button" className="fd-btn fd-btn--outline">
                PROMOTE DESKTOP
              </button>
              <button type="button" className="fd-btn fd-btn--black">
                PAIR REVIEW
              </button>
              <button type="button" className="fd-btn fd-btn--outline">
                REVIEW AUTHORITY
              </button>
              <button type="button" className="fd-btn fd-btn--black fd-rail__lock">
                <IconLock />
                <span>
                  LOCK MOBILE + DESKTOP
                  <br />
                  AUTHORITY PAIR
                </span>
              </button>
            </aside>
          </section>

          {/* 07 CANDIDATE_GALLERY */}
          <section className="fd-panel fd-gallery" aria-label="Concept candidate gallery">
            <div className="fd-panel__head">
              <span>CONCEPT CANDIDATE GALLERY</span>
              <button type="button" className="fd-panel__head-action">
                COMPARE CONCEPTS <IconSliders />
              </button>
            </div>
            <div className="fd-gallery__track" role="listbox" aria-label="Concept candidates">
              {CANDIDATES.map((c) => {
                const selected = c.id === selectedCandidate;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`fd-card fd-card--${c.kind}${selected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedCandidate(c.id)}
                  >
                    <span className="fd-card__version">{c.id}</span>
                    {selected && (
                      <span className="fd-card__check">
                        <IconCheck />
                      </span>
                    )}
                    {c.kind === 'signal' && <MiniSignalCard className="fd-card__signal" />}
                    {c.kind === 'grid' && (
                      <span className="fd-card__grid" aria-hidden="true">
                        <span className="fd-card__grid-title">
                          THE SIGNAL
                          <br />
                          IS THE INDEX
                        </span>
                        <span className="fd-card__grid-tag">
                          CULTURE AS EVIDENCE.
                          <br />
                          IDEAS AS INDEX.
                          <br />
                          NDXBOOK.
                        </span>
                        <span className="fd-card__grid-plate" />
                      </span>
                    )}
                    {c.kind === 'collage' && (
                      <span className="fd-card__collage" aria-hidden="true">
                        <span className="fd-card__collage-dark">
                          <span className="fd-card__collage-window" />
                        </span>
                        <span className="fd-card__collage-paper">
                          <span className="fd-card__collage-copy">
                            CULTURE AS
                            <br />
                            EVIDENCE.
                            <br />
                            IDEAS AS INDEX.
                          </span>
                          <span className="fd-card__collage-num">001</span>
                        </span>
                      </span>
                    )}
                    {c.kind === 'newsprint' && (
                      <span className="fd-card__newsprint" aria-hidden="true">
                        <Newsprint dense />
                        <span className="fd-card__newsprint-num">001</span>
                        <span className="fd-card__newsprint-copy">
                          THE
                          <br />
                          SIGNAL
                          <br />
                          IS THE
                          <br />
                          INDEX
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button type="button" className="fd-gallery__next" aria-label="Next candidates">
              <IconChevronRight />
            </button>
          </section>

          {/* 08 CANDIDATE_ACTION_BAR */}
          <div className="fd-actions" role="toolbar" aria-label="Candidate actions">
            <button type="button" className="fd-actions__item">
              <IconSliders /> <span>REFINE CONCEPT</span>
            </button>
            <button type="button" className="fd-actions__item">
              <IconRefresh /> <span>REGENERATE CONCEPT</span>
            </button>
            <button type="button" className="fd-actions__item">
              <IconInspect /> <span>INSPECT CANDIDATE</span>
            </button>
            <button type="button" className="fd-actions__item">
              <IconExpand /> <span>VIEW FULLSCREEN</span>
            </button>
          </div>

          {/* 09 STRUCTURED_OUTPUT_REVIEW */}
          <section className="fd-panel fd-structured" aria-label="Structured output review">
            <div className="fd-panel__head">
              <span>STRUCTURED OUTPUT REVIEW</span>
            </div>
            <div className="fd-structured__cols">
              {STRUCTURED_COLUMNS.map((col) => (
                <div key={col.label} className={`fd-structured__col fd-structured__col--${col.kind}`}>
                  <div className="fd-structured__label">{col.label}</div>
                  <div className="fd-structured__title">
                    {col.title[0]}
                    <br />
                    {col.title[1]}
                  </div>
                  <div className={`fd-structured__preview fd-structured__preview--${col.kind}`} aria-hidden="true">
                    {col.kind === 'receipt' && (
                      <>
                        <span className="fd-receipt__line fd-receipt__line--head">index_signal:page_001_indexed</span>
                        <span className="fd-receipt__line">ARCHIVAL_EVIDENCE_ATTACHED</span>
                        <span className="fd-receipt__grid" />
                      </>
                    )}
                    {col.kind === 'overlay' && (
                      <>
                        <Newsprint />
                        <span className="fd-overlay__num">001</span>
                        <span className="fd-overlay__mark" />
                      </>
                    )}
                    {col.kind === 'pack' && (
                      <>
                        <span className="fd-pack__tile fd-pack__tile--1" />
                        <span className="fd-pack__tile fd-pack__tile--2" />
                        <span className="fd-pack__tile fd-pack__tile--3" />
                        <span className="fd-pack__tile fd-pack__tile--4" />
                        <span className="fd-pack__tile fd-pack__tile--5" />
                      </>
                    )}
                    {col.kind === 'functions' && (
                      <ul className="fd-functions">
                        {FUNCTION_MAP.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="fd-structured__foot">
                    <span>{col.source}</span>
                    <IconDoc />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10 PIPELINE_READINESS */}
          <section className="fd-panel fd-readiness" aria-label="Pipeline readiness">
            <div className="fd-panel__head">
              <span>PIPELINE / READINESS</span>
            </div>
            <div className="fd-readiness__cols">
              <div className="fd-readiness__col fd-readiness__col--gauge">
                <div className="fd-label">READINESS</div>
                <div className="fd-gauge">
                  <svg viewBox="0 0 56 56" width="56" height="56" role="img" aria-label="82 percent ready">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#d9d9d9" strokeWidth="4" />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="#4f8a32"
                      strokeWidth="4"
                      strokeDasharray={`${(readiness.circumference * readiness.percent) / 100} ${readiness.circumference}`}
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <span className="fd-gauge__value">{readiness.percent}%</span>
                  <span className="fd-gauge__ready">READY</span>
                </div>
                <div className="fd-readiness__compiles">
                  COMPILES: <em>READY</em> <i className="fd-dot fd-dot--green" />
                </div>
              </div>
              <div className="fd-readiness__col fd-readiness__col--checks">
                <div className="fd-label">CHECKS</div>
                <ul className="fd-checks">
                  {CHECKS.map((c) => (
                    <li key={c.label}>
                      <span>{c.label}</span>
                      <i className={`fd-check-dot fd-check-dot--${c.state}`} aria-label={c.state === 'ok' ? 'pass' : 'warning'} />
                    </li>
                  ))}
                </ul>
                <button type="button" className="fd-btn fd-btn--outline fd-readiness__details">
                  VIEW DETAILS
                </button>
              </div>
              <div className="fd-readiness__col fd-readiness__col--status">
                <div className="fd-label">STATUS</div>
                <dl className="fd-status">
                  {STATUS_ROWS.map(([k, v]) => (
                    <div key={k} className="fd-status__row">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="fd-readiness__col fd-readiness__col--next">
                <div className="fd-label">NEXT ACTION</div>
                <div className="fd-readiness__next-text">
                  PROMOTE MOBILE MASTER
                  <br />
                  TO AUTHORITY PAIR
                </div>
                <button type="button" className="fd-btn fd-btn--lime">
                  PRIMARY ACTION
                </button>
                <button type="button" className="fd-btn fd-btn--outline">
                  MOVE TO BUILD WHEN READY
                </button>
                <button type="button" className="fd-btn fd-btn--outline">
                  VIEW TECHNICAL DETAILS
                </button>
              </div>
            </div>
          </section>

          {/* 11 CONCEPT_HISTORY_TABS + 12 CONCEPT_DATA_ROW */}
          <section className="fd-sheet" aria-label="Concept data">
            <span className="fd-sheet__grabber" aria-hidden="true" />
            <div className="fd-sheet__tabs" role="tablist" aria-label="Concept history">
              {LOWER_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={lowerTab === t}
                  className={`fd-sheet__tab${lowerTab === t ? ' is-active' : ''}`}
                  onClick={() => setLowerTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="fd-sheet__row" role="tabpanel">
              <MiniSignalCard className="fd-sheet__thumb" />
              <dl className="fd-sheet__meta">
                <div>
                  <dt>CONCEPT ID:</dt>
                  <dd>ENTRY001_V1.3</dd>
                </div>
                <div>
                  <dt>CREATED:</dt>
                  <dd>2024-05-18</dd>
                </div>
                <div>
                  <dt>UPDATED:</dt>
                  <dd>2024-05-18</dd>
                </div>
                <div>
                  <dt>AUTHOR:</dt>
                  <dd>DESIGN SYSTEM</dd>
                </div>
                <div>
                  <dt>ARTIFACT TYPE:</dt>
                  <dd>ENTRY COVER</dd>
                </div>
                <div>
                  <dt>SOURCE:</dt>
                  <dd>ENTRY001-CAMPAIGN-ARCHIVE</dd>
                </div>
              </dl>
              <div className="fd-sheet__amendment">
                <div className="fd-sheet__amendment-title">
                  <span>NAA-RSF1-AUTHORITY-SELECTION-V1</span>
                  <span className="fd-sheet__active">ACTIVE</span>
                </div>
                <dl className="fd-sheet__meta fd-sheet__meta--amend">
                  <div>
                    <dt>AMENDMENT TYPE:</dt>
                    <dd>AUTHORITY SELECTION</dd>
                  </div>
                  <div>
                    <dt>EFFECTIVE:</dt>
                    <dd>2024-05-15</dd>
                  </div>
                  <div>
                    <dt>SCOPE:</dt>
                    <dd>DESIGN WORKSPACE</dd>
                  </div>
                  <div>
                    <dt>AUTHORITY WORKFLOW:</dt>
                    <dd>ENABLED</dd>
                  </div>
                </dl>
                <button type="button" className="fd-btn fd-btn--outline fd-sheet__view">
                  VIEW AMENDMENT
                </button>
              </div>
            </div>
          </section>

          {/* 13 BOTTOM_NAVIGATION */}
          <nav className="fd-bottom" aria-label="Workspace navigation">
            {BOTTOM_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`fd-bottom__item${bottomNav === item.id ? ' is-active' : ''}`}
                aria-current={bottomNav === item.id ? 'page' : undefined}
                onClick={() => setBottomNav(item.id)}
              >
                <span className="fd-bottom__icon">{item.icon}</span>
                <span className="fd-bottom__label">
                  {item.lines.map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </span>
                <span className="fd-bottom__bar" />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default DesignTwinFableDirectPage;
