/**
 * P0.VR.TWINV2.3 + 3R1 — Package-driven DOM-first coded twin.
 */

import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { resolveExecutablePackageForConcept } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23/traceActiveApprovedConceptLineage.js';
import { getActiveConceptCandidate } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { buildDomFirstTranslation } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/buildDomFirstTranslation.js';
import { TwinSite00HostBottomNav } from './TwinSite00HostBottomNav.js';
import { NdxTwinDomArtboard } from './NdxTwinDomArtboard.js';
import '../../styles/site00-twin-v2-concept.css';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

function resolvePackage(session: ConceptDirectedTwinSession) {
  const active = getActiveConceptCandidate(session);
  const conceptId = session.renderedTwin?.sourceConceptId ?? active?.conceptId;
  if (!conceptId) return null;
  return resolveExecutablePackageForConcept(session, conceptId);
}

export function ConceptDirectedPackageTwinV2({ projectSlug, session }: Props) {
  const pkg = resolvePackage(session);
  if (!pkg) {
    return (
      <p className="site00-twin-v2-pkg__error" role="alert">
        TWIN_V2_PACKAGE_CONSUMPTION_FAILED: no ExecutableConceptPackage for render
      </p>
    );
  }

  const pageIntent = pkg.pageIntentSnapshot ?? session.pageIntent;
  const functionGraph = pkg.functionGraphSnapshot ?? session.functionGraph;
  const domArtifacts =
    session.twinV2DomTranslation ??
    buildDomFirstTranslation({ pkg, pageIntent, functionGraph });

  const bg = pkg.blueprint.colors.background[0] ?? '#ffffff';
  const lime = pkg.blueprint.colors.lime[0] ?? '#c8ff00';

  return (
    <div
      className="site00-twin-v2-pkg site00-twin-v2-pkg--dom-first"
      data-twin-v2="package-driven-dom"
      data-twin-v2-session={session.sessionId}
      data-twin-v2-build={session.buildRef}
      data-source-package-id={pkg.packageId}
      data-source-concept-id={pkg.conceptId}
      data-source-blueprint-id={pkg.blueprint.blueprintId}
      data-dom-object-count={domArtifacts.expandedObjects.length}
      style={{ ['--twin-v2-pkg-bg' as string]: bg, ['--twin-v2-pkg-lime' as string]: lime }}
    >
      <header className="site00-twin-v2-pkg__host">
        <span className="site00-twin-v2-pkg__host-label">SITE 00</span>
        <span className="site00-twin-v2-pkg__host-route">{projectSlug.toUpperCase()}</span>
      </header>

      <div className="site00-twin-v2-pkg__client-canvas" data-client-mount="true">
        <NdxTwinDomArtboard
          pkg={pkg}
          pageIntent={pageIntent}
          functionGraph={functionGraph}
          expandedObjects={domArtifacts.expandedObjects}
          projectSlug={projectSlug}
        />
      </div>

      <aside className="site00-twin-v2-pkg__lineage" aria-label="Build lineage">
        <p>
          DOM-FIRST · {domArtifacts.sourceTranslationReceipt.domObjectCount} DOM objects · PACKAGE {pkg.packageId.slice(0, 16)}…
        </p>
      </aside>

      <TwinSite00HostBottomNav />
    </div>
  );
}
