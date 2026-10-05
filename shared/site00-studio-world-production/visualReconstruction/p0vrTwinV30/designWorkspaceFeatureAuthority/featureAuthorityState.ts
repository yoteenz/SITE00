import { buildDesignWorkspaceFeatureManifestV1 } from './designWorkspaceFeatureManifestV1.js';
import { buildR5F1AuthoritySelectionChangeSet } from './r5f1ChangeSet.js';
import { buildR5F1MasterAuthorityAmendment } from './masterAmendment.js';
import type { DesignWorkspaceFeatureAuthorityState } from './types.js';

export function emptyDesignWorkspaceFeatureAuthorityState(): DesignWorkspaceFeatureAuthorityState {
  return {
    activeManifest: buildDesignWorkspaceFeatureManifestV1(),
    changeSets: [buildR5F1AuthoritySelectionChangeSet()],
    amendments: [buildR5F1MasterAuthorityAmendment()],
    candidateCoverageById: {},
    masterBindings: [],
  };
}
