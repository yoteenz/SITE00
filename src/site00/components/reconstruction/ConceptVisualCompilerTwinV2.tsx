/**
 * P0.VR.TWINV2.4R1 — Visual-to-code compiler render (approved client canvas + interactive DOM).
 */

import type { CSSProperties } from 'react';
import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { getActiveConceptCandidate } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { resolveExecutablePackageForConcept } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23/traceActiveApprovedConceptLineage.js';
import { TwinV2ExecutionClientCanvasFrame } from '../designWorkspace/pageFamily/TwinV2ExecutionClientCanvasFrame.js';
import { TwinSite00HostBottomNav } from './TwinSite00HostBottomNav.js';
import '../../styles/site00-twin-v2-concept.css';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

function overlayStyle(b: { x: number; y: number; w: number; h: number }): CSSProperties {
  return {
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${b.w * 100}%`,
    minHeight: `${b.h * 100}%`,
  };
}

export function ConceptVisualCompilerTwinV2({ projectSlug, session }: Props) {
  const compiler = session.twinV2VisualCompiler;
  const active = getActiveConceptCandidate(session);
  const conceptId = session.renderedTwin?.sourceConceptId ?? active?.conceptId;
  const pkg = conceptId ? resolveExecutablePackageForConcept(session, conceptId) : null;

  if (!compiler || !pkg) {
    return (
      <p className="site00-twin-v2-v2c__error" role="alert">
        TWIN_V2_VISUAL_COMPILER_FAILED_CLOSED: missing compiler artifacts
      </p>
    );
  }

  const boundary = session.conceptGallery?.clientCanvasBoundaries?.[compiler.visualAuthority.visualAuthorityId];
  const fg = pkg.functionGraphSnapshot ?? session.functionGraph;
  const plan = compiler.visualImplementationPlan;
  const imageUrl = compiler.visualAuthority.assetUrl;
  const lime = pkg.blueprint.colors.lime[0] ?? '#c8ff00';

  return (
    <div
      className="site00-twin-v2-v2c"
      data-twin-v2="visual-compiler"
      data-compiler-run-id={compiler.compilerInvocationReceipt.compilerRunId}
      data-visual-plan-id={plan.planId}
      data-twin-v2-build={session.buildRef}
      style={{ ['--twin-v2-lime' as string]: lime }}
    >
      <header className="site00-twin-v2-v2c__host">
        <span className="site00-twin-v2-v2c__host-label">SITE 00</span>
        <span className="site00-twin-v2-v2c__host-route">{projectSlug.toUpperCase()}</span>
        <span className="site00-twin-v2-v2c__strategy">VISUAL_TO_CODE_COMPILER</span>
      </header>

      <div className="site00-twin-v2-v2c__client-canvas" data-client-mount="true">
        {boundary && imageUrl ? (
          <TwinV2ExecutionClientCanvasFrame imageUrl={imageUrl} boundary={boundary} alt="Approved concept client canvas" />
        ) : null}

        <div className="site00-twin-v2-v2c__overlays" aria-label="Compiler-bound interactive regions">
          {plan.regions
            .filter((r) => r.renderAs === 'DOM')
            .slice(0, 8)
            .map((region) => (
              <div
                key={region.regionId}
                className="site00-twin-v2-v2c__region"
                data-exec-object-id={region.regionId}
                style={overlayStyle(region.bounds)}
              >
                {region.role.toLowerCase().includes('nav') ? (
                  <nav className="site00-twin-v2-v2c__nav">
                    {fg.sectionNavigation.map((item) => (
                      <button key={item} type="button" className="site00-twin-v2-v2c__nav-btn">
                        {item}
                      </button>
                    ))}
                  </nav>
                ) : null}
                {region.role.toLowerCase().includes('progress') ? (
                  <div className="site00-twin-v2-v2c__progress" role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
                    <div className="site00-twin-v2-v2c__progress-fill" style={{ width: '42%' }} />
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      </div>

      <aside className="site00-twin-v2-v2c__meta">
        <p>
          COMPILER {compiler.compilerInvocationReceipt.compilerRunId.slice(0, 18)}… · VISUAL{' '}
          {compiler.visualAuthority.hash} · REGIONS {plan.regions.length}
        </p>
      </aside>

      <TwinSite00HostBottomNav />
    </div>
  );
}
