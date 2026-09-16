/**
 * P0.VR.DESIGNBENCH.SPARK-LIST-INTEGRATION1R2 — LIST presentation renderer.
 *
 * TRANSPLANT: structure forked from TwinSparkResponsiveScreen (band through
 * concept record) into tod-lv- classes, with every value and handler
 * rebound to the shared opus workspace model. Spark owns the presentation
 * grammar; the workspace owns state, data, actions and assets. This file
 * holds no React state of its own, creates no duplicate state, adds no routes. Styled by site00-twin-opus-list.css
 * (transplanted + x1.969-scaled Spark rules). Canonical files untouched.
 */

import { useCallback, useRef } from 'react';

import {
  resolveTwinOpusDirectAsset,
  twinOpusDirectAssetEntry,
  type TwinOpusDirectAssetSlotId,
} from './twinOpusDirectAssetManifest';
import {
  type TwinOpusDirectCandidateSurface,
  type TwinOpusDirectOutputColumn,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import {
  TodIconCheck,
  TodIconCheckCircle,
  TodIconChevronRight,
  TodIconChevronUp,
  TodIconCompare,
  TodIconCycle,
  TodIconDesktop,
  TodIconDoc,
  TodIconDocGear,
  TodIconExpand,
  TodIconInspect,
  TodIconLock,
  TodIconLockOpen,
  TodIconPhone,
  TodIconSliders,
  TodIconTablet,
  TodIconWarnCircle,
  TodPointingHandPlate,
} from './TwinOpusDirectIcons';

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

/** Paints one manifest slot. LIST shares canonical asset identity; only crop differs. */
function LvSlotImage({ slot, className }: { slot: TwinOpusDirectAssetSlotId; className: string }) {
  const src = resolveTwinOpusDirectAsset(slot);
  if (!src) return null;
  return <img className={className} src={src} alt="" draggable={false} data-tod-slot={slot} />;
}

function LvArchivalPlate({
  className,
  marks = true,
  slot,
}: {
  className?: string;
  marks?: boolean;
  slot: TwinOpusDirectAssetSlotId;
}) {
  const entry = twinOpusDirectAssetEntry(slot);
  const approved = entry.approved && entry.src ? entry.src : null;
  const base = approved ? 'tod-lv-plate tod-lv-plate--photo' : 'tod-lv-plate';
  return (
    <div className={className ? `${base} ${className}` : base}>
      {approved ? (
        <img className="tod-lv-plate__photo" src={approved} alt="" draggable={false} data-tod-slot={slot} />
      ) : (
        <>
          <div
            className="tod-lv-plate__paper"
            style={entry.fallbackSrc ? { backgroundImage: `url(${entry.fallbackSrc})` } : undefined}
          />
          <div className="tod-lv-plate__rules" aria-hidden="true" />
          <TodPointingHandPlate className="tod-lv-plate__hand" />
        </>
      )}
      {marks ? (
        <div className="tod-lv-plate__marks" aria-hidden="true">
          <span className="tod-lv-plate__mark tod-lv-plate__mark--a">green</span>
          <span className="tod-lv-plate__mark tod-lv-plate__mark--b">Cert. Ref:</span>
          <span className="tod-lv-plate__mark tod-lv-plate__mark--c">P.137</span>
          <span className="tod-lv-plate__mark tod-lv-plate__mark--d">P. 208</span>
          <span className="tod-lv-plate__mark tod-lv-plate__mark--e">P. 311</span>
        </div>
      ) : null}
    </div>
  );
}

function LvCandidateSurface({ surface }: { surface: TwinOpusDirectCandidateSurface }) {
  if (surface === 'plate') {
    return (
      <div className="tod-lv-card__surface tod-lv-card__surface--plate">
        <div className="tod-lv-card__copy">
          <p className="tod-lv-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tod-lv-card__standfirst">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <LvArchivalPlate className="tod-lv-card__plate" marks={false} slot="candidatePlate" />
      </div>
    );
  }
  if (surface === 'grain') {
    return (
      <div className="tod-lv-card__surface tod-lv-card__surface--grain">
        <div className="tod-lv-card__copy">
          <p className="tod-lv-card__headline">
            <span>THE SIGNAL</span>
            <span>IS THE INDEX</span>
          </p>
          <p className="tod-lv-card__standfirst tod-lv-card__standfirst--dim">
            <span>CULTURE AS EVIDENCE.</span>
            <span>IDEAS AS INDEX.</span>
            <span>NDXBOOK.</span>
          </p>
        </div>
        <div className="tod-lv-card__grid" aria-hidden="true">
          <LvSlotImage slot="candidateGrain" className="tod-lv-card__raster tod-lv-card__raster--grain" />
        </div>
      </div>
    );
  }
  if (surface === 'collage') {
    return (
      <div className="tod-lv-card__surface tod-lv-card__surface--collage">
        <LvSlotImage slot="candidateCollage" className="tod-lv-card__raster tod-lv-card__raster--collage" />
        <div className="tod-lv-card__stack" aria-hidden="true">
          <span className="tod-lv-card__scrap tod-lv-card__scrap--1" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--2" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--3" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--4" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--5" />
        </div>
        <div className="tod-lv-card__sheet" aria-hidden="true" />
        <div className="tod-lv-card__collageCopy">
          <span className="tod-lv-card__collageLead">CULTURE AS</span>
          <span className="tod-lv-card__collageLead">EVIDENCE.</span>
          <span className="tod-lv-card__collageLead">IDEAS AS INDEX.</span>
        </div>
        <span className="tod-lv-card__stamp">001</span>
      </div>
    );
  }
  return (
    <div className="tod-lv-card__surface tod-lv-card__surface--archive">
      <LvSlotImage slot="candidateArchive" className="tod-lv-card__raster tod-lv-card__raster--archive" />
      <div className="tod-lv-card__archivePaper" aria-hidden="true" />
      <div className="tod-lv-card__archiveInk">
        <span className="tod-lv-card__archiveStamp" aria-hidden="true">001</span>
        <span className="tod-lv-card__archiveRule" aria-hidden="true" />
        <span className="tod-lv-card__archiveHead">
          <span>THE</span>
          <span>SIGNAL</span>
          <span>IS THE</span>
          <span>INDEX</span>
        </span>
      </div>
      <span className="tod-lv-card__archiveChip" aria-hidden="true">001</span>
    </div>
  );
}

function LvOutputPreview({ column }: { column: TwinOpusDirectOutputColumn }) {
  if (column.preview === 'manifest') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--manifest" aria-hidden="true">
        <LvSlotImage slot="grounding" className="tod-lv-out__photo" />
        <span className="tod-lv-out__manifestTitle">index_signal:page_001_indexed</span>
        <span className="tod-lv-out__manifestRule" />
        <span className="tod-lv-out__manifestRule" />
        <span className="tod-lv-out__manifestRule" />
        <span className="tod-lv-out__manifestGrid">
          {Array.from({ length: 12 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="tod-lv-out__manifestStamp">01204</span>
      </div>
    );
  }
  if (column.preview === 'blueprint') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--blueprint" aria-hidden="true">
        <LvSlotImage slot="blueprint" className="tod-lv-out__photo" />
        <span className="tod-lv-out__blueGrid" />
        <span className="tod-lv-out__blueCross" />
      </div>
    );
  }
  if (column.preview === 'overlay') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--overlay" aria-hidden="true">
        <LvSlotImage slot="overlay" className="tod-lv-out__photo" />
        <span className="tod-lv-out__overlayPaper" />
        <span className="tod-lv-out__overlayNote">CULTURE AS EVIDENCE.</span>
        <span className="tod-lv-out__overlayInk">001</span>
        <span className="tod-lv-out__overlayMark" />
      </div>
    );
  }
  if (column.preview === 'evidence') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--evidence" aria-hidden="true">
        <LvSlotImage slot="assetPack" className="tod-lv-out__photo tod-lv-out__photo--evidence" />
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`tod-lv-out__evidenceTile tod-lv-out__evidenceTile--${index + 1}`}
          />
        ))}
      </div>
    );
  }
  return (
    <ul className="tod-lv-out__preview tod-lv-out__preview--functions">
      {(column.functions ?? []).map((fn) => (
        <li key={fn}>{fn}</li>
      ))}
    </ul>
  );
}
/** LIST body: the transplanted Spark digest, bound to shared state. */
export function TwinOpusDirectListBody({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions, readinessDash } = workspace;
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const scrollGallery = useCallback(() => {
    const node = galleryRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.6, behavior: 'smooth' });
  }, []);

  return (
    <main className="tod-main tod-main--list">
      <div className="tod-lv" data-testid="twin-opus-direct-list-body">
        {/* 04 TARGET_VIEWPORT_STAGE_BAND */}
        <section className="tod-lv-band" aria-label="Target, viewport and stage">
          <div className="tod-lv-band__col tod-lv-band__col--target">
            <span className="tod-lv-band__label">{data.target.label}</span>
            {data.target.lines.map((line) => (
              <span key={line} className="tod-lv-band__value">
                {line}
              </span>
            ))}
          </div>
          <div className="tod-lv-band__col tod-lv-band__col--viewport">
            <span className="tod-lv-band__label">VIEWPORT</span>
            <div className="tod-lv-band__devices" role="group" aria-label="Target viewport">
              {data.viewports.map((id) => {
                const Icon = VIEWPORT_ICONS[id];
                const active = state.viewport === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`tod-lv-device${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => actions.selectViewport(id)}
                  >
                    <Icon className="tod-lv-device__ico" />
                    <span className="tod-lv-device__label">{id}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="tod-lv-band__col tod-lv-band__col--stage">
            <span className="tod-lv-band__label">{data.stage.stageLabel}</span>
            <span className="tod-lv-band__stage">{data.stage.stageValue}</span>
            <span className="tod-lv-band__label tod-lv-band__label--second">
              {data.stage.authorityLabel}
            </span>
            <span className="tod-lv-band__stage tod-lv-band__stage--lock">
              {data.stage.authorityValue}
              <TodIconLockOpen className="tod-ico tod-lv-band__lock" />
            </span>
          </div>
        </section>          {/* 05 MAIN_HERO + 06 AUTHORITY_RAIL */}
          <section className="tod-lv-herorow" aria-label="Active concept and authority controls">
            <article className="tod-lv-hero">
              <div className="tod-lv-hero__eyebrow">
                <span>{data.hero.eyebrowLeft}</span>
                <span className="tod-lv-hero__eyebrowRight">
                  <span>{data.hero.eyebrowCentre}</span>
                  <span>{data.hero.eyebrowRight}</span>
                </span>
              </div>
              <h1 className="tod-lv-hero__headline">
                {data.hero.headline.map((line) => (
                  <span key={line} className="tod-lv-hero__headlineLine">
                    <span className="tod-lv-hero__headlineInk">{line}</span>
                  </span>
                ))}
              </h1>
              <p className="tod-lv-hero__standfirst">
                {data.hero.standfirst.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <LvArchivalPlate className="tod-lv-hero__plate" slot="hero" />
              <div className="tod-lv-hero__footer">
                <span className="tod-lv-hero__footerBlock">
                  {data.hero.footerLeft.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                <span className="tod-lv-hero__footerPip" aria-hidden="true">
                  <TodIconChevronRight className="tod-ico" />
                </span>
                <span className="tod-lv-hero__footerBlock">
                  {data.hero.footerMid.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                <span className="tod-lv-hero__footerChip">{data.hero.chip}</span>
                <span className="tod-lv-hero__footerCount">{data.hero.overflow}</span>
              </div>
            </article>

            <aside className="tod-lv-rail" aria-label="Authority rail">
              <div className="tod-lv-rail__select">
                <button type="button" className="tod-lv-rail__selectBtn" aria-pressed>
                  <TodIconCheck className="tod-ico tod-lv-rail__selectCheck" />
                  {data.selectActions.mobile.label}
                </button>
                <span className="tod-lv-rail__selectState">
                  {data.selectActions.mobile.state}
                </span>
              </div>
              <button type="button" className="tod-lv-rail__ghost">
                {data.selectActions.desktop.label}
              </button>

              <section className="tod-lv-pair">
                <button
                  type="button"
                  className="tod-lv-pair__head"
                  aria-expanded={state.authorityPairOpen}
                  onClick={() => actions.toggleAuthorityPair()}
                >
                  {data.authorityPair.title}
                  <TodIconChevronUp className={`tod-ico tod-lv-pair__caret${state.authorityPairOpen ? '' : ' is-closed'}`} />
                </button>
                <div className="tod-lv-pair__body" hidden={!state.authorityPairOpen}>
                  <div className="tod-lv-pair__row tod-lv-pair__row--mobile">
                    <span className="tod-lv-pair__label">{data.authorityPair.mobile.label}</span>
                    <span className="tod-lv-pair__version">
                      {data.authorityPair.mobile.version}
                    </span>
                    <div className="tod-lv-pair__thumb tod-lv-pair__thumb--mobile">
                      <span className="tod-lv-pair__thumbCopy">
                        <span>THE SIGNAL</span>
                        <span>IS THE INDEX</span>
                      </span>
                      <LvArchivalPlate className="tod-lv-pair__thumbPlate" marks={false} slot="authorityMobile" />
                    </div>
                    <span className="tod-lv-pair__state">
                      {data.authorityPair.mobile.state}
                    </span>
                  </div>
                  <div className="tod-lv-pair__row tod-lv-pair__row--desktop">
                    <span className="tod-lv-pair__label">{data.authorityPair.desktop.label}</span>
                    <span className="tod-lv-pair__version">
                      {data.authorityPair.desktop.version}
                    </span>
                    <div className="tod-lv-pair__thumb tod-lv-pair__thumb--desktop">
                      <span className="tod-lv-pair__thumbCopy">
                        <span>THE SIGNAL</span>
                        <span>IS THE INDEX</span>
                      </span>
                      <LvSlotImage slot="authorityDesktop" className="tod-lv-pair__thumbPhoto" />
                      <span className="tod-lv-pair__thumbWedge" aria-hidden="true" />
                    </div>
                    <button type="button" className="tod-lv-pair__replace">
                      {data.authorityPair.desktop.action}
                    </button>
                  </div>
                </div>
              </section>

              {data.railActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`tod-lv-rail__action tod-lv-rail__action--${action.tone}${
                    action.lock ? ' tod-lv-rail__action--lock' : ''
                  }`}
                  onClick={() => actions.onRailAction(action.id)}
                >
                  {action.lock ? <TodIconLock className="tod-ico tod-lv-rail__lockIco" /> : null}
                  {action.lines ? (
                    <span className="tod-lv-rail__actionLines">
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
          <section className="tod-lv-gallery" aria-label={data.gallery.title}>
            <header className="tod-lv-gallery__head">
              <h2 className="tod-lv-gallery__title">{data.gallery.title}</h2>
              <button type="button" className="tod-lv-gallery__compare">
                {data.gallery.compare}
                <TodIconCompare className="tod-ico tod-lv-gallery__compareIco" />
              </button>
            </header>
            <div className="tod-lv-gallery__body">
              <div className="tod-lv-gallery__rail" ref={galleryRef}>
                {data.candidates.map((candidate) => {
                  const active = candidate.id === state.candidateId;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      className={`tod-lv-card${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => actions.selectCandidate(candidate.id)}
                    >
                      {candidate.versionTag === 'none' ? null : (
                        <span className={`tod-lv-card__version tod-lv-card__version--${candidate.versionTag}`}>
                          {candidate.version}
                        </span>
                      )}
                      {active ? (
                        <span className="tod-lv-card__tick" aria-hidden="true">
                          <TodIconCheck className="tod-ico" />
                        </span>
                      ) : null}
                      <LvCandidateSurface surface={candidate.surface} />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="tod-lv-gallery__next"
                aria-label="Show more concept candidates"
                onClick={scrollGallery}
              >
                <TodIconChevronRight className="tod-ico" />
              </button>
            </div>

            {/* 08 CANDIDATE_ACTION_ROW — inside the gallery panel in the golden */}
            <div className="tod-lv-actions" role="group" aria-label="Concept candidate actions">
              {data.candidateActions.map((action) => {
                const Icon = ACTION_ICONS[action.icon];
                return (
                  <button
                    key={action.id}
                    type="button"
                    className="tod-lv-actions__cell"
                    onClick={() => actions.onCandidateAction(action.id)}
                  >
                    <Icon className="tod-ico tod-lv-actions__ico" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 09 STRUCTURED_OUTPUT_REVIEW */}
          <section className="tod-lv-out" aria-label={data.outputTitle}>
            <header className="tod-lv-out__head">
              <h2 className="tod-lv-out__title">{data.outputTitle}</h2>
            </header>
            <div className="tod-lv-out__cols">
              {data.outputColumns.map((column) => (
                <div key={column.id} className="tod-lv-out__col">
                  <span className="tod-lv-out__label">{column.label}</span>
                  <span className="tod-lv-out__lines">
                    <span>{column.lines[0]}</span>
                    <span>{column.lines[1]}</span>
                  </span>
                  <LvOutputPreview column={column} />
                  <button type="button" className="tod-lv-out__source" onClick={() => actions.openProvenance()}>
                    <span className="tod-lv-out__sourceText">{column.source}</span>
                    {column.preview === 'functions' ? (
                      <TodIconDocGear className="tod-ico tod-lv-out__sourceIco" />
                    ) : (
                      <TodIconDoc className="tod-ico tod-lv-out__sourceIco" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 10 PIPELINE_READINESS */}
          <section className="tod-lv-pipe" aria-label={data.pipelineTitle}>
            <header className="tod-lv-pipe__head">
              <h2 className="tod-lv-pipe__title">{data.pipelineTitle}</h2>
            </header>
            <div className="tod-lv-pipe__cols">
              <div className="tod-lv-pipe__col tod-lv-pipe__col--readiness">
                <span className="tod-lv-pipe__label">{data.readiness.label}</span>
                <div className="tod-lv-pipe__gauge">
                  <svg viewBox="0 0 68 68" className="tod-lv-pipe__ring" aria-hidden="true">
                    <circle cx="34" cy="34" r="30" className="tod-lv-pipe__ringTrack" />
                    <circle
                      cx="34"
                      cy="34"
                      r="30"
                      className="tod-lv-pipe__ringValue"
                      strokeDasharray={readinessDash.circumference}
                      strokeDashoffset={readinessDash.offset}
                    />
                  </svg>
                  <span className="tod-lv-pipe__gaugeValue">{data.readiness.percent}%</span>
                  <span className="tod-lv-pipe__gaugeState">{data.readiness.state}</span>
                </div>
                <span className="tod-lv-pipe__compiler">
                  {data.readiness.compiler}
                  <span className="tod-lv-pipe__compilerState">
                    {data.readiness.compilerState}
                  </span>
                  <span className="tod-dot tod-dot--green" aria-hidden="true" />
                </span>
              </div>

              <div className="tod-lv-pipe__col tod-lv-pipe__col--checks">
                <span className="tod-lv-pipe__label">{data.readiness.checksLabel}</span>
                <ul className="tod-lv-pipe__checks">
                  {data.checks.map((check) => (
                    <li key={check.id}>
                      <span>{check.label}</span>
                      {check.state === 'pass' ? (
                        <TodIconCheckCircle className="tod-ico tod-lv-pipe__checkPass" />
                      ) : (
                        <TodIconWarnCircle className="tod-ico tod-lv-pipe__checkWarn" />
                      )}
                    </li>
                  ))}
                </ul>
                <button type="button" className="tod-lv-pipe__details" onClick={() => actions.openReadinessReceipt()}>
                  {data.readiness.viewDetails}
                </button>
              </div>

              <div className="tod-lv-pipe__col tod-lv-pipe__col--status">
                <span className="tod-lv-pipe__label">{data.readiness.statusLabel}</span>
                <ul className="tod-lv-pipe__status">
                  {data.statusRows.map((row) => (
                    <li key={row.id}>
                      <span>{row.label}</span>
                      <span className="tod-lv-pipe__statusValue">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tod-lv-pipe__col tod-lv-pipe__col--next">
                <span className="tod-lv-pipe__label">{data.nextAction.label}</span>
                <p className="tod-lv-pipe__nextCopy">
                  {data.nextAction.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
                <button type="button" className="tod-lv-pipe__primary">
                  {data.nextAction.primary}
                </button>
                {data.nextAction.secondary.map((label) => (
                  <button key={label} type="button" className="tod-lv-pipe__secondary">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

        <div
          className="tod-lv-concept"
          id="tod-lv-concept-panel"
          role="tabpanel"
          aria-labelledby={`tod-lv-tab-${state.recordTabIndex}`}
        >
          <div className="tod-lv-concept__thumb">
            <span className="tod-lv-concept__thumbVersion">V1.3</span>
            <span className="tod-lv-concept__thumbCopy">
              <span>THE SIGNAL</span>
              <span>IS THE INDEX</span>
            </span>
            <span className="tod-lv-concept__thumbStandfirst">
              <span>CULTURE AS EVIDENCE.</span>
              <span>IDEAS AS INDEX.</span>
              <span>NDXBOOK.</span>
            </span>
            <LvArchivalPlate className="tod-lv-concept__thumbPlate" marks={false} slot="conceptRecord" />
          </div>
          <dl className="tod-lv-concept__fields">
            {data.conceptFields.map((field) => (
              <div key={field.label} className="tod-lv-concept__field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="tod-lv-concept__amendment">
            <div className="tod-lv-concept__amendHead">
              <span className="tod-lv-concept__amendTitle">{data.amendment.title}</span>
              <span className="tod-lv-concept__amendChip">{data.amendment.chip}</span>
            </div>
            <dl className="tod-lv-concept__fields tod-lv-concept__fields--amend">
              {data.amendment.fields.map((field) => (
                <div key={field.label} className="tod-lv-concept__field">
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <button type="button" className="tod-lv-concept__view">
            {data.amendment.action}
          </button>
        </div>
      </div>
    </main>
  );
}

/** LIST record: transplanted Spark tabs + concept digest. Natural height. */
export function TwinOpusDirectListRecord({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions } = workspace;

  return (
    <div className="tod-lv-record" data-testid="twin-opus-direct-list-record">
        <div className="tod-lv-tabs">
          <div className="tod-lv-tabs__list" role="tablist" aria-label="Concept record">
            {data.conceptTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`tod-lv-tab-${index}`}
                aria-selected={state.recordTabIndex === index}
                aria-controls="tod-lv-concept-panel"
                tabIndex={state.recordTabIndex === index ? 0 : -1}
                className={`tod-lv-tabs__tab${state.recordTabIndex === index ? ' is-active' : ''}`}
                onClick={() => actions.selectRecordTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

    </div>
  );
}
