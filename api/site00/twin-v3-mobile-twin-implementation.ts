/**
 * P0.VR.TWINV3.0R8M — Durable mobile twin approval + implementation compiler API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { P0_VR_TWIN_V30_BUILD } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { P0_VR_TWIN_V30R8M_LINEAGE } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/constants.js';
import type { DesignPageAuthorityReviewSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import type { MobileTwinImplementationApiAction, MobileTwinImplementationCorrectionReason } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import {
  approveMobileTwinImplementationService,
  compileMobileTwinImplementationService,
  getMobileTwinImplementationStateService,
  persistMobileTwinPackageApprovalService,
  requestMobileTwinImplementationCorrectionService,
} from '../_lib/site00MobileTwinImplementation/mobileTwinImplementationService.js';
import { isMobileTwinPackageApprovalConfirmed } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/confirmMobileTwinPackageApproval.js';
import { approveMobileTwinPackage } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';

type Body = {
  session?: DesignPageAuthorityReviewSession;
  action: MobileTwinImplementationApiAction;
  projectId?: string;
  buildId?: string;
  correctionReason?: MobileTwinImplementationCorrectionReason;
  correctionNote?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    const projectId = String(req.query.projectId ?? '');
    if (!projectId) {
      res.status(400).json({ error: 'INVALID_REQUEST' });
      return;
    }
    try {
      const state = await getMobileTwinImplementationStateService(projectId);
      res.status(200).json({ ok: true, buildRef: P0_VR_TWIN_V30_BUILD, lineage: P0_VR_TWIN_V30R8M_LINEAGE, state });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MOBILE_TWIN_IMPLEMENTATION_FAILED';
      res.status(500).json({ error: message });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.action) {
    res.status(400).json({ error: 'INVALID_REQUEST' });
    return;
  }

  try {
    switch (body.action) {
      case 'PERSIST_PACKAGE_APPROVAL': {
        if (!body.session) {
          res.status(400).json({ error: 'INVALID_REQUEST' });
          return;
        }
        let session = body.session;
        if (!isMobileTwinPackageApprovalConfirmed(session)) {
          session = approveMobileTwinPackage(session);
        }
        const record = await persistMobileTwinPackageApprovalService(session);
        res.status(200).json({ ok: true, approval: record, sessionUpdatedAt: session.updatedAt });
        return;
      }
      case 'GET_IMPLEMENTATION_STATE': {
        const projectId = body.projectId ?? body.session?.projectId;
        if (!projectId) {
          res.status(400).json({ error: 'INVALID_REQUEST' });
          return;
        }
        const state = await getMobileTwinImplementationStateService(projectId);
        res.status(200).json({ ok: true, state });
        return;
      }
      case 'COMPILE_IMPLEMENTATION': {
        if (!body.session) {
          res.status(400).json({ error: 'INVALID_REQUEST' });
          return;
        }
        const result = await compileMobileTwinImplementationService(body.session);
        res.status(200).json({ ok: true, ...result });
        return;
      }
      case 'APPROVE_IMPLEMENTATION': {
        const projectId = body.projectId ?? body.session?.projectId;
        if (!projectId || !body.buildId) {
          res.status(400).json({ error: 'INVALID_REQUEST' });
          return;
        }
        const result = await approveMobileTwinImplementationService(projectId, body.buildId);
        res.status(200).json({ ok: true, ...result });
        return;
      }
      case 'REQUEST_IMPLEMENTATION_CORRECTION': {
        const projectId = body.projectId ?? body.session?.projectId;
        if (!projectId || !body.buildId || !body.correctionReason) {
          res.status(400).json({ error: 'INVALID_REQUEST' });
          return;
        }
        const result = await requestMobileTwinImplementationCorrectionService({
          projectId,
          buildId: body.buildId,
          reason: body.correctionReason,
          note: body.correctionNote,
        });
        res.status(200).json({ ok: true, ...result });
        return;
      }
      default:
        res.status(400).json({ error: 'INVALID_ACTION' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'MOBILE_TWIN_IMPLEMENTATION_FAILED';
    const status =
      message.includes('NO_APPROVED') || message.includes('NOT_BUILT') ? 404
      : message.includes('NOT_APPROVED') ? 422
      : message.includes('SCHEMA_MISSING') || message.includes('STORE_UNAVAILABLE') ? 503
      : 500;
    res.status(status).json({ error: message });
  }
}
