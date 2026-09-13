import type { ConceptDirectedTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { ConceptDirectedNdxOverviewTwinV2 } from './ConceptDirectedNdxOverviewTwinV2.js';
import { ConceptDirectedPackageTwinV2 } from './ConceptDirectedPackageTwinV2.js';

type Props = {
  projectSlug: string;
  session: ConceptDirectedTwinSession;
};

/** Approved V2 builds after TWINV2.3 must use package-driven renderer only. */
export function ResolveConceptDirectedTwinV2Renderer({ projectSlug, session }: Props) {
  const ref = session.renderedTwin?.componentRef;
  if (ref === 'ConceptDirectedPackageTwinV2') {
    return <ConceptDirectedPackageTwinV2 projectSlug={projectSlug} session={session} />;
  }
  if (session.packageDrivenBuild?.packageId || session.renderedTwin?.buildMode === 'PACKAGE_DRIVEN_SOURCE_GENERATION') {
    return <ConceptDirectedPackageTwinV2 projectSlug={projectSlug} session={session} />;
  }
  return <ConceptDirectedNdxOverviewTwinV2 projectSlug={projectSlug} session={session} />;
}
