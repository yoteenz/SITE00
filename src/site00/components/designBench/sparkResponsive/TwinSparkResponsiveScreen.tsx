/**
 * P0.VR.DESIGNBENCH.SPARK-RESPONSIVE-OPUSGROK1 — isolated direct reconstruction of the NDXBOOK
 * DESIGN golden reference (768 x 1376).
 *
 * Real DOM + CSS only. The golden is never painted into the page as a raster:
 * every band, panel, column and control below is live markup.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TWIN_SPARK_RESPONSIVE_AMENDMENT,
  TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR,
  TWIN_SPARK_RESPONSIVE_BOTTOM_NAV,
  TWIN_SPARK_RESPONSIVE_CANDIDATE_ACTIONS,
  TWIN_SPARK_RESPONSIVE_CANDIDATES,
  TWIN_SPARK_RESPONSIVE_CHECKS,
  TWIN_SPARK_RESPONSIVE_CONCEPT_FIELDS,
  TWIN_SPARK_RESPONSIVE_CONCEPT_TABS,
  TWIN_SPARK_RESPONSIVE_CONTEXT,
  TWIN_SPARK_RESPONSIVE_GALLERY,
  TWIN_SPARK_RESPONSIVE_HEADER,
  TWIN_SPARK_RESPONSIVE_HERO,
  TWIN_SPARK_RESPONSIVE_NEXT_ACTION,
  TWIN_SPARK_RESPONSIVE_OUTPUT_COLUMNS,
  TWIN_SPARK_RESPONSIVE_OUTPUT_TITLE,
  TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE,
  TWIN_SPARK_RESPONSIVE_PIPELINE_TITLE,
  TWIN_SPARK_RESPONSIVE_PRIMARY_NAV,
  TWIN_SPARK_RESPONSIVE_RAIL_ACTIONS,
  TWIN_SPARK_RESPONSIVE_READINESS,
  TWIN_SPARK_RESPONSIVE_SELECT_ACTIONS,
  TWIN_SPARK_RESPONSIVE_STAGE,
  TWIN_SPARK_RESPONSIVE_STATUS_ROWS,
  TWIN_SPARK_RESPONSIVE_TARGET,
  TWIN_SPARK_RESPONSIVE_VIEWPORTS,
  type TwinSparkResponsiveCandidateSurface,
  type TwinSparkResponsiveOutputColumn,
  type TwinSparkResponsiveViewportId,
} from './twinSparkResponsiveContent';
import {
  TsrIconBolt,
  TsrIconCaretDown,
  TsrIconCheck,
  TsrIconCheckCircle,
  TsrIconChevronRight,
  TsrIconChevronUp,
  TsrIconCompare,
  TsrIconCycle,
  TsrIconDesktop,
  TsrIconDoc,
  TsrIconDocArrow,
  TsrIconDocGear,
  TsrIconEllipsisVertical,
  TsrIconExpand,
  TsrIconGrid,
  TsrIconHistory,
  TsrIconInspect,
  TsrIconLock,
  TsrIconLockOpen,
  TsrIconMenu,
  TsrIconPhone,
  TsrIconShieldCheck,
  TsrIconSliders,
  TsrIconWarnCircle,
  TsrIconTablet,
  TsrPointingHandPlate,
} from './TwinSparkResponsiveIcons';

const VIEWPORT_ICONS: Record<TwinSparkResponsiveViewportId, (props: { className?: string }) => JSX.Element> = {
  MOBILE: TsrIconPhone,
  TABLET: TsrIconTablet,
  DESKTOP: TsrIconDesktop,
};

const ACTION_ICONS = {
  sliders: TsrIconSliders,
  cycle: TsrIconCycle,
  inspect: TsrIconInspect,
  expand: TsrIconExpand,
} as const;

const BOTTOM_ICONS = {
  grid: TsrIconGrid,
  history: TsrIconHistory,
  doc: TsrIconDocArrow,
  shield: TsrIconShieldCheck,
  bolt: TsrIconBolt,
} as const;

/**
 * SPARK-RESPONSIVE: the source artboard scaling shell is intentionally NOT
 * forked. The 768px artboard geometry is preserved 1:1 inside `.tsr-screen`,
 * and viewport adaptation is done with real responsive CSS (see the
 * mobile/tablet/desktop layers at the end of site00-twin-spark-responsive.css)
 * instead of a transform scale. No other DOM, state or interaction changed.
 */
