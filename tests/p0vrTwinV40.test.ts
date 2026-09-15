/**
 * P0.VR.TWINV4.0 — clean-room route isolation (DOM reconstruction disabled in V4.1)
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES } from '../src/site00/config/routes.js';
import { twinV4ProofRoute } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Route.js';
import { TWIN_V4_ISOLATION_CONTRACT, TWIN_V4_FORBIDDEN_V3_IMPORT_FRAGMENTS } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4IsolationContract.js';
import { TWIN_V4_CSS_NAMESPACE, TWIN_V4_FAL_GENERATION_JOBS, TWIN_V4_STORAGE_PREFIX } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import { compileTwinV4ForensicReconstruction } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/compileTwinV4ForensicReconstruction.js';
import { PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/constants.js';
import { extractTwinV4VisualSceneGraph } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/extractTwinV4VisualSceneGraph.js';

describe('P0.VR.TWINV4.0 clean-room route isolation', () => {
  it('route exists and V4 page uses V4.1 extraction', () => {
    expect(SITE00_ROUTES.projectDesignTwinV4).toBe('/projects/:projectSlug/design/twin-v4');
    expect(twinV4ProofRoute('ndxbook')).toBe('/projects/ndxbook/design/twin-v4');
    const page = readFileSync('src/site00/pages/DesignTwinV4ProofPage.tsx', 'utf8');
    expect(page).toContain('compileTwinV41PixelExtraction');
  });

  it('V4 does not import V3 visual compiler / render tree / CSS', () => {
    const page = readFileSync('src/site00/pages/DesignTwinV4ProofPage.tsx', 'utf8');
    const overlay = readFileSync('src/site00/components/designWorkspace/TwinV41PixelExtractionOverlay.tsx', 'utf8');
    for (const frag of TWIN_V4_FORBIDDEN_V3_IMPORT_FRAGMENTS) {
      expect(page).not.toContain(frag);
      expect(overlay).not.toContain(frag);
    }
    expect(TWIN_V4_ISOLATION_CONTRACT.inheritsV3RenderTree).toBe(false);
    expect(TWIN_V4_FAL_GENERATION_JOBS).toBe(0);
  });

  it('V4.0 placeholder scene graph and DOM compile disabled', () => {
    expect(() => extractTwinV4VisualSceneGraph({ forensicBlueprintHash: 'x' })).toThrow(
      PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED,
    );
    expect(() =>
      compileTwinV4ForensicReconstruction({
        projectId: 'ndxbook',
        sourcePackageId: 'p',
        sourceActualHash: 'a'.repeat(32),
      }),
    ).toThrow('DOM_RECONSTRUCTION_DISABLED_V41');
    const css = readFileSync('src/site00/styles/site00-twin-v4-proof.css', 'utf8');
    expect(css).toContain(TWIN_V4_CSS_NAMESPACE);
    expect(TWIN_V4_STORAGE_PREFIX).toBe('site00:twin-v4:');
  });
});
