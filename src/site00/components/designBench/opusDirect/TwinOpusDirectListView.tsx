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

import { twinOpusDirectAssetEntry, type TwinOpusDirectAssetSlotId } from './twinOpusDirectAssetManifest';
import { type TwinOpusDirectViewportId } from './twinOpusDirectContent';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { PageConceptContainedPreviewFrame } from '../pageConceptGenerator/PageConceptContainedPreviewFrame';
import { DesignConceptCandidateGalleryRail } from './DesignConceptCandidateGalleryRail';
import { previewStatusForCandidate } from './DesignConceptCandidateGalleryCard';
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
  TodIconDesktop,
  TodIconExpand,
  TodIconInspect,
  TodIconLock,
  TodIconLockOpen,
  TodIconPhone,
  TodIconSliders,
  TodIconTablet,
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

/** LIST body: the transplanted Spark digest, bound to shared state. */
export function TwinOpusDirectListBody({ workspace }: { workspace: TwinOpusDirectWorkspace }) {
  const { data, state, actions, readinessDash, production, selectedCandidate } = workspace;
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
                    <span className="tod-lv-device__ico-wrap">
                      <Icon className="tod-lv-device__ico" />
                    </span>
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
            <DesignHeroComparePanel workspace={workspace} variant="list" />

            <aside className="tod-lv-rail" aria-label="Authority rail">
              {data.canonicalGpt2ViewportFamilyActive ?
                <section className="tod-lv-rail__viewportFamily" data-testid="viewport-family-authority-rail">
                  {data.viewportFamilyRail.map((row) => (
                    <div key={row.id} className="tod-lv-rail__viewportFamilyRow">
                      <span className="tod-lv-rail__viewportFamilyLabel">{row.label}</span>
                      <span className="tod-lv-rail__viewportFamilyValue">{row.value}</span>
                      <span className={`tod-lv-rail__viewportFamilyStatus tod-lv-rail__viewportFamilyStatus--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </section>
              : <>
              <div className="tod-lv-rail__select">
                <button
                  type="button"
                  className="tod-lv-rail__selectBtn"
                  aria-pressed={production.state.mobileAuthority === 'SELECTED'}
                  onClick={() => actions.selectForMobile()}
                >
                  <TodIconCheck className="tod-ico tod-lv-rail__selectCheck" />
                  {data.selectActions.mobile.label}
                </button>
                <span className="tod-lv-rail__selectState">{production.state.mobileAuthority}</span>
              </div>
              <button type="button" className="tod-lv-rail__ghost" onClick={() => actions.selectForDesktop()}>
                {data.selectActions.desktop.label}
              </button>

              <section className="tod-lv-pair">
                <button
                  type="button"
                  className="tod-lv-pair__head"
                  aria-expanded={state.authorityPairOpen}
                  onClick={() => actions.toggleAuthorityPair()}
                >
                  {data.authorityPairPresentation.title}
                  <TodIconChevronUp className={`tod-ico tod-lv-pair__caret${state.authorityPairOpen ? '' : ' is-closed'}`} />
                </button>
                <div className="tod-lv-pair__body" hidden={!state.authorityPairOpen}>
                  <div className="tod-lv-pair__row tod-lv-pair__row--mobile">
                    <span className="tod-lv-pair__label">{data.authorityPairPresentation.mobile.label}</span>
                    <span className="tod-lv-pair__version">
                      {data.authorityPairPresentation.mobile.version}
                    </span>
                    <div className="tod-lv-pair__thumb tod-lv-pair__thumb--mobile">
                      <span className="tod-lv-pair__thumbCopy">
                        <span>THE SIGNAL</span>
                        <span>IS THE INDEX</span>
                      </span>
                      <TodAuthorityThumbPreview
                        className="tod-lv-pair__thumbPlate"
                        previewSrc={data.authorityPairPresentation.mobile.previewSrc}
                        missing={data.authorityPairPresentation.mobile.missing}
                        slot="authorityMobile"
                        variant="mobile"
                      />
                    </div>
                    <span className="tod-lv-pair__state">
                      {data.authorityPairPresentation.mobile.state}
                    </span>
                  </div>
                  <div className="tod-lv-pair__row tod-lv-pair__row--desktop">
                    <span className="tod-lv-pair__label">{data.authorityPairPresentation.desktop.label}</span>
                    <span className="tod-lv-pair__version">
                      {data.authorityPairPresentation.desktop.version}
                    </span>
                    <div className="tod-lv-pair__thumb tod-lv-pair__thumb--desktop">
                      <span className="tod-lv-pair__thumbCopy">
                        <span>THE SIGNAL</span>
                        <span>IS THE INDEX</span>
                      </span>
                      {data.authorityPairPresentation.desktop.missing ?
                        <TodAuthorityThumbPreview
                          className="tod-lv-pair__thumbPhoto"
                          previewSrc={null}
                          missing
                          slot="authorityDesktop"
                          variant="desktop"
                        />
                      : <>
                          <TodAuthorityThumbPreview
                            className="tod-lv-pair__thumbPhoto"
                            previewSrc={data.authorityPairPresentation.desktop.previewSrc}
                            missing={false}
                            slot="authorityDesktop"
                            variant="desktop"
                          />
                          <span className="tod-lv-pair__thumbWedge" aria-hidden="true" />
                        </>
                      }
                    </div>
                    <span className="tod-lv-pair__meta">{data.authorityPairPresentation.tabletLabel}</span>
                    <button
                      type="button"
                      className="tod-lv-pair__replace"
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
                  className={`tod-lv-rail__action tod-lv-rail__action--${action.tone}${
                    action.lock ? ' tod-lv-rail__action--lock' : ''
                  }`}
                  disabled={Boolean(disabledReason)}
                  title={disabledReason ?? undefined}
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
              );
              })}
              </>}
            </aside>
          </section>

          {/* 07 CANDIDATE_GALLERY */}
          <section
            className="tod-lv-gallery"
            aria-label={data.gallery.title}
            data-testid="page-concept-candidate-gallery"
          >
            <header className="tod-lv-gallery__head">
              <h2 className="tod-lv-gallery__title">{data.galleryViewportTitle}</h2>
              <button type="button" className="tod-lv-gallery__compare" onClick={() => actions.openCompareConcepts()}>
                {data.gallery.compare}
                <TodIconCompare className="tod-ico tod-lv-gallery__compareIco" />
              </button>
            </header>
            <div className="tod-lv-gallery__body">
              {data.galleryEmptyMessage ?
                <div
                  className="tod-lv-gallery__emptyWrap"
                  data-testid={data.galleryEmptyTestId ?? 'gallery-page-concept-empty'}
                >
                  <p className="tod-lv-gallery__empty">{data.galleryEmptyMessage}</p>
                  {data.galleryEmptySecondaryLine ?
                    <p className="tod-lv-gallery__empty">{data.galleryEmptySecondaryLine}</p>
                  : null}
                  {data.pageConceptGenerationGate.blockerMessage ?
                    <p className="tod-lv-gallery__blocked" data-testid="generate-page-concepts-blocked-reason">
                      {data.pageConceptGenerationGate.blockerMessage}
                      {data.pageConceptGenerationGate.resolutionAction ?
                        ` ${data.pageConceptGenerationGate.resolutionAction}`
                      : null}
                    </p>
                  : null}
                  <button
                    type="button"
                    className="tod-lv-gallery__generate"
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
              <DesignConceptCandidateGalleryRail workspace={workspace} variant="list" railRef={galleryRef} />
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
              {data.galleryCandidateActions.map((action) => {
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

        <div
          className="tod-lv-concept"
          id="tod-lv-concept-panel"
          role="tabpanel"
          aria-labelledby={`tod-lv-tab-${state.recordTabIndex}`}
        >
          <div className="tod-lv-concept__thumb">
            {selectedCandidate && (selectedCandidate.previewSrc || selectedCandidate.headerThumbnailUri) ?
              <>
                <span className="tod-lv-concept__thumbVersion">{selectedCandidate.version}</span>
                <PageConceptContainedPreviewFrame
                  size="mobile"
                  objectFit="contain"
                  status={previewStatusForCandidate(selectedCandidate)}
                  imageSrc={selectedCandidate.previewSrc ?? selectedCandidate.headerThumbnailUri}
                  testId="list-concept-record-preview"
                />
              </>
            : <>
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
              </>
            }
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
          <button type="button" className="tod-lv-concept__view" onClick={() => actions.openAmendmentDetail()}>
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