function useResponsiveShell() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const measure = () => setAtTop(window.scrollY < 4);
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    return () => window.removeEventListener('scroll', measure);
  }, []);

  return { atTop };
}

/** Archival plate: repo paper scan + inline ink silhouette + annotation marks. */
function TsrArchivalPlate({ className, marks = true }: { className?: string; marks?: boolean }) {
  return (
    <div className={className ? `tsr-plate ${className}` : 'tsr-plate'}>
      <div
        className="tsr-plate__paper"
        style={{ backgroundImage: `url(${TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE})` }}
      />
      <div className="tsr-plate__rules" aria-hidden="true" />
      <TsrPointingHandPlate className="tsr-plate__hand" />
      {marks ? (
        <div className="tsr-plate__marks" aria-hidden="true">
          <span className="tsr-plate__mark tsr-plate__mark--a">green</span>
          <span className="tsr-plate__mark tsr-plate__mark--b">Cert. Ref:</span>
          <span className="tsr-plate__mark tsr-plate__mark--c">P.137</span>
          <span className="tsr-plate__mark tsr-plate__mark--d">P. 208</span>
          <span className="tsr-plate__mark tsr-plate__mark--e">P. 311</span>
        </div>
      ) : null}
    </div>
  );
}

function TsrCandidateSurface({ surface }: { surface: TwinSparkResponsiveCandidateSurface }) {
  if (surface === 'plate') {
    return (
      <div className="tsr-card__surface tsr-card__surface--plate">
        <div className="tsr-card__copy">
          <p className="tsr-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tsr-card__standfirst">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <TsrArchivalPlate className="tsr-card__plate" marks={false} />
      </div>
    );
  }
  if (surface === 'grain') {
    return (
      <div className="tsr-card__surface tsr-card__surface--grain">
        <div className="tsr-card__copy">
          <p className="tsr-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tsr-card__standfirst tsr-card__standfirst--dim">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <div className="tsr-card__grid" aria-hidden="true" />
      </div>
    );
  }
  if (surface === 'collage') {
    return (
      <div className="tsr-card__surface tsr-card__surface--collage">
        <div className="tsr-card__stack" aria-hidden="true">
          <span className="tsr-card__scrap tsr-card__scrap--1" />
          <span className="tsr-card__scrap tsr-card__scrap--2" />
          <span className="tsr-card__scrap tsr-card__scrap--3" />
          <span className="tsr-card__scrap tsr-card__scrap--4" />
          <span className="tsr-card__scrap tsr-card__scrap--5" />
        </div>
        <div className="tsr-card__sheet" aria-hidden="true" />
        <div className="tsr-card__collageCopy">
          <span className="tsr-card__collageLead">CULTURE AS</span>
          <span className="tsr-card__collageLead">EVIDENCE.</span>
          <span className="tsr-card__collageLead">IDEAS AS INDEX.</span>
        </div>
        <span className="tsr-card__stamp">001</span>
      </div>
    );
  }
  return (
    <div className="tsr-card__surface tsr-card__surface--archive">
      <div className="tsr-card__archivePaper" aria-hidden="true" />
      <div className="tsr-card__archiveInk">
        <span className="tsr-card__archiveStamp" aria-hidden="true">001</span>
        <span className="tsr-card__archiveRule" aria-hidden="true" />
        <span className="tsr-card__archiveHead">
          <span>THE</span>
          <span>SIGNAL</span>
          <span>IS THE</span>
          <span>INDEX</span>
        </span>
      </div>
      <span className="tsr-card__archiveChip" aria-hidden="true">001</span>
    </div>
  );
}

