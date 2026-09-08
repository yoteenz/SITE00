/**
 * B5.8 — Entry 001 package preview (reference-fidelity social review studio).
 */

import type { Entry001PackagePreviewComposition } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import type { Entry001DeliverableRecord, Entry001FormatWorkspaceSummary } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  buildEntry001SocialPreviewModel,
  buildEntry001SocialPreviewPaths,
} from './entry001SocialPreviewAdapter.js';
import { SocialPackagePreviewWorkspace } from '../socialPackagePreview/SocialPackagePreviewWorkspace.js';

type Props = {
  projectSlug: string;
  entryNumber?: string;
  composition: Entry001PackagePreviewComposition;
  deliverables: Entry001DeliverableRecord[];
  formatSummaries: Entry001FormatWorkspaceSummary[];
};

export function Entry001PackagePreviewWorkspace({
  projectSlug,
  entryNumber = '001',
  composition,
  deliverables,
  formatSummaries,
}: Props) {
  const model = buildEntry001SocialPreviewModel({
    entryNumber,
    composition,
    formatSummaries,
    deliverables,
  });
  const paths = buildEntry001SocialPreviewPaths(projectSlug, entryNumber);

  return <SocialPackagePreviewWorkspace projectSlug={projectSlug} model={model} paths={paths} />;
}
