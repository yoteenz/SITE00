/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — CANONICAL presentation renderer.
 *
 * This is the frozen Opus spatial/editorial authority reconstructed in
 * OPUS-DIRECT1/R1/R2, moved behind the view-mode boundary unchanged. It owns
 * no workspace state: everything comes from the shared workspace model.
 *
 * Real DOM + CSS only. The golden is never painted into the page as a raster:
 * every band, panel, column and control below is live markup.
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
} from './twinOpusDirectContent';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { DesignHeroComparePanel } from './DesignHeroComparePanel';
import { TodAuthorityThumbPreview } from './twinOpusDirectViewportPreview';
import {
  TodIconCheck,
  TodIconCheckCircle,
  TodIconChevronRight,
  TodIconChevronUp,
  TodIconCompare,
  TodIconCycle,
  TodIconDoc,
  TodIconDocGear,
  TodIconExpand,
  TodIconInspect,
  TodIconLock,
  TodIconSliders,
  TodIconWarnCircle,
  TodPointingHandPlate,
} from './TwinOpusDirectIcons';

const ACTION_ICONS = {
  sliders: TodIconSliders,
  cycle: TodIconCycle,
  inspect: TodIconInspect,
  expand: TodIconExpand,
} as const;

/** Paints one manifest slot. Renders nothing when the slot resolves to no source. */
function TodSlotImage({ slot, className }: { slot: TwinOpusDirectAssetSlotId; className: string }) {
  const src = resolveTwinOpusDirectAsset(slot);
  if (!src) return null;
  return <img className={className} src={src} alt="" draggable={false} data-tod-slot={slot} />;
}

/** Archival plate: approved Grok xerox plate, with the drawn plate as fallback. */
export function TodArchivalPlate({
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
  const base = approved ? 'tod-plate tod-plate--photo' : 'tod-plate';
  return (
    <div className={className ? `${base} ${className}` : base}>
      {approved ? (
        <img className="tod-plate__photo" src={approved} alt="" draggable={false} data-tod-slot={slot} />
      ) : (
        <>
          <div
            className="tod-plate__paper"
            style={entry.fallbackSrc ? { backgroundImage: `url(${entry.fallbackSrc})` } : undefined}
          />
          <div className="tod-plate__rules" aria-hidden="true" />
          <TodPointingHandPlate className="tod-plate__hand" />
        </>
      )}
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
        <TodArchivalPlate className="tod-card__plate" marks={false} slot="candidatePlate" />
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
        <div className="tod-card__grid" aria-hidden="true">
          <TodSlotImage slot="candidateGrain" className="tod-card__raster tod-card__raster--grain" />
        </div>
      </div>
    );
  }
  if (surface === 'collage') {
    return (
      <div className="tod-card__surface tod-card__surface--collage">
        <TodSlotImage slot="candidateCollage" className="tod-card__raster tod-card__raster--collage" />
        <div className="tod-card__stack" aria-hidden="true">
          <span className="tod-card__scrap tod-card__scrap--1" />
          <span className="tod-card__scrap tod-card__scrap--2" />
          <span className="tod-card__scrap tod-card__scrap--3" />
          <span className="tod-card__scrap tod-card__scrap--4" />
          <span className="tod-card__scrap tod-card__scrap--5" />
        </div>
        <div className="tod-card__sheet" aria-hidden="true" />
        <div className="tod-card__collageCopy">
          <span className="tod-card__collageLead">CULTURE AS</span>
          <span className="tod-card__collageLead">EVIDENCE.</span>
          <span className="tod-card__collageLead">IDEAS AS INDEX.</span>
        </div>
        <span className="tod-card__stamp">001</span>
      </div>
    );
  }
  return (
    <div className="tod-card__surface tod-card__surface--archive">
      <TodSlotImage slot="candidateArchive" className="tod-card__raster tod-card__raster--archive" />
      <div className="tod-card__archivePaper" aria-hidden="true" />
      <div className="tod-card__archiveInk">
        <span className="tod-card__archiveStamp" aria-hidden="true">001</span>
        <span className="tod-card__archiveRule" aria-hidden="true" />
        <span className="tod-card__archiveHead">
          <span>THE</span>
          <span>SIGNAL</span>
          <span>IS THE</span>
          <span>INDEX</span>
        </span>
      </div>
      <span className="tod-card__archiveChip" aria-hidden="true">001</span>
    </div>
  );
}