function TsrOutputPreview({ column }: { column: TwinSparkResponsiveOutputColumn }) {
  if (column.preview === 'manifest') {
    return (
      <div className="tsr-out__preview tsr-out__preview--manifest" aria-hidden="true">
        <span className="tsr-out__manifestTitle">index_signal:page_001_indexed</span>
        <span className="tsr-out__manifestRule" />
        <span className="tsr-out__manifestRule" />
        <span className="tsr-out__manifestRule" />
        <span className="tsr-out__manifestGrid">
          {Array.from({ length: 12 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="tsr-out__manifestStamp">01204</span>
      </div>
    );
  }
  if (column.preview === 'blueprint') {
    return (
      <div className="tsr-out__preview tsr-out__preview--blueprint" aria-hidden="true">
        <span className="tsr-out__blueGrid" />
        <span className="tsr-out__blueCross" />
      </div>
    );
  }
  if (column.preview === 'overlay') {
    return (
      <div className="tsr-out__preview tsr-out__preview--overlay" aria-hidden="true">
        <span
          className="tsr-out__overlayPaper"
          style={{ backgroundImage: `url(${TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE})` }}
        />
        <span className="tsr-out__overlayNote">CULTURE AS EVIDENCE.</span>
        <span className="tsr-out__overlayInk">001</span>
        <span className="tsr-out__overlayMark" />
      </div>
    );
  }
  if (column.preview === 'evidence') {
    return (
      <div className="tsr-out__preview tsr-out__preview--evidence" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`tsr-out__evidenceTile tsr-out__evidenceTile--${index + 1}`}
            style={{ backgroundImage: `url(${TWIN_SPARK_RESPONSIVE_PAPER_TEXTURE})` }}
          />
        ))}
      </div>
    );
  }
  return (
    <ul className="tsr-out__preview tsr-out__preview--functions">
      {(column.functions ?? []).map((fn) => (
        <li key={fn}>{fn}</li>
      ))}
    </ul>
  );
}

