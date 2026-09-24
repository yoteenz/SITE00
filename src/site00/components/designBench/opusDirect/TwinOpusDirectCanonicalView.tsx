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

import { twinOpusDirectAssetEntry, type TwinOpusDirectAssetSlotId } from './twinOpusDirectAssetManifest';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { DesignConceptCandidateGalleryRail } from './DesignConceptCandidateGalleryRail';
import { DesignHeroComparePanel } from './DesignHeroComparePanel';
import { DesignPageSystemReviewSection } from './DesignPageSystemReviewSection';
import { DesignPipelineReadinessPanel } from './DesignPipelineReadinessPanel';
import { TodAuthorityThumbPreview } from './twinOpusDirectViewportPreview';
import {
  TodIconCheck,
  TodIconChevronRight,
  TodIconChevronUp,
  TodIconCompare,
  TodIconCycle,
  TodIconExpand,
  TodIconInspect,
  TodIconLock,
  TodIconSliders,
  TodPointingHandPlate,
} from './TwinOpusDirectIcons';

const ACTION_ICONS = {
  sliders: TodIconSliders,
  cycle: TodIconCycle,
  inspect: TodIconInspect,
  expand: TodIconExpand,
} as const;

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

/** 05-10: hero, authority rail, candidate gallery, page system review, pipeline. */
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
          {data.canonicalGpt2ViewportFamilyActive ?
            <section className="tod-rail__viewportFamily" data-testid="viewport-family-authority-rail">
              {data.viewportFamilyRail.map((row) => (
                <div key={row.id} className="tod-rail__viewportFamilyRow">
                  <span className="tod-rail__viewportFamilyLabel">{row.label}</span>
                  <span className="tod-rail__viewportFamilyValue">{row.value}</span>
                  <span className={`tod-rail__viewportFamilyStatus tod-rail__viewportFamilyStatus--${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </section>
          : <>
          <div className="tod-rail__select">
            <button
              type="button"
              className="tod-rail__selectBtn"
              aria-pressed={production.state.preferredMobileConceptId === state.candidateId}
              data-interaction-id="rail-select-mobile"
              onClick={() => actions.selectForMobile()}
              title={actions.railDisabledReason('promote-mobile') ?? 'Preferred mobile concept — not final approval'}
            >
              <TodIconCheck className="tod-ico tod-rail__selectCheck" />
              {data.selectActions.mobile.label}
            </button>
            <span className="tod-rail__selectState">
              {production.state.mobileAuthority === 'PROMOTED' ? 'PROMOTED' : production.state.preferredMobileConceptId ? 'PREFERRED' : '—'}
            </span>
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
              <p className="tod-pair__sectionLabel">UPSTREAM CREATIVE AUTHORITIES</p>
              <div className="tod-pair__row tod-pair__row--mobile">
                <span className="tod-pair__label">{data.authorityPairPresentation.mobile.label}</span>
                <span className="tod-pair__version">{data.authorityPairPresentation.mobile.version}</span>
                <button
                  type="button"
                  className="tod-pair__thumb tod-pair__thumb--mobile"
                  onClick={() => actions.openViewportAuthorityEditor('MOBILE')}
                  aria-label="Open mobile authority editor"
                >
                  <TodAuthorityThumbPreview
                    className="tod-pair__thumbPlate"
                    previewSrc={data.authorityPairPresentation.mobile.previewSrc}
                    missing={data.authorityPairPresentation.mobile.missing}
                    slot="authorityMobile"
                    variant="mobile"
                  />
                </button>
                <span className="tod-pair__state">{data.authorityPairPresentation.mobile.state}</span>
              </div>
              <div className="tod-pair__row tod-pair__row--desktop">
                <span className="tod-pair__label">{data.authorityPairPresentation.desktop.label}</span>
                <span className="tod-pair__version">{data.authorityPairPresentation.desktop.version}</span>
                <button
                  type="button"
                  className="tod-pair__thumb tod-pair__thumb--desktop"
                  onClick={() => actions.openViewportAuthorityEditor('DESKTOP')}
                  aria-label="Open desktop authority editor"
                >
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
                </button>
                <span className="tod-pair__meta">{data.authorityPairPresentation.tabletLabel}</span>
              </div>
              <p className="tod-pair__sectionLabel">PROMOTED DESIGNS</p>
              <div className="tod-pair__promotedRow">
                <span>MOBILE {data.authorityPairPresentation.promotedMobile.conceptId ?? 'NOT PROMOTED'}</span>
                <span>DESKTOP {data.authorityPairPresentation.promotedDesktop.conceptId ?? 'NOT PROMOTED'}</span>
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
          </>}
        </aside>
      </section>

      {/* 07 CANDIDATE_GALLERY */}
      <section
        className="tod-gallery"
        aria-label={data.gallery.title}
        data-testid="page-concept-candidate-gallery"
      >
        <header className="tod-gallery__head">
          <h2 className="tod-gallery__title">{data.galleryViewportTitle}</h2>
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
            <div
              className="tod-gallery__emptyWrap"
              data-testid={data.galleryEmptyTestId ?? 'gallery-page-concept-empty'}
            >
              <p className="tod-gallery__empty">{data.galleryEmptyMessage}</p>
              {data.galleryEmptySecondaryLine ?
                <p className="tod-gallery__empty tod-gallery__empty--secondary">{data.galleryEmptySecondaryLine}</p>
              : null}
              {data.pageConceptGenerationGate.blockerMessage ?
                <p className="tod-gallery__blocked" data-testid="generate-page-concepts-blocked-reason">
                  {data.pageConceptGenerationGate.blockerMessage}
                  {data.pageConceptGenerationGate.resolutionAction ?
                    ` ${data.pageConceptGenerationGate.resolutionAction}`
                  : null}
                </p>
              : null}
              <button
                type="button"
                className="tod-gallery__generate"
                data-interaction-id="generate-page-concepts"
                data-active-page-id={data.pageConceptTargetPageId}
                data-page-concept-readiness={data.pageConceptGenerationEligibility.readiness}
                data-can-generate={data.pageConceptGenerationEligibility.canGenerate ? 'true' : 'false'}
                disabled={!data.pageConceptGenerationGate.canPressGenerate}
                title={
                  data.pageConceptGenerationGate.blockerMessage ??
                  'CGPT → GPT2 → NBP page concept pipeline (confirm before spend)'
                }
                onClick={() => actions.generatePageConcepts()}
              >
                {data.galleryGenerateLabel}
              </button>
            </div>
          : null}
          <DesignConceptCandidateGalleryRail workspace={workspace} variant="grid" railRef={galleryRef} />
          <button
            type="button"
            className="tod-gallery__next"
            aria-label="Show more concept candidates"
            hidden={Boolean(data.galleryEmptyMessage)}
            onClick={scrollGallery}
          >
            <TodIconChevronRight className="tod-ico" />
          </button>
        </div>

        {/* 08 CANDIDATE_ACTION_ROW — inside the gallery panel in the golden */}
        <div className="tod-actions" role="group" aria-label="Concept candidate actions">
          {data.galleryCandidateActions.map((action) => {
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

      {/* 09 PAGE_SYSTEM_REVIEW */}
      <DesignPageSystemReviewSection
        projectSlug={workspace.projectSlug}
        model={data.pageSystemReview}
        viewportNote={data.outputViewportNote}
        actions={actions}
      />

      {/* 10 PIPELINE_READINESS */}
      <DesignPipelineReadinessPanel
        title={data.pipelineTitle}
        model={data.pagePipeline}
        readinessDash={readinessDash}
        actions={actions}
      />
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
          <ul className="tod-rec__list">
            {[
              { label: 'MOBILE', value: production.state.mobileVersion },
              { label: 'DESKTOP', value: production.state.desktopVersion },
              { label: 'AUTHORITY', value: production.state.designAuthorityVersion },
            ].map((row) => (
              <li key={row.label} className="tod-rec__row">
                <span className="tod-rec__rowLabel">{row.label}</span>
                <span className="tod-rec__rowValue">{row.value || '—'}</span>
              </li>
            ))}
          </ul>
        : null}
        {tab === 'CHANGE HISTORY' ?
          production.state.history.length === 0 ?
            <p className="tod-rec__empty">NO CHANGES RECORDED YET</p>
          : <ul className="tod-rec__list">
              {production.state.history.slice(-6).reverse().map((entry) => (
                <li key={entry.id} className="tod-rec__row tod-rec__row--stack">
                  <span className="tod-rec__rowLabel">{entry.type.replace(/_/g, ' ')}</span>
                  <span className="tod-rec__rowSub">{entry.summary}</span>
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
