/**
 * P0.VR.DESIGNBENCH.SPARK-LIST-INTEGRATION1 — LIST presentation renderer.
 *
 * Spark owns this file. It renders the SAME shared workspace object as the
 * frozen canonical renderer, as a digestible sequential list: context, hero,
 * authority, candidates, actions, structured output, pipeline, record. It
 * holds no state of its own — every value comes from `workspace.data` /
 * `workspace.state`, every interaction calls `workspace.actions`. Imagery and
 * icons are the opus/grok family (TodArchivalPlate, TodIcon*, paper texture);
 * the tod-lv-* classes below are Spark's list choreography, styled in
 * site00-twin-opus-list.css. Canonical markup, classes and styles are untouched.
 */

import { useCallback, useRef } from 'react';

import {
  TWIN_OPUS_DIRECT_PAPER_TEXTURE,
  type TwinOpusDirectCandidateSurface,
  type TwinOpusDirectOutputColumn,
  type TwinOpusDirectViewportId,
} from './twinOpusDirectContent';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { TodArchivalPlate } from './TwinOpusDirectCanonicalView';
import {
  TodIconBolt,
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
  TodIconHistory,
  TodIconInspect,
  TodIconLock,
  TodIconLockOpen,
  TodIconPhone,
  TodIconShieldCheck,
  TodIconSliders,
  TodIconTablet,
  TodIconWarnCircle,
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

const RECORD_TAB_ICONS = [TodIconDoc, TodIconHistory, TodIconCycle, TodIconShieldCheck, TodIconBolt] as const;

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
        <TodArchivalPlate className="tod-lv-card__plate" marks={false} />
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
        <div className="tod-lv-card__grid" aria-hidden="true" />
      </div>
    );
  }
  if (surface === 'collage') {
    return (
      <div className="tod-lv-card__surface tod-lv-card__surface--collage">
        <div className="tod-lv-card__stack" aria-hidden="true">
          <span className="tod-lv-card__scrap tod-lv-card__scrap--1" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--2" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--3" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--4" />
          <span className="tod-lv-card__scrap tod-lv-card__scrap--5" />
        </div>
        <div className="tod-lv-card__sheet" aria-hidden="true" />
        <div className="tod-lv-card__collageCopy">
          <span>CULTURE AS</span>
          <span>EVIDENCE.</span>
          <span>IDEAS AS INDEX.</span>
        </div>
        <span className="tod-lv-card__stamp">001</span>
      </div>
    );
  }
  return (
    <div className="tod-lv-card__surface tod-lv-card__surface--archive">
      <div className="tod-lv-card__archivePaper" aria-hidden="true" />
      <div className="tod-lv-card__archiveInk">
        <span className="tod-lv-card__archiveStamp" aria-hidden="true">
          001
        </span>
        <span className="tod-lv-card__archiveRule" aria-hidden="true" />
        <span className="tod-lv-card__archiveHead">
          <span>THE</span>
          <span>SIGNAL</span>
          <span>IS THE</span>
          <span>INDEX</span>
        </span>
      </div>
      <span className="tod-lv-card__archiveChip" aria-hidden="true">
        001
      </span>
    </div>
  );
}