function TodOutputPreview({ column }: { column: TwinOpusDirectOutputColumn }) {
  if (column.preview === 'manifest') {
    return (
      <div className="tod-out__preview tod-out__preview--manifest" aria-hidden="true">
        <TodSlotImage slot="grounding" className="tod-out__photo" />
        <span className="tod-out__manifestTitle">index_signal:page_001_indexed</span>
        <span className="tod-out__manifestRule" />
        <span className="tod-out__manifestRule" />
        <span className="tod-out__manifestRule" />
        <span className="tod-out__manifestGrid">
          {Array.from({ length: 12 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="tod-out__manifestStamp">01204</span>
      </div>
    );
  }
  if (column.preview === 'blueprint') {
    return (
      <div className="tod-out__preview tod-out__preview--blueprint" aria-hidden="true">
        <TodSlotImage slot="blueprint" className="tod-out__photo" />
        <span className="tod-out__blueGrid" />
        <span className="tod-out__blueCross" />
      </div>
    );
  }
  if (column.preview === 'overlay') {
    return (
      <div className="tod-out__preview tod-out__preview--overlay" aria-hidden="true">
        <TodSlotImage slot="overlay" className="tod-out__photo" />
        <span className="tod-out__overlayPaper" />
        <span className="tod-out__overlayNote">CULTURE AS EVIDENCE.</span>
        <span className="tod-out__overlayInk">001</span>
        <span className="tod-out__overlayMark" />
      </div>
    );
  }
  if (column.preview === 'evidence') {
    return (
      <div className="tod-out__preview tod-out__preview--evidence" aria-hidden="true">
        <TodSlotImage slot="assetPack" className="tod-out__photo tod-out__photo--evidence" />
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className={`tod-out__evidenceTile tod-out__evidenceTile--${index + 1}`} />
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

/** 05-10: hero, authority rail, candidate gallery, structured output, pipeline. */
export function TwinOpusDirectCanonicalBody({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions, readinessDash, production } = workspace;
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const scrollGallery = useCallback(() => {
    const node = galleryRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.6, behavior: 'smooth' });
  }, []);

  return (
    <main className="tod-main">
      {/* 05 MAIN_HERO + 06 AUTHORITY_RAIL */}
      <section className="tod-herorow" aria-label="Active concept and authority controls">
        <DesignHeroComparePanel workspace={workspace} variant="canonical" />

        <aside className="tod-rail" aria-label="Authority rail">
          <div className="tod-rail__select">
            <button
              type="button"
              className="tod-rail__selectBtn"
              aria-pressed={production.state.mobileAuthority === 'SELECTED'}
              data-interaction-id="rail-select-mobile"
              onClick={() => actions.selectForMobile()}
              title={actions.railDisabledReason('promote-mobile') ?? undefined}
            >
              <TodIconCheck className="tod-ico tod-rail__selectCheck" />
              {data.selectActions.mobile.label}
            </button>
            <span className="tod-rail__selectState">{production.state.mobileAuthority}</span>
          </div>
          <button
            type="button"
            className="tod-rail__ghost"
            data-interaction-id="rail-select-desktop"
            onClick={() => actions.selectForDesktop()}
          >
            {data.selectActions.desktop.label}
          </button>

          <section className="tod-pair">
            <button
              type="button"
              className="tod-pair__head"
              aria-expanded={state.authorityPairOpen}
              onClick={actions.toggleAuthorityPair}
            >
              {data.authorityPairPresentation.title}
              <TodIconChevronUp
                className={`tod-ico tod-pair__caret${state.authorityPairOpen ? '' : ' is-closed'}`}
              />
            </button>
            <div className="tod-pair__body" hidden={!state.authorityPairOpen}>
              <div className="tod-pair__row tod-pair__row--mobile">
                <span className="tod-pair__label">{data.authorityPairPresentation.mobile.label}</span>
                <span className="tod-pair__version">{data.authorityPairPresentation.mobile.version}</span>
                <div className="tod-pair__thumb tod-pair__thumb--mobile">
                  <span className="tod-pair__thumbCopy">
                    <span>THE SIGNAL</span>
                    <span>IS THE INDEX</span>
                  </span>
                  <TodAuthorityThumbPreview
                    className="tod-pair__thumbPlate"
                    previewSrc={data.authorityPairPresentation.mobile.previewSrc}
                    missing={data.authorityPairPresentation.mobile.missing}
                    slot="authorityMobile"
                    variant="mobile"
                  />
                </div>
                <span className="tod-pair__state">{data.authorityPairPresentation.mobile.state}</span>
              </div>
              <div className="tod-pair__row tod-pair__row--desktop">
                <span className="tod-pair__label">{data.authorityPairPresentation.desktop.label}</span>
                <span className="tod-pair__version">{data.authorityPairPresentation.desktop.version}</span>
                <div className="tod-pair__thumb tod-pair__thumb--desktop">
                  <span className="tod-pair__thumbCopy">
                    <span>THE SIGNAL</span>
                    <span>IS THE INDEX</span>
                  </span>
                  {data.authorityPairPresentation.desktop.missing ?
                    <TodAuthorityThumbPreview
                      className="tod-pair__thumbPhoto"
                      previewSrc={null}
                      missing
                      slot="authorityDesktop"
                      variant="desktop"
                    />
                  : <>
                      <TodAuthorityThumbPreview
                        className="tod-pair__thumbPhoto"
                        previewSrc={data.authorityPairPresentation.desktop.previewSrc}
                        missing={false}
                        slot="authorityDesktop"
                        variant="desktop"
                      />
                      <span className="tod-pair__thumbWedge" aria-hidden="true" />
                    </>
                  }
                </div>
                <span className="tod-pair__meta">{data.authorityPairPresentation.tabletLabel}</span>
                <button
                  type="button"
                  className="tod-pair__replace"
                  data-interaction-id="pair-replace-desktop"
                  onClick={() => actions.selectForDesktop()}
                  disabled={data.authorityPairPresentation.desktop.missing}
                >
                  {data.authorityPairPresentation.desktop.missing ?
                    'CREATE DESKTOP DESIGN'
                  : data.authorityPair.desktop.action}
                </button>
              </div>
            </div>
          </section>

          {data.railActions.map((action) => {
            const disabledReason = actions.railDisabledReason(action.id);
            return (
            <button
              key={action.id}
              type="button"
              className={`tod-rail__action tod-rail__action--${action.tone}${
                action.lock ? ' tod-rail__action--lock' : ''
              }`}
              data-interaction-id={`rail-${action.id}`}
              disabled={Boolean(disabledReason)}
              title={disabledReason ?? undefined}
              onClick={() => actions.onRailAction(action.id)}
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
          );
          })}
        </aside>
      </section>

      {/* 07 CANDIDATE_GALLERY */}
      <section className="tod-gallery" aria-label={data.gallery.title}>
        <header className="tod-gallery__head">
          <h2 className="tod-gallery__title">{data.gallery.title}</h2>
          <button
            type="button"
            className="tod-gallery__compare"
            data-interaction-id="gallery-compare"
            onClick={() => actions.openCompareConcepts()}
          >
            {data.gallery.compare}
            <TodIconCompare className="tod-ico tod-gallery__compareIco" />
          </button>
        </header>
        <div className="tod-gallery__body">
          {data.galleryEmptyMessage ?
            <div className="tod-gallery__emptyWrap" data-testid="gallery-page-concept-empty">
              <p className="tod-gallery__empty">{data.galleryEmptyMessage}</p>
              <button
                type="button"
                className="tod-gallery__generate"
                data-interaction-id="generate-page-concepts"
                disabled={data.galleryGenerateDisabled}
                title="GPT2 creative layer contract — generation not invoked in this sprint"
                onClick={() => actions.generatePageConcepts()}
              >
                {data.galleryGenerateLabel}
              </button>
            </div>
          : null}
          <div className="tod-gallery__rail" ref={galleryRef} hidden={Boolean(data.galleryEmptyMessage)}>
            {data.candidates.map((candidate) => {
              const active = candidate.id === state.candidateId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  className={`tod-card${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => actions.selectCandidate(candidate.id)}
                >
                  {candidate.versionTag === 'none' ? null : (
                    <span className={`tod-card__version tod-card__version--${candidate.versionTag}`}>
                      {candidate.version}
                    </span>
                  )}
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
        </div>

        {/* 08 CANDIDATE_ACTION_ROW — inside the gallery panel in the golden */}
        <div className="tod-actions" role="group" aria-label="Concept candidate actions">
          {data.candidateActions.map((action) => {
            const Icon = ACTION_ICONS[action.icon];
            return (
              <button
                key={action.id}
                type="button"
                className="tod-actions__cell"
                onClick={() => actions.onCandidateAction(action.id)}
              >
                <Icon className="tod-ico tod-actions__ico" />
                {action.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 09 STRUCTURED_OUTPUT_REVIEW */}
      <section className="tod-out" aria-label={data.outputTitle}>
        <header className="tod-out__head">
          <h2 className="tod-out__title">{data.outputTitle}</h2>
          {data.outputViewportNote ?
            <p className="tod-out__viewportNote">{data.outputViewportNote}</p>
          : null}
        </header>
        <div className="tod-out__cols">
          {data.outputColumns.map((column) => (
            <div key={column.id} className="tod-out__col">
              <span className="tod-out__label">{column.label}</span>
              <span className="tod-out__lines">
                <span>{column.lines[0]}</span>
                <span>{column.lines[1]}</span>
              </span>
              <button
                type="button"
                className="tod-out__previewBtn"
                data-interaction-id={`output-${column.id}`}
                aria-label={`Inspect ${column.label}`}
                onClick={() => actions.openStructuredArtifact(column.id)}
              >
                <TodOutputPreview column={column} />
              </button>
              <button type="button" className="tod-out__source" onClick={() => actions.openProvenance()}>
                <span className="tod-out__sourceText">{column.source}</span>
                {column.preview === 'functions' ? (
                  <TodIconDocGear className="tod-ico tod-out__sourceIco" />
                ) : (
                  <TodIconDoc className="tod-ico tod-out__sourceIco" />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 10 PIPELINE_READINESS */}
      <section className="tod-pipe" aria-label={data.pipelineTitle}>
        <header className="tod-pipe__head">
          <h2 className="tod-pipe__title">{data.pipelineTitle}</h2>
        </header>
        <div className="tod-pipe__cols">
          <div className="tod-pipe__col tod-pipe__col--readiness">
            <span className="tod-pipe__label">{data.readiness.label}</span>
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
              <span className="tod-pipe__gaugeValue">{data.readiness.percent}%</span>
              <span className="tod-pipe__gaugeState">{data.readiness.state}</span>
            </div>
            <span className="tod-pipe__compiler">
              {data.readiness.compiler}
              <span className="tod-pipe__compilerState">{data.readiness.compilerState}</span>
              <span className="tod-dot tod-dot--green" aria-hidden="true" />
            </span>
          </div>

          <div className="tod-pipe__col tod-pipe__col--checks">
            <span className="tod-pipe__label">{data.readiness.checksLabel}</span>
            <ul className="tod-pipe__checks">
              {data.checks.map((check) => (
                <li key={check.id}>
                  <span>{check.label}</span>
                  {check.state === 'pass' ? (
                    <TodIconCheckCircle className="tod-ico tod-pipe__checkPass" />
                  ) : (
                    <TodIconWarnCircle className="tod-ico tod-pipe__checkWarn" />
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="tod-pipe__details"
              onClick={() => actions.openReadinessReceipt()}
            >
              {data.readiness.viewDetails}
            </button>
          </div>

          <div className="tod-pipe__col tod-pipe__col--status">
            <span className="tod-pipe__label">{data.readiness.statusLabel}</span>
            <ul className="tod-pipe__status">
              {data.statusRows.map((row) => (
                <li key={row.id}>
                  <span>{row.label}</span>
                  <span className="tod-pipe__statusValue">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tod-pipe__col tod-pipe__col--next">
            <span className="tod-pipe__label">{data.nextAction.label}</span>
            <p className="tod-pipe__nextCopy">
              {data.nextAction.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <button
              type="button"
              className="tod-pipe__primary"
              data-interaction-id="pipeline-next-primary"
              onClick={() => actions.runContextualNextAction()}
            >
              {data.nextAction.primary}
            </button>
            {data.nextAction.secondary.map((label) => (
              <button
                key={label}
                type="button"
                className="tod-pipe__secondary"
                disabled={label.startsWith('MOVE TO BUILD') && !production.projection.buildEligible}
                title={
                  label.startsWith('MOVE TO BUILD') && !production.projection.buildEligible ?
                    'BLOCKED — readiness gates not passed'
                  : undefined
                }
                onClick={() => {
                  if (label.startsWith('MOVE TO BUILD')) {
                    if (production.projection.buildEligible) production.actions.runMoveToBuild();
                    else production.actions.openReadinessReceipt();
                    return;
                  }
                  if (label.includes('TECHNICAL')) production.actions.openReadinessReceipt();
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/** 11-12: concept record tabs and the concept data row, inside the shared dock. */
export function TwinOpusDirectCanonicalRecord({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions, production } = workspace;
  const tab = data.conceptTabs[state.recordTabIndex] ?? data.conceptTabs[0];

  return (
    <>
      <div className="tod-tabs">
        <div className="tod-tabs__list" role="tablist" aria-label="Concept record">
          {data.conceptTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`tod-tab-${index}`}
              aria-selected={state.recordTabIndex === index}
              aria-controls="tod-concept-panel"
              tabIndex={state.recordTabIndex === index ? 0 : -1}
              className={`tod-tabs__tab${state.recordTabIndex === index ? ' is-active' : ''}`}
              onClick={() => actions.selectRecordTab(index)}
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
        aria-labelledby={`tod-tab-${state.recordTabIndex}`}
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
          <TodArchivalPlate className="tod-concept__thumbPlate" marks={false} slot="conceptRecord" />
        </div>
        {tab === 'CONCEPT DATA' ?
          <dl className="tod-concept__fields">
            {data.conceptFields.map((field) => (
              <div key={field.label} className="tod-concept__field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        : null}
        {tab === 'VERSION HISTORY' ?
          <ul className="tod-dcs-gates">
            {[production.state.mobileVersion, production.state.desktopVersion, production.state.designAuthorityVersion].map(
              (ver) => (
                <li key={ver} className="tod-dcs-gate">
                  <strong className="tod-dcs-gate__name">{ver}</strong>
                </li>
              ),
            )}
          </ul>
        : null}
        {tab === 'CHANGE HISTORY' ?
          <ul className="tod-dcs-gates">
            {production.state.history.slice(-6).reverse().map((entry) => (
              <li key={entry.id} className="tod-dcs-gate">
                <strong className="tod-dcs-gate__name">{entry.type.replace(/_/g, ' ')}</strong>
                <p className="tod-dcs-gate__reason">{entry.summary}</p>
              </li>
            ))}
          </ul>
        : null}
        {tab === 'MASTER UPDATE' ?
          <dl className="tod-concept__fields">
            <div className="tod-concept__field">
              <dt>MOBILE AUTHORITY</dt>
              <dd>{production.state.mobileAuthority}</dd>
            </div>
            <div className="tod-concept__field">
              <dt>DESKTOP AUTHORITY</dt>
              <dd>{production.state.desktopAuthority}</dd>
            </div>
            <div className="tod-concept__field">
              <dt>DESIGN AUTHORITY VERSION</dt>
              <dd>{production.state.designAuthorityVersion}</dd>
            </div>
          </dl>
        : null}
        {tab === 'AMENDMENT' ?
        <div className="tod-concept__amendment">
          <div className="tod-concept__amendHead">
            <span className="tod-concept__amendTitle">{data.amendment.title}</span>
            <span className="tod-concept__amendChip">{data.amendment.chip}</span>
          </div>
          <dl className="tod-concept__fields tod-concept__fields--amend">
            {data.amendment.fields.map((field) => (
              <div key={field.label} className="tod-concept__field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        : null}
        {tab === 'AMENDMENT' ?
        <button
          type="button"
          className="tod-concept__view"
          data-interaction-id="concept-amendment-view"
          onClick={() => actions.openAmendmentDetail()}
        >
          {data.amendment.action}
        </button>
        : null}
      </div>
    </>
  );
}
