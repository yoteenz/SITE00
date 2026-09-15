/**
 * P0.VR.TWINV3.0R8M2R5F1 — client process fix + server Fal forensic dispatch
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  CLIENT_PROCESS_REFERENCE_AUDIT,
  TWIN_CLIENT_PROCESS_FORBIDDEN_FILES,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/clientProcessReferenceAudit.js';
import { generateForensicUiBlueprintForSession } from '../api/_lib/site00MobileTwinImplementation/forensicUiBlueprintService.js';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { ensureNdxbookTwinImplementationReady } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/ensureNdxbookTwinAutobuild.js';
import { readTwinImplementationCache } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/twinImplementationBrowserCache.js';
import { MOBILE_TWIN_IMPLEMENTATION_CLIENT_CACHE_EPOCH } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/constants.js';
import { P0_VR_TWIN_V30_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { requestForensicUiBlueprintGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestForensicUiBlueprint.js';
import {
  isSite00PreviewHost,
  listForensicUiBlueprintApiPostUrls,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveForensicUiBlueprintApiUrl.js';
import forensicHandler from '../api/site00/twin-v3-forensic-ui-blueprint.js';

const UNGUARDED_PROCESS_ENV = /(?<!typeof process !== 'undefined' && )process\.env/;

function founderSession() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  return escalateFounderMobileTwinPackageFromCanonicalAssets(session);
}

describe('P0.VR.TWINV3.0R8M2R5F1 runtime recovery', () => {
  it('1–2 ClientProcessReferenceAudit — no unguarded process.env in twin client path', () => {
    expect(CLIENT_PROCESS_REFERENCE_AUDIT.length).toBeGreaterThan(0);
    for (const file of TWIN_CLIENT_PROCESS_FORBIDDEN_FILES) {
      const src = readFileSync(file, 'utf8');
      expect(src.match(UNGUARDED_PROCESS_ENV)).toBeNull();
    }
  });

  it('3–4 Twin route source imports compile path; build stamp bumped', () => {
    const page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(page).toContain('DesignTwinImplementationPage');
    expect(page).not.toMatch(UNGUARDED_PROCESS_ENV);
    expect(P0_VR_TWIN_V30_BUILD).toBe('v472');
    expect(isSite00PreviewHost('site00.fsbw-dev.com')).toBe(true);
    const previewUrls = listForensicUiBlueprintApiPostUrls();
    expect(previewUrls.length).toBeGreaterThanOrEqual(1);
    expect(MOBILE_TWIN_IMPLEMENTATION_CLIENT_CACHE_EPOCH).toBe(2);
  });

  it('5–8 forensic API service dispatches Fal and captures request id', async () => {
    const session = founderSession();
    const packageId = session.mobileTwinPipeline!.latestPackageId!;
    const result = await generateForensicUiBlueprintForSession({ session, packageId });
    expect(result.dispatchReceipt.status).toBe('DISPATCHED');
    expect(result.receipt.requestId).toBeTruthy();
    expect(result.dispatchReceipt.falRequestId).toBe(result.receipt.requestId);
    expect(result.authority.falResultUrl).toContain('vitest-fal://');
  });

  it('6–7 client API module exists; server route registered', () => {
    expect(typeof requestForensicUiBlueprintGeneration).toBe('function');
    const routes = readFileSync('server/routes.ts', 'utf8');
    expect(routes).toContain('/api/site00/twin-v3-forensic-ui-blueprint');
    expect(readFileSync('scripts/vite-site00-local-api.mjs', 'utf8')).toContain('twin-v3-forensic-ui-blueprint');
    expect(typeof forensicHandler).toBe('function');
  });

  it('9–12 vitest autobuild still compiles; no FAL_KEY in client request module', async () => {
    await ensureNdxbookTwinImplementationReady('ndxbook');
    const cache = readTwinImplementationCache('ndxbook');
    expect(cache?.document.compilerGeneration).toBe('R8M2R5');
    const clientReq = readFileSync(
      'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/requestForensicUiBlueprint.ts',
      'utf8',
    );
    expect(clientReq).not.toMatch(/process\.env\.FAL_KEY/);
    expect(clientReq).not.toMatch(UNGUARDED_PROCESS_ENV);
  });

  it('13–14 design route unchanged; desktop zero', () => {
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('twin-v3-forensic-ui-blueprint');
    expect(designWs).not.toContain('FORENSIC_BLUEPRINT_GENERATION_FAILED');
  });
});
