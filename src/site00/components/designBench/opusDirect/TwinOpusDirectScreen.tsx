/**
 * P0.VR.DESIGNBENCH.OPUS-DIRECT1 — isolated direct reconstruction of the NDXBOOK
 * DESIGN golden reference (768 x 1376).
 *
 * Real DOM + CSS only. The golden is never painted into the page as a raster:
 * every band, panel, column and control below is live markup.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TWIN_OPUS_DIRECT_AMENDMENT,
  TWIN_OPUS_DIRECT_AUTHORITY_PAIR,
  TWIN_OPUS_DIRECT_BOTTOM_NAV,
  TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
  TWIN_OPUS_DIRECT_CANDIDATES,
  TWIN_OPUS_DIRECT_CHECKS,
  TWIN_OPUS_DIRECT_CONCEPT_FIELDS,
  TWIN_OPUS_DIRECT_CONCEPT_TABS,
  TWIN_OPUS_DIRECT_CONTEXT,
  TWIN_OPUS_DIRECT_GALLERY,
  TWIN_OPUS_DIRECT_HEADER,
  TWIN_OPUS_DIRECT_HERO,
  TWIN_OPUS_DIRECT_NEXT_ACTION,
  TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
  TWIN_OPUS_DIRECT_OUTPUT_TITLE,
  TWIN_OPUS_DIRECT_PAPER_TEXTURE,
  TWIN_OPUS_DIRECT_PIPELINE_TITLE,
  TWIN_OPUS_DIRECT_PRIMARY_NAV,
  TWIN_OPUS_DIRECT_RAIL_ACTIONS,
  TWIN_OPUS_DIRECT_READINESS,
  TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT,
  TWIN_OPUS_DIRECT_SELECT_ACTIONS,
  TWIN_OPUS_DIRECT_STAGE,
  TWIN_OPUS_DIRECT_STATUS_ROWS,
  TWIN_OPUS_DIRECT_TARGET,
  TWIN_OPUS_DIRECT_VIEWPORTS,
  type TwinOpusDirectCandidateSurface,
  type TwinOpusDirectOutputColumn,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';
import {
  TodIconBolt,
  TodIconCaretDown,
  TodIconCheck,
  TodIconCheckCircle,
  TodIconChevronRight,
  TodIconChevronUp,
  TodIconCompare,
  TodIconCycle,
  TodIconDesktop,
  TodIconDoc,
  TodIconDocArrow,
  TodIconDocGear,
  TodIconEllipsisVertical,
  TodIconExpand,
  TodIconGrid,
  TodIconHistory,
  TodIconInspect,
  TodIconLock,
  TodIconLockOpen,
  TodIconMenu,
  TodIconPhone,
  TodIconShieldCheck,
  TodIconSliders,
  TodIconTablet,
  TodPointingHandPlate,
} from './TwinOpusDirectIcons';

const { width: ART_W, height: ART_H } = TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT;

const VIEWPORT_ICONS: Record<TwinOpusDirectViewportId, (props: { className?: string }) => JSX.Element> = {
  MOBILE: TodIconPhone,
  TABLET: TodIconTablet,
  DESKTOP: TodIconDesktop,
};

const ACTION_ICONS = {
  sliders: TodIconSliders,
  cycle: TodIconCycle,
  inspect: TodIconInspect,
  expand: TodIconExpand,
} as const;

const BOTTOM_ICONS = {
  grid: TodIconGrid,
  history: TodIconHistory,
  doc: TodIconDocArrow,
  shield: TodIconShieldCheck,
  bolt: TodIconBolt,
} as const;

function useArtboardScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth || ART_W;
      const vh = window.innerHeight || ART_H;
      setScale(Math.min(vw / ART_W, vh / ART_H));
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  return scale;
}

/** Archival plate: repo paper scan + inline ink silhouette + annotation marks. */
function TodArchivalPlate({ className, marks = true }: { className?: string; marks?: boolean }) {
  return (
    <div className={className ? `tod-plate ${className}` : 'tod-plate'}>
      <div
        className="tod-plate__paper"
        style={{ backgroundImage: `url(${TWIN_OPUS_DIRECT_PAPER_TEXTURE})` }}
      />
      <div className="tod-plate__rules" aria-hidden="true" />
      <TodPointingHandPlate className="tod-plate__hand" />
      {marks ? (
        <div className="tod-plate__marks" aria-hidden="true">
          <span className="tod-plate__mark tod-plate__mark--a">green</span>
          <span className="tod-plate__mark tod-plate__mark--b">Cert. Ref:</span>
          <span className="tod-plate__mark tod-plate__mark--c">P.137</span>
          <span className="tod-plate__mark tod-plate__mark--d">P. 208</span>
          <span className="tod-plate__mark tod-plate__mark--e">P. 311</span>
        </div>
      ) : null}
    </div>
  );
}

