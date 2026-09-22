/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1 + founder review UX refinement.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { assertOpusShellTargetSurface } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PageConceptContainedPreviewFrame } from './PageConceptContainedPreviewFrame';
import { PageConceptGpt2MobileConceptReview } from './PageConceptGpt2MobileConceptReview';
import { buildGpt2MobileSlotPresentations } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';

function jobImage(state: PageConceptGenerationState, artifactId: string | null | undefined): string | null {
  if (!artifactId) return null;
  const job = state.generationJobs.find((j) => j.artifactId === artifactId);
  if (job?.imageUri) return job.imageUri;
  const mobile = state.pipelineSet?.mobileConcepts?.find((c) => c.artifactId === artifactId);
  return mobile?.imageUri ?? null;
}

const EXPERIENCE_TILE_LABELS = [
  'DRAWER / SHEET',
  'MODAL',
  'MENU / DROPDOWN',
  'INSPECTOR',
  'CONFIRMATION',
  'LOADING / EMPTY / ERROR',
] as const;

export type PageConceptViewportFamilyPanelProps = {
  state: PageConceptGenerationState;
  onSelectMobile: (conceptId: string) => void;
  onConfirmMobileSelection?: () => void;
  onChangeMobileSelection?: () => void;
  onContinueExperience: () => void;
  onRunTablet: () => void;
  onRunDesktop: () => void;
  onRegenerateTablet: () => void;
  onRegenerateDesktop: () => void;
  onApproveFamily: () => void;
  onLockFamily: () => void;
  onCreateTwinPackage: () => void;
  onOpenImage: (src: string, title: string) => void;
  busy?: boolean;
};

