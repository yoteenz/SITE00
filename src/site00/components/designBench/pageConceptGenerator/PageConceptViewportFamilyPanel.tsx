/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1
 */

import { Link } from 'react-router-dom';

import { assertOpusShellTargetSurface } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function jobImage(state: PageConceptGenerationState, artifactId: string | null | undefined): string | null {
  if (!artifactId) return null;
  const job = state.generationJobs.find((j) => j.artifactId === artifactId);
  if (job?.imageUri) return job.imageUri;
  const mobile = state.pipelineSet?.mobileConcepts?.find((c) => c.artifactId === artifactId);
  return mobile?.imageUri ?? null;
}

export type PageConceptViewportFamilyPanelProps = {
  state: PageConceptGenerationState;
  onSelectMobile: (conceptId: string) => void;
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

  return (
    <div className="s00-pcg__viewportFamily" data-testid="page-concept-viewport-family-panel">
      {mobileConcepts.length > 0 && !family?.selectedMobileConceptId ?
        <section data-testid="page-concept-mobile-selection">
          <p>SELECT MOBILE CONCEPT</p>
          <div className="s00-pcg__mobilePickGrid">
            {mobileConcepts.map((c) => (
              <button
                key={c.conceptId}
                type="button"
                disabled={props.busy}
                data-testid={`page-concept-pick-mobile-${c.slot}`}
                onClick={() => props.onSelectMobile(c.conceptId)}
              >
                {c.slot.replace('MOBILE_CONCEPT_', '')}
                {c.imageUri ?
                  <img src={c.imageUri} alt={c.slot} />
                : null}
              </button>
            ))}
          </div>
        </section>
      : null}

      {family?.selectedMobileConceptId && !experience?.approvedAt ?
        <section>
          <p>EXPERIENCE EXPRESSION — inspect overlay patterns then continue.</p>
          <button
            type="button"
            disabled={props.busy}
            data-testid="page-concept-continue-experience"
            onClick={props.onContinueExperience}
          >
            CONTINUE TO EXPERIENCE EXPRESSION
          </button>
        </section>
      : null}

      {family?.status === 'EXPERIENCE_DEFINED' && !family.tabletArtifactId ?
        <section>
          <button type="button" disabled={props.busy} data-testid="page-concept-run-tablet" onClick={props.onRunTablet}>
            GENERATE TABLET INTERPRETATION
          </button>
        </section>
      : null}

      {family?.tabletArtifactId && !family.desktopArtifactId ?
        <section>
          <button type="button" disabled={props.busy} data-testid="page-concept-run-desktop" onClick={props.onRunDesktop}>
            GENERATE DESKTOP INTERPRETATION
          </button>
          <button type="button" disabled={props.busy} data-testid="page-concept-regen-tablet" onClick={props.onRegenerateTablet}>
            REGENERATE TABLET
          </button>
        </section>
      : null}

      {family?.mobileArtifactId && family.tabletArtifactId && family.desktopArtifactId ?
        <section data-testid="page-concept-viewport-family-review">
          <p>VIEWPORT AUTHORITY FAMILY</p>
          {(['MOBILE', 'TABLET', 'DESKTOP'] as const).map((vp) => {
            const artifactId =
              vp === 'MOBILE' ? family.mobileArtifactId
              : vp === 'TABLET' ? family.tabletArtifactId
              : family.desktopArtifactId;
            const src = jobImage(props.state, artifactId);
            return (
              <div key={vp} data-testid={`page-concept-family-${vp.toLowerCase()}`}>
                <span>{vp}</span>
                {src ?
                  <button type="button" onClick={() => props.onOpenImage(src, `${vp} AUTHORITY`)}>
                    INSPECT
                  </button>
                : null}
              </div>
            );
          })}
          {family.status === 'AWAITING_FOUNDER_FAMILY_REVIEW' || family.status === 'APPROVED' ?
            <>
              <button type="button" disabled={props.busy} data-testid="page-concept-approve-family" onClick={props.onApproveFamily}>
                APPROVE VIEWPORT FAMILY
              </button>
              <button type="button" disabled={props.busy} data-testid="page-concept-regen-desktop" onClick={props.onRegenerateDesktop}>
                REGENERATE DESKTOP
              </button>
            </>
          : null}
          {family.status === 'APPROVED' ?
            <button type="button" disabled={props.busy} data-testid="page-concept-lock-family" onClick={props.onLockFamily}>
              LOCK VIEWPORT FAMILY FOR TWIN
            </button>
          : null}
        </section>
      : null}

      {family?.status === 'LOCKED' && !twinPkg ?
        <button type="button" disabled={props.busy} data-testid="page-concept-create-twin-package" onClick={props.onCreateTwinPackage}>
          CREATE TWIN IMPLEMENTATION PACKAGE
        </button>
      : null}

      {twinPkg ?
        <section data-testid="page-concept-twin-package-ready">
          <p>
            TWIN PACKAGE {twinPkg.packageId} → {twinPkg.twinRoute}
          </p>
          <Link
            to={twinPkg.twinRoute}
            data-testid="page-concept-create-twin-shell-opus"
            onClick={() => assertOpusShellTargetSurface(twinPkg.targetSurface)}
          >
            CREATE TWIN SHELL WITH OPUS
          </Link>
        </section>
      : null}
    </div>
  );
}