function LvOutputPreview({ column }: { column: TwinOpusDirectOutputColumn }) {
  if (column.preview === 'manifest') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--manifest" aria-hidden="true">
        <span className="tod-lv-out__manifestTitle">index_signal:page_001_indexed</span>
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
        <span className="tod-lv-out__blueGrid" />
        <span className="tod-lv-out__blueCross" />
      </div>
    );
  }
  if (column.preview === 'overlay') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--overlay" aria-hidden="true">
        <span
          className="tod-lv-out__overlayPaper"
          style={{ backgroundImage: `url(${TWIN_OPUS_DIRECT_PAPER_TEXTURE})` }}
        />
        <span className="tod-lv-out__overlayNote">CULTURE AS EVIDENCE.</span>
        <span className="tod-lv-out__overlayInk">001</span>
        <span className="tod-lv-out__overlayMark" />
      </div>
    );
  }
  if (column.preview === 'evidence') {
    return (
      <div className="tod-lv-out__preview tod-lv-out__preview--evidence" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`tod-lv-out__evidenceTile tod-lv-out__evidenceTile--${index + 1}`}
            style={{ backgroundImage: `url(${TWIN_OPUS_DIRECT_PAPER_TEXTURE})` }}
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

/** LIST body: the workspace as a digestible vertical sequence. */
export function TwinOpusDirectListBody({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions, selectedCandidate, readinessDash } = workspace;
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const scrollGallery = useCallback(() => {
    const node = galleryRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.6, behavior: 'smooth' });
  }, []);

  return (
    <main className="tod-main tod-main--list">
      <div className="tod-lv" data-testid="twin-opus-direct-list-body">
        {/* 01 WORKSPACE CONTEXT */}
        <section className="tod-lv-context" aria-label="Workspace context">
          <span className="tod-lv-context__project">{data.header.project}</span>
          <span className="tod-lv-context__entry">{data.target.lines.join(' / ')}</span>
          <span className="tod-lv-context__stage">
            {data.stage.stageValue} · {data.stage.authorityValue}
          </span>
        </section>

        {/* 02 TARGET / VIEWPORT / STAGE */}
        <section className="tod-lv-band" aria-label="Target, viewport and stage">
          <div className="tod-lv-band__row">
            <span className="tod-lv-band__label">{data.target.label}</span>
            <span className="tod-lv-band__value">{data.target.lines.join(' / ')}</span>
          </div>
          <div className="tod-lv-band__row">
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
          <div className="tod-lv-band__row">
            <span className="tod-lv-band__label">{data.stage.stageLabel}</span>
            <span className="tod-lv-band__value">{data.stage.stageValue}</span>
          </div>
          <div className="tod-lv-band__row">
            <span className="tod-lv-band__label">{data.stage.authorityLabel}</span>
            <span className="tod-lv-band__value">
              {data.stage.authorityValue}
              <TodIconLockOpen className="tod-ico tod-lv-band__lock" />
            </span>
          </div>
        </section>

        {/* 03 HERO */}
        <article className="tod-lv-hero" aria-label="Active concept">
          <div className="tod-lv-hero__eyebrow">
            <span>{data.hero.eyebrowLeft}</span>
            <span>{data.hero.eyebrowCentre}</span>
            <span>{data.hero.eyebrowRight}</span>
          </div>
          <h1 className="tod-lv-hero__headline">
            {data.hero.headline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="tod-lv-hero__standfirst">
            {data.hero.standfirst.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <TodArchivalPlate className="tod-lv-hero__plate" />
          <div className="tod-lv-hero__footer">
            <span className="tod-lv-hero__footerBlock">
              {data.hero.footerLeft.map((line) => (
                <span key={line}>{line}</span>
              ))}
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

        {/* 04 AUTHORITY */}
        <section className="tod-lv-authority" aria-label="Authority">
          <div className="tod-lv-authority__select">
            <button type="button" className="tod-lv-authority__selectBtn" aria-pressed>
              <TodIconCheck className="tod-ico tod-lv-authority__selectCheck" />
              {data.selectActions.mobile.label}
            </button>
            <span className="tod-lv-authority__selectState">{data.selectActions.mobile.state}</span>
          </div>
          <button type="button" className="tod-lv-authority__ghost">
            {data.selectActions.desktop.label}
          </button>

          <div className="tod-lv-pair">
            <button
              type="button"
              className="tod-lv-pair__head"
              aria-expanded={state.authorityPairOpen}
              onClick={actions.toggleAuthorityPair}
            >
              {data.authorityPair.title}
              <TodIconChevronUp
                className={`tod-ico tod-lv-pair__caret${state.authorityPairOpen ? '' : ' is-closed'}`}
              />
            </button>
            <div className="tod-lv-pair__body" hidden={!state.authorityPairOpen}>
              <div className="tod-lv-pair__row tod-lv-pair__row--mobile">
                <span className="tod-lv-pair__label">{data.authorityPair.mobile.label}</span>
                <span className="tod-lv-pair__version">{data.authorityPair.mobile.version}</span>
                <span className="tod-lv-pair__state">{data.authorityPair.mobile.state}</span>
              </div>
              <div className="tod-lv-pair__row tod-lv-pair__row--desktop">
                <span className="tod-lv-pair__label">{data.authorityPair.desktop.label}</span>
                <span className="tod-lv-pair__version">{data.authorityPair.desktop.version}</span>
                <button type="button" className="tod-lv-pair__replace">
                  {data.authorityPair.desktop.action}
                </button>
              </div>
            </div>
          </div>

          {data.railActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`tod-lv-authority__action tod-lv-authority__action--${action.tone}${
                action.lock ? ' tod-lv-authority__action--lock' : ''
              }`}
            >
              {action.lock ? <TodIconLock className="tod-ico tod-lv-authority__lockIco" /> : null}
              {action.lines ? (
                <span className="tod-lv-authority__actionLines">
                  {action.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              ) : (
                action.label
              )}
            </button>
          ))}
        </section>

        {/* 05 CANDIDATE GALLERY */}
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
          <p className="tod-lv-gallery__selected">
            SELECTED · {selectedCandidate.id.toUpperCase()} / {selectedCandidate.version}
          </p>
        </section>

        {/* 06 CANDIDATE ACTIONS */}
        <div className="tod-lv-actions" role="group" aria-label="Concept candidate actions">
          {data.candidateActions.map((action) => {
            const Icon = ACTION_ICONS[action.icon];
            return (
              <button key={action.id} type="button" className="tod-lv-actions__cell">
                <Icon className="tod-ico tod-lv-actions__ico" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* 07 STRUCTURED OUTPUT */}
        <section className="tod-lv-out" aria-label={data.outputTitle}>
          <header className="tod-lv-out__head">
            <h2 className="tod-lv-out__title">{data.outputTitle}</h2>
          </header>
          <div className="tod-lv-out__mods">
            {data.outputColumns.map((column) => (
              <div key={column.id} className="tod-lv-out__mod">
                <span className="tod-lv-out__label">{column.label}</span>
                <span className="tod-lv-out__lines">
                  <span>{column.lines[0]}</span>
                  <span>{column.lines[1]}</span>
                </span>
                <LvOutputPreview column={column} />
                <span className="tod-lv-out__source">
                  <span className="tod-lv-out__sourceText">{column.source}</span>
                  {column.preview === 'functions' ? (
                    <TodIconDocGear className="tod-ico tod-lv-out__sourceIco" />
                  ) : (
                    <TodIconDoc className="tod-ico tod-lv-out__sourceIco" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 08 PIPELINE / READINESS */}
        <section className="tod-lv-pipe" aria-label={data.pipelineTitle}>
          <header className="tod-lv-pipe__head">
            <h2 className="tod-lv-pipe__title">{data.pipelineTitle}</h2>
          </header>
          <div className="tod-lv-pipe__mods">
            <div className="tod-lv-pipe__mod tod-lv-pipe__mod--readiness">
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
                <span className="tod-lv-pipe__compilerState">{data.readiness.compilerState}</span>
                <span className="tod-dot tod-dot--green" aria-hidden="true" />
              </span>
            </div>

            <div className="tod-lv-pipe__mod tod-lv-pipe__mod--checks">
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
              <button type="button" className="tod-lv-pipe__details">
                {data.readiness.viewDetails}
              </button>
            </div>

            <div className="tod-lv-pipe__mod tod-lv-pipe__mod--status">
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

            <div className="tod-lv-pipe__mod tod-lv-pipe__mod--next">
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
      </div>
    </main>
  );
}

/** LIST record: shared tabs + a digestible concept record. Natural height — the flex shell pins the dock. */
export function TwinOpusDirectListRecord({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions } = workspace;

  return (
    <div className="tod-lv-record" data-testid="twin-opus-direct-list-record">
      <div className="tod-lv-record__tabs" role="tablist" aria-label="Concept record">
        {data.conceptTabs.map((tab, index) => {
          const Icon = RECORD_TAB_ICONS[index] ?? TodIconDoc;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={state.recordTabIndex === index}
              tabIndex={state.recordTabIndex === index ? 0 : -1}
              className={`tod-lv-record__tab${state.recordTabIndex === index ? ' is-active' : ''}`}
              onClick={() => actions.selectRecordTab(index)}
            >
              <Icon className="tod-ico tod-lv-record__tabIco" />
              {tab}
            </button>
          );
        })}
      </div>
      <dl className="tod-lv-record__fields">
        {data.conceptFields.map((field) => (
          <div key={field.label} className="tod-lv-record__field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      <div className="tod-lv-record__amendment">
        <span className="tod-lv-record__amendTitle">{data.amendment.title}</span>
        <span className="tod-lv-record__amendChip">{data.amendment.chip}</span>
        <span className="tod-lv-record__amendMeta">
          {data.amendment.fields[0].value} · {data.amendment.fields[2].value}
        </span>
        <button type="button" className="tod-lv-record__view">
          {data.amendment.action}
        </button>
      </div>
    </div>
  );
}