function TodCandidateSurface({ surface }: { surface: TwinOpusDirectCandidateSurface }) {
  if (surface === 'plate') {
    return (
      <div className="tod-card__surface tod-card__surface--plate">
        <div className="tod-card__copy">
          <p className="tod-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tod-card__standfirst">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <TodArchivalPlate className="tod-card__plate" marks={false} />
      </div>
    );
  }
  if (surface === 'grain') {
    return (
      <div className="tod-card__surface tod-card__surface--grain">
        <div className="tod-card__copy">
          <p className="tod-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tod-card__standfirst tod-card__standfirst--dim">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <div className="tod-card__grid" aria-hidden="true" />
      </div>
    );
  }
  if (surface === 'collage') {
    return (
      <div className="tod-card__surface tod-card__surface--collage">
        <div className="tod-card__collage" aria-hidden="true">
          <span className="tod-card__scrap tod-card__scrap--1" />
          <span className="tod-card__scrap tod-card__scrap--2" />
          <span className="tod-card__scrap tod-card__scrap--3" />
          <span className="tod-card__scrap tod-card__scrap--4" />
          <span className="tod-card__scrap tod-card__scrap--5" />
        </div>
        <div className="tod-card__collageCopy">
          <span className="tod-card__collageLead">CULTURE AS EVIDENCE.</span>
          <span className="tod-card__collageLead">IDEAS AS INDEX.</span>
          <span className="tod-card__stamp">001</span>
        </div>
      </div>
    );
  }
  return (
    <div className="tod-card__surface tod-card__surface--archive">
      <div className="tod-card__archiveCol tod-card__archiveCol--a" aria-hidden="true" />
      <div className="tod-card__archiveCol tod-card__archiveCol--b">
        <span className="tod-card__archiveHead">
          <span>THE</span>
          <span>SIGNAL</span>
          <span>IS THE</span>
          <span>INDEX</span>
        </span>
      </div>
      <div className="tod-card__archiveCol tod-card__archiveCol--c" aria-hidden="true">
        <span className="tod-card__stamp tod-card__stamp--corner">001</span>
      </div>
    </div>
  );
}

function TodOutputPreview({ column }: { column: TwinOpusDirectOutputColumn }) {
  if (column.preview === 'manifest') {
    return (
      <div className="tod-out__preview tod-out__preview--manifest" aria-hidden="true">
        <span className="tod-out__manifestTitle">index_signal:page_001_indexed</span>
        <span className="tod-out__manifestRule" />
        <span className="tod-out__manifestRule" />
        <span className="tod-out__manifestGrid">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="tod-out__manifestStamp">01204</span>
      </div>
    );
  }
  if (column.preview === 'blueprint') {
    return (
      <div className="tod-out__preview tod-out__preview--blueprint" aria-hidden="true">
        <span className="tod-out__blueGrid" />
        <span className="tod-out__blueCross" />
      </div>
    );
  }
  if (column.preview === 'overlay') {
    return (
      <div className="tod-out__preview tod-out__preview--overlay" aria-hidden="true">
        <span
          className="tod-out__overlayPaper"
          style={{ backgroundImage: `url(${TWIN_OPUS_DIRECT_PAPER_TEXTURE})` }}
        />
        <span className="tod-out__overlayNote">CULTURE AS EVIDENCE.</span>
        <span className="tod-out__overlayInk">001</span>
        <span className="tod-out__overlayMark" />
      </div>
    );
  }
  if (column.preview === 'evidence') {
    return (
      <div className="tod-out__preview tod-out__preview--evidence" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`tod-out__evidenceTile tod-out__evidenceTile--${index + 1}`}
            style={{ backgroundImage: `url(${TWIN_OPUS_DIRECT_PAPER_TEXTURE})` }}
          />
        ))}
      </div>
    );
  }
  return (
    <ul className="tod-out__preview tod-out__preview--functions">
      {(column.functions ?? []).map((fn) => (
        <li key={fn}>{fn}</li>
      ))}
    </ul>
  );
}