export function PageConceptViewportFamilyPanel(props: PageConceptViewportFamilyPanelProps) {
  const family = props.state.pipelineSet?.viewportAuthorityFamily;
  const mobileConcepts = props.state.pipelineSet?.mobileConcepts ?? [];
  const experience = props.state.pipelineSet?.experienceExpressionContract;
  const twinPkg = props.state.pipelineSet?.twinImplementationPackage;
  const [pendingConceptId, setPendingConceptId] = useState<string | null>(null);

  const mobileSlots = useMemo(() => buildGpt2MobileSlotPresentations(props.state), [props.state]);

  const selectedConcept = mobileConcepts.find((c) => c.conceptId === family?.selectedMobileConceptId);
  const selectedLabel =
    selectedConcept?.slot.replace('MOBILE_CONCEPT_', '') as 'A' | 'B' | 'C' | undefined;

  const allViewportsReady =
    Boolean(family?.mobileArtifactId) &&
    Boolean(family?.tabletArtifactId) &&
    Boolean(family?.desktopArtifactId) &&
    Boolean(experience?.approvedAt);

  return (
    <div className="s00-pcg__viewportFamily" data-testid="page-concept-viewport-family-panel">
      {mobileConcepts.length > 0 && !family?.selectedMobileConceptId ?
        <section data-testid="page-concept-mobile-selection" className="s00-pcg__viewportSection">
          <header className="s00-pcg__viewportSectionHead">
            <h3>GPT2 MOBILE CONCEPT REVIEW</h3>
            <p>SELECT ONE MOBILE AUTHORITY TO CONTINUE.</p>
          </header>
          <PageConceptGpt2MobileConceptReview
            slots={mobileSlots}
            selectedLabel={null}
            onInspectFullscreen={(src, title) => props.onOpenImage(src, title)}
            onSelect={(slot) => {
              const concept = mobileConcepts.find((c) => c.slot === `MOBILE_CONCEPT_${slot.label}`);
              if (concept) setPendingConceptId(concept.conceptId);
            }}
          />
        </section>
      : null}

      {(pendingConceptId || family?.selectedMobileConceptId) && !experience?.approvedAt ?
        <section className="s00-pcg__viewportSection" data-testid="page-concept-mobile-selected-state">
          <header className="s00-pcg__viewportSectionHead">
            <h3>SELECTED MOBILE AUTHORITY</h3>
            <p data-testid="page-concept-selected-mobile-label">
              CONCEPT {selectedLabel ?? pendingConceptId?.slice(-1) ?? '—'}
            </p>
          </header>
          <div className="s00-pcg__mobileSelectedActions">
            <button
              type="button"
              className="s00-pcg__secAction s00-pcg__secAction--primary"
              disabled={props.busy}
              data-testid="page-concept-confirm-mobile-selection"
              onClick={() => {
                const id = pendingConceptId ?? family?.selectedMobileConceptId;
                if (id && !family?.selectedMobileConceptId) props.onSelectMobile(id);
                props.onConfirmMobileSelection?.();
              }}
            >
              CONFIRM SELECTION
            </button>
            <button
              type="button"
              className="s00-pcg__secAction"
              disabled={props.busy}
              data-testid="page-concept-change-mobile-selection"
              onClick={() => {
                setPendingConceptId(null);
                props.onChangeMobileSelection?.();
              }}
            >
              CHANGE SELECTION
            </button>
          </div>
        </section>
      : null}

      {family?.selectedMobileConceptId && experience && !experience.approvedAt && !pendingConceptId ?
        <section className="s00-pcg__viewportSection" data-testid="page-concept-experience-expression-review">
          <header className="s00-pcg__viewportSectionHead">
            <h3>EXPERIENCE EXPRESSION</h3>
            <p>Representative overlay and system behavior.</p>
          </header>
          <div className="s00-pcg__experienceTiles">
            {EXPERIENCE_TILE_LABELS.map((label, i) => (
              <article key={label} className="s00-pcg__experienceTile">
                <span className="s00-pcg__experienceTileLabel">{label}</span>
                <p>{experience.overlayPatterns[i] ?? 'Surface behavior derived from mobile authority + skin contract.'}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="s00-pcg__secAction s00-pcg__secAction--primary"
            disabled={props.busy}
            data-testid="page-concept-approve-experience"
            onClick={props.onContinueExperience}
          >
            APPROVE EXPERIENCE EXPRESSION
          </button>
        </section>
      : null}

      {family?.status === 'EXPERIENCE_DEFINED' && !family.tabletArtifactId ?
        <section className="s00-pcg__viewportSection">
          <button type="button" disabled={props.busy} className="s00-pcg__secAction" data-testid="page-concept-run-tablet" onClick={props.onRunTablet}>
            GENERATE TABLET INTERPRETATION
          </button>
        </section>
      : null}

      {family?.tabletArtifactId && !family.desktopArtifactId ?
        <section className="s00-pcg__viewportSection">
          <button type="button" disabled={props.busy} className="s00-pcg__secAction" data-testid="page-concept-run-desktop" onClick={props.onRunDesktop}>
            GENERATE DESKTOP INTERPRETATION
          </button>
          <button type="button" disabled={props.busy} className="s00-pcg__secAction" data-testid="page-concept-regen-tablet" onClick={props.onRegenerateTablet}>
            REGENERATE TABLET
          </button>
        </section>
      : null}

      {family?.mobileArtifactId && (family.tabletArtifactId || family.desktopArtifactId) ?
        <section className="s00-pcg__viewportSection" data-testid="page-concept-viewport-family-review">
          <header className="s00-pcg__viewportSectionHead">
            <h3>VIEWPORT FAMILY</h3>
            {allViewportsReady ?
              <p data-testid="page-concept-viewport-family-ready">VIEWPORT FAMILY READY</p>
            : null}
          </header>
          <div className="s00-pcg__viewportFamilyGrid">
            {(
              [
                { vp: 'MOBILE' as const, role: 'SOURCE AUTHORITY', artifactId: family.mobileArtifactId },
                { vp: 'TABLET' as const, role: 'AUTHORED INTERPRETATION', artifactId: family.tabletArtifactId },
                { vp: 'DESKTOP' as const, role: 'AUTHORED INTERPRETATION', artifactId: family.desktopArtifactId },
              ] as const
            ).map(({ vp, role, artifactId }) => {
              const src = jobImage(props.state, artifactId);
              return (
                <article key={vp} className="s00-pcg__viewportFamilyCard" data-testid={`page-concept-family-${vp.toLowerCase()}`}>
                  <span className="s00-pcg__viewportFamilyVp">{vp}</span>
                  <span className="s00-pcg__viewportFamilyRole">{role}</span>
                  <PageConceptContainedPreviewFrame
                    size={vp === 'MOBILE' ? 'mobile' : vp === 'TABLET' ? 'tablet' : 'desktop'}
                    viewportLabel={`${vp} INTERPRETATION`}
                    status={src ? 'READY' : 'PENDING'}
                    imageSrc={src}
                    testId={`page-concept-viewport-preview-${vp.toLowerCase()}`}
                  />
                  <div className="s00-pcg__viewportFamilyCardActions">
                    {src ?
                      <>
                        <button type="button" className="s00-pcg__secAction" onClick={() => props.onOpenImage(src, `${vp} INTERPRETATION`)}>
                          FULLSCREEN
                        </button>
                        <button type="button" className="s00-pcg__secAction" onClick={() => props.onOpenImage(src, `${vp} INTERPRETATION`)}>
                          INSPECT
                        </button>
                      </>
                    : null}
                    {vp === 'TABLET' && family.tabletArtifactId ?
                      <button type="button" className="s00-pcg__secAction" disabled={props.busy} onClick={props.onRegenerateTablet}>
                        REGENERATE
                      </button>
                    : null}
                    {vp === 'DESKTOP' && family.desktopArtifactId ?
                      <button type="button" className="s00-pcg__secAction" disabled={props.busy} onClick={props.onRegenerateDesktop}>
                        REGENERATE
                      </button>
                    : null}
                  </div>
                </article>
              );
            })}
          </div>
          {allViewportsReady ?
            <ul className="s00-pcg__viewportFamilyChecklist" data-testid="page-concept-viewport-checklist">
              <li>MOBILE ✓</li>
              <li>TABLET ✓</li>
              <li>DESKTOP ✓</li>
              <li>EXPERIENCE ✓</li>
            </ul>
          : null}
          {family.status === 'AWAITING_FOUNDER_FAMILY_REVIEW' || family.status === 'APPROVED' ?
            <>
              <button type="button" disabled={props.busy || !allViewportsReady} className="s00-pcg__secAction s00-pcg__secAction--primary" data-testid="page-concept-approve-family" onClick={props.onApproveFamily}>
                APPROVE VIEWPORT FAMILY
              </button>
              <button type="button" disabled={props.busy} className="s00-pcg__secAction" data-testid="page-concept-request-viewport-changes">
                REQUEST CHANGES
              </button>
            </>
          : null}
          {family.status === 'APPROVED' &&
          props.state.pipelineSet?.pageFamilySkinBehaviorContract?.approvedAt &&
          props.state.pipelineSet?.opusRepresentativeShellSet?.readyAt ?
            <button type="button" disabled={props.busy} className="s00-pcg__secAction" data-testid="page-concept-lock-family" onClick={props.onLockFamily}>
              LOCK VIEWPORT FAMILY FOR TWIN
            </button>
          : null}
        </section>
      : null}

      {family?.status === 'LOCKED' && !twinPkg ?
        <button type="button" disabled={props.busy} className="s00-pcg__secAction s00-pcg__secAction--primary" data-testid="page-concept-create-twin-package" onClick={props.onCreateTwinPackage}>
          CREATE TWIN IMPLEMENTATION PACKAGE
        </button>
      : null}

      {twinPkg ?
        <section data-testid="page-concept-twin-package-ready" className="s00-pcg__viewportSection">
          <p>TWIN PACKAGE {twinPkg.packageId}</p>
          {twinPkg.pageFamilySkinBehaviorContractId ?
            <Link
              to={twinPkg.twinRoute}
              className="s00-pcg__twinPrimaryLink"
              data-testid="page-concept-create-twin-shell-opus"
              onClick={() => assertOpusShellTargetSurface(twinPkg.targetSurface)}
            >
              CREATE TWIN SHELL WITH OPUS
            </Link>
          : null}
        </section>
      : null}
    </div>
  );
}
