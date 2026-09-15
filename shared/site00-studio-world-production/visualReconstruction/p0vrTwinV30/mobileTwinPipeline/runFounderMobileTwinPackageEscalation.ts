import type { DesignPageAuthorityReviewSession } from '../types.js';
import { applyOneTimeFounderAuthorityInjection } from '../founderAuthorityInjection.js';
import { notifyDesignAuthoritySessionChanged } from '../designAuthoritySessionEvents.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';
import { normalizeDesignPageAuthoritySession } from '../designPageAuthorityTerritoryGallery.js';
import { writeDesignPageAuthoritySession } from '../designPageAuthorityPersistence.js';
import { writeMobileTwinAuthorityImageSnapshot } from './mobileTwinAuthorityImageSnapshot.js';
import { writeMobileTwinPipelineToBrowser } from './mobileTwinPipelinePersistence.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from './escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import {
  approveAndPersistMobileTwinPackage,
  compileAndCacheMobileTwinImplementation,
} from '../../p0vrTwinV30R8M/requestMobileTwinImplementation.js';

export type FounderPackageEscalationResult = {
  session: DesignPageAuthorityReviewSession;
  message: string;
};

/** Founder escalation: canonical JPG pair → approved package → twin route compile + browser cache. */
function ensureSessionReadyForFounderEscalation(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  try {
    return ensureMobileDesignReferenceAuthority(session);
  } catch {
    return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(session));
  }
}

export async function runFounderMobileTwinPackageEscalation(input: {
  session: DesignPageAuthorityReviewSession;
  apiBase?: string;
}): Promise<FounderPackageEscalationResult> {
  let session = escalateFounderMobileTwinPackageFromCanonicalAssets(
    ensureSessionReadyForFounderEscalation(input.session),
  );
  session = normalizeDesignPageAuthoritySession(session);
  if (session.mobileTwinPipeline) {
    session.mobileTwinPipeline = hydrateMobileTwinReviewState(session.mobileTwinPipeline);
    writeMobileTwinPipelineToBrowser(session.projectId, session.mobileTwinPipeline);
    writeMobileTwinAuthorityImageSnapshot(session.projectId, session.mobileTwinPipeline);
  }
  writeDesignPageAuthoritySession(session);
  notifyDesignAuthoritySessionChanged(session.projectId);

  try {
    session = await approveAndPersistMobileTwinPackage({ session, apiBase: input.apiBase });
  } catch {
    /* local approve already applied */
  }

  const compile = await compileAndCacheMobileTwinImplementation({ session, apiBase: input.apiBase });
  writeDesignPageAuthoritySession(session);
  notifyDesignAuthoritySessionChanged(session.projectId);

  const message = compile.ok ?
    `Founder package approved from your canonical blueprint JPG. ${compile.message}`
  : `Package approved locally. Twin compile: ${compile.message}`;

  return { session, message };
}
