/**
 * Mobile twin RESTORE offer — visible even after sessionView sync
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryStore = new Map<string, string>();

beforeEach(() => {
  memoryStore.clear();
  const stub = {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
    removeItem: (k: string) => {
      memoryStore.delete(k);
    },
    clear: () => memoryStore.clear(),
    key: () => null,
    length: 0,
  };
  vi.stubGlobal('localStorage', stub);
  vi.stubGlobal('sessionStorage', stub);
});

import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { evaluateMobileTwinRestoreOffer } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinRestoreOffer.js';
import { syncFounderMobileTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { writeMobileTwinPipelineToBrowser } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import { readFileSync } from 'node:fs';

describe('mobile twin restore offer', () => {
  it('Design workspace mounts global recovery strip at top', () => {
    const ws = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(ws).toContain('DesignPageV3MobileTwinGlobalRecoveryStrip');
    expect(ws.indexOf('<DesignPageV3MobileTwinGlobalRecoveryStrip')).toBeLessThan(
      ws.indexOf('<DesignPageV3AuthorityBatch2Panel'),
    );
  });

  it('offers restore when FAL jobs ran but review images are not mounted', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: { ...emptyMobileTwinPipelineState(), falJobsDispatched: 2, packages: [] },
    });
    const synced = syncFounderMobileTwinSession(session, 'ndxbook');
    const view = evaluateMobileTwinRestoreOffer(synced, 'ndxbook');
    expect(view.show).toBe(true);
  });

  it('offers restore when dedicated LS is richer than regressed authority session', () => {
    let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    session = ensureMobileDesignReferenceAuthority({
      ...session,
      mobileTwinPipeline: { ...emptyMobileTwinPipelineState(), falJobsDispatched: 4, packages: [{ id: 'pkg-1', status: 'COMPLETE' } as never] },
    });
    writeMobileTwinPipelineToBrowser('ndxbook', session.mobileTwinPipeline!);
    const regressed = {
      ...session,
      mobileTwinPipeline: { ...emptyMobileTwinPipelineState(), designReference: session.mobileTwinPipeline!.designReference },
    };
    const view = evaluateMobileTwinRestoreOffer(regressed, 'ndxbook');
    expect(view.show).toBe(true);
    expect(view.storedFalJobs).toBeGreaterThan(view.sessionFalJobs);
  });
});