export function TwinOpusDirectScreen() {
  const scale = useArtboardScale();
  const [viewport, setViewport] = useState<TwinOpusDirectViewportId>('MOBILE');
  const [navIndex, setNavIndex] = useState(0);
  const [candidateId, setCandidateId] = useState(TWIN_OPUS_DIRECT_CANDIDATES[0].id);
  const [pairOpen, setPairOpen] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [dockIndex, setDockIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const readinessDash = useMemo(() => {
    const circumference = 2 * Math.PI * 30;
    return {
      circumference,
      offset: circumference * (1 - TWIN_OPUS_DIRECT_READINESS.percent / 100),
    };
  }, []);

  const scrollGallery = useCallback(() => {
    const node = galleryRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.6, behavior: 'smooth' });
  }, []);

  return (
    <div className="tod-root">
      <div
        className="tod-stage"
        style={{ width: ART_W * scale, height: ART_H * scale }}
      >
        <div
          className="tod-screen"
          data-testid="twin-opus-direct-screen"
          style={{ transform: `scale(${scale})` }}
        >
          {/* 01 SITE00_HEADER */}
          <header className="tod-header">
            <div className="tod-header__crumbs">
              <span className="tod-header__brand">{TWIN_OPUS_DIRECT_HEADER.brand}</span>
              <span className="tod-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tod-header__project">{TWIN_OPUS_DIRECT_HEADER.project}</span>
              <span className="tod-header__sep" aria-hidden="true">
                &gt;
              </span>
              <span className="tod-header__page">{TWIN_OPUS_DIRECT_HEADER.page}</span>
            </div>
            <div className="tod-header__status">
              <span className="tod-header__compiler">{TWIN_OPUS_DIRECT_HEADER.compiler}</span>
              <span className="tod-dot tod-dot--lime" aria-hidden="true" />
              <button type="button" className="tod-header__more" aria-label="Workspace options">
                <TodIconEllipsisVertical className="tod-ico" />
              </button>
            </div>
          </header>

          {/* 02 PRIMARY_NAV */}
          <nav className="tod-nav" aria-label="Design workspace sections">
            <button type="button" className="tod-nav__cell tod-nav__cell--menu" aria-label="Open workspace menu">
              <TodIconMenu className="tod-ico" />
            </button>
            {TWIN_OPUS_DIRECT_PRIMARY_NAV.map((label, index) => (
              <button
                key={label}
                type="button"
                className="tod-nav__cell"
                aria-current={navIndex === index ? 'page' : undefined}
                onClick={() => setNavIndex(index)}
              >
                {label}
              </button>
            ))}
            <button type="button" className="tod-nav__cell tod-nav__cell--more">
              MORE
              <TodIconCaretDown className="tod-ico tod-nav__caret" />
            </button>
          </nav>

          {/* 03 NDXBOOK_CONTEXT_BAR */}
          <div className="tod-context">
            <span className="tod-context__chip">{TWIN_OPUS_DIRECT_CONTEXT.chip}</span>
            <span className="tod-context__stream">{TWIN_OPUS_DIRECT_CONTEXT.stream}</span>
            <span className="tod-context__right">
              {TWIN_OPUS_DIRECT_CONTEXT.right}
              <span className="tod-dot tod-dot--lime" aria-hidden="true" />
            </span>
          </div>

          {/* 04 TARGET_VIEWPORT_STAGE_BAND */}
          <section className="tod-band" aria-label="Target, viewport and stage">
            <div className="tod-band__col tod-band__col--target">
              <span className="tod-band__label">{TWIN_OPUS_DIRECT_TARGET.label}</span>
              {TWIN_OPUS_DIRECT_TARGET.lines.map((line) => (
                <span key={line} className="tod-band__value">
                  {line}
                </span>
              ))}
            </div>
            <div className="tod-band__col tod-band__col--viewport">
              <span className="tod-band__label">VIEWPORT</span>
              <div className="tod-band__devices" role="group" aria-label="Target viewport">
                {TWIN_OPUS_DIRECT_VIEWPORTS.map((id) => {
                  const Icon = VIEWPORT_ICONS[id];
                  const active = viewport === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`tod-device${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setViewport(id)}
                    >
                      <Icon className="tod-device__ico" />
                      <span className="tod-device__label">{id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="tod-band__col tod-band__col--stage">
              <span className="tod-band__label">{TWIN_OPUS_DIRECT_STAGE.stageLabel}</span>
              <span className="tod-band__stage">{TWIN_OPUS_DIRECT_STAGE.stageValue}</span>
              <span className="tod-band__label tod-band__label--second">
                {TWIN_OPUS_DIRECT_STAGE.authorityLabel}
              </span>
              <span className="tod-band__stage tod-band__stage--lock">
                {TWIN_OPUS_DIRECT_STAGE.authorityValue}
                <TodIconLockOpen className="tod-ico tod-band__lock" />
              </span>
            </div>
          </section>

          <main className="tod-main">
            {/* 05 MAIN_HERO + 06 AUTHORITY_RAIL */}
            <section className="tod-herorow" aria-label="Active concept and authority controls">
              <article className="tod-hero">
                <div className="tod-hero__eyebrow">
                  <span>{TWIN_OPUS_DIRECT_HERO.eyebrowLeft}</span>
                  <span className="tod-hero__eyebrowRight">
                    <span>{TWIN_OPUS_DIRECT_HERO.eyebrowCentre}</span>
                    <span>{TWIN_OPUS_DIRECT_HERO.eyebrowRight}</span>
                  </span>
                </div>
                <h1 className="tod-hero__headline">
                  {TWIN_OPUS_DIRECT_HERO.headline.map((line) => (
                    <span key={line} className="tod-hero__headlineLine">
                      <span className="tod-hero__headlineInk">{line}</span>
                    </span>
                  ))}
                </h1>
                <p className="tod-hero__standfirst">
                  {TWIN_OPUS_DIRECT_HERO.standfirst.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
                <TodArchivalPlate className="tod-hero__plate" />
                <div className="tod-hero__footer">
                  <span className="tod-hero__footerBlock">
                    {TWIN_OPUS_DIRECT_HERO.footerLeft.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="tod-hero__footerPip" aria-hidden="true">
                    <TodIconChevronRight className="tod-ico" />
                  </span>
                  <span className="tod-hero__footerBlock">
                    {TWIN_OPUS_DIRECT_HERO.footerMid.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="tod-hero__footerChip">{TWIN_OPUS_DIRECT_HERO.chip}</span>
                  <span className="tod-hero__footerCount">{TWIN_OPUS_DIRECT_HERO.overflow}</span>
                </div>
              </article>

              <aside className="tod-rail" aria-label="Authority rail">
                <div className="tod-rail__select">
                  <button type="button" className="tod-rail__selectBtn" aria-pressed>
                    <TodIconCheck className="tod-ico tod-rail__selectCheck" />
                    {TWIN_OPUS_DIRECT_SELECT_ACTIONS.mobile.label}
                  </button>
                  <span className="tod-rail__selectState">
                    {TWIN_OPUS_DIRECT_SELECT_ACTIONS.mobile.state}
                  </span>
                </div>
                <button type="button" className="tod-rail__ghost">
                  {TWIN_OPUS_DIRECT_SELECT_ACTIONS.desktop.label}
                </button>

                <section className="tod-pair">
                  <button
                    type="button"
                    className="tod-pair__head"
                    aria-expanded={pairOpen}
                    onClick={() => setPairOpen((open) => !open)}
                  >
                    {TWIN_OPUS_DIRECT_AUTHORITY_PAIR.title}
                    <TodIconChevronUp className={`tod-ico tod-pair__caret${pairOpen ? '' : ' is-closed'}`} />
                  </button>
                  <div className="tod-pair__body" hidden={!pairOpen}>
                    <div className="tod-pair__row tod-pair__row--mobile">
                      <span className="tod-pair__label">{TWIN_OPUS_DIRECT_AUTHORITY_PAIR.mobile.label}</span>
                      <span className="tod-pair__version">
                        {TWIN_OPUS_DIRECT_AUTHORITY_PAIR.mobile.version}
                      </span>
                      <div className="tod-pair__thumb tod-pair__thumb--mobile">
                        <span className="tod-pair__thumbCopy">
                          <span>THE SIGNAL</span>
                          <span>IS THE INDEX</span>
                        </span>
                        <TodArchivalPlate className="tod-pair__thumbPlate" marks={false} />
                      </div>
                      <span className="tod-pair__state">
                        {TWIN_OPUS_DIRECT_AUTHORITY_PAIR.mobile.state}
                      </span>
                    </div>
                    <div className="tod-pair__row tod-pair__row--desktop">
                      <span className="tod-pair__label">{TWIN_OPUS_DIRECT_AUTHORITY_PAIR.desktop.label}</span>
                      <span className="tod-pair__version">
                        {TWIN_OPUS_DIRECT_AUTHORITY_PAIR.desktop.version}
                      </span>
                      <div className="tod-pair__thumb tod-pair__thumb--desktop">
                        <span className="tod-pair__thumbCopy">
                          <span>THE SIGNAL</span>
                          <span>IS THE INDEX</span>
                        </span>
                        <span className="tod-pair__thumbWedge" aria-hidden="true" />
                      </div>
                      <button type="button" className="tod-pair__replace">
                        {TWIN_OPUS_DIRECT_AUTHORITY_PAIR.desktop.action}
                      </button>
                    </div>
                  </div>
                </section>

                {TWIN_OPUS_DIRECT_RAIL_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`tod-rail__action tod-rail__action--${action.tone}${
                      action.lock ? ' tod-rail__action--lock' : ''
                    }`}
                  >
                    {action.lock ? <TodIconLock className="tod-ico tod-rail__lockIco" /> : null}
                    {action.lines ? (
                      <span className="tod-rail__actionLines">
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
            <section className="tod-gallery" aria-label={TWIN_OPUS_DIRECT_GALLERY.title}>
              <header className="tod-gallery__head">
                <h2 className="tod-gallery__title">{TWIN_OPUS_DIRECT_GALLERY.title}</h2>
                <button type="button" className="tod-gallery__compare">
                  {TWIN_OPUS_DIRECT_GALLERY.compare}
                  <TodIconCompare className="tod-ico tod-gallery__compareIco" />
                </button>
              </header>
              <div className="tod-gallery__rail" ref={galleryRef}>
                {TWIN_OPUS_DIRECT_CANDIDATES.map((candidate) => {
                  const active = candidate.id === candidateId;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      className={`tod-card${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => setCandidateId(candidate.id)}
                    >
                      <span className="tod-card__version">{candidate.version}</span>
                      {active ? (
                        <span className="tod-card__tick" aria-hidden="true">
                          <TodIconCheck className="tod-ico" />
                        </span>
                      ) : null}
                      <TodCandidateSurface surface={candidate.surface} />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="tod-gallery__next"
                aria-label="Show more concept candidates"
                onClick={scrollGallery}
              >
                <TodIconChevronRight className="tod-ico" />
              </button>
            </section>

            {/* 08 CANDIDATE_ACTION_BAR */}
            <div className="tod-actions" role="group" aria-label="Concept candidate actions">
              {TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS.map((action) => {
                const Icon = ACTION_ICONS[action.icon];
                return (
                  <button key={action.id} type="button" className="tod-actions__cell">
                    <Icon className="tod-ico tod-actions__ico" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            {/* 09 STRUCTURED_OUTPUT_REVIEW */}
            <section className="tod-out" aria-label={TWIN_OPUS_DIRECT_OUTPUT_TITLE}>
              <header className="tod-out__head">
                <h2 className="tod-out__title">{TWIN_OPUS_DIRECT_OUTPUT_TITLE}</h2>
              </header>
              <div className="tod-out__cols">
                {TWIN_OPUS_DIRECT_OUTPUT_COLUMNS.map((column) => (
                  <div key={column.id} className="tod-out__col">
                    <span className="tod-out__label">{column.label}</span>
                    <span className="tod-out__lines">
                      <span>{column.lines[0]}</span>
                      <span>{column.lines[1]}</span>
                    </span>
                    <TodOutputPreview column={column} />
                    <span className="tod-out__source">
                      <span className="tod-out__sourceText">{column.source}</span>
                      {column.preview === 'functions' ? (
                        <TodIconDocGear className="tod-ico tod-out__sourceIco" />
                      ) : (
                        <TodIconDoc className="tod-ico tod-out__sourceIco" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 10 PIPELINE_READINESS */}
            <section className="tod-pipe" aria-label={TWIN_OPUS_DIRECT_PIPELINE_TITLE}>
              <header className="tod-pipe__head">
                <h2 className="tod-pipe__title">{TWIN_OPUS_DIRECT_PIPELINE_TITLE}</h2>
              </header>
              <div className="tod-pipe__cols">
                <div className="tod-pipe__col tod-pipe__col--readiness">
                  <span className="tod-pipe__label">{TWIN_OPUS_DIRECT_READINESS.label}</span>
                  <div className="tod-pipe__gauge">
                    <svg viewBox="0 0 68 68" className="tod-pipe__ring" aria-hidden="true">
                      <circle cx="34" cy="34" r="30" className="tod-pipe__ringTrack" />
                      <circle
                        cx="34"
                        cy="34"
                        r="30"
                        className="tod-pipe__ringValue"
                        strokeDasharray={readinessDash.circumference}
                        strokeDashoffset={readinessDash.offset}
                      />
                    </svg>
                    <span className="tod-pipe__gaugeValue">{TWIN_OPUS_DIRECT_READINESS.percent}%</span>
                    <span className="tod-pipe__gaugeState">{TWIN_OPUS_DIRECT_READINESS.state}</span>
                  </div>
                  <span className="tod-pipe__compiler">
                    {TWIN_OPUS_DIRECT_READINESS.compiler}
                    <span className="tod-pipe__compilerState">
                      {TWIN_OPUS_DIRECT_READINESS.compilerState}
                    </span>
                    <span className="tod-dot tod-dot--green" aria-hidden="true" />
                  </span>
                </div>

                <div className="tod-pipe__col tod-pipe__col--checks">
                  <span className="tod-pipe__label">{TWIN_OPUS_DIRECT_READINESS.checksLabel}</span>
                  <ul className="tod-pipe__checks">
                    {TWIN_OPUS_DIRECT_CHECKS.map((check) => (
                      <li key={check.id}>
                        <span>{check.label}</span>
                        {check.state === 'pass' ? (
                          <TodIconCheckCircle className="tod-ico tod-pipe__checkPass" />
                        ) : (
                          <span className="tod-pipe__checkWarn" aria-hidden="true" />
                        )}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="tod-pipe__details">
                    {TWIN_OPUS_DIRECT_READINESS.viewDetails}
                  </button>
                </div>

                <div className="tod-pipe__col tod-pipe__col--status">
                  <span className="tod-pipe__label">{TWIN_OPUS_DIRECT_READINESS.statusLabel}</span>
                  <ul className="tod-pipe__status">
                    {TWIN_OPUS_DIRECT_STATUS_ROWS.map((row) => (
                      <li key={row.id}>
                        <span>{row.label}</span>
                        <span className="tod-pipe__statusValue">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tod-pipe__col tod-pipe__col--next">
                  <span className="tod-pipe__label">{TWIN_OPUS_DIRECT_NEXT_ACTION.label}</span>
                  <p className="tod-pipe__nextCopy">
                    {TWIN_OPUS_DIRECT_NEXT_ACTION.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                  <button type="button" className="tod-pipe__primary">
                    {TWIN_OPUS_DIRECT_NEXT_ACTION.primary}
                  </button>
                  {TWIN_OPUS_DIRECT_NEXT_ACTION.secondary.map((label) => (
                    <button key={label} type="button" className="tod-pipe__secondary">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* 11 CONCEPT_HISTORY_TABS + 12 CONCEPT_DATA_ROW + 13 BOTTOM_NAVIGATION */}
          <div className="tod-dock">
            <div className="tod-tabs">
              <span className="tod-tabs__handle" aria-hidden="true" />
              <div className="tod-tabs__list" role="tablist" aria-label="Concept record">
                {TWIN_OPUS_DIRECT_CONCEPT_TABS.map((tab, index) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`tod-tab-${index}`}
                    aria-selected={tabIndex === index}
                    aria-controls="tod-concept-panel"
                    tabIndex={tabIndex === index ? 0 : -1}
                    className={`tod-tabs__tab${tabIndex === index ? ' is-active' : ''}`}
                    onClick={() => setTabIndex(index)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="tod-concept"
              id="tod-concept-panel"
              role="tabpanel"
              aria-labelledby={`tod-tab-${tabIndex}`}
            >
              <div className="tod-concept__thumb">
                <span className="tod-concept__thumbVersion">V1.3</span>
                <span className="tod-concept__thumbCopy">
                  <span>THE SIGNAL</span>
                  <span>IS THE INDEX</span>
                </span>
                <span className="tod-concept__thumbStandfirst">
                  <span>CULTURE AS EVIDENCE.</span>
                  <span>IDEAS AS INDEX.</span>
                  <span>NDXBOOK.</span>
                </span>
                <TodArchivalPlate className="tod-concept__thumbPlate" marks={false} />
              </div>
              <dl className="tod-concept__fields">
                {TWIN_OPUS_DIRECT_CONCEPT_FIELDS.map((field) => (
                  <div key={field.label} className="tod-concept__field">
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="tod-concept__amendment">
                <div className="tod-concept__amendHead">
                  <span className="tod-concept__amendTitle">{TWIN_OPUS_DIRECT_AMENDMENT.title}</span>
                  <span className="tod-concept__amendChip">{TWIN_OPUS_DIRECT_AMENDMENT.chip}</span>
                </div>
                <dl className="tod-concept__fields tod-concept__fields--amend">
                  {TWIN_OPUS_DIRECT_AMENDMENT.fields.map((field) => (
                    <div key={field.label} className="tod-concept__field">
                      <dt>{field.label}</dt>
                      <dd>{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <button type="button" className="tod-concept__view">
                {TWIN_OPUS_DIRECT_AMENDMENT.action}
              </button>
            </div>

            <nav className="tod-bottom" aria-label="Design workspace">
              {TWIN_OPUS_DIRECT_BOTTOM_NAV.map((item, index) => {
                const Icon = BOTTOM_ICONS[item.icon];
                const active = dockIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tod-bottom__cell${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setDockIndex(index)}
                  >
                    <Icon className="tod-ico tod-bottom__ico" />
                    <span className="tod-bottom__label">
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