export function TwinSparkResponsiveScreen() {
  const { atTop } = useResponsiveShell();
  const [viewport, setViewport] = useState<TwinSparkResponsiveViewportId>('MOBILE');
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(TWIN_SPARK_RESPONSIVE_CANDIDATES[0].id);
  const [pairOpen, setPairOpen] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const readinessDash = useMemo(() => {
    const circumference = 2 * Math.PI * 30;
    return {
      circumference,
      offset: circumference * (1 - TWIN_SPARK_RESPONSIVE_READINESS.percent / 100),
    };
  }, []);

  const scrollGallery = useCallback(() => {
    const node = galleryRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.6, behavior: 'smooth' });
  }, []);

  return (
    <div className="tsr-root" data-at-top={atTop ? 'true' : 'false'}>
      <div className="tsr-stage">
        <div
          className="tsr-screen"
          data-testid="twin-spark-responsive-screen"
        >
          {/* 01 SITE00_HEADER */}
          <header className="tsr-header">
            <div className="tsr-header__crumbs">
              <span className="tsr-header__brand">{TWIN_SPARK_RESPONSIVE_HEADER.brand}</span>
              <span className="tsr-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tsr-header__project">{TWIN_SPARK_RESPONSIVE_HEADER.project}</span>
              <span className="tsr-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tsr-header__page">{TWIN_SPARK_RESPONSIVE_HEADER.page}</span>
            </div>
            <div className="tsr-header__status">
              <span className="tsr-header__compiler">{TWIN_SPARK_RESPONSIVE_HEADER.compiler}</span>
              <span className="tsr-dot tsr-dot--lime" aria-hidden="true" />
              <button type="button" className="tsr-header__more" aria-label="Workspace options">
                <TsrIconEllipsisVertical className="tsr-ico" />
              </button>
            </div>
          </header>

          {/* 02 PRIMARY_NAV */}
          <nav className="tsr-nav" aria-label="Design workspace sections">
            <button type="button" className="tsr-nav__cell tsr-nav__cell--menu" aria-label="Open workspace menu">
              <TsrIconMenu className="tsr-ico" />
            </button>
            {TWIN_SPARK_RESPONSIVE_PRIMARY_NAV.map((label, index) => (
              <button
                key={label}
                type="button"
                className="tsr-nav__cell"
                aria-current={navIndex === index ? 'page' : undefined}
                onClick={() => setNavIndex(index)}
              >
                {label}
              </button>
            ))}
            <button type="button" className="tsr-nav__cell tsr-nav__cell--more">
              MORE
              <TsrIconCaretDown className="tsr-ico tsr-nav__caret" />
            </button>
          </nav>

          {/* 03 NDXBOOK_CONTEXT_BAR */}
          <div className="tsr-context">
            <span className="tsr-context__chip">{TWIN_SPARK_RESPONSIVE_CONTEXT.chip}</span>
            <span className="tsr-context__stream">{TWIN_SPARK_RESPONSIVE_CONTEXT.stream}</span>
            <span className="tsr-context__right">
              {TWIN_SPARK_RESPONSIVE_CONTEXT.right}
              <span className="tsr-dot tsr-dot--lime" aria-hidden="true" />
            </span>
          </div>

          {/* 04 TARGET_VIEWPORT_STAGE_BAND */}
          <section className="tsr-band" aria-label="Target, viewport and stage">
            <div className="tsr-band__col tsr-band__col--target">
              <span className="tsr-band__label">{TWIN_SPARK_RESPONSIVE_TARGET.label}</span>
              {TWIN_SPARK_RESPONSIVE_TARGET.lines.map((line) => (
                <span key={line} className="tsr-band__value">
                  {line}
                </span>
              ))}
            </div>
            <div className="tsr-band__col tsr-band__col--viewport">
              <span className="tsr-band__label">VIEWPORT</span>
              <div className="tsr-band__devices" role="group" aria-label="Target viewport">
                {TWIN_SPARK_RESPONSIVE_VIEWPORTS.map((id) => {
                  const Icon = VIEWPORT_ICONS[id];
                  const active = viewport === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`tsr-device${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setViewport(id)}
                    >
                      <Icon className="tsr-device__ico" />
                      <span className="tsr-device__label">{id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="tsr-band__col tsr-band__col--stage">
              <span className="tsr-band__label">{TWIN_SPARK_RESPONSIVE_STAGE.stageLabel}</span>
              <span className="tsr-band__stage">{TWIN_SPARK_RESPONSIVE_STAGE.stageValue}</span>
              <span className="tsr-band__label tsr-band__label--second">
                {TWIN_SPARK_RESPONSIVE_STAGE.authorityLabel}
              </span>
              <span className="tsr-band__stage tsr-band__stage--lock">
                {TWIN_SPARK_RESPONSIVE_STAGE.authorityValue}
                <TsrIconLockOpen className="tsr-ico tsr-band__lock" />
              </span>
            </div>
          </section>

          <main className="tsr-main">
            {/* 05 MAIN_HERO + 06 AUTHORITY_RAIL */}
            <section className="tsr-herorow" aria-label="Active concept and authority controls">
              <article className="tsr-hero">
                <div className="tsr-hero__eyebrow">
                  <span>{TWIN_SPARK_RESPONSIVE_HERO.eyebrowLeft}</span>
                  <span className="tsr-hero__eyebrowRight">
                    <span>{TWIN_SPARK_RESPONSIVE_HERO.eyebrowCentre}</span>
                    <span>{TWIN_SPARK_RESPONSIVE_HERO.eyebrowRight}</span>
                  </span>
                </div>
                <h1 className="tsr-hero__headline">
                  {TWIN_SPARK_RESPONSIVE_HERO.headline.map((line) => (
                    <span key={line} className="tsr-hero__headlineLine">
                      <span className="tsr-hero__headlineInk">{line}</span>
                    </span>
                  ))}
                </h1>
                <p className="tsr-hero__standfirst">
                  {TWIN_SPARK_RESPONSIVE_HERO.standfirst.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
                <TsrArchivalPlate className="tsr-hero__plate" />
                <div className="tsr-hero__footer">
                  <span className="tsr-hero__footerBlock">
                    {TWIN_SPARK_RESPONSIVE_HERO.footerLeft.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="tsr-hero__footerPip" aria-hidden="true">
                    <TsrIconChevronRight className="tsr-ico" />
                  </span>
                  <span className="tsr-hero__footerBlock">
                    {TWIN_SPARK_RESPONSIVE_HERO.footerMid.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="tsr-hero__footerChip">{TWIN_SPARK_RESPONSIVE_HERO.chip}</span>
                  <span className="tsr-hero__footerCount">{TWIN_SPARK_RESPONSIVE_HERO.overflow}</span>
                </div>
              </article>

              <aside className="tsr-rail" aria-label="Authority rail">
                <div className="tsr-rail__select">
                  <button type="button" className="tsr-rail__selectBtn" aria-pressed>
                    <TsrIconCheck className="tsr-ico tsr-rail__selectCheck" />
                    {TWIN_SPARK_RESPONSIVE_SELECT_ACTIONS.mobile.label}
                  </button>
                  <span className="tsr-rail__selectState">
                    {TWIN_SPARK_RESPONSIVE_SELECT_ACTIONS.mobile.state}
                  </span>
                </div>
                <button type="button" className="tsr-rail__ghost">
                  {TWIN_SPARK_RESPONSIVE_SELECT_ACTIONS.desktop.label}
                </button>

                <section className="tsr-pair">
                  <button
                    type="button"
                    className="tsr-pair__head"
                    aria-expanded={pairOpen}
                    onClick={() => setPairOpen((open) => !open)}
                  >
                    {TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.title}
                    <TsrIconChevronUp className={`tsr-ico tsr-pair__caret${pairOpen ? '' : ' is-closed'}`} />
                  </button>
                  <div className="tsr-pair__body" hidden={!pairOpen}>
                    <div className="tsr-pair__row tsr-pair__row--mobile">
                      <span className="tsr-pair__label">{TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.mobile.label}</span>
                      <span className="tsr-pair__version">
                        {TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.mobile.version}
                      </span>
                      <div className="tsr-pair__thumb tsr-pair__thumb--mobile">
                        <span className="tsr-pair__thumbCopy">
                          <span>THE SIGNAL</span>
                          <span>IS THE INDEX</span>
                        </span>
                        <TsrArchivalPlate className="tsr-pair__thumbPlate" marks={false} />
                      </div>
                      <span className="tsr-pair__state">
                        {TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.mobile.state}
                      </span>
                    </div>
                    <div className="tsr-pair__row tsr-pair__row--desktop">
                      <span className="tsr-pair__label">{TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.desktop.label}</span>
                      <span className="tsr-pair__version">
                        {TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.desktop.version}
                      </span>
                      <div className="tsr-pair__thumb tsr-pair__thumb--desktop">
                        <span className="tsr-pair__thumbCopy">
                          <span>THE SIGNAL</span>
                          <span>IS THE INDEX</span>
                        </span>
                        <span className="tsr-pair__thumbWedge" aria-hidden="true" />
                      </div>
                      <button type="button" className="tsr-pair__replace">
                        {TWIN_SPARK_RESPONSIVE_AUTHORITY_PAIR.desktop.action}
                      </button>
                    </div>
                  </div>
                </section>

                {TWIN_SPARK_RESPONSIVE_RAIL_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`tsr-rail__action tsr-rail__action--${action.tone}${
                      action.lock ? ' tsr-rail__action--lock' : ''
                    }`}
                  >
                    {action.lock ? <TsrIconLock className="tsr-ico tsr-rail__lockIco" /> : null}
                    {action.lines ? (
                      <span className="tsr-rail__actionLines">
                        {action.lines.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </span>
                    ) : (
                      action.label
                    )}
                  </button>
                ))}
              </aside>
            </section>

            {/* 07 CANDIDATE_GALLERY */}
            <section className="tsr-gallery" aria-label={TWIN_SPARK_RESPONSIVE_GALLERY.title}>
              <header className="tsr-gallery__head">
                <h2 className="tsr-gallery__title">{TWIN_SPARK_RESPONSIVE_GALLERY.title}</h2>
                <button type="button" className="tsr-gallery__compare">
                  {TWIN_SPARK_RESPONSIVE_GALLERY.compare}
                  <TsrIconCompare className="tsr-ico tsr-gallery__compareIco" />
                </button>
              </header>
              <div className="tsr-gallery__body">
                <div className="tsr-gallery__rail" ref={galleryRef}>
                  {TWIN_SPARK_RESPONSIVE_CANDIDATES.map((candidate) => {
                    const active = candidate.id === candidateId;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        className={`tsr-card${active ? ' is-active' : ''}`}
                        aria-pressed={active}
                        onClick={() => setCandidateId(candidate.id)}
                      >
                        {candidate.versionTag === 'none' ? null : (
                          <span className={`tsr-card__version tsr-card__version--${candidate.versionTag}`}>
                            {candidate.version}
                          </span>
                        )}
                        {active ? (
                          <span className="tsr-card__tick" aria-hidden="true">
                            <TsrIconCheck className="tsr-ico" />
                          </span>
                        ) : null}
                        <TsrCandidateSurface surface={candidate.surface} />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="tsr-gallery__next"
                  aria-label="Show more concept candidates"
                  onClick={scrollGallery}
                >
                  <TsrIconChevronRight className="tsr-ico" />
                </button>
              </div>

              {/* 08 CANDIDATE_ACTION_ROW — inside the gallery panel in the golden */}
              <div className="tsr-actions" role="group" aria-label="Concept candidate actions">
                {TWIN_SPARK_RESPONSIVE_CANDIDATE_ACTIONS.map((action) => {
                  const Icon = ACTION_ICONS[action.icon];
                  return (
                    <button key={action.id} type="button" className="tsr-actions__cell">
                      <Icon className="tsr-ico tsr-actions__ico" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 09 STRUCTURED_OUTPUT_REVIEW */}
            <section className="tsr-out" aria-label={TWIN_SPARK_RESPONSIVE_OUTPUT_TITLE}>
              <header className="tsr-out__head">
                <h2 className="tsr-out__title">{TWIN_SPARK_RESPONSIVE_OUTPUT_TITLE}</h2>
              </header>
              <div className="tsr-out__cols">
                {TWIN_SPARK_RESPONSIVE_OUTPUT_COLUMNS.map((column) => (
                  <div key={column.id} className="tsr-out__col">
                    <span className="tsr-out__label">{column.label}</span>
                    <span className="tsr-out__lines">
                      <span>{column.lines[0]}</span>
                      <span>{column.lines[1]}</span>
                    </span>
                    <TsrOutputPreview column={column} />
                    <span className="tsr-out__source">
                      <span className="tsr-out__sourceText">{column.source}</span>
                      {column.preview === 'functions' ? (
                        <TsrIconDocGear className="tsr-ico tsr-out__sourceIco" />
                      ) : (
                        <TsrIconDoc className="tsr-ico tsr-out__sourceIco" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 10 PIPELINE_READINESS */}
            <section className="tsr-pipe" aria-label={TWIN_SPARK_RESPONSIVE_PIPELINE_TITLE}>
              <header className="tsr-pipe__head">
                <h2 className="tsr-pipe__title">{TWIN_SPARK_RESPONSIVE_PIPELINE_TITLE}</h2>
              </header>
              <div className="tsr-pipe__cols">
                <div className="tsr-pipe__col tsr-pipe__col--readiness">
                  <span className="tsr-pipe__label">{TWIN_SPARK_RESPONSIVE_READINESS.label}</span>
                  <div className="tsr-pipe__gauge">
                    <svg viewBox="0 0 68 68" className="tsr-pipe__ring" aria-hidden="true">
                      <circle cx="34" cy="34" r="30" className="tsr-pipe__ringTrack" />
                      <circle
                        cx="34"
                        cy="34"
                        r="30"
                        className="tsr-pipe__ringValue"
                        strokeDasharray={readinessDash.circumference}
                        strokeDashoffset={readinessDash.offset}
                      />
                    </svg>
                    <span className="tsr-pipe__gaugeValue">{TWIN_SPARK_RESPONSIVE_READINESS.percent}%</span>
                    <span className="tsr-pipe__gaugeState">{TWIN_SPARK_RESPONSIVE_READINESS.state}</span>
                  </div>
                  <span className="tsr-pipe__compiler">
                    {TWIN_SPARK_RESPONSIVE_READINESS.compiler}
                    <span className="tsr-pipe__compilerState">
                      {TWIN_SPARK_RESPONSIVE_READINESS.compilerState}
                    </span>
                    <span className="tsr-dot tsr-dot--green" aria-hidden="true" />
                  </span>
                </div>

                <div className="tsr-pipe__col tsr-pipe__col--checks">
                  <span className="tsr-pipe__label">{TWIN_SPARK_RESPONSIVE_READINESS.checksLabel}</span>
                  <ul className="tsr-pipe__checks">
                    {TWIN_SPARK_RESPONSIVE_CHECKS.map((check) => (
                      <li key={check.id}>
                        <span>{check.label}</span>
                        {check.state === 'pass' ? (
                          <TsrIconCheckCircle className="tsr-ico tsr-pipe__checkPass" />
                        ) : (
                          <TsrIconWarnCircle className="tsr-ico tsr-pipe__checkWarn" />
                        )}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="tsr-pipe__details">
                    {TWIN_SPARK_RESPONSIVE_READINESS.viewDetails}
                  </button>
                </div>

                <div className="tsr-pipe__col tsr-pipe__col--status">
                  <span className="tsr-pipe__label">{TWIN_SPARK_RESPONSIVE_READINESS.statusLabel}</span>
                  <ul className="tsr-pipe__status">
                    {TWIN_SPARK_RESPONSIVE_STATUS_ROWS.map((row) => (
                      <li key={row.id}>
                        <span>{row.label}</span>
                        <span className="tsr-pipe__statusValue">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tsr-pipe__col tsr-pipe__col--next">
                  <span className="tsr-pipe__label">{TWIN_SPARK_RESPONSIVE_NEXT_ACTION.label}</span>
                  <p className="tsr-pipe__nextCopy">
                    {TWIN_SPARK_RESPONSIVE_NEXT_ACTION.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                  <button type="button" className="tsr-pipe__primary">
                    {TWIN_SPARK_RESPONSIVE_NEXT_ACTION.primary}
                  </button>
                  {TWIN_SPARK_RESPONSIVE_NEXT_ACTION.secondary.map((label) => (
                    <button key={label} type="button" className="tsr-pipe__secondary">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* 11 CONCEPT_HISTORY_TABS + 12 CONCEPT_DATA_ROW + 13 BOTTOM_NAVIGATION */}
          <div className="tsr-dock">
            <div className="tsr-tabs">
              <span className="tsr-tabs__handle" aria-hidden="true" />
              <div className="tsr-tabs__list" role="tablist" aria-label="Concept record">
                {TWIN_SPARK_RESPONSIVE_CONCEPT_TABS.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`tsr-tab-${index}`}
                    aria-selected={tabIndex === index}
                    aria-controls="tsr-concept-panel"
                    tabIndex={tabIndex === index ? 0 : -1}
                    className={`tsr-tabs__tab${tabIndex === index ? ' is-active' : ''}`}
                    onClick={() => setTabIndex(index)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="tsr-concept"
              id="tsr-concept-panel"
              role="tabpanel"
              aria-labelledby={`tsr-tab-${tabIndex}`}
            >
              <div className="tsr-concept__thumb">
                <span className="tsr-concept__thumbVersion">V1.3</span>
                <span className="tsr-concept__thumbCopy">
                  <span>THE SIGNAL</span>
                  <span>IS THE INDEX</span>
                </span>
                <span className="tsr-concept__thumbStandfirst">
                  <span>CULTURE AS EVIDENCE.</span>
                  <span>IDEAS AS INDEX.</span>
                  <span>NDXBOOK.</span>
                </span>
                <TsrArchivalPlate className="tsr-concept__thumbPlate" marks={false} />
              </div>
              <dl className="tsr-concept__fields">
                {TWIN_SPARK_RESPONSIVE_CONCEPT_FIELDS.map((field) => (
                  <div key={field.label} className="tsr-concept__field">
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="tsr-concept__amendment">
                <div className="tsr-concept__amendHead">
                  <span className="tsr-concept__amendTitle">{TWIN_SPARK_RESPONSIVE_AMENDMENT.title}</span>
                  <span className="tsr-concept__amendChip">{TWIN_SPARK_RESPONSIVE_AMENDMENT.chip}</span>
                </div>
                <dl className="tsr-concept__fields tsr-concept__fields--amend">
                  {TWIN_SPARK_RESPONSIVE_AMENDMENT.fields.map((field) => (
                    <div key={field.label} className="tsr-concept__field">
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <button type="button" className="tsr-concept__view">
                {TWIN_SPARK_RESPONSIVE_AMENDMENT.action}
              </button>
            </div>

            <nav className="tsr-bottom" aria-label="Design workspace">
              {TWIN_SPARK_RESPONSIVE_BOTTOM_NAV.map((item, index) => {
                const Icon = BOTTOM_ICONS[item.icon];
                const active = dockIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tsr-bottom__cell${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setDockIndex(index)}
                  >
                    <Icon className="tsr-ico tsr-bottom__ico" />
                    <span className="tsr-bottom__label">
                      {item.lines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
