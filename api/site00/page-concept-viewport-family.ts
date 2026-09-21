/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1 — founder viewport-family actions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getAuthUser } from '../_lib/auth.js';
import { isFounderPrivilegedAccount } from '../_lib/site00Access/accessModel.js';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import {
  runPageConceptViewportFamilyAction,
  type PageConceptViewportFamilyAction,
} from '../_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import type { PageConceptGenerationState } from '../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

type Body = {
  action: PageConceptViewportFamilyAction['type'];
  state: PageConceptGenerationState;
  conceptId?: string;
  viewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
  imageUri?: string;
  dryRun?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  const authed = await getAuthUser(req);
  const email = authed?.email ?? null;
  if (!email) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }
  if (!isFounderPrivilegedAccount(email)) {
    res.status(403).json({ error: 'FOUNDER_ONLY' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body ? req.body : {}) as Body;
  if (!body.state || body.state.targetType !== 'PAGE') {
    res.status(400).json({ error: 'PAGE_STATE_REQUIRED' });
    return;
  }

  try {
    let action: PageConceptViewportFamilyAction;
    switch (body.action) {
      case 'selectMobileConcept':
        if (!body.conceptId?.trim()) throw new Error('CONCEPT_ID_REQUIRED');
        action = { type: 'selectMobileConcept', conceptId: body.conceptId.trim() };
        break;
      case 'approveExperienceExpression':
        action = { type: 'approveExperienceExpression' };
        break;
      case 'runTabletInterpretation':
        action = { type: 'runTabletInterpretation', dryRun: body.dryRun === true };
        break;
      case 'runDesktopInterpretation':
        action = { type: 'runDesktopInterpretation', dryRun: body.dryRun === true };
        break;
      case 'regenerateTablet':
        action = { type: 'regenerateTablet', dryRun: body.dryRun === true };
        break;
      case 'regenerateDesktop':
        action = { type: 'regenerateDesktop', dryRun: body.dryRun === true };
        break;
      case 'approveViewportFamily':
        action = { type: 'approveViewportFamily' };
        break;
      case 'approvePageFamilySkinBehavior':
        action = { type: 'approvePageFamilySkinBehavior' };
        break;
      case 'markOpusRepresentativeShellsReady':
        action = { type: 'markOpusRepresentativeShellsReady' };
        break;
      case 'lockViewportFamily':
        action = { type: 'lockViewportFamily' };
        break;
      case 'createTwinImplementationPackage':
        action = { type: 'createTwinImplementationPackage' };
        break;
      case 'captureTwinViewport':
        if (!body.viewport || !body.imageUri?.trim()) throw new Error('CAPTURE_PAYLOAD_REQUIRED');
        action = { type: 'captureTwinViewport', viewport: body.viewport, imageUri: body.imageUri.trim() };
        break;
      default:
        throw new Error('UNKNOWN_ACTION');
    }

    const result = await runPageConceptViewportFamilyAction(body.state, action);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'VIEWPORT_FAMILY_ACTION_FAILED';
    res.status(400).json({ error: message });
  }
}
